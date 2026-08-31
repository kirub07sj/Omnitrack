import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    table_id: z.string().optional().nullable(),
    waiter_id: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.string().optional(),
    items: z.array(z.object({
      product_id: z.string(),
      quantity: z.number(),
      price: z.number()
    }))
  })
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    notes: z.string().optional().nullable(),
    items: z.array(z.object({
      product_id: z.string(),
      quantity: z.number(),
      price: z.number()
    })).optional()
  })
});
