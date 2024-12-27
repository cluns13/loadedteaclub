import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { HeartIcon, ShareIcon, CameraIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/20/solid';
import type { MenuItem } from '@/types/models';
import type { UserInteraction } from '@/types/social';
import { cn } from '@/lib/utils';

interface MenuSectionProps {
  items: MenuItem[];
  onInteraction?: (interaction: UserInteraction) => void;
}

export default function MenuSection({ items, onInteraction }: MenuSectionProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Loaded Teas' },
    { id: 'ENERGY', name: 'Energy' },
    { id: 'BEAUTY', name: 'Beauty' },
    { id: 'WELLNESS', name: 'Wellness' },
    { id: 'SEASONAL', name: 'Seasonal' },
  ] as const;

  const handleShare = async (item: MenuItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.description,
          url: window.location.href + '#' + item.id,
        });
        onInteraction?.({
          userId: session?.user?.id || 'anonymous',
          type: 'SHARE',
          timestamp: new Date(),
          content: { caption: item.name },
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleFavorite = (item: MenuItem) => {
    onInteraction?.({
      userId: session?.user?.id || 'anonymous',
      type: 'FAVORITE',
      timestamp: new Date(),
      content: { caption: item.name },
    });
  };

  // Filter items based on category and search query
  const filteredItems = items.filter(item => {
    // Category filter
    if (selectedCategory !== 'all' && item.subcategory !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search drinks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-full whitespace-nowrap',
              selectedCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onShare={() => handleShare(item)}
            onFavorite={() => handleFavorite(item)}
          />
        ))}
      </div>
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  onShare: () => void;
  onFavorite: () => void;
  featured?: boolean;
}

function MenuItemCard({ item, onShare, onFavorite, featured }: MenuItemCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md overflow-hidden',
      featured && 'border-2 border-purple-500'
    )}>
      {item.photos?.[0] ? (
        <div className="relative h-48">
          <Image
            src={item.photos[0]}
            alt={item.name}
            fill
            className="object-cover"
          />
          {item.new && (
            <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
              New
            </span>
          )}
        </div>
      ) : item.new && (
        <span className="inline-block mt-2 ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
          New
        </span>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
          <p className="text-lg font-medium text-gray-900">${item.price}</p>
        </div>

        {item.benefits && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.benefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-block px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full"
              >
                {benefit}
              </span>
            ))}
          </div>
        )}

        {item.nutrition && (
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">Nutrition: </span>
            {item.nutrition.calories && <span>{item.nutrition.calories} cal </span>}
            {item.nutrition.protein && <span>• {item.nutrition.protein}g protein </span>}
            {item.nutrition.caffeine && <span>• {item.nutrition.caffeine}mg caffeine</span>}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsFavorited(!isFavorited);
                onFavorite();
              }}
              className={cn(
                'p-2 rounded-full',
                isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-gray-500'
              )}
            >
              {isFavorited ? (
                <HeartIconSolid className="h-6 w-6" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={onShare}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full"
            >
              <ShareIcon className="h-6 w-6" />
            </button>
          </div>
          
          {item.socialMetrics && (
            <div className="text-sm text-gray-500">
              {item.socialMetrics.favorites > 0 && (
                <span>{item.socialMetrics.favorites} favorites</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
