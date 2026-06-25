#!/usr/bin/env node
import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import { execFileSync } from 'child_process';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const metadataFile = 'bna-agent-browser-profile.json';
const runtimeDir = path.join(repoRoot, '.runtime', 'agent-browser');

export const PROFILE_DEFS = {
  operations_owner: {
    label: 'Operations owner',
    role: 'super_admin',
    route: '/operations-login.html?returnTo=%2Foperations',
    description: 'Manual-login BNA Operations owner profile for local browser QA.',
    bootstrap: 'Headed manual login only. Do not store credentials in repo or prompt logs.',
  },
  parent_portal: {
    label: 'Parent portal',
    role: 'parent',
    route: '/parent/login',
    description: 'Manual-login parent portal profile for scoped parent QA.',
    bootstrap: 'Use only approved parent test credentials or manual operator login.',
  },
  student_portal: {
    label: 'Student portal',
    role: 'student',
    route: '/student/login',
    description: 'Manual-login student portal profile for student-safe QA.',
    bootstrap: 'Use only approved student test credentials or manual operator login.',
  },
  provider_portal: {
    label: 'Provider portal',
    role: 'provider',
    route: '/provider',
    description: 'Manual-login provider workspace profile for provider-scoped QA.',
    bootstrap: 'Use only approved provider test credentials or manual operator login.',
  },
  one_time_review: {
    label: 'One Time review',
    role: 'review',
    route: '/provider.html?review=one-time',
    description: 'Credential-free One Time review profile for local review surfaces.',
    bootstrap: 'No external login required for review-only routes.',
  },
  github_status: {
    label: 'GitHub status',
    role: 'external_account_read',
    route: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues',
    description: 'Manual GitHub read/status profile. Does not authorize posting by browser.',
    bootstrap: 'Manual login only. GitHub writes still use approved CLI/API flows.',
  },
};

function defaultRoot() {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  return path.join(localAppData, 'BNA', 'agent-browser-profiles');
}

function parseArgs(argv = process.argv.slice(2)) {
  const command = argv.find((arg) => !arg.startsWith('--')) || 'help';
  const flags = {
    command,
    profile: '',
    all: false,
    json: false,
    confirm: false,
    headed: false,
    headless: false,
    url: '',
    baseUrl: process.env.BNA_AGENT_BROWSER_BASE_URL || 'https://bneineviimacademy.org',
    root: process.env.BNA_AGENT_BROWSER_ROOT || defaultRoot(),
  };
  for (const arg of argv) {
    if (arg === command) continue;
    if (arg === '--all') flags.all = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--confirm') flags.confirm = true;
    else if (arg === '--headed') flags.headed = true;
    else if (arg === '--headless') flags.headless = true;
    else if (arg.startsWith('--profile=')) flags.profile = normalizeProfile(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--url=')) flags.url = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--base-url=')) flags.baseUrl = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--root=')) flags.root = arg.split('=').slice(1).join('=');
    else if (!arg.startsWith('--') && arg !== command && !flags.profile) flags.profile = normalizeProfile(arg);
  }
  return flags;
}

function normalizeProfile(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
}

export function resolveProfileRoot(root = defaultRoot()) {
  const resolved = path.resolve(root);
  const repo = path.resolve(repoRoot);
  if (resolved.toLowerCase() === repo.toLowerCase() || resolved.toLowerCase().startsWith(`${repo.toLowerCase()}${path.sep}`)) {
    throw new Error(`Agent browser profile root must live outside the repo: ${resolved}`);
  }
  return resolved;
}

function profileNames(flags = {}) {
  if (flags.all) return Object.keys(PROFILE_DEFS);
  const profile = normalizeProfile(flags.profile);
  if (profile) {
    if (!PROFILE_DEFS[profile]) throw new Error(`Unknown profile "${profile}". Run list for valid names.`);
    return [profile];
  }
  return [];
}

function profileDir(root, profile) {
  return path.join(root, profile);
}

