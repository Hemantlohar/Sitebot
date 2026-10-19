import "server-only";

import ollama from "ollama";

export async function createEmbedding(
  text: string
): Promise<number[]> {
  const cleanText =
    text.trim().slice(0, 4000);

  if (!cleanText) {
    throw new Error(
      "Cannot generate embedding for empty text."
    );
  }

  const response =
    await ollama.embeddings({
      model:
        process.env.OLLAMA_EMBEDDING_MODEL ||
        "nomic-embed-text",

      prompt: cleanText,
    });

  if (
    !response.embedding ||
    response.embedding.length === 0
  ) {
    throw new Error(
      "Embedding model returned an empty vector."
    );
  }

  return response.embedding;
}