export interface LoadedTeaClub {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  photos?: string[];
  placeId?: string;
  
  // Enhanced location information
  city?: string;
  state?: string;
  zipCode?: string;
  location?: {
    lat: number;
    lng: number;
  };
  
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
  
  // Additional metadata
  createdAt?: Date;
  updatedAt?: Date;
  isClaimed?: boolean;
  source?: 'GOOGLE_PLACES' | 'MANUAL' | 'USER_SUBMITTED';
  
  // Verification and status
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

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Location {
  city: string;
  state: string;
  count: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  photos?: string[];
  category: 'energy' | 'beauty' | 'wellness' | 'seasonal';
  benefits?: string[];
  calories: number;
  caffeine: number;
}

// Server-side types below
import { ObjectId } from 'mongodb';

export interface Review {
  id: string;
  userId: string;
  businessId: string;
  rating: number;
  text: string;
  photos?: string[];
  createdAt: Date;
}

export interface User {
  _id: ObjectId;
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  image?: string;
  reviews?: Review[];
  savedBusinesses?: string[];
  role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
  businessInfo?: {
    businessName: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessClaim {
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
}

export interface ProcessedMenu {
  items: MenuItem[];
  confidence: number;
  rawText: string;
  imageUrl?: string;
  needsReview: boolean;
}

export interface Promotion {
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
  menuItems?: string[]; // IDs of related menu items
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessPromotion {
  id: string;
  text: string;
  active: boolean;
  startDate: string;
  endDate: string;
}
