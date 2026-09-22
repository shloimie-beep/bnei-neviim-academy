#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL,
    reportDir: path.join(repoRoot, 'ops', 'live-smokes'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    } else if (arg === '--report-dir') {
      options.reportDir = argv[index + 1] || options.reportDir;
      index += 1;
    }
  }
  options.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  return options;
}

function loadConfig(options) {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  return {
    ...options,
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
  };
}

function basicAuth(config) {
  return `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function absoluteUrl(config, endpoint) {
  return `${config.baseUrl}${endpoint}`;
}

async function fetchText(config, endpoint, { auth = false, method = 'GET', body = null, accept = '*/*', expectedStatuses = [200] } = {}) {
  const headers = { accept };
  if (auth) headers.Authorization = basicAuth(config);
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(absoluteUrl(config, endpoint), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const text = await response.text();
  assert(expectedStatuses.includes(response.status), `${method} ${endpoint} returned ${response.status}: ${text.slice(0, 500)}`);
  return { response, text };
}

async function fetchJson(config, endpoint, options = {}) {
  const { text, response } = await fetchText(config, endpoint, {
    accept: 'application/json',
    ...options,
  });
  try {
    return { response, data: text ? JSON.parse(text) : {} };
  } catch {
    throw new Error(`${options.method || 'GET'} ${endpoint} returned non-JSON: ${text.slice(0, 500)}`);
  }
}

async function runStep(report, name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.steps.push({ name, status: 'PASS', duration_ms: Date.now() - started, details });
    console.log(`PASS ${name}`);
    return details;
  } catch (error) {
    report.steps.push({ name, status: 'FAIL', duration_ms: Date.now() - started, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
    report.result = 'failed';
    process.exitCode = 1;
    return null;
  }
}

async function checkPwaSeparation(config, report) {
  return runStep(report, 'live PWA identities stay separated', async () => {
    const publicManifest = JSON.parse((await fetchText(config, '/manifest.json', { accept: 'application/manifest+json,application/json' })).text);
    const operationsManifest = JSON.parse((await fetchText(config, '/operations-manifest.json', { accept: 'application/manifest+json,application/json' })).text);
    const parentManifest = JSON.parse((await fetchText(config, '/parent-manifest.json', { accept: 'application/manifest+json,application/json' })).text);
    assert(publicManifest.id === '/', `public manifest id ${publicManifest.id}`);
    assert(publicManifest.start_url === '/?source=public-pwa', `public start_url ${publicManifest.start_url}`);
    assert(operationsManifest.id === '/operations', `operations manifest id ${operationsManifest.id}`);
    assert(operationsManifest.start_url === '/operations?source=ops-pwa', `operations start_url ${operationsManifest.start_url}`);
    assert(operationsManifest.scope === '/operations', `operations scope ${operationsManifest.scope}`);
    assert(parentManifest.id === '/parent', `parent manifest id ${parentManifest.id}`);
    assert(parentManifest.start_url === '/parent?source=parent-pwa', `parent start_url ${parentManifest.start_url}`);
    assert(parentManifest.scope === '/parent', `parent scope ${parentManifest.scope}`);

    const sw = (await fetchText(config, '/sw.js', { accept: 'application/javascript,text/javascript,*/*' })).text;
    assert(sw.includes('PRIVATE_APP_PREFIXES'), 'service worker missing private prefix guard');
    assert(sw.includes("'/operations'"), 'service worker missing Operations private prefix');
    assert(sw.includes("'/parent'"), 'service worker missing parent private prefix');
    assert(!sw.includes('/operations-manifest.json'), 'public service worker caches Operations manifest');
    assert(!sw.includes('/parent-manifest.json'), 'public service worker caches parent manifest');

    const operations = await fetchText(config, '/operations', { expectedStatuses: [302, 401], accept: 'text/html,*/*' });
    return {
      public_start_url: publicManifest.start_url,
      operations_start_url: operationsManifest.start_url,
      parent_start_url: parentManifest.start_url,
      anonymous_operations_status: operations.response.status,
      external_write_performed: false,
    };
  });
}

async function checkProviderReadiness(config, report) {
  return runStep(report, 'live provider integration readiness is scoped and read-only', async () => {
    const zoom = await fetchJson(config, '/api/bna/integrations/zoom/status', { auth: true });
    assert(zoom.data.success === true, 'Zoom status did not return success');
    assert(zoom.data.card?.configured === true, 'Zoom app credentials are not configured on live');

    const zoomPreview = await fetchJson(config, '/api/bna/integrations/zoom/meeting-preview', {
      auth: true,
      method: 'POST',
      body: {
        topic: 'Approved release smoke preview only',
        start_time: '2026-06-19T12:00:00+03:00',
        duration_minutes: 30,
      },
    });
    assert(zoomPreview.data.external_write_performed === false, 'Zoom preview performed an external write');

    const video = await fetchJson(config, '/api/bna/integrations/video-hosting/status', { auth: true });
    assert(video.data.success === true, 'Video hosting status did not return success');
    assert(video.data.card?.vimeo?.appCredentialsConfigured === true, 'Vimeo app credentials are not configured on live');
    assert(video.data.card?.manualFallback?.ready === true, 'Vimeo manual fallback is not ready');

    const draft = await fetchJson(config, '/api/bna/video-library/drafts', {
      auth: true,
      method: 'POST',
      body: {
        title: 'Approved release smoke draft',
        source_kind: 'drive_drop',
        transcript: 'Short smoke transcript.',
      },
    });
    assert(draft.data.external_write_performed === false, 'Video draft performed an external write');

    const resend = await fetchJson(config, '/api/bna/integrations/resend/status', { auth: true });
    assert(resend.data.success === true, 'Resend status did not return success');
    assert(resend.data.card?.status === 'not_configured', `Unexpected Resend status ${resend.data.card?.status}`);

    return {
      zoom_status: zoom.data.card.status,
      zoom_preview_external_write: zoomPreview.data.external_write_performed,
      vimeo_app_credentials: video.data.card.vimeo.appCredentialsConfigured,
      vimeo_status: video.data.card.status,
      resend_status: resend.data.card.status,
      external_write_performed: false,
    };
  });
}

async function checkAgentControl(config, report) {
  return runStep(report, 'live Agent Control lifecycle seals safe temporary run', async () => {
    assert(config.opsUsername && config.opsPassword, 'OPS_USERNAME/OPS_PASSWORD are required for live Agent Control smoke');
    let taskId = null;
    let cleanup = { attempted: false, ok: false };
    const stamp = Date.now();
    try {
      const operationsPage = await fetchText(config, '/operations?workspace=platform&view=agents', { auth: true, accept: 'text/html,*/*' });
      assert(operationsPage.text.includes('Agent Control'), 'Operations Agents page did not include Agent Control');

      const created = await fetchJson(config, '/api/bna/tasks', {
        auth: true,
        method: 'POST',
        body: {
          title: `Codex approved release Agent Control live smoke ${stamp}`,
          notes: 'Temporary task created by scripts/smoke-approved-release-live.mjs and deleted in the same smoke run.',
          source: 'manual',
          created_by: 'approved-release-live-smoke',
          assigned_to: 'Codex',
          category: 'operations',
          urgency: 'low',
          implementation_status: 'complete',
          verification_status: 'needed',
          required_verification_mode: 'mixed',
        },
      });
      taskId = created.data.task?.id;
      assert(taskId, 'Task create did not return an id');

      const runCreated = await fetchJson(config, `/api/bna/tasks/${taskId}/agent-runs`, {
        auth: true,
        method: 'POST',
        body: {
          agent_key: 'browser_qa',
          verification_mode: 'mixed',
          priority: 'low',
          target_url: '/operations?workspace=platform&view=agents',
          purpose: 'Approved live release smoke for Agent Control lifecycle.',
          acceptance_criteria: [
            { id: 'LIVE-AC-1', label: 'Agent Control API lifecycle works on live', required: true },
            { id: 'LIVE-AC-2', label: 'Evidence can be attached before seal', required: true },
          ],
          allowed_actions: ['Create and clean up one temporary smoke task and agent run'],
          forbidden_actions: ['No external sends', 'No meeting creation', 'No video upload', 'No secret capture'],
        },
      });
      const runKey = runCreated.data.run?.run_key;
      assert(runKey, 'Agent run create did not return a run_key');

      await fetchJson(config, `/api/bna/agent-runs/${encodeURIComponent(runKey)}/claim`, {
        auth: true,
        method: 'POST',
        body: { claimed_by: 'Codex live release smoke' },
      });
      await fetchJson(config, `/api/bna/agent-runs/${encodeURIComponent(runKey)}/progress`, {
        auth: true,
        method: 'POST',
        body: {
          event_type: 'progress',
          body: 'Live release smoke verified Agent Control routes and is attaching evidence.',
          metadata: { release_smoke: true },
        },
      });
      await fetchJson(config, `/api/bna/agent-runs/${encodeURIComponent(runKey)}/artifacts`, {
        auth: true,
        method: 'POST',
        body: {
          artifact_type: 'report',
          title: 'Approved release live smoke report',
          path: 'ops/live-smokes/smoke-approved-release-live.md',
          redaction_status: 'not_needed',
          metadata: { release_smoke: true },
        },
      });
      await fetchJson(config, `/api/bna/agent-runs/${encodeURIComponent(runKey)}/submit`, {
        auth: true,
        method: 'POST',
        body: {
          outcome: 'pass',
          summary: 'Live Agent Control safe smoke passed.',
          criterion_results: [
            { id: 'LIVE-AC-1', status: 'pass', note: 'Live Agent Control API lifecycle responded successfully.' },
            { id: 'LIVE-AC-2', status: 'pass', note: 'Evidence artifact was accepted before seal.' },
          ],
          routes_tested: ['/operations?workspace=platform&view=agents', `/operations/agents/runs/${runKey}`],
          viewports_tested: ['api-live'],
          console_network: { browser_console_errors: 0, api_errors: 0 },
          remaining_issues: [],
        },
      });
      const sealed = await fetchJson(config, `/api/bna/agent-runs/${encodeURIComponent(runKey)}/seal`, {
        auth: true,
        method: 'POST',
        body: {
          outcome: 'pass',
          summary: 'Live Agent Control safe smoke sealed pass.',
          automated_gates_passed: true,
          criterion_results: [
            { id: 'LIVE-AC-1', status: 'pass', note: 'Live Agent Control API lifecycle responded successfully.' },
            { id: 'LIVE-AC-2', status: 'pass', note: 'Evidence artifact was accepted before seal.' },
          ],
        },
      });
      assert(sealed.data.run?.status === 'sealed_pass', `sealed status ${sealed.data.run?.status}`);

      const readback = await fetchJson(config, `/api/bna/agent-runs/${encodeURIComponent(runKey)}`, { auth: true });
      assert(readback.data.run?.status === 'sealed_pass', 'sealed run readback did not persist sealed_pass');
      assert((readback.data.artifacts || []).length >= 1, 'sealed run readback missing artifact');
      assert((readback.data.events || []).some((event) => String(event.event_type || '').includes('sealed')), 'sealed run readback missing seal event');

      const runPage = await fetchText(config, `/operations/agents/runs/${encodeURIComponent(runKey)}?workspace=platform&view=agents`, { auth: true, accept: 'text/html,*/*' });
      assert(runPage.text.includes('Agent Control') || runPage.text.includes('Agent Run'), 'Agent Run page did not render shell');

      return {
        task_id: taskId,
        run_key: runKey,
        sealed_status: readback.data.run.status,
        artifacts: (readback.data.artifacts || []).length,
        events: (readback.data.events || []).length,
        cleanup,
        external_write_performed: true,
      };
    } finally {
      if (taskId) {
        cleanup.attempted = true;
        try {
          await fetchJson(config, `/api/bna/tasks/${taskId}`, {
            auth: true,
            method: 'DELETE',
            expectedStatuses: [200],
          });
          cleanup.ok = true;
        } catch (error) {
          cleanup.ok = false;
          cleanup.error = error.message;
        }
      }
    }
  });
}

function writeReport(report, reportDir) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-approved-release-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-approved-release-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Approved Release Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.base_url}`,
    `Result: ${report.result}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.status} ${step.name} (${step.duration_ms}ms)`),
    '',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  const config = loadConfig(parseArgs(process.argv.slice(2)));
  const report = {
    started_at: new Date().toISOString(),
    base_url: config.baseUrl,
    result: 'passed',
    secret_values_printed: false,
    steps: [],
  };

  await checkPwaSeparation(config, report);
  await checkProviderReadiness(config, report);
  await checkAgentControl(config, report);

  const paths = writeReport(report, config.reportDir);
  console.log(`Report: ${paths.mdPath}`);
  if (report.result !== 'passed') process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Approved release live smoke failed: ${error.message}`);
  process.exitCode = 1;
});
