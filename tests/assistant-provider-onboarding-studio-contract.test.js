const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PROVIDER_ONBOARDING_STAGES,
  buildProviderLaunchGate,
  buildProviderStudioDraftPackage,
  continueProviderOnboardingSession,
  createProviderOnboardingSession,
  legacyProviderFormPolicy,
  providerAssetIntakes,
} = require('../src/platform/assistant/provider-onboarding-studio');

const providerActor = {
  user_id: 'rabbi-local',
  identity_key: 'identity_rabbi',
  role: 'provider_admin',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
  provider_id: 'sheller',
};

test('provider onboarding stages cover the assistant-led Studio launch journey', () => {
  assert.deepEqual(PROVIDER_ONBOARDING_STAGES, [
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
});

test('provider can start in Telegram and continue the same onboarding session on website assistant', () => {
  const started = createProviderOnboardingSession({
    actor: providerActor,
    channel: 'telegram',
    provider_id: 'sheller',
    conversation_key: 'conversation-provider-1',
    answers: {
      provider_identity_linked: true,
      consent_recorded: true,
      public_name: 'Rabbi Scheller Mishnah',
      business_category: 'Mishnah class',
    },
  });
  assert.equal(started.channel_key, 'telegram');
  assert.equal(started.current_stage, 'identity_business');
  assert.equal(started.status, 'in_progress');
  assert.ok(started.open_questions.includes('What should I use for audience?'));

  const continued = continueProviderOnboardingSession(started, {
    actor: providerActor,
    channel: 'website_assistant',
    answers: {
      audience: 'Boys ages 10-13',
      age_ranges: '10-13',
      languages: ['English'],
      service_area: 'Online and local',
      public_contact_settings: { show_business_phone: true, hide_home_address: true },
      program_name: 'Eight week Mishnah class',
    },
  });
  assert.equal(continued.onboarding_key, started.onboarding_key);
  assert.equal(continued.last_channel_key, 'website_assistant');
  assert.equal(continued.answers.public_name, 'Rabbi Scheller Mishnah');
  assert.equal(continued.answers.program_name, 'Eight week Mishnah class');
  assert.equal(continued.current_stage, 'offer');
});

test('Studio draft package creates profile/listing/website/course drafts and previews without publishing', () => {
  const session = createProviderOnboardingSession({
    actor: providerActor,
    channel: 'website_assistant',
    provider_id: 'sheller',
    conversation_key: 'conversation-provider-2',
    answers: {
      provider_identity_linked: true,
      consent_recorded: true,
      public_name: 'Rabbi Scheller Mishnah',
      business_category: 'Torah learning',
      audience: 'Boys ages 10-13',
      age_ranges: '10-13',
      languages: ['English'],
      service_area: 'Online',
      public_contact_settings: { business_phone_only: true },
      program_name: 'Eight week Mishnah class',
      format: 'Live class',
      schedule: 'Sunday evenings',
      pricing: 'Manual review',
      capacity: '15 students',
      description: 'Clear, structured Mishnah learning.',
      outcomes: 'Students can review independently.',
      logo: 'uploaded',
      brand_colors: ['navy', 'orange'],
      bio: 'Experienced rebbe.',
      photos_or_video: 'uploaded',
      hero_media: 'second photo',
      cta: 'Join the Class',
      seo_fields: { title: 'Mishnah class' },
      class_or_course_draft: true,
      lesson_structure: ['Week 1', 'Week 2'],
      worksheet_plan: 'Create from transcripts',
      community_model: 'Announcements and Q&A',
      moderation_settings: 'Provider moderated',
      welcome_template: 'Welcome draft',
      invitation_template: 'Invitation draft',
      class_reminder_template: 'Reminder draft',
      support_template: 'Support draft',
      approval_required: true,
      zoom_status: 'missing',
      vimeo_status: 'manual_review',
      resend_status: 'missing',
      stripe_status: 'not_ready',
      drive_calendar_status: 'ready',
      public_listing_preview: true,
      landing_page_preview: true,
      portal_configuration: true,
    },
    uploaded_assets: [
      {
        channel: 'telegram',
        filename: 'logo.png',
        mime_type: 'image/png',
        size_bytes: 20000,
        checksum: 'logo123',
        caption: 'Use this logo on my website.',
      },
    ],
  });
  const studio = buildProviderStudioDraftPackage(session, providerActor);

  assert.equal(studio.studio_system, 'service_provider_studio');
  assert.equal(studio.publish_allowed, false);
  assert.equal(studio.external_write_performed, false);
  assert.equal(studio.drafts.profile.version.content.public_name, 'Rabbi Scheller Mishnah');
  assert.equal(studio.drafts.website.version.content.cta, 'Join the Class');
  assert.equal(studio.drafts.course.version.content.lesson_structure.length, 2);
  assert.equal(studio.drafts.brand.assets[0].linked_outcomes[0].target, 'service_provider_studio_asset_review');
  assert.equal(studio.previews[0].preview_type, 'provider_listing');
  assert.equal(studio.previews[1].preview_type, 'provider_landing_page');
  assert.equal(studio.launch_gate.operator_approval_required, true);
  assert.equal(studio.launch_gate.publish_allowed, false);
  assert.ok(studio.launch_gate.integration_blockers.some((item) => /Zoom/.test(item)));
});

test('provider asset intake reuses the shared file/media contract', () => {
  const session = createProviderOnboardingSession({
    actor: providerActor,
    channel: 'telegram',
    provider_id: 'sheller',
    conversation_key: 'conversation-provider-3',
    uploaded_assets: [{
      channel: 'telegram',
      filename: 'hero.jpg',
      mime_type: 'image/jpeg',
      size_bytes: 100000,
      checksum: 'hero123',
      caption: 'Use the second photo in the hero.',
    }],
  });
  const intakes = providerAssetIntakes(session, providerActor);
  assert.equal(intakes.length, 1);
  assert.equal(intakes[0].contract_version, 'assistant-file-media-intake-v1');
  assert.equal(intakes[0].linked_outcomes[0].kind, 'provider_brand_asset');
  assert.equal(intakes[0].adapter_routing.channel_specific_business_logic_allowed, false);
});

test('launch gate requires previews, portal configuration, templates, integrations, and operator approval', () => {
  const blocked = buildProviderLaunchGate({
    answers: {
      public_listing_preview: true,
      landing_page_preview: false,
      portal_configuration: true,
      class_or_course_draft: true,
      welcome_template: 'Welcome',
      class_reminder_template: 'Reminder',
      zoom_status: 'missing',
    },
  });
  assert.equal(blocked.ready_for_operator_review, false);
  assert.equal(blocked.operator_approval_required, true);
  assert.equal(blocked.publish_allowed, false);
  assert.ok(blocked.integration_blockers.some((item) => /Zoom/.test(item)));

  const ready = buildProviderLaunchGate({
    answers: {
      public_listing_preview: true,
      landing_page_preview: true,
      portal_configuration: true,
      class_or_course_draft: true,
      welcome_template: 'Welcome',
      class_reminder_template: 'Reminder',
      zoom_status: 'ready',
      vimeo_status: 'ready',
      resend_status: 'ready',
      stripe_status: 'ready',
      drive_calendar_status: 'ready',
    },
  });
  assert.equal(ready.ready_for_operator_review, true);
  assert.equal(ready.publish_allowed, false);
});

test('legacy provider form is adapter capture only, not a competing onboarding forum or page builder', () => {
  assert.deepEqual(legacyProviderFormPolicy(), {
    canonical_onboarding_system: 'assistant_onboarding_sessions',
    creation_editing_system: 'service_provider_studio',
    legacy_form_status: 'adapter_capture_only',
    separate_page_builder_allowed: false,
    separate_onboarding_forum_allowed: false,
    public_publish_requires_operator_approval: true,
  });
});
