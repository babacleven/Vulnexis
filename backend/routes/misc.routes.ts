import { Router, Request, Response } from 'express';
import { DB } from '../db.ts';

export const miscRouter = Router();

function getCurrentUserId(req: Request): string {
  const cookieId = req.cookies?.kortex_session;
  if (cookieId && DB.users.some((u) => u.id === cookieId)) {
    return cookieId;
  }
  return DB.users[0]?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt';
}

// GET /api/v1/me
miscRouter.get('/me', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = DB.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ code: 401, msg: 'Non connecté' });
  }
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      credits: user.credits,
      free_scans: user.free_scans,
      is_admin: user.is_admin,
      created_at: user.created_at,
    },
  });
});

// GET /api/v1/notifications/me
miscRouter.get('/notifications/me', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const items = DB.notifications.filter((n) => n.userId === userId);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: { items, total: items.length },
  });
});

// GET /api/v1/notifications/me/unread-count
miscRouter.get('/notifications/me/unread-count', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const count = DB.notifications.filter((n) => n.userId === userId && !n.read).length;
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: { count },
  });
});

// POST /api/v1/notifications/read-all
miscRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  DB.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  return res.json({ code: 200, msg: 'Notifications marquées comme lues' });
});

// GET /api/v1/referrals/me
miscRouter.get('/referrals/me', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const request = DB.referralRequests.find((r) => r.userId === userId);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: { request: request || null },
  });
});

// Handler for referral applications
const handleReferralApply = (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { promoCode, fullName, operator, phone } = req.body;

  if (!promoCode || !fullName || !phone) {
    return res.status(400).json({ code: 400, msg: 'Tous les champs obligatoires doivent être renseignés.' });
  }

  const existingIdx = DB.referralRequests.findIndex((r) => r.userId === userId);
  const newRequest = {
    id: `req_${Date.now()}`,
    userId,
    promoCode: promoCode.trim().toUpperCase(),
    fullName: fullName.trim(),
    operator: operator || 'Wave',
    phone: phone.trim(),
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    DB.referralRequests[existingIdx] = newRequest;
  } else {
    DB.referralRequests.push(newRequest);
  }

  return res.json({
    code: 200,
    msg: 'Votre demande a été transmise avec succès et sera validée sous 24h.',
    data: newRequest,
  });
};

// POST /api/v1/referrals/apply and alias /api/v1/parrainage/apply
miscRouter.post('/referrals/apply', handleReferralApply);
miscRouter.post('/parrainage/apply', handleReferralApply);
