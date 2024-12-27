export interface RewardsTransaction {
  id: string;
  userId: string;
  clubId: string;
  orderId?: string;
  type: 'EARN' | 'REDEEM' | 'BONUS';
  points: number;
  description: string;
  createdAt: Date;
}

export interface UserRewardsProfile {
  userId: string;
  clubId: string;
  totalPointsEarned: number;
  currentPoints: number;
  tierLevel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  lastEarnedPoints: Date;
  freeDrinkEligible: boolean;
  consecutivePurchases: number;
}

export interface RewardsTier {
  name: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  pointsThreshold: number;
  benefits: string[];
  pointMultiplier: number;
}
