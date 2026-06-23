#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const secretsDir = path.join(repoRoot, '.secrets');
const envLocalPath = path.join(repoRoot, '.env.local');
const reportDir = path.join(repoRoot, 'ops', 'qa-runs');

function defaultKeyholderDir() {
  return process.env.BNA_KEYHOLDER_DIR || path.join(process.env.USERPROFILE || os.homedir(), 'BNA-Keyholder');
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return result;
}

function readRawFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function redactDiagnosticText(value) {
  return String(value || '')
    .replace(/sk-[A-Za-z0-9_*.-]{6,}/g, '[redacted-openai-key]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s"',}]+/gi, '$1=[redacted]');
}

function normalizeCandidate(rawValue) {
  const raw = rawValue === undefined || rawValue === null ? '' : String(rawValue);
  const hadBom = raw.charCodeAt(0) === 0xfeff;
  const hadNewline = /\n/.test(raw);
  const hadCarriageReturn = /\r/.test(raw);
  let normalized = raw.replace(/^\uFEFF/, '').trim();
  const surroundingQuotes =
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"));
  if (surroundingQuotes) normalized = normalized.slice(1, -1).trim();
  return {
    raw,
    normalized,
    hadBom,
    hadNewline,
    hadCarriageReturn,
    surroundingQuotes,
    changed: normalized !== raw,
  };
}

