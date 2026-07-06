'use strict';

const ONE_TIME_STUDIO_OPERATOR_ROLE = 'one_time_ai_studio_operator';
const ONE_TIME_STUDIO_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_STUDIO_PROJECT_KEY = 'one_time_mishnah_class';

const STUDIO_REPAIR_ACTION = 'studio_repair_request';

const STUDIO_ALLOWED_FILES = Object.freeze([
  'public/operations.html',
  'server.js',
  'src/lib/bna/service-provider-studio.js',
  'src/lib/bna/service-provider-studio-sidekick.js',
  'src/lib/bna/studio-openart-mcp-adapter.js',
  'src/lib/bna/assistant-scope-policy.js',
  'src/lib/bna/one-time-studio-sidekick-policy.js',
  'tests/service-provider-studio-domain.test.js',
  'tests/service-provider-studio-api-contract.test.js',
  'tests/service-provider-studio-operations-ui.test.js',
  'tests/assistant-scope-policy.test.js',
  'tests/one-time-studio-sidekick-policy.test.js',
  'tests/one-time-studio-openart-adapter.test.js',
  'ops/action-registry.json',
  'ops/route-registry.json',
]);

const STUDIO_VERIFICATION_COMMANDS = Object.freeze([
  'node --test tests/assistant-scope-policy.test.js tests/one-time-studio-sidekick-policy.test.js tests/one-time-studio-openart-adapter.test.js',
  'node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js',
  'npm run watchdog:actions',
  'npm run watchdog:protocol-drift',
]);

const ALLOWED_STUDIO_PATTERNS = Object.freeze([
  /\bstudio\b/i,
  /\bprompt\b/i,
  /\bpatch(?:ing)?\b/i,
  /\bcorrection\b/i,
  /\bcharacter(?:s)?\b/i,
  /\bscene(?:s)?\b/i,
  /\bstoryboard\b/i,
  /\bimage\b/i,
  /\brender\b/i,
  /\bopen\s*art\b/i,
  /\bmcp\b/i,
  /\bsidekick\b/i,
  /\bassistant\b/i,
  /\blayout\b/i,
  /\bfunctionality\b/i,
  /\bui\b/i,
  /\bbutton\b/i,
  /\bform\b/i,
  /\bcopy\b/i,
  /\bexport\b/i,
]);

const FORBIDDEN_REPAIR_PATTERNS = Object.freeze([
  { pattern: /\bdeploy(?:ment)?\b/i, reason: 'deploy_not_allowed' },
  { pattern: /\bmigration\b|\bdatabase\s+(?:schema|migration|alter|drop)\b/i, reason: 'database_migration_not_allowed' },
  { pattern: /\bshell\b|\bpowershell\b|\bbash\b|\bcmd\.exe\b|\bterminal\b/i, reason: 'raw_shell_not_allowed' },
  { pattern: /\bsecret(?:s)?\b|\bapi\s*key\b|\btoken\b|\bpassword\b|\bcredential(?:s)?\b/i, reason: 'secrets_not_allowed' },
  { pattern: /\bdns\b|\bdomain\b|\bcloudflare\b/i, reason: 'dns_not_allowed' },
  { pattern: /\bpayment(?:s)?\b|\bstripe\b|\bcheckout\b|\bcharge\b|\brefund\b/i, reason: 'payments_not_allowed' },
  { pattern: /\bemail\b|\bwhatsapp\b|\bsms\b|\bsend\b|\bbroadcast\b|\bcampaign\b/i, reason: 'external_send_not_allowed' },
  { pattern: /\baccess\s+grant\b|\bmember\s+access\b|\bgrant\s+access\b|\brevoke\b/i, reason: 'access_control_not_allowed' },
  { pattern: /\bcontact(?:s)?\b|\bcrm\b|\blead(?:s)?\b|\bparent(?:s)?\b|\bstudent(?:s)?\b/i, reason: 'contacts_or_private_records_not_allowed' },
  { pattern: /\bpublic\s+(?:site|website|homepage|landing)\b|\bmarketing\s+site\b|\bwebsite\b/i, reason: 'website_not_allowed' },
  { pattern: /\bsettings\b|\bintegration(?:s)?\b|\badmin\b|\baccounting\b|\bautomations?\b/i, reason: 'admin_surface_not_allowed' },
  { pattern: /\bother\s+workspace\b|\bbna\s+academy\b|\bdratler\b|\bplatform\s+suite\b/i, reason: 'cross_workspace_not_allowed' },
]);

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isOneTimeStudioOperatorScope(scope = {}) {
  const role = normalizeKey(scope.role);
  const workspaceKey = normalizeKey(scope.workspace_key || scope.workspaceKey);
  const projectKey = normalizeKey(scope.project_key || scope.projectKey);
  return role === ONE_TIME_STUDIO_OPERATOR_ROLE
    && workspaceKey === ONE_TIME_STUDIO_WORKSPACE_KEY
    && projectKey === ONE_TIME_STUDIO_PROJECT_KEY;
}

