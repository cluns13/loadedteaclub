import { NextRequest, NextResponse } from 'next/server';
import { PlacesService } from '@/lib/services/placesService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    const placesService = new PlacesService();
    const photos = await placesService.getPlacePhotos(placeId);

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching place photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
