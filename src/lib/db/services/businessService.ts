import { ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import type { LoadedTeaClub, Location } from '@/types/models';

export class BusinessService {
  private static readonly COLLECTION = 'loaded_tea_clubs';

  static async createIndexes() {
    const db = await getDb();
    const collection = db.collection(this.COLLECTION);

    // Create geospatial index for location queries
    await collection.createIndex({ location: '2dsphere' });

    // Create text index for search
    await collection.createIndex({ 
      name: 'text', 
      description: 'text',
      'menu.name': 'text',
      'menu.description': 'text'
    });

    // Create indexes for common queries
    await collection.createIndex({ city: 1, state: 1 });
    await collection.createIndex({ 'menu.category': 1 });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ verified: 1 });
  }

  static async getAllLocations(): Promise<Location[]> {
    const db = await getDb();
    const locations = await db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .aggregate([
        {
          $group: {
            _id: { city: '$city', state: '$state' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            city: '$_id.city',
            state: '$_id.state',
            count: 1
          }
        }
      ])
      .toArray();

    return locations.map(loc => ({
      city: loc.city,
      state: loc.state,
      count: loc.count
    }));
  }

  static async findByLocation(city: string, state: string, limit = 20): Promise<LoadedTeaClub[]> {
    const db = await getDb();
    return db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .find({
        city: { $regex: new RegExp(city, 'i') },
        state: { $regex: new RegExp(state, 'i') },
        'menu': {
          $elemMatch: {
            category: { $in: ['LOADED_TEA', 'LIT_TEA'] }
          }
        }
      })
      .limit(limit)
      .toArray();
  }

  static async findNearby(longitude: number, latitude: number, radiusInMiles = 25): Promise<LoadedTeaClub[]> {
    const db = await getDb();
    return db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMiles * 1609.34 // Convert miles to meters
          }
        },
        'menu': {
          $elemMatch: {
            category: { $in: ['LOADED_TEA', 'LIT_TEA'] }
          }
        }
      })
      .limit(20)
      .toArray();
  }

  static async findById(id: string): Promise<LoadedTeaClub | null> {
    const db = await getDb();
    return db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .findOne({ id });
  }

  static async findByIds(ids: string[]): Promise<LoadedTeaClub[]> {
    const db = await getDb();
    return db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .find({ id: { $in: ids } })
      .toArray();
  }

  static async create(business: Omit<LoadedTeaClub, '_id'>): Promise<LoadedTeaClub> {
    const db = await getDb();
    const result = await db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .insertOne({ ...business, _id: new ObjectId() } as LoadedTeaClub);
    
    return { ...business, _id: result.insertedId } as LoadedTeaClub;
  }

  static async update(id: string, updates: Partial<LoadedTeaClub>): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .updateOne(
        { id },
        { $set: updates }
      );
    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async search(query: string, limit = 20): Promise<LoadedTeaClub[]> {
    const db = await getDb();
    return db
      .collection<LoadedTeaClub>(this.COLLECTION)
      .find({
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { description: { $regex: new RegExp(query, 'i') } }
        ]
      })
      .limit(limit)
      .toArray();
  }
}
