# Guide Complet d'Architecture & Fonctionnement · Kortex Defender

Bienvenue dans le guide de référence de **Kortex Defender**. Ce document a été rédigé pour vous expliquer de manière claire, pédagogique et exhaustive **l'architecture logicielle retenue pour le projet**, **la séparation stricte en deux dossiers (`frontend` et `backend`)**, **le rôle précis de chaque composant et fichier**, et **la marche à suivre pour faire évoluer la plateforme**.

---

## Sommaire

1. [L'Architecture Utilisée : Architecture Découplée en Couches](#1-larchitecture-utilisée--architecture-découplée-en-couches)
2. [Pourquoi cette Architecture ? (Bénéfices & Vision)](#2-pourquoi-cette-architecture--bénéfices--vision)
3. [Structure Complète du Projet (Cartographie des Dossiers)](#3-structure-complète-du-projet-cartographie-des-dossiers)
4. [Le Dossier `frontend/` (Interface & Expérience Utilisateur)](#4-le-dossier-frontend-interface--expérience-utilisateur)
5. [Le Dossier `backend/` (API, Logique Métier & Moteur d'Audit)](#5-le-dossier-backend-api-logique-métier--moteur-daudit)
6. [Le Fichier d'Orchestration Racine (`server.ts`)](#6-le-fichier-dorchestration-racine-serverts)
7. [Parcours Réel des Données (Flux de A à Z)](#7-parcours-réel-des-données-flux-de-a-à-z)
8. [Guide d'Évolution Pratique (PostgreSQL, Mobile Money, Nouveaux Audits)](#8-guide-dévolution-pratique-postgresql-mobile-money-nouveaux-audits)
9. [Commandes Utiles & Environnement](#9-commandes-utiles--environnement)

---

## 1. L'Architecture Utilisée : Architecture Découplée en Couches

Pour Kortex Defender, nous avons mis en œuvre une **Architecture Monorepo Découplée en Couches (Decoupled Layered Architecture)**.

Cette architecture sépare formellement le projet en **trois strates indépendantes** :

```
┌──────────────────────────────────────────────────────────────────┐
│                   NAVIGATEUR DU CLIENT (WEB)                     │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ Requêtes HTTP (Fetch / API)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│  ORCHESTRATEUR DE RACINE (server.ts - Port 3000)                │
│  - Reverse-Proxy & Middleware de Dev Vite (HMR)                  │
│  - Passerelle HTTP vers les routes /api/k/*                      │
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
   - Ne contient **aucune logique réseau bas niveau** (pas de sockets TLS bruts, pas de requêtes DNS internes). Elle consomme l'API REST via des contrats TypeScript stricts.

2. **Couche Application & Contrôleurs (Application / API Layer - `/backend/routes/`) :**
   - Reçoit les requêtes HTTP, extrait les paramètres, applique les règles d'autorisation de session, valide les entrées et formate les réponses selon le standard Kortex Defender (`{ code: 200, msg: "...", data: { ... } }`).

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
| **Séparation des Préoccupations (SoC)** | Le frontend et le backend ne se mélangent pas. Un développeur frontend peut travailler dans `/frontend` sans risquer de casser le moteur d'audit de `/backend`. |
| **Simplicité de Déploiement** | Grâce à `server.ts` à la racine, l'ensemble tourne sur un port unique (**port 3000**), facilitant le déploiement sur Cloud Run, Docker, VPS ou plateforme PaaS sans complexité de proxy inverse externe. |
| **Évolutivité vers PostgreSQL** | Toutes les données transitent par `/backend/db.ts` et `/backend/types.ts`. Remplacer la mémoire par PostgreSQL / Prisma prend moins d'une heure car les interfaces sont déjà prêtes. |
| **Facilité de Migration Mobile** | Si demain vous souhaitez créer une application mobile (iOS / Android Flutter ou React Native), le dossier `/backend` est déjà une API REST 100 % indépendante prête à être consommée par le mobile. |
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
    ├── app.ts                  # Factory Express : enregistre les middlewares et les 5 routeurs
    ├── types.ts                # Modèles de données de la base (DBUser, DBTarget, DBScan...)
    ├── db.ts                   # Store de données en mémoire (avec état initial de référence)
    │
    ├── routes/                 # Contrôleurs API REST découpés par domaine
    │   ├── auth.routes.ts      # /api/k/auth/* (login, register, logout, OTP)
    │   ├── targets.routes.ts   # /api/k/targets/* (CRUD cibles et attestation d'autorisation)
    │   ├── scans.routes.ts     # /api/k/scans/* (lancement, polling, rapports JSON/HTML)
    │   ├── credits.routes.ts   # /api/k/credits/* (solde, recharges KX, historique)
    │   └── misc.routes.ts      # /api/k/me, notifications, candidatures parrainage
    │
    └── services/               # Moteurs d'exécution métier
        ├── scanner.ts          # Orchestrateur d'audit asynchrone et progression
        └── real-engine.ts      # Véritable moteur réseau (DNS, SSL/TLS, en-têtes HTTP, failles)
```

---

## 4. Le Dossier `frontend/` (Interface & Expérience Utilisateur)

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

## 5. Le Dossier `backend/` (API, Logique Métier & Moteur d'Audit)

Le dossier `backend/` est une application serveur Express modulaire, hautement découplée et autonome.

### A. La Factory Applicative (`backend/app.ts`)
Elle instancie l'application Express, configure les analyseurs JSON (`express.json()`), les cookies (`cookie-parser`), et monte les 5 routeurs spécialisés :
```typescript
app.use('/api/k/auth', authRouter);
app.use('/api/k/targets', targetsRouter);
app.use('/api/k/scans', scansRouter);
app.use('/api/k/credits', creditsRouter);
app.use('/api/k', miscRouter);
```

### B. Les Routeurs par Domaine (`backend/routes/`)
1. **`auth.routes.ts` :**
   - `POST /api/k/auth/login` : Vérifie l'email/mot de passe et crée le cookie de session sécurisé.
   - `POST /api/k/auth/register` : Crée le compte avec 3 scans gratuits de bienvenue.
   - `POST /api/k/auth/otp/verify` : Valide le code OTP WhatsApp à 6 chiffres.
   - `POST /api/k/auth/logout` : Efface le cookie de session.
2. **`targets.routes.ts` :**
   - `GET /api/k/targets` : Retourne la liste paginée des applications de l'utilisateur.
   - `POST /api/k/targets` : Enregistre une nouvelle cible avec attestation de propriété obligatoire (enregistrement IP et horodatage).
   - `GET /api/k/targets/:id` : Récupère la fiche détaillée d'une cible et ses statistiques.
   - `PATCH /api/k/targets/:id/authorization` : Permet d'activer ou désactiver l'autorisation légale d'audit.
   - `DELETE /api/k/targets/:id` : Supprime une cible.
3. **`scans.routes.ts` :**
   - `GET /api/k/scans` : Liste tous les audits avec possibilité de filtrer par cible ou statut.
   - `POST /api/k/scans` : Vérifie l'autorisation de la cible, déduit 1 scan gratuit (ou les crédits requis selon le profil), crée le scan et démarre l'audit en tâche asynchrone en arrière-plan.
   - `GET /api/k/scans/:id` : Utilisé par le frontend pour suivre la progression en temps réel (0 % à 100 %) puis récupérer le rapport complet.
   - `GET /api/k/scans/:id/report.html` : Génère et télécharge un rapport HTML autonome prêt pour présentation.
   - `GET /api/k/scans/:id/report.json` : Exporte les données brutes de l'audit au format JSON.
4. **`credits.routes.ts` :**
   - `GET /api/k/credits/me` : Renvoie le solde actuel, les scans gratuits restants et la grille tarifaire.
   - `POST /api/k/credits/redeem` : Valide un code cadeau au format `KX-XXXX` et crédite immédiatement le compte.
   - `GET /api/k/credits/transactions` : Fournit l'historique de débit/crédit horodaté.
5. **`misc.routes.ts` :**
   - `GET /api/k/me` : Renvoie les informations de profil de l'utilisateur connecté.
   - `GET /api/k/notifications` : Renvoie la liste des alertes de sécurité.
   - `POST /api/k/referrals/apply` : Reçoit les candidatures de parrainage avec numéro Mobile Money.

### C. Le Moteur d'Audit Réel (`backend/services/real-engine.ts`)
Ce fichier exécute une véritable analyse de cybersécurité :
- **DNS Probing :** Résout les enregistrements A, MX, et contrôle la présence des politiques SPF et DMARC anti-phishing.
- **SSL/TLS Handshake :** Établit une connexion TLS directe avec la cible pour vérifier la validité du certificat (détection d'expiration imminente ou passée) et tester la présence de protocoles obsolètes vulnérables (TLS 1.0 / 1.1).
- **HTTP Security Headers :** Envoie des requêtes réelles pour vérifier les en-têtes `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options` et la divulgation de bannières serveurs (`Server`, `X-Powered-By`).
- **Protection SSRF :** Empêche le scan d'adresses IP privées internes et de métadonnées cloud (ex: `169.254.169.254`).
- **Calcul du Score CVSS :** Calcule une note sur 100 basée sur le nombre et la gravité des failles découvertes.

---

## 6. Le Fichier d'Orchestration Racine (`server.ts`)

Le fichier `server.ts` situé à la racine du projet sert de **passerelle d'orchestration**.

### Comment fonctionne `server.ts` ?
1. Il importe la factory backend modulaire : `import { createExpressApp } from './backend/app.ts';`
2. En mode développement (`npm run dev`) :
   - Il initialise le serveur Vite en mode middleware (`createViteServer({ server: { middlewareMode: true } })`).
   - Il monte les middlewares Vite sur l'application Express.
   - Ainsi, l'ensemble de l'API (`/api/k/*`) et le rechargement à chaud du frontend React (HMR) tournent ensemble de façon parfaitement fluide sur `http://localhost:3000`.
3. En mode production (`npm start`) :
   - Il sert les fichiers statiques pré-compilés du dossier `/dist` et renvoie `index.html` pour toute route inconnue (gestion du Single Page Application Routing).

---

## 7. Parcours Réel des Données (Flux de A à Z)

### Exemple concret : L'utilisateur lance un scan depuis l'interface

```text
1. L'utilisateur se rend sur http://localhost:3000/scans/new
   └── Le routeur frontend (frontend/App.tsx) affiche la page NewScanPage.tsx.

2. NewScanPage effectue une requête GET /api/k/targets
   └── Le routeur backend (backend/routes/targets.routes.ts) lit DB.targets
       et renvoie la liste des applications autorisées.

3. L'utilisateur sélectionne son application, choisit le profil "Standard" (2 crédits)
   et clique sur "Lancer le scan".

4. NewScanPage envoie une requête POST /api/k/scans
   avec { target_id: "...", profile: "standard" }.

5. Le backend (backend/routes/scans.routes.ts) :
   a) Vérifie que la cible est autorisée.
   b) Vérifie le solde : 2 scans gratuits restants -> déduit 1 scan gratuit (solde = 1).
   c) Enregistre la transaction : "-1 scan gratuit (audit de sécurité)".
   d) Crée un scan avec le statut "running", progress: 0%.
   e) Appelle runScanWorker(scan.id) en arrière-plan sans bloquer la requête HTTP.
   f) Renvoie la réponse JSON : { id: "scan_abc123" }.

6. Le frontend redirige immédiatement vers /scans/scan_abc123.
   └── ScanDetailPage.tsx s'ouvre et interroge l'API toutes les 2 secondes.

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

## 8. Guide d'Évolution Pratique

### A. Remplacer la base en mémoire par PostgreSQL avec Prisma
1. Dans `backend/types.ts`, les modèles de données (`DBUser`, `DBTarget`, `DBScan`, `DBFinding`, `DBTransaction`) correspondent exactement aux tables nécessaires.
2. Installez Prisma (`npm i prisma @prisma/client`).
3. Remplacez simplement dans `backend/routes/*.ts` les accès à l'objet `DB` par des appels Prisma (ex: `await prisma.scan.findMany({ ... })`).
4. **Le frontend n'a besoin d'aucune modification**, car les formats de réponses JSON resteront identiques !

### B. Activer les Paiements Réels Mobile Money (Wave / Orange Money / CinetPay)
1. Ouvrez `backend/routes/credits.routes.ts`.
2. Ajoutez la route `POST /api/k/credits/checkout` :
   - Reçoit le `pack_id`, le `phone` et l'opérateur (`Wave`, `Orange`, `MTN`, `Moov`).
   - Appelle l'API de votre passerelle de paiement (ex. CinetPay ou Wave Business API).
   - Renvoie l'URL de paiement ou initie le push USSD sur le téléphone du client.
3. Ajoutez la route webhook `POST /api/k/credits/webhook` pour créditer automatiquement le compte de l'utilisateur dès confirmation de la transaction.

### C. Ajouter de Nouveaux Contrôles de Sécurité au Moteur de Scan
- Ouvrez `backend/services/real-engine.ts`.
- Vous pouvez enrichir la détection (ex: recherche de ports ouverts avec `net.connect`, détection de sous-domaines via DNS brute-force, ou vérification des versions de CMS).
- Ajoutez simplement les vulnérabilités trouvées au tableau `findings` avec leur note CVSS.

---

## 9. Commandes Utiles & Environnement

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
2. **Une architecture découplée en couches :** chaque fichier a une mission claire et unique.
3. **Une documentation complète :**
   - **`GUIDE_PROJET.md` (ce document)** : Comprendre l'architecture et savoir où modifier le code.
   - **`ISSUES.md`** : Suivre les 16 tickets de déploiement pour la production en Afrique.
   - **`README.md`** : Guide technique condensé du projet.
