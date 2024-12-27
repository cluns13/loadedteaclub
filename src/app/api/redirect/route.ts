import { NextResponse } from 'next/server';
import { LocationService } from '@/lib/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const near = searchParams.get('near');

    // Handle "near me" searches
    if (near === 'me' && lat && lng) {
      const locationUrl = await LocationService.findNearestLocation(
        parseFloat(lat),
        parseFloat(lng)
      );

      if (locationUrl) {
        return NextResponse.redirect(new URL(locationUrl, request.url));
      }
    }

    // If no location found or invalid parameters, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
