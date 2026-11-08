import { Router, Request, Response } from 'express';
import { DB } from '../db.ts';
import { runScanWorker } from '../services/scanner.ts';

export const scansRouter = Router();

function getCurrentUserId(req: Request): string {
  const cookieId = req.cookies?.kortex_session;
  if (cookieId && DB.users.some((u) => u.id === cookieId)) {
    return cookieId;
  }
  return DB.users[0]?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt';
}

// GET /api/v1/scans
scansRouter.get('/', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  let items = DB.scans.filter((s) => s.userId === userId);

  const { status, target_id } = req.query;
  if (status && status !== 'Tous') {
    items = items.filter((s) => s.status === status);
  }
  if (target_id && target_id !== 'Toutes') {
    items = items.filter((s) => s.target_id === target_id);
  }

  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      items,
      total: items.length,
      page: 1,
      size: 10,
      total_pages: 1,
      links: { first: '/api/v1/scans/?page=1&size=10', last: null, self: '/api/v1/scans/', next: null, prev: null },
    },
  });
});

// POST /api/v1/scans
scansRouter.post('/', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = DB.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ code: 401, msg: 'Utilisateur non authentifié' });
  }

  const { target_id, profile = 'standard' } = req.body;
  const target = DB.targets.find((t) => t.id === target_id && t.userId === userId);
  if (!target) {
    return res.status(404).json({ code: 404, msg: 'Cible introuvable' });
  }
  if (!target.authorized) {
    return res.status(400).json({ code: 400, msg: 'Cette application n’a pas d’attestation valide.' });
  }

  const cost = profile === 'deep' ? 4 : profile === 'standard' ? 2 : 1;
  const canUseFree = user.free_scans > 0 && (profile === 'fast' || profile === 'standard');

  if (canUseFree) {
    user.free_scans -= 1;
    DB.transactions.push({
      id: DB.transactions.length + 1,
      userId,
      delta: -1,
      kind: 'free_scan',
      reason: 'scan_debit',
      scan_id: null,
      note: `Débit audit profil ${profile}`,
      created_time: new Date().toISOString(),
    });
  } else if (user.credits >= cost) {
    user.credits -= cost;
    DB.transactions.push({
      id: DB.transactions.length + 1,
      userId,
      delta: -cost,
      kind: 'credit',
      reason: 'scan_debit',
      scan_id: null,
      note: `Débit audit profil ${profile}`,
      created_time: new Date().toISOString(),
    });
  } else {
    return res.status(402).json({ code: 402, msg: `Solde insuffisant : ce profil requiert ${cost} crédit(s).` });
  }

  target.scans_count += 1;

  const newScan = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    target_id: target.id,
    target_url: target.url,
    profile: profile as any,
    status: 'running' as const,
    progress: 5,
    phase: 'Initialisation',
    score: 0,
    counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    findings: [],
    log_lines: [`${new Date().toLocaleTimeString('fr-FR')} - Scan initialisé sur ${target.url}`],
    subdomains: [new URL(target.url).hostname],
    created_at: new Date().toISOString(),
  };

  DB.scans.unshift(newScan);

  // Trigger background asynchronous scan worker
  runScanWorker(newScan.id);

  return res.status(201).json({
    code: 201,
    msg: 'Scan démarré avec succès',
    data: newScan,
  });
});

// GET /api/v1/scans/:id
scansRouter.get('/:id', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const scan = DB.scans.find((s) => s.id === req.params.id && s.userId === userId);
  if (!scan) {
    return res.status(404).json({ code: 404, msg: 'Scan introuvable' });
  }
  return res.json({ code: 200, msg: 'Requête réussie', data: scan });
});

// GET /api/v1/scans/:id/download
scansRouter.get('/:id/download', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const scan = DB.scans.find((s) => s.id === req.params.id && s.userId === userId);
  if (!scan) {
    return res.status(404).json({ code: 404, msg: 'Scan introuvable' });
  }

  const format = req.query.format === 'json' ? 'json' : 'html';
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="kortex-audit-${scan.id}.json"`);
    return res.send(JSON.stringify(scan, null, 2));
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport d'audit Kortex Defender - ${scan.target_url}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0a0a0a; background: #fff; line-height: 1.5; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .score { font-size: 32px; font-weight: bold; margin: 20px 0; }
    .finding { border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>KORTEX DEFENDER · RAPPORT DE SÉCURITÉ</h1>
  <p>Cible : <strong>${scan.target_url}</strong> | Date : ${new Date(scan.created_at).toLocaleString('fr-FR')}</p>
  <div class="score">Score de sécurité : ${scan.score}/100</div>
  <h2>Vulnérabilités détectées (${scan.findings.length})</h2>
  ${scan.findings.map((f) => `
    <div class="finding">
      <h3>${f.title} (${f.severity.toUpperCase()})</h3>
      <p>${f.description}</p>
      <p><strong>Impact :</strong> ${f.impact}</p>
      <p><strong>Remédiation :</strong> ${f.remediation}</p>
    </div>
  `).join('')}
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="kortex-rapport-${scan.id}.html"`);
  return res.send(html);
});

// DELETE /api/v1/scans/:id
scansRouter.delete('/:id', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const index = DB.scans.findIndex((s) => s.id === req.params.id && s.userId === userId);
  if (index === -1) {
    return res.status(404).json({ code: 404, msg: 'Scan introuvable' });
  }
  DB.scans.splice(index, 1);
  return res.json({ code: 200, msg: 'Scan supprimé avec succès' });
});
