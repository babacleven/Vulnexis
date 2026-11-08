import React, { useState, useEffect } from 'react';
import { ScanTarget } from '../types';
import { IconGlobe, IconPlus, IconCheck } from '../components/Icons';

export function TargetsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [targets, setTargets] = useState<ScanTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [targetType, setTargetType] = useState<'web' | 'api' | 'graphql'>('web');
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

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await fetch('/api/k/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), target_type: targetType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Erreur lors de l'ajout.");
      }
      setShowAddModal(false);
      setUrl('');
      setAttestation(false);
      fetchTargets();
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTarget = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer ${name} et tout son historique de scans ? Cette action est définitive.`)) {
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold sm:text-2xl md:text-3xl">
            Mes applications
          </h1>
          <p className="mt-1.5 text-sm text-kx-muted sm:text-base">
            Applications, sites et API autorisés au scan.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn">
          <IconPlus className="h-4 w-4" />
          <span>Ajouter une application</span>
        </button>
      </div>

      {/* Target Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <h2 className="font-display text-xl font-semibold">Ajouter une application</h2>
            <p className="mt-1 text-sm text-kx-muted">
              Déclarez un site web, une API REST ou un point d’accès GraphQL à surveiller.
            </p>

            <form onSubmit={handleAddTarget} className="mt-6 space-y-4">
              {error && <p className="alert-err">{error}</p>}

              <div>
                <label className="label" htmlFor="target-url">
                  URL de l’application ou du domaine
                </label>
                <input
                  id="target-url"
                  className="input"
                  type="text"
                  placeholder="https://mon-application.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  autoFocus
                />
                <p className="hint">Exemple: https://app.domaine.com ou https://api.domaine.com/v1</p>
              </div>

              <div>
                <label className="label">Type de cible</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'web', label: 'Site web' },
                    { id: 'api', label: 'API REST' },
                    { id: 'graphql', label: 'GraphQL' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTargetType(t.id as any)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${
                        targetType === t.id
                          ? 'border-black bg-black text-white'
                          : 'border-kx-border bg-white text-kx-muted hover:border-black/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Attestation Checkbox */}
              <label className="flex items-start gap-2.5 rounded-xl border border-kx-border bg-kx-panel2 p-3.5 text-xs text-kx-muted cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-black shrink-0"
                  checked={attestation}
                  onChange={(e) => setAttestation(e.target.checked)}
                />
                <span>
                  <b>Attestation formelle obligatoire :</b> J’atteste sur l’honneur être propriétaire de cette cible ou disposer d’une autorisation écrite explicite couvrant ce type d’audit de sécurité.
                </span>
              </label>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-kx-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="btn-ghost"
                >
                  Annuler
                </button>
                <button type="submit" className="btn" disabled={submitting || !url || !attestation}>
                  {submitting ? 'Ajout…' : 'Valider et ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Targets Table / List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-kx-muted">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-kx-accent border-t-transparent mr-2" />
            Chargement des applications…
          </div>
        ) : targets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-black">
              <IconGlobe className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold">Aucune application enregistrée</h3>
            <p className="mt-1 text-sm text-kx-muted max-w-sm mx-auto">
              Ajoutez votre première application pour pouvoir lancer des audits et suivre vos vulnérabilités.
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn mt-4">
              Ajouter une application
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-b border-kx-border text-xs text-kx-muted uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Application</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Autorisation</th>
                  <th className="pb-3 font-semibold">Audits</th>
                  <th className="pb-3 font-semibold">Dernier score</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kx-border">
                {targets.map((t) => (
                  <tr key={t.id} className="hover:bg-kx-panel2/50 transition">
                    <td className="py-4">
                      <div>
                        <span className="font-mono text-sm font-semibold text-black">{t.name}</span>
                        <p className="text-xs text-kx-muted truncate max-w-xs">{t.url}</p>
                      </div>
                    </td>
                    <td className="py-4 text-xs uppercase font-medium text-kx-muted">
                      {t.target_type}
                    </td>
                    <td className="py-4">
                      {t.authorized ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                          <IconCheck className="h-3 w-3" />
                          Autorisé
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Non autorisé
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-sm font-medium">
                      {t.scans_count} scan{t.scans_count > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 font-display font-semibold">
                      {t.last_score ? (
                        <span>
                          {t.last_score} <span className="text-xs text-kx-muted">/100</span>
                        </span>
                      ) : (
                        <span className="text-xs text-kx-muted">Non scanné</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onNavigate(`/scans/new?target=${t.id}`)}
                          className="btn btn-sm"
                        >
                          Scanner
                        </button>
                        <button
                          onClick={() => onNavigate(`/targets/${t.id}`)}
                          className="btn-ghost btn-sm"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleDeleteTarget(t.id, t.name || t.url)}
                          className="text-xs text-kx-muted hover:text-red-600 transition px-2 py-1"
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
        )}
      </div>
    </div>
  );
}
