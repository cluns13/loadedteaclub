import { Client } from "@googlemaps/google-maps-services-js";
import { LoadedTeaClub, BusinessHours } from "@/types/models";
import { AddressType, PlacePhoto } from "@googlemaps/google-maps-services-js";

interface IPlacesService {
  searchNearby(query: string, location: { lat: number; lng: number }, radius: number): Promise<LoadedTeaClub[]>;
  getPlaceDetails(placeId: string): Promise<LoadedTeaClub | null>;
  getPlacePhotos(placeId: string): Promise<string[]>;
}

class PlacesService implements IPlacesService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async searchNearby(
    query: string, 
    location: { lat: number; lng: number }, 
    radius: number
  ): Promise<LoadedTeaClub[]> {
    try {
      const response = await this.client.textSearch({
        params: {
          query,
          location: `${location.lat},${location.lng}`,
          radius,
          key: process.env.GOOGLE_MAPS_API_KEY || ''
        }
      });

      return response.data.results.map(place => ({
        id: place.place_id || '',
        name: place.name || '',
        address: place.formatted_address || '',
        location: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0,
          type: 'Point'
        },
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        photos: place.photos?.map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY || ''}`
        ) || [],
        businessHours: {} as BusinessHours,
        website: '',
        phoneNumber: '',
        priceLevel: place.price_level || 0,
        types: place.types || [],
        menuItems: [],
        featuredItemIds: []
      }));
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<LoadedTeaClub | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'user_ratings_total', 'website', 'formatted_phone_number', 'price_level', 'types'],
          key: process.env.GOOGLE_MAPS_API_KEY || ''
        }
      });

      const place = response.data.result;
      if (!place) {
        return null;
      }

      return {
        id: placeId,
        name: place.name || '',
        address: place.formatted_address || '',
        location: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0,
          type: 'Point'
        },
        photos: place.photos?.map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY || ''}`
        ) || [],
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        website: place.website || '',
        phoneNumber: place.formatted_phone_number || '',
        priceLevel: place.price_level || 0,
        types: place.types || [],
        businessHours: {} as BusinessHours,
        menuItems: [],
        featuredItemIds: []
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  async getPlacePhotos(placeId: string): Promise<string[]> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: ['photos'],
          key: process.env.GOOGLE_MAPS_API_KEY || ''
        }
      });

      if (!response.data.result.photos) {
        return [];
      }

      return response.data.result.photos.map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
    } catch (error) {
      console.error('Error fetching place photos:', error);
      return [];
    }
  }
}

export { PlacesService };
