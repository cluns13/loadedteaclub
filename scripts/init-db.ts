import { BusinessService } from '../src/lib/db/services/businessService';

async function initDb() {
  try {
    console.log('Creating database indexes...');
    await BusinessService.createIndexes();
    console.log('Database indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating database indexes:', error);
    process.exit(1);
  }
}

initDb();
