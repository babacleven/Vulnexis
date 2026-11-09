import assert from 'node:assert/strict';
import { createTestServer, TestContext } from './helpers.ts';
import { DB } from '../backend/db.ts';

export async function runCreditsTests() {
  console.log('\n🔵 Suite: Gestion des Crédits & Facturation (/api/v1/credits)');
  const ctx: TestContext = await createTestServer();

  try {
    ctx.resetDb();
    const user = DB.users[0];
    const initialCredits = user.credits;

    // 1. Consultation du solde
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/credits/me`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.credits, initialCredits);
      assert.ok(data.data.pricing.standard === 2);
      console.log(`  ✔ GET /credits/me - Consultation du solde (${data.data.credits} crédits)`);
    }

    // 2. Rejet code vide
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/credits/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '' }),
      });
      assert.equal(res.status, 400);
      console.log('  ✔ POST /credits/redeem - Rejet d’un coupon vide (400)');
    }

    // 3. Rechargement avec code STARTER (+20)
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/credits/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'PROMO-STARTER-2026' }),
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.credits, initialCredits + 20);
      console.log('  ✔ POST /credits/redeem - Recharge réussie avec code STARTER (+20 crédits)');
    }

    // 4. Rechargement avec code PREMIUM (+60)
    {
      const currentCredits = user.credits;
      const res = await fetch(`${ctx.baseUrl}/api/v1/credits/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'PREMIUM_VIP_KEY' }),
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.credits, currentCredits + 60);
      console.log('  ✔ POST /credits/redeem - Recharge réussie avec code PREMIUM (+60 crédits)');
    }

    // 5. Historique des transactions financières
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/credits/me/transactions`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.items));
      assert.ok(data.data.items.length >= 2, 'Transactions list should record the redeems');
      console.log(`  ✔ GET /credits/me/transactions - Historique complet auditable (${data.data.items.length} opérations)`);
    }
  } finally {
    await ctx.close();
  }
}

if (process.argv[1]?.endsWith('credits.test.ts')) {
  runCreditsTests()
    .then(() => console.log('\n✅ Tous les tests Crédits sont passés !'))
    .catch((err) => {
      console.error('\n❌ Échec des tests Crédits :', err);
      process.exit(1);
    });
}
