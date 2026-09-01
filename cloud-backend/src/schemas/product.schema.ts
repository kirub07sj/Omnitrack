import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    category_id: z.string().optional().nullable(),
    inventory_item_id: z.string().optional().nullable(),
    name: z.string({ required_error: 'Name is required' }),
    sku: z.string().optional().nullable(),
    barcode: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    price: z.union([z.string(), z.number()]).transform(val => Number(val)),
    cost: z.union([z.string(), z.number()]).transform(val => Number(val)).optional().nullable(),
    unit: z.string().optional().nullable(),
    track_inventory: z.boolean().optional(),
    min_stock: z.union([z.string(), z.number()]).transform(val => Number(val)).optional().nullable(),
    image_url: z.string().optional().nullable(),
    status: z.string().optional()
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    category_id: z.string().optional().nullable(),
    inventory_item_id: z.string().optional().nullable(),
    name: z.string().optional(),
    sku: z.string().optional().nullable(),
    barcode: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    price: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    cost: z.union([z.string(), z.number()]).transform(val => Number(val)).optional().nullable(),
    unit: z.string().optional().nullable(),
    track_inventory: z.boolean().optional(),
    min_stock: z.union([z.string(), z.number()]).transform(val => Number(val)).optional().nullable(),
    image_url: z.string().optional().nullable(),
    status: z.string().optional()
  })
});
