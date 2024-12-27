import { Client } from '@googlemaps/google-maps-services-js';
import { getDb } from '@/lib/db/mongodb';
import { NutritionClubService } from './nutritionClubService';
import { LocationDetails } from './locationInterfaces';
import { LoadedTeaClub } from '@/types/models';
import redis from '@/lib/redis';

const client = new Client({});
const nutritionClubService = new NutritionClubService();

export interface PlacePhotos {
  coverPhoto?: string;
  photos: string[];
  lastUpdated: Date;
}

export interface IPlacesService {
  searchNearby(location: LocationDetails): Promise<LoadedTeaClub[]>;
}

export class PlacesService implements IPlacesService {
  async searchNearby(location: LocationDetails): Promise<LoadedTeaClub[]> {
    try {
      // First, try nutrition clubs from our database
      const nutritionClubs = await nutritionClubService.searchByLocation(location);
      
      // Mark these as claimed
      const claimedClubs = nutritionClubs.map(club => ({
        ...club,
        isClaimed: true
      }));

      // If no nutrition clubs, fall back to Google Places API
      const response = await client.nearbySearch({
        params: {
          location: {
            lat: location.latitude!,
            lng: location.longitude!
          },
          radius: 10000, // 10 km
          keyword: 'loaded tea',
          key: process.env.GOOGLE_MAPS_API_KEY!
        }
      });

      const places = response.data.results || [];
      
      const unclaimed = places.map(place => ({
        id: place.place_id,
        name: place.name,
        location: {
          address: place.vicinity,
          lat: place.geometry?.location.lat,
          lng: place.geometry?.location.lng,
          city: location.city,
          state: location.state
        },
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        isClaimed: false
      }));

      // Combine and prioritize claimed businesses
      return [...claimedClubs, ...unclaimed];
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }
}

export async function getPlacePhotos(placeId: string, forceUpdate = false): Promise<PlacePhotos> {
  // Redis cache key
  const cacheKey = `place_photos:${placeId}`;

  // Check Redis cache first
  if (!forceUpdate) {
    const cachedPhotos = await redis.get(cacheKey);
    if (cachedPhotos) {
      const parsedPhotos = JSON.parse(cachedPhotos);
      return {
        ...parsedPhotos,
        lastUpdated: new Date(parsedPhotos.lastUpdated)
      };
    }
  }

  const db = await getDb();
  
  // Check if we have cached photos in MongoDB and they're less than 30 days old
  const cachedBusiness = await db.collection('businesses').findOne(
    { placeId },
    { projection: { photos: 1, coverPhoto: 1, photosLastUpdated: 1 } }
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (
    !forceUpdate &&
    cachedBusiness?.photos?.length &&
    cachedBusiness.photosLastUpdated &&
    new Date(cachedBusiness.photosLastUpdated) > thirtyDaysAgo
  ) {
    const photos = {
      coverPhoto: cachedBusiness.coverPhoto,
      photos: cachedBusiness.photos,
      lastUpdated: new Date(cachedBusiness.photosLastUpdated),
    };

    // Cache in Redis for faster future access
    await redis.set(cacheKey, JSON.stringify(photos), 'EX', 86400 * 30); // 30 days

    return photos;
  }

  try {
    // Fetch new photos from Google Places API
    const placeDetails = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['photos'],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    if (!placeDetails.data.result.photos) {
      const emptyPhotos = { photos: [], lastUpdated: new Date() };
      
      // Cache empty result to prevent repeated API calls
      await redis.set(cacheKey, JSON.stringify(emptyPhotos), 'EX', 86400); // 1 day
      
      return emptyPhotos;
    }

    // Get the photo references
    const photoRefs = placeDetails.data.result.photos.map(
      (photo) => photo.photo_reference
    );

    // Convert photo references to URLs
    const photoUrls = photoRefs.map((ref) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const photos = {
      coverPhoto: photoUrls[0],
      photos: photoUrls,
      lastUpdated: new Date(),
    };

    // Update the cached photos in our database
    await db.collection('businesses').updateOne(
      { placeId },
      {
        $set: {
          photos: photos.photos,
          coverPhoto: photos.coverPhoto,
          photosLastUpdated: photos.lastUpdated,
        },
      }
    );

    // Cache in Redis
    await redis.set(cacheKey, JSON.stringify(photos), 'EX', 86400 * 30); // 30 days

    return photos;
  } catch (error) {
    console.error('Error fetching place photos:', error);
    
    // Return cached photos if available, even if they're old
    if (cachedBusiness?.photos) {
      const photos = {
        coverPhoto: cachedBusiness.coverPhoto,
        photos: cachedBusiness.photos,
        lastUpdated: new Date(cachedBusiness.photosLastUpdated),
      };

      // Cache in Redis
      await redis.set(cacheKey, JSON.stringify(photos), 'EX', 86400); // 1 day
      
      return photos;
    }

    const emptyPhotos = { photos: [], lastUpdated: new Date() };
    
    // Cache empty result to prevent repeated API calls
    await redis.set(cacheKey, JSON.stringify(emptyPhotos), 'EX', 86400); // 1 day
    
    return emptyPhotos;
  }
}
