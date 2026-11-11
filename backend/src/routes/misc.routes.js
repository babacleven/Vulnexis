import { Router } from 'express';
import { miscController } from '../controllers/misc.controller.js';

export const miscRouter = Router();

miscRouter.get('/me', miscController.getMe);
miscRouter.get('/notifications/me', miscController.getNotifications);
miscRouter.get('/notifications/me/unread-count', miscController.getUnreadCount);
miscRouter.post('/notifications/read-all', miscController.readAllNotifications);
miscRouter.get('/referrals/me', miscController.getReferrals);
miscRouter.post('/referrals/apply', miscController.applyReferral);
miscRouter.post('/parrainage/apply', miscController.applyReferral);
