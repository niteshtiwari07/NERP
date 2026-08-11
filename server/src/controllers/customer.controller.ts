import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service.js';
import { sendSuccess } from '../utils/response.utils.js';
import { CustomerStatus, CustomerType } from '../types/index.js';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const search = req.query.search as string;
    const status = req.query.status as CustomerStatus;
    const type = req.query.type as CustomerType;

    const result = await customerService.getCustomers({ page, limit, search, status, type });
    return sendSuccess(res, result, 'Customers fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await customerService.getCustomerById(id);
    return sendSuccess(res, customer, 'Customer details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await customerService.updateCustomer(id, req.body);
    return sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

export const addFollowUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { note, followUpDate } = req.body;
    const userId = req.user!.id;
    const followUp = await customerService.addFollowUp(id, note, followUpDate, userId);
    return sendSuccess(res, followUp, 'Follow-up note added successfully', 201);
  } catch (error) {
    next(error);
  }
};
