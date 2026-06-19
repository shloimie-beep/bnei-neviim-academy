const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('action watchdog fails when visible action id is not registered', async () => {
  const { buildActionAudit } = await import('../scripts/watchdog-action-audit.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-action-audit-'));
  const registryPath = path.join(dir, 'actions.json');
  const detailedRegistryPath = path.join(dir, 'detailed.json');
  const htmlPath = path.join(dir, 'fixture.html');
  fs.writeFileSync(registryPath, JSON.stringify({
    registry_version: 'test',
    actions: [{
      action_id: 'registered_action',
      label: 'Registered',
      route: '/operations',
      expected_behavior: 'Works',
      permission: 'admin',
      status: 'active',
      test: { type: 'unit' },
    }],
  }));
  fs.writeFileSync(detailedRegistryPath, '[]');
  fs.writeFileSync(htmlPath, '<button data-action-id="missing_action">Broken</button>');
  const audit = buildActionAudit({ registryPath, detailedRegistryPath, htmlPaths: [htmlPath] });
  assert.equal(audit.ok, false);
  assert.ok(audit.findings.some((finding) => /missing_action/.test(finding.title)));
});

test('root action registry includes helper raw intake and watchdog actions', () => {
  const registry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
  const ids = new Set(registry.actions.map((action) => action.action_id));
  assert.ok(ids.has('ACTION-HELPER-CAPTURE-RAW-INTAKE'));
  assert.ok(ids.has('ACTION-HELPER-RUN-WATCHDOG-AUDIT'));
});
