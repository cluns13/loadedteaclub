'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { SearchResult } from '@/types/search';
import { formatHours } from '@/lib/utils/formatHours';
import { generateSearchResultsSchema, generateLocalBusinessSchema } from '@/lib/seo/generateSchemaMarkup';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';

interface SearchResultsProps {
  results: SearchResult[];
  city?: string;
  state?: string;
}

export default function SearchResults({ results, city, state }: SearchResultsProps) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loadedteafinder.com';

  const schemaContext = {
    city,
    state,
    siteUrl
  };

  // Separate claimed and unclaimed results
  const claimedResults = results.filter(result => result.isClaimed);
  const unclaimedResults = results.filter(result => !result.isClaimed);

  return (
    <>
      <SchemaMarkup data={generateSearchResultsSchema(results, schemaContext)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Render claimed results first */}
        {claimedResults.map((result) => (
          <article 
            key={result.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            itemScope 
            itemType="https://schema.org/Restaurant"
          >
            <SchemaMarkup data={generateLocalBusinessSchema(result, schemaContext)} />
            
            <div className="p-6">
              {/* Claimed Business Card: Full Details */}
              {result.profileImage && (
                <img 
                  src={result.profileImage} 
                  alt={`${result.name} profile`} 
                  className="w-full h-48 object-cover rounded-t-lg mb-4" 
                />
              )}
              
              <h2 className="text-xl font-bold mb-2 flex items-center">
                {result.name}
                {result.isClaimed && (
                  <span 
                    className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    Claimed
                  </span>
                )}
              </h2>
              
              {result.location.address && (
                <p className="text-gray-600 mb-2">{result.location.address}</p>
              )}
              
              {result.contact?.phone && (
                <p className="text-gray-600 mb-2"> {result.contact.phone}</p>
              )}
              
              {result.contact?.website && (
                <a 
                  href={result.contact.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline mb-2 block"
                >
                  Visit Website
                </a>
              )}
              
              {result.rating && (
                <div className="flex items-center text-yellow-500">
                  {result.rating.toFixed(1)} ({result.totalRatings} reviews)
                </div>
              )}
            </div>
          </article>
        ))}
        
        {/* Render unclaimed results */}
        {unclaimedResults.map((result) => (
          <article 
            key={result.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            itemScope 
            itemType="https://schema.org/Restaurant"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                {result.name}
                <span 
                  className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  Unclaimed
                </span>
              </h2>
              
              {result.location.address && (
                <p className="text-gray-600 mb-2">{result.location.address}</p>
              )}
              
              {result.rating && (
                <div className="flex items-center text-yellow-500 mb-4">
                  {result.rating.toFixed(1)} ({result.totalRatings} reviews)
                </div>
              )}
              
              <button 
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                Own this business? Claim it now for free!
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
