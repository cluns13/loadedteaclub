import { Metadata } from 'next';

interface GenerateMetadataProps {
  title: string;
  description: string;
  path: string;
  city?: string;
  state?: string;
}

export function generateMetadata({
  title,
  description,
  path,
  city,
  state,
}: GenerateMetadataProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loadedteafinder.com';
  const fullUrl = `${siteUrl}${path}`;
  
  // Format location for title if provided
  const locationString = city && state ? ` in ${city}, ${state}` : '';
  const fullTitle = `${title}${locationString} | Loaded Tea Finder`;
  
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'Loaded Tea Finder',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Loaded Tea Finder',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
