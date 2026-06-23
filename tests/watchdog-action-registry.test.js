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

test('One Time action coverage report is current and gates risky controls', async () => {
  const { buildOneTimeActionCoverage } = await import('../scripts/generate-one-time-action-coverage.mjs');
  const built = buildOneTimeActionCoverage({ write: false });
  const artifact = JSON.parse(fs.readFileSync('ops/action-registry/one-time-action-coverage.json', 'utf8'));

  assert.equal(built.ok, true);
  assert.equal(artifact.ok, true);
  assert.equal(artifact.requirement_id, 'REQ-20260621-502');
  assert.equal(artifact.content_hash, built.content_hash);
  assert.equal(artifact.registry_summary.controls, built.registry_summary.controls);
  assert.equal(artifact.registry_summary.needs_repair, 0);
  assert.ok(artifact.registry_summary.controls >= 19);
  assert.ok(artifact.registry_summary.external_write_controls >= 7);

  const externalWriteRows = artifact.registry_controls.filter((row) => row.external_write);
  assert.ok(externalWriteRows.length >= 7);
  for (const row of externalWriteRows) {
    assert.equal(row.coverage_result, 'covered', `${row.control_id} should be covered`);
    assert.equal(row.approval_safe, true, `${row.control_id} must be approval-gated`);
    assert.equal(row.approval_required, true, `${row.control_id} must require approval or explicit confirmation`);
    assert.ok(['approval_gated', 'preview_then_approve'].includes(row.classification), `${row.control_id} classification must not be direct`);
    assert.ok((row.gate_tokens || []).length, `${row.control_id} needs documented gate tokens`);
    assert.deepEqual(row.missing_gate_tokens, []);
  }
});

test('Universal action parity report is current and gates every visible control', async () => {
  const { buildUniversalActionParity } = await import('../scripts/generate-universal-action-parity.mjs');
  const built = buildUniversalActionParity({ write: false });
  const artifact = JSON.parse(fs.readFileSync('ops/action-registry/universal-action-parity.json', 'utf8'));

  assert.equal(built.ok, true);
  assert.equal(artifact.ok, true);
  assert.equal(artifact.requirement_id, 'REQ-20260623-013');
  assert.equal(artifact.content_hash, built.content_hash);
  assert.equal(artifact.summary.visible_controls, built.summary.visible_controls);
  assert.equal(artifact.summary.visible_controls_classified, artifact.summary.visible_controls);
  assert.equal(artifact.summary.missing_contract, 0);
  assert.equal(artifact.summary.missing_handler, 0);
  assert.equal(artifact.summary.missing_test, 0);
  assert.equal(artifact.summary.risky_without_approval, 0);
  assert.equal(artifact.browser_click_substitution_allowed, false);

  for (const rule of artifact.release_gate.rules) {
    assert.equal(rule.passed, true, `${rule.name} should pass`);
  }

  assert.ok(artifact.parity_sources.ui_button.count >= 20);
  assert.ok(artifact.parity_sources.telegram_request.count >= 40);
  assert.ok(artifact.parity_sources.website_assistant_request.count >= 40);
  assert.ok(artifact.parity_sources.operations_helper_request.count >= 20);
  assert.ok(artifact.parity_sources.automation_action.count >= 10);
  assert.ok(artifact.parity_sources.agent_work_handoff.count >= 5);

  const categoryStates = new Map(artifact.category_coverage.map((row) => [row.category, row.state]));
  for (const category of [
    'provider_profile',
    'provider_listing',
    'course',
    'class',
    'video',
    'worksheet',
    'community',
    'announcement',
    'email_campaign',
    'ticket',
    'support',
    'file_intake',
    'integration',
    'agent_work',
  ]) {
    assert.equal(categoryStates.get(category), 'covered_by_canonical_registry', `${category} should be covered`);
  }
  for (const row of artifact.category_coverage) {
    assert.ok(['covered_by_canonical_registry', 'not_applicable_current_surface'].includes(row.state));
  }
});

test('One Time visible data-action hooks are registered', async () => {
  const { buildActionAudit } = await import('../scripts/watchdog-action-audit.mjs');
  const audit = buildActionAudit();
  assert.equal(audit.ok, true);
  assert.equal(audit.findings.length, 0);
});
