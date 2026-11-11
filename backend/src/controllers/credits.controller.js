import { DB } from '../database/db.js';
import { resolveCurrentUser } from '../middlewares/auth.middleware.js';

export const creditsController = {
  // Consultation du solde
  getMe(req, res) {
    const userId = resolveCurrentUser(req);
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
  },

  // Valider un coupon
  redeem(req, res) {
    const userId = resolveCurrentUser(req);
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
  },

  // Historique des transactions
  getTransactions(req, res) {
    const userId = resolveCurrentUser(req);
    const items = DB.transactions.filter((tx) => tx.userId === userId);
    return res.json({
      code: 200,
      msg: 'Requête réussie',
      data: { items, total: items.length },
    });
  },
};
