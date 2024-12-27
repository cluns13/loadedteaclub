import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function GET(request: Request) {
  // Extensive debug logging
  console.error('FULL DEBUG: Places Details Route Called');
  console.error('Full Request URL:', request.url);
  
  // Log all environment variables for debugging
  console.error('ENVIRONMENT VARIABLES:', {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'UNSET',
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY ? 'SET' : 'UNSET',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? 'SET' : 'UNSET',
  });

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place_id');
  const fields = searchParams.get('fields')?.split(',');

  console.error('Received Parameters:', { placeId, fields });

  if (!placeId) {
    console.error('ERROR: Place ID is missing');
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  // Prefer GOOGLE_MAPS_API_KEY, fallback to others
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 
                 process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL ERROR: No Google API key found');
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  try {
    console.error('Calling Places Details API with:', { 
      placeId, 
      fields, 
      apiKeyPrefix: apiKey.substring(0, 8) + '...' 
    });
    
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: fields || undefined,
        key: apiKey,
      },
    });

    console.error('Places Details API Full Response:', {
      status: response.data.status,
      result: response.data.result ? 'PRESENT' : 'MISSING',
    });

    if (response.data.status !== 'OK') {
      console.error('Places API Non-OK Status:', {
        status: response.data.status,
        error_message: response.data.error_message,
      });
      return NextResponse.json(
        { error: `Places API error: ${response.data.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('CRITICAL PLACES DETAILS FAILURE:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response?.data,
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch place details', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
