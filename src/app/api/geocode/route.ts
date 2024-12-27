import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Extensive debug logging
  console.error('FULL DEBUG: Geocode API Route Called');
  console.error('Full Request URL:', request.url);
  
  // Log all environment variables for debugging
  console.error('ENVIRONMENT VARIABLES:', {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'UNSET',
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY ? 'SET' : 'UNSET',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? 'SET' : 'UNSET',
  });

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  console.error('Received Coordinates:', { lat, lng });

  if (!lat || !lng) {
    console.error('ERROR: Missing latitude or longitude');
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  // Prefer GOOGLE_MAPS_API_KEY, fallback to others
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.error('CRITICAL ERROR: No Google API key found');
    return NextResponse.json(
      { error: 'Missing API key configuration' },
      { status: 500 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    console.error('Geocoding Request URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.error('Google Geocoding API Full Response:', JSON.stringify(data, null, 2));
    
    if (data.status !== 'OK') {
      console.error('GEOCODING ERROR:', {
        status: data.status,
        error_message: data.error_message,
      });
      throw new Error(`Google API Error: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`);
    }

    // Extract city and state from address components
    const addressComponents = data.results[0]?.address_components || [];
    
    const cityComponent = addressComponents.find((component: any) => 
      component.types.includes('locality') || component.types.includes('administrative_area_level_1')
    );
    
    const stateComponent = addressComponents.find((component: any) => 
      component.types.includes('administrative_area_level_1')
    );

    const city = cityComponent?.long_name || 'Unknown City';
    const state = stateComponent?.short_name || 'Unknown State';

    console.error('Extracted Location:', { city, state });

    return NextResponse.json({
      city,
      state,
      formatted_address: data.results[0]?.formatted_address,
      location: data.results[0]?.geometry?.location
    });

  } catch (error) {
    console.error('CRITICAL GEOCODING FAILURE:', error);
    return NextResponse.json(
      { error: 'Failed to geocode location', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
