import { MongoClient, Db, Collection } from 'mongodb';

// Ensure the connection is only created once
const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

declare global {
  type MongoClientType = {
    client: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
}

let cached: MongoClientType = global.mongo;

if (!cached) {
  cached = global.mongo = { client: null, promise: null };
}

if (!cached.promise) {
  const options = {};
  const client = new MongoClient(MONGODB_URI, options);
  cached.promise = client.connect();
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const mongoClient = await cached.promise;
  const db = mongoClient.db(MONGODB_DB);
  return { client: mongoClient, db };
}

export async function closeDatabaseConnection() {
  const mongoClient = await cached.promise;
  await mongoClient.close();
}

export const ObjectId = {
  createFromHexString: (id: string) => id,
};

// Export the client promise as the default export
export default cached.promise;
