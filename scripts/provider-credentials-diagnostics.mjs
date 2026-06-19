#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const {
  loadSecret,
  redactSecrets,
  safeSecretSourceLabel,
} = require('../src/lib/integrations/secret-loader');
const {
  getResendConfig,
  listResendDomains,
} = require('../src/lib/integrations/resend-client');
const {
  getStripeConfig,
  getStripeReadiness,
} = require('../src/lib/integrations/stripe');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function fingerprint(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}

function fieldStatus(loaded) {
  return {
    configured: Boolean(loaded?.configured),
    source: loaded?.configured ? safeSecretSourceLabel(loaded) : 'not configured',
    length: String(loaded?.value || '').length,
    fingerprint: fingerprint(loaded?.value),
  };
}

function readinessStates({
  credentialsPresent = false,
  authVerifiedReadOnly = false,
  productionEnvPresent = false,
  ownerActionRequired = false,
  liveWriteNotTested = true,
  productionReady = false,
} = {}) {
  const states = [credentialsPresent ? 'credentials_present' : 'credentials_missing'];
  if (authVerifiedReadOnly) states.push('auth_verified_read_only');
  if (productionEnvPresent) states.push('production_env_present');
  if (ownerActionRequired) states.push('owner_action_required');
  if (liveWriteNotTested) states.push('live_write_not_tested');
  if (productionReady) states.push('production_ready');
  return states;
}

function safeError(error, secrets = []) {
  return redactSecrets({
    message: error?.message || String(error || 'Provider credential check failed'),
    status: error?.status || error?.statusCode || null,
    code: error?.code || null,
  }, secrets);
}

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text.slice(0, 300) };
  }
}

function loaderOptions(repoRoot = defaultRepoRoot, options = {}) {
  return {
    repoRoot,
    ...(options.keyholderRoots !== undefined ? { keyholderRoots: options.keyholderRoots } : {}),
    ...(options.secretsRoot !== undefined ? { secretsRoot: options.secretsRoot } : {}),
  };
}

