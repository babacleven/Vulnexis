import './backend/src/config/env.js';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createExpressApp } from './backend/src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createExpressApp();
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Kortex Defender running on http://0.0.0.0:${PORT}`);
    const { testPostgresConnection } = await import('./backend/src/database/connection.js');
    await testPostgresConnection();
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERREUR: Le port ${PORT} est déjà utilisé par une autre application ou un ancien processus Node.`);
      console.error(`👉 Pour libérer le port sur Windows:`);
      console.error(`   netstat -ano | findstr :${PORT}`);
      console.error(`   taskkill /PID <PID_TROUVÉ> /F`);
      console.error(`👉 Ou lancez sur un autre port (ex: 3001):`);
      console.error(`   set PORT=3001 && npm run dev (cmd) ou $env:PORT=3001; npm run dev (PowerShell)\n`);
    } else {
      console.error('Erreur du serveur:', err);
    }
  });
}

startServer();
