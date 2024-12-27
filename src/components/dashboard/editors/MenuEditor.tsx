'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  category: string;
  description?: string;
  price?: number;
  popular?: boolean;
}

interface MenuEditorProps {
  businessId: string;
  menu?: MenuItem[];
  popularItems?: string[];
  isEditing: boolean;
  onUpdate: (data: { menu: MenuItem[]; popularItems: string[] }) => void;
}

export function MenuEditor({
  businessId,
  menu = [],
  popularItems = [],
  isEditing,
  onUpdate,
}: MenuEditorProps) {
  const [localMenu, setLocalMenu] = useState<MenuItem[]>(menu);
  const [localPopularItems, setLocalPopularItems] = useState<string[]>(popularItems);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddItem = () => {
    setLocalMenu([
      ...localMenu,
      {
        name: '',
        category: '',
        description: '',
        price: 0,
        popular: false,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof MenuItem, value: any) => {
    const updatedMenu = [...localMenu];
    updatedMenu[index] = {
      ...updatedMenu[index],
      [field]: value,
    };
    setLocalMenu(updatedMenu);
  };

  const handleRemoveItem = (index: number) => {
    const updatedMenu = localMenu.filter((_, i) => i !== index);
    setLocalMenu(updatedMenu);
  };

  const handleTogglePopular = (itemName: string) => {
    if (localPopularItems.includes(itemName)) {
      setLocalPopularItems(localPopularItems.filter(name => name !== itemName));
    } else {
      setLocalPopularItems([...localPopularItems, itemName]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/business/${businessId}/menu`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu: localMenu,
          popularItems: localPopularItems,
        }),
      });
      onUpdate({ menu: localMenu, popularItems: localPopularItems });
    } catch (error) {
      console.error('Failed to update menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {localMenu.map((item, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                  className="mt-1 block w-full rounded-lg border px-3 py-2"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Category</label>
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => handleUpdateItem(index, 'category', e.target.value)}
                  className="mt-1 block w-full rounded-lg border px-3 py-2"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={item.description}
                onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value))}
                    className="mt-1 block w-32 rounded-lg border px-3 py-2"
                    disabled={!isEditing}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localPopularItems.includes(item.name)}
                    onChange={() => handleTogglePopular(item.name)}
                    disabled={!isEditing}
                  />
                  <span className="text-sm">Popular</span>
                </label>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="flex justify-between">
          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white"
          >
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      )}
    </div>
  );
}
