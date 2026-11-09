import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  authed?: boolean;
}

interface LogEntry {
  id: number;
  time: string;
  tag: 'system' | 'agent' | 'logic';
  tagLabel: string;
  msg: string;
  isOk?: boolean;
}

export function LandingPage({ onNavigate, authed }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live execution log stream
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, time: '02:14:08', tag: 'system', tagLabel: '[SYS]', msg: 'Consensus verified across 48 edge nodes', isOk: true },
    { id: 2, time: '02:14:09', tag: 'agent', tagLabel: '[AGT]', msg: 'agent-04 rebalanced egress queue in us-east-2' },
    { id: 3, time: '02:14:11', tag: 'logic', tagLabel: '[LOG]', msg: 'P99 threshold tuned: 14ms -> 8.2ms' },
    { id: 4, time: '02:14:12', tag: 'agent', tagLabel: '[AGT]', msg: 'Cert rotated for mesh.internal (SHA-384)' },
    { id: 5, time: '02:14:14', tag: 'system', tagLabel: '[SYS]', msg: 'Kafka broker memory reclaimed, GC 0ms', isOk: true }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timer to append log lines like the real template
  useEffect(() => {
    const streamItems: { tag: 'system' | 'agent' | 'logic'; tagLabel: string; msg: string; isOk?: boolean }[] = [
      { tag: 'agent', tagLabel: '[AGT]', msg: 'Auto-scaled worker pool in eu-west-1 (replica 12 -> 8)' },
      { tag: 'logic', tagLabel: '[LOG]', msg: 'BGP peering path optimized via Frankfurt IX (rtt -18ms)' },
      { tag: 'system', tagLabel: '[SYS]', msg: 'Database read replica sync delta: 0ms lag', isOk: true },
      { tag: 'agent', tagLabel: '[AGT]', msg: 'Security rule synthesis blocked unauthorized RPC vector' },
      { tag: 'logic', tagLabel: '[LOG]', msg: 'Canary deployment v2.18 evaluated: error rate 0.00%', isOk: true },
      { tag: 'system', tagLabel: '[SYS]', msg: 'eBPF probe telemetry stream healthy on all hosts', isOk: true }
    ];

    let count = 6;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const item = streamItems[Math.floor(Math.random() * streamItems.length)];

      setLogs((prev) => {
        const next = [...prev, { id: count++, time: timeStr, ...item }];
        return next.slice(-5);
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ---------- Global dashed engineering grid ---------- */}
      <div className="bg-base" aria-hidden="true">
        <div className="grid-v" />
        <div className="grid-h" />
        <div className="grid-dots" />
      </div>

      {/* ---------- NAV (Fixed 72px) ---------- */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="rail nav-inner">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="brand"
          >
            <div className="brand-glyph" />
            <span className="brand-word">HALCYON</span>
          </a>

          <div className="nav-links">
            <div className="nav-item has-mega">
              <button className="nav-link" type="button">
                Platform
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Hover-reveal Mega Menu */}
              <div className="mega">
                <div className="mega-inner">
                  <div className="mega-feature">
                    <div className="mega-feature-vis">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <h5>Autonomous Consensus</h5>
                    <p>Distributed Raft engine managing zero-touch operations across your fleet.</p>
                    <span className="mega-feature-cta">Explore Architecture →</span>
                  </div>

                  <div className="mega-cols">
                    <div className="mega-col">
                      <h6>Engine</h6>
                      <a href="#features">
                        <strong>Execution Fabrics</strong>
                        <span>Zero-overhead agent runtime</span>
                      </a>
                      <a href="#how">
                        <strong>Raft Consensus</strong>
                        <span>Distributed cluster state</span>
                      </a>
                      <a href="#features">
                        <strong>eBPF Probing</strong>
                        <span>Kernel-level telemetry</span>
                      </a>
                    </div>
                    <div className="mega-col">
                      <h6>Reliability</h6>
                      <a href="#features">
                        <strong>Self-Healing</strong>
                        <span>Automated closed loops</span>
                      </a>
                      <a href="#features">
                        <strong>Policy Guardrails</strong>
                        <span>Deterministic OPA bounds</span>
                      </a>
                      <a href="#pricing">
                        <strong>Enterprise SLA</strong>
                        <span>99.999% availability</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a href="#features" className="nav-link">Agents</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#how" className="nav-link">Docs</a>
          </div>

          <div className="nav-cta">
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/login');
              }}
              className="ghost-link"
            >
              Sign In
            </a>
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/register');
              }}
              className="btn btn-solid roll"
            >
              <span className="roll-stack">
                <span>Get Started</span>
                <span>Deploy Mesh</span>
              </span>
            </a>
          </div>

          <button
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Agents</a>
        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
        <a href="#how" onClick={() => setMobileMenuOpen(false)}>Docs</a>
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onNavigate('/login');
          }}
        >
          Sign In
        </a>
        <a
          href="/register"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            onNavigate('/register');
          }}
          className="btn btn-solid"
        >
          Get Started
        </a>
      </div>

      <main>
        {/* ---------- HERO SECTION ---------- */}
        <section className="hero">
          <div className="rail hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">Autonomous Ops · Now in GA</span>
              <h1 className="hero-h1">
                Deploy autonomous agents that run your operations while you sleep.
              </h1>
              <p className="hero-sub">
                Self-healing incident loops, proactive infrastructure balancing, and zero-touch deployments orchestrated across your entire distributed cloud.
              </p>

              <div className="hero-actions center">
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/register');
                  }}
                  className="btn btn-solid roll"
                >
                  <span className="roll-stack">
                    <span>Start Free Trial</span>
                    <span>Launch Control Mesh</span>
                  </span>
                </a>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/login');
                  }}
                  className="btn btn-ghost"
                >
                  Explore Live Demo
                </a>
              </div>

              <div className="hero-trustline">
                <span className="dot-live" />
                <span>Consensus locked across 48 edge nodes</span>
              </div>
            </div>

            {/* DASHBOARD MOCKUP */}
            <div className="dash-wrap">
              <div className="dash-glow" aria-hidden="true">
                <div className="glow-grid" />
                <div className="glow-aura glow-teal" />
                <div className="glow-aura glow-core" />
                <div className="glow-aura glow-violet" />
                <div className="glow-flare" />
              </div>

              <div className="dash-rim" />

              <div className="dash">
                {/* Dashboard Left Sidebar */}
                <aside className="dash-side">
                  <div className="dash-logo">
                    <div className="dash-logo-mark" />
                    <span className="dash-logo-word">CONTROL</span>
                  </div>

                  <nav className="dash-nav">
                    <div className="dash-navitem active">
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <i>Overview</i>
                    </div>
                    <div className="dash-navitem">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <i>Active Agents</i>
                    </div>
                    <div className="dash-navitem">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                      </svg>
                      <i>Live Mesh</i>
                    </div>
                    <div className="dash-navitem">
                      <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <i>Audit Logs</i>
                    </div>
                    <div className="dash-navitem">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      <i>Settings</i>
                    </div>
                  </nav>

                  <div className="dash-side-foot">
                    <div className="dash-orb" />
                    <div>
                      <strong>Cluster 01</strong>
                      <span>eu-central · active</span>
                    </div>
                  </div>
                </aside>

                {/* Dashboard Main Area */}
                <div className="dash-main">
                  <div className="dash-head">
                    <div className="dash-crumb">
                      cluster-01 / <b>eu-central</b> / <i>mesh-runtime</i>
                    </div>
                    <div className="dash-status">
                      <span className="pulse" />
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="dash-body">
                    {/* Row 2: Objectives & Live Execution Log */}
                    <div className="dash-row2">
                      <div className="dash-card">
                        <h4>System Objectives</h4>
                        <p>
                          Target: <span className="accent">Zero-toil incident loop</span>
                        </p>
                        <ul>
                          <li>
                            <span className="arr">→</span>
                            <span>Auto-drain unhealthy canary pods</span>
                          </li>
                          <li>
                            <span className="arr">→</span>
                            <span>Dynamic latency-aware egress routing</span>
                          </li>
                          <li>
                            <span className="arr">→</span>
                            <span>Proactive Kafka partition rebalancing</span>
                          </li>
                        </ul>
                      </div>

                      <div className="dash-card dash-log">
                        <h4>Live Execution Log</h4>
                        <div className="log-stream">
                          {logs.map((log) => (
                            <div key={log.id} className="log-line">
                              <span className="log-time">{log.time}</span>
                              <span className={`log-tag ${log.tag}`}>{log.tagLabel}</span>
                              <span className={`log-msg ${log.isOk ? 'ok' : ''}`}>{log.msg}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metrics 3-Up Row */}
                    <div className="dash-metrics">
                      <div className="metric">
                        <b>99.994%</b>
                        <span>Mesh Availability</span>
                      </div>
                      <div className="metric">
                        <b>14.2k</b>
                        <span>Autonomous Ops / Day</span>
                      </div>
                      <div className="metric">
                        <b>&lt; 8ms</b>
                        <span>P99 Telemetry Latency</span>
                      </div>
                    </div>

                    {/* Audit History List */}
                    <div className="dash-audit">
                      <div className="audit-head">
                        <span>Audit History</span>
                        <i>Past 60 min</i>
                      </div>
                      <div className="audit-row">
                        <span className="adot teal" />
                        <p>Rebalanced egress partition queue in us-east-2</p>
                        <i>Just now</i>
                      </div>
                      <div className="audit-row">
                        <span className="adot violet" />
                        <p>Rotated mTLS certificates for service mesh</p>
                        <i>4m ago</i>
                      </div>
                      <div className="audit-row">
                        <span className="adot" />
                        <p>Auto-scaled worker pool to meet ingress spike</p>
                        <i>18m ago</i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- TRUST MARQUEE ---------- */}
        <section className="trust">
          <div className="rail">
            <div className="trust-inner">
              <div className="trust-head">Trusted by engineering teams</div>
              <div className="marquee">
                <div className="marquee-track">
                  <span>VORTEX SYSTEMS</span>
                  <span>KINSHIP AI</span>
                  <span>APEX LABS</span>
                  <span>KRONOS CLOUD</span>
                  <span>STRATA SCALE</span>
                  <span>SYNTHEX</span>
                  <span>HYPERION DATA</span>
                  <span>VORTEX SYSTEMS</span>
                  <span>KINSHIP AI</span>
                  <span>APEX LABS</span>
                  <span>KRONOS CLOUD</span>
                  <span>STRATA SCALE</span>
                  <span>SYNTHEX</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FEATURE GRID ("ONE MESH, EVERY WORKFLOW") ---------- */}
        <section className="features" id="features">
          <div className="rail">
            <div className="sec-head">
              <span className="eyebrow">Engineered for Autonomy</span>
              <h2>One mesh, every workflow.</h2>
              <p>Consolidate fragmented scripts into deterministic, cryptographic closed loops.</p>
            </div>

            <div className="feat-grid">
              {/* Wide Feature Card with Node Graph SVG */}
              <div className="feat-card feat-wide">
                <div className="feat-vis">
                  <svg className="node-graph" viewBox="0 0 600 150">
                    <g className="edges">
                      <line x1="60" y1="75" x2="200" y2="45" stroke="rgba(22, 224, 198, 0.3)" strokeDasharray="4 4" />
                      <line x1="200" y1="45" x2="360" y2="105" stroke="rgba(22, 224, 198, 0.3)" strokeDasharray="4 4" />
                      <line x1="360" y1="105" x2="520" y2="60" stroke="rgba(22, 224, 198, 0.3)" strokeDasharray="4 4" />
                    </g>
                    <g className="nodes">
                      <circle cx="60" cy="75" r="7" />
                      <circle cx="200" cy="45" r="9" />
                      <circle cx="360" cy="105" r="9" fill="#8b5cf6" />
                      <circle cx="520" cy="60" r="7" />
                    </g>
                  </svg>
                </div>
                <div className="feat-meta">
                  <span className="feat-ico">
                    <svg viewBox="0 0 24 24">
                      <polygon points="12 2 2 12 12 22 22 12 12 2" />
                    </svg>
                  </span>
                  <h3>Continuous Graph Topology &amp; Consensus</h3>
                  <p>Distributed agents synchronize via lightweight Raft consensus. When nodes degrade, routing heals in sub-seconds.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="feat-card">
                <span className="feat-ico">
                  <svg viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </span>
                <h3>eBPF Kernel Probing</h3>
                <p>Extract deep system telemetry without sidecars or runtime overhead. Direct socket filtering at wire speed.</p>
              </div>

              {/* Card 3 */}
              <div className="feat-card">
                <span className="feat-ico">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <h3>Cryptographic Ledger</h3>
                <p>Every automated action is hashed and recorded in a tamper-proof audit chain with full rollback guarantees.</p>
              </div>

              {/* Card 4 */}
              <div className="feat-card">
                <span className="feat-ico">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <h3>Policy-as-Code Limits</h3>
                <p>Strict OPA / Rego contracts prevent runaway loops. Hard limits on blast radius and destructive mutations.</p>
              </div>

              {/* Card 5 */}
              <div className="feat-card">
                <span className="feat-ico">
                  <svg viewBox="0 0 24 24">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </span>
                <h3>Native CI/CD Sync</h3>
                <p>Automate promotion gates, canary rollouts, and rollback triggers straight from your existing Git repositories.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="how" id="how">
          <div className="rail">
            <div className="sec-head">
              <span className="eyebrow">Deterministic Execution</span>
              <h2>Connect. Orchestrate. Autonomous.</h2>
              <p>Three predictable stages to transition from manual toil to autonomous reliability.</p>
            </div>

            <div className="steps">
              <div className="step-line" />
              <div className="step">
                <div className="step-node">01</div>
                <h3>Connect</h3>
                <p>Install the lightweight agent across your clusters. Discovery completes in under 60 seconds.</p>
              </div>
              <div className="step">
                <div className="step-node">02</div>
                <h3>Orchestrate</h3>
                <p>Specify operational intents and SLA boundaries. The engine compiles rules into distributed state graphs.</p>
              </div>
              <div className="step">
                <div className="step-node">03</div>
                <h3>Autonomous</h3>
                <p>Agents observe, predict, and auto-heal failures 24/7 without opening incident bridges.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- STATS BAND ---------- */}
        <section className="stats">
          <div className="rail">
            <div className="stats-inner">
              <div className="stat">
                <b>4.8M+</b>
                <span>Ops / Month</span>
              </div>
              <div className="stat">
                <b>&lt; 1.2s</b>
                <span>Mean MTTR</span>
              </div>
              <div className="stat">
                <b>99.999%</b>
                <span>Policy Fidelity</span>
              </div>
              <div className="stat">
                <b>0</b>
                <span>Runbook Pages</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- PRICING ---------- */}
        <section className="pricing" id="pricing">
          <div className="rail">
            <div className="sec-head">
              <span className="eyebrow">Predictable Scale</span>
              <h2>Transparent, usage-aligned tiers.</h2>
              <p>Start in development for free. Scale to global multi-cloud clusters seamlessly.</p>
            </div>

            <div className="price-grid">
              {/* Starter */}
              <div className="price-card">
                <h3>Starter</h3>
                <div className="price">
                  <b>$0</b>
                  <span>/ mo</span>
                </div>
                <p className="price-desc">Ideal for staging environments and evaluating automated closed loops.</p>
                <ul>
                  <li>Up to 3 clusters</li>
                  <li>10,000 ops / month</li>
                  <li>Community Discord support</li>
                </ul>
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/register');
                  }}
                  className="btn btn-ghost full"
                >
                  Start Free
                </a>
              </div>

              {/* Scale (Highlighted) */}
              <div className="price-card highlight">
                <span className="pop-pill">Most Popular</span>
                <h3>Scale</h3>
                <div className="price">
                  <b>$490</b>
                  <span>/ mo</span>
                </div>
                <p className="price-desc">For growing production fleets demanding continuous self-healing.</p>
                <ul>
                  <li>Unlimited nodes &amp; clusters</li>
                  <li>500,000 ops / month</li>
                  <li>eBPF telemetry streaming</li>
                  <li>99.99% SLA guarantee</li>
                </ul>
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/register');
                  }}
                  className="btn btn-solid full roll"
                >
                  <span className="roll-stack">
                    <span>Deploy Scale Tier</span>
                    <span>Start 14-Day Trial</span>
                  </span>
                </a>
              </div>

              {/* Enterprise */}
              <div className="price-card">
                <h3>Enterprise</h3>
                <div className="price">
                  <b>Custom</b>
                </div>
                <p className="price-desc">Dedicated control plane instances with bespoke compliance.</p>
                <ul>
                  <li>Air-gapped on-premise mesh</li>
                  <li>Custom OPA policy engines</li>
                  <li>24/7 dedicated SRE incident desk</li>
                </ul>
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/terms');
                  }}
                  className="btn btn-ghost full"
                >
                  Contact Engineering
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CTA BAND ---------- */}
        <section className="cta">
          <div className="cta-glow" aria-hidden="true">
            <div className="cta-grid" />
            <div className="cta-aura" />
          </div>

          <div className="rail cta-inner">
            <span className="eyebrow">Zero-Risk Deployment</span>
            <h2>Ready to automate your production mesh?</h2>
            <p>Deploy your first autonomous loop in less than five minutes. No credit card required.</p>
            <div className="hero-actions center">
              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/register');
                }}
                className="btn btn-solid roll"
              >
                <span className="roll-stack">
                  <span>Get Started with Mesh</span>
                  <span>Launch Mission Control</span>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <div className="rail">
          <div className="foot-inner">
            <div className="foot-brand">
              <div className="brand">
                <div className="brand-glyph" />
                <span className="brand-word">HALCYON</span>
              </div>
              <p>Autonomous operations control plane for modern cloud infrastructure.</p>
            </div>

            <div className="foot-cols">
              <div className="foot-col">
                <h6>Product</h6>
                <a href="#features">Agents</a>
                <a href="#how">Topology</a>
                <a href="#pricing">Pricing</a>
              </div>

              <div className="foot-col">
                <h6>Developers</h6>
                <a href="#how">Documentation</a>
                <a href="#features">eBPF Engine</a>
                <a href="#features">Changelog</a>
              </div>

              <div className="foot-col">
                <h6>Company</h6>
                <a href="#pricing">Security</a>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms')}
                  className="ghost-link"
                  style={{ textAlign: 'left', padding: 0 }}
                >
                  Terms
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms')}
                  className="ghost-link"
                  style={{ textAlign: 'left', padding: 0 }}
                >
                  Privacy
                </button>
              </div>
            </div>
          </div>

          <div className="foot-bottom">
            <div>© {new Date().getFullYear()} Halcyon Mesh, Inc. All rights reserved.</div>
            <div className="foot-state">
              <span className="dot-live" />
              <span>Mesh Status: All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
