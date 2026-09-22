#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretsDir = path.join(repoRoot, '.secrets');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function usableSecretValue(value) {
  const text = String(value || '').trim();
  return text && !text.includes('[YOUR-PASSWORD]') ? text : '';
}

function loadConfig() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  return {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    databaseUrl:
      usableSecretValue(env.DATABASE_URL) ||
      usableSecretValue(readSecret('railway-database-url.txt')),
  };
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function absoluteUrl(config, endpoint) {
  return `${config.appUrl.replace(/\/+$/, '')}${endpoint}`;
}

async function fetchInvalidCode(config, invalidCode) {
  const response = await fetch(
    absoluteUrl(config, `/api/student-portal?code=${encodeURIComponent(invalidCode)}`),
    {
      headers: {
        'User-Agent': 'codex-student-auth-policy-live-smoke',
      },
    }
  );
  const text = await response.text();
  assert(response.status === 401, `Expected invalid code to return 401; got ${response.status}`);
  assert(!text.includes(invalidCode), 'Invalid-code response echoed the raw access code');
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { text };
  }
  assert(/invalid|expired/i.test(String(body.error || '')), 'Invalid-code response did not return the generic credential error');
  return {
    status: response.status,
    generic_error: String(body.error || ''),
    raw_code_echoed: false,
  };
}

async function fetchInvalidPassword(config, username, password) {
  const response = await fetch(absoluteUrl(config, '/api/student-portal/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'codex-student-auth-policy-live-smoke',
    },
    body: JSON.stringify({ username, password }),
  });
  const text = await response.text();
  assert(response.status === 401, `Expected invalid username/password to return 401; got ${response.status}`);
  assert(!text.includes(username), 'Invalid-password response echoed the raw username');
  assert(!text.includes(password), 'Invalid-password response echoed the raw password');
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { text };
  }
  assert(/invalid/i.test(String(body.error || '')), 'Invalid-password response did not return the generic credential error');
  return {
    status: response.status,
    generic_error: String(body.error || ''),
    raw_username_echoed: false,
    raw_password_echoed: false,
  };
}

async function readAccessCodeAuditRow(config, codeHash) {
  assert(config.databaseUrl, 'DATABASE_URL or .secrets/railway-database-url.txt is required for audit readback');
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  try {
    const result = await pool.query(
      `SELECT id, attempted_at, outcome, route, student_id, user_agent_hash, metadata
       FROM bna_student_portal_auth_attempts
       WHERE access_code_hash = $1
       ORDER BY attempted_at DESC
       LIMIT 1`,
      [codeHash]
    );
    assert(result.rows.length === 1, 'No matching persistent student auth audit row found');
    return result.rows[0];
  } finally {
    await pool.end();
  }
}

