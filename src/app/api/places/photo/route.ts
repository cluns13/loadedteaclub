import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  const maxwidth = searchParams.get('maxwidth') || '400';

  if (!reference) {
    return NextResponse.json(
      { error: 'Photo reference is required' },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key is not configured');
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await client.placePhoto({
      params: {
        photoreference: reference,
        maxwidth: Number(maxwidth),
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
      responseType: 'arraybuffer',
    });

    // Return the photo as a response with the correct content type
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error: any) {
    console.error('Error fetching place photo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place photo' },
      { status: 500 }
    );
  }
}
