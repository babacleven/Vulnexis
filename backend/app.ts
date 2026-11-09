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

  // CORS Middleware for standalone frontend-backend communication (localhost:5173 -> localhost:5000)
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Canonical API v1 Routers
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/targets', targetsRouter);
  app.use('/api/v1/scans', scansRouter);
  app.use('/api/v1/credits', creditsRouter);
  app.use('/api/v1', miscRouter);

  // Compatibility aliases for /api/k and /api/auth
  app.use('/api/auth', authRouter);
  app.use('/api/k/targets', targetsRouter);
  app.use('/api/k/scans', scansRouter);
  app.use('/api/k/credits', creditsRouter);
  app.use('/api/k', miscRouter);

  return app;
}
