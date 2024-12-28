import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Star } from 'lucide-react';
import { MetadataGenerator } from '@/lib/utils/metadata';
import { CityService } from '@/lib/db/services/cityService';
import { generateStaticCityPaths } from '@/lib/utils/staticPaths';
import SearchResults from '@/components/SearchResults/SearchResults';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { CityData, SearchResult } from '@/types/cityTypes';

export async function generateStaticParams() {
  return generateStaticCityPaths();
}

export async function generateMetadata({ 
  params 
}: { 
  params: { 
    city: string; 
    state: string; 
  } 
}): Promise<Metadata> {
  // Normalize city and state
  const normalizedCity = params.city.replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  const normalizedState = params.state.toUpperCase();

  // Get city data to enrich metadata
  const cityData = await CityService.getCityData(normalizedCity, normalizedState);
  
  // Generate location-specific metadata
  return {
    ...MetadataGenerator.getLocationMetadata(normalizedCity, normalizedState),
    alternates: {
      canonical: `/${normalizedState.toLowerCase()}/${params.city}`
    },
    openGraph: {
      ...(cityData?.businesses?.[0]?.photos?.[0] && {
        images: [cityData.businesses[0].photos[0]]
      })
    }
  };
}

export default async function CityPage({ 
  params 
}: { 
  params: { 
    city: string; 
    state: string; 
  } 
}) {
  // Normalize city name
  const city = params.city.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const state = params.state.toUpperCase();
  
  // Fetch city data
  const cityData: CityData | null = await CityService.getCityData(city, state);
  
  if (!cityData) {
    return notFound();
  }

  // Destructure with default values and type safety
  const { 
    businesses = [], 
    totalBusinesses = 0, 
    cityStats = { 
      totalReviews: 0, 
      averageRating: 0,
      claimedBusinesses: 0 
    },
    averageRating = 0
  } = cityData || {};

  // Convert LoadedTeaClub to SearchResult with type-safe hours mapping
  const searchResults: SearchResult[] = businesses.map(business => {
    // Transform BusinessHours to array format for SearchResult
    const transformedHours = business.hours ? Object.entries(business.hours).map(([day, hours]) => ({
      open: hours.open,
      close: hours.close,
      day: day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
      isOpen: hours.isOpen
    })) : [];

    return {
      ...business,
      hours: transformedHours
    };
  });

  // Ensure averageRating is always available
  const displayAverageRating = cityStats?.averageRating ?? averageRating ?? 0;
  const displayTotalReviews = cityStats?.totalReviews ?? 0;

  const schemaData = {
    '@type': 'City',
    name: `${city}, ${state}`,
    description: `Discover ${totalBusinesses} loaded tea clubs serving energizing drinks and healthy shakes.`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: displayAverageRating,
      reviewCount: displayTotalReviews
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SchemaMarkup data={schemaData} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary py-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-6 w-6 text-white/80" />
                <h2 className="text-xl font-medium text-white/80">
                  {city}, {state}
                </h2>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Find Loaded Tea Clubs
                <span className="block mt-2 bg-gradient-to-r from-white to-white/80">
                  Near You in {city}
                </span>
              </h1>
            </div>
            <p className="text-xl text-white/90 mb-8">
              Discover {totalBusinesses} loaded tea clubs serving energizing drinks and healthy shakes.
              {displayAverageRating > 0 && (
                <span className="ml-1">
                  Rated {displayAverageRating.toFixed(1)}★ from {displayTotalReviews.toLocaleString()} reviews.
                </span>
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <LoadingButton
                as="a"
                href="#locations"
                variant="secondary"
                size="lg"
              >
                <MapPin className="h-5 w-5 mr-2" />
                View All Locations
              </LoadingButton>
              <LoadingButton
                as="a"
                href="#popular"
                variant="primary"
                size="lg"
              >
                <Star className="h-5 w-5 mr-2" />
                Top Rated Clubs
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <section id="locations" className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Loaded Tea Clubs in {city}
            </h2>
            <p className="text-xl text-gray-600">
              {totalBusinesses} clubs serving energizing and healthy drinks
            </p>
          </div>
          
          <SearchResults
            results={searchResults}
            city={city}
            state={state}
          />
        </div>
      </section>
    </main>
  );
}
