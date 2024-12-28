import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { LoadedTeaNotificationService } from './loadedTeaNotificationService';
import { UserRewardsProfile, RewardsTransaction, RewardsTier } from '@/types/rewards';
import { Order } from './orderService';
import { generateCustomerId, validateCustomerId } from '@/lib/utils/customerIdGenerator';

export type RewardType = 'purchase' | 'referral' | 'bonus';

export type RewardsConfig = {
  clubId: string;
  rewardThreshold: number;  // Number of loaded tea purchases to earn a free tea
  rewardType: 'FREE_LOADED_TEA';
};

export type CustomerRewardsTracker = {
  clubId: string;
  customerId: string;
  purchaseCount: number;
  lastPurchaseDate: Date;
};

export class RewardsService {
  private mockProfiles: UserRewardsProfile[] = [];
  private mockTransactions: RewardsTransaction[] = [];

  async createUserRewardsProfile(userId: string, clubId: string): Promise<UserRewardsProfile> {
    const profile: UserRewardsProfile = {
      userId,
      clubId,
      totalPointsEarned: 0,
      currentPoints: 0,
      tierLevel: 'BRONZE',
      lastEarnedPoints: new Date(),
      freeDrinkEligible: false,
      consecutivePurchases: 0
    };
    return profile;
  }

  async getUserRewardsProfile(
    userId: string, 
    clubId: string
  ): Promise<UserRewardsProfile | null> {
    const profile = this.mockProfiles.find(
      p => p.userId === userId && p.clubId === clubId
    );

    if (!profile) {
      // Create new profile if it doesn't exist
      const newProfile: UserRewardsProfile = await this.createUserRewardsProfile(userId, clubId);
      this.mockProfiles.push(newProfile);
      return newProfile;
    }

    return profile;
  }

  async trackCustomerPurchase(
    userId: string, 
    clubId: string, 
    purchaseAmount: number
  ): Promise<UserRewardsProfile | null> {
    const profile = await this.getUserRewardsProfile(userId, clubId);
    if (!profile) return null;

    // Calculate reward points (e.g., 1 point per dollar)
    const earnedPoints = Math.floor(purchaseAmount);
    profile.currentPoints += earnedPoints;
    profile.totalPointsEarned += earnedPoints;
    profile.consecutivePurchases += 1;
    profile.lastEarnedPoints = new Date();

    // Check if eligible for free drink
    if (profile.currentPoints >= 100) {
      profile.freeDrinkEligible = true;
    }

    // Update tier level based on total points
    if (profile.totalPointsEarned >= 1000) {
      profile.tierLevel = 'PLATINUM';
    } else if (profile.totalPointsEarned >= 500) {
      profile.tierLevel = 'GOLD';
    } else if (profile.totalPointsEarned >= 200) {
      profile.tierLevel = 'SILVER';
    }

    // Record transaction
    await this.recordRewardTransaction({
      userId,
      clubId,
      type: 'EARN',
      points: earnedPoints,
      description: `Purchase reward: $${purchaseAmount}`
    });

    return profile;
  }

  async recordRewardTransaction(
    transaction: Partial<RewardsTransaction>
  ): Promise<RewardsTransaction> {
    const newTransaction: RewardsTransaction = {
      id: `txn-${Date.now()}`,
      userId: transaction.userId || '',
      clubId: transaction.clubId || '',
      type: transaction.type || 'EARN',
      points: transaction.points || 0,
      description: transaction.description || 'Reward transaction',
      createdAt: new Date()
    };

    this.mockTransactions.push(newTransaction);
    return newTransaction;
  }

  async redeemReward(
    userId: string, 
    clubId: string, 
    pointsToRedeem: number
  ): Promise<UserRewardsProfile | null> {
    const profile = await this.getUserRewardsProfile(userId, clubId);
    if (!profile) return null;

    if (profile.currentPoints < pointsToRedeem) {
      throw new Error('Insufficient reward points');
    }

    profile.currentPoints -= pointsToRedeem;
    profile.freeDrinkEligible = profile.currentPoints >= 100;

    await this.recordRewardTransaction({
      userId,
      clubId,
      type: 'REDEEM',
      points: -pointsToRedeem,
      description: 'Reward redemption'
    });

    return profile;
  }

