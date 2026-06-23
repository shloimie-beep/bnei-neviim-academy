const fs = require('fs');
const os = require('os');
const path = require('path');

const PLACEHOLDER_PATTERNS = [
  /^\s*$/,
  /your[-_\s]?api[-_\s]?key/i,
  /your[-_\s]?token/i,
  /replace[-_\s]?me/i,
  /change[-_\s]?me/i,
  /placeholder/i,
  /\[YOUR-PASSWORD\]/i,
  /^xxx+$/i,
];

function stripWrappingQuotes(value) {
  let normalized = String(value || '').replace(/^\uFEFF/, '').trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function usableSecretValue(value) {
  const normalized = stripWrappingQuotes(value);
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))) return '';
  return normalized;
}

function parseEnvBlock(rawValue) {
  const parsed = {};
  String(rawValue || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .forEach((line) => {
      const cleaned = line.replace(/^export\s+/i, '');
      const separatorIndex = cleaned.indexOf('=');
      if (separatorIndex <= 0) return;
      const key = cleaned.slice(0, separatorIndex).trim();
      const value = stripWrappingQuotes(cleaned.slice(separatorIndex + 1));
      if (key) parsed[key] = value;
    });
  return parsed;
}

function envBlockValue(rawValue, envName) {
  const parsed = parseEnvBlock(rawValue);
  return usableSecretValue(parsed[envName]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value)))];
}

function hyphenName(envName) {
  return String(envName || '').toLowerCase().replace(/_/g, '-');
}

function candidateFileNames({ envName, names = [], fileNames = [] } = {}) {
  const base = unique([
    ...fileNames,
    ...names,
    envName,
    envName ? `${envName}.txt` : '',
    envName ? hyphenName(envName) : '',
    envName ? `${hyphenName(envName)}.txt` : '',
  ]);
  const withTxt = base.flatMap((name) => {
    const value = String(name || '').trim();
    if (!value) return [];
    return value.endsWith('.txt') ? [value] : [value, `${value}.txt`];
  });
  return unique(withTxt);
}

function defaultKeyholderRoots(repoRoot = process.cwd()) {
  const home = os.homedir();
  return unique([
    process.env.BNA_KEYHOLDER_DIR,
    process.env.KEYHOLDER_DIR,
    path.join(repoRoot, 'keyholder'),
    path.join(repoRoot, '.keyholder'),
    path.join(path.dirname(repoRoot), 'BNA-Keyholder'),
    home ? path.join(home, 'BNA-Keyholder') : '',
  ]);
}

function readValueFromFile(filePath, envName) {
  let raw = '';
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
  if (envName) {
    const blockValue = envBlockValue(raw, envName);
    if (blockValue) return blockValue;
  }
  return usableSecretValue(raw);
}

function loadFromRoots(roots, names, envName) {
  for (const root of roots) {
    const resolvedRoot = safeResolveRoot(root);
    if (!resolvedRoot) continue;
    for (const name of names) {
      const filePath = safeResolveCandidate(resolvedRoot, name);
      if (!filePath) continue;
      const value = readValueFromFile(filePath, envName);
      if (value) return { value, source_type: resolvedRoot.includes('.secrets') ? '.secrets' : 'keyholder' };
    }
  }
  return { value: '', source_type: null };
}

function safeResolveRoot(root) {
  const text = String(root || '').trim();
  if (!text) return '';
  return path.resolve(text);
}

