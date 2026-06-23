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
const smokeSource = 'codex_ws11_parent_progress_live_smoke';

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
    databaseCandidates: [
      { label: 'railway-database-url.txt', value: usableSecretValue(readSecret('railway-database-url.txt')) },
      { label: 'DATABASE_URL', value: usableSecretValue(env.DATABASE_URL) },
    ].filter((item) => item.value),
  };
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function absoluteUrl(config, endpoint) {
  return `${config.appUrl.replace(/\/+$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

async function fetchJson(config, endpoint, {
  cookie = '',
  acceptStatuses = [200],
} = {}) {
  const headers = {
    accept: 'application/json',
    'cache-control': 'no-cache',
  };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(absoluteUrl(config, endpoint), {
    headers,
    redirect: 'manual',
  });
  const text = await response.text();
  if (!acceptStatuses.includes(response.status)) {
    throw new Error(`GET ${endpoint} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { text };
    }
  }
  return { response, data, text };
}

async function connectDatabase(candidates) {
  let lastError = null;
  for (const candidate of candidates) {
    const pool = new Pool({
      connectionString: candidate.value,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 7000,
    });
    try {
      await pool.query('SELECT 1');
      return {
        pool,
        source: candidate.label,
        fingerprint: sha256Hex(candidate.value).slice(0, 12),
      };
    } catch (error) {
      lastError = error;
      await pool.end().catch(() => {});
    }
  }
  throw new Error(`No configured live database URL connected${lastError ? `: ${lastError.message}` : ''}`);
}

async function cleanupSmokeRows(pool, sessionId = '') {
  await pool.query(`DELETE FROM bna_parent_sessions WHERE metadata->>'source' = $1 OR session_id = $2`, [smokeSource, sessionId || '']);
  await pool.query(`DELETE FROM bna_parent_student_links WHERE source = $1 OR metadata->>'source' = $1`, [smokeSource]);
  await pool.query(`DELETE FROM bna_gamification_events WHERE source = $1`, [smokeSource]);
  await pool.query(`DELETE FROM bna_student_references WHERE source = $1`, [smokeSource]);
  await pool.query(`DELETE FROM bna_parent_progress_reports WHERE metadata->>'source' = $1`, [smokeSource]);
  await pool.query(`DELETE FROM bna_worksheet_submissions WHERE metadata->>'source' = $1`, [smokeSource]);
  await pool.query(`DELETE FROM bna_worksheets WHERE metadata->>'source' = $1`, [smokeSource]);
}

async function selectParentLinkedStudent(pool) {
  const existing = await pool.query(
    `SELECT lower(link.parent_email) AS parent_email,
            link.student_id,
            COALESCE(course.id, (
              SELECT c.id
              FROM bna_courses c
              WHERE c.project_key = 'one_time_mishnah_class'
              ORDER BY c.id ASC
              LIMIT 1
            )) AS course_id
     FROM bna_parent_student_links link
     JOIN bna_students student ON student.id = link.student_id
     LEFT JOIN LATERAL (
       SELECT c.id
       FROM bna_courses c
       WHERE c.project_key = 'one_time_mishnah_class'
       ORDER BY c.id ASC
       LIMIT 1
     ) course ON TRUE
     WHERE link.status = 'active'
       AND link.parent_email IS NOT NULL
       AND trim(link.parent_email) <> ''
       AND COALESCE(student.status, 'active') NOT IN ('inactive', 'archived')
     ORDER BY link.updated_at DESC NULLS LAST, link.id DESC
     LIMIT 1`
  );
  if (existing.rows[0]?.parent_email) {
    assert(Number.isFinite(Number(existing.rows[0].student_id)), 'Linked student id was invalid');
    assert(Number.isFinite(Number(existing.rows[0].course_id)), 'No WS11 course was available for worksheet smoke rows');
    return { ...existing.rows[0], temporary_link: false };
  }

  const fallback = await pool.query(
    `SELECT student.id AS student_id,
            course.id AS course_id
     FROM bna_students student
     CROSS JOIN LATERAL (
       SELECT c.id
       FROM bna_courses c
       WHERE c.project_key = 'one_time_mishnah_class'
       ORDER BY c.id ASC
       LIMIT 1
     ) course
     WHERE COALESCE(student.status, 'active') NOT IN ('inactive', 'archived')
     ORDER BY student.updated_at DESC NULLS LAST, student.id DESC
     LIMIT 1`
  );
  assert(Number.isFinite(Number(fallback.rows[0]?.student_id)), 'No active student was available for a temporary WS11 parent link');
  assert(Number.isFinite(Number(fallback.rows[0]?.course_id)), 'No WS11 course was available for worksheet smoke rows');
  const parentEmail = `codex-ws11-smoke+${Date.now()}@example.invalid`;
  await pool.query(
    `INSERT INTO bna_parent_student_links (
       parent_email, student_id, relationship, status, source, metadata
     ) VALUES ($1, $2, 'parent', 'active', $3, $4::jsonb)`,
    [
      parentEmail,
      fallback.rows[0].student_id,
      smokeSource,
      JSON.stringify({ source: smokeSource }),
    ]
  );
  return {
    parent_email: parentEmail,
    student_id: fallback.rows[0].student_id,
    course_id: fallback.rows[0].course_id,
    temporary_link: true,
  };
}

