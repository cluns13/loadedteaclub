import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

async function getDb() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  return client.db(process.env.MONGODB_DB || 'loaded-tea-finder');
}

async function seedTestData() {
  try {
    const db = await getDb();
    
    // Create test business if it doesn't exist
    const existingBusiness = await db.collection('businesses').findOne({
      name: 'Test Nutrition Club'
    });

    if (!existingBusiness) {
      const business = {
        _id: new ObjectId(),
        name: 'Test Nutrition Club',
        slug: 'test-nutrition-club',
        description: 'A test nutrition club for development',
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610] // New York coordinates
        },
        verified: false,
        claimed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('businesses').insertOne(business);
      console.log('Test business created successfully');
    } else {
      console.log('Test business already exists');
    }

    // Create test user if it doesn't exist
    const existingUser = await db.collection('users').findOne({
      email: 'test@loadedteafinder.com'
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('test123', 12);
      const user = {
        _id: new ObjectId(),
        email: 'test@loadedteafinder.com',
        hashedPassword,
        name: 'Test User',
        role: 'user',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('users').insertOne(user);
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();
