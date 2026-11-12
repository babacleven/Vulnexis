import { config } from '../config/env.js';
import pg from 'pg';

const { Pool } = pg;

const databaseUrl = config.databaseUrl || process.env.DATABASE_URL?.trim();

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null;

export async function testPostgresConnection() {
  if (!pool) {
    console.log('ℹ️  [Base de Données] Mode local autonome actif (aucun DATABASE_URL configuré).');
    return false;
  }

  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now, version() as version');
    client.release();
    console.log(`🐘 [PostgreSQL] Connecté avec succès à votre base locale ! (Heure serveur: ${res.rows[0].now})`);
    return true;
  } catch (err) {
    console.warn(`⚠️  [PostgreSQL] Connexion impossible sur DATABASE_URL (${err.message}). Bascule automatique sur le store local.`);
    return false;
  }
}
