import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { Document } from "@langchain/core/documents";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { FlowiseMemory, ICommonObject, IMessage, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { PostgresDB, QueryParams } from './postgresDB';
import { constructFakeLink, getRouteOutput, getProductIDsFromDocs, prepareContext, postprocessOutput, getContextFromDocs } from './utils';
import { DocumentWithScore, retrieveBasedOnKnowledgeType } from './retrieverUtils';
import { VectorStore } from '@langchain/core/vectorstores';

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
    sessionId?: string
    database: PostgresDB

    constructor(fields?: { sessionId?: string }) {
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
                label: 'Vector Store',
                name: 'vectorStore',
                type: 'VectorStore'
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
        console.log("Session ID knownIntentChain constructor: ", fields?.sessionId)
        this.sessionId = fields?.sessionId
    }

    async init(nodeData: INodeData): Promise<any> {
        const model = nodeData.inputs?.model as BaseLanguageModel
        const prompt = nodeData.inputs?.prompt as ChatPromptTemplate

        // construct new prompt template with memory placeholder
        const systemPrompt = prompt.promptMessages[0]
        const humanPrompt = prompt.promptMessages[prompt.promptMessages.length - 1]
        const messages = [systemPrompt, new MessagesPlaceholder('chat_history'), humanPrompt]
        const newPrompt = ChatPromptTemplate.fromMessages(messages)

        const chain = newPrompt.pipe(model)
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

    private async getContextForChatbot(knowledgeType2RetrievedDoc: Record<string, DocumentWithScore[]>, knowledgeTypes: string[], routeOutput: ICommonObject): Promise<{ finalContext: string, productIdGroup: Record<string, any[]> }> {
        let finalContext: string = ''
        let productIdGroup: Record<string, any[]> = {}

        // Get general context for each knowledge type
        const knowledgeType2GeneralContext = await this.database.getGeneralContextbyKnowledgeTypes(knowledgeTypes)

        for (const knowledgeType of knowledgeTypes) {
            const retrievedDoc = knowledgeType2RetrievedDoc[knowledgeType] ?? []
            const generalContext = knowledgeType2GeneralContext[knowledgeType] ?? ''

            let context: string = ''
            // Get context from the retrieved documents
            if (knowledgeType === "product") {
                ({ context, productIdGroup } = await this.getContextBasedOnIntent(retrievedDoc, routeOutput))
            } else {
                ({ context } = await getContextFromDocs(retrievedDoc))
            }

            // Combine general context and retrieved context for the chatbot
            // general context will help chatbot to understand the context better
            finalContext += generalContext + "\n" + context
        }

        return { finalContext, productIdGroup }
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | object> {
        const memory = nodeData.inputs?.memory as FlowiseMemory
        const chain = nodeData.instance as ConversationalRetrievalQAChain
        const vectorStore = nodeData.inputs?.vectorStore as VectorStore
        const extraInfo = nodeData.inputs?.extraInfo

        const routeOutput = getRouteOutput(extraInfo)
        console.log("routeOutput: ", routeOutput)

        // define the knowledge type, hardcoded for now
        let knowledgeTypes = routeOutput?.knowledgeType ?? undefined
        if (!knowledgeTypes) {
            knowledgeTypes = ["product", "faq", "article"]
        } else {
            knowledgeTypes.push("faq", "article", "product")
        }
            
        // initialize the logger handler    
        const loggerHandler = new ConsoleCallbackHandler(options.logger)
        const callbacks = await additionalCallbacks(nodeData, options)

        // get message history
        const historyMessages = ((await memory.getChatMessages(this.sessionId, true)) as IMessage[]) ?? []
        console.log("historyMessages: ", historyMessages)

        let chatbotResp: string;
        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            const knowledgeType2RetrievedDoc = await retrieveBasedOnKnowledgeType(input, vectorStore, knowledgeTypes, { callbacks: [loggerHandler, ...callbacks] })
            const { finalContext, productIdGroup } = await this.getContextForChatbot(knowledgeType2RetrievedDoc, knowledgeTypes, routeOutput)

            const obj = {
                question: input,
                context: finalContext,
                chat_history: historyMessages
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, handler, ...callbacks] })
            chatbotResp = postprocessOutput(res.text, productIdGroup)
        } else {
            const knowledgeType2RetrievedDoc = await retrieveBasedOnKnowledgeType(input, vectorStore, knowledgeTypes, { callbacks: [loggerHandler, ...callbacks] })
            const { finalContext, productIdGroup } = await this.getContextForChatbot(knowledgeType2RetrievedDoc, knowledgeTypes, routeOutput)

            const obj = {
                question: input,
                context: finalContext,
                chat_history: historyMessages
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, ...callbacks] })
            chatbotResp = postprocessOutput(res.text, productIdGroup)
        }

        console.log("Session ID knownintentchain: ", this.sessionId)
        await memory.addChatMessages(
            [
                {
                    text: input,
                    type: 'userMessage'
                },
                {
                    text: chatbotResp,
                    type: 'apiMessage'
                }
            ],
            this.sessionId
        )

        return chatbotResp;
    }
}

module.exports = { nodeClass: DetectedIntentYitec_Chains }
