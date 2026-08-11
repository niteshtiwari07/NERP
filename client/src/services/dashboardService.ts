import { api } from './api';
import type { DashboardStats } from '../types/models';
import type { ApiResponse } from '../types/api';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data.data;
  },
};
