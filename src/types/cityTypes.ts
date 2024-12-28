import { LoadedTeaClub } from './models';

export interface CityData {
  businesses: LoadedTeaClub[];
  totalBusinesses: number;
  averageRating: number;
  cityStats: {
    totalReviews: number;
    averageRating: number;
    claimedBusinesses: number;
  };
  popularItems: string[];
  topRated: LoadedTeaClub[];
  recentlyAdded: LoadedTeaClub[];
  nearbyCities: NearbyCityData[];
  source: 'database' | 'google-places' | 'none';
  city: string;
  state: string;
}

export interface NearbyCityData {
  name: string;
  state: string;
  distance: number;
  businessCount: number;
}

export interface LocationSummary {
  name: string;
  state: string;
  count: number;
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  photos?: string[];
  coverPhoto?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  hours: {
    open: string;
    close: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isOpen: boolean;
  }[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}
