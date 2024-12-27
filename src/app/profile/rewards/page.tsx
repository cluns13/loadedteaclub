import { Suspense } from 'react';
import { LoadedTeaRewards, LoadedTeaRewardsPlaceholder } from '@/components/rewards/LoadedTeaRewards';
import { LoadedTeaRedemptionHistory } from '@/components/rewards/LoadedTeaRedemptionHistory';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { LoadedTeaRewardsService } from '@/lib/services/rewardsService';

async function RewardsPageContent() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please log in to view your rewards</div>;
  }

  const rewards = await LoadedTeaRewardsService.getUserLoadedTeaRewards(user.id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Your Loaded Tea Rewards
      </h1>
      
      <LoadedTeaRewards 
        loadedTeaPurchases={rewards?.loadedTeaPurchases || 0} 
        userId={user.id} 
      />
      
      <LoadedTeaRedemptionHistory userId={user.id} />
    </div>
  );
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<LoadedTeaRewardsPlaceholder />}>
      <RewardsPageContent />
    </Suspense>
  );
}
