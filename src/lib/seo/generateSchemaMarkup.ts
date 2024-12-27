import type { SearchResult } from '@/types/search';

interface SchemaContext {
  city?: string;
  state?: string;
  siteUrl: string;
}

export function generateLocalBusinessSchema(business: SearchResult, context: SchemaContext) {
  const { city, state, siteUrl } = context;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteUrl}/business/${business.id}`,
    name: business.name,
    description: `Loaded tea club serving energizing teas, specialty drinks, and healthy shakes in ${business.city}, ${business.state}`,
    url: `${siteUrl}/${business.state.toLowerCase()}/${business.city.toLowerCase().replace(/ /g, '-')}`,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude
    },
    openingHoursSpecification: generateOpeningHours(business.hours),
    aggregateRating: business.rating && business.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviewCount
    } : undefined,
    servesCuisine: ['Loaded Tea', 'Energy Drinks', 'Specialty Drinks', 'Healthy Shakes'],
    priceRange: '$$',
    image: `${siteUrl}/images/businesses/${business.id}/main.jpg`
  };
}

export function generateSearchResultsSchema(results: SearchResult[], context: SchemaContext) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: results.map((result, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: generateLocalBusinessSchema(result, context)
      }))
    }
  };
}

function generateOpeningHours(hours?: SearchResult['hours']) {
  if (!hours) return undefined;

  const daysOfWeek = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return Object.entries(hours).map(([day, hours]) => {
    if (!hours || hours.toLowerCase() === 'closed') {
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: daysOfWeek[day as keyof typeof daysOfWeek],
        opens: '00:00',
        closes: '00:00'
      };
    }

    const [open, close] = hours.split('-').map(time => time.trim());
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: daysOfWeek[day as keyof typeof daysOfWeek],
      opens: open,
      closes: close
    };
  });
}
