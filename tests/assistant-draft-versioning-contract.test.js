const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DRAFT_OBJECT_CATEGORIES,
  activateDraftVersion,
  compareDraftVersions,
  createDraft,
  createDraftVersion,
  createPreview,
  createTemplate,
  draftObjectCategory,
  rollbackDraftToVersion,
  validateDraftContent,
  versioningClarification,
} = require('../src/platform/assistant/draft-versioning');

const superAdmin = {
  user_id: 'shloimie-local',
  identity_key: 'identity_shloimie',
  role: 'super_admin',
  workspace_key: 'platform',
  project_key: 'bna',
};

const providerAdmin = {
  user_id: 'rabbi-local',
  identity_key: 'identity_rabbi',
  role: 'provider_admin',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
  provider_id: 'sheller',
};

const parent = {
  user_id: 'parent-local',
  identity_key: 'identity_parent',
  role: 'parent',
  parent_id: 'parent-1',
  linked_child_ids: ['101'],
};

test('draft/version contract covers every reusable addendum object type', () => {
  for (const objectType of [
    'email',
    'sms',
    'whatsapp',
    'telegram_message',
    'announcement',
    'landing_page_copy',
    'website_section',
    'chart_layout',
    'worksheet',
    'course_outline',
    'onboarding_script',
    'automation',
    'support_macro',
  ]) {
    assert.ok(DRAFT_OBJECT_CATEGORIES[objectType], `${objectType} has a category`);
    assert.equal(draftObjectCategory(objectType), DRAFT_OBJECT_CATEGORIES[objectType]);
  }
});

test('super-admin email drafts create complete version rows and active-version selection', () => {
  const draft = createDraft({
    object_type: 'email',
    object_id: 'campaign-1000',
    conversation_key: 'conversation_1',
    channel: 'telegram',
    actor: superAdmin,
    audience_scope: { audience: 'leads', segment_id: 'seg_1000' },
  });
  assert.equal(draft.object_type, 'email');
  assert.equal(draft.object_id, 'campaign-1000');
  assert.equal(draft.channel_key, 'telegram');
  assert.equal(draft.metadata.typed_action_required, true);
  assert.equal(draft.object_category, 'email_campaign');

  const version1 = createDraftVersion({
    draft,
    actor: superAdmin,
    channel: 'telegram',
    content: { subject: 'Join the class', body: 'Message one draft.' },
    prompt_instruction: 'Draft the first email.',
    change_summary: 'Initial short direct version.',
    approval_state: 'needs_review',
    version_number: 1,
    created_at: '2026-06-23T18:00:00.000Z',
  });
  assert.equal(version1.draft_key, draft.draft_key);
  assert.equal(version1.object_id, 'campaign-1000');
  assert.equal(version1.parent_version_key, '');
  assert.equal(version1.editor_identity_key, 'identity_shloimie');
  assert.equal(version1.channel_key, 'telegram');
  assert.equal(version1.prompt_instruction, 'Draft the first email.');
  assert.equal(version1.approval_state, 'needs_review');
  assert.equal(version1.active_state, 'inactive');
  assert.equal(version1.scheduled_use_state, 'not_scheduled');

  const version2 = createDraftVersion({
    draft,
    actor: superAdmin,
    channel: 'website_assistant',
    parent_version_key: version1.version_key,
    content: { subject: 'Join the class', body: 'Shorter message.' },
    prompt_instruction: 'Make it shorter.',
    change_summary: 'Shortened body.',
    approval_state: 'approved',
    version_number: 2,
    created_at: '2026-06-23T18:05:00.000Z',
  });
  const activated = activateDraftVersion({
    draft,
    version: version2,
    versions: [version1],
    use_state: 'selected',
  });
  assert.equal(activated.draft.active_version_key, version2.version_key);
  assert.equal(activated.draft.approval_state, 'approved');
  assert.equal(activated.versions.find((item) => item.version_key === version2.version_key).active_state, 'active');
  assert.equal(activated.versions.find((item) => item.version_key === version1.version_key).active_state, 'inactive');
});

test('previews identify data source, audience, blockers, and external-action risk', () => {
  const draft = createDraft({
    object_type: 'announcement',
    object_id: 'class-announcement-1',
    channel: 'website_assistant',
    actor: superAdmin,
    audience_scope: { audience: 'parents', workspace: 'bna' },
  });
  const version = createDraftVersion({
    draft,
    actor: superAdmin,
    content: { title: 'Class reminder', body: 'Reminder copy.' },
    change_summary: 'Parent reminder copy.',
    approval_state: 'approved',
    version_number: 1,
  });
  const preview = createPreview({
    draft,
    version,
    actor: superAdmin,
    channel: 'website_assistant',
    preview_type: 'mobile_announcement',
    real_data: true,
    sample_data: false,
    external_action: true,
    blockers: ['External send approval is still required.'],
    payload: { renderer: 'telegram_summary_and_secure_deep_link', title: 'Class reminder' },
  });
  assert.equal(preview.preview_type, 'mobile_announcement');
  assert.equal(preview.draft_version_key, version.version_key);
  assert.equal(preview.real_data, true);
  assert.equal(preview.sample_data, false);
  assert.equal(preview.external_action, true);
  assert.deepEqual(preview.blockers, ['External send approval is still required.']);
  assert.equal(preview.status, 'draft');
});

