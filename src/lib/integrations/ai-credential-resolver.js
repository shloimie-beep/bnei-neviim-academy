const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  defaultKeyholderRoots,
  loadEnvBlock,
  redactSecretText,
  usableSecretValue,
} = require('./secret-loader');

function fingerprintSecret(value) {
  const normalized = usableSecretValue(value);
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}

function readFileValue(filePath, envName = '') {
  let raw = '';
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
  if (envName) {
    const parsed = loadEnvBlock(raw);
    const envValue = usableSecretValue(parsed[envName]);
    if (envValue) return envValue;
  }
  return usableSecretValue(raw);
}

function safeResolveChild(root, fileName) {
  const resolvedRoot = path.resolve(String(root || ''));
  const resolved = path.resolve(resolvedRoot, String(fileName || ''));
  const relative = path.relative(resolvedRoot, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return '';
  return resolved;
}

function addCandidate(candidates, candidate) {
  const value = usableSecretValue(candidate?.apiKey);
  if (!value) return;
  const fingerprint = fingerprintSecret(value);
  if (candidates.some((item) => item.fingerprint === fingerprint)) return;
  candidates.push({
    provider: candidate.provider || 'openai',
    source: candidate.source || 'configured',
    source_type: candidate.source_type || 'configured',
    apiKey: value,
    fingerprint,
  });
}

function loadOpenAiCredentialCandidates(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const env = options.env || process.env;
  const candidates = [];

  addCandidate(candidates, {
    provider: 'openai',
    source: 'runtime-env:OPENAI_API_KEY',
    source_type: 'env',
    apiKey: env.OPENAI_API_KEY,
  });

  const keyholderRoots = options.keyholderRoots || defaultKeyholderRoots(repoRoot);
  for (const fileName of ['openaiv2.txt', 'openai-api-key.txt']) {
    for (const root of keyholderRoots) {
      const filePath = safeResolveChild(root, fileName);
      if (!filePath) continue;
      const value = readFileValue(filePath, 'OPENAI_API_KEY');
      if (!value) continue;
      addCandidate(candidates, {
        provider: 'openai',
        source: `keyholder:${fileName}`,
        source_type: 'keyholder',
        apiKey: value,
      });
      break;
    }
  }

  const secretsRoot = options.secretsRoot || path.join(repoRoot, '.secrets');
  for (const fileName of ['openai-api-key.txt']) {
    const filePath = safeResolveChild(secretsRoot, fileName);
    const value = filePath ? readFileValue(filePath, 'OPENAI_API_KEY') : '';
    if (!value) continue;
    addCandidate(candidates, {
      provider: 'openai',
      source: `.secrets:${fileName}`,
      source_type: '.secrets',
      apiKey: value,
    });
  }

  return candidates;
}

function parseProviderErrorBody(body) {
  const text = String(body || '');
  try {
    const parsed = JSON.parse(text);
    return {
      error_type: String(parsed?.error?.type || ''),
      error_code: String(parsed?.error?.code || ''),
      error_message: String(parsed?.error?.message || ''),
      raw: text,
    };
  } catch {
    return {
      error_type: '',
      error_code: '',
      error_message: text,
      raw: text,
    };
  }
}

function classifyProviderHttpError(status, body) {
  const parsed = parseProviderErrorBody(body);
  const combined = `${parsed.error_type} ${parsed.error_code} ${parsed.error_message}`.toLowerCase();
  if (Number(status) === 401 || /invalid[_-]?api[_-]?key|incorrect api key|auth(?:entication)? failed|unauthorized/.test(combined)) {
    return 'auth_invalid_key';
  }
  if (Number(status) === 429 || /rate[_-]?limit|quota/.test(combined)) return 'rate_limited';
  if (Number(status) >= 500) return 'provider_unavailable';
  if (Number(status) === 400) return 'bad_request';
  return 'provider_error';
}

function redactProviderError(value, secrets = []) {
  return redactSecretText(value, secrets).slice(0, 700);
}

module.exports = {
  classifyProviderHttpError,
  fingerprintSecret,
  loadOpenAiCredentialCandidates,
  parseProviderErrorBody,
  redactProviderError,
};
