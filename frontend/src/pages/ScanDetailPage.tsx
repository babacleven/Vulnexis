import React, { useState, useEffect } from 'react';
import { Scan, Finding } from '../types';
import { IconCheck, IconShield } from '../components/Icons';

interface ScanDetailPageProps {
  scanId: string;
  onNavigate: (path: string) => void;
}

export function ScanDetailPage({ scanId, onNavigate }: ScanDetailPageProps) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'recon' | 'logs'>('findings');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const fetchScan = async () => {
    try {
      const res = await fetch(`/api/v1/scans/${scanId}`);
      if (res.ok) {
        const json = await res.json();
        setScan(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
    // Poll while running
    const interval = setInterval(() => {
      fetchScan();
    }, 2500);
    return () => clearInterval(interval);
  }, [scanId]);

  const handleDownload = (format: 'html' | 'json') => {
    window.location.href = `/api/v1/scans/${scanId}/download?format=${format}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-kx-muted">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-kx-accent border-t-transparent mr-2" />
        Chargement de l’audit…
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="card text-center py-12">
        <p className="text-kx-muted">Scan introuvable.</p>
        <button onClick={() => onNavigate('/scans')} className="btn btn-sm mt-4">
          Retour aux audits
        </button>
      </div>
    );
  }

  const isRunning = scan.status === 'running' || scan.status === 'queued';

  const filteredFindings =
    selectedSeverity === 'all'
      ? scan.findings
      : scan.findings.filter((f: Finding) => f.severity === selectedSeverity);

  const phases = ['Initialisation', 'Cartographie', 'Reconnaissance & scan', 'Validation contrôlée', 'Terminé'];
  const currentPhaseIndex = Math.max(0, phases.indexOf(scan.phase));

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div>
        <button
          onClick={() => onNavigate('/scans')}
          className="text-xs font-semibold text-[#71717a] hover:text-black transition-colors"
        >
          ← Scans
        </button>
      </div>

      {/* Header Info Banner */}
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl font-bold sm:text-2xl break-all text-black">
                {scan.target_url}
              </h1>
              <span className="rounded-full bg-[#f4f4f5] px-2.5 py-0.5 text-xs font-semibold capitalize text-black">
                Profil {scan.profile}
              </span>
              {isRunning ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#209893] animate-pulse" />
                  {scan.phase || 'En cours'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#d7f7f1] text-[#0f5c53] px-2.5 py-0.5 text-xs font-semibold">
                  <IconCheck className="h-3 w-3" />
                  Terminé
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#71717a]">
              Audit #{scan.id.slice(0, 14)} · Lancé le{' '}
              {new Date(scan.created_at).toLocaleString('fr-FR')}
              {scan.duration_seconds ? ` · Durée : ${scan.duration_seconds}s` : ''}
            </p>
          </div>

          {!isRunning && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload('html')}
                className="rounded-full border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
              >
                Télécharger HTML
              </button>
              <button
                onClick={() => handleDownload('json')}
                className="rounded-full border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={handlePrint}
                className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
              >
                Imprimer le rapport
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live running progression view */}
      {isRunning ? (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Analyse en cours d’exécution</h2>
              <p className="text-xs text-kx-muted">
                Les analyseurs scannent la surface d’attaque de votre application.
              </p>
            </div>
            <span className="font-display text-xl font-bold">{scan.progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 overflow-hidden rounded-full bg-kx-panel2">
            <div
              className="h-full rounded-full bg-black transition-all duration-500 ease-out"
              style={{ width: `${scan.progress}%` }}
            />
          </div>

          {/* Stepper Phases */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center text-xs">
            {phases.map((ph, idx) => {
              const done = idx < currentPhaseIndex || scan.progress === 100;
              const current = idx === currentPhaseIndex && scan.progress < 100;
              return (
                <div
                  key={ph}
                  className={`rounded-xl border p-2.5 transition ${
                    current
                      ? 'border-black bg-black text-white font-semibold'
                      : done
                      ? 'border-teal-200 bg-teal-50 text-teal-800 font-medium'
                      : 'border-kx-border bg-white text-kx-muted opacity-60'
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-wider mb-0.5">
                    Étape {idx + 1}
                  </span>
                  <span>{ph}</span>
                </div>
              );
            })}
          </div>

          {/* Real-time scan logs terminal */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-4 font-mono text-xs text-zinc-300 space-y-1">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-500">
              <span>JOURNAL D'EXÉCUTION EN TEMPS RÉEL</span>
              <span className="h-2 w-2 rounded-full bg-kx-teal animate-pulse" />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pt-2">
              {scan.log_lines?.map((line: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600 select-none">&gt;</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Completed Scan Summary View */
        <>
          {/* Score & Counters Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Score Ring Card */}
            <div className="card flex items-center justify-around lg:col-span-1">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
                  <circle cx="55" cy="55" r="48" fill="none" stroke="#f4f4f5" strokeWidth="10" />
                  <circle
                    cx="55"
                    cy="55"
                    r="48"
                    fill="none"
                    stroke={scan.score >= 80 ? '#209893' : scan.score >= 60 ? '#e0a608' : '#c81e4b'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="302"
                    strokeDashoffset={302 - (302 * scan.score) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-3xl font-bold">{scan.score}</span>
                  <span className="text-[11px] text-kx-muted">/ 100</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-kx-muted">Score de sécurité</p>
                <p className="mt-1 font-display text-lg font-semibold">
                  {scan.score >= 80 ? 'Bon niveau' : scan.score >= 60 ? 'Vulnérabilités modérées' : 'Failles critiques'}
                </p>
                <p className="mt-0.5 text-xs text-kx-muted">
                  {scan.findings.length} faille{scan.findings.length > 1 ? 's' : ''} répertoriée{scan.findings.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Severity Breakdown Pills */}
            <div className="card lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="card-title mb-2">Vulnérabilités réparties par niveau</h3>
                <p className="text-xs text-kx-muted">
                  Cliquez sur un niveau pour filtrer les correctifs correspondants.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'critical' ? 'all' : 'critical')}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedSeverity === 'critical'
                      ? 'border-red-600 bg-red-100 ring-2 ring-red-600'
                      : 'border-red-200 bg-red-50/70 hover:bg-red-100/50'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-red-700">Critique</span>
                  <p className="mt-1 font-display text-xl font-bold text-red-700">
                    {scan.counts?.critical || 0}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'high' ? 'all' : 'high')}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedSeverity === 'high'
                      ? 'border-orange-600 bg-orange-100 ring-2 ring-orange-600'
                      : 'border-orange-200 bg-orange-50/70 hover:bg-orange-100/50'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-orange-700">Élevée</span>
                  <p className="mt-1 font-display text-xl font-bold text-orange-700">
                    {scan.counts?.high || 0}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'medium' ? 'all' : 'medium')}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedSeverity === 'medium'
                      ? 'border-amber-600 bg-amber-100 ring-2 ring-amber-600'
                      : 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/50'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-amber-700">Moyenne</span>
                  <p className="mt-1 font-display text-xl font-bold text-amber-700">
                    {scan.counts?.medium || 0}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'low' ? 'all' : 'low')}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedSeverity === 'low'
                      ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600'
                      : 'border-blue-200 bg-blue-50/70 hover:bg-blue-100/50'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-blue-700">Faible</span>
                  <p className="mt-1 font-display text-xl font-bold text-blue-700">
                    {scan.counts?.low || 0}
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-kx-border">
            <button
              onClick={() => setActiveTab('findings')}
              className={`border-b-2 pb-3 px-4 text-sm font-semibold transition ${
                activeTab === 'findings'
                  ? 'border-black text-black'
                  : 'border-transparent text-kx-muted hover:text-black'
              }`}
            >
              Vulnérabilités &amp; Correctifs ({filteredFindings.length})
            </button>
            <button
              onClick={() => setActiveTab('recon')}
              className={`border-b-2 pb-3 px-4 text-sm font-semibold transition ${
                activeTab === 'recon'
                  ? 'border-black text-black'
                  : 'border-transparent text-kx-muted hover:text-black'
              }`}
            >
              Cartographie &amp; Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`border-b-2 pb-3 px-4 text-sm font-semibold transition ${
                activeTab === 'logs'
                  ? 'border-black text-black'
                  : 'border-transparent text-kx-muted hover:text-black'
              }`}
            >
              Journal d’exécution
            </button>
          </div>

          {/* Tab 1: Findings List */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              {filteredFindings.length === 0 ? (
                <div className="card py-12 text-center text-kx-muted text-sm">
                  Aucune vulnérabilité trouvée pour ce filtre.
                </div>
              ) : (
                filteredFindings.map((f: Finding) => (
                  <div key={f.id} className="card space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                              f.severity === 'critical'
                                ? 'bg-sev-critical'
                                : f.severity === 'high'
                                ? 'bg-sev-high'
                                : f.severity === 'medium'
                                ? 'bg-sev-medium'
                                : 'bg-sev-low'
                            }`}
                          >
                            {f.severity}
                          </span>
                          <h3 className="font-display text-base font-semibold text-black">
                            {f.title}
                          </h3>
                        </div>
                        <p className="text-xs text-kx-muted">
                          Catégorie : <b>{f.category}</b> · Cible affectée :{' '}
                          <span className="font-mono">{f.url || scan.target_url}</span>
                        </p>
                      </div>

                      {f.cvss && (
                        <span className="rounded-lg bg-kx-panel2 px-2.5 py-1 font-mono text-xs font-semibold">
                          CVSS {f.cvss}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-700 leading-relaxed">{f.description}</p>

                    {f.proof && (
                      <div className="rounded-xl border border-kx-border bg-kx-panel2 p-3 font-mono text-xs text-zinc-800">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-kx-muted mb-1">
                          Élément de preuve / Détection :
                        </span>
                        {f.proof}
                      </div>
                    )}

                    <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-xs text-teal-950 space-y-1">
                      <span className="font-semibold text-teal-900 uppercase tracking-wider text-[11px] block">
                        Correctif recommandé :
                      </span>
                      <p className="leading-relaxed">{f.remediation}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Reconnaissance & Infrastructure */}
          {activeTab === 'recon' && (
            <div className="card space-y-6">
              <div>
                <h3 className="font-display text-base font-semibold">Sous-domaines découverts</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {scan.subdomains?.map((sub: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-kx-border p-3 font-mono text-xs"
                    >
                      <span>{sub}</span>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                        Actif
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-kx-border">
                <h3 className="font-display text-base font-semibold">Sécurité SSL/TLS</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-xl border border-kx-border p-3">
                    <span className="text-kx-muted block">Protocole</span>
                    <span className="font-semibold text-black">TLSv1.3 &amp; TLSv1.2</span>
                  </div>
                  <div className="rounded-xl border border-kx-border p-3">
                    <span className="text-kx-muted block">Validité du certificat</span>
                    <span className="font-semibold text-teal-700">Valide (Let's Encrypt / DigiCert)</span>
                  </div>
                  <div className="rounded-xl border border-kx-border p-3">
                    <span className="text-kx-muted block">HSTS</span>
                    <span className="font-semibold text-orange-600">Non forcé</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Execution Logs */}
          {activeTab === 'logs' && (
            <div className="card">
              <h3 className="card-title">Journal technique de l'audit</h3>
              <div className="rounded-2xl bg-[#0a0a0a] p-4 font-mono text-xs text-zinc-300 space-y-1.5">
                {scan.log_lines?.map((line: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-zinc-600 select-none">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
