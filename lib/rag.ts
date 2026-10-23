import "server-only";

import { createEmbedding } from "./ai/embedding";
import { supabaseAdmin } from "./supabaseAdmin";
import {
  MAX_RAG_CONTEXT_CHUNKS,
  RAG_SIMILARITY_THRESHOLD,
} from "./ai/models";

export interface RetrievedChunk {
  id: string;
  website_id: string;
  file_name: string;
  chunk_index: number;
  chunk_text: string;
  similarity: number;
}

export interface SearchOptions {
  topK?: number;
  similarityThreshold?: number;
}

/**
 * Searches for relevant knowledge chunks matching the question for a specific bot.
 * Enforces bot scoping, similarity threshold filtering, and source metadata.
 */
export async function searchRelevantChunks(
  question: string,
  websiteId: string,
  options: SearchOptions = {}
): Promise<RetrievedChunk[]> {
  if (!websiteId || typeof websiteId !== "string") {
    throw new Error("Valid websiteId is required for RAG retrieval.");
  }

  const cleanQuestion = question.trim().slice(0, 500);
  if (!cleanQuestion) {
    return [];
  }

  const topK = Math.max(1, Math.min(options.topK ?? MAX_RAG_CONTEXT_CHUNKS, 10));
  const threshold = options.similarityThreshold ?? RAG_SIMILARITY_THRESHOLD;

  try {
    console.log(`[RAG] Generating question embedding for bot=${websiteId}...`);
    const embedding = await createEmbedding(cleanQuestion);

    // Call pgvector match_chunks RPC scoped strictly to match_website
    const { data, error } = await supabaseAdmin.rpc("match_chunks", {
      query_embedding: embedding,
      match_website: websiteId,
      match_count: topK,
    });

    if (error) {
      console.error("[RAG] RPC match_chunks error:", error);
      return [];
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`[RAG] Zero chunks returned for bot=${websiteId}.`);
      return [];
    }

    // Filter by similarity threshold
    const filteredChunks = (data as RetrievedChunk[]).filter((chunk) => {
      const score = typeof chunk.similarity === "number" ? chunk.similarity : 0;
      return score >= threshold;
    });

    console.log(
      `[RAG] Retrieved ${data.length} candidate chunks, ${filteredChunks.length} passed threshold (>= ${threshold}).`
    );

    return filteredChunks;
  } catch (error) {
    console.error("[RAG] Retrieval pipeline error:", error);
    // Don't crash the entire request; return empty array so caller can formulate fallback
    return [];
  }
}