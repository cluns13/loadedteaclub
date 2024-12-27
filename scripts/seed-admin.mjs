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

async function seedAdmin() {
  try {
    const db = await getDb();
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({
      email: 'admin@loadedteafinder.com'
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = {
      _id: new ObjectId(),
      email: 'admin@loadedteafinder.com',
      hashedPassword,
      name: 'Admin User',
      role: 'admin',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(adminUser);
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
