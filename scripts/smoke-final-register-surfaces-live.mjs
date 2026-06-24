#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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

async function requestText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

async function requestJson(url, options = {}) {
  const { response, text } = await requestText(url, {
    ...options,
    headers: { accept: 'application/json', ...(options.headers || {}) },
  });
  try {
    return { response, data: JSON.parse(text) };
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
}

function expectIncludes(text, markers, label) {
  const missing = markers.filter((marker) => !text.includes(marker));
  assert(!missing.length, `${label} missing markers: ${missing.join(', ')}`);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-final-register-surfaces-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-final-register-surfaces-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Final Register Surfaces Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- provider_routes_checked: ${report.summary.provider_routes_checked}`,
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
    `- helper_tools_present: ${(report.summary.helper_tools_present || []).join(', ') || 'none'}`,
    `- recording_raw_intake_id: ${report.summary.recording_raw_intake_id || 'none'}`,
    `- calendar_events_loaded: ${report.summary.calendar_events_loaded}`,
    `- automations_loaded: ${report.summary.automations_loaded}`,
    '',
    'Guardrail: this smoke performs dry-run parser checks and read-only surface checks only. It does not create Google Classroom courses, send reminders, publish content, charge payments, sync external connectors, or expose raw secrets.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required');
  const auth = basicAuthHeader(username, password);
  const authedHeaders = { Authorization: auth };
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      provider_routes_checked: 0,
      operations_markers_checked: 0,
      helper_tools_present: [],
      recording_raw_intake_id: '',
      calendar_events_loaded: 0,
      automations_loaded: 0,
    },
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  try {
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      assert(data.database === 'connected', 'Database is not connected');
      return { status: data.status, database: data.database };
    });

    await step('provider public and portal routes expose directory, join, classroom, and plan markers', async () => {
      const checks = [
        ['/', ['Service Provider Network', 'href="/providers/join?onboard=provider"']],
        ['/service-providers', ['Service Provider', 'Provider', 'Advertise your program for free', 'href="/providers/join?onboard=provider"']],
        ['/providers/join?onboard=provider', ['raw_intake', 'Service Provider', 'provider']],
        ['/provider', ['Safe portal navigation', 'Directory', 'Join', 'data-provider-classroom-setup', 'Start a classroom draft']],
        ['/api/provider-plans', ['plans']],
      ];
      for (const [route, markers] of checks) {
        const { text } = await requestText(`${appUrl}${route}`);
        expectIncludes(text, markers, route);
      }
      report.summary.provider_routes_checked = checks.length;
      return { routes: checks.map(([route]) => route) };
    });

    await step('Operations bundle exposes internal-first and explanatory markers', async () => {
      const { text } = await requestText(`${appUrl}/operations?view=settings&section=calendar_classroom&workspace=platform&smoke=${Date.now()}`, {
        headers: authedHeaders,
      });
      const markers = [
        'BNA internal calendar works now',
        'Google is a connector, not a blocker',
        'BNA Classroom is first-party and usable now',
        'Coming soon / internal-first',
        'Encrypted storage',
        'Rotation reminder',
        'Create automation with helper',
        'local-toolbar-copy',
        'Billing & Payments',
        'Provider Index',
        'Intake Review',
      ];
      expectIncludes(text, markers, 'Operations bundle');
      report.summary.operations_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('helper tools expose automation and secret rotation controls', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/helper/tools`, { headers: authedHeaders });
      const tools = (data.tools || []).map((tool) => tool.name);
      for (const required of ['create_automation', 'update_automation', 'save_provider_api_key', 'rotate_provider_api_key', 'create_provider_classroom_draft']) {
        assert(tools.includes(required), `Helper tools missing ${required}`);
      }
      report.summary.helper_tools_present = tools.filter((name) => ['create_automation', 'update_automation', 'save_provider_api_key', 'rotate_provider_api_key', 'create_provider_classroom_draft'].includes(name));
      return { tools: report.summary.helper_tools_present };
    });

    await step('recording intake dry run returns raw intake provenance', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/recording-intake/parse-mixed-recording`, {
        method: 'POST',
        headers: { ...authedHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Final register smoke recording',
          caption: 'Dry-run parser proof for uploaded class and ramble protocol parity.',
          transcript_text: 'Class recording: students discussed Mishnah review. Task: Codex should verify raw intake parity. No external write should happen.',
          source_type: 'telegram_media',
          source_message_id: `final-register-smoke-${Date.now()}`,
          dry_run: true,
        }),
      });
      assert(data.success === true, 'recording intake did not return success');
      assert(data.dry_run === true, 'recording intake smoke was not dry_run');
      assert(data.raw_intake?.stable_id, 'recording intake response missing raw_intake.stable_id');
      assert(data.parse_run?.id, 'recording intake response missing parse_run.id');
      assert(data.report?.parser === 'canonical-intake-parser', 'recording intake did not use canonical parser');
      report.summary.recording_raw_intake_id = data.raw_intake.stable_id;
      return { raw_intake: data.raw_intake.stable_id, parse_run_id: data.parse_run.id };
    });

    await step('calendar and automations APIs remain readable', async () => {
      const calendar = await requestJson(`${appUrl}/api/bna/calendar-events`, { headers: authedHeaders });
      const automations = await requestJson(`${appUrl}/api/bna/automations`, { headers: authedHeaders });
      assert(Array.isArray(calendar.data.events), 'calendar events payload missing events array');
      assert(Array.isArray(automations.data.automations), 'automations payload missing automations array');
      report.summary.calendar_events_loaded = calendar.data.events.length;
      report.summary.automations_loaded = automations.data.automations.length;
      return {
        calendar_events: calendar.data.events.length,
        automations: automations.data.automations.length,
      };
    });
  } finally {
    const paths = writeReports(report);
    report.report_paths = paths;
    const failed = report.steps.filter((step) => !step.ok);
    console.log(JSON.stringify({ ok: failed.length === 0, report: paths.markdown }, null, 2));
    if (failed.length) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
