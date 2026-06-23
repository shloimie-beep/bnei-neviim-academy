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

function parseJsonMaybe(value, fallback = null) {
  if (value && typeof value === 'object') return value;
  if (!value) return fallback;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function redactSensitive(value, accessCode) {
  return String(value || '').split(accessCode).join('[redacted-access-code]');
}

function safeError(error, accessCode) {
  const message = error instanceof Error ? error.message : String(error);
  return redactSensitive(message, accessCode);
}

function reportContainsAccessCode(report, accessCode) {
  return JSON.stringify(report).includes(accessCode);
}

async function withPool(config, fn) {
  assert(config.databaseUrl, 'DATABASE_URL or .secrets/railway-database-url.txt is required');
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

async function pickLiveStudent(pool) {
  const result = await pool.query(
    `SELECT id, name, parent_email, student_access_code
     FROM bna_students
     WHERE student_access_code IS NOT NULL
       AND trim(student_access_code) <> ''
       AND COALESCE(student_access_enabled, TRUE) = TRUE
       AND COALESCE(status, 'active') <> 'archived'
     ORDER BY id ASC
     LIMIT 1`
  );
  assert(result.rows.length === 1, 'No live student with an enabled access code was found');
  return result.rows[0];
}

async function sendAssistantCapture(config, student, marker) {
  const message = [
    'save this onboarding intake for review only:',
    `my learning goal marker is ${marker};`,
    'I want help planning a calm chavrusa routine, I struggle with starting on time,',
    'and I like quick wins after I finish a short review.',
  ].join(' ');
  const response = await fetch(absoluteUrl(config, '/api/bna/assistant/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'codex-assistant-onboarding-intake-live-smoke',
    },
    body: JSON.stringify({
      access_code: student.student_access_code,
      surface: 'student_portal',
      language: 'en',
      page_path: '/student.html?code=[redacted]',
      message,
    }),
  });
  const text = await response.text();
  assert(response.ok, `Assistant chat returned ${response.status}: ${redactSensitive(text.slice(0, 700), student.student_access_code)}`);
  const body = text ? JSON.parse(text) : {};
  const assistantMessage = (body.messages || []).find((item) => item.author_type === 'assistant') || {};
  const metadata = parseJsonMaybe(assistantMessage.metadata, {});
  assert(metadata.intent === 'role_onboarding_intake_capture', `Expected onboarding capture intent, got ${metadata.intent || 'none'}`);
  assert(metadata.no_send === true, 'Assistant metadata did not mark no_send true');
  assert(metadata.external_write_performed === false, 'Assistant metadata marked an external write');
  assert(metadata.child_visible_write_performed === false, 'Assistant metadata marked a child-visible write');
  assert(Number(metadata.intake_id) > 0, 'Assistant metadata did not return an intake id');
  return {
    response_status: response.status,
    actor_type: body.actor?.type || null,
    thread_id: body.thread?.id || null,
    assistant_message_id: assistantMessage.id || null,
    intake_id: Number(metadata.intake_id),
    reply_intent: metadata.intent,
    no_send: metadata.no_send,
    external_write_performed: metadata.external_write_performed,
    child_visible_write_performed: metadata.child_visible_write_performed,
  };
}

async function readIntakeRow(pool, intakeId, marker) {
  const result = await pool.query(
    `SELECT id, thread_id, project_id, workspace_id, household_id, student_id,
            provider_id, actor_type, actor_id, actor_email, actor_name, surface,
            language, topic, source_message, extracted_fields, open_questions,
            review_status, no_send, durable_profile_write_performed,
            external_write_performed, metadata, created_at, updated_at
     FROM bna_assistant_onboarding_intakes
     WHERE id = $1
        OR source_message ILIKE $2
     ORDER BY id DESC
     LIMIT 1`,
    [intakeId, `%${marker}%`]
  );
  assert(result.rows.length === 1, 'No onboarding intake row was found after assistant capture');
  return result.rows[0];
}

function validateIntakeRow(row, student, marker) {
  const extractedFields = parseJsonMaybe(row.extracted_fields, {});
  const openQuestions = parseJsonMaybe(row.open_questions, []);
  const metadata = parseJsonMaybe(row.metadata, {});
  const serialized = JSON.stringify({ row, extractedFields, openQuestions, metadata });
  assert(Number(row.student_id) === Number(student.id), `Expected student_id ${student.id}, got ${row.student_id}`);
  assert(row.actor_type === 'student', `Expected actor_type student, got ${row.actor_type}`);
  assert(String(row.actor_id || '') === String(student.id), `Expected actor_id ${student.id}, got ${row.actor_id}`);
  assert(row.surface === 'student_portal', `Expected student_portal surface, got ${row.surface}`);
  assert(row.language === 'en', `Expected en language, got ${row.language}`);
  assert(row.review_status === 'needs_review', `Expected needs_review status, got ${row.review_status}`);
  assert(row.no_send === true, 'Intake row did not mark no_send true');
  assert(row.external_write_performed === false, 'Intake row marked an external write');
  assert(row.durable_profile_write_performed === false, 'Intake row marked a durable profile write');
  assert(String(row.source_message || '').includes(marker), 'Intake source message does not contain the smoke marker');
  assert(extractedFields.raw_summary && String(extractedFields.raw_summary).includes(marker), 'Extracted fields do not preserve the smoke marker');
  assert(Array.isArray(openQuestions), 'Open questions are not stored as an array');
  assert(metadata.source === 'assistant_onboarding_capture', `Expected assistant_onboarding_capture metadata source, got ${metadata.source || 'none'}`);
  assert(!serialized.includes(student.student_access_code), 'Stored intake data contains the raw student access code');
  return {
    id: row.id,
    thread_id: row.thread_id,
    student_id: row.student_id,
    actor_type: row.actor_type,
    surface: row.surface,
    language: row.language,
    topic: row.topic,
    review_status: row.review_status,
    no_send: row.no_send,
    durable_profile_write_performed: row.durable_profile_write_performed,
    external_write_performed: row.external_write_performed,
    open_question_count: openQuestions.length,
    field_keys: Object.keys(extractedFields).sort(),
  };
}

async function archiveSmokeRows(pool, row, marker) {
  const archiveMetadata = {
    smoke_archived_at: new Date().toISOString(),
    smoke_marker: marker,
    smoke_source: 'codex_assistant_onboarding_intake_live_smoke',
  };
  const intake = await pool.query(
    `UPDATE bna_assistant_onboarding_intakes
     SET review_status = 'archived',
         metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
         updated_at = NOW()
     WHERE id = $1
     RETURNING review_status, metadata`,
    [row.id, JSON.stringify(archiveMetadata)]
  );
  if (row.thread_id) {
    await pool.query(
      `UPDATE bna_assistant_threads
       SET status = 'archived',
           metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
           updated_at = NOW()
       WHERE id = $1`,
      [row.thread_id, JSON.stringify(archiveMetadata)]
    );
  }
  return {
    intake_review_status: intake.rows[0]?.review_status || null,
    thread_archived: Boolean(row.thread_id),
  };
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-assistant-onboarding-intake-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-assistant-onboarding-intake-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Assistant Onboarding Intake Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.error ? ` - ${check.error}` : ''}`),
  ];
  if (report.capture) {
    lines.push(
      '',
      '## Capture',
      '',
      `- actor_type: ${report.capture.actor_type}`,
      `- intake_id: ${report.capture.intake_id}`,
      `- reply_intent: ${report.capture.reply_intent}`,
      `- no_send: ${report.capture.no_send}`,
      `- external_write_performed: ${report.capture.external_write_performed}`
    );
  }
  if (report.intake) {
    lines.push(
      '',
      '## Intake Readback',
      '',
      `- actor_type: ${report.intake.actor_type}`,
      `- student_id: ${report.intake.student_id}`,
      `- topic: ${report.intake.topic}`,
      `- review_status_before_archive: ${report.intake.review_status}`,
      `- open_question_count: ${report.intake.open_question_count}`,
      `- raw access code stored: false`
    );
  }
  if (report.archive) {
    lines.push(
      '',
      '## Cleanup',
      '',
      `- intake_review_status_after_archive: ${report.archive.intake_review_status}`,
      `- thread_archived: ${report.archive.thread_archived}`
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
  const marker = `codex-onboarding-intake-smoke-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const report = {
    started_at: startedAt,
    app_url: config.appUrl,
    marker,
    checks: [],
  };
  let accessCode = '';
  let liveStudent = null;

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
        error: safeError(error, accessCode),
      });
      console.error(`FAIL ${name}: ${safeError(error, accessCode)}`);
      throw error;
    }
  }

  try {
    await withPool(config, async (pool) => {
      await check('live student access context is available without printing the code', async () => {
        const row = await pickLiveStudent(pool);
        liveStudent = row;
        accessCode = row.student_access_code;
        return {
          student_id: row.id,
          student_name_present: Boolean(row.name),
          parent_email_present: Boolean(row.parent_email),
          access_code_hash_prefix: sha256Hex(accessCode).slice(0, 16),
        };
      });
      assert(liveStudent, 'Live student context was not loaded');
      const capture = await check('assistant chat saves a review-only onboarding intake draft', async () => sendAssistantCapture(config, liveStudent, marker));
      report.capture = capture;
      const intake = await check('database readback shows scoped no-send student intake', async () => {
        const row = await readIntakeRow(pool, capture.intake_id, marker);
        const validated = validateIntakeRow(row, liveStudent, marker);
        report.intake_row_id = row.id;
        report.thread_id = row.thread_id;
        return validated;
      });
      report.intake = intake;
      const archive = await check('smoke intake and thread are archived after verification', async () => {
        const row = await readIntakeRow(pool, capture.intake_id, marker);
        return archiveSmokeRows(pool, row, marker);
      });
      report.archive = archive;
    });
    report.success = true;
  } catch {
    report.success = false;
  } finally {
    if (accessCode) {
      assert(!reportContainsAccessCode(report, accessCode), 'Smoke report would contain the raw student access code');
    }
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
