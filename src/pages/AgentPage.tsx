import React from 'react';

export function AgentPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Header (Screenshot 8) */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">
          Agent Kortex
        </h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Votre analyste sécurité personnel, piloté par l’IA.
        </p>
      </div>

      {/* Card (Screenshot 8) */}
      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 md:p-8 shadow-2xs">
        <p className="text-sm text-black mb-4">
          L’agent Kortex est inclus dans l’offre <strong className="font-bold">Premium (5 000 FCFA / 30 jours)</strong>.
        </p>

        <ul className="space-y-3 text-sm text-[#3f3f46] list-disc list-inside mb-6 leading-relaxed">
          <li>Il analyse vos scans et vous explique chaque faille avec le correctif adapté à votre stack.</li>
          <li>Il retient votre contexte et apprend des décisions passées pour mieux vous conseiller.</li>
          <li>Chaque matin, il fait une revue autonome et propose les scans utiles, toujours validés par un expert Kortex avant exécution.</li>
        </ul>

        <button
          onClick={() => onNavigate && onNavigate('/credits')}
          className="rounded-full bg-black px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
        >
          Passer en Premium
        </button>
      </div>
    </div>
  );
}
