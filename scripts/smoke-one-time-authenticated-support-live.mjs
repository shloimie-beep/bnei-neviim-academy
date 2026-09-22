#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestJson(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data };
}

async function requestText(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html,application/javascript;q=0.9,*/*;q=0.8',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-authenticated-support-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-authenticated-support-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Authenticated Support Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const detail = step.error ? ` - ${step.error}` : step.detail ? ` - ${step.detail}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${detail}`;
    }),
    '',
    '## Result',
    `- member_id: ${report.result.member_id || 'n/a'}`,
    `- ticket_number: ${report.result.ticket_number || 'n/a'}`,
    `- question_number: ${report.result.question_number || 'n/a'}`,
    '',
    '## Guardrails',
    '- Member APIs required bearer member session authentication.',
    '- Support response returned ticket-only mode and no internal notes/source context.',
    '- Private question response returned no forum/member-feed/send/external-write flags.',
    '- No email, WhatsApp, SMS, Telegram, Buffer, payment, CRM, forum, Google, Zoom, or external connector write was triggered.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = { ...loadEnvFile(path.join(root, '.env.local')), ...loadEnvFile(path.join(root, '.env')), ...process.env };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required');
  const adminAuth = basicAuthHeader(username, password);
  const stamp = Date.now();
  const email = `codex-one-time-support-smoke+${stamp}@example.test`;
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    requirement_id: 'REQ-20260621-908',
    steps: [],
    result: {},
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, detail: typeof detail === 'string' ? detail : '' });
      console.log(`PASS ${name}`);
      return detail;
    } catch (error) {
      report.steps.push({
        name,
        ok: false,
        duration_ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  let sessionToken = '';
  let ticketId = null;

  await step('Member portal and script expose authenticated support UX', async () => {
    const page = await requestText(`${appUrl}/rabbi-member`);
    assert(page.text.includes('id="questionForm"'), 'member page missing question form');
    assert(page.text.includes('id="supportForm"'), 'member page missing support form');
    const script = await requestText(`${appUrl}/js/rabbi-member.js`);
    assert(script.text.includes('/api/rabbi/member/questions'), 'member script missing questions endpoint');
    assert(script.text.includes('/api/rabbi/member/support-tickets'), 'member script missing support endpoint');
    return 'portal forms and member API calls present';
  });

  await step('Logged-out member support APIs reject unauthenticated access', async () => {
    const support = await requestJson(`${appUrl}/api/rabbi/member/support-tickets`, { acceptStatuses: [401, 403] });
    assert(/token|session|login/i.test(support.data.error || ''), 'support endpoint did not reject missing token');
    const questions = await requestJson(`${appUrl}/api/rabbi/member/questions`, { acceptStatuses: [401, 403] });
    assert(/token|session|login/i.test(questions.data.error || ''), 'questions endpoint did not reject missing token');
    return 'missing bearer token rejected';
  });

  await step('Create disposable One Time member and open dry-run member session', async () => {
    const created = await requestJson(`${appUrl}/api/bna/rabbi/members`, {
      method: 'POST',
      headers: { authorization: adminAuth },
      body: JSON.stringify({
        display_name: 'Codex Auth Support Smoke',
        email,
        tier_key: 'library_only',
        access_status: 'active',
        notes: 'Created by authenticated support live smoke; no external sends.',
      }),
    });
    assert(created.data.success === true, 'member create failed');
    report.result.member_id = created.data.member?.id || null;
    const requested = await requestJson(`${appUrl}/api/rabbi/member/request-login`, {
      method: 'POST',
      body: JSON.stringify({ email, dryRun: true }),
    });
    assert(requested.data.preview_login_token, 'dry-run login token missing');
    const loggedIn = await requestJson(`${appUrl}/api/rabbi/member/login`, {
      method: 'POST',
      body: JSON.stringify({ token: requested.data.preview_login_token }),
    });
    assert(loggedIn.data.session_token, 'member session token missing');
    sessionToken = loggedIn.data.session_token;
    return `member ${report.result.member_id || 'created'} session opened`;
  });

  await step('Authenticated member creates scoped support ticket', async () => {
    const created = await requestJson(`${appUrl}/api/rabbi/member/support-tickets`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        title: `Codex authenticated support smoke ${stamp}`,
        description: 'Live smoke verifies member-scoped support ticket creation and sanitized readback.',
        category: 'access',
        severity: 'normal',
        page_path: '/rabbi-member',
      }),
    });
    const ticket = created.data.ticket || {};
    assert(created.data.success === true, 'ticket create did not return success');
    assert(/^OT-SUP-\d{6}$/.test(ticket.ticket_number || ''), `ticket number invalid: ${ticket.ticket_number || ''}`);
    assert(ticket.member_scoped === true, 'ticket is not marked member scoped');
    assert(ticket.staff_internal_notes_returned === false, 'ticket returned internal notes');
    assert(ticket.source_context_returned === false, 'ticket returned source context');
    assert(created.data.support_bot_mode === 'ticket_only', 'support bot mode mismatch');
    assert(created.data.unrestricted_mishnah_study_bot === false, 'unrestricted study bot enabled');
    assert(created.data.external_write_performed === false, 'ticket create reported external write');
    ticketId = ticket.id;
    report.result.ticket_id = ticket.id;
    report.result.ticket_number = ticket.ticket_number;
    return ticket.ticket_number;
  });

  await step('Staff-visible reply is returned while internal note stays hidden', async () => {
    assert(ticketId, 'ticket id missing');
    await requestJson(`${appUrl}/api/bna/support-tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { authorization: adminAuth },
      body: JSON.stringify({
        body: 'Project-visible staff reply from live smoke.',
        author: 'Codex live smoke',
        visibility: 'project',
        source: 'api',
        source_context: { smoke: true, no_send: true, external_write_performed: false },
      }),
    });
    await requestJson(`${appUrl}/api/bna/support-tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { authorization: adminAuth },
      body: JSON.stringify({
        body: 'Internal-only smoke note must not be returned to the member.',
        author: 'Codex live smoke',
        visibility: 'internal',
        source: 'api',
        source_context: { smoke: true, no_send: true, external_write_performed: false },
      }),
    });
    const detail = await requestJson(`${appUrl}/api/rabbi/member/support-tickets/${ticketId}`, {
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    const ticket = detail.data.ticket || {};
    const replies = ticket.staff_replies || [];
    assert(replies.some((reply) => /Project-visible staff reply/.test(reply.body || '')), 'project-visible staff reply missing');
    assert(!JSON.stringify(ticket).includes('Internal-only smoke note'), 'internal note leaked to member response');
    assert(ticket.staff_internal_notes_returned === false, 'internal notes flag not false');
    return `${replies.length} visible member reply row(s)`;
  });

  await step('Authenticated member submits private question with no forum/feed/send', async () => {
    const created = await requestJson(`${appUrl}/api/rabbi/member/questions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        topic: 'Live smoke private question',
        question_text: 'Can the Rabbi review this smoke question privately?',
        page_path: '/rabbi-member',
      }),
    });
    const question = created.data.question || {};
    assert(created.data.success === true, 'question create did not return success');
    assert(/^OT-Q-\d{6}$/.test(question.question_number || ''), `question number invalid: ${question.question_number || ''}`);
    assert(question.member_scoped === true, 'question is not marked member scoped');
    assert(question.no_public_forum === true, 'question allowed public forum');
    assert(question.no_member_feed === true, 'question allowed member feed');
    assert(question.internal_notes_returned === false, 'question returned internal notes');
    assert(question.source_context_returned === false, 'question returned source context');
    assert(created.data.no_send === true, 'question create did not preserve no_send');
    assert(created.data.external_write_performed === false, 'question create reported external write');
    report.result.question_id = question.id;
    report.result.question_number = question.question_number;
    return question.question_number;
  });

  await step('Member lists return only sanitized own support/question rows', async () => {
    const support = await requestJson(`${appUrl}/api/rabbi/member/support-tickets`, {
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    const tickets = support.data.tickets || [];
    assert(tickets.some((ticket) => ticket.ticket_number === report.result.ticket_number), 'created ticket missing from member list');
    assert(!JSON.stringify(tickets).includes('"source_context":'), 'support list leaked raw source_context key');
    assert(!JSON.stringify(tickets).includes('Internal-only smoke note'), 'support list leaked internal comment');
    const questions = await requestJson(`${appUrl}/api/rabbi/member/questions`, {
      headers: { authorization: `Bearer ${sessionToken}` },
    });
    const rows = questions.data.questions || [];
    assert(rows.some((question) => question.question_number === report.result.question_number), 'created question missing from member list');
    assert(!JSON.stringify(rows).includes('"privacy_notes":'), 'question list leaked privacy notes');
    assert(!JSON.stringify(rows).includes('"source_context":'), 'question list leaked raw source context');
    return `tickets=${tickets.length}, questions=${rows.length}`;
  });

  await step('Close smoke support ticket without sending notifications', async () => {
    if (!ticketId) return 'no ticket to close';
    const patched = await requestJson(`${appUrl}/api/bna/support-tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { authorization: adminAuth },
      body: JSON.stringify({
        status: 'closed',
        resolution_note: 'Closed by authenticated support live smoke. No external send performed.',
      }),
    });
    assert(patched.data.success === true, 'ticket close failed');
    assert(patched.data.notification_draft?.external_write_performed !== true, 'close notification reported external write');
    return 'ticket closed with no external-send notification draft';
  });

  const paths = writeReports(report);
  console.log(JSON.stringify({ ok: true, report: paths.markdown, requirement_id: report.requirement_id }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
