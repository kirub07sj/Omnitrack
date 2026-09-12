const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: 'User ID is required' }).or(z.number()),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    currentPin: z.string().optional(),
    newPin: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
});

const req = {
  body: {
    userId: '3c3f5ef1-a31c-40ef-ba14-44b0cb026bf9',
    username: 'kira'
  },
  query: {},
  params: {}
};

const validatedData = updateProfileSchema.parse({
  body: req.body,
  query: req.query,
  params: req.params,
});

console.log(validatedData.body);
