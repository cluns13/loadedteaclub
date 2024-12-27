import { LoadedTeaClub } from '@/types/models';

export interface LocationDetails {
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

export interface IGeolocationService {
  getCurrentLocation(): Promise<{ latitude: number; longitude: number }>;
}

export interface IPlacesService {
  searchNearby(location: LocationDetails): Promise<LoadedTeaClub[]>;
  getMap(): google.maps.Map;
}

export interface ILocationService {
  getCurrentLocationCityState(): Promise<{ city: string; state: string }>;
  getLocationDetails(location: LocationDetails): Promise<LocationDetails>;
  searchNearbyPlaces(location: LocationDetails): Promise<LoadedTeaClub[]>;
  formatLocationUrl(city: string, state: string): string;
  getLocationFromSearch(query: string): Promise<LocationDetails | null>;
}
