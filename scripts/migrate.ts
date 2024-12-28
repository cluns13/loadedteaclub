import { MongoClient } from 'mongodb';
import { migrateToVersion, Migration } from '../src/lib/db/migrations';
import { migration as initialSchema } from '../src/lib/db/migrations/001_initial_schema';

// Custom Db type to avoid import conflicts
interface CustomDb {
  collection(name: string): any;
  createCollection(name: string): Promise<any>;
  collections(): Promise<any[]>;
}

const migrations: Migration[] = [initialSchema];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = await MongoClient.connect(uri);
  const db = client.db(process.env.MONGODB_DB) as unknown as CustomDb;

  try {
    const targetVersion = parseInt(process.argv[2] || String(migrations.length), 10);
    await migrateToVersion(db as any, targetVersion, migrations);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
