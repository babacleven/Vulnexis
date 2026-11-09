import { createExpressApp } from './app.ts';
import { testPostgresConnection } from './db/postgres.ts';

const app = createExpressApp();
const PORT = parseInt(process.env.BACKEND_PORT || '5000', 10);
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  console.log(`\n🚀 [Backend API] Serveur Backend actif sur http://localhost:${PORT}`);
  console.log(`📡 Endpoints API canoniques disponibles sous http://localhost:${PORT}/api/v1/\n`);
  await testPostgresConnection();
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERREUR: Le port ${PORT} est déjà utilisé par une autre application.`);
    console.error(`👉 Pour libérer le port sur Windows:`);
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error(`   taskkill /PID <PID_TROUVÉ> /F`);
    console.error(`👉 Ou lancez sur un autre port (ex: 5001):`);
    console.error(`   set PORT=5001 && npm run dev:back (cmd) ou $env:PORT=5001; npm run dev:back (PowerShell)\n`);
  } else {
    console.error('Erreur du serveur backend:', err);
  }
});
