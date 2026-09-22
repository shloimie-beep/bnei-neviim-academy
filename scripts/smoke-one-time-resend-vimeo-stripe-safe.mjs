#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const {
  getResendConfig,
  getResendReadiness,
  listResendDomains,
} = require('../src/lib/integrations/resend-client');
const {
  attachVimeoUrl,
  createVimeoUploadIntent,
  getVideoHostingConfig,
  listRecentVimeoVideos,
  listVimeoFolders,
  parseVimeoUrl,
  testVimeoAuth,
} = require('../src/lib/integrations/vimeo');
const {
  buildCheckoutPreview,
  buildOneTimeStripeLocalBetaPlan,
  getStripeConfig,
  getStripeReadiness,
  safeStripeError,
} = require('../src/lib/integrations/stripe');
const {
  redactSecrets,
} = require('../src/lib/integrations/secret-loader');

const Stripe = require('stripe');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_VIMEO_URLS = [
  {
    label: 'one_time_public_funnel_hero',
    url: 'https://player.vimeo.com/video/1158542993?h=daa31d3417',
  },
  {
    label: 'one_time_member_lesson_embed',
    url: 'https://player.vimeo.com/video/1178363755?h=282ea2577c',
  },
];

function timestampSlug(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function countBy(rows = [], key) {
  return rows.reduce((acc, row) => {
    const value = String(row?.[key] || 'unknown');
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function safeError(error, secrets = []) {
  return redactSecrets({
    message: String(error?.message || error || 'Integration smoke failed').slice(0, 600),
    status: error?.status || error?.statusCode || null,
    code: error?.code || null,
    blocker: String(error?.blocker || '').slice(0, 600) || null,
  }, secrets);
}

function redactExactSecretValues(value, secrets = []) {
  let text = JSON.stringify(value);
  for (const secret of secrets) {
    const normalized = String(secret || '').trim();
    if (normalized) text = text.split(normalized).join('[redacted]');
  }
  text = text.replace(/Authorization:\s*Bearer\s+[A-Za-z0-9._-]+/gi, 'Authorization: Bearer [redacted]');
  text = text.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
  text = text.replace(/\b(?:sk|rk|re|whsec)_(?:live|test)?_?[A-Za-z0-9._-]{12,}\b/g, '[redacted]');
  text = text.replace(/\b[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/g, '[redacted]');
  return JSON.parse(text);
}

async function fetchWithTimeout(url, options = {}) {
  if (typeof fetch !== 'function') {
    const error = new Error('global fetch is not available in this Node runtime');
    error.status = 503;
    throw error;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);
  try {
    return await fetch(url, {
      redirect: 'follow',
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'BNA-One-Time-Safe-Smoke/1.0',
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw_present: Boolean(text) };
  }
}

function safeDomainSummary(domains = [], configuredDomain = '') {
  const wanted = String(configuredDomain || '').toLowerCase();
  return {
    count: domains.length,
    statuses: countBy(domains, 'status'),
    regions: countBy(domains, 'region'),
    configured_domain_present: Boolean(wanted && domains.some((domain) => String(domain.name || '').toLowerCase() === wanted)),
    configured_domain_status: domains.find((domain) => String(domain.name || '').toLowerCase() === wanted)?.status || null,
    record_count_total: domains.reduce((sum, domain) => sum + (Array.isArray(domain.records) ? domain.records.length : 0), 0),
  };
}

async function runResendSmoke() {
  const config = getResendConfig({ repoRoot });
  const result = {
    provider: 'resend',
    api_key_configured: Boolean(config.apiKey),
    account_owner: config.accountOwner || 'unknown',
    provider_account_configured: Boolean(config.providerAccount),
    from_configured: Boolean(config.fromEmail),
    domain_configured: Boolean(config.domain),
    read_only_domain_check_attempted: false,
    send_attempted: false,
    external_write_performed: false,
    connection: null,
    readiness: null,
    blocker: null,
  };

  if (!config.apiKey) {
    result.blocker = 'Resend API key is not configured.';
    return { result, secrets: [] };
  }

  try {
    result.read_only_domain_check_attempted = true;
    const domains = await listResendDomains({ config });
    result.connection = {
      ok: true,
      endpoint: 'GET /domains',
      domains: safeDomainSummary(domains, config.domain),
    };
  } catch (error) {
    result.connection = {
      ok: false,
      endpoint: 'GET /domains',
      error: safeError(error, [config.apiKey]),
    };
  }

  try {
    const readiness = await getResendReadiness({ config });
    result.readiness = {
      configured: readiness.configured,
      connected: readiness.connected,
      domain_verified: readiness.domain_verified,
      send_allowed: readiness.send_allowed,
      fallback_approved: readiness.fallback_approved,
      domain_status: readiness.domain_status || null,
      blocker: readiness.blocker || null,
      domains: safeDomainSummary(readiness.domains || [], config.domain),
    };
    result.blocker = readiness.send_allowed
      ? 'Send path is configured, but this smoke intentionally does not call Resend /emails without an approved target recipient.'
      : readiness.blocker || null;
  } catch (error) {
    result.readiness = {
      configured: true,
      connected: false,
      error: safeError(error, [config.apiKey]),
    };
    result.blocker = result.readiness.error.blocker || result.readiness.error.message;
  }

  return { result, secrets: [config.apiKey].filter(Boolean) };
}

async function probeVimeoEmbed(entry) {
  const parsed = parseVimeoUrl(entry.url);
  const result = {
    label: entry.label,
    parsed_ok: parsed.ok,
    vimeo_id: parsed.id || '',
    player_url_status: null,
    oembed_status: null,
    external_write_performed: false,
  };

  if (!parsed.ok) {
    result.blocker = parsed.error;
    return result;
  }

  try {
    const playerResponse = await fetchWithTimeout(entry.url, {
      method: 'GET',
      timeoutMs: 15000,
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
    const text = await playerResponse.text();
    result.player_url_status = {
      ok: playerResponse.ok,
      status: playerResponse.status,
      contains_vimeo_id: text.includes(parsed.id),
      contains_player_marker: /vimeo|player/i.test(text.slice(0, 50000)),
    };
  } catch (error) {
    result.player_url_status = {
      ok: false,
      error: safeError(error),
    };
  }

  try {
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(entry.url)}`;
    const response = await fetchWithTimeout(oembedUrl, {
      method: 'GET',
      timeoutMs: 15000,
      headers: { Accept: 'application/json' },
    });
    const data = await readJsonResponse(response);
    result.oembed_status = {
      ok: response.ok,
      status: response.status,
      provider_name: data.provider_name || null,
      title_present: Boolean(data.title),
      duration_seconds: Number.isFinite(Number(data.duration)) ? Number(data.duration) : null,
      thumbnail_present: Boolean(data.thumbnail_url),
      html_present: Boolean(data.html),
    };
  } catch (error) {
    result.oembed_status = {
      ok: false,
      error: safeError(error),
    };
  }

  return result;
}

async function runVimeoSmoke() {
  const config = getVideoHostingConfig({ repoRoot });
  const secretValues = [config.vimeoToken, config.vimeoClientSecret].filter(Boolean);
  const result = {
    provider: 'vimeo',
    selected_provider: config.providerDecision || null,
    access_token_configured: Boolean(config.vimeoToken),
    client_id_configured: Boolean(config.vimeoClientId),
    client_secret_configured: Boolean(config.vimeoClientSecret),
    automated_upload_enabled: Boolean(config.automatedUploadEnabled),
    auth_read_only_check: null,
    folder_read_only_check: null,
    recent_videos_read_only_check: null,
    public_embed_checks: [],
    manual_attach_preview: null,
    upload_intent_preview: null,
    upload_attempted: false,
    external_write_performed: false,
    blocker: null,
  };

  if (config.vimeoToken) {
    result.auth_read_only_check = await testVimeoAuth({ token: config.vimeoToken });
    result.folder_read_only_check = await listVimeoFolders({ token: config.vimeoToken });
    result.recent_videos_read_only_check = await listRecentVimeoVideos({ token: config.vimeoToken });
  } else {
    result.auth_read_only_check = {
      provider: 'vimeo',
      ok: false,
      status: 'needs_api_key',
      external_write_performed: false,
      blocker: 'Vimeo access token is not configured; skipping authenticated /me, folder, and recent-video API checks.',
    };
    result.blocker = result.auth_read_only_check.blocker;
  }

  result.public_embed_checks = await Promise.all(DEFAULT_VIMEO_URLS.map(probeVimeoEmbed));
  result.manual_attach_preview = attachVimeoUrl({
    content_id: 'one-time-safe-smoke-preview',
    vimeo_url: DEFAULT_VIMEO_URLS[0].url,
  });
  result.upload_intent_preview = createVimeoUploadIntent({
    title: 'One Time safe smoke upload preview',
  }, {
    token: config.vimeoToken,
    uploadAccess: false,
    accountOwner: config.accountOwner,
  });

  return { result, secrets: secretValues };
}

function summarizeStripeAccount(account = {}) {
  return {
    retrieved: Boolean(account?.id),
    livemode: account?.livemode ?? null,
    charges_enabled: account?.charges_enabled ?? null,
    payouts_enabled: account?.payouts_enabled ?? null,
    details_submitted: account?.details_submitted ?? null,
    country: account?.country || null,
    default_currency: account?.default_currency || null,
  };
}

async function runStripeSmoke() {
  const config = getStripeConfig({ repoRoot });
  const result = {
    provider: 'stripe',
    configured: Boolean(config.secretKey),
    mode: config.mode,
    source_type: config.source_type || null,
    account_owner: config.accountOwner || 'unknown',
    provider_account_configured: Boolean(config.providerAccount),
    readiness: getStripeReadiness({ config }),
    test_mode_api_check: null,
    checkout_preview: null,
    local_beta_plan: null,
    checkout_session_created: false,
    payment_intent_created: false,
    charge_created: false,
    external_write_performed: false,
    blocker: null,
  };

  if (!config.secretKey) {
    result.blocker = 'Stripe secret key is not configured.';
  } else if (config.mode === 'live') {
    result.test_mode_api_check = {
      skipped: true,
      reason: 'stripe_live_key_blocked_for_no_charge_sandbox_smoke',
    };
    result.blocker = 'Configured Stripe key is live mode. This smoke did not call Stripe API because the user requested sandbox/no-charge testing.';
  } else if (config.mode === 'test') {
    try {
      const stripe = new Stripe(config.secretKey);
      const account = await stripe.accounts.retrieve();
      result.test_mode_api_check = {
        ok: true,
        endpoint: 'GET /v1/account',
        account: summarizeStripeAccount(account),
      };
      if (account?.livemode === true) {
        result.blocker = 'Stripe returned livemode=true during a sandbox smoke; treating as blocked.';
      }
    } catch (error) {
      result.test_mode_api_check = {
        ok: false,
        endpoint: 'GET /v1/account',
        error: safeStripeError(error, config),
      };
      result.blocker = result.test_mode_api_check.error.blocker || result.test_mode_api_check.error.message;
    }
  } else {
    result.test_mode_api_check = {
      skipped: true,
      reason: 'stripe_secret_mode_unknown',
    };
    result.blocker = 'Stripe secret mode is unknown; sandbox API check was skipped.';
  }

  result.checkout_preview = buildCheckoutPreview({
    title: 'One Time Mishnah membership preview',
    currency: 'usd',
    amount: 6700,
    success_url: 'https://example.invalid/one-time/success',
    cancel_url: 'https://example.invalid/one-time/cancel',
  }, { config });
  result.local_beta_plan = buildOneTimeStripeLocalBetaPlan({}, { config });

  return { result, secrets: [config.secretKey].filter(Boolean) };
}

function collectGuardrailViolations(value, pathParts = [], violations = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectGuardrailViolations(item, [...pathParts, String(index)], violations));
    return violations;
  }
  if (!value || typeof value !== 'object') return violations;
  for (const [key, item] of Object.entries(value)) {
    const currentPath = [...pathParts, key];
    if (
      item === true
      && /^(external_write_performed|send_attempted|upload_attempted|checkout_session_created|payment_intent_created|charge_created)$/i.test(key)
    ) {
      violations.push(currentPath.join('.'));
    }
    collectGuardrailViolations(item, currentPath, violations);
  }
  return violations;
}

function renderMarkdown(report) {
  const guardrails = report.guardrails || {};
  const resend = report.results?.resend || {};
  const vimeo = report.results?.vimeo || {};
  const stripe = report.results?.stripe || {};
  const embedOk = (vimeo.public_embed_checks || []).filter((item) => item.player_url_status?.ok).length;

  return [
    `# One Time Resend/Vimeo/Stripe Safe Smoke - ${report.generated_at}`,
    '',
    'This smoke performs only no-send, no-upload, no-charge checks. It does not call Resend email send, Vimeo upload/write, or Stripe checkout/payment mutation APIs.',
    '',
    '## Guardrails',
    '',
    `- external_write_performed: ${guardrails.external_write_performed}`,
    `- resend_send_attempted: ${guardrails.resend_send_attempted}`,
    `- vimeo_upload_attempted: ${guardrails.vimeo_upload_attempted}`,
    `- stripe_charge_attempted: ${guardrails.stripe_charge_attempted}`,
    `- stripe_checkout_session_created: ${guardrails.stripe_checkout_session_created}`,
    '',
    '## Resend',
    '',
    `- api_key_configured: ${resend.api_key_configured}`,
    `- read_only_domain_check_attempted: ${resend.read_only_domain_check_attempted}`,
    `- domain_check_ok: ${resend.connection?.ok ?? false}`,
    `- domain_count: ${resend.connection?.domains?.count ?? resend.readiness?.domains?.count ?? 0}`,
    `- from_configured: ${resend.from_configured}`,
    `- domain_configured: ${resend.domain_configured}`,
    `- send_allowed: ${resend.readiness?.send_allowed ?? false}`,
    `- blocker: ${resend.blocker || 'none'}`,
    '',
    '## Vimeo',
    '',
    `- client_id_configured: ${vimeo.client_id_configured}`,
    `- client_secret_configured: ${vimeo.client_secret_configured}`,
    `- access_token_configured: ${vimeo.access_token_configured}`,
    `- authenticated_api_status: ${vimeo.auth_read_only_check?.status || 'not_run'}`,
    `- public_embed_player_ok_count: ${embedOk}/${(vimeo.public_embed_checks || []).length}`,
    `- manual_attach_preview_ok: ${vimeo.manual_attach_preview?.ok ?? false}`,
    `- upload_intent_status: ${vimeo.upload_intent_preview?.status || 'not_run'}`,
    `- blocker: ${vimeo.blocker || 'none'}`,
    '',
    '## Stripe',
    '',
    `- configured: ${stripe.configured}`,
    `- mode: ${stripe.mode}`,
    `- test_mode_api_check: ${stripe.test_mode_api_check?.ok === true ? 'ok' : stripe.test_mode_api_check?.skipped ? `skipped:${stripe.test_mode_api_check.reason}` : 'not_ok'}`,
    `- checkout_preview_only: ${stripe.checkout_preview?.preview_only ?? false}`,
    `- local_beta_external_write_performed: ${stripe.local_beta_plan?.external_write_performed ?? false}`,
    `- live_charge_enabled: ${stripe.local_beta_plan?.actions?.live_charge_enabled ?? false}`,
    `- blocker: ${stripe.blocker || 'none'}`,
    '',
  ].join('\n');
}

function writeReport(report) {
  const reportDir = path.join(repoRoot, 'ops', 'one-time-mishnah', 'integration-smokes');
  fs.mkdirSync(reportDir, { recursive: true });
  const baseName = `${timestampSlug()}-resend-vimeo-stripe-safe-smoke`;
  const jsonPath = path.join(reportDir, `${baseName}.json`);
  const mdPath = path.join(reportDir, `${baseName}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${renderMarkdown(report)}\n`);
  return { jsonPath, mdPath };
}

export async function main() {
  const [resendRun, vimeoRun, stripeRun] = await Promise.all([
    runResendSmoke(),
    runVimeoSmoke(),
    runStripeSmoke(),
  ]);
  const resend = resendRun.result;
  const vimeo = vimeoRun.result;
  const stripe = stripeRun.result;
  const report = {
    generated_at: new Date().toISOString(),
    scope: 'one_time_resend_vimeo_stripe_safe_smoke',
    guardrails: {
      external_write_performed: false,
      resend_send_attempted: Boolean(resend.send_attempted),
      vimeo_upload_attempted: Boolean(vimeo.upload_attempted),
      stripe_charge_attempted: Boolean(stripe.charge_created),
      stripe_checkout_session_created: Boolean(stripe.checkout_session_created),
      stripe_payment_intent_created: Boolean(stripe.payment_intent_created),
    },
    results: {
      resend,
      vimeo,
      stripe,
    },
  };
  const safeReport = redactExactSecretValues(report, [
    ...(resendRun.secrets || []),
    ...(vimeoRun.secrets || []),
    ...(stripeRun.secrets || []),
  ]);
  const violations = collectGuardrailViolations(safeReport);
  if (violations.length) {
    safeReport.guardrails.external_write_performed = true;
    safeReport.guardrail_violations = violations;
  }
  const paths = writeReport(safeReport);
  console.log(renderMarkdown(safeReport));
  console.log(`Reports written: ${path.relative(repoRoot, paths.mdPath)} and ${path.relative(repoRoot, paths.jsonPath)}`);
  if (violations.length) {
    throw new Error(`Safe smoke guardrail violation: ${violations.join(', ')}`);
  }
  return { report: safeReport, paths };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(`Safe smoke failed: ${error.message}`);
    process.exitCode = 1;
  });
}
