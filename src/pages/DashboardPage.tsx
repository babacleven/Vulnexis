import React, { useState, useEffect } from 'react';
import { Scan, ScanTarget } from '../types';
import { IconTarget, IconCheck, IconPlus, IconArrowRight } from '../components/Icons';

export function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [scans, setScans] = useState<Scan[]>([]);
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [scansRes, targetsRes] = await Promise.all([
        fetch('/api/k/scans'),
        fetch('/api/k/targets'),
      ]);
      if (scansRes.ok) {
        const sData = await scansRes.json();
        setScans(sData.data?.items || []);
      }
      if (targetsRes.ok) {
        const tData = await targetsRes.json();
        setTargets(tData.data?.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalFindings = scans.reduce(
    (acc, s) => {
      acc.critical += s.counts?.critical || 0;
      acc.high += s.counts?.high || 0;
      acc.medium += s.counts?.medium || 0;
      acc.low += s.counts?.low || 0;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  const avgScore =
    scans.length > 0
      ? Math.round(scans.reduce((sum, s) => sum + (s.score || 0), 0) / scans.length)
      : 100;

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 text-kx-muted justify-center">
        <span
          role="status"
          aria-label="Chargement"
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-kx-accent border-t-transparent"
        />
        <span>Chargement…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-display text-xl font-semibold sm:text-2xl md:text-3xl">
            Vue d’ensemble
          </h1>
          <p className="mt-1.5 break-words text-sm text-kx-muted sm:text-base">
            L’état de sécurité de vos applications, en un coup d’œil.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button onClick={() => onNavigate('/targets')} className="btn-ghost">
            Ajouter une application
          </button>
          <button onClick={() => onNavigate('/scans/new')} className="btn">
            Lancer un scan
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Score */}
        <div className="card flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-kx-panel2">
            <span className="font-display text-xl font-bold">{avgScore}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-kx-muted uppercase tracking-wider">Score moyen</p>
            <p className="font-display text-lg font-semibold">
              {avgScore >= 80 ? 'Bon' : avgScore >= 60 ? 'Moyen' : 'À sécuriser'}
            </p>
          </div>
        </div>

        {/* Card 2: Applications */}
        <div className="card flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-black">
            <IconTarget className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-kx-muted uppercase tracking-wider">Applications</p>
            <p className="font-display text-xl font-bold">{targets.length}</p>
          </div>
        </div>

        {/* Card 3: Scans réalisés */}
        <div className="card flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
            <IconCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-kx-muted uppercase tracking-wider">Audits exécutés</p>
            <p className="font-display text-xl font-bold">{scans.length}</p>
          </div>
        </div>

        {/* Card 4: Vulnérabilités ouvertes */}
        <div className="card flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
            <span className="font-display text-lg font-bold">
              {totalFindings.critical + totalFindings.high}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-kx-muted uppercase tracking-wider">Failles prioritaires</p>
            <p className="text-sm font-medium text-kx-muted">
              <span className="font-semibold text-red-600">{totalFindings.critical}</span> critiques ·{' '}
              <span className="font-semibold text-orange-600">{totalFindings.high}</span> élevées
            </p>
          </div>
        </div>
      </div>

      {/* Vulnerability Severity Breakdown Bar */}
      <div className="card">
        <h2 className="card-title">Répartition des vulnérabilités détectées</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-1">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
            <span className="text-xs font-semibold uppercase text-red-700">Critique</span>
            <p className="mt-1 font-display text-2xl font-bold text-red-700">{totalFindings.critical}</p>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
            <span className="text-xs font-semibold uppercase text-orange-700">Élevée</span>
            <p className="mt-1 font-display text-2xl font-bold text-orange-700">{totalFindings.high}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <span className="text-xs font-semibold uppercase text-amber-700">Moyenne</span>
            <p className="mt-1 font-display text-2xl font-bold text-amber-700">{totalFindings.medium}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
            <span className="text-xs font-semibold uppercase text-blue-700">Faible</span>
            <p className="mt-1 font-display text-2xl font-bold text-blue-700">{totalFindings.low}</p>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="card-title mb-0">Derniers audits de sécurité</h2>
          <button
            onClick={() => onNavigate('/scans')}
            className="text-xs font-semibold text-kx-muted hover:text-black transition"
          >
            Voir tous les scans →
          </button>
        </div>

        {scans.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-kx-muted">Aucun audit n'a encore été réalisé.</p>
            <button
              onClick={() => onNavigate('/scans/new')}
              className="btn btn-sm mt-4"
            >
              Lancer votre premier scan
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
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kx-border">
                {scans.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-kx-panel2/50 transition">
                    <td className="py-3.5 font-medium">
                      <span className="font-mono text-sm">{s.target_url}</span>
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

      {/* Applications quick list */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="card-title mb-0">Mes applications autorisées</h2>
          <button
            onClick={() => onNavigate('/targets')}
            className="text-xs font-semibold text-kx-muted hover:text-black transition"
          >
            Gérer les cibles →
          </button>
        </div>

        {targets.length === 0 ? (
          <p className="text-sm text-kx-muted py-4">
            Vous n'avez pas encore déclaré d'application.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {targets.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigate(`/targets/${t.id}`)}
                className="cursor-pointer rounded-2xl border border-kx-border p-4 hover:border-black/30 hover:bg-kx-panel2/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold truncate">{t.name}</span>
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                      Autorisé
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-kx-muted">{t.url}</p>
                </div>
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-kx-border text-xs text-kx-muted">
                  <span>{t.scans_count} audit{t.scans_count > 1 ? 's' : ''}</span>
                  <span className="font-semibold text-black">
                    {t.last_score ? `${t.last_score}/100` : 'Non scanné'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
