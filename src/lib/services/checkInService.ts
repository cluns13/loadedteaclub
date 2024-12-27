import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/db/mongodb';

interface CheckIn {
  userId: ObjectId;
  nutritionClubId: ObjectId;
  purchaseAmount: number;
  transactionId: string;
  checkedInAt: Date;
  isValid: boolean;
}

export class CheckInService {
  private static readonly COLLECTION = 'check_ins';
  private static readonly MINIMUM_PURCHASE_AMOUNT = 5; // $5 minimum
  private static readonly CHECK_IN_COOLDOWN_HOURS = 24;

  static async validateAndRecordCheckIn(
    userId: string, 
    nutritionClubId: string, 
    purchaseAmount: number,
    transactionId: string
  ): Promise<boolean> {
    const { db } = await connectToDatabase();
    const collection = db.collection<CheckIn>(this.COLLECTION);

    // Check recent check-ins
    const recentCheckIn = await collection.findOne({
      userId: new ObjectId(userId),
      checkedInAt: { 
        $gte: new Date(Date.now() - this.CHECK_IN_COOLDOWN_HOURS * 60 * 60 * 1000) 
      }
    });

    if (recentCheckIn) {
      throw new Error('You can only check in once every 24 hours');
    }

    // Validate purchase amount
    if (purchaseAmount < this.MINIMUM_PURCHASE_AMOUNT) {
      throw new Error(`Minimum purchase of $${this.MINIMUM_PURCHASE_AMOUNT} required`);
    }

    // Record check-in
    const checkIn: CheckIn = {
      userId: new ObjectId(userId),
      nutritionClubId: new ObjectId(nutritionClubId),
      purchaseAmount,
      transactionId,
      checkedInAt: new Date(),
      isValid: true
    };

    await collection.insertOne(checkIn);

    return true;
  }

  static async getValidCheckInCount(userId: string): Promise<number> {
    const { db } = await connectToDatabase();
    const collection = db.collection<CheckIn>(this.COLLECTION);

    return collection.countDocuments({
      userId: new ObjectId(userId),
      isValid: true,
      checkedInAt: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });
  }
}
