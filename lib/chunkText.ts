export function chunkText(
  text: string,
  chunkSize = 800,
  overlap = 150
) {
  const chunks: string[] = [];

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }

    // Try to end at sentence
    const sentenceEnd = text.lastIndexOf(".", end);

    if (sentenceEnd > start + 300) {
      end = sentenceEnd + 1;
    }

    chunks.push(text.slice(start, end).trim());

    start = end - overlap;

    if (start < 0) start = 0;
  }

  return chunks;
}