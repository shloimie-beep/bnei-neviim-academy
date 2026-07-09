const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'audit-artifact-governance.mjs')).href;

async function loadModule() {
  return import(moduleUrl);
}

test('audit governance flags obvious audit gaps without a stable mapping', async () => {
  const { classifyArtifact } = await loadModule();
  const result = classifyArtifact({
    package_path: 'ops/audits/2026-06-01-example-audit.md',
    age_days: 38,
    git_statuses: [],
    ids: {},
    text: 'Finding: missing scoped implementation. Next action: implement the gap.',
  });

  assert.equal(result.status, 'stale_needs_task_mapping');
  assert.equal(result.has_mapping, false);
});

test('audit governance treats linked findings as active work', async () => {
  const { classifyArtifact } = await loadModule();
  const result = classifyArtifact({
    package_path: 'ops/audits/2026-07-09-example-audit.md',
    age_days: 0,
    git_statuses: [],
    ids: { requirement: ['REQ-20260709-999'] },
    text: 'Finding: missing scoped implementation. Linked requirement: REQ-20260709-999.',
  });

  assert.equal(result.status, 'active_requirement_or_task');
  assert.equal(result.has_mapping, true);
});

test('audit governance treats passing audit evidence as implemented or proven', async () => {
  const { classifyArtifact } = await loadModule();
  const result = classifyArtifact({
    package_path: 'ops/audits/2026-07-09-proof.md',
    age_days: 0,
    git_statuses: [],
    ids: {},
    text: 'PASS 12/12. Live smoke readback passed with zero findings.',
  });

  assert.equal(result.status, 'implemented_or_proven');
  assert.equal(result.has_proof_language, true);
});

test('audit governance surfaces blocked linked audits separately', async () => {
  const { classifyArtifact } = await loadModule();
  const result = classifyArtifact({
    package_path: 'ops/audits/2026-07-09-blocked.md',
    age_days: 0,
    git_statuses: [],
    ids: { decision: ['DEC-20260709-999'] },
    text: 'Blocked: missing credential. Decision DEC-20260709-999 owns the approval gate.',
  });

  assert.equal(result.status, 'blocked_or_needs_decision');
  assert.equal(result.has_mapping, true);
});

test('audit governance marks untracked packages for registration first', async () => {
  const { classifyArtifact } = await loadModule();
  const result = classifyArtifact({
    package_path: 'ops/ui-audits/2026-07-09-current-state',
    age_days: 0,
    git_statuses: ['?? ops/ui-audits/2026-07-09-current-state/report.md'],
    ids: {},
    text: 'Result: audit captured with no automated findings.',
  });

  assert.equal(result.status, 'untracked_needs_registration');
});