  async getTransactionHistory(
    userId: string, 
    clubId: string
  ): Promise<RewardsTransaction[]> {
    return this.mockTransactions.filter(
      t => t.userId === userId && t.clubId === clubId
    );
  }

  async getRewardsHistory(userId: string, clubId: string): Promise<RewardsTransaction[]> {
    return [];
  }

  async redeemFreeDrink(
    userId: string, 
    clubId: string, 
    location?: { latitude: number; longitude: number }
  ): Promise<UserRewardsProfile> {
    // Implement free drink redemption logic
    return {} as UserRewardsProfile;
  }

  async getRewardsConfig(clubId: string): Promise<RewardsConfig | null> {
    return null;
  }
}

export class LoadedTeaRewardsService {
  private notificationService: LoadedTeaNotificationService;

  constructor() {
    this.notificationService = new LoadedTeaNotificationService();
  }

  async getRewardsHistory(userId: string, clubId: string): Promise<RewardsTransaction[]> {
    const rewardsService = new RewardsService();
    return rewardsService.getRewardsHistory(userId, clubId);
  }
}

export async function createClubRewardsProgram(
  clubId: string, 
  rewardThreshold: number = 10
) {
  return null;
}

export async function createCustomerProfile(
  clubId: string
): Promise<string> {
  // Generate unique customer ID
  const customerId = generateCustomerId(clubId);

  return customerId;
}

export async function trackCustomerPurchase(
  clubId: string, 
  customerId: string
): Promise<CustomerRewardsTracker | null> {
  const rewardsService = new RewardsService();
  try {
    // Find or create customer rewards tracker
    const tracker: CustomerRewardsTracker = {
      clubId,
      customerId,
      purchaseCount: 1,
      lastPurchaseDate: new Date()
    };

    // Optional: Trigger rewards notification if threshold is met
    const rewardsConfig = await rewardsService.getRewardsConfig(clubId);
    if (rewardsConfig && tracker.purchaseCount >= rewardsConfig.rewardThreshold) {
      try {
        await new LoadedTeaNotificationService().sendNotification(
          customerId, 
          {
            type: 'REWARDS_EARNED',
            clubId, 
            message: `You've earned a free drink after ${tracker.purchaseCount} purchases!`
          }
        );
      } catch (notificationError) {
        console.error('Failed to send rewards notification:', notificationError);
      }
    }

    return tracker;
  } catch (error) {
    console.error('Error tracking customer purchase:', error);
    return null;
  }
}

export async function redeemReward(
  clubId: string, 
  customerId: string
): Promise<UserRewardsProfile | null> {
  const rewardsService = new RewardsService();
  try {
    // Find the customer's rewards tracker
    const tracker: CustomerRewardsTracker = {
      clubId,
      customerId,
      purchaseCount: 1,
      lastPurchaseDate: new Date()
    };

    // Find the rewards config for the club
    const rewardsConfig = await rewardsService.getRewardsConfig(clubId);

    // Validate reward redemption
    if (!tracker || !rewardsConfig || tracker.purchaseCount < rewardsConfig.rewardThreshold) {
      return null;
    }

    // Update user profile with reward history
    const userProfile: UserRewardsProfile = {
      userId: customerId,
      clubId,
      totalPointsEarned: 0,
      currentPoints: 0,
      tierLevel: 'BRONZE',
      lastEarnedPoints: new Date(),
      freeDrinkEligible: false,
      consecutivePurchases: 0
    };

    // Reset purchase count
    tracker.purchaseCount = 0;

    // Return updated user profile
    return userProfile;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return null;
  }
}

export function createBusinessRewardsProgram(clubId: string, rewardThreshold: number = 10) {
  return createClubRewardsProgram(clubId, rewardThreshold);
}
