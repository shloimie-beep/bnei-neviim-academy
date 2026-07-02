const { oneTimeBrandConfig } = require('../brands');
const { buildAnnouncementsFirstCommunityContract } = require('../community/announcements-first');
const {
  buildOneTimeProgressRewardContract,
  buildOneTimeProgressRewardSeed,
} = require('../progress/one-time-progress');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_INSTANCE_SLUG = 'one-time-mishnah-class';

const DEFAULT_GUARDS = Object.freeze([
  'No BNA private operations records in One Time exports.',
  'No API keys, passwords, tokens, cookies, or raw private message bodies in fixtures or manifests.',
  'Single-tenant split must use separate domain, database, secrets, and deploy configuration.',
  'Live Vimeo uploads, Zoom mutations, Resend sends, DNS, Railway, and production database writes require operator approval.',
]);

const ONE_TIME_SUPPORTED_HUMAN_ROLES = Object.freeze([
  'admin_owner',
  'service_provider',
  'parent',
  'student',
]);

const ONE_TIME_PROMPT_HIERARCHY = Object.freeze([
  'platform_safety_system',
  'instance_workspace',
  'role',
  'class_course',
  'individual_user_student',
  'current_session_source_context',
]);

const ONE_TIME_CANONICAL_INGESTION_FLOW = Object.freeze([
  'source_fingerprint',
  'transcript',
  'speaker_participant_mapping',
  'class_session',
  'attendance_minutes',
  'class_summary',
  'topics_questions_answers',
  'course_lesson_placement',
  'video_reference',
  'worksheet_resource_suggestions',
  'role_scoped_updates',
  'approval',
  'publish',
]);

function buildOneTimeRoleContract() {
  return {
    visible_product_roles: [...ONE_TIME_SUPPORTED_HUMAN_ROLES],
    no_visible_generic_roles: ['teacher', 'staff'],
    compatibility_note: 'Legacy/internal aliases can map into the four visible One Time roles, but the product model exposes only admin/owner, service provider, parent, and student.',
    assignments: [
      {
        person: 'Rabbi Elie Scheller',
        visible_role: 'service_provider',
        workspace_role: 'admin_owner',
        scope: 'owner of One Time Mishnah Class workspace',
      },
      {
        person: 'Shloimie',
        visible_role: 'admin_owner',
        workspace_role: 'admin_owner',
        scope: 'operator/admin management access',
      },
      {
        person: 'Parent',
        visible_role: 'parent',
        scope: 'linked children and approved workspace information only',
      },
      {
        person: 'Student',
        visible_role: 'student',
        scope: 'own portal, classes, coursework, progress, approved community information only',
      },
    ],
  };
}

function buildOneTimePortalContracts() {
  return {
    service_provider: {
      label: 'Service-provider / owner portal',
      scope: 'One Time workspace only',
      can: [
        'manage classes and courses',
        'view students and parents in the workspace',
        'review attendance and exact minutes',
        'create course/video/resource drafts',
        'publish or archive approved announcements',
        'manage milestones, achievements, and rewards',
        'review integration readiness',
        'edit class/course prompts',
      ],
      cannot: ['read unrelated BNA private operations data', 'perform live external writes without approval'],
    },
    parent: {
      label: 'Parent portal',
      scope: 'linked child only',
      can: [
        'view linked child attendance and exact minutes',
        'view linked child course progress',
        'view approved achievements, milestones, reward status, summaries, announcements, and reminders',
      ],
      cannot: ['view other students', 'view private provider/admin notes', 'edit class prompts'],
    },
    student: {
      label: 'Student portal',
      scope: 'own student record only',
      can: [
        'view own schedule, attendance, minutes, progress, lessons, worksheets, achievements, milestones, rewards, announcements, and role-scoped assistant context',
      ],
      cannot: ['view another student', 'view adult/private notes', 'control rewards'],
    },
    admin_owner: {
      label: 'Admin portal',
      scope: 'all One Time workspace data',
      can: [
        'audit configuration',
        'manage users/modules/branding',
        'review prompt versions',
        'approve publishing and release gates',
      ],
      cannot: ['hide impersonation', 'bypass workspace isolation', 'mutate production services without approval'],
    },
  };
}

function buildOneTimePromptHierarchy() {
  return {
    versioned: true,
    audit_required: true,
    order: [...ONE_TIME_PROMPT_HIERARCHY],
    edit_policy: {
      service_provider: ['class_course'],
      admin_owner: ['instance_workspace', 'role', 'class_course', 'individual_user_student'],
      parent: [],
      student: [],
    },
    isolation_rules: [
      'Parent and student assistants use only authorized data.',
      'No other student records enter a student or parent prompt.',
      'Parsed class content can update portals and assistant memory only according to role and permissions.',
    ],
  };
}

