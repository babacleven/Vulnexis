-- =========================================================
-- KORTEX DEFENDER · DONNÉES INITIALES (SEED)
-- Exécutez ce script après schema.sql pour initialiser votre compte.
-- =========================================================

-- Insertion de votre compte de test
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

-- Insertion de la notification d'accueil
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

-- Insertion des transactions de départ
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
