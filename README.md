# Kortex Defender · Plateforme d'Audit de Sécurité Web & API

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![API Standard](https://img.shields.io/badge/API-REST%20%2Fapi%2Fv1%2F-emerald.svg)](#-documentation-de-lapi-apiv1)

> **Kortex Defender** est une plateforme SaaS de cybersécurité conçue pour permettre aux entreprises, développeurs et organisations d'auditer la sécurité de leurs sites web et API, d'identifier les vulnérabilités avant qu'elles ne soient exploitées et d'obtenir des correctifs actionnables.

La plateforme est nativement adaptée au contexte UEMOA / Côte d'Ivoire (tarification en Francs CFA, validation Mobile Money Wave / Orange Money, vérification WhatsApp OTP).

---

## Sommaire

1. [Démarrage Express (3 étapes)](#-démarrage-express-3-étapes)
2. [Fonctionnalités & Profils d'Audit](#-fonctionnalités--profils-daudit)
3. [Architecture du Projet](#-architecture-du-projet)
4. [Moteurs de Scan Réels (`real-engine.ts` & `scanner.ts`)](#-moteurs-de-scan-réels-real-enginets--scannerts)
5. [Modes de Lancement en Local (Unifié ou Séparé)](#-modes-de-lancement-en-local-sans-docker-sans-prisma)
6. [Connexion à votre PostgreSQL Local (`Base_de_donnees.sql`)](#-connexion-à-votre-postgresql-local-installé-sur-votre-pc)
7. [Documentation de l'API (`/api/v1/`)](#-documentation-de-lapi-apiv1)
8. [Tests Unitaires & Collection Postman](#-tests-unitaires-automatisés--collection-dapi)
9. [Dépannage Rapide (FAQ)](#-dépannage-rapide)
10. [Documentation Complémentaire](#-documentation-complémentaire)

---

## ⚡ Démarrage Express (3 étapes)

```bash
# 1. Installer les dépendances
npm install

# 2. (Optionnel) Configurer PostgreSQL local
cp .env.example .env
# -> Modifiez DATABASE_URL dans .env avec votre mot de passe PostgreSQL

# 3. Lancer l'application complète
npm run dev
```
👉 Ouvrez **`http://localhost:3000`** — Compte de test inclus : `babaaristote6@gmail.com` / `Cl2even2026`.

---

## 🚀 Fonctionnalités & Profils d'Audit

### Capacités clés
- **Gestion des Cibles (`web`, `api`, `graphql`)** avec attestation légale d'autorisation horodatée.
- **Moteur d'Audit Réel** : DNS (`A`, `AAAA`, `MX`, `SPF`, `DMARC`), handshake **SSL/TLS**, en-têtes HTTP (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`), divulgation de bannières serveur et cartographie de sous-domaines.
- **Rapports & Exports** : Score synthétique `/100`, sévérités CVSS, remédiations concrètes, téléchargement **HTML autonome**, **JSON** ou impression **PDF A4**.
- **Monétisation UEMOA** : 3 scans gratuits de bienvenue, packs en FCFA, coupons de recharge (`STARTER`, `PREMIUM`) et affiliation Mobile Money.

### Barème des profils
| Profil | Coût | Périmètre analysé |
|---|---|---|
| **Rapide (`fast`)** | 1 crédit *(ou 1 scan gratuit)* | Certificat SSL/TLS, en-têtes HTTP critiques, détection basique des technologies. |
| **Standard (`standard`)** | 2 crédits *(ou 1 scan gratuit)* | DNS/SPF/DMARC, TLS complet, tous les en-têtes de sécurité, sous-domaines passifs. |
| **Approfondi (`deep`)** | 4 crédits | Tout le profil Standard + audit de sécurité des cookies/sessions et chemins critiques. |

---

## 🏗 Architecture du Projet

```text
├── server.ts                            # Orchestrateur unifié (Vite + Express, port 3000)
├── index.html                           # Entrée HTML racine
├── vite.config.ts                       # Config Vite + proxy /api -> port 5000
├── .env.example                         # Modèle de configuration environnement
├── kortex_defender_api_collection.json  # Collection Postman / Bruno / Insomnia
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js                       # Factory Express & montage des routes /api/v1/*
│       ├── server.js                    # Serveur Backend standalone (port 5000)
│       ├── types.ts                     # Modèles TypeScript backend
│       ├── config/
│       │   ├── env.js                   # Chargement auto du .env (racine ou backend/)
│       │   └── cors.js                  # Configuration CORS
│       ├── database/
│       │   ├── Base_de_donnees.sql      # Script SQL PostgreSQL complet (DDL + Seed)
│       │   ├── connection.js            # Pool PostgreSQL (pg) avec fallback automatique
│       │   └── db.js                    # Store autonome local en mémoire
│       ├── middlewares/
│       │   ├── auth.middleware.js       # Session cookie & protection
│       │   ├── cors.middleware.js       # Headers CORS
│       │   └── error.middleware.js      # Formatage centralisé des erreurs
│       ├── routes/                      # Routeurs REST (/api/v1/*)
│       ├── controllers/                 # Logique métier par domaine
│       ├── services/
│       │   ├── real-engine.ts           # Moteur d'audit réseau réel
│       │   └── scanner.ts               # Worker asynchrone de scan
│       └── utils/                       # Helpers & passerelles de ré-export
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                   # Config Vite autonome (port 5173)
│   ├── index.html
│   ├── public/                          # favicon.svg, icons.svg
│   └── src/
│       ├── main.tsx                     # Montage React 19
│       ├── App.tsx                      # Routeur SPA
│       ├── App.css / index.css          # Design System Halcyon Mesh + Tailwind CSS v4
│       ├── assets/                      # hero.png, react.svg, vite.svg
│       ├── lib/types.ts                 # Contrats TypeScript client
│       ├── services/api.ts              # Client API typé (/api/v1/*)
│       ├── context/AuthContext.tsx      # Session & solde de crédits
│       ├── components/                  # AppLayout, Icons
│       └── pages/                       # Les 13 écrans du produit
│
└── tests/                               # Tests unitaires automatisés (npm test)
    ├── auth.test.ts
    ├── targets.test.ts
    ├── scans.test.ts
    ├── credits.test.ts
    ├── misc.test.ts
    ├── helpers.ts
    └── run-tests.ts
```

---

## ⚡ Moteurs de Scan Réels (`real-engine.ts` & `scanner.ts`)

1. **`backend/src/services/real-engine.ts`** :
   - Effectue de vraies sondes réseau Node.js (`node:dns/promises`, `node:tls`, `node:http`, `node:https`).
   - Applique un blindage **anti-SSRF** bloquant les IP privées (`10.x.x.x`, `192.168.x.x`) et métadonnées cloud (`169.254.169.254`).
   - Détecte les failles DNS (`SPF`, `DMARC`), certificats proches de l'expiration, protocoles obsolètes (`TLSv1`, `TLSv1.1`), en-têtes HTTP manquants et bannières exposées (`Server`, `X-Powered-By`).
2. **`backend/src/services/scanner.ts`** :
   - Lance l'audit en arrière-plan dès la création du scan (`POST /api/v1/scans`), diffuse le journal technique (`log_lines`) en direct et assure un repli gracieux si une cible est injoignable.

---

## ⚙️ Modes de Lancement en Local (Sans Docker, Sans Prisma)

| Mode | Commande | URL | Usage |
|---|---|---|---|
| **Unifié (1 terminal)** | `npm run dev` | `http://localhost:3000` | Backend + Frontend servis ensemble |
| **Backend seul** | `npm run dev:back` | `http://localhost:5000` | API REST `/api/v1/*` uniquement |
| **Frontend seul** | `npm run dev:front` | `http://localhost:5173` | Client React avec proxy `/api` vers `5000` |

---

## 🐘 Connexion à votre PostgreSQL Local (Installé sur votre PC)

1. **Créez la base** dans pgAdmin, DBeaver ou `psql` :
   ```sql
   CREATE DATABASE kortex_defender;
   ```
2. **Exécutez le script unique `backend/src/database/Base_de_donnees.sql`** dans `kortex_defender` (crée les 6 tables, les index et insère votre compte `babaaristote6@gmail.com`).
3. **Configurez `.env`** à la racine du projet :
   ```env
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/kortex_defender"
   ```
4. **Démarrez** (`npm run dev` ou `npm run dev:back`). Vous verrez :
   ```text
   🐘 [PostgreSQL] Connecté avec succès à votre base locale ! (Heure serveur: ...)
   ```
   *(Si `.env` ne contient pas `DATABASE_URL` ou si PostgreSQL est arrêté, l'application bascule automatiquement sur le store autonome `backend/src/database/db.js`).*

---

## 📡 Documentation de l'API (`/api/v1/`)

| Domaine | Endpoints principaux |
|---|---|
| **Auth** | `POST /api/v1/auth/register`, `POST /login`, `POST /logout`, `POST /send-otp`, `POST /verify-otp` |
| **Cibles** | `GET /api/v1/targets`, `POST /`, `GET /:id`, `POST /:id/authorize`, `DELETE /:id` |
| **Scans** | `GET /api/v1/scans`, `POST /`, `GET /:id`, `GET /:id/download?format=html\|json`, `DELETE /:id` |
| **Crédits** | `GET /api/v1/credits/me`, `POST /redeem`, `GET /me/transactions` |
| **Divers** | `GET /api/v1/me`, `GET /notifications/me`, `GET /notifications/me/unread-count`, `POST /notifications/read-all`, `GET /referrals/me`, `POST /referrals/apply` |

---

## 🧪 Tests Unitaires Automatisés & Collection d'API

- **Lancer tous les tests unitaires** :
  ```bash
  npm test
  ```
  Vérifie 5 suites complètes (Auth, Cibles, Scans, Crédits, Profil/Notifications/Affiliation) en ~0,26 seconde.
- **Collection Postman / Bruno / Insomnia** :
  Importez **`kortex_defender_api_collection.json`** (variables `baseUrl`, `targetId`, `scanId` déjà configurées).

---

## 🛠 Dépannage Rapide

- **Le serveur affiche `aucun DATABASE_URL configuré` alors que `.env` existe :**
  Vérifiez que le fichier à la racine s'appelle exactement **`.env`** (pas `.env.txt` sous Windows), que la ligne `DATABASE_URL=...` n'est pas commentée avec `#`, puis redémarrez `npm run dev`.
- **Erreur `EADDRINUSE` sur le port `3000` ou `5000` :**
  Libérez le port sous Windows PowerShell (`netstat -ano | findstr :3000` puis `taskkill /PID <PID> /F`) ou définissez `PORT=3001` / `BACKEND_PORT=5001`.
- **Vérifier le typage & le build :**
  ```bash
  npm run lint && npm run build
  ```

---

## 📖 Documentation Complémentaire

- **[`GUIDE_PROJET.md`](./GUIDE_PROJET.md)** : Explication détaillée de chaque couche logicielle et du cycle de vie complet d'un scan.
- **[`FEUILLE_DE_ROUTE_PRODUCTION.md`](./FEUILLE_DE_ROUTE_PRODUCTION.md)** : Guide étape par étape pour brancher les requêtes SQL `pool.query`, l'IA Gemini sur les scans, Bcrypt/JWT et Mobile Money.
- **[`ISSUES.md`](./ISSUES.md)** : Liste des 16 tickets techniques de mise en production.
