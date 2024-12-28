export interface MenuItem {
  name: string;
  category: 'Loaded Teas' | 'Lit Teas' | 'Meal Replacements';
  description?: string;
  price?: number;
  
  // Nutrition Details
  nutrition: {
    calories?: number;
    protein?: number;
    sugar?: number;
    carbohydrates?: number;
    fat?: number;
    caffeine?: number;
    servingSize?: string;
  };
  
  // Ingredients and Dietary Info
  ingredients?: string[];
  allergens?: string[];
  dietaryRestrictions?: 'VEGAN' | 'VEGETARIAN' | 'GLUTEN_FREE' | 'DAIRY_FREE';
  
  // Social and Popularity Metrics
  socialMetrics?: {
    likes?: number;
    shares?: number;
    views?: number;
    favorites?: number;
  };
  
  // Business and Availability
  new?: boolean;
  seasonal?: boolean;
  subcategory?: string;
  
  // Optional Media
  images?: string[];
  
  // Tracking and Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

export type MenuCategory = 'all' | MenuItem['category'];
