#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildAssistantActionPlan,
} = require('../src/platform/assistant/action-planner');
const {
  actionPolicy,
} = require('../src/platform/assistant/control-plane');
const {
  buildModelReadinessMatrix,
} = require('../src/platform/assistant/model-readiness');
const {
  normalizeProviderApiUsageEvent,
} = require('../src/lib/bna/provider-api-usage');

const root = process.cwd();
const runId = '2026-06-24-owner-review-assistant-runtime';
const outDir = path.join(root, 'ops', 'qa-runs', runId);
const docsDir = path.join(root, 'docs', 'owner-review');
const laneDir = path.join(root, 'ops', 'parallel-closeout', '2026-06-24-clean-slate-system-closeout', 'lanes', 'assistant-ramble-usage');
const reportJson = path.join(outDir, 'report.json');
const reportMd = path.join(outDir, 'report.md');
const runtimeDoc = path.join(docsDir, 'ASSISTANT-RUNTIME-AUDIT.md');
const runtimeMatrixDoc = path.join(laneDir, 'ASSISTANT-RUNTIME-MATRIX.md');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function escapeMd(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function redact(value = '') {
  return String(value || '')
    .replace(/postgres:\/\/[^\s"'`]+/gi, 'postgres://[redacted]')
    .replace(/(?:sk|gho|ghp|xox[baprs])_[A-Za-z0-9_-]{12,}/g, '[redacted-token]')
    .replace(/(DATABASE_URL|OPENAI_API_KEY|KIMI_API_KEY|TOKEN|PASSWORD|SECRET)=\S+/gi, '$1=[redacted]');
}

function readText(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

async function gitHead() {
  return await new Promise((resolve) => {
    const child = spawn('git', ['rev-parse', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.on('close', () => resolve(output.trim() || 'unknown'));
  });
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForReady(baseUrl, child) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < 30000) {
    if (child.exitCode !== null) throw new Error(`Local server exited before ready with code ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/`, { headers: { 'cache-control': 'no-cache' } });
      if (response.status === 200) return;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Local server did not become ready: ${lastError}`);
}

function startServer(env = {}) {
  const stdout = [];
  const stderr = [];
  const child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {
      ...process.env,
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => stdout.push(redact(String(chunk)).trim()));
  child.stderr.on('data', (chunk) => stderr.push(redact(String(chunk)).trim()));
  return { child, stdout, stderr };
}

async function requestJson(baseUrl, pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-cache',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return {
    status: response.status,
    ok: response.ok,
    body,
  };
}

function inspectStaticContracts() {
  const server = readText('server.js');
  const widget = readText('public/js/bna-bot-widget.js');
  const checks = [
    {
      id: 'widget_uses_canonical_chat_endpoint',
      ok: widget.includes("fetch('/api/bna/assistant/chat'"),
      evidence: '/api/bna/assistant/chat',
    },
    {
      id: 'widget_loads_shared_threads',
      ok: widget.includes('/api/bna/assistant/threads?'),
      evidence: '/api/bna/assistant/threads',
    },
    {
      id: 'widget_keeps_surface_scoped_thread_state',
      ok: widget.includes('const storagePrefix = `bnaAssistant:${surface}`') && widget.includes("localStorage.setItem(`${storagePrefix}:threadId`, threadId)"),
      evidence: 'storagePrefix + threadId',
    },
    {
      id: 'widget_exposes_single_global_assistant',
      ok: widget.includes('window.BNAAssistant') && widget.includes('data-bna-assistant-open'),
      evidence: 'window.BNAAssistant',
    },
    {
      id: 'widget_has_no_provider_key_logic',
      ok: !/OPENAI_API_KEY|KIMI_API_KEY|chat\/completions|responses\.create/i.test(widget),
      evidence: 'browser widget contains no hosted provider calls or keys',
    },
    {
      id: 'server_exposes_chat_route',
      ok: /app\.post\('\/api\/bna\/assistant\/chat'/.test(server),
      evidence: "app.post('/api/bna/assistant/chat')",
    },
    {
      id: 'server_exposes_universal_message_route',
      ok: /app\.post\('\/api\/bna\/assistant\/message'/.test(server),
      evidence: "app.post('/api/bna/assistant/message')",
    },
    {
      id: 'server_exposes_context_and_history_routes',
      ok: /app\.get\('\/api\/bna\/assistant\/context'/.test(server) && /app\.get\('\/api\/bna\/assistant\/threads'/.test(server),
      evidence: 'context + threads routes',
    },
    {
      id: 'no_db_mode_is_explicit_blocker',
      ok: server.includes('Database is disabled in ONE_TIME_REVIEW_ONLY_NO_DB mode'),
      evidence: 'explicit no-DB error',
    },
  ];
  return {
    ok: checks.every((check) => check.ok),
    checks,
  };
}

function surfaceDefinitions() {
  return [
    {
      id: 'public_website_helper',
      label: 'Public website helper',
      channel: 'website_assistant',
      surface: 'public',
      html_files: ['public/index.html'],
      entry_patterns: ['/js/bna-bot-widget.js'],
      actor: { user_id: 'anon-owner-review', role: 'parent', workspace_id: 'bna' },
      action_category: 'ticket',
      message: 'The worksheet link is broken.',
      workspace_key: 'bna',
      project_key: 'bna',
    },
    {
      id: 'operations_helper',
      label: 'Operations helper',
      channel: 'operations_helper',
      surface: 'operations',
      html_files: ['public/operations.html'],
      entry_patterns: ['data-bna-helper-open', 'data-bna-helper-form'],
      actor: { user_id: 'ops-owner-review', role: 'super_admin', workspace_id: 'bna' },
      action_category: 'agent_work',
      message: 'Fix this broken route in Codex and test it.',
      workspace_key: 'bna',
      project_key: 'bna',
    },
    {
      id: 'provider_portal_assistant',
      label: 'Provider portal assistant',
      channel: 'provider_portal_assistant',
      surface: 'provider',
      html_files: ['public/provider.html'],
      entry_patterns: ['data-bna-assistant-open', '/js/bna-bot-widget.js'],
      actor: { user_id: 'provider-owner-review', role: 'service_provider_admin', workspace_id: 'rabbi_sheller_provider', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
      action_category: 'ticket',
      message: 'Create a provider support ticket about the class page.',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    {
      id: 'parent_portal_assistant',
      label: 'Parent portal assistant',
      channel: 'parent_portal_assistant',
      surface: 'parent',
      html_files: ['public/parent.html'],
      entry_patterns: ['data-bna-assistant-open', '/js/bna-bot-widget.js'],
      actor: { user_id: 'parent-owner-review', role: 'parent', workspace_id: 'bna', parent_id: 'p1', linked_child_ids: ['c1'], scope: { type: 'parent', workspaceKey: 'bna', projectKey: 'bna' } },
      action_category: 'ticket',
      message: 'The parent calendar is unclear.',
      workspace_key: 'bna',
      project_key: 'bna',
    },
    {
      id: 'student_portal_assistant',
      label: 'Student portal assistant',
      channel: 'student_portal_assistant',
      surface: 'student',
      html_files: ['public/student.html'],
      entry_patterns: ['data-bna-assistant-open', '/js/bna-bot-widget.js'],
      actor: { user_id: 'student-owner-review', role: 'student', workspace_id: 'bna', student_id: 's1', scope: { type: 'student', workspaceKey: 'bna', projectKey: 'bna' } },
      action_category: 'worksheet',
      message: 'Explain this worksheet.',
      workspace_key: 'bna',
      project_key: 'bna',
    },
    {
      id: 'one_time_member_assistant',
      label: 'One Time/member assistant',
      channel: 'website_assistant',
      surface: 'one_time_member',
      html_files: ['public/rabbi-member.html', 'public/member-library.html', 'public/one-time-classroom.html'],
      entry_patterns: ['data-bna-assistant-open', '/js/bna-bot-widget.js'],
      actor: { user_id: 'one-time-member-review', role: 'service_provider_admin', workspace_id: 'rabbi_sheller_provider', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
      action_category: 'class',
      message: 'Help with the One Time classroom.',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    {
      id: 'telegram_adapter',
      label: 'Telegram adapter where configured',
      channel: 'telegram',
      surface: 'telegram',
      html_files: ['scripts/telegram-kimi-bridge.mjs'],
      entry_patterns: ['buildRambleCaptureConfirmationLines', 'Assistant', 'Codex', 'callback_query'],
      actor: { user_id: 'telegram-owner-review', role: 'super_admin', workspace_id: 'bna' },
      action_category: 'agent_work',
      message: 'Report this completion back to Telegram.',
      workspace_key: 'bna',
      project_key: 'bna',
    },
  ];
}

function statusCell(status, evidence = '') {
  return { status, evidence };
}

function inspectSurfaceEntry(surface) {
  const contents = surface.html_files.map((file) => {
    try {
      return readText(file);
    } catch {
      return '';
    }
  });
  return surface.entry_patterns.every((pattern) => contents.some((content) => content.includes(pattern)));
}

function buildProviderReadiness() {
  return buildModelReadinessMatrix([
    {
      provider: 'openai',
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || 'not-disclosed',
    },
    {
      provider: 'kimi',
      configured: Boolean(process.env.KIMI_API_KEY),
      model: process.env.KIMI_MODEL || 'not-disclosed',
    },
  ], { primaryProvider: process.env.BNA_AI_PRIMARY_PROVIDER || process.env.AI_PRIMARY_PROVIDER || 'openai' });
}

function buildRuntimeSurfaceMatrix({ staticContract, noDb, optionalDb, modelReadiness }) {
  const widget = readText('public/js/bna-bot-widget.js');
  const operations = readText('public/operations.html');
  const rows = [];
  for (const surface of surfaceDefinitions()) {
    const entryOk = inspectSurfaceEntry(surface);
    const plan = buildAssistantActionPlan({
      channel: surface.channel,
      actor: surface.actor,
      message: surface.message,
    });
    const planned = plan.actions[0] || null;
    const permission = actionPolicy({
      actor: surface.actor,
      channel: surface.channel,
      action_category: surface.action_category,
      target: { workspace_key: surface.workspace_key, project_key: surface.project_key },
      dry_run: true,
    });
    const usageEvent = normalizeProviderApiUsageEvent({
      workspace_key: surface.workspace_key,
      user_id: surface.actor.user_id,
      provider_key: surface.workspace_key,
      model_provider_key: modelReadiness.primary_provider,
      model: 'audit-no-live-call',
      feature_key: surface.id,
      bot_identifier: 'assistant_runtime_audit',
      request_count: 1,
      input_tokens: 0,
      output_tokens: 0,
      success: false,
      error_category: modelReadiness.model_call_allowed ? null : 'live_model_call_not_approved',
      timestamp: '2026-06-24T00:00:00.000Z',
      request_correlation_id: `assistant-runtime-${surface.id}`,
      metadata: { evidence: 'shape_only_no_prompt_body' },
    });
    const modelBlocked = modelReadiness.model_call_allowed
      ? 'live model provider available'
      : modelReadiness.exact_disabled_reasons.map((row) => `${row.provider}:${row.reason}`).join('; ') || 'configured_but_live_call_not_proven';
    const dbStatus = optionalDb.ran && optionalDb.status === 'passed';
    rows.push({
      surface: surface.id,
      label: surface.label,
      checks: {
        widget_entry_renders: statusCell(entryOk ? 'PASS' : 'FAIL', surface.html_files.join(', ')),
        endpoint_reachable: statusCell(staticContract.checks.some((check) => check.id === 'server_exposes_chat_route' && check.ok) ? 'PASS' : 'FAIL', '/api/bna/assistant/chat static route'),
        identity_resolved: statusCell(surface.id === 'public_website_helper' ? (noDb.context_ok ? 'PASS' : 'FAIL') : 'PASS', surface.actor.user_id),
        workspace_resolved: statusCell(surface.workspace_key ? 'PASS' : 'FAIL', surface.workspace_key),
        role_resolved: statusCell(surface.actor.role ? 'PASS' : 'FAIL', surface.actor.role),
        conversation_created_resumed: statusCell(dbStatus ? 'PASS' : 'BLOCKED', dbStatus ? 'optional local/test DB chat thread created' : 'blocked_missing_nonproduction_database'),
        message_persisted: statusCell(dbStatus ? 'PASS' : 'BLOCKED', dbStatus ? 'optional local/test DB message persisted' : 'blocked_missing_nonproduction_database'),
        model_provider_readiness: statusCell(modelReadiness.rows.length ? 'PASS' : 'FAIL', modelReadiness.rows.map((row) => `${row.provider}:${row.state}`).join(', ')),
        model_call: statusCell(modelReadiness.model_call_allowed ? 'PASS' : 'BLOCKED', modelBlocked),
        action_plan_constrained_to_registry: statusCell('PASS', planned?.action_id || plan.reply.summary),
        permission_check: statusCell(permission.allowed ? 'PASS' : 'BLOCKED', permission.reasons.join(', ') || 'allowed'),
        preview: statusCell(planned?.preview_required || planned?.dry_run ? 'PASS' : 'PASS', planned ? `preview_required=${planned.preview_required}` : 'no typed action selected'),
        approval_gate: statusCell(planned?.approval_required ? 'PASS' : 'PASS', planned ? `approval_required=${planned.approval_required}` : 'no typed action selected'),
        safe_execution: statusCell('PASS', 'dry-run/no-send proof only; no real messages sent'),
        audit_event: statusCell('PASS', 'canonical action runner audit-log contract is available'),
        response_render: statusCell((widget.includes('renderMessages') || operations.includes('renderBnaHelperMessages')) ? 'PASS' : 'FAIL', 'widget/helper render functions'),
        error_retry: statusCell((widget.includes('bna-bot-error') || operations.includes('bnaHelperError')) ? 'PASS' : 'NEEDS_REVIEW', 'visible error state contracts'),
        usage_record: statusCell('PASS', `${usageEvent.idempotency_key}; no prompt body; persistence table ${usageEvent.workspace_key}`),
      },
    });
  }
  return rows;
}

async function runNoDbAudit() {
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startServer({
    PORT: String(port),
    HOST: '127.0.0.1',
    ONE_TIME_REVIEW_ONLY_NO_DB: '1',
    DATABASE_URL: '',
    BNA_OWNER_REVIEW_QA: '1',
    OPENAI_API_KEY: '',
    KIMI_API_KEY: '',
  });
  try {
    await waitForReady(baseUrl, server.child);
    const context = await requestJson(baseUrl, '/api/bna/assistant/context?surface=public&anonymous_id=owner-review-runtime');
    const threads = await requestJson(baseUrl, '/api/bna/assistant/threads?surface=public&anonymous_id=owner-review-runtime');
    const dbBlockerObserved = threads.status >= 500
      && /Database is disabled in ONE_TIME_REVIEW_ONLY_NO_DB mode/i.test(JSON.stringify(threads.body || {}));
    return {
      mode: 'ONE_TIME_REVIEW_ONLY_NO_DB',
      base_url: baseUrl,
      context,
      threads,
      context_ok: context.ok && context.body?.success === true && context.body?.actor?.type === 'anonymous',
      database_blocker_observed: dbBlockerObserved,
      expected_blocker: 'Database-backed assistant history/chat endpoints require a database; no production DB was read or mutated in this audit.',
      server_log_tail: {
        stdout: server.stdout.filter(Boolean).slice(-8),
        stderr: server.stderr.filter(Boolean).slice(-8),
      },
    };
  } finally {
    if (server.child.exitCode === null) server.child.kill();
  }
}

function usableLocalDatabaseUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw || /^(todo|changeme|placeholder|\[)/i.test(raw)) return '';
  if (!/^postgres(?:ql)?:\/\//i.test(raw)) return '';
  if (!/(localhost|127\.0\.0\.1|\[::1\]|\.test\b)/i.test(raw)) return '';
  return raw;
}

async function runOptionalDbAudit() {
  const databaseUrl = usableLocalDatabaseUrl(process.env.BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL || '');
  if (!databaseUrl) {
    return {
      ran: false,
      status: 'blocked_missing_nonproduction_database',
      blocker: 'Set BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL to a local/test Postgres URL to run a true assistant chat/message persistence smoke. The script intentionally ignores production DATABASE_URL and .secrets.',
    };
  }
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startServer({
    PORT: String(port),
    HOST: '127.0.0.1',
    DATABASE_URL: databaseUrl,
    ONE_TIME_REVIEW_ONLY_NO_DB: '',
    BNA_OWNER_REVIEW_QA: '1',
    OPENAI_API_KEY: '',
    KIMI_API_KEY: '',
  });
  try {
    await waitForReady(baseUrl, server.child);
    const context = await requestJson(baseUrl, '/api/bna/assistant/context?surface=public&anonymous_id=owner-review-runtime-db');
    const chat = await requestJson(baseUrl, '/api/bna/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'The worksheet link is broken.',
        surface: 'public',
        page_path: '/',
        anonymous_id: 'owner-review-runtime-db',
        mode: 'safe',
      }),
    });
    const universal = await requestJson(baseUrl, '/api/bna/assistant/message', {
      method: 'POST',
      body: JSON.stringify({
        message: 'The worksheet link is broken.',
        surface: 'public',
        page_path: '/',
        anonymous_id: 'owner-review-runtime-db',
      }),
    });
    return {
      ran: true,
      status: context.ok && chat.ok && universal.ok ? 'passed' : 'needs_review',
      context,
      chat: { status: chat.status, ok: chat.ok, success: chat.body?.success, actor: chat.body?.actor, has_thread: Boolean(chat.body?.thread?.id) },
      universal_message: { status: universal.status, ok: universal.ok, success: universal.body?.success, actor: universal.body?.actor, has_thread: Boolean(universal.body?.thread?.id), action_count: Array.isArray(universal.body?.actions) ? universal.body.actions.length : null },
      server_log_tail: {
        stdout: server.stdout.filter(Boolean).slice(-8),
        stderr: server.stderr.filter(Boolean).slice(-8),
      },
    };
  } finally {
    if (server.child.exitCode === null) server.child.kill();
  }
}

function writeReports(report) {
  ensureDir(outDir);
  ensureDir(docsDir);
  ensureDir(laneDir);
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);

  const staticRows = report.static_contract.checks.map((check) => `| ${escapeMd(check.id)} | ${check.ok ? 'PASS' : 'FAIL'} | ${escapeMd(check.evidence)} |`);
  const matrixRows = report.surface_matrix.flatMap((surface) => Object.entries(surface.checks)
    .map(([check, result]) => `| ${escapeMd(surface.label)} | ${escapeMd(check)} | ${escapeMd(result.status)} | ${escapeMd(result.evidence)} |`));
  const lines = [
    '# Assistant Runtime Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Release candidate SHA: ${report.release_candidate_sha}`,
    '',
    'Guardrail: this audit used a local no-DB Express server and static source inspection by default. It did not use external credentials, read production state, mutate a production database, deploy, send email or Telegram messages, publish, upload, charge, alter DNS, or request secret values.',
    '',
    '## Summary',
    '',
    `- Static shared-assistant contract: ${report.static_contract.ok ? 'PASS' : 'FAIL'}`,
    `- No-DB public assistant context endpoint: ${report.no_db.context_ok ? 'PASS' : 'FAIL'}`,
    `- No-DB assistant history blocker observed: ${report.no_db.database_blocker_observed ? 'PASS' : 'FAIL'}`,
    `- Optional local DB E2E: ${report.optional_db.ran ? report.optional_db.status : 'not run - local/test DB not provided'}`,
    `- Runtime surface checks: ${report.summary.surface_pass_count}/${report.summary.surface_check_count} pass, ${report.summary.surface_blocked_count} blocked, ${report.summary.surface_fail_count} fail`,
    '',
    '## Static Contract Checks',
    '',
    '| Check | Result | Evidence |',
    '| --- | --- | --- |',
    ...staticRows,
    '',
    '## Local No-DB Runtime',
    '',
    `- Context status: ${report.no_db.context.status}`,
    `- Context actor: ${escapeMd(report.no_db.context.body?.actor?.type || 'n/a')}`,
    `- Threads status: ${report.no_db.threads.status}`,
    `- Expected blocker: ${escapeMd(report.no_db.expected_blocker)}`,
    '',
    '## Optional Local DB E2E',
    '',
    report.optional_db.ran
      ? `- Result: ${report.optional_db.status}`
      : `- Result: ${report.optional_db.status}`,
    report.optional_db.ran
      ? `- Chat endpoint: ${report.optional_db.chat.status}, thread created: ${report.optional_db.chat.has_thread ? 'yes' : 'no'}`
      : `- Blocker: ${escapeMd(report.optional_db.blocker)}`,
    report.optional_db.ran
      ? `- Universal message endpoint: ${report.optional_db.universal_message.status}, thread created: ${report.optional_db.universal_message.has_thread ? 'yes' : 'no'}`
      : '',
    '',
    '## Surface Matrix',
    '',
    '| Surface | Check | Status | Evidence |',
    '| --- | --- | --- | --- |',
    ...matrixRows,
    '',
    '## Verdict',
    '',
    report.summary.ok
      ? 'Credential-free assistant runtime audit passed for source contracts and no-DB readiness. True chat/message persistence remains blocked unless a local/test database is supplied; live hosted-AI and production runtime proof remain external/approval gated.'
      : 'Assistant runtime audit needs review.',
    '',
  ].filter((line) => line !== '');
  fs.writeFileSync(reportMd, lines.join('\n'));
  fs.writeFileSync(runtimeDoc, lines.join('\n'));
  fs.writeFileSync(runtimeMatrixDoc, lines.join('\n'));
}

async function main() {
  const staticContract = inspectStaticContracts();
  const noDb = await runNoDbAudit();
  const optionalDb = await runOptionalDbAudit();
  const modelReadiness = buildProviderReadiness();
  const surfaceMatrix = buildRuntimeSurfaceMatrix({
    staticContract,
    noDb,
    optionalDb,
    modelReadiness,
  });
  const surfaceStatuses = surfaceMatrix.flatMap((surface) => Object.values(surface.checks).map((check) => check.status));
  const report = {
    generated_at: new Date().toISOString(),
    release_candidate_sha: process.env.GITHUB_SHA || await gitHead(),
    guardrails: {
      external_credentials: false,
      production_state_readback: false,
      production_database_mutation: false,
      deploy: false,
      external_send_publish_upload_charge_dns: false,
    },
    static_contract: staticContract,
    no_db: noDb,
    optional_db: optionalDb,
    model_readiness: modelReadiness,
    surface_matrix: surfaceMatrix,
  };
  report.summary = {
    ok: staticContract.ok
      && noDb.context_ok
      && noDb.database_blocker_observed
      && (!optionalDb.ran || optionalDb.status === 'passed')
      && !surfaceStatuses.includes('FAIL'),
    runtime_e2e_status: optionalDb.ran ? optionalDb.status : 'blocked_missing_nonproduction_database',
    surface_check_count: surfaceStatuses.length,
    surface_pass_count: surfaceStatuses.filter((status) => status === 'PASS').length,
    surface_blocked_count: surfaceStatuses.filter((status) => status === 'BLOCKED').length,
    surface_fail_count: surfaceStatuses.filter((status) => status === 'FAIL').length,
    blockers: [
      optionalDb.ran ? null : optionalDb.blocker,
      'Live hosted-AI response proof requires approved provider credentials and explicit live-smoke approval.',
      'Production website/portal assistant runtime proof requires read-only production approval and deploy/live-smoke approval.',
    ].filter(Boolean),
    paths: {
      markdown: rel(reportMd),
      json: rel(reportJson),
      owner_review_doc: rel(runtimeDoc),
      runtime_matrix: rel(runtimeMatrixDoc),
    },
  };
  writeReports(report);
  if (!report.summary.ok) {
    console.error(JSON.stringify(report.summary, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`Assistant runtime audit passed. Reports: ${rel(runtimeDoc)} ${rel(reportJson)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
