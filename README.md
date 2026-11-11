# Kortex Defender · Plateforme d'Audit de Sécurité Web & API

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![API Standard](https://img.shields.io/badge/API-REST%20%2Fapi%2Fv1%2F-emerald.svg)](#-documentation-de-lapi-apiv1)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

> **Kortex Defender** est une plateforme SaaS de cybersécurité conçue pour permettre aux entreprises, développeurs et organisations d'auditer la sécurité de leurs sites web et API, d'identifier les vulnérabilités avant qu'elles ne soient exploitées, et d'obtenir des correctifs clairs et actionnables.

La plateforme est nativement adaptée aux réalités économiques et techniques de la Côte d'Ivoire et de la zone UEMOA (tarification en Francs CFA, validation Mobile Money, vérification WhatsApp OTP).

---

## Sommaire

1. [Fonctionnalités Principales](#-fonctionnalités-principales)
2. [Profils d'Audit & Décompte](#-profils-daudit--décompte)
3. [Architecture Technique (Séparation Frontend & Backend)](#-architecture-technique)
4. [Documentation de l'API (`/api/v1/`)](#-documentation-de-lapi-apiv1)
5. [Installation & Lancement du Projet](#-installation--lancement-du-projet)
   - [Option 1 : Démarrage Rapide (En Mémoire)](#option-1--démarrage-rapide-base-en-mémoire-immédiate)
   - [Option 2 : Démarrage avec PostgreSQL & Prisma](#option-2--démarrage-avec-une-vraie-base-de-données-postgresql--prisma)
6. [Variables d'Environnement](#-variables-denvironnement)
7. [Éthique & Conformité Juridique](#-éthique--conformité-juridique)
8. [Feuille de Route & Backlog de Production](#-feuille-de-route--backlog-de-production)
9. [Documentation Approfondie](#-documentation-approfondie)

---

## 🚀 Fonctionnalités Principales

### 1. Gestion des Applications & Périmètre
- **Déclaration des cibles** : Prise en charge des sites web vitrines, applications web modernes, API REST et endpoints GraphQL.
- **Attestation de propriété obligatoire** : Signature horodatée certifiant que l'utilisateur est propriétaire de la cible ou dispose d'une autorisation écrite formelle.
- **Historique & Métriques** : Suivi du score de sécurité dans le temps et comptage des audits réalisés.

### 2. Moteur d'Audit Modulaire Réel
- **Inspection SSL/TLS** : Validité du certificat, autorité émettrice, détection de l'expiration imminente, contrôle des protocoles (TLS 1.2, TLS 1.3) et suites de chiffrement.
- **Audit des en-têtes HTTP de sécurité** : Vérification de la présence et de la configuration de `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), `X-Frame-Options` (anti-clickjacking), `X-Content-Type-Options`, `Referrer-Policy`, et `Permissions-Policy`.
- **Détection des fuites d'informations** : Identification des signatures logicielles et versions exposées (`Server`, `X-Powered-By`).
- **Cartographie des sous-domaines** : Découverte passive des sous-domaines actifs et des environnements de pré-production/staging exposés.
- **Corrélation CVE** : Rapprochement des technologies identifiées avec les catalogues de vulnérabilités connues (NVD/OSV).

### 3. Rapports & Exportations
- **Score synthétique sur 100** avec code couleur de criticité (Critique, Élevée, Moyenne, Faible, Info).
- **Fiches de vulnérabilité didactiques** : Titre, catégorie, score CVSS, explication de l'impact, élément de preuve détecté (proof) et proposition de correctif de code adapté.
- **Export multi-formats** :
  - **HTML autonome** prêt à être archivé ou partagé en interne.
  - **JSON machine-readable** pour l'intégration dans les pipelines DevOps / CI/CD.
  - **Version imprimable** optimisée pour l'export en document PDF format A4.

### 4. Modèle Économique & Monétisation UEMOA
- **Dotation de bienvenue** : 3 scans de découverte gratuits offerts à chaque nouveau compte.
- **Packs de crédits en FCFA** :
  - *Essentiel* : 1 000 FCFA (10 crédits).
  - *Starter* : 2 000 FCFA (20 crédits).
  - *Premium* : 5 000 FCFA / mois (60 crédits + Agent Kortex inclus).
  - *Premium Plus* : Sur devis personnalisé pour grands comptes.
- **Codes coupons / Bons de rechargement** : Système de codes cadeaux et de cartes prépayées (`KX-XXXX-XXXX-XXXX`).
- **Programme d'affiliation / Parrainage** : Réduction de -30 % pour le filleul, commission de 20 % pour le parrain avec versement par Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money).

### 5. Agent Kortex (IA de Remédiation)
- Analyse autonome des résultats de scan.
- Explication vulgarisée de chaque faille avec le snippet de configuration exact adapté au serveur (Apache, Nginx, Express, Next.js, Laravel).

---

## 🎯 Profils d'Audit & Décompte

| Profil | Coût | Durée estimée | Périmètre d'analyse |
|---|---|---|---|
| **Rapide** | 1 crédit *(ou 1 scan gratuit)* | ~1 à 2 min | En-têtes HTTP de sécurité, certificat SSL/TLS, détection basique des technologies. |
| **Standard** | 2 crédits *(ou 1 scan gratuit)* | ~3 à 5 min | Reconnaissance complète, failles de configuration, CVE connues, fuites de secrets dans le JavaScript, cartographie des sous-domaines. |
| **Approfondi** | 4 crédits | ~10 à 15 min | Cartographie exhaustive, analyse active des endpoints d'API, tests d'exposition avancés et rapport complet. |

---

## 🏗 Architecture Technique

L'application repose sur une **Architecture Monorepo Découplée en Couches** avec séparation stricte des répertoires :

```text
├── backend/
│   ├── src/
│   │   ├── config/              # Configuration (env.js, cors.js)
│   │   ├── controllers/         # Contrôleurs API REST (auth, targets, scans, credits, misc)
│   │   ├── database/
│   │   │   ├── Base_de_donnees.sql  # Schéma SQL PostgreSQL & Seed officiel
│   │   │   ├── connection.js    # Pool PostgreSQL avec fallback automatique
│   │   │   └── db.js            # Store de données autonome
│   │   ├── middlewares/         # Middlewares (auth, cors, error)
│   │   ├── routes/              # Définition des routes /api/v1/*
│   │   ├── utils/               # Moteurs d'audit (real-engine.js, scanner.js, helpers.js)
│   │   ├── app.js               # Factory Express
│   │   └── server.js            # Serveur backend autonome (Port 5000)
│   ├── package-lock.json
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg          # Favicon officiel Kortex Defender
│   │   └── icons.svg            # Sprite d'icônes SVG
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png         # Capture héro / mockup
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/          # Composants UI (AppLayout, Icons)
│   │   ├── lib/
│   │   │   └── types.ts         # Modèles de données TypeScript
│   │   ├── pages/               # Les 13 vues du produit
│   │   ├── services/
│   │   │   └── api.ts           # Client API typé
│   │   ├── App.css              # Styles globaux applicatifs
│   │   ├── App.tsx              # Routeur & gestion de session
│   │   ├── index.css            # Design System Halcyon Mesh (Tailwind CSS v4)
│   │   └── main.tsx             # Point de montage React 19
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

---

## 📡 Documentation de l'API (`/api/v1/`)

Tous les endpoints métier sont désormais standardisés sous **`/api/v1/`** et protégés par session authentifiée via le cookie HTTP `kortex_session`.

### 1. Authentification (`/api/v1/auth/*`)
| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Inscription d'un nouvel utilisateur (attribue 3 scans gratuits). |
| `POST` | `/api/v1/auth/login` | Connexion avec email et mot de passe. |
| `POST` | `/api/v1/auth/logout` | Déconnexion et révocation de la session. |
| `POST` | `/api/v1/auth/send-otp` | Envoi d'un code OTP WhatsApp. |
| `POST` | `/api/v1/auth/verify-otp` | Validation du code OTP à 6 chiffres. |

### 2. Applications & Cibles (`/api/v1/targets/*`)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/targets` | Liste de toutes les applications de l'utilisateur. |
| `POST` | `/api/v1/targets` | Déclaration d'une nouvelle cible avec attestation d'autorisation légale. |
| `GET` | `/api/v1/targets/:id` | Détails d'une application et historique spécifique. |
| `POST` | `/api/v1/targets/:id/authorize` | Activation / révocation de l'attestation légale de scan. |
| `DELETE` | `/api/v1/targets/:id` | Suppression définitive d'une cible et de son historique. |

### 3. Moteur de Scans & Rapports (`/api/v1/scans/*`)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/scans` | Liste des audits avec filtrage possible par statut et cible. |
| `POST` | `/api/v1/scans` | Lancement d'un scan (`target_id`, profil : `fast`, `standard`, `deep`). |
| `GET` | `/api/v1/scans/:id` | Progression en temps réel et rapport complet du scan. |
| `GET` | `/api/v1/scans/:id/download` | Téléchargement du rapport au format HTML ou JSON (`?format=html`). |
| `DELETE` | `/api/v1/scans/:id` | Suppression définitive d'un rapport de scan. |

### 4. Facturation & Crédits (`/api/v1/credits/*`)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/credits/me` | Solde actuel de crédits et scans de découverte restants. |
| `POST` | `/api/v1/credits/redeem` | Activation d'un code de recharge (`KX-XXXX-XXXX-XXXX`). |
| `GET` | `/api/v1/credits/me/transactions` | Historique de toutes les consommations et attributions. |

### 5. Profil, Notifications & Affiliation (`/api/v1/*`)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/me` | Informations du profil utilisateur connecté. |
| `GET` | `/api/v1/notifications/me` | Liste des alertes de sécurité. |
| `GET` | `/api/v1/notifications/me/unread-count` | Nombre d'alertes non lues. |
| `POST` | `/api/v1/notifications/read-all` | Marquer toutes les alertes comme lues. |
| `GET` | `/api/v1/referrals/me` | Statut de la demande d'affiliation. |
| `POST` | `/api/v1/referrals/apply` | Soumission du dossier de parrainage avec numéro Mobile Money. |

---

## 🧪 Tests Unitaires Automatisés & Collection d'API

### 1. Lancer la Suite de Tests Unitaires (`tests/`)
Une suite complète de tests automatisés couvre l'ensemble des routes et règles métier (auth, cibles, déduction de crédits, scans, notifications, parrainage).

Pour lancer les tests :
```bash
npm test
```
*Temps d'exécution ultra-rapide (~0.3 seconde), sans dépendance lourde externe (basé sur Node.js et assertions natives).*

Organisation des tests dans le dossier `tests/` :
- `tests/auth.test.ts` : Inscription, rejet doublon, connexion, rejet mauvais mot de passe, génération & vérification OTP WhatsApp, déconnexion.
- `tests/targets.test.ts` : Liste des cibles, création avec validation d'URL, détails, bascule d'autorisation légale (toggle), suppression et 404.
- `tests/scans.test.ts` : Lancement de scan, décompte de scans gratuits / crédits, rejet cible non attestée (400), rejet solde insuffisant (402), consultation temps réel, export du rapport HTML et JSON, suppression.
- `tests/credits.test.ts` : Consultation du solde, rechargement par code coupon (`STARTER` +20, `PREMIUM` +60), traçabilité comptable dans l'historique des transactions.
- `tests/misc.test.ts` : Profil `/api/v1/me`, notifications, compteur non lues, marquage read-all, dépôt de dossier d'affiliation Mobile Money (Wave / OM).
- `tests/run-tests.ts` : Orchestrateur central avec rapport synthétique en console.

---

### 📬 Collection de Test d'API JSON (`kortex_defender_api_collection.json`)
Un fichier de collection universel au format standard **Postman Collection v2.1.0** est disponible à la racine du projet :
- **Fichier** : `kortex_defender_api_collection.json`
- **Compatible avec** : Postman, Insomnia, Bruno, Hoppscotch, VS Code Thunder Client, et cURL.
- **Variables intégrées** :
  - `baseUrl` : `http://localhost:5000` (mode backend) ou `http://localhost:3000` (mode unifié).
  - `targetId` et `scanId` paramétrables automatiquement.
- **Dossiers pré-configurés** : 100% des routes `/api/v1/*` avec corps de requête JSON prêts à l'envoi et descriptions didactiques.

---

## ⚙️ Démarrage 100% Local (Sans Docker, Sans Prisma)

> 💡 **Vous n'avez PAS besoin de Docker, de PostgreSQL ni de Prisma pour développer en local !**  
> Le projet intègre sa propre base de données locale autonome dans `backend/db.ts`. Elle est prête à l'emploi et pré-remplie avec votre compte de test (`babaaristote6@gmail.com`, mot de passe `Cl2even2026`).

### 1. Installation des dépendances
Dans le dossier du projet :
```bash
npm install
```

---

### 2. Lancement au choix (3 modes de travail)

#### Mode A : Full-Stack Unifié (Le plus simple, 1 seul terminal)
Lance l'interface React et l'API Express ensemble sur un port unique :
```bash
npm run dev
```
👉 Ouvrez votre navigateur sur : **`http://localhost:3000`**

---

#### Mode B : Séparé — Lancer uniquement le Backend (Port 5000)
Dans un premier terminal, lance exclusivement l'API Express :
```bash
npm run dev:back
```
👉 Serveur API disponible sur : **`http://localhost:5000`**  
👉 Endpoints canoniques : `http://localhost:5000/api/v1/`

---

#### Mode C : Séparé — Lancer uniquement le Frontend (Port 5173)
Dans un second terminal, lance l'application client Vite :
```bash
npm run dev:front
```
👉 Application client disponible sur : **`http://localhost:5173`**  
*(Vite redirige automatiquement toutes les requêtes `/api/*` vers le backend sur `http://localhost:5000` grâce au proxy intégré).*

---

### 🐘 Brancher votre PostgreSQL Local (Installé sur votre PC)

Puisque vous avez déjà PostgreSQL installé sur votre machine, vous pouvez vous y connecter directement **sans Docker** :

#### Étape 1 : Créer la base de données
Dans votre outil favori (**pgAdmin**, **DBeaver**, ou dans le terminal `psql`) :
```sql
CREATE DATABASE kortex_defender;
```

#### Étape 2 : Créer les tables et insérer les données
Deux scripts SQL prêts à l'emploi sont fournis dans le dossier `backend/db/` :
1. Exécutez le script **`backend/db/schema.sql`** (crée automatiquement les 6 tables relationnelles et les index).
2. Exécutez le script **`backend/db/seed.sql`** (insère votre compte de test `babaaristote6@gmail.com`).

#### Étape 3 : Indiquer votre mot de passe dans `.env`
Créez un fichier `.env` à la racine du projet avec vos identifiants PostgreSQL locaux :
```env
# Remplacez "mot_de_passe" par le mot de passe de votre utilisateur postgres
DATABASE_URL="postgresql://postgres:mot_de_passe@localhost:5432/kortex_defender"
```

#### Étape 4 : Lancer le projet
```bash
npm run dev
# ou séparé : npm run dev:back
```
Au démarrage, la console confirme automatiquement la connexion :
```text
🐘 [PostgreSQL] Connecté avec succès à votre base locale ! (Heure serveur: ...)
```

*(Si vous ne renseignez pas `DATABASE_URL` ou si PostgreSQL est arrêté, le projet bascule automatiquement sur le store autonome `backend/db.ts` sans jamais planter).*

---

## 🔐 Variables d'Environnement

Le fichier `.env.example` définit les variables de configuration supportées :

```env
# URL publique de déploiement de l'application
APP_URL="http://localhost:3000"

# URL de la base de données PostgreSQL (optionnelle en dev avec store mémoire)
DATABASE_URL="postgresql://kortex:secret@localhost:5432/kortex_defender?schema=public"

# Clé API Google Gemini (utilisée pour l'Agent Kortex en production)
GEMINI_API_KEY=""

# Port d'écoute du serveur Express (par défaut 3000)
PORT=3000
```

---

## ⚖️ Éthique & Conformité Juridique

L'utilisation de Kortex Defender est encadrée par des garde-fous stricts :

1. **Autorisation Explicite Obligatoire** : Il est formellement interdit de scanner des applications, serveurs ou API sans détenir les droits d'administration ou une autorisation écrite expresse du propriétaire légal.
2. **Traçabilité des Signatures** : Chaque ajout de cible enregistre un horodatage UTC infalsifiable, l'adresse IP source et le User-Agent de la personne effectuant la demande.
3. **Protection contre le Déni de Service (DoS)** : Les scans sont conçus pour être non destructifs et appliquent des limites de cadence pour ne pas perturber les serveurs de production.
4. **Blindage SSRF** : Le moteur refuse systématiquement toute cible pointant vers des réseaux privés locaux (`localhost`, `127.0.0.1`, `10.0.0.0/8`, etc.).

---

## 📋 Feuille de Route & Backlog de Production

Pour planifier le passage en production réelle avec des passerelles bancaires et télécoms locales, consultez le fichier **[`ISSUES.md`](./ISSUES.md)** qui détaille les 16 tâches prêtes à être importées dans votre gestionnaire de tickets :

- **Milestone 1 : Moteur d'Audit de Sécurité Réel** (DNS, SSL/TLS, en-têtes HTTP, CVE, export HTML/PDF).
- **Milestone 2 : Authentification & Sécurité des Comptes** (Bcrypt, sessions HTTP-only, validation WhatsApp OTP).
- **Milestone 3 : Facturation & Monétisation UEMOA** (Portefeuille crédits, codes coupons KX, Mobile Money).
- **Milestone 4 : Base de Données Relationnelle & Worker Queue** (PostgreSQL, BullMQ, Agent Kortex).

---

## 📖 Documentation Approfondie

Pour comprendre en détail l'architecture interne, le rôle précis de chaque fichier et le parcours complet des données de bout en bout, consultez le guide de référence :

👉 **[`GUIDE_PROJET.md`](./GUIDE_PROJET.md)**
