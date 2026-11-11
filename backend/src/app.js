import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middlewares/cors.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';
import { authRouter } from './routes/auth.routes.js';
import { targetsRouter } from './routes/targets.routes.js';
import { scansRouter } from './routes/scans.routes.js';
import { creditsRouter } from './routes/credits.routes.js';
import { miscRouter } from './routes/misc.routes.js';

export function createExpressApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(corsMiddleware);

  // Standard API v1 routes
  app.use('/api/v1', apiRouter);

  // Backward compatibility aliases
  app.use('/api/auth', authRouter);
  app.use('/api/k/targets', targetsRouter);
  app.use('/api/k/scans', scansRouter);
  app.use('/api/k/credits', creditsRouter);
  app.use('/api/k', miscRouter);

  // Central error handling
  app.use(errorMiddleware);

  return app;
}

export default createExpressApp;
