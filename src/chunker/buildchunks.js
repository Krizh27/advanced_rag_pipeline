export function buildChunks(subtitles, ranges) {
  return ranges.chunks.map((range) => {
    const group = subtitles.slice(
      range.startIndex - 1,
      range.endIndex
    );

    return {
      start: group[0].start,
      end: group[group.length - 1].end,

      text: group
        .map((s) => s.text)
        .join(" "),

      subtitles: group,
    };
  });
}