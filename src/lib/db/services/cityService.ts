import { getDatabase } from '../database';
import { LoadedTeaClub } from '@/types/models';
import { GooglePlacesService } from '@/lib/services/googlePlacesService';
import { GoogleMapsService } from '@/lib/services/googleMapsService';
import type { CityData, NearbyCityData } from '@/types/cityTypes';
import { Logger } from '@/lib/utils/logger';
import { ObjectId } from 'mongodb';

// Define WithId type locally
type WithId<T> = T & { _id: ObjectId };

export class CityService {
  private static logger = new Logger('CityService');

  private static validateCityState(city: string, state: string): { city: string; state: string } {
    if (!city || !state) {
      throw new Error('City and state must be provided');
    }
    
    return {
      city: city.replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
      state: state.toUpperCase()
    };
  }

  static async getCityData(city: string, state: string): Promise<CityData> {
    try {
      // Validate and normalize input
      const { city: normalizedCity, state: normalizedState } = this.validateCityState(city, state);

      const db = await getDatabase();

      // Fetch businesses for the city
      const businesses = await this.getBusinessesByCity(normalizedCity, normalizedState);

      // If no businesses found in database, try Google Places API
      if (businesses.length === 0) {
        this.logger.info(`No businesses found in database for ${normalizedCity}, ${normalizedState}. Trying Google Places API...`);
        
        try {
          // Get coordinates for the city
          const cityCoords = await GoogleMapsService.getCoordinates(normalizedCity, normalizedState);
          
          if (cityCoords) {
            // Fetch businesses from Google Places API
            const placesService = new GooglePlacesService(new google.maps.Map(document.createElement('div')));
            const locationDetails = {
              city: normalizedCity,
              state: normalizedState,
              latitude: cityCoords.lat, 
              longitude: cityCoords.lng
            };
            const googleBusinesses = await placesService.searchNearby(locationDetails);
            
            if (googleBusinesses.length > 0) {
              return this.createCityDataResponse(
                googleBusinesses, 
                'google-places', 
                normalizedCity, 
                normalizedState
              );
            }
          }
        } catch (apiError) {
          this.logger.error('Error fetching Google Places data', apiError);
        }
        
        // Return empty response if no data found
        return this.createEmptyCityDataResponse(normalizedCity, normalizedState);
      }

      // If businesses found in database, calculate city statistics
      return this.createCityDataResponse(
        businesses, 
        'database', 
        normalizedCity, 
        normalizedState
      );
    } catch (error) {
      this.logger.error('Error in getCityData', error);
      return this.createEmptyCityDataResponse(city, state);
    }
  }

  private static async getBusinessesByCity(city: string, state: string): Promise<LoadedTeaClub[]> {
    try {
      const db = await getDatabase();
      const businesses = await db.collection('businesses')
        .find({
          city: { $regex: new RegExp(city, 'i') },
          state: { $regex: new RegExp(state, 'i') }
        })
        .toArray() as WithId<LoadedTeaClub>[];

      // Convert WithId<LoadedTeaClub> to LoadedTeaClub
      return businesses.map(business => ({
        ...business,
        id: business._id.toString(),
        _id: undefined as any
      }));
    } catch (error) {
      console.error('Error fetching businesses by city:', error);
      throw error;
    }
  }

  private static createCityDataResponse(
    businesses: LoadedTeaClub[], 
    source: 'database' | 'google-places',
    city: string,
    state: string
  ): CityData {
    const totalBusinesses = businesses.length;
    const totalReviews = this.calculateTotalReviews(businesses);
    const averageRating = this.calculateAverageRating(businesses);
    const claimedBusinesses = businesses.filter(b => b.isClaimed).length;

    return {
      businesses,
      totalBusinesses,
      cityStats: {
        totalReviews,
        averageRating,
        claimedBusinesses
      },
      popularItems: [], // TODO: Implement logic to get popular items
      topRated: businesses.slice(0, 3),
      recentlyAdded: businesses.slice(-3),
      source,
      averageRating,
      city,
      state,
      nearbyCities: [] // Will be populated separately if needed
    };
  }

  private static createEmptyCityDataResponse(
    city: string, 
    state: string
  ): CityData {
    return {
      businesses: [],
      totalBusinesses: 0,
      cityStats: {
        totalReviews: 0,
        averageRating: 0,
        claimedBusinesses: 0
      },
      popularItems: [],
      topRated: [],
      recentlyAdded: [],
      source: 'none',
      averageRating: 0,
      city,
      state,
      nearbyCities: []
    };
  }

  static calculateTotalReviews(businesses: LoadedTeaClub[]): number {
    return businesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
  }

  static calculateAverageRating(businesses: LoadedTeaClub[]): number {
    if (businesses.length === 0) return 0;
    const totalRating = businesses.reduce((sum, b) => sum + (b.rating || 0), 0);
    return Number((totalRating / businesses.length).toFixed(2));
  }

  static async getNearbyCities(
    city: string, 
    state: string, 
    limit = 5
  ): Promise<NearbyCityData[]> {
    try {
      const { city: normalizedCity, state: normalizedState } = this.validateCityState(city, state);

      const db = await getDatabase();

      const pipeline: any[] = [
        { $match: { state: { $exists: true }, city: { $exists: true } } },
        { $group: {
            _id: '$city', 
            state: { $first: '$state' },
            businessCount: { $sum: 1 }
          }},
        { $project: { 
            name: { $literal: '$_id' }, 
            state: 1, 
            businessCount: 1,
            distance: { $literal: 0 }
          }},
        { $sort: { businessCount: -1 } },
        { $limit: limit }
      ];

      const result = await db.collection('businesses').aggregate(pipeline).toArray();

      return result.map(item => ({
        name: item.name,
        state: item.state,
        businessCount: item.businessCount,
        distance: item.distance
      }));
    } catch (error) {
      this.logger.error('Error fetching nearby cities', error);
      return [];
    }
  }
}
