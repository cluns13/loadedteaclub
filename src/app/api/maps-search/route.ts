import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { LoadedTeaClub } from '@/types/models';
import { AppError, ValidationError, PlacesError } from '@/types/errors';
import { rateLimit } from '@/lib/rateLimit';

const client = new Client({});

type PlacePhoto = {
  photo_reference: string;
  height: number;
  width: number;
};

type PlaceOpeningHours = {
  open_now?: boolean;
  periods?: Array<{
    open: { day: number; time: string };
    close: { day: number; time: string };
  }>;
};

type PlaceResult = {
  place_id: string;
  name: string;
  formatted_address: string;
  photos?: PlacePhoto[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: PlaceOpeningHours;
  types?: string[];
};

type PlaceDetails = {
  opening_hours?: PlaceOpeningHours;
  formatted_phone_number?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (!city || !state) {
      throw new ValidationError('City and state parameters are required');
    }

    // Apply rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await rateLimit.check(identifier);

    if (!success) {
      throw new AppError('Too many requests', 'RATE_LIMIT_EXCEEDED', 429);
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new AppError('Google Places API key not configured', 'CONFIG_ERROR', 500);
    }

    // First, geocode the city and state to get coordinates
    const geocodeResponse = await client.geocode({
      params: {
        address: `${city}, ${state}`,
        key: apiKey,
      },
    });

    if (
      geocodeResponse.data.status !== 'OK' ||
      !geocodeResponse.data.results[0]?.geometry?.location
    ) {
      throw new PlacesError('Failed to geocode location');
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    // Then search for places near those coordinates
    const placesResponse = await client.placesNearby({
      params: {
        location: { lat, lng },
        radius: 5000, // 5km radius
        type: 'cafe', // Focus on cafes
        keyword: 'loaded tea nutrition', // Target loaded tea and nutrition clubs
        key: apiKey,
      },
    });

    if (placesResponse.data.status !== 'OK') {
      throw new PlacesError('Failed to fetch nearby places');
    }

    const places = placesResponse.data.results as PlaceResult[];
    const loadedTeaClubs: LoadedTeaClub[] = await Promise.all(
      places.map(async (place): Promise<LoadedTeaClub> => {
        // Get additional place details
        const detailsResponse = await client.placeDetails({
          params: {
            place_id: place.place_id,
            fields: ['opening_hours', 'photos', 'formatted_phone_number'],
            key: apiKey,
          },
        });

        const details = detailsResponse.data.result as PlaceDetails;
        const hours = convertBusinessHours(details.opening_hours?.periods);

        // Get photo URLs
        const photos = await Promise.all(
          (place.photos || []).slice(0, 3).map(async (photo) => {
            try {
              const photoResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`
              );
              return photoResponse.url;
            } catch (error) {
              console.warn('Failed to fetch photo:', error);
              return '';
            }
          })
        );

        return {
          id: place.place_id,
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          photos: photos.filter(Boolean),
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          isOpen: place.opening_hours?.open_now || false,
          distance: 0, // Calculate this based on user location if needed
          types: place.types || [],
          description: '',
          featuredItemIds: [],
          menuItems: [],
          hours,
        };
      })
    );

    return NextResponse.json(loadedTeaClubs);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error('Maps search error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

function convertBusinessHours(periods?: PlaceOpeningHours['periods']) {
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

  if (!periods) {
    return defaultDays;
  }

  const businessHours = { ...defaultDays };
  const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  periods.forEach(period => {
    if (!period.open?.time || !period.close?.time) return;
    
    const dayName = daysMap[period.open.day] as keyof typeof businessHours;
    businessHours[dayName] = {
      open: formatTime(period.open.time),
      close: formatTime(period.close.time),
    };
  });

  return businessHours;
}

function formatTime(time: string): string {
  const hours = time.slice(0, 2);
  const minutes = time.slice(2, 4);
  return `${hours}:${minutes}`;
}
