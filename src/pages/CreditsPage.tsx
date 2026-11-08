import React, { useState, useEffect } from 'react';
import { TransactionItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { IconCheck, IconGift } from '../components/Icons';

export function CreditsPage() {
  const { user, creditsData, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemErr, setRedeemErr] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/k/credits/me/transactions');
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.data?.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemMsg('');
    setRedeemErr('');
    if (!voucherCode.trim()) return;

    setRedeeming(true);
    try {
      const res = await fetch('/api/k/credits/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Code invalide ou expiré.');
      }
      setRedeemMsg(data.msg || 'Crédits ajoutés avec succès !');
      setVoucherCode('');
      await refreshUser();
      await fetchTransactions();
    } catch (err: any) {
      setRedeemErr(err.message || 'Erreur lors de l’activation.');
    } finally {
      setRedeeming(false);
    }
  };

  const packs = [
    {
      name: 'Essentiel',
      price: '1 000 FCFA',
      credits: 10,
      tag: 'Pour essayer',
      desc: 'Idéal pour un premier audit complet de votre application.',
    },
    {
      name: 'Starter',
      price: '2 000 FCFA',
      credits: 20,
      tag: 'Paiement à l’utilisation',
      desc: 'Rapports détaillés et alertes par email.',
    },
    {
      name: 'Premium',
      price: '5 000 FCFA / mois',
      credits: 60,
      highlight: true,
      tag: 'Offre recommandée',
      desc: 'Surveillance planifiée, alertes WhatsApp et priorité absolue.',
    },
    {
      name: 'Premium Plus',
      price: 'Sur devis',
      credits: 'Sur mesure',
      tag: 'Entreprise',
      desc: 'Multi-domaines et quotas de crédits personnalisés.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-semibold sm:text-2xl md:text-3xl">
          Crédits &amp; offres
        </h1>
        <p className="mt-1.5 text-sm text-kx-muted sm:text-base">
          Votre solde, vos codes et l’historique de consommation.
        </p>
      </div>

      {/* Balance & Voucher Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="card lg:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-kx-muted">Solde disponible</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold">
                {creditsData?.credits ?? user?.credits ?? 0}
              </span>
              <span className="text-sm font-medium text-kx-muted">crédits</span>
            </div>
            <p className="mt-2 text-xs text-kx-muted">
              + <b>{creditsData?.free_scans ?? user?.free_scans ?? 0}</b> scan(s) de découverte offerts
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-kx-panel2 p-3 text-xs text-kx-muted">
            <span className="font-semibold text-black block mb-1">Barème de décompte :</span>
            <span>Scan Rapide = 1 crédit · Standard = 2 crédits · Approfondi = 4 crédits.</span>
          </div>
        </div>

        {/* Voucher Redemption Form */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <IconGift className="h-5 w-5 text-black" />
            <h2 className="card-title mb-0">Activer un code promo ou bon de recharge</h2>
          </div>
          <p className="text-xs text-kx-muted">
            Entrez votre code de réduction ou code cadeau pour créditer instantanément votre compte.
          </p>

          <form onSubmit={handleRedeem} className="flex flex-wrap gap-2 pt-2">
            <input
              type="text"
              placeholder="Ex: PROMO50, DEFENDER2026..."
              className="input flex-1 min-w-[200px] uppercase font-mono"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button type="submit" disabled={redeeming || !voucherCode} className="btn">
              {redeeming ? 'Activation…' : 'Appliquer le code'}
            </button>
          </form>

          {redeemMsg && <p className="alert-ok text-xs">{redeemMsg}</p>}
          {redeemErr && <p className="alert-err text-xs">{redeemErr}</p>}
        </div>
      </div>

      {/* Pricing Packs Grid */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Recharger des crédits</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pk) => (
            <div
              key={pk.name}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition ${
                pk.highlight
                  ? 'border-black bg-black text-white shadow-xl'
                  : 'border-kx-border bg-white text-kx-text'
              }`}
            >
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    pk.highlight ? 'text-white/60' : 'text-kx-muted'
                  }`}
                >
                  {pk.tag}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold">{pk.name}</h3>
                <p className="mt-3 font-display text-2xl font-bold">{pk.price}</p>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    pk.highlight ? 'text-white/80' : 'text-kx-muted'
                  }`}
                >
                  {pk.desc}
                </p>
              </div>

              <button
                onClick={() => setCheckoutModal(pk.name)}
                className={`mt-6 rounded-full py-2.5 text-xs font-semibold transition ${
                  pk.highlight
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'border border-kx-border hover:border-black'
                }`}
              >
                {pk.name === 'Premium Plus' ? 'Nous contacter' : 'Choisir ce pack'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Simulation Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-display text-xl font-semibold">Paiement sécurisé · {checkoutModal}</h3>
            <p className="text-sm text-kx-muted">
              Paiement direct disponible par Mobile Money (Wave, Orange Money, MTN MoMo, Moov) ou carte bancaire.
            </p>
            <div className="rounded-xl border border-kx-border bg-kx-panel2 p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span>Article :</span>
                <span className="font-semibold">{checkoutModal}</span>
              </div>
              <div className="flex justify-between">
                <span>Devise :</span>
                <span className="font-semibold">FCFA (XOF)</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setCheckoutModal(null)} className="btn-ghost btn-sm">
                Fermer
              </button>
              <button
                onClick={async () => {
                  alert('Paiement initié avec succès ! Les crédits sont ajoutés à votre compte.');
                  setCheckoutModal(null);
                  await fetch('/api/k/credits/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: checkoutModal.toUpperCase() }),
                  });
                  await refreshUser();
                  await fetchTransactions();
                }}
                className="btn btn-sm"
              >
                Simuler le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="card">
        <h2 className="card-title">Historique des transactions et consommations</h2>

        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-kx-muted">
            Aucune transaction enregistrée.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-b border-kx-border text-xs text-kx-muted uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Motif</th>
                  <th className="pb-3 font-semibold">Variation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kx-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-kx-panel2/50 transition">
                    <td className="py-3 text-xs text-kx-muted">
                      {new Date(tx.created_time).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 text-xs capitalize font-medium">
                      {tx.kind === 'free_scan' ? 'Scan offert' : 'Crédit'}
                    </td>
                    <td className="py-3 text-sm">
                      {tx.note || (tx.reason === 'scan_debit' ? 'Débit audit' : 'Attribution')}
                    </td>
                    <td className="py-3 font-mono text-sm font-semibold">
                      <span className={tx.delta > 0 ? 'text-teal-700' : 'text-red-600'}>
                        {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                      </span>
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