function fingerprint(value) {
  if (!value) return '';
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

function sourceReport(name, rawValue) {
  const normalized = normalizeCandidate(rawValue);
  return {
    source: name,
    present: Boolean(normalized.normalized),
    length: normalized.raw.length,
    normalized_length: normalized.normalized.length,
    fingerprint: fingerprint(normalized.normalized),
    surrounding_quotes: normalized.surroundingQuotes,
    newline: normalized.hadNewline,
    carriage_return: normalized.hadCarriageReturn,
    bom: normalized.hadBom,
    normalization_changed_value: normalized.changed,
  };
}

function selectedCandidate(sources) {
  return sources.find((source) => source.normalized.normalized) || null;
}

function readRailwayVariables() {
  const tokenPath = path.join(secretsDir, 'railway-token.txt');
  const env = { ...process.env };
  if (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN && fs.existsSync(tokenPath)) {
    env.RAILWAY_TOKEN = readRawFile(tokenPath).trim();
  }
  if (!env.RAILWAY_TOKEN && !env.RAILWAY_API_TOKEN) {
    return { ok: false, attempted: false, reason: 'No Railway token available.' };
  }
  if (env.RAILWAY_TOKEN && env.RAILWAY_API_TOKEN) {
    return { ok: false, attempted: false, reason: 'Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set.' };
  }

  const service = env.RAILWAY_SERVICE_NAME || 'skillful-motivation';
  const environment = env.RAILWAY_ENVIRONMENT || 'production';
  const command = [
    'railway',
    'variable',
    'list',
    '--service',
    service,
    '--environment',
    environment,
    '--json',
  ].map((part) => (part.includes(' ') ? `"${part}"` : part)).join(' ');
  const result = spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
    { cwd: repoRoot, env, encoding: 'utf8', maxBuffer: 1024 * 1024 * 4 }
  );
  if (result.status !== 0) {
    return {
      ok: false,
      attempted: true,
      service,
      environment,
      reason: `Railway variable list exited ${result.status}.`,
    };
  }
  try {
    const parsed = JSON.parse(result.stdout || '{}');
    const value = extractVariable(parsed, 'OPENAI_API_KEY');
    return {
      ok: true,
      attempted: true,
      service,
      environment,
      openai_api_key: sourceReport('railway:OPENAI_API_KEY', value || ''),
      openai_base_url_present: Boolean(extractVariable(parsed, 'OPENAI_BASE_URL')),
      openai_org_present: Boolean(extractVariable(parsed, 'OPENAI_ORG') || extractVariable(parsed, 'OPENAI_ORGANIZATION')),
      openai_project_present: Boolean(extractVariable(parsed, 'OPENAI_PROJECT')),
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

function extractVariable(parsed, key) {
  if (!parsed) return '';
  if (typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed[key] === 'string') return parsed[key];
  const arrays = Array.isArray(parsed) ? [parsed] : Object.values(parsed).filter(Array.isArray);
  for (const array of arrays) {
    for (const item of array) {
      if (!item || typeof item !== 'object') continue;
      const name = item.name || item.key || item.variableName;
      if (name === key) return item.value || item.rawValue || item.val || '';
    }
  }
  if (parsed.variables) return extractVariable(parsed.variables, key);
  return '';
}

async function requestJson({ url, key, method = 'GET', body = null }) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    status: response.status,
    ok: response.ok,
    x_request_id: response.headers.get('x-request-id') || response.headers.get('openai-request-id') || '',
    error_type: json?.error?.type || '',
    error_code: json?.error?.code || '',
    error_message: redactDiagnosticText(json?.error?.message || (response.ok ? '' : text.slice(0, 240))),
  };
}

function renderMarkdown(report) {
  const lines = [
    `# OpenAI Key Diagnostics - ${report.generated_at}`,
    '',
    `Overall: ${report.ok ? 'PASS' : 'FAIL'}`,
    '',
    '## Source Metadata',
    '',
  ];
  for (const source of report.sources) {
    lines.push(`- ${source.source}: present=${source.present}; length=${source.length}; normalized_length=${source.normalized_length}; fingerprint=${source.fingerprint || 'none'}; quotes=${source.surrounding_quotes}; newline=${source.newline}; carriage_return=${source.carriage_return}; bom=${source.bom}; normalization_changed=${source.normalization_changed_value}`);
  }
  lines.push('', '## Environment', '');
  lines.push(`- selected_source: ${report.selected_source || 'none'}`);
  lines.push(`- env_file_equality: ${report.env_file_equality}`);
  lines.push(`- OPENAI_BASE_URL present: ${report.openai_base_url_present}`);
  lines.push(`- OPENAI_ORG present: ${report.openai_org_present}`);
  lines.push(`- OPENAI_PROJECT present: ${report.openai_project_present}`);
  lines.push('', '## Railway', '');
  lines.push(`- attempted: ${report.railway.attempted}`);
  lines.push(`- ok: ${report.railway.ok}`);
  if (report.railway.reason) lines.push(`- reason: ${report.railway.reason}`);
  if (report.railway.openai_api_key) {
    lines.push(`- OPENAI_API_KEY present=${report.railway.openai_api_key.present}; length=${report.railway.openai_api_key.length}; fingerprint=${report.railway.openai_api_key.fingerprint || 'none'}; normalization_changed=${report.railway.openai_api_key.normalization_changed_value}`);
  }
  lines.push('', '## Live Checks', '');
  lines.push(`- /v1/models: status=${report.models.status || 'not_run'}; request_id=${report.models.x_request_id || 'none'}; error_type=${report.models.error_type || 'none'}; error_code=${report.models.error_code || 'none'}; message=${report.models.error_message || 'none'}`);
  lines.push(`- /v1/responses: status=${report.responses.status || 'not_run'}; request_id=${report.responses.x_request_id || 'none'}; error_type=${report.responses.error_type || 'none'}; error_code=${report.responses.error_code || 'none'}; message=${report.responses.error_message || 'none'}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const envLocal = parseEnvFile(envLocalPath);
  const keyholderDir = defaultKeyholderDir();
  const keyholderOpenaiV2Raw = readRawFile(path.join(keyholderDir, 'openaiv2.txt'));
  const keyholderOpenaiRaw = readRawFile(path.join(keyholderDir, 'openai-api-key.txt'));
  const fileRaw = readRawFile(path.join(secretsDir, 'openai-api-key.txt'));
  const envRaw = process.env.OPENAI_API_KEY || '';
  const envLocalRaw = envLocal.OPENAI_API_KEY || '';
  const baseUrl = normalizeCandidate(process.env.OPENAI_BASE_URL || envLocal.OPENAI_BASE_URL || 'https://api.openai.com/v1').normalized.replace(/\/+$/, '');
  const model = normalizeCandidate(process.env.OPENAI_MODEL || envLocal.OPENAI_MODEL || 'gpt-4.1-mini').normalized || 'gpt-4.1-mini';

  const normalizedSources = [
    { name: 'process.env:OPENAI_API_KEY', normalized: normalizeCandidate(envRaw) },
    { name: 'keyholder:openaiv2.txt', normalized: normalizeCandidate(keyholderOpenaiV2Raw) },
    { name: 'keyholder:openai-api-key.txt', normalized: normalizeCandidate(keyholderOpenaiRaw) },
    { name: '.secrets/openai-api-key.txt', normalized: normalizeCandidate(fileRaw) },
    { name: '.env.local:OPENAI_API_KEY', normalized: normalizeCandidate(envLocalRaw) },
  ];
  const sourceReports = normalizedSources.map((source) => sourceReport(source.name, source.normalized.raw));
  const selected = selectedCandidate([
    normalizedSources[0],
    normalizedSources[1],
    normalizedSources[2],
    normalizedSources[3],
    normalizedSources[4],
  ]);
  const selectedKey = selected?.normalized.normalized || '';

  const report = {
    generated_at: new Date().toISOString(),
    ok: false,
    selected_source: selected?.name || '',
    sources: sourceReports,
    keyholder_dir: keyholderDir,
    env_file_equality: Boolean(
      normalizedSources[0].normalized.normalized &&
      normalizedSources[1].normalized.normalized &&
      normalizedSources[0].normalized.normalized === normalizedSources[1].normalized.normalized
    ),
    openai_base_url_present: Boolean(process.env.OPENAI_BASE_URL || envLocal.OPENAI_BASE_URL),
    openai_org_present: Boolean(process.env.OPENAI_ORG || process.env.OPENAI_ORGANIZATION || envLocal.OPENAI_ORG || envLocal.OPENAI_ORGANIZATION),
    openai_project_present: Boolean(process.env.OPENAI_PROJECT || envLocal.OPENAI_PROJECT),
    railway: readRailwayVariables(),
    models: {},
    responses: {},
  };

  if (selectedKey) {
    report.models = await requestJson({ url: `${baseUrl}/models`, key: selectedKey });
    if (report.models.ok) {
      report.responses = await requestJson({
        url: `${baseUrl}/responses`,
        key: selectedKey,
        method: 'POST',
        body: { model, input: 'Return the exact word ok.' },
      });
    } else {
      report.responses = { status: 'skipped', error_message: 'Skipped because /v1/models did not authenticate.' };
    }
  } else {
    report.models = { status: 'not_run', error_message: 'No OPENAI_API_KEY candidate was present.' };
    report.responses = { status: 'not_run', error_message: 'No OPENAI_API_KEY candidate was present.' };
  }

  report.ok = Boolean(report.models.ok && report.responses.ok);
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = timestamp();
  const jsonPath = path.join(reportDir, `${stamp}-openai-diagnostics.json`);
  const mdPath = path.join(reportDir, `${stamp}-openai-diagnostics.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));

  console.log(`OpenAI diagnostics: ${report.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Report: ${path.relative(repoRoot, mdPath).replace(/\\/g, '/')}`);
  console.log(`Selected source: ${report.selected_source || 'none'}`);
  console.log(`/v1/models status: ${report.models.status || 'not_run'} request_id=${report.models.x_request_id || 'none'} error=${report.models.error_code || report.models.error_type || 'none'}`);
  console.log(`/v1/responses status: ${report.responses.status || 'not_run'} request_id=${report.responses.x_request_id || 'none'} error=${report.responses.error_code || report.responses.error_type || 'none'}`);
  process.exitCode = report.ok ? 0 : 1;
}

main().catch((error) => {
  console.error(`OpenAI diagnostics failed before report completion: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
