import './config/env.js';
import { createExpressApp } from './app.js';
import { testPostgresConnection } from './database/connection.js';

const app = createExpressApp();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '5000', 10);

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 [Backend Kortex Defender] Serveur API actif sur http://localhost:${PORT}`);
  console.log(`📡 Endpoints canoniques disponibles sur http://localhost:${PORT}/api/v1/`);
  await testPostgresConnection();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERREUR: Le port ${PORT} est déjà utilisé.`);
    console.error(`👉 Libérez le port ${PORT} ou définissez BACKEND_PORT=<autre_port>`);
  } else {
    console.error('Erreur du serveur backend:', err);
  }
});
