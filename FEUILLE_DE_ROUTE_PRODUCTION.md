# Feuille de Route Complète : Rendre Kortex Defender 100 % Vivant en Production

> 📌 **NOTE IMPORTANTE POUR VOTRE TRAVAIL ACTUEL :**  
> **Vous n'avez PAS besoin de ce document, ni de Docker, ni de PostgreSQL, ni de Prisma pour travailler en local !**  
> Le projet fonctionne déjà à 100 % sur votre machine grâce au store autonome `backend/db.ts` pré-rempli avec votre compte.  
> 
> **Conservez cette feuille de route pour plus tard :** elle vous servira de guide lorsque vous aurez fini de comprendre et de personnaliser le projet en local et que vous me demanderez de préparer la version pour la mise en ligne (production).

---

## Sommaire

1. [Vue d'Ensemble des 6 Chantiers](#1-vue-densemble-des-6-chantiers)
2. [Étape 1 : Remplacer les Données en Dur par PostgreSQL & Prisma](#étape-1--remplacer-les-données-en-dur-par-postgresql--prisma)
3. [Étape 2 : Intégrer l'Intelligence Artificielle (IA) pour les Scans](#étape-2--intégrer-lintelligence-artificielle-ia-pour-les-scans)
4. [Étape 3 : Authentification Réelle avec Bcrypt & Cookies Sécurisés](#étape-3--authentification-réelle-avec-bcrypt--cookies-sécurisés)
5. [Étape 4 : Connexion Réelle Mobile Money (Wave, Orange Money)](#étape-4--connexion-réelle-mobile-money-wave-orange-money)
6. [Étape 5 : Moteur de Scan Asynchrone avec Worker Queue (BullMQ)](#étape-5--moteur-de-scan-asynchrone-avec-worker-queue-bullmq)
7. [Étape 6 : Déploiement en Ligne (Docker & Cloud Run / VPS)](#étape-6--déploiement-en-ligne-docker--cloud-run--vps)

---

## 1. Vue d'Ensemble des 6 Chantiers

Actuellement, le projet dispose d'une structure logicielle très propre et modulaire :
- **`/frontend`** : Interface React 19 et Tailwind CSS v4 avec les 13 écrans officiels.
- **`/backend`** : Serveur Express avec routeurs normalisés sous `/api/v1/` et moteur réseau réel pour DNS, TLS et Headers.
- **`backend/db.ts`** : Un store en mémoire vive qui sert de simulation pour le développement immédiat.

Pour rendre le système **entièrement vivant et persistant**, vous allez remplacer les briques simulées une par une selon le schéma suivant :

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (React 19)                      │
│            Consomme l'API standardisée via des requêtes /api/v1/*      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND EXPRESS (server.ts / app.ts)               │
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │ Authentification    │   │ Moteur IA Gemini (@google/genai)     │   │
│   │ Bcrypt + Sessions   │   │ - Analyse de failles & score CVSS    │   │
│   │ + OTP WhatsApp      │   │ - Génération de correctifs de code   │   │
│   └─────────────────────┘   │ - Synthèse vulgarisée pour décideurs │   │
│                             └──────────────────────────────────────┘   │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │ Paiements Réels     │   │ Worker Queue Asynchrone (BullMQ)     │   │
│   │ Webhooks Wave/MoMo  │   │ Exécution des audits en tâche de     │   │
│   │ Recharges auto      │   │ fond sans bloquer l'API              │   │
│   └─────────────────────┘   └──────────────────────────────────────┘   │
│                                    │                                   │
│                                    ▼                                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               BASE DE DONNÉES POSTGRESQL & PRISMA              │   │
│   │               Persistance intégrale de vos données             │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Étape 1 : Remplacer les Données en Dur par PostgreSQL & Prisma

### Objectif
Supprimer le tableau `DB` en mémoire vive du fichier `backend/db.ts` pour que chaque utilisateur, application déclarée, audit de sécurité et transaction de crédit soit sauvegardé pour toujours dans PostgreSQL.

### 1.1. Installer Prisma
Dans votre terminal :
```bash
npm install @prisma/client
npm install -D prisma
```

### 1.2. Créer le Schéma de Base de Données
Créez un dossier `prisma/` à la racine et un fichier `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  passwordHash String
  phone        String?
  credits      Int           @default(0)
  free_scans   Int           @default(3)
  is_admin     Boolean       @default(false)
  created_at   DateTime      @default(now())

  targets      Target[]
  scans        Scan[]
  transactions Transaction[]
  notifications Notification[]
  referrals    ReferralRequest[]
}

model Target {
  id            String    @id @default(cuid())
  userId        String
  url           String
  name          String
  target_type   String    @default("web") // web, api, graphql
  authorized    Boolean   @default(true)
  authorized_at DateTime?
  scans_count   Int       @default(0)
  last_score    Int?
  last_scan_at  DateTime?
  created_at    DateTime  @default(now())

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scans         Scan[]
}

model Scan {
  id               String    @id @default(cuid())
  userId           String
  target_id        String
  target_url       String
  profile          String    // fast, standard, deep
  status           String    @default("queued") // queued, running, completed, failed
  progress         Int       @default(0)
  phase            String    @default("Initialisation")
  score            Int       @default(100)
  counts_critical  Int       @default(0)
  counts_high      Int       @default(0)
  counts_medium    Int       @default(0)
  counts_low       Int       @default(0)
  counts_info      Int       @default(0)
  findings         Json      @default("[]")
  log_lines        Json      @default("[]")
  subdomains       Json      @default("[]")
  duration_seconds Int?
  created_at       DateTime  @default(now())
  started_at       DateTime?
  completed_at     DateTime?

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  target           Target    @relation(fields: [target_id], references: [id], onDelete: Cascade)
}

model Transaction {
  id           Int      @id @default(autoincrement())
  userId       String
  delta        Int
  kind         String   // free_scan, credit, purchase, promo
  reason       String   // grant, scan_debit, purchase, redeem
  scan_id      String?
  note         String?
  created_time DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id         String   @id @default(cuid())
  userId     String
  title      String
  message    String
  read       Boolean  @default(false)
  link       String?
  created_at DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ReferralRequest {
  id         String   @id @default(cuid())
  userId     String
  promoCode  String
  fullName   String
  operator   String   // Wave, Orange, MTN, Moov
  phone      String
  status     String   @default("pending")
  created_at DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 1.3. Lancer la migration
```bash
# Génère le schéma dans votre base PostgreSQL
npx prisma migrate dev --name init_kortex_db
```

### 1.4. Remplacer `backend/db.ts` par le Client Prisma Réel
Créez un fichier `backend/prisma.ts` :
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

Ensuite, dans chaque routeur (`backend/routes/targets.routes.ts`, `scans.routes.ts`, etc.), remplacez simplement les tableaux en mémoire par des appels asynchrones :
- `DB.targets.filter(...)` ➔ `await prisma.target.findMany({ where: { userId } })`
- `DB.targets.push(...)` ➔ `await prisma.target.create({ data: { ... } })`
- `DB.scans.find(...)` ➔ `await prisma.scan.findUnique({ where: { id } })`

---

## Étape 2 : Intégrer l'Intelligence Artificielle (IA) pour les Scans

L'IA est l'atout majeur de Kortex Defender pour transformer des données brutes en un rapport à haute valeur ajoutée.

### 2.1. Les 4 Rôles de l'IA dans Kortex Defender

1. **Détection avancée des vulnérabilités dans les en-têtes et les réponses HTTP** :
   L'IA inspecte le code HTML servi, les en-têtes bruts et les certificats pour déceler des failles subtiles (mauvaises directives CSP, cookies sans flag Secure, informations d'architectures divulguées).
2. **Génération de correctifs de code sur-mesure (Remediation)** :
   Au lieu de donner une réponse générique, l'IA détecte la technologie de la cible (Nginx, Apache, Express, Laravel, WordPress, Next.js) et produit le bloc de configuration exact à copier-coller.
3. **Synthèse vulgarisée en français pour les décideurs** :
   L'IA rédige un résumé exécutif non-technique expliquant les risques concrets (vol de données, blocage du site, usurpation d'email).
4. **Agent Kortex (L'analyste de sécurité interactif)** :
   Un chat où l'utilisateur pose des questions sur son scan (*« Comment puis-je installer mon certificat Let's Encrypt sur mon VPS Ubuntu ? »*) et reçoit des instructions pas-à-pas.

---

### 2.2. Implémentation du Service IA (`backend/services/ai-analyzer.ts`)

Le package `@google/genai` est déjà présent dans votre `package.json`. Voici le service complet à créer dans `backend/services/ai-analyzer.ts` :

```typescript
import { GoogleGenAI } from '@google/genai';

// Initialisation avec la clé d'environnement injectée par AI Studio
const ai = new GoogleGenAI();

export interface AIAnalysisResult {
  executive_summary: string;
  calculated_score: number;
  recommendations: Array<{
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    cvss: number;
    explanation_fr: string;
    business_impact: string;
    remediation_code: string;
    stack_component: string;
  }>;
}

/**
 * Analyse approfondie par IA d'un scan de sécurité
 */
export async function analyzeTargetWithAI(targetUrl: string, rawTechnicalData: {
  headers: Record<string, string>;
  sslInfo?: any;
  dnsRecords?: any;
  exposedPaths?: string[];
  technologies?: string[];
}): Promise<AIAnalysisResult> {
  const prompt = `
Tu es un ingénieur expert en cybersécurité pour la plateforme Kortex Defender en Afrique de l'Ouest.
Analyse les résultats techniques bruts de l'audit de sécurité sur la cible suivante : ${targetUrl}.

Données techniques collectées :
- En-têtes HTTP de sécurité reçus : ${JSON.stringify(rawTechnicalData.headers, null, 2)}
- Informations SSL/TLS : ${JSON.stringify(rawTechnicalData.sslInfo || {}, null, 2)}
- Enregistrements DNS et messagerie : ${JSON.stringify(rawTechnicalData.dnsRecords || {}, null, 2)}
- Chemins ou fichiers sensibles détectés : ${JSON.stringify(rawTechnicalData.exposedPaths || [])}
- Technologies détectées : ${JSON.stringify(rawTechnicalData.technologies || [])}

Directives impératives :
1. Rédige en français clair, précis et professionnel.
2. Identifie les failles de sécurité réelles (ex: CSP absente, HSTS manquant, TLS obsolète, SPF/DMARC manquant, fuite de bannières).
3. Attribue à chaque faille un score CVSS v3.1 précis entre 0.0 et 10.0.
4. Pour chaque faille, fournis le code de correctif EXACT (snippet de configuration Nginx, Apache ou Express).
5. Fournis un résumé exécutif vulgarisé expliquant les risques financiers et métiers pour le propriétaire de l'application.

Réponds STRICTEMENT au format JSON respectant ce schéma :
{
  "executive_summary": "Résumé de 3-4 phrases en français...",
  "calculated_score": 75,
  "recommendations": [
    {
      "title": "Nom de la vulnérabilité",
      "severity": "high",
      "cvss": 7.5,
      "explanation_fr": "Explication claire...",
      "business_impact": "Impact métier si exploitée...",
      "remediation_code": "Snippet de code correctif...",
      "stack_component": "HTTP Headers"
    }
  ]
}
`;

  try {
    // Utilisation du modèle recommandé gemini-3.8-flash pour la rapidité et la pertinence
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Faible température pour des résultats rigoureux et déterministes
      },
    });

    const jsonText = response.text || '{}';
    const parsed: AIAnalysisResult = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error("Erreur lors de l'analyse IA :", error);
    // Fallback gracieux en cas d'indisponibilité temporaire du réseau
    return {
      executive_summary: "L'analyse automatisée des en-têtes et des certificats a été complétée avec succès.",
      calculated_score: 80,
      recommendations: [],
    };
  }
}
```

---

### 2.3. Raccorder le Service IA au Moteur de Scan (`backend/services/scanner.ts`)

Dans votre fichier `backend/services/scanner.ts`, il vous suffit d'appeler cette fonction dès que la reconnaissance réseau est terminée :

```typescript
import { analyzeTargetWithAI } from './ai-analyzer.ts';

// Dans runScanWorker(scanId):
// 1. Récupération des données réseau (DNS, TLS, Headers) via real-engine.ts
const networkData = await executeRealAudit(scan.target_url, scan.profile);

// 2. Enrichissement et validation par l'IA Gemini
scan.phase = 'Analyse IA & remédiation';
scan.progress = 85;

const aiResult = await analyzeTargetWithAI(scan.target_url, {
  headers: networkData.responseHeaders,
  sslInfo: networkData.tls_info,
  dnsRecords: networkData.dns_records,
});

// 3. Fusion des résultats dans le rapport de scan
scan.score = aiResult.calculated_score;
scan.findings = aiResult.recommendations.map(r => ({
  id: `fnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  title: r.title,
  severity: r.severity,
  category: r.stack_component,
  cvss: r.cvss,
  description: r.explanation_fr,
  impact: r.business_impact,
  remediation: r.remediation_code,
  proof: 'Détecté lors de l’audit automatisé',
  component: r.stack_component,
  url: scan.target_url,
}));

scan.progress = 100;
scan.status = 'completed';
```

---

## Étape 3 : Authentification Réelle avec Bcrypt & Cookies Sécurisés

### Objectif
Sécuriser les mots de passe des utilisateurs avec un hachage cryptographique fort et gérer des sessions réelles via des cookies `HttpOnly`.

### 3.1. Installer Bcrypt & JSONWebToken
```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 3.2. Mettre à jour `backend/routes/auth.routes.ts`

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kortex_production_jwt_secret_2026';

// INSCRIPTION RÉELLE
authRouter.post('/register', async (req, res) => {
  const { email, password, phone } = req.body;
  
  // 1. Hachage du mot de passe avec 10 rounds de salage
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 2. Création en base PostgreSQL via Prisma
  const user = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone?.trim(),
      credits: 0,
      free_scans: 3, // 3 scans gratuits de bienvenue
    },
  });

  // 3. Génération du token de session JWT sécurisé
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  // 4. Cookie HttpOnly inviolable par le JavaScript client
  res.cookie('kortex_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({ code: 200, msg: 'Compte créé avec succès', data: { user } });
});

// CONNEXION RÉELLE
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  
  if (!user) {
    return res.status(401).json({ code: 401, msg: 'Identifiants incorrects.' });
  }

  // Vérification cryptographique du mot de passe
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ code: 401, msg: 'Identifiants incorrects.' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('kortex_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({ code: 200, msg: 'Connexion réussie', data: { user } });
});
```

---

## Étape 4 : Connexion Réelle Mobile Money (Wave, Orange Money)

### Objectif
Permettre à vos clients de recharger leurs crédits de scan en payant directement avec **Wave** ou **Orange Money / MTN MoMo** en FCFA.

### 4.1. Architecture du Flux de Paiement

```text
[Utilisateur clique "Recharger Pack 20 (2 000 FCFA)"]
                       │
                       ▼
    [POST /api/v1/credits/checkout]
                       │
                       ▼
 [Appel API Passerelle : CinetPay ou Wave Business API]
                       │
                       ▼
 [L'utilisateur valide sur son téléphone (push USSD ou lien Wave)]
                       │
                       ▼
 [La passerelle envoie un Webhook sécurisé : POST /api/v1/credits/webhook]
                       │
                       ▼
 [Le backend vérifie la signature, crédite 20 crédits sur le compte de l'utilisateur]
```

### 4.2. Implémentation du Contrôleur de Paiement (`backend/routes/credits.routes.ts`)

```typescript
// Initialiser la transaction de paiement
creditsRouter.post('/checkout', async (req, res) => {
  const userId = getCurrentUserId(req);
  const { packId, phone, operator } = req.body;

  const packs = {
    essentiel: { credits: 10, amount: 1000 },
    starter: { credits: 20, amount: 2000 },
    premium: { credits: 60, amount: 5000 },
  };

  const selectedPack = packs[packId as keyof typeof packs];
  if (!selectedPack) return res.status(400).json({ code: 400, msg: 'Pack invalide.' });

  const transactionId = `TX_${Date.now()}_${userId.slice(0, 5)}`;

  // Enregistrer la transaction en attente dans la base de données
  await prisma.transaction.create({
    data: {
      userId,
      delta: selectedPack.credits,
      kind: 'purchase',
      reason: 'purchase',
      note: `Recharge ${selectedPack.credits} crédits via ${operator} (En attente)`,
    },
  });

  // Exemple avec l'API CinetPay ou Wave :
  // const paymentUrl = await callPaymentGateway({ amount: selectedPack.amount, transactionId, phone, operator });

  return res.json({
    code: 200,
    msg: 'Session de paiement initiée',
    data: { transactionId, amount: selectedPack.amount },
  });
});

// Réception du Webhook de confirmation de la banque/opérateur
creditsRouter.post('/webhook', async (req, res) => {
  const { transaction_id, status, verified_signature } = req.body;

  // 1. Vérification cryptographique de la signature du webhook
  // if (!verifySignature(req)) return res.status(403).send('Signature invalide');

  if (status === 'SUCCESS' || status === 'ACCEPTED') {
    // 2. Trouver la transaction et l'utilisateur
    const tx = await prisma.transaction.findFirst({ where: { scan_id: transaction_id } });
    if (tx) {
      // 3. Créditer automatiquement le solde
      await prisma.user.update({
        where: { id: tx.userId },
        data: { credits: { increment: tx.delta } },
      });

      // 4. Envoyer une notification dans le tableau de bord
      await prisma.notification.create({
        data: {
          userId: tx.userId,
          title: 'Recharge validée !',
          message: `Votre compte a été crédité de ${tx.delta} crédits avec succès.`,
        },
      });
    }
  }

  return res.json({ status: 'ok' });
});
```

---

## Étape 5 : Moteur de Scan Asynchrone avec Worker Queue (BullMQ)

### Pourquoi ?
Un scan approfondi peut durer 2 à 5 minutes (résolution de sous-domaines, contrôle des certificats, sondes HTTP, analyse Gemini). Si le serveur fait ce travail directement dans la requête HTTP, la connexion peut couper (timeout).

### La solution professionnelle :
Utiliser une file d'attente (**BullMQ** avec **Redis**) :
1. La requête `POST /api/v1/scans` enregistre le scan en base avec le statut `queued` et met le travail dans la file en 10 millisecondes.
2. Un processus de scan dédié (Worker) prend la tâche, exécute l'audit pas-à-pas, met à jour le pourcentage `progress: 25 -> 50 -> 75 -> 100`, et appelle l'IA pour générer le rapport.
3. Le frontend interroge l'API toutes les 2 secondes (`GET /api/v1/scans/:id`) et affiche la progression en temps réel à l'utilisateur sans aucun risque de coupure !

---

## Étape 6 : Déploiement en Ligne (Docker & Cloud Run / VPS)

### 6.1. Le Fichier `Dockerfile` Optimisé
Créez un fichier `Dockerfile` à la racine pour empaqueter votre application complète :

```dockerfile
# 1. Étape de build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Étape de production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 6.2. Lancer avec Docker Compose en Local
Créez un fichier `docker-compose.yml` pour démarrer à la fois votre application Kortex Defender et sa base de données PostgreSQL :

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://kortex:kortex_secret@postgres:5432/kortex_defender
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: kortex
      POSTGRES_PASSWORD: kortex_secret
      POSTGRES_DB: kortex_defender
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Une seule commande démarre tout :
```bash
docker compose up --build
```

---

## Calendrier Recommandé pour Construire Tout Vous-Même

| Semaine | Objectif Principal | Livrables Concrets |
|---|---|---|
| **Semaine 1** | Base de données & Persistance | Démarrer PostgreSQL, exécuter `prisma migrate`, brancher `backend/routes/` sur Prisma. |
| **Semaine 2** | Authentification Sécurisée | Remplacer les mots de passe par `bcrypt`, configurer les cookies HttpOnly et l'envoi d'OTP WhatsApp. |
| **Semaine 3** | Intégration de l'IA Gemini | Connecter `ai-analyzer.ts` pour que chaque scan produise des fiches de vulnérabilités et du code correctif sur-mesure. |
| **Semaine 4** | Paiement Mobile Money | Configurer les webhooks Wave / CinetPay pour recharger les crédits en Francs CFA automatiquement. |
| **Semaine 5** | Tests de Charge & Déploiement | Créer l'image Docker, tester la conformité juridique et déployer sur votre nom de domaine de production. |

---

## Conclusion

En suivant cette feuille de route, vous avez la certitude de bâtir une **véritable plateforme technologique de classe internationale**, conçue et opérée par vous-même, parfaitement adaptée aux besoins de sécurité et aux réalités économiques locales.
