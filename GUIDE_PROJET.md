# Guide Complet d'Architecture & Fonctionnement · Kortex Defender

Bienvenue dans le guide détaillé de **Kortex Defender**. Ce document a été rédigé pour vous expliquer de manière simple, claire et structurée **où se trouve chaque élément dans le code**, **quel fichier fait quoi**, **comment les données circulent** et **comment faire évoluer le projet**.

---

## Sommaire

1. [Vue d'Ensemble & Vision](#1-vue-densemble--vision)
2. [Où est quoi ? (Cartographie des Fichiers)](#2-où-est-quoi--cartographie-des-fichiers)
3. [Détail des Pages Frontend (`src/pages/`)](#3-détail-des-pages-frontend-srcpages)
4. [Composants Clés & Contexte Global (`src/components/` & `src/context/`)](#4-composants-clés--contexte-global)
5. [Le Backend Express (`server.ts`)](#5-le-backend-express-serverts)
6. [Parcours des Données (Data Flow) en Exemples Réels](#6-parcours-des-données-data-flow-en-exemples-réels)
7. [Guide Pratique : Comment Modifier le Projet ?](#7-guide-pratique--comment-modifier-le-projet)
8. [Commandes Utiles & Environnement](#8-commandes-utiles--environnement)

---

## 1. Vue d'Ensemble & Vision

Kortex Defender est une application **Full-Stack** (Frontend React 19 + Backend Node.js Express) conçue comme un produit SaaS complet de cybersécurité pour les entreprises et développeurs :

- **Le problème résolu :** La plupart des outils de cybersécurité internationaux sont en anglais, payables uniquement en devises étrangères (carte bancaire en dollars/euros) et trop complexes à comprendre pour une PME.
- **La solution Kortex Defender :** Une interface épurée, intuitive, rédigée en français, avec une tarification en **Francs CFA (XOF)**, la prise en charge des paiements et versements par **Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money)**, et des rapports de sécurité faciles à comprendre avec du code correctif prêt à l'emploi.

---

## 2. Où est quoi ? (Cartographie des Fichiers)

Voici la carte complète du projet avec le rôle précis de chaque dossier et fichier clé :

```text
kortex-defender/
│
├── server.ts                  <-- [BACKEND] Le cœur du serveur Express, l'API et le moteur de scan
├── index.html                 <-- [HTML] Point d'entrée web (titre, méta SEO, polices Google Outfit & Roboto Flex)
├── package.json               <-- [CONFIG] Dépendances npm et scripts de lancement
├── vite.config.ts             # Configuration du compilateur Vite et Tailwind CSS v4
├── tsconfig.json              # Règles de typage TypeScript
├── ISSUES.md                  # Backlog des 16 tickets pour le déploiement en production réelle
├── README.md                  # Documentation technique générale du projet
├── GUIDE_PROJET.md            # Ce guide explicatif complet
│
├── public/                    # Fichiers publics accessibles directement par le navigateur
│   └── kortex-logo.svg        # Logo vectoriel officiel de Kortex Defender
│
└── src/                       # [FRONTEND] Tout le code de l'interface utilisateur React
    │
    ├── main.tsx               # Démarre l'application React et monte <App /> dans le DOM
    ├── App.tsx                # Le ROUTEUR : décide quelle page afficher selon l'URL
    ├── index.css              # Les styles CSS globaux et les tokens de design Tailwind v4
    ├── types.ts               # Les contrats de données TypeScript (User, Target, Scan, Finding...)
    │
    ├── context/               # Gestion de l'état global partagé dans toute l'application
    │   └── AuthContext.tsx    # Gère l'utilisateur connecté, la session et le solde de crédits
    │
    ├── components/            # Composants graphiques réutilisables
    │   ├── AppLayout.tsx      # Le cadre du tableau de bord : barre latérale (sidebar) + barre du haut (header)
    │   └── Icons.tsx          # Toutes les icônes SVG officielles du site
    │
    └── pages/                 # Les écrans (vues) de l'application
        ├── LandingPage.tsx    # Page d'accueil publique (vitrine, simulateur, tarifs)
        ├── AuthPage.tsx       # Connexion, Inscription et validation du code WhatsApp OTP
        ├── DashboardPage.tsx  # "Vue d'ensemble" : métriques clés, étapes de démarrage, derniers scans
        ├── TargetsPage.tsx    # "Mes applications" : liste des sites déclarés et formulaire d'ajout
        ├── TargetDetailPage.tsx # Détails d'une application spécifique et historique de ses scans
        ├── ScansPage.tsx      # "Scans" : liste de tous les audits réalisés avec filtres
        ├── NewScanPage.tsx    # "Lancer un scan" : choix de la cible et sélection du profil
        ├── ScanDetailPage.tsx # Rapport détaillé d'audit (score /100, failles, logs, exports)
        ├── CreditsPage.tsx    # "Crédits & offres" : solde, codes cadeaux KX, packs FCFA et historique
        ├── AgentPage.tsx      # "Agent Kortex" : présentation du copilote sécurité IA
        ├── ParrainagePage.tsx # "Parrainage" : formulaire d'affiliation et coordonnées Mobile Money
        ├── SettingsPage.tsx   # "Compte" : informations du profil et déconnexion
        └── TermsPage.tsx      # "Conditions d'utilisation" : texte juridique officiel
```

---

## 3. Détail des Pages Frontend (`src/pages/`)

Chaque fichier du dossier `src/pages/` correspond à une page ou une fonctionnalité du site.

### 1. `LandingPage.tsx` (Page d'Accueil Publique : `/`)
- **Ce qu'elle fait :** C'est la vitrine commerciale du produit pour les visiteurs qui ne sont pas encore connectés.
- **Ce qu'on y trouve :**
  - Un simulateur interactif d'audit dans la bannière principale (l'utilisateur tape une URL et voit une démonstration d'analyse).
  - Les statistiques clés : *15 contrôles automatisés*, *6 catégories de risques*, *3 minutes par audit*.
  - Les 3 étapes de fonctionnement du service.
  - La grille des fonctionnalités majeures.
  - La démo visuelle d'un rapport de score réel (72/100).
  - La grille tarifaire officielle en FCFA.
  - La section d'appel à l'action avec l'offre de bienvenue (3 scans gratuits).

### 2. `AuthPage.tsx` (Authentification : `/login` et `/register`)
- **Ce qu'elle fait :** Permet à l'utilisateur de se connecter à son compte ou d'en créer un nouveau.
- **Ce qu'on y trouve :**
  - Une mise en page sombre à deux colonnes avec le rappel des avantages Kortex Defender sur la gauche.
  - Formulaire d'inscription : Email, mot de passe, numéro de téléphone WhatsApp (avec indicatifs internationaux comme `+225`), et acceptation obligatoire des conditions d'utilisation.
  - Modale de validation WhatsApp OTP : affiche un chronomètre de 5 minutes pour saisir le code à 6 chiffres envoyé au nouvel inscrit.

### 3. `DashboardPage.tsx` (Vue d'ensemble : `/dashboard`)
- **Ce qu'elle fait :** L'écran d'accueil dès que l'utilisateur est connecté.
- **Ce qu'on y trouve :**
  - **4 cartes métriques en haut :**
    1. *Scans réalisés* (nombre total d'audits effectués).
    2. *Applications* (nombre total de sites déclarés et nombre d'applications autorisées).
    3. *Crédits* (solde de crédits disponibles).
    4. *Scans gratuits restants* (nombre de scans de découverte offerts).
  - **Bloc noir "Bien démarrer" :** Un guide interactif en 3 étapes (*1. Ajoutez votre application*, *2. Autorisez le scan*, *3. Lancez votre premier scan*) avec un bouton `Ajouter ->`.
  - **Derniers scans :** Le tableau des scans récents avec un lien vers *Tout l'historique*.
  - **Vulnérabilités du dernier scan terminé :** Synthèse visuelle des failles classées par niveau de criticité.

### 4. `TargetsPage.tsx` (Mes applications : `/targets`)
- **Ce qu'elle fait :** Gérer les sites web et API que l'utilisateur a le droit d'auditer.
- **Ce qu'on y trouve :**
  - **État vide :** Si aucune application n'a encore été ajoutée, un encadré propre indique *Aucune application* avec un bouton central *Ajouter une application*.
  - **Formulaire d'ajout en ligne :**
    - Champ *Nom* (ex. "Mon site vitrine").
    - Champ *URL* (ex. `https://monsite.ci`).
    - Menu déroulant *Type* (`Site web`, `API REST`, `GraphQL`).
    - **Cadre d'attestation légale :** Case à cocher obligatoire certifiant sur l'honneur être propriétaire de la cible avec mention de l'horodatage et de l'enregistrement de l'adresse IP.
  - **Tableau des applications :** Si des cibles existent, affiche l'URL, le type, le badge vert `Autorisé`, le nombre de scans, le dernier score et les boutons d'action (*Scanner*, *Détails*, *Supprimer*).

### 5. `TargetDetailPage.tsx` (Détail d'une application : `/targets/:id`)
- **Ce qu'elle fait :** Affiche la fiche technique d'une cible précise, la date d'ajout, son statut d'autorisation légale (avec possibilité de retirer ou ré-attester), et la liste exclusive des audits passés sur cette cible.

### 6. `ScansPage.tsx` (Historique des scans : `/scans`)
- **Ce qu'elle fait :** Liste tous les audits de sécurité réalisés par l'utilisateur.
- **Ce qu'on y trouve :**
  - Deux menus déroulants de filtrage en haut : *Statut* (`Tous`, `En cours`, `Terminé`, `Échoué`) et *Application* (`Toutes` ou filtre par cible).
  - Si aucun scan n'existe, l'état vide officiel est affiché avec le bouton `Lancer un scan`.
  - Si des scans existent, un tableau liste la cible, le profil choisi, le statut, le score /100, les pastilles de failles (`2H`, `4M`, `7L`), la date et un bouton pour ouvrir le rapport.

### 7. `NewScanPage.tsx` (Lancer un scan : `/scans/new`)
- **Ce qu'elle fait :** Configurer et démarrer un audit de sécurité.
- **Ce qu'on y trouve :**
  - **Condition d'accès :** Si l'utilisateur n'a aucune application autorisée, la page affiche l'encadré *Aucune application autorisée* avec un bouton redirigeant vers *Mes applications*.
  - **Configuration du scan (si des cibles existent) :**
    1. Sélection de l'application à auditer dans un menu déroulant.
    2. Choix du profil parmi les 3 cartes interactives :
       - **Rapide (1 crédit)** : en-têtes HTTP et certificat TLS (~1-2 min).
       - **Standard (2 crédits)** : reconnaissance complète, CVE, fuites JS et sous-domaines (~3-5 min).
       - **Approfondi (4 crédits)** : cartographie exhaustive et endpoints d'API (~10-15 min).
    3. Décompte automatique : utilise en priorité les scans gratuits de découverte si disponibles, sinon déduit les crédits du compte.
    4. Bouton de lancement `Lancer le scan`.

### 8. `ScanDetailPage.tsx` (Rapport d'audit : `/scans/:id`)
- **Ce qu'elle fait :** L'écran le plus important pour les résultats de sécurité.
- **Ce qu'on y trouve :**
  - **Pendant l'exécution du scan :** Une barre de progression en temps réel (0 % à 100 %), les étapes visuelles franchies (*Initialisation*, *Cartographie*, *Reconnaissance*, *Validation*, *Terminé*), et un terminal noir affichant le journal d'exécution en direct.
  - **Une fois le scan terminé :**
    - En-tête avec boutons d'action : `Télécharger HTML`, `Export JSON`, `Imprimer le rapport`.
    - Cadran circulaire du score de sécurité sur 100 avec indicateur de couleur.
    - 4 compteurs cliquables par niveau de risque : **Critique** (rouge foncé), **Élevée** (orange), **Moyenne** (jaune), **Faible** (bleu).
    - 3 onglets de navigation :
      1. *Vulnérabilités & Correctifs* : fiches détaillées de chaque faille avec le score CVSS, la description, l'élément de preuve technique détecté sur la cible, et l'encadré vert avec le correctif de code recommandé.
      2. *Cartographie & Infrastructure* : liste des sous-domaines découverts avec pastille `Actif`, statut des protocoles TLSv1.2/TLSv1.3 et en-tête HSTS.
      3. *Journal d'exécution* : log technique complet de l'audit horodaté.

### 9. `CreditsPage.tsx` (Crédits & offres : `/credits`)
- **Ce qu'elle fait :** Gérer le solde, recharger son compte et acheter des packs.
- **Ce qu'on y trouve :**
  - **Carte Solde :** Affiche le nombre de crédits disponibles, le nombre de scans gratuits restants et le rappel du barème de décompte (Rapide 1 · Standard 2 · Approfondi 4).
  - **Carte Utiliser un code crédit :** Champ pour saisir un code cadeau ou une carte de recharge au format `KX-XXXX-XXXX-XXXX` avec bouton `Valider`.
  - **Section Offres :**
    - Mention officielle du paiement sécurisé par Mobile Money (Orange Money, MTN, Moov, Wave).
    - Champs facultatifs : Numéro Mobile Money et Code promo parrain.
    - **Grille des 5 packs :** Free (0 F), Essentiel (1 000 F), Starter (2 000 F), Premium (5 000 F / mois), Premium Plus (sur devis).
  - **Tableau Crédits actifs :** Liste l'origine de vos crédits (ex. *Offert à l'inscription*), le type (*Scans gratuits*), le restant (*2 / 3*) et la date d'expiration (*Jamais*).
  - **Tableau Historique :** Journal de toutes les opérations de débit et de crédit horodatées.

### 10. `AgentPage.tsx` (Agent Kortex : `/agent`)
- **Ce qu'elle fait :** Présente l'Agent Kortex (votre analyste sécurité personnel piloté par l'IA), inclus dans l'offre Premium à 5 000 FCFA / 30 jours, avec les 3 missions autonomes qu'il accomplit et un bouton `Passer en Premium`.

### 11. `ParrainagePage.tsx` (Parrainage : `/parrainage`)
- **Ce qu'elle fait :** Permet aux utilisateurs de monétiser leur réseau en devenant parrains Kortex.
- **Ce qu'on y trouve :**
  - Explication du gain : le filleul a **-30 %** avec le code, et le parrain touche **20 % de commission** en argent réel sur chaque achat pendant 12 mois.
  - Formulaire de candidature : Code promo souhaité (ex. `SHALOM`), Nom complet du titulaire, Opérateur de versement (`Wave`, `Orange Money`, `MTN MoMo`, `Moov Money`), Numéro de téléphone.
  - Encadré des 5 conditions officielles anti-fraude.
  - Case à cocher obligatoire certifiant que le numéro de versement est au nom du demandeur.
  - Bouton `Envoyer ma demande`.

### 12. `SettingsPage.tsx` (Compte : `/settings`)
- **Ce qu'elle fait :** Récapitule les informations du profil utilisateur connecté (adresse email, numéro WhatsApp, type de compte, date d'inscription) et propose le bouton `Se déconnecter`.

### 13. `TermsPage.tsx` (Conditions d'utilisation : `/terms`)
- **Ce qu'elle fait :** Contient le texte juridique complet en 7 articles daté du 23 octobre 2026, encadrant la légalité des audits, l'attestation de propriété obligatoire, l'exonération de responsabilité et la protection des données.

---

## 4. Composants Clés & Contexte Global

### `src/components/AppLayout.tsx` (La structure de l'application connectée)
C'est le composant qui enveloppe toutes les pages du tableau de bord. Il gère :
1. **La barre latérale gauche (Sidebar) :**
   - Le logo officiel Kortex Defender en haut.
   - Le bouton noir `+ Nouveau scan` pour démarrer un audit en 1 clic.
   - Les 7 liens de navigation : *Vue d'ensemble*, *Mes applications*, *Scans*, *Crédits & offres*, *Agent Kortex*, *Parrainage*, *Compte*.
   - Le bas de la barre latérale avec l'email de l'utilisateur connecté et le bouton `Se déconnecter`.
   - Le mode responsive mobile avec bouton tiroir (hamburger).
2. **La barre du haut (Header) :**
   - La cloche de notifications avec compteur rouge des alertes non lues et menu déroulant.
   - La pastille de solde cliquable : icône pièce, nombre de crédits en noir, et pastille verte avec les scans gratuits restants (ex. `0 crédit | 2 gratuits`). Un clic dessus emmène directement à la page des crédits.

### `src/context/AuthContext.tsx` (La mémoire de l'application)
C'est le cerveau de l'application côté navigateur. Grâce au `useAuth()`, n'importe quelle page peut savoir :
- Si l'utilisateur est connecté (`user`).
- Son solde de crédits et de scans gratuits en temps réel (`creditsData`).
- Exécuter une connexion (`login`), une inscription (`register`) ou une déconnexion (`logout`).
- Rafraîchir les données du profil dès qu'un scan est lancé ou qu'un code est utilisé (`refreshUser()`).

### `src/types.ts` (Les modèles de données)
Définit rigoureusement la forme des données pour éviter les bugs :
- `ScanTarget` : ID, nom, URL, type (`web`, `api`, `graphql`), autorisation (`true`/`false`), dernier score.
- `Scan` : ID, statut (`queued`, `running`, `completed`, `failed`), progression (0 à 100), score, liste des failles, logs, sous-domaines.
- `Finding` : titre de la faille, sévérité (`critical`, `high`, `medium`, `low`, `info`), score CVSS, description, preuve, remédiation.
- `TransactionItem` : date, montant, type (`credit`, `free_scan`), motif.

---

## 5. Le Backend Express (`server.ts`)

Le fichier `server.ts` est le serveur Node.js qui alimente l'ensemble de l'application sur le port **3000**.

### Rôles majeurs de `server.ts` :
1. **Intégration Vite :** En mode développement, il monte les middlewares Vite pour compiler le code React instantanément sans rechargement complet de la page.
2. **Base de données en mémoire (`DB`) :**
   - Contient les tableaux `users`, `targets`, `scans`, `transactions`, `notifications`.
   - Initialisé avec le compte par défaut `babaaristote6@gmail.com` (0 crédit, 2 scans gratuits, cibles vides et scans vides pour correspondre fidèlement à votre compte de référence).
3. **Moteur d'Authentification :**
   - Gère les cookies signés `kortex_session` pour identifier l'utilisateur sur chaque requête.
4. **Moteur de Simulation & Exécution de Scans :**
   - Lorsqu'un scan est créé (`POST /api/k/scans`), une tâche asynchrone est déclenchée.
   - Toutes les 2 secondes, le statut progresse (`15%` -> `35%` -> `60%` -> `85%` -> `100%`).
   - Le moteur inspecte la cible, génère des journaux techniques réalistes, identifie les failles de sécurité avec des valeurs CVSS réelles et calcule le score final sur 100.
5. **Gestionnaire de Transactions & Crédits :**
   - Déduit automatiquement les crédits ou le scan gratuit lors du démarrage d'un audit.
   - Enregistre une ligne dans l'historique des transactions.
   - Gère la validation des codes de recharge (`POST /api/k/credits/redeem`).

---

## 6. Parcours des Données (Data Flow) en Exemples Réels

### Exemple 1 : Que se passe-t-il quand l'utilisateur lance un scan ?

```
[Utilisateur sur /scans/new]
       │
       │ 1. Choix de la cible et du profil (ex: Standard = 2 crédits)
       │ 2. Clic sur "Lancer le scan"
       ▼
[Frontend: NewScanPage.tsx]
       │
       │ Envoi d'une requête HTTP POST vers /api/k/scans
       │ avec { target_id: "...", profile: "standard" }
       ▼
[Backend: server.ts]
       │
       │ 1. Vérifie si la cible est bien autorisée (attestation valide).
       │ 2. Vérifie le solde : l'utilisateur a 2 scans gratuits restants -> déduit 1 scan gratuit.
       │ 3. Enregistre une transaction dans l'historique : "-1 scan gratuit".
       │ 4. Crée le scan avec le statut "running", progress: 0%.
       │ 5. Démarre le worker d'audit en arrière-plan.
       │ 6. Renvoie l'ID du scan au client (ex: { id: "scan_abc123" }).
       ▼
[Frontend: NewScanPage.tsx]
       │
       │ Redirige immédiatement l'utilisateur vers /scans/scan_abc123
       ▼
[Frontend: ScanDetailPage.tsx]
       │
       │ Interroge l'API toutes les 2,5 secondes (polling).
       │ Affiche la barre de progression en temps réel et les logs qui défilent.
       │ Dès que progress = 100%, affiche le rapport d'audit complet avec les failles !
```

---

### Exemple 2 : Que se passe-t-il quand l'utilisateur active un code crédit ?

```
[Utilisateur sur /credits]
       │
       │ Tape un code (ex: "KX-BONUS-2026") dans le champ
       │ et clique sur "Valider"
       ▼
[Backend: server.ts]
       │
       │ Reçoit la requête POST /api/k/credits/redeem
       │ 1. Valide le format du code.
       │ 2. Ajoute 10 crédits au solde de l'utilisateur.
       │ 3. Enregistre la transaction : "+10 crédits (Code activé)".
       │ 4. Renvoie un message de succès : "Crédits ajoutés avec succès !".
       ▼
[Frontend: CreditsPage.tsx & AuthContext.tsx]
       │
       │ Le solde dans le header passe instantanément de "0 crédit" à "10 crédits".
       │ Le tableau de l'historique affiche la nouvelle ligne verte.
```

---

## 7. Guide Pratique : Comment Modifier le Projet ?

### A. Changer les couleurs ou les polices
- Les polices sont configurées dans `index.html` (Google Fonts : **Outfit** pour les titres et **Roboto Flex** pour le corps du texte).
- Les couleurs et classes utilitaires sont définies dans `src/index.css` sous la directive `@theme` de Tailwind CSS v4 :
  - `#0a0a0a` : Noir profond Kortex.
  - `#f7f7f7` : Fond gris clair de l'application.
  - `#d7f7f1` & `#0f5c53` : Vert mint officiel pour les pastilles de succès et de scans gratuits.
  - `#c81e4b`, `#e96c14`, `#e0a608`, `#3898ec` : Couleurs respectives des sévérités Critique, Élevée, Moyenne et Faible.

### B. Modifier les prix des packs en FCFA
- Dans `src/pages/CreditsPage.tsx`, modifiez simplement les valeurs dans la grille des 5 packs (ex. changer `1 000 FCFA` en `1 500 FCFA`).
- Modifiez également la section correspondante sur la page d'accueil dans `src/pages/LandingPage.tsx`.

### C. Connecter une vraie base de données PostgreSQL
Actuellement, les données sont stockées en mémoire vive dans l'objet `DB` du fichier `server.ts` pour permettre un développement et un test immédiats. Pour brancher PostgreSQL :
1. Créez les tables relationnelles en suivant le schéma fourni dans le ticket **Issue #14** du fichier `ISSUES.md`.
2. Remplacez les lectures et écritures dans `DB.users`, `DB.targets`, `DB.scans` par des requêtes SQL (`pg` ou `Prisma`).

### D. Connecter une vraie passerelle Mobile Money (Wave / Orange Money / CinetPay)
Le fichier `ISSUES.md` (Issue #13) détaille la mise en place du contrôleur de paiement. Il suffira d'ajouter l'appel HTTP vers l'API de paiement dans la route `/api/k/credits/checkout` et de recevoir la confirmation sur la route webhook `/api/k/payments/webhook`.

---

## 8. Commandes Utiles & Environnement

| Commande | Rôle |
|---|---|
| `npm run dev` | Démarre le serveur Full-Stack Express + Vite sur `http://localhost:3000`. |
| `npm run build` | Compile l'application React pour la production dans le dossier `/dist`. |
| `npm run lint` | Lance la vérification stricte des types TypeScript (`tsc --noEmit`). |
| `npm start` | Démarre le serveur en mode autonome de production. |

---

## Conclusion & Synthèse

Vous disposez désormais d'une application **complète, fonctionnelle et prête pour les étapes suivantes** :
- **Pour relire les tickets de développement et planifier la suite :** Ouvrez le fichier **`ISSUES.md`**.
- **Pour présenter le projet à des collaborateurs ou investisseurs :** Ouvrez le fichier **`README.md`**.
- **Pour comprendre chaque ligne de code et savoir où intervenir :** Ce fichier **`GUIDE_PROJET.md`** est votre guide de référence.
