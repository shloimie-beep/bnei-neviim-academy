const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MIGRATION_PATH = path.join(__dirname, '..', '..', '..', 'railway-migration-2026-07-22-agent-action-durability.sql');
const AGENT_ACTION_DURABILITY_MIGRATION_SQL = fs.readFileSync(MIGRATION_PATH, 'utf8');
const TERMINAL_JOB_STATUSES = new Set(['verified', 'superseded']);

function postgresRepositoryError(code, message, statusCode = 500) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function json(value, fallback) {
  if (value === undefined || value === null) return JSON.stringify(fallback);
  return JSON.stringify(value);
}

function resultFingerprint(result = {}) {
  const canonical = JSON.stringify({
    job_id: result.job_id,
    status: result.status,
    summary: result.summary || '',
    evidence: result.evidence || [],
    completion_checklist: result.completion_checklist || [],
    expected_asset_ids: result.expected_asset_ids || [],
    metadata: result.metadata || {},
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

async function withTransaction(db, callback) {
  if (typeof db.connect !== 'function') return callback(db);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const value = await callback(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

function createPostgresAgentActionRepository(db) {
  if (!db || typeof db.query !== 'function') {
    throw postgresRepositoryError('agent_action_postgres_repository_required', 'Agent Action PostgreSQL repository requires a query-capable database.');
  }

  async function recordAudit(event = {}, runner = db) {
    await runner.query(
      `INSERT INTO bna_agent_action_audit_events
         (event_id, job_id, result_ref, event_type, actor, sanitized_payload)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       ON CONFLICT (event_id) DO NOTHING`,
      [
        event.event_id,
        event.job_id,
        event.result_ref || null,
        event.event_type,
        event.actor || null,
        json(event.sanitized_payload || {}, {}),
      ]
    );
    return event;
  }

  async function claimJobWithRunner(runner, {
    jobId,
    ownerRef,
    claimToken,
    leaseSeconds = 120,
    status = 'claimed',
  }) {
    const result = await runner.query(
      `UPDATE bna_agent_action_jobs
       SET status = $4,
           claimed_by = $2,
           claimed_at = CASE
             WHEN claim_token IS DISTINCT FROM $3 OR claim_expires_at IS NULL OR claim_expires_at <= NOW()
             THEN NOW()
             ELSE COALESCE(claimed_at, NOW())
           END,
           claim_generation = CASE
             WHEN claim_token = $3 AND claim_expires_at > NOW() THEN claim_generation
             ELSE claim_generation + 1
           END,
           claim_token = $3,
           claim_expires_at = NOW() + make_interval(secs => $5::int),
           updated_at = NOW()
       WHERE job_id = $1
         AND status NOT IN ('verified', 'superseded')
         AND (
           claim_token IS NULL
           OR claim_token = $3
           OR claim_expires_at IS NULL
           OR claim_expires_at <= NOW()
         )
       RETURNING *`,
      [jobId, ownerRef, claimToken, status, Math.max(15, Math.min(Number(leaseSeconds) || 120, 3600))]
    );
    return result.rows[0] || null;
  }

  async function getJobWithRunner(jobId, { forUpdate = false, runner = db } = {}) {
    const result = await runner.query(
      `SELECT * FROM bna_agent_action_jobs WHERE job_id = $1${forUpdate ? ' FOR UPDATE' : ''}`,
      [jobId]
    );
    return result.rows[0] || null;
  }

  return {
    migrationPath: MIGRATION_PATH,
    migrationSql: AGENT_ACTION_DURABILITY_MIGRATION_SQL,

    async ensureSchema() {
      await db.query(AGENT_ACTION_DURABILITY_MIGRATION_SQL);
      await db.query('SELECT 1 AS agent_action_storage_ready');
      return { ready: true, durable: true, mode: 'postgres' };
    },

    recordAudit,

    async upsertJob(job = {}, actor = 'agent_action_importer') {
      const result = await db.query(
        `INSERT INTO bna_agent_action_jobs (
           job_id, job_type, title, category, source_repository, source_ref,
           source_sha, source_artifact_path, source_artifact_url, source_fingerprint,
           target_application, target_workspace, target_ui_url, prompt,
           allowed_actions, forbidden_actions, required_save_behavior,
           expected_asset_ids, completion_checklist, evidence_requirements,
           idempotency_key, status, result_readback_url, created_by, metadata
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10,
           $11, $12, $13, $14,
           $15::jsonb, $16::jsonb, $17,
           $18::jsonb, $19::jsonb, $20::jsonb,
           $21, $22, $23, $24, $25::jsonb
         )
         ON CONFLICT (job_id) DO UPDATE SET
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           source_ref = EXCLUDED.source_ref,
           source_sha = EXCLUDED.source_sha,
           source_artifact_path = EXCLUDED.source_artifact_path,
           source_artifact_url = EXCLUDED.source_artifact_url,
           source_fingerprint = EXCLUDED.source_fingerprint,
           target_application = EXCLUDED.target_application,
           target_workspace = EXCLUDED.target_workspace,
           target_ui_url = EXCLUDED.target_ui_url,
           prompt = EXCLUDED.prompt,
           allowed_actions = EXCLUDED.allowed_actions,
           forbidden_actions = EXCLUDED.forbidden_actions,
           required_save_behavior = EXCLUDED.required_save_behavior,
           expected_asset_ids = EXCLUDED.expected_asset_ids,
           completion_checklist = EXCLUDED.completion_checklist,
           evidence_requirements = EXCLUDED.evidence_requirements,
           idempotency_key = EXCLUDED.idempotency_key,
           status = CASE
             WHEN bna_agent_action_jobs.source_sha IS DISTINCT FROM EXCLUDED.source_sha
               OR bna_agent_action_jobs.idempotency_key IS DISTINCT FROM EXCLUDED.idempotency_key
             THEN EXCLUDED.status
             ELSE bna_agent_action_jobs.status
           END,
           result_readback_url = EXCLUDED.result_readback_url,
           metadata = CASE
             WHEN bna_agent_action_jobs.source_sha IS DISTINCT FROM EXCLUDED.source_sha
               OR bna_agent_action_jobs.idempotency_key IS DISTINCT FROM EXCLUDED.idempotency_key
             THEN EXCLUDED.metadata || jsonb_build_object('supersedes_source_sha', bna_agent_action_jobs.source_sha)
             ELSE bna_agent_action_jobs.metadata || EXCLUDED.metadata
           END,
           claim_token = CASE
             WHEN bna_agent_action_jobs.source_sha IS DISTINCT FROM EXCLUDED.source_sha THEN NULL
             ELSE bna_agent_action_jobs.claim_token
           END,
           claim_expires_at = CASE
             WHEN bna_agent_action_jobs.source_sha IS DISTINCT FROM EXCLUDED.source_sha THEN NULL
             ELSE bna_agent_action_jobs.claim_expires_at
           END,
           updated_at = NOW()
         RETURNING *`,
        [
          job.job_id,
          job.job_type || 'agent_action',
          job.title,
          job.category,
          job.source_repository,
          job.source_ref,
          job.source_sha,
          job.source_artifact_path,
          job.source_artifact_url || '',
          job.source_fingerprint || '',
          job.target_application,
          job.target_workspace,
          job.target_ui_url,
          job.prompt,
          json(job.allowed_actions, []),
          json(job.forbidden_actions, []),
          job.required_save_behavior,
          json(job.expected_asset_ids, []),
          json(job.completion_checklist, []),
          json(job.evidence_requirements, []),
          job.idempotency_key,
          job.status,
          job.result_readback_url,
          actor,
          json(job.metadata, {}),
        ]
      );
      return result.rows[0];
    },

    async supersedeMissing({ sourceRepository, currentJobIds, sourceSha, actor = 'agent_action_importer' }) {
      return withTransaction(db, async (runner) => {
        const result = await runner.query(
          `UPDATE bna_agent_action_jobs
           SET status = 'superseded',
               superseded_at = COALESCE(superseded_at, NOW()),
               claim_token = NULL,
               claim_expires_at = NULL,
               metadata = metadata || $3::jsonb,
               updated_at = NOW()
           WHERE source_repository = $1
             AND job_id <> ALL($2::text[])
             AND status <> 'superseded'
           RETURNING job_id, source_sha`,
          [
            sourceRepository,
            currentJobIds,
            json({ superseded_by_source_sha: sourceSha, canonical_status: 'superseded' }, {}),
          ]
        );
        for (const row of result.rows) {
          const digest = crypto.createHash('sha256').update(`${row.job_id}:${sourceSha}`).digest('hex').slice(0, 20);
          await recordAudit({
            event_id: `AAE-supersede-${digest}`,
            job_id: row.job_id,
            event_type: 'source_superseded',
            actor,
            sanitized_payload: {
              status: 'superseded',
              source_sha: sourceSha,
              result_only: true,
              secrets_included: false,
              customer_content_included: false,
            },
          }, runner);
        }
        return result.rows;
      });
    },

    async listJobs({ jobId = '' } = {}) {
      const params = [];
      const where = jobId ? 'WHERE j.job_id = $1' : '';
      if (jobId) params.push(jobId);
      return (await db.query(
        `SELECT j.*,
                latest.result_ref AS latest_result_ref,
                latest.status AS latest_result_status
         FROM bna_agent_action_jobs j
         LEFT JOIN LATERAL (
           SELECT result_ref, status
           FROM bna_agent_action_results r
           WHERE r.job_id = j.job_id
             AND COALESCE(r.metadata->>'source_sha', '') = j.source_sha
           ORDER BY r.updated_at DESC, r.created_at DESC
           LIMIT 1
         ) latest ON TRUE
         ${where}
         ORDER BY
           COALESCE((j.metadata->>'order')::int, 9999),
           j.created_at ASC,
           j.job_id ASC`,
        params
      )).rows;
    },

    async getJob(jobId, { forUpdate = false, runner = db } = {}) {
      return getJobWithRunner(jobId, { forUpdate, runner });
    },

    async claimJob(options) {
      return claimJobWithRunner(db, options);
    },

    async saveResult({
      jobId,
      result,
      ownerRef,
      claimToken,
      leaseSeconds = 120,
      action,
      auditEvent,
    }) {
      return withTransaction(db, async (runner) => {
        let job = await getJobWithRunner(jobId, { forUpdate: true, runner });
        if (!job) throw postgresRepositoryError('agent_action_job_not_found', 'Agent Action job not found.', 404);
        const existing = (await runner.query(
          'SELECT * FROM bna_agent_action_results WHERE idempotency_key = $1 LIMIT 1',
          [result.idempotency_key]
        )).rows[0] || null;
        if (existing) {
          if (existing.job_id !== jobId) {
            throw postgresRepositoryError('agent_action_idempotency_conflict', 'Agent Action idempotency key belongs to a different job.', 409);
          }
          return { result: existing, job, idempotent_replay: true };
        }

        if (action === 'supersede') {
          job = (await runner.query(
            `UPDATE bna_agent_action_jobs
             SET status = 'superseded',
                 superseded_at = COALESCE(superseded_at, NOW()),
                 claim_token = NULL,
                 claim_expires_at = NULL,
                 metadata = metadata || $2::jsonb,
                 updated_at = NOW()
             WHERE job_id = $1
             RETURNING *`,
            [jobId, json({ latest_result_ref: result.result_ref, latest_result_status: 'superseded' }, {})]
          )).rows[0];
        } else {
          if (TERMINAL_JOB_STATUSES.has(job.status)) {
            throw postgresRepositoryError('agent_action_job_terminal', 'Agent Action job is terminal and cannot be claimed.', 409);
          }
          job = await claimJobWithRunner(runner, {
            jobId,
            ownerRef,
            claimToken,
            leaseSeconds,
            status: result.status === 'claimed' ? 'claimed' : result.status === 'in_progress' ? 'in_progress' : job.status,
          });
          if (!job) {
            throw postgresRepositoryError('agent_action_claim_held', 'Agent Action claim is held by another active lease.', 409);
          }
        }

        const resultKind = result.metadata?.completion_intent === 'completed'
          ? 'final'
          : result.metadata?.completion_intent === 'partial'
            ? 'partial'
            : 'control';
        const sha256 = result.result_sha256 || resultFingerprint(result);
        const saved = await runner.query(
          `INSERT INTO bna_agent_action_results (
             result_ref, job_id, status, summary, evidence, completion_checklist,
             expected_asset_ids, idempotency_key, submitted_by, submitted_ip,
             user_agent, metadata, result_kind, result_sha256
           ) VALUES (
             $1, $2, $3, $4, $5::jsonb, $6::jsonb,
             $7::jsonb, $8, $9, $10,
             $11, $12::jsonb, $13, $14
           )
           ON CONFLICT (idempotency_key) DO UPDATE SET
             status = EXCLUDED.status,
             summary = EXCLUDED.summary,
             evidence = EXCLUDED.evidence,
             completion_checklist = EXCLUDED.completion_checklist,
             expected_asset_ids = EXCLUDED.expected_asset_ids,
             metadata = bna_agent_action_results.metadata || EXCLUDED.metadata,
             result_kind = EXCLUDED.result_kind,
             result_sha256 = EXCLUDED.result_sha256,
             updated_at = NOW()
           WHERE bna_agent_action_results.job_id = EXCLUDED.job_id
           RETURNING *`,
          [
            result.result_ref,
            jobId,
            result.status,
            result.summary || '',
            json(result.evidence, []),
            json(result.completion_checklist, []),
            json(result.expected_asset_ids, []),
            result.idempotency_key,
            result.submitted_by,
            result.submitted_ip || null,
            result.user_agent || null,
            json(result.metadata, {}),
            resultKind,
            sha256,
          ]
        );
        if (!saved.rows[0]) {
          throw postgresRepositoryError('agent_action_idempotency_conflict', 'Agent Action idempotency key belongs to a different job.', 409);
        }

        const releaseLease = action === 'supersede' || result.metadata?.completion_intent === 'completed';
        job = (await runner.query(
          `UPDATE bna_agent_action_jobs
           SET status = $2,
               claim_token = CASE WHEN $5::boolean THEN NULL ELSE claim_token END,
               claim_expires_at = CASE WHEN $5::boolean THEN NULL ELSE claim_expires_at END,
               metadata = metadata || $4::jsonb,
               updated_at = NOW()
           WHERE job_id = $1
           RETURNING *`,
          [
            jobId,
            result.status,
            ownerRef,
            json({ latest_result_ref: saved.rows[0].result_ref, latest_result_status: result.status }, {}),
            releaseLease,
          ]
        )).rows[0];
        if (auditEvent) await recordAudit(auditEvent, runner);
        return { result: saved.rows[0], job };
      });
    },

    async readbackResult({ jobId, resultRef = '', idempotencyKey = '', auditEventFactory = null }) {
      return withTransaction(db, async (runner) => {
        const params = [jobId];
        let where = 'WHERE job_id = $1';
        if (resultRef) {
          params.push(resultRef);
          where += ` AND result_ref = $${params.length}`;
        }
        if (idempotencyKey) {
          params.push(idempotencyKey);
          where += ` AND idempotency_key = $${params.length}`;
        }
        let row = (await runner.query(
          `SELECT * FROM bna_agent_action_results
           ${where}
           ORDER BY updated_at DESC, created_at DESC
           LIMIT 1
           FOR UPDATE`,
          params
        )).rows[0] || null;
        if (!row) return null;
        const metadata = typeof row.metadata === 'object' && row.metadata ? row.metadata : {};
        const verifiedStatus = row.status === 'saved' && metadata.completion_intent === 'completed' ? 'verified' : row.status;
        row = (await runner.query(
          `UPDATE bna_agent_action_results
           SET status = $2,
               readback_at = COALESCE(readback_at, NOW()),
               metadata = metadata || $3::jsonb,
               updated_at = NOW()
           WHERE result_ref = $1
           RETURNING *`,
          [row.result_ref, verifiedStatus, json({ readback_verified: true, readback_required: false }, {})]
        )).rows[0] || row;
        if (verifiedStatus === 'verified') {
          await runner.query(
            `UPDATE bna_agent_action_jobs
             SET status = 'verified',
                 claim_token = NULL,
                 claim_expires_at = NULL,
                 metadata = metadata || $2::jsonb,
                 updated_at = NOW()
             WHERE job_id = $1`,
            [jobId, json({ latest_result_ref: row.result_ref, latest_result_status: 'verified' }, {})]
          );
        }
        if (typeof auditEventFactory === 'function') {
          await recordAudit(auditEventFactory(row, verifiedStatus), runner);
        }
        return row;
      });
    },
  };
}

module.exports = {
  AGENT_ACTION_DURABILITY_MIGRATION_SQL,
  MIGRATION_PATH,
  createPostgresAgentActionRepository,
  postgresRepositoryError,
  resultFingerprint,
  withTransaction,
};
