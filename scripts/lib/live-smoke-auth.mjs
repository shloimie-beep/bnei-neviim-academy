import { execFileSync as defaultExecFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_RAILWAY_PROJECT_ID = 'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889';
const DEFAULT_RAILWAY_SERVICE = 'skillful-motivation';
const DEFAULT_RAILWAY_ENVIRONMENT = 'production';

function parseEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
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

export function loadSmokeEnv({
  root = process.cwd(),
  envFile = process.env.BNA_ENV_FILE || path.join(root, '.env.local'),
  env = process.env,
} = {}) {
  return { ...parseEnvFile(envFile), ...env };
}

function disabled(value) {
  return ['0', 'false', 'no', 'off'].includes(String(value || '').trim().toLowerCase());
}

function railwayTarget(env = {}) {
  return {
    projectId: env.BNA_SMOKE_RAILWAY_PROJECT_ID || env.RAILWAY_PROJECT_ID || DEFAULT_RAILWAY_PROJECT_ID,
    service: env.BNA_SMOKE_RAILWAY_SERVICE || env.RAILWAY_SERVICE_NAME || DEFAULT_RAILWAY_SERVICE,
    environment: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || env.RAILWAY_ENVIRONMENT || DEFAULT_RAILWAY_ENVIRONMENT,
  };
}

export function parseRailwayVariables(payload) {
  const parsed = typeof payload === 'string' ? JSON.parse(payload || '{}') : payload;
  if (Array.isArray(parsed)) {
    return Object.fromEntries(parsed
      .map((item) => [item?.name || item?.Name || item?.key || item?.Key, item?.value ?? item?.Value])
      .filter(([key]) => key));
  }
  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.variables)) return parseRailwayVariables(parsed.variables);
    return Object.fromEntries(Object.entries(parsed).map(([key, value]) => {
      if (value && typeof value === 'object' && 'value' in value) return [key, value.value];
      return [key, value];
    }));
  }
  return {};
}

function execRailwayJson(args, {
  cwd,
  execFileSync = defaultExecFileSync,
} = {}) {
  let command = 'railway';
  let commandArgs = args;
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const railwayShim = path.join(appData, 'npm', 'railway.ps1');
    if (fs.existsSync(railwayShim)) {
      command = 'powershell.exe';
      commandArgs = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', railwayShim, ...args];
    }
  }
  return execFileSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function readRailwayVariables({
  env,
  cwd,
  execFileSync,
} = {}) {
  const target = railwayTarget(env);
  const output = execRailwayJson([
    'variable',
    'list',
    '--service',
    target.service,
    '--environment',
    target.environment,
    '--json',
  ], { cwd, execFileSync });
  return parseRailwayVariables(output);
}

function readRailwayVariablesFromTempLink({
  env,
  execFileSync,
  mkdtempSync = fs.mkdtempSync,
  rmSync = fs.rmSync,
  tmpdir = os.tmpdir,
} = {}) {
  const target = railwayTarget(env);
  if (!target.projectId || !target.service || !target.environment) return {};
  const tempDir = mkdtempSync(path.join(tmpdir(), 'bna-live-smoke-auth-'));
  try {
    execRailwayJson([
      'link',
      '--project',
      target.projectId,
      '--environment',
      target.environment,
      '--service',
      target.service,
      '--json',
    ], { cwd: tempDir, execFileSync });
    return readRailwayVariables({ env, cwd: tempDir, execFileSync });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

export function resolveOpsCredentials({
  env = process.env,
  cwd = process.cwd(),
  execFileSync = defaultExecFileSync,
  mkdtempSync = fs.mkdtempSync,
  rmSync = fs.rmSync,
  tmpdir = os.tmpdir,
} = {}) {
  if (env.OPS_USERNAME && env.OPS_PASSWORD) {
    return { username: env.OPS_USERNAME, password: env.OPS_PASSWORD, source: 'env' };
  }

  if (disabled(env.BNA_SMOKE_AUTO_RAILWAY_AUTH)) {
    return { username: '', password: '', source: 'missing' };
  }

  for (const reader of [
    () => readRailwayVariables({ env, cwd, execFileSync }),
    () => readRailwayVariablesFromTempLink({ env, execFileSync, mkdtempSync, rmSync, tmpdir }),
  ]) {
    try {
      const variables = reader();
      if (variables.OPS_USERNAME && variables.OPS_PASSWORD) {
        return {
          username: String(variables.OPS_USERNAME),
          password: String(variables.OPS_PASSWORD),
          source: 'railway',
        };
      }
    } catch {
      // Keep auth fallback quiet; callers report only that auth was unavailable.
    }
  }

  return { username: '', password: '', source: 'missing' };
}

export function parseSetCookie(setCookieHeader = '') {
  const pair = String(setCookieHeader || '').split(';')[0] || '';
  const index = pair.indexOf('=');
  if (index <= 0) return null;
  return { name: pair.slice(0, index), value: pair.slice(index + 1) };
}

export async function loginOperations({
  baseUrl,
  env = process.env,
  cwd = process.cwd(),
  fetchImpl = fetch,
} = {}) {
  const credentials = resolveOpsCredentials({ env, cwd });
  if (!credentials.username || !credentials.password) {
    return {
      cookie: null,
      source: credentials.source,
      reason: 'OPS credentials unavailable from env or Railway auth fallback.',
    };
  }

  const response = await fetchImpl(`${String(baseUrl || '').replace(/\/+$/, '')}/api/operations/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (response.status !== 200 || data.success !== true) {
    throw new Error('Operations login did not succeed');
  }
  const cookie = parseSetCookie(response.headers.get('set-cookie') || '');
  if (cookie?.name !== 'bna_ops_session' || !cookie.value) {
    throw new Error('Operations login did not set session cookie');
  }
  return { cookie, source: credentials.source, user: data.user, role: data.role };
}
