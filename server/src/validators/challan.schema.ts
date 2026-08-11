import { z } from 'zod';

const challanItemSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Valid customer ID required'),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one product item'),
});

export const updateChallanSchema = createChallanSchema.partial();
