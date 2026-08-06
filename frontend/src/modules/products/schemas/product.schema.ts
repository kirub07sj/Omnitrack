import { z } from 'zod';

export const productSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  inventory_item_id: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive("Price must be positive"),
  unit: z.string().optional().nullable(),
  trackInventory: z.boolean().default(false),
  minStock: z.coerce.number().min(0, "Min stock must be non-negative").optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").or(z.literal('')).optional().nullable(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export type ProductFormData = z.infer<typeof productSchema>;
