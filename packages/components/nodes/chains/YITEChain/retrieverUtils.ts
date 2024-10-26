import { any } from "@getzep/zep-cloud/core/schemas";
import { VectorStore } from "@langchain/core/vectorstores";

async function retrieveBasedOnKnowledgeType(input: string, vectorStore: VectorStore, knowledgeTypes: string[] | undefined, callbacks: any): Promise<Record<string, DocumentWithScore[]>> {
    const filter = {
        must: [{ key: "knowledge_type", match: { any: knowledgeTypes } }],
    }
    console.log("Retriever filter: ", filter)

    const numRetrievedDoc = (vectorStore as any).k

    const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore(input, numRetrievedDoc, filter, callbacks);

    // Get the documents for each knowledge type
    let retrievedDoc: Record<string, DocumentWithScore[]> = {}
    similaritySearchWithScoreResults.forEach((result) => {
        const docInput: DocumentWithScoreInput = {
            pageContent: result[0].pageContent,
            metadata: result[0].metadata,
            score: result[1]
        }
        const knowledgeType = result[0].metadata.knowledge_type
        if (!retrievedDoc[knowledgeType]) {
            retrievedDoc[knowledgeType] = []
        }
        retrievedDoc[knowledgeType].push(new DocumentWithScore(docInput)) 
    })

    return retrievedDoc
}


// Define the query parameters 
interface DocumentWithScoreInput {
    pageContent: string
    metadata: Record<string, any>
    score: number
}

class DocumentWithScore {
    pageContent: string
    metadata: Record<string, any>
    score: number

    constructor(input: DocumentWithScoreInput) {
        this.pageContent = input.pageContent
        this.metadata = input.metadata
        this.score = input.score
    }
}

export { DocumentWithScore, DocumentWithScoreInput, retrieveBasedOnKnowledgeType }