test('parent chart layout drafts are linked-child scoped and cannot become email campaigns', () => {
  const chartDraft = createDraft({
    object_type: 'chart_layout',
    object_id: 'weekly-view',
    channel: 'parent_portal_assistant',
    actor: parent,
    audience_scope: { child_id: '101', parent_id: 'parent-1' },
  });
  assert.equal(chartDraft.object_category, 'dashboard_layout');
  assert.equal(chartDraft.workspace_key, 'bna');

  assert.throws(() => createDraft({
    object_type: 'chart_layout',
    object_id: 'other-child-view',
    channel: 'parent_portal_assistant',
    actor: parent,
    audience_scope: { child_id: '202', parent_id: 'parent-1' },
  }), /permission_denied: relationship_scope_mismatch/);

  assert.throws(() => createDraft({
    object_type: 'email',
    object_id: 'parent-email',
    channel: 'parent_portal_assistant',
    actor: parent,
    audience_scope: { child_id: '101', parent_id: 'parent-1' },
  }), /permission_denied: role_category_denied/);
});

test('provider website sections reuse Studio-scoped draft/version rows', () => {
  const draft = createDraft({
    object_type: 'website_section',
    object_id: 'studio-home-hero',
    channel: 'provider_portal_assistant',
    actor: providerAdmin,
    audience_scope: { provider_id: 'sheller' },
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    metadata: { studio_system: 'service_provider_studio' },
  });
  const version = createDraftVersion({
    draft,
    actor: providerAdmin,
    content: { headline: 'Mishnah with clarity', cta: 'Join the Class' },
    change_summary: 'Updated provider hero copy.',
    approval_state: 'draft',
    version_number: 4,
  });

  assert.equal(draft.object_category, 'provider_website');
  assert.equal(draft.metadata.studio_system, 'service_provider_studio');
  assert.equal(version.object_type, 'website_section');
  assert.equal(version.audience_scope.provider_id, 'sheller');
});

test('rollback creates a new version linked to the target version and compare shows changed fields', () => {
  const draft = createDraft({
    object_type: 'telegram_message',
    object_id: 'status-report',
    channel: 'telegram',
    actor: superAdmin,
  });
  const version1 = createDraftVersion({
    draft,
    actor: superAdmin,
    content: { body: 'Version one.' },
    change_summary: 'First version.',
    approval_state: 'approved',
    version_number: 1,
  });
  const version2 = createDraftVersion({
    draft,
    actor: superAdmin,
    parent_version_key: version1.version_key,
    content: { body: 'Version two.' },
    change_summary: 'Second version.',
    approval_state: 'approved',
    version_number: 2,
  });
  const diff = compareDraftVersions(version1, version2);
  assert.equal(diff.same_draft, true);
  assert.deepEqual(diff.changed_fields, ['body']);

  const active = activateDraftVersion({ draft, version: version2, versions: [version1] });
  const rollback = rollbackDraftToVersion({
    draft: active.draft,
    target_version: version1,
    actor: superAdmin,
    reason: 'Go back to version 1.',
    created_at: '2026-06-23T18:10:00.000Z',
  });
  assert.equal(rollback.draft.active_version_key, rollback.versions[0].version_key);
  assert.equal(rollback.versions[0].rollback_to_version_key, version1.version_key);
  assert.equal(rollback.versions[0].parent_version_key, version2.version_key);
});

test('templates use the same object model and draft content rejects code or CSS injection', () => {
  const template = createTemplate({
    template_type: 'support_macro',
    name: 'Broken Zoom Link',
    channel: 'website_assistant',
    actor: superAdmin,
    content: { body: 'We are checking the class link and will update you here.' },
    status: 'active',
  });
  assert.equal(template.template_type, 'support_macro');
  assert.equal(template.status, 'active');
  assert.equal(template.channel_key, 'website_assistant');

  assert.equal(validateDraftContent({ body: 'Plain copy is fine.' }).valid, true);
  assert.equal(validateDraftContent({ custom_css: '.x { display:none }' }).valid, false);
  assert.equal(validateDraftContent({ body: '<script>alert(1)</script>' }).valid, false);

  assert.throws(() => createDraftVersion({
    draft: createDraft({ object_type: 'landing_page_copy', object_id: 'summer', actor: superAdmin }),
    actor: superAdmin,
    content: { raw_html: '<div onclick=\"send()\">Bad</div>' },
  }), /draft_content_rejected/);
});

test('clarification questions appear only when version/audience ambiguity matters', () => {
  const newDraftClarification = versioningClarification({
    draft: {},
    requested_audience_scope: {},
    operation: 'draft',
  });
  assert.equal(newDraftClarification.needs_question, false);

  const existingDraftClarification = versioningClarification({
    draft: { active_version_key: 'version_1', audience_scope: { audience: 'parents' } },
    current_version: { audience_scope: { audience: 'parents' } },
    requested_audience_scope: { audience: 'leads' },
    operation: 'save',
  });
  assert.equal(existingDraftClarification.needs_question, true);
  assert.deepEqual(existingDraftClarification.questions, [
    'Save this as a new version or replace the current draft?',
    'Apply this only to the requested audience or make it the default?',
  ]);
});
