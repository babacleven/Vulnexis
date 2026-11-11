import { DB } from '../database/db.js';

export function resolveCurrentUser(req) {
  const cookieId = req.cookies?.kortex_session;
  if (cookieId && DB.users.some((u) => u.id === cookieId)) {
    return cookieId;
  }
  // En dev local, fallback sur le compte de test officiel
  return DB.users[0]?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt';
}

export function requireAuth(req, res, next) {
  const userId = resolveCurrentUser(req);
  const user = DB.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ code: 401, msg: 'Session expirée ou utilisateur non connecté.' });
  }
  req.user = user;
  next();
}
