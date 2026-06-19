#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const {
  loadSecret,
  redactSecrets,
  safeSecretSourceLabel,
} = require('../src/lib/integrations/secret-loader');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function fingerprint(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}

function fieldStatus(loaded) {
  return {
    configured: Boolean(loaded?.configured),
    source: loaded?.configured ? safeSecretSourceLabel(loaded) : 'not configured',
    length: String(loaded?.value || '').length,
    fingerprint: fingerprint(loaded?.value),
  };
}

function safeError(error, secrets = []) {
  return redactSecrets({
    message: error?.message || String(error || 'Provider credential check failed'),
    status: error?.status || error?.statusCode || null,
    code: error?.code || null,
  }, secrets);
}

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text.slice(0, 300) };
  }
}

function loadProviderSecrets(repoRoot = defaultRepoRoot) {
  const zoom = {
    accountId: loadSecret({
      envName: 'ZOOM_ACCOUNT_ID',
      names: ['zoom-account-id', 'zoom'],
      fileNames: ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt', 'zoom.txt'],
      repoRoot,
    }),
    clientId: loadSecret({
      envName: 'ZOOM_CLIENT_ID',
      names: ['zoom-client-id', 'zoom'],
      fileNames: ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt', 'zoom.txt'],
      repoRoot,
    }),
    clientSecret: loadSecret({
      envName: 'ZOOM_CLIENT_SECRET',
      names: ['zoom-client-secret', 'zoom'],
      fileNames: ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt', 'zoom.txt'],
      repoRoot,
    }),
  };

  const vimeo = {
    clientId: loadSecret({
      envName: 'VIMEO_CLIENT_ID',
      names: ['vimeo-client-id', 'vimeo'],
      fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt'],
      repoRoot,
    }),
    clientSecret: loadSecret({
      envName: 'VIMEO_CLIENT_SECRET',
      names: ['vimeo-client-secret', 'vimeo'],
      fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt'],
      repoRoot,
    }),
    accessToken: loadSecret({
      envName: 'VIMEO_ACCESS_TOKEN',
      names: ['vimeo-access-token', 'vimeo'],
      fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt'],
      repoRoot,
    }),
  };

  return { zoom, vimeo };
}

async function testZoomToken(secrets, { fetchImpl = globalThis.fetch, network = true } = {}) {
  const missing = [
    secrets.accountId.value ? null : 'ZOOM_ACCOUNT_ID',
    secrets.clientId.value ? null : 'ZOOM_CLIENT_ID',
    secrets.clientSecret.value ? null : 'ZOOM_CLIENT_SECRET',
  ].filter(Boolean);
  if (missing.length) return { ok: false, status: 'missing_credentials', missing };
  if (!network) return { ok: null, status: 'network_skipped', external_write_performed: false };
  if (typeof fetchImpl !== 'function') return { ok: false, status: 'fetch_unavailable', external_write_performed: false };

  const url = new URL('https://zoom.us/oauth/token');
  url.searchParams.set('grant_type', 'account_credentials');
  url.searchParams.set('account_id', secrets.accountId.value);
  const secretValues = [secrets.accountId.value, secrets.clientId.value, secrets.clientSecret.value];

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secrets.clientId.value}:${secrets.clientSecret.value}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        status: 'auth_failed',
        http_status: response.status,
        external_write_performed: false,
        error: redactSecrets(data, secretValues),
      };
    }
    const scopes = String(data.scope || '').split(/\s+/).filter(Boolean);
    return {
      ok: Boolean(data.access_token),
      status: data.access_token ? 'token_ready' : 'token_missing_in_response',
      http_status: response.status,
      external_write_performed: false,
      token_type: data.token_type || null,
      expires_in: Number(data.expires_in || 0) || null,
      scope_count: scopes.length,
      token_fingerprint: fingerprint(data.access_token),
      token_stored: false,
    };
  } catch (error) {
    return {
      ok: false,
      status: 'request_failed',
      external_write_performed: false,
      error: safeError(error, secretValues),
    };
  }
}

