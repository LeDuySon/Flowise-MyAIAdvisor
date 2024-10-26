import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { VectorStore } from '@langchain/core/vectorstores'
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ConsoleCallbackHandler, CustomChainHandler, additionalCallbacks } from '../../../src/handler'
import { FlowiseMemory, IMessage, ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { constructFakeLink, getRouteOutput, getProductIDsFromDocs, prepareContext, postprocessOutput, getContextFromDocs } from './utils';
import { PostgresDB, QueryParams } from './postgresDB'
import { DocumentWithScore, retrieveBasedOnKnowledgeType } from './retrieverUtils';

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

        console.log("This session ID is unknown intent chain: ", this.sessionId)

        // construct new prompt template with memory placeholder
        const systemPrompt = prompt.promptMessages[0]
        const humanPrompt = prompt.promptMessages[prompt.promptMessages.length - 1]
        const messages = [systemPrompt, new MessagesPlaceholder('chat_history'), humanPrompt]
        const newPrompt = ChatPromptTemplate.fromMessages(messages)

        const chain = newPrompt.pipe(model)
        return chain
    }

    // Get context from the retrieved documents for product-related questions
    private async getProductContextFromDocs(retrievedDoc: DocumentWithScore[]): Promise<{ context: string, productIdGroup: Record<string, any[]> }> {
        if (retrievedDoc.length === 0) {
            return { context: '', productIdGroup: {} }
        }

        // get product IDs from the retrieved documents
        const productIDs = getProductIDsFromDocs(retrievedDoc)
        // Get current context of the product that store in vectordb
        const productId2Context: Record<string, any> = {}
        const productId2Metadata: Record<string, any> = {}
        retrievedDoc.map((doc: DocumentWithScore) => {
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

    private async getContextForChatbot(knowledgeType2RetrievedDoc: Record<string, DocumentWithScore[]>, knowledgeTypes: string[]): Promise<{ finalContext: string, productIdGroup: Record<string, any[]> }> {
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
                ({ context, productIdGroup } = await this.getProductContextFromDocs(retrievedDoc))
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
        // get routeOutput from the route chain
        const routeOutput = getRouteOutput(extraInfo)
        console.log("routeOutput: ", routeOutput)

        // only use external knowledge if the user is asking a question related to our services
        const useExternalKnowledge = routeOutput?.useExternalKnowledge ?? true

        // get message history
        const historyMessages = ((await memory.getChatMessages(this.sessionId, true)) as IMessage[]) ?? []
        // console.log(historyMessages)

        const loggerHandler = new ConsoleCallbackHandler(options.logger)
        const callbacks = await additionalCallbacks(nodeData, options)

        // knowledgeType is an array of knowledge types
        let knowledgeTypes = routeOutput?.knowledgeType ?? undefined
        // add default knowledge type for every cases 
        // By default, we will retrieve faq and article 
        if (!knowledgeTypes) {
            knowledgeTypes = ["faq", "article"]
        } else {
            knowledgeTypes.push("faq", "article")
        }

        // Get the documents for each knowledge type 
        // key: knowledge type, value: list of documents -> {knowledge_type: [DocumentWithScore]}
        let knowledgeType2RetrievedDoc: Record<string, DocumentWithScore[]> = {}
        // Define the context for the chatbot
        let finalContext: string = ''
        // Store list of product links information for a product Id
        let productIdGroup: Record<string, any[]> = {}
        let chatbotResp: string;

        if (options.socketIO && options.socketIOClientId) {
            const handler = new CustomChainHandler(options.socketIO, options.socketIOClientId)
            if (useExternalKnowledge) {
                console.log('Retrieving documents from external knowledge source')
                knowledgeType2RetrievedDoc = await retrieveBasedOnKnowledgeType(input, vectorStore, knowledgeTypes, { callbacks: [loggerHandler, ...callbacks] })
            }

            // get context for the chatbot
            ({ finalContext, productIdGroup } = await this.getContextForChatbot(knowledgeType2RetrievedDoc, knowledgeTypes))

            const obj = {
                question: input,
                context: finalContext,
                chat_history: historyMessages
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, handler, ...callbacks] })
            chatbotResp = postprocessOutput(res.text, productIdGroup)
        } else {
            if (useExternalKnowledge) {
                console.log("Retrieving documents from external knowledge source")
                knowledgeType2RetrievedDoc = await retrieveBasedOnKnowledgeType(input, vectorStore, knowledgeTypes, { callbacks: [loggerHandler, ...callbacks] })
            }

            // get context for the chatbot
            ({ finalContext, productIdGroup } = await this.getContextForChatbot(knowledgeType2RetrievedDoc, knowledgeTypes))

            const obj = {
                question: input,
                context: finalContext,
                chat_history: historyMessages
            }
            const res = await chain.invoke(obj, { callbacks: [loggerHandler, ...callbacks] })
            chatbotResp = postprocessOutput(res.text, productIdGroup)
        }

        console.log("Session ID unknownintentchain: ", this.sessionId)
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
