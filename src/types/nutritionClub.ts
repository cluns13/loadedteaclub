import { MenuItem } from './menu';
import { Coordinates } from './location';

export interface NutritionClub {
  id: string;
  name: string;
  address: string;
  coordinates?: Coordinates;
  phone: string;
  email?: string;
  
  // New Rewards & Ordering Features
  rewardsEnabled: boolean;
  onlineOrderingAvailable: boolean;
  
  // POS Integration Details
  posIntegration?: {
    provider: 'SQUARE' | 'OTHER';
    merchantId?: string;
  };

  // Menu Details
  menuItems?: MenuItem[];
  
  // Optional Business Hours
  businessHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}
