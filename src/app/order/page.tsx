'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { NutritionClubService } from '@/lib/services/nutritionClubService';
import { NutritionClub } from '@/types/nutritionClub';
import { CartManager } from '@/components/order/CartManager';
import { Button } from '@/components/ui/Button';

export default function OrderPage() {
  const { data: session } = useSession();
  const [clubs, setClubs] = useState<NutritionClub[]>([]);
  const [selectedClub, setSelectedClub] = useState<NutritionClub | null>(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      const clubService = new NutritionClubService();
      const availableClubs = await clubService.getClubsWithOnlineOrdering();
      setClubs(availableClubs);
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (selectedClub) {
        const clubService = new NutritionClubService();
        const items = await clubService.getClubMenuItems(selectedClub.id);
        setMenuItems(items);
      }
    };

    fetchMenuItems();
  }, [selectedClub]);

  if (!session?.user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to place an order
        </h1>
        <Button onClick={() => signIn()}>
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order Loaded Tea</h1>

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

      {selectedClub && menuItems.length > 0 && (
        <CartManager 
          club={selectedClub} 
          menuItems={menuItems} 
        />
      )}

      {selectedClub && menuItems.length === 0 && (
        <div className="text-center text-gray-500">
          No menu items available for this club
        </div>
      )}
    </div>
  );
}