async function readPasswordAuditRow(config, usernameHash) {
  assert(config.databaseUrl, 'DATABASE_URL or .secrets/railway-database-url.txt is required for audit readback');
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  try {
    const result = await pool.query(
      `SELECT id, created_at, outcome, route_path, student_id, user_agent_hash, metadata
       FROM bna_student_password_auth_attempts
       WHERE username_hash = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [usernameHash]
    );
    assert(result.rows.length === 1, 'No matching persistent student password audit row found');
    return result.rows[0];
  } finally {
    await pool.end();
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-student-auth-policy-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-student-auth-policy-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Student Portal Auth Policy Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.error ? ` - ${check.error}` : ''}`),
  ];
  if (report.access_code_audit) {
    lines.push(
      '',
      '## Access-Code Audit Readback',
      '',
      `- outcome: ${report.access_code_audit.outcome}`,
      `- route: ${report.access_code_audit.route}`,
      `- reason: ${report.access_code_audit.reason}`,
      `- raw code stored in route/metadata: ${report.access_code_audit.raw_code_stored}`,
      `- student id on invalid attempt: ${report.access_code_audit.student_id}`
    );
  }
  if (report.password_audit) {
    lines.push(
      '',
      '## Password Audit Readback',
      '',
      `- outcome: ${report.password_audit.outcome}`,
      `- route: ${report.password_audit.route}`,
      `- reason: ${report.password_audit.reason}`,
      `- raw username/password stored in route/metadata: ${report.password_audit.raw_username_or_password_stored}`,
      `- student id on invalid attempt: ${report.password_audit.student_id}`
    );
  }
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const config = loadConfig();
  const startedAt = new Date().toISOString();
  const invalidCode = `codex-student-auth-live-smoke-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const codeHash = sha256Hex(invalidCode);
  const invalidUsername = `codex-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const invalidUsernameHash = sha256Hex(invalidUsername.toLowerCase());
  const invalidPassword = `NotARealStudentPassword-${crypto.randomBytes(8).toString('hex')}`;
  const report = {
    started_at: startedAt,
    app_url: config.appUrl,
    code_hash_prefix: codeHash.slice(0, 16),
    username_hash_prefix: invalidUsernameHash.slice(0, 16),
    checks: [],
  };

  async function check(name, fn) {
    try {
      const details = await fn();
      report.checks.push({ name, ok: true, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.checks.push({
        name,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  try {
    await check('invalid code returns generic 401 without echoing raw code', async () => fetchInvalidCode(config, invalidCode));
    await check('invalid username/password returns generic 401 without echoing raw credentials', async () => (
      fetchInvalidPassword(config, invalidUsername, invalidPassword)
    ));
    const accessCodeAudit = await check('persistent access-code audit row stores hashes and sanitized route only', async () => {
      const row = await readAccessCodeAuditRow(config, codeHash);
      const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
      const serializedAudit = JSON.stringify({ route: row.route, metadata });
      assert(row.outcome === 'failure', `Expected failure outcome, got ${row.outcome}`);
      assert(row.student_id === null, 'Invalid-code audit row should not attach a student id');
      assert(row.route === '/api/student-portal', `Expected sanitized route path, got ${row.route}`);
      assert(!String(row.route || '').includes('?'), 'Audit route stored a query string');
      assert(!serializedAudit.includes(invalidCode), 'Audit route/metadata stored the raw access code');
      assert(metadata.reason === 'invalid_or_expired_code', `Expected invalid_or_expired_code reason, got ${metadata.reason}`);
      assert(metadata.auth_model === 'private_access_code_only', 'Audit metadata did not record the auth model');
      assert(metadata.raw_access_code_stored === false, 'Audit metadata did not mark raw code storage false');
      assert(metadata.raw_ip_stored === false, 'Audit metadata did not mark raw IP storage false');
      return {
        id: row.id,
        attempted_at: row.created_at,
        outcome: row.outcome,
        route: row.route,
        student_id: row.student_id,
        reason: metadata.reason,
        user_agent_hash_present: Boolean(row.user_agent_hash),
        raw_code_stored: false,
      };
    });
    const passwordAudit = await check('persistent password audit row stores hashes and sanitized route only', async () => {
      const row = await readPasswordAuditRow(config, invalidUsernameHash);
      const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
      const serializedAudit = JSON.stringify({ route: row.route_path, metadata });
      assert(row.outcome === 'failure', `Expected failure outcome, got ${row.outcome}`);
      assert(row.student_id === null, 'Invalid-password audit row should not attach a student id');
      assert(row.route_path === '/api/student-portal/login', `Expected login route path, got ${row.route_path}`);
      assert(!serializedAudit.includes(invalidUsername), 'Audit route/metadata stored the raw username');
      assert(!serializedAudit.includes(invalidPassword), 'Audit route/metadata stored the raw password');
      assert(metadata.reason === 'invalid_username_or_password', `Expected invalid_username_or_password reason, got ${metadata.reason}`);
      assert(metadata.auth_model === 'parent_managed_username_password', 'Audit metadata did not record the auth model');
      assert(metadata.raw_password_stored === false, 'Audit metadata did not mark raw password storage false');
      assert(metadata.raw_username_stored === false, 'Audit metadata did not mark raw username storage false');
      assert(metadata.raw_username_password_combo_stored === false, 'Audit metadata did not mark raw username/password storage false');
      assert(metadata.raw_access_code_stored === false, 'Audit metadata did not mark raw access-code storage false');
      assert(metadata.raw_ip_stored === false, 'Audit metadata did not mark raw IP storage false');
      return {
        id: row.id,
        attempted_at: row.attempted_at,
        outcome: row.outcome,
        route: row.route_path,
        student_id: row.student_id,
        reason: metadata.reason,
        user_agent_hash_present: Boolean(row.user_agent_hash),
        raw_username_or_password_stored: false,
      };
    });
    report.access_code_audit = accessCodeAudit;
    report.password_audit = passwordAudit;
    report.success = true;
  } catch {
    report.success = false;
  } finally {
    assert(!JSON.stringify(report).includes(invalidCode), 'Smoke report would contain the raw invalid access code');
    assert(!JSON.stringify(report).includes(invalidUsername), 'Smoke report would contain the raw invalid username');
    assert(!JSON.stringify(report).includes(invalidPassword), 'Smoke report would contain the raw invalid password');
    report.finished_at = new Date().toISOString();
    report.report_files = writeReports(report);
    console.log(`Report: ${report.report_files.markdown}`);
  }

  if (!report.success) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
