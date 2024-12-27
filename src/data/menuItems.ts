import { MenuItem } from '@/types/models';

export const menuItems: MenuItem[] = [
  // Energy Loaded Teas
  {
    id: 'blue-hawaiian',
    name: 'Blue Hawaiian',
    description: 'Tropical blend with coconut, pineapple, and blue butterfly pea flower tea',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'ENERGY',
    photos: [],
    popular: true,
    nutrition: {
      calories: 24,
      caffeine: 160,
    },
    benefits: ['Energy', 'Metabolism', 'Immunity'],
    dietaryInfo: ['Sugar-Free', 'Gluten-Free'],
    socialMetrics: {
      favorites: 124,
      shares: 45
    }
  },
  {
    id: 'strawberry-paradise',
    name: 'Strawberry Paradise',
    description: 'Fresh strawberries blended with green tea and a hint of mint',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'ENERGY',
    photos: [],
    popular: true,
    nutrition: {
      calories: 20,
      caffeine: 140,
    },
    benefits: ['Antioxidants', 'Hydration', 'Focus'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 98,
      shares: 32
    }
  },
  {
    id: 'mango-tango',
    name: 'Mango Tango',
    description: 'Energizing mango and orange blend with green tea base',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'ENERGY',
    photos: [],
    nutrition: {
      calories: 22,
      caffeine: 150,
    },
    benefits: ['Energy', 'Vitamin C', 'Metabolism'],
    dietaryInfo: ['Sugar-Free'],
    socialMetrics: {
      favorites: 76,
      shares: 28
    }
  },

  // Beauty Loaded Teas
  {
    id: 'rose-glow',
    name: 'Rose Glow',
    description: 'Rose petal and lychee tea infused with beauty-boosting antioxidants',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'BEAUTY',
    photos: [],
    new: true,
    nutrition: {
      calories: 18,
      caffeine: 120,
    },
    benefits: ['Skin Health', 'Antioxidants', 'Hydration'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 45,
      shares: 23
    }
  },
  {
    id: 'beauty-berry',
    name: 'Beauty Berry Boost',
    description: 'Mixed berry and hibiscus tea loaded with antioxidants and vitamin C',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'BEAUTY',
    photos: [],
    nutrition: {
      calories: 20,
      caffeine: 110,
    },
    benefits: ['Skin Health', 'Hair Health', 'Anti-aging'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 67,
      shares: 31
    }
  },
  {
    id: 'cucumber-glow',
    name: 'Cucumber Glow',
    description: 'Refreshing cucumber and green tea with collagen and aloe vera',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'BEAUTY',
    photos: [],
    popular: true,
    nutrition: {
      calories: 15,
      caffeine: 100,
    },
    benefits: ['Hydration', 'Skin Health', 'Detox'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 89,
      shares: 42
    }
  },

  // Wellness Loaded Teas
  {
    id: 'zen-matcha',
    name: 'Zen Matcha',
    description: 'Premium matcha green tea with hints of lavender and mint',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'WELLNESS',
    photos: [],
    nutrition: {
      calories: 25,
      caffeine: 130,
    },
    benefits: ['Focus', 'Calm', 'Antioxidants'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 88,
      shares: 34
    }
  },
  {
    id: 'immunity-boost',
    name: 'Immunity Boost',
    description: 'Citrus-infused green tea with ginger and turmeric',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'WELLNESS',
    photos: [],
    popular: true,
    nutrition: {
      calories: 20,
      caffeine: 120,
    },
    benefits: ['Immunity', 'Anti-inflammatory', 'Digestive Health'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 112,
      shares: 47
    }
  },
  {
    id: 'golden-glow',
    name: 'Golden Glow',
    description: 'Turmeric and ginger tea with black pepper for maximum absorption',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'WELLNESS',
    photos: [],
    nutrition: {
      calories: 18,
      caffeine: 90,
    },
    benefits: ['Anti-inflammatory', 'Joint Health', 'Digestion'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 78,
      shares: 36
    }
  },

  // Seasonal Loaded Teas
  {
    id: 'winter-wonderland',
    name: 'Winter Wonderland',
    description: 'Peppermint and white tea blend with a hint of vanilla',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'SEASONAL',
    photos: [],
    new: true,
    nutrition: {
      calories: 15,
      caffeine: 100,
    },
    benefits: ['Holiday Spirit', 'Refreshing', 'Mood Boost'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 67,
      shares: 29
    }
  },
  {
    id: 'autumn-spice',
    name: 'Autumn Spice',
    description: 'Warm chai tea blend with cinnamon, nutmeg, and a touch of pumpkin',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'SEASONAL',
    photos: [],
    popular: true,
    nutrition: {
      calories: 22,
      caffeine: 110,
    },
    benefits: ['Warming', 'Digestive Health', 'Comfort'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 94,
      shares: 41
    }
  },
  {
    id: 'spring-blossom',
    name: 'Spring Blossom',
    description: 'Cherry blossom and jasmine green tea with a hint of peach',
    price: 8.99,
    category: 'LOADED_TEAS',
    subcategory: 'SEASONAL',
    photos: [],
    nutrition: {
      calories: 18,
      caffeine: 95,
    },
    benefits: ['Floral', 'Refreshing', 'Mood Lifting'],
    dietaryInfo: ['Sugar-Free', 'Vegan'],
    socialMetrics: {
      favorites: 82,
      shares: 38
    }
  }
];
