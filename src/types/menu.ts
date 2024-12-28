import { ObjectId } from 'mongodb';

export type MenuItem = {
  _id?: ObjectId;
  id: string;
  name: string;
  description: string;
  price: number;
  category?: 'Loaded Teas' | 'Lit Teas' | 'Meal Replacements';
  imageUrl?: string;
  ingredients?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  caffeine: number;
};

export type MenuCategory = 'all' | MenuItem['category'];
