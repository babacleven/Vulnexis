import React, { useState, useEffect } from 'react';
import { ScanTarget, Scan } from '../types';
import { IconCheck, IconPlus } from '../components/Icons';

interface TargetDetailPageProps {
  targetId: string;
  onNavigate: (path: string) => void;
}

export function TargetDetailPage({ targetId, onNavigate }: TargetDetailPageProps) {
  const [target, setTarget] = useState<ScanTarget | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAuth, setUpdatingAuth] = useState(false);

  const fetchData = async () => {
    try {
      const [tgtRes, scansRes] = await Promise.all([
        fetch(`/api/k/targets/${targetId}`),
        fetch(`/api/k/scans?target_id=${targetId}`),
      ]);
      if (tgtRes.ok) {
        const json = await tgtRes.json();
        setTarget(json.data);
      }
      if (scansRes.ok) {
        const sJson = await scansRes.json();
        setScans(sJson.data?.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetId]);

  const handleToggleAuthorize = async () => {
    if (!target) return;
    const msg = target.authorized
      ? 'Retirer l’autorisation de scan ? Il faudra attester à nouveau pour scanner cette application.'
      : 'Confirmer l’autorisation de test sur cette application ?';
    if (!window.confirm(msg)) return;

    setUpdatingAuth(true);
    try {
      const res = await fetch(`/api/k/targets/${target.id}/authorize`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setTarget(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingAuth(false);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    if (!window.confirm('Supprimer cette application et tout son historique de scans ? Cette action est définitive.')) {
      return;
    }
    try {
      const res = await fetch(`/api/k/targets/${target.id}`, { method: 'DELETE' });
      if (res.ok) {
        onNavigate('/targets');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-kx-muted">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-kx-accent border-t-transparent mr-2" />
        Chargement…
      </div>
    );
  }

  if (!target) {
    return (
      <div className="card text-center py-12">
        <p className="text-kx-muted">Application introuvable.</p>
        <button onClick={() => onNavigate('/targets')} className="btn btn-sm mt-4">
          Retour aux applications
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/targets')}
          className="text-sm font-medium text-kx-muted hover:text-black transition"
        >
          ← Mes applications
        </button>
      </div>

      {/* Target Info Card */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold">{target.name}</h1>
              {target.authorized ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  <IconCheck className="h-3 w-3" />
                  Autorisé
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  Non autorisé
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-sm text-kx-muted">{target.url}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate(`/scans/new?target=${target.id}`)}
              disabled={!target.authorized}
              className="btn"
            >
              <IconPlus className="h-4 w-4" />
              <span>Lancer un scan</span>
            </button>
            <button
              onClick={handleToggleAuthorize}
              disabled={updatingAuth}
              className="btn-ghost"
            >
              {target.authorized ? 'Retirer l’autorisation' : 'Ré-attester'}
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-kx-border pt-4 sm:grid-cols-3 text-xs text-kx-muted">
          <div>
            <span className="block font-semibold text-black">Type</span>
            <span className="capitalize">{target.target_type}</span>
          </div>
          <div>
            <span className="block font-semibold text-black">Ajoutée le</span>
            <span>{new Date(target.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
          <div>
            <span className="block font-semibold text-black">Dernier score</span>
            <span className="font-semibold text-black">
              {target.last_score ? `${target.last_score}/100` : 'Aucun scan'}
            </span>
          </div>
        </div>
      </div>

      {/* Scans list for this target */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="card-title mb-0">Historique des audits de cette application</h2>
          <span className="text-xs text-kx-muted">{scans.length} scan(s)</span>
        </div>

        {scans.length === 0 ? (
          <p className="py-8 text-center text-sm text-kx-muted">
            Aucun audit n’a encore été exécuté sur cette cible.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-b border-kx-border text-xs text-kx-muted uppercase tracking-wider">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Profil</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kx-border">
                {scans.map((s) => (
                  <tr key={s.id} className="hover:bg-kx-panel2/50 transition">
                    <td className="py-3 font-mono text-xs">{s.id.slice(0, 14)}</td>
                    <td className="py-3 text-xs capitalize text-kx-muted">{s.profile}</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-display font-semibold">
                      {s.score ? `${s.score}/100` : '-'}
                    </td>
                    <td className="py-3 text-xs text-kx-muted">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate(`/scans/${s.id}`)}
                        className="btn-ghost btn-sm"
                      >
                        Voir rapport
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
