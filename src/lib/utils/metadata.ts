import { Metadata } from 'next';
import { LoadedTeaClub } from '@/types/models';

export interface MetadataOptions {
  title?: string;
  description?: string;
  images?: string[];
  type?: string;
}

export class MetadataGenerator {
  // Generate default site-wide metadata
  static getSiteMetadata(): Metadata {
    return {
      title: {
        default: 'Loaded Tea Finder | Discover Local Tea Experiences',
        template: '%s | Loaded Tea Finder'
      },
      description: 'Find the best loaded tea spots near you. Explore unique tea clubs, health-focused drinks, and local tea culture.',
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://loadedteafinder.com'),
      alternates: {
        canonical: '/'
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        title: 'Loaded Tea Finder',
        description: 'Find the best loaded tea spots near you',
        images: ['/og-image.jpg']
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Loaded Tea Finder',
        description: 'Find the best loaded tea spots near you',
        images: ['/og-image.jpg']
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      }
    };
  }

  // Generate location-specific metadata
  static getLocationMetadata(city: string, state: string): Metadata {
    return {
      title: `Loaded Tea in ${city}, ${state}`,
      description: `Discover the best loaded tea spots in ${city}, ${state}. Local tea clubs, health drinks, and unique tea experiences.`,
      openGraph: {
        type: 'website',
        title: `Loaded Tea in ${city}, ${state}`,
        description: `Explore amazing loaded tea experiences in ${city}`,
        images: ['/og-location-image.jpg']
      }
    };
  }

  // Generate business-specific metadata
  static getBusinessMetadata(business: LoadedTeaClub): Metadata {
    return {
      title: `${business.name} | Loaded Tea Club`,
      description: business.description || `Discover ${business.name}, a unique loaded tea experience in ${business.location?.lat ? 'your area' : ''}`,
      openGraph: {
        type: 'website',
        title: `${business.name} | Loaded Tea Club`,
        description: business.description || 'Unique loaded tea experience',
        images: business.photos?.length ? business.photos : ['/og-business-default.jpg']
      }
    };
  }

  // Generate JSON-LD structured data for a business
  static generateBusinessJsonLd(business: LoadedTeaClub): string {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FoodEstablishment',
      'name': business.name,
      'description': business.description,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': business.address
      },
      'geo': business.location ? {
        '@type': 'GeoCoordinates',
        'latitude': business.location.lat,
        'longitude': business.location.lng
      } : undefined,
      'telephone': business.phone,
      'url': business.website,
      'image': business.photos?.[0],
      'aggregateRating': business.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': business.rating,
        'reviewCount': business.reviewCount
      } : undefined
    });
  }
}
