import { Document } from "@langchain/core/documents";

export function createDocuments(chunks, lessonName) {
  return chunks.map((chunk) => {
    return new Document({
      pageContent: chunk.text,

      metadata: {
        lesson: lessonName,
        start: chunk.start,
        end: chunk.end,
      },
    });
  });
}