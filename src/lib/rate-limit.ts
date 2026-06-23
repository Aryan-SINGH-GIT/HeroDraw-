export class RateLimiter {
  private ipRequests = new Map<string, { count: number; timestamp: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(ip: string): boolean {
    const now = Date.now();
    const record = this.ipRequests.get(ip);

    if (!record) {
      this.ipRequests.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (now - record.timestamp > this.windowMs) {
      // Reset window
      this.ipRequests.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}

// 100 requests per 10 minutes for general routes
export const globalRateLimiter = new RateLimiter(100, 10 * 60 * 1000);

// 10 requests per 1 minute for auth routes
export const authRateLimiter = new RateLimiter(10, 60 * 1000);
