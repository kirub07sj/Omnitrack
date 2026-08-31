import { z } from 'zod';

export const checkoutOrderSchema = z.object({
  body: z.object({
    order_id: z.string().min(1, 'Order ID is required'),
    cashier_id: z.string().min(1, 'Cashier ID is required'),
    payment_method: z.string().min(1, 'Payment method is required'),
    subtotal: z.number(),
    tax: z.number().optional().default(0),
    discount: z.number().optional().default(0),
    total: z.number(),
    amount_received: z.number().optional()
  })
});

export const createManualSaleSchema = z.object({
  body: z.object({
    table_id: z.string().optional(),
    waiter_id: z.string().optional(),
    cashier_id: z.string().min(1, 'Cashier ID is required'),
    items: z.array(z.object({
      product_id: z.string().min(1),
      quantity: z.number().min(1),
      price: z.number().min(0)
    })).min(1, 'At least one item is required'),
    payment_method: z.string().min(1, 'Payment method is required'),
    subtotal: z.number(),
    tax: z.number().optional().default(0),
    discount: z.number().optional().default(0),
    total: z.number()
  })
});

export const refundSaleSchema = z.object({
  body: z.object({
    sale_id: z.string().min(1, 'Sale ID is required'),
    cashier_id: z.string().min(1, 'Cashier ID is required'),
    reason: z.string().optional(),
    amount: z.union([z.number(), z.string()]).optional()
  })
});
