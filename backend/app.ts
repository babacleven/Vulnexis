import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.ts';
import { targetsRouter } from './routes/targets.routes.ts';
import { scansRouter } from './routes/scans.routes.ts';
import { creditsRouter } from './routes/credits.routes.ts';
import { miscRouter } from './routes/misc.routes.ts';

export function createExpressApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/k/targets', targetsRouter);
  app.use('/api/k/scans', scansRouter);
  app.use('/api/k/credits', creditsRouter);
  app.use('/api/k', miscRouter);

  return app;
}
