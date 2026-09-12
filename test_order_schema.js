const { z } = require('zod');
const createOrderSchema = z.object({
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

try {
  createOrderSchema.parse({
    body: {
      table_id: null,
      notes: "",
      items: [
        { product_id: "prod-1", quantity: 1, price: "12.50" }
      ]
    }
  });
  console.log("Success");
} catch (err) {
  console.error(err.errors);
}
