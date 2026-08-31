import { z } from 'zod';

export const setupTablesSchema = z.object({
  body: z.object({
    count: z.union([z.number(), z.string().regex(/^\d+$/)])
  })
});

export const createTableSchema = z.object({
  body: z.object({
    table_number: z.string().min(1),
    capacity: z.union([z.number(), z.string().regex(/^\d+$/)]).optional().nullable(),
    status: z.string().optional()
  })
});

export const updateTableSchema = z.object({
  body: z.object({
    table_number: z.string().optional(),
    capacity: z.union([z.number(), z.string().regex(/^\d+$/)]).optional().nullable(),
    status: z.string().optional(),
    waiter_id: z.string().nullable().optional()
  })
});
