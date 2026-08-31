import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
    address: z.string().optional().nullable(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
    address: z.string().optional().nullable(),
  }),
});
