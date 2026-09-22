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

async function requestText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

async function requestJson(url, options = {}) {
  const { response, text } = await requestText(url, options);
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
  return { response, data };
}

function resolveAssetUrl(appUrl, assetPath) {
  try {
    return new URL(assetPath, `${appUrl}/`).toString();
  } catch {
    return `${appUrl}/${String(assetPath || '').replace(/^\/+/, '')}`;
  }
}

function scriptSources(html = '') {
  const sources = [];
  const pattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    sources.push(match[1]);
  }
  return sources;
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-operations-workspace-taxonomy-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-operations-workspace-taxonomy-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Operations Workspace Taxonomy Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const detail = step.error ? ` - ${step.error}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${detail}`;
    }),
    '',
    '## Taxonomy Summary',
    `- categories: ${(report.taxonomy_summary.categories || []).join(', ') || 'none'}`,
    `- workspace_count: ${report.taxonomy_summary.workspace_count}`,
    `- duplicate_keys: ${(report.taxonomy_summary.duplicate_keys || []).join(', ') || 'none'}`,
    `- stale_visible_terms_found: ${(report.taxonomy_summary.stale_visible_terms_found || []).join(', ') || 'none'}`,
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

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    taxonomy_summary: {
      categories: [],
      workspace_count: 0,
      duplicate_keys: [],
      stale_visible_terms_found: [],
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

  try {
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      assert(data.database === 'connected', 'Database is not connected');
      return { status: data.status, database: data.database };
    });

    await step('workspace directory API canonical taxonomy', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/workspace-directory?workspace=platform`, {
        headers: { Authorization: auth },
      });
      assert(data.success === true, 'workspace directory did not return success');
      assert(Array.isArray(data.categories), 'workspace directory categories missing');

      const expected = [
        ['super_admin', 'Super Admin'],
        ['school', 'School'],
        ['service_provider', 'Service Provider'],
        ['family', 'Family'],
      ];
      const labelsById = new Map(data.categories.map((category) => [category.id, category.label]));
      for (const [id, label] of expected) {
        assert(labelsById.get(id) === label, `Expected category ${id} to be labelled ${label}`);
      }

      const forbiddenLabels = ['Family App / Home Accountability', 'Family Accountability'];
      const serialized = JSON.stringify(data);
      const stale = forbiddenLabels.filter((term) => serialized.includes(term));
      assert(!stale.length, `Workspace API still exposes stale visible labels: ${stale.join(', ')}`);

      const workspaces = data.categories.flatMap((category) => category.workspaces || []);
      assert(workspaces.length >= 3, 'Expected at least platform, school, and provider/family workspaces');
      const keys = workspaces.map((workspace) => workspace.workspace_key || workspace.key).filter(Boolean);
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      assert(!duplicates.length, `Workspace directory has duplicate keys: ${[...new Set(duplicates)].join(', ')}`);

      const bna = workspaces.find((workspace) => (workspace.workspace_key || workspace.key) === 'bna');
      const oneTime = workspaces.find((workspace) => (workspace.workspace_key || workspace.key) === 'rabbi_sheller_provider');
      const family = workspaces.find((workspace) => ['dratler_family', 'parent_households'].includes(workspace.workspace_key || workspace.key));
      assert(!bna || bna.display_category === 'school', 'BNA workspace is not in School');
      assert(!oneTime || oneTime.display_category === 'service_provider', 'One Time provider workspace is not in Service Provider');
      assert(!family || family.display_category === 'family', 'Family workspace is not in Family');
      for (const workspace of workspaces) {
        assert(workspace.display_category_label, `${workspace.workspace_key || workspace.key} lacks display_category_label`);
        assert(workspace.role, `${workspace.workspace_key || workspace.key} lacks role`);
        assert(workspace.access_level, `${workspace.workspace_key || workspace.key} lacks access_level`);
        assert(workspace.role_label, `${workspace.workspace_key || workspace.key} lacks role_label`);
        assert(workspace.scope_label, `${workspace.workspace_key || workspace.key} lacks scope_label`);
      }

      report.taxonomy_summary.categories = expected.map(([, label]) => label);
      report.taxonomy_summary.workspace_count = workspaces.length;
      report.taxonomy_summary.duplicate_keys = [...new Set(duplicates)];
      report.taxonomy_summary.stale_visible_terms_found = stale;
      return {
        categories: data.categories.map((category) => category.label),
        workspace_count: workspaces.length,
      };
    });

    await step('operations HTML exposes explicit selector steps', async () => {
      const { text } = await requestText(`${appUrl}/operations?workspace=platform&view=admin&section=workspaces`, {
        headers: { Authorization: auth },
      });
      const assetSources = scriptSources(text)
        .filter((source) => /\/js\/operations-(shell|deferred-renderers)\.js(?:\?|$)/.test(source));
      const assetTexts = [];
      for (const source of assetSources) {
        const { text: assetText } = await requestText(resolveAssetUrl(appUrl, source), {
          headers: { Authorization: auth },
        });
        assetTexts.push({ source, text: assetText });
      }
      const servedSurface = [text, ...assetTexts.map((asset) => asset.text)].join('\n');
      const expectedTerms = ['Workspace type selector', 'Specific workspace', 'Dratler Family'];
      for (const expected of expectedTerms) {
        assert(servedSurface.includes(expected), `Operations shell surface missing ${expected}`);
      }
      for (const stale of ['Family App / Home Accountability', 'Family Accountability', 'Family Directory']) {
        assert(!servedSurface.includes(stale), `Operations shell surface still exposes ${stale}`);
      }
      return {
        checked_terms: expectedTerms,
        checked_sources: ['operations bootstrap', ...assetTexts.map((asset) => asset.source)],
        split_shell: assetSources.some((source) => source.includes('/js/operations-shell.js')),
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
