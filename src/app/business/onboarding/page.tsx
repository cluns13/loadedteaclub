'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function NutritionClubOnboarding() {
  const [clubName, setClubName] = useState('');
  const [rewardThreshold, setRewardThreshold] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          clubName, 
          rewardThreshold 
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Nutrition Club Registered!', {
          description: 'Your Loaded Tea rewards program is now active'
        });
        router.push('/business/dashboard');
      } else {
        toast.error('Registration Failed', {
          description: result.error || 'Please try again'
        });
      }
    } catch (error) {
      toast.error('Network Error', {
        description: 'Unable to complete registration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Set Up Your Loaded Tea Rewards
          </h2>
          <p className="text-gray-400">
            Create a simple loyalty program for your Nutrition Club
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Nutrition Club Name</label>
            <Input 
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Enter your Nutrition Club name"
              required
              className="bg-white/10 text-white border-white/20"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              Free Loaded Tea Threshold 
              <span className="text-sm text-gray-400 ml-2">
                (Purchases before free loaded tea)
              </span>
            </label>
            <Input 
              type="number"
              value={rewardThreshold}
              onChange={(e) => setRewardThreshold(Number(e.target.value))}
              min={5}
              max={20}
              required
              className="bg-white/10 text-white border-white/20"
            />
            <p className="text-sm text-gray-400 mt-2">
              Recommended: 10 loaded tea purchases for a free tea
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
          >
            {isLoading ? 'Setting Up...' : 'Create Loaded Tea Rewards Program'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            By creating a program, you agree to our 
            <a href="/terms" className="text-teal-400 ml-1 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
