import { NextResponse } from 'next/server';
import { Client, AddressType } from '@googlemaps/google-maps-services-js';

const client = new Client({});

// Define the address component types we care about
const ADDRESS_TYPES = {
  LOCALITY: AddressType.locality,
  SUBLOCALITY: AddressType.sublocality,
  ADMINISTRATIVE_AREA_1: AddressType.administrative_area_level_1,
  NEIGHBORHOOD: AddressType.neighborhood,
  POSTAL_TOWN: AddressType.postal_town,
  SUBLOCALITY_LEVEL_1: AddressType.sublocality_level_1
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const response = await client.reverseGeocode({
      params: {
        latlng: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        key: apiKey,
      },
    });

    if (!response.data.results || response.data.results.length === 0) {
      return NextResponse.json(
        { error: 'No location details found' },
        { status: 404 }
      );
    }

    const result = response.data.results[0];
    const components = result.address_components;

    let city = '';
    let state = '';

    // Try to find city and state in address components
    for (const component of components) {
      if (component.types.includes(ADDRESS_TYPES.LOCALITY)) {
        city = component.long_name;
      } else if (!city && component.types.includes(ADDRESS_TYPES.SUBLOCALITY)) {
        // Fallback to sublocality if no locality found
        city = component.long_name;
      }
      if (component.types.includes(ADDRESS_TYPES.ADMINISTRATIVE_AREA_1)) {
        state = component.short_name;
      }
    }

    // If we still don't have a city, try to find it in other components
    if (!city) {
      for (const component of components) {
        if (component.types.includes(ADDRESS_TYPES.NEIGHBORHOOD) || 
            component.types.includes(ADDRESS_TYPES.POSTAL_TOWN) ||
            component.types.includes(ADDRESS_TYPES.SUBLOCALITY_LEVEL_1)) {
          city = component.long_name;
          break;
        }
      }
    }

    const locationDetails = {
      city,
      state,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      formattedAddress: result.formatted_address,
    };

    return NextResponse.json(locationDetails);
  } catch (error: any) {
    // Don't expose internal error details in production
    return NextResponse.json(
      { error: 'Failed to get location details' },
      { status: 500 }
    );
  }
}
