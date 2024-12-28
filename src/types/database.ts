import { ObjectId } from 'mongodb';

// Base interface for all documents
interface BaseDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// User related types
export interface User extends BaseDocument {
  email: string;
  name: string;
  hashedPassword: string;
  image?: string;
  role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
  businessInfo?: {
    businessName: string;
    phone: string;
  };
}

// Business related types
export interface LoadedTeaClub extends BaseDocument {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  photos?: string[];
  placeId?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  types?: string[];
  distance?: number;
  menuItems?: MenuItem[];
  featuredItemIds: string[];
  currentPromotion?: BusinessPromotion;
  reviews?: Review[];
  hours?: BusinessHours;
  isClaimed?: boolean;
  source?: 'GOOGLE_PLACES' | 'MANUAL' | 'USER_SUBMITTED';
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
}

export interface BusinessHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export interface MenuItem extends BaseDocument {
  name: string;
  description: string;
  price: number;
  photos?: string[];
  category: 'energy' | 'beauty' | 'wellness' | 'seasonal';
  benefits?: string[];
  calories: number;
  caffeine: number;
}

export interface Review extends BaseDocument {
  userId: ObjectId;
  businessId: ObjectId;
  rating: number;
  text: string;
  photos?: string[];
  response?: {
    content: string;
    createdAt: Date;
    updatedAt?: Date;
  };
}

export interface BusinessPromotion extends BaseDocument {
  text: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

// Analytics related types
export interface BusinessAnalytics extends BaseDocument {
  businessId: ObjectId;
  totalViews: number;
  totalClicks: number;
  avgDuration: number;
}

export interface BusinessClaim extends BaseDocument {
  businessId: ObjectId;
  userId: ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationDocuments: string[];
  paymentStatus: 'PENDING' | 'COMPLETED';
  paymentAmount: number;
  subscriptionEndDate: Date;
  rejectionReason?: string;
  rejectedBy?: ObjectId;
  rejectedAt?: Date;
}

// Database interface
export interface DatabaseCollections {
  users: User;
  businesses: LoadedTeaClub;
  menuItems: MenuItem;
  reviews: Review;
  promotions: BusinessPromotion;
  businessAnalytics: BusinessAnalytics;
  businessClaims: BusinessClaim;
}

// Type-safe collection names
export type CollectionName = keyof DatabaseCollections;

// Type-safe collection access
export type CollectionType<T extends CollectionName> = DatabaseCollections[T];
