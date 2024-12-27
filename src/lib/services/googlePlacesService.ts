import { IPlacesService, LocationDetails } from './locationInterfaces';
import { LoadedTeaClub } from '@/types/models';
import { PlacesError } from '@/types/errors';

interface GooglePlacePhoto {
  getUrl: (options?: { maxWidth?: number; maxHeight?: number }) => string;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  photos?: GooglePlacePhoto[];
  geometry: {
    location: google.maps.LatLng;
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    isOpen(): boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  types?: string[];
}

export class GooglePlacesService implements IPlacesService {
  private placesService: google.maps.places.PlacesService;
  private map: google.maps.Map;

  constructor(map: google.maps.Map) {
    if (!map) {
      throw new PlacesError('Map instance is required for GooglePlacesService');
    }
    this.map = map;
    this.placesService = new google.maps.places.PlacesService(map);
  }

  async searchNearby(location: LocationDetails): Promise<LoadedTeaClub[]> {
    try {
      if (!location.latitude || !location.longitude) {
        throw new PlacesError('Invalid location coordinates');
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.latitude, location.longitude),
        radius: 5000, // 5km radius
        type: 'cafe'
      };

      const searchResults = await this.performNearbySearch(request);
      return this.convertToLoadedTeaClubs(searchResults);
    } catch (error) {
      if (error instanceof PlacesError) {
        throw error;
      }
      throw new PlacesError(
        'Failed to search nearby places',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async performNearbySearch(
    request: google.maps.places.PlaceSearchRequest
  ): Promise<GooglePlaceResult[]> {
    return new Promise((resolve, reject) => {
      this.placesService.nearbySearch(
        request,
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results.map(result => {
              const mappedResult: GooglePlaceResult = {
                place_id: result.place_id || '',
                name: result.name || '',
                formatted_address: result.formatted_address || '',
                geometry: {
                  location: result.geometry?.location || new google.maps.LatLng(0, 0)
                },
                photos: result.photos,
                rating: result.rating,
                user_ratings_total: result.user_ratings_total,
                types: result.types
              };

              if (result.opening_hours) {
                mappedResult.opening_hours = {
                  isOpen: () => result.opening_hours?.isOpen() || false,
                  periods: result.opening_hours.periods?.map(period => ({
                    open: {
                      day: period.open?.day || 0,
                      time: period.open?.time || '0000'
                    },
                    close: {
                      day: period.close?.day || 0,
                      time: period.close?.time || '0000'
                    }
                  }))
                };
              }

              return mappedResult;
            }));
          } else {
            reject(new PlacesError(`Places search failed with status: ${status}`));
          }
        }
      );
    });
  }

  private convertToLoadedTeaClubs(places: GooglePlaceResult[]): LoadedTeaClub[] {
    return places.map((place): LoadedTeaClub => {
      const photos = place.photos?.map(photo => {
        try {
          return photo.getUrl({ maxWidth: 800 });
        } catch (error) {
          console.warn('Error getting photo URL:', error);
          return '';
        }
      }).filter(Boolean) || [];

      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        photos,
        placeId: place.place_id,
        location: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        isOpen: place.opening_hours?.isOpen() || false,
        types: place.types || [],
        distance: 0,
        featuredItemIds: [],
        menuItems: [],
        description: '',
        hours: this.convertBusinessHours(place.opening_hours)
      };
    });
  }

  private convertBusinessHours(hours?: GooglePlaceResult['opening_hours']) {
    const defaultHours = { open: '9:00', close: '17:00' };
    const defaultDays = {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: defaultHours,
    };

    if (!hours?.periods) {
      return defaultDays;
    }

    const businessHours = { ...defaultDays };
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    hours.periods.forEach(period => {
      if (!period.open?.time || !period.close?.time) return;
      
      const dayName = daysMap[period.open.day] as keyof typeof businessHours;
      businessHours[dayName] = {
        open: this.formatTime(period.open.time),
        close: this.formatTime(period.close.time),
      };
    });

    return businessHours;
  }

  private formatTime(time: string): string {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2, 4);
    return `${hours}:${minutes}`;
  }

  getMap(): google.maps.Map {
    return this.map;
  }
}
