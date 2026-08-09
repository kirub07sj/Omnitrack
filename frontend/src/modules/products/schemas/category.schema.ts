import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
