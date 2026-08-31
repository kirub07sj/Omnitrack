import { z } from 'zod';

export const createTrialSubscriptionSchema = z.object({
  body: z.object({
    business_id: z.string().min(1, 'Business ID is required')
  })
});
