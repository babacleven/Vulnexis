# Kortex Defender · Plateforme d'Audit de Sécurité Web & API

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

> **Kortex Defender** est une plateforme SaaS de cybersécurité conçue pour permettre aux entreprises, développeurs et organisations d'auditer la sécurité de leurs sites web et API, d'identifier les vulnérabilités avant qu'elles ne soient exploitées, et d'obtenir des correctifs clairs et actionnables.

La plateforme est nativement adaptée aux réalités économiques et techniques de la Côte d'Ivoire et de la zone UEMOA (tarification en Francs CFA, validation Mobile Money, vérification WhatsApp OTP).

---

## Sommaire

1. [Fonctionnalités Principales](#-fonctionnalités-principales)
2. [Profils d'Audit & Décompte](#-profils-daudit--décompte)
3. [Architecture Technique](#-architecture-technique)
4. [Structure du Projet](#-structure-du-projet)
5. [Documentation de l'API](#-documentation-de-lapi)
6. [Installation & Démarrage](#-installation--démarrage)
7. [Variables d'Environnement](#-variables-denvironnement)
8. [Éthique & Conformité Juridique](#-éthique--conformité-juridique)
9. [Feuille de Route & Backlog de Production](#-feuille-de-route--backlog-de-production)

---

## 🚀 Fonctionnalités Principales

### 1. Gestion des Applications & Périmètre
- **Déclaration des cibles** : Prise en charge des sites web vitrines, applications web modernes, API REST et endpoints GraphQL.
- **Attestation de propriété obligatoire** : Signature horodatée certifiant que l'utilisateur est propriétaire de la cible ou dispose d'une autorisation écrite formelle.
- **Historique & Métriques** : Suivi du score de sécurité dans le temps et comptage des audits réalisés.

### 2. Moteur d'Audit Modulaire
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

L'application repose sur une architecture **Full-Stack intégrée** avec Vite et Express :

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (SPA)                           │
│  React 19 · TypeScript · Tailwind CSS v4 · Motion · Lucide Icons       │
│  Navigation client réactive · Suivi temps réel des audits              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Proxy interne HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SERVEUR BACKEND (Node.js / Express)                │
│                                                                        │
│  ┌────────────────────────┐  ┌────────────────────────┐                │
│  │ Authentification       │  │ Gestionnaire Solde &   │                │
│  │ Cookie HttpOnly / Auth │  │ Codes Recharges (KX)   │                │
│  └────────────────────────┘  └────────────────────────┘                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 MOTEUR DE SCAN RÉSEAU & AUDIT                    │  │
│  │  - DNS Lookup (node:dns)       - Diagnostic TLS (node:tls)       │  │
│  │  - Sondes HTTP Headers         - Détection Subdomains            │  │
│  │  - Rapprochement CVE           - Calcul Score /100               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      COUCHE DE PERSISTANCE                       │  │
│  │  In-Memory Storage (Dev) ──> PostgreSQL / Prisma (Production)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure du Projet (Séparation Frontend & Backend)

Le projet adopte une **Architecture Monorepo Découplée** avec deux répertoires étanches :

```text
├── index.html                 # Point d'entrée HTML principal (SEO & Google Fonts)
├── metadata.json              # Métadonnées et permissions de l'application
├── package.json               # Dépendances et scripts npm
├── server.ts                  # Orchestrateur racine Express (Port 3000) & pont Vite
├── tsconfig.json              # Configuration TypeScript
├── vite.config.ts             # Configuration du bundler Vite avec Tailwind CSS v4
├── ISSUES.md                  # Backlog des 16 issues pour le déploiement réel
├── README.md                  # Documentation complète du projet
├── GUIDE_PROJET.md            # Guide explicatif détaillé d'architecture et de fonctionnement
├── public/                    # Fichiers statiques et logos
│   └── kortex-logo.svg        # Logo vectoriel officiel Kortex Defender
│
├── frontend/                  # [APPLICATION REACT SPA]
│   ├── App.tsx                # Routeur principal et gestionnaire de session
│   ├── main.tsx               # Point d'entrée React 19
│   ├── index.css              # Feuille de style globale Tailwind CSS v4
│   ├── types.ts               # Définitions TypeScript (User, Target, Scan, Finding...)
│   ├── components/            # Composants partagés (AppLayout, Icons...)
│   ├── context/               # Contexte d'état global (AuthContext...)
│   └── pages/                 # Les 13 vues applicatives (Dashboard, Scans, Targets...)
│
└── backend/                   # [API & MOTEURS NODE.JS / EXPRESS]
    ├── app.ts                 # Factory Express avec enregistrement des 5 routeurs
    ├── db.ts                  # Store de données en mémoire (prêt pour PostgreSQL)
    ├── types.ts               # Modèles de données (DBUser, DBTarget, DBScan...)
    ├── routes/                # Contrôleurs API REST découpés par domaine
    │   ├── auth.routes.ts     # Inscription, connexion, OTP WhatsApp
    │   ├── targets.routes.ts  # Gestion des cibles et attestations
    │   ├── scans.routes.ts    # Lancement, suivi et rapports d'audits
    │   ├── credits.routes.ts  # Solde, coupons KX et historique
    │   └── misc.routes.ts     # Profil, notifications, parrainage
    └── services/              # Moteurs de calcul et d'analyse
        ├── scanner.ts         # Orchestrateur asynchrone des scans
        └── real-engine.ts     # Moteur réseau réel (DNS, TLS, Headers, CVSS)
```

> 📖 **Pour une explication approfondie de l'architecture et du fonctionnement interne de chaque composant, consultez le guide complet : [`GUIDE_PROJET.md`](./GUIDE_PROJET.md)**.

---

## 📡 Documentation de l'API

Tous les endpoints métier sont préfixés par `/api/k/` et protégés par session authentifiée (cookie `kortex_session`).

### Authentification & Utilisateur
| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription d'un nouvel utilisateur (crédite 3 scans gratuits). |
| `POST` | `/api/auth/login` | Connexion avec email et mot de passe. |
| `POST` | `/api/auth/logout` | Déconnexion et révocation de la session. |
| `GET` | `/api/k/me` | Informations du profil utilisateur connecté. |

### Gestion des Cibles (Applications)
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/k/targets` | Liste de toutes les applications de l'utilisateur. |
| `POST` | `/api/k/targets` | Déclaration d'une nouvelle cible avec attestation d'autorisation. |
| `GET` | `/api/k/targets/:id` | Détails d'une application et statistiques d'audit. |
| `POST` | `/api/k/targets/:id/authorize` | Activation / révocation de l'attestation légale de scan. |
| `DELETE` | `/api/k/targets/:id` | Suppression définitive d'une cible et de son historique. |

### Moteur de Scan & Rapports
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/k/scans` | Liste des audits avec filtrage possible par statut et cible. |
| `POST` | `/api/k/scans` | Lancement d'un scan (`target_id`, profil : `fast`, `standard`, `deep`). |
| `GET` | `/api/k/scans/:id` | Progression en temps réel et rapport complet du scan. |
| `GET` | `/api/k/scans/:id/download` | Téléchargement du rapport au format HTML ou JSON (`?format=html`). |
| `DELETE` | `/api/k/scans/:id` | Suppression d'un rapport de scan. |

### Facturation & Crédits
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/k/credits/me` | Solde actuel de crédits et scans de découverte restants. |
| `POST` | `/api/k/credits/redeem` | Activation d'un code de recharge (`KX-XXXX-XXXX-XXXX`). |
| `GET` | `/api/k/credits/me/transactions` | Historique de toutes les consommations et attributions. |

---

## ⚙️ Installation & Démarrage

### Pré-requis
- **Node.js** version 18.0.0 ou supérieure.
- **npm** version 9.0.0 ou supérieure.

### 1. Cloner le projet
```bash
git clone <URL_DU_DEPOT>
cd kortex-defender
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Copiez le fichier d'exemple et renseignez les variables nécessaires :
```bash
cp .env.example .env
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application est accessible sur : **`http://localhost:3000`**

### 5. Compiler pour la production
```bash
npm run build
npm run lint
```

---

## 🔐 Variables d'Environnement

Le fichier `.env.example` définit les variables de configuration supportées :

```env
# URL publique de déploiement de l'application
APP_URL="http://localhost:3000"

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

## 🛡 Licence & Propriété

Ce logiciel est la propriété exclusive de **Kortex Defender**. Tous droits réservés.
