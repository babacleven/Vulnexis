import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// In-memory Database with initial state matching reference live account
interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  phone: string;
  credits: number;
  free_scans: number;
  is_admin: boolean;
  created_at: string;
}

interface DBTarget {
  id: string;
  userId: string;
  url: string;
  name: string;
  target_type: 'web' | 'api' | 'graphql';
  authorized: boolean;
  authorized_at?: string;
  scans_count: number;
  last_score?: number;
  last_scan_at?: string;
  created_at: string;
}

interface DBFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  cvss?: number;
  description: string;
  impact?: string;
  remediation: string;
  proof?: string;
  component?: string;
  url?: string;
}

interface DBScan {
  id: string;
  userId: string;
  target_id: string;
  target_url: string;
  profile: 'fast' | 'standard' | 'deep';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  progress: number;
  phase: string;
  score: number;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: DBFinding[];
  log_lines: string[];
  subdomains: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
}

interface DBTransaction {
  id: number;
  userId: string;
  delta: number;
  kind: 'free_scan' | 'credit' | 'purchase' | 'promo';
  reason: 'grant' | 'scan_debit' | 'purchase' | 'redeem' | 'refund';
  scan_id: string | null;
  note: string | null;
  created_time: string;
}

interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

// Global in-memory storage
const DB = {
  users: [
    {
      id: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      email: 'babaaristote6@gmail.com',
      passwordHash: 'Cl2even2026', // Plaintext check for reproduction
      phone: '+2250152311124',
      credits: 0,
      free_scans: 2,
      is_admin: false,
      created_at: '2026-11-06T12:28:26.843Z',
    },
  ] as DBUser[],
  targets: [] as DBTarget[],
  scans: [] as DBScan[],
  transactions: [
    {
      id: 24,
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      delta: -1,
      kind: 'free_scan',
      reason: 'scan_debit',
      scan_id: 'scan_01kortex_init',
      note: null,
      created_time: '2026-11-06T12:35:27.253508Z',
    },
    {
      id: 23,
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      delta: 3,
      kind: 'free_scan',
      reason: 'grant',
      scan_id: null,
      note: 'Scans de découverte offerts',
      created_time: '2026-11-06T12:28:26.843397Z',
    },
  ] as DBTransaction[],
  notifications: [
    {
      id: 'notif_01',
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      title: 'Scan terminé',
      message: 'Votre audit sur votre-site.com est disponible. Score : 72/100.',
      read: false,
      link: '/scans/scan_01kortex_init',
      created_at: '2026-11-06T12:35:28.000Z',
    },
    {
      id: 'notif_02',
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      title: 'Bienvenue sur Kortex Defender',
      message: '3 scans de découverte gratuits sont crédités sur votre compte.',
      read: true,
      link: '/credits',
      created_at: '2026-11-06T12:28:27.000Z',
    },
  ] as DBNotification[],
  otps: new Map<string, string>(),
};

// Helper: Get user from session cookie
function getAuthenticatedUser(req: Request): DBUser | null {
  const at = req.cookies['kx_at'];
  if (!at) {
    // If running in development without cookies, default to the user session
    return DB.users[0];
  }
  return DB.users[0];
}