async function readTableCounts(pool) {
  const result = await pool.query(
    `SELECT
       (SELECT to_regclass('public.bna_learning_communities') IS NOT NULL)::boolean AS has_communities,
       (SELECT to_regclass('public.bna_courses') IS NOT NULL)::boolean AS has_courses,
       (SELECT to_regclass('public.bna_worksheets') IS NOT NULL)::boolean AS has_worksheets,
       (SELECT to_regclass('public.bna_worksheet_submissions') IS NOT NULL)::boolean AS has_worksheet_submissions,
       (SELECT to_regclass('public.bna_gamification_events') IS NOT NULL)::boolean AS has_gamification_events,
       (SELECT to_regclass('public.bna_student_references') IS NOT NULL)::boolean AS has_student_references,
       (SELECT to_regclass('public.bna_parent_student_links') IS NOT NULL)::boolean AS has_parent_student_links,
       (SELECT to_regclass('public.bna_parent_progress_reports') IS NOT NULL)::boolean AS has_parent_progress_reports,
       (SELECT count(*) FROM bna_learning_communities WHERE community_key = 'rabbi-mishnah-learning-community')::int AS ws11_communities,
       (SELECT count(*) FROM bna_courses WHERE project_key = 'one_time_mishnah_class')::int AS ws11_courses,
       (SELECT count(*) FROM bna_badges WHERE metadata->>'source' = 'ws11_seed')::int AS ws11_seed_badges,
       (SELECT count(*) FROM bna_gamification_events)::int AS gamification_events,
       (SELECT count(*) FROM bna_student_references)::int AS student_references,
       (SELECT count(*) FROM bna_worksheet_submissions)::int AS worksheet_submissions,
       (SELECT count(*) FROM bna_parent_student_links WHERE status = 'active')::int AS active_parent_student_links,
       (SELECT count(*) FROM bna_parent_progress_reports)::int AS parent_progress_reports`
  );
  const row = result.rows[0];
  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith('has_')) assert(value === true, `Missing live WS11 table: ${key}`);
  }
  assert(Number(row.ws11_communities) >= 1, 'WS11 learning community seed row was not present');
  assert(Number(row.ws11_courses) >= 1, 'WS11 course seed row was not present');
  assert(Number(row.ws11_seed_badges) >= 7, 'WS11 badge seed rows were not present');
  return row;
}

