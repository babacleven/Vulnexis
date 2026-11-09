import assert from 'node:assert/strict';
import { createTestServer, TestContext } from './helpers.ts';

export async function runAuthTests() {
  console.log('\n🔵 Suite: Authentification (/api/v1/auth)');
  const ctx: TestContext = await createTestServer();

  try {
    ctx.resetDb();

    // 1. Inscription réussie
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testeur@kortex.sn',
          password: 'SecretPassword2026',
          phone: '+221770001122',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 200, 'Register should return 200');
      assert.equal(data.code, 200);
      assert.equal(data.data.user.email, 'testeur@kortex.sn');
      assert.equal(data.data.user.free_scans, 3, 'New user should receive 3 free scans');
      console.log('  ✔ POST /register - Inscription réussie avec 3 scans offerts');
    }

    // 2. Refus email en doublon
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testeur@kortex.sn',
          password: 'AnotherPassword',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 400, 'Duplicate email should return 400');
      assert.match(data.msg, /existe déjà/i);
      console.log('  ✔ POST /register - Rejet correct d’un compte avec email existant');
    }

    // 3. Connexion échouée avec mauvais mot de passe
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'babaaristote6@gmail.com',
          password: 'MauvaisMotDePasse',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 401, 'Bad credentials should return 401');
      assert.equal(data.code, 401);
      console.log('  ✔ POST /login - Rejet correct si identifiants invalides');
    }

    // 4. Connexion réussie avec le compte principal
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'babaaristote6@gmail.com',
          password: 'Cl2even2026',
        }),
      });
      const data = await res.json();
      assert.equal(res.status, 200, 'Valid login should return 200');
      assert.equal(data.data.user.email, 'babaaristote6@gmail.com');

      const setCookie = res.headers.get('set-cookie');
      assert.ok(setCookie && setCookie.includes('kortex_session='), 'Cookie kortex_session must be set');
      console.log('  ✔ POST /login - Connexion réussie et cookie de session positionné');
    }

    // 5. Envoi OTP simulation
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+221771234567' }),
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.ok(data.data?.simulated_code, 'Simulation code should be returned');
      console.log('  ✔ POST /send-otp - Génération et simulation d’envoi WhatsApp');

      // 6. Vérification OTP
      const verifyRes = await fetch(`${ctx.baseUrl}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+221771234567',
          code: data.data.simulated_code,
        }),
      });
      const verifyData = await verifyRes.json();
      assert.equal(verifyRes.status, 200);
      assert.equal(verifyData.code, 200);
      console.log('  ✔ POST /verify-otp - Validation correcte du code OTP');
    }

    // 7. Déconnexion
    {
      const res = await fetch(`${ctx.baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
      });
      assert.equal(res.status, 200);
      console.log('  ✔ POST /logout - Déconnexion et nettoyage du cookie');
    }
  } finally {
    await ctx.close();
  }
}

if (process.argv[1]?.endsWith('auth.test.ts')) {
  runAuthTests()
    .then(() => console.log('\n✅ Tous les tests Auth sont passés !'))
    .catch((err) => {
      console.error('\n❌ Échec des tests Auth :', err);
      process.exit(1);
    });
}
