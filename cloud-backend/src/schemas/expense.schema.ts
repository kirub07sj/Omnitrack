import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.union([z.string(), z.number()]),
    description: z.string().optional(),
    paid_to: z.string().optional(),
    status: z.string().optional(),
    receipt_image: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional(),
    method: z.string().optional(),
    reference: z.string().optional(),
  })
});

export const updateExpenseSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional(),
    paid_to: z.string().optional(),
    status: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional(),
    method: z.string().optional(),
  })
});

export const payExpenseSchema = z.object({
  body: z.object({
    method: z.string().optional(),
    reference: z.string().optional(),
    receipt_image: z.string().optional(),
  })
});
