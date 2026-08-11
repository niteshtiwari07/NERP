import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan,
} from '../controllers/challan.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createChallanSchema } from '../validators/challan.schema.js';
import { Role } from '../types/index.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getChallans
);

router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getChallanById
);

router.post(
  '/',
  requireRole(Role.ADMIN, Role.SALES),
  validateBody(createChallanSchema),
  createChallan
);

router.post(
  '/:id/confirm',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE),
  confirmChallan
);

router.post(
  '/:id/cancel',
  requireRole(Role.ADMIN, Role.SALES),
  cancelChallan
);

export default router;
