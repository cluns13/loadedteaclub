import { ObjectId } from 'mongodb';

// Type for documents with an _id
export type WithId<T> = T & {
  _id: ObjectId;
}

// Base type for all documents
type BaseDocument = {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// User related types
export type User = BaseDocument & {
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
export type LoadedTeaClub = BaseDocument & {
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

export type BusinessHours = {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

export type MenuItem = BaseDocument & {
  name: string;
  description: string;
  price: number;
  photos?: string[];
  category: 'energy' | 'beauty' | 'wellness' | 'seasonal';
  benefits?: string[];
  calories: number;
  caffeine: number;
}

export type Review = BaseDocument & {
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

export type BusinessPromotion = BaseDocument & {
  text: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

// Analytics related types
export type BusinessAnalytics = BaseDocument & {
  businessId: ObjectId;
  totalViews: number;
  totalClicks: number;
  avgDuration: number;
}

export type BusinessClaim = BaseDocument & {
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

// Database type
export type DatabaseCollections = {
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
