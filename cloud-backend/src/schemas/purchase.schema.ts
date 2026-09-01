import { z } from 'zod';

export const createPurchaseSchema = z.object({
  body: z.object({
    supplier_id: z.string({ required_error: 'Supplier ID is required' }),
    status: z.string().optional(),
    items: z.array(z.object({
      inventory_item_id: z.string().optional(),
      name: z.string().optional(),
      unit: z.string().optional(),
      quantity: z.union([z.string(), z.number()]),
      cost: z.union([z.string(), z.number()]),
      minimum_quantity: z.union([z.string(), z.number()]).optional()
    })).min(1, 'At least one item is required')
  }).refine((data) => {
    return data.items.every(item => item.inventory_item_id || item.name);
  }, { message: "Each item must have either inventory_item_id or name" })
});

export const updatePurchaseStatusSchema = z.object({
  body: z.object({
    status: z.string({ required_error: 'Status is required' })
  })
});
