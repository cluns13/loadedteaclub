import { MenuItem } from '@/types/models';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export interface CartItemCustomization {
  type: 'size' | 'flavor' | 'topping';
  choice: string;
  price?: number;
}

export interface CartItem extends Omit<MenuItem, 'price'> {
  id: string;
  price: number;
  quantity: number;
  customizations?: CartItemCustomization[];
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  total: number;
  rewardsPoints: number;
  itemCount: number;
  discounts?: {
    type: 'percentage' | 'fixed';
    value: number;
    description?: string;
  }[];
}

export interface CartEvents {
  'item:add': (item: CartItem) => void;
  'item:remove': (itemId: string) => void;
  'item:update': (item: CartItem) => void;
  'cart:clear': () => void;
}

export class CartService extends EventEmitter {
  private static instance: CartService;
  private cart: CartItem[] = [];
  private activeDiscounts: CartSummary['discounts'] = [];

  private constructor() {
    super();
    // Bind methods to ensure correct 'this' context
    this.addToCart = this.addToCart.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
  }

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // Type-safe event handling
  on<K extends keyof CartEvents>(
    event: K, 
    listener: CartEvents[K]
  ): this {
    return super.on(event, listener);
  }

  emit<K extends keyof CartEvents>(
    event: K, 
    ...args: Parameters<CartEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  addToCart(
    item: MenuItem, 
    quantity: number = 1, 
    customizations?: CartItemCustomization[]
  ): void {
    // Validate input
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Check for existing similar item with same customizations
    const existingItemIndex = this.findExistingItemIndex(item, customizations);

    const cartItem: CartItem = {
      ...item,
      id: uuidv4(),
      price: item.price ?? 0,
      quantity,
      customizations: customizations ?? [],
      subtotal: (item.price ?? 0) * quantity
    };

    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = this.cart[existingItemIndex];
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.price * existingItem.quantity;
      
      this.emit('item:update', existingItem);
    } else {
      // Add new item
      this.cart.push(cartItem);
      this.emit('item:add', cartItem);
    }
  }

  removeFromCart(itemId: string): void {
    const initialLength = this.cart.length;
    this.cart = this.cart.filter(item => item.id !== itemId);
    
    if (this.cart.length < initialLength) {
      this.emit('item:remove', itemId);
    }
  }

  updateQuantity(itemId: string, quantity: number): void {
    const itemIndex = this.cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        const item = this.cart[itemIndex];
        item.quantity = quantity;
        item.subtotal = item.price * quantity;
        
        this.emit('item:update', item);
      }
    }
  }

  getCart(): CartItem[] {
    return [...this.cart];
  }

  clearCart(): void {
    this.cart = [];
    this.emit('cart:clear');
  }

  calculateTotal(): number {
    return this.cart.reduce(
      (total, item) => total + item.subtotal, 
      0
    );
  }

  calculateRewardsPoints(): number {
    // Basic rewards: 1 point per dollar spent
    return Math.floor(this.calculateTotal());
  }

  applyDiscount(
    discount: CartSummary['discounts'][number]
  ): void {
    // Validate and apply discount
    this.activeDiscounts.push(discount);
  }

  removeDiscount(
    discountType: CartSummary['discounts'][number]['type']
  ): void {
    this.activeDiscounts = this.activeDiscounts
      .filter(discount => discount.type !== discountType);
  }

  getCartSummary(): CartSummary {
    const total = this.calculateTotal();
    
    // Apply discounts
    const discountedTotal = this.activeDiscounts.reduce(
      (currentTotal, discount) => {
        if (discount.type === 'percentage') {
          return currentTotal * (1 - discount.value / 100);
        }
        return currentTotal - discount.value;
      },
      total
    );

    return {
      items: this.getCart(),
      total: discountedTotal,
      rewardsPoints: this.calculateRewardsPoints(),
      itemCount: this.cart.reduce((count, item) => count + item.quantity, 0),
      discounts: this.activeDiscounts
    };
  }

  private findExistingItemIndex(
    item: MenuItem, 
    customizations?: CartItemCustomization[]
  ): number {
    return this.cart.findIndex(cartItem => 
      cartItem.name === item.name && 
      this.compareCustomizations(cartItem.customizations, customizations)
    );
  }

  private compareCustomizations(
    a?: CartItemCustomization[], 
    b?: CartItemCustomization[]
  ): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;

    return a.every((customA, index) => {
      const customB = b[index];
      return (
        customA.type === customB.type &&
        customA.choice === customB.choice
      );
    });
  }
}

export default CartService;
