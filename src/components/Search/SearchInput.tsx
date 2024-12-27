'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, MapPin } from 'lucide-react';
import { STATES } from '@/lib/constants';

interface SearchInputProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  showLocationDetection?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchInputComponent = ({ 
  onSearch = () => {}, 
  initialQuery = '',
  showLocationDetection = false,
  placeholder = "Enter city name",
  className = ''
}: SearchInputProps) => {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [selectedState, setSelectedState] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchQuery.trim()) {
      setLocationError('Please enter a city name');
      return;
    }

    const formattedQuery = `${searchQuery}, ${selectedState}`;
    onSearch(formattedQuery);
    router.push(`/search?q=${encodeURIComponent(formattedQuery)}`);
  }, [selectedState, router, onSearch]);

  const updateSuggestions = useCallback(
    debounce((value: string) => {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      const filtered = STATES.filter(state =>
        state.name.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(filtered.map(state => state.name));
    }, 300),
    []
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateSuggestions(value);
  }, [updateSuggestions]);

  const handleStateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }, [handleSearch, query]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const response = await fetch(`/api/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
      if (!response.ok) throw new Error('Failed to get location');
      
      const data = await response.json();
      if (data.city) {
        setQuery(data.city);
        if (data.state) setSelectedState(data.state);
        handleSearch(data.city);
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setLocationError('Could not detect your location. Please enter it manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  }, [handleSearch]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {locationError && (
        <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg backdrop-blur-sm">
          {locationError}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-low w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-md input-primary"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-light-low hover:text-light-medium p-1 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={selectedState}
          onChange={handleStateChange}
          className="w-full sm:w-40 px-4 py-2 rounded-md input-primary appearance-none cursor-pointer"
        >
          <option value="">Select State</option>
          {STATES.map((state) => (
            <option key={state.code} value={state.code} className="text-light-high">
              {state.name}
            </option>
          ))}
        </select>

        {showLocationDetection && (
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="px-3 py-2 rounded-md input-primary hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MapPin className="w-5 h-5" />
          </button>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 btn-primary rounded-md"
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute inset-x-0 top-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    setQuery(suggestion);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    handleSearch(suggestion);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/5 transition-colors"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function SearchInput(props: SearchInputProps) {
  return (
    <React.Suspense fallback={<div className="w-full h-[200px] bg-white/5 animate-pulse rounded-xl" />}>
      <SearchInputComponent {...props} />
    </React.Suspense>
  );
}
