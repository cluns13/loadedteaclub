import { z } from 'zod'

export const teaTypes = [
  'BLACK',
  'GREEN',
  'OOLONG',
  'WHITE',
  'PUERH',
  'HERBAL',
  'ROOIBOS',
  'BLEND',
] as const

export const createTeaSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  benefits: z.string().min(1, 'At least one benefit is required'),
  origin: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  temperature: z.number().int().min(50).max(100),
  steepTime: z.number().int().min(30).max(900), // 30 seconds to 15 minutes
  servingSize: z.number().positive(),
  waterAmount: z.number().int().positive(),
  resteeps: z.number().int().min(1).optional(),
})

export const updateTeaSchema = createTeaSchema.partial()

export const createReviewSchema = z.object({
  rating: z.number().int().min(0).max(5),
  comment: z.string().optional(),
  teaId: z.string(),
})

export const updateReviewSchema = createReviewSchema.partial()

export const createCollectionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  teas: z.array(z.string()).optional(),
})

export const updateCollectionSchema = createCollectionSchema.partial()

export const createJournalEntrySchema = z.object({
  title: z.string(),
  notes: z.string(),
  rating: z.number().int().min(0).max(5).optional(),
  brewingNotes: z.string().optional(),
  mood: z.string().optional(),
  teaId: z.string(),
})

export const updateJournalEntrySchema = createJournalEntrySchema.partial()
