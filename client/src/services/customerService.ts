import { api } from './api';
import type { Customer, CustomerFollowUp } from '../types/models';
import type { ApiResponse, PaginatedResult } from '../types/api';

export const customerService = {
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<PaginatedResult<Customer>> => {
    const res = await api.get<ApiResponse<PaginatedResult<Customer>>>('/customers', { params });
    return res.data.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },

  addFollowUp: async (customerId: string, note: string, followUpDate: string): Promise<CustomerFollowUp> => {
    const res = await api.post<ApiResponse<CustomerFollowUp>>(`/customers/${customerId}/followups`, { note, followUpDate });
    return res.data.data;
  },
};
