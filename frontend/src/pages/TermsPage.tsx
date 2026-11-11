import React from 'react';
import { Logo } from '../components/Icons';

export function TermsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-kx-bg text-kx-text">
      {/* Header */}
      <header className="border-b border-kx-border bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-8">
          <button onClick={() => onNavigate('/')} className="text-left focus:outline-hidden">
            <Logo size="md" />
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="text-sm font-medium text-kx-muted hover:text-black transition"
          >
            Connexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold">Conditions d’utilisation</h1>
        <p className="mt-2 text-sm text-kx-muted">Version du 2026-10-23</p>

        <div className="card mt-8 space-y-8">
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">1. Objet</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Kortex Defender fournit un service d’audit de sécurité automatisé de sites web, d’API et d’hôtes exposés sur Internet. Ces conditions encadrent l’utilisation de la plateforme.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">2. Autorisation préalable obligatoire</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Vous ne pouvez lancer un scan que sur une cible dont vous êtes propriétaire, ou pour laquelle vous disposez d’une autorisation écrite, préalable et explicite de son propriétaire couvrant ce type de test.
              </p>
              <p>
                Pour chaque cible, vous attestez disposer de cette autorisation. Cette attestation est horodatée et conservée avec votre identifiant et votre adresse IP.
              </p>
              <p>
                Tester un système sans autorisation est interdit et peut constituer une infraction pénale (notamment l’accès ou le maintien frauduleux dans un système de traitement automatisé de données).
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">3. Nature des tests</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Les scans réalisés par les comptes clients sont non destructifs : reconnaissance, détection de configurations faibles et de vulnérabilités connues. Aucune exploitation active ni modification de données n’est effectuée.
              </p>
              <p>
                Un scan génère du trafic vers la cible et peut être visible dans ses journaux ou déclencher ses systèmes de détection. Prévenez vos équipes et hébergeurs si nécessaire.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">4. Responsabilité de l’utilisateur</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Vous êtes seul responsable du choix des cibles, de la véracité de votre attestation et de l’usage fait des résultats.
              </p>
              <p>
                Vous vous engagez à garantir Kortex Defender contre toute réclamation résultant d’un scan lancé sans autorisation valable.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">5. Suspension</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Kortex Defender peut suspendre un compte, révoquer l’autorisation d’une cible ou refuser un scan en cas de doute sur la légitimité d’une demande, de signalement d’un tiers ou d’usage abusif, sans remboursement des crédits consommés à cette occasion.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">6. Crédits</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Les scans sont décomptés en crédits selon le profil choisi. Un scan qui échoue pour une raison technique est recrédité. Les scans de découverte gratuits ne donnent pas accès aux rapports téléchargeables.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">7. Confidentialité des résultats</h2>
            <div className="space-y-2 text-kx-muted text-sm leading-relaxed">
              <p>
                Les résultats de vos scans ne sont accessibles qu’à votre compte et aux administrateurs de la plateforme pour les besoins du support et de la sécurité du service.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
