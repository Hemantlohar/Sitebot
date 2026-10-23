import "server-only";

// ==============================================================================
// Typed AI & Provider Errors (Phase 2)
// ==============================================================================

export class GeminiError extends Error {
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;

  constructor(message: string, statusCode?: number, isRetryable = false) {
    super(message);
    this.name = "GeminiError";
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    Object.setPrototypeOf(this, GeminiError.prototype);
  }
}

export class GeminiRateLimitError extends GeminiError {
  constructor(message = "Gemini API rate limit exceeded. Please retry shortly.") {
    super(message, 429, true);
    this.name = "GeminiRateLimitError";
    Object.setPrototypeOf(this, GeminiRateLimitError.prototype);
  }
}

export class GeminiAuthenticationError extends GeminiError {
  constructor(message = "Invalid or missing GEMINI_API_KEY environment variable.") {
    super(message, 401, false);
    this.name = "GeminiAuthenticationError";
    Object.setPrototypeOf(this, GeminiAuthenticationError.prototype);
  }
}

export class EmbeddingDimensionMismatchError extends GeminiError {
  public readonly expected: number;
  public readonly received: number;

  constructor(expected: number, received: number) {
    super(
      `Embedding vector dimension mismatch: expected ${expected}, received ${received}.`,
      500,
      false
    );
    this.name = "EmbeddingDimensionMismatchError";
    this.expected = expected;
    this.received = received;
    Object.setPrototypeOf(this, EmbeddingDimensionMismatchError.prototype);
  }
}

export class EmptyRetrievalError extends Error {
  constructor(message = "No relevant knowledge was retrieved for this inquiry.") {
    super(message);
    this.name = "EmptyRetrievalError";
    Object.setPrototypeOf(this, EmptyRetrievalError.prototype);
  }
}
