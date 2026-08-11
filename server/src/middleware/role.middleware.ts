import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/index.js';
import { sendError } from '../utils/response.utils.js';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};
