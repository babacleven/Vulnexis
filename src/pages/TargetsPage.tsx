import React, { useState, useEffect } from 'react';
import { ScanTarget } from '../types';
import { IconCheck } from '../components/Icons';

export function TargetsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [targetType, setTargetType] = useState<'Site web' | 'API REST' | 'GraphQL'>('Site web');
  const [attestation, setAttestation] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/k/targets');
      if (res.ok) {
        const json = await res.json();
        setTargets(json.data?.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleAddTarget = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!url.trim()) {
      setError('Veuillez entrer une URL valide.');
      return;
    }
    if (!attestation) {
      setError('Vous devez certifier être autorisé à auditer cette cible.');
      return;
    }

    setSubmitting(true);
    try {
      const targetTypeMapping: Record<string, string> = {
        'Site web': 'web',
        'API REST': 'api',
        'GraphQL': 'graphql',
      };
      const res = await fetch('/api/k/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          url: url.trim(),
          target_type: targetTypeMapping[targetType] || 'web',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Erreur lors de l'ajout.");
      }
      setIsAdding(false);
      setName('');
      setUrl('');
      setAttestation(false);
      await fetchTargets();
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTarget = async (id: string, targetName: string) => {
    if (!window.confirm(`Supprimer ${targetName} et tout son historique de scans ? Cette action est définitive.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/k/targets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTargets((prev) => prev.filter((t) => t.id !== id));
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
            Mes applications
          </h1>
          <p className="mt-1 text-sm text-[#71717a]">
            Les sites, API et hôtes que vous auditez.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
          >
            Ajouter une application
          </button>
        )}
      </div>

      {/* Inline Form: Ajouter une application (Screenshot 6) */}
      {isAdding && (
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 md:p-8 shadow-2xs">
          <h2 className="font-display text-base font-bold text-black mb-4">
            Ajouter une application
          </h2>

          {error && <p className="mb-4 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">{error}</p>}

          <form onSubmit={handleAddTarget} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Nom */}
              <div className="md:col-span-4">
                <label className="text-xs font-semibold text-black block mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  placeholder="Mon site"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e4e7] px-4 py-2.5 text-sm text-black outline-none focus:border-black transition"
                />
              </div>

              {/* URL */}
              <div className="md:col-span-5">
                <label className="text-xs font-semibold text-black block mb-1.5">
                  URL
                </label>
                <input
                  type="text"
                  placeholder="https://exemple.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#e4e4e7] px-4 py-2.5 text-sm text-black outline-none focus:border-black transition"
                />
              </div>

              {/* Type */}
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-black block mb-1.5">
                  Type
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-black transition"
                >
                  <option value="Site web">Site web</option>
                  <option value="API REST">API REST</option>
                  <option value="GraphQL">GraphQL</option>
                </select>
              </div>
            </div>

            {/* Attestation Box */}
            <div className="rounded-xl border border-[#e4e4e7] p-4 bg-white flex items-start gap-3">
              <input
                id="attest-checkbox"
                type="checkbox"
                checked={attestation}
                onChange={(e) => setAttestation(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-black cursor-pointer"
              />
              <label htmlFor="attest-checkbox" className="text-xs text-[#0a0a0a] leading-relaxed cursor-pointer select-none">
                <span>
                  J’atteste être propriétaire de cette cible ou disposer d’une{' '}
                  <strong className="font-bold">autorisation écrite</strong> de son propriétaire pour la tester, et j’accepte les{' '}
                  <strong className="font-bold">conditions d’utilisation</strong>.
                </span>
                <span className="block text-[11px] text-[#71717a] mt-1">
                  Cette attestation est horodatée et enregistrée avec votre compte et votre adresse IP.
                </span>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#5f5f66] hover:bg-black text-white text-xs font-semibold px-6 py-2.5 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Ajout en cours…' : 'Ajouter et continuer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setError('');
                }}
                className="rounded-full bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] text-black text-xs font-semibold px-6 py-2.5 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Targets List or Empty State */}
      {loading ? (
        <div className="rounded-2xl border border-[#e4e4e7] bg-white py-16 text-center text-sm text-[#71717a]">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
          Chargement des applications…
        </div>
      ) : targets.length === 0 ? (
        /* Empty State (Screenshots 5 & 7) */
        <div className="rounded-2xl border border-[#e4e4e7] bg-white py-24 px-6 text-center shadow-2xs">
          <h3 className="text-base font-bold text-black mb-1">
            Aucune application
          </h3>
          <p className="text-sm text-[#71717a] mb-6">
            Ajoutez l’URL de l’application à auditer pour commencer.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
          >
            Ajouter une application
          </button>
        </div>
      ) : (
        /* Populated Table */
        <div className="rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e4e4e7] text-xs text-[#71717a] uppercase tracking-wider bg-[#fafafa]">
                  <th className="py-3.5 px-6 font-semibold">Application</th>
                  <th className="py-3.5 px-6 font-semibold">Type</th>
                  <th className="py-3.5 px-6 font-semibold">Autorisation</th>
                  <th className="py-3.5 px-6 font-semibold">Audits</th>
                  <th className="py-3.5 px-6 font-semibold">Dernier score</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {targets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-semibold text-sm text-black">{t.name || t.url}</span>
                        <p className="text-xs text-[#71717a] font-mono mt-0.5 truncate max-w-sm">{t.url}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs uppercase font-medium text-[#71717a]">
                      {t.target_type === 'web' ? 'Site web' : t.target_type === 'api' ? 'API REST' : 'GraphQL'}
                    </td>
                    <td className="py-4 px-6">
                      {t.authorized ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d7f7f1] text-[#0f5c53] px-2.5 py-0.5 text-xs font-semibold">
                          <IconCheck className="h-3 w-3" />
                          Autorisé
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Non autorisé
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-black">
                      {t.scans_count} scan{t.scans_count > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-6 font-semibold text-black">
                      {t.last_score ? (
                        <span>
                          {t.last_score} <span className="text-xs text-[#71717a] font-normal">/100</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#71717a] font-normal">Non scanné</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onNavigate(`/scans/new?target=${t.id}`)}
                          className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
                        >
                          Scanner
                        </button>
                        <button
                          onClick={() => onNavigate(`/targets/${t.id}`)}
                          className="rounded-full border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f4f4f5] transition-colors"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleDeleteTarget(t.id, t.name || t.url)}
                          className="text-xs text-[#71717a] hover:text-red-600 transition-colors px-2 py-1"
                          title="Supprimer"
                        >
                          Supprimer
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