function loadProviderSecrets(repoRoot = defaultRepoRoot, options = {}) {
  const loader = loaderOptions(repoRoot, options);
  const zoom = {
    accountId: loadSecret({
      envName: 'ZOOM_ACCOUNT_ID',
      names: ['zoom-account-id', 'zoom'],
      fileNames: ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt', 'zoom.txt'],
      ...loader,
    }),
    clientId: loadSecret({
      envName: 'ZOOM_CLIENT_ID',
      names: ['zoom-client-id', 'zoom'],
      fileNames: ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt', 'zoom.txt'],
      ...loader,
    }),
    clientSecret: loadSecret({
      envName: 'ZOOM_CLIENT_SECRET',
      names: ['zoom-client-secret', 'zoom'],
      fileNames: ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt', 'zoom.txt'],
      ...loader,
    }),
  };

  const vimeo = {
    clientId: loadSecret({
      envName: 'VIMEO_CLIENT_ID',
      names: ['vimeo-client-id', 'vimeo'],
      fileNames: ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt'],
      ...loader,
    }),
    clientSecret: loadSecret({
      envName: 'VIMEO_CLIENT_SECRET',
      names: ['vimeo-client-secret', 'vimeo'],
      fileNames: ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt'],
      ...loader,
    }),
    accessToken: loadSecret({
      envName: 'VIMEO_ACCESS_TOKEN',
      names: ['vimeo-access-token', 'vimeo'],
      fileNames: ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt'],
      ...loader,
    }),
  };

  const resend = {
    apiKey: loadSecret({
      envName: 'RESEND_API_KEY',
      names: ['resend-api-key', 'resend'],
      fileNames: ['resend-api-key.txt', 'RESEND_API_KEY.txt', 'resend.txt'],
      ...loader,
    }),
    from: loadSecret({
      envName: 'RESEND_FROM',
      names: ['resend-from', 'resend'],
      fileNames: ['resend-from.txt', 'RESEND_FROM.txt', 'resend.txt'],
      ...loader,
    }),
    fromEmail: loadSecret({
      envName: 'RESEND_FROM_EMAIL',
      names: ['resend-from-email', 'resend'],
      fileNames: ['resend-from-email.txt', 'RESEND_FROM_EMAIL.txt', 'resend.txt'],
      ...loader,
    }),
    domain: loadSecret({
      envName: 'RESEND_DOMAIN',
      names: ['resend-domain', 'resend'],
      fileNames: ['resend-domain.txt', 'RESEND_DOMAIN.txt', 'resend.txt'],
      ...loader,
    }),
    rabbiApiKey: loadSecret({
      envName: 'RESEND_RABBI_API_KEY',
      names: ['resend-rabbi-api-key', 'resend-rabbi', 'resend-api-key'],
      fileNames: [
        'resend-rabbi-api-key.txt',
        'RESEND_RABBI_API_KEY.txt',
        'resend-rabbi.txt',
        'providers/resend/one-time-api-key.txt',
        'resend-api-key.txt',
      ],
      ...loader,
    }),
    rabbiDomain: loadSecret({
      envName: 'RESEND_RABBI_DOMAIN',
      names: ['resend-rabbi-domain', 'resend-rabbi', 'resend-domain'],
      fileNames: [
        'resend-rabbi-domain.txt',
        'RESEND_RABBI_DOMAIN.txt',
        'resend-rabbi.txt',
        'resend-domain.txt',
      ],
      ...loader,
    }),
  };

  const stripe = {
    secretKey: loadSecret({
      envName: 'STRIPE_SECRET_KEY',
      names: ['stripe-secret-key', 'stripe', 'STRIPE_SECRET_KEY', 'RABBI_STRIPE_SECRET_KEY'],
      fileNames: ['stripe-secret-key.txt', 'stripe.txt', 'STRIPE_SECRET_KEY.txt', 'RABBI_STRIPE_SECRET_KEY.txt'],
      ...loader,
    }),
    rabbiSecretKey: loadSecret({
      envName: 'RABBI_STRIPE_SECRET_KEY',
      names: ['rabbi-stripe-secret-key', 'stripe', 'RABBI_STRIPE_SECRET_KEY'],
      fileNames: ['rabbi-stripe-secret-key.txt', 'stripe.txt', 'RABBI_STRIPE_SECRET_KEY.txt'],
      ...loader,
    }),
  };

  const greenInvoice = {
    secret: loadSecret({
      envName: 'GREEN_INVOICE_SECRET',
      names: ['green-invoice-secret', 'green-invoice'],
      fileNames: ['green-invoice-secret.txt', 'GREEN_INVOICE_SECRET.txt', 'green-invoice.txt'],
      ...loader,
    }),
    rabbiSecret: loadSecret({
      envName: 'RABBI_GREEN_INVOICE_SECRET',
      names: ['rabbi-green-invoice-secret', 'green-invoice'],
      fileNames: ['rabbi-green-invoice-secret.txt', 'RABBI_GREEN_INVOICE_SECRET.txt', 'green-invoice.txt'],
      ...loader,
    }),
    rabbiApiKey: loadSecret({
      envName: 'RABBI_GREEN_INVOICE_API_KEY',
      names: ['rabbi-green-invoice-api-key', 'green-invoice'],
      fileNames: ['rabbi-green-invoice-api-key.txt', 'RABBI_GREEN_INVOICE_API_KEY.txt', 'green-invoice.txt'],
      ...loader,
    }),
  };

  return { zoom, vimeo, resend, stripe, greenInvoice };
}

async function testZoomToken(secrets, { fetchImpl = globalThis.fetch, network = true } = {}) {
  const missing = [
    secrets.accountId.value ? null : 'ZOOM_ACCOUNT_ID',
    secrets.clientId.value ? null : 'ZOOM_CLIENT_ID',
    secrets.clientSecret.value ? null : 'ZOOM_CLIENT_SECRET',
  ].filter(Boolean);
  if (missing.length) return { ok: false, status: 'missing_credentials', missing };
  if (!network) return { ok: null, status: 'network_skipped', external_write_performed: false };
  if (typeof fetchImpl !== 'function') return { ok: false, status: 'fetch_unavailable', external_write_performed: false };

  const url = new URL('https://zoom.us/oauth/token');
  url.searchParams.set('grant_type', 'account_credentials');
  url.searchParams.set('account_id', secrets.accountId.value);
  const secretValues = [secrets.accountId.value, secrets.clientId.value, secrets.clientSecret.value];

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secrets.clientId.value}:${secrets.clientSecret.value}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        status: 'auth_failed',
        http_status: response.status,
        external_write_performed: false,
        error: redactSecrets(data, secretValues),
      };
    }
    const scopes = String(data.scope || '').split(/\s+/).filter(Boolean);
    return {
      ok: Boolean(data.access_token),
      status: data.access_token ? 'token_ready' : 'token_missing_in_response',
      http_status: response.status,
      external_write_performed: false,
      token_type: data.token_type || null,
      expires_in: Number(data.expires_in || 0) || null,
      scope_count: scopes.length,
      token_fingerprint: fingerprint(data.access_token),
      token_stored: false,
    };
  } catch (error) {
    return {
      ok: false,
      status: 'request_failed',
      external_write_performed: false,
      error: safeError(error, secretValues),
    };
  }
}

