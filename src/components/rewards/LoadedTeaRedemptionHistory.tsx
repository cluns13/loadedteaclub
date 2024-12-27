import React from 'react';
import { GiftIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LoadedTeaRewardsService } from '@/lib/services/rewardsService';

interface LoadedTeaRedemptionHistoryProps {
  userId: string;
}

export async function LoadedTeaRedemptionHistory({ userId }: LoadedTeaRedemptionHistoryProps) {
  const redemptionHistory = await LoadedTeaRewardsService.getRedemptionHistory(userId);

  return (
    <Card className="w-full p-6 space-y-4 bg-white border border-primary/10 shadow-sm">
      <div className="flex items-center space-x-3">
        <GiftIcon className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-bold text-gray-800">
          Loaded Tea Redemption History
        </h2>
      </div>

      {redemptionHistory.length === 0 ? (
        <p className="text-gray-600 text-center">
          No loaded tea redemptions yet
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {redemptionHistory.map((redemption) => (
            <div 
              key={redemption.id} 
              className="flex justify-between py-3 hover:bg-primary/5 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800">
                  Free Loaded Tea Redeemed
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(redemption.redeemedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-sm font-bold text-primary">
                Redeemed
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
