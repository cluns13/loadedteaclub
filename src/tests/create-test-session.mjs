import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

async function createTestSession() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    // Create test user if doesn't exist
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    await db.collection('users').updateOne(
      { email: TEST_USER.email },
      {
        $set: {
          ...TEST_USER,
          password: hashedPassword,
        }
      },
      { upsert: true }
    );

    // Create a session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days from now

    await db.collection('sessions').insertOne({
      sessionToken,
      userId: TEST_USER.email,
      expires,
    });

    console.log('Test session created successfully');
    console.log('Session Token:', sessionToken);
    
    return sessionToken;
  } finally {
    await client.close();
  }
}

createTestSession()
  .catch(console.error)
  .finally(() => process.exit());
