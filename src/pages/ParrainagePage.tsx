import React, { useState } from 'react';

export function ParrainagePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [promoCode, setPromoCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [operator, setOperator] = useState('Wave');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!promoCode.trim()) {
      setError('Veuillez spécifier le code promo souhaité.');
      return;
    }
    if (!fullName.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!phone.trim()) {
      setError('Veuillez renseigner un numéro de versement.');
      return;
    }
    if (!termsAccepted) {
      setError('Vous devez accepter les conditions du programme.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header (Screenshot 2) */}
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl text-black">
          Parrainage
        </h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Faites connaître Kortex Defender et gagnez une commission sur les achats de vos filleuls.
        </p>
      </div>

      {/* Main Card (Screenshot 2) */}
      <div className="max-w-3xl rounded-2xl border border-[#e4e4e7] bg-white p-6 md:p-8 shadow-2xs">
        <h2 className="font-display text-base font-bold text-black mb-2">
          Devenir parrain Kortex Defender
        </h2>
        <p className="text-xs text-[#3f3f46] leading-relaxed mb-6">
          Vos filleuls obtiennent <strong className="font-bold">-30 %</strong> avec votre code, et vous touchez <strong className="font-bold">20 % du prix</strong> de chacun de leurs achats (ex. pack à 1 000 F : le filleul paie 700 F, vous gagnez 200 F).
        </p>

        {submitted ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center space-y-2">
            <h3 className="font-bold text-sm text-[#0f5c53]">Demande transmise avec succès !</h3>
            <p className="text-xs text-[#0f5c53]">
              Votre code parrain sera activé sous 24h après validation manuelle par l’équipe Kortex.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code promo souhaité */}
              <div>
                <label className="text-xs font-semibold text-black block mb-1.5">
                  Votre code promo souhaité
                </label>
                <input
                  type="text"
                  placeholder="SHALOM"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#e4e4e7] px-4 py-2.5 text-sm uppercase font-mono text-black outline-none focus:border-black transition"
                />
              </div>

              {/* Nom complet */}
              <div>
                <label className="text-xs font-semibold text-black block mb-1.5">
                  Nom complet (titulaire Mobile Money)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e4e7] px-4 py-2.5 text-sm text-black outline-none focus:border-black transition"
                />
              </div>

              {/* Versement par */}
              <div>
                <label className="text-xs font-semibold text-black block mb-1.5">
                  Versement par
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-black transition"
                >
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Moov Money">Moov Money</option>
                </select>
              </div>

              {/* Numéro de versement */}
              <div>
                <label className="text-xs font-semibold text-black block mb-1.5">
                  Numéro de versement
                </label>
                <input
                  type="text"
                  placeholder="07 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e4e7] px-4 py-2.5 text-sm text-black outline-none focus:border-black transition"
                />
              </div>
            </div>

            {/* Conditions du programme box (Screenshot 2) */}
            <div className="rounded-xl border border-[#e4e4e7] p-5 my-6 bg-white space-y-3">
              <h3 className="font-bold text-xs text-black">
                Conditions du programme
              </h3>
              <ul className="space-y-2 text-xs text-[#52525b] list-disc list-inside leading-relaxed">
                <li>
                  Vos filleuls tapent votre code au paiement et obtiennent une réduction ; vous touchez une commission en argent sur chacun de leurs achats pendant 12 mois.
                </li>
                <li>
                  Chaque commission reste <strong className="font-bold text-black">en attente 14 jours</strong> et n’est validée que si le filleul utilise réellement ses crédits.
                </li>
                <li>
                  Les versements sont faits <strong className="font-bold text-black">manuellement par Kortex</strong> sur le numéro Mobile Money indiqué, à votre nom, à partir de 2000 F.
                </li>
                <li>
                  Interdits : utiliser son propre code, créer des comptes fictifs, payer avec son propre numéro. Toute fraude annule les commissions et le compte parrain.
                </li>
                <li>
                  Kortex peut refuser, suspendre ou annuler une commission en cas de doute. Les crédits ne sont jamais convertibles en argent.
                </li>
              </ul>

              {/* Checkbox (Screenshot 2) */}
              <div className="pt-2 flex items-center gap-2.5">
                <input
                  id="parrain-checkbox"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded accent-black cursor-pointer"
                />
                <label htmlFor="parrain-checkbox" className="text-xs text-black cursor-pointer select-none">
                  J’accepte ces conditions et je certifie que le numéro de versement est à mon nom.
                </label>
              </div>
            </div>

            {/* Submit button (Screenshot 2) */}
            <div>
              <button
                type="submit"
                className="rounded-full bg-black px-6 py-3 text-xs font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
              >
                Envoyer ma demande
              </button>
              <p className="mt-3 text-xs text-[#71717a]">
                Votre demande est validée manuellement par l’équipe Kortex.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
