import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";

import { embeddings } from "../embeddings/embeddings.js";

export const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export async function createVectorStore(documents) {
  return await QdrantVectorStore.fromDocuments(
    documents,
    embeddings,
    {
      client,
      collectionName: "advanced-rag",
    }
  );
}