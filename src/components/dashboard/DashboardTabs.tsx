'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Building2, BookmarkCheck, Settings, Star, Store } from 'lucide-react';
import BusinessClaims from './tabs/BusinessClaims';
import SavedLocations from './tabs/SavedLocations';
import ProfileSettings from './tabs/ProfileSettings';
import { BusinessManagement } from './tabs/BusinessManagement';
import ReviewManagement from './tabs/ReviewManagement';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardTabs() {
  const tabs = [
    { 
      name: 'Saved Locations', 
      component: SavedLocations,
      icon: BookmarkCheck,
      description: 'View and manage your saved nutrition clubs'
    },
    { 
      name: 'Business Claims', 
      component: BusinessClaims,
      icon: Building2,
      description: 'Manage your business claim requests'
    },
    { 
      name: 'Business Management', 
      component: BusinessManagement,
      icon: Store,
      description: 'Manage your claimed businesses'
    },
    { 
      name: 'Reviews', 
      component: ReviewManagement,
      icon: Star,
      description: 'Manage your reviews and responses'
    },
    { 
      name: 'Profile Settings', 
      component: ProfileSettings,
      icon: Settings,
      description: 'Update your profile and preferences'
    },
  ];

  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex p-2 space-x-2 bg-white/10 backdrop-blur-sm">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full px-4 py-3 text-sm font-medium leading-5 rounded-xl',
                  'flex items-center justify-center gap-2 transition-all duration-200',
                  selected
                    ? 'bg-[#24C6DC] text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.name}
              className={classNames(
                'p-6 bg-white/10 backdrop-blur-sm rounded-xl text-white'
              )}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <tab.icon className="h-6 w-6 text-[#24C6DC]" />
                  {tab.name}
                </h2>
                <p className="mt-2 text-white/70">{tab.description}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
                <tab.component />
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
