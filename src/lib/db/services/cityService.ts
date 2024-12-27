import { getDb } from '../mongodb';
import { GooglePlacesService } from '@/lib/services/googlePlacesService';
import { GoogleMapsService } from '@/lib/services/googleMapsService';
import type { LoadedTeaClub } from '@/types/models';
import { ObjectId } from 'mongodb';

export interface CityData {
  businesses: LoadedTeaClub[];
  totalBusinesses: number;
  popularItems: string[];
  averageRating: number;
  topRated: LoadedTeaClub[];
  recentlyAdded: LoadedTeaClub[];
  cityStats: {
    totalReviews: number;
    averageRating: number;
    claimedBusinesses: number;
  };
  source: 'database' | 'google-places';
}

interface SearchCoords {
  lat: number;
  lng: number;
}

export class CityService {
  static async getCityData(city: string, state: string): Promise<CityData | null> {
    const db = await getDb();
    const collection = db.collection<LoadedTeaClub>('loaded_tea_clubs');

    // Normalize city and state
    city = city.replace(/-/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    state = state.toUpperCase();

    try {
      // Get all businesses for the city from database
      let businesses = await collection
        .find({ city, state })
        .sort({ rating: -1 })
        .toArray();

      // If no businesses found in database, try Google Places API
      if (businesses.length === 0) {
        console.log(`No businesses found in database for ${city}, ${state}. Trying Google Places API...`);
        const googleBusinesses = await GooglePlacesService.searchAndSave(city, state);
        
        if (googleBusinesses.length > 0) {
          // Save businesses to database
          const result = await collection.insertMany(googleBusinesses as any[]);
          console.log(`Saved ${result.insertedCount} businesses from Google Places API`);
          
          // Fetch the newly inserted businesses
          businesses = await collection
            .find({ _id: { $in: Object.values(result.insertedIds) } })
            .sort({ rating: -1 })
            .toArray();
        }
      }

      if (businesses.length === 0) {
        return null;
      }

      // Calculate statistics
      const totalBusinesses = businesses.length;
      const popularItems = this.getPopularItems(businesses);
      const averageRating = this.calculateAverageRating(businesses);
      const topRated = businesses.slice(0, 5); // Top 5 by rating
      const recentlyAdded = [...businesses].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 5);

      const totalReviews = businesses.reduce((sum, business) => sum + (business.reviewCount || 0), 0);
      const claimedBusinesses = businesses.filter(business => business.isClaimed).length;

      return {
        businesses,
        totalBusinesses,
        popularItems,
        averageRating,
        topRated,
        recentlyAdded,
        cityStats: {
          totalReviews,
          averageRating,
          claimedBusinesses
        },
        source: (businesses[0].source || 'database') as 'database' | 'google-places'
      };
    } catch (error) {
      console.error('Error fetching city data:', error);
      return null;
    }
  }

  static async findBusinesses(
    city: string,
    state: string,
    coords?: SearchCoords | null
  ) {
    try {
      const db = await getDb();
      const collection = db.collection<LoadedTeaClub>('loaded_tea_clubs');

      // First try to find businesses in the database
      const dbBusinesses = await collection
        .find({ 
          city: city.trim(),
          state: state.toUpperCase().trim()
        })
        .sort({ rating: -1 })
        .toArray();

      if (dbBusinesses.length > 0) {
        console.log(`Found ${dbBusinesses.length} businesses in database`);
        return dbBusinesses;
      }

      // If no businesses found in database, try Google Places API
      console.log('No businesses found in database, trying Google Places API...');
      
      let searchCoords = coords;
      if (!searchCoords && city && state) {
        searchCoords = await GoogleMapsService.getCoordinates(city, state);
      }

      if (!searchCoords) {
        console.error('Could not get coordinates for search');
        return [];
      }

      const places = await GooglePlacesService.searchNearby(searchCoords.lat, searchCoords.lng);
      const businesses = places.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        city,
        state,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        photos: place.photos?.map(photo => photo.photo_reference) || [],
        isOpen: place.opening_hours?.open_now,
        source: 'google-places' as const
      }));

      // Save new businesses to database
      if (businesses.length > 0) {
        await collection.insertMany(businesses);
        console.log(`Saved ${businesses.length} new businesses to database`);
      }

      return businesses;
    } catch (error) {
      console.error('Error finding businesses:', error);
      return [];
    }
  }

  private static getPopularItems(businesses: LoadedTeaClub[]): string[] {
    const itemCounts = new Map<string, number>();

    businesses.forEach(business => {
      business.menu?.forEach(item => {
        if (item.popular) {
          const count = itemCounts.get(item.name) || 0;
          itemCounts.set(item.name, count + 1);
        }
      });
    });

    return Array.from(itemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }

  private static calculateAverageRating(businesses: LoadedTeaClub[]): number {
    const totalRating = businesses.reduce((sum, business) => sum + (business.rating || 0), 0);
    return businesses.length > 0 ? totalRating / businesses.length : 0;
  }

  static async getNearbyCities(state: string, limit = 5): Promise<string[]> {
    const db = await getDb();
    
    try {
      return await db
        .collection<LoadedTeaClub>('loaded_tea_clubs')
        .distinct('city', { state: state.toUpperCase() })
        .then(cities => cities.slice(0, limit));
    } catch (error) {
      console.error('Error fetching nearby cities:', error);
      return [];
    }
  }

  static async updateBusinessFromGooglePlaces(businessId: string): Promise<LoadedTeaClub | null> {
    const db = await getDb();
    const collection = db.collection<LoadedTeaClub>('loaded_tea_clubs');

    try {
      const business = await collection.findOne({ _id: new ObjectId(businessId) });
      if (!business?.placeId) {
        return null;
      }

      // Get updated details from Google Places
      const details = await GooglePlacesService['getPlaceDetails'](business.placeId);
      if (!details) {
        return null;
      }

      // Update business
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(businessId) },
        {
          $set: {
            street: details.street,
            phone: details.phone,
            website: details.website,
            hours: details.hours,
            updatedAt: new Date(),
            lastSync: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      return result;
    } catch (error) {
      console.error('Error updating business from Google Places:', error);
      return null;
    }
  }

  static async getAllCities(): Promise<{ name: string; state: string }[]> {
    const db = await getDb();
    const collection = db.collection<LoadedTeaClub>('loaded_tea_clubs');

    // Use aggregation to get unique cities and states
    const cities = await collection.aggregate([
      { 
        $group: { 
          _id: { city: '$city', state: '$state' } 
        } 
      },
      { 
        $project: { 
          name: '$_id.city', 
          state: '$_id.state', 
          _id: 0 
        } 
      },
      { 
        $sort: { 
          state: 1, 
          name: 1 
        } 
      }
    ]).toArray();

    return cities;
  }

  static async findAll(): Promise<LoadedTeaClub[]> {
    const db = await getDb();
    const collection = db.collection<LoadedTeaClub>('loaded_tea_clubs');

    return collection
      .find({})
      .project({
        id: 1,
        name: 1,
        updatedAt: 1
      })
      .toArray();
  }
}
