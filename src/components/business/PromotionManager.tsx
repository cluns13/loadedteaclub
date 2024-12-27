'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import type { Promotion, MenuItem } from '@/types/models';
import { cn } from '@/lib/utils';

interface PromotionManagerProps {
  businessId: string;
  promotions: Promotion[];
  menuItems: MenuItem[];
  onUpdate: () => void;
}

export default function PromotionManager({
  businessId,
  promotions,
  menuItems,
  onUpdate,
}: PromotionManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion>>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSavePromotion = async () => {
    if (!editingPromotion) return;

    try {
      const response = await fetch(`/api/business/${businessId}/promotions`, {
        method: editingPromotion.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingPromotion,
          menuItems: selectedItems,
        }),
      });

      if (!response.ok) throw new Error('Failed to save promotion');
      onUpdate();
      setIsEditing(false);
      setEditingPromotion(undefined);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      const response = await fetch(`/api/business/${businessId}/promotions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete promotion');
      onUpdate();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Promotions</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setEditingPromotion({
              isActive: true,
              startDate: new Date(),
            });
          }}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Promotion
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingPromotion?.id ? 'Edit' : 'New'} Promotion
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editingPromotion?.title || ''}
                  onChange={(e) =>
                    setEditingPromotion({
                      ...editingPromotion,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingPromotion?.description || ''}
                  onChange={(e) =>
                    setEditingPromotion({
                      ...editingPromotion,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                  <select
                    value={editingPromotion?.discountType || ''}
                    onChange={(e) =>
                      setEditingPromotion({
                        ...editingPromotion,
                        discountType: e.target.value as Promotion['discountType'],
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="">Select Type</option>
                    <option value="PERCENTAGE">Percentage Off</option>
                    <option value="FIXED">Fixed Amount Off</option>
                    <option value="BOGO">Buy One Get One</option>
                  </select>
                </div>

                {editingPromotion?.discountType !== 'BOGO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Value</label>
                    <input
                      type="number"
                      value={editingPromotion?.discountValue || ''}
                      onChange={(e) =>
                        setEditingPromotion({
                          ...editingPromotion,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={editingPromotion?.startDate ? new Date(editingPromotion.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      setEditingPromotion({
                        ...editingPromotion,
                        startDate: new Date(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={editingPromotion?.endDate ? new Date(editingPromotion.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      setEditingPromotion({
                        ...editingPromotion,
                        endDate: new Date(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
                <textarea
                  value={editingPromotion?.terms || ''}
                  onChange={(e) =>
                    setEditingPromotion({
                      ...editingPromotion,
                      terms: e.target.value,
                    })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Menu Items
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {menuItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center p-2 border rounded hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingPromotion(undefined);
                    setSelectedItems([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePromotion}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Save Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className={cn(
              "p-4 border rounded-lg",
              promotion.isActive ? "border-purple-500" : "border-gray-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-purple-600" />
                  {promotion.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{promotion.description}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Start:</span>{' '}
                    {new Date(promotion.startDate).toLocaleDateString()}
                  </p>
                  {promotion.endDate && (
                    <p className="text-sm">
                      <span className="font-medium">End:</span>{' '}
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </p>
                  )}
                  {promotion.discountType && (
                    <p className="text-sm">
                      <span className="font-medium">Discount:</span>{' '}
                      {promotion.discountType === 'PERCENTAGE'
                        ? `${promotion.discountValue}% off`
                        : promotion.discountType === 'FIXED'
                        ? `$${promotion.discountValue} off`
                        : 'Buy One Get One'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditingPromotion(promotion);
                    setSelectedItems(promotion.menuItems || []);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeletePromotion(promotion.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
