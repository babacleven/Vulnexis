# Kortex Defender · Backlog & Issues Prêtes pour GitHub / GitLab

Ce document répertorie l'ensemble des **16 issues techniques et fonctionnelles** prêtes à être créées sur votre gestionnaire de tickets (GitHub Issues, GitLab, Jira ou Trello) pour concevoir et déployer Kortex Defender en production réelle avec des technologies réelles, adaptées au contexte de la Côte d'Ivoire et de la zone UEMOA.

---

## Sommaire des Milestones

- [Milestone 1 : Moteur d'Audit de Sécurité Réel (Core Engine)](#milestone-1--moteur-daudit-de-sécurité-réel)
- [Milestone 2 : Authentification, Sécurité & Gestion des Utilisateurs](#milestone-2--authentification-sécurité--gestion-des-utilisateurs)
- [Milestone 3 : Modèle Économique, Crédits & Paiements Locaux FCFA](#milestone-3--modèle-économique-crédits--paiements-locaux-fcfa)
- [Milestone 4 : Base de Données, Sécurité & Déploiement](#milestone-4--base-de-données-sécurité--déploiement)

---

## Milestone 1 : Moteur d'Audit de Sécurité Réel

### Issue #1 : Module de sondage DNS et vérification des enregistrements de messagerie
- **Labels :** `backend`, `security`, `scanner`, `core`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Implémenter un module de diagnostic DNS interrogeant en direct les serveurs de noms faisant autorité pour une cible donnée (`target.url`).
- **Spécifications techniques :**
  - Utiliser l'API native `node:dns/promises` (`resolve4`, `resolve6`, `resolveMx`, `resolveTxt`, `resolveCaa`, `resolveNs`).
  - Vérifier la présence et la conformité des enregistrements anti-usurpation d'identité et de messagerie :
    - Enregistrement SPF (`v=spf1 ...`) : analyser la politique (`~all`, `-all`, `+all`).
    - Enregistrement DMARC (`_dmarc.domaine.com`) : analyser l'alignement (`p=reject`, `p=quarantine`, `p=none`).
    - Enregistrement CAA (Certificate Authority Authorization) : vérifier les autorités autorisées à émettre un certificat.
  - Détecter les serveurs DNS mal configurés ou les transferts de zone ouverts (AXFR check).
- **Critères d'acceptation :**
  - [ ] Les enregistrements A, AAAA, MX, TXT, NS, CAA sont résolus en moins de 3 secondes.
  - [ ] Une alerte de sévérité moyenne est générée si DMARC est absent ou sur `p=none`.
  - [ ] Une alerte de sévérité élevée est générée si SPF est manquant ou autorise tous les serveurs (`+all`).
  - [ ] Les preuves DNS sont intégrées au rapport d'audit.

---

### Issue #2 : Analyseur en direct de certificats SSL/TLS et suites cryptographiques
- **Labels :** `backend`, `security`, `ssl/tls`, `scanner`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Inspecter la chaîne de confiance TLS d'un nom de domaine en initiant une négociation TLS réelle.
- **Spécifications techniques :**
  - Utiliser le module `node:tls` pour initier une connexion sur le port 443 (ou port personnalisé).
  - Récupérer les métadonnées du certificat : sujet, émetteur (Let's Encrypt, DigiCert, Sectigo, Cloudflare), date de début, date d'expiration, SANs (Subject Alternative Names).
  - Calculer le nombre de jours restants avant expiration :
    - `< 7 jours` -> Alerte Élevée.
    - `< 30 jours` -> Alerte Faible / Avertissement.
    - Expiré ou autosigné -> Alerte Critique.
  - Vérifier la version du protocole négocié (TLS 1.2, TLS 1.3) et signaler les protocoles obsolètes ou vulnérables (SSLv3, TLS 1.0, TLS 1.1).
  - Vérifier la robustesse des suites de chiffrement (détection de ciphers RC4, 3DES, CBC faibles).
- **Critères d'acceptation :**
  - [ ] Le certificat est récupéré et analysé avec succès sur n'importe quel domaine public HTTPS.
  - [ ] Le score de l'audit est pénalisé si le certificat expire sous 14 jours ou est révoqué.
  - [ ] Les détails complets (émetteur, empreinte SHA256, algorithme de clé) sont restitués dans l'onglet *Cartographie & Infrastructure*.

---

### Issue #3 : Audit approfondi des en-têtes HTTP de sécurité et détection d'exposition
- **Labels :** `backend`, `security`, `http-headers`, `scanner`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Envoyer des requêtes HTTP et HTTPS réelles vers la cible pour inspecter les en-têtes de réponse et identifier les vulnérabilités de configuration web.
- **Spécifications techniques :**
  - Effectuer une requête `GET` et `HEAD` avec suivi contrôlé des redirections (max 5 redirections).
  - Contrôler systématiquement les en-têtes suivants :
    1. `Content-Security-Policy` (CSP) : absent, trop permissif (`unsafe-inline`, `unsafe-eval`, `*`).
    2. `Strict-Transport-Security` (HSTS) : absent, durée `max-age` < 1 an (31536000), absence de `includeSubDomains` et `preload`.
    3. `X-Frame-Options` / CSP `frame-ancestors` : protection contre le Clickjacking.
    4. `X-Content-Type-Options` : présence de `nosniff`.
    5. `Referrer-Policy` : politique de fuite de chemins d'URL (`strict-origin-when-cross-origin`).
    6. `Permissions-Policy` : restriction des API sensibles (caméra, micro, géolocalisation).
    7. `Access-Control-Allow-Origin` (CORS) : détection du wildcard non contrôlé `*` sur les requêtes authentifiées.
  - Détecter les en-têtes bavards divulguant la stack serveur (`Server`, `X-Powered-By`, `X-AspNet-Version`, `X-Runtime`).
- **Critères d'acceptation :**
  - [ ] Chaque en-tête manquant crée une fiche de vulnérabilité avec sévérité, explication didactique et exemple de directive de correction (Apache, Nginx, Express, Cloudflare).
  - [ ] La détection de `X-Powered-By: PHP/x.x` ou `Server: Apache/2.4.x` crée une vulnérabilité de divulgation d'information.

---

### Issue #4 : Cartographie passive et détection de sous-domaines exposés
- **Labels :** `backend`, `security`, `recon`, `subdomains`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Rechercher les sous-domaines existants et exposés pour la cible via l'historique des journaux de transparence de certificats (Certificate Transparency / crt.sh) et vérification DNS.
- **Spécifications techniques :**
  - Requêter l'API publique de Certificate Transparency `https://crt.sh/?q=%.domaine.com&output=json`.
  - Nettoyer et dédoublonner les noms d'hôtes découverts.
  - Tester la résolution DNS active de chaque sous-domaine trouvé pour ne conserver que les hôtes réellement vivants.
  - Identifier les sous-domaines sensibles ou oubliés (`staging.*`, `dev.*`, `test.*`, `vpn.*`, `admin.*`, `api.*`).
- **Critères d'acceptation :**
  - [ ] Liste des sous-domaines restituée avec leur statut (Actif / Inactif) et leur adresse IP résolue.
  - [ ] Les sous-domaines de développement ou de test ouverts sur Internet déclenchent une alerte de niveau Moyen.

---

### Issue #5 : Détection des technologies web et corrélation des CVE connues
- **Labels :** `backend`, `security`, `cve`, `fingerprinting`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Identifier les frameworks, CMS, bibliothèques JavaScript et serveurs applicatifs utilisés par la cible, puis rechercher les failles connues (CVE) associées.
- **Spécifications techniques :**
  - Fingerprinting passif : balises méta (`<meta name="generator">`), chemins d'accès caractéristiques (`/wp-admin`, `/wp-content`, `/api`, `/swagger`, `/actuator`), scripts JS identifiables (`jQuery`, `Vue`, `React`, `Bootstrap`).
  - Interrogation de bases de vulnérabilités CVE publiques fiables (Open Source Vulnerabilities / OSV.dev ou base NIST NVD).
  - Calcul du score CVSS v3.1 pour chaque faille confirmée.
- **Critères d'acceptation :**
  - [ ] Détection fiable des CMS majeurs (WordPress, Joomla, Drupal) et frameworks populaires (Next.js, Laravel, Django).
  - [ ] Affichage de la référence CVE (ex. `CVE-2024-xxxx`) avec description et lien vers le bulletin de sécurité officiel.

---

### Issue #6 : Protection anti-abus et prévention SSRF (Server-Side Request Forgery)
- **Labels :** `backend`, `security`, `firewall`, `compliance`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Sécuriser le moteur de scan pour empêcher tout utilisateur malveillant de cibler l'infrastructure interne, des adresses IP locales ou des plages réservées.
- **Spécifications techniques :**
  - Valider l'URL cible avant toute exécution de scan :
    - Bloquer les schémas non autorisés (`file://`, `ftp://`, `gopher://`, `dict://`). Seuls `http://` et `https://` sont acceptés.
    - Résoudre le nom d'hôte avant la requête et rejeter immédiatement :
      - `127.0.0.0/8` (Localhost).
      - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Réseaux privés).
      - `169.254.169.254` (Métadonnées cloud AWS/GCP/Azure).
      - `::1` et adresses IPv6 privées / link-local.
  - Imposer un timeout strict de 10 secondes par socket réseau pour éviter le blocage des workers.
- **Critères d'acceptation :**
  - [ ] Une tentative de scan vers `http://127.0.0.1` ou `http://192.168.1.1` est rejetée avec un message explicite d'interdiction.
  - [ ] Impossible de contourner la protection via DNS Rebinding.

---

### Issue #7 : Moteur d'export de rapports professionnels (HTML, PDF, JSON)
- **Labels :** `backend`, `frontend`, `reports`, `ux`
- **Milestone :** `M1 - Scanner Engine`
- **Description :**
  Permettre aux utilisateurs de télécharger un rapport complet d'audit de sécurité prêt à être transmis à leur direction, leur équipe technique ou leur client.
- **Spécifications techniques :**
  - Export JSON brut pour intégration dans les pipelines CI/CD des développeurs.
  - Export HTML autonome contenant la synthèse exécutive, la répartition par sévérité (Critique, Élevée, Moyenne, Faible), la liste des sous-domaines et les fiches détaillées avec correctifs de code.
  - Feuille de style CSS print optimisée pour impression propre en PDF au format A4.
- **Critères d'acceptation :**
  - [ ] Les boutons *Télécharger HTML*, *Export JSON* et *Imprimer le rapport* fonctionnent sans erreur sur les scans terminés.
  - [ ] Le document imprimé affiche le logo Kortex Defender, la cible, la date d'exécution, le score /100 et le détail de chaque vulnérabilité.

---

## Milestone 2 : Authentification, Sécurité & Gestion des Utilisateurs

### Issue #8 : Authentification par Email et mot de passe sécurisé avec sessions HTTP-only
- **Labels :** `backend`, `auth`, `security`
- **Milestone :** `M2 - Auth & Accounts`
- **Description :**
  Créer un système d'authentification robuste avec hachage sécurisé des mots de passe et gestion de session sans fuite de token côté client.
- **Spécifications techniques :**
  - Hachage des mots de passe avec `bcrypt` (facteur de coût $\ge 12$) ou `argon2id`.
  - Génération de cookies de session sécurisés signés :
    - `HttpOnly: true` (inaccessible au JavaScript client pour prévenir les vols de session via XSS).
    - `Secure: true` (uniquement transmis sur HTTPS).
    - `SameSite: 'Lax'` (protection contre les requêtes inter-sites CSRF).
  - Validation stricte des données d'entrée (email RFC 5322, complexité minimale du mot de passe : 8 caractères, au moins 1 chiffre et 1 symbole).
  - Rate limiting sur les endpoints `/api/auth/login` et `/api/auth/register` (max 5 tentatives par IP par tranche de 15 minutes).
- **Critères d'acceptation :**
  - [ ] Inscription, connexion et déconnexion fonctionnent de façon fluide.
  - [ ] Les mots de passe ne sont jamais stockés ni journalisés en clair.
  - [ ] L'accès aux pages protégées (`/dashboard`, `/targets`, `/scans`, etc.) est strictement restreint aux sessions actives.

---

### Issue #9 : Module de vérification WhatsApp OTP / SMS pour l'Afrique de l'Ouest
- **Labels :** `backend`, `auth`, `whatsapp`, `west-africa`
- **Milestone :** `M2 - Auth & Accounts`
- **Description :**
  Proposer la vérification du compte par WhatsApp OTP ou SMS pour sécuriser les comptes et garantir des numéros de téléphone réels pour les notifications de vulnérabilités.
- **Spécifications techniques :**
  - Formatage et normalisation des numéros de téléphone au standard E.164 (`+225` pour la Côte d'Ivoire, `+221` pour le Sénégal, `+229` pour le Bénin, etc.).
  - Génération d'un code OTP cryptographiquement sûr à 6 chiffres, valable 5 minutes, avec un maximum de 3 essais.
  - Architecture en adaptateur de service :
    - `DevProvider` : affiche le code dans la console ou le renvoie en mode simulation pour le développement local sans coût de SMS.
    - `TwilioWhatsAppProvider` / `InfobipProvider` / passerelle SMS locale pour l'envoi réel en production.
- **Critères d'acceptation :**
  - [ ] La modale de vérification OTP s'affiche lors de l'inscription avec compte à rebours de 5 minutes.
  - [ ] Saisie automatique ou champ à 6 chiffres avec validation immédiate.
  - [ ] Possibilité de renvoyer le code après 60 secondes d'attente.

---

### Issue #10 : Registre légal des attestations d'autorisation de scan horodatées
- **Labels :** `backend`, `legal`, `security`, `compliance`
- **Milestone :** `M2 - Auth & Accounts`
- **Description :**
  Garantir la conformité juridique du service d'audit de sécurité en journalisant formellement chaque attestation de propriété ou d'autorisation écrite déposée par un utilisateur.
- **Spécifications techniques :**
  - Table SQL `target_authorizations` liée à `users` et `scan_targets`.
  - Champs obligatoires stockés :
    - `target_id` (UUID).
    - `user_id` (UUID).
    - `ip_address` (adresse IPv4/IPv6 réelle du client capturée au moment de la signature).
    - `user_agent` (navigateur et système d'exploitation).
    - `attestation_text` (texte intégral des conditions acceptées).
    - `timestamp` (horodatage ISO 8601 UTC certifié).
  - Impossibilité absolue de lancer un scan sur une cible si aucune attestation active n'est enregistrée.
- **Critères d'acceptation :**
  - [ ] Le formulaire d'ajout d'application refuse la création si la case d'attestation n'est pas cochée.
  - [ ] Chaque cible enregistre son attestation immuable en base de données.
  - [ ] L'attestation est consultable dans la page de détails de l'application.

---

## Milestone 3 : Modèle Économique, Crédits & Paiements Locaux FCFA

### Issue #11 : Système de portefeuille de crédits et moteur de codes cadeaux / recharges (`KX-XXXX`)
- **Labels :** `backend`, `billing`, `credits`, `ux`
- **Milestone :** `M3 - Billing & Economy`
- **Description :**
  Gérer le solde de crédits des comptes clients, la dotation initiale de bienvenue (3 scans gratuits) et l'activation de coupons de recharge.
- **Spécifications techniques :**
  - Créditer automatiquement 3 scans gratuits de découverte à la création d'un compte.
  - Décompte unitaire par profil d'audit :
    - Profil Rapide = 1 crédit.
    - Profil Standard = 2 crédits.
    - Profil Approfondi = 4 crédits.
  - Donner la priorité aux scans gratuits pour les profils Rapide et Standard.
  - Module de gestion des codes de recharge :
    - Format normalisé : `KX-XXXX-XXXX-XXXX` (génération aléatoire cryptographique base32).
    - Paramètres des codes : valeur en crédits, date d'expiration, statut (actif, consommé), utilisateur ayant consommé le code.
  - Journalisation de chaque mouvement dans une table de transactions (`delta`, `reason`, `note`, `date`).
- **Critères d'acceptation :**
  - [ ] Le solde dans le header (`0 crédit | 2 gratuits`) s'actualise instantanément après un scan ou une recharge.
  - [ ] La saisie d'un code valide dans la page *Crédits & offres* ajoute immédiatement les crédits et marque le code comme utilisé.
  - [ ] L'historique des transactions affiche clairement chaque crédit et débit avec date et motif.

---

### Issue #12 : Module d'affiliation et parrainage adapté au Mobile Money local
- **Labels :** `backend`, `frontend`, `parrainage`, `mobile-money`
- **Milestone :** `M3 - Billing & Economy`
- **Description :**
  Permettre aux développeurs et créateurs de contenu de devenir parrains de Kortex Defender, de générer un code promo personnalisé et de percevoir leurs commissions par Mobile Money.
- **Spécifications techniques :**
  - Formulaire de demande de parrainage :
    - Code promo souhaité (alphanumérique, 4 à 12 caractères).
    - Nom complet certifié (titulaire légal du compte Mobile Money).
    - Opérateur de versement : Wave, Orange Money, MTN MoMo, Moov Money.
    - Numéro de téléphone de versement.
    - Validation des 5 conditions d'interdiction d'auto-parrainage et de fraude.
  - Règle de rémunération :
    - Réduction pour le filleul : -30 % sur les packs de crédits payants.
    - Commission du parrain : 20 % du montant payé en FCFA.
    - Délai de séquestre : 14 jours avant validation de la commission.
    - Seuil de déclenchement du paiement : minimum 2 000 FCFA.
- **Critères d'acceptation :**
  - [ ] Le formulaire de demande valide l'éligibilité et enregistre la demande dans la base de données.
  - [ ] L'utilisateur reçoit une confirmation visuelle claire indiquant la validation sous 24h par l'équipe Kortex.

---

### Issue #13 : Couche d'abstraction et passerelle de paiement Mobile Money en FCFA
- **Labels :** `backend`, `payments`, `mobile-money`, `west-africa`
- **Milestone :** `M3 - Billing & Economy`
- **Description :**
  Préparer l'architecture de paiement pour intégrer un agrégateur de paiement Mobile Money (CinetPay, FedaPay, Wave Business ou MoneyFusion) dès que les comptes marchands sont validés.
- **Spécifications techniques :**
  - Créer un contrôleur de paiement standardisé `PaymentGatewayInterface` avec les méthodes :
    - `initiatePayment(userId, amount, currency, packName, customerPhone)`
    - `verifyPayment(transactionId)`
    - `handleWebhook(payload, signature)`
  - Définir les 4 packs officiels en FCFA :
    - *Essentiel* : 1 000 FCFA (10 crédits).
    - *Starter* : 2 000 FCFA (20 crédits).
    - *Premium* : 5 000 FCFA / mois (60 crédits + Agent Kortex inclus).
    - *Premium Plus* : Sur devis entreprise.
  - Route sécurisée de webhook `/api/k/payments/webhook` avec validation de signature HMAC pour créditer automatiquement le compte client lors de la réception du paiement Mobile Money.
- **Critères d'acceptation :**
  - [ ] En mode simulation actuelle, un clic sur *Acheter* permet de tester le flux complet d'attribution des crédits.
  - [ ] Dès réception des clés d'API (CinetPay / Wave / FedaPay), le basculement vers les paiements réels se fait sans modifier la structure des tables ni l'interface.

---

## Milestone 4 : Base de Données, Sécurité & Déploiement

### Issue #14 : Conception du schéma de base de données relationnelle et migrations SQL
- **Labels :** `backend`, `database`, `postgresql`, `prisma`
- **Milestone :** `M4 - Database & DevOps`
- **Description :**
  Remplacer le stockage mémoire actuel par une base de données relationnelle PostgreSQL robuste, garantissant la persistance des comptes, cibles, audits et transactions.
- **Spécifications techniques :**
  - Définir les tables relationnelles suivantes :
    - `users` (id, email, password_hash, phone, credits, free_scans, is_admin, created_at, updated_at).
    - `scan_targets` (id, user_id, name, url, target_type, authorized, authorized_at, last_score, created_at).
    - `target_authorizations` (id, target_id, user_id, ip_address, user_agent, terms_version, signed_at).
    - `scans` (id, user_id, target_id, target_url, profile, status, progress, phase, score, duration_seconds, counts_json, log_lines_json, subdomains_json, created_at, completed_at).
    - `findings` (id, scan_id, title, severity, category, cvss, description, impact, remediation, proof, component, url).
    - `credit_transactions` (id, user_id, delta, kind, reason, scan_id, note, created_at).
    - `vouchers` (id, code, credits_amount, is_used, used_by_user_id, expires_at, created_at).
    - `parrain_requests` (id, user_id, promo_code, full_name, operator, phone_number, status, created_at).
    - `notifications` (id, user_id, title, message, read, link, created_at).
  - Configurer les clés étrangères, indexations sur les URLs, statuts et dates pour des requêtes en moins de 10 ms.
- **Critères d'acceptation :**
  - [ ] Schéma SQL déployable avec Prisma ou Drizzle ORM.
  - [ ] Migrations idempotentes et jeux de données de test (seeds) configurés.

---

### Issue #15 : File d'attente asynchrone des scans et worker d'exécution
- **Labels :** `backend`, `architecture`, `queues`, `performance`
- **Milestone :** `M4 - Database & DevOps`
- **Description :**
  Découpler le serveur d'API des tâches lourdes d'audit réseau pour éviter tout blocage du serveur Express lorsque plusieurs scans sont lancés en parallèle.
- **Spécifications techniques :**
  - Mettre en place un orchestrateur de file d'attente (BullMQ / PgBoss ou queue worker en tâche de fond).
  - Gestion des états du scan : `queued` -> `running` -> `completed` ou `failed`.
  - Notification en temps réel de la progression (`0%` à `100%`) et des étapes (`Cartographie`, `SSL/TLS`, `En-têtes HTTP`, `CVE`, `Terminé`).
  - Gestion des erreurs et des annulations avec remboursement automatique du crédit en cas d'échec réseau imprévu.
- **Critères d'acceptation :**
  - [ ] Le lancement d'un scan renvoie une réponse HTTP 201 en moins de 100 ms et passe la tâche en tâche de fond.
  - [ ] L'interface utilisateur affiche en direct les logs d'exécution et la barre de progression.
  - [ ] Si la cible est injoignable, le scan passe en `failed` sans bloquer le serveur et les crédits sont restitués.

---

### Issue #16 : Agent Kortex (Conseiller Sécurité IA adapté à la stack)
- **Labels :** `ai`, `agent`, `premium`, `remediation`
- **Milestone :** `M4 - Database & DevOps`
- **Description :**
  Activer l'Agent Kortex pour les abonnés de l'offre Premium (5 000 FCFA / mois) afin d'expliquer chaque faille détectée dans un langage clair et de générer le code exact de correction adapté au framework de l'utilisateur.
- **Spécifications techniques :**
  - Utilisation du SDK `@google/genai` (modèle `gemini-2.5-flash`).
  - Fournir en entrée les vulnérabilités réelles détectées, les en-têtes manquants et les technologies identifiées.
  - Générer des correctifs précis prêts à copier-coller (ex. configuration `.htaccess` pour Apache, bloc `server` pour Nginx, middleware de sécurité Helmet pour Express, fichier `next.config.js` pour Next.js).
- **Critères d'acceptation :**
  - [ ] L'agent n'est accessible qu'aux comptes disposant de l'offre Premium ou de crédits dédiés.
  - [ ] Les explications sont concises, sans jargon superflu et directement exploitables par un développeur.

---

## 5. Synthèse & Tableau Récapitulatif

| N° | Titre de l'Issue | Priorité | Domaine | Estimation |
|---|---|---|---|---|
| **#1** | Module de sondage DNS & SPF/DMARC | Haute | Sécurité Réseau | 2 jours |
| **#2** | Inspecteur de certificats SSL/TLS en direct | Haute | Cryptographie | 2 jours |
| **#3** | Audit en direct des en-têtes HTTP de sécurité | Haute | Sécurité Web | 2 jours |
| **#4** | Cartographie des sous-domaines via crt.sh | Moyenne | Reconnaissance | 2 jours |
| **#5** | Détection de technologies & CVE | Haute | Vulnérabilités | 3 jours |
| **#6** | Protection anti-abus et prévention SSRF | Critique | Sécurité Infra | 1 jour |
| **#7** | Générateur de rapports professionnels (HTML/PDF/JSON) | Haute | Reporting | 2 jours |
| **#8** | Auth Email + Mot de passe haché (bcrypt/sessions) | Critique | Authentification | 2 jours |
| **#9** | Passerelle de vérification WhatsApp / SMS OTP | Moyenne | Télécom UEMOA | 3 jours |
| **#10** | Registre d'attestation de propriété légale | Critique | Conformité | 1 jour |
| **#11** | Portefeuille de crédits & codes coupons (`KX-XXXX`) | Haute | Monétisation | 2 jours |
| **#12** | Système de parrainage & versements Mobile Money | Moyenne | Croissance | 2 jours |
| **#13** | Couche d'abstraction paiements FCFA (Wave/Orange/MTN/Moov) | Haute | Paiements | 3 jours |
| **#14** | Base de données PostgreSQL relationnelle | Critique | Persistance | 3 jours |
| **#15** | Queue de traitement asynchrone des scans | Haute | Architecture | 3 jours |
| **#16** | Agent Kortex IA pour correctifs sur mesure | Moyenne | IA / Remédiation | 2 jours |
