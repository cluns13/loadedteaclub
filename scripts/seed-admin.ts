import { getDb } from '../src/lib/db/mongodb';
import { hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';

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
    const hashedPassword = await hash('admin123', 12);
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
