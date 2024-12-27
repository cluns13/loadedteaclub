import { NextResponse } from 'next/server';
import { getPlacePhotos } from '@/lib/services/placesService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const forceUpdate = searchParams.get('forceUpdate') === 'true';

  if (!placeId) {
    return NextResponse.json(
      { error: 'Place ID is required' },
      { status: 400 }
    );
  }

  try {
    const photos = await getPlacePhotos(placeId, forceUpdate);
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching place photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
