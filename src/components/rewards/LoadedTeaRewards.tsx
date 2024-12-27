import React from 'react';
import { motion } from 'framer-motion';
import { GiftIcon, CoffeeIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface LoadedTeaRewardsProps {
  loadedTeaPurchases: number;
  userId: string;
}

export function LoadedTeaRewards({ loadedTeaPurchases, userId }: LoadedTeaRewardsProps) {
  const FREE_LOADED_TEA_THRESHOLD = 5;
  const remainingLoadedTeas = FREE_LOADED_TEA_THRESHOLD - (loadedTeaPurchases % FREE_LOADED_TEA_THRESHOLD);

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-4 bg-gradient-to-br from-primary/10 to-primary/5 border-none shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GiftIcon className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">
            Loaded Tea Rewards
          </h2>
        </div>
        <div className="text-sm text-gray-600">
          Loaded Teas Purchased: {loadedTeaPurchases}
        </div>
      </div>

      <motion.div 
        className="w-full bg-white rounded-xl p-4 shadow-sm border border-primary/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CoffeeIcon className="w-5 h-5 text-primary" />
            <span className="font-medium text-gray-700">
              Free Loaded Tea Progress
            </span>
          </div>
          <div className="text-sm font-bold text-primary">
            {remainingLoadedTeas} more to go!
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ 
              width: `${((FREE_LOADED_TEA_THRESHOLD - remainingLoadedTeas) / FREE_LOADED_TEA_THRESHOLD) * 100}%` 
            }}
          />
        </div>
      </motion.div>

      <div className="text-center">
        {remainingLoadedTeas === 0 ? (
          <Button 
            variant="primary" 
            className="w-full"
            // TODO: Implement claim free loaded tea logic
          >
            Claim Your Free Loaded Tea!
          </Button>
        ) : (
          <p className="text-sm text-gray-600">
            Buy {remainingLoadedTeas} more loaded teas to earn a free drink!
          </p>
        )}
      </div>
    </Card>
  );
}

export function LoadedTeaRewardsPlaceholder() {
  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-4 bg-gradient-to-br from-primary/10 to-primary/5 border-none animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
        <div className="h-3 bg-gray-300 rounded w-1/4" />
      </div>

      <div className="w-full bg-white rounded-xl p-4 space-y-3 border border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gray-300 rounded-full" />
            <div className="h-3 bg-gray-300 rounded w-1/3" />
          </div>
          <div className="h-3 bg-gray-300 rounded w-1/4" />
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div className="w-1/2 bg-gray-300 h-2.5 rounded-full" />
        </div>
      </div>

      <div className="h-10 bg-gray-300 rounded w-full" />
    </Card>
  );
}
