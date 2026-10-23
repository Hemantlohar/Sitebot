import "server-only";

import { getGeminiClient, withRetry } from "./gemini";
import {
  GEMINI_EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
  MAX_EMBEDDING_CHUNK_CHARS,
} from "./models";
import {
  GeminiError,
  EmbeddingDimensionMismatchError,
} from "./errors";
import { trackAIUsage } from "./usage";

/**
 * Validates that an embedding vector is non-empty, contains valid numbers,
 * and matches the expected schema dimensionality (768).
 */
export function validateEmbedding(
  vector: unknown,
  expectedDim = EMBEDDING_DIMENSION
): number[] {
  if (!Array.isArray(vector)) {
    throw new GeminiError("Embedding response is not an array.");
  }

  if (vector.length !== expectedDim) {
    throw new EmbeddingDimensionMismatchError(expectedDim, vector.length);
  }

  for (let i = 0; i < vector.length; i++) {
    const val = vector[i];
    if (typeof val !== "number" || !Number.isFinite(val)) {
      throw new GeminiError(
        `Invalid numeric value at vector index ${i}: received ${val}`
      );
    }
  }

  return vector as number[];
}

/**
 * Generates a 768-dimensional vector embedding for a single text chunk using Gemini.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const cleanText = text.trim().slice(0, MAX_EMBEDDING_CHUNK_CHARS);

  if (!cleanText) {
    throw new GeminiError("Cannot generate embedding for empty text.");
  }

  const startTime = Date.now();
  const client = getGeminiClient();

  try {
    const response = await withRetry(async () => {
      return await client.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: cleanText,
        config: {
          outputDimensionality: EMBEDDING_DIMENSION,
        },
      });
    });

    const rawVector = response.embeddings?.[0]?.values;
    if (!rawVector || rawVector.length === 0) {
      throw new GeminiError("Gemini returned an empty embedding vector.");
    }

    const validatedVector = validateEmbedding(rawVector, EMBEDDING_DIMENSION);

    trackAIUsage({
      model: GEMINI_EMBEDDING_MODEL,
      operation: "embedding",
      durationMs: Date.now() - startTime,
      success: true,
      totalTokens: Math.ceil(cleanText.length / 4), // estimation for embeddings
    });

    return validatedVector;
  } catch (error) {
    trackAIUsage({
      model: GEMINI_EMBEDDING_MODEL,
      operation: "embedding",
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    console.error("Gemini createEmbedding error:", error);
    throw error;
  }
}

/**
 * Generates embeddings for a batch of text chunks with controlled concurrency
 * and bounded exponential backoff retries.
 */
export async function createBatchEmbeddings(
  texts: string[],
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<number[][]> {
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, 10));
  const results: number[][] = new Array(texts.length);
  let currentIndex = 0;
  let completedCount = 0;

  async function worker(): Promise<void> {
    while (currentIndex < texts.length) {
      const idx = currentIndex++;
      const text = texts[idx];
      results[idx] = await createEmbedding(text);
      completedCount++;
      if (options.onProgress) {
        options.onProgress(completedCount, texts.length);
      }
    }
  }

  // Run pool of concurrent workers
  const workers = Array.from(
    { length: Math.min(concurrency, texts.length) },
    () => worker()
  );
  await Promise.all(workers);

  return results;
}