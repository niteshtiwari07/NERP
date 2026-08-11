import { api } from './api';
import type { User } from '../types/auth';
import type { ApiResponse } from '../types/api';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
    return res.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  register: async (name: string, email: string, password: string, role?: string): Promise<{ user: User; token: string }> => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', { name, email, password, role });
    return res.data.data;
  },
};
