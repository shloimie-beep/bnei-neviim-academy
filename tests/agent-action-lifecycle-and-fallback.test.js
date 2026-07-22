const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const {
  AGENT_ACTION_GITHUB_FALLBACK,
  agentActionResultPersistenceOptions,
  buildAgentActionGitHubFallbackPlan,
  sanitizeAgentActionResultForFallback,
} = require('../src/lib/bna/agent-action-hub');

const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

const job = {
  job_id: 'GHL-UI-01',
  source_repository: 'shloimie-beep/onetimev2',
  source_ref: 'codex/highlevel-final-results-20260722',
  source_sha: '1fb2d39285b5cf644f2a5bc04d27e1b7385db173',
  source_artifact_path: 'integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json',
  metadata: {
    result_path: 'integrations/highlevel/agent-mode/results/GHL-UI-01.result.json',
  },
};

test('Agent Action API maps claim, in-progress, partial, completed, and supersede actions', () => {
  assert.match(server, /action === 'claim' \|\| action === 'claimed'\) return 'claimed'/);
  assert.match(server, /action === 'start' \|\| action === 'i_started' \|\| action === 'retry'\) return 'in_progress'/);
  assert.match(server, /action === 'save_partial' \|\| action === 'save_completed'\) return 'saved'/);
  assert.match(server, /action === 'supersede'\) return 'superseded'/);
  assert.match(server, /completionIntent === 'completed'/);
  assert.match(server, /ON CONFLICT \(idempotency_key\) DO UPDATE SET/);
  assert.match(server, /readback_at = COALESCE\(readback_at, NOW\(\)\)/);
});

test('deployed Agent Action storage fails closed while memory remains local/test-only', () => {
  assert.match(server, /allowsAgentActionMemoryStorage\(process\.env\)/);
  assert.match(server, /throw agentActionDatabaseError\(error\)/);
  assert.match(server, /await ensureAgentActionStorageReady\(\)/);
  assert.match(server, /mode: 'postgres', ready: true, durable: true/);
});
test('sanitized GitHub fallback keeps result fields and removes secret/customer transcript input', () => {
  const result = {
    job_id: 'GHL-UI-01',
    result_ref: 'AAR-test-readback',
    status: 'verified',
    summary: 'Completed. token=do-not-commit. Contact a.student@example.org or +1 212 555 0199.',
    evidence: ['workflow id wf_123', 'authorization=private-value'],
    completion_checklist: ['Saved', 'Read back'],
    expected_asset_ids: ['wf_123'],
    idempotency_key: 'preview:GHL-UI-01:completed',
    customer_transcript: [{ body: 'must never be copied' }],
    metadata: { completion_intent: 'completed', raw_contact_export: ['private'] },
  };
  const sanitized = sanitizeAgentActionResultForFallback(result, job);
  const serialized = JSON.stringify(sanitized);
  assert.equal(sanitized.job_id, 'GHL-UI-01');
  assert.equal(sanitized.status, 'verified');
  assert.equal(sanitized.completion_intent, 'completed');
  assert.equal(sanitized.customer_messages_sent, 0);
  assert.equal(sanitized.secrets_included, false);
  assert.doesNotMatch(serialized, /do-not-commit|private-value|a\.student@example\.org|212 555 0199|must never be copied|raw_contact_export/);
  assert.match(serialized, /redacted/);
});

test('GitHub fallback plan is deterministic, result-only, and pinned to current One Time source', () => {
  const result = {
    job_id: 'GHL-UI-01',
    result_ref: 'AAR-607810b4cfd038db',
    status: 'verified',
    summary: 'Completed and read back.',
    metadata: { completion_intent: 'completed' },
  };
  const first = buildAgentActionGitHubFallbackPlan(result, job);
  const second = buildAgentActionGitHubFallbackPlan(result, job);
  assert.deepEqual(first, second);
  assert.equal(first.repository, 'shloimie-beep/onetimev2');
  assert.equal(first.base_sha, '1fb2d39285b5cf644f2a5bc04d27e1b7385db173');
  assert.equal(first.path, 'integrations/highlevel/agent-mode/results/GHL-UI-01.result.json');
  assert.match(first.branch, /^codex\/agent-mode-result-ghl-ui-01-/);
  assert.equal(first.sanitized_result_only, true);
  assert.equal(first.customer_transcript_included, false);
  assert.equal(first.external_write_performed, false);
  assert.equal(AGENT_ACTION_GITHUB_FALLBACK.hub_required_for_ghl_completion, false);
});

test('Hub unavailability selects GitHub fallback without blocking GHL completion', () => {
  const options = agentActionResultPersistenceOptions({
    result: { job_id: job.job_id, result_ref: 'AAR-offline', status: 'saved' },
    job,
    hubAvailable: false,
  });
  assert.equal(options.preferred, 'github_result_only_pull_request');
  assert.equal(options.hub.available, false);
  assert.equal(options.hub.required_for_ghl_completion, false);
  assert.equal(options.ghl_completion_allowed, true);
  assert.equal(options.ghl_completion_blocked_by_hub, false);
});
