import { Request, Response, NextFunction } from 'express';
import { challanService } from '../services/challan.service.js';
import { sendSuccess } from '../utils/response.utils.js';
import { ChallanStatus } from '../types/index.js';

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const search = req.query.search as string;
    const status = req.query.status as ChallanStatus;
    const customerId = req.query.customerId as string;

    const result = await challanService.getChallans({ page, limit, search, status, customerId });
    return sendSuccess(res, result, 'Sales challans fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const challan = await challanService.getChallanById(id);
    return sendSuccess(res, challan, 'Sales challan details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, items } = req.body;
    const createdBy = req.user!.id;
    const challan = await challanService.createChallan({ customerId, items, createdBy });
    return sendSuccess(res, challan, 'Draft sales challan created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const challan = await challanService.confirmChallan(id);
    return sendSuccess(res, challan, 'Sales challan confirmed and stock updated successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const challan = await challanService.cancelChallan(id);
    return sendSuccess(res, challan, 'Sales challan cancelled successfully');
  } catch (error) {
    next(error);
  }
};
