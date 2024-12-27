import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://teafinder.com';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Loaded Tea Finder - Find Loaded Tea Clubs Near You',
  description: 'Discover and explore loaded tea clubs in your area. Browse menus, read reviews, and find the perfect nutrition club near you.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Loaded Tea Finder',
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Loaded Tea Finder - Find Loaded Tea Clubs Near You',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loaded Tea Finder - Find Loaded Tea Clubs Near You',
    description: 'Discover and explore loaded tea clubs in your area. Browse menus, read reviews, and find the perfect nutrition club near you.',
    images: [`${baseUrl}/images/twitter-image.jpg`],
  },
};
