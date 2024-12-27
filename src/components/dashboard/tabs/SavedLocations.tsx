'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';

interface SavedLocation {
  _id: string;
  businessId: string;
  business: {
    name: string;
    address: string;
    city: string;
    state: string;
    rating: number;
    imageUrl?: string;
  };
  savedAt: string;
}

export default function SavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedLocations = async () => {
      try {
        const response = await fetch('/api/user/saved-locations');
        if (!response.ok) {
          throw new Error('Failed to fetch saved locations');
        }
        const data = await response.json();
        setLocations(data.locations);
      } catch (err) {
        setError('Failed to load saved locations');
        console.error('Error fetching saved locations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedLocations();
  }, []);

  const handleUnsave = async (businessId: string) => {
    try {
      const response = await fetch('/api/user/saved-locations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsave location');
      }

      setLocations(locations.filter(loc => loc.businessId !== businessId));
    } catch (err) {
      console.error('Error unsaving location:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          No Saved Locations Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Save your favorite nutrition clubs to easily find them later.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Explore Nutrition Clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((location) => (
        <div
          key={location._id}
          className="relative bg-white border rounded-lg shadow-sm overflow-hidden"
        >
          {location.business.imageUrl ? (
            <img
              src={location.business.imageUrl}
              alt={location.business.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  <Link href={`/business/${location.businessId}`} className="hover:underline">
                    {location.business.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {location.business.city}, {location.business.state}
                </p>
              </div>
              <button
                onClick={() => handleUnsave(location.businessId)}
                className="text-red-500 hover:text-red-600"
              >
                <HeartIconSolid className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < location.business.rating
                        ? 'text-yellow-400'
                        : 'text-gray-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {location.business.rating.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {location.business.address}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
