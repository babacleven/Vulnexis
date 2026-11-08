# Kortex Defender · Plan de Travail & Feuille de Route Production Réelle

Plan stratégique et découpage en tâches (Issues & Milestones) pour transformer le prototype Kortex Defender en plateforme de cybersécurité opérationnelle en production réelle, adaptée au contexte local (Côte d'Ivoire et zone UEMOA).

## Décisions Clés & Réponses de Cadrage

> [!IMPORTANT]
> **Décisions validées avec l'utilisateur :**
> - **Moteur d'audit :** Moteur de scan réel intégré dans le backend Node.js (résolution DNS réelle, négociation SSL/TLS en direct avec inspection des certificats et ciphers, extraction et analyse des en-têtes HTTP de sécurité, détection d'exposition de technologies et requêtage CVE réel).
> - **Paiements en FCFA :** Pas encore de contrat marchand actif. Mise en place d'un système hybride : gestion de crédits avec bons de rechargement/codes prépayés (`KX-XXXX`), enregistrement des demandes de versement/parrainage, et couche d'abstraction prête pour brancher CinetPay / FedaPay / Wave dès obtention des identifiants marchands.
> - **Authentification :** Système d'authentification double (Email + mot de passe hashé bcrypt sécurisé avec tokens de session, combiné avec le flux OTP WhatsApp / SMS prêt à être relié à une passerelle locale ou Twilio).

---

## 1. Vue d'Ensemble & Objectifs Produit

- **Vision :** Première plateforme souveraine d'audit de sécurité web et API en Afrique de l'Ouest, offrant aux PME, développeurs et entreprises locales un outil simple, accessible en FCFA, pour évaluer leur posture de sécurité et corriger leurs failles avant qu'elles ne soient exploitées.
- **Cible prioritaire :** Équipes tech, créateurs de sites web, startups fintech et agences digitales en Côte d'Ivoire et dans la zone UEMOA.
- **Règles d'or éthiques & légales :** Attestation de propriété obligatoire horodatée avant tout scan, journalisation des adresses IP et interdiction formelle des scans intrusifs destructeurs.

---

## 2. Découpage en Milestones & Issues (Tâches Techniques)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FEUILLE DE ROUTE DE DÉPLOIEMENT                      │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│  MILESTONE 1    │  MILESTONE 2    │   MILESTONE 3    │  MILESTONE 4    │
│  Moteur d'Audit │  Comptes Réels  │   Facturation &  │  Production &   │
│  Réseau & Web   │  & Sécurité     │   Crédits FCFA   │  Durcissement   │
│  (Scans Réels)  │  (Auth/WhatsApp)│   (Mobile Money) │  (DevOps/Infra) │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┘
```

### Milestone 1 : Moteur d'Audit de Sécurité Réel (Core Engine)

- [ ] **Issue 1.1 : Module de sondage DNS & Sous-domaines réels**
  - Utilisation de `node:dns/promises` pour interroger les enregistrements réels (`A`, `AAAA`, `MX`, `TXT`, `NS`, `CAA`, `SPF`, `DMARC`).
  - Détection des sous-domaines actifs (`api`, `admin`, `mail`, `dev`, `staging`) par résolution réseau en direct.
- [ ] **Issue 1.2 : Inspecteur SSL/TLS & Cryptographie en direct**
  - Établissement d'une connexion TLS réelle avec la cible via `node:tls`.
  - Contrôle de la chaîne de certification (validité, expiration, autorité émettrice Let's Encrypt / DigiCert / Sectigo).
  - Vérification des protocoles acceptés (rejet de SSLv3, TLS 1.0, TLS 1.1 ; conformité TLS 1.2 et TLS 1.3).
- [ ] **Issue 1.3 : Analyseur d'en-têtes HTTP & posture de sécurité**
  - Envoi de requêtes HTTP/HTTPS contrôlées pour capturer les réponses réelles du serveur.
  - Audit approfondi des en-têtes : `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
  - Détection de divulgation d'informations serveur (`Server`, `X-Powered-By`, versions logicielles exposées).
- [ ] **Issue 1.4 : Moteur de corrélation CVE & Calcul du score**
  - Identification des technologies exposées (WordPress, Nginx, Apache, PHP, Laravel, React, Next.js).
  - Corrélation avec les vulnérabilités CVE connues (base locale + interférence API OSV / NVD).
  - Algorithme de calcul du score de sécurité sur 100 avec pondération : Critique (-25), Élevée (-15), Moyenne (-8), Faible (-3).
- [ ] **Issue 1.5 : Générateur de rapports professionnels (HTML & JSON)**
  - Fiche technique pour chaque vulnérabilité avec résumé, preuve détectée (proof), impact métier et correctif de remédiation adapté aux développeurs.

---

### Milestone 2 : Authentification & Sécurité des Comptes Utilisateurs

