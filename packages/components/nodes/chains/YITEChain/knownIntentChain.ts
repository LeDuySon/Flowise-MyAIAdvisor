import { BaseRetriever } from '@langchain/core/retrievers'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { checkInputs, Moderation, streamResponse } from '../../moderation/Moderation'
import { formatResponse } from '../../outputparsers/OutputParserHelpers'
import { PostgresDB, QueryParams } from './postgresDB';
import { constructFakeLink, getRouteOutput, getProductIDsFromDocs, prepareContext, postprocessOutput } from './utils';

enum UserIntent {
    COMPARE_PRICE = "compare_price",
    QUERY_PRODUCT_BY_PRICE = "query_product_by_price",
    QUERY_PRODUCT_BY_PROVIDER = "query_product_by_provider",
}

class DetectedIntentYitec_Chains implements INode {
    label: string
    name: string
    version: number
    type: string
    icon: string
    category: string
    baseClasses: string[]
    description: string
    inputs: INodeParams[]
    database: PostgresDB

    constructor() {
        this.label = 'Known Intent QA Chain'
        this.name = 'detectedIntentYitecChains'
        this.version = 1.0
        this.type = 'ConversationalRetrievalQAChain'
        this.icon = 'qa.svg'
        this.category = 'Chains'
        this.description = 'QA chain to answer a question based on the retrieved documents'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationalRetrievalQAChain)]
        this.inputs = [
            {
                label: 'Chain Name',
                name: 'chainName',
                type: 'string',
                placeholder: 'Name Your Chain',
                optional: true
            },
            {
                label: 'Language Model',
                name: 'model',
                type: 'BaseLanguageModel'
            },
            {
                label: 'Prompt',
                name: 'prompt',
                type: 'BasePromptTemplate'
            },
            {
                label: 'Vector Store Retriever',
                name: 'vectorStoreRetriever',
                type: 'BaseRetriever'
            },
            {
                label: 'Memory',
                name: 'memory',
                type: 'BaseChatMemory',
                optional: true
            },
            {
                label: 'Extra Information',
                name: 'extraInfo',
                type: 'json',
                optional: true,
                acceptVariable: true,
                list: true
            }
        ]
        this.database = new PostgresDB()
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const prompt = nodeData.inputs?.prompt as ChatPromptTemplate

        const chain = prompt.pipe(model)
        return chain
    }

    private async getContextBasedOnIntent(retrievedDoc: Document[], routeOutput: ICommonObject): Promise<{ context: string, productIdGroup: Record<string, any[]> }> {
        const intent = routeOutput?.queryIntent
        // get product IDs from the retrieved documents
        const productIDs = getProductIDsFromDocs(retrievedDoc)
        // Get current context of the product that store in vectordb
        const productId2Context: Record<string, any> = {}
        const productId2Metadata: Record<string, any> = {}
        retrievedDoc.map((doc: Document) => {
            productId2Context[doc.metadata["product_id"]] = doc.pageContent;
            productId2Metadata[doc.metadata["product_id"]] = doc.metadata;
        })

        // parse price range from the route output if it exists
        const minPrice = routeOutput?.priceRange?.minPrice 
        const maxPrice = routeOutput?.priceRange?.maxPrice

        // query the database
        const params: QueryParams = {
            productIds: productIDs,
            providers: routeOutput?.ecommerceProviders,
            minPrice: parseFloat(minPrice),
            maxPrice: parseFloat(maxPrice)
        }

        const queryResult = await this.database.queryDataByParams(params);

        let productIdGroup: Record<string, any[]> = {};
        queryResult.rows.forEach((row) => {
            if (!productIdGroup[row.product_id]) {
                productIdGroup[row.product_id] = []
            }
            productIdGroup[row.product_id].push(row)
        })
        console.log("productIdGroup: ", productIdGroup)

        let updatedContext: string[] = []
        if (intent === UserIntent.COMPARE_PRICE) {
            for (const [productId, rows] of Object.entries(productIdGroup)) {
                let metadata = productId2Metadata[productId]
                let context = ""
                context += `## Product name: ${metadata.product_name}.\n`
                context += `## Product description: ${metadata.description}.\n`
                context += `## Product prices from different ecommerce providers:\n`

                rows.forEach((row) => {
                    // construct fake link for the product so that we can replace the real link in the postprocessing step
                    let fakeLink = constructFakeLink(row.provider, productId)
                    context += `- Ecommerce provider (${row.provider})[${fakeLink}]: ${row.price}$.\n`
                })
                context += "\n"

                updatedContext.push(context)
            }
        } else if (intent === UserIntent.QUERY_PRODUCT_BY_PRICE) {
            // get the product with the lowest price
            for (const [productId, rows] of Object.entries(productIdGroup)) {
                let context = productId2Context[productId]

                rows.forEach((row) => {
                    let fakeLink = constructFakeLink(row.provider, productId)
                    context += `## Product price from ecommerce provider ${row.provider}: ${row.price}$ - ${fakeLink}.\n`
                })
                context += "\n"

                updatedContext.push(context)
            }
        } else if (intent === UserIntent.QUERY_PRODUCT_BY_PROVIDER) {
            // get the product with the given provider
            for (const [productId, rows] of Object.entries(productIdGroup)) {
                let context = productId2Context[productId]
                context += `## Ecommerce provider: ${rows[0].provider}.\n`

                rows.forEach((row) => {
                    let fakeLink = constructFakeLink(row.provider, productId)
                    context += `## Product price from ecommerce provider (${row.provider})[${fakeLink}]: ${row.price}$.\n`
                })
                context += "\n"

                updatedContext.push(context)
            }
        } 

        return { context: prepareContext(updatedContext), productIdGroup }
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | object> {
        const chain = nodeData.instance as ConversationalRetrievalQAChain
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever as BaseRetriever
        const moderations = nodeData.inputs?.inputModeration as Moderation[]
        const extraInfo = nodeData.inputs?.extraInfo 
        
        const routeOutput = getRouteOutput(extraInfo)
        console.log("routeOutput: ", routeOutput)

        if (moderations && moderations.length > 0) {
            try {
                // Use the output of the moderation chain as input for the Retrieval QA Chain
                input = await checkInputs(moderations, input)
            } catch (e) {
                await new Promise((resolve) => setTimeout(resolve, 500))
                streamResponse(options.socketIO && options.socketIOClientId, e.message, options.socketIO, options.socketIOClientId)
                return formatResponse(e.message)
            }
        }

        const loggerHandler = new ConsoleCallbackHandler(options.logger)
        const callbacks = await additionalCallbacks(nodeData, options)

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const retrievedDoc = await vectorStoreRetriever.invoke(input, { callbacks: [loggerHandler, ...callbacks] })
            const { context, productIdGroup } = await this.getContextBasedOnIntent(retrievedDoc, routeOutput)
        
            const obj = {
                question: input,
                context: context,
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, handler, ...callbacks] })
            return postprocessOutput(res.text, productIdGroup)
        } else {
            const retrievedDoc = await vectorStoreRetriever.invoke(input, { callbacks: [loggerHandler, ...callbacks] })
            const { context, productIdGroup } = await this.getContextBasedOnIntent(retrievedDoc, routeOutput)
            
            const obj = {
                question: input,
                context: context,
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, ...callbacks] })
            return postprocessOutput(res.text, productIdGroup)
        }
    }
}

module.exports = { nodeClass: DetectedIntentYitec_Chains }
