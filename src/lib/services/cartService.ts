import { MenuItem } from '@/types/menu';

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: string[];
}

export class CartService {
  private static instance: CartService;
  private cart: CartItem[] = [];

  private constructor() {}

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  addToCart(item: MenuItem, quantity: number = 1, customizations?: string[]): void {
    const existingItemIndex = this.cart.findIndex(
      cartItem => cartItem.id === item.id
    );

    if (existingItemIndex > -1) {
      this.cart[existingItemIndex].quantity += quantity;
    } else {
      this.cart.push({
        ...item,
        quantity,
        customizations
      });
    }
  }

  removeFromCart(itemId: string): void {
    this.cart = this.cart.filter(item => item.id !== itemId);
  }

  updateQuantity(itemId: string, quantity: number): void {
    const itemIndex = this.cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        this.cart[itemIndex].quantity = quantity;
      }
    }
  }

  getCart(): CartItem[] {
    return [...this.cart];
  }

  clearCart(): void {
    this.cart = [];
  }

  calculateTotal(): number {
    return this.cart.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
  }

  calculateRewardsPoints(): number {
    // Basic rewards: 1 point per dollar spent
    return Math.floor(this.calculateTotal());
  }
}
