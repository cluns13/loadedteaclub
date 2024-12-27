import { z } from 'zod';

// Define required drink categories
export const REQUIRED_CATEGORIES = ['Loaded Teas', 'Lit Teas', 'Meal Replacements'] as const;

// Define menu item schema
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(REQUIRED_CATEGORIES),
  description: z.string().optional(),
  price: z.number().optional(),
  popular: z.boolean().optional(),
  ingredients: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// Define menu schema
export const menuSchema = z.object({
  items: z.array(menuItemSchema).min(1, 'At least one menu item is required'),
});

export class MenuValidationService {
  /**
   * Validates that a menu contains required categories and items
   */
  static validateMenu(menu: { items: MenuItem[] }): {
    isValid: boolean;
    missingCategories: string[];
    errors: string[];
  } {
    const result = menuSchema.safeParse(menu);
    const errors: string[] = [];
    
    if (!result.success) {
      return {
        isValid: false,
        missingCategories: [...REQUIRED_CATEGORIES],
        errors: result.error.issues.map(i => i.message),
      };
    }

    // Check for required categories
    const categories = new Set(menu.items.map(item => item.category));
    const missingCategories = REQUIRED_CATEGORIES.filter(
      category => !categories.has(category)
    );

    // Validate each category has at least 2 items
    REQUIRED_CATEGORIES.forEach(category => {
      const itemsInCategory = menu.items.filter(item => item.category === category);
      if (itemsInCategory.length < 2) {
        errors.push(`Category '${category}' must have at least 2 items`);
      }
    });

    return {
      isValid: missingCategories.length === 0 && errors.length === 0,
      missingCategories,
      errors,
    };
  }

  /**
   * Validates a single menu item
   */
  static validateMenuItem(item: MenuItem): {
    isValid: boolean;
    errors: string[];
  } {
    const result = menuItemSchema.safeParse(item);
    
    return {
      isValid: result.success,
      errors: result.success ? [] : result.error.issues.map(i => i.message),
    };
  }

  /**
   * Checks if a business has the minimum required menu items
   */
  static hasMinimumRequiredItems(menu: { items: MenuItem[] }): boolean {
    const { isValid } = this.validateMenu(menu);
    return isValid;
  }
}
