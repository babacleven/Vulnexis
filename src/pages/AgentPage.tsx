import React from 'react';
import { IconRobot } from '../components/Icons';

export function AgentPage() {
  const actions = [
    {
      id: 'act_1',
      title: 'Revue autonome quotidienne',
      target: 'votre-site.com',
      status: 'Validée · lancée',
      statusClass: 'bg-teal-50 text-teal-800 border-teal-200',
      date: 'Aujourd’hui à 08:00',
      desc: 'Vérification de l’expiration du certificat TLS et détection de nouveaux sous-domaines.',
    },
    {
      id: 'act_2',
      title: 'Surveillance proactive des en-têtes',
      target: 'votre-site.com',
      status: 'En cours',
      statusClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      date: 'Hier à 14:22',
      desc: 'Contrôle continu de la présence de Content-Security-Policy et HSTS.',
    },
    {
      id: 'act_3',
      title: 'Détection d’anomalie d’exposition API',
      target: 'votre-site.com',
      status: 'En attente de validation',
      statusClass: 'bg-amber-50 text-amber-800 border-amber-200',
      date: '06/11/2026',
      desc: 'Nouvel endpoint /api/v2 détecté sans authentification configurée.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <IconRobot className="h-6 w-6 text-black" />
          <h1 className="font-display text-xl font-semibold sm:text-2xl md:text-3xl">
            Agent Kortex
          </h1>
        </div>
        <p className="mt-1 text-sm text-kx-muted sm:text-base">
          Votre copilote de sécurité autonome, inspectant vos cibles et prévenant les incidents.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="card-title mb-1">Actions &amp; Détections autonomes</h2>
        <div className="space-y-3">
          {actions.map((act) => (
            <div
              key={act.id}
              className="rounded-2xl border border-kx-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-kx-panel2/30 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{act.title}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${act.statusClass}`}
                  >
                    {act.status}
                  </span>
                </div>
                <p className="text-xs text-kx-muted">{act.desc}</p>
                <p className="text-[11px] text-zinc-400">
                  Cible : <span className="font-mono">{act.target}</span> · {act.date}
                </p>
              </div>

              <button className="btn-ghost btn-sm self-start sm:self-center">
                Détails
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
