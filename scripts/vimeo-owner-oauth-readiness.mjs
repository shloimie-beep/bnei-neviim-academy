#!/usr/bin/env node

const fs = await import('node:fs');
const path = await import('node:path');
const { fileURLToPath } = await import('node:url');
const { createRequire } = await import('node:module');

const require = createRequire(import.meta.url);
const vimeo = require('../src/lib/integrations/vimeo');
const {
  loadSecret,
  safeSecretSourceLabel,
} = require('../src/lib/integrations/secret-loader');

const args = new Set(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadClientId() {
  return loadSecret({
    envName: 'VIMEO_CLIENT_ID',
    names: ['vimeo-client-id', 'one-time-vimeo-client-id'],
    fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'one-time-vimeo-client-id.txt'],
    repoRoot,
  });
}

function loadClientSecret() {
  return loadSecret({
    envName: 'VIMEO_CLIENT_SECRET',
    names: ['vimeo-client-secret', 'one-time-vimeo-client-secret'],
    fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'one-time-vimeo-client-secret.txt'],
    repoRoot,
  });
}

function loadRedirectUri() {
  return loadSecret({
    envName: 'VIMEO_OAUTH_REDIRECT_URI',
    names: ['vimeo-oauth-redirect-uri', 'one-time-vimeo-oauth-redirect-uri'],
    fileNames: ['vimeo-oauth-redirect-uri.txt', 'VIMEO_OAUTH_REDIRECT_URI.txt', 'one-time-vimeo-oauth-redirect-uri.txt'],
    repoRoot,
  });
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function safeConfiguredSource(source) {
  return source?.configured ? safeSecretSourceLabel(source) : 'not configured';
}

function markdownReport(payload) {
  const plan = payload.owner_authorization_plan || {};
  const check = payload.app_credentials_check || {};
  return [
    `# Vimeo Owner OAuth Readiness - ${payload.generated_at}`,
    '',
    'No Vimeo upload, OAuth code exchange, token storage, metadata edit, folder attach, delete, public publish, Drive write, database write, or member publication was performed.',
    '',
    '## Configuration',
    '',
    `- client_id_configured: ${payload.config.client_id_configured}`,
    `- client_secret_configured: ${payload.config.client_secret_configured}`,
    `- redirect_uri_configured: ${payload.config.redirect_uri_configured}`,
    `- client_id_source: ${payload.config.client_id_source}`,
    `- client_secret_source: ${payload.config.client_secret_source}`,
    `- redirect_uri_source: ${payload.config.redirect_uri_source}`,
    '',
    '## Owner Authorization',
    '',
    `- status: ${plan.status || 'not_run'}`,
    `- scopes: ${(plan.scopes || []).join(', ')}`,
    `- authorization_url_redacted: ${plan.authorization_url_redacted || 'not_available'}`,
    `- token_exchange_performed: ${plan.token_exchange_performed === true}`,
    `- next_action: ${plan.next_action || 'none'}`,
    '',
    '## App Credential Check',
    '',
    `- status: ${check.status || 'skipped'}`,
    `- ok: ${check.ok === true}`,
    `- access_token_returned: ${check.access_token_returned === true}`,
    `- app_token_stored: ${check.app_token_stored === true}`,
    `- token_printed: ${check.token_printed === true}`,
    `- next_action: ${check.next_action || 'none'}`,
    '',
  ].join('\n');
}

const clientId = loadClientId();
const clientSecret = loadClientSecret();
const redirectUri = loadRedirectUri();
const scopes = process.env.VIMEO_OAUTH_SCOPES || process.env.BNA_VIMEO_OAUTH_SCOPES || undefined;
const command = [
  'node scripts/vimeo-owner-oauth-readiness.mjs',
  '--json',
  ...(args.has('--check-client-credentials') ? ['--check-client-credentials'] : []),
  ...(args.has('--write-evidence') ? ['--write-evidence'] : []),
].join(' ');

const ownerAuthorizationPlan = vimeo.buildVimeoOwnerOAuthAuthorization({
  clientId: clientId.value,
  redirectUri: redirectUri.value,
  scopes,
  state: process.env.VIMEO_OAUTH_STATE || process.env.BNA_VIMEO_OAUTH_STATE || 'one-time-vimeo-owner-oauth',
});

const appCredentialsCheck = args.has('--check-client-credentials')
  ? await vimeo.verifyVimeoAppCredentials({
    clientId: clientId.value,
    clientSecret: clientSecret.value,
    scopes: 'public',
  })
  : {
    provider: 'vimeo',
    credential_kind: 'client_credentials',
    ok: false,
    status: 'skipped',
    readiness_status: 'skipped',
    external_write_performed: false,
    token_printed: false,
    app_token_stored: false,
    reason: 'Client-credentials network check was not requested.',
    next_action: 'Rerun with --check-client-credentials to verify the app credential pair without storing the returned token.',
  };

const payload = {
  generated_at: new Date().toISOString(),
  command,
  safe_write_policy: {
    vimeo_upload_performed: false,
    oauth_code_exchange_performed: false,
    token_stored: false,
    token_printed: false,
    provider_metadata_mutated: false,
    public_publish_performed: false,
    drive_or_database_write_performed: false,
    member_publication_performed: false,
  },
  config: {
    client_id_configured: Boolean(clientId.value),
    client_secret_configured: Boolean(clientSecret.value),
    redirect_uri_configured: Boolean(redirectUri.value),
    client_id_source: safeConfiguredSource(clientId),
    client_secret_source: safeConfiguredSource(clientSecret),
    redirect_uri_source: safeConfiguredSource(redirectUri),
  },
  owner_authorization_plan: ownerAuthorizationPlan,
  app_credentials_check: appCredentialsCheck,
};

if (args.has('--write-evidence')) {
  const outDir = path.join(repoRoot, 'ops', 'qa-runs');
  fs.mkdirSync(outDir, { recursive: true });
  const base = `${timestampSlug()}-vimeo-owner-oauth-readiness`;
  fs.writeFileSync(path.join(outDir, `${base}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(path.join(outDir, `${base}.md`), markdownReport(payload));
}

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
