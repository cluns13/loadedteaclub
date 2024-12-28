'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { NutritionClubService } from '@/lib/services/nutritionClubService';
import RewardsDashboard from '@/components/rewards/RewardsDashboard';
import { Button } from '@/components/ui/Button';
import { NutritionClub } from '@/types/nutritionClub';

export default function RewardsPage() {
  const { data: session } = useSession();
  const [clubs, setClubs] = useState<NutritionClub[]>([]);
  const [selectedClub, setSelectedClub] = useState<NutritionClub | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      if (!session?.user?.id) {
        // Use signIn from next-auth
        await signIn();
        return;
      }

      try {
        const nutritionClubService = new NutritionClubService();
        const fetchedClubs = await nutritionClubService.getUserClubs(session.user.id);
        setClubs(fetchedClubs);

        if (fetchedClubs.length > 0) {
          setSelectedClub(fetchedClubs[0]);
        }
      } catch (error) {
        console.error('Failed to fetch clubs', error);
      }
    };

    fetchClubs();
  }, [session]);

  if (!session?.user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to view your rewards
        </h1>
        <Button onClick={() => signIn()}>
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Rewards</h1>

      {clubs.length === 0 ? (
        <p>No clubs found. Start exploring nutrition clubs!</p>
      ) : (
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Select a Nutrition Club
            </label>
            <select
              value={selectedClub?.id || ''}
              onChange={(e) => {
                const club = clubs.find(c => c.id === e.target.value);
                setSelectedClub(club);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select a Club</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClub && (
            <RewardsDashboard 
              userId={session?.user?.id ?? ''} 
              clubId={selectedClub.id ?? ''} 
            />
          )}
        </div>
      )}
    </div>
  );
}