function safeResolveCandidate(root, name) {
  const fileName = String(name || '').trim();
  if (!fileName || path.isAbsolute(fileName) || fileName.includes('\0')) return '';
  const resolvedRoot = safeResolveRoot(root);
  const resolved = path.resolve(resolvedRoot, fileName);
  const relative = path.relative(resolvedRoot, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return '';
  return resolved;
}

function loadSecret({
  envName,
  names = [],
  fileNames = [],
  repoRoot = process.cwd(),
  keyholderRoots = defaultKeyholderRoots(repoRoot),
  secretsRoot = path.join(repoRoot, '.secrets'),
} = {}) {
  if (!envName) throw new Error('loadSecret requires envName');

  const envRaw = process.env[envName];
  const envDirectValue = envRaw && !String(envRaw).includes('\n') && !String(envRaw).trim().startsWith(`${envName}=`)
    ? usableSecretValue(envRaw)
    : '';
  const envParsedValue = envRaw ? envBlockValue(envRaw, envName) : '';
  if (envDirectValue || envParsedValue) {
    return {
      configured: true,
      value: envDirectValue || envParsedValue,
      env_name: envName,
      source_type: 'env',
      blocker: null,
    };
  }

  const candidates = candidateFileNames({ envName, names, fileNames });
  const keyholder = loadFromRoots(keyholderRoots, candidates, envName);
  if (keyholder.value) {
    return {
      configured: true,
      value: keyholder.value,
      env_name: envName,
      source_type: 'keyholder',
      blocker: null,
    };
  }

  const secrets = loadFromRoots([secretsRoot], candidates, envName);
  if (secrets.value) {
    return {
      configured: true,
      value: secrets.value,
      env_name: envName,
      source_type: '.secrets',
      blocker: null,
    };
  }

  return {
    configured: false,
    value: '',
    env_name: envName,
    source_type: null,
    blocker: `${envName} is not configured in env/keyholder/.secrets. Add it server-side; do not paste it into chat or commit it.`,
  };
}

function loadConfigValue(options = {}) {
  return loadSecret(options).value;
}

function redactSecretText(value, secrets = []) {
  let text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  for (const secret of secrets) {
    const normalized = usableSecretValue(secret);
    if (!normalized) continue;
    text = text.split(normalized).join('[redacted]');
  }
  text = text.replace(/Authorization:\s*Bearer\s+[A-Za-z0-9._-]+/gi, 'Authorization: Bearer [redacted]');
  text = text.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
  text = text.replace(/\b(sk|rk|re|xoxb|ghp|ghs|whsec|rk_live|sk_live|sk_test)_[A-Za-z0-9._-]{12,}\b/g, '[redacted]');
  text = text.replace(/\b[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/g, '[redacted]');
  text = text.replace(/(api[_-]?key|token|secret|password|authorization|client[_-]?secret)\s*[:=]\s*[^\s"',}]+/gi, '$1=[redacted]');
  return text;
}

function redactSecrets(value, secrets = []) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactSecretText(value, secrets);
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item, secrets));
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      if (/api[_-]?key|token|secret|password|authorization|credential|cookie/i.test(key)) {
        return [key, '[redacted]'];
      }
      return [key, redactSecrets(item, secrets)];
    }));
  }
  return value;
}

function redactError(error, secrets = []) {
  return {
    message: redactSecretText(error?.message || String(error || 'Integration error'), secrets),
    status: error?.status || error?.statusCode || null,
    code: error?.code || null,
    blocker: redactSecretText(error?.blocker || '', secrets) || null,
  };
}

function safeSecretSourceLabel(source) {
  const normalized = String(source?.source_type || source || '').trim();
  if (normalized === 'env') return 'env';
  if (normalized === '.secrets') return '.secrets';
  if (normalized === 'keyholder') return 'keyholder';
  return normalized ? 'configured' : 'not configured';
}

function getSecret(name, options = {}) {
  return loadSecret({ envName: name, ...options });
}

function getIntegrationSecret(provider, key, options = {}) {
  const envName = String(options.envName || `${provider}_${key}`).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const base = envName.toLowerCase().replace(/_/g, '-');
  return loadSecret({
    envName,
    names: [base, envName, provider, ...(options.names || [])],
    fileNames: [`${base}.txt`, `${envName}.txt`, `${provider}.txt`, ...(options.fileNames || [])],
    ...options,
  });
}

function secretConfigured(name, options = {}) {
  return loadSecret({ envName: name, ...options }).configured;
}

module.exports = {
  candidateFileNames,
  defaultKeyholderRoots,
  getIntegrationSecret,
  getSecret,
  loadConfigValue,
  loadEnvBlock: parseEnvBlock,
  loadSecret,
  parseEnvBlock,
  redactError,
  redactSecrets,
  redactSecretText,
  safeSecretSourceLabel,
  secretConfigured,
  usableSecretValue,
};
