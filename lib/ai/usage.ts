import "server-only";

// ==============================================================================
// Server-side AI Usage & Metrics Tracker
// ==============================================================================

export interface AIUsageRecord {
  model: string;
  operation: "chat" | "chat_stream" | "embedding" | "analysis";
  websiteId?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  timestamp: string;
}

// In-memory ring buffer for recent metrics / analytics debugging
const MAX_METRICS_BUFFER = 100;
const metricsBuffer: AIUsageRecord[] = [];

/**
 * Record an AI operation event with timing and token usage.
 */
export function trackAIUsage(record: Omit<AIUsageRecord, "timestamp">): void {
  const fullRecord: AIUsageRecord = {
    ...record,
    timestamp: new Date().toISOString(),
  };

  metricsBuffer.unshift(fullRecord);
  if (metricsBuffer.length > MAX_METRICS_BUFFER) {
    metricsBuffer.pop();
  }

  // Safe server log without leaking sensitive user text
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[AI Usage] op=${fullRecord.operation} model=${fullRecord.model} website=${fullRecord.websiteId || "system"
      } tokens=${fullRecord.totalTokens ?? "estimated"} duration=${fullRecord.durationMs
      }ms success=${fullRecord.success}`
    );
  }
}

/**
 * Retrieve recent AI usage metrics for diagnostic endpoints or internal monitoring.
 */
export function getRecentAIUsage(): readonly AIUsageRecord[] {
  return [...metricsBuffer];
}
