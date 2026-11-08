import React, { useState, useEffect } from 'react';
import { Logo, IconCheck, IconArrowRight } from '../components/Icons';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  authed?: boolean;
}

export function LandingPage({ onNavigate, authed }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [scanStatus, setScanStatus] = useState('En cours');
  const [progressWidth, setProgressWidth] = useState(25);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero interactive simulation cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((prev) => {
        const next = (prev + 1) % 4;
        setProgressWidth((next + 1) * 25);
        if (next === 3) {
          setScanStatus('Terminé');
        } else {
          setScanStatus('En cours');
        }
        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      n: '01',
      title: 'Ajoutez votre application',
      text: 'L’URL de votre site, de votre API ou de votre endpoint GraphQL. Vous attestez être autorisé à la tester.',
    },
    {
      n: '02',
      title: 'Lancez le scan',
      text: 'Reconnaissance, empreinte, vulnérabilités connues, TLS, en-têtes, secrets exposés : tout s’enchaîne automatiquement.',
    },
    {
      n: '03',
      title: 'Corrigez en priorité',
      text: 'Chaque faille est expliquée en français, classée par gravité, avec le correctif à appliquer.',
    },
  ];

  const features = [
    {
      title: 'Cartographie',
      text: 'Sous-domaines, services exposés, technologies détectées : votre surface d’attaque vue de l’extérieur.',
    },
    {
      title: 'Vulnérabilités web',
      text: 'Failles connues, mauvaises configurations, fichiers sensibles accessibles publiquement.',
    },
    {
      title: 'Chiffrement & en-têtes',
      text: 'Certificats, protocoles TLS, HSTS, CSP, cookies : les protections de base, vérifiées.',
    },
    {
      title: 'Secrets exposés',
      text: 'Clés d’API et jetons oubliés dans le JavaScript servi aux visiteurs.',
    },
    {
      title: 'API & GraphQL',
      text: 'Découverte des spécifications et des endpoints, contrôles d’exposition.',
    },
    {
      title: 'Analyse IA en français',
      text: 'Un score, une synthèse et des recommandations lisibles par toute l’équipe.',
    },
  ];

  const plans = [
    {
      name: 'Free',
      tag: 'Découverte',
      price: '0 FCFA',
      note: 'Les 3 scans gratuits sont utilisables une seule fois par compte.',
      items: [
        '3 scans de découverte gratuits par compte',
        'Résultats essentiels dans le dashboard',
        'Aucun rapport téléchargeable',
        'Aucune alerte de surveillance',
      ],
      btnText: 'Commencer',
    },
    {
      name: 'Essentiel',
      tag: 'Pour essayer',
      price: '1 000 FCFA',
      note: 'Les crédits achetés n’expirent pas.',
      items: [
        '10 crédits Kortex Defender',
        'Rapports de sécurité détaillés',
        'Idéal pour un premier audit complet',
      ],
      btnText: 'Choisir',
    },
    {
      name: 'Starter',
      tag: 'Paiement à l’utilisation',
      price: '2 000 FCFA',
      note: 'Les crédits achetés n’expirent pas.',
      items: [
        '20 crédits Kortex Defender',
        'Rapports de sécurité détaillés',
        'Alertes sur les nouvelles vulnérabilités',
        'Notifications dashboard et email',
      ],
      btnText: 'Choisir',
    },
    {
      name: 'Premium',
      tag: 'Offre recommandée',
      price: '5 000 FCFA / mois',
      highlight: true,
      note: 'Crédits valables 30 jours à partir du paiement (renouvellement manuel).',
      items: [
        '60 crédits mensuels',
        'Surveillance planifiée d’un domaine',
        'Rapports détaillés et historique',
        'Alertes WhatsApp, email et dashboard',
        'Priorité dans la file de scans',
      ],
      btnText: 'Choisir',
    },
    {
      name: 'Premium Plus',
      tag: 'Sur devis',
      price: 'Tarif personnalisé',
      note: 'Chaque devis précise le périmètre, les quotas et le support.',
      items: [
        'Plusieurs domaines ou applications',
        'Quotas de crédits personnalisés',
        'Audits avancés selon le périmètre autorisé',
        'Collaboration multi-utilisateurs',
      ],
      btnText: 'Nous contacter',
    },
  ];

  const circuitPaths = [
    'M0 120 H220 L270 70 H420',
    'M0 200 H160 L220 260 H380 L420 220',
    'M1200 90 H980 L930 140 H800',
    'M1200 260 H1040 L990 210 H860',
    'M0 420 H120 L180 360 H300',
    'M1200 440 H1080 L1020 500 H900',
    'M600 0 V60 L650 110 V180',
    'M560 560 V500 L520 460 V400',
  ];

  const circuitCircles = [
    [420, 70],
    [420, 220],
    [800, 140],
    [860, 210],
    [300, 360],
    [900, 500],
    [650, 180],
    [520, 400],
  ];

  return (
    <div className="overflow-x-hidden bg-white text-kx-text">
      {/* Fixed Header */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? 'nav-scrolled' : 'border-transparent bg-white/70 backdrop-blur-xs'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:gap-6 sm:px-8">
          <button
            onClick={() => onNavigate('/')}
            className="shrink-0 text-left focus:outline-hidden"
            aria-label="Kortex Defender"
          >
            <Logo size="md" />
          </button>

          <nav className="ml-6 hidden gap-6 text-sm text-kx-muted md:flex" aria-label="Sections">
            <a href="#fonctionnement" className="hover:text-black transition">
              Fonctionnement
            </a>
            <a href="#fonctionnalites" className="hover:text-black transition">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="hover:text-black transition">
              Tarifs
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {authed ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="btn px-4 sm:px-5"
              >
                Accéder au dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium hover:bg-kx-panel2 sm:inline-flex transition"
                >
                  Connexion
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="btn whitespace-nowrap px-4 sm:px-5"
                >
                  Essai gratuit
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate pb-24 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-100 to-transparent opacity-80 blur-3xl" />

        {/* SVG Circuit Background */}
        <svg
          viewBox="0 0 1200 560"
          preserveAspectRatio="xMidYMid slice"
          className="circuit pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[560px] w-full max-w-6xl text-zinc-300"
          aria-hidden="true"
        >
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {circuitPaths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g fill="currentColor">
            {circuitCircles.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6" />
            ))}
          </g>
        </svg>

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-kx-border bg-white px-3.5 py-1.5 text-xs font-medium shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              Audit de sécurité web &amp; API, en self-service
            </p>

            <h1 className="break-words font-display text-[2.1rem] font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
              <span>Trouvez vos failles </span>
              <span className="text-zinc-400">avant les attaquants.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-kx-muted">
              Kortex Defender analyse vos sites et vos API, détecte les vulnérabilités et vous explique, en français, quoi corriger en priorité.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate(authed ? '/scans/new' : '/register')}
                className="btn w-full px-5 py-3 text-sm sm:w-auto sm:px-6 sm:text-base"
              >
                <span>{authed ? 'Lancer un scan' : 'Commencer gratuitement'}</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
              <a href="#fonctionnement" className="btn-ghost px-6 py-3 text-base">
                Comment ça marche
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-kx-muted">
              <IconCheck className="h-4 w-4 text-black" />
              3 scans de découverte offerts · sans carte bancaire
            </p>
          </div>

          {/* Interactive Console Simulation */}
          <div className="console min-w-0 [perspective:1200px]">
            <div className="rounded-3xl border border-kx-border bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.25)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-zinc-200" />
                  <span className="h-3 w-3 rounded-full bg-zinc-200" />
                  <span className="h-3 w-3 rounded-full bg-zinc-200" />
                </div>
                <span className="truncate pl-3 font-mono text-xs text-kx-muted">scan · votre-site.com</span>
              </div>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">Analyse en cours</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white transition ${
                    scanStatus === 'Terminé' ? 'bg-kx-teal' : 'bg-black'
                  }`}
                >
                  {scanStatus}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-kx-panel2">
                <div
                  className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              <ol className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px]">
                {['Reconnaissance', 'Analyse', 'Corrélation', 'Rapport'].map((phase, idx) => (
                  <li
                    key={phase}
                    className={`transition ${idx <= activePhase ? 'font-semibold text-black' : 'text-zinc-400'}`}
                  >
                    <span
                      className={`mx-auto mb-1 block h-2 w-2 rounded-full transition ${
                        idx <= activePhase ? 'bg-black' : 'bg-zinc-200'
                      }`}
                    />
                    {phase}
                  </li>
                ))}
              </ol>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-kx-border px-3 py-2.5 text-sm transition">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white bg-sev-high">
                    Élevée
                  </span>
                  <span className="truncate font-medium">Content-Security-Policy absente</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-kx-border px-3 py-2.5 text-sm transition">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white bg-sev-medium">
                    Moyenne
                  </span>
                  <span className="truncate font-medium">En-tête HSTS manquant</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-kx-border px-3 py-2.5 text-sm transition">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white bg-sev-low">
                    Faible
                  </span>
                  <span className="truncate font-medium">Fuite de technologie (X-Powered-By)</span>
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] text-kx-muted">
                Démonstration animée · résultats illustratifs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="border-y border-kx-border bg-kx-bg">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-kx-border px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="py-10 text-center sm:px-6">
            <p className="font-display text-4xl font-semibold sm:text-5xl">15</p>
            <p className="mt-2 text-sm text-kx-muted">analyseurs de sécurité orchestrés</p>
          </div>
          <div className="py-10 text-center sm:px-6">
            <p className="font-display text-4xl font-semibold sm:text-5xl">6</p>
            <p className="mt-2 text-sm text-kx-muted">phases d’analyse, de la reconnaissance au rapport</p>
          </div>
          <div className="py-10 text-center sm:px-6">
            <p className="font-display text-4xl font-semibold sm:text-5xl">3</p>
            <p className="mt-2 text-sm text-kx-muted">scans offerts à l’inscription</p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="fonctionnement" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-kx-muted">Fonctionnement</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-5xl">
            Votre premier audit en trois étapes.
          </h2>
        </div>

        <div className="steps relative mt-14">
          <div className="steps-line absolute left-0 right-0 top-7 hidden h-px bg-black md:block" />
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((st) => (
              <li key={st.n} className="step relative">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-black font-display text-lg font-semibold text-white ring-8 ring-white">
                  {st.n}
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold">{st.title}</h3>
                <p className="mt-2 text-kx-muted">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="scroll-mt-24 bg-kx-navy py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/50">Fonctionnalités</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-5xl">
              Tout ce qu’un attaquant regarderait. Avant lui.
            </h2>
          </div>

          <div className="features mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="feature group bg-kx-navy p-7 transition-colors duration-300 hover:bg-white/[.04]"
              >
                <span className="mb-5 block h-px w-10 bg-white/40 transition-all duration-500 group-hover:w-20 group-hover:bg-white" />
                <h3 className="font-display text-xl font-semibold">{feat.title}</h3>
                <p className="mt-2 text-white/60">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Demo Section */}
      <section className="report mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-kx-muted">Rapports</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-5xl">
            Des résultats que toute l’équipe comprend.
          </h2>
          <p className="mt-5 text-lg text-kx-muted">
            Les vulnérabilités sont regroupées, classées par gravité et accompagnées d’un correctif concret. Téléchargez le rapport détaillé en PDF pour vos équipes ou vos clients.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Explications en français, sans jargon inutile',
              'Priorisation par gravité',
              'Rapport PDF, HTML ou JSON',
              'Historique de tous vos audits',
            ].map((it) => (
              <li key={it} className="flex items-center gap-3">
                <IconCheck className="h-5 w-5 text-black shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-3xl border border-kx-border bg-white p-5 shadow-card sm:p-7">
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 110 110" className="h-28 w-28 -rotate-90">
              <circle cx="55" cy="55" r="48" fill="none" stroke="#f4f4f5" strokeWidth="10" />
              <circle
                className="score-ring"
                cx="55"
                cy="55"
                r="48"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="302"
                strokeDashoffset="85"
              />
            </svg>
            <div>
              <p className="text-sm text-kx-muted">Score de sécurité</p>
              <p className="font-display text-4xl font-semibold">
                72<span className="text-xl text-kx-muted">/100</span>
              </p>
              <p className="text-xs text-kx-muted">Exemple illustratif</p>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {[
              { l: 'Critique', w: '8%', c: 'bg-sev-critical', n: 0 },
              { l: 'Élevée', w: '30%', c: 'bg-sev-high', n: 2 },
              { l: 'Moyenne', w: '55%', c: 'bg-sev-medium', n: 4 },
              { l: 'Faible', w: '80%', c: 'bg-sev-low', n: 7 },
            ].map((row) => (
              <div key={row.l} className="grid grid-cols-[80px_1fr_24px] items-center gap-3 text-sm">
                <span className="text-kx-muted">{row.l}</span>
                <span className="h-2.5 rounded-full bg-kx-panel2">
                  <span className={`block h-full rounded-full ${row.c}`} style={{ width: row.w }} />
                </span>
                <span className="text-right font-semibold">{row.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="scroll-mt-24 border-t border-kx-border bg-kx-bg py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-kx-muted">Tarifs</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-5xl">
              Payez ce que vous scannez.
            </h2>
            <p className="mt-4 text-kx-muted">
              Commencez gratuitement, puis achetez des crédits ou abonnez-vous pour une surveillance continue.
            </p>
          </div>

          <div className="plans mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {plans.map((pl) => (
              <div
                key={pl.name}
                className={`plan flex flex-col rounded-3xl border p-6 ${
                  pl.highlight
                    ? 'border-black bg-black text-white shadow-2xl lg:-translate-y-3'
                    : 'border-kx-border bg-white'
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wider ${pl.highlight ? 'text-white/60' : 'text-kx-muted'}`}>
                  {pl.tag}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{pl.name}</h3>
                <p className="mt-4 font-display text-3xl font-semibold">{pl.price}</p>
                <ul className={`mt-6 space-y-2.5 text-sm ${pl.highlight ? 'text-white/80' : 'text-kx-muted'}`}>
                  {pl.items.map((it, idx) => (
                    <li key={idx} className="flex gap-2">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <p className={`mt-6 text-xs ${pl.highlight ? 'text-white/50' : 'text-kx-muted'}`}>
                  {pl.note}
                </p>
                <button
                  onClick={() => onNavigate(authed ? '/credits' : '/register')}
                  className={`mt-6 inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    pl.highlight
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'border border-kx-border hover:border-black'
                  }`}
                >
                  {pl.btnText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta relative isolate overflow-hidden bg-kx-navy py-28 text-white">
        <svg
          viewBox="0 0 1200 560"
          preserveAspectRatio="xMidYMid slice"
          className="cta-circuit pointer-events-none absolute inset-0 -z-10 h-full w-full text-white/10"
          aria-hidden="true"
        >
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {circuitPaths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g fill="currentColor">
            {circuitCircles.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6" />
            ))}
          </g>
        </svg>

        <div className="mx-auto max-w-3xl px-4 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold sm:text-6xl">
            Votre surface d’attaque, enfin visible.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
            Créez votre compte et lancez votre premier scan en quelques minutes.
          </p>
          <button
            onClick={() => onNavigate(authed ? '/scans/new' : '/register')}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black transition hover:bg-zinc-200"
          >
            <span>{authed ? 'Lancer un scan' : 'Commencer gratuitement'}</span>
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-kx-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-kx-muted sm:px-8">
          <Logo />
          <nav className="flex gap-5" aria-label="Pied de page">
            <button
              onClick={() => onNavigate('/terms')}
              className="hover:text-black transition"
            >
              Conditions d’utilisation
            </button>
            <button
              onClick={() => onNavigate(authed ? '/dashboard' : '/login')}
              className="hover:text-black transition"
            >
              {authed ? 'Dashboard' : 'Connexion'}
            </button>
          </nav>
          <p>© {new Date().getFullYear()} Kortex Defender</p>
        </div>
      </footer>
    </div>
  );
}
