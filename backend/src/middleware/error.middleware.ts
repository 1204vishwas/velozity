import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error on server without leaking raw trace to client
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    sendError(res, `A record with this ${target} already exists.`, 409, 'UNIQUE_CONSTRAINT_VIOLATION');
    return;
  }

  if (err.code === 'P2025') {
    sendError(res, 'Record not found or already deleted.', 404, 'NOT_FOUND');
    return;
  }

  // Fallback internal server error
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred on the server.'
      : err.message || 'Internal server error';

  sendError(res, message, err.statusCode || 500, err.errorCode || 'INTERNAL_SERVER_ERROR');
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND');
};
