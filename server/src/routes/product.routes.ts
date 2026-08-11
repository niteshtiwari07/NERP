import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  recordStockMovement,
  getStockMovements,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
} from '../validators/product.schema.js';
import { Role } from '../types/index.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getProducts
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getProductById
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(createProductSchema),
  createProduct
);

router.patch(
  '/:id',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(updateProductSchema),
  updateProduct
);

router.post(
  '/:id/stock',
  requireRole(Role.ADMIN, Role.WAREHOUSE),
  validateBody(stockMovementSchema),
  recordStockMovement
);

router.get(
  '/:id/stock-movements',
  requireRole(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS),
  getStockMovements
);

export default router;
