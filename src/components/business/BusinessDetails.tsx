'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import {
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  ClockIcon,
  PhotoIcon,
  ListBulletIcon,
  InformationCircleIcon,
  UsersIcon,
  StarIcon as StarIconOutline,
  TagIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import type { LoadedTeaClub, Review } from '@/types/models';
import type { UserInteraction } from '@/types/social';
import { MenuItem, MenuCategory } from '@/types/menu';
import { cn } from '@/lib/utils';
import BusinessCover from './BusinessCover';
import BusinessInsights from './BusinessInsights';
import MenuItemCard from './MenuItemCard';
import SocialProof from './SocialProof';
import MenuSection from './MenuSection';
import SocialSection from './SocialSection';
import PhotoManager from './PhotoManager';
import FeaturedManager from './FeaturedManager';
import PromotionManager from './PromotionManager';
import FeaturedSection from './FeaturedSection';
import PromotionsSection from './PromotionsSection';
import { menuItems } from '@/data/menuItems';
import Image from 'next/image';

interface BusinessDetailsProps {
  business: LoadedTeaClub & { reviews?: Review[] };
  isBusinessOwner: boolean;
}

type TabType = 'menu' | 'reviews' | 'about';

export default function BusinessDetails({ business, isBusinessOwner }: BusinessDetailsProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'about'>('menu');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'energy' | 'beauty' | 'wellness' | 'seasonal'>('all');
  const [businessPhotos, setBusinessPhotos] = useState<string[]>([]);
  const coverPhoto = business.photos?.[0];

  const isSaved = false;

  const handleSave = async () => {
    if (!session) {
      // Handle not logged in state
      return;
    }
    // Add save/unsave logic here
  };

  const handleInteraction = async (interaction: UserInteraction) => {
    // TODO: Implement interaction handling
    console.log('Interaction:', interaction);
  };

  const handlePhotosChange = () => {
    // Refresh the business data
    fetch(`/api/business/${business.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Update the business data
      })
      .catch(console.error);
  };

  const handleUpdate = () => {
    // Refresh the business data
    fetch(`/api/business/${business.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Update the business data
      })
      .catch(console.error);
  };

  useEffect(() => {
    async function fetchPhotos() {
      if (business.placeId) {
        try {
          const response = await fetch(`/api/photos/${business.placeId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.photos) {
              setBusinessPhotos(data.photos);
            }
          }
        } catch (error) {
          console.error('Error fetching photos:', error);
        }
      }
    }

    fetchPhotos();
  }, [business.placeId]);

  // Handle tab change
  const handleTabChange = (tab: 'menu' | 'reviews' | 'about') => {
    setActiveTab(tab);
  };

  // Handle filter change
  const handleFilterChange = (filter: 'all' | 'energy' | 'beauty' | 'wellness' | 'seasonal') => {
    setSelectedFilter(filter);
  };

  // Handle feature toggle
  const handleFeatureToggle = async (itemId: string) => {
    if (!isBusinessOwner) return;
    
    const isCurrentlyFeatured = business.featuredItemIds.includes(itemId);
    const updatedFeaturedIds = isCurrentlyFeatured
      ? business.featuredItemIds.filter(id => id !== itemId)
      : [...business.featuredItemIds, itemId].slice(0, 3); // Max 3 featured items
    
    // TODO: Add API call to update featured items
  };

  // Handle promotion update
  const handleUpdatePromotion = async () => {
    if (!isBusinessOwner) return;
    // TODO: Implement promotion update logic
    console.log('Update promotion');
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    if (!business.menuItems) return [];
    if (selectedFilter === 'all') return business.menuItems;
    return business.menuItems.filter(item => item.category === selectedFilter);
  }, [business.menuItems, selectedFilter]);

  // Featured menu items
  const featuredMenuItems = useMemo(() => {
    if (!business.menuItems) return [];
    return business.menuItems.filter(item => business.featuredItemIds.includes(item.id));
  }, [business.menuItems, business.featuredItemIds]);

  // Regular menu items (non-featured)
  const regularMenuItems = useMemo(() => {
    if (!business.menuItems) return [];
    return business.menuItems.filter(item => !business.featuredItemIds.includes(item.id));
  }, [business.menuItems, business.featuredItemIds]);

  const tabs = [
    { id: 'menu', name: 'Menu', icon: ListBulletIcon },
    { id: 'reviews', name: 'Reviews', icon: StarIconOutline },
    { id: 'about', name: 'About', icon: InformationCircleIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Reviews</h3>
            {/* TODO: Implement reviews */}
          </div>
        );
      case 'about':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            {/* TODO: Implement about */}
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            {/* Menu Filters */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto">
                <button 
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedFilter === 'all' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Loaded Teas
                </button>
                <button 
                  onClick={() => handleFilterChange('energy')}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedFilter === 'energy' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Energy
                </button>
                <button 
                  onClick={() => handleFilterChange('beauty')}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedFilter === 'beauty' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Beauty
                </button>
                <button 
                  onClick={() => handleFilterChange('wellness')}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedFilter === 'wellness' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Wellness
                </button>
                <button 
                  onClick={() => handleFilterChange('seasonal')}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedFilter === 'seasonal' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Seasonal
                </button>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMenuItems.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow",
                    business.featuredItemIds?.includes(item.id) 
                      ? "border-purple-200 ring-1 ring-purple-500"
                      : "border-gray-200"
                  )}
                >
                  <div className="aspect-square relative bg-gray-100">
                    {item.photos?.[0] ? (
                      <Image
                        src={item.photos[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <PhotoIcon className="h-12 w-12" />
                      </div>
                    )}
                    {business.featuredItemIds?.includes(item.id) && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600">${item.price.toFixed(2)}</span>
                        {isBusinessOwner && (
                          <button
                            onClick={() => handleFeatureToggle(item.id)}
                            className={cn(
                              "p-1 rounded-full transition-colors",
                              business.featuredItemIds?.includes(item.id)
                                ? "text-purple-600 hover:text-purple-800"
                                : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            <StarIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.benefits?.map((benefit, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="mr-3">{item.calories} cal</span>
                      <span>{item.caffeine}mg caffeine</span>
                    </div>
                  </div>
                </div>
              ))}
              {regularMenuItems.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow",
                    business.featuredItemIds?.includes(item.id) 
                      ? "border-purple-200 ring-1 ring-purple-500"
                      : "border-gray-200"
                  )}
                >
                  <div className="aspect-square relative bg-gray-100">
                    {item.photos?.[0] ? (
                      <Image
                        src={item.photos[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <PhotoIcon className="h-12 w-12" />
                      </div>
                    )}
                    {business.featuredItemIds?.includes(item.id) && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600">${item.price.toFixed(2)}</span>
                        {isBusinessOwner && (
                          <button
                            onClick={() => handleFeatureToggle(item.id)}
                            className={cn(
                              "p-1 rounded-full transition-colors",
                              business.featuredItemIds?.includes(item.id)
                                ? "text-purple-600 hover:text-purple-800"
                                : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            <StarIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.benefits?.map((benefit, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="mr-3">{item.calories} cal</span>
                      <span>{item.caffeine}mg caffeine</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  const renderOrderingSection = () => {
    if (!business.rewardsEnabled && !business.onlineOrderingAvailable) {
      return (
        <div className="p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ordering</h3>
          <p className="text-gray-600">
            Online ordering and rewards are not currently available for this nutrition club.
          </p>
          <div className="mt-4">
            <p className="font-medium">Contact for Orders:</p>
            <p>{business.phone}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ordering & Rewards</h3>
        {business.rewardsEnabled && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Rewards Enabled
            </span>
          </div>
        )}
        {business.onlineOrderingAvailable && (
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Online Ordering Available
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Header with gradient background */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-64 w-full relative bg-gray-100">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={`${business.name} cover photo`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <PhotoIcon className="h-24 w-24" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Business Card */}
        <div className="relative -mt-16 bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Business Info */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{business.name}</h1>
                  <p className="mt-2 text-gray-600">{business.description}</p>
                </div>
                {isBusinessOwner && (
                  <button
                    onClick={() => {
                      // TODO: Implement business management functionality
                      console.log('Manage business clicked');
                    }}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Manage Business
                  </button>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{business.address}</span>
                </div>
                {business.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <PhoneIcon className="h-5 w-5" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <GlobeAltIcon className="h-5 w-5" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
              <div className="grid grid-cols-2 gap-2">
                {business.hours && (
                  <>
                    <div>Monday:</div>
                    <div>{business.hours.monday.open} - {business.hours.monday.close}</div>
                    <div>Tuesday:</div>
                    <div>{business.hours.tuesday.open} - {business.hours.tuesday.close}</div>
                    <div>Wednesday:</div>
                    <div>{business.hours.wednesday.open} - {business.hours.wednesday.close}</div>
                    <div>Thursday:</div>
                    <div>{business.hours.thursday.open} - {business.hours.thursday.close}</div>
                    <div>Friday:</div>
                    <div>{business.hours.friday.open} - {business.hours.friday.close}</div>
                    <div>Saturday:</div>
                    <div>{business.hours.saturday.open} - {business.hours.saturday.close}</div>
                    <div>Sunday:</div>
                    <div>{business.hours.sunday.open} - {business.hours.sunday.close}</div>
                  </>
                )}
              </div>
            </div>

            {/* Menu Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('menu')}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'menu'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Menu
                </button>
                <button
                  onClick={() => handleTabChange('reviews')}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'reviews'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Reviews
                </button>
                <button
                  onClick={() => handleTabChange('about')}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === 'about'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  About
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {renderTabContent()}
            </div>

            {/* Ordering Section */}
            {renderOrderingSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
