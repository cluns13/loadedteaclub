import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { migrateToVersion } from './migrations';
import { migration as initialSchema } from './migrations/001_initial_schema';

let mongod: MongoMemoryServer | null = null;
let client: MongoClient | null = null;
let db: Db | null = null;

export async function setupTestDatabase(): Promise<Db> {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  client = await MongoClient.connect(uri);
  db = client.db('test');

  // Run migrations
  await migrateToVersion(db, 1, [initialSchema]);

  return db;
}

export async function teardownTestDatabase(): Promise<void> {
  if (client) {
    await client.close();
  }
  if (mongod) {
    await mongod.stop();
  }
  client = null;
  db = null;
  mongod = null;
}

export async function clearTestDatabase(): Promise<void> {
  if (!db) {
    throw new Error('Test database not initialized');
  }
  const collections = await db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

// Test data generators
export function createTestUser(overrides = {}) {
  return {
    email: 'test@example.com',
    name: 'Test User',
    hashedPassword: 'hashedPassword',
    role: 'USER',
    ...overrides,
  };
}

export function createTestBusiness(overrides = {}) {
  return {
    name: 'Test Business',
    address: '123 Test St',
    location: {
      lat: 37.7749,
      lng: -122.4194,
    },
    ...overrides,
  };
}

export function createTestMenuItem(overrides = {}) {
  return {
    name: 'Test Item',
    description: 'A test menu item',
    price: 9.99,
    category: 'energy',
    calories: 100,
    caffeine: 50,
    ...overrides,
  };
}
