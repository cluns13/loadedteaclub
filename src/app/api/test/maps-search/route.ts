import { NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/services/googlePlacesService';
import { GoogleMapsService } from '@/lib/services/googleMapsService';

export async function GET(request: Request) {
  console.error('FULL DEBUG: Maps Search API Route Called');
  console.error('Full Request URL:', request.url);
  
  // Log all environment variables for debugging
  console.error('ENVIRONMENT VARIABLES:', {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'UNSET',
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY ? 'SET' : 'UNSET',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? 'SET' : 'UNSET',
  });

  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    
    console.error('Received Location:', { city, state });

    if (!city || !state) {
      console.error('ERROR: Missing city or state');
      return NextResponse.json(
        { error: 'City and state are required' },
        { status: 400 }
      );
    }

    // Check if API key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || 
                   process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                   process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.error('CRITICAL ERROR: No Google API key found');
      return NextResponse.json(
        { error: 'Google Maps API key is not configured' },
        { status: 500 }
      );
    }

    // Get coordinates for the city/state
    console.error('Attempting to get coordinates');
    const coords = await GoogleMapsService.getCoordinates(city, state);
    
    if (!coords) {
      console.error('ERROR: Could not get coordinates');
      return NextResponse.json(
        { error: 'Could not get coordinates for the provided city and state' },
        { status: 400 }
      );
    }

    console.error('Coordinates found:', coords);

    // Search for places near the coordinates
    const places = await GooglePlacesService.searchNearbyPlaces(
      coords.lat, 
      coords.lng
    );

    // Group places into in-city and nearby
    const inCityPlaces = places.filter(place => 
      place.city.toLowerCase() === city.toLowerCase() && 
      place.state.toLowerCase() === state.toLowerCase()
    );

    const nearbyPlaces = places.filter(place => 
      place.city.toLowerCase() !== city.toLowerCase() || 
      place.state.toLowerCase() !== state.toLowerCase()
    );

    console.error('Places found:', {
      inCityCount: inCityPlaces.length,
      nearbyCount: nearbyPlaces.length
    });

    return NextResponse.json({ 
      places: {
        inCity: inCityPlaces,
        nearby: nearbyPlaces
      }
    });
  } catch (error) {
    console.error('CRITICAL MAPS SEARCH FAILURE:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search places', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
