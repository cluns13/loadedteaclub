'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Leaf, Star } from 'lucide-react';
import type { MenuCategory, MenuItem } from '@prisma/client';

interface MenuDisplayProps {
  categories: (MenuCategory & {
    items: MenuItem[];
  })[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function MenuDisplay({ categories }: MenuDisplayProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sugarFree: false,
    highEnergy: false,
    popular: false
  });

  // Filter items based on search and filters
  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        (!filters.sugarFree || item.isSugarFree) &&
        (!filters.highEnergy || item.energyLevel === 'High') &&
        (!filters.popular || item.isPopular);

      return matchesSearch && matchesFilters;
    })
  })).filter(category => category.items.length > 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-4xl mx-auto"
    >
      {/* Search and Filters */}
      <motion.div variants={fadeInUp} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters(f => ({ ...f, sugarFree: !f.sugarFree }))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5
              ${filters.sugarFree
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Leaf className="h-4 w-4" />
            Sugar Free
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, highEnergy: !f.highEnergy }))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5
              ${filters.highEnergy
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Zap className="h-4 w-4" />
            High Energy
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, popular: !f.popular }))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5
              ${filters.popular
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Star className="h-4 w-4" />
            Popular
          </button>
        </div>
      </motion.div>

      {/* Categories Navigation */}
      <motion.nav variants={fadeInUp} className="mb-8">
        <div className="flex overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-2">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  ${activeCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Menu Items */}
      <motion.div variants={fadeInUp} className="space-y-8">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className={category.id === activeCategory ? 'block' : 'hidden'}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {category.name}
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {category.items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.name}
                        {item.isPopular && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Popular
                          </span>
                        )}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.energyLevel && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <Zap className="h-3 w-3 mr-1" />
                            {item.energyLevel} Energy
                          </span>
                        )}
                        {item.isSugarFree && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Leaf className="h-3 w-3 mr-1" />
                            Sugar Free
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="ml-4 text-lg font-medium text-gray-900">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <motion.div
          variants={fadeInUp}
          className="text-center py-12"
        >
          <p className="text-gray-500">
            No menu items found. Try adjusting your search or filters.
          </p>
        </motion.div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
