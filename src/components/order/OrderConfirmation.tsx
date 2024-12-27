'use client';

import { useState } from 'react';
import { Order } from '@/lib/services/orderService';
import { CartItem } from '@/lib/services/cartService';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface OrderConfirmationProps {
  order: Order;
  onClose: () => void;
}

export function OrderConfirmation({ order, onClose }: OrderConfirmationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderOrderItem = (item: CartItem) => (
    <div 
      key={item.id} 
      className="flex justify-between items-center py-2 border-b"
    >
      <div>
        <p className="font-semibold">{item.name}</p>
        {item.customizations && (
          <p className="text-sm text-gray-500">
            {item.customizations.join(', ')}
          </p>
        )}
      </div>
      <div className="text-right">
        <p>${(item.price * item.quantity).toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          {item.quantity} × ${item.price.toFixed(2)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          Order Confirmed!
        </h2>

        <div className="mb-4">
          <p className="text-lg">
            Order #{order.id.slice(-6)}
          </p>
          <p className="text-gray-600">
            {format(order.createdAt, 'MMMM d, yyyy h:mm a')}
          </p>
        </div>

        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="font-semibold mb-2 flex justify-between items-center">
            Order Details 
            <span className="text-sm text-gray-500">
              {isExpanded ? '▼' : '►'}
            </span>
          </h3>
          
          {isExpanded && (
            <div>
              {order.items.map(renderOrderItem)}
            </div>
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Rewards Points Earned</span>
            <span>{order.rewardsPointsEarned}</span>
          </div>
        </div>

        <Button 
          onClick={onClose} 
          className="w-full mt-6"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
