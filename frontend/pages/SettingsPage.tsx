import React from 'react';
import { useAuth } from '../context/AuthContext';

export function SettingsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">Compte</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Informations de votre compte Kortex Defender.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 md:p-8 max-w-xl shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-black">Profil utilisateur</h2>

        <div className="space-y-3 divide-y divide-[#e4e4e7] text-sm">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-[#71717a]">Email</span>
            <span className="font-mono font-medium text-black">{user?.email || 'babaaristote6@gmail.com'}</span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-[#71717a]">Numéro WhatsApp</span>
            <span className="font-mono font-medium text-black">{user?.phone || '+225 07 12 34 56 78'}</span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-[#71717a]">Type de compte</span>
            <span className="font-medium text-black">
              {user?.is_admin ? 'Opérateur (Admin)' : 'Client standard'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-[#71717a]">Date d’inscription</span>
            <span className="font-medium text-black">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '6 novembre 2026'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e4e4e7] flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="rounded-full border border-[#e4e4e7] bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
