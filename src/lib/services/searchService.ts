import type { LoadedTeaClub } from '@/types/models';

type SearchParams = {
  location?: string;
  filters?: {
    rating?: number;
    price?: string;
    openNow?: boolean;
    hasDelivery?: boolean;
  };
};

type SearchResult = {
  businesses?: LoadedTeaClub[];
};

export async function searchBusinesses({ 
  location = '', 
  filters = {} 
}: SearchParams): Promise<LoadedTeaClub[]> {
  try {
    // Parse city and state from location
    const [city = '', state = ''] = location.split(',').map(s => s.trim());
    
    const searchParams = new URLSearchParams();
    if (city) searchParams.append('city', city);
    if (state) searchParams.append('state', state);
    
    // Add other filters
    if (filters.rating !== undefined) searchParams.append('rating', filters.rating.toString());
    if (filters.price) searchParams.append('price', filters.price);
    if (filters.openNow === true) searchParams.append('openNow', 'true');
    if (filters.hasDelivery === true) searchParams.append('hasDelivery', 'true');

    const response = await fetch(`/api/search?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json() as SearchResult;
    return data.businesses ?? [];
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
