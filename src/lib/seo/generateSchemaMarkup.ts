import { SearchResult } from '@/types/search';
import { LoadedTeaClub } from '@/types/models';

// Enhanced schema context with more details
interface SchemaContext {
  city: string;
  state: string;
  siteUrl: string;
  brandName: string;
  contactEmail?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// Type-safe schema generation with comprehensive error handling
export class SchemaMarkupGenerator {
  // Validate and sanitize business data
  private static sanitizeBusinessData(
    business: SearchResult | LoadedTeaClub, 
    context: SchemaContext
  ): Partial<SearchResult> {
    return {
      id: business.id || 'unknown',
      name: business.name || 'Unnamed Business',
      city: business.city || context.city,
      state: business.state || context.state,
      address: business.address || '',
      phone: business.phone || '',
      location: business.location || undefined,
      hours: business.hours || undefined,
      rating: business.rating || undefined,
      reviewCount: business.reviewCount || undefined
    };
  }

  // Generate local business schema with comprehensive details
  static generateLocalBusinessSchema(
    business: SearchResult | LoadedTeaClub, 
    context: SchemaContext
  ) {
    const sanitizedBusiness = this.sanitizeBusinessData(business, context);
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': `${context.siteUrl}/business/${sanitizedBusiness.id}`,
      name: sanitizedBusiness.name,
      description: `${context.brandName} serving energizing teas, specialty drinks, and healthy shakes in ${sanitizedBusiness.city}, ${sanitizedBusiness.state}`,
      url: `${context.siteUrl}/${sanitizedBusiness.state?.toLowerCase()}/${sanitizedBusiness.city?.toLowerCase().replace(/ /g, '-')}`,
      telephone: sanitizedBusiness.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: sanitizedBusiness.address || '',
        addressLocality: sanitizedBusiness.city,
        addressRegion: sanitizedBusiness.state,
        addressCountry: 'US'
      },
      geo: sanitizedBusiness.location ? {
        '@type': 'GeoCoordinates',
        latitude: sanitizedBusiness.location.lat,
        longitude: sanitizedBusiness.location.lng
      } : undefined,
      openingHoursSpecification: this.generateOpeningHours(sanitizedBusiness.hours),
      aggregateRating: sanitizedBusiness.rating && sanitizedBusiness.reviewCount ? {
        '@type': 'AggregateRating',
        ratingValue: sanitizedBusiness.rating,
        reviewCount: sanitizedBusiness.reviewCount
      } : undefined,
      servesCuisine: [
        'Loaded Tea', 
        'Energy Drinks', 
        'Specialty Drinks', 
        'Healthy Shakes'
      ],
      priceRange: '$$',
      image: `${context.siteUrl}/images/businesses/${sanitizedBusiness.id}/main.jpg`,
      contactPoint: context.contactEmail ? {
        '@type': 'ContactPoint',
        email: context.contactEmail,
        contactType: 'Customer Service'
      } : undefined,
      sameAs: Object.values(context.socialMediaLinks || {})
        .filter(Boolean)
    };
  }

  // Generate search results schema with enhanced structure
  static generateSearchResultsSchema(
    results: (SearchResult | LoadedTeaClub)[], 
    context: SchemaContext
  ) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      name: `Tea Clubs in ${context.city}, ${context.state}`,
      description: `Find the best tea clubs and loaded tea locations in ${context.city}, ${context.state}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: results.map((result, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: this.generateLocalBusinessSchema(result, context)
        }))
      }
    };
  }

  // Robust opening hours generation with comprehensive handling
  private static generateOpeningHours(hours?: SearchResult['hours']) {
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

    return Object.entries(hours).map(([day, hoursStr]) => {
      // Handle various hour format variations
      if (!hoursStr || 
          hoursStr.toLowerCase() === 'closed' || 
          hoursStr.trim() === '') {
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: daysOfWeek[day as keyof typeof daysOfWeek],
          opens: '00:00',
          closes: '00:00'
        };
      }

      // Normalize and parse hours
      const normalizedHours = hoursStr.replace(/\s+/g, '').toLowerCase();
      const [open, close] = normalizedHours.split('-').map(time => {
        // Standardize time format
        const formattedTime = time.replace(/[^\d:]/g, '');
        return formattedTime.length === 4 
          ? `${formattedTime.slice(0,2)}:${formattedTime.slice(2)}` 
          : formattedTime;
      });

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: daysOfWeek[day as keyof typeof daysOfWeek],
        opens: open || '00:00',
        closes: close || '00:00'
      };
    });
  }
}

// Convenience export for backwards compatibility
export function generateLocalBusinessSchema(
  business: SearchResult, 
  context: SchemaContext
) {
  return SchemaMarkupGenerator.generateLocalBusinessSchema(business, context);
}

export function generateSearchResultsSchema(
  results: SearchResult[], 
  context: SchemaContext
) {
  return SchemaMarkupGenerator.generateSearchResultsSchema(results, context);
}
