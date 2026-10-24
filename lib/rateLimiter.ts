import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface IRateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

// In-memory sliding window fallback for environments without Upstash configured
class MemoryRateLimiter implements IRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = (this.requests.get(identifier) || []).filter(
      (ts) => ts > windowStart
    );

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const reset = oldest + this.windowMs;
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset,
      };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - timestamps.length,
      reset: now + this.windowMs,
    };
  }
}

function createLimiter(
  maxRequests: number,
  windowStr: "1 m" | "1 h",
  windowMs: number
): IRateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, windowStr),
        analytics: true,
      });
    } catch (err) {
      console.warn("Failed to initialize Upstash Redis rate limiter, using in-memory fallback:", err);
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[SECURITY WARNING] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not configured in production. Falling back to in-memory rate limiting."
    );
  }

  return new MemoryRateLimiter(maxRequests, windowMs);
}

// Lazy rate limiters
let chatLimiterInstance: IRateLimiter | null = null;
let analyzeLimiterInstance: IRateLimiter | null = null;
let uploadLimiterInstance: IRateLimiter | null = null;

export const chatRateLimit: IRateLimiter = {
  async limit(id: string) {
    if (!chatLimiterInstance) {
      chatLimiterInstance = createLimiter(30, "1 m", 60 * 1000);
    }
    return chatLimiterInstance.limit(id);
  },
};

export const analyzeRateLimit: IRateLimiter = {
  async limit(id: string) {
    if (!analyzeLimiterInstance) {
      analyzeLimiterInstance = createLimiter(5, "1 h", 60 * 60 * 1000);
    }
    return analyzeLimiterInstance.limit(id);
  },
};

export const uploadRateLimit: IRateLimiter = {
  async limit(id: string) {
    if (!uploadLimiterInstance) {
      uploadLimiterInstance = createLimiter(10, "1 h", 60 * 60 * 1000);
    }
    return uploadLimiterInstance.limit(id);
  },
};
