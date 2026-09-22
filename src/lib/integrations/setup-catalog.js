const APPROVED_SECRET_STORE = [
  'Local keyholder folder: C:\\Users\\User\\BNA-Keyholder',
  'Local development fallback: .secrets/ files, never tracked',
  'Deployed runtime: Railway Variables on the exact service/worker',
];

const STATUS_DEFINITIONS = {
  already_configured: {
    label: 'Already configured',
    tone: 'ready',
    color: '#1b7f5f',
    meaning: 'Required non-secret target and secret references are present; live effects may still require approval.',
  },
  available_with_current_keys: {
    label: 'Available with current keys',
    tone: 'ready',
    color: '#1b7f5f',
    meaning: 'The current environment appears to have the required key names available for a read-only or preview validation.',
  },
  mock_tested_only: {
    label: 'Mock-tested only',
    tone: 'preview',
    color: '#5a6fd8',
    meaning: 'Local contract or mocked validation exists; no real provider readback has been proven.',
  },
  sandbox_test_only: {
    label: 'Sandbox/test-only',
    tone: 'test',
    color: '#7c5c16',
    meaning: 'Only test-mode or sandbox behavior is allowed; live mode is not accepted.',
  },
  preview_only: {
    label: 'Preview-only',
    tone: 'preview',
    color: '#5a6fd8',
    meaning: 'The app can build local previews or dry-run payloads without provider writes.',
  },
  missing_credential: {
    label: 'Missing credential',
    tone: 'missing',
    color: '#a23b3b',
    meaning: 'A required server-side token, key, OAuth secret, refresh token, or webhook secret is missing.',
  },
  invalid_credential: {
    label: 'Invalid credential',
    tone: 'danger',
    color: '#8f2f51',
    meaning: 'A provider rejected the configured credential or account context.',
  },
  missing_account_permission: {
    label: 'Missing account permission',
    tone: 'permission',
    color: '#9b5b13',
    meaning: 'The account or token exists but lacks the required permission, role, scope, or repo access.',
  },
  missing_target: {
    label: 'Missing target',
    tone: 'target',
    color: '#8b6420',
    meaning: 'A non-secret destination such as folder ID, channel ID, product ID, or worker process target is missing.',
  },
  owner_approval_required: {
    label: 'Owner approval required',
    tone: 'approval',
    color: '#804c9b',
    meaning: 'The next step changes provider state or money/access and must be approved by the account owner.',
  },
  ready_for_live: {
    label: 'Ready for live',
    tone: 'ready',
    color: '#1b7f5f',
    meaning: 'Sandbox, readback, rollback, and owner approvals are complete; a live smoke remains required.',
  },
  live: {
    label: 'Live',
    tone: 'live',
    color: '#127a40',
    meaning: 'The integration is deployed, smoke-tested, and accepted for production use.',
  },
};

const OWNER_PAGE = '/integration-setup.html';
const OPERATIONS_READINESS_PAGE = '/operations?view=integrations&section=readiness';
const KEYHOLDER_PAGE = '/operations?view=admin&section=operator_setup';
const RABBI_WORKSPACE_PAGE = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class';

function hasValue(env, name) {
  const value = String((env || {})[name] || '').trim();
  if (!value) return false;
  if (/^(none|null|undefined|not configured|missing|todo|tbd|n\/a|na|-|_)$/i.test(value)) return false;
  if (/^<[^>]+>$/.test(value) || /^\$\{[^}]+}$/.test(value)) return false;
  if (/your[-_\s]?(api[-_\s]?key|token|secret)|replace[-_\s]?me|placeholder/i.test(value)) return false;
  return true;
}

function anyConfigured(env, names = []) {
  return names.some((name) => hasValue(env, name));
}

function allConfigured(env, names = []) {
  return names.length > 0 && names.every((name) => hasValue(env, name));
}

function secretStore() {
  return APPROVED_SECRET_STORE.slice();
}

function pageAnchor(id) {
  return `${OWNER_PAGE}#${id}`;
}

function docsPath(id) {
  return `docs/operator-walkthroughs/integrations/${id}.md`;
}

function baseCard({
  id,
  name,
  purpose,
  defaultStatus,
  configuredStatus = 'available_with_current_keys',
  reason,
  configuredReason,
  nextAction,
  configuredNextAction,
  actor,
  internalPath = OPERATIONS_READINESS_PAGE,
  externalUrl,
  externalLabel,
  docsUrl = '',
  nonSecretIdentifiers = [],
  secretVariables = [],
  targetVariables = [],
  validationCommand,
  validationEndpoint = '',
  expectedResult,
  externalEffects,
  liveAcceptanceCriteria,
  sourceFiles = [],
  statusResolver,
}) {
  return {
    id,
    name,
    purpose,
    defaultStatus,
    configuredStatus,
    reason,
    configuredReason: configuredReason || reason,
    nextAction,
    configuredNextAction: configuredNextAction || nextAction,
    actor,
    internalPageLink: {
      label: 'Open setup page',
      href: pageAnchor(id),
      operationsHref: internalPath,
    },
    externalAccountLink: {
      label: externalLabel || 'Open provider dashboard',
      href: externalUrl,
      docsHref: docsUrl,
    },
    requiredNonSecretIdentifiers: nonSecretIdentifiers,
    secretVariables,
    targetVariables,
    approvedSecretStore: secretStore(),
    validation: {
      label: 'Run validation',
      command: validationCommand,
      endpoint: validationEndpoint,
      expectedResult,
      externalEffects,
    },
    liveAcceptanceCriteria,
    walkthroughPath: docsPath(id),
    evidenceLink: docsPath(id),
    sourceFiles,
    statusResolver,
  };
}

