import "dotenv/config";
import fs from "fs";
import path from "path";
import { parseSRT } from "./parser/srtParser.js";
import { semanticChunk } from "./chunker/semanticChunker.js";
import { buildChunks } from "./chunker/buildchunks.js";
import { createDocuments } from "./ingest/createDocuments.js";
import { createVectorStore } from "./vectorstore/qdrant.js";

// Helper to recursively find all SRT files
function getSRTFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getSRTFiles(filePath, fileList);
    } else if (file.endsWith(".srt")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function main() {
  const dataFolder = "./data";
  const allFiles = getSRTFiles(dataFolder);
  
  // Skip the specifically requested file
  const filesToProcess = allFiles.filter(
    (file) => path.basename(file) !== "Something personal for Mobile development_epm.srt"
  );

  let successful = 0;
  let failed = 0;
  let totalChunks = 0;
  let totalVectors = 0;

  for (let i = 0; i < filesToProcess.length; i++) {
    const filePath = filesToProcess[i];
    const fileName = path.basename(filePath);
    const lessonName = path.basename(filePath, ".srt");

    console.log(`\nProcessing:`);
    console.log(`${i + 1}/${filesToProcess.length}`);
    console.log(`\nLesson:`);
    console.log(`${fileName}`);

    try {
      const subtitles = await parseSRT(filePath);
      const ranges = await semanticChunk(subtitles);
      const chunks = buildChunks(subtitles, ranges);
      
      const docs = createDocuments(chunks, lessonName);
      
      // Inject source filename to preserve metadata without modifying createDocuments.js
      for (const doc of docs) {
        doc.metadata["source filename"] = fileName;
      }
      
      await createVectorStore(docs);

      console.log(`\nChunks:`);
      console.log(`${chunks.length}`);
      console.log(`\nUploaded:`);
      console.log(`${docs.length} vectors`);

      successful++;
      totalChunks += chunks.length;
      totalVectors += docs.length;
    } catch (error) {
      console.error(`\nFailed to process ${fileName}:`, error.message);
      failed++;
    }
  }

  console.log("\n=========================");
  console.log("FINAL SUMMARY");
  console.log("=========================");
  console.log(`Total files\n${filesToProcess.length}`);
  console.log(`\nSuccessful\n${successful}`);
  console.log(`\nFailed\n${failed}`);
  console.log(`\nTotal chunks\n${totalChunks}`);
  console.log(`\nTotal vectors uploaded\n${totalVectors}`);
}

main();