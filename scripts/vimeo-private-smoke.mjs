#!/usr/bin/env node

const fs = await import('node:fs');
const path = await import('node:path');
const { fileURLToPath } = await import('node:url');
const { createRequire } = await import('node:module');
const vimeo = await import('../src/lib/integrations/vimeo.js');

const args = new Set(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeEvidence = args.has('--write-evidence');
const require = createRequire(import.meta.url);
const {
  loadSecret,
  safeSecretSourceLabel,
} = require('../src/lib/integrations/secret-loader');

function loadVimeoAccessToken() {
  return loadSecret({
    envName: 'VIMEO_ACCESS_TOKEN',
    names: ['vimeo-access-token', 'one-time-vimeo-access-token', 'vimeo'],
    fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'one-time-vimeo-access-token.txt', 'vimeo.txt'],
    repoRoot,
  });
}

function redactResult(result) {
  const clone = JSON.parse(JSON.stringify(result || {}));
  delete clone.token;
  delete clone.access_token;
  delete clone.accessToken;
  if (clone.account?.uri) clone.account.uri = String(clone.account.uri).replace(/\d{3,}/g, '...');
  return clone;
}

const accessToken = loadVimeoAccessToken();
const result = redactResult(await vimeo.default.runVimeoPrivateSyntheticSmoke({
  enabled: /^(1|true|yes)$/i.test(String(process.env.BNA_VIMEO_PRIVATE_SMOKE || '').trim()),
  token: process.env.VIMEO_ACCESS_TOKEN || accessToken.value,
  accountConfirmed: /^(1|true|yes)$/i.test(String(process.env.BNA_VIMEO_TEST_ACCOUNT_CONFIRMED || '').trim()),
  expectedAccountUri: process.env.VIMEO_EXPECTED_ACCOUNT_URI,
  expectedAccountName: process.env.VIMEO_EXPECTED_ACCOUNT_NAME,
  testProjectUri: process.env.VIMEO_TEST_PROJECT_URI || process.env.BNA_VIMEO_TEST_PROJECT_URI,
  testProjectName: process.env.VIMEO_TEST_PROJECT_NAME || process.env.BNA_VIMEO_TEST_PROJECT_NAME,
  syntheticFile: process.env.BNA_VIMEO_SYNTHETIC_TEST_FILE,
  privacy: process.env.BNA_VIMEO_PRIVATE_SMOKE_PRIVACY || 'private',
}));

const payload = {
  generated_at: new Date().toISOString(),
  command: 'node scripts/vimeo-private-smoke.mjs --json',
  safe_write_policy: {
    real_class_recordings_uploaded: false,
    public_publish_performed: false,
    existing_production_assets_modified_or_deleted: false,
    token_printed: false,
  },
  result,
  credential_readiness: {
    vimeo_access_token_present: Boolean(process.env.VIMEO_ACCESS_TOKEN || accessToken.value),
    vimeo_access_token_source: process.env.VIMEO_ACCESS_TOKEN ? 'env' : safeSecretSourceLabel(accessToken),
    token_printed: false,
  },
};

if (writeEvidence) {
  fs.writeFileSync(
    path.join(repoRoot, 'VIMEO-OBJECTS-REDACTED.json'),
    `${JSON.stringify(payload, null, 2)}\n`
  );
}

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