// Authentication Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ msg: 'Identifiants incorrects.' });
  }

  // Set cookies matching Kortex Defender
  const fakeToken = `kx_token_${Date.now()}`;
  res.cookie('kx_at', fakeToken, { httpOnly: true, path: '/', maxAge: 86400 * 7 * 1000 });
  res.cookie('kx_rt', fakeToken + '_rt', { httpOnly: true, path: '/', maxAge: 86400 * 30 * 1000 });
  return res.json({ ok: true });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, phone, referral_code } = req.body;
  if (!email || !password || !phone) {
    return res.status(400).json({ msg: 'Tous les champs sont requis.' });
  }

  // Check if exists
  let user = DB.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (user) {
    return res.status(400).json({ msg: 'Un compte existe déjà avec cette adresse email.' });
  }

  const newUser: DBUser = {
    id: `usr_${Date.now()}`,
    email: email.trim(),
    passwordHash: password,
    phone: phone.trim(),
    credits: 0,
    free_scans: 3,
    is_admin: false,
    created_at: new Date().toISOString(),
  };

  DB.users.push(newUser);

  // Grant transaction
  DB.transactions.unshift({
    id: DB.transactions.length + 30,
    userId: newUser.id,
    delta: 3,
    kind: 'free_scan',
    reason: 'grant',
    scan_id: null,
    note: referral_code ? `Scans de découverte + Code ${referral_code}` : 'Scans de découverte offerts',
    created_time: new Date().toISOString(),
  });

  const fakeToken = `kx_token_${Date.now()}`;
  res.cookie('kx_at', fakeToken, { httpOnly: true, path: '/', maxAge: 86400 * 7 * 1000 });
  res.cookie('kx_rt', fakeToken + '_rt', { httpOnly: true, path: '/', maxAge: 86400 * 30 * 1000 });

  return res.json({ ok: true, email: newUser.email });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!code || code.length < 4) {
    return res.status(400).json({ msg: 'Code invalide.' });
  }
  const fakeToken = `kx_token_${Date.now()}`;
  res.cookie('kx_at', fakeToken, { httpOnly: true, path: '/', maxAge: 86400 * 7 * 1000 });
  res.cookie('kx_rt', fakeToken + '_rt', { httpOnly: true, path: '/', maxAge: 86400 * 30 * 1000 });
  return res.json({ ok: true });
});

app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
  return res.json({ ok: true });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email requis.' });
  return res.json({ ok: true });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, code, new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ msg: 'Le mot de passe doit faire au moins 8 caractères.' });
  }
  const user = DB.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (user) {
    user.passwordHash = new_password;
  }
  return res.json({ ok: true });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('kx_at');
  res.clearCookie('kx_rt');
  return res.json({ ok: true });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ msg: 'Non authentifié' });
  return res.json({
    email: user.email,
    phone: user.phone,
    is_admin: user.is_admin,
    created_at: user.created_at,
  });
});

// Kortex API middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ code: 401, msg: 'Session expirée, reconnectez-vous.' });
  }
  (req as any).user = user;
  next();
};

// API Endpoints (/api/k/...)
app.get('/api/k/credits/me', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      credits: user.credits,
      free_scans: user.free_scans,
      next_expiry: null,
      is_admin: user.is_admin,
      pricing: {
        fast: 1,
        standard: 2,
        deep: 4,
        free_profiles: ['fast', 'standard'],
      },
    },
  });
});

app.get('/api/k/credits/me/transactions', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const items = DB.transactions.filter(t => t.userId === user.id);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      items,
      total: items.length,
      page: 1,
      size: 10,
      total_pages: Math.ceil(items.length / 10) || 1,
      links: {
        first: '/api/v1/credits/me/transactions?page=1&size=10',
        last: null,
        self: '/api/v1/credits/me/transactions',
        next: null,
        prev: null,
      },
    },
  });
});

app.get('/api/k/credits/me/grants', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const grants = DB.transactions.filter(t => t.userId === user.id && t.reason === 'grant');
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: { items: grants },
  });
});

app.post('/api/k/credits/redeem', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ code: 400, msg: 'Code invalide.' });
  }

  const clean = code.trim().toUpperCase();
  let creditsToAdd = 10;
  if (clean.includes('50') || clean === 'PREMIUM') creditsToAdd = 50;
  else if (clean.includes('20')) creditsToAdd = 20;

  user.credits += creditsToAdd;

  DB.transactions.unshift({
    id: DB.transactions.length + 50,
    userId: user.id,
    delta: creditsToAdd,
    kind: 'credit',
    reason: 'redeem',
    scan_id: null,
    note: `Code promo ${clean} activé`,
    created_time: new Date().toISOString(),
  });

  return res.json({
    code: 200,
    msg: `${creditsToAdd} crédits ont été ajoutés à votre compte !`,
    data: { credits_added: creditsToAdd, new_balance: user.credits },
  });
});

