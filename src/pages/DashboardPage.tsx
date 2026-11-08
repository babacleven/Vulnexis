import React, { useState, useEffect } from 'react';
import { Scan, ScanTarget } from '../types';
import { useAuth } from '../context/AuthContext';
import { IconArrowRight } from '../components/Icons';

export function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, creditsData } = useAuth();
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
  }, []);

  const authorizedTargetsCount = targets.filter((t) => t.authorized).length;
  const creditsCount = creditsData?.credits ?? user?.credits ?? 0;
  const freeScansCount = creditsData?.free_scans ?? user?.free_scans ?? 2;
  const completedScans = scans.filter((s) => s.status === 'completed');
  const latestCompletedScan = completedScans.length > 0 ? completedScans[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">
            Vue d’ensemble
          </h1>
          <p className="mt-1 text-sm text-zinc-500 sm:text-base">
            L’état de sécurité de vos applications, en un coup d’œil.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <button
            onClick={() => onNavigate('/targets')}
            className="rounded-full border border-[#e4e4e7] bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-zinc-50 transition"
          >
            Ajouter une application
          </button>
          <button
            onClick={() => onNavigate('/scans/new')}
            className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition"
          >
            Lancer un scan
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Scans réalisés */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500">Scans réalisés</p>
          <p className="mt-3 font-display text-4xl font-bold text-black">{scans.length}</p>
        </div>

        {/* Card 2: Applications */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500">Applications</p>
          <p className="mt-3 font-display text-4xl font-bold text-black">{targets.length}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {authorizedTargetsCount} autorisée{authorizedTargetsCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Card 3: Crédits */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500">Crédits</p>
          <p className="mt-3 font-display text-4xl font-bold text-black">{creditsCount}</p>
        </div>

        {/* Card 4: Scans gratuits restants */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
          <p className="text-xs font-semibold text-zinc-500">Scans gratuits restants</p>
          <p className="mt-3 font-display text-4xl font-bold text-black">{freeScansCount}</p>
        </div>
      </div>

      {/* Big Dark Card: BIEN DÉMARRER · Votre premier audit en 3 étapes */}
      <div className="rounded-3xl bg-[#0a0a0a] p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          BIEN DÉMARRER
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
          Votre premier audit en 3 étapes
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Step 1: Active white card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-5 text-black">
            <div>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-black font-semibold text-xs text-white">
                1
              </span>
              <h3 className="mt-4 font-display text-base font-bold">
                Ajoutez votre application
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                L’URL de votre site ou de votre API.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => onNavigate('/targets')}
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
              >
                <span>Ajouter</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Step 2: Dark card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white/[0.06] p-5 text-white">
            <div>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-800 font-semibold text-xs text-zinc-400">
                2
              </span>
              <h3 className="mt-4 font-display text-base font-bold">
                Autorisez le scan
              </h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Attestez votre autorisation et acceptez les conditions.
              </p>
            </div>
          </div>

          {/* Step 3: Dark card */}
          <div className="flex flex-col justify-between rounded-2xl bg-white/[0.06] p-5 text-white">
            <div>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-800 font-semibold text-xs text-zinc-400">
                3
              </span>
              <h3 className="mt-4 font-display text-base font-bold">
                Lancez votre premier scan
              </h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Résultats en quelques minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card: Derniers scans */}
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-display text-base font-bold text-black">Derniers scans</h2>
          <button
            onClick={() => onNavigate('/scans')}
            className="text-xs font-semibold text-black underline underline-offset-4 hover:text-zinc-600 transition"
          >
            Tout l’historique
          </button>
        </div>

        {scans.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">Aucun scan pour l’instant.</p>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e4e4e7] text-xs text-zinc-400 uppercase">
                  <th className="pb-2 font-medium">Cible</th>
                  <th className="pb-2 font-medium">Profil</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium text-right">Rapport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {scans.slice(0, 3).map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="py-3 font-mono text-xs">{s.target_url}</td>
                    <td className="py-3 text-xs capitalize text-zinc-600">{s.profile}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{s.score}/100</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigate(`/scans/${s.id}`)}
                        className="text-xs font-semibold underline"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card: Vulnérabilités du dernier scan terminé */}
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
        <h2 className="font-display text-base font-bold text-black pb-3">
          Vulnérabilités du dernier scan terminé
        </h2>

        {!latestCompletedScan ? (
          <p className="py-4 text-sm text-zinc-500">Aucun scan terminé pour l’instant.</p>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Cible : <b className="text-black font-mono">{latestCompletedScan.target_url}</b></span>
              <span>Score : <b className="text-black">{latestCompletedScan.score}/100</b></span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-red-700">Critique</span>
                <p className="font-bold text-base text-red-700">{latestCompletedScan.counts?.critical || 0}</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-orange-700">Élevée</span>
                <p className="font-bold text-base text-orange-700">{latestCompletedScan.counts?.high || 0}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-amber-700">Moyenne</span>
                <p className="font-bold text-base text-amber-700">{latestCompletedScan.counts?.medium || 0}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-2.5">
                <span className="text-[10px] font-bold uppercase text-blue-700">Faible</span>
                <p className="font-bold text-base text-blue-700">{latestCompletedScan.counts?.low || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
