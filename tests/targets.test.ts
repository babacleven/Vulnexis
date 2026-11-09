import assert from 'node:assert/strict';
import { createTestServer, TestContext } from './helpers.ts';

export async function runTargetsTests() {
  console.log('\n🔵 Suite: Gestion des cibles / Applications (/api/v1/targets)');
  const ctx: TestContext = await createTestServer();

  try {
    ctx.resetDb();
    let createdTargetId = '';

    // 1. Lister les cibles par défaut
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/targets`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.code, 200);
      assert.ok(Array.isArray(data.data.items), 'Items should be an array');
      console.log(`  ✔ GET /targets - Liste récupérée avec succès (${data.data.items.length} cibles)`);
    }

    // 2. Création d'une nouvelle cible avec URL
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://pay.fintech-senegal.com',
          name: 'Portail de Paiement Mobile',
          target_type: 'api',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.ok(data.data?.id);
      assert.equal(data.data.name, 'Portail de Paiement Mobile');
      assert.equal(data.data.authorized, true);
      createdTargetId = data.data.id;
      console.log(`  ✔ POST /targets - Création de la cible réussie (ID: ${createdTargetId})`);
    }

    // 3. Validation de l'erreur si URL manquante
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sans URL' }),
      });
      assert.equal(res.status, 400);
      console.log('  ✔ POST /targets - Rejet correct si URL manquante (400)');
    }

    // 4. Obtenir les détails de la cible créée
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/targets/${createdTargetId}`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.id, createdTargetId);
      assert.equal(data.data.url, 'https://pay.fintech-senegal.com');
      console.log('  ✔ GET /targets/:id - Détails de la cible récupérés');
    }

    // 5. Basculer l'autorisation légale (toggle)
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/targets/${createdTargetId}/authorize`, {
        method: 'POST',
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.authorized, false, 'Authorization should be toggled to false');
      console.log('  ✔ POST /targets/:id/authorize - Révocation de l’attestation');

      // Re-autoriser
      const reAuthRes = await fetch(`${ctx.baseUrl}/api/v1/targets/${createdTargetId}/authorize`, {
        method: 'POST',
      });
      const reAuthData = await reAuthRes.json();
      assert.equal(reAuthData.data.authorized, true, 'Authorization should be toggled back to true');
      console.log('  ✔ POST /targets/:id/authorize - Rétablissement de l’attestation');
    }

    // 6. Suppression de la cible
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/targets/${createdTargetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      console.log('  ✔ DELETE /targets/:id - Cible supprimée');

      // Vérifier 404
      const checkRes = await fetch(`${ctx.baseUrl}/api/v1/targets/${createdTargetId}`);
      assert.equal(checkRes.status, 404);
      console.log('  ✔ GET /targets/:id - 404 confirmé après suppression');
    }
  } finally {
    await ctx.close();
  }
}

if (process.argv[1]?.endsWith('targets.test.ts')) {
  runTargetsTests()
    .then(() => console.log('\n✅ Tous les tests Cibles sont passés !'))
    .catch((err) => {
      console.error('\n❌ Échec des tests Cibles :', err);
      process.exit(1);
    });
}
