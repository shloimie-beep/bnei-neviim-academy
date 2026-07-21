const assert = require('assert');
const test = require('node:test');

const {
  AGENT_ACTION_CATEGORIES,
  AGENT_ACTION_STATUSES,
  HIGHLEVEL_EXPORT_SOURCE,
  agentActionResultIsTerminal,
  highLevelImportBlocker,
  parseHighLevelAgentModeExport,
} = require('../src/lib/bna/agent-action-hub');

test('Agent Action constants include required categories and statuses', () => {
  assert.deepEqual(AGENT_ACTION_CATEGORIES, [
    'ui_setup',
    'workflow_build',
    'knowledge_base_setup',
    'provider_console_setup',
    'configuration_review',
    'audit',
    'verification',
  ]);
  assert.deepEqual(AGENT_ACTION_STATUSES, [
    'draft',
    'ready',
    'claimed',
    'in_progress',
    'saved',
    'blocked',
    'failed',
    'verified',
    'superseded',
  ]);
});

test('HighLevel export parser preserves canonical prompt text and deduplicates jobs', () => {
  const prompt = 'Open HighLevel and configure the One Time pipeline exactly as specified.';
  const exportJson = JSON.stringify({
    registry_version: 'one-time-registry-v9',
    jobs: [
      {
        job_id: 'ghl-ui-001',
        title: 'Pipeline setup',
        category: 'ui_setup',
        target_workspace: 'rabbi_sheller_provider',
        target_application: 'HighLevel',
        target_ui_url: 'https://app.gohighlevel.com/location/example',
        canonical_prompt_text: prompt,
        allowed_actions: ['Create UI configuration only'],
        forbidden_actions: ['Do not send messages'],
        completion_checklist: ['Pipeline exists'],
        evidence_requirements: ['Screenshot ID recorded'],
        idempotency_key: 'one-time-ghl-ui-001',
      },
      {
        job_id: 'ghl-ui-001-duplicate',
        title: 'Pipeline setup duplicate',
        category: 'ui_setup',
        target_workspace: 'one_time',
        target_application: 'HighLevel',
        target_ui_url: 'https://app.gohighlevel.com/location/example',
        prompt,
        idempotency_key: 'one-time-ghl-ui-001',
      },
    ],
  });
  const parsed = parseHighLevelAgentModeExport(exportJson, HIGHLEVEL_EXPORT_SOURCE);
  assert.equal(parsed.jobs.length, 1);
  assert.equal(parsed.jobs[0].prompt, prompt);
  assert.equal(parsed.jobs[0].target_workspace, 'one_time');
  assert.equal(parsed.jobs[0].source_sha, HIGHLEVEL_EXPORT_SOURCE.sha);
  assert.equal(parsed.registry_version, 'one-time-registry-v9');
  assert.equal(parsed.external_write_performed, false);
  assert.equal(parsed.secrets_included, false);
});

test('HighLevel export parser rejects secret-like content', () => {
  const parsed = parseHighLevelAgentModeExport(JSON.stringify({
    jobs: [
      {
        job_id: 'bad',
        target_application: 'HighLevel',
        target_workspace: 'one_time',
        target_ui_url: 'https://app.gohighlevel.com',
        prompt: 'token=abc123 should not be here',
      },
    ],
  }));
  assert.equal(parsed.success, false);
  assert.equal(parsed.jobs.length, 0);
  assert.match(parsed.rejected[0].errors.join('\n'), /secret-like/);
});

test('missing HighLevel export is a scoped blocker, not a fabricated job', () => {
  const blocked = highLevelImportBlocker();
  assert.equal(blocked.jobs.length, 0);
  assert.equal(blocked.blocker.id, 'BLOCK-20260721-001');
  assert.match(blocked.blocker.next_action, /GHL-AGENT-MODE-EXPORT\.json/);
});

test('Agent Action terminal status helper treats verified as terminal after readback', () => {
  assert.equal(agentActionResultIsTerminal({ status: 'verified' }), true);
  assert.equal(agentActionResultIsTerminal({ status: 'saved' }), false);
  assert.equal(agentActionResultIsTerminal({ status: 'superseded' }), true);
});
