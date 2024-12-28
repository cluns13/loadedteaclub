import { getDatabase, MongoDatabase, MockDatabase, DatabaseError } from '../database';
import { setupTestDatabase, teardownTestDatabase, clearTestDatabase } from '../testing';
import { z } from 'zod';

describe('Database Abstraction Layer', () => {
  let db: MongoDatabase;

  beforeAll(async () => {
    const testDb = await setupTestDatabase();
    db = new MongoDatabase(testDb);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('Validation', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().positive(),
    });

    it('should validate data correctly', () => {
      const validData = { name: 'John', age: 30 };
      const result = db.validate('menuItem', validData);
      expect(result).toEqual(validData);
    });

    it('should throw validation error for invalid data', () => {
      const invalidData = { name: '', age: -5 };
      expect(() => db.validate('menuItem', invalidData)).toThrow(DatabaseError);
    });
  });

  describe('Collection Access', () => {
    it('should access collections with correct type', async () => {
      const collection = db.collection('businesses');
      expect(collection).toBeDefined();
      
      const testBusiness = {
        name: 'Test Business',
        address: '123 Test St',
        location: { lat: 37.7749, lng: -122.4194 },
      };

      const result = await collection.insertOne(testBusiness);
      expect(result.insertedId).toBeDefined();
    });
  });

  describe('Mock Database', () => {
    let mockDb: MockDatabase;

    beforeEach(() => {
      mockDb = new MockDatabase();
    });

    it('should provide mock collection methods', async () => {
      const collection = mockDb.collection('businesses');
      
      const result = await collection.find().toArray();
      expect(result).toEqual([]);

      const insertResult = await collection.insertOne({ name: 'Mock Business' });
      expect(insertResult.insertedId).toBeNull();
    });
  });

  describe('Database Connection', () => {
    it('should return a database instance', async () => {
      const database = await getDatabase();
      expect(database).toBeDefined();
      expect(database).toBeInstanceOf(MongoDatabase);
    });
  });
});
