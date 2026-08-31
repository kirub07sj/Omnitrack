import { z } from 'zod';

export const setupOwnerSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    username: z.string({ required_error: 'Username is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'Username is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: 'User ID is required' }).or(z.number()),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    currentPin: z.string().optional(),
    newPin: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
});