function forbiddenRepairMatch(text = '') {
  return FORBIDDEN_REPAIR_PATTERNS.find((entry) => entry.pattern.test(text)) || null;
}

function hasStudioRepairSignal(text = '') {
  return ALLOWED_STUDIO_PATTERNS.some((pattern) => pattern.test(text));
}

function planOneTimeStudioRepairRequest(scope = {}, request = {}) {
  const action = normalizeKey(request.action);
  const text = normalizeText([
    request.text,
    request.message,
    request.correction,
    request.issue,
    request.target,
  ].filter(Boolean).join(' '));

  if (action && action !== STUDIO_REPAIR_ACTION) {
    return {
      allowed: false,
      mode: 'deny',
      action: STUDIO_REPAIR_ACTION,
      reason: 'wrong_action_for_studio_repair_lane',
    };
  }

  if (!isOneTimeStudioOperatorScope(scope)) {
    return {
      allowed: false,
      mode: 'deny',
      action: STUDIO_REPAIR_ACTION,
      reason: 'one_time_studio_operator_scope_required',
    };
  }

  if (!text) {
    return {
      allowed: false,
      mode: 'deny',
      action: STUDIO_REPAIR_ACTION,
      reason: 'studio_repair_request_text_required',
    };
  }

  const forbidden = forbiddenRepairMatch(text);
  if (forbidden) {
    return {
      allowed: false,
      mode: 'deny',
      action: STUDIO_REPAIR_ACTION,
      reason: forbidden.reason,
      message: 'Studio operator repair requests are limited to AI Studio layout, prompt/image workflow, OpenArt prompt export, and Studio task flow.',
      no_shell: true,
      no_codex_cli_route: true,
      no_external_writes: true,
    };
  }

  if (!hasStudioRepairSignal(text)) {
    return {
      allowed: false,
      mode: 'deny',
      action: STUDIO_REPAIR_ACTION,
      reason: 'not_a_studio_surface_request',
      message: 'Name the Studio prompt, image, character, OpenArt, layout, or workflow surface that needs repair.',
      no_shell: true,
      no_codex_cli_route: true,
      no_external_writes: true,
    };
  }

  return {
    allowed: true,
    mode: 'studio_repair_lane',
    action: STUDIO_REPAIR_ACTION,
    lane: 'one_time_ai_studio_only',
    message: 'Create a scoped Studio repair task for Codex review. This is not raw shell access and cannot deploy or mutate external systems.',
    allowed_files: STUDIO_ALLOWED_FILES.slice(),
    allowed_routes: [
      '/operations?view=studio',
      '/operations?view=tasks',
      '/api/bna/studio/*',
      '/api/bna/assistant/scope-plan',
    ],
    verification_commands: STUDIO_VERIFICATION_COMMANDS.slice(),
    no_shell: true,
    no_codex_cli_route: true,
    no_deploy: true,
    no_migrations: true,
    no_secrets: true,
    no_external_writes: true,
    requires_owner_merge_decision_for_cross_workspace_reuse: true,
  };
}

module.exports = {
  ONE_TIME_STUDIO_OPERATOR_ROLE,
  ONE_TIME_STUDIO_WORKSPACE_KEY,
  ONE_TIME_STUDIO_PROJECT_KEY,
  STUDIO_REPAIR_ACTION,
  STUDIO_ALLOWED_FILES,
  STUDIO_VERIFICATION_COMMANDS,
  isOneTimeStudioOperatorScope,
  forbiddenRepairMatch,
  hasStudioRepairSignal,
  planOneTimeStudioRepairRequest,
};
