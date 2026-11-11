import { Router } from 'express';
import { creditsController } from '../controllers/credits.controller.js';

export const creditsRouter = Router();

creditsRouter.get('/me', creditsController.getMe);
creditsRouter.post('/redeem', creditsController.redeem);
creditsRouter.get('/me/transactions', creditsController.getTransactions);
