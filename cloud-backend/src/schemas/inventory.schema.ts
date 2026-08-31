import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    sku: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    quantity: z.union([z.string(), z.number()], { required_error: 'Quantity is required' }),
    minimum_quantity: z.union([z.string(), z.number()]).optional().nullable(),
    cost_per_unit: z.union([z.string(), z.number()], { required_error: 'Cost per unit is required' }),
    supplier_id: z.string().optional().nullable(),
  }),
});

export const updateInventoryItemSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    sku: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
    quantity: z.union([z.string(), z.number()]).optional(),
    minimum_quantity: z.union([z.string(), z.number()]).optional().nullable(),
    cost_per_unit: z.union([z.string(), z.number()]).optional(),
    supplier_id: z.string().optional().nullable(),
    movement_reason: z.string().optional().nullable(),
  }),
});
