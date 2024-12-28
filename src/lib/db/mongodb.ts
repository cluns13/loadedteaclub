import { MongoClient, MongoClientOptions, Db } from 'mongodb';

// Validate MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ db: Db }> {
  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB || 'loaded-tea-club');
    
    console.log('✅ Successfully connected to MongoDB');
    return { db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB', error);
    throw new Error('Database connection failed');
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
  }
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getMongoDb() {
  return getDb();
}

export { clientPromise };
