import { MenuValidationService, MenuItem } from '@/lib/services/menuValidationService';

describe('MenuValidationService', () => {
  describe('validateMenu', () => {
    it('should validate a valid menu with all required categories', () => {
      const menu = {
        items: [
          {
            name: 'Blue Hawaiian',
            category: 'Loaded Teas',
            description: 'Tropical loaded tea',
          },
          {
            name: 'Mermaid',
            category: 'Loaded Teas',
            description: 'Blue raspberry loaded tea',
          },
          {
            name: 'Cherry Bomb',
            category: 'Lit Teas',
            description: 'Cherry lit tea',
          },
          {
            name: 'Peach Perfect',
            category: 'Lit Teas',
            description: 'Peach lit tea',
          },
          {
            name: 'Chocolate Shake',
            category: 'Meal Replacements',
            description: 'Chocolate protein shake',
          },
          {
            name: 'Vanilla Dream',
            category: 'Meal Replacements',
            description: 'Vanilla protein shake',
          },
        ],
      };

      const result = MenuValidationService.validateMenu(menu);
      expect(result.isValid).toBe(true);
      expect(result.missingCategories).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when missing required categories', () => {
      const menu = {
        items: [
          {
            name: 'Blue Hawaiian',
            category: 'Loaded Teas',
            description: 'Tropical loaded tea',
          },
          {
            name: 'Mermaid',
            category: 'Loaded Teas',
            description: 'Blue raspberry loaded tea',
          },
        ],
      };

      const result = MenuValidationService.validateMenu(menu);
      expect(result.isValid).toBe(false);
      expect(result.missingCategories).toContain('Lit Teas');
      expect(result.missingCategories).toContain('Meal Replacements');
    });

    it('should fail validation when category has less than 2 items', () => {
      const menu = {
        items: [
          {
            name: 'Blue Hawaiian',
            category: 'Loaded Teas',
            description: 'Tropical loaded tea',
          },
          {
            name: 'Cherry Bomb',
            category: 'Lit Teas',
            description: 'Cherry lit tea',
          },
          {
            name: 'Peach Perfect',
            category: 'Lit Teas',
            description: 'Peach lit tea',
          },
          {
            name: 'Chocolate Shake',
            category: 'Meal Replacements',
            description: 'Chocolate protein shake',
          },
        ],
      };

      const result = MenuValidationService.validateMenu(menu);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Category 'Loaded Teas' must have at least 2 items");
    });
  });

  describe('validateMenuItem', () => {
    it('should validate a valid menu item', () => {
      const item: MenuItem = {
        name: 'Blue Hawaiian',
        category: 'Loaded Teas',
        description: 'Tropical loaded tea',
        price: 8.99,
        popular: true,
        ingredients: ['Blue Raspberry', 'Coconut', 'Energy Boost'],
        photos: ['photo1.jpg'],
      };

      const result = MenuValidationService.validateMenuItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid menu item', () => {
      const item = {
        category: 'Loaded Teas',
        description: 'Tropical loaded tea',
      };

      const result = MenuValidationService.validateMenuItem(item as MenuItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item name is required');
    });
  });
});