function profileMetaPath(root, profile) {
  return path.join(profileDir(root, profile), metadataFile);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function runIcacls(args) {
  execFileSync('icacls', args, { stdio: 'ignore' });
}

function applyWindowsAcl(dir) {
  if (process.platform !== 'win32') return { applied: false, reason: 'non_windows' };
  if (process.env.BNA_AGENT_BROWSER_SKIP_ACL === '1') return { applied: false, reason: 'skipped_by_env' };
  const username = process.env.USERNAME || os.userInfo().username;
  const domainUser = process.env.USERDOMAIN ? `${process.env.USERDOMAIN}\\${username}` : username;
  try {
    runIcacls([dir, '/inheritance:r']);
    runIcacls([dir, '/grant:r', `${domainUser}:(OI)(CI)F`]);
    runIcacls([dir, '/grant:r', 'SYSTEM:(OI)(CI)F']);
    runIcacls([dir, '/grant:r', 'Administrators:(OI)(CI)F']);
    return { applied: true, account: domainUser };
  } catch (error) {
    return { applied: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

function inspectWindowsAcl(dir) {
  if (process.platform !== 'win32') return { checked: false, reason: 'non_windows' };
  try {
    const output = execFileSync('icacls', [dir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const username = process.env.USERNAME || os.userInfo().username;
    const hasCurrentUser = output.toLowerCase().includes(username.toLowerCase());
    const hasInheritanceDisabled = !/\(I\)/.test(output);
    return {
      checked: true,
      current_user_present: hasCurrentUser,
      inheritance_disabled: hasInheritanceDisabled,
      summary: output.split(/\r?\n/).filter(Boolean).slice(0, 6),
    };
  } catch (error) {
    return { checked: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

function initProfile(root, profile) {
  const def = PROFILE_DEFS[profile];
  const dir = profileDir(root, profile);
  ensureDir(dir);
  const acl = applyWindowsAcl(dir);
  const previous = readJson(profileMetaPath(root, profile), {});
  const meta = {
    profile,
    label: def.label,
    role: def.role,
    route: def.route,
    description: def.description,
    bootstrap: def.bootstrap,
    profile_dir: dir,
    managed_by: 'BNA agent browser harness',
    stores_auth_cookies: true,
    repo_storage_allowed: false,
    chatgpt_agent_cookies_shared: false,
    connector_tokens_shared: false,
    reauth_required: Boolean(previous?.reauth_required),
    created_at: previous?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_opened_at: previous?.last_opened_at || null,
    last_health_check_at: previous?.last_health_check_at || null,
    acl,
  };
  writeJson(profileMetaPath(root, profile), meta);
  return profileStatus(root, profile);
}

function profileStatus(root, profile) {
  const dir = profileDir(root, profile);
  const meta = readJson(profileMetaPath(root, profile), {});
  const exists = fs.existsSync(dir);
  return {
    profile,
    label: PROFILE_DEFS[profile]?.label || profile,
    role: PROFILE_DEFS[profile]?.role || '',
    exists,
    profile_dir: dir,
    metadata_exists: fs.existsSync(profileMetaPath(root, profile)),
    reauth_required: Boolean(meta?.reauth_required),
    last_opened_at: meta?.last_opened_at || null,
    last_health_check_at: meta?.last_health_check_at || null,
    acl: exists ? inspectWindowsAcl(dir) : null,
    route: PROFILE_DEFS[profile]?.route || '',
  };
}

function listProfiles(root) {
  return Object.keys(PROFILE_DEFS).map((profile) => profileStatus(root, profile));
}

function updateMeta(root, profile, patch) {
  const existing = readJson(profileMetaPath(root, profile), {});
  writeJson(profileMetaPath(root, profile), {
    ...existing,
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

function lockPath(profile) {
  return path.join(runtimeDir, `${profile}.json`);
}

function writeLock(profile, value) {
  ensureDir(runtimeDir);
  writeJson(lockPath(profile), value);
}

function readLock(profile) {
  return readJson(lockPath(profile), null);
}

function removeLock(profile) {
  try {
    fs.unlinkSync(lockPath(profile));
  } catch {}
}

function resolveRoute(baseUrl, profile, overrideUrl = '') {
  if (overrideUrl) return overrideUrl;
  const route = PROFILE_DEFS[profile].route;
  if (/^https?:\/\//i.test(route)) return route;
  return `${baseUrl.replace(/\/+$/, '')}${route}`;
}

async function openProfile(root, profile, flags) {
  initProfile(root, profile);
  const dir = profileDir(root, profile);
  const url = resolveRoute(flags.baseUrl, profile, flags.url);
  updateMeta(root, profile, { last_opened_at: new Date().toISOString(), reauth_required: false });
  const browser = await chromium.launchPersistentContext(dir, {
    headless: flags.headless ? true : !flags.headed ? false : false,
    viewport: { width: 1440, height: 900 },
  });
  writeLock(profile, {
    profile,
    pid: process.pid,
    profile_dir: dir,
    url,
    started_at: new Date().toISOString(),
  });
  const page = browser.pages()[0] || await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  console.log(`Opened ${profile} at ${url}`);
  console.log('Close the browser window or press Ctrl+C to end this profile session.');
  const stop = async () => {
    removeLock(profile);
    await browser.close().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  await new Promise((resolve) => browser.on('close', resolve));
  removeLock(profile);
}

function closeProfile(profile) {
  const lock = readLock(profile);
  if (!lock?.pid) return { profile, closed: false, reason: 'no_runtime_lock' };
  try {
    process.kill(Number(lock.pid));
    removeLock(profile);
    return { profile, closed: true, pid: lock.pid };
  } catch (error) {
    removeLock(profile);
    return { profile, closed: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

function clearProfile(root, profile, confirm = false) {
  const dir = profileDir(root, profile);
  if (!confirm) {
    return { profile, cleared: false, reason: 'requires --confirm', profile_dir: dir };
  }
  closeProfile(profile);
  fs.rmSync(dir, { recursive: true, force: true });
  return { profile, cleared: true, profile_dir: dir };
}

async function smokeProfile(root, profile, flags) {
  initProfile(root, profile);
  const dir = profileDir(root, profile);
  const url = resolveRoute(flags.baseUrl, profile, flags.url);
  const browser = await chromium.launchPersistentContext(dir, {
    headless: !flags.headed,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = browser.pages()[0] || await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    const result = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      body_text_length: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().length,
      login_like: Boolean(document.querySelector('input[type="password"], form[action*="login"], [data-login-form]')),
      horizontal_overflow_px: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    }));
    updateMeta(root, profile, {
      last_health_check_at: new Date().toISOString(),
      last_smoke: {
        checked_at: new Date().toISOString(),
        url,
        title: result.title,
        body_text_length: result.body_text_length,
        login_like: result.login_like,
        horizontal_overflow_px: result.horizontal_overflow_px,
      },
      reauth_required: Boolean(result.login_like),
    });
    return {
      profile,
      ok: result.body_text_length > 40 && result.horizontal_overflow_px <= 1,
      url,
      title: result.title,
      body_text_length: result.body_text_length,
      login_like: result.login_like,
      horizontal_overflow_px: result.horizontal_overflow_px,
      screenshot_written: false,
      private_data_captured: false,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

function health(root, names = Object.keys(PROFILE_DEFS)) {
  const resolvedRoot = resolveProfileRoot(root);
  return {
    ok: true,
    profile_root: resolvedRoot,
    root_exists: fs.existsSync(resolvedRoot),
    root_outside_repo: true,
    profiles: names.map((profile) => {
      const status = profileStatus(resolvedRoot, profile);
      if (status.metadata_exists) updateMeta(resolvedRoot, profile, { last_health_check_at: new Date().toISOString() });
      return status;
    }),
  };
}

function print(value, json = false) {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      console.log(`${item.profile}: ${item.exists ? 'initialized' : 'missing'}${item.reauth_required ? ' (reauth required)' : ''}`);
      console.log(`  ${item.profile_dir}`);
    }
    return;
  }
  console.log(JSON.stringify(value, null, 2));
}

function usage() {
  return [
    'BNA agent browser profile harness',
    '',
    'Commands:',
    '  list [--json]',
    '  init --all | init <profile>',
    '  health [--all|<profile>] [--json]',
    '  open <profile> [--base-url=https://...] [--url=...] [--headed|--headless]',
    '  close <profile>',
    '  reopen <profile>',
    '  reauth-required <profile>',
    '  smoke --all | smoke <profile> [--base-url=https://...] [--headed]',
    '  clear <profile> --confirm',
    '  revoke <profile> --confirm',
    '',
    `Default profile root: ${defaultRoot()}`,
    `Profiles: ${Object.keys(PROFILE_DEFS).join(', ')}`,
  ].join('\n');
}

export async function run(argv = process.argv.slice(2)) {
  const flags = parseArgs(argv);
  const root = resolveProfileRoot(flags.root);
  const names = profileNames(flags);
  switch (flags.command) {
    case 'list':
      print(listProfiles(root), flags.json);
      return;
    case 'init': {
      const targets = names.length ? names : Object.keys(PROFILE_DEFS);
      print(targets.map((profile) => initProfile(root, profile)), flags.json);
      return;
    }
    case 'health': {
      const targets = names.length ? names : Object.keys(PROFILE_DEFS);
      print(health(root, targets), flags.json);
      return;
    }
    case 'open': {
      if (names.length !== 1) throw new Error('open requires exactly one profile.');
      await openProfile(root, names[0], flags);
      return;
    }
    case 'close': {
      if (names.length !== 1) throw new Error('close requires exactly one profile.');
      print(closeProfile(names[0]), flags.json);
      return;
    }
    case 'reopen': {
      if (names.length !== 1) throw new Error('reopen requires exactly one profile.');
      closeProfile(names[0]);
      await openProfile(root, names[0], flags);
      return;
    }
    case 'reauth-required': {
      if (names.length !== 1) throw new Error('reauth-required requires exactly one profile.');
      initProfile(root, names[0]);
      updateMeta(root, names[0], { reauth_required: true, reauth_marked_at: new Date().toISOString() });
      print(profileStatus(root, names[0]), flags.json);
      return;
    }
    case 'smoke': {
      const targets = names.length ? names : Object.keys(PROFILE_DEFS);
      const results = [];
      for (const profile of targets) results.push(await smokeProfile(root, profile, flags));
      print(results, flags.json);
      if (results.some((result) => !result.ok)) process.exitCode = 1;
      return;
    }
    case 'clear':
    case 'revoke': {
      if (names.length !== 1) throw new Error(`${flags.command} requires exactly one profile.`);
      print(clearProfile(root, names[0], flags.confirm), flags.json);
      return;
    }
    case 'root':
      print({ profile_root: root, outside_repo: true }, flags.json);
      return;
    case 'help':
    default:
      console.log(usage());
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