const INTEGRATION_CARDS = [
  baseCard({
    id: 'openai-hosted-ai',
    name: 'OpenAI / Hosted AI',
    purpose: 'Default hosted Assistant path for ordinary Telegram and website helper replies, summaries, content drafting, and OpenAI-side diagnostics.',
    defaultStatus: 'missing_credential',
    reason: 'OPENAI_API_KEY is the required server-side credential. The setup center must not infer success from copied docs or mock output.',
    configuredReason: 'OPENAI_API_KEY is present by variable name; run the diagnostic to prove account, project, model, quota, and usage path.',
    nextAction: 'Open the OpenAI API keys page, create or rotate a project key, store it in the approved secret store, then run the diagnostic.',
    configuredNextAction: 'Run a real diagnostic request and record whether the response, rate limit, quota, or auth error came from OpenAI.',
    actor: 'Shloimie for account/key; Codex for validation',
    externalUrl: 'https://platform.openai.com/api-keys',
    externalLabel: 'Open OpenAI API keys',
    docsUrl: 'https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key',
    nonSecretIdentifiers: ['OPENAI_PROJECT', 'OPENAI_ORG', 'OPENAI_MODEL', 'OPENAI_RESEARCH_MODEL', 'OPENAI_BASE_URL'],
    secretVariables: ['OPENAI_API_KEY'],
    validationCommand: 'npm run openai:diagnose',
    validationEndpoint: '/api/bna/assistant/control-plane/readiness',
    expectedResult: 'A real provider readiness result or a precise auth/rate/quota error; no fake assistant response.',
    externalEffects: 'Read-only API/account check; may consume a tiny amount of API quota if a model request is run.',
    liveAcceptanceCriteria: [
      'OpenAI project key is stored only in keyholder, .secrets, or Railway Variables.',
      'Diagnostic proves the intended model path without printing the key.',
      'Telegram and website helper use the hosted provider path when selected.',
      'Rate/quota failures produce visible support evidence instead of fake answers.',
    ],
    sourceFiles: ['server.js', 'scripts/openai-key-diagnostics.mjs', 'scripts/telegram-kimi-bridge.mjs', '.env.example'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.openai === 'invalid') return 'invalid_credential';
      return hasValue(env, 'OPENAI_API_KEY') ? 'available_with_current_keys' : 'missing_credential';
    },
  }),
  baseCard({
    id: 'kimi-fallback',
    name: 'Kimi Fallback',
    purpose: 'Fallback hosted chat/content provider when OpenAI is unavailable or when temporary Kimi-primary mode is explicitly selected.',
    defaultStatus: 'missing_credential',
    reason: 'KIMI_API_KEY is missing or unproven. Kimi can be temporary provider infrastructure, but Codex remains the development owner.',
    configuredReason: 'KIMI_API_KEY is present by variable name; run a real Kimi request before relying on it for hosted chat.',
    nextAction: 'Open the Kimi API key console, create or rotate a key, store it in the approved secret store, and run one real smoke request.',
    configuredNextAction: 'Run one small real Kimi request and record the exact response or rate/quota/auth error.',
    actor: 'Shloimie for Kimi account/key; Codex for validation',
    externalUrl: 'https://platform.kimi.ai/console/api-keys',
    externalLabel: 'Open Kimi API keys',
    docsUrl: 'https://platform.kimi.ai/docs/guide/start-using-kimi-api',
    nonSecretIdentifiers: ['KIMI_MODEL', 'KIMI_BASE_URL', 'KIMI_CLI_MODEL', 'BNA_AI_PRIMARY_PROVIDER'],
    secretVariables: ['KIMI_API_KEY'],
    validationCommand: 'node scripts/kimi-chat.mjs',
    expectedResult: 'The terminal returns a real Kimi API response or a precise provider error; no canned fallback text.',
    externalEffects: 'Read-only model request; may consume provider quota.',
    liveAcceptanceCriteria: [
      'Kimi key is stored only in approved secret storage.',
      'Provider selection is explicit and visible.',
      'OpenAI fallback remains available when Kimi is temporary primary.',
      'No provider failure returns fake success copy.',
    ],
    sourceFiles: ['scripts/kimi-chat.mjs', 'scripts/telegram-kimi-bridge.mjs', '.env.example'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.kimi === 'invalid') return 'invalid_credential';
      return hasValue(env, 'KIMI_API_KEY') ? 'available_with_current_keys' : 'missing_credential';
    },
  }),
  baseCard({
    id: 'google-drive',
    name: 'Google Drive',
    purpose: 'Drive source of class recordings, briefs, content library sync, memory sync, folder selection, and guarded class-intake diagnostics.',
    defaultStatus: 'missing_credential',
    reason: 'Google OAuth client and refresh token are required for real Drive readback; folder targets are also required before class-intake recovery.',
    configuredReason: 'OAuth client and refresh token are present by variable name; folder/config target still decides what Codex can read.',
    nextAction: 'Choose the target Drive folder/file path, approve the OAuth path and scope, then run read-only Drive setup/audit.',
    configuredNextAction: 'Run read-only Drive audit and class-intake diagnostic against the approved folder or file range.',
    actor: 'Shloimie for Google account/folder/scope; Codex for read-only validation',
    externalUrl: 'https://console.cloud.google.com/apis/credentials',
    externalLabel: 'Open Google Cloud credentials',
    docsUrl: 'https://developers.google.com/workspace/drive/api/guides/api-specific-auth',
    nonSecretIdentifiers: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_REDIRECT_URI',
      'GOOGLE_SCOPES',
      'GOOGLE_DRIVE_PIPELINE_ROOT_NAME',
      'GOOGLE_DRIVE_PIPELINE_FOLDER_ID',
      'GOOGLE_DRIVE_PIPELINE_CONFIG',
    ],
    secretVariables: ['GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
    targetVariables: ['GOOGLE_DRIVE_PIPELINE_FOLDER_ID', 'GOOGLE_DRIVE_PIPELINE_CONFIG'],
    validationCommand: 'npm run drive:audit',
    validationEndpoint: '/api/bna/google/readiness',
    expectedResult: 'Read-only folder/config status, granted-scope status, and class-intake routing evidence without file mutation.',
    externalEffects: 'Read-only Google API calls only; no file write, backfill, share, delete, or permission change.',
    liveAcceptanceCriteria: [
      'Canonical folder/file path is selected and recorded.',
      'OAuth scope is the minimum approved scope for the task.',
      'Read-only validation passes without exposing private transcripts.',
      'Guarded backfill has a separate operator approval and rollback plan.',
    ],
    sourceFiles: ['scripts/google-drive-setup.mjs', 'scripts/google-drive-audit.mjs', 'scripts/sync-drive-content-library.mjs', 'server.js'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.googleDrive === 'invalid') return 'invalid_credential';
      if (allConfigured(env, ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'])) {
        return anyConfigured(env, ['GOOGLE_DRIVE_PIPELINE_FOLDER_ID', 'GOOGLE_DRIVE_PIPELINE_CONFIG'])
          ? 'available_with_current_keys'
          : 'missing_target';
      }
      return 'missing_credential';
    },
  }),
  baseCard({
    id: 'google-workspace-addons',
    name: 'Google Calendar, Classroom, Business Profile',
    purpose: 'Optional Google workspace features surfaced in Operations for calendar/classroom/business-profile readbacks and setup.',
    defaultStatus: 'missing_account_permission',
    reason: 'The default Google scope is identity-only. Calendar, Classroom, and Business Profile scopes must be deliberately added and verified.',
    configuredReason: 'One or more Google feature scopes are listed; run feature-specific read-only validation before enabling writes.',
    nextAction: 'Select exactly which Google feature is needed, add only that scope, and rerun OAuth consent/read-only validation.',
    configuredNextAction: 'Run the matching feature readback and keep write operations disabled until separately approved.',
    actor: 'Shloimie for OAuth consent/scope; Codex for read-only validation',
    externalUrl: 'https://console.cloud.google.com/auth/scopes',
    externalLabel: 'Open Google OAuth scopes',
    docsUrl: 'https://developers.google.com/workspace/guides/configure-oauth-consent',
    nonSecretIdentifiers: ['GOOGLE_SCOPES', 'GOOGLE_MAPS_API_KEY', 'GOOGLE_PLACES_API_KEY'],
    secretVariables: ['GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
    validationCommand: 'npm run drive:audit',
    expectedResult: 'Feature reports show configured scopes or a precise missing-scope reason.',
    externalEffects: 'Read-only API calls if credentials exist; no calendar/classroom/profile write.',
    liveAcceptanceCriteria: [
      'Only approved scopes are present.',
      'Feature readback succeeds for the intended account.',
      'Write actions require separate confirmation phrase and evidence.',
    ],
    sourceFiles: ['server.js', '.env.example', 'tests/google-workspace-settings-contract.test.js'],
    statusResolver: ({ env }) => {
      const scopes = String(env.GOOGLE_SCOPES || '');
      if (/calendar|classroom|business\.manage/.test(scopes)) return 'available_with_current_keys';
      return 'missing_account_permission';
    },
  }),
  baseCard({
    id: 'railway-database',
    name: 'Railway / Database',
    purpose: 'BNA web runtime, Postgres database, deployment doctor, live smoke, worker process, and environment-variable store.',
    defaultStatus: 'missing_credential',
    reason: 'DATABASE_URL and Railway project token/state are required for live database readback or deployment validation.',
    configuredReason: 'Database/Railway variable names are present; use doctor/smoke before claiming deployed readiness.',
    nextAction: 'Open Railway, confirm the exact project/service/environment, then store only required variables in Railway Variables.',
    configuredNextAction: 'Run Railway doctor and the relevant live smoke after a deployment is intentionally approved.',
    actor: 'Shloimie for Railway account/project; Codex for doctor/smoke',
    externalUrl: 'https://railway.com/dashboard',
    externalLabel: 'Open Railway dashboard',
    docsUrl: 'https://docs.railway.com/variables',
    nonSecretIdentifiers: ['RAILWAY_SERVICE_NAME', 'RAILWAY_ENVIRONMENT', 'BNA_RAILWAY_PROCESS', 'APP_URL', 'PUBLIC_BASE_URL'],
    secretVariables: ['DATABASE_URL', 'RAILWAY_TOKEN', 'RAILWAY_API_TOKEN', 'SESSION_SECRET'],
    validationCommand: 'npm run railway:doctor',
    validationEndpoint: '/api/bna/ops/queue-health',
    expectedResult: 'Railway doctor reports the selected service/environment and live smoke returns expected status.',
    externalEffects: 'Read-only Railway/app status calls; deployment is a separate explicit action.',
    liveAcceptanceCriteria: [
      'Correct Railway project, service, and environment are identified.',
      'Database readback is approved and scoped.',
      'Deployment and live smoke prove the intended commit.',
      'No production mutation is bundled into setup checks.',
    ],
    sourceFiles: ['scripts/railway-doctor.ps1', 'scripts/railway-redeploy.ps1', 'scripts/lib/live-smoke-auth.mjs', 'server.js'],
    statusResolver: ({ env }) => {
      if (hasValue(env, 'DATABASE_URL') && anyConfigured(env, ['RAILWAY_TOKEN', 'RAILWAY_API_TOKEN'])) return 'available_with_current_keys';
      if (hasValue(env, 'DATABASE_URL')) return 'already_configured';
      return 'missing_credential';
    },
  }),
  baseCard({
    id: 'stripe',
    name: 'Stripe',
    purpose: 'One Time checkout previews, sandbox billing validation, product/price decisions, webhook verification, and future live checkout.',
    defaultStatus: 'missing_credential',
    reason: 'Stripe secret key and webhook secret are not proven in this lane. Live charges are never allowed from setup checks.',
    configuredReason: 'Stripe key is present by variable name; mode and webhook secret determine whether this is sandbox-only or live-approval gated.',
    nextAction: 'Create sandbox keys and webhook secret, store them in approved secret storage, then run the no-charge sandbox smoke.',
    configuredNextAction: 'Run sandbox no-charge validation, record product/price IDs, and keep live mode locked until policy decisions are complete.',
    actor: 'Shloimie for Stripe account/policies; Codex for no-charge validation',
    externalUrl: 'https://dashboard.stripe.com/apikeys',
    externalLabel: 'Open Stripe API keys',
    docsUrl: 'https://docs.stripe.com/keys',
    nonSecretIdentifiers: ['RABBI_STRIPE_MODE', 'STRIPE_MODE', 'STRIPE_ACCOUNT_OWNER', 'STRIPE_PROVIDER_ACCOUNT', 'product_id', 'price_id'],
    secretVariables: ['STRIPE_SECRET_KEY', 'RABBI_STRIPE_SECRET_KEY', 'RABBI_STRIPE_WEBHOOK_SECRET'],
    validationCommand: 'npm run one-time:smoke:resend-vimeo-stripe',
    validationEndpoint: '/api/bna/integrations/stripe/status',
    expectedResult: 'Sandbox readiness or checkout preview evidence with external_write_performed=false and no real charge.',
    externalEffects: 'No real charge. Sandbox read/preview only unless a separate approved sandbox test creates test objects.',
    liveAcceptanceCriteria: [
      'Sandbox checkout and webhook are proven with test keys.',
      'Product/price IDs and policy decisions are recorded.',
      'Webhook secret is installed for the exact endpoint.',
      'Live mode has explicit owner approval, rollback, and live smoke.',
    ],
    sourceFiles: ['src/lib/integrations/stripe.js', 'server.js', 'scripts/smoke-one-time-resend-vimeo-stripe-safe.mjs'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.stripe === 'invalid') return 'invalid_credential';
      const hasKey = anyConfigured(env, ['RABBI_STRIPE_SECRET_KEY', 'STRIPE_SECRET_KEY']);
      const mode = String(env.RABBI_STRIPE_MODE || env.STRIPE_MODE || 'test').toLowerCase();
      if (!hasKey) return 'missing_credential';
      if (mode === 'live') return 'owner_approval_required';
      return 'sandbox_test_only';
    },
  }),
  baseCard({
    id: 'vimeo',
    name: 'Vimeo',
    purpose: 'Private video hosting, manual member-library URL attachment, future synthetic upload test, folder/privacy/playback validation.',
    defaultStatus: 'preview_only',
    reason: 'Manual Vimeo URL attachment and local upload previews exist, but real app/token/folder/upload/playback proof is not complete.',
    configuredReason: 'Vimeo credential names are present; account owner, scopes, folder, privacy, plan, and synthetic upload still need proof.',
    nextAction: 'Create/confirm the Vimeo app and token, select a test folder, approve one synthetic private upload, then run auth/folder/playback checks.',
    configuredNextAction: 'Run token auth, folder list, synthetic private upload, playback check, and rollback/unpublish proof after approval.',
    actor: 'Shloimie or Vimeo account owner; Codex for no-secret validation',
    externalUrl: 'https://developer.vimeo.com/apps',
    externalLabel: 'Open Vimeo apps',
    docsUrl: 'https://developer.vimeo.com/api/guides/start',
    nonSecretIdentifiers: ['VIMEO_ACCOUNT_ID', 'VIMEO_PLAN', 'BNA_VIDEO_HOST_PROVIDER', 'BNA_VIDEO_HOST_ACCOUNT_OWNER', 'VIMEO_FOLDER'],
    secretVariables: ['VIMEO_CLIENT_ID', 'VIMEO_CLIENT_SECRET', 'VIMEO_ACCESS_TOKEN', 'VIMEO_WEBHOOK_SECRET'],
    targetVariables: ['VIMEO_FOLDER', 'VIMEO_ALLOWED_EMBED_DOMAINS'],
    validationCommand: 'npm run owner-review:external-readiness',
    validationEndpoint: '/api/bna/integrations/vimeo/status',
    expectedResult: 'Manual URL attach and upload-intent preview pass without API upload; real token readback is separate.',
    externalEffects: 'Credential-free command has no provider effect. Real upload test creates one private synthetic Vimeo asset only after approval.',
    liveAcceptanceCriteria: [
      'App/token scopes are documented.',
      'Private test folder and allowed embed domains are selected.',
      'Synthetic upload and playback pass.',
      'Member-library publication remains first-party approval gated.',
    ],
    sourceFiles: ['src/lib/integrations/vimeo.js', 'src/lib/integrations/video-hosting.js', 'server.js'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.vimeo === 'invalid') return 'invalid_credential';
      if (hasValue(env, 'VIMEO_ACCESS_TOKEN')) {
        return anyConfigured(env, ['VIMEO_FOLDER', 'VIMEO_ALLOWED_EMBED_DOMAINS']) ? 'available_with_current_keys' : 'missing_target';
      }
      return 'preview_only';
    },
  }),
  baseCard({
    id: 'zoom',
    name: 'Zoom',
    purpose: 'Live class meeting previews, future Server-to-Server OAuth meeting creation, registrants, recordings, transcripts, attendance webhooks.',
    defaultStatus: 'preview_only',
    reason: 'Local Zoom meeting/session/attendance previews exist, but real Server-to-Server OAuth credentials, scopes, host, and approval are not proven.',
    configuredReason: 'Zoom account/app variable names are present; required meeting scopes and host permission still need readback.',
    nextAction: 'Create or confirm a Zoom Server-to-Server OAuth internal app, add meeting/user/report scopes, and store credentials server-side.',
    configuredNextAction: 'Run token/readback and meeting-preview checks; do not create meetings until owner approval is recorded.',
    actor: 'Zoom account owner/admin; Codex for validation',
    externalUrl: 'https://marketplace.zoom.us/develop/create',
    externalLabel: 'Open Zoom app creation',
    docsUrl: 'https://developers.zoom.us/docs/internal-apps/',
    nonSecretIdentifiers: ['ZOOM_ACCOUNT_ID', 'ZOOM_ACCOUNT_OWNER', 'ZOOM_HOST_USER', 'ZOOM_SCOPES'],
    secretVariables: ['ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET', 'ZOOM_WEBHOOK_SECRET'],
    validationCommand: 'node --test tests/one-time-zoom-automation.test.js tests/integrations/w4-onetime-readiness.test.js',
    validationEndpoint: '/api/bna/integrations/zoom/status',
    expectedResult: 'Preview and readiness show credential/scope status; live meeting creation remains disabled until approval.',
    externalEffects: 'Local tests perform no Zoom write. Real token/readback calls are read-only; meeting creation is a separate approved write.',
    liveAcceptanceCriteria: [
      'Server-to-Server OAuth app is installed by an owner/admin.',
      'Required scopes and host user are documented.',
      'Meeting create, registrant, webhook, and recording paths pass live smoke.',
      'Host start URLs are never exposed to students.',
    ],
    sourceFiles: ['src/lib/integrations/zoom.js', 'server.js', 'tests/one-time-zoom-automation.test.js'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.zoom === 'invalid') return 'invalid_credential';
      if (allConfigured(env, ['ZOOM_ACCOUNT_ID', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'])) {
        return /meeting:write|meeting:write:admin/.test(String(env.ZOOM_SCOPES || ''))
          ? 'available_with_current_keys'
          : 'missing_account_permission';
      }
      return 'preview_only';
    },
  }),
  baseCard({
    id: 'resend-email',
    name: 'Resend / Email',
    purpose: 'Email drafts, sender-domain readiness, DNS tasks, webhook events, and gated production sends.',
    defaultStatus: 'missing_credential',
    reason: 'RESEND_API_KEY, sender identity, domain, and webhook secret are not all proven.',
    configuredReason: 'Resend key is present by variable name; domain/from identity decides send readiness.',
    nextAction: 'Open Resend, create a sending key, add/verify the domain, copy exact DNS records, and store secrets server-side.',
    configuredNextAction: 'Run health/domain readback. Keep sends locked until DNS/domain and SEND_RESEND_EMAIL approval are present.',
    actor: 'Shloimie for account/domain/DNS; Codex for read-only validation',
    externalUrl: 'https://resend.com/api-keys',
    externalLabel: 'Open Resend API keys',
    docsUrl: 'https://resend.com/docs/dashboard/api-keys/introduction',
    nonSecretIdentifiers: ['RESEND_DOMAIN', 'RESEND_FROM', 'RESEND_FROM_EMAIL', 'RESEND_FROM_NAME', 'RESEND_REPLY_TO', 'RESEND_ACCOUNT_OWNER'],
    secretVariables: ['RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET', 'RESEND_SHLOIMIE_API_KEY', 'RESEND_RABBI_API_KEY'],
    targetVariables: ['RESEND_DOMAIN', 'RESEND_FROM_EMAIL'],
    validationCommand: 'npm run email:smoke',
    validationEndpoint: '/api/bna/integrations/resend/health',
    expectedResult: 'Provider/domain health shows connected, configured/blocked, missing domain, or invalid key with no secret values.',
    externalEffects: 'Read-only health/domain checks. Email send requires explicit SEND_RESEND_EMAIL and review state.',
    liveAcceptanceCriteria: [
      'Domain is verified or fallback approval is explicitly recorded.',
      'Webhook secret is installed for the exact endpoint.',
      'Draft and send gates pass without printing keys.',
      'A live email smoke succeeds only after exact approval.',
    ],
    sourceFiles: ['src/lib/integrations/resend-client.js', 'server.js', 'tests/communications-integrations-contract.test.js'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.resend === 'invalid') return 'invalid_credential';
      if (!hasValue(env, 'RESEND_API_KEY')) return 'missing_credential';
      if (!anyConfigured(env, ['RESEND_DOMAIN', 'RESEND_FROM', 'RESEND_FROM_EMAIL'])) return 'missing_target';
      return 'available_with_current_keys';
    },
  }),
  baseCard({
    id: 'transcription',
    name: 'Transcription',
    purpose: 'Voice/video/document media intake transcription for Telegram, Drive, drop folders, class recovery, and content jobs.',
    defaultStatus: 'missing_credential',
    reason: 'Transcription uses OpenAI audio models by default and requires OPENAI_API_KEY plus an approved media-processing target.',
    configuredReason: 'OPENAI_API_KEY and transcription model are present by variable name; run a real media smoke only with approved test media.',
    nextAction: 'Confirm the transcription model and maximum media size, then run a small approved audio/video smoke.',
    configuredNextAction: 'Run one real non-sensitive transcription and record the provider result, chunking behavior, and any quota/rate error.',
    actor: 'Shloimie for media approval; Codex for validation',
    externalUrl: 'https://platform.openai.com/api-keys',
    externalLabel: 'Open OpenAI API keys',
    docsUrl: 'https://developers.openai.com/api/docs/guides/speech-to-text',
    nonSecretIdentifiers: ['OPENAI_TRANSCRIPTION_MODEL', 'TRANSCRIPTION_MAX_BYTES', 'OPENAI_BASE_URL'],
    secretVariables: ['OPENAI_API_KEY'],
    validationCommand: 'npm run owner-review:external-readiness',
    expectedResult: 'Credential-free diagnostic proves routing; real smoke returns transcript text or precise provider error.',
    externalEffects: 'Credential-free command has no provider effect. Real transcription uploads approved test media to the provider and uses quota.',
    liveAcceptanceCriteria: [
      'Approved model and byte limits are configured.',
      'Real media smoke succeeds with non-sensitive media.',
      'Private transcript visibility is scoped before publication.',
      'Quota/rate errors become visible support evidence.',
    ],
    sourceFiles: ['scripts/telegram-kimi-bridge.mjs', 'scripts/sync-drive-content-library.mjs', 'server.js'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.transcription === 'invalid') return 'invalid_credential';
      return hasValue(env, 'OPENAI_API_KEY') ? 'available_with_current_keys' : 'missing_credential';
    },
  }),
  baseCard({
    id: 'telegram-academy-bot',
    name: 'Telegram Academy Bot',
    purpose: 'Primary academy Telegram bridge for Assistant/Codex mode switching, ordinary conversation, intake, media capture, and Buffer draft handoff.',
    defaultStatus: 'missing_target',
    reason: 'The bot may be active operationally, but this setup center needs token, chat ID, and worker/runtime target names to validate safely.',
    configuredReason: 'Bot token and chat ID variable names are present; validation must use /status or a read-only status check, not a send.',
    nextAction: 'Confirm the bot token source, allowed chat IDs, bridge profile, and worker process target.',
    configuredNextAction: 'Run bridge status checks and avoid sends unless the operator explicitly asks for a Telegram report.',
    actor: 'Shloimie for BotFather/chat IDs; Codex for bridge validation',
    externalUrl: 'https://t.me/BotFather',
    externalLabel: 'Open BotFather',
    docsUrl: 'https://core.telegram.org/bots/tutorial',
    nonSecretIdentifiers: ['TELEGRAM_BRIDGE_PROFILE', 'TELEGRAM_CHAT_ID', 'TELEGRAM_CHAT_ID_BNA', 'TELEGRAM_PRIMARY_AGENT', 'TELEGRAM_DEFAULT_REPLY_MODE'],
    secretVariables: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN_BNA', 'TELEGRAM_WEBHOOK_SECRET'],
    targetVariables: ['TELEGRAM_CHAT_ID_BNA', 'BNA_RAILWAY_PROCESS'],
    validationCommand: 'node scripts/telegram-kimi-bridge.mjs --status',
    expectedResult: 'Bridge status names configured/missing state and selected provider without printing tokens.',
    externalEffects: 'Status-only check should not send messages. Telegram sends require exact task/report context.',
    liveAcceptanceCriteria: [
      'Bot token and allowed chat IDs are installed server-side.',
      'Bridge status shows the intended profile and provider path.',
      'Media intake stores assets locally and preserves raw source.',
      'Completed Codex tasks report back concisely when explicitly required.',
    ],
    sourceFiles: ['scripts/telegram-kimi-bridge.mjs', 'scripts/start-telegram-kimi-bridge.ps1', '.env.example'],
    statusResolver: ({ env }) => {
      if (!anyConfigured(env, ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN_BNA'])) return 'missing_credential';
      if (!anyConfigured(env, ['TELEGRAM_CHAT_ID', 'TELEGRAM_CHAT_ID_BNA'])) return 'missing_target';
      return 'available_with_current_keys';
    },
  }),
  baseCard({
    id: 'telegram-rabbi-worker',
    name: 'Telegram Rabbi Worker',
    purpose: 'Separate Rabbi Elie Scheller Telegram worker profile for One Time workspace communication and scoped worker runtime.',
    defaultStatus: 'missing_target',
    reason: 'Rabbi worker needs its own token/chat ID and Railway process target. Local readiness scans do not prove deployment state.',
    configuredReason: 'Rabbi bot token/chat ID names are present; worker deployment and allowed chat must still be proven.',
    nextAction: 'Confirm the Rabbi bot token, chat ID, bridge profile, and Railway worker process selector before starting the worker.',
    configuredNextAction: 'Run Rabbi profile status locally, then validate worker process logs after approved deploy.',
    actor: 'Shloimie and Rabbi Scheller for bot/account; Codex for worker validation',
    externalUrl: 'https://t.me/BotFather',
    externalLabel: 'Open BotFather',
    docsUrl: 'https://core.telegram.org/bots/tutorial',
    nonSecretIdentifiers: ['TELEGRAM_BRIDGE_PROFILE', 'TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER', 'RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID', 'BNA_RAILWAY_PROCESS'],
    secretVariables: ['TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER', 'RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN'],
    targetVariables: ['TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER', 'BNA_RAILWAY_PROCESS'],
    validationCommand: 'npm run telegram:rabbi',
    expectedResult: 'Worker starts in Rabbi profile or fails with a precise missing token/chat/process reason.',
    externalEffects: 'Starting the worker can receive/send Telegram updates; use only when the worker target is intended.',
    liveAcceptanceCriteria: [
      'Rabbi token and chat ID are installed in the worker environment.',
      'Worker profile starts with scoped One Time settings.',
      'No unrelated BNA/private/provider data leaks into Rabbi scope.',
      'Deployment logs show the intended process selector.',
    ],
    sourceFiles: ['scripts/telegram-kimi-bridge.mjs', 'scripts/start-telegram-kimi-bridge.ps1', 'tests/rabbi-telegram-worker-runtime.test.js'],
    statusResolver: ({ env }) => {
      if (!anyConfigured(env, ['TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER', 'RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN'])) return 'missing_credential';
      if (!anyConfigured(env, ['TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER', 'RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID', 'BNA_RAILWAY_PROCESS'])) return 'missing_target';
      return 'available_with_current_keys';
    },
  }),
  baseCard({
    id: 'github-actions',
    name: 'GitHub Actions / Workflow Scope',
    purpose: 'Independent PR checks, workflow files, release gates, and push validation for owner-review branches.',
    defaultStatus: 'missing_account_permission',
    reason: 'Previous push attempts could not add workflow files because the current GitHub auth lacks workflow scope.',
    configuredReason: 'Workflow-capable credential or GitHub App permission is present according to operator confirmation.',
    nextAction: 'Open GitHub token or app settings and grant workflow permission, or have a repo admin add the workflow file manually.',
    configuredNextAction: 'Push a tiny workflow-only test branch or rerun PR checks to prove Actions attach to the branch.',
    actor: 'Shloimie / GitHub repository admin',
    externalUrl: 'https://github.com/shloimie-beep/bnei-neviim-academy/actions',
    externalLabel: 'Open repo Actions',
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
    nonSecretIdentifiers: ['GITHUB_REPOSITORY=shloimie-beep/bnei-neviim-academy', 'branch name', 'workflow file path'],
    secretVariables: ['GitHub token with workflow scope, stored in the Git credential manager or GitHub App config, not in repo files'],
    validationCommand: 'git push origin codex/closeout-operator-walkthrough-20260624',
    expectedResult: 'Branch push succeeds and GitHub Actions attach when workflow files are allowed.',
    externalEffects: 'Pushes code to GitHub. No app runtime write, but PR/check state changes in GitHub.',
    liveAcceptanceCriteria: [
      'Workflow-scope permission is granted or admin-created workflow exists.',
      'PR receives independent checks.',
      'Local release gates may be used temporarily only with documented blocker.',
    ],
    sourceFiles: ['tasks-pending/2026-06-24-owner-setup-center-walkthroughs.md'],
    statusResolver: ({ overrides }) => overrides?.githubWorkflow === 'available' ? 'available_with_current_keys' : 'missing_account_permission',
  }),
  baseCard({
    id: 'buffer-social',
    name: 'Buffer Social Scheduler',
    purpose: 'Approved social draft/post scheduling for Facebook, LinkedIn, and YouTube text outputs through Buffer.',
    defaultStatus: 'missing_credential',
    reason: 'Buffer needs API key plus organization/channel IDs. Local media assets still need hosted media URL support before attachment.',
    configuredReason: 'Buffer API key is present by variable name; organization and channel IDs determine whether drafts can be created.',
    nextAction: 'Open Buffer, confirm organization and channel IDs, store the API key, then run read-only channel listing.',
    configuredNextAction: 'Run Buffer health/channels readback. Draft creation remains approval gated and media attachment remains hosted-URL gated.',
    actor: 'Shloimie for Buffer account/channels; Codex for validation',
    externalUrl: 'https://buffer.com/publish',
    externalLabel: 'Open Buffer Publish',
    docsUrl: 'https://developers.buffer.com/',
    nonSecretIdentifiers: ['BUFFER_ORGANIZATION_ID', 'BUFFER_DEFAULT_CHANNEL_IDS', 'BUFFER_FACEBOOK_CHANNEL_ID', 'BUFFER_LINKEDIN_CHANNEL_ID', 'BUFFER_YOUTUBE_CHANNEL_ID'],
    secretVariables: ['BUFFER_API_KEY'],
    targetVariables: ['BUFFER_ORGANIZATION_ID', 'BUFFER_DEFAULT_CHANNEL_IDS'],
    validationCommand: 'node --test tests/communications-integrations-contract.test.js',
    validationEndpoint: '/api/bna/integrations/buffer/health',
    expectedResult: 'Health shows connected/blocked and channel count without showing the API key.',
    externalEffects: 'Read-only health/channels check. Draft/schedule creates Buffer objects only after explicit approval.',
    liveAcceptanceCriteria: [
      'Organization and channel IDs are recorded.',
      'Draft creation is tested with approval and no unintended publish.',
      'Media attachment waits for hosted media URL support.',
    ],
    sourceFiles: ['src/lib/integrations/buffer-client.js', 'server.js', 'scripts/buffer-ops.mjs'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.buffer === 'invalid') return 'invalid_credential';
      if (!hasValue(env, 'BUFFER_API_KEY')) return 'missing_credential';
      if (!anyConfigured(env, ['BUFFER_ORGANIZATION_ID', 'BUFFER_DEFAULT_CHANNEL_IDS', 'BUFFER_FACEBOOK_CHANNEL_ID', 'BUFFER_LINKEDIN_CHANNEL_ID', 'BUFFER_YOUTUBE_CHANNEL_ID'])) return 'missing_target';
      return 'available_with_current_keys';
    },
  }),
  baseCard({
    id: 'whatsapp-wapi',
    name: 'WhatsApp / WAPI / Whapi',
    purpose: 'WhatsApp history sync, phonebook grouping, local CRM correction previews, and gated sends through WAPI/Whapi.',
    defaultStatus: 'missing_credential',
    reason: 'WAPI_API_TOKEN or WHAPI_API_TOKEN is required before provider readback; sends require explicit SEND_WHATSAPP approval.',
    configuredReason: 'WAPI/Whapi token is present by variable name; phone/channel identity and webhook policy still need proof.',
    nextAction: 'Open Whapi, confirm the linked WhatsApp number/channel, store the API token, and run read-only sync/report validation.',
    configuredNextAction: 'Run WAPI phonebook/history report and keep sends disabled without exact operator confirmation.',
    actor: 'Shloimie for WhatsApp/Whapi account; Codex for no-send validation',
    externalUrl: 'https://whapi.cloud/docs',
    externalLabel: 'Open Whapi docs',
    docsUrl: 'https://whapi.cloud/docs',
    nonSecretIdentifiers: ['WAPI_API_BASE_URL', 'WHAPI_API_BASE_URL', 'BNA_WHATSAPP_NUMBER', 'BNA_RABBI_SHLOIMIE_WHATSAPP_NUMBER'],
    secretVariables: ['WAPI_API_TOKEN', 'WHAPI_API_TOKEN', 'WAPI_WEBHOOK_SECRET'],
    validationCommand: 'node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js',
    expectedResult: 'Read-only local grouping/sync contracts pass; no WhatsApp message is sent.',
    externalEffects: 'Read-only sync can read provider history if token is used. Sends require SEND_WHATSAPP.',
    liveAcceptanceCriteria: [
      'Linked WhatsApp number/channel is documented.',
      'Read-only sync and local correction preview pass.',
      'Outbound send path requires exact approval and logs communication.',
    ],
    sourceFiles: ['scripts/sync-whapi-history.mjs', 'server.js', 'tests/wapi-phonebook-report.test.js'],
    statusResolver: ({ env, overrides }) => {
      if (overrides?.wapi === 'invalid') return 'invalid_credential';
      return anyConfigured(env, ['WAPI_API_TOKEN', 'WHAPI_API_TOKEN']) ? 'available_with_current_keys' : 'missing_credential';
    },
  }),
  baseCard({
    id: 'green-invoice',
    name: 'Green Invoice',
    purpose: 'Alternate or future billing provider path surfaced in accounting/payment settings for Rabbi / One Time decisions.',
    defaultStatus: 'owner_approval_required',
    reason: 'Green Invoice is visible as a payment-provider option, but provider selection, credentials, API key, and approval are unresolved.',
    configuredReason: 'Green Invoice test variables are present; provider choice and live acceptance still require owner decision.',
    nextAction: 'Decide whether Green Invoice is in scope for One Time billing, then store test credentials only if selected.',
    configuredNextAction: 'Run a test-mode provider smoke and compare it to the Stripe path before live billing decisions.',
    actor: 'Shloimie / billing owner',
    externalUrl: 'https://www.greeninvoice.co.il/',
    externalLabel: 'Open Green Invoice',
    docsUrl: 'https://www.greeninvoice.co.il/',
    nonSecretIdentifiers: ['RABBI_GREEN_INVOICE_MODE'],
    secretVariables: ['GREEN_INVOICE_SECRET', 'RABBI_GREEN_INVOICE_SECRET', 'RABBI_GREEN_INVOICE_API_KEY'],
    validationCommand: 'node --test tests/rabbi-scheller-audit-docs.test.js',
    expectedResult: 'Docs/tests confirm the approval gate; real provider validation is separate if selected.',
    externalEffects: 'No provider effect from local tests. Any invoice/payment action requires separate approval.',
    liveAcceptanceCriteria: [
      'Provider choice is decided against Stripe.',
      'Test credentials and webhook settings are stored only if selected.',
      'Live invoice/payment action has owner approval and rollback path.',
    ],
    sourceFiles: ['.env.example', 'server.js', 'tests/rabbi-scheller-audit-docs.test.js'],
    statusResolver: ({ env }) => {
      if (anyConfigured(env, ['RABBI_GREEN_INVOICE_API_KEY', 'RABBI_GREEN_INVOICE_SECRET', 'GREEN_INVOICE_SECRET'])) return 'sandbox_test_only';
      return 'owner_approval_required';
    },
  }),
];

