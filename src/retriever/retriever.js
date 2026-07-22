import "dotenv/config";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../embeddings/embeddings.js";
import { client } from "../vectorstore/qdrant.js";

export async function retrieveDocuments(query) {
  try {
    // Connect to the existing Qdrant collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        client,
        collectionName: "advanced-rag",
      }
    );

    // Create a retriever
    const retriever = vectorStore.asRetriever({ k: 4 });

    // Use similarity search (invoking the retriever)
    const docs = await retriever.invoke(query);

    return docs;
  } catch (error) {
    console.error("Failed to retrieve documents:", error);
    throw error;
  }
}

// Temporary test
const docs = await retrieveDocuments("What is mobile development?");
console.log(docs);