async function testVimeoClientCredentials(secrets, { fetchImpl = globalThis.fetch, network = true } = {}) {
  const missing = [
    secrets.clientId.value ? null : 'VIMEO_CLIENT_ID',
    secrets.clientSecret.value ? null : 'VIMEO_CLIENT_SECRET',
  ].filter(Boolean);
  if (missing.length) return { ok: false, status: 'missing_credentials', missing };
  if (!network) return { ok: null, status: 'network_skipped', external_write_performed: false };
  if (typeof fetchImpl !== 'function') return { ok: false, status: 'fetch_unavailable', external_write_performed: false };

  const secretValues = [secrets.clientId.value, secrets.clientSecret.value, secrets.accessToken.value];
  try {
    const response = await fetchImpl('https://api.vimeo.com/oauth/authorize/client', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secrets.clientId.value}:${secrets.clientSecret.value}`).toString('base64')}`,
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grant_type: 'client_credentials', scope: 'public' }),
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        status: 'auth_failed',
        http_status: response.status,
        external_write_performed: false,
        error: redactSecrets(data, secretValues),
      };
    }
    const scopes = String(data.scope || '').split(/\s+/).filter(Boolean);
    return {
      ok: Boolean(data.access_token),
      status: data.access_token ? 'client_credentials_ready' : 'token_missing_in_response',
      http_status: response.status,
      external_write_performed: false,
      token_type: data.token_type || null,
      scope_count: scopes.length,
      token_fingerprint: fingerprint(data.access_token),
      token_stored: false,
      user_access_token_configured: Boolean(secrets.accessToken.value),
    };
  } catch (error) {
    return {
      ok: false,
      status: 'request_failed',
      external_write_performed: false,
      error: safeError(error, secretValues),
    };
  }
}

async function testResendDomains(secrets, { repoRoot = defaultRepoRoot, fetchImpl = globalThis.fetch, network = true, keyholderRoots, secretsRoot } = {}) {
  const apiKey = secrets.rabbiApiKey.value || secrets.apiKey.value;
  const domain = secrets.rabbiDomain.value || secrets.domain.value;
  if (!apiKey) {
    return {
      ok: false,
      status: 'missing_credentials',
      missing: ['RESEND_API_KEY'],
      external_write_performed: false,
    };
  }
  if (!network) return { ok: null, status: 'network_skipped', external_write_performed: false };
  if (typeof fetchImpl !== 'function') return { ok: false, status: 'fetch_unavailable', external_write_performed: false };
  try {
    const config = getResendConfig({
      repoRoot,
      keyholderRoots,
      secretsRoot,
      apiKey,
      domain,
      from: secrets.from.value,
      fromEmail: secrets.fromEmail.value,
      profile: secrets.rabbiApiKey.value ? 'rabbi' : '',
    });
    const domains = await listResendDomains({ config, fetchImpl });
    const configuredDomain = String(config.domain || '').trim().toLowerCase();
    const matched = configuredDomain
      ? domains.find((row) => String(row.name || '').trim().toLowerCase() === configuredDomain)
      : null;
    return {
      ok: true,
      status: 'domains_read',
      external_write_performed: false,
      domain_count: domains.length,
      configured_domain_present: Boolean(matched),
      configured_domain_verified: Boolean(matched && String(matched.status || '').toLowerCase() === 'verified'),
    };
  } catch (error) {
    return {
      ok: false,
      status: 'request_failed',
      external_write_performed: false,
      error: safeError(error, [apiKey]),
    };
  }
}

