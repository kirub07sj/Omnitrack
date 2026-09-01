import { z } from 'zod';

export const createTenantSchema = z.object({
  body: z.object({
    businessName: z.string().min(1, 'Business name is required'),
    businessEmail: z.string().email('Invalid business email').optional().or(z.literal('')),
    businessPhone: z.string().optional().or(z.literal('')),
    businessAddress: z.string().optional().or(z.literal('')),
    currency: z.string().optional(),
    
    ownerFirstName: z.string().min(1, 'Owner first name is required'),
    ownerLastName: z.string().min(1, 'Owner last name is required'),
    ownerEmail: z.string().email('Invalid owner email'),
    ownerUsername: z.string().optional().or(z.literal('')),
    ownerPassword: z.string().min(6, 'Password must be at least 6 characters'),
    
    plan: z.string().optional(),
    durationDays: z.union([z.number(), z.string()]).optional()
  })
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    addDays: z.number().optional()
  })
});
