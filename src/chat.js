import "dotenv/config";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

import { retrieveDocuments } from "./retriever/retriever.js";
import { answerPrompt } from "./prompts/answerPrompt.js";
import { llm } from "./llm/openai.js";

import { fileURLToPath } from "url";

export async function askQuestion(question) {
  const docs = await retrieveDocuments(question);

  const lessonNames = new Set();
  const timestamps = new Set();

  const contextStr = docs.map((doc) => {
    const lesson = doc.metadata.lesson || "Unknown";
    const start = doc.metadata.start || "Unknown";
    const end = doc.metadata.end || "Unknown";
    
    lessonNames.add(lesson);
    if (start !== "Unknown" && end !== "Unknown") {
      timestamps.add(`${start} to ${end}`);
    }

    return `[Lesson: ${lesson}, Timestamp: ${start} - ${end}]\n${doc.pageContent}`;
  }).join("\n\n");

  const chain = answerPrompt.pipe(llm);
  
  const response = await chain.invoke({
    context: contextStr,
    question: question
  });

  return {
    answer: response.content,
    lesson: Array.from(lessonNames).join(", "),
    timestamps: Array.from(timestamps),
    chunks: docs.map(doc => ({
      lesson: doc.metadata.lesson || "Unknown",
      start: doc.metadata.start || "Unknown",
      end: doc.metadata.end || "Unknown",
      text: doc.pageContent || ""
    }))
  };
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const question = await rl.question("Ask a question: ");

    console.log("\n🔍 Retrieving documents and generating answer...");
    
    const result = await askQuestion(question);

    console.log("\n========================================");
    console.log("📝 Question:");
    console.log(question);
    
    console.log("\n📚 Retrieved Lesson Names:");
    console.log(result.lesson || "None");
    
    console.log("\n⏱️ Retrieved Timestamps:");
    console.log(result.timestamps.join("\n") || "None");
    console.log("========================================\n");

    console.log("\n✅ Final Answer:\n");
    console.log(result.answer);
    console.log("\n========================================\n");

  } catch (error) {
    console.error("\n❌ An error occurred during the chat process:");
    console.error(error.message || error);
  } finally {
    rl.close();
  }
}

// Run CLI only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
