import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { targetsRouter } from './targets.routes.js';
import { scansRouter } from './scans.routes.js';
import { creditsRouter } from './credits.routes.js';
import { miscRouter } from './misc.routes.js';

export const apiRouter = Router();

// Routes canoniques /api/v1/
apiRouter.use('/auth', authRouter);
apiRouter.use('/targets', targetsRouter);
apiRouter.use('/scans', scansRouter);
apiRouter.use('/credits', creditsRouter);
apiRouter.use('/', miscRouter);
