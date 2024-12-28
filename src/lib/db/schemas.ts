import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Helper for ObjectId validation
const objectIdSchema = z.string().refine(
  (val) => /^[0-9a-fA-F]{24}$/.test(val),
  { message: 'Invalid ObjectId format' }
);

// Base schema for all documents
const baseDocumentSchema = z.object({
  _id: objectIdSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Business Hours schema
export const businessHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string() }),
  tuesday: z.object({ open: z.string(), close: z.string() }),
  wednesday: z.object({ open: z.string(), close: z.string() }),
  thursday: z.object({ open: z.string(), close: z.string() }),
  friday: z.object({ open: z.string(), close: z.string() }),
  saturday: z.object({ open: z.string(), close: z.string() }),
  sunday: z.object({ open: z.string(), close: z.string() }),
});

// Menu Item schema
export const menuItemSchema = baseDocumentSchema.extend({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  price: z.number().positive('Price must be positive'),
  photos: z.array(z.string().url()).optional(),
  category: z.enum(['energy', 'beauty', 'wellness', 'seasonal']),
  benefits: z.array(z.string()).optional(),
  calories: z.number().nonnegative(),
  caffeine: z.number().nonnegative(),
});

// Review schema
export const reviewSchema = baseDocumentSchema.extend({
  userId: objectIdSchema,
  businessId: objectIdSchema,
  rating: z.number().min(1).max(5),
  text: z.string(),
  photos: z.array(z.string().url()).optional(),
  response: z.object({
    content: z.string(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
  }).optional(),
});

// Business Analytics schema
export const businessAnalyticsSchema = baseDocumentSchema.extend({
  businessId: objectIdSchema,
  totalViews: z.number().nonnegative(),
  totalClicks: z.number().nonnegative(),
  avgDuration: z.number().nonnegative(),
});

// Business Claim schema
export const businessClaimSchema = baseDocumentSchema.extend({
  businessId: objectIdSchema,
  userId: objectIdSchema,
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  verificationDocuments: z.array(z.string().url()),
  paymentStatus: z.enum(['PENDING', 'COMPLETED']),
  paymentAmount: z.number().positive(),
  subscriptionEndDate: z.date(),
  rejectionReason: z.string().optional(),
  rejectedBy: objectIdSchema.optional(),
  rejectedAt: z.date().optional(),
});

// Export all schemas
export const schemas = {
  menuItem: menuItemSchema,
  review: reviewSchema,
  businessAnalytics: businessAnalyticsSchema,
  businessClaim: businessClaimSchema,
} as const;
