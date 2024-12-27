'use client';

import Image from 'next/image';
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  content: string;
  date: string;
  photos?: string[];
}

interface PopularTime {
  day: string;
  hours: {
    hour: number;
    percentage: number;
  }[];
}

interface SocialProofProps {
  businessId: string;
}

export default function SocialProof({ businessId }: SocialProofProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'photos' | 'popular'>('reviews');

  // Mock data - replace with real API calls
  const reviews: Review[] = [
    {
      id: '1',
      author: {
        name: 'Alex Thompson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
      },
      rating: 5,
      content: 'Amazing selection of teas! The staff is incredibly knowledgeable and helped me find the perfect blend.',
      date: '2023-12-20',
      photos: ['/mock/review1.jpg']
    },
    // Add more reviews...
  ];

  const popularTimes: PopularTime[] = [
    {
      day: 'Monday',
      hours: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        percentage: Math.random() * 100
      }))
    },
    // Add more days...
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'reviews', label: 'Reviews' },
            { id: 'photos', label: 'Photos' },
            { id: 'popular', label: 'Popular Times' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {review.author.avatar && (
                      <Image
                        src={review.author.avatar}
                        alt={review.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900">{review.author.name}</h3>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{review.content}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {review.photos.map((photo, index) => (
                      <div key={index} className="relative h-20 w-20">
                        <Image
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Add photo grid here */}
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="space-y-6">
            {popularTimes.map((day) => (
              <div key={day.day} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">{day.day}</h3>
                <div className="h-24 relative">
                  <div className="absolute inset-0 flex items-end">
                    {day.hours.map((hour) => (
                      <div
                        key={hour.hour}
                        className="flex-1 bg-purple-100 rounded-t"
                        style={{ height: `${hour.percentage}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>12 AM</span>
                  <span>12 PM</span>
                  <span>11 PM</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
