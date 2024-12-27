import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Star, Clock, Zap, Navigation } from 'lucide-react';
import { MetadataGenerator } from '@/lib/utils/metadata';
import { CityService } from '@/lib/db/services/cityService';
import { generateStaticCityPaths } from '@/lib/utils/staticPaths';
import SearchResults from '@/components/SearchResults/SearchResults';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { Card } from '@/components/ui/Card';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { LoadedTeaClub } from '@/types/models';
import { CityData } from '@/types/cityTypes';

interface CityPageProps {
  params: {
    city: string;
    state: string;
  };
}

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

function generateCitySchema(cityData: CityData | null) {
  if (!cityData) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    'name': cityData.businesses[0].city,
    'containsPlace': cityData.businesses.map(business => ({
      '@type': 'FoodEstablishment',
      'name': business.name,
      'image': business.images?.[0],
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': business.address,
        'addressLocality': business.city,
        'addressRegion': business.state,
        'postalCode': business.zipCode
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': business.latitude,
        'longitude': business.longitude
      },
      'aggregateRating': business.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': business.rating,
        'reviewCount': business.reviewCount
      } : undefined,
      'openingHours': business.hours,
      'servesCuisine': ['Loaded Tea', 'Energy Drinks', 'Healthy Beverages'],
      'priceRange': '$$',
      'telephone': business.phone
    }))
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

  // Destructure city data
  const { 
    businesses, 
    totalBusinesses, 
    averageRating, 
    cityStats,
    popularItems,
    topRated,
    nearbyCities
  } = cityData;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SchemaMarkup data={generateCitySchema(cityData)} />
      
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
              {cityStats.averageRating > 0 && (
                <span className="ml-1">
                  Rated {cityStats.averageRating.toFixed(1)}★ from {cityStats.totalReviews.toLocaleString()} reviews.
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
                Popular Drinks
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--primary)]/10">
                <Star className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Top Rated
                </h3>
                <p className="text-[var(--foreground-muted)]">
                  {cityStats.averageRating.toFixed(1)}★ Average
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--primary)]/10">
                <MapPin className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Locations
                </h3>
                <p className="text-[var(--foreground-muted)]">
                  {totalBusinesses} Clubs
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--primary)]/10">
                <Clock className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Open Now
                </h3>
                <p className="text-[var(--foreground-muted)]">
                  {businesses.filter(b => b.isOpen).length} Available
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Popular Items */}
        {popularItems && popularItems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-[var(--primary)]" />
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Popular in {city}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularItems.map((item, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[var(--secondary)] rounded-xl text-[var(--foreground)] text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Top Rated Section */}
        {topRated && topRated.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-[var(--primary)]" />
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Highest Rated Clubs
              </h2>
            </div>
            <SearchResults
              results={topRated as LoadedTeaClub[]}
              city={city}
              state={state}
            />
          </section>
        )}

        {/* All Locations */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-6 w-6 text-[var(--primary)]" />
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              All Locations
            </h2>
          </div>
          <SearchResults
            results={businesses as LoadedTeaClub[]}
            city={city}
            state={state}
          />
        </section>

        {/* Nearby Cities */}
        {nearbyCities && nearbyCities.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Navigation className="h-6 w-6 text-[var(--primary)]" />
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Nearby Cities
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nearbyCities.map((nearbyCity) => (
                <LoadingButton
                  key={nearbyCity.name}
                  as="a"
                  href={`/${nearbyCity.state.toLowerCase()}/${nearbyCity.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {nearbyCity.name}, {nearbyCity.state}
                </LoadingButton>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
