import { Migration } from './index';

export const migration: Migration = {
  version: 1,
  description: 'Initial schema setup',
  up: async (db) => {
    // Create collections with validators
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'name', 'hashedPassword', 'role'],
          properties: {
            email: { bsonType: 'string' },
            name: { bsonType: 'string' },
            hashedPassword: { bsonType: 'string' },
            role: { enum: ['USER', 'BUSINESS_OWNER', 'ADMIN'] },
          },
        },
      },
    });

    await db.createCollection('businesses', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'address'],
          properties: {
            name: { bsonType: 'string' },
            address: { bsonType: 'string' },
            location: {
              bsonType: 'object',
              properties: {
                lat: { bsonType: 'double' },
                lng: { bsonType: 'double' },
              },
            },
          },
        },
      },
    });

    await db.createCollection('menuItems', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            name: { bsonType: 'string' },
            price: { bsonType: 'double' },
            category: { enum: ['energy', 'beauty', 'wellness', 'seasonal'] },
          },
        },
      },
    });

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('businesses').createIndex({ location: '2dsphere' });
    await db.collection('businesses').createIndex({ name: 'text', address: 'text' });
    await db.collection('menuItems').createIndex({ name: 'text', description: 'text' });
  },
  down: async (db) => {
    await db.collection('users').drop();
    await db.collection('businesses').drop();
    await db.collection('menuItems').drop();
  },
};
