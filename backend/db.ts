import {
  DBUser,
  DBTarget,
  DBScan,
  DBTransaction,
  DBNotification,
  DBReferralRequest,
} from './types.ts';

export const DB = {
  users: [
    {
      id: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      email: 'babaaristote6@gmail.com',
      passwordHash: 'Cl2even2026',
      phone: '+2250152311124',
      credits: 0,
      free_scans: 2,
      is_admin: false,
      created_at: '2026-11-06T12:28:26.843Z',
    },
  ] as DBUser[],

  targets: [] as DBTarget[],

  scans: [] as DBScan[],

  transactions: [
    {
      id: 24,
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      delta: -1,
      kind: 'free_scan',
      reason: 'scan_debit',
      scan_id: 'scan_01kortex_init',
      note: 'Débit audit profil standard',
      created_time: '2026-11-06T12:35:00.000Z',
    },
    {
      id: 23,
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      delta: 3,
      kind: 'free_scan',
      reason: 'grant',
      scan_id: null,
      note: 'Scans de découverte offerts à l’inscription',
      created_time: '2026-11-06T12:28:26.843Z',
    },
  ] as DBTransaction[],

  notifications: [
    {
      id: 'notif_welcome',
      userId: '01m6rd9vpzwrzh8p8dkvhdbdkt',
      title: 'Bienvenue sur Kortex Defender',
      message: 'Vos 3 scans de découverte gratuits sont disponibles. Ajoutez votre premier site pour commencer.',
      read: false,
      link: '/targets',
      created_at: '2026-11-06T12:28:30.000Z',
    },
  ] as DBNotification[],

  referralRequests: [] as DBReferralRequest[],

  otpStore: new Map<string, { code: string; expiresAt: number }>(),
};
