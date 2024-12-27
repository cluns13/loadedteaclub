import { z } from 'zod';
import { PhoneNumberUtil } from 'google-libphonenumber';
import validator from 'validator';
import axios from 'axios';

// Utility for phone number validation
const phoneUtil = PhoneNumberUtil.getInstance();

// Comprehensive Business Validation Schema
export const BusinessValidationSchema = z.object({
  name: z.string()
    .min(2, { message: "Business name must be at least 2 characters" })
    .max(100, { message: "Business name cannot exceed 100 characters" })
    .refine(name => /^[a-zA-Z0-9\s&'-]+$/.test(name), {
      message: "Business name contains invalid characters"
    }),

  contact: z.object({
    phone: z.string()
      .refine(phone => {
        try {
          const number = phoneUtil.parseAndKeepRawInput(phone, 'US');
          return phoneUtil.isValidNumber(number);
        } catch {
          return false;
        }
      }, { message: "Invalid phone number format" }),

    email: z.string()
      .email({ message: "Invalid email address" })
      .refine(email => validator.isEmail(email), {
        message: "Email address failed additional validation"
      })
  }),

  address: z.object({
    street: z.string()
      .min(3, { message: "Street address must be at least 3 characters" })
      .max(200, { message: "Street address cannot exceed 200 characters" }),
    
    city: z.string()
      .min(2, { message: "City name must be at least 2 characters" })
      .max(100, { message: "City name cannot exceed 100 characters" }),
    
    state: z.string()
      .length(2, { message: "State must be a 2-letter abbreviation" })
      .refine(state => /^[A-Z]{2}$/.test(state), {
        message: "Invalid state abbreviation"
      }),
    
    zipCode: z.string()
      .refine(zip => /^\d{5}(-\d{4})?$/.test(zip), {
        message: "Invalid ZIP code format"
      })
  }),

  hours: z.array(
    z.object({
      day: z.enum([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
        'Friday', 'Saturday', 'Sunday'
      ]),
      open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)" }),
      close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)" })
    })
  ).refine(hours => hours.length > 0, { message: "At least one business hour must be specified" }),

  menu: z.array(
    z.object({
      name: z.string()
        .min(2, { message: "Menu item name must be at least 2 characters" })
        .max(100, { message: "Menu item name cannot exceed 100 characters" }),
      
      price: z.number()
        .min(0, { message: "Price cannot be negative" })
        .max(1000, { message: "Price is unreasonably high" })
        .refine(price => Number(price.toFixed(2)) === price, {
          message: "Price must have at most 2 decimal places"
        })
    })
  ).optional()
});

export class BusinessValidationService {
  // Validate entire business object
  static validateBusiness(business: any) {
    try {
      return BusinessValidationSchema.parse(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        };
      }
      throw error;
    }
  }

  // External API Validation Methods
  static async validateGooglePlaces(businessName: string, address: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
        params: {
          input: `${businessName} ${address}`,
          inputtype: 'textquery',
          fields: 'formatted_address,name,place_id',
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      });

      const candidates = response.data.candidates;
      return {
        isValid: candidates.length > 0,
        details: candidates[0]
      };
    } catch (error) {
      console.error('Google Places Validation Error:', error);
      return { isValid: false, error: 'External validation failed' };
    }
  }

  // Image Validation
  static validateBusinessImage(imageFile: File) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return { 
        isValid: false, 
        error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' 
      };
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: 'Image size exceeds 5MB limit.' 
      };
    }

    return { isValid: true };
  }

  // Comprehensive Integrity Check
  static checkBusinessIntegrity(business: any) {
    const validationResult = this.validateBusiness(business);
    
    if (!validationResult.isValid) {
      return {
        isComplete: false,
        missingFields: validationResult.errors.map(err => err.path)
      };
    }

    // Additional custom integrity checks
    const integrityIssues = [];

    if (!business.menu || business.menu.length === 0) {
      integrityIssues.push('No menu items');
    }

    if (!business.images || business.images.length === 0) {
      integrityIssues.push('No business images');
    }

    return {
      isComplete: integrityIssues.length === 0,
      issues: integrityIssues
    };
  }
}
