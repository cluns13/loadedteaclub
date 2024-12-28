import { useState, useEffect } from 'react';
import { UserRewardsProfile, RewardsTransaction } from '@/types/rewards';
import { RewardsService } from '@/lib/services/rewardsService';
import { Button } from '@/components/ui/Button';
import { format, parseISO } from 'date-fns';
import { useGeolocation } from '@/hooks/useGeolocation';
import BusinessRedemptionScanner from '@/components/rewards/BusinessRedemptionScanner';

interface RewardsDashboardProps {
  userId: string;
  clubId: string;
  userType?: 'customer' | 'business';
}

export default function RewardsDashboard({ 
  userId, 
  clubId,
  userType = 'customer'
}: RewardsDashboardProps) {
  const [transactions, setTransactions] = useState<RewardsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { location, error: locationError } = useGeolocation();

  const handleError = (error: unknown) => {
    console.error('Error in rewards dashboard:', error instanceof Error ? error.message : error);
  };

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setIsLoading(true);

        const rewardsServiceInstance = new RewardsService();
        const history = await rewardsServiceInstance.getRewardsHistory(userId, clubId);
        setTransactions(history);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && clubId) {
      fetchRewardsData();
    }
  }, [userId, clubId]);

  if (isLoading) {
    return <div>Loading rewards...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      {userType === 'customer' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Rewards Dashboard</h2>
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
                        {format(parseISO(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : userType === 'business' ? (
        <BusinessRedemptionScanner clubId={clubId} />
      ) : null}
    </div>
  );
}
