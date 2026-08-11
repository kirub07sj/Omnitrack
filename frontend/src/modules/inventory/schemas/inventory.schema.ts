import { z } from "zod";

export const inventorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  unit: z.string().min(1, "Unit is required."),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  minimum_quantity: z.coerce.number().min(0, "Minimum quantity cannot be negative."),
  cost_per_unit: z.coerce.number().min(0, "Cost per unit cannot be negative."),
  supplier_id: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive"]),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;