// Targets API
app.get('/api/k/targets', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const items = DB.targets.filter(t => t.userId === user.id);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      items,
      total: items.length,
      page: 1,
      size: 10,
      total_pages: Math.ceil(items.length / 10) || 1,
      links: {
        first: '/api/v1/targets/?page=1&size=10',
        last: null,
        self: '/api/v1/targets/',
        next: null,
        prev: null,
      },
    },
  });
});

app.post('/api/k/targets', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  let { url, target_type } = req.body;
  if (!url) return res.status(400).json({ code: 400, msg: 'URL requise' });

  // Normalise URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let domain = url;
  try {
    domain = new URL(url).hostname;
  } catch (e) {}

  const target: DBTarget = {
    id: `tgt_${Date.now()}`,
    userId: user.id,
    url,
    name: domain,
    target_type: target_type || 'web',
    authorized: true,
    authorized_at: new Date().toISOString(),
    scans_count: 0,
    created_at: new Date().toISOString(),
  };

  DB.targets.unshift(target);
  return res.json({ code: 200, msg: 'Application ajoutée', data: target });
});

app.get('/api/k/targets/:id', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const target = DB.targets.find(t => t.id === req.params.id && t.userId === user.id);
  if (!target) return res.status(404).json({ code: 404, msg: 'Application introuvable' });
  return res.json({ code: 200, msg: 'Requête réussie', data: target });
});

app.post('/api/k/targets/:id/authorize', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const target = DB.targets.find(t => t.id === req.params.id && t.userId === user.id);
  if (!target) return res.status(404).json({ code: 404, msg: 'Application introuvable' });

  target.authorized = !target.authorized;
  if (target.authorized) {
    target.authorized_at = new Date().toISOString();
  } else {
    target.authorized_at = undefined;
  }
  return res.json({ code: 200, msg: 'Statut mis à jour', data: target });
});

app.delete('/api/k/targets/:id', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const idx = DB.targets.findIndex(t => t.id === req.params.id && t.userId === user.id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: 'Application introuvable' });

  DB.targets.splice(idx, 1);
  // delete attached scans
  DB.scans = DB.scans.filter(s => s.target_id !== req.params.id);
  return res.json({ code: 200, msg: 'Application supprimée' });
});

// Scans API
app.get('/api/k/scans', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  let items = DB.scans.filter(s => s.userId === user.id);

  if (req.query.target_id) {
    items = items.filter(s => s.target_id === req.query.target_id);
  }
  if (req.query.status && req.query.status !== 'all' && req.query.status !== 'Tous') {
    items = items.filter(s => s.status === req.query.status);
  }

  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      items,
      total: items.length,
      page: 1,
      size: 10,
      total_pages: Math.ceil(items.length / 10) || 1,
      links: {
        first: '/api/v1/scans/?page=1&size=10',
        last: null,
        self: '/api/v1/scans/',
        next: null,
        prev: null,
      },
    },
  });
});

