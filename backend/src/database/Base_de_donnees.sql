-- =========================================================
-- KORTEX DEFENDER · BASE DE DONNÉES RELATIONNELLE POSTGRESQL
-- Fichier : Base_de_donnees.sql
-- Structure DDL complète + Jeu de données initial (Seed)
-- Exécutez ce script dans votre base "kortex_defender"
-- via pgAdmin, DBeaver, VS Code ou la commande psql.
-- =========================================================

-- =========================================================
-- 1. CRÉATION DES TABLES
-- =========================================================

-- 1. Table des Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    credits INT DEFAULT 0,
    free_scans INT DEFAULT 3,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Cibles / Applications auditées
CREATE TABLE IF NOT EXISTS targets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(512) NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_type VARCHAR(32) DEFAULT 'web', -- 'web', 'api', 'graphql'
    authorized BOOLEAN DEFAULT TRUE,
    authorized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scans_count INT DEFAULT 0,
    last_score INT,
    last_scan_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Scans & Audits de vulnérabilités
CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id VARCHAR(36) NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    target_url VARCHAR(512) NOT NULL,
    profile VARCHAR(32) NOT NULL, -- 'fast', 'standard', 'deep'
    status VARCHAR(32) DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
    progress INT DEFAULT 0,
    phase VARCHAR(64) DEFAULT 'Initialisation',
    score INT DEFAULT 100,
    counts_critical INT DEFAULT 0,
    counts_high INT DEFAULT 0,
    counts_medium INT DEFAULT 0,
    counts_low INT DEFAULT 0,
    counts_info INT DEFAULT 0,
    findings JSONB DEFAULT '[]'::jsonb,
    log_lines JSONB DEFAULT '[]'::jsonb,
    subdomains JSONB DEFAULT '[]'::jsonb,
    duration_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Table des Transactions de Crédits
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INT NOT NULL,
    kind VARCHAR(32) NOT NULL, -- 'free_scan', 'credit', 'purchase', 'promo'
    reason VARCHAR(64) NOT NULL, -- 'grant', 'scan_debit', 'purchase', 'redeem'
    scan_id VARCHAR(36),
    note TEXT,
    created_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Demandes d'Affiliation & Parrainage
CREATE TABLE IF NOT EXISTS referral_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    promo_code VARCHAR(32) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    operator VARCHAR(32) NOT NULL, -- 'Wave', 'Orange', 'MTN', 'Moov'
    phone VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. INDEX DE PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_targets_user ON targets(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_target ON scans(target_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- =========================================================
-- 3. DONNÉES INITIALES (SEED)
-- =========================================================

-- Compte de test officiel
INSERT INTO users (id, email, password_hash, phone, credits, free_scans, is_admin, created_at)
VALUES (
    '01m6rd9vpzwrzh8p8dkvhdbdkt',
    'babaaristote6@gmail.com',
    'Cl2even2026',
    '+2250152311124',
    0,
    2,
    false,
    '2026-11-06 12:28:26+00'
)
ON CONFLICT (email) DO UPDATE 
SET free_scans = 2, credits = 0;

-- Notification de bienvenue
INSERT INTO notifications (id, user_id, title, message, read, link, created_at)
VALUES (
    'notif_welcome',
    '01m6rd9vpzwrzh8p8dkvhdbdkt',
    'Bienvenue sur Kortex Defender',
    'Vos 3 scans de découverte gratuits sont disponibles. Ajoutez votre première application pour auditer vos failles.',
    false,
    '/targets',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Transactions initiales
INSERT INTO transactions (user_id, delta, kind, reason, scan_id, note, created_time)
VALUES 
(
    '01m6rd9vpzwrzh8p8dkvhdbdkt',
    3,
    'free_scan',
    'grant',
    NULL,
    'Scans de découverte offerts à l’inscription',
    NOW() - INTERVAL '1 hour'
),
(
    '01m6rd9vpzwrzh8p8dkvhdbdkt',
    -1,
    'free_scan',
    'scan_debit',
    'scan_01kortex_init',
    'Débit audit profil standard',
    NOW() - INTERVAL '30 minutes'
);
