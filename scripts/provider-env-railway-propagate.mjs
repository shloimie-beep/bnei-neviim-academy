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
  redactSecretText,
  safeSecretSourceLabel,
} = require('../src/lib/integrations/secret-loader');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

const PROVIDER_FIELDS = [
  {
    key: 'ZOOM_ACCOUNT_ID',
    label: 'Zoom account ID',
    provider: 'zoom',
    required: true,
    fileNames: ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt', 'zoom.txt'],
    names: ['zoom-account-id', 'zoom'],
  },
  {
    key: 'ZOOM_CLIENT_ID',
    label: 'Zoom client ID',
    provider: 'zoom',
    required: true,
    fileNames: ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt', 'zoom.txt'],
    names: ['zoom-client-id', 'zoom'],
  },
  {
    key: 'ZOOM_CLIENT_SECRET',
    label: 'Zoom client secret',
    provider: 'zoom',
    required: true,
    fileNames: ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt', 'zoom.txt'],
    names: ['zoom-client-secret', 'zoom'],
  },
  {
    key: 'VIMEO_CLIENT_ID',
    label: 'Vimeo client ID',
    provider: 'vimeo',
    required: true,
    fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt'],
    names: ['vimeo-client-id', 'vimeo'],
  },
  {
    key: 'VIMEO_CLIENT_SECRET',
    label: 'Vimeo client secret',
    provider: 'vimeo',
    required: true,
    fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt'],
    names: ['vimeo-client-secret', 'vimeo'],
  },
  {
    key: 'VIMEO_ACCESS_TOKEN',
    label: 'Vimeo user access token',
    provider: 'vimeo',
    required: false,
    fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt'],
    names: ['vimeo-access-token', 'vimeo'],
  },
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API key',
    provider: 'resend',
    required: false,
    resendGroup: true,
    fileNames: ['resend-api-key.txt', 'RESEND_API_KEY.txt', 'resend.txt'],
    names: ['resend-api-key', 'resend'],
  },
  {
    key: 'RESEND_FROM',
    label: 'Resend from address',
    provider: 'resend',
    required: false,
    resendGroup: true,
    fileNames: ['resend-from.txt', 'RESEND_FROM.txt', 'resend.txt'],
    names: ['resend-from', 'resend'],
  },
  {
    key: 'RESEND_DOMAIN',
    label: 'Resend sending domain',
    provider: 'resend',
    required: false,
    resendGroup: true,
    fileNames: ['resend-domain.txt', 'RESEND_DOMAIN.txt', 'resend.txt'],
    names: ['resend-domain', 'resend'],
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

function loadRailwayEnv(repoRoot) {
  const env = { ...process.env };
  const tokenPath = path.join(repoRoot, '.secrets', 'railway-token.txt');
  if (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN && fs.existsSync(tokenPath)) {
    env.RAILWAY_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
  }
  return env;
}

function loadProviderValues(repoRoot, keyholderRoots) {
  const loaded = PROVIDER_FIELDS.map((field) => {
    const secret = loadSecret({
      envName: field.key,
      names: field.names,
      fileNames: field.fileNames,
      repoRoot,
      ...(keyholderRoots ? { keyholderRoots } : {}),
    });
    const value = String(secret.value || '').trim();
    return {
      ...field,
      configured: Boolean(value),
      source: secret.configured ? safeSecretSourceLabel(secret) : 'not configured',
      length: value.length,
      fingerprint: fingerprint(value),
      value,
    };
  });

  const resendSenderGroupConfigured = loaded
    .filter((field) => field.resendGroup)
    .filter((field) => field.key !== 'RESEND_API_KEY')
    .every((field) => field.configured);

  return loaded.map((field) => {
    if (field.key === 'RESEND_API_KEY' && field.configured) {
      return { ...field, shouldSet: true, status: 'ready' };
    }
    if (field.resendGroup && !resendSenderGroupConfigured) {
      return { ...field, shouldSet: false, status: field.configured ? 'resend_sender_group_incomplete' : 'missing_local' };
    }
    if (!field.configured) {
      return { ...field, shouldSet: false, status: field.required ? 'missing_local_required' : 'not_configured' };
    }
    return { ...field, shouldSet: true, status: 'ready' };
  });
}

function railwayCommandArgs(railwayArgs) {
  if (process.platform === 'win32') {
    return { command: 'cmd.exe', args: ['/d', '/s', '/c', 'railway.cmd', ...railwayArgs] };
  }
  return { command: 'railway', args: railwayArgs };
}

function setRailwayVariable({ key, value, service, environment, env, repoRoot = defaultRepoRoot, runner = spawnSync }) {
  const { command, args } = railwayCommandArgs([
    'variable',
    'set',
    key,
    '--stdin',
    '--service',
    service,
    '--environment',
    environment,
    '--skip-deploys',
    '--json',
  ]);
  const result = runner(command, args, {
    cwd: repoRoot,
    env,
    input: value,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 4,
  });
  if (result.error) {
    return {
      ok: false,
      reason: redactSecretText(result.error.message || result.error.code || 'Unknown spawn error', [value]),
    };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      reason: redactSecretText((result.stderr || result.stdout || '').split(/\r?\n/)[0] || `Railway exited ${result.status}`, [value]),
    };
  }
  return { ok: true, reason: null };
}

