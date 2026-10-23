import "server-only";

// ==============================================================================
// Google Gemini Model Configurations (Phase 2)
// ==============================================================================

/**
 * Primary chat and business analysis model.
 * Verified against official Google GenAI API.
 */
export const GEMINI_CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash";

/**
 * Primary vector embedding model.
 * Verified with native Matryoshka Representation Learning (MRL) scaling.
 */
export const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";

/**
 * Embedding vector output dimension.
 * Must strictly match Supabase pgvector schema: vector(768).
 */
export const EMBEDDING_DIMENSION = 768;

/**
 * Maximum input characters per embedding chunk to prevent token truncation.
 */
export const MAX_EMBEDDING_CHUNK_CHARS = 4000;

/**
 * Maximum context chunks to pass into RAG generation prompt.
 */
export const MAX_RAG_CONTEXT_CHUNKS = 4;

/**
 * Minimum similarity score threshold for cosine distance (1 - distance).
 * Below this threshold, retrieved chunks are discarded as irrelevant.
 */
export const RAG_SIMILARITY_THRESHOLD = 0.35;

/**
 * Maximum retry attempts for transient provider failures (rate limits, 503).
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Initial backoff delay in milliseconds for retrying transient failures.
 */
export const INITIAL_RETRY_DELAY_MS = 600;

/**
 * Maximum timeout in milliseconds for Gemini API requests.
 */
export const REQUEST_TIMEOUT_MS = 30000;
