'use client';

import Image from 'next/image';
import { TagIcon } from '@heroicons/react/24/solid';
import type { Promotion, MenuItem } from '@/types/models';

interface PromotionsSectionProps {
  promotions: Promotion[];
  menuItems: MenuItem[];
}

export default function PromotionsSection({ promotions, menuItems }: PromotionsSectionProps) {
  const activePromotions = promotions.filter(promo => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = promo.endDate ? new Date(promo.endDate) : null;
    
    return (
      promo.isActive &&
      startDate <= now &&
      (!endDate || endDate >= now)
    );
  });

  if (activePromotions.length === 0) return null;

  const getPromotionItems = (promotion: Promotion) => {
    return menuItems.filter(item => promotion.menuItems?.includes(item.id));
  };

  const formatDiscount = (promotion: Promotion) => {
    switch (promotion.discountType) {
      case 'PERCENTAGE':
        return `${promotion.discountValue}% off`;
      case 'FIXED':
        return `$${promotion.discountValue} off`;
      case 'BOGO':
        return 'Buy One Get One';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <TagIcon className="h-6 w-6 text-purple-500 mr-2" />
        Current Promotions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activePromotions.map((promotion) => (
          <div
            key={promotion.id}
            className="p-6 border border-purple-200 bg-purple-50 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-purple-900">{promotion.title}</h3>
                {promotion.discountType && (
                  <p className="text-purple-600 font-medium mt-1">
                    {formatDiscount(promotion)}
                  </p>
                )}
              </div>
              
              <p className="text-gray-600">{promotion.description}</p>
              
              {promotion.imageUrl && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={promotion.imageUrl}
                    alt={promotion.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {promotion.menuItems && promotion.menuItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Available Items:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getPromotionItems(promotion).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-white rounded border border-purple-100 text-sm"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {promotion.terms && (
                <p className="text-sm text-gray-500 mt-4">
                  <span className="font-medium">Terms: </span>
                  {promotion.terms}
                </p>
              )}

              <div className="text-sm text-gray-500">
                <p>
                  Valid from: {new Date(promotion.startDate).toLocaleDateString()}
                  {promotion.endDate && ` to ${new Date(promotion.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
