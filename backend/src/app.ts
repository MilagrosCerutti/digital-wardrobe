import express, { Application } from 'express';
import cors from 'cors';
import { env } from '@/config/environment';
import apiRoutes from '@/routes';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/v1', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
