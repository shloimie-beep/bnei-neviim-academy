#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, '.runtime');
const resultPath = path.join(runtimeDir, 'smoke-local-latest.json');
const envLocalPath = path.join(repoRoot, '.env.local');
const requiredFiles = [
  'AGENTS.md',
  'package.json',
  'server.js',
  'public/operations.html',
  'public/operations-login.html',
  'public/student.html',
  'public/signup.html',
  'public/signup-he.html',
  'scripts/telegram-kimi-bridge.mjs',
  'scripts/agent-fleet-supervisor.mjs',
  'ops/agent-task-ledger.jsonl',
  'ops/agent-changelog.md',
];
const syntaxFiles = [
  'server.js',
  'scripts/telegram-kimi-bridge.mjs',
  'scripts/agent-fleet-supervisor.mjs',
];
const requiredPackageScripts = ['start', 'dev', 'test', 'setup:local', 'doctor', 'smoke:local'];

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.SMOKE_BASE_URL || '',
    skipTests: false,
    write: false,
    noEnvFile: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url') args.baseUrl = argv[++index] || '';
    else if (arg.startsWith('--base-url=')) args.baseUrl = arg.split('=').slice(1).join('=');
    else if (arg === '--skip-tests') args.skipTests = true;
    else if (arg === '--write') args.write = true;
    else if (arg === '--no-env-file') args.noEnvFile = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/smoke-local.mjs [--base-url <url>] [--skip-tests] [--write] [--no-env-file]');
      process.exit(0);
    }
  }
  args.baseUrl = String(args.baseUrl || '').trim().replace(/\/+$/, '');
  return args;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice('export '.length).trim();
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

function loadEnv(args) {
  const fileEnv = args.noEnvFile ? {} : parseEnvFile(envLocalPath);
  return { ...fileEnv, ...process.env };
}

function usefulValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  if (/^(?:changeme|todo|example|placeholder)$/i.test(normalized)) return false;
  if (/\bYOUR_|YOUR-|REPLACE_ME|\[/.test(normalized)) return false;
  return true;
}

function buildRedactor(env) {
  const secretValues = Object.entries(env)
    .filter(([key, value]) => /(PASSWORD|TOKEN|SECRET|API_KEY|DATABASE_URL|COOKIE|SESSION)/i.test(key) && String(value || '').length >= 6)
    .map(([, value]) => String(value))
    .sort((a, b) => b.length - a.length);
  return function redact(input) {
    let output = String(input || '');
    for (const value of secretValues) output = output.split(value).join('[REDACTED]');
    output = output.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, 'postgres://[REDACTED]');
    output = output.replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, 'sk-[REDACTED]');
    output = output.replace(/\b\d{7,12}:[A-Za-z0-9_-]{25,}\b/g, '[TELEGRAM_BOT_TOKEN_REDACTED]');
    output = output.replace(/bna_ops_session=[^;,\s]+/gi, 'bna_ops_session=[REDACTED]');
    return output;
  };
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    timeout: options.timeoutMs || 120000,
    env: options.env || process.env,
  });
  return {
    command: [command, ...args].join(' '),
    ok: result.status === 0,
    status: result.status,
    signal: result.signal || null,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error ? result.error.message : null,
  };
}

function tailText(value, maxLength = 2400) {
  const text = String(value || '');
  return text.length > maxLength ? text.slice(text.length - maxLength) : text;
}

function verifyFiles() {
  return requiredFiles.map((file) => ({
    file,
    ok: fs.existsSync(path.join(repoRoot, file)),
  }));
}

function verifyPackageScripts() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    return requiredPackageScripts.map((script) => ({
      script,
      ok: Boolean(pkg.scripts && pkg.scripts[script]),
    }));
  } catch (error) {
    return requiredPackageScripts.map((script) => ({ script, ok: false, error: error.message }));
  }
}

