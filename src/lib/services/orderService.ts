import { CartItem } from './cartService';
import { NutritionClub } from '@/types/nutritionClub';

export interface Order {
  id: string;
  userId: string;
  clubId: string;
  items: CartItem[];
  totalAmount: number;
  rewardsPointsEarned: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  pickupTime?: Date;
}

export class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async submitOrder(
    userId: string, 
    club: NutritionClub, 
    cartItems: CartItem[], 
    pickupTime?: Date
  ): Promise<Order> {
    // Validate club has online ordering
    if (!club.onlineOrderingAvailable) {
      throw new Error('Online ordering not available for this club');
    }

    const totalAmount = cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );

    const order: Order = {
      id: `ORDER_${Date.now()}`,
      userId,
      clubId: club.id,
      items: cartItems,
      totalAmount,
      rewardsPointsEarned: Math.floor(totalAmount),
      status: 'PENDING',
      createdAt: new Date(),
      pickupTime: pickupTime
    };

    // In a real implementation, this would save to database
    await this.saveOrder(order);

    return order;
  }

  private async saveOrder(order: Order): Promise<void> {
    // Placeholder for database save
    console.log('Order saved:', order);
  }

  async cancelOrder(orderId: string): Promise<void> {
    // Placeholder for order cancellation logic
  }
}
