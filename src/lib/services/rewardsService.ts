import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { LoadedTeaNotificationService } from './loadedTeaNotificationService';
import { RewardsTransaction, UserRewardsProfile, RewardsTier } from '@/types/rewards';
import { Order } from './orderService';
import { generateCustomerId, validateCustomerId } from '@/lib/utils/customerIdGenerator';

export interface RewardsConfig {
  clubId: string;
  rewardThreshold: number;  // Number of loaded tea purchases to earn a free tea
  rewardType: 'FREE_LOADED_TEA';
}

export interface CustomerRewardsTracker {
  clubId: string;
  customerId: string;
  purchaseCount: number;
  lastPurchaseDate: Date;
}

export async function createClubRewardsProgram(
  clubId: string, 
  rewardThreshold: number = 10
) {
  const { db } = await connectToDatabase();
  
  const result = await db.collection('rewards_configs').insertOne({
    clubId,
    rewardThreshold,
    rewardType: 'FREE_LOADED_TEA',
    createdAt: new Date()
  });

  return result.insertedId;
}

export async function createCustomerProfile(
  clubId: string
): Promise<string> {
  const { db } = await connectToDatabase();
  
  // Generate unique customer ID
  const customerId = generateCustomerId(clubId);

  // Create customer profile
  await db.collection('customer_profiles').insertOne({
    clubId,
    customerId,
    createdAt: new Date(),
    totalVisits: 0
  });

  return customerId;
}

export async function trackCustomerPurchase(
  clubId: string, 
  customerId: string
) {
  // Validate customer ID first
  if (!validateCustomerId(customerId, clubId)) {
    throw new Error('Invalid Customer ID');
  }

  const { db } = await connectToDatabase();
  
  const tracker = await db.collection('customer_rewards').findOneAndUpdate(
    { clubId, customerId },
    { 
      $inc: { 
        purchaseCount: 1,
        'customerProfile.totalVisits': 1
      },
      $set: { lastPurchaseDate: new Date() }
    },
    { 
      upsert: true, 
      returnDocument: 'after' 
    }
  );

  const rewardsConfig = await db.collection('rewards_configs').findOne({ 
    clubId 
  });

  const isEligibleForReward = tracker.purchaseCount >= rewardsConfig.rewardThreshold;

  return {
    currentPurchaseCount: tracker.purchaseCount,
    rewardThreshold: rewardsConfig.rewardThreshold,
    isEligibleForReward
  };
}

export async function redeemReward(
  clubId: string, 
  customerId: string
) {
  // Validate customer ID first
  if (!validateCustomerId(customerId, clubId)) {
    throw new Error('Invalid Customer ID');
  }

  const { db } = await connectToDatabase();
  
  const rewardsConfig = await db.collection('rewards_configs').findOne({ 
    clubId 
  });

  const customerTracker = await db.collection('customer_rewards').findOne({ 
    clubId, 
    customerId 
  });

  if (!customerTracker || customerTracker.purchaseCount < rewardsConfig.rewardThreshold) {
    throw new Error('Not eligible for reward');
  }

  // Reset purchase count after redemption
  await db.collection('customer_rewards').updateOne(
    { clubId, customerId },
    { 
      $set: { purchaseCount: 0 },
      $push: { 
        rewardHistory: {
          type: 'FREE_LOADED_TEA',
          date: new Date()
        }
      }
    }
  );

  return { 
    rewardRedeemed: true, 
    rewardType: 'FREE_LOADED_TEA' 
  };
}