app.post('/api/k/scans', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const { target_id, profile } = req.body;

  const target = DB.targets.find(t => t.id === target_id && t.userId === user.id);
  if (!target) return res.status(400).json({ code: 400, msg: 'Cible introuvable' });
  if (!target.authorized) return res.status(400).json({ code: 400, msg: 'Cette cible n’a pas d’attestation valide.' });

  // Credit or free scan consumption check
  const scanProfile = profile || 'standard';
  const isFreeProfile = scanProfile === 'fast' || scanProfile === 'standard';

  let debitKind: 'free_scan' | 'credit' = 'credit';
  let cost = scanProfile === 'deep' ? 4 : scanProfile === 'standard' ? 2 : 1;

  if (user.free_scans > 0 && isFreeProfile) {
    user.free_scans -= 1;
    debitKind = 'free_scan';
  } else if (user.credits >= cost) {
    user.credits -= cost;
    debitKind = 'credit';
  } else {
    return res.status(402).json({ code: 402, msg: `Solde insuffisant. Il vous faut ${cost} crédit(s).` });
  }

  const scanId = `scan_${Date.now()}`;

  // Log transaction
  DB.transactions.unshift({
    id: DB.transactions.length + 100,
    userId: user.id,
    delta: debitKind === 'free_scan' ? -1 : -cost,
    kind: debitKind,
    reason: 'scan_debit',
    scan_id: scanId,
    note: `Audit ${scanProfile} sur ${target.name}`,
    created_time: new Date().toISOString(),
  });

  const newScan: DBScan = {
    id: scanId,
    userId: user.id,
    target_id: target.id,
    target_url: target.url,
    profile: scanProfile,
    status: 'running',
    progress: 15,
    phase: 'Initialisation',
    score: 0,
    counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    findings: [],
    log_lines: [
      `${new Date().toLocaleTimeString()} - Lancement du scan (${scanProfile})`,
      `${new Date().toLocaleTimeString()} - Résolution DNS et découverte d'infrastructure`,
    ],
    subdomains: [target.name, `api.${target.name}`, `auth.${target.name}`],
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
  };

  DB.scans.unshift(newScan);
  target.scans_count += 1;

  // Simulate automated realistic progression
  simulateScanProgress(newScan, target, user);

  return res.json({ code: 200, msg: 'Scan démarré avec succès', data: newScan });
});

app.get('/api/k/scans/:id', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const scan = DB.scans.find(s => s.id === req.params.id && s.userId === user.id);
  if (!scan) return res.status(404).json({ code: 404, msg: 'Scan introuvable' });
  return res.json({ code: 200, msg: 'Requête réussie', data: scan });
});

app.delete('/api/k/scans/:id', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const idx = DB.scans.findIndex(s => s.id === req.params.id && s.userId === user.id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: 'Scan introuvable' });

  DB.scans.splice(idx, 1);
  return res.json({ code: 200, msg: 'Scan supprimé' });
});

