const test = require('node:test');
const assert = require('node:assert/strict');

const {
  attachmentFingerprint,
  buildSourceEnvelope,
  buildUnifiedFileMediaIntake,
  classifyMediaType,
  classifyPrivacy,
  inferOutcomeKind,
  isDuplicateIntake,
  validateAttachment,
} = require('../src/platform/assistant/file-media-intake');

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

test('Telegram and website uploads share content fingerprint and one intake contract', () => {
  const telegram = buildUnifiedFileMediaIntake({
    channel: 'telegram',
    actor: providerAdmin,
    file_id: 'telegram-file-1',
    file_unique_id: 'asset-same',
    filename: 'provider-logo.png',
    mime_type: 'image/png',
    size_bytes: 120000,
    checksum: 'abc123',
    caption: 'Use this logo on my website.',
    provider_id: 'sheller',
    audience_scope: { provider_id: 'sheller' },
    metadata: { forwarded_from: 'provider-private-chat' },
  });
  const website = buildUnifiedFileMediaIntake({
    channel: 'website_assistant',
    actor: providerAdmin,
    file_id: 'browser-upload-1',
    filename: 'provider-logo.png',
    mime_type: 'image/png',
    size_bytes: 120000,
    checksum: 'abc123',
    caption: 'Use this logo on my website.',
    provider_id: 'sheller',
    audience_scope: { provider_id: 'sheller' },
  });

  assert.equal(telegram.contract_version, 'assistant-file-media-intake-v1');
  assert.equal(telegram.content_fingerprint, website.content_fingerprint);
  assert.equal(telegram.idempotency_key, website.idempotency_key);
  assert.equal(telegram.source_envelope.immutable, true);
  assert.equal(telegram.source_envelope.raw_preserved, true);
  assert.equal(telegram.adapter_routing.telegram_buttons_allowed, true);
  assert.equal(website.adapter_routing.website_cards_allowed, true);
  assert.equal(telegram.adapter_routing.channel_specific_business_logic_allowed, false);
  assert.equal(telegram.linked_outcomes[0].kind, 'provider_brand_asset');
  assert.equal(telegram.linked_outcomes[0].target, 'service_provider_studio_asset_review');
});

test('source envelopes preserve adapter metadata while normalizing website assistant to the existing source provider', () => {
  const envelope = buildSourceEnvelope({
    channel: 'website_assistant',
    actor: superAdmin,
    source_id: 'upload-1',
    filename: 'lesson.pdf',
    mime_type: 'application/pdf',
    source_link: 'https://example.test/lesson.pdf',
  });

  assert.equal(envelope.source_envelope_id, envelope.source_record.stable_key);
  assert.equal(envelope.source_record.source_provider, 'website_bot');
  assert.equal(envelope.source_record.source_channel, 'website_bot');
  assert.equal(envelope.adapter_metadata.channel, 'website_assistant');
});

test('type and size checks block unsafe files and require virus scan for media', () => {
  assert.equal(classifyMediaType({ mime_type: 'video/mp4', filename: 'class.mp4' }), 'video');
  assert.equal(classifyMediaType({ mime_type: 'application/pdf', filename: 'worksheet.pdf' }), 'document');

  const safe = validateAttachment({
    filename: 'voice-note.ogg',
    mime_type: 'audio/ogg',
    size_bytes: 1000,
  });
  assert.equal(safe.ok, true);
  assert.equal(safe.media_type, 'audio');
  assert.equal(safe.needs_virus_scan, true);

  const blocked = validateAttachment({
    filename: 'installer.exe',
    mime_type: 'application/x-msdownload',
    size_bytes: 1000,
  });
  assert.equal(blocked.ok, false);
  assert.deepEqual(blocked.errors, [
    'blocked_extension:exe',
    'blocked_mime:application/x-msdownload',
  ]);
});

test('privacy classification flags forwarded group chats, student context, and secret-like content', () => {
  assert.equal(classifyPrivacy({
    channel: 'telegram',
    raw_text: 'Forwarded from group chat',
    metadata: { chat_type: 'group' },
  }).classification, 'group_sensitive');

  assert.equal(classifyPrivacy({
    channel: 'website_assistant',
    raw_text: 'Avi attendance and payment question from parent note.',
  }).classification, 'student_or_family_sensitive');

  assert.equal(classifyPrivacy({
    channel: 'telegram',
    raw_text: 'Here is the API key token.',
  }).classification, 'secret_risk');
});

