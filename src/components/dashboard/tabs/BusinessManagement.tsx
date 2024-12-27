'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Store, Clock, Image as ImageIcon, Menu as MenuIcon, Loader2 } from 'lucide-react';
import { LoadingButton } from '../../ui/LoadingButton';
import { PhotoManager } from '../editors/PhotoManager';
import { BusinessHoursEditor } from '../editors/BusinessHoursEditor';
import { MenuEditor } from '../editors/MenuEditor';

interface Business {
  id: string;
  name: string;
  address: string;
  photos: string[];
  hours: Record<string, string>;
  menu: any[];
}

export function BusinessManagement() {
  const { data: session } = useSession();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hours' | 'photos' | 'menu'>('hours');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [session]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/business/claimed');
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHours = async (hours: Record<string, string>) => {
    if (!selectedBusiness) return;

    try {
      setUpdateLoading(true);
      setError(null);

      const response = await fetch(`/api/business/${selectedBusiness.id}/hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      });

      if (!response.ok) {
        throw new Error('Failed to update business hours');
      }

      // Update local state
      setBusinesses(businesses.map(business =>
        business.id === selectedBusiness.id
          ? { ...business, hours }
          : business
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hours');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#24C6DC]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-white">
        <p>{error}</p>
        <LoadingButton
          onClick={fetchBusinesses}
          variant="secondary"
          className="mt-4"
        >
          Try Again
        </LoadingButton>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 text-white/50 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
          No Claimed Businesses
        </h3>
        <p className="text-white/70 mb-6">
          You haven't claimed any businesses yet.
        </p>
        <LoadingButton
          as="a"
          href="/"
          variant="secondary"
        >
          Find a Business to Claim
        </LoadingButton>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Business Selector */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <button
            key={business.id}
            onClick={() => setSelectedBusiness(business)}
            className={`p-6 rounded-xl text-left transition-all duration-200
                      ${
                        selectedBusiness?.id === business.id
                          ? 'bg-[#24C6DC] text-white'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
          >
            <h3 className="font-medium mb-2">{business.name}</h3>
            <p className="text-sm opacity-70">{business.address}</p>
          </button>
        ))}
      </div>

      {/* Management Interface */}
      {selectedBusiness && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <LoadingButton
              onClick={() => setActiveTab('hours')}
              variant={activeTab === 'hours' ? 'primary' : 'ghost'}
            >
              <Clock className="h-4 w-4 mr-2" />
              Hours
            </LoadingButton>
            <LoadingButton
              onClick={() => setActiveTab('photos')}
              variant={activeTab === 'photos' ? 'primary' : 'ghost'}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photos
            </LoadingButton>
            <LoadingButton
              onClick={() => setActiveTab('menu')}
              variant={activeTab === 'menu' ? 'primary' : 'ghost'}
            >
              <MenuIcon className="h-4 w-4 mr-2" />
              Menu
            </LoadingButton>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'hours' && (
              <BusinessHoursEditor
                hours={selectedBusiness.hours || {}}
                onSave={handleUpdateHours}
                isLoading={updateLoading}
              />
            )}
            {activeTab === 'photos' && (
              <PhotoManager
                businessId={selectedBusiness.id}
                photos={selectedBusiness.photos || []}
                isEditing={false}
                onUpdate={() => {}}
              />
            )}
            {activeTab === 'menu' && (
              <MenuEditor
                businessId={selectedBusiness.id}
                menu={selectedBusiness.menu || []}
                isEditing={false}
                onUpdate={() => {}}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