function runSyntaxChecks(env, redact) {
  return syntaxFiles.map((file) => {
    const result = runCommand(process.execPath, ['--check', file], { env, timeoutMs: 120000 });
    return {
      file,
      ok: result.ok,
      status: result.status,
      stdout: redact(tailText(result.stdout)),
      stderr: redact(tailText(result.stderr)),
      error: result.error,
    };
  });
}

function runTests(env, redact, skipTests) {
  if (skipTests) return { skipped: true, ok: true };
  const result = runCommand(npmCommand(), ['test'], { env, timeoutMs: 20 * 60 * 1000 });
  return {
    skipped: false,
    ok: result.ok,
    status: result.status,
    stdout_tail: redact(tailText(result.stdout)),
    stderr_tail: redact(tailText(result.stderr)),
    error: result.error,
  };
}

function randomSmokePort() {
  return 18080 + Math.floor(Math.random() * 1200);
}

function startServer(env, port, redact) {
  const childEnv = {
    ...process.env,
    ...env,
    PORT: String(port),
    HOST: '127.0.0.1',
    BNA_BIND_HOST: '127.0.0.1',
    APP_URL: `http://127.0.0.1:${port}`,
    BNA_APP_URL: `http://127.0.0.1:${port}`,
    NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${port}`,
  };
  const child = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs = [];
  const capture = (chunk) => {
    logs.push(redact(chunk.toString()));
    while (logs.join('').length > 6000) logs.shift();
  };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  return { child, logs };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(baseUrl, child, logs) {
  const deadline = Date.now() + 45000;
  let lastError = '';
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Local server exited with code ${child.exitCode}. ${logs.join('').trim()}`);
    }
    try {
      await fetch(`${baseUrl}/api/health`, { redirect: 'manual' });
      return;
    } catch (error) {
      lastError = error.message;
    }
    await wait(500);
  }
  throw new Error(`Timed out waiting for ${baseUrl}. Last error: ${lastError}`);
}

function cookieFromSetCookie(value) {
  const text = Array.isArray(value) ? value.join(',') : String(value || '');
  const match = text.match(/bna_ops_session=[^;,\s]+/i);
  return match ? match[0] : '';
}

function summarizeJson(json) {
  if (!json || typeof json !== 'object') return null;
  const summary = {};
  for (const key of ['success', 'status', 'database', 'authenticated', 'role', 'scope', 'error']) {
    if (Object.prototype.hasOwnProperty.call(json, key)) summary[key] = json[key];
  }
  if (Array.isArray(json.projects)) summary.project_count = json.projects.length;
  if (Array.isArray(json.tasks)) summary.task_count = json.tasks.length;
  if (json.task && json.task.id) summary.task_id = json.task.id;
  return summary;
}

async function httpRequest(baseUrl, route, options, redact) {
  const started = Date.now();
  const headers = { ...(options.headers || {}) };
  if (options.cookie) headers.Cookie = options.cookie;
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${baseUrl}${route}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    redirect: 'manual',
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  const setCookie = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : response.headers.get('set-cookie');
  return {
    route,
    method: options.method || 'GET',
    status: response.status,
    ok: response.ok,
    duration_ms: Date.now() - started,
    content_type: response.headers.get('content-type') || '',
    set_cookie_present: Boolean(cookieFromSetCookie(setCookie)),
    cookie: cookieFromSetCookie(setCookie),
    json_summary: summarizeJson(json),
    body_tail: redact(tailText(text, 600)),
    json,
  };
}

function checkEndpoint(name, result, predicate) {
  return {
    name,
    route: result.route,
    method: result.method,
    status: result.status,
    ok: Boolean(predicate(result)),
    duration_ms: result.duration_ms,
    content_type: result.content_type,
    set_cookie_present: result.set_cookie_present,
    json_summary: result.json_summary,
    body_tail: result.ok ? undefined : result.body_tail,
  };
}

