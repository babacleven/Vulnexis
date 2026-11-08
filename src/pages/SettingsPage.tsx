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
        <h1 className="font-display text-xl font-semibold sm:text-2xl md:text-3xl">Compte</h1>
        <p className="mt-1.5 text-sm text-kx-muted sm:text-base">
          Informations de votre compte Kortex Defender.
        </p>
      </div>

      <div className="card max-w-xl space-y-4 text-sm">
        <h2 className="card-title mb-2">Profil</h2>

        <div className="space-y-3 divide-y divide-kx-border">
          <div className="flex justify-between items-center py-2">
            <span className="text-kx-muted">Email</span>
            <span className="font-mono font-medium text-black">{user?.email}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-kx-muted">Numéro WhatsApp</span>
            <span className="font-mono font-medium text-black">{user?.phone || 'Non renseigné'}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-kx-muted">Type de compte</span>
            <span className="font-medium text-black">
              {user?.is_admin ? 'Opérateur (Admin)' : 'Client'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-kx-muted">Inscrit le</span>
            <span className="font-medium text-black">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '6 novembre 2026'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-kx-border">
          <button onClick={handleLogout} className="btn-ghost w-full justify-center">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
