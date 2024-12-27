'use client';

import { LoadedTeaClub } from '@/types/models';
import { LoadedTeaClubCard } from '@/components/LoadedTeaClubCard';
import { Card } from '@/components/ui/Card';
import { MapPin, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SearchResultsProps {
  results: LoadedTeaClub[];
  searchQuery: string;
  isLoading?: boolean;
  error?: string;
}

export default function SearchResults({ 
  results = [], 
  searchQuery, 
  isLoading = false,
  error
}: SearchResultsProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-white/5 rounded-2xl mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Oops!</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Back to Home
        </Link>
      </Card>
    );
  }

  // Show empty state if no results and no error
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <Search className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
        <p className="text-gray-400 mb-4">
          Try searching for a different location or check your spelling
        </p>
        <div className="text-sm text-gray-400">
          Popular cities: Jacksonville, Orlando, Tampa, Miami
        </div>
      </Card>
    );
  }

  // Show results
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
        </h2>
        <div className="text-sm text-gray-400">
          <MapPin className="inline-block w-4 h-4 mr-1" />
          {searchQuery}
        </div>
      </div>

      <div className="grid gap-6">
        {results.map((business) => (
          <LoadedTeaClubCard 
            key={business.id} 
            business={business}
          />
        ))}
      </div>
    </div>
  );
}