// Download scan report
app.get('/api/k/scans/:id/download', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const scan = DB.scans.find(s => s.id === req.params.id && s.userId === user.id);
  if (!scan) return res.status(404).json({ code: 404, msg: 'Scan introuvable' });

  const format = req.query.format === 'json' ? 'json' : 'html';
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-kortex-${scan.id}.json"`);
    return res.send(JSON.stringify(scan, null, 2));
  }

  // Generate clean HTML printable report
  const htmlReport = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rapport d'audit de sécurité · Kortex Defender · ${scan.target_url}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #0a0a0a; margin: 40px auto; max-width: 900px; padding: 0 20px; }
    h1, h2, h3 { font-family: "Outfit", sans-serif; }
    .header { border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #fff; }
    .badge-critical { background: #c81e4b; }
    .badge-high { background: #e96c14; }
    .badge-medium { background: #e0a608; }
    .badge-low { background: #3898ec; }
    .score-box { background: #0a0a0a; color: #fff; padding: 20px; border-radius: 16px; margin: 24px 0; display: flex; justify-content: space-between; align-items: center; }
    .finding { border: 1px solid #e4e4e7; border-radius: 12px; padding: 18px; margin-bottom: 16px; page-break-inside: avoid; }
    .finding-title { font-size: 16px; font-weight: 600; margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
    .fix-box { background: #f4f4f5; border-left: 4px solid #0a0a0a; padding: 12px; margin-top: 10px; font-size: 14px; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2>KORTEX DEFENDER</h2>
      <p style="color: #5f5f66; margin: 0;">Rapport officiel d'audit de sécurité</p>
    </div>
    <div style="text-align: right;">
      <p style="margin: 0; font-weight: 600;">Cible : ${scan.target_url}</p>
      <p style="margin: 0; color: #5f5f66; font-size: 13px;">Date : ${new Date(scan.created_at).toLocaleString('fr-FR')}</p>
    </div>
  </div>
  <div class="score-box">
    <div>
      <h3 style="margin: 0;">Score global de sécurité</h3>
      <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 14px;">Calculé sur 15 analyseurs indépendants</p>
    </div>
    <div style="font-size: 48px; font-weight: 700;">${scan.score} <span style="font-size: 20px; color: #a1a1aa;">/ 100</span></div>
  </div>
  <h3>Vulnérabilités détectées (${scan.findings.length})</h3>
  ${scan.findings.map(f => `
    <div class="finding">
      <div class="finding-title">
        <span class="badge badge-${f.severity}">${f.severity}</span>
        <span>${f.title}</span>
      </div>
      <p style="color: #5f5f66; font-size: 14px; margin: 4px 0;">Catégorie : ${f.category} · Cible : ${f.url || scan.target_url}</p>
      <p style="font-size: 14px;">${f.description}</p>
      <div class="fix-box">
        <strong>Correctif recommandé :</strong><br/>
        ${f.remediation}
      </div>
    </div>
  `).join('')}
  <footer style="margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px; text-align: center; color: #71717a; font-size: 12px;">
    Document confidentiel généré par Kortex Defender · © ${new Date().getFullYear()} Kortex Defender
  </footer>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="rapport-kortex-${scan.id}.html"`);
  return res.send(htmlReport);
});

// Notifications API
app.get('/api/k/notifications/me', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const items = DB.notifications.filter(n => n.userId === user.id);
  return res.json({
    code: 200,
    msg: 'Requête réussie',
    data: {
      items,
      total: items.length,
      page: 1,
      size: 10,
      total_pages: Math.ceil(items.length / 10) || 1,
      links: {
        first: '/api/v1/notifications/me?page=1&size=10',
        last: null,
        self: '/api/v1/notifications/me',
        next: null,
        prev: null,
      },
    },
  });
});

app.get('/api/k/notifications/me/unread-count', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const count = DB.notifications.filter(n => n.userId === user.id && !n.read).length;
  return res.json({ code: 200, msg: 'Requête réussie', data: { count } });
});

app.post('/api/k/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  DB.notifications.forEach(n => {
    if (n.userId === user.id) n.read = true;
  });
  return res.json({ code: 200, msg: 'Toutes les notifications marquées comme lues' });
});

app.post('/api/k/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user: DBUser = (req as any).user;
  const notif = DB.notifications.find(n => n.id === req.params.id && n.userId === user.id);
  if (notif) notif.read = true;
  return res.json({ code: 200, msg: 'Notification marquée comme lue' });
});

// Automated scanner simulator
function simulateScanProgress(scan: DBScan, target: DBTarget, user: DBUser) {
  const stages = [
    { progress: 35, phase: 'Cartographie', log: 'Découverte des services et sous-domaines' },
    { progress: 65, phase: 'Reconnaissance & scan', log: 'Analyse des en-têtes de sécurité, ports, SSL/TLS et CVE' },
    { progress: 85, phase: 'Validation contrôlée', log: 'Corrélation et vérification des faux-positifs' },
    { progress: 100, phase: 'Terminé', log: 'Scan complété. Rapport de sécurité finalisé.' },
  ];

  let step = 0;
  const interval = setInterval(() => {
    if (step < stages.length) {
      const s = stages[step];
      scan.progress = s.progress;
      scan.phase = s.phase;
      scan.log_lines.push(`${new Date().toLocaleTimeString()} - ${s.log}`);

      if (scan.progress === 100) {
        scan.status = 'completed';
        scan.completed_at = new Date().toISOString();
        scan.duration_seconds = 18;

        // Populate findings
        const findings: DBFinding[] = [
          {
            id: `fnd_${Date.now()}_1`,
            title: 'En-tête Strict-Transport-Security (HSTS) absent',
            severity: 'medium',
            category: 'Chiffrement & SSL/TLS',
            cvss: 5.4,
            description: "Le serveur n'impose pas l'utilisation de HTTPS via l'en-tête HSTS, ce qui permet des attaques par rétrogradation de protocole (SSL stripping).",
            remediation: "Ajoutez l'en-tête 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' sur votre reverse proxy ou serveur web.",
            proof: "Port 443 - Header Strict-Transport-Security manquant",
            url: target.url,
          },
          {
            id: `fnd_${Date.now()}_2`,
            title: 'Content-Security-Policy non configurée',
            severity: 'high',
            category: 'En-têtes HTTP de sécurité',
            cvss: 7.2,
            description: "Absence de directive CSP pour restreindre le chargement de scripts externes et limiter l'impact des vulnérabilités Cross-Site Scripting (XSS).",
            remediation: "Déployez une CSP stricte avec nonces ou restrictions de domaines autorisés.",
            proof: "Header Content-Security-Policy non retourné",
            url: target.url,
          },
          {
            id: `fnd_${Date.now()}_3`,
            title: 'Protection X-Content-Type-Options absente',
            severity: 'low',
            category: 'Configuration HTTP',
            cvss: 3.5,
            description: "Les navigateurs peuvent effectuer du MIME-type sniffing et exécuter des fichiers texte ou images en tant que code malveillant.",
            remediation: "Définissez 'X-Content-Type-Options: nosniff'.",
            proof: "X-Content-Type-Options absent",
            url: target.url,
          },
          {
            id: `fnd_${Date.now()}_4`,
            title: 'Version du serveur exposée',
            severity: 'low',
            category: 'Divulgation d’informations',
            cvss: 2.8,
            description: "Le serveur transmet sa version exacte dans l'en-tête Server, facilitant le ciblage de vulnérabilités connues.",
            remediation: "Désactivez les signatures du serveur web (ServerTokens Prod sous Apache, server_tokens off sous Nginx).",
            proof: "Server: nginx/1.24.0",
            url: target.url,
          },
        ];

        if (scan.profile === 'deep') {
          findings.unshift({
            id: `fnd_${Date.now()}_0`,
            title: 'Endpoints d’administration ou de documentation Swagger/OpenAPI exposés publiquement',
            severity: 'critical',
            category: 'Contrôle d’accès',
            cvss: 9.1,
            description: "L'interface Swagger/OpenAPI ou des routes d'administration sont accessibles sans authentification préalable.",
            remediation: "Restreignez l'accès à ces endpoints par IP ou exigez une authentification administrateur.",
            proof: "HTTP 200 sur /api/docs et /swagger-ui.html",
            url: `${target.url}/api/docs`,
          });
        }

        scan.findings = findings;
        scan.counts = {
          critical: findings.filter(f => f.severity === 'critical').length,
          high: findings.filter(f => f.severity === 'high').length,
          medium: findings.filter(f => f.severity === 'medium').length,
          low: findings.filter(f => f.severity === 'low').length,
          info: 1,
        };

        const penalties = scan.counts.critical * 35 + scan.counts.high * 15 + scan.counts.medium * 7 + scan.counts.low * 2;
        scan.score = Math.max(12, 100 - penalties);
        target.last_score = scan.score;
        target.last_scan_at = scan.completed_at;

        DB.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: user.id,
          title: `Audit terminé : ${target.name}`,
          message: `Le scan (${scan.profile}) est achevé avec un score de sécurité de ${scan.score}/100.`,
          read: false,
          link: `/scans/${scan.id}`,
          created_at: new Date().toISOString(),
        });

        clearInterval(interval);
      }
      step++;
    } else {
      clearInterval(interval);
    }
  }, 3500);
}

// Development or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kortex Defender running on port ${PORT}`);
  });
}

startServer();
