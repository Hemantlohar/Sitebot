import "server-only";

import { GoogleGenAI } from "@google/genai";
import {
  MAX_RETRY_ATTEMPTS,
  INITIAL_RETRY_DELAY_MS,
  REQUEST_TIMEOUT_MS,
} from "./models";
import {
  GeminiError,
  GeminiRateLimitError,
  GeminiAuthenticationError,
} from "./errors";

// Singleton client instance
let geminiClientInstance: GoogleGenAI | null = null;

/**
 * Get or initialize the official GoogleGenAI client singleton.
 * Uses lazy initialization to prevent build-time crashes when env vars are not present.
 */
export function getGeminiClient(): GoogleGenAI {
  if (geminiClientInstance) {
    return geminiClientInstance;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new GeminiAuthenticationError(
      "Missing GEMINI_API_KEY environment variable. Obtain an API key from Google AI Studio."
    );
  }

  geminiClientInstance = new GoogleGenAI({ apiKey: apiKey.trim() });
  return geminiClientInstance;
}

/**
 * Set a custom client instance (used for testing and mocking).
 */
export function setGeminiClient(client: GoogleGenAI | null): void {
  geminiClientInstance = client;
}

/**
 * Classifies an unknown error from Gemini API into a standard typed error.
 */
export function classifyGeminiError(error: unknown): GeminiError {
  if (error instanceof GeminiError) {
    return error;
  }

  const errObj = error as Record<string, unknown> | undefined;
  const message = String(errObj?.message || error || "Unknown Gemini API error");
  const status =
    typeof errObj?.status === "number"
      ? errObj.status
      : typeof errObj?.statusCode === "number"
        ? errObj.statusCode
        : undefined;

  // Rate limiting / Quota exhausted
  if (
    status === 429 ||
    message.includes("429") ||
    message.toLowerCase().includes("quota") ||
    message.toLowerCase().includes("rate limit") ||
    message.toLowerCase().includes("resource_exhausted")
  ) {
    return new GeminiRateLimitError(message);
  }

  // Authentication error
  if (
    status === 401 ||
    status === 403 ||
    message.includes("API_KEY_INVALID") ||
    message.includes("unauthenticated")
  ) {
    return new GeminiAuthenticationError(message);
  }

  // Transient server errors (500, 502, 503, 504, ECONNRESET, timeout)
  const isTransient =
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("unavailable") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("timed out");

  return new GeminiError(message, status, isTransient);
}

/**
 * Executes an operation with a timeout guard and bounded exponential backoff retries.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? MAX_RETRY_ATTEMPTS;
  const initialDelay = options.initialDelayMs ?? INITIAL_RETRY_DELAY_MS;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;

  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    attempt++;
    let timeoutHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new GeminiError(
            `Gemini request timed out after ${timeoutMs}ms`,
            408,
            true
          )
        );
      }, timeoutMs);
      if (typeof timeoutHandle?.unref === "function") {
        timeoutHandle.unref();
      }
    });

    try {
      try {
        return await Promise.race([operation(), timeoutPromise]);
      } finally {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }
      }
    } catch (rawError) {
      const classified = classifyGeminiError(rawError);

      // Only retry if marked retryable and attempts remain
      if (!classified.isRetryable || attempt >= maxAttempts) {
        throw classified;
      }

      console.warn(
        `[Gemini Retry] Attempt ${attempt}/${maxAttempts} failed: ${classified.message}. Retrying in ${delay}ms...`
      );

      // Wait with jitter
      const jitter = Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      delay *= 2; // Exponential backoff
    }
  }

  throw new GeminiError("Request failed after exhausting retry attempts.");
}
