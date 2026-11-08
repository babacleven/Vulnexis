import { Router, Request, Response } from 'express';
import { DB } from '../db.ts';

export const targetsRouter = Router();

// Middleware helper to resolve current user
function getCurrentUserId(req: Request): string {
  const cookieId = req.cookies?.kortex_session;
  if (cookieId && DB.users.some((u) => u.id === cookieId)) {
    return cookieId;
  }
  return DB.users[0]?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt';
}

// GET /api/v1/targets
targetsRouter.get('/', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const items = DB.targets.filter((t) => t.userId === userId);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      items,
      total: items.length,
      page: 1,
      size: 10,
      total_pages: 1,
      links: { first: '/api/v1/targets/?page=1&size=10', last: null, self: '/api/v1/targets/', next: null, prev: null },
    },
  });
});

// POST /api/v1/targets
targetsRouter.post('/', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const { url, name, target_type } = req.body;

  if (!url) {
    return res.status(400).json({ code: 400, msg: 'URL requise' });
  }

  let parsedName = name?.trim();
  if (!parsedName) {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      parsedName = u.hostname;
    } catch {
      parsedName = url;
    }
  }

  const newTarget = {
    id: `tgt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    url: url.startsWith('http') ? url : `https://${url}`,
    name: parsedName,
    target_type: (target_type as any) || 'web',
    authorized: true,
    authorized_at: new Date().toISOString(),
    scans_count: 0,
    created_at: new Date().toISOString(),
  };

  DB.targets.push(newTarget);

  return res.json({
    code: 200,
    msg: 'Application ajoutée avec succès',
    data: newTarget,
  });
});

// GET /api/v1/targets/:id
targetsRouter.get('/:id', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const target = DB.targets.find((t) => t.id === req.params.id && t.userId === userId);
  if (!target) {
    return res.status(404).json({ code: 404, msg: 'Application introuvable' });
  }
  return res.json({ code: 200, msg: 'Requête réussie', data: target });
});

// POST /api/v1/targets/:id/authorize
targetsRouter.post('/:id/authorize', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const target = DB.targets.find((t) => t.id === req.params.id && t.userId === userId);
  if (!target) {
    return res.status(404).json({ code: 404, msg: 'Application introuvable' });
  }
  target.authorized = !target.authorized;
  if (target.authorized) {
    target.authorized_at = new Date().toISOString();
  }
  return res.json({ code: 200, msg: 'Statut d’autorisation mis à jour', data: target });
});

// DELETE /api/v1/targets/:id
targetsRouter.delete('/:id', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const index = DB.targets.findIndex((t) => t.id === req.params.id && t.userId === userId);
  if (index === -1) {
    return res.status(404).json({ code: 404, msg: 'Application introuvable' });
  }
  DB.targets.splice(index, 1);
  DB.scans = DB.scans.filter((s) => s.target_id !== req.params.id);
  return res.json({ code: 200, msg: 'Application et historique supprimés' });
});
