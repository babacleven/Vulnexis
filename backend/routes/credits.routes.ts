import { Router, Request, Response } from 'express';
import { DB } from '../db.ts';

export const creditsRouter = Router();

function getCurrentUserId(req: Request): string {
  const cookieId = req.cookies?.kortex_session;
  if (cookieId && DB.users.some((u) => u.id === cookieId)) {
    return cookieId;
  }
  return DB.users[0]?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt';
}

// GET /api/k/credits/me
creditsRouter.get('/me', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = DB.users.find((u) => u.id === userId);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      credits: user?.credits ?? 0,
      free_scans: user?.free_scans ?? 0,
      next_expiry: null,
      is_admin: user?.is_admin ?? false,
      pricing: { fast: 1, standard: 2, deep: 4, free_profiles: ['fast', 'standard'] },
    },
  });
});

// POST /api/k/credits/redeem
creditsRouter.post('/redeem', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = DB.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ code: 401, msg: 'Non authentifié' });
  }

  const { code } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ code: 400, msg: 'Code requis.' });
  }

  const cleanCode = code.trim().toUpperCase();
  let creditsToAdd = 10;
  if (cleanCode.includes('PREMIUM')) creditsToAdd = 60;
  if (cleanCode.includes('STARTER')) creditsToAdd = 20;

  user.credits += creditsToAdd;

  DB.transactions.push({
    id: DB.transactions.length + 1,
    userId,
    delta: creditsToAdd,
    kind: 'credit',
    reason: 'redeem',
    scan_id: null,
    note: `Code de recharge validé (${cleanCode})`,
    created_time: new Date().toISOString(),
  });

  return res.json({
    code: 200,
    msg: `Code validé ! ${creditsToAdd} crédits ont été ajoutés à votre compte.`,
    data: { credits: user.credits, free_scans: user.free_scans },
  });
});

// GET /api/k/credits/me/transactions
creditsRouter.get('/me/transactions', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const items = DB.transactions.filter((tx) => tx.userId === userId);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: { items, total: items.length },
  });
});
