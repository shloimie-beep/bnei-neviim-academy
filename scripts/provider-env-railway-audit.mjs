#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const {
  loadSecret,
  safeSecretSourceLabel,
} = require('../src/lib/integrations/secret-loader');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

const PROVIDER_ENV_FIELDS = [
  {
    key: 'ZOOM_ACCOUNT_ID',
    label: 'Zoom account ID',
    provider: 'zoom',
    fileNames: ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt', 'zoom.txt'],
    names: ['zoom-account-id', 'zoom'],
    requiredForProduction: true,
  },
  {
    key: 'ZOOM_CLIENT_ID',
    label: 'Zoom client ID',
    provider: 'zoom',
    fileNames: ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt', 'zoom.txt'],
    names: ['zoom-client-id', 'zoom'],
    requiredForProduction: true,
  },
  {
    key: 'ZOOM_CLIENT_SECRET',
    label: 'Zoom client secret',
    provider: 'zoom',
    fileNames: ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt', 'zoom.txt'],
    names: ['zoom-client-secret', 'zoom'],
    requiredForProduction: true,
  },
  {
    key: 'VIMEO_CLIENT_ID',
    label: 'Vimeo client ID',
    provider: 'vimeo',
    fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt'],
    names: ['vimeo-client-id', 'vimeo'],
    requiredForProduction: true,
  },
  {
    key: 'VIMEO_CLIENT_SECRET',
    label: 'Vimeo client secret',
    provider: 'vimeo',
    fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt'],
    names: ['vimeo-client-secret', 'vimeo'],
    requiredForProduction: true,
  },
  {
    key: 'VIMEO_ACCESS_TOKEN',
    label: 'Vimeo user access token',
    provider: 'vimeo',
    fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt'],
    names: ['vimeo-access-token', 'vimeo'],
    requiredForProduction: false,
  },
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API key',
    provider: 'resend',
    fileNames: ['resend-api-key.txt', 'RESEND_API_KEY.txt', 'resend.txt'],
    names: ['resend-api-key', 'resend'],
    requiredForProduction: true,
  },
  {
    key: 'RESEND_FROM_EMAIL',
    label: 'Resend from email address',
    provider: 'resend',
    fileNames: ['resend-from-email.txt', 'RESEND_FROM_EMAIL.txt', 'resend.txt'],
    names: ['resend-from-email', 'resend'],
    requiredForProduction: true,
  },
  {
    key: 'RESEND_DOMAIN',
    label: 'Resend sending domain',
    provider: 'resend',
    fileNames: ['resend-domain.txt', 'RESEND_DOMAIN.txt', 'resend.txt'],
    names: ['resend-domain', 'resend'],
    requiredForProduction: true,
  },
];

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function fingerprint(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}

