export * from './express.d.js';
export { Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  error?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  category?: string;
}