function buildResendCheck(secrets, domainCheck) {
  const apiKeyPresent = Boolean(secrets.apiKey.value || secrets.rabbiApiKey.value);
  const fromPresent = Boolean(secrets.from.value || secrets.fromEmail.value);
  const domainPresent = Boolean(secrets.domain.value || secrets.rabbiDomain.value);
  const missing = [
    apiKeyPresent ? null : 'RESEND_API_KEY',
    fromPresent ? null : 'RESEND_FROM or RESEND_FROM_EMAIL',
    domainPresent ? null : 'RESEND_DOMAIN',
  ].filter(Boolean);
  const ownerActionRequired = missing.length > 0 || !domainCheck.configured_domain_verified;
  return {
    provider: 'resend',
    fields: {
      api_key: fieldStatus(secrets.apiKey),
      from: fieldStatus(secrets.from),
      from_email: fieldStatus(secrets.fromEmail),
      domain: fieldStatus(secrets.domain),
      rabbi_api_key: fieldStatus(secrets.rabbiApiKey),
      rabbi_domain: fieldStatus(secrets.rabbiDomain),
    },
    domain_read_check: domainCheck,
    missing,
    readiness_state: readinessStates({
      credentialsPresent: apiKeyPresent,
      authVerifiedReadOnly: domainCheck.status === 'domains_read',
      ownerActionRequired,
      liveWriteNotTested: true,
      productionReady: false,
    }),
  };
}

function buildStripeCheck(repoRoot, secrets, options = {}) {
  const config = getStripeConfig({ repoRoot, keyholderRoots: options.keyholderRoots, secretsRoot: options.secretsRoot });
  const readiness = getStripeReadiness({ config });
  const credentialsPresent = Boolean(config.configured);
  return {
    provider: 'stripe',
    fields: {
      secret_key: fieldStatus(secrets.secretKey),
      rabbi_secret_key: fieldStatus(secrets.rabbiSecretKey),
    },
    readiness: {
      configured: readiness.configured,
      status: readiness.status,
      mode: readiness.mode,
      accountOwner: readiness.accountOwner,
      providerAccountConfigured: Boolean(readiness.providerAccount),
      safeActions: readiness.safeActions,
      blockedActions: readiness.blockedActions,
      blocker_count: readiness.blockers.length,
    },
    readiness_state: readinessStates({
      credentialsPresent,
      authVerifiedReadOnly: false,
      ownerActionRequired: readiness.blockers.length > 0,
      liveWriteNotTested: true,
      productionReady: false,
    }),
  };
}

function buildGreenInvoiceCheck(secrets) {
  const secretPresent = Boolean(secrets.secret.value || secrets.rabbiSecret.value);
  const apiKeyPresent = Boolean(secrets.rabbiApiKey.value);
  const credentialsPresent = secretPresent || apiKeyPresent;
  const missing = [
    secretPresent ? null : 'GREEN_INVOICE_SECRET or RABBI_GREEN_INVOICE_SECRET',
    apiKeyPresent ? null : 'RABBI_GREEN_INVOICE_API_KEY',
  ].filter(Boolean);
  return {
    provider: 'green_invoice',
    fields: {
      secret: fieldStatus(secrets.secret),
      rabbi_secret: fieldStatus(secrets.rabbiSecret),
      rabbi_api_key: fieldStatus(secrets.rabbiApiKey),
    },
    missing,
    readiness: {
      configured: credentialsPresent,
      status: credentialsPresent ? 'credentials_present' : 'not_configured',
      auth_verified_read_only: false,
      blockedActions: ['invoice_create', 'payment_collect', 'live_payment'],
    },
    readiness_state: readinessStates({
      credentialsPresent,
      authVerifiedReadOnly: false,
      ownerActionRequired: true,
      liveWriteNotTested: true,
      productionReady: false,
    }),
  };
}

export async function buildProviderCredentialDiagnostics(options = {}) {
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const secrets = loadProviderSecrets(repoRoot, options);
  const network = options.network !== false;
  const zoomTokenCheck = await testZoomToken(secrets.zoom, { fetchImpl: options.fetchImpl, network });
  const vimeoClientCheck = await testVimeoClientCredentials(secrets.vimeo, { fetchImpl: options.fetchImpl, network });
  const resendDomainCheck = await testResendDomains(secrets.resend, {
    repoRoot,
    fetchImpl: options.fetchImpl,
    network,
    keyholderRoots: options.keyholderRoots,
    secretsRoot: options.secretsRoot,
  });
  const report = {
    generated_at: new Date().toISOString(),
    repo_root: repoRoot,
    external_write_performed: false,
    secret_values_printed: false,
    checks: {
      zoom: {
        provider: 'zoom',
        fields: {
          account_id: fieldStatus(secrets.zoom.accountId),
          client_id: fieldStatus(secrets.zoom.clientId),
          client_secret: fieldStatus(secrets.zoom.clientSecret),
        },
        token_check: zoomTokenCheck,
        readiness_state: readinessStates({
          credentialsPresent: Boolean(secrets.zoom.accountId.value && secrets.zoom.clientId.value && secrets.zoom.clientSecret.value),
          authVerifiedReadOnly: zoomTokenCheck.status === 'token_ready',
          ownerActionRequired: zoomTokenCheck.status !== 'token_ready',
          liveWriteNotTested: true,
          productionReady: false,
        }),
      },
      vimeo: {
        provider: 'vimeo',
        fields: {
          client_id: fieldStatus(secrets.vimeo.clientId),
          client_secret: fieldStatus(secrets.vimeo.clientSecret),
          access_token: fieldStatus(secrets.vimeo.accessToken),
        },
        client_credentials_check: vimeoClientCheck,
        readiness_state: readinessStates({
          credentialsPresent: Boolean(secrets.vimeo.clientId.value && secrets.vimeo.clientSecret.value),
          authVerifiedReadOnly: vimeoClientCheck.status === 'client_credentials_ready',
          ownerActionRequired: !secrets.vimeo.accessToken.value,
          liveWriteNotTested: true,
          productionReady: false,
        }),
      },
      resend: buildResendCheck(secrets.resend, resendDomainCheck),
      stripe: buildStripeCheck(repoRoot, secrets.stripe, options),
      green_invoice: buildGreenInvoiceCheck(secrets.greenInvoice),
    },
  };
  return report;
}

