'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Claim {
  _id: string;
  businessId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  business: {
    name: string;
    city: string;
    state: string;
  };
}

export default function BusinessClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/user/claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const data = await response.json();
        setClaims(data.claims);
      } catch (err) {
        setError('Failed to load claims');
        console.error('Error fetching claims:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, []);

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

  if (claims.length === 0) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          No Business Claims Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start managing your business by claiming your listing.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Search for Your Business
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {claims.map((claim) => (
          <li key={claim._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {claim.business.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {claim.business.city}, {claim.business.state}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      claim.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : claim.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {claim.status === 'approved' && (
                  <div className="mt-2 sm:mt-0">
                    <Link
                      href={`/business/manage/${claim.businessId}`}
                      className="text-sm text-green-600 hover:text-green-500"
                    >
                      Manage Business →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
