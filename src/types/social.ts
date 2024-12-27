export type SocialMetrics = {
  favorites: number;
  shares: number;
  checkIns: number;
  trending?: boolean;
};

export type UserInteraction = {
  userId: string;
  type: 'FAVORITE' | 'SHARE' | 'CHECK_IN' | 'PHOTO' | 'REVIEW';
  timestamp: Date;
  content?: {
    photo?: string;
    caption?: string;
    rating?: number;
    review?: string;
  };
};

export type RewardPoints = {
  checkIn: number;
  share: number;
  review: number;
  photo: number;
};

export type Reward = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  pointsCost: number;
  validUntil?: Date;
  termsAndConditions?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
};

export type UserRewards = {
  userId: string;
  businessId: string;
  points: number;
  history: {
    action: string;
    points: number;
    timestamp: Date;
    rewardId?: string;
  }[];
};
