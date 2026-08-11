import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { Role } from '../types/index.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/stats',
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  getDashboardStats
);

export default router;
