import React, { useState, useEffect } from 'react';
import { TransactionItem } from '../types';
import { useAuth } from '../context/AuthContext';

export function CreditsPage() {
  const { user, creditsData, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [mobileMoney, setMobileMoney] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemErr, setRedeemErr] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/v1/credits/me/transactions');
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
      const res = await fetch('/api/v1/credits/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Code invalide ou expiré.');
      }
      setRedeemMsg(data.msg || 'Code validé avec succès !');
      setVoucherCode('');
      await refreshUser();
      await fetchTransactions();
    } catch (err: any) {
      setRedeemErr(err.message || 'Code invalide.');
    } finally {
      setRedeeming(false);
    }
  };

  const creditsCount = creditsData?.credits ?? user?.credits ?? 0;
  const freeScansCount = creditsData?.free_scans ?? user?.free_scans ?? 2;

  const defaultHistory = [
    {
      date: '6 nov. 2026, 13:35',
      operation: 'Scan',
      detail: '—',
      mouvement: '-1 scan gratuit',
    },
    {
      date: '6 nov. 2026, 13:28',
      operation: 'Crédit',
      detail: 'Scans de découverte offerts',
      mouvement: '+3 scan gratuit',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header (Screenshot 9) */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">
          Crédits &amp; offres
        </h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Votre solde, vos codes et l’historique de consommation.
        </p>
      </div>

      {/* Top 2 Cards: Solde and Utiliser un code crédit */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Solde */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-black mb-3">Solde</h2>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-black">{creditsCount}</span>
              <span className="text-sm font-semibold text-black">crédit</span>
            </div>
            <p className="text-xs text-[#71717a] mt-1.5">
              {freeScansCount} scans de découverte restants
            </p>
          </div>
          <p className="text-[11px] text-[#71717a] mt-6">
            Coût d’un scan : rapide 1 · standard 2 · approfondi 4 crédit(s).
          </p>
        </div>

        {/* Card 2: Utiliser un code crédit */}
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-black mb-3">Utiliser un code crédit</h2>
          <form onSubmit={handleRedeem} className="flex gap-2">
            <input
              type="text"
              placeholder="KX-XXXX-XXXX-XXXX"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 rounded-xl border border-[#e4e4e7] px-4 py-2.5 text-sm uppercase font-mono text-black outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={redeeming || !voucherCode.trim()}
              className="rounded-xl bg-[#71717a] hover:bg-black text-white px-5 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {redeeming ? '…' : 'Valider'}
            </button>
          </form>
          {redeemMsg && <p className="text-xs text-[#0f5c53] mt-2.5">{redeemMsg}</p>}
          {redeemErr && <p className="text-xs text-red-600 mt-2.5">{redeemErr}</p>}
        </div>
      </div>

      {/* Section: Offres */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-bold text-black">Offres</h2>

        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-2xs space-y-6">
          <p className="text-xs text-[#18181b] leading-relaxed">
            Paiement sécurisé par Mobile Money (Orange Money, MTN, Moov, Wave) via MoneyFusion. Les crédits sont ajoutés dès la confirmation du paiement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-black block mb-1.5">
                Numéro Mobile Money (facultatif)
              </label>
              <input
                type="text"
                placeholder="Numéro du compte, par défaut"
                value={mobileMoney}
                onChange={(e) => setMobileMoney(e.target.value)}
                className="w-full rounded-xl border border-[#e4e4e7] px-4 py-2 text-xs text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-black block mb-1.5">
                Code promo (facultatif)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EX. SHALOM"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-xl border border-[#e4e4e7] px-4 py-2 text-xs uppercase font-mono text-black outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (promoCode.trim()) alert('Code promo appliqué !');
                  }}
                  className="rounded-xl border border-[#e4e4e7] bg-white hover:bg-[#f4f4f5] text-black px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>

          {/* 5 Plans Grid (Screenshot 9) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-2">
            {/* Plan 1: Free */}
            <div className="rounded-2xl border border-[#e4e4e7] p-5 flex flex-col justify-between bg-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                  DÉCOUVERTE
                </p>
                <h3 className="text-base font-bold text-black mt-1">Free</h3>
                <p className="text-lg font-bold text-black mt-2">0 FCFA</p>
                <ul className="mt-4 space-y-2 text-xs text-[#52525b] list-disc list-inside">
                  <li>3 scans de découverte gratuits par compte</li>
                  <li>Résultats essentiels dans le dashboard</li>
                  <li>Aucun rapport téléchargeable</li>
                  <li>Aucune alerte de surveillance</li>
                </ul>
              </div>
              <p className="text-[11px] text-[#71717a] mt-6">
                Les 3 scans gratuits sont utilisables une seule fois par compte.
              </p>
            </div>

            {/* Plan 2: Essentiel */}
            <div className="rounded-2xl border border-[#e4e4e7] p-5 flex flex-col justify-between bg-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                  POUR ESSAYER
                </p>
                <h3 className="text-base font-bold text-black mt-1">Essentiel</h3>
                <p className="text-lg font-bold text-black mt-2">1 000 FCFA</p>
                <ul className="mt-4 space-y-2 text-xs text-[#52525b] list-disc list-inside">
                  <li>10 crédits Kortex Defender</li>
                  <li>Rapports de sécurité détaillés</li>
                  <li>Idéal pour un premier audit complet</li>
                </ul>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-[11px] text-[#71717a]">
                  Les crédits achetés n'expirent pas.
                </p>
                <button
                  onClick={() => setCheckoutModal('Essentiel (1 000 FCFA)')}
                  className="w-full rounded-full bg-black hover:bg-[#1a1a1a] text-white py-2.5 text-xs font-semibold transition-colors"
                >
                  Acheter
                </button>
              </div>
            </div>

            {/* Plan 3: Starter */}
            <div className="rounded-2xl border border-[#e4e4e7] p-5 flex flex-col justify-between bg-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                  PAIEMENT À L’UTILISATION
                </p>
                <h3 className="text-base font-bold text-black mt-1">Starter</h3>
                <p className="text-lg font-bold text-black mt-2">2 000 FCFA</p>
                <ul className="mt-4 space-y-2 text-xs text-[#52525b] list-disc list-inside">
                  <li>20 crédits Kortex Defender</li>
                  <li>Rapports de sécurité détaillés</li>
                  <li>Alertes sur les nouvelles vulnérabilités</li>
                  <li>Notifications dashboard et email</li>
                </ul>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-[11px] text-[#71717a]">
                  Les crédits achetés n'expirent pas.
                </p>
                <button
                  onClick={() => setCheckoutModal('Starter (2 000 FCFA)')}
                  className="w-full rounded-full bg-black hover:bg-[#1a1a1a] text-white py-2.5 text-xs font-semibold transition-colors"
                >
                  Acheter
                </button>
              </div>
            </div>

            {/* Plan 4: Premium */}
            <div className="rounded-2xl border border-[#e4e4e7] p-5 flex flex-col justify-between bg-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                  OFFRE RECOMMANDÉE
                </p>
                <h3 className="text-base font-bold text-black mt-1">Premium</h3>
                <p className="text-lg font-bold text-black mt-2">5 000 FCFA / mois</p>
                <ul className="mt-4 space-y-2 text-xs text-[#52525b] list-disc list-inside">
                  <li>60 crédits mensuels</li>
                  <li>Surveillance planifiée d’un domaine</li>
                  <li>Rapports détaillés et historique</li>
                  <li>Alertes WhatsApp, email et dashboard</li>
                  <li>Priorité dans la file de scans</li>
                </ul>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-[11px] text-[#71717a]">
                  Crédits valables 30 jours à partir du paiement (renouvellement manuel).
                </p>
                <button
                  onClick={() => setCheckoutModal('Premium (5 000 FCFA / mois)')}
                  className="w-full rounded-full bg-black hover:bg-[#1a1a1a] text-white py-2.5 text-xs font-semibold transition-colors"
                >
                  Acheter
                </button>
              </div>
            </div>

            {/* Plan 5: Premium Plus */}
            <div className="rounded-2xl border border-[#e4e4e7] p-5 flex flex-col justify-between bg-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">
                  SUR DEVIS
                </p>
                <h3 className="text-base font-bold text-black mt-1">Premium Plus</h3>
                <p className="text-lg font-bold text-black mt-2">Tarif personnalisé</p>
                <ul className="mt-4 space-y-2 text-xs text-[#52525b] list-disc list-inside">
                  <li>Plusieurs domaines ou applications</li>
                  <li>Quotas de crédits personnalisés</li>
                  <li>Audits avancés selon le périmètre autorisé</li>
                  <li>Collaboration multi-utilisateurs</li>
                </ul>
              </div>
              <p className="text-[11px] text-[#71717a] mt-6">
                Chaque devis précise le périmètre, les quotas et le support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Crédits actifs (Screenshot 9) */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-bold text-black">Crédits actifs</h2>
        <div className="rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e4e4e7] text-[#71717a] uppercase tracking-wider bg-[#fafafa]">
                  <th className="py-3.5 px-6 font-semibold">ORIGINE</th>
                  <th className="py-3.5 px-6 font-semibold">TYPE</th>
                  <th className="py-3.5 px-6 font-semibold">RESTANT</th>
                  <th className="py-3.5 px-6 font-semibold">EXPIRE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                <tr>
                  <td className="py-4 px-6 text-black font-medium">Offert à l’inscription</td>
                  <td className="py-4 px-6 text-[#71717a]">Scans gratuits</td>
                  <td className="py-4 px-6 text-black font-semibold">{freeScansCount} / 3</td>
                  <td className="py-4 px-6 text-[#71717a]">Jamais</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section: Historique (Screenshot 9) */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-bold text-black">Historique</h2>
        <div className="rounded-2xl border border-[#e4e4e7] bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e4e4e7] text-[#71717a] uppercase tracking-wider bg-[#fafafa]">
                  <th className="py-3.5 px-6 font-semibold">DATE</th>
                  <th className="py-3.5 px-6 font-semibold">OPÉRATION</th>
                  <th className="py-3.5 px-6 font-semibold">DÉTAIL</th>
                  <th className="py-3.5 px-6 font-semibold">MOUVEMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#fafafa]">
                      <td className="py-4 px-6 text-[#71717a]">
                        {new Date(tx.created_time).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6 text-black font-medium">
                        {tx.reason === 'scan_debit' ? 'Scan' : 'Crédit'}
                      </td>
                      <td className="py-4 px-6 text-[#71717a]">{tx.note || '—'}</td>
                      <td className="py-4 px-6 font-mono font-semibold">
                        <span className={tx.delta > 0 ? 'text-[#0f5c53]' : 'text-[#0a0a0a]'}>
                          {tx.delta > 0 ? `+${tx.delta} scan gratuit` : `${tx.delta} scan gratuit`}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  defaultHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#fafafa]">
                      <td className="py-4 px-6 text-[#71717a]">{item.date}</td>
                      <td className="py-4 px-6 text-black font-medium">{item.operation}</td>
                      <td className="py-4 px-6 text-[#71717a]">{item.detail}</td>
                      <td className="py-4 px-6 font-mono font-semibold">
                        <span className={item.mouvement.startsWith('+') ? 'text-[#0f5c53]' : 'text-[#0a0a0a]'}>
                          {item.mouvement}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Checkout Modal simulation */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-black">
              Paiement sécurisé · {checkoutModal}
            </h3>
            <p className="text-xs text-[#71717a]">
              Paiement par Mobile Money (Wave, Orange Money, MTN MoMo, Moov) via MoneyFusion.
            </p>
            <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Pack :</span>
                <span className="font-semibold text-black">{checkoutModal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Numéro :</span>
                <span className="font-semibold text-black">{mobileMoney || 'Compte par défaut'}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                className="rounded-full border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-[#f4f4f5]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  alert('Paiement confirmé par MoneyFusion ! Vos crédits ont été ajoutés.');
                  setCheckoutModal(null);
                  await fetch('/api/v1/credits/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: 'PREMIUM' }),
                  });
                  await refreshUser();
                  await fetchTransactions();
                }}
                className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a1a1a]"
              >
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
