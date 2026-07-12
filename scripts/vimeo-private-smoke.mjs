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

function firstConfiguredSecret(loaders = []) {
  for (const loader of loaders) {
    const loaded = loadSecret({ repoRoot, ...loader });
    if (loaded.configured && loaded.value) return loaded;
  }
  return { configured: false, value: '', source_type: null };
}

function loadVimeoSmokeConfig() {
  return {
    expectedAccountUri: firstConfiguredSecret([
      {
        envName: 'VIMEO_EXPECTED_ACCOUNT_URI',
        names: ['vimeo-expected-account-uri', 'vimeo-account-uri'],
        fileNames: ['vimeo-expected-account-uri.txt', 'VIMEO_EXPECTED_ACCOUNT_URI.txt', 'vimeo-account-uri.txt'],
      },
      {
        envName: 'BNA_VIMEO_EXPECTED_ACCOUNT_URI',
        names: ['bna-vimeo-expected-account-uri'],
        fileNames: ['BNA_VIMEO_EXPECTED_ACCOUNT_URI.txt'],
      },
    ]),
    expectedAccountName: firstConfiguredSecret([
      {
        envName: 'VIMEO_EXPECTED_ACCOUNT_NAME',
        names: ['vimeo-expected-account-name', 'vimeo-account-name'],
        fileNames: ['vimeo-expected-account-name.txt', 'VIMEO_EXPECTED_ACCOUNT_NAME.txt', 'vimeo-account-name.txt'],
      },
      {
        envName: 'BNA_VIMEO_EXPECTED_ACCOUNT_NAME',
        names: ['bna-vimeo-expected-account-name'],
        fileNames: ['BNA_VIMEO_EXPECTED_ACCOUNT_NAME.txt'],
      },
    ]),
    testProjectUri: firstConfiguredSecret([
      {
        envName: 'VIMEO_TEST_PROJECT_URI',
        names: ['vimeo-test-project-uri', 'one-time-vimeo-test-project-uri'],
        fileNames: ['vimeo-test-project-uri.txt', 'VIMEO_TEST_PROJECT_URI.txt', 'one-time-vimeo-test-project-uri.txt'],
      },
      {
        envName: 'BNA_VIMEO_TEST_PROJECT_URI',
        names: ['bna-vimeo-test-project-uri'],
        fileNames: ['BNA_VIMEO_TEST_PROJECT_URI.txt'],
      },
    ]),
    testProjectName: firstConfiguredSecret([
      {
        envName: 'VIMEO_TEST_PROJECT_NAME',
        names: ['vimeo-test-project-name', 'one-time-vimeo-test-project-name'],
        fileNames: ['vimeo-test-project-name.txt', 'VIMEO_TEST_PROJECT_NAME.txt', 'one-time-vimeo-test-project-name.txt'],
      },
      {
        envName: 'BNA_VIMEO_TEST_PROJECT_NAME',
        names: ['bna-vimeo-test-project-name'],
        fileNames: ['BNA_VIMEO_TEST_PROJECT_NAME.txt'],
      },
    ]),
    accountConfirmed: firstConfiguredSecret([
      {
        envName: 'BNA_VIMEO_TEST_ACCOUNT_CONFIRMED',
        names: ['bna-vimeo-test-account-confirmed', 'vimeo-test-account-confirmed'],
        fileNames: ['BNA_VIMEO_TEST_ACCOUNT_CONFIRMED.txt', 'vimeo-test-account-confirmed.txt'],
      },
    ]),
  };
}

function safeConfigSource(source) {
  return source?.configured ? safeSecretSourceLabel(source) : 'not configured';
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
const smokeConfig = loadVimeoSmokeConfig();
const result = redactResult(await vimeo.default.runVimeoPrivateSyntheticSmoke({
  enabled: /^(1|true|yes)$/i.test(String(process.env.BNA_VIMEO_PRIVATE_SMOKE || '').trim()),
  token: process.env.VIMEO_ACCESS_TOKEN || accessToken.value,
  accountConfirmed: /^(1|true|yes)$/i.test(String(process.env.BNA_VIMEO_TEST_ACCOUNT_CONFIRMED || smokeConfig.accountConfirmed.value || '').trim()),
  expectedAccountUri: process.env.VIMEO_EXPECTED_ACCOUNT_URI || smokeConfig.expectedAccountUri.value,
  expectedAccountName: process.env.VIMEO_EXPECTED_ACCOUNT_NAME || smokeConfig.expectedAccountName.value,
  testProjectUri: process.env.VIMEO_TEST_PROJECT_URI || process.env.BNA_VIMEO_TEST_PROJECT_URI || smokeConfig.testProjectUri.value,
  testProjectName: process.env.VIMEO_TEST_PROJECT_NAME || process.env.BNA_VIMEO_TEST_PROJECT_NAME || smokeConfig.testProjectName.value,
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
    vimeo_test_project_present: Boolean(process.env.VIMEO_TEST_PROJECT_URI || process.env.BNA_VIMEO_TEST_PROJECT_URI || smokeConfig.testProjectUri.value || smokeConfig.testProjectName.value),
    vimeo_test_project_source: process.env.VIMEO_TEST_PROJECT_URI || process.env.BNA_VIMEO_TEST_PROJECT_URI ? 'env' : safeConfigSource(smokeConfig.testProjectUri.configured ? smokeConfig.testProjectUri : smokeConfig.testProjectName),
    vimeo_expected_account_present: Boolean(process.env.VIMEO_EXPECTED_ACCOUNT_URI || process.env.VIMEO_EXPECTED_ACCOUNT_NAME || smokeConfig.expectedAccountUri.value || smokeConfig.expectedAccountName.value),
    vimeo_expected_account_source: process.env.VIMEO_EXPECTED_ACCOUNT_URI || process.env.VIMEO_EXPECTED_ACCOUNT_NAME ? 'env' : safeConfigSource(smokeConfig.expectedAccountUri.configured ? smokeConfig.expectedAccountUri : smokeConfig.expectedAccountName),
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
