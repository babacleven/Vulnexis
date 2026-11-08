import React, { useState, useEffect } from 'react';
import { Scan, ScanTarget } from '../types';

export function ScansPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [targetFilter, setTargetFilter] = useState('Toutes');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      let query = '';
      if (statusFilter !== 'Tous') query += `status=${statusFilter}&`;
      if (targetFilter !== 'Toutes') query += `target_id=${targetFilter}&`;

      const [sRes, tRes] = await Promise.all([
        fetch(`/api/v1/scans?${query}`),
        fetch('/api/v1/targets'),
      ]);
      if (sRes.ok) {
        const json = await sRes.json();
        setScans(json.data?.items || []);
      }
      if (tRes.ok) {
        const json = await tRes.json();
        setTargets(json.data?.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [statusFilter, targetFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce scan et son rapport ? Cette action est définitive.')) return;
    try {
      const res = await fetch(`/api/v1/scans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">
            Scans
          </h1>
          <p className="mt-1 text-sm text-[#71717a]">
            Historique de vos audits et état des tâches.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/scans/new')}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
        >
          Lancer un scan
        </button>
      </div>

      {/* Filters (Screenshot 3) */}
      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="f-status" className="text-xs font-semibold text-black block mb-1">
            Statut
          </label>
          <select
            id="f-status"
            className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-sm text-black outline-none focus:border-black min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="running">En cours</option>
            <option value="completed">Terminé</option>
            <option value="failed">Échoué</option>
          </select>
        </div>

        <div>
          <label htmlFor="f-target" className="text-xs font-semibold text-black block mb-1">
            Application
          </label>
          <select
            id="f-target"
            className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-sm text-black outline-none focus:border-black min-w-[140px]"
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
          >
            <option value="Toutes">Toutes</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || t.url}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scans Content */}
      {loading ? (
        <div className="rounded-2xl border border-[#e4e4e7] bg-white py-16 text-center text-sm text-[#71717a]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
          Chargement des audits…
        </div>
      ) : scans.length === 0 ? (
        /* Empty State (Screenshot 3) */
        <div className="rounded-2xl border border-[#e4e4e7] bg-white py-20 px-6 text-center shadow-2xs">
          <h3 className="text-base font-bold text-black mb-4">
            Aucun scan pour l’instant
          </h3>
          <button
            onClick={() => onNavigate('/scans/new')}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
          >
            Lancer un scan
          </button>
        </div>
      ) : (
        /* Scans Table */
        <div className="rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e4e4e7] text-xs text-[#71717a] uppercase tracking-wider bg-[#fafafa]">
                  <th className="py-3.5 px-6 font-semibold">Cible</th>
                  <th className="py-3.5 px-6 font-semibold">Profil</th>
                  <th className="py-3.5 px-6 font-semibold">Statut</th>
                  <th className="py-3.5 px-6 font-semibold">Score</th>
                  <th className="py-3.5 px-6 font-semibold">Failles</th>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {scans.map((s) => (
                  <tr key={s.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-black">
                      {s.target_url}
                    </td>
                    <td className="py-4 px-6 text-xs capitalize text-[#71717a]">
                      {s.profile === 'fast' ? 'Rapide' : s.profile === 'standard' ? 'Standard' : 'Approfondi'}
                    </td>
                    <td className="py-4 px-6">
                      {s.status === 'running' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#209893] animate-pulse" />
                          {s.phase || 'En cours'}
                        </span>
                      ) : s.status === 'completed' ? (
                        <span className="inline-flex items-center rounded-full bg-[#d7f7f1] text-[#0f5c53] px-2.5 py-0.5 text-xs font-semibold">
                          Terminé
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {s.status === 'completed' ? (
                        <span className="font-semibold text-black">
                          {s.score} <span className="text-xs text-[#71717a] font-normal">/100</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#71717a]">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs">
                        {s.counts?.critical > 0 && (
                          <span className="rounded-md bg-[#c81e4b] px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.critical}C
                          </span>
                        )}
                        {s.counts?.high > 0 && (
                          <span className="rounded-md bg-[#e96c14] px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.high}H
                          </span>
                        )}
                        {s.counts?.medium > 0 && (
                          <span className="rounded-md bg-[#e0a608] px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.medium}M
                          </span>
                        )}
                        {s.counts?.low > 0 && (
                          <span className="rounded-md bg-[#3898ec] px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.low}L
                          </span>
                        )}
                        {!s.counts?.critical && !s.counts?.high && !s.counts?.medium && !s.counts?.low && (
                          <span className="text-xs text-[#71717a]">Aucune</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#71717a]">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onNavigate(`/scans/${s.id}`)}
                          className="rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
                        >
                          Rapport
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-xs text-[#71717a] hover:text-red-600 transition-colors px-2 py-1"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