async function createHiddenFixtureRows(pool, fixture) {
  const stamp = Date.now();
  const worksheet = (await pool.query(
    `INSERT INTO bna_worksheets (
       course_id, title, instructions, status, visibility,
       approval_status, parent_visible, metadata
     ) VALUES (
       $1, $2, 'Temporary hidden worksheet used by live privacy smoke.',
       'draft', 'student', 'draft', FALSE, $3::jsonb
     )
     RETURNING id`,
    [
      fixture.course_id,
      `Codex WS11 hidden worksheet ${stamp}`,
      JSON.stringify({ source: smokeSource, smoke_stamp: stamp }),
    ]
  )).rows[0];
  const worksheetSubmission = (await pool.query(
    `INSERT INTO bna_worksheet_submissions (
       worksheet_id, student_id, status, answer_snapshot,
       parent_visible, approval_status, metadata
     ) VALUES (
       $1, $2, 'draft', '{}'::jsonb,
       FALSE, 'draft', $3::jsonb
     )
     RETURNING id`,
    [
      worksheet.id,
      fixture.student_id,
      JSON.stringify({ source: smokeSource, smoke_stamp: stamp }),
    ]
  )).rows[0];
  const event = (await pool.query(
    `INSERT INTO bna_gamification_events (
       student_id, course_id, worksheet_id, worksheet_submission_id,
       event_type, title, notes, points, visibility,
       parent_visible, approval_status, idempotency_key,
       source, source_ref, metadata
     ) VALUES (
       $1, $2, $3, $4,
       'worksheet_submitted', $5, 'Temporary hidden event used by live privacy smoke.',
       0, 'student', FALSE, 'pending', $6,
       $7, $8, $9::jsonb
     )
     RETURNING id`,
    [
      fixture.student_id,
      fixture.course_id,
      worksheet.id,
      worksheetSubmission.id,
      `Codex WS11 hidden event ${stamp}`,
      `${smokeSource}:event:${stamp}`,
      smokeSource,
      `live-smoke:${stamp}`,
      JSON.stringify({ source: smokeSource, smoke_stamp: stamp }),
    ]
  )).rows[0];
  const reference = (await pool.query(
    `INSERT INTO bna_student_references (
       student_id, course_id, reference_type, title, body,
       visibility, parent_visible, community_visible, public_visible,
       approval_status, source, metadata
     ) VALUES (
       $1, $2, 'shoutout', $3, 'Temporary hidden shoutout used by live privacy smoke.',
       'parent', FALSE, FALSE, FALSE,
       'pending', $4, $5::jsonb
     )
     RETURNING id`,
    [
      fixture.student_id,
      fixture.course_id,
      `Codex WS11 hidden shoutout ${stamp}`,
      smokeSource,
      JSON.stringify({ source: smokeSource, smoke_stamp: stamp }),
    ]
  )).rows[0];
  const report = (await pool.query(
    `INSERT INTO bna_parent_progress_reports (
       parent_email, student_id, title, summary,
       metrics_json, highlights_json, parent_visible,
       approval_status, generated_by, metadata
     ) VALUES (
       $1, $2, $3, 'Temporary hidden report used by live privacy smoke.',
       '{}'::jsonb, '[]'::jsonb, FALSE,
       'draft', 'codex-live-smoke', $4::jsonb
     )
     RETURNING id`,
    [
      fixture.parent_email,
      fixture.student_id,
      `Codex WS11 hidden report ${stamp}`,
      JSON.stringify({ source: smokeSource, smoke_stamp: stamp }),
    ]
  )).rows[0];
  return {
    event_id: event.id,
    reference_id: reference.id,
    worksheet_submission_id: worksheetSubmission.id,
    report_id: report.id,
  };
}

async function createParentSession(pool, parentEmail) {
  const sessionId = generateToken(32);
  await pool.query(
    `INSERT INTO bna_parent_sessions (
       session_id, parent_email, expires_at, metadata
     ) VALUES ($1, $2, NOW() + interval '10 minutes', $3::jsonb)`,
    [
      sessionId,
      parentEmail,
      JSON.stringify({ source: smokeSource }),
    ]
  );
  return sessionId;
}

function ids(rows = []) {
  return new Set((Array.isArray(rows) ? rows : []).map((row) => Number(row?.id)).filter(Number.isFinite));
}

