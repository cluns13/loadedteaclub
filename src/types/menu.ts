export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  photos?: string[];
  category: 'energy' | 'beauty' | 'wellness' | 'seasonal';
  benefits?: string[];
  calories: number;
  caffeine: number;
}

export type MenuCategory = 'all' | MenuItem['category'];
