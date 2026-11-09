import assert from 'node:assert/strict';
import { createTestServer, TestContext } from './helpers.ts';

export async function runMiscTests() {
  console.log('\n🔵 Suite: Utilisateur, Notifications & Parrainage (/api/v1/...)');
  const ctx: TestContext = await createTestServer();

  try {
    ctx.resetDb();

    // 1. Profil utilisateur /me
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/me`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.email, 'babaaristote6@gmail.com');
      assert.ok(data.data.id);
      console.log('  ✔ GET /me - Données de profil utilisateur résolues');
    }

    // 2. Compteur de notifications non-lues
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/notifications/me/unread-count`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.ok(typeof data.data.count === 'number');
      console.log(`  ✔ GET /notifications/me/unread-count - Compteur badges (${data.data.count} non lues)`);
    }

    // 3. Liste des notifications
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/notifications/me`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(data.data.items));
      console.log(`  ✔ GET /notifications/me - Liste des notifications reçues (${data.data.items.length})`);
    }

    // 4. Marquer toutes les notifications comme lues
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/notifications/read-all`, {
        method: 'POST',
      });
      const data = await res.json();
      assert.equal(res.status, 200);

      // Vérifier que le compteur unread est désormais 0
      const countRes = await fetch(`${ctx.baseUrl}/api/v1/notifications/me/unread-count`);
      const countData = await countRes.json();
      assert.equal(countData.data.count, 0, 'Unread count should be 0 after read-all');
      console.log('  ✔ POST /notifications/read-all - Toutes les alertes marquées lues (compteur = 0)');
    }

    // 5. Statut du programme de parrainage
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/referrals/me`);
      const data = await res.json();
      assert.equal(res.status, 200);
      console.log('  ✔ GET /referrals/me - Consultation du statut affilié');
    }

    // 6. Postuler au programme partenaire/parrainage
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/referrals/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Aristote Baba',
          promoCode: 'KORTEX-AFFILIATE',
          operator: 'Wave',
          phone: '+221770003344',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.status, 'pending');
      assert.equal(data.data.operator, 'Wave');
      console.log('  ✔ POST /referrals/apply - Dépôt de candidature affiliation Wave/OM');
    }

    // 7. Validation des champs obligatoires
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/referrals/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Manquant' }),
      });
      assert.equal(res.status, 400);
      console.log('  ✔ POST /referrals/apply - Rejet si informations incomplètes (400)');
    }
  } finally {
    await ctx.close();
  }
}

if (process.argv[1]?.endsWith('misc.test.ts')) {
  runMiscTests()
    .then(() => console.log('\n✅ Tous les tests Misc sont passés !'))
    .catch((err) => {
      console.error('\n❌ Échec des tests Misc :', err);
      process.exit(1);
    });
}
