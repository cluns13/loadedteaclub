'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const SearchInput = dynamic(() => import('@/components/Search/SearchInput'), {
  ssr: false
});

const MapPin = dynamic(() => import('lucide-react').then(mod => mod.MapPin), {
  ssr: false
});

const Search = dynamic(() => import('lucide-react').then(mod => mod.Search), {
  ssr: false
});

const Star = dynamic(() => import('lucide-react').then(mod => mod.Star), {
  ssr: false
});

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-400">
            Find Your Favorite Loaded Tea Businesses
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover Loaded Tea and nutrition spots across the United States
          </p>
        </div>

        <div className="w-full max-w-2xl mb-16">
          <SearchInput 
            showLocationDetection={true}
            placeholder="Enter city name (e.g., St. Augustine, FL)"
          />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mb-6">
              <Search className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Easy Search</h3>
            <p className="text-gray-300">
              Find Loaded Tea clubs in your area with our simple search feature
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mb-6">
              <MapPin className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Location Based</h3>
            <p className="text-gray-300">
              Get directions and find Loaded Tea clubs near your current location
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/20 mb-6">
              <Star className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Reviews & Ratings</h3>
            <p className="text-gray-300">
              Read reviews and ratings from other Loaded Tea enthusiasts
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
