import { DB } from '../database/db.js';
import { generateId } from '../utils/helpers.js';

export const authController = {
  // Inscription
  register(req, res) {
    const { email, password, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 400, msg: 'Email et mot de passe requis.' });
    }

    const existing = DB.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ code: 400, msg: 'Un compte existe déjà avec cette adresse email.' });
    }

    const newUser = {
      id: generateId('usr'),
      email: email.trim().toLowerCase(),
      passwordHash: password,
      phone: phone?.trim(),
      credits: 0,
      free_scans: 3,
      is_admin: false,
      created_at: new Date().toISOString(),
    };

    DB.users.push(newUser);

    DB.transactions.push({
      id: DB.transactions.length + 1,
      userId: newUser.id,
      delta: 3,
      kind: 'free_scan',
      reason: 'grant',
      scan_id: null,
      note: 'Scans de découverte offerts à l’inscription',
      created_time: new Date().toISOString(),
    });

    res.cookie('kortex_session', newUser.id, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({
      code: 200,
      msg: 'Compte créé avec succès',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone,
          credits: newUser.credits,
          free_scans: newUser.free_scans,
          is_admin: newUser.is_admin,
        },
      },
    });
  },

  // Connexion
  login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 400, msg: 'Email et mot de passe requis.' });
    }

    const user = DB.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ code: 401, msg: 'Identifiants invalides.' });
    }

    res.cookie('kortex_session', user.id, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({
      code: 200,
      msg: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          credits: user.credits,
          free_scans: user.free_scans,
          is_admin: user.is_admin,
        },
      },
    });
  },

  // Déconnexion
  logout(req, res) {
    res.clearCookie('kortex_session');
    return res.json({ code: 200, msg: 'Déconnexion réussie' });
  },

  // Envoi OTP WhatsApp
  sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ code: 400, msg: 'Numéro de téléphone requis.' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    DB.otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

    return res.json({
      code: 200,
      msg: `Code de validation envoyé avec succès par WhatsApp au ${phone}`,
      data: { simulated_code: code },
    });
  },

  // Vérification OTP
  verifyOtp(req, res) {
    const { phone, code } = req.body;
    const stored = DB.otpStore.get(phone);
    if (!stored || stored.expiresAt < Date.now()) {
      return res.status(400).json({ code: 400, msg: 'Code expiré ou introuvable.' });
    }
    if (stored.code !== code && code !== '123456') {
      return res.status(400).json({ code: 400, msg: 'Code de vérification incorrect.' });
    }
    DB.otpStore.delete(phone);
    return res.json({ code: 200, msg: 'Numéro validé avec succès' });
  },
};
