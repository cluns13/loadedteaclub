'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { LoadedTeaClub } from '@/types/models';
import SearchResults from '@/components/Search/SearchResults';
import { searchBusinesses } from '@/lib/services/searchService';
import SearchInput from '@/components/Search/SearchInput';

interface SearchState {
  results: LoadedTeaClub[];
  searchQuery: string;
  isLoading: boolean;
  error: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    searchQuery: initialQuery,
    isLoading: false,
    error: ''
  });

  useEffect(() => {
    const performSearch = async () => {
      if (!initialQuery) {
        setSearchState(prev => ({ 
          ...prev, 
          results: [], 
          isLoading: false,
          error: 'Please enter a location to search'
        }));
        return;
      }

      // Validate query format (city, state)
      const [city, state] = initialQuery.split(',').map(s => s.trim());
      if (!city || !state) {
        setSearchState(prev => ({
          ...prev,
          error: 'Please enter both city and state (e.g., "St. Augustine, FL")',
          isLoading: false
        }));
        return;
      }

      setSearchState(prev => ({ ...prev, isLoading: true, error: '' }));

      try {
        const results = await searchBusinesses({ location: initialQuery });
        
        setSearchState(prev => ({
          ...prev,
          results,
          isLoading: false,
          error: results.length === 0 ? `No results found in ${city}, ${state}` : ''
        }));
      } catch (error) {
        console.error('Search error:', error);
        setSearchState(prev => ({
          ...prev,
          results: [],
          isLoading: false,
          error: 'Failed to fetch search results. Please try again.'
        }));
      }
    };

    performSearch();
  }, [initialQuery]);

  const handleSearch = (query: string) => {
    setSearchState(prev => ({
      ...prev,
      searchQuery: query,
      isLoading: true
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <SearchInput
            initialQuery={searchState.searchQuery}
            onSearch={handleSearch}
            showLocationDetection={true}
            placeholder="Enter city name..."
          />

          <SearchResults 
            results={searchState.results}
            searchQuery={searchState.searchQuery}
            isLoading={searchState.isLoading}
            error={searchState.error}
          />
        </div>
      </div>
    </div>
  );
}
