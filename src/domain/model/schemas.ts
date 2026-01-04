import { z } from 'zod';

/**
 * Zod schemas for model profile validation
 */

export const ModelProfileSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone number required'),
  location: z.string().min(2, 'Location is required'),
  bio: z.string().optional().default(''),
  profileImage: z.string().url().optional().default(''),
  rating: z.number().min(0).max(5).default(0),
  totalBookings: z.number().min(0).default(0),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ModelProfileInput = z.infer<typeof ModelProfileSchema>;

export const FetchModelParamsSchema = z.object({
  modelId: z.string().optional(),
  spreadsheetId: z.string().optional(),
  sheetName: z.string().optional().default('Models'),
});

export type FetchModelParams = z.infer<typeof FetchModelParamsSchema>;
