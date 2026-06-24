import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadSecret, safeSecretSourceLabel, usableSecretValue } = require('../../src/lib/integrations/secret-loader');

export const INTEGRATION_READINESS_FIELDS = [
  ['OPENAI_API_KEY', ['openai-api-key.txt', 'OPENAI_API_KEY.txt']],
  ['VIMEO_CLIENT_ID', ['vimeo-client-id.txt', 'VIMEO_CLIENT_ID.txt', 'vimeo.txt']],
  ['VIMEO_CLIENT_SECRET', ['vimeo-client-secret.txt', 'VIMEO_CLIENT_SECRET.txt', 'vimeo.txt']],
  ['VIMEO_ACCESS_TOKEN', ['vimeo-access-token.txt', 'VIMEO_ACCESS_TOKEN.txt', 'vimeo.txt']],
  ['RESEND_API_KEY', ['resend-api-key.txt', 'RESEND_API_KEY.txt', 'resend.txt']],
  ['RESEND_FROM', ['resend-from.txt', 'RESEND_FROM.txt', 'resend.txt']],
  ['RESEND_FROM_EMAIL', ['resend-from-email.txt', 'RESEND_FROM_EMAIL.txt', 'resend.txt']],
  ['RESEND_DOMAIN', ['resend-domain.txt', 'RESEND_DOMAIN.txt', 'resend.txt']],
  ['RESEND_WEBHOOK_SECRET', ['resend-webhook-secret.txt', 'RESEND_WEBHOOK_SECRET.txt']],
  ['STRIPE_SECRET_KEY', ['stripe-secret-key.txt', 'STRIPE_SECRET_KEY.txt', 'stripe.txt']],
  ['RABBI_STRIPE_SECRET_KEY', ['rabbi-stripe-secret-key.txt', 'RABBI_STRIPE_SECRET_KEY.txt', 'stripe.txt']],
  ['RABBI_STRIPE_MODE', ['rabbi-stripe-mode.txt', 'RABBI_STRIPE_MODE.txt', 'stripe-mode.txt']],
  ['TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER', ['telegram-rabbi-elie-scheller-bot-token.txt', 'TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER.txt']]
];

const INTEGRATION_GROUPS = [
  {
    integration: 'openai',
    label: 'OpenAI transcription/parser',
    fields: ['OPENAI_API_KEY']
  },
  {
    integration: 'vimeo',
    label: 'Vimeo video/member library',
    fields: ['VIMEO_CLIENT_ID', 'VIMEO_CLIENT_SECRET', 'VIMEO_ACCESS_TOKEN']
  },
  {
    integration: 'resend',
    label: 'Resend email sending/domain',
    fields: ['RESEND_API_KEY', 'RESEND_FROM', 'RESEND_FROM_EMAIL', 'RESEND_DOMAIN', 'RESEND_WEBHOOK_SECRET']
  },
  {
    integration: 'stripe',
    label: 'Stripe payment mode',
    fields: ['STRIPE_SECRET_KEY', 'RABBI_STRIPE_SECRET_KEY', 'RABBI_STRIPE_MODE']
  },
  {
    integration: 'rabbi_telegram',
    label: 'Rabbi Telegram worker',
    fields: ['TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER'],
    blockers: ['Worker deployment state is not verified by local readiness scanning.']
  }
];

function defaultNowIso() {
  return new Date().toISOString();
}

function loadReadinessField([key, fileNames], context = {}) {
  const loadSecretFn = context.loadSecretFn || loadSecret;
  const loaded = loadSecretFn({ envName: key, fileNames, repoRoot: context.repoRoot || process.cwd() });
  const configured = Boolean(loaded?.configured && usableSecretValue(loaded?.value));
  return {
    key,
    configured,
    source: configured ? safeSecretSourceLabel(loaded) : loaded?.configured ? 'placeholder' : 'not configured'
  };
}

export function collectIntegrationReadinessFields(context = {}) {
  return INTEGRATION_READINESS_FIELDS.map((field) => loadReadinessField(field, context));
}

function readinessFieldByKey(fields = [], key) {
  return fields.find((field) => field.key === key) || {
    key,
    configured: false,
    source: 'not configured'
  };
}

function summarizeIntegrationGroup(fields, spec) {
  const groupFields = spec.fields.map((key) => {
    const field = readinessFieldByKey(fields, key);
    const configured = Boolean(field.configured);
    return {
      name: field.key,
      configured,
      source: configured ? field.source : field.source === 'placeholder' ? 'placeholder' : 'not configured'
    };
  });
  const missing = groupFields.filter((field) => !field.configured).map((field) => field.name);
  const blockers = [
    ...missing.map((name) => `${name} is not configured.`),
    ...(spec.blockers || [])
  ];
  return {
    integration: spec.integration,
    label: spec.label,
    ready: blockers.length === 0,
    fields: groupFields,
    blockers
  };
}

export function buildIntegrationReadinessSummary(context = {}) {
  const fields = Array.isArray(context.fields) ? context.fields : collectIntegrationReadinessFields(context);
  return {
    generated_at: context.generatedAt || defaultNowIso(),
    variable_state_only: true,
    secret_values_printed: false,
    external_read_performed: false,
    groups: INTEGRATION_GROUPS.map((group) => summarizeIntegrationGroup(fields, group))
  };
}

export function integrationReadinessBlockers(readiness = {}) {
  const groups = Array.isArray(readiness.groups) ? readiness.groups : [];
  return groups
    .filter((group) => !group.ready)
    .map((group) => `${group.label} readiness is blocked: ${group.blockers.join(' ')}`);
}
