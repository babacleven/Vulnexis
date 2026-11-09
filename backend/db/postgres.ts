import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;

export function getPostgresPool(): pg.Pool | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === '') {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 3000,
    });

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL] Erreur sur le pool de connexion:', err.message);
      isConnected = false;
    });
  }

  return pool;
}

export async function testPostgresConnection(): Promise<boolean> {
  const p = getPostgresPool();
  if (!p) {
    console.log('ℹ️  [Base de Données] Store local autonome actif (DATABASE_URL non configurée).');
    return false;
  }

  try {
    const res = await p.query('SELECT NOW() AS current_time;');
    isConnected = true;
    console.log(`🐘 [PostgreSQL] Connecté avec succès à votre base locale ! (Heure serveur: ${res.rows[0].current_time})`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn(`⚠️ [PostgreSQL] Impossible de se connecter à PostgreSQL (${err.message}).`);
    console.warn('👉 Bascule automatique sur le store local autonome.');
    return false;
  }
}

export async function querySql(text: string, params?: any[]): Promise<any> {
  const p = getPostgresPool();
  if (!p || !isConnected) {
    throw new Error('PostgreSQL non disponible ou non connecté.');
  }
  return p.query(text, params);
}
