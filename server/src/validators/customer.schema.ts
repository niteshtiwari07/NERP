import { z } from 'zod';
import { CustomerType, CustomerStatus } from '../types/index.js';

export const createCustomerSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  address: z.string().min(5, 'Address is required'),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(3, 'Follow-up note is required'),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
});
