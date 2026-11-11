# Kortex Defender · Frontend Application

Application React 19 SPA stylisée avec Tailwind CSS v4, reproduisant fidèlement l'interface Halcyon Mesh ("Obsidian Control Plane") et fournissant le tableau de bord de cybersécurité Kortex Defender.

## Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur Vite en local sur le port 5173
npm run dev

# Construction de la version de production
npm run build
```

Toutes les requêtes vers `/api/*` sont automatiquement redirigées vers le backend sur `http://localhost:5000` via le reverse proxy de Vite.
