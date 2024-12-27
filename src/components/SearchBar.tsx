import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from './ui/Input';
import { LoadingButton } from './ui/LoadingButton';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  placeholder?: string;
  autoDetectLocation?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = 'Enter your city or detect location...',
  autoDetectLocation = true,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      setError(null);
      await onSearch(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const detectLocation = () => {
    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          
          if (!response.ok) throw new Error('Failed to get location');
          
          const data = await response.json();
          const city = data.results[0]?.address_components.find(
            (c: any) => c.types.includes('locality')
          )?.long_name;

          if (city) {
            setQuery(city);
            await onSearch(city);
          } else {
            throw new Error('Could not determine your city');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Location detection failed');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setError('Please enable location services to use this feature');
        setIsDetectingLocation(false);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-11"
              error={error}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-dimmed)]" />
          </div>

          <LoadingButton
            type="submit"
            isLoading={isSearching}
            disabled={!query.trim()}
          >
            Search
          </LoadingButton>

          {autoDetectLocation && (
            <LoadingButton
              type="button"
              onClick={detectLocation}
              isLoading={isDetectingLocation}
              variant="secondary"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Detect
            </LoadingButton>
          )}
        </div>
      </div>
    </form>
  );
}