async function testVimeoClientCredentials(secrets, { fetchImpl = globalThis.fetch, network = true } = {}) {
  const missing = [
    secrets.clientId.value ? null : 'VIMEO_CLIENT_ID',
    secrets.clientSecret.value ? null : 'VIMEO_CLIENT_SECRET',
  ].filter(Boolean);
  if (missing.length) return { ok: false, status: 'missing_credentials', missing };
  if (!network) return { ok: null, status: 'network_skipped', external_write_performed: false };
  if (typeof fetchImpl !== 'function') return { ok: false, status: 'fetch_unavailable', external_write_performed: false };

  const secretValues = [secrets.clientId.value, secrets.clientSecret.value, secrets.accessToken.value];
  try {
    const response = await fetchImpl('https://api.vimeo.com/oauth/authorize/client', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secrets.clientId.value}:${secrets.clientSecret.value}`).toString('base64')}`,
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grant_type: 'client_credentials', scope: 'public' }),
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        status: 'auth_failed',
        http_status: response.status,
        external_write_performed: false,
        error: redactSecrets(data, secretValues),
      };
    }
    const scopes = String(data.scope || '').split(/\s+/).filter(Boolean);
    return {
      ok: Boolean(data.access_token),
      status: data.access_token ? 'client_credentials_ready' : 'token_missing_in_response',
      http_status: response.status,
      external_write_performed: false,
      token_type: data.token_type || null,
      scope_count: scopes.length,
      token_fingerprint: fingerprint(data.access_token),
      token_stored: false,
      user_access_token_configured: Boolean(secrets.accessToken.value),
    };
  } catch (error) {
    return {
      ok: false,
      status: 'request_failed',
      external_write_performed: false,
      error: safeError(error, secretValues),
    };
  }
}

export async function buildProviderCredentialDiagnostics(options = {}) {
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const secrets = loadProviderSecrets(repoRoot);
  const network = options.network !== false;
  const report = {
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    external_write_performed: false,
    secret_values_printed: false,
    checks: {
      zoom: {
        provider: 'zoom',
        fields: {
          account_id: fieldStatus(secrets.zoom.accountId),
          client_id: fieldStatus(secrets.zoom.clientId),
          client_secret: fieldStatus(secrets.zoom.clientSecret),
        },
        token_check: await testZoomToken(secrets.zoom, { fetchImpl: options.fetchImpl, network }),
      },
      vimeo: {
        provider: 'vimeo',
        fields: {
          client_id: fieldStatus(secrets.vimeo.clientId),
          client_secret: fieldStatus(secrets.vimeo.clientSecret),
          access_token: fieldStatus(secrets.vimeo.accessToken),
        },
        client_credentials_check: await testVimeoClientCredentials(secrets.vimeo, { fetchImpl: options.fetchImpl, network }),
      },
    },
  };
  return report;
}

function renderMarkdown(report) {
  const lines = [
    `# Provider Credential Diagnostics - ${report.generated_at}`,
    '',
    'This report never includes secret values or access tokens.',
    '',
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
  ];

  for (const [key, check] of Object.entries(report.checks)) {
    lines.push(`## ${key}`);
    for (const [fieldName, field] of Object.entries(check.fields)) {
      lines.push(`- ${fieldName}: configured=${field.configured}; source=${field.source}; length=${field.length}; fingerprint=${field.fingerprint || 'none'}`);
    }
    const networkCheck = check.token_check || check.client_credentials_check;
    lines.push(`- auth_check_status: ${networkCheck.status}`);
    lines.push(`- auth_check_ok: ${networkCheck.ok}`);
    lines.push(`- http_status: ${networkCheck.http_status || 'n/a'}`);
    lines.push(`- scope_count: ${networkCheck.scope_count ?? 'n/a'}`);
    lines.push(`- returned_token_fingerprint: ${networkCheck.token_fingerprint || 'none'}`);
    lines.push(`- returned_token_stored: ${Boolean(networkCheck.token_stored)}`);
    if (networkCheck.missing?.length) lines.push(`- missing: ${networkCheck.missing.join(', ')}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function writeReports(report, repoRoot) {
  const reportDir = path.join(repoRoot, 'ops', 'qa-runs');
  fs.mkdirSync(reportDir, { recursive: true });
  const baseName = `${timestampSlug()}-provider-credential-diagnostics`;
  const jsonPath = path.join(reportDir, `${baseName}.json`);
  const mdPath = path.join(reportDir, `${baseName}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return { jsonPath, mdPath };
}

function parseArgs(argv) {
  const args = { json: false, noWrite: false, network: true };
  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
    else if (arg === '--no-network') args.network = false;
  }
  return args;
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const report = await buildProviderCredentialDiagnostics({
    repoRoot,
    fetchImpl: options.fetchImpl,
    network: args.network,
  });
  const paths = args.noWrite ? null : writeReports(report, repoRoot);

  if (args.json) {
    console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  } else {
    console.log(renderMarkdown(report));
    if (paths) {
      console.log(`Reports written: ${path.relative(repoRoot, paths.mdPath)} and ${path.relative(repoRoot, paths.jsonPath)}`);
    }
  }
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`Provider credential diagnostics failed: ${error.message}`);
    process.exitCode = 1;
  });
}
