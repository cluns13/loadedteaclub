import { Db } from 'mongodb';

export interface Migration {
  version: number;
  description: string;
  up: (db: Db) => Promise<void>;
  down: (db: Db) => Promise<void>;
}

// Track migration state
export interface MigrationState {
  version: number;
  appliedAt: Date;
}

export async function getCurrentVersion(db: Db): Promise<number> {
  const collection = db.collection<MigrationState>('migrations');
  const latest = await collection
    .find()
    .sort({ version: -1 })
    .limit(1)
    .toArray();
  return latest[0]?.version ?? 0;
}

export async function migrateToVersion(
  db: Db,
  targetVersion: number,
  migrations: Migration[]
): Promise<void> {
  const collection = db.collection<MigrationState>('migrations');
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion > currentVersion) {
    // Migrate up
    for (const migration of migrations) {
      if (migration.version > currentVersion && migration.version <= targetVersion) {
        console.log(`Applying migration ${migration.version}: ${migration.description}`);
        await migration.up(db);
        await collection.insertOne({
          version: migration.version,
          appliedAt: new Date(),
        });
      }
    }
  } else if (targetVersion < currentVersion) {
    // Migrate down
    for (const migration of [...migrations].reverse()) {
      if (migration.version <= currentVersion && migration.version > targetVersion) {
        console.log(`Rolling back migration ${migration.version}: ${migration.description}`);
        await migration.down(db);
        await collection.deleteOne({ version: migration.version });
      }
    }
  }
}