export function buildProviderEnvRailwayPropagation(options = {}) {
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const service = options.service || process.env.RAILWAY_SERVICE_NAME || 'skillful-motivation';
  const environment = options.environment || process.env.RAILWAY_ENVIRONMENT || 'production';
  const apply = Boolean(options.apply);
  const env = loadRailwayEnv(repoRoot);
  const onlyKeys = new Set((options.onlyKeys || []).map((key) => String(key || '').trim().toUpperCase()).filter(Boolean));
  const allFields = loadProviderValues(repoRoot, options.keyholderRoots);
  const fields = allFields.filter((field) => !onlyKeys.size || onlyKeys.has(field.key));
  const reportFields = [];
  let attempted = 0;
  let pushed = 0;
  let failed = 0;

  const authProblem = env.RAILWAY_TOKEN && env.RAILWAY_API_TOKEN
    ? 'Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set.'
    : (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN ? 'No Railway token available.' : '');

  for (const field of fields) {
    const result = {
      key: field.key,
      label: field.label,
      provider: field.provider,
      status: field.status,
      configured: field.configured,
      source: field.source,
      length: field.length,
      fingerprint: field.fingerprint || '',
      railway_set_attempted: false,
      railway_set_ok: false,
      reason: null,
    };

    if (apply && field.shouldSet && !authProblem) {
      attempted += 1;
      result.railway_set_attempted = true;
      const setResult = setRailwayVariable({
        key: field.key,
        value: field.value,
        service,
        environment,
        env,
        repoRoot,
        runner: options.runner,
      });
      result.railway_set_ok = setResult.ok;
      result.status = setResult.ok ? 'set' : 'set_failed';
      result.reason = setResult.reason;
      if (setResult.ok) pushed += 1;
      else failed += 1;
    } else if (apply && field.shouldSet && authProblem) {
      result.status = 'railway_auth_blocked';
      result.reason = authProblem;
      failed += field.required ? 1 : 0;
    } else if (!apply && field.shouldSet) {
      result.status = 'dry_run_ready';
    }

    reportFields.push(result);
  }

  return {
    generated_at: new Date().toISOString(),
    apply,
    external_write_performed: apply && attempted > 0,
    secret_values_printed: false,
    railway_auto_deploy_skipped: true,
    service,
    environment,
    railway_auth_ready: !authProblem,
    railway_auth_problem: authProblem || null,
    only_keys: [...onlyKeys],
    summary: {
      ready_count: fields.filter((field) => field.shouldSet).length,
      attempted,
      pushed,
      failed,
      skipped: fields.length - attempted,
      missing_required_local: fields.filter((field) => field.status === 'missing_local_required').length,
      resend_api_key_independent: true,
      resend_sender_group_complete: allFields.filter((field) => field.resendGroup && field.key !== 'RESEND_API_KEY').every((field) => field.configured),
    },
    fields: reportFields,
  };
}

