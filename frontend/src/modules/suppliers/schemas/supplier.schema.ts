import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(5, "Phone is required."),
  email: z.string().email("Invalid email address."),
  address: z.string().min(5, "Address must be at least 5 characters."),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
