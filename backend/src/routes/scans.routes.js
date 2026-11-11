import { Router } from 'express';
import { scansController } from '../controllers/scans.controller.js';

export const scansRouter = Router();

scansRouter.get('/', scansController.list);
scansRouter.post('/', scansController.create);
scansRouter.get('/:id', scansController.getById);
scansRouter.get('/:id/download', scansController.download);
scansRouter.delete('/:id', scansController.delete);
