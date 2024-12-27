import { MongoClient, ObjectId } from 'mongodb';
import { LocationDetails } from './locationInterfaces';
import { NutritionClub } from '@/types/nutritionClub';

export class NutritionClubService {
  private client: MongoClient;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not configured');
    }
    this.client = new MongoClient(uri);
  }

  async searchByLocation(location: LocationDetails): Promise<NutritionClub[]> {
    try {
      await this.client.connect();
      const db = this.client.db('tea_finder');
      const collection = db.collection<NutritionClub>('nutrition_clubs');

      return collection.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            $maxDistance: 50000 // 50 km radius
          }
        }
      }).toArray();
    } catch (error) {
      console.error('Error searching nutrition clubs:', error);
      return [];
    } finally {
      await this.client.close();
    }
  }

  async getClubById(clubId: string): Promise<NutritionClub | null> {
    try {
      await this.client.connect();
      const db = this.client.db('tea_finder');
      const collection = db.collection<NutritionClub>('nutrition_clubs');

      return collection.findOne({ _id: new ObjectId(clubId) });
    } catch (error) {
      console.error('Error getting nutrition club by id:', error);
      return null;
    } finally {
      await this.client.close();
    }
  }

  async updateClubRewardsSettings(
    clubId: string, 
    settings: {
      rewardsEnabled: boolean;
      onlineOrderingAvailable: boolean;
      posIntegration?: {
        provider: 'SQUARE' | 'OTHER';
        merchantId?: string;
      }
    }
  ): Promise<NutritionClub | null> {
    try {
      await this.client.connect();
      const db = this.client.db('tea_finder');
      const collection = db.collection<NutritionClub>('nutrition_clubs');

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(clubId) },
        { $set: settings },
        { returnDocument: 'after' }
      );

      return result.value;
    } catch (error) {
      console.error('Error updating nutrition club rewards settings:', error);
      return null;
    } finally {
      await this.client.close();
    }
  }

  async getUserClubs(userId: string): Promise<NutritionClub[]> {
    try {
      await this.client.connect();
      const db = this.client.db('tea_finder');
      const collection = db.collection<NutritionClub>('nutrition_clubs');

      // Find clubs where user has made purchases or checked in
      const userPurchaseCollection = db.collection('user_purchases');
      const userPurchases = await userPurchaseCollection
        .find({ userId })
        .toArray();

      const clubIds = userPurchases.map(purchase => new ObjectId(purchase.clubId));

      return collection.find({
        _id: { $in: clubIds }
      }).toArray();
    } catch (error) {
      console.error('Error getting user clubs:', error);
      return [];
    } finally {
      await this.client.close();
    }
  }

  async getClubsWithOnlineOrdering(): Promise<NutritionClub[]> {
    try {
      await this.client.connect();
      const db = this.client.db('tea_finder');
      const collection = db.collection<NutritionClub>('nutrition_clubs');

      return collection.find({
        onlineOrderingAvailable: true
      }).toArray();
    } catch (error) {
      console.error('Error getting clubs with online ordering:', error);
      return [];
    } finally {
      await this.client.close();
    }
  }

  async getClubMenuItems(clubId: string): Promise<any[]> {
    try {
      await this.client.connect();
      const db = this.client.db('tea_finder');
      const collection = db.collection<NutritionClub>('nutrition_clubs');

      const club = await collection.findOne(
        { _id: new ObjectId(clubId) },
        { projection: { menuItems: 1 } }
      );

      return club?.menuItems || [];
    } catch (error) {
      console.error('Error getting club menu items:', error);
      return [];
    } finally {
      await this.client.close();
    }
  }
}
