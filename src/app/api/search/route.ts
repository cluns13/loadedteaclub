import { NextRequest, NextResponse } from 'next/server';
import { CityService } from '@/lib/db/services/cityService';
import { LocationService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    let searchCoords = null;
    if (lat && lng) {
      searchCoords = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }

    // If no search parameters provided, return error
    if (!city && !state && !searchCoords) {
      return NextResponse.json(
        { error: 'Please provide search parameters' },
        { status: 400 }
      );
    }

    // Log search parameters
    console.log('Search parameters:', {
      city,
      state,
      searchCoords
    });

    // Search for businesses
    const businesses = await CityService.findBusinesses(
      city || '',
      state || '',
      searchCoords
    );
    console.log(`Found ${businesses?.length || 0} businesses in database`);

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
