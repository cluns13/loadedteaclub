import { MenuValidationService, MenuItem, CategoryType } from '@/lib/services/menuValidationService';

describe('MenuValidationService', () => {
  describe('validateMenu', () => {
    it('should validate a valid menu with all required categories', () => {
      const menu = {
        items: [
          {
            name: 'Blue Hawaiian',
            category: CategoryType.LoadedTeas,
            description: 'Tropical loaded tea',
          },
          {
            name: 'Mermaid',
            category: CategoryType.LoadedTeas,
            description: 'Blue raspberry loaded tea',
          },
          {
            name: 'Cherry Bomb',
            category: CategoryType.LitTeas,
            description: 'Cherry lit tea',
          },
          {
            name: 'Peach Perfect',
            category: CategoryType.LitTeas,
            description: 'Peach lit tea',
          },
          {
            name: 'Chocolate Shake',
            category: CategoryType.MealReplacements,
            description: 'Chocolate protein shake',
          },
          {
            name: 'Vanilla Dream',
            category: CategoryType.MealReplacements,
            description: 'Vanilla protein shake',
          },
        ] as MenuItem[],
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
            category: CategoryType.LoadedTeas,
            description: 'Tropical loaded tea',
          },
          {
            name: 'Mermaid',
            category: CategoryType.LoadedTeas,
            description: 'Blue raspberry loaded tea',
          },
        ] as MenuItem[],
      };

      const result = MenuValidationService.validateMenu(menu);
      expect(result.isValid).toBe(false);
      expect(result.missingCategories).toContain(CategoryType.LitTeas);
      expect(result.missingCategories).toContain(CategoryType.MealReplacements);
    });

    it('should fail validation when category has less than 2 items', () => {
      const menu = {
        items: [
          {
            name: 'Blue Hawaiian',
            category: CategoryType.LoadedTeas,
            description: 'Tropical loaded tea',
          },
          {
            name: 'Cherry Bomb',
            category: CategoryType.LitTeas,
            description: 'Cherry lit tea',
          },
          {
            name: 'Peach Perfect',
            category: CategoryType.LitTeas,
            description: 'Peach lit tea',
          },
          {
            name: 'Chocolate Shake',
            category: CategoryType.MealReplacements,
            description: 'Chocolate protein shake',
          },
        ] as MenuItem[],
      };

      const result = MenuValidationService.validateMenu(menu);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`Category '${CategoryType.LoadedTeas}' must have at least 2 items`);
    });
  });

  describe('validateMenuItem', () => {
    it('should validate a valid menu item', () => {
      const item: MenuItem = {
        name: 'Blue Hawaiian',
        category: CategoryType.LoadedTeas,
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
        category: CategoryType.LoadedTeas,
        description: 'Tropical loaded tea',
      } as MenuItem;

      const result = MenuValidationService.validateMenuItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item name is required');
    });
  });
});
