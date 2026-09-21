import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Missing or malformed token.', 401, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Access token has expired', 401, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'Invalid access token', 401, 'INVALID_TOKEN');
  }
};
