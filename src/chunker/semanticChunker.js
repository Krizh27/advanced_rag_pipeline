import { llm } from "../llm/openai.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    chunks: z.array(
      z.object({
        startIndex: z.number(),
        endIndex: z.number(),
      })
    ),
  })
);

export async function semanticChunk(subtitles) {
  const transcript = subtitles
    .map((s) => `${s.index}: ${s.text}`)
    .join("\n");

  const prompt = `
You are an expert at semantic chunking for Retrieval Augmented Generation.

Your job is ONLY to identify chunk boundaries.

Rules:

- Keep related concepts together.
- Never split in the middle of an explanation.
- Start a new chunk when topic changes.
- Around 5-10 subtitles per chunk.
- Return ONLY JSON.

${parser.getFormatInstructions()}

Transcript:

${transcript}
`;

  const response = await llm.invoke(prompt);

  return parser.parse(response.content);
}