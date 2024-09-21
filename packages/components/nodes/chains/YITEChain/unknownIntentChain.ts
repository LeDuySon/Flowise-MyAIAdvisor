import { BaseRetriever } from '@langchain/core/retrievers'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { Document } from "@langchain/core/documents";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { FlowiseMemory, IMessage, ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { constructFakeLink, getRouteOutput, getProductIDsFromDocs, prepareContext, postprocessOutput } from './utils';
import { PostgresDB, QueryParams } from './postgresDB'


class RetrievalQAChainYitec_Chains implements INode {
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
        this.label = 'Unknown Intent QA Chain'
        this.name = 'unknownIntentChain'
        this.version = 1.0
        this.type = 'ConversationalRetrievalQAChain'
        this.icon = 'qa.svg'
        this.category = 'Chains'
        this.description = 'QA chain to answer a question based on the retrieved documents'
        this.baseClasses = [this.type, ...getBaseClasses(ConversationalRetrievalQAChain)]
        this.inputs = [
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
                label: 'Chain Name',
                name: 'chainName',
                type: 'string',
                placeholder: 'Name Your Chain',
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
        this.sessionId = fields?.sessionId
        this.database = new PostgresDB()
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

    private async getContextFromDocs(retrievedDoc: Document[]): Promise<{ context: string, productIdGroup: Record<string, any[]> }> {
        if (retrievedDoc.length === 0) {
            return { context: '', productIdGroup: {} }
        }

        // get product IDs from the retrieved documents
        const productIDs = getProductIDsFromDocs(retrievedDoc)
        // Get current context of the product that store in vectordb
        const productId2Context: Record<string, any> = {}
        const productId2Metadata: Record<string, any> = {}
        retrievedDoc.map((doc: Document) => {
            productId2Context[doc.metadata['product_id']] = doc.pageContent
            productId2Metadata[doc.metadata['product_id']] = doc.metadata
        })

        // query the database
        const params: QueryParams = {
            productIds: productIDs,
        }

        const queryResult = await this.database.queryDataByParams(params);

        let productIdGroup: Record<string, any[]> = {};
        queryResult.rows.forEach((row) => {
            if (!productIdGroup[row.product_id]) {
                productIdGroup[row.product_id] = []
            }
            productIdGroup[row.product_id].push(row)
        })

        let updatedContext: string[] = []
        for (const [productId, rows] of Object.entries(productIdGroup)) {
            let context = productId2Context[productId]
            context += '## Product prices and links from different ecommerce providers:\n'

            rows.forEach((row) => {
                if (!row.price) return;
                // construct fake link for the product so that we can replace the real link in the postprocessing step
                let fakeLink = constructFakeLink(row.provider, productId)
                context += `- Ecommerce provider (${row.provider})[${fakeLink}]: ${row.price}$.\n`
            })
            context += '\n'
            updatedContext.push(context)
        }

        return { context: prepareContext(updatedContext), productIdGroup }
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string | object> {
        const memory = nodeData.inputs?.memory as FlowiseMemory
        const chain = nodeData.instance as ConversationalRetrievalQAChain
        const vectorStoreRetriever = nodeData.inputs?.vectorStoreRetriever as BaseRetriever
        const extraInfo = nodeData.inputs?.extraInfo
        // get routeOutput from the route chain
        const routeOutput = getRouteOutput(extraInfo)
        // only use external knowledge if the user is asking a question related to our services
        const useExternalKnowledge = routeOutput?.useExternalKnowledge ?? false

        // get message history
        const historyMessages = ((await memory.getChatMessages(this.sessionId, true)) as IMessage[]) ?? []
        console.log(historyMessages)

        const loggerHandler = new ConsoleCallbackHandler(options.logger)
        const callbacks = await additionalCallbacks(nodeData, options)

        let retrievedDoc: Document[] = []
        let chatbotResp: string;
        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            if (useExternalKnowledge) {
                console.log('Retrieving documents from external knowledge source')
                retrievedDoc = await vectorStoreRetriever.invoke(input, { callbacks: [loggerHandler, ...callbacks] })
            }

            const { context, productIdGroup } = await this.getContextFromDocs(retrievedDoc)

            const obj = {
                question: input,
                context: context,
                chat_history: historyMessages
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, handler, ...callbacks] })
            chatbotResp = postprocessOutput(res.text, productIdGroup)
        } else {
            if (useExternalKnowledge) {
                console.log("Retrieving documents from external knowledge source")
                retrievedDoc = await vectorStoreRetriever.invoke(input, { callbacks: [loggerHandler, ...callbacks] })
            }

            const { context, productIdGroup } = await this.getContextFromDocs(retrievedDoc)

            const obj = {
                question: input,
                context: context,
                chat_history: historyMessages
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, ...callbacks] })
            chatbotResp = postprocessOutput(res.text, productIdGroup)
        }

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

module.exports = { nodeClass: RetrievalQAChainYitec_Chains }
