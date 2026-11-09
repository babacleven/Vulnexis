import { runAuthTests } from './auth.test.ts';
import { runTargetsTests } from './targets.test.ts';
import { runScansTests } from './scans.test.ts';
import { runCreditsTests } from './credits.test.ts';
import { runMiscTests } from './misc.test.ts';

interface SuiteResult {
  name: string;
  durationMs: number;
  success: boolean;
  error?: any;
}

async function main() {
  console.log('===============================================================');
  console.log('🛡️   KORTEX DEFENDER — SUITE DE TESTS UNITAIRES AUTOMATISÉS');
  console.log('===============================================================');
  console.log(`Node Environment: ${process.version}`);
  console.log(`Date: ${new Date().toLocaleString('fr-FR')}\n`);

  const startTime = Date.now();
  const suites = [
    { name: '1. Authentification & Sessions', fn: runAuthTests },
    { name: '2. Gestion des Cibles / Applications', fn: runTargetsTests },
    { name: '3. Moteur de Scans & Vulnérabilités', fn: runScansTests },
    { name: '4. Système de Crédits & Transactions', fn: runCreditsTests },
    { name: '5. Profil, Notifications & Affiliation', fn: runMiscTests },
  ];

  const results: SuiteResult[] = [];

  for (const suite of suites) {
    const t0 = Date.now();
    try {
      await suite.fn();
      results.push({ name: suite.name, durationMs: Date.now() - t0, success: true });
    } catch (err: any) {
      results.push({ name: suite.name, durationMs: Date.now() - t0, success: false, error: err });
      console.error(`\n❌ ÉCHEC dans la suite "${suite.name}":`, err.message || err);
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalPassed = results.filter((r) => r.success).length;
  const totalFailed = results.filter((r) => !r.success).length;

  console.log('\n===============================================================');
  console.log('📊  RÉCAPITULATIF DE L’EXÉCUTION');
  console.log('===============================================================');
  for (const r of results) {
    const icon = r.success ? '✅ PASSÉ' : '❌ ÉCHEC';
    console.log(`  ${icon.padEnd(9)} | ${r.name.padEnd(42)} (${r.durationMs}ms)`);
  }
  console.log('---------------------------------------------------------------');
  console.log(`Total : ${results.length} suites | Succès : ${totalPassed} | Échecs : ${totalFailed} | Durée : ${totalDuration}s`);

  if (totalFailed > 0) {
    console.log('\n❌ Certains tests ont échoué.');
    process.exit(1);
  } else {
    console.log('\n🎉 TOUS LES TESTS UNITAIRES ONT RÉUSSI AVEC SUCCÈS !');
    process.exit(0);
  }
}

main();
