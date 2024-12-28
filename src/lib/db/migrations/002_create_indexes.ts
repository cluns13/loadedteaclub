import { Migration } from './index';

export const migration: Migration = {
  version: 2,
  description: 'Create performance indexes',
  up: async (db) => {
    // User collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
    ]);

    // Businesses collection indexes
    await db.collection('businesses').createIndexes([
      { key: { location: '2dsphere' } },
      { key: { name: 'text', address: 'text' } },
      { key: { city: 1, state: 1 } },
      { key: { rating: -1 } },
      { key: { isClaimed: 1 } },
    ]);

    // Menu Items collection indexes
    await db.collection('menuItems').createIndexes([
      { key: { name: 'text', description: 'text' } },
      { key: { category: 1 } },
      { key: { price: 1 } },
    ]);

    // Business Claims collection indexes
    await db.collection('businessClaims').createIndexes([
      { key: { businessId: 1 } },
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ]);

    // Reviews collection indexes
    await db.collection('reviews').createIndexes([
      { key: { businessId: 1 } },
      { key: { userId: 1 } },
      { key: { rating: -1 } },
    ]);

    // Business Analytics collection indexes
    await db.collection('businessAnalytics').createIndexes([
      { key: { businessId: 1 }, unique: true },
      { key: { totalViews: -1 } },
    ]);
  },
  down: async (db) => {
    // Drop indexes
    await db.collection('users').dropIndexes();
    await db.collection('businesses').dropIndexes();
    await db.collection('menuItems').dropIndexes();
    await db.collection('businessClaims').dropIndexes();
    await db.collection('reviews').dropIndexes();
    await db.collection('businessAnalytics').dropIndexes();
  },
};
