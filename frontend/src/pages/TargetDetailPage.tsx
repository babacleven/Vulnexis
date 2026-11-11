import React, { useState, useEffect } from 'react';
import { ScanTarget, Scan } from '../types';
import { IconCheck } from '../components/Icons';

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
        fetch(`/api/v1/targets/${targetId}`),
        fetch(`/api/v1/scans?target_id=${targetId}`),
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
      const res = await fetch(`/api/v1/targets/${target.id}/authorize`, { method: 'POST' });
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
      const res = await fetch(`/api/v1/targets/${target.id}`, { method: 'DELETE' });
      if (res.ok) {
        onNavigate('/targets');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-[#71717a]">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
        Chargement…
      </div>
    );
  }

  if (!target) {
    return (
      <div className="rounded-2xl border border-[#e4e4e7] bg-white text-center py-12">
        <p className="text-sm text-[#71717a]">Application introuvable.</p>
        <button
          onClick={() => onNavigate('/targets')}
          className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white mt-4"
        >
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
          className="text-xs font-semibold text-[#71717a] hover:text-black transition-colors"
        >
          ← Mes applications
        </button>
      </div>

      {/* Target Info Card */}
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-black">{target.name || target.url}</h1>
              {target.authorized ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#d7f7f1] text-[#0f5c53] px-2.5 py-0.5 text-xs font-semibold">
                  <IconCheck className="h-3 w-3" />
                  Autorisé
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  Non autorisé
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-xs text-[#71717a]">{target.url}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate(`/scans/new?target=${target.id}`)}
              disabled={!target.authorized}
              className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
            >
              Lancer un scan
            </button>
            <button
              onClick={handleToggleAuthorize}
              disabled={updatingAuth}
              className="rounded-full border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
            >
              {target.authorized ? 'Retirer l’autorisation' : 'Ré-attester'}
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-[#e4e4e7] pt-4 sm:grid-cols-3 text-xs text-[#71717a]">
          <div>
            <span className="block font-semibold text-black">Type</span>
            <span className="capitalize">{target.target_type === 'web' ? 'Site web' : target.target_type === 'api' ? 'API REST' : 'GraphQL'}</span>
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
      <div className="rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-[#e4e4e7] flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-black">Historique des audits de cette application</h2>
          <span className="text-xs text-[#71717a]">{scans.length} scan(s)</span>
        </div>

        {scans.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#71717a]">
            Aucun audit n’a encore été exécuté sur cette cible.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e4e4e7] text-xs text-[#71717a] uppercase tracking-wider bg-[#fafafa]">
                  <th className="py-3 px-6 font-semibold">ID</th>
                  <th className="py-3 px-6 font-semibold">Profil</th>
                  <th className="py-3 px-6 font-semibold">Statut</th>
                  <th className="py-3 px-6 font-semibold">Score</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {scans.map((s) => (
                  <tr key={s.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-black">{s.id.slice(0, 14)}</td>
                    <td className="py-3.5 px-6 text-xs capitalize text-[#71717a]">
                      {s.profile === 'fast' ? 'Rapide' : s.profile === 'standard' ? 'Standard' : 'Approfondi'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex rounded-full bg-[#d7f7f1] text-[#0f5c53] px-2.5 py-0.5 text-xs font-semibold">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-black">
                      {s.score ? `${s.score}/100` : '-'}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-[#71717a]">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onNavigate(`/scans/${s.id}`)}
                        className="rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
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
