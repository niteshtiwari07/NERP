import { api } from './api';
import type { Product, StockMovement, MovementType } from '../types/models';
import type { ApiResponse, PaginatedResult } from '../types/api';

export const productService = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
  }): Promise<PaginatedResult<Product>> => {
    const res = await api.get<ApiResponse<PaginatedResult<Product>>>('/products', { params });
    return res.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  recordStockMovement: async (
    productId: string,
    quantity: number,
    movementType: MovementType,
    reason: string
  ): Promise<{ product: Product; movement: StockMovement }> => {
    const res = await api.post<ApiResponse<{ product: Product; movement: StockMovement }>>(
      `/products/${productId}/stock`,
      { quantity, movementType, reason }
    );
    return res.data.data;
  },

  getStockMovements: async (productId: string): Promise<StockMovement[]> => {
    const res = await api.get<ApiResponse<StockMovement[]>>(`/products/${productId}/stock-movements`);
    return res.data.data;
  },
};