function assertHiddenIdsAbsent(ws11, hiddenIds) {
  const eventIds = ids(ws11?.gamification?.events);
  const referenceIds = ids(ws11?.shoutouts);
  const worksheetIds = ids(ws11?.worksheet_submissions);
  const reportIds = ids(ws11?.parent_progress?.reports);
  assert(!eventIds.has(Number(hiddenIds.event_id)), 'Hidden gamification event appeared in parent WS11 response');
  assert(!referenceIds.has(Number(hiddenIds.reference_id)), 'Hidden shoutout/reference appeared in parent WS11 response');
  assert(!worksheetIds.has(Number(hiddenIds.worksheet_submission_id)), 'Hidden worksheet draft appeared in parent WS11 response');
  assert(!reportIds.has(Number(hiddenIds.report_id)), 'Hidden parent progress draft appeared in parent WS11 response');
  for (const event of ws11?.gamification?.events || []) {
    assert(event.parent_visible === true, `Parent response included non-parent-visible event ${event.id}`);
    assert(String(event.approval_status) === 'approved', `Parent response included unapproved event ${event.id}`);
  }
  for (const shoutout of ws11?.shoutouts || []) {
    assert(shoutout.parent_visible === true, `Parent response included non-parent-visible shoutout ${shoutout.id}`);
    assert(String(shoutout.approval_status) === 'approved', `Parent response included unapproved shoutout ${shoutout.id}`);
  }
  for (const worksheet of ws11?.worksheet_submissions || []) {
    assert(worksheet.parent_visible === true, `Parent response included non-parent-visible worksheet ${worksheet.id}`);
    assert(String(worksheet.approval_status) === 'approved', `Parent response included unapproved worksheet ${worksheet.id}`);
    assert(!['draft', 'archived'].includes(String(worksheet.status || '').toLowerCase()), `Parent response included draft/archived worksheet ${worksheet.id}`);
  }
  for (const report of ws11?.parent_progress?.reports || []) {
    assert(report.parent_visible === true, `Parent response included non-parent-visible report ${report.id}`);
    assert(String(report.approval_status) === 'approved', `Parent response included unapproved report ${report.id}`);
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-ws11-parent-progress-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-ws11-parent-progress-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# WS11 Parent Progress Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.error ? ` - ${check.error}` : ''}`),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const config = loadConfig();
  assert(config.databaseCandidates.length, 'DATABASE_URL or .secrets/railway-database-url.txt is required');
  const report = {
    started_at: new Date().toISOString(),
    app_url: config.appUrl,
    checks: [],
  };
  let pool = null;
  let sessionId = '';

  async function check(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.checks.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.checks.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
      console.error(`FAIL ${name}: ${message}`);
      throw error;
    }
  }

  try {
    await check('anonymous parent WS11 route rejects access', async () => {
      const { response, text } = await fetchJson(config, '/api/parent-portal/students/1/ws11-progress', {
        acceptStatuses: [401],
      });
      assert(!/gamification|shoutout|worksheet/i.test(text), 'Anonymous rejection leaked WS11 payload terms');
      return { status: response.status, private_payload_leaked: false };
    });

    const database = await check('live database connects through configured secret', async () => {
      const connected = await connectDatabase(config.databaseCandidates);
      pool = connected.pool;
      return {
        source: connected.source,
        fingerprint: connected.fingerprint,
      };
    });
    report.database = database;

    await check('WS11 live tables and seed rows are present', async () => readTableCounts(pool));
    await cleanupSmokeRows(pool);
    let fixture = null;
    await check('active parent-student link is available for live parent readback', async () => {
      const selected = await selectParentLinkedStudent(pool);
      fixture = selected;
      return {
        student_id: Number(selected.student_id),
        parent_email_hash_prefix: sha256Hex(selected.parent_email).slice(0, 12),
        course_id: Number(selected.course_id),
        temporary_link: selected.temporary_link === true,
      };
    });

    const hiddenIds = await check('temporary hidden WS11 rows are inserted for privacy proof', async () => (
      createHiddenFixtureRows(pool, fixture)
    ));
    await check('temporary parent session is created without exposing credentials', async () => {
      sessionId = await createParentSession(pool, fixture.parent_email);
      return {
        session_hash_prefix: sha256Hex(sessionId).slice(0, 16),
        expires_minutes: 10,
      };
    });

    await check('live parent WS11 API filters hidden rows and returns only approved parent-visible data', async () => {
      const { data } = await fetchJson(
        config,
        `/api/parent-portal/students/${fixture.student_id}/ws11-progress`,
        { cookie: `bna_parent_session=${encodeURIComponent(sessionId)}` }
      );
      assert(data.success === true, 'Parent WS11 endpoint did not return success');
      assert(data.ws11 && typeof data.ws11 === 'object', 'Parent WS11 response did not include ws11 object');
      assertHiddenIdsAbsent(data.ws11, hiddenIds);
      return {
        course_count: Array.isArray(data.ws11.courses) ? data.ws11.courses.length : 0,
        event_count: Array.isArray(data.ws11.gamification?.events) ? data.ws11.gamification.events.length : 0,
        shoutout_count: Array.isArray(data.ws11.shoutouts) ? data.ws11.shoutouts.length : 0,
        worksheet_submission_count: Array.isArray(data.ws11.worksheet_submissions) ? data.ws11.worksheet_submissions.length : 0,
        report_count: Array.isArray(data.ws11.parent_progress?.reports) ? data.ws11.parent_progress.reports.length : 0,
        hidden_fixture_ids_absent: true,
      };
    });
  } finally {
    if (pool) {
      await cleanupSmokeRows(pool, sessionId).catch((error) => {
        report.cleanup_error = error instanceof Error ? error.message : String(error);
      });
      await pool.end().catch(() => {});
    }
    report.finished_at = new Date().toISOString();
    report.success = report.checks.every((item) => item.ok) && !report.cleanup_error;
    report.report_files = writeReports(report);
    console.log(`Report: ${report.report_files.markdown}`);
  }

  if (!report.success) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