- [ ] **Issue 2.1 : Authentification locale robuste (Email + Mot de passe)**
  - Hashage sécurisé des mots de passe (bcrypt / argon2) avec salage unique.
  - Gestion des sessions utilisateur par cookies HTTP-only avec flags `SameSite` et `Secure`.
  - Rate limiting sur les routes d'authentification pour bloquer les attaques par force brute.
- [ ] **Issue 2.2 : Passerelle de validation WhatsApp / SMS OTP**
  - Envoi de code de vérification à 6 chiffres par WhatsApp / SMS.
  - Architecture découplée : adaptateur pour intégrer un prestataire SMS local (ex. TouchSMS, Twilio, Infobip) avec mode développement / sandbox configurable.
- [ ] **Issue 2.3 : Registre d'attestation de propriété & conformité légale**
  - Enregistrement sécurisé en base de chaque attestation utilisateur : horodatage ISO, IP source du demandeur, identifiant de la cible, version des CGU acceptées.

---

### Milestone 3 : Modèle Économique & Crédits Adaptés au Marché Local

- [ ] **Issue 3.1 : Système de portefeuille de crédits et décompte réel**
  - Attribution automatique des 3 scans de découverte gratuits à l'inscription.
  - Décompte strict : Rapide (1 crédit), Standard (2 crédits), Approfondi (4 crédits).
  - Journal immuable de toutes les transactions (crédit, débit d'audit, date, cible, motif).
- [ ] **Issue 3.2 : Moteur de coupons et codes de recharge (`KX-XXXX`)**
  - Génération de bons de rechargement par l'administrateur pour vente directe ou partenariats locaux.
  - Validation instantanée avec attribution des crédits correspondants.
- [ ] **Issue 3.3 : Module de Parrainage & Affiliation Mobile Money**
  - Validation des demandes de code parrain personnalisé avec nom du titulaire et numéro de versement.
  - Calcul de la commission de 20 % sur les achats des filleuls avec période de mise en attente de 14 jours.
  - Prise en charge des opérateurs locaux de versement : Wave, Orange Money, MTN MoMo, Moov Money.
- [ ] **Issue 3.4 : Couche d'intégration de passerelle Mobile Money (CinetPay / FedaPay / Wave)**
  - Modèle d'API prêt à recevoir le webhook de notification de paiement dès l'ouverture des comptes marchands.

---

### Milestone 4 : Architecture de Données, Sécurité & Déploiement

- [ ] **Issue 4.1 : Persistance PostgreSQL & Schéma Relationnel**
  - Modèle relationnel complet : `users`, `scan_targets`, `scans`, `findings`, `transactions`, `referral_requests`, `vouchers`.
  - Migrations de base de données reproductibles.
- [ ] **Issue 4.2 : Sécurisation & Protection de l'Infrastructure**
  - Limitation du périmètre de scan pour interdire le scan d'adresses IP privées (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`) (prévention SSRF).
  - File d'attente asynchrone des scans pour éviter la surcharge du serveur.
- [ ] **Issue 4.3 : Configuration d'environnement (.env.example) & monitoring**
  - Variables documentées sans aucun secret en clair.

---

## 3. Architecture Technique du Système Réel

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR CLIENT                               │
│  React 19 + TypeScript + Tailwind CSS (Interface Kortex Defender)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Requêtes HTTPS / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SERVEUR EXPRESS (Node.js)                         │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐                  │
│  │ Authentification      │  │ Gestionnaire Crédits  │                  │
│  │ (Sessions, Hash, OTP) │  │ & Codes Recharges     │                  │
│  └───────────────────────┘  └───────────────────────┘                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           MOTEUR D'AUDIT EN DIRECT (Scanner Worker)              │  │
│  │  - Résolution DNS (Enregistrements A, MX, SPF, DMARC)            │  │
│  │  - Inspection TLS/SSL (Certificat, Chiffrement, Dates)           │  │
│  │  - Analyse En-têtes HTTP (CSP, HSTS, X-Frame, CORS)              │  │
│  │  - Détection Vulnérabilités & Corrélation CVE                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────┬────────────────┘
                        │                               │
                        ▼                               ▼
      ┌──────────────────────────────────┐   ┌───────────────────────────┐
      │     BASE DE DONNÉES SQL          │   │      CIBLE AUDITÉE        │
      │  (Utilisateurs, Cibles, Scans,   │   │  (Site ou API du client   │
      │   Rapports, Transactions)        │   │   avec attestation légale)│
      └──────────────────────────────────┘   └───────────────────────────┘
```

---

## 4. Prochaines Étapes Immédiates

1. **Validation du plan** par vos soins en cliquant sur le bouton **Proceed** ci-dessous.
2. **Implémentation de l'Étape 1 (Moteur d'Audit Réel)** : intégration du scanner réseau direct (DNS, SSL, en-têtes HTTP de sécurité et CVE) dans le backend Node.js pour produire de vrais rapports d'audit sur n'importe quel site réel testé.
