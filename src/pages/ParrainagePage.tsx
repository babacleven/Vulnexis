import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconGift, IconCheck } from '../components/Icons';

export function ParrainagePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralCode = 'KORTEX-' + (user?.email?.split('@')[0] || 'DEFENDER').toUpperCase();
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <IconGift className="h-6 w-6 text-black" />
          <h1 className="font-display text-xl font-semibold sm:text-2xl md:text-3xl">
            Programme de parrainage
          </h1>
        </div>
        <p className="mt-1 text-sm text-kx-muted sm:text-base">
          Partagez Kortex Defender avec vos pairs et gagnez des commissions sur leurs recharges.
        </p>
      </div>

      {/* Code card */}
      <div className="card space-y-4">
        <h2 className="card-title mb-1">Votre lien &amp; code de parrainage</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="input flex-1 min-w-[240px] font-mono text-xs select-all bg-kx-panel2"
          />
          <button onClick={handleCopy} className="btn">
            {copied ? (
              <>
                <IconCheck className="h-4 w-4" />
                <span>Lien copié !</span>
              </>
            ) : (
              <span>Copier le lien</span>
            )}
          </button>
        </div>
        <p className="text-xs text-kx-muted">
          Code de réduction direct à renseigner lors du paiement : <b className="font-mono text-black">{referralCode}</b>
        </p>
      </div>

      {/* Explanation & Commission Conditions */}
      <div className="card space-y-4">
        <h2 className="card-title mb-1">Comment fonctionnent les commissions ?</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-kx-muted">
          <li>
            Vos filleuls tapent votre code au paiement et obtiennent une réduction immédiate sur leurs packs de crédits.
          </li>
          <li>
            Vous touchez une commission en argent réel sur chacun de leurs achats pendant 12 mois.
          </li>
          <li>
            Chaque commission reste <span className="font-semibold text-black">en attente 14 jours</span> et n’est validée que si le filleul utilise réellement ses crédits pour auditer ses applications.
          </li>
          <li>
            Les versements sont effectués sans frais par{' '}
            <span className="font-semibold text-black">Wave, Orange Money, MTN MoMo ou Moov Money</span>.
          </li>
        </ul>
      </div>

      {/* Payout Channels Card */}
      <div className="card">
        <h2 className="card-title">Opérateurs de versement supportés</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
          {['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'].map((op) => (
            <div
              key={op}
              className="rounded-2xl border border-kx-border bg-kx-panel2/60 p-4 text-center font-semibold text-sm"
            >
              {op}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
