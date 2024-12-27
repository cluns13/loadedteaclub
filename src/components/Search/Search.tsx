'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchProps, SearchState, SearchResult } from '@/types/search';

export default function Search({ onSearchResults, initialCity, initialState }: SearchProps) {
  const router = useRouter();
  const [state, setState] = useState<SearchState>({
    location: initialCity && initialState ? `${initialCity}, ${initialState}` : '',
    loading: false,
    error: null,
    resultCount: null,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('%c Search started', 'background: #222; color: #bada55');
    
    setState(prev => ({ ...prev, loading: true, error: null, resultCount: null }));

    try {
      // Parse city and state from location
      const locationParts = state.location.split(',').map(s => s.trim());
      const city = locationParts[0];
      const stateInput = locationParts[1] || '';

      console.group('Search Details');
      console.log('Location input:', state.location);
      console.log('Parsed city:', city);
      console.log('Parsed state:', stateInput);
      console.groupEnd();

      // Update URL with search parameters
      const searchParams = new URLSearchParams();
      searchParams.set('city', city);
      if (stateInput) {
        searchParams.set('state', stateInput);
      }
      
      const searchUrl = `/api/search?${searchParams.toString()}`;
      console.log('Making API request to:', searchUrl);

      // Fetch results
      const response = await fetch(searchUrl);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Search response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      const results: SearchResult[] = data.results;
      console.log('Found results:', results.length);
      
      // Only update URL if we have both city and state
      if (city && stateInput) {
        const formattedCity = city.toLowerCase().replace(/ /g, '-');
        const formattedState = stateInput.toLowerCase();
        const newPath = `/${formattedState}/${formattedCity}`;
        console.log('Updating URL to:', newPath);
        router.push(newPath);
      }

      onSearchResults(results);
      setState(prev => ({ ...prev, resultCount: results.length }));
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search. Please try again.',
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
      console.log('%c Search completed', 'background: #222; color: #bada55');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form 
        onSubmit={handleSearch} 
        className="space-y-4"
        onClick={() => console.log('Form clicked')}
      >
        <div className="relative">
          <input
            type="text"
            value={state.location}
            onChange={(e) => {
              console.log('Input changed:', e.target.value);
              setState(prev => ({ ...prev, location: e.target.value }));
            }}
            placeholder="Enter city and state (e.g., Tallahassee, FL)"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
            disabled={state.loading}
            aria-label="Search location"
          />
          {state.loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-400"></div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={state.loading}
          className={`w-full px-6 py-3 bg-teal-400 text-white rounded-lg hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-colors ${
            state.loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={state.loading ? 'Searching...' : 'Search'}
          onClick={() => console.log('Search button clicked')}
        >
          {state.loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {state.error && (
        <div className="mt-4 text-red-500 text-sm text-center" role="alert">
          {state.error}
        </div>
      )}

      {state.resultCount !== null && (
        <div className="mt-8 mb-2 text-lg text-gray-600">
          {state.resultCount === 0 ? (
            'No nutrition clubs found. Try another location or different search terms.'
          ) : (
            `Found ${state.resultCount} nutrition ${state.resultCount === 1 ? 'club' : 'clubs'}`
          )}
        </div>
      )}
    </div>
  );
}