async function runHttpSmoke(baseUrl, env, redact, writeMode) {
  const endpointResults = [];
  const health = await httpRequest(baseUrl, '/api/health', {}, redact);
  endpointResults.push(checkEndpoint('health', health, (result) => result.status === 200 && result.json?.status === 'ok'));

  const login = await httpRequest(baseUrl, '/api/operations/login', {
    method: 'POST',
    body: {
      username: env.OPS_USERNAME || '',
      password: env.OPS_PASSWORD || '',
    },
  }, redact);
  endpointResults.push(checkEndpoint('operations login', login, (result) => result.status === 200 && result.json?.success === true && result.cookie));
  const cookie = login.cookie;

  const operations = await httpRequest(baseUrl, '/operations', { cookie }, redact);
  endpointResults.push(checkEndpoint('operations html', operations, (result) => result.status === 200 && /html/i.test(result.content_type)));

  const me = await httpRequest(baseUrl, '/api/bna/auth/me', { cookie }, redact);
  endpointResults.push(checkEndpoint('auth me', me, (result) => result.status === 200 && result.json?.authenticated === true));

  const projects = await httpRequest(baseUrl, '/api/bna/projects', { cookie }, redact);
  endpointResults.push(checkEndpoint('projects', projects, (result) => result.status === 200 && Array.isArray(result.json?.projects)));

  const tasks = await httpRequest(baseUrl, '/api/bna/tasks', { cookie }, redact);
  endpointResults.push(checkEndpoint('tasks', tasks, (result) => result.status === 200 && Array.isArray(result.json?.tasks)));

  for (const route of ['/student.html', '/signup.html', '/signup-he.html']) {
    const page = await httpRequest(baseUrl, route, {}, redact);
    endpointResults.push(checkEndpoint(route, page, (result) => result.status === 200 && /html/i.test(result.content_type)));
  }

  const writeProbe = writeMode ? await runWriteProbe(baseUrl, cookie, redact) : { skipped: true };
  return { endpointResults, writeProbe };
}

async function runWriteProbe(baseUrl, cookie, redact) {
  const title = 'SMOKE TEST - safe temporary task';
  let createdTaskId = null;
  const steps = [];
  try {
    const created = await httpRequest(baseUrl, '/api/bna/tasks', {
      method: 'POST',
      cookie,
      body: {
        title,
        source: 'smoke-local',
        created_by: 'smoke-local',
        category: 'operations',
        urgency: 'low',
        project: 'bna',
        notes: 'Temporary local smoke task. Safe to delete.',
      },
    }, redact);
    createdTaskId = created.json?.task?.id || null;
    steps.push(checkEndpoint('create temporary task', created, (result) => result.status === 200 && result.json?.success === true && createdTaskId));

    const verify = await httpRequest(baseUrl, `/api/bna/tasks?search=${encodeURIComponent(title)}`, { cookie }, redact);
    steps.push(checkEndpoint('verify temporary task', verify, (result) => result.status === 200 && Array.isArray(result.json?.tasks) && result.json.tasks.some((task) => Number(task.id) === Number(createdTaskId))));

    if (createdTaskId) {
      const deleted = await httpRequest(baseUrl, `/api/bna/tasks/${createdTaskId}`, {
        method: 'DELETE',
        cookie,
      }, redact);
      steps.push(checkEndpoint('delete temporary task', deleted, (result) => result.status === 200 && result.json?.success === true));
    }
  } catch (error) {
    steps.push({ name: 'write probe error', ok: false, error: redact(error.message) });
  }
  return {
    skipped: false,
    created_task_id: createdTaskId,
    cleaned_up: steps.some((step) => step.name === 'delete temporary task' && step.ok),
    steps,
  };
}

function writeResult(result) {
  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
}

