'use client';

import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import type { MenuItem } from '@/types/models';

interface FeaturedSectionProps {
  menuItems: MenuItem[];
  featuredItemIds: string[];
}

export default function FeaturedSection({ menuItems, featuredItemIds }: FeaturedSectionProps) {
  const featuredItems = menuItems.filter(item => featuredItemIds.includes(item.id));

  if (featuredItems.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <StarIcon className="h-6 w-6 text-yellow-400 mr-2" />
        Featured Loaded Teas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg hover:shadow-md transition-shadow"
          >
            {item.photos?.[0] && (
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={item.photos[0]}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
              <p className="text-purple-600 font-medium mt-2">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