function buildOneTimeProductConfig(options = {}) {
  const priceCents = Number.isFinite(Number(options.price_cents)) ? Number(options.price_cents) : 6700;
  const trialDays = Number.isFinite(Number(options.trial_days)) ? Number(options.trial_days) : 30;
  return {
    primary_offer: {
      key: 'one_live_class_video_library_course',
      title: 'One Time Mishnah Class',
      price_cents: priceCents,
      currency: options.currency || 'USD',
      configurable: true,
      launch_policy: {
        trial_days: trialDays,
        card_required: false,
        payment_method_required_at_signup: false,
        checkout_required_at_signup: false,
        stripe_only: true,
        stripe_connect_required: false,
        live_billing_enabled: false,
        automatic_tax_enabled: false,
        refund_policy: 'no_refunds',
        grace_period_days: 0,
        access_during_grace: false,
      },
      includes: [
        'one_live_class',
        'video_library',
        'course',
        'announcement_community',
        'worksheets_resources',
        'parent_portal',
        'student_portal',
        'attendance_completion',
        'milestones_achievements',
        'individual_rewards',
      ],
    },
    future_cohort: {
      student_capacity: 20,
      scholarship_seats: 3,
      scholarship_policy: 'human_approved_with_transparent_criteria_and_audit_trail',
      automatic_black_box_awards_allowed: false,
    },
  };
}

function buildOneTimeClassIngestionContract() {
  return {
    sources: ['zoom_recording', 'vimeo_asset', 'approved_drop_folder_video'],
    canonical_flow: [...ONE_TIME_CANONICAL_INGESTION_FLOW],
    idempotency_required: true,
    audit_required: true,
    natural_language_primary: true,
    common_commands: [
      'Make this the next lesson in Course X.',
      'Create a new course from these four videos.',
      'Use this as Module 2.',
      'Turn the transcript into a worksheet.',
      'Publish the summary to parents.',
      'Give each student their own progress update.',
      'Do not publish this yet.',
      'Regenerate the lesson with the new class prompt.',
    ],
  };
}

function buildProviderDirectoryConsentContract() {
  return {
    provider_plans: ['free_provider_plan', 'paid_privacy_plan'],
    public_directory_fields_allowed: [
      'provider_supplied_business_profile',
      'category',
      'age_range',
      'location',
      'languages',
      'safe_contact_or_lead_action',
    ],
    prohibited_uses: [
      'sale_of_identifiable_child_or_parent_data',
      'advertising_profile_of_identifiable_child_or_parent_data',
      'public_student_records',
    ],
    required_consent_records: [
      'guardian_consent',
      'provider_consent',
      'data_use_disclosure',
      'service_email_consent',
      'marketing_consent',
      'consent_version',
      'consent_timestamp',
      'export_delete_request_workflow',
      'retention_configuration',
    ],
    public_launch_gate: 'legal_privacy_review_required',
  };
}

function buildOneTimeInstanceConfig(options = {}) {
  const singleTenant = Boolean(options.singleTenant || options.deployment_mode === 'single_tenant_partner');
  const deploymentMode = singleTenant ? 'single_tenant_partner' : 'scoped_workspace';
  const workspaceKey = options.workspace_key || ONE_TIME_WORKSPACE_KEY;
  const projectKey = options.project_key || ONE_TIME_PROJECT_KEY;
  const product = buildOneTimeProductConfig(options.product || {});
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
    roles: buildOneTimeRoleContract(),
    portals: buildOneTimePortalContracts(),
    prompt_hierarchy: buildOneTimePromptHierarchy(),
    product,
    class_ingestion: buildOneTimeClassIngestionContract(),
    community: buildAnnouncementsFirstCommunityContract({
      workspace_key: workspaceKey,
      project_key: projectKey,
    }),
    progress_rewards: buildOneTimeProgressRewardContract({
      workspace_key: workspaceKey,
      project_key: projectKey,
    }),
    provider_directory_consent: buildProviderDirectoryConsentContract(),
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
    seed: buildOneTimeSeedFixture({ workspace_key: workspaceKey, project_key: projectKey, product }),
    guards: [...DEFAULT_GUARDS],
  };
}

function buildOneTimeSeedFixture(options = {}) {
  const workspaceKey = options.workspace_key || ONE_TIME_WORKSPACE_KEY;
  const projectKey = options.project_key || ONE_TIME_PROJECT_KEY;
  const product = options.product || buildOneTimeProductConfig();
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
    progress_rewards: buildOneTimeProgressRewardSeed({
      workspace_key: workspaceKey,
      project_key: projectKey,
    }),
    course: {
      key: 'mishnah_foundations',
      title: 'Mishnah Foundations',
      video_library: true,
      live_class_schedule: true,
    },
    product: product.primary_offer,
    future_cohort: product.future_cohort,
    task_lanes: ['Decisions', 'Pending', 'Tasks', 'Codex Queue', 'Calendar', 'Done / Activity'],
    blocked_external_gates: [
      'partner_domain_and_dns',
      'vimeo_account_authorization',
      'zoom_account_authorization',
      'resend_domain_verification',
      'stripe_test_account_confirmation',
      'explicit_live_send_or_charge_approval',
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
  ONE_TIME_CANONICAL_INGESTION_FLOW,
  ONE_TIME_PROMPT_HIERARCHY,
  ONE_TIME_SUPPORTED_HUMAN_ROLES,
  ONE_TIME_WORKSPACE_KEY,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_INSTANCE_SLUG,
  buildOneTimeClassIngestionContract,
  buildOneTimePortalContracts,
  buildOneTimeProductConfig,
  buildOneTimePromptHierarchy,
  buildOneTimeRoleContract,
  buildProviderDirectoryConsentContract,
  buildOneTimeInstanceConfig,
  buildOneTimeSeedFixture,
  buildOneTimeExportManifest,
  assertNoBnaPrivateData,
};
