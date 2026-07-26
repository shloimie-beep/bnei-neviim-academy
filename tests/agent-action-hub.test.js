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

test('HighLevel export parser maps current Agent Mode export schema fields', () => {
  const prompt = 'Job GHL-UI-01: custom-value folders and unresolved value review';
  const exportJson = JSON.stringify({
    schema_id: 'bna-agent-action-export',
    schema_version: '1.0.0',
    export_type: 'highlevel_agent_mode_queue',
    source: {
      repository: 'shloimie-beep/onetimev2',
      registry_root: 'integrations/highlevel/registry/',
      queue_path: 'integrations/highlevel/agent-mode/GHL-AGENT-MODE-QUEUE.json',
      location_id: 'pBSnOK2nkdxp6gf9Rg3o',
      location_fingerprint: '31fcbd2792f131dc',
    },
    ingestion: {
      lane: 'highlevel_agent_mode',
      required_readback: true,
      idempotency_key_field: 'idempotency_key',
    },
    safety: {
      no_send_default: true,
      no_publish_default: true,
    },
    jobs: [
      {
        job_id: 'GHL-UI-01',
        order: 1,
        title: 'custom-value folders and unresolved value review',
        ghl_location: {
          location_id: 'pBSnOK2nkdxp6gf9Rg3o',
          location_fingerprint: '31fcbd2792f131dc',
        },
        exact_target_ui_path: 'HighLevel > Settings > Custom Values',
        canonical_source_files: [
          'integrations/highlevel/registry/current.json',
          'integrations/highlevel/registry/custom-values.yaml',
        ],
        exact_copy_paste_prompt: prompt,
        allowed_assets: ['Custom-value folders matching the registry folder names.'],
        forbidden_assets: ['message sends', 'workflow publish actions'],
        expected_ghl_ids_to_capture: ['custom_value_folder_ids_if_visible'],
        completion_checklist: ['Readback result ID was verified.'],
        idempotency_key: 'one-time-ghl:GHL-UI-01:5992aa88997b126b',
        bna_agent_action_dropoff: {
          result_path: 'integrations/highlevel/agent-mode/results/GHL-UI-01.result.json',
          readback_verification: 'After saving the result, reopen/read it and record the returned result ID.',
          metadata: {
            job_file: 'integrations/highlevel/agent-mode/jobs/GHL-UI-01-custom-value-folders-and-unresolved-value-review.json',
          },
        },
      },
    ],
  });
  const parsed = parseHighLevelAgentModeExport(exportJson, HIGHLEVEL_EXPORT_SOURCE);
  assert.equal(parsed.jobs.length, 1);
  assert.equal(parsed.schema_id, 'bna-agent-action-export');
  assert.equal(parsed.registry_version, '1.0.0');
  assert.equal(parsed.source.ref, 'codex/highlevel-final-results-20260722');
  assert.equal(parsed.source.sha, '1fb2d39285b5cf644f2a5bc04d27e1b7385db173');
  assert.equal(parsed.jobs[0].prompt, prompt);
  assert.equal(parsed.jobs[0].target_workspace, 'one_time');
  assert.equal(parsed.jobs[0].target_ui_url, 'https://app.gohighlevel.com/');
  assert.deepEqual(parsed.jobs[0].expected_asset_ids, ['custom_value_folder_ids_if_visible']);
  assert.equal(parsed.jobs[0].metadata.exact_target_ui_path, 'HighLevel > Settings > Custom Values');
  assert.equal(parsed.jobs[0].metadata.result_path, 'integrations/highlevel/agent-mode/results/GHL-UI-01.result.json');
  assert.equal(parsed.jobs[0].metadata.ghl_location_fingerprint, '31fcbd2792f131dc');
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
