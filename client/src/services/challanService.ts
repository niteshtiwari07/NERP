import { api } from './api';
import type { SalesChallan } from '../types/models';
import type { ApiResponse, PaginatedResult } from '../types/api';

export const challanService = {
  getChallans: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }): Promise<PaginatedResult<SalesChallan>> => {
    const res = await api.get<ApiResponse<PaginatedResult<SalesChallan>>>('/challans', { params });
    return res.data.data;
  },

  getChallanById: async (id: string): Promise<SalesChallan> => {
    const res = await api.get<ApiResponse<SalesChallan>>(`/challans/${id}`);
    return res.data.data;
  },

  createChallan: async (data: {
    customerId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<SalesChallan> => {
    const res = await api.post<ApiResponse<SalesChallan>>('/challans', data);
    return res.data.data;
  },

  confirmChallan: async (id: string): Promise<SalesChallan> => {
    const res = await api.post<ApiResponse<SalesChallan>>(`/challans/${id}/confirm`);
    return res.data.data;
  },

  cancelChallan: async (id: string): Promise<SalesChallan> => {
    const res = await api.post<ApiResponse<SalesChallan>>(`/challans/${id}/cancel`);
    return res.data.data;
  },
};
