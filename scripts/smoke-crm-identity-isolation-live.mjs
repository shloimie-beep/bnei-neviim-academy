#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretsDir = path.join(repoRoot, '.secrets');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    allowTransactionalLiveProof: false,
    writeReport: false,
    databaseUrlEnv: 'DATABASE_URL',
    workspaceA: 'bna',
    workspaceB: 'rabbi_sheller_provider',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-transactional-live-proof') options.allowTransactionalLiveProof = true;
    else if (arg === '--write-report') options.writeReport = true;
    else if (arg === '--database-url-env') {
      options.databaseUrlEnv = argv[index + 1] || options.databaseUrlEnv;
      index += 1;
    } else if (arg.startsWith('--database-url-env=')) {
      options.databaseUrlEnv = arg.slice('--database-url-env='.length);
    } else if (arg === '--workspace-a') {
      options.workspaceA = argv[index + 1] || options.workspaceA;
      index += 1;
    } else if (arg.startsWith('--workspace-a=')) {
      options.workspaceA = arg.slice('--workspace-a='.length);
    } else if (arg === '--workspace-b') {
      options.workspaceB = argv[index + 1] || options.workspaceB;
      index += 1;
    } else if (arg.startsWith('--workspace-b=')) {
      options.workspaceB = arg.slice('--workspace-b='.length);
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function usage() {
  return `Usage:
  node scripts/smoke-crm-identity-isolation-live.mjs --allow-transactional-live-proof [--write-report]

Runs a live database identity-isolation proof inside a transaction, then rolls
the transaction back. It creates synthetic BNA and One Time contacts with the
same normalized email and phone inside the transaction only. No persistent CRM
records, external sends, provider writes, payments, access grants, DNS changes,
or credential mutations are performed.`;
}

function readSecretFile(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function resolveDatabaseUrl(envName) {
  return process.env[envName] ||
    process.env.DATABASE_URL ||
    readSecretFile('railway-database-url.txt');
}

function sslFor(connectionString) {
  return /localhost|127\.0\.0\.1/i.test(connectionString) ? false : { rejectUnauthorized: false };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function compactWorkspace(row = {}) {
  return {
    id: row.id,
    workspace_key: row.workspace_key,
    workspace_type: row.workspace_type,
    display_name: row.display_name,
  };
}

async function findWorkspace(client, workspaceKey) {
  const result = await client.query(
    `SELECT id, workspace_key, workspace_type, display_name
       FROM bna_workspace_settings
      WHERE workspace_key = $1
      LIMIT 1`,
    [workspaceKey]
  );
  return result.rows[0] || null;
}

async function insertContact(client, { workspace, smokeId, label, email, phone }) {
  const result = await client.query(
    `INSERT INTO bna_contacts (
       workspace_id, full_name, primary_email, primary_phone, status, source, tags, metadata
     ) VALUES ($1, $2, $3, $4, 'lead', 'codex_identity_isolation_smoke', ARRAY['codex-smoke'], $5::jsonb)
     RETURNING id, workspace_id, full_name`,
    [
      workspace.id,
      `${label} ${smokeId}`,
      email,
      phone,
      JSON.stringify({
        smoke_id: smokeId,
        requirement_id: 'REQ-20260712-305',
        workspace_key: workspace.workspace_key,
        transactional_rollback: true,
      }),
    ]
  );
  return result.rows[0];
}

async function insertIdentity(client, { workspaceId, contactId, type, value, normalized, smokeId }) {
  const result = await client.query(
    `INSERT INTO bna_contact_identities (
       workspace_id, contact_id, identity_type, identity_value, normalized_value, verified, metadata
     ) VALUES ($1, $2, $3, $4, $5, TRUE, $6::jsonb)
     RETURNING id, workspace_id, contact_id, identity_type, normalized_value`,
    [
      workspaceId,
      contactId,
      type,
      value,
      normalized,
      JSON.stringify({
        smoke_id: smokeId,
        requirement_id: 'REQ-20260712-305',
        transactional_rollback: true,
      }),
    ]
  );
  return result.rows[0];
}

async function queryIdentityRows(client, { identityType, normalizedValue, workspaceId = null }) {
  const params = [identityType, normalizedValue];
  let workspaceClause = '';
  if (workspaceId) {
    params.push(workspaceId);
    workspaceClause = ` AND i.workspace_id = $${params.length}`;
  }
  const result = await client.query(
    `SELECT c.id AS contact_id, c.workspace_id, ws.workspace_key, i.identity_type, i.normalized_value
       FROM bna_contact_identities i
       JOIN bna_contacts c ON c.id = i.contact_id
       JOIN bna_workspace_settings ws ON ws.id = c.workspace_id
      WHERE i.identity_type = $1
        AND i.normalized_value = $2
        ${workspaceClause}
      ORDER BY c.workspace_id, c.id`,
    params
  );
  return result.rows;
}

async function duplicateWithinWorkspaceIsBlocked(client, { workspace, smokeId, email, normalizedEmail }) {
  await client.query('SAVEPOINT crm_identity_duplicate_check');
  try {
    const duplicateContact = await insertContact(client, {
      workspace,
      smokeId,
      label: 'Duplicate Workspace Contact',
      email,
      phone: '+1 555 019 9999',
    });
    await insertIdentity(client, {
      workspaceId: workspace.id,
      contactId: duplicateContact.id,
      type: 'email',
      value: email,
      normalized: normalizedEmail,
      smokeId,
    });
    await client.query('RELEASE SAVEPOINT crm_identity_duplicate_check');
    return {
      blocked: false,
      error_code: null,
    };
  } catch (error) {
    await client.query('ROLLBACK TO SAVEPOINT crm_identity_duplicate_check');
    await client.query('RELEASE SAVEPOINT crm_identity_duplicate_check');
    if (error?.code === '23505') {
      return {
        blocked: true,
        error_code: error.code,
      };
    }
    throw error;
  }
}

async function loadIdentityIndexState(client) {
  const indexes = await client.query(
    `SELECT indexname, indexdef
       FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'bna_contact_identities'
      ORDER BY indexname`
  );
  const constraints = await client.query(
    `SELECT conname
       FROM pg_constraint
      WHERE conrelid = 'bna_contact_identities'::regclass
      ORDER BY conname`
  );
  const indexDefs = indexes.rows.map((row) => row.indexdef);
  return {
    has_workspace_unique_index: indexDefs.some((definition) =>
      /UNIQUE INDEX idx_bna_contact_identities_workspace_unique/i.test(definition) &&
      /workspace_id, identity_type, normalized_value/i.test(definition)
    ),
    has_workspace_lookup_index: indexes.rows.some((row) => row.indexname === 'idx_bna_contact_identities_workspace_lookup'),
    has_legacy_global_unique_constraint: constraints.rows.some((row) =>
      row.conname === 'bna_contact_identities_identity_type_normalized_value_key'
    ),
    indexes: indexes.rows.map((row) => row.indexname),
  };
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.generated_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-crm-identity-isolation-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-crm-identity-isolation-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# CRM Identity Isolation Live Smoke - ${report.generated_at}`,
    '',
    `Result: ${report.ok ? 'passed' : 'failed'}`,
    `Mode: ${report.mode}`,
    `Persistent write performed: ${report.persistent_write_performed}`,
    '',
    '## Proof',
    `- Workspace A: ${report.workspaces?.a?.workspace_key || '(missing)'}`,
    `- Workspace B: ${report.workspaces?.b?.workspace_key || '(missing)'}`,
    `- Same email coexistence: ${report.proof?.same_email_coexists}`,
    `- Same phone coexistence: ${report.proof?.same_phone_coexists}`,
    `- Workspace-filtered email rows: ${report.proof?.workspace_filtered_email_counts?.a}/${report.proof?.workspace_filtered_email_counts?.b}`,
    `- Workspace-filtered phone rows: ${report.proof?.workspace_filtered_phone_counts?.a}/${report.proof?.workspace_filtered_phone_counts?.b}`,
    `- Same-workspace duplicate blocked: ${report.proof?.same_workspace_duplicate_blocked}`,
    `- Rollback cleanup count: ${report.rollback?.post_rollback_contact_count}`,
    '',
    'Guardrail: synthetic data was inserted only inside a transaction and rolled back before exit.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function run(options) {
  if (!options.allowTransactionalLiveProof) {
    throw new Error('Refusing live database proof without --allow-transactional-live-proof.');
  }
  const databaseUrl = resolveDatabaseUrl(options.databaseUrlEnv);
  if (!databaseUrl) {
    throw new Error(`${options.databaseUrlEnv} or .secrets/railway-database-url.txt is required.`);
  }

  const generatedAt = new Date().toISOString();
  const suffix = crypto.randomBytes(4).toString('hex');
  const smokeId = `crm-identity-isolation-${generatedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}-${suffix}`;
  const email = `${smokeId}@example.invalid`;
  const phone = '+1 (555) 019-0305';
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhoneDigits(phone);

  const report = {
    ok: false,
    generated_at: generatedAt,
    mode: 'transaction_rollback_live_database_proof',
    smoke_id: smokeId,
    workspace_keys: [options.workspaceA, options.workspaceB],
    persistent_write_performed: false,
    external_send_performed: false,
    provider_mutation_performed: false,
    payment_or_access_mutation_performed: false,
    dns_or_credential_mutation_performed: false,
    secret_values_printed: false,
    synthetic_identity: {
      email_domain: 'example.invalid',
      email_hash: crypto.createHash('sha256').update(normalizedEmail).digest('hex'),
      phone_digits_hash: crypto.createHash('sha256').update(normalizedPhone).digest('hex'),
    },
  };

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslFor(databaseUrl),
  });
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query(`SET LOCAL statement_timeout = '15s'`);

    const workspaceA = await findWorkspace(client, options.workspaceA);
    const workspaceB = await findWorkspace(client, options.workspaceB);
    assert(workspaceA, `Workspace not found: ${options.workspaceA}`);
    assert(workspaceB, `Workspace not found: ${options.workspaceB}`);
    assert(workspaceA.id !== workspaceB.id, 'Workspace A and B must be different records.');
    report.workspaces = {
      a: compactWorkspace(workspaceA),
      b: compactWorkspace(workspaceB),
    };

    const indexState = await loadIdentityIndexState(client);
    assert(indexState.has_workspace_unique_index, 'Workspace-scoped identity unique index is missing.');
    assert(indexState.has_workspace_lookup_index, 'Workspace-scoped identity lookup index is missing.');
    assert(!indexState.has_legacy_global_unique_constraint, 'Legacy global identity unique constraint is still present.');

    const contactA = await insertContact(client, {
      workspace: workspaceA,
      smokeId,
      label: 'BNA Identity Isolation Contact',
      email,
      phone,
    });
    const contactB = await insertContact(client, {
      workspace: workspaceB,
      smokeId,
      label: 'One Time Identity Isolation Contact',
      email,
      phone,
    });

    await insertIdentity(client, {
      workspaceId: workspaceA.id,
      contactId: contactA.id,
      type: 'email',
      value: email,
      normalized: normalizedEmail,
      smokeId,
    });
    await insertIdentity(client, {
      workspaceId: workspaceB.id,
      contactId: contactB.id,
      type: 'email',
      value: email,
      normalized: normalizedEmail,
      smokeId,
    });
    await insertIdentity(client, {
      workspaceId: workspaceA.id,
      contactId: contactA.id,
      type: 'phone',
      value: phone,
      normalized: normalizedPhone,
      smokeId,
    });
    await insertIdentity(client, {
      workspaceId: workspaceB.id,
      contactId: contactB.id,
      type: 'phone',
      value: phone,
      normalized: normalizedPhone,
      smokeId,
    });

    const emailRows = await queryIdentityRows(client, { identityType: 'email', normalizedValue: normalizedEmail });
    const phoneRows = await queryIdentityRows(client, { identityType: 'phone', normalizedValue: normalizedPhone });
    const emailRowsA = await queryIdentityRows(client, {
      identityType: 'email',
      normalizedValue: normalizedEmail,
      workspaceId: workspaceA.id,
    });
    const emailRowsB = await queryIdentityRows(client, {
      identityType: 'email',
      normalizedValue: normalizedEmail,
      workspaceId: workspaceB.id,
    });
    const phoneRowsA = await queryIdentityRows(client, {
      identityType: 'phone',
      normalizedValue: normalizedPhone,
      workspaceId: workspaceA.id,
    });
    const phoneRowsB = await queryIdentityRows(client, {
      identityType: 'phone',
      normalizedValue: normalizedPhone,
      workspaceId: workspaceB.id,
    });

    const crossWorkspaceContactLeak = await client.query(
      `SELECT c.id
         FROM bna_contacts c
        WHERE c.id = $1
          AND c.workspace_id = $2`,
      [contactB.id, workspaceA.id]
    );

    assert(emailRows.length === 2, `Expected two same-email rows across workspaces, got ${emailRows.length}.`);
    assert(phoneRows.length === 2, `Expected two same-phone rows across workspaces, got ${phoneRows.length}.`);
    assert(emailRowsA.length === 1 && emailRowsA[0].contact_id === contactA.id, 'Workspace A email lookup did not return only workspace A contact.');
    assert(emailRowsB.length === 1 && emailRowsB[0].contact_id === contactB.id, 'Workspace B email lookup did not return only workspace B contact.');
    assert(phoneRowsA.length === 1 && phoneRowsA[0].contact_id === contactA.id, 'Workspace A phone lookup did not return only workspace A contact.');
    assert(phoneRowsB.length === 1 && phoneRowsB[0].contact_id === contactB.id, 'Workspace B phone lookup did not return only workspace B contact.');
    assert(crossWorkspaceContactLeak.rowCount === 0, 'Workspace A contact-id query revealed Workspace B contact.');

    const duplicate = await duplicateWithinWorkspaceIsBlocked(client, {
      workspace: workspaceA,
      smokeId,
      email,
      normalizedEmail,
    });
    assert(duplicate.blocked, 'Same-workspace duplicate email identity was not blocked by unique index.');

    report.index_state = indexState;
    report.proof = {
      same_email_coexists: true,
      same_phone_coexists: true,
      workspace_filtered_email_counts: {
        a: emailRowsA.length,
        b: emailRowsB.length,
      },
      workspace_filtered_phone_counts: {
        a: phoneRowsA.length,
        b: phoneRowsB.length,
      },
      cross_workspace_contact_id_query_leak_count: crossWorkspaceContactLeak.rowCount,
      same_workspace_duplicate_blocked: duplicate.blocked,
      duplicate_error_code: duplicate.error_code,
      contact_ids_redacted: true,
    };

    await client.query('ROLLBACK');
    transactionOpen = false;

    const rollbackReadback = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM bna_contacts
        WHERE metadata->>'smoke_id' = $1`,
      [smokeId]
    );
    const identityRollbackReadback = await client.query(
      `SELECT COUNT(*)::int AS count
         FROM bna_contact_identities
        WHERE metadata->>'smoke_id' = $1`,
      [smokeId]
    );
    report.rollback = {
      completed: true,
      post_rollback_contact_count: rollbackReadback.rows[0]?.count ?? null,
      post_rollback_identity_count: identityRollbackReadback.rows[0]?.count ?? null,
    };
    assert(report.rollback.post_rollback_contact_count === 0, 'Synthetic contacts remained after rollback.');
    assert(report.rollback.post_rollback_identity_count === 0, 'Synthetic identities remained after rollback.');

    report.ok = true;
    if (options.writeReport) {
      report.report_files = writeReports(report);
    }
    return report;
  } catch (error) {
    report.error = error instanceof Error ? error.message : String(error);
    if (transactionOpen) {
      try {
        await client.query('ROLLBACK');
        report.rollback = {
          completed: true,
          after_error: true,
        };
      } catch (rollbackError) {
        report.rollback = {
          completed: false,
          error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
        };
      }
    }
    if (options.writeReport) {
      report.report_files = writeReports(report);
    }
    throw Object.assign(new Error(report.error), { report });
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    console.log(usage());
    return;
  }
  try {
    const report = await run(options);
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    if (error.report) {
      console.error(JSON.stringify(error.report, null, 2));
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(1);
  }
}

main();
