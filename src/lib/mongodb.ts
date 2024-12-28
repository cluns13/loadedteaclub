import { MongoClient, Db, Collection } from 'mongodb';

// Mock database connection for client-side compatibility
export async function connectToDatabase(): Promise<{ client: any; db: MockDatabase }> {
  // Return a mock database connection object
  return {
    client: {},
    db: new MockDatabase(),
  };
}

export class MockDatabase {
  collection<T>(name: string) {
    return {
      find: () => ({
        toArray: async (): Promise<T[]> => [],
        sort: () => ({ toArray: async (): Promise<T[]> => [] }),
      }),
      findOne: async (): Promise<T | null> => null,
      insertOne: async (doc: T) => ({ insertedId: null }),
      updateOne: async () => ({ modifiedCount: 0 }),
      findOneAndUpdate: async () => ({ value: null }),
    };
  }
}

export async function closeDatabaseConnection() {
  // No-op for mock implementation
  return;
}

// Provide a mock for any other database-related functions
export const ObjectId = {
  createFromHexString: (id: string) => id,
};
