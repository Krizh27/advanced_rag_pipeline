// src/parser/srtParser.js

import fs from "fs/promises";

export async function parseSRT(filePath) {
  const fileContent = await fs.readFile(filePath, "utf-8");

  const subtitleBlocks = fileContent
    .trim()
    .split(/\r?\n\r?\n/);

  const subtitles = subtitleBlocks.map((block) => {
    const lines = block.split(/\r?\n/);

    const index = Number(lines[0]);

    const [start, end] = lines[1].split(" --> ");

    const text = lines.slice(2).join(" ");

    return {
      index,
      start,
      end,
      text,
    };
  });

  return subtitles;
}