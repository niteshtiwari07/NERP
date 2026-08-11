import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUp,
} from '../controllers/customer.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} from '../validators/customer.schema.js';
import { Role } from '../types/index.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getCustomers
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getCustomerById
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createCustomerSchema),
  createCustomer
);

router.patch(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(updateCustomerSchema),
  updateCustomer
);

router.post(
  '/:id/followups',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createFollowUpSchema),
  addFollowUp
);

export default router;
