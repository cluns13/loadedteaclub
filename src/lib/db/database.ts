import { MongoClient, Collection, Db } from 'mongodb';
import { CollectionName, CollectionType } from '@/types/database';
import { schemas } from './schemas';
import { z } from 'zod';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }

  static fromError(error: unknown, code = 'UNKNOWN_ERROR'): DatabaseError {
    if (error instanceof DatabaseError) return error;
    
    if (error instanceof Error) {
      return new DatabaseError(
        error.message, 
        code, 
        { 
          originalError: error, 
          stack: error.stack 
        }
      );
    }

    return new DatabaseError(
      'An unknown error occurred', 
      code, 
      { originalError: error }
    );
  }
}

export interface Database {
  collection<T extends CollectionName>(name: T): Collection<CollectionType<T>>;
  validate<T extends keyof typeof schemas>(
    name: T,
    data: unknown
  ): z.infer<typeof schemas[T]>;
}

// Real MongoDB implementation
export class MongoDatabase implements Database {
  constructor(private db: Db) {}

  collection<T extends CollectionName>(_name: T): Collection<CollectionType<T>> {
    return this.db.collection(_name);
  }

  validate<T extends keyof typeof schemas>(name: T, data: unknown) {
    try {
      return schemas[name].parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DatabaseError(
          'Validation failed',
          'VALIDATION_ERROR',
          error.errors
        );
      }
      throw DatabaseError.fromError(error, 'VALIDATION_ERROR');
    }
  }
}

// Mock implementation for client-side and testing
export class MockDatabase implements Database {
  collection<T extends CollectionName>(_name: T): Collection<CollectionType<T>> {
    return {
      find: () => ({
        toArray: async () => [],
        sort: () => ({ toArray: async () => [] }),
      }),
      findOne: async () => null,
      insertOne: async () => ({ insertedId: null }),
      updateOne: async () => ({ modifiedCount: 0 }),
      findOneAndUpdate: async () => ({ value: null }),
    } as unknown as Collection<CollectionType<T>>;
  }

  validate<T extends keyof typeof schemas>(name: T, data: unknown) {
    try {
      return schemas[name].parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DatabaseError(
          'Validation failed',
          'VALIDATION_ERROR',
          error.errors
        );
      }
      throw DatabaseError.fromError(error, 'VALIDATION_ERROR');
    }
  }
}

// Connection management
let cachedDb: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (cachedDb) {
    return cachedDb;
  }

  const mongoUri = process.env.MONGODB_URI;
  const mongoDb = process.env.MONGODB_DB;

  if (!mongoUri || !mongoDb) {
    throw new DatabaseError(
      'Missing MongoDB configuration',
      'CONFIG_ERROR',
      { 
        mongoUriPresent: !!mongoUri, 
        mongoDbPresent: !!mongoDb 
      }
    );
  }

  if (process.env.NODE_ENV === 'development' || process.env.MOCK_DB === 'true') {
    cachedDb = new MockDatabase();
    return cachedDb;
  }

  try {
    const client = await MongoClient.connect(mongoUri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 20000,
    });

    const db = client.db(mongoDb);
    cachedDb = new MongoDatabase(db);
    return cachedDb;
  } catch (error) {
    throw DatabaseError.fromError(
      error, 
      'CONNECTION_ERROR'
    );
  }
}

export async function closeDatabase() {
  if (cachedDb instanceof MongoDatabase) {
    await (cachedDb as any).db.client.close();
  }
  cachedDb = null;
}