test('class recordings and worksheets route to canonical planned outcomes without writes', () => {
  const recording = buildUnifiedFileMediaIntake({
    channel: 'telegram',
    actor: providerAdmin,
    filename: 'class-01.mp4',
    mime_type: 'video/mp4',
    size_bytes: 2200000,
    checksum: 'recording123',
    caption: 'Turn this recording into a lesson for the One Time class.',
    transcript_text: 'Class transcript about Mishnah.',
    provider_id: 'sheller',
    audience_scope: { provider_id: 'sheller' },
  });
  assert.equal(recording.linked_outcomes[0].kind, 'class_course_media');
  assert.equal(recording.linked_outcomes[0].external_write_performed, false);
  assert.equal(recording.transcript.text_present, true);
  assert.equal(recording.processing.status, 'ready_for_parse');

  const worksheet = buildUnifiedFileMediaIntake({
    channel: 'website_assistant',
    actor: providerAdmin,
    filename: 'worksheet.pdf',
    mime_type: 'application/pdf',
    size_bytes: 30000,
    checksum: 'worksheet123',
    caption: 'Add this PDF as a worksheet.',
    provider_id: 'sheller',
    audience_scope: { provider_id: 'sheller' },
  });
  assert.equal(worksheet.linked_outcomes[0].kind, 'worksheet_resource');
  assert.equal(inferOutcomeKind({ caption: 'Attach this screenshot to the ticket.' }, 'image'), 'ticket_attachment');
});

test('ambiguous child/person matching requires human review and blocks auto-parse', () => {
  const intake = buildUnifiedFileMediaIntake({
    channel: 'website_assistant',
    actor: parent,
    filename: 'practice-note.m4a',
    mime_type: 'audio/mp4',
    size_bytes: 25000,
    checksum: 'practice123',
    caption: 'Make a parent update from this voice note.',
    audience_scope: { parent_id: 'parent-1', child_id: '101' },
    candidate_matches: [
      { object_type: 'student', object_id: '101', label: 'Avi', confidence: 0.62 },
      { object_type: 'student', object_id: '102', label: 'Avraham', confidence: 0.61 },
    ],
  });
  assert.equal(intake.workspace_resolution.status, 'needs_human_review');
  assert.equal(intake.workspace_resolution.human_review_required, true);
  assert.equal(intake.processing.status, 'needs_review');
  assert.ok(intake.preview.blockers.includes('ambiguous_object_match'));
});

test('relationship and workspace policy is enforced through the shared control plane', () => {
  assert.throws(() => buildUnifiedFileMediaIntake({
    channel: 'parent_portal_assistant',
    actor: parent,
    filename: 'other-child.png',
    mime_type: 'image/png',
    size_bytes: 1000,
    checksum: 'other-child',
    audience_scope: { parent_id: 'parent-1', child_id: '202' },
  }), /permission_denied: relationship_scope_mismatch/);
});

test('duplicate intake detection uses stable idempotency and content fingerprints', () => {
  assert.equal(attachmentFingerprint({ checksum: 'ABC123' }), 'abc123');
  const first = buildUnifiedFileMediaIntake({
    channel: 'telegram',
    actor: superAdmin,
    filename: 'screenshot.png',
    mime_type: 'image/png',
    size_bytes: 1000,
    checksum: 'screenshot123',
    caption: 'Attach this screenshot to the ticket.',
  });
  const replay = buildUnifiedFileMediaIntake({
    channel: 'website_assistant',
    actor: superAdmin,
    filename: 'screenshot-copy.png',
    mime_type: 'image/png',
    size_bytes: 1000,
    checksum: 'screenshot123',
    caption: 'Attach this screenshot to the ticket.',
  });

  assert.equal(isDuplicateIntake(replay, [first]), true);
  assert.equal(replay.evidence.no_duplicate_content_jobs, true);
  assert.equal(replay.evidence.retry_resume_key, first.idempotency_key);
});
