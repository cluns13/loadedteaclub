import { ObjectId } from 'mongodb';

export type LoadedTeaClub = {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  photos?: string[];
  coverPhoto?: string;
  placeId?: string;
  
  // Enhanced location information
  city?: string;
  state?: string;
  zipCode?: string;
  location?: {
    lat: number;
    lng: number;
    type?: 'Point';
  };
  latitude?: number;
  longitude?: number;
  
  // Business metadata
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  types?: string[];
  distance?: number;
  
  // Business-specific details
  menuItems?: MenuItem[];
  featuredItemIds: string[];
  currentPromotion?: BusinessPromotion;
  reviews?: Review[];
  hours?: BusinessHours;
  
  // New business capabilities
  rewardsEnabled?: boolean;
  onlineOrderingAvailable?: boolean;
  
  // Additional metadata
  createdAt?: Date;
  updatedAt?: Date;
  isClaimed?: boolean;
  source?: 'GOOGLE_PLACES' | 'MANUAL' | 'USER_SUBMITTED';
  
  // Verification and status
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

  // Operational details
  images?: string[];
  averageRating?: number;
  totalReviews?: number;

  // Pricing and capacity
  priceRange?: 1 | 2 | 3 | 4; // 1 = cheapest, 4 = most expensive
  capacity?: number;
  
  // Social and marketing
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export type BusinessHours = {
  monday: DailyHours;
  tuesday: DailyHours;
  wednesday: DailyHours;
  thursday: DailyHours;
  friday: DailyHours;
  saturday: DailyHours;
  sunday: DailyHours;
}

export type DailyHours = {
  open: string;
  close: string;
  isOpen: boolean;
}

export type GeoLocation = {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export type Location = {
  city: string;
  state: string;
  count: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  photos?: string[];
  category: 'Loaded Teas' | 'Lit Teas' | 'Meal Replacements';
  
  // Nutritional information
  calories: number;
  caffeine: number;
  protein?: number;
  sugar?: number;
  
  nutrition?: {
    protein?: number;
    sugar?: number;
    calories?: number;
    carbs?: number;
    fat?: number;
  };
  
  // Enhanced menu item properties
  benefits?: string[];
  new?: boolean;
  popular?: boolean;
  ingredients?: string[];
  allergens?: string[];
  
  // Social and marketing metrics
  socialMetrics?: {
    likes?: number;
    shares?: number;
    views?: number;
    favorites?: number;
  };
  
  // Categorization and customization
  subcategory?: string;
  customizationOptions?: {
    type: 'size' | 'flavor' | 'topping';
    choices: string[];
  }[];
}

export type Review = {
  _id: string;
  id: string;
  userId: string;
  businessId: string;
  rating: number;
  text: string;
  
  // Media and visual elements
  photos?: string[];
  images?: string[];
  
  // User information
  userImage?: string;
  userName?: string;
  
  // Social interactions
  likes?: number;
  helpfulCount?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;

  // Additional metadata
  verified?: boolean;
  response?: {
    text: string;
    createdAt: Date;
    businessOwnerId: string;
  };
}

export type User = {
  _id: ObjectId;
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  image: string | undefined;
  reviews: Review[] | undefined;
  savedBusinesses: string[] | undefined;
  
  // Authentication and Authorization
  role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
  isAdmin: boolean;
  isBusinessOwner: boolean;
  globalCustomerId: string | undefined;
  
  emailVerified: boolean | undefined;
  twoFactorEnabled: boolean | undefined;
  
  businessInfo: {
    businessName: string;
    phone: string;
    businessId?: string | undefined;
  } | undefined;
  
  businessName: string | undefined;
  phone: string | undefined;
  
  // Club-related fields
  clubId: string | undefined;
  isClubOwner: boolean | undefined;
  rewardPoints: number | undefined;
  
  // User activity
  lastLogin: Date | undefined;
  registrationSource: ('GOOGLE' | 'FACEBOOK' | 'EMAIL' | 'APPLE') | undefined;
  
  // Payment and Subscription
  stripeCustomerId: string | undefined;
  stripeSubscriptionId: string | undefined;
  
  // Referral system
  referralCode: string | undefined;
  referredBy: string | undefined;
  
  createdAt: Date;
  updatedAt: Date;
};

export type BusinessClaim = {
  _id: ObjectId;
  id: string;
  businessId: ObjectId;
  userId: ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationDocuments: string[];
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: 'PENDING' | 'COMPLETED';
  paymentAmount: number;
  subscriptionEndDate: Date;
  rejectionReason?: string;
  rejectedBy?: ObjectId;
  rejectedAt?: Date;

  // Additional metadata
  reviewNotes?: string;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
}

export type ProcessedMenu = {
  items: MenuItem[];
  confidence: number;
  rawText: string;
  source: 'OCR' | 'MANUAL' | 'API';
}

export type Promotion = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED' | 'BOGO';
  discountValue?: number;
  terms?: string;
  menuItems?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type BusinessPromotion = {
  id: string;
  text: string;
  active: boolean;
  startDate: string;
  endDate: string;
  discountPercentage?: number;
  applicableMenuItems?: string[];
}
