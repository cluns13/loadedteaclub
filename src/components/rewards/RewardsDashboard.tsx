'use client';

import { useState, useEffect } from 'react';
import { UserRewardsProfile, RewardsTransaction } from '@/types/rewards';
import { RewardsService } from '@/lib/services/rewardsService';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useGeolocation } from '@/hooks/useGeolocation';
import { RewardsQRGenerator } from './RewardsQRGenerator';
import { BusinessRedemptionScanner } from './BusinessRedemptionScanner';

interface RewardsDashboardProps {
  userId: string;
  clubId: string;
  userType?: 'customer' | 'business';
}

export function RewardsDashboard({ 
  userId, 
  clubId,
  userType = 'customer'
}: RewardsDashboardProps) {
  const [profile, setProfile] = useState<UserRewardsProfile | null>(null);
  const [transactions, setTransactions] = useState<RewardsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        const rewardsService = new RewardsService();
        
        const mockProfile: UserRewardsProfile = {
          userId,
          clubId,
          totalPointsEarned: 750,
          currentPoints: 450,
          tierLevel: 'SILVER',
          lastEarnedPoints: new Date(),
          freeDrinkEligible: true,
          consecutivePurchases: 5
        };

        setProfile(mockProfile);

        const history = await rewardsService.getRewardsHistory(userId, clubId);
        setTransactions(history);
      } catch (error) {
        console.error('Failed to fetch rewards data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardsData();
  }, [userId, clubId]);

  const handleRedeemFreeDrink = async () => {
    try {
      setRedeemError(null);

      const rewardsService = new RewardsService();
      
      const updatedProfile = await rewardsService.redeemFreeDrink(
        userId, 
        clubId, 
        location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : undefined
      );

      setProfile(updatedProfile);
    } catch (error) {
      setRedeemError(error.message || 'Unable to redeem free drink');
    }
  };

  if (isLoading) {
    return <div>Loading rewards...</div>;
  }

  if (!profile) {
    return <div>No rewards profile found</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      {userType === 'customer' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Rewards Dashboard</h2>
            <div 
              className={`px-3 py-1 rounded-full text-sm font-medium 
                ${
                  profile.tierLevel === 'BRONZE' ? 'bg-bronze-100 text-bronze-800' :
                  profile.tierLevel === 'SILVER' ? 'bg-silver-100 text-silver-800' :
                  profile.tierLevel === 'GOLD' ? 'bg-gold-100 text-gold-800' :
                  'bg-platinum-100 text-platinum-800'
                }`}
            >
              {profile.tierLevel} Tier
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Current Points</h3>
              <p className="text-3xl font-bold text-green-600">
                {profile.currentPoints}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Free Drink</h3>
              {profile.freeDrinkEligible ? (
                <>
                  <Button 
                    onClick={handleRedeemFreeDrink}
                    className="w-full"
                    disabled={locationError !== null}
                  >
                    Redeem Free Drink
                  </Button>
                  {locationError && (
                    <p className="text-red-500 text-xs mt-2">
                      Location access required for redemption
                    </p>
                  )}
                  {redeemError && (
                    <p className="text-red-500 text-xs mt-2">
                      {redeemError}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  {5 - profile.consecutivePurchases} more purchases to free drink
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {format(transaction.createdAt, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div 
                      className={`font-bold ${
                        transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'EARN' ? '+' : '-'}
                      {transaction.points} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <RewardsQRGenerator 
            clubId={clubId} 
            redemptionType="FREE_DRINK" 
          />
        </>
      ) : userType === 'business' ? (
        <BusinessRedemptionScanner clubId={clubId} />
      ) : null}
    </div>
  );
}
