import React, { useState, useEffect } from 'react';
import { ScanTarget } from '../types';
import { useAuth } from '../context/AuthContext';

interface NewScanPageProps {
  initialTargetId?: string;
  onNavigate: (path: string) => void;
}

export function NewScanPage({ initialTargetId, onNavigate }: NewScanPageProps) {
  const { user, creditsData, refreshUser } = useAuth();
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState(initialTargetId || '');
  const [profile, setProfile] = useState<'fast' | 'standard' | 'deep'>('standard');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await fetch('/api/v1/targets');
        if (res.ok) {
          const json = await res.json();
          const items: ScanTarget[] = json.data?.items || [];
          setTargets(items);
          if (!selectedTargetId && items.length > 0) {
            const firstAuth = items.find((t) => t.authorized) || items[0];
            setSelectedTargetId(firstAuth.id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTargets();
  }, [initialTargetId]);

  const authorizedTargets = targets.filter((t) => t.authorized);
  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  // Compute pricing and cost
  const freeScansAvailable = creditsData?.free_scans ?? user?.free_scans ?? 0;
  const creditsAvailable = creditsData?.credits ?? user?.credits ?? 0;
  const canUseFree = freeScansAvailable > 0 && (profile === 'fast' || profile === 'standard');
  const costInCredits = profile === 'deep' ? 4 : profile === 'standard' ? 2 : 1;
  const hasEnoughFunds = canUseFree || creditsAvailable >= costInCredits;

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTarget) {
      setError('Veuillez sélectionner une application.');
      return;
    }
    if (!selectedTarget.authorized) {
      setError('Cette cible doit disposer d’une attestation d’autorisation avant de pouvoir être scannée.');
      return;
    }
    if (!hasEnoughFunds) {
      setError(`Solde insuffisant : ce profil requiert ${costInCredits} crédits.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: selectedTarget.id,
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Erreur lors du lancement du scan.');
      }
      await refreshUser();
      onNavigate(`/scans/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue.');
      setSubmitting(false);
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

  return (
    <div className="space-y-6">
      {/* Header (Screenshot 4) */}
      <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">
        Lancer un scan
      </h1>

      {/* When no authorized targets: Empty State (Screenshot 4) */}
      {authorizedTargets.length === 0 ? (
        <div className="rounded-2xl border border-[#e4e4e7] bg-white py-24 px-6 text-center shadow-2xs">
          <h3 className="text-base font-bold text-black mb-2">
            Aucune application autorisée
          </h3>
          <p className="text-sm text-[#71717a] mb-6">
            Ajoutez une application et attestez votre autorisation pour pouvoir la scanner.
          </p>
          <button
            onClick={() => onNavigate('/targets')}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
          >
            Mes applications
          </button>
        </div>
      ) : (
        /* Form when targets exist */
        <form onSubmit={handleLaunch} className="space-y-6 max-w-3xl">
          {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}

          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-black">1. Application à auditer</h2>
            <div>
              <label htmlFor="target-select" className="text-xs font-semibold text-[#71717a] block mb-1.5">
                Sélectionnez une application autorisée
              </label>
              <select
                id="target-select"
                className="w-full rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-black"
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
              >
                {authorizedTargets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.url} ({t.url})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-black">2. Profil d’audit</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Profile Rapide */}
              <div
                onClick={() => setProfile('fast')}
                className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                  profile === 'fast'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-[#e4e4e7] bg-white text-black hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Rapide</span>
                    <span className={`text-xs font-semibold ${profile === 'fast' ? 'text-zinc-300' : 'text-[#71717a]'}`}>
                      1 crédit
                    </span>
                  </div>
                  <p className={`mt-2 text-xs leading-relaxed ${profile === 'fast' ? 'text-zinc-300' : 'text-[#71717a]'}`}>
                    Reconnaissance passive, en-têtes HTTP de sécurité, certificat SSL/TLS et technologies exposées.
                  </p>
                </div>
                <p className="mt-4 text-[11px] font-medium opacity-80">Durée : ~1-2 min</p>
              </div>

              {/* Profile Standard */}
              <div
                onClick={() => setProfile('standard')}
                className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                  profile === 'standard'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-[#e4e4e7] bg-white text-black hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Standard</span>
                    <span className={`text-xs font-semibold ${profile === 'standard' ? 'text-zinc-300' : 'text-[#71717a]'}`}>
                      2 crédits
                    </span>
                  </div>
                  <p className={`mt-2 text-xs leading-relaxed ${profile === 'standard' ? 'text-zinc-300' : 'text-[#71717a]'}`}>
                    Reconnaissance complète, CVE connues, failles de configuration, fuites de secrets et sous-domaines.
                  </p>
                </div>
                <p className="mt-4 text-[11px] font-medium opacity-80">Durée : ~3-5 min</p>
              </div>

              {/* Profile Approfondi */}
              <div
                onClick={() => setProfile('deep')}
                className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                  profile === 'deep'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-[#e4e4e7] bg-white text-black hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Approfondi</span>
                    <span className={`text-xs font-semibold ${profile === 'deep' ? 'text-zinc-300' : 'text-[#71717a]'}`}>
                      4 crédits
                    </span>
                  </div>
                  <p className={`mt-2 text-xs leading-relaxed ${profile === 'deep' ? 'text-zinc-300' : 'text-[#71717a]'}`}>
                    Cartographie exhaustive, analyse active des endpoints d'API, tests d'exposition et rapport complet.
                  </p>
                </div>
                <p className="mt-4 text-[11px] font-medium opacity-80">Durée : ~10-15 min</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-black">3. Décompte &amp; Validation</h2>
            <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#71717a]">Coût du scan sélectionné :</span>
                <span className="font-semibold text-black">
                  {canUseFree ? (
                    <span className="text-[#0f5c53]">1 scan gratuit (découverte)</span>
                  ) : (
                    `${costInCredits} crédit(s) Kortex`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#e4e4e7] pt-2 text-[11px] text-[#71717a]">
                <span>Votre solde actuel :</span>
                <span>
                  <strong className="text-black">{freeScansAvailable}</strong> scan(s) gratuit(s) ·{' '}
                  <strong className="text-black">{creditsAvailable}</strong> crédit(s)
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !hasEnoughFunds}
              className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Lancement du scan…' : 'Lancer le scan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