function buildCard(raw, context = {}) {
  const env = context.env || process.env || {};
  const overrides = context.statusOverrides || {};
  const status = overrides[raw.id] || (typeof raw.statusResolver === 'function'
    ? raw.statusResolver({ env, overrides })
    : (anyConfigured(env, raw.secretVariables) ? raw.configuredStatus : raw.defaultStatus));
  const configuredLike = ['already_configured', 'available_with_current_keys', 'sandbox_test_only', 'ready_for_live', 'live'].includes(status);
  return {
    id: raw.id,
    name: raw.name,
    purpose: raw.purpose,
    currentSafeStatus: status,
    statusLabel: STATUS_DEFINITIONS[status]?.label || status,
    statusReason: configuredLike ? raw.configuredReason : raw.reason,
    exactNextAction: configuredLike ? raw.configuredNextAction : raw.nextAction,
    whoMustAct: raw.actor,
    internalPageLink: raw.internalPageLink,
    externalAccountLink: raw.externalAccountLink,
    requiredNonSecretIdentifiers: raw.requiredNonSecretIdentifiers,
    secretVariables: raw.secretVariables,
    targetVariables: raw.targetVariables,
    approvedSecretStore: raw.approvedSecretStore,
    validation: raw.validation,
    expectedResult: raw.validation.expectedResult,
    externalEffectsOfTest: raw.validation.externalEffects,
    liveAcceptanceCriteria: raw.liveAcceptanceCriteria,
    lastValidationTimestamp: context.validationTimestamps?.[raw.id] || 'not_validated_in_this_branch',
    evidenceLink: raw.evidenceLink,
    walkthroughPath: raw.walkthroughPath,
    sourceFiles: raw.sourceFiles,
  };
}

function buildOwnerSetupCatalog(context = {}) {
  const cards = INTEGRATION_CARDS.map((card) => buildCard(card, context));
  return {
    catalogVersion: 'owner-setup-center-2026-06-24',
    generatedAt: context.generatedAt || new Date().toISOString(),
    route: OWNER_PAGE,
    authenticatedReadinessEndpoint: '/api/bna/integration-setup/readiness',
    safeLoggedOutState: true,
    secretValuesIncluded: false,
    statusDefinitions: STATUS_DEFINITIONS,
    cards,
  };
}

function listOwnerSetupIntegrationIds() {
  return INTEGRATION_CARDS.map((card) => card.id);
}

module.exports = {
  APPROVED_SECRET_STORE,
  INTEGRATION_CARDS,
  STATUS_DEFINITIONS,
  buildOwnerSetupCatalog,
  listOwnerSetupIntegrationIds,
};
