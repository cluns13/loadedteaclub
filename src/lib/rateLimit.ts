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

      const currentCount = result[0][1] as number;

      // Check if request limit is exceeded
      if (currentCount > this.maxRequests) {
        return { 
          success: false, 
          remaining: 0, 
          resetTime: now + this.windowMs 
        };
      }

      return { 
        success: true, 
        remaining: Math.max(0, this.maxRequests - currentCount),
        resetTime: now + this.windowMs
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fallback to allowing the request if Redis fails
      return { success: true, remaining: this.maxRequests };
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
export const apiRateLimit = new RedisRateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyPrefix: 'api_rate_limit:'
});

export const authRateLimit = new RedisRateLimit({
  windowMs: 300000, // 5 minutes
  maxRequests: 10, // 10 login attempts per 5 minutes
  keyPrefix: 'auth_rate_limit:'
});

export const businessClaimRateLimit = new RedisRateLimit({
  windowMs: 86400000, // 24 hours
  maxRequests: 3, // 3 business claim attempts per day
  keyPrefix: 'business_claim_rate_limit:'
});

export default RedisRateLimit;