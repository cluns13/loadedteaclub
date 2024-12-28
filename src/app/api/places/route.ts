import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';
import { headers } from 'next/headers';
import { LRUCache } from 'lru-cache';

const client = new Client({});
const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SEARCH_RADIUS = 25000; // 25km
const SEARCH_KEYWORDS = [
  'juice shop',
  'nutrition shop',
  'loaded tea',
  'lit tea'
];

// In-memory cache
const cache = new LRUCache({
  max: 100, // Maximum number of items
  ttl: 1000 * 60 * 60, // 1 hour
});

// Simple rate limiter using a Map
const rateLimit = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function POST(request: Request) {
  try {
    // Rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    // Clean up old rate limit entries
    for (const [key, timestamp] of rateLimit.entries()) {
      if (timestamp < windowStart) {
        rateLimit.delete(key);
      }
    }
    
    // Count requests in current window
    const requestCount = Array.from(rateLimit.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
      .length;
    
    if (requestCount >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    // Add current request to rate limit
    rateLimit.set(`${ip}:${now}`, now);

    const { city, state } = await request.json();
    console.log('Searching for:', { city, state });

    // Check cache
    const cacheKey = `places:${city.toLowerCase()}:${state.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for:', cacheKey);
      return NextResponse.json({ businesses: cached });
    }

    // Get coordinates
    const geocodeResponse = await client.geocode({
      params: {
        address: `${city}, ${state}`,
        key: PLACES_API_KEY!
      }
    });

    if (geocodeResponse.data.results.length === 0) {
      console.log('Location not found');
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    console.log('Coordinates:', { lat, lng });
    
    const businesses = [];
    const seenPlaceIds = new Set<string>();

    // Search for each keyword
    for (const keyword of SEARCH_KEYWORDS) {
      console.log('Searching for keyword:', keyword);
      
      const response = await client.placesNearby({
        params: {
          location: { lat, lng },
          radius: SEARCH_RADIUS,
          keyword: keyword ?? '',
          key: PLACES_API_KEY ?? ''
        }
      });

      console.log(`Found ${response.data.results.length} results for "${keyword ?? ''}"`);

      for (const place of response.data.results) {
        if (!place.place_id || seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);

        // Get place details
        console.log('Getting details for:', place.name ?? 'Unknown Place');
        const detailsResponse = await client.placeDetails({
          params: {
            place_id: place.place_id,
            fields: ['formatted_address', 'formatted_phone_number', 'website', 'opening_hours'],
            key: PLACES_API_KEY ?? ''
          }
        });

        const details = detailsResponse.data.result;
        if (!details.formatted_address) continue;

        // Parse address
        const addressParts = details.formatted_address.split(',').map(part => part.trim());
        const street = addressParts[0] ?? '';
        const city = addressParts[1] ?? '';
        const stateZip = addressParts[2] ?? '';
        const stateCode = stateZip.split(' ')[0] ?? '';

        // Safely handle periods and geometry
        const safeBusinessHours = details.opening_hours?.periods?.map(period => ({
          open: period.open?.time ?? '',
          close: period.close?.time ?? '',
          day: period.open?.day ?? 0
        })) ?? [];

        const location = place.geometry?.location ? {
          lat: place.geometry.location.lat || 0,
          lng: place.geometry.location.lng || 0
        } : { lat: 0, lng: 0 };

        businesses.push({
          placeId: place.place_id,
          name: place.name ?? '',
          address: street,
          city: city,
          state: stateCode,
          latitude: location.lat,
          longitude: location.lng,
          phone: details.formatted_phone_number ?? '',
          website: details.website ?? '',
          hours: safeBusinessHours,
          rating: place.rating ?? 0,
          reviewCount: place.user_ratings_total ?? 0,
          isVerified: false,
          isClaimed: false,
          createdAt: new Date(),
          menu: [],
          images: place.photos?.map(photo => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${PLACES_API_KEY}`
          ) ?? [],
          source: 'google-places'
        });
      }
    }

    console.log(`Found ${businesses.length} total unique businesses`);
    
    // Cache the results
    cache.set(cacheKey, businesses);

    return NextResponse.json(
      { businesses },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600'
        }
      }
    );
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to search for places' },
      { status: 500 }
    );
  }
}
