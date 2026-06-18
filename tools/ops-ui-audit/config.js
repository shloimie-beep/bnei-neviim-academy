const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 800, deviceScaleFactor: 1 },
  { name: 'mobile-390', width: 390, height: 844, deviceScaleFactor: 1 },
  { name: 'tablet-768', width: 768, height: 1024, deviceScaleFactor: 1 },
  { name: 'desktop-1440', width: 1440, height: 900, deviceScaleFactor: 1 },
];

function envInt(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  return !/^(false|0|no|off)$/i.test(String(raw).trim());
}

function resolveRepoPath(value) {
  if (path.isAbsolute(value)) return value;
  return path.resolve(repoRoot, value);
}

function loadConfig(overrides = {}) {
  const baseUrl = String(process.env.OPS_AUDIT_BASE_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const startPath = process.env.OPS_AUDIT_START_PATH || '/operations';
  const storageState = process.env.OPS_AUDIT_STORAGE_STATE || '.runtime/auth/operations-storage-state.json';
  const outputRoot = process.env.OPS_AUDIT_OUTPUT_ROOT || 'ops/ui-audits/runs';
  return {
    repoRoot,
    baseUrl,
    startPath,
    startUrl: new URL(startPath, `${baseUrl}/`).toString(),
    storageStatePath: resolveRepoPath(storageState),
    outputRoot: resolveRepoPath(outputRoot),
    outputRootRelative: path.relative(repoRoot, resolveRepoPath(outputRoot)).replace(/\\/g, '/'),
    latestPath: resolveRepoPath('ops/ui-audits/latest.json'),
    privacyMode: process.env.OPS_AUDIT_PRIVACY_MODE || 'redact',
    maxStates: envInt('OPS_AUDIT_MAX_STATES', 250),
    maxActionsPerState: envInt('OPS_AUDIT_MAX_ACTIONS_PER_STATE', 80),
    headless: envBool('OPS_AUDIT_HEADLESS', true),
    timeoutMs: envInt('OPS_AUDIT_TIMEOUT_MS', 30000),
    viewports: VIEWPORTS,
    ...overrides,
  };
}

function timestampForRun(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

module.exports = {
  VIEWPORTS,
  loadConfig,
  repoRoot,
  resolveRepoPath,
  timestampForRun,
};
