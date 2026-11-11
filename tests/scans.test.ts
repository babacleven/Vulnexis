import assert from 'node:assert/strict';
import { createTestServer, TestContext } from './helpers.ts';
import { DB } from '../backend/src/database/db.js';

export async function runScansTests() {
  console.log('\n🔵 Suite: Moteur de Scans & Audits (/api/v1/scans)');
  const ctx: TestContext = await createTestServer();

  try {
    ctx.resetDb();

    // 0. Préparation : s'assurer qu'au moins une cible existe pour les scans
    let testTarget: any = DB.targets[0];
    if (!testTarget) {
      testTarget = {
        id: 'tgt_test_scan_target',
        userId: DB.users[0]?.id || '01m6rd9vpzwrzh8p8dkvhdbdkt',
        url: 'https://staging.test-bank.sn',
        name: 'Staging Platform',
        target_type: 'web',
        authorized: true,
        authorized_at: new Date().toISOString(),
        scans_count: 0,
        created_at: new Date().toISOString(),
      };
      DB.targets.push(testTarget);
    }
    let newScanId = '';

    // 1. Lister les scans existants
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.code, 200);
      assert.ok(Array.isArray(data.data.items));
      console.log(`  ✔ GET /scans - Récupération de l'historique (${data.data.items.length} scans)`);
    }

    // 2. Lancer un nouveau scan de profil "standard"
    {
      const initialFreeScans = DB.users[0].free_scans;
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: testTarget.id,
          profile: 'standard',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 201, 'Scan creation should return 201');
      assert.ok(data.data?.id);
      assert.equal(data.data.status, 'running');
      assert.equal(data.data.target_id, testTarget.id);
      newScanId = data.data.id;

      if (initialFreeScans > 0) {
        assert.equal(DB.users[0].free_scans, initialFreeScans - 1, 'Free scans should be decremented');
      }
      console.log(`  ✔ POST /scans - Lancement scan standard réussi (Scan ID: ${newScanId})`);
    }

    // 3. Rejet si la cible n'est pas autorisée
    {
      testTarget.authorized = false;
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: testTarget.id,
          profile: 'fast',
        }),
      });
      assert.equal(res.status, 400, 'Unauthorized target should return 400');
      testTarget.authorized = true; // restaurer
      console.log('  ✔ POST /scans - Rejet si l’attestation de cible est révoquée (400)');
    }

    // 4. Rejet si solde de crédits insuffisant pour un profil "deep" sans crédits
    {
      const oldFree = DB.users[0].free_scans;
      const oldCredits = DB.users[0].credits;
      DB.users[0].free_scans = 0;
      DB.users[0].credits = 1; // "deep" requiert 4 crédits

      const res = await fetch(`${ctx.baseUrl}/api/v1/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: testTarget.id,
          profile: 'deep',
        }),
      });
      assert.equal(res.status, 402, 'Insufficient credits should return 402');
      DB.users[0].free_scans = oldFree;
      DB.users[0].credits = oldCredits;
      console.log('  ✔ POST /scans - Rejet correct si solde insuffisant (402)');
    }

    // 5. Consulter l'état du scan créé
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans/${newScanId}`);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.data.id, newScanId);
      assert.ok(data.data.counts !== undefined);
      console.log('  ✔ GET /scans/:id - Consultation des métriques et progrès du scan');
    }

    // 6. Téléchargement rapport JSON
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans/${newScanId}/download?format=json`);
      assert.equal(res.status, 200);
      const contentType = res.headers.get('content-type');
      assert.ok(contentType?.includes('application/json'));
      const parsed = await res.json();
      assert.equal(parsed.id, newScanId);
      console.log('  ✔ GET /scans/:id/download?format=json - Export du rapport en JSON structuré');
    }

    // 7. Téléchargement rapport HTML autonome
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans/${newScanId}/download?format=html`);
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('RAPPORT DE SÉCURITÉ'));
      console.log('  ✔ GET /scans/:id/download?format=html - Export du rapport HTML stylisé');
    }

    // 8. Suppression d'un scan
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/scans/${newScanId}`, {
        method: 'DELETE',
      });
      assert.equal(res.status, 200);
      console.log('  ✔ DELETE /scans/:id - Suppression du rapport');
    }
  } finally {
    await ctx.close();
  }
}

if (process.argv[1]?.endsWith('scans.test.ts')) {
  runScansTests()
    .then(() => console.log('\n✅ Tous les tests Scans sont passés !'))
    .catch((err) => {
      console.error('\n❌ Échec des tests Scans :', err);
      process.exit(1);
    });
}
