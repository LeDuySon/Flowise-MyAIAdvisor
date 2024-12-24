async function getContext() {
    const { QdrantClient } = require('@qdrant/js-client-rest')
    const { Pool } = require('pg');
    const { QdrantVectorStore } = require('@langchain/qdrant')
    const { OpenAIEmbeddings } = require('@langchain/openai')
    const { URL } = require('url');

    // ----------------------------- VARIABLES -----------------------------
    // Define the variables for testing
    const $vars = {
        'postgreDatabaseUri': '',
        'qdrantApiKey': '',
        'qdrantCollectionName': '',
        'qdrantServerUrl': '',
        'openAIApiKey': '',
        'embeddingModelName': 'text-embedding-3-small'
    }
    const $flow = {
        'chatflowId': '277ff1c2-5117-4eed-b954-4b8330742dd1',
        'sessionId': '4ec8218d-7ea7-4835-bca3-0ca8513cf24b',
        'chatId': '4ec8218d-7ea7-4835-bca3-0ca8513cf24b',
        'input': 'can you recommend me products from amazon below 50$?\n\n',
        'state': {
            'knowledgeTypes': ['product'],
            'queryintent': 'query_product_by_provider',
            'pricerangemin': 0,
            'pricerangemax': 50,
            'ecommerceproviders': ['amazon'],
            'productdescription': null,
            'messages': []
        }
    }

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

    const routeInfo = {
        'queryIntent': $flow.state.queryintent,
        'pricerangemin': $flow.state?.pricerangemin,
        'pricerangemax': $flow.state?.pricerangemax,
        'ecommerceproviders': $flow.state?.ecommerceproviders,
        'productdescription': $flow.state?.productdescription
    }

    // Define the knowledge types to search in the vector database
    // Using Set to avoid duplicate knowledge types. Set datastructure will automatically remove duplicate values.
    let knowledgeTypes = new Set([...defaultKnowledgeTypes, ...$flow.state?.knowledgeTypes])

    if (routeInfo.queryIntent === 'unknown') {
        routeInfo.knowledgeTypes = [...knowledgeTypes]
    } else {
        // For known intent agent, user question always related to product, so we can add it to the knowledge types
        knowledgeTypes.add('product')
        routeInfo.knowledgeTypes = [...knowledgeTypes]
    }

    console.log("routeInfo: ", routeInfo)

    // define search query to search in the vector database
    let searchQuery = $flow.input + ' ' + (routeInfo.productdescription ? routeInfo.productdescription : '')
    console.log("Query to search in the vector database: ", searchQuery)

    // Define for known intent agent 
    const UserIntent = {
        COMPARE_PRICE: 'compare_price',
        QUERY_PRODUCT_BY_PRICE: 'query_product_by_price',
        QUERY_PRODUCT_BY_PROVIDER: 'query_product_by_provider'
    }

    // Define the case for query the database/vector database
    const QueryCase = {
        QUERY_DATABASE_FIRST: 'query_database_first',
        QUERY_VECTOR_DATABASE_FIRST: 'query_vector_database_first'
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
        return retrievedContext.join("\n").replace("\n\n", "\n")
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
        return context 
    }

    // ----------------------------- END UTILITIES -----------------------------

    // ----------------------------- POSTGRESQL DATABASE -----------------------------
    class PostgresDB {
        constructor() {
            this.pool = new Pool({
                connectionString: postgreDatabaseUri,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            console.log('Connect to database with credentials: ', postgreDatabaseUri);
            this.table_name = 'product_links';
        }

        buildQuery(params) {
            let baseQuery = 'SELECT product_id, link, price, provider FROM ' + this.table_name + ' WHERE 1=1';

            if (params.productIds) {
                if (Array.isArray(params.productIds) && params.productIds.length > 0) {
                    const tmpProductIdsString = '(\'' + params.productIds.join('\',\'') + '\')'
                    baseQuery = baseQuery + ' AND product_id IN ' + tmpProductIdsString;
                }
            }

            if (params.providers) {
                if (Array.isArray(params.providers) && params.providers.length > 0) {
                    const tmpProvidersString = '(\'' + params.providers.join('\',\'') + '\')'
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

        async queryProductIdsByParams(params) {
            const queryResult = await this.queryDataByParams(params)
            return queryResult.rows.map((row) => row.product_id)
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

    // ----------------------------- END POSTGRESQL DATABASE -----------------------------

    // ----------------------------- VECTOR DATABASE -----------------------------
    function getVectorStore() {
        // initialize vector database
        const qdrantPort = determinePortByUrl(qdrantServerUrl)
        const qdrantClient = new QdrantClient({
            url: qdrantServerUrl,
            apiKey: qdrantApiKey,
            port: qdrantPort
        })

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
        return vectorStore
    }

    // ----------------------------- END VECTOR DATABASE -----------------------------

    // ----------------------------- CORE FUNCTIONS -----------------------------
    // ----------------------------- Define retrieve functions to retrieve documents from the vector database -----------------------------
    // This function is used to retrieve the documents from the vector database based on the filter.
    async function retrieveDocumentsWithFilter(input, vectorStore, filter, numRetrievedDoc) {
        console.log("Retrieve documents with filter: ", filter)
        const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore(input, numRetrievedDoc, filter);

        // Get the documents for each knowledge type
        let retrievedDoc = []
        similaritySearchWithScoreResults.forEach((result) => {
            // Construct the document with score
            const docInputWithScore = {
                pageContent: result[0].pageContent,
                metadata: result[0].metadata,
                score: result[1]
            }
            retrievedDoc.push(docInputWithScore)
        })

        return retrievedDoc
    }

    /*
    This function is used to retrieve the documents from the vector database based on the knowledge types.
    */
    async function retrieveBasedOnKnowledgeType(input, vectorStore, knowledgeTypes) {
        // This function is for case 2: Query the vector database first
        const filter = {
            must: [{ key: "knowledge_type", match: { any: knowledgeTypes } }],
        }

        // Get an array of documents with score
        const retrieveDoc = await retrieveDocumentsWithFilter(input, vectorStore, filter, numRetrievedDoc)
        let knowledgeType2RetrievedDoc = {}

        retrieveDoc.forEach((doc) => {
            const knowledgeType = doc.metadata.knowledge_type
            if (!knowledgeType2RetrievedDoc[knowledgeType]) {
                knowledgeType2RetrievedDoc[knowledgeType] = []
            }
            knowledgeType2RetrievedDoc[knowledgeType].push(doc)
        })

        return knowledgeType2RetrievedDoc
    }

    function combineRetrievedDoc(productRetrievedDoc, otherKnowledgeRetrievedDoc, numRetrievedDoc) {
        // combine the retrieved documents and get only the top 5 documents based on the score 
        // Combine all documents into a single array and sort by score
        const allDocs = [...productRetrievedDoc, ...otherKnowledgeRetrievedDoc]

        // Sort by score (higher score = better match)
        allDocs.sort((a, b) => b.score - a.score)

        // Take top 5 documents and organize them by knowledge type 
        // numRetrievedDoc is the number of documents we want to retrieve 
        // Check case numRetrievedDoc > allDocs.length
        numRetrievedDoc = numRetrievedDoc > allDocs.length ? allDocs.length : numRetrievedDoc
        const topDocs = allDocs.slice(0, numRetrievedDoc)

        return topDocs
    }

    async function retrieveBasedOnProductIds(input, vectorStore, productIds, knowledgeTypes) {
        // This function is for case 1: Query the database first then query the vector database
        // filter the documents based on the product IDs and knowledge types
        // When using should, the clause becomes true if at least one condition listed inside should is satisfied. In this sense, should is equivalent to the operator OR.
        // We need to exclude the product knowledge type from the queryKnowledgeTypes -> because if we include that, it will also retrieve product not satisfy the productIds
        const queryKnowledgeTypes = knowledgeTypes.filter((knowledgeType) => knowledgeType !== 'product')
        const filter = {
            should: [
                { key: "knowledge_type", match: { any: queryKnowledgeTypes } },
                { key: "metadata.product_id", match: { any: productIds } },
            ],
        }

        const numRetrievedDoc = 5
        const retrievedDoc = await retrieveDocumentsWithFilter(input, vectorStore, filter, numRetrievedDoc)

        let knowledgeType2RetrievedDoc = {}
        retrievedDoc.forEach((doc) => {
            const knowledgeType = doc.metadata.knowledge_type
            if (!knowledgeType2RetrievedDoc[knowledgeType]) {
                knowledgeType2RetrievedDoc[knowledgeType] = []
            }
            knowledgeType2RetrievedDoc[knowledgeType].push(doc)
        })
        return knowledgeType2RetrievedDoc
    }

    // ----------------------------- End retrieve functions -----------------------------



    // ----------------------------- Main functions to get context for the chatbot -----------------------------

    // Get productIdGroup from the database 
    // productIdGroup is a dictionary that maps product IDs to the rows of the database result
    async function getProductIdGroupFromDatabase(queryParams, database) {
        // query the database
        const queryResult = await database.queryDataByParams(queryParams);
        console.log(queryResult)

        let productIdGroup = {};
        queryResult.rows.forEach((row) => {
            if (!productIdGroup[row.product_id]) {
                productIdGroup[row.product_id] = []
            }
            productIdGroup[row.product_id].push(row)
        })

        return productIdGroup
    }

    async function getProductIdGroup(database, queryCase, productIds = null) {
        // Case 1: If the routeInfo have pricerangemin, pricerangemax or ecommerceproviders, we will use it to query the database first.
        // After that, getting the products Ids from database result and use it to query the vector database. 
        if (queryCase === QueryCase.QUERY_DATABASE_FIRST) {
            console.log("Case 1: Query the database first then query the vector database")
            const queryParams = {
                minPrice: parseFloat(routeInfo.pricerangemin),
                maxPrice: parseFloat(routeInfo.pricerangemax),
                providers: routeInfo.ecommerceproviders
            }
            return await getProductIdGroupFromDatabase(queryParams, database)
        }
        // Case 2: If the productIds is not null (which means we query the vector database first to get products id), we will use it to query the database directly.
        else if (queryCase === QueryCase.QUERY_VECTOR_DATABASE_FIRST && productIds) {
            console.log("Case 2: Query the vector database first then query the database")
            const queryParams = {
                productIds: productIds
            }
            return await getProductIdGroupFromDatabase(queryParams, database)
        } else {
            throw new Error("Invalid query case")
        }
    }

    // Get knowledge from the vector database for the chatbot
    async function getKnowledgeFromVectorDB(vectorStore, productIds = null) {
        let knowledgeType2RetrievedDoc = {}
        if (productIds) {
            knowledgeType2RetrievedDoc = await retrieveBasedOnProductIds(searchQuery, vectorStore, productIds, routeInfo.knowledgeTypes)
        } else {
            knowledgeType2RetrievedDoc = await retrieveBasedOnKnowledgeType(searchQuery, vectorStore, routeInfo.knowledgeTypes)
        }
        return knowledgeType2RetrievedDoc
    }

    // Get context for the chatbot for unknown intent agent
    async function getProductContextFromDocsUnknownIntent(retrievedDoc, productIdGroup) {
        // Get current context of the product that store in vectordb
        const productId2Context = {}
        const productId2Metadata = {}
        retrievedDoc.map((doc) => {
            productId2Context[doc.metadata['product_id']] = doc.pageContent
            productId2Metadata[doc.metadata['product_id']] = doc.metadata
        })

        let updatedContext = []
        for (const [productId, rows] of Object.entries(productIdGroup)) {
            let context = productId2Context[productId]
            context += '## Product prices and links from different ecommerce providers:\n'

            rows.forEach((row) => {
                if (!row.price) return;
                // construct fake link for the product so that we can replace the real link in the postprocessing step
                let fakeLink = constructFakeLink(row.provider, productId)
                context += '- Ecommerce provider (' + row.provider + ')[' + fakeLink + ']: ' + row.price + '$.\n'
            })
            context += '\n'
            updatedContext.push(context)
        }

        return prepareContext(updatedContext)
    }

    // Get context for the chatbot for known intent agent
    async function getProductContextFromDocsKnownIntent(retrievedDoc, productIdGroup) {
        const intent = routeInfo.queryIntent
        // Get current context of the product that store in vectordb
        const productId2Context = {}
        const productId2Metadata = {}
        retrievedDoc.map((doc) => {
            productId2Context[doc.metadata["product_id"]] = doc.pageContent;
            productId2Metadata[doc.metadata["product_id"]] = doc.metadata;
        })

        let updatedContext = []
        if (intent === UserIntent.COMPARE_PRICE) {
            for (const [productId, rows] of Object.entries(productIdGroup)) {
                let metadata = productId2Metadata[productId]
                let context = ""
                context += '## Product name: ' + metadata.product_name + '.\n'
                context += '## Product description: ' + metadata.description + '.\n'
                context += '## Product prices from different ecommerce providers:\n'

                rows.forEach((row) => {
                    // construct fake link for the product so that we can replace the real link in the postprocessing step
                    let fakeLink = constructFakeLink(row.provider, productId)
                    context += '- Ecommerce provider (' + row.provider + ')[' + fakeLink + ']: ' + row.price + '$.\n'
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
                    context += '## Product price from ecommerce provider ' + row.provider + ': ' + row.price + '$ - ' + fakeLink + '.\n'
                })
                context += "\n"

                updatedContext.push(context)
            }
        } else if (intent === UserIntent.QUERY_PRODUCT_BY_PROVIDER) {
            // get the product with the given provider
            for (const [productId, rows] of Object.entries(productIdGroup)) {
                let context = productId2Context[productId]
                context += '## Ecommerce provider: ' + rows[0].provider + '.\n'

                rows.forEach((row) => {
                    let fakeLink = constructFakeLink(row.provider, productId)
                    context += '## Product price from ecommerce provider (' + row.provider + ')[' + fakeLink + ']: ' + row.price + '$.\n'
                })
                context += "\n"

                updatedContext.push(context)
            }
        }

        return prepareContext(updatedContext)
    }

    // Get context for the chatbot based on the documents retrieved for each knowledge type
    async function getContextForChatbot(knowledgeType2RetrievedDoc, productIdGroup, database) {
        let finalContext = ''

        // Get general context for each knowledge type
        const knowledgeType2GeneralContext = await database.getGeneralContextbyKnowledgeTypes(routeInfo.knowledgeTypes)

        for (const knowledgeType of routeInfo.knowledgeTypes) {
            const retrievedDoc = knowledgeType2RetrievedDoc[knowledgeType] ?? []
            if (retrievedDoc.length === 0) {
                // No document found for this knowledge type
                continue
            }

            const generalContext = knowledgeType2GeneralContext[knowledgeType] ?? ''

            let context = ''
            // Get context from the retrieved documents
            if (knowledgeType === "product") {
                if (routeInfo.queryIntent === 'unknown') {
                    context = await getProductContextFromDocsUnknownIntent(retrievedDoc, productIdGroup)
                } else {
                    context = await getProductContextFromDocsKnownIntent(retrievedDoc, productIdGroup)
                }
            } else {
                context = await getContextFromDocs(retrievedDoc)
                console.log("Context: ", context)
            }

            // Combine general context and retrieved context for the chatbot
            // general context will help chatbot to understand the context better
            finalContext += generalContext + "\n" + context
        }

        return finalContext
    }

    async function getQueryCase() {
        if (routeInfo.pricerangemin || routeInfo.pricerangemax || (Array.isArray(routeInfo.ecommerceproviders) && routeInfo.ecommerceproviders.length > 0)) {
            return QueryCase.QUERY_DATABASE_FIRST
        } else {
            return QueryCase.QUERY_VECTOR_DATABASE_FIRST
        }
    }

    async function main() {
        // initialize vector database
        const vectorStore = getVectorStore()

        // Initialize the pool for postgre database
        const database = new PostgresDB()
        try {
            const queryCase = await getQueryCase()
            console.log("Query case: ", queryCase)

            let knowledgeType2RetrievedDoc = {}
            let productIdGroup = {}
            if (queryCase === QueryCase.QUERY_DATABASE_FIRST) {
                productIdGroup = await getProductIdGroup(database, queryCase)
                // convert string to integer to query the vector database
                const productIds = Object.keys(productIdGroup).map((productId) => parseInt(productId))
                knowledgeType2RetrievedDoc = await getKnowledgeFromVectorDB(vectorStore, productIds)

                // get productIds from the retrieved documents
                if ('product' in knowledgeType2RetrievedDoc) {
                    const retrievedProductIds = getProductIDsFromDocs(knowledgeType2RetrievedDoc['product'])

                    // filter the productIdGroup based on the retrieved productIds to include only the productIds that are in the retrieved documents
                    const filteredProductIdGroup = Object.fromEntries(
                        Object.entries(productIdGroup).filter(([productId]) => 
                            retrievedProductIds.includes(parseInt(productId))
                        )
                    );
                    productIdGroup = filteredProductIdGroup;
                    console.log("Filtered productIdGroup: ", productIdGroup)
                } else {
                    // if there is no product in the retrieved documents, we will not use the productIdGroup
                    productIdGroup = {}
                }

            } else if (queryCase === QueryCase.QUERY_VECTOR_DATABASE_FIRST) {
                knowledgeType2RetrievedDoc = await getKnowledgeFromVectorDB(vectorStore)
                if ('product' in knowledgeType2RetrievedDoc) {
                    const productIds = getProductIDsFromDocs(knowledgeType2RetrievedDoc['product'])
                    productIdGroup = await getProductIdGroup(database, queryCase, productIds)
                }
            }

            const finalContext = await getContextForChatbot(knowledgeType2RetrievedDoc, productIdGroup, database)
            console.log("Final context: ", finalContext)
            return { finalContext, productIdGroup }
        } catch (error) {
            console.error('Error getting context for chatbot:', error)
            throw error
        }
    }

    return await main()
}

getContext()