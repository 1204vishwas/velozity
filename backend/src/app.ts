import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Mount API routes
  app.use('/api', apiRoutes);

  // 404 and Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
