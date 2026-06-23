const {
  createDraft,
  createDraftVersion,
  createPreview,
} = require('./draft-versioning');
const {
  buildUnifiedFileMediaIntake,
} = require('./file-media-intake');
const {
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');

const PROVIDER_ONBOARDING_REQUIREMENT_ID = 'REQ-20260623-017';
const CONTRACT_VERSION = 'assistant-provider-onboarding-studio-v1';

const PROVIDER_ONBOARDING_STAGES = Object.freeze([
  'secure_start',
  'identity_business',
  'offer',
  'brand_website',
  'classroom_community',
  'communications',
  'integrations',
  'review',
  'launch',
]);

const STAGE_REQUIRED_FIELDS = Object.freeze({
  secure_start: ['provider_identity_linked', 'consent_recorded'],
  identity_business: ['public_name', 'business_category', 'audience', 'age_ranges', 'languages', 'service_area', 'public_contact_settings'],
  offer: ['program_name', 'format', 'schedule', 'pricing', 'capacity', 'description', 'outcomes'],
  brand_website: ['logo', 'brand_colors', 'bio', 'photos_or_video', 'hero_media', 'cta', 'seo_fields'],
  classroom_community: ['class_or_course_draft', 'lesson_structure', 'worksheet_plan', 'community_model', 'moderation_settings'],
  communications: ['welcome_template', 'invitation_template', 'class_reminder_template', 'support_template', 'approval_required'],
  integrations: ['zoom_status', 'vimeo_status', 'resend_status', 'stripe_status', 'drive_calendar_status'],
  review: ['public_listing_preview', 'landing_page_preview', 'portal_configuration', 'launch_checklist'],
  launch: ['operator_approval', 'domain_dns_status', 'payment_mode', 'sender_readiness', 'smoke_plan', 'rollback_path'],
});

function compact(value = '', maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeKey(value = '', fallback = '') {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || fallback;
}

function providerActor(actor = {}) {
  return {
    ...actor,
    role: actor.role || 'provider_admin',
    workspace_key: actor.workspace_key || actor.workspaceKey || actor.workspace_id || 'rabbi_sheller_provider',
    project_key: actor.project_key || actor.projectKey || actor.project_id || 'one_time_mishnah_class',
  };
}

function stageForAnswers(answers = {}) {
  for (const stage of PROVIDER_ONBOARDING_STAGES) {
    const required = STAGE_REQUIRED_FIELDS[stage] || [];
    if (required.some((field) => !answers[field])) return stage;
  }
  return 'review';
}

function missingFieldsForStage(stage = 'secure_start', answers = {}) {
  return (STAGE_REQUIRED_FIELDS[stage] || []).filter((field) => !answers[field]);
}

function createProviderOnboardingSession({
  actor = {},
  channel = 'telegram',
  provider_id = '',
  conversation_key = '',
  onboarding_key = '',
  answers = {},
  uploaded_assets = [],
  workspace_key = '',
  project_key = '',
  created_at = new Date().toISOString(),
} = {}) {
  const canonicalActor = providerActor({ ...actor, workspace_key: workspace_key || actor.workspace_key, project_key: project_key || actor.project_key });
  const canonicalChannel = normalizeChannel(channel);
  assertActionPolicy({
    actor: canonicalActor,
    channel: canonicalChannel,
    action_category: 'provider_profile',
    operation: 'draft',
    target: {
      workspace_key: canonicalActor.workspace_key,
      project_key: canonicalActor.project_key,
      provider_id: provider_id || canonicalActor.provider_id,
    },
    dry_run: true,
  });
  const currentStage = stageForAnswers(answers);
  const missingFields = missingFieldsForStage(currentStage, answers);
  const key = onboarding_key || `provider_onboarding_${normalizeKey(provider_id || canonicalActor.user_id || 'new')}_${normalizeKey(conversation_key || canonicalChannel || 'session')}`;
  return {
    requirement_id: PROVIDER_ONBOARDING_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    onboarding_key: key,
    provider_profile_id: provider_id || null,
    conversation_key: conversation_key || '',
    current_stage: currentStage,
    status: missingFields.length ? 'in_progress' : 'needs_review',
    channel_key: canonicalChannel,
    actor_identity_key: canonicalActor.identity_key || canonicalActor.user_id || '',
    workspace_key: canonicalActor.workspace_key,
    project_key: canonicalActor.project_key,
    answers: { ...answers },
    uploaded_assets: uploaded_assets.map((asset) => ({ ...asset })),
    missing_fields: missingFields,
    open_questions: missingFields.map((field) => `What should I use for ${field.replace(/_/g, ' ')}?`),
    studio_draft_refs: {},
    approval_state: 'draft',
    publish_allowed: false,
    external_write_performed: false,
    created_at,
    updated_at: created_at,
  };
}

function continueProviderOnboardingSession(session = {}, { actor = {}, channel = '', answers = {}, uploaded_assets = [], created_at = new Date().toISOString() } = {}) {
  if (!session.onboarding_key) throw new Error('session is required');
  const mergedAnswers = { ...(session.answers || {}), ...(answers || {}) };
  const mergedAssets = [...(session.uploaded_assets || []), ...(uploaded_assets || [])];
  return {
    ...createProviderOnboardingSession({
      actor: providerActor({ ...actor, workspace_key: session.workspace_key, project_key: session.project_key }),
      channel: channel || session.channel_key,
      provider_id: session.provider_profile_id || '',
      conversation_key: session.conversation_key || '',
      onboarding_key: session.onboarding_key,
      answers: mergedAnswers,
      uploaded_assets: mergedAssets,
      workspace_key: session.workspace_key,
      project_key: session.project_key,
      created_at: session.created_at || created_at,
    }),
    created_at: session.created_at || created_at,
    updated_at: created_at,
    last_channel_key: normalizeChannel(channel || session.channel_key),
  };
}

function providerAssetIntakes(session = {}, actor = {}) {
  return (session.uploaded_assets || []).map((asset) => buildUnifiedFileMediaIntake({
    ...asset,
    actor: providerActor({ ...actor, workspace_key: session.workspace_key, project_key: session.project_key }),
    channel: asset.channel || session.channel_key,
    provider_id: session.provider_profile_id || actor.provider_id,
    audience_scope: { provider_id: session.provider_profile_id || actor.provider_id },
    workspace_key: session.workspace_key,
    project_key: session.project_key,
  }));
}

function buildProviderStudioDraftPackage(session = {}, actor = {}) {
  if (!session.onboarding_key) throw new Error('session is required');
  const canonicalActor = providerActor({ ...actor, workspace_key: session.workspace_key, project_key: session.project_key });
  const answers = session.answers || {};
  const studioSystem = 'service_provider_studio';
  const providerId = session.provider_profile_id || answers.provider_id || session.onboarding_key;

  const profileDraft = createDraft({
    object_type: 'website_section',
    object_id: `provider-profile-${providerId}`,
    conversation_key: session.conversation_key,
    channel: session.channel_key,
    actor: canonicalActor,
    audience_scope: { provider_id: providerId },
    workspace_key: session.workspace_key,
    project_key: session.project_key,
    metadata: { studio_system: studioSystem, studio_section: 'profile' },
  });
  const profileVersion = createDraftVersion({
    draft: profileDraft,
    actor: canonicalActor,
    channel: session.channel_key,
    content: {
      public_name: answers.public_name || answers.provider_name || '',
      category: answers.business_category || '',
      audience: answers.audience || '',
      age_ranges: answers.age_ranges || '',
      bio: answers.bio || answers.description || '',
      public_contact_settings: answers.public_contact_settings || {},
    },
    change_summary: 'Provider profile draft from assistant onboarding.',
    approval_state: 'needs_review',
    version_number: 1,
  });

  const websiteDraft = createDraft({
    object_type: 'website_section',
    object_id: `provider-website-${providerId}`,
    conversation_key: session.conversation_key,
    channel: session.channel_key,
    actor: canonicalActor,
    audience_scope: { provider_id: providerId },
    workspace_key: session.workspace_key,
    project_key: session.project_key,
    metadata: { studio_system: studioSystem, studio_section: 'website' },
  });
  const websiteVersion = createDraftVersion({
    draft: websiteDraft,
    actor: canonicalActor,
    channel: session.channel_key,
    content: {
      headline: answers.headline || answers.public_name || '',
      hero_media: answers.hero_media || '',
      cta: answers.cta || 'Join the Class',
      seo_fields: answers.seo_fields || {},
    },
    change_summary: 'Provider website draft from assistant onboarding.',
    approval_state: 'needs_review',
    version_number: 1,
  });

  const courseDraft = createDraft({
    object_type: 'course_outline',
    object_id: `provider-course-${providerId}`,
    conversation_key: session.conversation_key,
    channel: session.channel_key,
    actor: canonicalActor,
    audience_scope: { provider_id: providerId },
    workspace_key: session.workspace_key,
    project_key: session.project_key,
    metadata: { studio_system: studioSystem, studio_section: 'course' },
  });
  const courseVersion = createDraftVersion({
    draft: courseDraft,
    actor: canonicalActor,
    channel: session.channel_key,
    content: {
      program_name: answers.program_name || '',
      schedule: answers.schedule || '',
      lesson_structure: answers.lesson_structure || [],
      worksheet_plan: answers.worksheet_plan || '',
      community_model: answers.community_model || '',
    },
    change_summary: 'Provider class/course/community draft from assistant onboarding.',
    approval_state: 'needs_review',
    version_number: 1,
  });

  const previews = [
    createPreview({
      draft: profileDraft,
      version: profileVersion,
      actor: canonicalActor,
      channel: session.channel_key,
      preview_type: 'provider_listing',
      payload: { renderer: 'provider_listing_preview', provider_id: providerId },
      blockers: ['Operator approval required before publish.'],
    }),
    createPreview({
      draft: websiteDraft,
      version: websiteVersion,
      actor: canonicalActor,
      channel: session.channel_key,
      preview_type: 'provider_landing_page',
      payload: { renderer: 'service_provider_studio_preview', provider_id: providerId },
      blockers: ['Operator approval required before publish.'],
    }),
  ];

  const assetIntakes = providerAssetIntakes(session, canonicalActor);
  return {
    requirement_id: PROVIDER_ONBOARDING_REQUIREMENT_ID,
    studio_system: studioSystem,
    onboarding_key: session.onboarding_key,
    provider_profile_id: providerId,
    drafts: {
      profile: { draft: profileDraft, version: profileVersion },
      listing: { draft: profileDraft, version: profileVersion },
      website: { draft: websiteDraft, version: websiteVersion },
      brand: { assets: assetIntakes.filter((item) => item.linked_outcomes.some((outcome) => outcome.kind === 'provider_brand_asset')) },
      course: { draft: courseDraft, version: courseVersion },
      community: { draft: courseDraft, version: courseVersion },
      communications: {
        templates_required: ['welcome_template', 'invitation_template', 'class_reminder_template', 'support_template'],
        external_send_allowed: false,
      },
    },
    previews,
    launch_gate: buildProviderLaunchGate(session, { assetIntakes }),
    publish_allowed: false,
    external_write_performed: false,
  };
}

function buildProviderLaunchGate(session = {}, { assetIntakes = [] } = {}) {
  const answers = session.answers || {};
  const integrationBlockers = [];
  for (const [field, label] of [
    ['zoom_status', 'Zoom'],
    ['vimeo_status', 'Vimeo'],
    ['resend_status', 'Resend'],
    ['stripe_status', 'Stripe'],
    ['drive_calendar_status', 'Drive/Calendar'],
  ]) {
    if (!answers[field] || /missing|blocked|no_access|not_ready/i.test(String(answers[field]))) {
      integrationBlockers.push(`${label} readiness is not confirmed.`);
    }
  }
  const checklist = {
    public_listing_preview: Boolean(answers.public_listing_preview),
    landing_page_preview: Boolean(answers.landing_page_preview),
    portal_configuration: Boolean(answers.portal_configuration),
    class_course_draft: Boolean(answers.class_or_course_draft || answers.lesson_structure),
    communication_templates: Boolean(answers.welcome_template && answers.class_reminder_template),
    integration_blockers: integrationBlockers,
    asset_review_required: assetIntakes.some((item) => item.processing.status !== 'ready_for_parse' || item.privacy.classification !== 'role_scoped'),
    operator_approval_required: true,
    publish_allowed: false,
  };
  return {
    ...checklist,
    ready_for_operator_review: checklist.public_listing_preview
      && checklist.landing_page_preview
      && checklist.portal_configuration
      && checklist.class_course_draft
      && checklist.communication_templates
      && integrationBlockers.length === 0
      && !checklist.asset_review_required,
  };
}

function legacyProviderFormPolicy() {
  return {
    canonical_onboarding_system: 'assistant_onboarding_sessions',
    creation_editing_system: 'service_provider_studio',
    legacy_form_status: 'adapter_capture_only',
    separate_page_builder_allowed: false,
    separate_onboarding_forum_allowed: false,
    public_publish_requires_operator_approval: true,
  };
}

module.exports = {
  CONTRACT_VERSION,
  PROVIDER_ONBOARDING_REQUIREMENT_ID,
  PROVIDER_ONBOARDING_STAGES,
  STAGE_REQUIRED_FIELDS,
  buildProviderLaunchGate,
  buildProviderStudioDraftPackage,
  continueProviderOnboardingSession,
  createProviderOnboardingSession,
  legacyProviderFormPolicy,
  providerAssetIntakes,
};
