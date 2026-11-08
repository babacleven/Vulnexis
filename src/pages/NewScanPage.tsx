import React, { useState, useEffect } from 'react';
import { ScanTarget } from '../types';
import { useAuth } from '../context/AuthContext';
import { IconCheck, IconShield, IconPlus } from '../components/Icons';

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
        const res = await fetch('/api/k/targets');
        if (res.ok) {
          const json = await res.json();
          const items: ScanTarget[] = json.data?.items || [];
          setTargets(items);
          if (!selectedTargetId && items.length > 0) {
            setSelectedTargetId(items[0].id);
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
      const res = await fetch('/api/k/scans', {
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
      <div className="flex items-center justify-center py-16 text-kx-muted">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-kx-accent border-t-transparent mr-2" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Lancer un audit</h1>
        <p className="mt-1 text-sm text-kx-muted sm:text-base">
          Choisissez l’application à auditer et le niveau de profondeur souhaité.
        </p>
      </div>

      {error && <p className="alert-err">{error}</p>}

      {targets.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-sm text-kx-muted">
            Vous devez d’abord déclarer une application autorisée avant de lancer un scan.
          </p>
          <button onClick={() => onNavigate('/targets')} className="btn mt-4">
            Ajouter une application
          </button>
        </div>
      ) : (
        <form onSubmit={handleLaunch} className="space-y-6">
          {/* Step 1: Select Target */}
          <div className="card space-y-4">
            <h2 className="card-title mb-1">1. Sélection de la cible</h2>
            <div className="space-y-2">
              <label htmlFor="target-select" className="label">
                Application autorisée
              </label>
              <select
                id="target-select"
                className="input"
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.url}) {t.authorized ? '· [Autorisé]' : '· [Non autorisé]'}
                  </option>
                ))}
              </select>
            </div>

            {selectedTarget && !selectedTarget.authorized && (
              <p className="alert-err text-xs">
                Cette application n’est pas autorisée. Activez l’attestation dans les détails de l’application.
              </p>
            )}
          </div>

          {/* Step 2: Choose Profile */}
          <div className="card space-y-4">
            <h2 className="card-title mb-1">2. Profil d’audit</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Profile Rapide */}
              <div
                onClick={() => setProfile('fast')}
                className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                  profile === 'fast'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-kx-border bg-white text-kx-text hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-base">Rapide</span>
                    <span
                      className={`text-xs font-semibold ${
                        profile === 'fast' ? 'text-zinc-300' : 'text-kx-muted'
                      }`}
                    >
                      1 crédit
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      profile === 'fast' ? 'text-zinc-300' : 'text-kx-muted'
                    }`}
                  >
                    Reconnaissance passive, en-têtes HTTP de sécurité, certificat SSL/TLS et détection des technologies exposées.
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
                    : 'border-kx-border bg-white text-kx-text hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-base">Standard</span>
                    <span
                      className={`text-xs font-semibold ${
                        profile === 'standard' ? 'text-zinc-300' : 'text-kx-muted'
                      }`}
                    >
                      2 crédits
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      profile === 'standard' ? 'text-zinc-300' : 'text-kx-muted'
                    }`}
                  >
                    Reconnaissance complète, CVE connues, failles de configuration, fuites de secrets dans le JS et sous-domaines.
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
                    : 'border-kx-border bg-white text-kx-text hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-base">Approfondi</span>
                    <span
                      className={`text-xs font-semibold ${
                        profile === 'deep' ? 'text-zinc-300' : 'text-kx-muted'
                      }`}
                    >
                      4 crédits
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      profile === 'deep' ? 'text-zinc-300' : 'text-kx-muted'
                    }`}
                  >
                    Cartographie exhaustive des sous-domaines, analyse active des endpoints d'API, tests d'exposition de secrets et rapport complet.
                  </p>
                </div>
                <p className="mt-4 text-[11px] font-medium opacity-80">Durée : ~10-15 min</p>
              </div>
            </div>
          </div>

          {/* Step 3: Cost and confirmation */}
          <div className="card space-y-4">
            <h2 className="card-title mb-1">3. Décompte &amp; Validation</h2>
            <div className="rounded-2xl border border-kx-border bg-kx-panel2 p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-kx-muted">Coût de l’audit sélectionné :</span>
                <span className="font-semibold text-black">
                  {canUseFree ? (
                    <span className="text-teal-700">1 scan de découverte offert</span>
                  ) : (
                    `${costInCredits} crédits Kortex`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-kx-border/60 pt-2 text-xs text-kx-muted">
                <span>Votre solde :</span>
                <span>
                  <b>{freeScansAvailable}</b> scans offerts · <b>{creditsAvailable}</b> crédits
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !hasEnoughFunds || !selectedTarget?.authorized}
              className="btn w-full py-3.5 text-base"
            >
              <IconShield className="h-5 w-5" />
              <span>{submitting ? 'Lancement du scan…' : 'Démarrer l’audit'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
