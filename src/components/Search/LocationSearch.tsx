'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { LoadingButton } from '../ui/LoadingButton';
import { Card } from '../ui/Card';
import { LocationService, GooglePlacesService, BrowserGeolocationService } from '@/lib/services';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LocationError } from '@/types/errors';

interface LocationNotificationProps {
  city: string;
  state: string;
  onAccept: () => void;
  onDismiss: () => void;
}

function LocationNotification({ city, state, onAccept, onDismiss }: LocationNotificationProps) {
  return (
    <Card className="fixed bottom-4 right-4 p-4 max-w-md bg-white shadow-lg animate-slideUp border border-gray-200">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-[var(--primary)] flex-shrink-0 mt-1" />
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100">
            Do you want to find loaded tea clubs in{' '}
            <span className="font-semibold text-[var(--primary)]">
              {city}, {state}
            </span>
            ?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onAccept}
              className="text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-3 py-1.5 rounded"
            >
              Yes, show me
            </button>
            <button
              onClick={onDismiss}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 px-2 py-1.5"
            >
              No, thanks
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface LocationSearchProps {
  placeholder?: string;
}

export function LocationSearch({ placeholder = "Search location or use current location..." }: LocationSearchProps) {
  const router = useRouter();
  const { error, isError, handleError, clearError } = useErrorHandler();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationService, setLocationService] = useState<LocationService | null>(null);
  const [locationNotification, setLocationNotification] = useState<{
    city: string;
    state: string;
  } | null>(null);

  useEffect(() => {
    // Initialize services
    const map = new google.maps.Map(document.createElement('div'));
    const placesService = new GooglePlacesService(map);
    const geolocationService = new BrowserGeolocationService();
    const service = new LocationService(placesService, geolocationService);
    setLocationService(service);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      handleError(new LocationError('Please enter a location'));
      return;
    }

    if (!locationService) {
      handleError(new LocationError('Location service not initialized'));
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      if (!locationService.getLocationFromSearch) {
        throw new LocationError('Location search not supported');
      }

      const locationDetails = await locationService.getLocationFromSearch(searchQuery);
      if (locationDetails) {
        const url = locationService.formatLocationUrl(locationDetails.city, locationDetails.state);
        router.push(url);
      } else {
        handleError(new LocationError('Location not found. Please try again.'));
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, locationService, router, handleError, clearError]);

  const detectLocation = useCallback(async () => {
    if (!locationService) {
      handleError(new LocationError('Location service not initialized'));
      return;
    }

    setIsLoading(true);
    clearError();
    setLocationNotification(null);

    try {
      const { city, state } = await locationService.getCurrentLocationCityState();
      const url = locationService.formatLocationUrl(city, state);
      router.push(url);
    } catch (error) {
      handleError(error);
      setLocationNotification(null);
    } finally {
      setIsLoading(false);
    }
  }, [locationService, router, handleError, clearError]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAcceptLocation = () => {
    if (!locationService) {
      handleError(new LocationError('Location service not initialized'));
      return;
    }

    if (locationNotification) {
      const url = locationService.formatLocationUrl(locationNotification.city, locationNotification.state);
      router.push(url);
      setLocationNotification(null);
    }
  };

  useEffect(() => {
    // Auto-detect location when component mounts
    detectLocation().catch(err => {
      console.error('Initial location detection failed:', err);
    });
  }, [detectLocation]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <div className="relative">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative flex bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full h-12 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-gray-900 placeholder-gray-400"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Error Message */}
                {isError && error && (
                  <p className="mt-2 text-sm text-red-600">{error.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Search Button */}
                <LoadingButton
                  onClick={handleSearch}
                  isLoading={isLoading}
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </LoadingButton>

                {/* Current Location Button */}
                <LoadingButton
                  onClick={detectLocation}
                  isLoading={isLoading}
                  variant="secondary"
                  size="lg"
                  className="aspect-square border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center shadow-sm p-0"
                >
                  <MapPin className="h-5 w-5" />
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Notification */}
      {locationNotification && (
        <LocationNotification
          city={locationNotification.city}
          state={locationNotification.state}
          onAccept={handleAcceptLocation}
          onDismiss={() => setLocationNotification(null)}
        />
      )}
    </div>
  );
}
