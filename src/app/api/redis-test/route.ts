import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Set a test key
    await redis.set('test-key', 'Hello, Redis!');

    // Retrieve the key
    const value = await redis.get('test-key');

    return NextResponse.json({
      status: 'success',
      message: 'Redis connection works!',
      value: value
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
