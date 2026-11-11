import { Router } from 'express';
import { targetsController } from '../controllers/targets.controller.js';

export const targetsRouter = Router();

targetsRouter.get('/', targetsController.list);
targetsRouter.post('/', targetsController.create);
targetsRouter.get('/:id', targetsController.getById);
targetsRouter.post('/:id/authorize', targetsController.toggleAuthorize);
targetsRouter.delete('/:id', targetsController.delete);
