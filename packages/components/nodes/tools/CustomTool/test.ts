import { NodeVM } from '@flowiseai/nodevm'
import { availableDependencies, defaultAllowBuiltInDep, prepareSandboxVars } from '../../../src/utils'

async function test() {
    let sandbox: any = {                                                                                                                                                           DATABASE_POSTGRES_CONNECTION_STRING: 'postgresql://my_ai_adv_team:SWCIFb7qmiYDSE0BKOG3bcyfUdMjHqGB@dpg-cqpddutsvqrc73fpj3d0-a.singapore-postgres.render.com:5432/airtable_my_ai_adv?ssl=true',                                                                                                                          test: 'test',                                                                                                                                               qdrantServerUrl: 'https://7b95fc33-7cd6-45b2-8ad2-7ba82f9d4407.ap-southeast-1-0.aws.cloud.qdrant.io:6333',                                                  qdrantCollectionName: 'skincare_products',
        '$vars': {                                                                                                                                                    
        'postgreDatabaseUri': '',
        'qdrantApiKey': '',
        'qdrantCollectionName': '',
        'qdrantServerUrl': '',
        'openAIApiKey': '',
        'embeddingModelName': 'text-embedding-3-small'
        },
        '$flow': {
            'chatflowId': '277ff1c2-5117-4eed-b954-4b8330742dd1',
            'sessionId': '4ec8218d-7ea7-4835-bca3-0ca8513cf24b',
            'chatId': '4ec8218d-7ea7-4835-bca3-0ca8513cf24b',
            'input': 'can you recommend me some products using your external knowledge\\n\\n',
            'state': {
                'knowledgeTypes': ['product'],
                'queryIntent': 'query_product_by_price',
                'pricerangemin': 0,
                'pricerangemax': 100,
                'ecommerceproviders': ['amazon'],
                'productdescription': '',
                'messages': []
            }
        }
    }

    const builtinDeps = process.env.TOOL_FUNCTION_BUILTIN_DEP
                ? defaultAllowBuiltInDep.concat(process.env.TOOL_FUNCTION_BUILTIN_DEP.split(','))
                : defaultAllowBuiltInDep

    const externalDeps = process.env.TOOL_FUNCTION_EXTERNAL_DEP ? process.env.TOOL_FUNCTION_EXTERNAL_DEP.split(',') : []
    const deps = availableDependencies.concat(externalDeps)

    const options = {
        console: 'inherit',
        sandbox,
        require: {
            external: { modules: deps },
            builtin: builtinDeps
        }
    } as any
    const vm = new NodeVM(options)

    const response = await vm.run(`module.exports = async function() {
        const { QdrantClient } = require('@qdrant/js-client-rest')
        const { Pool } = require('pg');
        const { QdrantVectorStore } = require('@langchain/qdrant')
        const { OpenAIEmbeddings } = require('@langchain/openai')
        const { URL } = require('url');

        // Define the database connection parameters
        const postgreDatabaseUri = $vars.postgreDatabaseUri

        // Define the vector database connection parameters
        const qdrantServerUrl = $vars.qdrantServerUrl
        const qdrantCollectionName = $vars.qdrantCollectionName
        const qdrantApiKey = $vars.qdrantApiKey
        const qdrantVectorDimension = 1536
        const qdrantSimilarity = 'Cosine'
        const contentPayloadKey = 'content'
        const metadataPayloadKey = 'metadata'
        const numRetrievedDoc = 10

        // Define the default knowledge types
        const defaultKnowledgeTypes = ['faq', 'article']

        // define user question
        const routeInfo = {
            'queryIntent': $flow.state.queryIntent,
            'pricerangemin': $flow.state?.pricerangemin,
            'pricerangemax': $flow.state?.pricerangemax,
            'ecommerceproviders': $flow.state?.ecommerceproviders,
            'productdescription': $flow.state?.productdescription
        }

        if (routeInfo.queryIntent === 'unknown') {
            routeInfo.knowledgeTypes = [...defaultKnowledgeTypes, ...$flow.state?.knowledgeTypes]
        } else {
            routeInfo.knowledgeTypes = [...defaultKnowledgeTypes, ...$flow.state?.knowledgeTypes, 'product']
        }

        console.log("routeInfo: ", routeInfo)

        // Define for known intent agent 
        const UserIntent = {
            COMPARE_PRICE: 'compare_price',
            QUERY_PRODUCT_BY_PRICE: 'query_product_by_price',
            QUERY_PRODUCT_BY_PROVIDER: 'query_product_by_provider'
        }

        // ----------------------------- POSTGRESQL DATABASE -----------------------------
        class PostgresDB {
            constructor() {
                this.pool = new Pool({
                    connectionString: postgreDatabaseUri,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });

                console.log('Connect to database with credentials: ', process.env.DATABASE_POSTGRES_CONNECTION_STRING);
                this.table_name = 'product_links';
            }

            buildQuery(params) {
                let baseQuery = 'SELECT product_id, link, price, provider FROM ' + this.table_name + ' WHERE 1=1';

                if (params.productIds) {
                    if (Array.isArray(params.productIds) && params.productIds.length > 0) {
                        const tmpProductIdsString = '(\\'' + params.productIds.join('\\',\\'') + '\\')'
                        baseQuery = baseQuery + ' AND product_id IN ' + tmpProductIdsString;
                    }
                }

                if (params.providers) {
                    if (Array.isArray(params.providers) && params.providers.length > 0) {
                        const tmpProvidersString = '(\\'' + params.providers.join('\\',\\'') + '\\')'
                        baseQuery = baseQuery + ' AND provider IN ' + tmpProvidersString;
                    }
                }

                if (params.minPrice && params.maxPrice) {
                    baseQuery = baseQuery + ' AND price BETWEEN ' + params.minPrice + ' AND ' + params.maxPrice;
                } else if (params.minPrice) {
                    baseQuery = baseQuery + ' AND price >= ' + params.minPrice;
                } else if (params.maxPrice) {
                    baseQuery = baseQuery + ' AND price <= ' + params.maxPrice;
                }

                console.log('Query: ', baseQuery);

                return { query: baseQuery, values: [] };
            }

            async queryDataByParams(params) {
                try {
                    const client = await this.pool.connect();
                    const { query, values } = this.buildQuery(params);
                    const result = await client.query(query, values);
                    client.release();
                    return result;
                } catch (error) {
                    console.error('Error executing query:', error);
                    throw error;
                }
            }

            async getGeneralContextbyKnowledgeTypes(knowledgeTypes) {
                try {
                    // Connect to the PostgreSQL database
                    const client = await this.pool.connect();

                    // Execute the query
                    const query = 'SELECT * FROM knowledge_context WHERE knowledge_type = ANY($1)';
                    const result = await client.query(query, [knowledgeTypes]);

                    // Release the client back to the pool
                    client.release();

                    // Return the query result
                    if (result.rows.length === 0) {
                        return {}
                    } else {
                        return result.rows.reduce((acc, row) => {
                            acc[row.knowledge_type] = row.general_context;
                            return acc;
                        }, {});
                    }

                } catch (error) {
                    // Handle any errors that occurred during the query
                    console.error('Error executing query:', error);
                    throw error;
                }
            }
        }

        // ----------------------------- UTILITIES -----------------------------
        // Determine the port number from the URL of Qdrant server
        function determinePortByUrl(qdrantServerUrl) {
            const parsedUrl = new URL(qdrantServerUrl)

            let port = parsedUrl.port ? parseInt(parsedUrl.port) : 6663

            if (parsedUrl.protocol === 'https:' && parsedUrl.port === '') {
                port = 443
            }
            if (parsedUrl.protocol === 'http:' && parsedUrl.port === '') {
                port = 80
            }

            return port
        }

        // Construct fake link for the product
        function constructFakeLink(provider, productId) {
            // this function will construct fake link in format: https://{provider}.sg/{product_id}.
            // We will use this function to replace the real link in the output.
            return 'https://' + provider + '.sg/' + productId;
        }

        // Prepare context for the chatbot
        function prepareContext(retrievedContext) {
            return retrievedContext.join("\\n").replace("\\n\\n", "\\n")
        }

        // Get embedding model
        function getEmbeddingModel() {
            const obj = {
                openAIApiKey: $vars.openAIApiKey,
                modelName: $vars.embeddingModelName,
                dimensions: qdrantVectorDimension
            }

            return new OpenAIEmbeddings(obj)
        }

        // Get list of product IDs from the retrieved documents DocumentWithScore
        function getProductIDsFromDocs(retrievedDoc) {
            return retrievedDoc.map((doc) => doc.metadata["product_id"]);
        }

        // Get context from the retrieved documents for non-product-related questions
        async function getContextFromDocs(retrievedDoc) {
            const context = prepareContext(retrievedDoc.map((doc) => doc.pageContent))
            return { context }
        }

        // ----------------------------- CORE FUNCTIONS -----------------------------

        /*
        This function is used to retrieve the documents from the vector database based on the knowledge types.
        */
        async function retrieveBasedOnKnowledgeType(input, vectorStore, knowledgeTypes) {
            const filter = {
                must: [{ key: "knowledge_type", match: { any: knowledgeTypes } }],
            }

            const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore(input, numRetrievedDoc, filter);

            // Get the documents for each knowledge type
            let retrievedDoc = {}
            similaritySearchWithScoreResults.forEach((result) => {
                // Construct the document with score
                const docInputWithScore = {
                    pageContent: result[0].pageContent,
                    metadata: result[0].metadata,
                    score: result[1]
                }
                const knowledgeType = result[0].metadata.knowledge_type
                if (!retrievedDoc[knowledgeType]) {
                    retrievedDoc[knowledgeType] = []
                }
                retrievedDoc[knowledgeType].push(docInputWithScore)
            })

            return retrievedDoc
        }

        // Get knowledge from the vector database for the chatbot
        async function getKnowledgeFromVectorDB(qdrantClient) {
            const dbConfig = {
                client: qdrantClient,
                url: qdrantServerUrl,
                collectionName: qdrantCollectionName,
                collectionConfig: {
                    vectors: {
                        size: qdrantVectorDimension ? parseInt(qdrantVectorDimension, 10) : 1536,
                        distance: qdrantSimilarity ?? 'Cosine'
                    }
                },
                contentPayloadKey: contentPayloadKey,
                metadataPayloadKey: metadataPayloadKey
            }

            const embeddings = getEmbeddingModel()
            const vectorStore = new QdrantVectorStore(embeddings, dbConfig)

            const knowledgeType2RetrievedDoc = await retrieveBasedOnKnowledgeType($flow.input, vectorStore, routeInfo.knowledgeTypes)
            return knowledgeType2RetrievedDoc
        }

        // Get context for the chatbot for unknown intent agent
        async function getProductContextFromDocsUnknownIntent(retrievedDoc, database) {
            if (retrievedDoc.length === 0) {
                return { context: '', productIdGroup: {} }
            }

            // get product IDs from the retrieved documents
            const productIDs = getProductIDsFromDocs(retrievedDoc)
            // Get current context of the product that store in vectordb
            const productId2Context = {}
            const productId2Metadata = {}
            retrievedDoc.map((doc) => {
                productId2Context[doc.metadata['product_id']] = doc.pageContent
                productId2Metadata[doc.metadata['product_id']] = doc.metadata
            })

            // query the database
            const params = {
                productIds: productIDs,
            }
            const queryResult = await database.queryDataByParams(params);
            console.log(queryResult)

            let productIdGroup = {};
            queryResult.rows.forEach((row) => {
                if (!productIdGroup[row.product_id]) {
                    productIdGroup[row.product_id] = []
                }
                productIdGroup[row.product_id].push(row)
            })

            let updatedContext = []
            for (const [productId, rows] of Object.entries(productIdGroup)) {
                let context = productId2Context[productId]
                context += '## Product prices and links from different ecommerce providers:\\n'

                rows.forEach((row) => {
                    if (!row.price) return;
                    // construct fake link for the product so that we can replace the real link in the postprocessing step
                    let fakeLink = constructFakeLink(row.provider, productId)
                    context += '- Ecommerce provider (' + row.provider + ')[' + fakeLink + ']: ' + row.price + '$.\\n'
                })
                context += '\\n'
                updatedContext.push(context)
            }

            return { context: prepareContext(updatedContext), productIdGroup }
        }

        // Get context for the chatbot for known intent agent
        async function getProductContextFromDocsKnownIntent(retrievedDoc, database) {
            const intent = routeInfo.queryIntent
            // get product IDs from the retrieved documents
            const productIDs = getProductIDsFromDocs(retrievedDoc)
            // Get current context of the product that store in vectordb
            const productId2Context = {}
            const productId2Metadata = {}
            retrievedDoc.map((doc) => {
                productId2Context[doc.metadata["product_id"]] = doc.pageContent;
                productId2Metadata[doc.metadata["product_id"]] = doc.metadata;
            })

            // parse price range from the route output if it exists
            const minPrice = routeInfo.pricerangemin
            const maxPrice = routeInfo.pricerangemax

            // query the database
            const params = {
                productIds: productIDs,
                providers: routeInfo.ecommerceproviders,
                minPrice: parseFloat(minPrice),
                maxPrice: parseFloat(maxPrice)
            }

            const queryResult = await database.queryDataByParams(params);

            let productIdGroup = {};
            queryResult.rows.forEach((row) => {
                if (!productIdGroup[row.product_id]) {
                    productIdGroup[row.product_id] = []
                }
                productIdGroup[row.product_id].push(row)
            })
            console.log("productIdGroup: ", productIdGroup)

            let updatedContext = []
            if (intent === UserIntent.COMPARE_PRICE) {
                for (const [productId, rows] of Object.entries(productIdGroup)) {
                    let metadata = productId2Metadata[productId]
                    let context = ""
                    context += '## Product name: ' + metadata.product_name + '.\\n'
                    context += '## Product description: ' + metadata.description + '.\\n'
                    context += '## Product prices from different ecommerce providers:\\n'

                    rows.forEach((row) => {
                        // construct fake link for the product so that we can replace the real link in the postprocessing step
                        let fakeLink = constructFakeLink(row.provider, productId)
                        context += '- Ecommerce provider (' + row.provider + ')[' + fakeLink + ']: ' + row.price + '$.\\n'
                    })
                    context += "\\n"

                    updatedContext.push(context)
                }
            } else if (intent === UserIntent.QUERY_PRODUCT_BY_PRICE) {
                // get the product with the lowest price
                for (const [productId, rows] of Object.entries(productIdGroup)) {
                    let context = productId2Context[productId]

                    rows.forEach((row) => {
                        let fakeLink = constructFakeLink(row.provider, productId)
                        context += '## Product price from ecommerce provider ' + row.provider + ': ' + row.price + '$ - ' + fakeLink + '.\\n'
                    })
                    context += "\\n"

                    updatedContext.push(context)
                }
            } else if (intent === UserIntent.QUERY_PRODUCT_BY_PROVIDER) {
                // get the product with the given provider
                for (const [productId, rows] of Object.entries(productIdGroup)) {
                    let context = productId2Context[productId]
                    context += '## Ecommerce provider: ' + rows[0].provider + '.\\n'

                    rows.forEach((row) => {
                        let fakeLink = constructFakeLink(row.provider, productId)
                        context += '## Product price from ecommerce provider (' + row.provider + ')[' + fakeLink + ']: ' + row.price + '$.\\n'
                    })
                    context += "\\n"

                    updatedContext.push(context)
                }
            }

            return { context: prepareContext(updatedContext), productIdGroup }
        }

        // Get context for the chatbot based on the documents retrieved for each knowledge type
        async function getContextForChatbot(knowledgeType2RetrievedDoc, database) {
            let finalContext = ''
            let productIdGroup = {}

            // Get general context for each knowledge type
            const knowledgeType2GeneralContext = await database.getGeneralContextbyKnowledgeTypes(routeInfo.knowledgeTypes)

            for (const knowledgeType of routeInfo.knowledgeTypes) {
                const retrievedDoc = knowledgeType2RetrievedDoc[knowledgeType] ?? []
                const generalContext = knowledgeType2GeneralContext[knowledgeType] ?? ''

                let context = ''
                // Get context from the retrieved documents
                if (knowledgeType === "product") {
                    if (routeInfo.queryIntent === 'unknown') {
                        ({ context, productIdGroup } = await getProductContextFromDocsUnknownIntent(retrievedDoc, database))
                    } else {
                        ({ context, productIdGroup } = await getProductContextFromDocsKnownIntent(retrievedDoc, database))
                    }
                } else {
                    ({ context } = await getContextFromDocs(retrievedDoc))
                }

                // Combine general context and retrieved context for the chatbot
                // general context will help chatbot to understand the context better
                finalContext += generalContext + "\\n" + context
            }

            return { finalContext, productIdGroup }
        }

        async function main() {
            // initialize vector database
            const qdrantPort = determinePortByUrl(qdrantServerUrl)
            const qdrantClient = new QdrantClient({
                url: qdrantServerUrl,
                apiKey: qdrantApiKey,
                port: qdrantPort
            })

            // Initialize the pool for postgre database
            const database = new PostgresDB()
            try {
                const knowledgeType2RetrievedDoc = await getKnowledgeFromVectorDB(qdrantClient)
                const { finalContext, productIdGroup } = await getContextForChatbot(knowledgeType2RetrievedDoc, database)
                return { finalContext, productIdGroup }
            } catch (error) {
                console.error('Error getting context for chatbot:', error)
                throw error
            }

        }

        return await main()
    }()`, __dirname)

    console.log("Response: ", response)
}

// test()