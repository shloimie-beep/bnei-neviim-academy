const { oneTimeBrandConfig } = require('../brands');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_INSTANCE_SLUG = 'one-time-mishnah-class';

const DEFAULT_GUARDS = Object.freeze([
  'No BNA private operations records in One Time exports.',
  'No API keys, passwords, tokens, cookies, or raw private message bodies in fixtures or manifests.',
  'Single-tenant split must use separate domain, database, secrets, and deploy configuration.',
  'Live Vimeo uploads, Zoom mutations, Resend sends, DNS, Railway, and production database writes require operator approval.',
]);

function buildOneTimeInstanceConfig(options = {}) {
  const singleTenant = Boolean(options.singleTenant || options.deployment_mode === 'single_tenant_partner');
  const deploymentMode = singleTenant ? 'single_tenant_partner' : 'scoped_workspace';
  const workspaceKey = options.workspace_key || ONE_TIME_WORKSPACE_KEY;
  const projectKey = options.project_key || ONE_TIME_PROJECT_KEY;
  return {
    instance: {
      slug: ONE_TIME_INSTANCE_SLUG,
      project_key: projectKey,
      workspace_key: workspaceKey,
      display_name: 'One Time Mishnah Class',
      canonical_codebase: 'bna-platform',
      deployment_mode: deploymentMode,
      database_scope: singleTenant ? 'separate_database_required' : 'shared_database_scoped_rows',
      domain_scope: singleTenant ? 'separate_partner_domain_required' : 'scoped_operations_workspace',
      secret_scope: singleTenant ? 'separate_secret_set_required' : 'no_partner_secrets_in_repo',
      split_ready: true,
      partner_owned_target: true,
      external_write_performed: false,
    },
    brand: oneTimeBrandConfig(options.brand || {}),
    owners: {
      operator_admin: 'Shloimie',
      partner_owner: 'Rabbi Elie Scheller',
      account_owner: 'Rabbi Elie Scheller',
    },
    module_visibility: {
      dashboard: true,
      people: true,
      community: true,
      courses: true,
      video_library: true,
      live_classes: true,
      tasks: true,
      decisions: true,
      calendar: true,
      goals_rewards: true,
      ramble_queue: true,
      integrations: true,
      bna_private_operations: false,
    },
    seed: buildOneTimeSeedFixture({ workspace_key: workspaceKey, project_key: projectKey }),
    guards: [...DEFAULT_GUARDS],
  };
}

function buildOneTimeSeedFixture(options = {}) {
  const workspaceKey = options.workspace_key || ONE_TIME_WORKSPACE_KEY;
  const projectKey = options.project_key || ONE_TIME_PROJECT_KEY;
  return {
    workspace: {
      key: workspaceKey,
      project_key: projectKey,
      display_name: 'One Time Mishnah Class',
      type: 'service_provider',
      privacy_scope: 'partner_program',
    },
    people: [
      {
        role: 'partner_owner',
        display_name: 'Rabbi Elie Scheller',
        workspace_key: workspaceKey,
      },
      {
        role: 'operator_admin',
        display_name: 'Shloimie',
        workspace_key: workspaceKey,
      },
    ],
    community: {
      key: 'one_time_member_community',
      title: 'One Time Member Community',
      moderation_mode: 'questions_reviewed_before_publication',
    },
    course: {
      key: 'mishnah_foundations',
      title: 'Mishnah Foundations',
      video_library: true,
      live_class_schedule: true,
    },
    task_lanes: ['Decisions', 'Tasks', 'Done / Activity'],
    blocked_external_gates: [
      'partner_domain_and_dns',
      'production_database_split',
      'railway_service_or_environment',
      'vimeo_account_authorization',
      'zoom_account_authorization',
      'resend_domain_verification',
    ],
  };
}

function buildOneTimeExportManifest(config = buildOneTimeInstanceConfig()) {
  return {
    slug: ONE_TIME_INSTANCE_SLUG,
    workspace_key: config.instance?.workspace_key || ONE_TIME_WORKSPACE_KEY,
    project_key: config.instance?.project_key || ONE_TIME_PROJECT_KEY,
    canonical_codebase: 'bna-platform',
    export_mode: config.instance?.deployment_mode === 'single_tenant_partner'
      ? 'single_tenant_partner_export'
      : 'scoped_workspace_package',
    secrets_included: false,
    external_write_performed: false,
    excluded_secret_fields: [
      'OPENAI_API_KEY',
      'KIMI_API_KEY',
      'RESEND_API_KEY',
      'ZOOM_CLIENT_SECRET',
      'VIMEO_ACCESS_TOKEN',
      'DATABASE_URL',
      'SESSION_SECRET',
    ],
    excluded_sources: [
      'raw private Telegram message bodies',
      'BNA private operations notes',
      'student-sensitive details outside One Time scope',
      'local keyholder files',
      'production environment values',
    ],
    files: [
      'config/brands/one-time.json',
      'src/platform/instances/one-time.js',
      'src/platform/integrations/readiness.js',
      'docs/architecture/onetime-single-tenant-split.md',
      'docs/integrations/onetime-vimeo-zoom-resend-readiness.md',
    ],
  };
}

function assertNoBnaPrivateData(records = []) {
  const list = Array.isArray(records) ? records : [];
  const violations = list
    .map((record, index) => ({ record: record || {}, index }))
    .filter(({ record }) => {
      const workspace = String(record.workspace_key || record.workspace || record.project_key || '').toLowerCase();
      const privacy = String(record.privacy || record.visibility || record.scope || '').toLowerCase();
      return workspace === 'bna'
        || workspace === 'bna_operations'
        || workspace.includes('bna_private')
        || privacy.includes('bna_private')
        || record.bna_private === true;
    })
    .map(({ index, record }) => ({
      index,
      id: record.id || record.key || null,
      reason: 'BNA private or out-of-scope record cannot be included in One Time export.',
    }));
  return {
    ok: violations.length === 0,
    violations,
  };
}

module.exports = {
  ONE_TIME_WORKSPACE_KEY,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_INSTANCE_SLUG,
  buildOneTimeInstanceConfig,
  buildOneTimeSeedFixture,
  buildOneTimeExportManifest,
  assertNoBnaPrivateData,
};
