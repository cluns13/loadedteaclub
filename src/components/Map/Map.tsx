'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
  }>;
}

export function Map({ center, zoom = 12, markers = [] }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleMarkers, setGoogleMarkers] = useState<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      try {
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center,
          zoom,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#c9c9c9' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#9e9e9e' }],
            },
          ],
        });
        setMap(mapInstance);
      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError(err.message || 'Failed to load map');
      }
    }).catch((err) => {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load Google Maps');
    });
  }, [center, zoom]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    googleMarkers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = markers.map(marker => {
      const googleMarker = new google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
        animation: google.maps.Animation.DROP,
      });

      // Add click listener for marker
      googleMarker.addListener('click', () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${marker.title}</h3>
            </div>
          `,
        });
        infoWindow.open(map, googleMarker);
      });

      return googleMarker;
    });

    setGoogleMarkers(newMarkers);

    // Center map on markers
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.position));
      map.fitBounds(bounds);
    } else {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, markers, center, zoom]);

  if (error) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden shadow-lg bg-white/50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-[var(--foreground-muted)]">
            Please check your Google Maps API configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