function renderMarkdown(report) {
  const lines = [
    `# Provider Env Railway Propagation - ${report.generated_at}`,
    '',
    'This report never includes secret values.',
    '',
    `Apply mode: ${report.apply}`,
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    `Railway auto deploy skipped: ${report.railway_auto_deploy_skipped}`,
    `Railway service: ${report.service}`,
    `Railway environment: ${report.environment}`,
    `Railway auth ready: ${report.railway_auth_ready}`,
  ];
  if (report.railway_auth_problem) lines.push(`Railway auth problem: ${report.railway_auth_problem}`);
  if (report.only_keys?.length) lines.push(`Only keys: ${report.only_keys.join(', ')}`);
  lines.push(
    '',
    '## Summary',
    '',
    `- ready_count: ${report.summary.ready_count}`,
    `- attempted: ${report.summary.attempted}`,
    `- pushed: ${report.summary.pushed}`,
    `- failed: ${report.summary.failed}`,
    `- skipped: ${report.summary.skipped}`,
    `- missing_required_local: ${report.summary.missing_required_local}`,
    `- resend_api_key_independent: ${report.summary.resend_api_key_independent}`,
    `- resend_sender_group_complete: ${report.summary.resend_sender_group_complete}`,
    '',
    '## Fields',
    ''
  );
  for (const field of report.fields) {
    lines.push(`### ${field.key}`);
    lines.push(`- provider: ${field.provider}`);
    lines.push(`- status: ${field.status}`);
    lines.push(`- configured: ${field.configured}`);
    lines.push(`- source: ${field.source}`);
    lines.push(`- length: ${field.length}`);
    lines.push(`- fingerprint: ${field.fingerprint || 'none'}`);
    lines.push(`- railway_set_attempted: ${field.railway_set_attempted}`);
    lines.push(`- railway_set_ok: ${field.railway_set_ok}`);
    if (field.reason) lines.push(`- reason: ${field.reason}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function writeReport(report, repoRoot) {
  const reportDir = path.join(repoRoot, 'ops', 'qa-runs');
  fs.mkdirSync(reportDir, { recursive: true });
  const mdPath = path.join(reportDir, `${timestampSlug()}-provider-env-railway-propagation.md`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return { mdPath };
}

function parseArgs(argv) {
  const args = {
    apply: false,
    json: false,
    noWrite: false,
    service: '',
    environment: '',
    onlyKeys: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
    else if (arg === '--service') {
      args.service = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--environment') {
      args.environment = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--only') {
      args.onlyKeys = String(argv[index + 1] || '')
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean);
      index += 1;
    }
  }
  return args;
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const report = buildProviderEnvRailwayPropagation({
    repoRoot,
    keyholderRoots: options.keyholderRoots,
    runner: options.runner,
    service: args.service || options.service,
    environment: args.environment || options.environment,
    apply: args.apply || options.apply,
    onlyKeys: args.onlyKeys.length ? args.onlyKeys : options.onlyKeys,
  });
  const paths = args.noWrite ? null : writeReport(report, repoRoot);

  if (args.json) {
    console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  } else {
    console.log(renderMarkdown(report));
    if (paths) console.log(`Report written: ${path.relative(repoRoot, paths.mdPath)}`);
  }

  if (report.summary.failed > 0) process.exitCode = 1;
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`Provider env Railway propagation failed: ${redactSecretText(error?.message || String(error))}`);
    process.exitCode = 1;
  });
}
