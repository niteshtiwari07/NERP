import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { sendSuccess } from '../utils/response.utils.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const lowStockOnly = req.query.lowStock === 'true';

    const result = await productService.getProducts({ page, limit, search, category, lowStockOnly });
    return sendSuccess(res, result, 'Products fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await productService.getProductById(id);
    return sendSuccess(res, product, 'Product details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await productService.updateProduct(id, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

export const recordStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { quantity, movementType, reason } = req.body;
    const userId = req.user!.id;
    const result = await productService.recordStockMovement(
      id,
      quantity,
      movementType,
      reason,
      userId
    );
    return sendSuccess(res, result, 'Stock movement recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const movements = await productService.getStockMovements(id);
    return sendSuccess(res, movements, 'Stock movements fetched successfully');
  } catch (error) {
    next(error);
  }
};
