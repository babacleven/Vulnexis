import { DB } from '../database/db.js';
import { resolveCurrentUser } from '../middlewares/auth.middleware.js';
import { generateId, formatUrl, extractHostname } from '../utils/helpers.js';

export const targetsController = {
  // Liste des cibles
  list(req, res) {
    const userId = resolveCurrentUser(req);
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
  },

  // Création d'une cible
  create(req, res) {
    const userId = resolveCurrentUser(req);
    const { url, name, target_type } = req.body;

    if (!url) {
      return res.status(400).json({ code: 400, msg: 'URL requise' });
    }

    const formattedUrl = formatUrl(url);
    const parsedName = name?.trim() || extractHostname(formattedUrl);

    const newTarget = {
      id: generateId('tgt'),
      userId,
      url: formattedUrl,
      name: parsedName,
      target_type: target_type || 'web',
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
  },

  // Détail d'une cible
  getById(req, res) {
    const userId = resolveCurrentUser(req);
    const target = DB.targets.find((t) => t.id === req.params.id && t.userId === userId);
    if (!target) {
      return res.status(404).json({ code: 404, msg: 'Application introuvable' });
    }
    return res.json({ code: 200, msg: 'Requête réussie', data: target });
  },

  // Basculer l'autorisation
  toggleAuthorize(req, res) {
    const userId = resolveCurrentUser(req);
    const target = DB.targets.find((t) => t.id === req.params.id && t.userId === userId);
    if (!target) {
      return res.status(404).json({ code: 404, msg: 'Application introuvable' });
    }
    target.authorized = !target.authorized;
    if (target.authorized) {
      target.authorized_at = new Date().toISOString();
    }
    return res.json({ code: 200, msg: 'Statut d’autorisation mis à jour', data: target });
  },

  // Supprimer une cible
  delete(req, res) {
    const userId = resolveCurrentUser(req);
    const index = DB.targets.findIndex((t) => t.id === req.params.id && t.userId === userId);
    if (index === -1) {
      return res.status(404).json({ code: 404, msg: 'Application introuvable' });
    }
    DB.targets.splice(index, 1);
    DB.scans = DB.scans.filter((s) => s.target_id !== req.params.id);
    return res.json({ code: 200, msg: 'Application et historique supprimés' });
  },
};
