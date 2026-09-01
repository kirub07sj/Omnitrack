import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional().nullable(),
    status: z.string().optional()
  })
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional().nullable(),
    status: z.string().optional()
  })
});
