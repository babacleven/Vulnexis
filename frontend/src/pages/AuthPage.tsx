import React, { useState, useEffect } from 'react';
import { Logo, IconCheck } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot' | 'admin';
  onNavigate: (path: string) => void;
}

export function AuthPage({ mode: initialMode, onNavigate }: AuthPageProps) {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OTP view state
  const [otpRequiredEmail, setOtpRequiredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'done'>('email');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setInfo('');
    setSuccess('');
  }, [initialMode]);

  useEffect(() => {
    // Check promo / ref in localStorage
    try {
      const ref = localStorage.getItem('kx_ref') || localStorage.getItem('kx_promo') || '';
      if (ref) setPromoCode(ref);
    } catch (e) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSuccess('');

    if (mode === 'register') {
      if (password.length < 8 || !/^\p{Lu}/u.test(password)) {
        setError('Le mot de passe doit faire au moins 8 caractères et commencer par une majuscule.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (!/^\+?\d[\d\s]{7,}$/.test(phone.trim())) {
        setError('Entrez un numéro WhatsApp valide (indicatif + numéro).');
        return;
      }
      if (!acceptTerms) {
        setError('Acceptez les conditions d’utilisation pour créer votre compte.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await register(email, password, phone, promoCode || undefined);
        if (res.otp_required) {
          setOtpRequiredEmail(res.email || email);
          setSubmitting(false);
          return;
        }
        onNavigate('/dashboard');
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'inscription.");
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'login' || mode === 'admin') {
      setSubmitting(true);
      try {
        await login(email, password);
        onNavigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Identifiants incorrects.');
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'forgot') {
      if (forgotStep === 'email') {
        if (!email) {
          setError('Veuillez saisir votre email.');
          return;
        }
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
          setForgotStep('otp');
          setInfo('Un code de réinitialisation vous a été envoyé.');
        }, 800);
      } else if (forgotStep === 'otp') {
        if (password.length < 8 || !/^\p{Lu}/u.test(password)) {
          setError('Le mot de passe doit faire au moins 8 caractères et commencer par une majuscule.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas.');
          return;
        }
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
          setForgotStep('done');
          setSuccess('Mot de passe modifié avec succès !');
        }, 800);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await verifyOtp(otpRequiredEmail, otpCode);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Code invalide.');
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await resendOtp(otpRequiredEmail);
      setSuccess('Un nouveau code a été envoyé sur WhatsApp.');
    } catch (err: any) {
      setError(err.message || "Impossible d'envoyer le code.");
    }
  };

  return (
    <div className="min-h-screen bg-kx-navy text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-10 sm:px-8 lg:grid-cols-2">
        {/* Left column hero banner */}
        <section className="hidden lg:block">
          <h1 className="font-display text-5xl font-semibold leading-[1.1]">
            Trouvez vos failles <span className="text-white/55">avant les attaquants.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/70">
            Kortex Defender audite vos applications web et vos API, et vous dit quoi corriger en priorité.
          </p>
          <ul className="mt-10 space-y-4">
            <li className="flex items-center gap-3 text-white/85">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white">
                <IconCheck className="h-4 w-4" />
              </span>
              <span>Analyse de vos sites et API en quelques minutes</span>
            </li>
            <li className="flex items-center gap-3 text-white/85">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white">
                <IconCheck className="h-4 w-4" />
              </span>
              <span>Vulnérabilités expliquées en français, avec le correctif</span>
            </li>
            <li className="flex items-center gap-3 text-white/85">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white">
                <IconCheck className="h-4 w-4" />
              </span>
              <span>Rapports détaillés et historique de vos audits</span>
            </li>
          </ul>
          <p className="mt-12 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75">
            3 scans de découverte offerts, sans carte bancaire.
          </p>
        </section>

        {/* Right column form container */}
        <section className="mx-auto w-full max-w-md">
          {otpRequiredEmail ? (
            /* WhatsApp OTP verification screen */
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-5 rounded-3xl bg-white p-6 text-kx-text shadow-2xl sm:p-8"
              noValidate
            >
              <div className="mb-2 flex justify-center">
                <Logo size="lg" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold">Vérifiez votre compte</h2>
                <p className="mt-1 text-sm text-kx-muted">
                  Un code a été envoyé par WhatsApp. Saisissez-le pour activer <b>{otpRequiredEmail}</b>.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="otp">
                  Code de vérification
                </label>
                <input
                  id="otp"
                  className="input text-center text-2xl tracking-[0.4em] font-mono"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="______"
                  autoFocus
                />
              </div>

              {success && <p className="alert-ok">{success}</p>}
              {error && <p className="alert-err">{error}</p>}

              <button
                type="submit"
                className="btn w-full py-3 text-base"
                disabled={submitting || otpCode.length < 4}
              >
                {submitting ? 'Vérification…' : 'Valider'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setOtpRequiredEmail('');
                    setError('');
                  }}
                  className="text-kx-muted hover:text-black hover:underline"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-black underline underline-offset-4"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          ) : (
            /* Main login / register / forgot form */
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-3xl bg-white p-6 text-kx-text shadow-2xl sm:p-8"
              noValidate
            >
              <div className="mb-2 flex justify-center">
                <button type="button" onClick={() => onNavigate('/')}>
                  <Logo size="lg" />
                </button>
              </div>

              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {mode === 'register'
                    ? 'Créer votre compte'
                    : mode === 'admin'
                    ? 'Console administrateur'
                    : mode === 'forgot'
                    ? 'Mot de passe oublié'
                    : 'Bon retour parmi nous'}
                </h2>
                <p className="mt-1 text-sm text-kx-muted">
                  {mode === 'register' && promoCode ? (
                    <>
                      Code promo <b className="font-mono">{promoCode.toUpperCase()}</b> appliqué · 3 scans de découverte offerts.
                    </>
                  ) : mode === 'register' ? (
                    '3 scans de découverte offerts à l’inscription.'
                  ) : mode === 'admin' ? (
                    'Accès réservé aux opérateurs Kortex.'
                  ) : mode === 'forgot' ? (
                    'Entrez votre email pour réinitialiser votre accès.'
                  ) : (
                    'Connectez-vous pour suivre vos audits.'
                  )}
                </p>
              </div>

              {info && <p className="alert-info">{info}</p>}
              {success && <p className="alert-ok">{success}</p>}
              {error && <p className="alert-err">{error}</p>}

              {/* Forgot password Step: Done */}
              {mode === 'forgot' && forgotStep === 'done' ? (
                <div className="space-y-4">
                  <p className="text-sm text-kx-muted">
                    Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="btn w-full py-3 text-base"
                  >
                    Se connecter
                  </button>
                </div>
              ) : (
                <>
                  {/* Email field */}
                  <div>
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className="input"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Register WhatsApp Phone field */}
                  {mode === 'register' && (
                    <div>
                      <label className="label" htmlFor="phone">
                        Numéro WhatsApp
                      </label>
                      <input
                        id="phone"
                        className="input"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="225 01 52 31 11 24"
                      />
                      <p className="hint">
                        Ex. 07 88 01 62 04 (Côte d’Ivoire) ou +33 6… pour l’étranger. Vous recevrez un code par WhatsApp.
                      </p>
                    </div>
                  )}

                  {/* Password field */}
                  {(mode !== 'forgot' || forgotStep === 'otp') && (
                    <div>
                      <label className="label" htmlFor="password">
                        Mot de passe
                      </label>
                      <input
                        id="password"
                        className="input"
                        type="password"
                        required
                        minLength={mode === 'register' ? 8 : undefined}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {mode === 'register' && (
                        <p className="hint">Au moins 8 caractères, commençant par une majuscule.</p>
                      )}
                      {mode === 'login' && (
                        <p className="mt-1.5 text-right text-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setMode('forgot');
                              setForgotStep('email');
                              setError('');
                            }}
                            className="text-kx-muted underline-offset-4 hover:text-black hover:underline"
                          >
                            Mot de passe oublié ?
                          </button>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Confirm password field */}
                  {(mode === 'register' || (mode === 'forgot' && forgotStep === 'otp')) && (
                    <div>
                      <label className="label" htmlFor="confirm">
                        Confirmer le mot de passe
                      </label>
                      <input
                        id="confirm"
                        className="input"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Terms acceptance checkbox */}
                  {mode === 'register' && (
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-kx-muted">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 accent-black"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                      />
                      <span>
                        J’accepte les{' '}
                        <button
                          type="button"
                          onClick={() => onNavigate('/terms')}
                          className="font-semibold text-black underline underline-offset-4"
                        >
                          conditions d’utilisation
                        </button>
                        .
                      </span>
                    </label>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn w-full py-3 text-base"
                    disabled={submitting || !email || (mode !== 'forgot' && !password)}
                  >
                    {submitting
                      ? 'Patientez…'
                      : mode === 'register'
                      ? 'Créer mon compte'
                      : mode === 'forgot'
                      ? forgotStep === 'email'
                        ? 'Envoyer le code'
                        : 'Changer le mot de passe'
                      : 'Se connecter'}
                  </button>

                  {/* Bottom switcher between login and register */}
                  {mode !== 'admin' && (
                    <p className="text-center text-sm text-kx-muted">
                      {mode === 'register' ? (
                        <>
                          Déjà inscrit ?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black"
                          >
                            Se connecter
                          </button>
                        </>
                      ) : mode === 'forgot' ? (
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black"
                        >
                          Retour à la connexion
                        </button>
                      ) : (
                        <>
                          Pas encore de compte ?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('register')}
                            className="font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black"
                          >
                            Créer un compte
                          </button>
                        </>
                      )}
                    </p>
                  )}
                </>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
