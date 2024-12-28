import { MongoClient, Document } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

class DatabaseBackup {
  private uri: string;
  private dbName: string;
  private backupDir: string;

  constructor() {
    this.uri = process.env.MONGODB_URI || '';
    this.dbName = process.env.MONGODB_DB || 'test';
    this.backupDir = path.join(process.cwd(), 'backups');
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private getBackupFilename(): string {
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')     // Replace colons with hyphens
      .split('.')[0];         // Remove milliseconds
    return `backup-${this.dbName}-${timestamp}.gz`;
  }

  private getLatestBackupFile(): string {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.gz'))
      .sort()
      .reverse();
    
    if (!files.length) {
      throw new Error('No backup files found');
    }
    
    return files[0];
  }

  async backup(): Promise<string> {
    this.ensureBackupDirectory();

    const client = await MongoClient.connect(this.uri);
    const db = client.db(this.dbName);

    const backupFilename = this.getBackupFilename();
    const backupPath = path.join(this.backupDir, backupFilename);

    const collections = await db.collections();

    const backupData: Record<string, Document[]> = {};
    for (const collection of collections) {
      const docs = await collection.find().toArray();
      backupData[collection.collectionName] = docs;
    }

    const backupStream = fs.createWriteStream(backupPath);
    const gzipStream = zlib.createGzip();

    return new Promise((resolve, reject) => {
      gzipStream.pipe(backupStream);
      
      gzipStream.write(JSON.stringify(backupData));
      gzipStream.end();

      backupStream.on('finish', () => {
        client.close();
        console.log(`Backup completed: ${backupFilename}`);
        resolve(backupPath);
      });

      backupStream.on('error', (error) => {
        client.close();
        reject(error);
      });
    });
  }

  async restore(backupFile?: string): Promise<void> {
    const client = new MongoClient(this.uri);
    await client.connect();

    const db = client.db(this.dbName);

    // Use the provided backup file or find the latest
    const fileToRestore = backupFile || this.getLatestBackupFile();
    const backupPath = path.join(this.backupDir, fileToRestore);

    // Read and parse backup data
    const backupData = JSON.parse(
      zlib.gunzipSync(fs.readFileSync(backupPath)).toString('utf-8')
    ) as Record<string, Document[]>;

    for (const [collectionName, documents] of Object.entries(backupData)) {
      const collection = db.collection(collectionName);
      
      // Drop existing collection
      await collection.drop();
      
      // Recreate collection and insert documents
      await db.createCollection(collectionName);
      if (documents && documents.length > 0) {
        await collection.insertMany(documents);
      }
    }

    await client.close();
    console.log(`Restored backup from ${fileToRestore}`);
  }
}

async function main() {
  const backup = new DatabaseBackup();
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'backup':
        await backup.backup();
        break;
      case 'restore':
        const backupFile = process.argv[3];
        await backup.restore(backupFile);
        break;
      default:
        console.error('Usage: npm run db:backup [backup|restore] [backupfile]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    process.exit(1);
  }
}

main();
