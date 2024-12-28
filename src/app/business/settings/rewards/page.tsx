'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { NutritionClubService } from '@/lib/services/nutritionClubService';
import { SquareService } from '@/lib/services/squareService';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RewardsSettingsPage({ searchParams }: { searchParams: URLSearchParams }) {
  const router = useRouter();
  const clubId = searchParams?.get?.('clubId') ?? '';
  const businessId = searchParams?.get?.('businessId') ?? '';
  const [rewardsEnabled, setRewardsEnabled] = useState(false);
  const [onlineOrderingAvailable, setOnlineOrderingAvailable] = useState(false);
  const [posProvider, setPosProvider] = useState<'SQUARE' | 'OTHER'>('SQUARE');
  const [merchantId, setMerchantId] = useState('');

  useEffect(() => {
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');
    const merchantId = searchParams?.get('merchantId');

    if (success === 'square_integration' && merchantId) {
      setMerchantId(merchantId);
      setRewardsEnabled(true);
      setOnlineOrderingAvailable(true);
    }

    if (error) {
      // Handle error scenarios
      console.error('OAuth Integration Error:', error);
    }
  }, [searchParams]);

  const handleSquareIntegration = async () => {
    const squareService = new SquareService();
    // Hardcoded clubId for now - in production, get from session/context
    const authUrl = squareService.generateAuthorizationUrl('current_club_id');
    window.location.href = authUrl;
  };

  const handleSaveSettings = async () => {
    const clubService = new NutritionClubService();
    // Assuming we have the current club's ID from session or context
    const result = await clubService.updateClubRewardsSettings(
      'current_club_id', 
      {
        rewardsEnabled,
        onlineOrderingAvailable,
        posIntegration: {
          provider: posProvider,
          merchantId: merchantId || undefined
        }
      }
    );

    if (result) {
      // Show success notification
      alert('Rewards settings updated successfully!');
    }
  };

  const isRewardsEnabled = searchParams?.get('rewards') === 'true';
  const isQrEnabled = searchParams?.get('qr') === 'true';
  const rewardsType = searchParams?.get('type') || 'standard';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Rewards & Ordering Settings</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="flex items-center justify-between">
            <span>Enable Rewards Program</span>
            <Switch 
              checked={isRewardsEnabled} 
              onCheckedChange={() => {}} 
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Allow customers to earn and track rewards for purchases
          </p>
        </div>

        <div className="mb-4">
          <label className="flex items-center justify-between">
            <span>Enable Online Ordering</span>
            <Switch 
              checked={onlineOrderingAvailable}
              onCheckedChange={setOnlineOrderingAvailable}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Allow customers to place orders through the app
          </p>
        </div>

        {(rewardsEnabled || onlineOrderingAvailable) && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">POS Integration</h2>
            <div className="mb-4">
              <label className="block mb-2">POS Provider</label>
              <select 
                value={posProvider}
                onChange={(e) => setPosProvider(e.target.value as 'SQUARE' | 'OTHER')}
                className="w-full p-2 border rounded"
              >
                <option value="SQUARE">Square</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {posProvider === 'SQUARE' && !merchantId && (
              <Button 
                onClick={handleSquareIntegration}
                className="w-full mt-4"
              >
                Connect Square Account
              </Button>
            )}

            {merchantId && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <p className="text-green-700">
                  ✓ Square Account Connected (Merchant ID: {merchantId})
                </p>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleSaveSettings}
          className="mt-6 w-full"
        >
          Save Rewards Settings
        </Button>
      </div>
    </div>
  );
}
