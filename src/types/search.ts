import type { LoadedTeaClub, MenuItem, Review } from './models';

export interface SearchResult extends Partial<LoadedTeaClub> {
  // Override and extend LoadedTeaClub type for search-specific use
  placeId?: string;
  
  // Location details
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  
  // Business information
  profileImage?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Search-specific metadata
  relevanceScore?: number;
  distance?: number;
  
  // Operational details
  hours?: {
    open: string;
    close: string;
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  }[];
}

export interface SearchProps {
  onSearchResults: (results: SearchResult[]) => void;
  initialCity?: string;
  initialState?: string;
  radius?: number; // Search radius in miles
  filters?: {
    categories?: string[];
    priceRange?: [number, number];
    openNow?: boolean;
    hasRewards?: boolean;
    hasOnlineOrdering?: boolean;
  };
}

export interface SearchState {
  location: string;
  loading: boolean;
  error: string | null;
  resultCount: number | null;
  searchParams: {
    query?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface SearchFilter {
  type: 'category' | 'rating' | 'distance' | 'price' | 'availability';
  value: string | number | [number, number] | boolean;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  type: 'business' | 'menu_item' | 'location';
  metadata?: Partial<LoadedTeaClub | MenuItem | Review>;
}