function printSummary(result) {
  console.log('BNA local smoke');
  const mode = result.started_server
    ? 'started local server'
    : result.base_url
      ? 'external base URL'
      : 'setup validation';
  console.log(`Mode: ${mode}`);
  console.log(`Base URL: ${result.base_url || '(not started)'}`);
  console.log(`Tests: ${result.tests.skipped ? 'skipped' : result.tests.ok ? 'passed' : 'failed'}`);
  for (const endpoint of result.http.endpointResults || []) {
    console.log(`${endpoint.ok ? 'PASS' : 'FAIL'} ${endpoint.method} ${endpoint.route} (${endpoint.status})`);
  }
  if (result.http.writeProbe && !result.http.writeProbe.skipped) {
    for (const step of result.http.writeProbe.steps || []) {
      console.log(`${step.ok ? 'PASS' : 'FAIL'} ${step.name}`);
    }
  }
  console.log(`Report: ${path.relative(repoRoot, resultPath).replace(/\\/g, '/')}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv(args);
  const redact = buildRedactor(env);
  fs.mkdirSync(runtimeDir, { recursive: true });

  const result = {
    generated_at: new Date().toISOString(),
    base_url: args.baseUrl || '',
    started_server: false,
    read_only_default: !args.write,
    write_mode: args.write,
    env_file_loaded: !args.noEnvFile && fs.existsSync(envLocalPath),
    required_env: {
      DATABASE_URL: usefulValue(env.DATABASE_URL) ? 'present' : 'missing',
      OPS_USERNAME: usefulValue(env.OPS_USERNAME) ? 'present' : 'missing',
      OPS_PASSWORD: usefulValue(env.OPS_PASSWORD) ? 'present' : 'missing',
    },
    files: verifyFiles(),
    package_scripts: verifyPackageScripts(),
    syntax_checks: [],
    tests: {},
    http: { endpointResults: [], writeProbe: { skipped: !args.write } },
    success: false,
  };

  result.syntax_checks = runSyntaxChecks(env, redact);
  result.tests = runTests(env, redact, args.skipTests);

  const staticFailures = [
    ...result.files.filter((entry) => !entry.ok).map((entry) => `missing file ${entry.file}`),
    ...result.package_scripts.filter((entry) => !entry.ok).map((entry) => `missing package script ${entry.script}`),
    ...result.syntax_checks.filter((entry) => !entry.ok).map((entry) => `syntax check failed ${entry.file}`),
  ];
  if (!result.tests.ok) staticFailures.push('npm test failed');

  let serverHandle = null;
  try {
    if (staticFailures.length) {
      throw new Error(staticFailures.join('; '));
    }

    const requiredForMode = args.baseUrl ? ['OPS_USERNAME', 'OPS_PASSWORD'] : ['DATABASE_URL', 'OPS_USERNAME', 'OPS_PASSWORD'];
    const missing = requiredForMode.filter((key) => !usefulValue(env[key]));
    if (missing.length) {
      throw new Error(`Missing required local smoke configuration: ${missing.join(', ')}. Run npm run setup:local and fill .env.local.`);
    }

    let baseUrl = args.baseUrl;
    if (!baseUrl) {
      const port = randomSmokePort();
      baseUrl = `http://127.0.0.1:${port}`;
      result.base_url = baseUrl;
      result.started_server = true;
      serverHandle = startServer(env, port, redact);
      await waitForServer(baseUrl, serverHandle.child, serverHandle.logs);
    } else {
      result.base_url = baseUrl;
    }

    const http = await runHttpSmoke(baseUrl, env, redact, args.write);
    result.http = http;
    result.success = result.http.endpointResults.every((entry) => entry.ok)
      && (result.http.writeProbe.skipped || result.http.writeProbe.steps.every((step) => step.ok))
      && result.tests.ok
      && result.syntax_checks.every((entry) => entry.ok)
      && result.files.every((entry) => entry.ok)
      && result.package_scripts.every((entry) => entry.ok);
  } catch (error) {
    result.error = redact(error.message);
    result.success = false;
  } finally {
    if (serverHandle?.child && serverHandle.child.exitCode === null) {
      serverHandle.child.kill();
    }
    if (serverHandle?.logs) {
      result.server_log_tail = redact(tailText(serverHandle.logs.join('')));
    }
    writeResult(result);
    printSummary(result);
    if (!result.success) {
      console.error(`Smoke failed: ${result.error || 'one or more checks failed'}`);
      process.exit(1);
    }
  }
}

main();
