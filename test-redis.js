import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testRedis() {
  console.log('Detailed Redis Connection Test\n');
  
  console.log('Configuration Details:');
  console.log('Host:', process.env.REDIS_HOST);
  console.log('Port:', process.env.REDIS_PORT);
  console.log('URL:', process.env.REDIS_URL);
  console.log('Password Length:', process.env.REDIS_PASSWORD?.length || 'No password');

  try {
    const redis = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false  // IMPORTANT: Only for testing
      }
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Test connection
    console.log('\nTesting connection...');
    const result = await redis.ping();
    console.log('Ping Result:', result);

    console.log('✅ Connection successful!');

    // Cleanup
    await redis.quit();
  } catch (error) {
    console.error('❌ Redis Connection Failed:', error);
  }
}

// Run the test
testRedis();
