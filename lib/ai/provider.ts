import "server-only";

// ==============================================================================
// Unified Server-Side AI Provider Interface
// Central entry point for LLM chat generation, streaming, and embeddings.
// ==============================================================================

export * from "./models";
export * from "./errors";
export * from "./usage";
export {
  generateChatResponse,
  generateChatStream,
  type AIChatOptions,
} from "./chat";
export {
  createEmbedding,
  createBatchEmbeddings,
  validateEmbedding,
} from "./embedding";
export { getGeminiClient, withRetry, classifyGeminiError } from "./gemini";
