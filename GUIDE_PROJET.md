# Guide Complet d'Architecture & Fonctionnement · Kortex Defender

Bienvenue dans le guide de référence de **Kortex Defender**. Ce document explique de manière claire, pédagogique et fidèle au code actuel **l'architecture logicielle du projet**, **la séparation en deux espaces (`frontend/` et `backend/`)**, **le rôle de chaque dossier et fichier**, **comment connecter votre PostgreSQL local sans Docker ni Prisma**, et **le parcours complet des données lors d'un scan de sécurité**.

---

## Sommaire

1. [L'Architecture Utilisée : Monorepo Découplé en Couches](#1-larchitecture-utilisée--monorepo-découplé-en-couches)
2. [Pourquoi cette Architecture ?](#2-pourquoi-cette-architecture-)
3. [Cartographie Exacte des Dossiers et Fichiers](#3-cartographie-exacte-des-dossiers-et-fichiers)
4. [Normalisation des Routes API (`/api/v1/`)](#4-normalisation-des-routes-api-apiv1)
5. [Le Dossier `frontend/` (Interface React 19)](#5-le-dossier-frontend-interface-react-19)
6. [Le Dossier `backend/` (API, Contrôleurs & Moteurs d'Audit)](#6-le-dossier-backend-api-contrôleurs--moteurs-daudit)
7. [L'Orchestrateur Racine (`server.ts`) & Chargement `.env`](#7-lorchestrateur-racine-serverts--chargement-env)
8. [Guide Pratique : Travailler en Local (Store Autonome ou PostgreSQL Natif)](#8-guide-pratique--travailler-en-local-store-autonome-ou-postgresql-natif)
9. [Parcours Réel des Données (Flux d'un Scan de A à Z)](#9-parcours-réel-des-données-flux-dun-scan-de-a-à-z)
10. [Tests Automatisés & Collection API](#10-tests-automatisés--collection-api)
11. [Commandes Utiles & Résumé des Scripts](#11-commandes-utiles--résumé-des-scripts)

---

## 1. L'Architecture Utilisée : Monorepo Découplé en Couches

Kortex Defender suit une **Architecture Découplée en Couches** (*Decoupled Layered Architecture*) :

```text
┌────────────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR DU CLIENT (WEB)                      │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │ HTTP / JSON (fetch via api.ts)
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│  MODE UNIFIÉ : server.ts (Port 3000)   OU   MODE SÉPARÉ :          │
│  - Vite Middleware + Express API            - Front : Vite (5173)  │
│  - Chargement auto .env via env.js          - Back  : Express(5000)│
└──────────────────┬───────────────────────────────┬─────────────────┘
                   │                               │
                   ▼                               ▼
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│     DOSSIER /frontend (UI)       │  │     DOSSIER /backend (API)   │
│  - React 19 SPA                  │  │  - Routes (/api/v1/*)        │
│  - Tailwind CSS v4               │  │  - Contrôleurs métier        │
│  - Services API typés (api.ts)   │  │  - Middlewares (auth, cors)  │
│  - Modèles (src/lib/types.ts)    │  │  - Services (real-engine.ts) │
│  - 13 Pages & AppLayout          │  │  - Database (pg + db.js)     │
└──────────────────────────────────┘  └──────────────────────────────┘
```

### Les 4 Couches de Responsabilité :

1. **Couche Présentation (`frontend/src/`) :**
   - Gère uniquement l'interface utilisateur, le routage client, les formulaires, la vitrine **Halcyon Mesh ("Obsidian Control Plane")** et le tableau de bord applicatif.
   - Communique exclusivement avec le backend via `frontend/src/services/api.ts` et les endpoints `/api/v1/*`.

2. **Couche Routage & Middlewares (`backend/src/routes/`, `backend/src/middlewares/`) :**
   - `cors.middleware.js` autorise les requêtes cross-origin entre le frontend (`5173`) et le backend (`5000`).
   - `auth.middleware.js` identifie la session active via le cookie `kortex_session`.
   - `error.middleware.js` capture les exceptions non gérées et renvoie des réponses JSON homogènes.

3. **Couche Contrôleurs & Services (`backend/src/controllers/`, `backend/src/services/`) :**
   - Les contrôleurs (`auth`, `targets`, `scans`, `credits`, `misc`) valident les entrées et orchestrent les opérations métier.
   - Les services (`real-engine.ts`, `scanner.ts`) exécutent les vrais contrôles réseau (DNS, TLS, HTTP headers, sous-domaines, score CVSS).

4. **Couche Données (`backend/src/database/`) :**
   - `Base_de_donnees.sql` définit le schéma PostgreSQL complet (6 tables + données initiales).
   - `connection.js` gère le pool `pg` connecté à votre `DATABASE_URL`.
   - `db.js` fournit le store autonome local pré-rempli en cas d'absence de PostgreSQL.

---

## 2. Pourquoi cette Architecture ?

| Critère | Bénéfice concret |
|---|---|
| **Séparation Frontend / Backend** | Chaque partie possède son propre `package.json`, ses propres scripts et peut être déployée ou testée indépendamment. |
| **Normalisation `/api/v1/`** | Format de réponse unifié `{ code, msg, data }` prêt pour une application mobile (Flutter / React Native) ou des intégrations externes. |
| **Double mode d'exécution** | Un seul terminal (`npm run dev` sur le port `3000`) ou deux terminaux séparés (`npm run dev:back` sur `5000` + `npm run dev:front` sur `5173`). |
| **PostgreSQL natif sans Docker/Prisma** | Vous utilisez directement votre PostgreSQL local via `pg` et `Base_de_donnees.sql`, tout en gardant une bascule automatique vers `db.js`. |
| **Testabilité rapide** | Une suite complète de tests (`npm test`) démarre le backend en mémoire et vérifie toutes les routes en ~0,25s. |

---

## 3. Cartographie Exacte des Dossiers et Fichiers

```text
├── server.ts                         # Orchestrateur Full-Stack (port 3000)
├── index.html                        # Point d'entrée HTML racine (mode unifié)
├── package.json                      # Scripts racine (dev, dev:back, dev:front, test, build)
├── vite.config.ts                    # Config Vite racine + proxy /api -> 5000
├── tsconfig.json                     # Config TypeScript globale
├── .env.example                      # Modèle des variables d'environnement (.env)
├── kortex_defender_api_collection.json # Collection Postman / Bruno des routes API
│
├── README.md                         # Vue d'ensemble et démarrage rapide
├── GUIDE_PROJET.md                   # Ce guide détaillé d'architecture
├── FEUILLE_DE_ROUTE_PRODUCTION.md    # Feuille de route étape par étape pour rendre le projet 100% vivant
├── ISSUES.md                         # Backlog des tickets de production
│
├── tests/                            # Suite de tests unitaires automatisés
│   ├── helpers.ts                    # Serveur HTTP éphémère & reset DB
│   ├── auth.test.ts                  # Tests Auth (/register, /login, OTP, /logout)
│   ├── targets.test.ts               # Tests Cibles (CRUD, attestation légale)
│   ├── scans.test.ts                 # Tests Scans (crédits, profils, exports HTML/JSON)
│   ├── credits.test.ts               # Tests Crédits & Coupons
│   ├── misc.test.ts                  # Tests Profil, Notifications & Parrainage
│   └── run-tests.ts                  # Lanceur central (npm test)
│
├── backend/                          # API EXPRESS & MOTEURS D'AUDIT
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js                    # Factory Express (middlewares + montage /api/v1)
│       ├── server.js                 # Serveur standalone Backend (Port 5000)
│       ├── types.ts                  # Interfaces TypeScript Backend
│       ├── config/
│       │   ├── env.js                # Chargement auto du .env + configuration globale
│       │   └── cors.js               # Options CORS
│       ├── database/
│       │   ├── Base_de_donnees.sql   # DDL complet des 6 tables + Seed du compte test
│       │   ├── connection.js         # Pool PostgreSQL (pg) & test de connexion
│       │   └── db.js                 # Store local en mémoire (fallback automatique)
│       ├── middlewares/
│       │   ├── auth.middleware.js    # Résolution de session / protection des routes
│       │   ├── cors.middleware.js    # En-têtes CORS & pré-vols OPTIONS
│       │   └── error.middleware.js   # Gestion centralisée des erreurs JSON
│       ├── routes/
│       │   ├── index.js              # Agrégateur des routeurs sous /api/v1
│       │   ├── auth.routes.js
│       │   ├── targets.routes.js
│       │   ├── scans.routes.js
│       │   ├── credits.routes.js
│       │   └── misc.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── targets.controller.js
│       │   ├── scans.controller.js
│       │   ├── credits.controller.js
│       │   └── misc.controller.js
│       ├── services/
│       │   ├── real-engine.ts        # Moteur réseau réel (DNS, TLS, HTTP, CVSS)
│       │   └── scanner.ts            # Worker asynchrone de progression d'audit
│       └── utils/
│           ├── helpers.js            # Génération d'ID, formatage URL, extraction host
│           ├── real-engine.ts        # Passerelle de ré-export
│           └── scanner.ts            # Passerelle de ré-export
│
└── frontend/                         # APPLICATION REACT 19 SPA
    ├── package.json
    ├── vite.config.ts                # Config Vite locale (port 5173 + proxy /api)
    ├── index.html
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.svg               # Icône onglet navigateur
    │   └── icons.svg                 # Sprite SVG
    └── src/
        ├── main.tsx                  # Montage React 19 dans #root
        ├── App.tsx                   # Routeur SPA & protection des vues privées
        ├── App.css                   # Styles complémentaires applicatifs
        ├── index.css                 # Design System Halcyon Mesh + Tailwind CSS v4
        ├── assets/                   # hero.png, react.svg, vite.svg
        ├── lib/
        │   └── types.ts              # Types stricts partagés côté client
        ├── services/
        │   └── api.ts                # Client HTTP typé pour /api/v1/*
        ├── context/
        │   └── AuthContext.tsx       # État utilisateur, crédits et sessions
        ├── components/
        │   ├── AppLayout.tsx         # Coque du dashboard (Sidebar, Header, Notifications)
        │   └── Icons.tsx             # Icônes SVG sur mesure
        └── pages/                    # Les 13 écrans du produit
            ├── LandingPage.tsx       # Vitrine publique (Obsidian Control Plane)
            ├── AuthPage.tsx          # Connexion, Inscription & OTP WhatsApp
            ├── DashboardPage.tsx     # Synthèse métrique & derniers audits
            ├── TargetsPage.tsx       # Gestion des cibles & attestations
            ├── TargetDetailPage.tsx  # Détail d'une cible & historique
            ├── ScansPage.tsx         # Liste filtrable de tous les scans
            ├── NewScanPage.tsx       # Lancement d'un nouvel audit
            ├── ScanDetailPage.tsx    # Rapport détaillé, terminal logs & exports
            ├── CreditsPage.tsx       # Solde, coupons et offres FCFA
            ├── AgentPage.tsx         # Interface Agent Kortex (remédiation IA)
            ├── ParrainagePage.tsx    # Programme d'affiliation Mobile Money
            ├── SettingsPage.tsx      # Paramètres du compte
            └── TermsPage.tsx         # Conditions d'utilisation légales
```

---

## 4. Normalisation des Routes API (`/api/v1/`)

Toutes les routes exposent un contrat JSON homogène `{ code, msg, data }` :

### Authentification (`/api/v1/auth/*`)
- `POST /api/v1/auth/register` : Crée un compte et crédite 3 scans gratuits.
- `POST /api/v1/auth/login` : Vérifie les identifiants et pose le cookie `kortex_session`.
- `POST /api/v1/auth/logout` : Efface le cookie de session.
- `POST /api/v1/auth/send-otp` : Génère un code OTP WhatsApp (6 chiffres).
- `POST /api/v1/auth/verify-otp` : Valide le code OTP.

### Applications & Cibles (`/api/v1/targets/*`)
- `GET /api/v1/targets` : Liste paginée des cibles de l'utilisateur.
- `POST /api/v1/targets` : Ajoute une cible (web, api ou graphql) avec attestation horodatée.
- `GET /api/v1/targets/:id` : Fiche détaillée d'une cible.
- `POST /api/v1/targets/:id/authorize` : Active ou révoque l'autorisation de scan.
- `DELETE /api/v1/targets/:id` : Supprime la cible et ses scans associés.

### Moteur de Scans (`/api/v1/scans/*`)
- `GET /api/v1/scans` : Liste filtrable (`?status=...&target_id=...`).
- `POST /api/v1/scans` : Débite le solde (scan gratuit ou crédits) et lance `runScanWorker`.
- `GET /api/v1/scans/:id` : Suivi en direct (`progress`, `phase`, `log_lines`) et rapport complet.
- `GET /api/v1/scans/:id/download?format=html|json` : Exporte le rapport autonome HTML ou JSON.
- `DELETE /api/v1/scans/:id` : Supprime un rapport de scan.

### Crédits & Transactions (`/api/v1/credits/*`)
- `GET /api/v1/credits/me` : Retourne `credits`, `free_scans` et le barème des profils.
- `POST /api/v1/credits/redeem` : Valide un coupon (`STARTER` +20, `PREMIUM` +60, défaut +10).
- `GET /api/v1/credits/me/transactions` : Historique complet des mouvements.

### Profil, Notifications & Parrainage (`/api/v1/*`)
- `GET /api/v1/me` : Profil de l'utilisateur connecté.
- `GET /api/v1/notifications/me` & `/unread-count` & `POST /notifications/read-all`.
- `GET /api/v1/referrals/me` & `POST /referrals/apply` (Mobile Money Wave, Orange, MTN, Moov).

*(Des alias rétrocompatibles `/api/auth/*` et `/api/k/*` sont également montés dans `backend/src/app.js`).*

---

## 5. Le Dossier `frontend/` (Interface React 19)

- **`frontend/src/index.css`** : Implémente le thème **Halcyon Mesh ("Obsidian Control Plane")** pour la page d'accueil (`#09090B`, `#16E0C6`, `#8B5CF6`, `Space Grotesk`, `Inter`, `JetBrains Mono`) ainsi que les utilitaires du dashboard applicatif.
- **`frontend/src/services/api.ts`** : Centralise tous les appels `fetch` avec `credentials: 'include'` et la gestion d'erreur typée.
- **`frontend/src/context/AuthContext.tsx`** : Synchronise la session utilisateur et rafraîchit dynamiquement le compteur de crédits dans le header.
- **`frontend/src/pages/ScanDetailPage.tsx`** : Interroge `GET /api/v1/scans/:id` toutes les 2,5s pendant un audit actif, affiche le terminal en temps réel, puis le score `/100`, les filtres par sévérité et les boutons d'export.

---

## 6. Le Dossier `backend/` (API, Contrôleurs & Moteurs d'Audit)

### A. Configuration & Base de données
- **`backend/src/config/env.js`** : Charge automatiquement votre fichier `.env` depuis la racine du projet ou depuis `backend/`. Ce fichier est importé dès la première ligne des points d'entrée serveur afin que `process.env.DATABASE_URL` soit toujours disponible.
- **`backend/src/database/connection.js`** : Initialise un `Pool` PostgreSQL (`pg`) si `DATABASE_URL` est défini, puis teste la connexion avec `testPostgresConnection()`. En cas d'absence ou d'erreur réseau, l'application bascule gracieusement sur le store `db.js`.

### B. Le Moteur Réel (`backend/src/services/real-engine.ts`)
Exécute les analyses réseau authentiques sur chaque cible :
1. **Résolution DNS** (`A`, `AAAA`, `MX`, contrôle anti-spoofing `SPF` et `DMARC`).
2. **Protection SSRF** : Bloque les adresses internes (`10.x.x.x`, `192.168.x.x`, `169.254.169.254`).
3. **Handshake SSL/TLS** : Vérifie le certificat, l'émetteur, les jours restants avant expiration et détecte TLS 1.0 / 1.1 obsolètes.
4. **En-têtes HTTP de sécurité** : Contrôle `CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy` et fuites `Server` / `X-Powered-By`.
5. **Sous-domaines** : Sonde `api`, `admin`, `auth`, `staging`, `mail`, `portal`, `dev`, `cdn`.
6. **Score & CVSS** : Calcule la note sur 100 selon la gravité des vulnérabilités.

### C. L'Orchestrateur (`backend/src/services/scanner.ts`)
Appelle `executeRealAudit` en tâche de fond, remplit `scan.log_lines` en temps réel, met à jour `target.last_score`, et applique un repli propre si la cible est inaccessible.

---

## 7. L'Orchestrateur Racine (`server.ts`) & Chargement `.env`

1. En ligne 1, `server.ts` importe `./backend/src/config/env.js` pour charger `.env` immédiatement.
2. Il crée l'application Express via `createExpressApp()`.
3. En développement (`npm run dev`), il attache Vite en mode middleware sur le même serveur Express (port `3000`).
4. En production (`npm start`), il sert les fichiers statiques compilés de `dist/`.
5. Au démarrage du port, il appelle `testPostgresConnection()` pour confirmer l'état de PostgreSQL dans la console.

---

## 8. Guide Pratique : Travailler en Local (Store Autonome ou PostgreSQL Natif)

### Option 1 : Zéro Configuration (Store local `db.js`)
Sans fichier `.env` (ou sans `DATABASE_URL`), tout fonctionne immédiatement grâce à `backend/src/database/db.js`, déjà pré-rempli avec :
- Email : `babaaristote6@gmail.com`
- Mot de passe : `Cl2even2026`
- Solde : `2` scans gratuits, `0` crédit

### Option 2 : Connecter votre PostgreSQL Local (Sans Docker, Sans Prisma)
1. **Créer la base de données** dans pgAdmin, DBeaver ou `psql` :
   ```sql
   CREATE DATABASE kortex_defender;
   ```
2. **Exécuter le script SQL complet** :
   Ouvrez et exécutez `backend/src/database/Base_de_donnees.sql` dans la base `kortex_defender`.
   Ce script crée les 6 tables (`users`, `targets`, `scans`, `transactions`, `notifications`, `referral_requests`), les index et insère votre compte de test.
3. **Configurer `.env` à la racine** :
   Copiez `.env.example` vers `.env` et renseignez votre mot de passe PostgreSQL :
   ```env
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/kortex_defender"
   ```
4. **Démarrer et vérifier** :
   ```bash
   npm run dev
   ```
   La console doit afficher :
   ```text
   🐘 [PostgreSQL] Connecté avec succès à votre base locale ! (Heure serveur: ...)
   ```

> 💡 Pour passer progressivement les requêtes des contrôleurs (`backend/src/controllers/*.js`) du tableau `DB` vers le `pool` PostgreSQL réel, suivez l'Étape 1 du fichier **`FEUILLE_DE_ROUTE_PRODUCTION.md`**.

---

## 9. Parcours Réel des Données (Flux d'un Scan de A à Z)

```text
1. L'utilisateur ouvre /scans/new dans frontend/src/pages/NewScanPage.tsx.
2. Le client appelle api.targets.list() -> GET /api/v1/targets.
3. L'utilisateur choisit une cible autorisée et un profil (fast / standard / deep).
4. Le client appelle api.scans.create() -> POST /api/v1/scans.
5. backend/src/controllers/scans.controller.js :
   - Vérifie l'autorisation de la cible et le solde (free_scans ou credits).
   - Enregistre le débit dans transactions.
   - Crée le scan (status: 'running', progress: 5).
   - Lance runScanWorker(newScan.id) sans bloquer la réponse HTTP 201.
6. Le frontend redirige vers /scans/:id (ScanDetailPage.tsx) qui poll GET /api/v1/scans/:id.
7. real-engine.ts exécute DNS -> SSL/TLS -> Headers HTTP -> Sous-domaines -> Score.
8. Dès progress === 100, ScanDetailPage affiche le score, les failles et les exports HTML/JSON/PDF.
```

---

## 10. Tests Automatisés & Collection API

- **Suite de tests unitaires (`tests/`)** : Exécutez `npm test` pour tester l'ensemble des contrôleurs (`auth`, `targets`, `scans`, `credits`, `misc`) via un serveur HTTP éphémère en moins de 0,3 seconde.
- **Collection Postman / Bruno (`kortex_defender_api_collection.json`)** : Importez ce fichier dans Postman, Bruno ou Insomnia pour tester manuellement toutes les routes `/api/v1/*`.

---

## 11. Commandes Utiles & Résumé des Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance Frontend + Backend ensemble sur `http://localhost:3000`. |
| `npm run dev:back` | Lance uniquement le Backend Express sur `http://localhost:5000`. |
| `npm run dev:front` | Lance uniquement le Frontend Vite sur `http://localhost:5173` (proxy `/api` -> `5000`). |
| `npm test` | Exécute toutes les suites de tests unitaires dans `tests/`. |
| `npm run lint` | Vérifie le typage TypeScript global (`tsc --noEmit`). |
| `npm run build` | Compile le frontend dans `/dist`. |
| `npm start` | Démarre le serveur en mode production. |
