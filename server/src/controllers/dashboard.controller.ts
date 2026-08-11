import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.utils.js';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getDashboardStats();
    return sendSuccess(res, data, 'Dashboard stats fetched successfully');
  } catch (error) {
    next(error);
  }
};
