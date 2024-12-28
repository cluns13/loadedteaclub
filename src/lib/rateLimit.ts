import redis from '@/lib/redis';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
}

class RedisRateLimit {
  private windowMs: number;
  private maxRequests: number;
  private keyPrefix: string;

  constructor({
    windowMs = 60000, // 1 minute default
    maxRequests = 30, // 30 requests default
    keyPrefix = 'rate_limit:'
  }: RateLimitOptions = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.keyPrefix = keyPrefix;
  }

  /**
   * Check and apply rate limiting for a specific identifier
   * @param identifier Unique identifier (e.g., IP address, user ID)
   * @returns Object with success status and remaining requests
   */
  async check(identifier: string): Promise<{ success: boolean; remaining: number; resetTime?: number }> {
    const key = `${this.keyPrefix}${identifier}`;
    const now = Date.now();

    try {
      // Increment request count and get current count
      const result = await redis.pipeline()
        .incr(key)
        .pexpire(key, this.windowMs)
        .exec();

      const currentCount = result?.[0]?.[1] ?? 0;

      // Check if request limit is exceeded
      if (typeof currentCount === 'number' && currentCount > this.maxRequests) {
        return { 
          success: false, 
          remaining: 0, 
          resetTime: now + this.windowMs 
        };
      }

      return { 
        success: true, 
        remaining: Math.max(0, this.maxRequests - (currentCount as number)),
        resetTime: now + this.windowMs 
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { 
        success: false, 
        remaining: 0 
      };
    }
  }

  /**
   * Manually reset rate limit for an identifier
   * @param identifier Unique identifier to reset
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}${identifier}`;
    await redis.del(key);
  }
}

// Predefined rate limiters for different use cases
export function rateLimit(limit: number, windowMs: number) {
  return new RedisRateLimit({ maxRequests: limit, windowMs });
}

export async function checkRateLimit(req: Request): Promise<boolean | null> {
  // Implement rate limit check logic
  return true;
}

export function apiRateLimit() {
  return rateLimit(100, 60000); // 100 requests per minute
}

export function authRateLimit() {
  return rateLimit(10, 60000); // 10 requests per minute
}

export function businessClaimRateLimit(limit: number = 5, windowMs: number = 86400000) {
  return rateLimit(limit, windowMs); // 5 claims per day
}

export default RedisRateLimit;
