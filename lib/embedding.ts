import "server-only";

import { createEmbedding, createBatchEmbeddings } from "./ai/embedding";

/**
 * Generates a 768-dimensional vector embedding for a given text chunk using Gemini.
 * Propagates errors to the caller so ingestion failures are not silently masked.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return await createEmbedding(text);
}

/**
 * Generates embeddings for multiple text chunks with controlled concurrency.
 */
export async function generateBatchEmbeddings(
  texts: string[],
  options?: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<number[][]> {
  return await createBatchEmbeddings(texts, options);
}