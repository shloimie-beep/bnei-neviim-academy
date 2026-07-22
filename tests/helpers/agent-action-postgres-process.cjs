const { Pool } = require('pg');
const {
  createPostgresAgentActionRepository,
  resultFingerprint,
} = require('../../src/lib/bna/agent-action-postgres-repository');

const schema = String(process.env.BNA_AGENT_ACTION_TEST_SCHEMA || 'public');
if (!/^[a-z][a-z0-9_]{2,62}$/.test(schema)) throw new Error('invalid_test_schema');
if (!process.env.DATABASE_URL) throw new Error('test_database_url_required');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: `-c search_path=${schema}`,
  max: 2,
});

const job = {
  job_id: 'AA-DURABLE-RESTART-001',
  job_type: 'agent_action',
  title: 'Durable restart proof',
  category: 'verification',
  source_repository: 'shloimie-beep/onetimev2',
  source_ref: 'codex/highlevel-final-results-20260722',
  source_sha: '1fb2d39285b5cf644f2a5bc04d27e1b7385db173',
  source_artifact_path: 'integrations/highlevel/agent-mode/results/GHL-FINAL-ORGANIZATION-20260722.result.json',
  source_artifact_url: '',
  source_fingerprint: 'sha256:b5e116a99854c634',
  target_application: 'Super Admin / One Time',
  target_workspace: 'one_time',
  target_ui_url: '/operations/agent-actions/AA-DURABLE-RESTART-001',
  prompt: 'Persist a sanitized restart proof.',
  allowed_actions: ['claim', 'save_partial', 'save_completed', 'readback'],
  forbidden_actions: ['provider_send', 'store_customer_content', 'store_secrets'],
  required_save_behavior: 'Save and read back from PostgreSQL.',
  expected_asset_ids: ['AA-DURABLE-RESTART-001'],
  completion_checklist: ['claim', 'partial', 'completed', 'readback'],
  evidence_requirements: ['process restart'],
  idempotency_key: 'ot-launch-01:durable-restart-job',
  status: 'ready',
  result_readback_url: '/api/platform/agent-actions/AA-DURABLE-RESTART-001/results',
  metadata: { result_only: true, secrets_included: false, customer_content_included: false },
};

function savedResult({ resultRef, status, idempotencyKey, action, completionIntent, summary }) {
  const result = {
    result_ref: resultRef,
    job_id: job.job_id,
    status,
    summary,
    evidence: ['sanitized-postgres-proof'],
    completion_checklist: [action],
    expected_asset_ids: [job.job_id],
    idempotency_key: idempotencyKey,
    submitted_by: 'local-disposable-proof',
    metadata: {
      action,
      completion_intent: completionIntent || null,
      source_sha: job.source_sha,
      result_only: true,
      secrets_included: false,
      customer_content_included: false,
      external_write_performed: false,
    },
  };
  result.result_sha256 = resultFingerprint(result);
  return result;
}

async function main() {
  const repository = createPostgresAgentActionRepository(pool);
  await repository.ensureSchema();
  if (process.argv[2] === 'write') {
    await repository.upsertJob(job, 'local-disposable-proof');
    const common = {
      jobId: job.job_id,
      ownerRef: 'platform_control:local-disposable-proof',
      claimToken: 'sha256-local-disposable-proof',
      leaseSeconds: 60,
    };
    await repository.saveResult({
      ...common,
      action: 'claim',
      result: savedResult({ resultRef: 'AAR-DURABLE-CLAIM', status: 'claimed', idempotencyKey: 'durable:claim', action: 'claim', summary: 'Claimed.' }),
    });
    await repository.saveResult({
      ...common,
      action: 'save_partial',
      result: savedResult({ resultRef: 'AAR-DURABLE-PARTIAL', status: 'saved', idempotencyKey: 'durable:partial', action: 'save_partial', completionIntent: 'partial', summary: 'Partial sanitized result.' }),
    });
    const completed = await repository.saveResult({
      ...common,
      action: 'save_completed',
      result: savedResult({ resultRef: 'AAR-DURABLE-FINAL', status: 'saved', idempotencyKey: 'durable:completed', action: 'save_completed', completionIntent: 'completed', summary: 'Completed sanitized result.' }),
    });
    process.stdout.write(JSON.stringify({ phase: 'write', result_ref: completed.result.result_ref, status: completed.result.status }));
    return;
  }
  if (process.argv[2] === 'read') {
    const row = await repository.readbackResult({ jobId: job.job_id, resultRef: 'AAR-DURABLE-FINAL' });
    process.stdout.write(JSON.stringify({ phase: 'read', result_ref: row?.result_ref, status: row?.status, readback: Boolean(row?.readback_at) }));
    return;
  }
  throw new Error('unknown_test_phase');
}

main()
  .catch((error) => {
    process.stderr.write(`${error.code || error.name}: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
