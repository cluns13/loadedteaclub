import { Metadata } from 'next';
import { BusinessService } from '@/lib/db/services/businessService';
import { notFound } from 'next/navigation';

// This generates the static paths for known locations
export async function generateStaticParams() {
  const locations = await BusinessService.getAllLocations();
  return locations.map(({ city, state }) => ({
    city: city.toLowerCase().replace(/\s+/g, '-'),
    state: state.toLowerCase(),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { city: string; state: string } }): Promise<Metadata> {
  const city = params.city.replace(/-/g, ' ');
  const state = params.state.toUpperCase();
  
  return {
    title: `Loaded Tea in ${city}, ${state} | Find Nutrition Clubs Near You`,
    description: `Discover loaded tea clubs and nutrition shops in ${city}, ${state}. Find energizing drinks, protein shakes, and healthy smoothies near you.`,
    openGraph: {
      title: `Loaded Tea Locations in ${city}, ${state}`,
      description: `Find the best loaded tea and nutrition clubs in ${city}, ${state}. Energizing drinks, protein shakes, and healthy smoothies near you.`,
      images: ['/og-image.jpg'],
    },
    alternates: {
      canonical: `https://loadedteafinder.com/loaded-tea/${params.city}/${params.state}`,
    },
  };
}

export default async function LocationPage({ params }: { params: { city: string; state: string } }) {
  const city = params.city.replace(/-/g, ' ');
  const state = params.state.toUpperCase();
  
  const businesses = await BusinessService.findByLocation(city, state);
  
  if (!businesses || businesses.length === 0) {
    notFound();
  }

  // Schema.org structured data for local businesses
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: businesses.map((business, index) => ({
      '@type': 'LocalBusiness',
      '@id': `https://loadedteafinder.com/business/${business.id}`,
      position: index + 1,
      name: business.name,
      description: `${business.name} offers loaded teas, protein shakes, and healthy smoothies in ${city}, ${state}.`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address,
        addressLocality: business.city,
        addressRegion: business.state,
        postalCode: business.zipCode,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.latitude,
        longitude: business.longitude,
      },
      telephone: business.phone,
      url: business.website,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <h1 className="text-4xl font-bold mb-6">
        Loaded Tea in {city}, {state}
      </h1>
      
      <p className="text-lg mb-8">
        Discover the best loaded tea and nutrition clubs in {city}, {state}. 
        Our local clubs offer energizing drinks, protein shakes, and healthy smoothies.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <div key={business.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{business.name}</h2>
            <p className="text-gray-600 mb-2">{business.address}</p>
            {business.phone && (
              <p className="text-gray-600 mb-2">{business.phone}</p>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Visit Website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
