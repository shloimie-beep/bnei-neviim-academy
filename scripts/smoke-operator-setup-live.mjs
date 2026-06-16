#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
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

function loadConfig() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  return {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
  };
}

function absoluteUrl(config, endpointOrUrl) {
  const text = String(endpointOrUrl || '');
  if (/^https?:\/\//i.test(text)) return text;
  return `${config.appUrl.replace(/\/+$/, '')}${text.startsWith('/') ? text : `/${text}`}`;
}

function parseSetCookie(response) {
  const raw = response.headers.get('set-cookie') || '';
  return raw.split(';')[0] || '';
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(config, method, endpointOrUrl, {
  body = null,
  cookie = '',
  acceptStatuses = [200],
} = {}) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(absoluteUrl(config, endpointOrUrl), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const text = await response.text();
  if (!acceptStatuses.includes(response.status)) {
    throw new Error(`${method} ${endpointOrUrl} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { text };
    }
  }
  return { response, text, data };
}

function downloadTokenFingerprint(downloadUrl) {
  const parsed = new URL(downloadUrl);
  const token = parsed.pathname.split('/').filter(Boolean).pop() || '';
  assert(token.length >= 20, 'Download URL did not include a one-time token');
  return {
    path: parsed.pathname,
    token_hash_prefix: sha256Hex(token).slice(0, 16),
  };
}

function assertNoSensitiveValuesInSafePackage(packageObject) {
  assert(packageObject.package_type === 'bna_operator_bootstrap', 'Unexpected package type');
  assert(packageObject.encrypted === false, 'Safe package must not be encrypted');
  assert(packageObject.download_kind === 'safe_non_secret', 'Safe package has unexpected download kind');
  assert(packageObject.body?.includes_secret_values === false, 'Safe package says it includes secret values');
  const manifest = Array.isArray(packageObject.body?.env_manifest) ? packageObject.body.env_manifest : [];
  const envTemplate = packageObject.body?.env_template && typeof packageObject.body.env_template === 'object'
    ? packageObject.body.env_template
    : {};
  for (const item of manifest) {
    if (item?.sensitive === true) {
      assert(envTemplate[item.key] === '', `Safe package included a value for sensitive key ${item.key}`);
    }
  }
  return {
    package_type: packageObject.package_type,
    encrypted: packageObject.encrypted,
    download_kind: packageObject.download_kind,
    env_keys: manifest.length,
    sensitive_env_values_blank: true,
    secret_file_manifest_count: Array.isArray(packageObject.body?.secret_file_manifest)
      ? packageObject.body.secret_file_manifest.length
      : 0,
    setup_commands: Array.isArray(packageObject.body?.setup_commands)
      ? packageObject.body.setup_commands.length
      : 0,
  };
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-operator-setup-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-operator-setup-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Operator Setup Live Smoke - ${report.started_at}`,
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
  assert(config.opsUsername && config.opsPassword, 'OPS_USERNAME and OPS_PASSWORD are required');
  const report = {
    started_at: new Date().toISOString(),
    app_url: config.appUrl,
    checks: [],
  };
  let sessionCookie = '';
  let downloadPath = '';

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
    await check('operations login sets hardened session cookie', async () => {
      const { response, data } = await request(config, 'POST', '/api/operations/login', {
        body: { username: config.opsUsername, password: config.opsPassword },
      });
      sessionCookie = parseSetCookie(response);
      const setCookie = response.headers.get('set-cookie') || '';
      assert(data.success === true, 'Operations login did not return success');
      assert(sessionCookie.startsWith('bna_ops_session='), 'Operations login did not set bna_ops_session');
      assert(/HttpOnly/i.test(setCookie), 'Operations session cookie is missing HttpOnly');
      assert(/SameSite=Lax/i.test(setCookie), 'Operations session cookie is missing SameSite=Lax');
      if (/^https:/i.test(config.appUrl)) assert(/Secure/i.test(setCookie), 'HTTPS Operations session cookie is missing Secure');
      return {
        cookie_set: true,
        http_only: true,
        same_site_lax: true,
        secure_for_https: /^https:/i.test(config.appUrl),
      };
    });

    await check('session can inspect authenticated identity', async () => {
      const { data } = await request(config, 'GET', '/api/bna/auth/me', { cookie: sessionCookie });
      assert(data.success === true, '/api/bna/auth/me did not return success');
      assert(data.authenticated !== false, 'Authenticated identity was rejected');
      return {
        role: data.role || null,
        scope_type: data.scope?.type || data.opsIdentity?.scope?.type || null,
        allowed_views: Array.isArray(data.allowedViews) ? data.allowedViews.length : null,
      };
    });

    await check('operator setup status is super-admin accessible and hardened', async () => {
      const { data } = await request(config, 'GET', '/api/bna/operator-setup/status', { cookie: sessionCookie });
      assert(data.success === true, 'Operator setup status did not return success');
      assert(data.security?.super_admin_only === true, 'Status does not report super admin guard');
      assert(data.security?.one_time_download === true, 'Status does not report one-time downloads');
      assert(data.security?.expires === true, 'Status does not report expiring downloads');
      assert(data.security?.secret_export_encrypted === true, 'Status does not report encrypted secret export');
      return {
        ttl_minutes: data.package_ttl_minutes,
        passphrase_min_length: data.passphrase_min_length,
        missing_required_count: Array.isArray(data.env_summary?.missing_required)
          ? data.env_summary.missing_required.length
          : null,
        super_admin_only: true,
        one_time_download: true,
      };
    });

    const packageMeta = await check('safe operator setup package can be created without secrets', async () => {
      const { data } = await request(config, 'POST', '/api/bna/operator-setup/bootstrap-package', {
        cookie: sessionCookie,
        body: {
          include_secrets: false,
          ttl_ms: 60 * 1000,
          purpose: 'codex_operator_setup_safe_live_smoke',
        },
      });
      assert(data.success === true, 'Safe package creation did not return success');
      assert(data.encrypted === false, 'Safe package response unexpectedly encrypted');
      assert(data.includes_secret_values === false, 'Safe package response says secrets are included');
      const tokenMeta = downloadTokenFingerprint(data.url);
      downloadPath = tokenMeta.path;
      return {
        filename: data.filename,
        expires_at: data.expires_at,
        one_time: data.one_time === true,
        encrypted: data.encrypted,
        includes_secret_values: data.includes_secret_values,
        token_hash_prefix: tokenMeta.token_hash_prefix,
      };
    });

    await check('safe operator setup package downloads once and contains no secret values', async () => {
      assert(downloadPath, 'No download path was captured');
      const { data } = await request(config, 'GET', downloadPath, { cookie: sessionCookie });
      const safePackage = assertNoSensitiveValuesInSafePackage(data);
      return {
        filename: packageMeta.filename,
        ...safePackage,
      };
    });

    await check('safe operator setup package cannot be redeemed twice', async () => {
      assert(downloadPath, 'No download path was captured');
      const { response } = await request(config, 'GET', downloadPath, {
        cookie: sessionCookie,
        acceptStatuses: [404],
      });
      return { second_redeem_status: response.status };
    });
  } finally {
    report.finished_at = new Date().toISOString();
    report.success = report.checks.every((item) => item.ok);
    report.report_files = writeReports(report);
    console.log(`Report: ${report.report_files.markdown}`);
  }

  if (!report.success) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
