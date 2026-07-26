const assert = require('assert');
const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');
const test = require('node:test');
const { Pool } = require('pg');

const {
  AGENT_ACTION_DURABILITY_MIGRATION_SQL,
  createPostgresAgentActionRepository,
} = require('../src/lib/bna/agent-action-postgres-repository');
const {
  createPostgresRabbiRepository,
} = require('../src/lib/bna/one-time-rabbi-provider-adapter');

const databaseUrl = String(process.env.BNA_AGENT_ACTION_TEST_DATABASE_URL || '').trim();

test('durability migration is forward-only, additive, and covers every lease/result table', () => {
  assert.doesNotMatch(AGENT_ACTION_DURABILITY_MIGRATION_SQL, /\b(?:DROP|TRUNCATE|DELETE)\b/i);
  [
    'bna_agent_action_jobs',
    'bna_agent_action_results',
    'bna_agent_action_audit_events',
    'claim_expires_at',
    'claim_generation',
    'result_sha256',
    'bna_one_time_rabbi_consumer_leases',
    'lease_generation',
    'bna_one_time_rabbi_telegram_updates',
    'handled_at',
    'attempt_count',
  ].forEach((token) => assert.match(AGENT_ACTION_DURABILITY_MIGRATION_SQL, new RegExp(token)));
});

test('disposable PostgreSQL proves restart readback, lease reclaim, and Telegram dedupe', {
  skip: databaseUrl ? false : 'BNA_AGENT_ACTION_TEST_DATABASE_URL is not configured for an explicitly disposable local PostgreSQL database.',
  timeout: 60_000,
}, async (t) => {
  const schema = `bna_aa_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const admin = new Pool({ connectionString: databaseUrl, max: 1 });
  const pool = new Pool({ connectionString: databaseUrl, options: `-c search_path=${schema}`, max: 4 });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  t.after(async () => {
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  });

  const helper = path.join(__dirname, 'helpers', 'agent-action-postgres-process.cjs');
  const childEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    BNA_AGENT_ACTION_TEST_SCHEMA: schema,
  };
  const write = spawnSync(process.execPath, [helper, 'write'], { env: childEnv, encoding: 'utf8', timeout: 30_000 });
  assert.equal(write.status, 0, write.stderr);
  assert.deepEqual(JSON.parse(write.stdout), { phase: 'write', result_ref: 'AAR-DURABLE-FINAL', status: 'saved' });

  const read = spawnSync(process.execPath, [helper, 'read'], { env: childEnv, encoding: 'utf8', timeout: 30_000 });
  assert.equal(read.status, 0, read.stderr);
  assert.deepEqual(JSON.parse(read.stdout), { phase: 'read', result_ref: 'AAR-DURABLE-FINAL', status: 'verified', readback: true });

  const repository = createPostgresAgentActionRepository(pool);
  await repository.upsertJob({
    job_id: 'AA-LEASE-RECLAIM-001',
    job_type: 'agent_action',
    title: 'Lease reclaim proof',
    category: 'verification',
    source_repository: 'shloimie-beep/onetimev2',
    source_ref: 'codex/highlevel-final-results-20260722',
    source_sha: '1fb2d39285b5cf644f2a5bc04d27e1b7385db173',
    source_artifact_path: 'sanitized-result.json',
    target_application: 'Super Admin / One Time',
    target_workspace: 'one_time',
    target_ui_url: '/operations/agent-actions/AA-LEASE-RECLAIM-001',
    prompt: 'Lease proof.',
    allowed_actions: ['claim'],
    forbidden_actions: ['provider_send'],
    required_save_behavior: 'PostgreSQL only.',
    expected_asset_ids: [],
    completion_checklist: ['claim'],
    evidence_requirements: ['lease generation'],
    idempotency_key: 'ot-launch-01:lease-reclaim',
    status: 'ready',
    result_readback_url: '/api/platform/agent-actions/AA-LEASE-RECLAIM-001/results',
    metadata: { result_only: true },
  });
  const firstClaim = await repository.claimJob({ jobId: 'AA-LEASE-RECLAIM-001', ownerRef: 'owner-a', claimToken: 'token-a', leaseSeconds: 30 });
  assert.equal(Number(firstClaim.claim_generation), 1);
  assert.equal(await repository.claimJob({ jobId: 'AA-LEASE-RECLAIM-001', ownerRef: 'owner-b', claimToken: 'token-b', leaseSeconds: 30 }), null);
  await pool.query("UPDATE bna_agent_action_jobs SET claim_expires_at = NOW() - INTERVAL '1 second' WHERE job_id = 'AA-LEASE-RECLAIM-001'");
  const reclaimed = await repository.claimJob({ jobId: 'AA-LEASE-RECLAIM-001', ownerRef: 'owner-b', claimToken: 'token-b', leaseSeconds: 30 });
  assert.equal(Number(reclaimed.claim_generation), 2);
  const renewed = await repository.claimJob({ jobId: 'AA-LEASE-RECLAIM-001', ownerRef: 'owner-b', claimToken: 'token-b', leaseSeconds: 30 });
  assert.equal(Number(renewed.claim_generation), 2);

  const rabbi = createPostgresRabbiRepository(pool);
  assert.equal(await rabbi.claimConsumer('replica-a', 30), true);
  assert.equal(await rabbi.claimConsumer('replica-b', 30), false);
  await pool.query("UPDATE bna_one_time_rabbi_consumer_leases SET expires_at = NOW() - INTERVAL '1 second' WHERE consumer_key = 'one_time_rabbi_telegram'");
  assert.equal(await rabbi.claimConsumer('replica-b', 30), true);
  assert.equal(await rabbi.claimConsumer('replica-b', 30), true);
  const consumerLease = (await pool.query("SELECT owner_ref, lease_generation FROM bna_one_time_rabbi_consumer_leases WHERE consumer_key = 'one_time_rabbi_telegram'")).rows[0];
  assert.equal(consumerLease.owner_ref, 'replica-b');
  assert.equal(Number(consumerLease.lease_generation), 2);

  const update = { updateId: 901, updateFingerprint: 'telegram-update:sha256:901', actorFingerprint: 'telegram-actor:sha256:safe', eventType: 'text', auditId: 'RTA-901', ownerRef: 'replica-b', ttlSeconds: 30 };
  assert.equal(await rabbi.claimUpdate(update), true);
  assert.equal(await rabbi.claimUpdate(update), false);
  assert.ok(await rabbi.completeUpdate({ updateId: 901, updateFingerprint: update.updateFingerprint, outcome: 'listed' }));
  assert.equal(await rabbi.claimUpdate(update), false);
  const handled = (await pool.query('SELECT outcome, attempt_count, handled_at FROM bna_one_time_rabbi_telegram_updates WHERE update_id = 901')).rows[0];
  assert.equal(handled.outcome, 'listed');
  assert.equal(Number(handled.attempt_count), 1);
  assert.ok(handled.handled_at);

  const expiringUpdate = { ...update, updateId: 902, updateFingerprint: 'telegram-update:sha256:902', auditId: 'RTA-902', ownerRef: 'replica-a' };
  assert.equal(await rabbi.claimUpdate(expiringUpdate), true);
  await pool.query("UPDATE bna_one_time_rabbi_telegram_updates SET lease_expires_at = NOW() - INTERVAL '1 second' WHERE update_id = 902");
  assert.equal(await rabbi.claimUpdate({ ...expiringUpdate, ownerRef: 'replica-b' }), true);
  assert.equal(await rabbi.claimUpdate({ ...expiringUpdate, ownerRef: 'replica-b' }), false);
});
