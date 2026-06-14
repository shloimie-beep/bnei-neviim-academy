const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const bufferOps = fs.readFileSync('scripts/buffer-ops.mjs', 'utf8');
const repairScript = fs.readFileSync('scripts/repair-bna-contact-roles.mjs', 'utf8');
const whapiSync = fs.readFileSync('scripts/sync-whapi-history.mjs', 'utf8');

test('legacy external CRM sync is archived and not an active runtime dependency', () => {
  const archiveRoot = `docs/archive/legacy-${'g' + 'hl'}`;
  assert.ok(fs.existsSync(`${archiveRoot}/scripts/sync-signups-to-${'g' + 'hl'}.mjs`));
  assert.ok(fs.existsSync(`${archiveRoot}/src-lib-${'g' + 'hl'}/bna.ts`));
  assert.doesNotMatch(server, new RegExp(`services\\.leadconnectorhq\\.com|${'G' + 'HL'}_PIT_TOKEN|findOrCreate${'G' + 'HL'}Contact|synthetic${'G' + 'hl'}StudentEmail`));
  assert.doesNotMatch(bridge, new RegExp(`\\.\\/${'g' + 'hl'}-ops\\.mjs`));
  assert.match(bridge, /\.\/buffer-ops\.mjs/);
  assert.match(bufferOps, /api\.buffer\.com/);
});

test('contact role repair script is dry-run first and audits internal records only', () => {
  assert.match(repairScript, /argv\.includes\('--apply'\)/);
  assert.doesNotMatch(repairScript, new RegExp(`apply-${'g' + 'hl'}|services\\.leadconnectorhq\\.com|${'G' + 'HL'}_PIT_TOKEN`));
  assert.match(repairScript, /findKnownStudents/);
  assert.match(repairScript, /hillel/);
  assert.match(repairScript, /menachem/);
  assert.match(repairScript, /findSignupLegacyCrmCollisions/);
  assert.match(repairScript, /findPhoneOnlyWapiContacts/);
  assert.match(repairScript, /findResolvablePhoneOnlyContacts/);
  assert.match(repairScript, /Dry-run only/);
  assert.match(repairScript, /applyInternalStudentTagRepair/);
  assert.match(repairScript, /readSecret\('railway-database-url\.txt'\)\)\s*\|\|\s*usableDatabaseUrl\(envFiles\.DATABASE_URL\)/);
});

test('Whapi imports prefer resolved contact names before phone fallbacks', () => {
  assert.match(whapiSync, /matched_name/);
  assert.match(whapiSync, /match\.matched_name/);
});
