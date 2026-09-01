import { z } from 'zod';

export const setupBusinessSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Business name is required.'),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    currency: z.string().optional()
  })
});

export const setupEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    roleName: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1)
  })
});

export const setupProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    price: z.union([z.string(), z.number()])
  })
});

export const updateSettingsSchema = z.object({
  body: z.object({
    is_kitchen_active: z.boolean().optional(),
    name: z.string().optional(),
    owner_name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    logo: z.string().optional(),
    currency: z.string().optional(),
    tax_rate: z.number().optional(),
    settings: z.any().optional()
  })
});
