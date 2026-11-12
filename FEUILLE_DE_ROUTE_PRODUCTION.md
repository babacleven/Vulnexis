# Feuille de Route Complète : Rendre Kortex Defender 100 % Vivant Étape par Étape

> 💡 **Approche locale progressive (Sans Docker obligatoire, Sans Prisma obligatoire)**  
> Votre projet tourne déjà localement avec :
> - Une architecture découpée (`frontend/` + `backend/`).
> - Un vrai moteur réseau (`backend/src/services/real-engine.ts`).
> - Un script SQL tout-en-un (`backend/src/database/Base_de_donnees.sql`) et un connecteur `pg` prêt dans `backend/src/database/connection.js`.
>
> Suivez ces étapes **dans l'ordre**, à votre rythme sur votre PC local, pour remplacer chaque simulation par une fonctionnalité 100 % persistante et intelligente.

---

## Sommaire

1. [Vue d'Ensemble de la Progression](#1-vue-densemble-de-la-progression)
2. [Étape 1 : Brancher les Contrôleurs sur votre PostgreSQL Local (`pool.query`)](#étape-1--brancher-les-contrôleurs-sur-votre-postgresql-local-poolquery)
3. [Étape 2 : Intégrer l'IA Gemini dans les Scans (`ai-analyzer.ts`)](#étape-2--intégrer-lia-gemini-dans-les-scans-ai-analyzerts)
4. [Étape 3 : Sécuriser l'Authentification Réelle (Bcrypt, JWT & OTP WhatsApp)](#étape-3--sécuriser-lauthentification-réelle-bcrypt-jwt--otp-whatsapp)
5. [Étape 4 : Activer les Paiements Réels Mobile Money (Wave / Orange Money)](#étape-4--activer-les-paiements-réels-mobile-money-wave--orange-money)
6. [Étape 5 : Industrialiser les Scans Longs (Queue asynchrone / Persistance)](#étape-5--industrialiser-les-scans-longs-queue-asynchrone--persistance)
7. [Étape 6 : Préparer et Déployer la Version Production (Optionnel : Docker / VPS)](#étape-6--préparer-et-déployer-la-version-production-optionnel--docker--vps)

---

## 1. Vue d'Ensemble de la Progression

| Brique actuelle | État actuel | Cible 100 % vivante |
|---|---|---|
| **Base de données** | Pool `pg` connecté via `.env`, mais contrôleurs lisent encore `db.js` en mémoire | Contrôleurs exécutent de vraies requêtes SQL sur vos 6 tables PostgreSQL |
| **Analyse de vulnérabilités** | Moteur réseau réel (`real-engine.ts`) : DNS, TLS, HTTP Headers, Sous-domaines | Enrichissement par Gemini (`@google/genai`) : score contextualisé + correctifs exacts (Nginx, Express, Apache) |
| **Authentification** | Cookie `kortex_session` simple + mot de passe en clair en dev | Hachage `bcryptjs` + JWT signé en cookie `HttpOnly` + vrai envoi OTP |
| **Crédits & Paiements** | Coupons statiques (`STARTER`, `PREMIUM`) | Checkout CinetPay / Wave Business + Webhook vérifié qui crédite PostgreSQL |
| **Tests** | 5 suites unitaires (`npm test`) | Ajout de tests d'intégration sur PostgreSQL de test |

---

## Étape 1 : Brancher les Contrôleurs sur votre PostgreSQL Local (`pool.query`)

Vous avez déjà installé PostgreSQL sur votre PC et chargé `.env` via `backend/src/config/env.js`. Il reste à faire lire et écrire vos contrôleurs dans les tables créées par `backend/src/database/Base_de_donnees.sql`.

### 1.1. Vérifier votre base locale
Assurez-vous que :
1. La base `kortex_defender` existe et que `backend/src/database/Base_de_donnees.sql` a bien été exécuté.
2. Votre fichier `.env` à la racine contient :
   ```env
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/kortex_defender"
   ```
3. Au lancement de `npm run dev` ou `npm run dev:back`, vous voyez bien :
   ```text
   🐘 [PostgreSQL] Connecté avec succès à votre base locale !
   ```

### 1.2. Migrer progressivement les contrôleurs vers SQL natif (`pg`)
Le connecteur `pool` est déjà exporté depuis `backend/src/database/connection.js`. Vous n'avez besoin ni de Prisma ni d'ORM complexe.

#### Exemple A : `backend/src/controllers/targets.controller.js`
Transformez les méthodes en `async` et utilisez `pool.query(...)` (avec fallback sur `DB` si `!pool`) :

```javascript
import { pool } from '../database/connection.js';
import { DB } from '../database/db.js';
import { resolveCurrentUser } from '../middlewares/auth.middleware.js';
import { generateId, formatUrl, extractHostname } from '../utils/helpers.js';

export const targetsController = {
  async list(req, res) {
    const userId = resolveCurrentUser(req);

    if (pool) {
      const { rows } = await pool.query(
        'SELECT * FROM targets WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return res.json({
        code: 200,
        msg: 'Requête réussie',
        data: { items: rows, total: rows.length, page: 1, size: 10, total_pages: 1 },
      });
    }

    // Fallback mémoire si PostgreSQL absent
    const items = DB.targets.filter((t) => t.userId === userId);
    return res.json({ code: 200, msg: 'Requête réussie', data: { items, total: items.length } });
  },

  async create(req, res) {
    const userId = resolveCurrentUser(req);
    const { url, name, target_type } = req.body;
    if (!url) return res.status(400).json({ code: 400, msg: 'URL requise' });

    const id = generateId('tgt');
    const formattedUrl = formatUrl(url);
    const parsedName = name?.trim() || extractHostname(formattedUrl);

    if (pool) {
      const { rows } = await pool.query(
        `INSERT INTO targets (id, user_id, url, name, target_type, authorized, authorized_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING *`,
        [id, userId, formattedUrl, parsedName, target_type || 'web']
      );
      return res.json({ code: 200, msg: 'Application ajoutée avec succès', data: rows[0] });
    }
    // ... fallback DB.targets.push
  },
};
```

#### Ordre conseillé pour migrer vos 5 contrôleurs :
1. `backend/src/controllers/targets.controller.js` (le plus simple : `SELECT`, `INSERT`, `UPDATE authorized`, `DELETE`).
2. `backend/src/controllers/misc.controller.js` (`users` pour `/me`, `notifications`, `referral_requests`).
3. `backend/src/controllers/credits.controller.js` (utiliser une transaction SQL `BEGIN` / `COMMIT` entre `UPDATE users SET credits = ...` et `INSERT INTO transactions`).
4. `backend/src/controllers/scans.controller.js` et `backend/src/services/scanner.ts` (sauvegarder `findings`, `log_lines`, `subdomains` dans les colonnes `JSONB`).
5. `backend/src/controllers/auth.controller.js`.

---

## Étape 2 : Intégrer l'IA Gemini dans les Scans (`ai-analyzer.ts`)

Le package officiel `@google/genai` est déjà installé dans votre `package.json`. Voici comment lui faire analyser les résultats réels collectés par `real-engine.ts`.

### 2.1. Ajouter votre clé API dans `.env`
```env
GEMINI_API_KEY="votre_cle_google_ai_studio"
```
*(Elle est automatiquement chargée au démarrage par `backend/src/config/env.js`)*.

### 2.2. Créer `backend/src/services/ai-analyzer.ts`
```typescript
import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

const ai = config.geminiApiKey ? new GoogleGenAI({ apiKey: config.geminiApiKey }) : null;

export interface AIAnalysisResult {
  executive_summary: string;
  calculated_score: number;
  findings: Array<{
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    cvss: number;
    description: string;
    impact: string;
    remediation: string;
    component: string;
  }>;
}

export async function enrichAuditWithAI(
  targetUrl: string,
  technicalSummary: {
    score: number;
    tls_info?: any;
    dns_records?: any;
    raw_findings: any[];
    subdomains: string[];
  }
): Promise<AIAnalysisResult | null> {
  if (!ai) return null;

  const prompt = `
Tu es un expert senior en cybersécurité AppSec pour Kortex Defender.
Analyse ces observations réseau réelles pour la cible : ${targetUrl}.

Données collectées par le scanner réseau :
${JSON.stringify(technicalSummary, null, 2)}

Mission :
1. Rédige un résumé exécutif de 3 phrases en français clair pour un dirigeant.
2. Enrichis chaque faille trouvée avec un correctif concret (snippet Nginx, Apache, Express ou DNS exact).
3. Ajuste le score final sur 100 de manière cohérente.

Réponds STRICTEMENT en JSON valide :
{
  "executive_summary": "...",
  "calculated_score": 78,
  "findings": [
    {
      "title": "...",
      "severity": "high",
      "category": "En-têtes HTTP de sécurité",
      "cvss": 7.5,
      "description": "...",
      "impact": "...",
      "remediation": "...",
      "component": "Nginx / Express"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    return JSON.parse(response.text || '{}') as AIAnalysisResult;
  } catch (err) {
    console.warn('[AI Analyzer] Fallback sur les résultats bruts du moteur réseau:', err);
    return null;
  }
}
```

### 2.3. Connecter l'IA dans `backend/src/services/scanner.ts`
Juste après `const result = await executeRealAudit(...)` :

```typescript
scan.progress = 90;
scan.phase = 'Analyse IA & remédiation';
addLog('Enrichissement des recommandations par Agent Kortex IA...');

const aiEnrichment = await enrichAuditWithAI(scan.target_url, {
  score: result.score,
  tls_info: result.tls_info,
  dns_records: result.dns_records,
  raw_findings: result.findings,
  subdomains: result.subdomains,
});

if (aiEnrichment?.findings?.length) {
  scan.score = aiEnrichment.calculated_score ?? result.score;
  scan.findings = aiEnrichment.findings.map((f, idx) => ({
    id: `fnd_ai_${Date.now()}_${idx}`,
    ...f,
    proof: result.findings[idx]?.proof || 'Vérifié lors du sondage réseau',
    url: scan.target_url,
  }));
}
```

*(Vous pourrez aussi réutiliser `@google/genai` dans un nouveau endpoint `POST /api/v1/agent/chat` pour rendre la page `frontend/src/pages/AgentPage.tsx` interactive).*

---

## Étape 3 : Sécuriser l'Authentification Réelle (Bcrypt, JWT & OTP WhatsApp)

### 3.1. Hachage des mots de passe & Sessions signées
```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```
Dans `backend/src/controllers/auth.controller.js` et `backend/src/middlewares/auth.middleware.js` :
1. **À l'inscription (`register`)** : `const passwordHash = await bcrypt.hash(password, 10);`
2. **À la connexion (`login`)** : `const valid = await bcrypt.compare(password, user.password_hash);`
3. **Token JWT dans cookie `HttpOnly`** :
   Signez `{ userId: user.id }` avec `process.env.JWT_SECRET` et stockez-le dans `kortex_session`.
4. **Suppression du fallback automatique en production** :
   Dans `auth.middleware.js`, si `NODE_ENV === 'production'` et qu'aucun cookie valide n'est présent, renvoyez `401 Unauthorized` au lieu de retomber sur `DB.users[0]`.

### 3.2. Envoi réel des codes OTP WhatsApp
Remplacez la simulation dans `authController.sendOtp` par un appel HTTP vers :
- **Meta WhatsApp Cloud API**, ou
- **Twilio / WasenderAPI / UltraMsg** (courants en Afrique de l'Ouest).

---

## Étape 4 : Activer les Paiements Réels Mobile Money (Wave / Orange Money)

1. Créez un compte marchand **CinetPay** ou **Wave Business / PayDunya**.
2. Ajoutez deux routes dans `backend/src/routes/credits.routes.js` et `backend/src/controllers/credits.controller.js` :
   - `POST /api/v1/credits/checkout` : Crée une transaction `pending` dans la table `transactions` et génère le lien de paiement / push USSD.
   - `POST /api/v1/credits/webhook` : Vérifie la signature HMAC de l'opérateur, passe la transaction en `completed`, incrémente `users.credits` en SQL et insère une notification.
3. Branchez le bouton d'achat de `frontend/src/pages/CreditsPage.tsx` sur `POST /api/v1/credits/checkout`.

---

## Étape 5 : Industrialiser les Scans Longs (Queue asynchrone / Persistance)

Actuellement, `runScanWorker(scan.id)` tourne dans le même processus Node.js. Lorsque vous aurez plusieurs dizaines d'audits simultanés :
1. Utilisez **Redis + BullMQ** (ou une table `scan_jobs` pollée par un worker séparé).
2. Mettez à jour les colonnes `progress`, `phase`, `log_lines` et `findings` dans PostgreSQL à chaque palier (`15% -> 35% -> 65% -> 85% -> 100%`) pour qu'un redémarrage du serveur n'interrompe pas le suivi.

---

## Étape 6 : Préparer et Déployer la Version Production (Optionnel : Docker / VPS)

> ⚠️ À faire uniquement lorsque toutes les étapes locales ci-dessus fonctionnent et que vous êtes prêt à publier sur internet.

Vous pourrez alors :
1. Construire le frontend statique avec `npm run build` (génère `/dist`).
2. Démarrer l'ensemble derrière Nginx / Caddy avec HTTPS (Let's Encrypt) via `NODE_ENV=production npm start` (ou dans un conteneur `Dockerfile` + PostgreSQL managé / VPS).
3. Vérifier les variables d'environnement de production : `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `APP_URL`, `NODE_ENV=production`.
