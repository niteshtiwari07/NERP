import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      const target = err.meta?.target ? (err.meta.target as string[]).join(', ') : 'field';
      return sendError(
        res,
        `A record with this unique ${target} already exists.`,
        400,
        'DUPLICATE_ENTRY'
      );
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Requested record not found.', 404, 'NOT_FOUND');
    }
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, statusCode, code);
};