function renderMarkdown(report) {
  const lines = [
    `# Provider Credential Diagnostics - ${report.generated_at}`,
    '',
    'This report never includes secret values or access tokens.',
    '',
    `External write performed: ${report.external_write_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
  ];

  for (const [key, check] of Object.entries(report.checks)) {
    lines.push(`## ${key}`);
    for (const [fieldName, field] of Object.entries(check.fields)) {
      lines.push(`- ${fieldName}: configured=${field.configured}; source=${field.source}; length=${field.length}; fingerprint=${field.fingerprint || 'none'}`);
    }
    lines.push(`- readiness_state: ${(check.readiness_state || []).join(', ') || 'n/a'}`);
    const networkCheck = check.token_check || check.client_credentials_check || check.domain_read_check || check.readiness;
    lines.push(`- auth_check_status: ${networkCheck.status}`);
    lines.push(`- auth_check_ok: ${networkCheck.ok ?? networkCheck.configured ?? 'n/a'}`);
    lines.push(`- http_status: ${networkCheck.http_status || 'n/a'}`);
    lines.push(`- scope_count: ${networkCheck.scope_count ?? 'n/a'}`);
    lines.push(`- returned_token_fingerprint: ${networkCheck.token_fingerprint || 'none'}`);
    lines.push(`- returned_token_stored: ${Boolean(networkCheck.token_stored)}`);
    if (networkCheck.domain_count !== undefined) lines.push(`- domain_count: ${networkCheck.domain_count}`);
    if (networkCheck.configured_domain_present !== undefined) lines.push(`- configured_domain_present: ${networkCheck.configured_domain_present}`);
    if (networkCheck.configured_domain_verified !== undefined) lines.push(`- configured_domain_verified: ${networkCheck.configured_domain_verified}`);
    const missing = networkCheck.missing || check.missing;
    if (missing?.length) lines.push(`- missing: ${missing.join(', ')}`);
    if (check.readiness?.blockedActions?.length) lines.push(`- blocked_actions: ${check.readiness.blockedActions.join(', ')}`);
    if (check.readiness?.blocker_count !== undefined) lines.push(`- blocker_count: ${check.readiness.blocker_count}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function writeReports(report, repoRoot) {
  const reportDir = path.join(repoRoot, 'ops', 'qa-runs');
  fs.mkdirSync(reportDir, { recursive: true });
  const baseName = `${timestampSlug()}-provider-credential-diagnostics`;
  const jsonPath = path.join(reportDir, `${baseName}.json`);
  const mdPath = path.join(reportDir, `${baseName}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return { jsonPath, mdPath };
}

function parseArgs(argv) {
  const args = { json: false, noWrite: false, network: true };
  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
    else if (arg === '--no-network') args.network = false;
  }
  return args;
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const report = await buildProviderCredentialDiagnostics({
    repoRoot,
    fetchImpl: options.fetchImpl,
    network: args.network,
  });
  const paths = args.noWrite ? null : writeReports(report, repoRoot);

  if (args.json) {
    console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  } else {
    console.log(renderMarkdown(report));
    if (paths) {
      console.log(`Reports written: ${path.relative(repoRoot, paths.mdPath)} and ${path.relative(repoRoot, paths.jsonPath)}`);
    }
  }
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`Provider credential diagnostics failed: ${error.message}`);
    process.exitCode = 1;
  });
}
