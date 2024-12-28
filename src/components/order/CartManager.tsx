'use client';

import { useState } from 'react';
import { CartService } from '@/lib/services/cartService';
import { OrderService } from '@/lib/services/orderService';
import { NutritionClub } from '@/types/nutritionClub';
import { MenuItem } from '@/types/menu';
import { OrderConfirmation } from './OrderConfirmation';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

interface CartManagerProps {
  club: NutritionClub;
  menuItems: MenuItem[];
}

export function CartManager({ club, menuItems }: CartManagerProps) {
  const { data: session } = useSession();
  const cartService = CartService.getInstance();
  const orderService = OrderService.getInstance();

  const [cart, setCart] = useState(cartService.getCart());
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const updateCart = () => {
    setCart(cartService.getCart());
  };

  const handleAddToCart = (item: MenuItem) => {
    cartService.addToCart(item);
    updateCart();
  };

  const handleRemoveFromCart = (itemId: string) => {
    cartService.removeFromCart(itemId);
    updateCart();
  };

  const handleSubmitOrder = async () => {
    if (!session?.user?.id) {
      alert('Please log in to place an order');
      return;
    }

    try {
      const order = await orderService.submitOrder(
        session.user.id, 
        club, 
        cart
      );

      setConfirmedOrder(order);
      setIsOrderConfirmed(true);
      cartService.clearCart();
      updateCart();
    } catch (error) {
      console.error('Order submission failed', error);
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Menu Items */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Menu</h2>
          {menuItems.map(item => (
            <div 
              key={item.id} 
              className="flex justify-between items-center p-2 border-b"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-green-600">${item.price.toFixed(2)}</p>
              </div>
              <Button onClick={() => handleAddToCart(item)}>
                Add to Cart
              </Button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-2 border-b"
                >
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <p className="font-bold">
                  Total: ${cartService.calculateTotal().toFixed(2)}
                </p>
                <Button 
                  className="w-full mt-2"
                  onClick={handleSubmitOrder}
                  disabled={!club.onlineOrderingAvailable}
                >
                  {club.onlineOrderingAvailable 
                    ? 'Submit Order' 
                    : 'Online Ordering Unavailable'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {isOrderConfirmed && confirmedOrder && (
        <OrderConfirmation 
          order={confirmedOrder}
          onClose={() => setIsOrderConfirmed(false)}
        />
      )}
    </div>
  );
}
