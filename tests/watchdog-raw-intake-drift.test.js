const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');

test('raw intake watchdog guards canonical intake service and readback contracts', async () => {
  const mod = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'watchdog-raw-intake-drift.mjs')).href);
  const audit = mod.buildRawIntakeDriftAudit();
  const canonicalFindings = audit.findings.filter((finding) => finding.category === 'canonical-intake');

  assert.equal(canonicalFindings.length, 0);
  assert.equal(audit.canonical_contract_checks.length, 5);
  assert.ok(audit.canonical_contract_checks.every((check) => check.ok));
  assert.ok(audit.canonical_contract_checks.some((check) => check.file === 'src/platform/ingestion/intake-service.js'));
  assert.ok(audit.canonical_contract_checks.some((check) => check.file === 'src/platform/ingestion/intake-persistence.js'));
  assert.ok(audit.canonical_contract_checks.some((check) => check.file === 'src/platform/ingestion/prompt-queue.js'));
});
