'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { MenuItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface FeaturedManagerProps {
  businessId: string;
  menuItems: MenuItem[];
  featuredItems: string[];
  onUpdate: () => void;
}

export default function FeaturedManager({ 
  businessId, 
  menuItems, 
  featuredItems, 
  onUpdate 
}: FeaturedManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleFeatured = async (itemId: string) => {
    try {
      const response = await fetch(`/api/business/${businessId}/featured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) throw new Error('Failed to update featured items');
      onUpdate();
    } catch (error) {
      console.error('Error updating featured items:', error);
    }
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Featured Loaded Teas</h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "p-4 border rounded-lg",
              featuredItems.includes(item.id)
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="mt-1 text-purple-600">${item.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleToggleFeatured(item.id)}
                className={cn(
                  "p-2 rounded-full",
                  featuredItems.includes(item.id)
                    ? "text-purple-600 hover:bg-purple-100"
                    : "text-gray-400 hover:bg-gray-100"
                )}
              >
                {featuredItems.includes(item.id) ? (
                  <StarIconSolid className="h-6 w-6" />
                ) : (
                  <StarIcon className="h-6 w-6" />
                )}
              </button>
            </div>
            {item.photos?.[0] && (
              <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
                <Image
                  src={item.photos[0]}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
