import { MenuItem } from './menu';

export interface NutritionClub {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email?: string;
  
  // Business capabilities
  rewardsEnabled: boolean;
  onlineOrderingAvailable: boolean;
  
  // Payment and integration
  posIntegration?: {
    provider: 'SQUARE' | 'OTHER';
    merchantId?: string;
  };
  
  // Menu and business details
  menuItems?: MenuItem[];
  businessHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  
  // Additional metadata
  description?: string;
  coverPhoto?: string;
  rating?: number;
  reviewCount?: number;
}
