import { IPlacesService, LocationDetails } from './locationInterfaces';
import { LoadedTeaClub } from '@/types/models';
import { PlacesError } from '@/types/errors';

type GooglePlacePhoto = {
  getUrl: (options?: { maxWidth?: number; maxHeight?: number }) => string;
}

type GooglePlaceResult = {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number | undefined;
  user_ratings_total?: number | undefined;
  photos?: GooglePlacePhoto[] | undefined;
  types?: string[] | undefined;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  } | undefined;
  opening_hours?: {
    isOpen(): boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }> | undefined;
  } | undefined;
}

type BusinessHours = {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
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
                  location: {
                    lat: result.geometry?.location?.lat() || 0,
                    lng: result.geometry?.location?.lng() || 0
                  }
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

  private convertToLoadedTeaClubs(results: GooglePlaceResult[]): LoadedTeaClub[] {
    return results.map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry ? {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        type: 'Point'
      } : undefined,
      latitude: place.geometry?.location.lat,
      longitude: place.geometry?.location.lng,
      rating: place.rating ?? undefined,
      reviewCount: place.user_ratings_total ?? undefined,
      types: place.types ?? [],
      photos: place.photos?.map(photo => photo.getUrl({ maxWidth: 400 })),
      isOpen: place.opening_hours?.isOpen(),
      hours: this.convertBusinessHours(place.opening_hours),
      source: 'GOOGLE_PLACES',
      menuItems: [],
      featuredItemIds: []
    }))
  }

  private convertBusinessHours(hours?: GooglePlaceResult['opening_hours']): BusinessHours | undefined {
    if (!hours || !hours.periods) return undefined;

    const daysOfWeek: (keyof BusinessHours)[] = [
      'monday', 'tuesday', 'wednesday', 'thursday', 
      'friday', 'saturday', 'sunday'
    ];

    const businessHours: BusinessHours = {
      monday: { open: '', close: '', isOpen: false },
      tuesday: { open: '', close: '', isOpen: false },
      wednesday: { open: '', close: '', isOpen: false },
      thursday: { open: '', close: '', isOpen: false },
      friday: { open: '', close: '', isOpen: false },
      saturday: { open: '', close: '', isOpen: false },
      sunday: { open: '', close: '', isOpen: false }
    };

    hours.periods.forEach(period => {
      const dayIndex = period.open.day;
      if (dayIndex >= 0 && dayIndex < 7) {
        const day = daysOfWeek[dayIndex];
        businessHours[day] = {
          open: period.open.time || '',
          close: period.close.time || '',
          isOpen: true
        };
      }
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
