import { DB } from '../database/db.js';
import { resolveCurrentUser } from '../middlewares/auth.middleware.js';

export const miscController = {
  // Profil utilisateur
  getMe(req, res) {
    const userId = resolveCurrentUser(req);
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
  },

  // Liste des notifications
  getNotifications(req, res) {
    const userId = resolveCurrentUser(req);
    const items = DB.notifications.filter((n) => n.userId === userId);
    return res.json({
      code: 200,
      msg: 'Requête réussie',
      data: { items, total: items.length },
    });
  },

  // Compteur d'alertes non lues
  getUnreadCount(req, res) {
    const userId = resolveCurrentUser(req);
    const count = DB.notifications.filter((n) => n.userId === userId && !n.read).length;
    return res.json({
      code: 200,
      msg: 'Requête réussie',
      data: { count },
    });
  },

  // Marquer toutes les notifications comme lues
  readAllNotifications(req, res) {
    const userId = resolveCurrentUser(req);
    DB.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    return res.json({ code: 200, msg: 'Notifications marquées comme lues' });
  },

  // Statut du parrainage
  getReferrals(req, res) {
    const userId = resolveCurrentUser(req);
    const request = DB.referralRequests.find((r) => r.userId === userId);
    return res.json({
      code: 200,
      msg: 'Requête réussie',
      data: { request: request || null },
    });
  },

  // Postuler au parrainage
  applyReferral(req, res) {
    const userId = resolveCurrentUser(req);
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
      status: 'pending',
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
  },
};