function normalizeValue(value) {
  let normalized = String(value || '').replace(/^\uFEFF/, '').trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function redactText(value) {
  return String(value || '')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/(token|secret|password|authorization|api[_-]?key)\s*[:=]\s*[^\s"',}]+/gi, '$1=[redacted]')
    .replace(/\b[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/g, '[redacted]');
}

function localFieldStatus(field, repoRoot, keyholderRoots) {
  const loaded = loadSecret({
    envName: field.key,
    names: field.names,
    fileNames: field.fileNames,
    repoRoot,
    ...(keyholderRoots ? { keyholderRoots } : {}),
  });
  const value = normalizeValue(loaded.value);
  return {
    present: Boolean(value),
    source: loaded.configured ? safeSecretSourceLabel(loaded) : 'not configured',
    length: value.length,
    fingerprint: fingerprint(value),
  };
}

function extractRailwayVariable(parsed, key) {
  if (!parsed) return '';
  if (!Array.isArray(parsed) && typeof parsed === 'object' && typeof parsed[key] === 'string') return parsed[key];
  const arrays = Array.isArray(parsed) ? [parsed] : Object.values(parsed).filter(Array.isArray);
  for (const array of arrays) {
    for (const item of array) {
      if (!item || typeof item !== 'object') continue;
      const name = item.name || item.key || item.variableName;
      if (name === key) return item.value || item.rawValue || item.val || '';
    }
  }
  if (parsed.variables) return extractRailwayVariable(parsed.variables, key);
  return '';
}

function railwayFieldStatus(parsed, field) {
  const value = normalizeValue(extractRailwayVariable(parsed, field.key));
  return {
    present: Boolean(value),
    length: value.length,
    fingerprint: fingerprint(value),
  };
}

function compareStatus({ local, railway, requiredForProduction }) {
  if (local.present && railway.present && local.fingerprint === railway.fingerprint) return 'matched';
  if (local.present && railway.present && local.fingerprint !== railway.fingerprint) return 'mismatch';
  if (local.present && !railway.present) return 'railway_missing';
  if (!local.present && railway.present) return 'local_missing';
  return requiredForProduction ? 'missing_required' : 'not_configured';
}

function loadRailwayToken(repoRoot) {
  const env = { ...process.env };
  const tokenPath = path.join(repoRoot, '.secrets', 'railway-token.txt');
  if (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN && fs.existsSync(tokenPath)) {
    env.RAILWAY_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
  }
  return env;
}

function listRailwayVariables({ repoRoot, service, environment, runner = spawnSync, railwayJson = null } = {}) {
  if (railwayJson) {
    return {
      ok: true,
      attempted: false,
      service,
      environment,
      parsed: railwayJson,
      source: 'provided',
    };
  }

  const env = loadRailwayToken(repoRoot);
  if (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN) {
    return { ok: false, attempted: false, service, environment, reason: 'No Railway token available.' };
  }
  if (env.RAILWAY_TOKEN && env.RAILWAY_API_TOKEN) {
    return { ok: false, attempted: false, service, environment, reason: 'Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set.' };
  }

  const railwayArgs = ['variable', 'list', '--service', service, '--environment', environment, '--json'];
  const command = process.platform === 'win32' ? 'cmd.exe' : 'railway';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'railway.cmd', ...railwayArgs] : railwayArgs;

  function runWithEnv(commandEnv) {
    return runner(command, args, {
      cwd: repoRoot,
      env: commandEnv,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 4,
    });
  }

  let result = runWithEnv(env);
  let source = 'railway_cli';
  if (
    result.status !== 0 &&
    /service.+not found|project.+not found|environment.+not found/i.test(String(result.stderr || result.stdout || '')) &&
    (env.RAILWAY_TOKEN || env.RAILWAY_API_TOKEN)
  ) {
    const fallbackEnv = { ...process.env };
    delete fallbackEnv.RAILWAY_TOKEN;
    delete fallbackEnv.RAILWAY_API_TOKEN;
    const fallback = runWithEnv(fallbackEnv);
    if (fallback.status === 0 && !fallback.error) {
      result = fallback;
      source = 'railway_cli_session_fallback';
    }
  }

  if (result.error) {
    return {
      ok: false,
      attempted: true,
      service,
      environment,
      reason: `Railway variable list failed before exit. ${redactText(result.error.message || result.error.code || 'Unknown spawn error')}`.trim(),
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      attempted: true,
      service,
      environment,
      reason: `Railway variable list exited ${result.status}. ${redactText((result.stderr || result.stdout || '').split(/\r?\n/)[0])}`.trim(),
    };
  }

  try {
    return {
      ok: true,
      attempted: true,
      service,
      environment,
      parsed: JSON.parse(result.stdout || '{}'),
      source,
    };
  } catch {
    return {
      ok: false,
      attempted: true,
      service,
      environment,
      reason: 'Railway returned non-JSON variable output.',
    };
  }
}

export function buildProviderEnvRailwayAudit(options = {}) {
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const keyholderRoots = options.keyholderRoots;
  const service = options.service || process.env.RAILWAY_SERVICE_NAME || 'skillful-motivation';
  const environment = options.environment || process.env.RAILWAY_ENVIRONMENT || 'production';
  const railway = listRailwayVariables({
    repoRoot,
    service,
    environment,
    runner: options.runner,
    railwayJson: options.railwayJson,
  });
  const fields = PROVIDER_ENV_FIELDS.map((field) => {
    const local = localFieldStatus(field, repoRoot, keyholderRoots);
    const remote = railway.ok ? railwayFieldStatus(railway.parsed, field) : { present: false, length: 0, fingerprint: '' };
    return {
      key: field.key,
      label: field.label,
      provider: field.provider,
      required_for_production: field.requiredForProduction,
      local,
      railway: remote,
      status: compareStatus({ local, railway: remote, requiredForProduction: field.requiredForProduction }),
    };
  });

  const required = fields.filter((field) => field.required_for_production);
  return {
    generated_at: new Date().toISOString(),
    external_write_performed: false,
    secret_values_printed: false,
    service,
    environment,
    railway: {
      attempted: railway.attempted,
      ok: railway.ok,
      source: railway.source || null,
      reason: railway.reason || null,
    },
    summary: {
      required_count: required.length,
      required_matched: required.filter((field) => field.status === 'matched').length,
      required_missing_in_railway: required.filter((field) => field.status === 'railway_missing').length,
      required_missing_locally: required.filter((field) => ['local_missing', 'missing_required'].includes(field.status)).length,
      required_mismatched: required.filter((field) => field.status === 'mismatch').length,
    },
    fields,
  };
}

function renderMarkdown(report) {
  const lines = [
    `# Provider Env Railway Audit - ${report.generated_at}`,
    '',
    'This report never includes secret values.',
    '',
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    `Railway service: ${report.service}`,
    `Railway environment: ${report.environment}`,
    `Railway attempted: ${report.railway.attempted}`,
    `Railway ok: ${report.railway.ok}`,
  ];
  if (report.railway.reason) lines.push(`Railway reason: ${report.railway.reason}`);
  lines.push(
    '',
    '## Summary',
    '',
    `- required_count: ${report.summary.required_count}`,
    `- required_matched: ${report.summary.required_matched}`,
    `- required_missing_in_railway: ${report.summary.required_missing_in_railway}`,
    `- required_missing_locally: ${report.summary.required_missing_locally}`,
    `- required_mismatched: ${report.summary.required_mismatched}`,
    '',
    '## Fields',
    ''
  );
  for (const field of report.fields) {
    lines.push(`### ${field.key}`);
    lines.push(`- provider: ${field.provider}`);
    lines.push(`- required_for_production: ${field.required_for_production}`);
    lines.push(`- status: ${field.status}`);
    lines.push(`- local: present=${field.local.present}; source=${field.local.source}; length=${field.local.length}; fingerprint=${field.local.fingerprint || 'none'}`);
    lines.push(`- railway: present=${field.railway.present}; length=${field.railway.length}; fingerprint=${field.railway.fingerprint || 'none'}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function writeReport(report, repoRoot) {
  const reportDir = path.join(repoRoot, 'ops', 'qa-runs');
  fs.mkdirSync(reportDir, { recursive: true });
  const mdPath = path.join(reportDir, `${timestampSlug()}-provider-env-railway-audit.md`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return { mdPath };
}

function parseArgs(argv) {
  const args = {
    json: false,
    noWrite: false,
    service: '',
    environment: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
    else if (arg === '--service') {
      args.service = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--environment') {
      args.environment = argv[index + 1] || '';
      index += 1;
    }
  }
  return args;
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const report = buildProviderEnvRailwayAudit({
    repoRoot,
    runner: options.runner,
    railwayJson: options.railwayJson,
    service: args.service || options.service,
    environment: args.environment || options.environment,
  });
  const paths = args.noWrite ? null : writeReport(report, repoRoot);

  if (args.json) {
    console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  } else {
    console.log(renderMarkdown(report));
    if (paths) console.log(`Report written: ${path.relative(repoRoot, paths.mdPath)}`);
  }
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`Provider env Railway audit failed: ${redactText(error?.message || String(error))}`);
    process.exitCode = 1;
  });
}
