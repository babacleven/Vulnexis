import React, { useState, useEffect } from 'react';
import { Scan, ScanTarget } from '../types';
import { IconPlus } from '../components/Icons';

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
        fetch(`/api/k/scans?${query}`),
        fetch('/api/k/targets'),
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
      const res = await fetch(`/api/k/scans/${id}`, { method: 'DELETE' });
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold sm:text-2xl md:text-3xl">
            Scans
          </h1>
          <p className="mt-1.5 text-sm text-kx-muted sm:text-base">
            Historique de vos audits et état des tâches.
          </p>
        </div>
        <button onClick={() => onNavigate('/scans/new')} className="btn">
          <IconPlus className="h-4 w-4" />
          <span>Lancer un scan</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="card py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="f-status" className="text-xs font-semibold text-kx-muted uppercase">
              Statut :
            </label>
            <select
              id="f-status"
              className="rounded-xl border border-kx-border bg-white px-3 py-1.5 text-xs text-black outline-none focus:border-black"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Tous">Tous</option>
              <option value="running">En cours</option>
              <option value="completed">Terminé</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="f-target" className="text-xs font-semibold text-kx-muted uppercase">
              Application :
            </label>
            <select
              id="f-target"
              className="rounded-xl border border-kx-border bg-white px-3 py-1.5 text-xs text-black outline-none focus:border-black max-w-xs truncate"
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
            >
              <option value="Toutes">Toutes</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scans Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-kx-muted">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-kx-accent border-t-transparent mr-2" />
            Chargement des audits…
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-kx-muted">Aucun scan correspondant aux critères.</p>
            <button onClick={() => onNavigate('/scans/new')} className="btn btn-sm mt-4">
              Lancer un nouveau scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-b border-kx-border text-xs text-kx-muted uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Cible</th>
                  <th className="pb-3 font-semibold">Profil</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Failles</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kx-border">
                {scans.map((s) => (
                  <tr key={s.id} className="hover:bg-kx-panel2/50 transition">
                    <td className="py-3.5">
                      <span className="font-mono text-sm font-medium">{s.target_url}</span>
                    </td>
                    <td className="py-3.5 text-xs capitalize text-kx-muted">
                      {s.profile === 'fast' ? 'Rapide' : s.profile === 'standard' ? 'Standard' : 'Approfondi'}
                    </td>
                    <td className="py-3.5">
                      {s.status === 'running' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-kx-teal animate-pulse" />
                          {s.phase || 'En cours'}
                        </span>
                      ) : s.status === 'completed' ? (
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                          Terminé
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {s.status === 'completed' ? (
                        <span className="font-display font-semibold">
                          {s.score} <span className="text-xs text-kx-muted">/100</span>
                        </span>
                      ) : (
                        <span className="text-xs text-kx-muted">-</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        {s.counts?.critical > 0 && (
                          <span className="rounded-md bg-sev-critical px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.critical}C
                          </span>
                        )}
                        {s.counts?.high > 0 && (
                          <span className="rounded-md bg-sev-high px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.high}H
                          </span>
                        )}
                        {s.counts?.medium > 0 && (
                          <span className="rounded-md bg-sev-medium px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.medium}M
                          </span>
                        )}
                        {s.counts?.low > 0 && (
                          <span className="rounded-md bg-sev-low px-1.5 py-0.5 font-bold text-white text-[10px]">
                            {s.counts.low}L
                          </span>
                        )}
                        {!s.counts?.critical && !s.counts?.high && !s.counts?.medium && !s.counts?.low && (
                          <span className="text-xs text-kx-muted">Aucune</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-kx-muted">
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onNavigate(`/scans/${s.id}`)}
                          className="btn-ghost btn-sm"
                        >
                          Rapport
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-xs text-kx-muted hover:text-red-600 transition"
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
        )}
      </div>
    </div>
  );
}
