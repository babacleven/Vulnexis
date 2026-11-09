# Guide Complet d'Architecture & Fonctionnement · Kortex Defender

Bienvenue dans le guide de référence de **Kortex Defender**. Ce document a été rédigé pour vous expliquer de manière claire, pédagogique et exhaustive **l'architecture logicielle retenue pour le projet**, **la séparation stricte en deux dossiers (`frontend` et `backend`)**, **la normalisation des routes sous `/api/v1/`**, **comment lancer tout le projet avec une vraie base de données PostgreSQL**, et **la marche à suivre pour faire évoluer la plateforme**.

---

## Sommaire

1. [L'Architecture Utilisée : Architecture Découplée en Couches](#1-larchitecture-utilisée--architecture-découplée-en-couches)
2. [Pourquoi cette Architecture ? (Bénéfices & Vision)](#2-pourquoi-cette-architecture--bénéfices--vision)
3. [Structure Complète du Projet (Cartographie des Dossiers)](#3-structure-complète-du-projet-cartographie-des-dossiers)
4. [La Normalisation des Routes API sous `/api/v1/`](#4-la-normalisation-des-routes-api-sous-apiv1)
5. [Le Dossier `frontend/` (Interface & Expérience Utilisateur)](#5-le-dossier-frontend-interface--expérience-utilisateur)
6. [Le Dossier `backend/` (API, Logique Métier & Moteur d'Audit)](#6-le-dossier-backend-api-logique-métier--moteur-daudit)
7. [Le Fichier d'Orchestration Racine (`server.ts`)](#7-le-fichier-dorchestration-racine-serverts)
8. [Guide Pas-à-Pas : Comment Lancer TOUT le Projet avec la Base de Données](#8-guide-pas-à-pas--comment-lancer-tout-le-projet-avec-la-base-de-données)
9. [Parcours Réel des Données (Flux de A à Z)](#9-parcours-réel-des-données-flux-de-a-à-z)
10. [Guide d'Évolution Pratique (Mobile Money, Nouveaux Audits)](#10-guide-dévolution-pratique-mobile-money-nouveaux-audits)
11. [Commandes Utiles & Résumé des Scripts](#11-commandes-utiles--résumé-des-scripts)

---

## 1. L'Architecture Utilisée : Architecture Découplée en Couches

Pour Kortex Defender, nous avons mis en œuvre une **Architecture Monorepo Découplée en Couches (Decoupled Layered Architecture)**.

Cette architecture sépare formellement le projet en **trois strates indépendantes** :

```text
┌──────────────────────────────────────────────────────────────────┐
│                   NAVIGATEUR DU CLIENT (WEB)                     │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ Requêtes HTTP (Fetch / API)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│  ORCHESTRATEUR DE RACINE (server.ts - Port 3000)                │
│  - Reverse-Proxy & Middleware de Dev Vite (HMR instantané)       │
│  - Passerelle HTTP vers les routes standardisées /api/v1/*       │
└──────────────────┬─────────────────────────────┬─────────────────┘
                   │                             │
                   ▼                             ▼
┌──────────────────────────────────────┐  ┌────────────────────────┐
│      DOSSIER /frontend (Client)      │  │ DOSSIER /backend (API) │
│  - React 19 SPA                      │  │  - Express 4 Modulaire │
│  - Tailwind CSS v4                   │  │  - Couche Contrôleurs  │
│  - Routage Client (App.tsx)          │  │  - Couche Services     │
│  - Contexte Global (AuthContext)     │  │  - Couche Données (DB) │
│  - Pages & Composants UI             │  │  - Moteur Réseau Réel  │
└──────────────────────────────────────┘  └────────────────────────┘
```

### Les 4 Couches Métier de l'Application :

1. **Couche Présentation (Presentation Layer - `/frontend`) :**
   - Purement dédiée à l'affichage, aux interactions de l'utilisateur, à la validation des formulaires en temps réel, aux animations et au rendu responsive.
   - Ne contient **aucune logique réseau bas niveau** (pas de sockets TLS bruts, pas de requêtes DNS internes). Elle consomme l'API REST via des contrats TypeScript stricts et des appels à `/api/v1/*`.

2. **Couche Application & Contrôleurs (Application / API Layer - `/backend/routes/`) :**
   - Reçoit les requêtes HTTP, extrait les paramètres, applique les règles d'autorisation de session, valide les entrées et formate les réponses selon le standard Kortex Defender (`{ code: 200, msg: "...", data: { ... } }`).
   - Toutes les routes sont désormais préfixées par `/api/v1/` (avec conservation d'alias pour la rétrocompatibilité).

3. **Couche Domaine & Métier (Domain / Service Layer - `/backend/services/`) :**
   - Contient la logique d'analyse de cybersécurité pure :
     - Résolution DNS active (enregistrements A, MX, TXT, détection SPF & DMARC).
     - Handshake cryptographique SSL/TLS (vérification de la date d'expiration, de l'émetteur du certificat et des protocoles dépréciés TLSv1.0/1.1).
     - Analyse des en-têtes HTTP de sécurité (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, bannières serveur divulguées).
     - Calcul du score CVSS et pondération de la note de sécurité sur 100.

4. **Couche Accès aux Données & Persistance (Data Layer - `/backend/db.ts` & `/backend/types.ts`) :**
   - Fournit l'abstraction de la base de données. Actuellement architecturée avec un Store typé en mémoire contenant le profil de référence exact (`babaaristote6@gmail.com`, 0 crédit, 2 scans gratuits, cibles vides), elle est prête à être branchée sur PostgreSQL avec Prisma sans toucher aux contrôleurs.

---

## 2. Pourquoi cette Architecture ? (Bénéfices & Vision)

| Critère | Avantage avec notre Architecture Découplée |
|---|---|
| **Séparation des Préoccupations (SoC)** | Le frontend et le backend ne se mélangent pas. Un développeur frontend peut travailler dans `/frontend` sans risquer de toucher au moteur d'audit de `/backend`. |
| **Normalisation d'API `/api/v1/`** | Standard international d'API RESTful permettant le versionnement futur (ex. `/api/v2/`) sans casser les applications existantes. |
| **Simplicité de Déploiement** | Grâce à `server.ts` à la racine, l'ensemble tourne sur un port unique (**port 3000**), facilitant le déploiement sur Cloud Run, Docker, VPS ou plateforme PaaS sans complexité de proxy inverse externe. |
| **Évolutivité vers PostgreSQL** | Toutes les données transitent par `/backend/db.ts` et `/backend/types.ts`. Remplacer la mémoire par PostgreSQL / Prisma prend moins d'une heure car les interfaces sont déjà calquées sur les schémas relationnels. |
| **Facilité de Migration Mobile** | Si demain vous souhaitez créer une application mobile (iOS / Android Flutter ou React Native), le dossier `/backend` est déjà une API REST 100 % indépendante prête à être consommée. |
| **Maintenance & Clarté** | Plus aucun fichier fourre-tout de 1 500 lignes. Chaque fichier a une responsabilité unique et mesure entre 50 et 300 lignes. |

---

## 3. Structure Complète du Projet (Cartographie des Dossiers)

```text
kortex-defender/
│
├── server.ts                   <-- [ORCHESTRATEUR] Démarre le serveur, connecte le backend et sert le frontend
├── index.html                  <-- [HTML] Point d'entrée web (Outfit, Roboto Flex, méta SEO)
├── package.json                <-- [DÉPENDANCES] Packages Node.js et scripts de build
├── vite.config.ts              <-- [BUILD] Configuration Vite et plugin Tailwind CSS v4
├── tsconfig.json               <-- [TYPESCRIPT] Règles strictes de compilation ES2022
├── metadata.json               <-- [MÉTADONNÉES] Nom et description de l'application
│
├── ISSUES.md                   <-- [FEUILLE DE ROUTE] Les 16 tickets de déploiement en production
├── README.md                   <-- [DOCUMENTATION] Présentation globale et guide de démarrage rapide
├── GUIDE_PROJET.md             <-- [GUIDE DÉTAILLÉ] Ce document d'architecture et de fonctionnement
│
├── public/                     <-- [ASSETS STATIQUES]
│   ├── kortex-logo.svg         # Logo vectoriel officiel Kortex Defender
│   └── assets/aistudio/        # Captures d'écran de référence du dashboard officiel
│
├── frontend/                   <-- [DOSSIER 1 : APPLICATION REACT / UI]
│   ├── main.tsx                # Point de montage React 19 dans #root
│   ├── App.tsx                 # Routeur applicatif & bascule de vues
│   ├── index.css               # Design system Tailwind v4 (@theme, polices, couleurs)
│   ├── types.ts                # Types TypeScript côté client (User, Target, Scan...)
│   │
│   ├── context/                # Gestion de l'état global partagé
│   │   └── AuthContext.tsx     # Session utilisateur, solde de crédits et rafraîchissement
│   │
│   ├── components/             # Composants graphiques réutilisables
│   │   ├── AppLayout.tsx       # Cadre avec Sidebar latérale gauche + Header du haut
│   │   └── Icons.tsx           # Collection des icônes SVG officielles
│   │
│   └── pages/                  # Les 13 écrans de l'application
│       ├── LandingPage.tsx     # Page d'accueil publique (vitrine, simulateur, tarifs)
│       ├── AuthPage.tsx        # Connexion, Inscription et validation WhatsApp OTP
│       ├── DashboardPage.tsx   # Vue d'ensemble : 4 cartes métriques, 3 étapes, derniers scans
│       ├── TargetsPage.tsx     # Mes applications : liste des cibles et ajout sécurisé
│       ├── TargetDetailPage.tsx# Détail d'une application et historique de ses scans
│       ├── ScansPage.tsx       # Historique complet des scans avec filtres statut/cible
│       ├── NewScanPage.tsx     # Lancer un scan : sélection de la cible et profil
│       ├── ScanDetailPage.tsx  # Rapport d'audit : score /100, failles, logs, exports
│       ├── CreditsPage.tsx     # Crédits & offres : solde, codes cadeaux KX, packs FCFA
│       ├── AgentPage.tsx       # Agent Kortex : présentation de l'IA analyste sécurité
│       ├── ParrainagePage.tsx  # Parrainage : formulaire de parrain Mobile Money Wave/Orange
│       ├── SettingsPage.tsx    # Mon compte : coordonnées du profil et déconnexion
│       └── TermsPage.tsx       # Conditions officielles d'utilisation (texte juridique)
│
└── backend/                    <-- [DOSSIER 2 : API & SERVICES NODE.JS]
    ├── app.ts                  # Factory Express : enregistre les middlewares et les routeurs /api/v1/
    ├── types.ts                # Modèles de données de la base (DBUser, DBTarget, DBScan...)
    ├── db.ts                   # Store de données (avec état initial de référence)
    │
    ├── routes/                 # Contrôleurs API REST découpés par domaine sous /api/v1/
    │   ├── auth.routes.ts      # /api/v1/auth/* (login, register, logout, OTP)
    │   ├── targets.routes.ts   # /api/v1/targets/* (CRUD cibles et attestation d'autorisation)
    │   ├── scans.routes.ts     # /api/v1/scans/* (lancement, polling, rapports JSON/HTML)
    │   ├── credits.routes.ts   # /api/v1/credits/* (solde, recharges KX, historique)
    │   └── misc.routes.ts      # /api/v1/me, notifications, candidatures parrainage
    │
    └── services/               # Moteurs d'exécution métier
        ├── scanner.ts          # Orchestrateur d'audit asynchrone et progression
        └── real-engine.ts      # Véritable moteur réseau (DNS, SSL/TLS, en-têtes HTTP, failles)
```

---

## 4. La Normalisation des Routes API sous `/api/v1/`

L'ensemble des points d'accès a été normalisé selon le standard **`/api/v1/`** :

### 1. Authentification (`/api/v1/auth/*`)
- `POST /api/v1/auth/register` : Inscription avec attribution des 3 scans offerts.
- `POST /api/v1/auth/login` : Connexion et génération du cookie de session `kortex_session`.
- `POST /api/v1/auth/logout` : Révocation du cookie de session.
- `POST /api/v1/auth/send-otp` : Émission du code OTP WhatsApp.
- `POST /api/v1/auth/verify-otp` : Validation du code à 6 chiffres.

### 2. Applications & Cibles (`/api/v1/targets/*`)
- `GET /api/v1/targets` : Liste des applications de l'utilisateur avec pagination.
- `POST /api/v1/targets` : Déclaration d'une nouvelle cible avec attestation légale obligatoire.
- `GET /api/v1/targets/:id` : Consultation de la fiche technique d'une cible.
- `POST /api/v1/targets/:id/authorize` : Activation / désactivation de l'attestation légale.
- `DELETE /api/v1/targets/:id` : Suppression définitive d'une application et de ses scans.

### 3. Moteur de Scans & Rapports (`/api/v1/scans/*`)
- `GET /api/v1/scans` : Historique des audits avec filtres (`?status=...&target_id=...`).
- `POST /api/v1/scans` : Déclenchement d'un audit (déduit 1 scan gratuit ou les crédits).
- `GET /api/v1/scans/:id` : Récupération de l'état d'avancement et du rapport complet.
- `GET /api/v1/scans/:id/download?format=html|json` : Téléchargement du rapport complet.
- `DELETE /api/v1/scans/:id` : Suppression d'un rapport de scan.

### 4. Portefeuille de Crédits (`/api/v1/credits/*`)
- `GET /api/v1/credits/me` : Solde disponible, scans gratuits et barème des profils.
- `POST /api/v1/credits/redeem` : Activation d'un code de recharge cadeau (`KX-XXXX`).
- `GET /api/v1/credits/me/transactions` : Journal horodaté des débits et crédits.

### 5. Profil, Alertes & Parrainage (`/api/v1/*`)
- `GET /api/v1/me` : Coordonnées de l'utilisateur connecté.
- `GET /api/v1/notifications/me` : Liste des notifications reçues.
- `GET /api/v1/notifications/me/unread-count` : Compteur des alertes non lues.
- `POST /api/v1/notifications/read-all` : Marquer toutes les notifications comme lues.
- `GET /api/v1/referrals/me` : Statut de la candidature de parrainage.
- `POST /api/v1/referrals/apply` : Soumission de la demande d'affiliation avec coordonnées Mobile Money.

---

## 5. Le Dossier `frontend/` (Interface & Expérience Utilisateur)

Le dossier `frontend/` est une application web monopage (Single Page Application - SPA) construite avec **React 19**, **TypeScript** et **Tailwind CSS v4**.

### Rôle des Fichiers Frontend :

- **`frontend/main.tsx` :** Démarre React, injecte les styles `index.css` et enveloppe toute l'application dans `<AuthProvider>` pour que l'état utilisateur soit disponible partout.
- **`frontend/App.tsx` :** Le contrôleur de navigation. Il observe l'URL du navigateur (`window.location.pathname`) et affiche la page adéquate. Si un utilisateur non connecté essaie d'accéder au dashboard, il est automatiquement redirigé vers `/login`.
- **`frontend/index.css` :** Contient la configuration du design system :
  - Palette officielle : `#0a0a0a` (fond sombre et boutons), `#f7f7f7` (fond gris clair), `#d7f7f1` (vert menthe Kortex pour les crédits gratuits).
  - Typographie : `font-outfit` pour les titres et `font-sans` (Roboto Flex) pour la lisibilité optimale des rapports d'audit.
- **`frontend/context/AuthContext.tsx` :** C'est la mémoire vive de l'interface :
  - Il conserve l'objet `user` actuel.
  - Il met à jour le solde (`credits` et `free_scans`) visible dans le badge supérieur droit.
  - Il fournit les méthodes `login()`, `register()`, `logout()` et `refreshUser()`.
- **`frontend/components/AppLayout.tsx` :** Le squelette de l'interface connectée :
  - Barre latérale noire/blanche avec logo Kortex Defender, bouton `+ Nouveau scan`, les 7 onglets de navigation, l'email connecté et le bouton `Se déconnecter`.
  - En-tête avec la cloche de notifications et le badge dynamique du solde de crédits.

---

## 6. Le Dossier `backend/` (API, Logique Métier & Moteur d'Audit)

Le dossier `backend/` est une application serveur Express modulaire, hautement découplée et autonome.

### A. La Factory Applicative (`backend/app.ts`)
Elle instancie l'application Express, configure les analyseurs JSON (`express.json()`), les cookies (`cookie-parser`), et monte les 5 routeurs spécialisés :
```typescript
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/targets', targetsRouter);
app.use('/api/v1/scans', scansRouter);
app.use('/api/v1/credits', creditsRouter);
app.use('/api/v1', miscRouter);
```

### B. Le Moteur d'Audit Réel (`backend/services/real-engine.ts`)
Ce fichier exécute une véritable analyse de cybersécurité :
- **DNS Probing :** Résout les enregistrements A, MX, et contrôle la présence des politiques SPF et DMARC anti-phishing.
- **SSL/TLS Handshake :** Établit une connexion TLS directe avec la cible pour vérifier la validité du certificat (détection d'expiration imminente ou passée) et tester la présence de protocoles obsolètes vulnérables (TLS 1.0 / 1.1).
- **HTTP Security Headers :** Envoie des requêtes réelles pour vérifier les en-têtes `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options` et la divulgation de bannières serveurs (`Server`, `X-Powered-By`).
- **Protection SSRF :** Empêche le scan d'adresses IP privées internes et de métadonnées cloud (ex: `169.254.169.254`).
- **Calcul du Score CVSS :** Calcule une note sur 100 basée sur le nombre et la gravité des failles découvertes.

---

## 7. Le Fichier d'Orchestration Racine (`server.ts`)

Le fichier `server.ts` situé à la racine du projet sert de **passerelle d'orchestration**.

### Comment fonctionne `server.ts` ?
1. Il importe la factory backend modulaire : `import { createExpressApp } from './backend/app.ts';`
2. En mode développement (`npm run dev`) :
   - Il initialise le serveur Vite en mode middleware (`createViteServer({ server: { middlewareMode: true } })`).
   - Il monte les middlewares Vite sur l'application Express.
   - Ainsi, l'ensemble de l'API (`/api/v1/*`) et le rechargement à chaud du frontend React (HMR) tournent ensemble de façon fluide sur `http://localhost:3000`.
3. En mode production (`npm start`) :
   - Il sert les fichiers statiques pré-compilés du dossier `/dist` et renvoie `index.html` pour toute route inconnue (gestion du Single Page Application Routing).

---

## 8. Guide Pas-à-Pas : Comment Lancer TOUT le Projet avec la Base de Données

Ce chapitre vous explique exactement comment exécuter l'application selon deux approches :
1. **Lancement Rapide (Mémoire / État Live Baba Aristote)** : Démarrage en 5 secondes sans installer de logiciel externe.
2. **Lancement Complet avec PostgreSQL & Prisma** : Connexion à un vrai serveur de base de données relationnelle persistant.

---

### Option 1 : Lancement Immédiat (Base en mémoire intégrée)

Le projet supporte 3 modes de lancement selon vos préférences de développement :

#### A. Mode Full-Stack Unifié (Recommandé)
Lance le frontend et le backend ensemble sur un port unique :
```bash
npm run dev
```
👉 Accessible sur **`http://localhost:3000`**

#### B. Lancer uniquement le Backend
Lance exclusivement le serveur d'API Express sans l'interface :
```bash
npm run dev:back
```
👉 Serveur API actif sur **`http://localhost:5000`** (Canonical API : `http://localhost:5000/api/v1/`)

#### C. Lancer uniquement le Frontend
Lance le client Vite de développement avec proxying automatique vers le backend :
```bash
npm run dev:front
```
👉 Application client active sur **`http://localhost:5173`** (les requêtes `/api/*` sont automatiquement redirigées vers `http://localhost:5000`)

---

### Option 2 : Lancement avec une Vraie Base de Données PostgreSQL & Prisma

Pour brancher Kortex Defender sur une véritable base de données PostgreSQL de production, suivez ce guide étape par étape.

#### Étape 1 : Démarrer une instance PostgreSQL

Vous pouvez lancer PostgreSQL localement via **Docker** en une seule commande :

```bash
docker run --name kortex-postgres \
  -e POSTGRES_USER=kortex \
  -e POSTGRES_PASSWORD=kortex_secret_2026 \
  -e POSTGRES_DB=kortex_defender \
  -p 5432:5432 \
  -d postgres:16-alpine
```

*(Ou bien utilisez un service managé comme Cloud SQL, Supabase, Neon ou Aiven).*

#### Étape 2 : Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# URL de connexion à votre base PostgreSQL
DATABASE_URL="postgresql://kortex:kortex_secret_2026@localhost:5432/kortex_defender?schema=public"

# Port du serveur Express
PORT=3000

# URL publique de l'application
APP_URL="http://localhost:3000"

# Clé secrète pour les sessions de cookies
SESSION_SECRET="kortex_defender_secret_key_prod_2026"
```

#### Étape 3 : Installer Prisma ORM

```bash
npm install @prisma/client
npm install -D prisma
```

#### Étape 4 : Définir le Schéma Relationnel Prisma

Créez le fichier `prisma/schema.prisma` avec les modèles exacts de Kortex Defender :

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
  status     String   @default("pending") // pending, approved, rejected
  created_at DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Étape 5 : Exécuter la Migration & Initialiser la Base

```bash
# Générer le client Prisma et créer les tables dans PostgreSQL
npx prisma migrate dev --name init_kortex_db
```

#### Étape 6 : Injecter les Données Initiales (Seed)

Créez le fichier `prisma/seed.ts` pour insérer le compte par défaut :

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'babaaristote6@gmail.com' },
    update: {},
    create: {
      id: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      email: 'babaaristote6@gmail.com',
      passwordHash: 'Cl2even2026',
      phone: '+2250152311124',
      credits: 0,
      free_scans: 2,
      is_admin: false,
    },
  });

  console.log('Base de données PostgreSQL initialisée avec succès avec le compte:', user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Exécutez le script d'initialisation :
```bash
npx tsx prisma/seed.ts
```

#### Étape 7 : Lancer l'Application

```bash
npm run dev
```

Vous disposez maintenant d'un environnement **Kortex Defender Full-Stack complet branché sur une véritable base de données PostgreSQL** !

---

## 9. Parcours Réel des Données (Flux de A à Z)

### Exemple concret : L'utilisateur lance un scan depuis l'interface

```text
1. L'utilisateur se rend sur http://localhost:3000/scans/new
   └── Le routeur frontend (frontend/App.tsx) affiche la page NewScanPage.tsx.

2. NewScanPage effectue une requête GET /api/v1/targets
   └── Le routeur backend (backend/routes/targets.routes.ts) lit les cibles
       et renvoie la liste des applications autorisées.

3. L'utilisateur sélectionne son application, choisit le profil "Standard" (2 crédits)
   et clique sur "Lancer le scan".

4. NewScanPage envoie une requête POST /api/v1/scans
   avec { target_id: "...", profile: "standard" }.

5. Le backend (backend/routes/scans.routes.ts) :
   a) Vérifie que la cible est autorisée.
   b) Vérifie le solde : 2 scans gratuits restants -> déduit 1 scan gratuit (solde = 1).
   c) Enregistre la transaction : "-1 scan gratuit (audit de sécurité)".
   d) Crée un scan avec le statut "running", progress: 0%.
   e) Démarre runScanWorker(scan.id) en arrière-plan sans bloquer la requête HTTP.
   f) Renvoie la réponse JSON : { id: "scan_abc123" }.

6. Le frontend redirige immédiatement vers /scans/scan_abc123.
   └── ScanDetailPage.tsx s'ouvre et interroge l'API GET /api/v1/scans/scan_abc123
       toutes les 2,5 secondes.

7. Le moteur de scan (backend/services/scanner.ts & real-engine.ts) :
   - Étape 15 % : Résolution DNS et vérification réseau.
   - Étape 35 % : Inspection cryptographique du certificat SSL/TLS.
   - Étape 65 % : Analyse des en-têtes HTTP de sécurité.
   - Étape 85 % : Recherche de divulgation de technologies.
   - Étape 100 % : Calcul du score /100 et génération des fiches de correctifs.

8. ScanDetailPage détecte progress = 100% :
   └── Affiche instantanément le cadran du score (ex: 82/100), les compteurs de failles
       critiques/moyennes, et les boutons d'export PDF, HTML et JSON !
```

---

## 10. Guide d'Évolution Pratique

### A. Activer les Paiements Réels Mobile Money (Wave / Orange Money / CinetPay)
1. Ouvrez `backend/routes/credits.routes.ts`.
2. Ajoutez la route `POST /api/v1/credits/checkout` :
   - Reçoit le `pack_id`, le `phone` et l'opérateur (`Wave`, `Orange`, `MTN`, `Moov`).
   - Appelle l'API de votre passerelle de paiement (ex. CinetPay ou Wave Business API).
   - Renvoie l'URL de paiement ou initie le push USSD sur le téléphone du client.
3. Ajoutez la route webhook `POST /api/v1/credits/webhook` pour créditer automatiquement le compte de l'utilisateur dès confirmation de la transaction.

### B. Ajouter de Nouveaux Contrôles de Sécurité au Moteur de Scan
- Ouvrez `backend/services/real-engine.ts`.
- Vous pouvez enrichir la détection (ex: recherche de ports ouverts avec `net.connect`, détection de sous-domaines via DNS brute-force, ou vérification des versions de CMS).
- Ajoutez simplement les vulnérabilités trouvées au tableau `findings` avec leur note CVSS.

---

## 11. Commandes Utiles & Résumé des Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Démarre l'environnement Full-Stack (Backend Express + Frontend Vite HMR) sur le port 3000. |
| `npm run build` | Compile le frontend React et Tailwind dans le dossier de production `/dist`. |
| `npm run lint` | Lance la vérification stricte des types TypeScript sur tout le projet (`tsc --noEmit`). |
| `npm start` | Démarre le serveur autonome de production Node.js. |

---

## Conclusion & Synthèse

Le projet Kortex Defender est désormais structuré selon les **meilleures pratiques professionnelles de l'ingénierie logicielle** :

1. **Deux dossiers distincts et étanches :** `/frontend` (React 19 SPA) et `/backend` (Express API & Moteur d'audit).
2. **Une normalisation complète des routes sous `/api/v1/`**.
3. **Une architecture découplée en couches :** chaque fichier a une mission claire et unique.
4. **Une documentation complète :**
   - **`GUIDE_PROJET.md` (ce document)** : Comprendre l'architecture et savoir lancer la base de données.
   - **`ISSUES.md`** : Suivre les 16 tickets de déploiement pour la production en Afrique.
   - **`README.md`** : Guide technique condensé du projet.
