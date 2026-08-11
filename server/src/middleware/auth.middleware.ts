import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils.js';
import { sendError } from '../utils/response.utils.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};
