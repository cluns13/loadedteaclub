import Redis from 'ioredis';

// Ensure we're only creating one Redis client
const globalForRedis = global as unknown as { redis: Redis | undefined };

export const redis = 
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      // Exponential backoff with max of 30 seconds
      return Math.min(times * 50, 30000);
    }
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
