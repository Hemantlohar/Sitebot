import "server-only";

import { getGeminiClient, withRetry } from "./gemini";
import { GEMINI_CHAT_MODEL } from "./models";
import { GeminiError } from "./errors";
import { trackAIUsage } from "./usage";

export interface AIChatOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  jsonMode?: boolean;
  websiteId?: string;
}

/**
 * Generates a complete text or JSON response using Gemini (gemini-3.8-flash).
 */
export async function generateChatResponse({
  prompt,
  systemInstruction,
  temperature = 0.2,
  jsonMode = false,
  websiteId,
}: AIChatOptions): Promise<string> {
  const startTime = Date.now();
  const client = getGeminiClient();

  try {
    const response = await withRetry(async () => {
      return await client.models.generateContent({
        model: GEMINI_CHAT_MODEL,
        contents: prompt,
        config: {
          temperature,
          systemInstruction: systemInstruction || undefined,
          responseMimeType: jsonMode ? "application/json" : undefined,
        },
      });
    });

    const text = response.text?.trim();

    if (!text) {
      throw new GeminiError("Gemini returned an empty text response.");
    }

    trackAIUsage({
      model: GEMINI_CHAT_MODEL,
      operation: jsonMode ? "analysis" : "chat",
      websiteId,
      durationMs: Date.now() - startTime,
      success: true,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      totalTokens: response.usageMetadata?.totalTokenCount,
    });

    return text;
  } catch (error) {
    trackAIUsage({
      model: GEMINI_CHAT_MODEL,
      operation: jsonMode ? "analysis" : "chat",
      websiteId,
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    console.error("Gemini generateChatResponse error:", error);
    throw error;
  }
}

/**
 * Generates a stream of text chunks using Gemini (gemini-3.8-flash).
 * Yields raw text chunks asynchronously.
 */
export async function generateChatStream({
  prompt,
  systemInstruction,
  temperature = 0.2,
  websiteId,
}: AIChatOptions): Promise<AsyncIterable<string>> {
  const startTime = Date.now();
  const client = getGeminiClient();

  try {
    const stream = await withRetry(async () => {
      return await client.models.generateContentStream({
        model: GEMINI_CHAT_MODEL,
        contents: prompt,
        config: {
          temperature,
          systemInstruction: systemInstruction || undefined,
        },
      });
    });

    // Create an async generator that yields plain string tokens
    async function* textStream() {
      let totalTokens = 0;
      try {
        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            yield text;
          }
          if (chunk.usageMetadata?.totalTokenCount) {
            totalTokens = chunk.usageMetadata.totalTokenCount;
          }
        }

        trackAIUsage({
          model: GEMINI_CHAT_MODEL,
          operation: "chat_stream",
          websiteId,
          durationMs: Date.now() - startTime,
          success: true,
          totalTokens: totalTokens || undefined,
        });
      } catch (streamIterError) {
        trackAIUsage({
          model: GEMINI_CHAT_MODEL,
          operation: "chat_stream",
          websiteId,
          durationMs: Date.now() - startTime,
          success: false,
          errorMessage:
            streamIterError instanceof Error
              ? streamIterError.message
              : String(streamIterError),
        });
        throw streamIterError;
      }
    }

    return textStream();
  } catch (error) {
    trackAIUsage({
      model: GEMINI_CHAT_MODEL,
      operation: "chat_stream",
      websiteId,
      durationMs: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    console.error("Gemini generateChatStream error:", error);
    throw error;
  }
}