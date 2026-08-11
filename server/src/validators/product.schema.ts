import { z } from 'zod';
import { MovementType } from '../types/index.js';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(3, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
  minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').default(5),
  warehouseLocation: z.string().min(2, 'Warehouse location is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const stockMovementSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(3, 'Reason for stock movement is required'),
});
