import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { generateCustomerId } from '@/lib/utils/customerIdGenerator';
import { v4 as uuidv4 } from 'uuid';

export interface CustomerMembership {
  clubId: string;
  localCustomerId: string;
  purchaseCount: number;
  lastVisit: Date;
  rewardsEligible: boolean;
}

export interface CustomerProfile {
  globalCustomerId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  clubMemberships: CustomerMembership[];
  createdAt: Date;
}

export class CustomerProfileService {
  // Create a new global customer profile
  static async createProfile(
    profileData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      initialClubId?: string;
    }
  ): Promise<CustomerProfile> {
    const { db } = await connectToDatabase();

    // Generate a global unique customer ID
    const globalCustomerId = uuidv4();

    const newProfile: CustomerProfile = {
      globalCustomerId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      email: profileData.email,
      clubMemberships: profileData.initialClubId 
        ? [{
            clubId: profileData.initialClubId,
            localCustomerId: generateCustomerId(profileData.initialClubId),
            purchaseCount: 0,
            lastVisit: new Date(),
            rewardsEligible: false
          }]
        : [],
      createdAt: new Date()
    };

    await db.collection('customer_profiles').insertOne(newProfile);

    return newProfile;
  }

  // Join a new club
  static async joinClub(
    globalCustomerId: string, 
    clubId: string
  ): Promise<CustomerMembership> {
    const { db } = await connectToDatabase();

    // Check if already a member of this club
    const existingProfile = await db.collection('customer_profiles').findOne({
      globalCustomerId,
      'clubMemberships.clubId': clubId
    });

    if (existingProfile) {
      throw new Error('Customer is already a member of this club');
    }

    // Generate club-specific local customer ID
    const localCustomerId = generateCustomerId(clubId);

    const membership: CustomerMembership = {
      clubId,
      localCustomerId,
      purchaseCount: 0,
      lastVisit: new Date(),
      rewardsEligible: false
    };

    await db.collection('customer_profiles').updateOne(
      { globalCustomerId },
      { 
        $push: { clubMemberships: membership }
      }
    );

    return membership;
  }

  // Track purchase for a specific club
  static async trackPurchase(
    globalCustomerId: string, 
    clubId: string,
    rewardThreshold: number = 10
  ): Promise<CustomerMembership> {
    const { db } = await connectToDatabase();

    const result = await db.collection('customer_profiles').findOneAndUpdate(
      { 
        globalCustomerId, 
        'clubMemberships.clubId': clubId 
      },
      { 
        $inc: { 
          'clubMemberships.$.purchaseCount': 1 
        },
        $set: { 
          'clubMemberships.$.lastVisit': new Date(),
          'clubMemberships.$.rewardsEligible': 
            (this.getPurchaseCount(globalCustomerId, clubId) + 1) >= rewardThreshold
        }
      },
      { 
        returnDocument: 'after' 
      }
    );

    // Find the updated membership
    const updatedMembership = result.clubMemberships.find(
      (membership: CustomerMembership) => membership.clubId === clubId
    );

    return updatedMembership;
  }

  // Get customer profile
  static async getProfile(
    globalCustomerId: string
  ): Promise<CustomerProfile | null> {
    const { db } = await connectToDatabase();

    return await db.collection('customer_profiles').findOne({ 
      globalCustomerId 
    });
  }

  // Get purchase count for a specific club
  static async getPurchaseCount(
    globalCustomerId: string, 
    clubId: string
  ): Promise<number> {
    const profile = await this.getProfile(globalCustomerId);
    
    const clubMembership = profile?.clubMemberships.find(
      membership => membership.clubId === clubId
    );

    return clubMembership?.purchaseCount || 0;
  }

  // Redeem reward for a specific club
  static async redeemReward(
    globalCustomerId: string, 
    clubId: string
  ): Promise<boolean> {
    const { db } = await connectToDatabase();

    const result = await db.collection('customer_profiles').findOneAndUpdate(
      { 
        globalCustomerId, 
        'clubMemberships.clubId': clubId,
        'clubMemberships.rewardsEligible': true
      },
      { 
        $set: { 
          'clubMemberships.$.purchaseCount': 0,
          'clubMemberships.$.rewardsEligible': false
        },
        $push: {
          'clubMemberships.$.rewardHistory': {
            type: 'FREE_LOADED_TEA',
            date: new Date()
          }
        }
      }
    );

    return !!result;
  }
}
