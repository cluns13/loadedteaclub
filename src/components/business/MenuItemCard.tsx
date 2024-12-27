'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HeartIcon, ShareIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { MenuItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  isFeatured?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  showInteractions?: boolean;
}

export default function MenuItemCard({
  item,
  isFeatured,
  onFavorite,
  onShare,
  showInteractions = true
}: MenuItemCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onFavorite?.();
  };

  const handleShare = () => {
    // Implement share functionality
    onShare?.();
  };

  return (
    <div 
      className={cn(
        "group relative bg-white rounded-xl transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        isFeatured ? "border-2 border-purple-500" : "border border-gray-200"
      )}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        {item.photos?.[0] ? (
          <Image
            src={item.photos[0]}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}

        {/* Benefits Tags */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {item.benefits?.map((benefit, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-white/90 text-purple-600 rounded-full shadow-sm"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
          <span className="font-medium text-purple-600">${item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        {/* Nutrition Toggle */}
        <button
          onClick={() => setShowNutrition(!showNutrition)}
          className="flex items-center text-sm text-gray-500 hover:text-purple-600 mb-2"
        >
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          Nutrition Info
        </button>

        {/* Nutrition Panel */}
        {showNutrition && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Calories:</span>
                <span className="ml-1 font-medium">{item.calories}</span>
              </div>
              <div>
                <span className="text-gray-500">Caffeine:</span>
                <span className="ml-1 font-medium">{item.caffeine}mg</span>
              </div>
              {item.protein && (
                <div>
                  <span className="text-gray-500">Protein:</span>
                  <span className="ml-1 font-medium">{item.protein}g</span>
                </div>
              )}
              {item.sugar && (
                <div>
                  <span className="text-gray-500">Sugar:</span>
                  <span className="ml-1 font-medium">{item.sugar}g</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interactive Elements */}
        {showInteractions && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
              )}
            >
              {isLiked ? (
                <HeartIconSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span>{isLiked ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-600 transition-colors"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
