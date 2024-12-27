import { Client } from '@googlemaps/google-maps-services-js';
import {
  ILocationService,
  IGeolocationService,
  IPlacesService,
  LocationDetails
} from './locationInterfaces';
import { LoadedTeaClub } from '@/types/models';
import { LocationError } from '@/types/errors';

export class LocationService implements ILocationService {
  private readonly googleClient: Client;

  constructor(
    private readonly placesService: IPlacesService,
    private readonly geolocationService: IGeolocationService
  ) {
    if (!geolocationService || !placesService) {
      throw new LocationError('Required services not provided to LocationService');
    }
    this.googleClient = new Client({});
  }

  // Instance method to format location URL
  formatLocationUrl(city: string, state: string): string {
    if (!city || !state) {
      throw new LocationError('City and state are required for URL formatting');
    }
    
    return `/${encodeURIComponent(state.toLowerCase())}/${encodeURIComponent(
      city.toLowerCase().replace(/\s+/g, '-')
    )}`;
  }

  // Static method to find nearest location
  static findNearestLocation(
    locations: LoadedTeaClub[], 
    currentLocation: { latitude: number; longitude: number }
  ): LoadedTeaClub | null {
    if (!locations || locations.length === 0) {
      return null;
    }

    return locations.reduce((nearest, location) => {
      // Use location.location instead of coordinates
      const lat = location.location?.lat;
      const lng = location.location?.lng;

      if (!lat || !lng) {
        return nearest;
      }

      const distance = this.calculateDistance(
        currentLocation.latitude, 
        currentLocation.longitude, 
        lat, 
        lng
      );

      if (!nearest || distance < this.calculateDistance(
        currentLocation.latitude, 
        currentLocation.longitude, 
        nearest.location?.lat ?? 0, 
        nearest.location?.lng ?? 0
      )) {
        return location;
      }

      return nearest;
    }, null as LoadedTeaClub | null);
  }

  // Helper method to calculate distance between two coordinates
  private static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  // Helper method to convert degrees to radians
  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async getCurrentLocationCityState(): Promise<{ city: string; state: string }> {
    try {
      const { latitude, longitude } = await this.geolocationService.getCurrentLocation();
      const details = await this.getLocationDetails({
        latitude,
        longitude,
        city: '',
        state: ''
      });
      return {
        city: details.city,
        state: details.state
      };
    } catch (error) {
      throw new LocationError(
        'Failed to get current location',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async getLocationDetails(location: LocationDetails): Promise<LocationDetails> {
    try {
      if (!this.isValidLocation(location)) {
        throw new LocationError('Invalid location data provided');
      }

      // If we already have city and state, return as is
      if (location.city && location.state) {
        return location;
      }

      // If we have coordinates but no city/state, reverse geocode
      if (location.latitude && location.longitude) {
        const response = await fetch(
          `/api/geocode/reverse?lat=${location.latitude}&lng=${location.longitude}`
        );

        if (!response.ok) {
          throw new LocationError('Failed to reverse geocode location');
        }

        const data = await response.json();
        return {
          ...location,
          city: data.city,
          state: data.state
        };
      }

      throw new LocationError('Insufficient location data');
    } catch (error) {
      throw new LocationError(
        'Failed to get location details',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async searchNearbyPlaces(location: LocationDetails): Promise<LoadedTeaClub[]> {
    try {
      if (!this.isValidLocation(location)) {
        throw new LocationError('Invalid location data for nearby search');
      }

      // If we only have city/state, get coordinates
      if (!location.latitude || !location.longitude) {
        const geocoded = await this.geocodeLocation(location);
        location = {
          ...location,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude
        };
      }

      return await this.placesService.searchNearby(location);
    } catch (error) {
      throw new LocationError(
        'Failed to search nearby places',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async getLocationFromSearch(query: string): Promise<LocationDetails | null> {
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new LocationError('Failed to geocode search query');
      }

      const data = await response.json();
      if (!data.city || !data.state) {
        return null;
      }

      return {
        city: data.city,
        state: data.state,
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      throw new LocationError(
        'Failed to search location',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private async geocodeLocation(location: LocationDetails): Promise<LocationDetails> {
    const response = await fetch(
      `/api/geocode?city=${encodeURIComponent(location.city)}&state=${encodeURIComponent(
        location.state
      )}`
    );

    if (!response.ok) {
      throw new LocationError('Failed to geocode location');
    }

    const data = await response.json();
    return {
      ...location,
      latitude: data.latitude,
      longitude: data.longitude
    };
  }

  private isValidLocation(location: LocationDetails): boolean {
    return Boolean(
      (location.latitude && location.longitude) ||
      (location.city && location.state)
    );
  }
}
