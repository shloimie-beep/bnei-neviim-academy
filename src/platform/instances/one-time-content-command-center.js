const oneTimeBrandConfig = require('../../../config/brands/one-time.json');
const oneTimeSiteConfig = require('../../../config/service-provider-sites/one-time.json');
const {
  buildOneTimeSharedReviewData,
} = require('./one-time-shared-review-data');

const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const APPROVAL_PHRASE = 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING';
const PRIVATE_QUESTION_WITHHELD = '[private question body withheld from command center contract]';

const ONE_TIME_CONTENT_SECTIONS = Object.freeze([
  { key: 'meeting_drops', label: 'Meeting Drops' },
  { key: 'class_library', label: 'Class Library' },
  { key: 'worksheets_source_sheets', label: 'Worksheets / Source Sheets' },
  { key: 'questions_replies', label: 'Questions & Replies' },
  { key: 'approved_assets', label: 'Approved Assets' },
  { key: 'publishing_readiness', label: 'Publishing Readiness' },
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactText(value, limit = 240) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function contentSection(key, body = {}) {
  const section = ONE_TIME_CONTENT_SECTIONS.find((item) => item.key === key);
  if (!section) throw new Error(`Unknown One Time content section: ${key}`);
  return {
    key,
    label: section.label,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    ...body,
  };
}

function reviewDataLooksResolved(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    value.workspace_key === WORKSPACE_KEY &&
    value.project_key === PROJECT_KEY &&
    (value.provider_portal || value.classroom)
  );
}

function resolveSharedReviewData(reviewDataOrOptions = {}) {
  const input = reviewDataOrOptions || {};
  if (reviewDataLooksResolved(input)) return input;
  if (reviewDataLooksResolved(input.reviewData)) return input.reviewData;
  return buildOneTimeSharedReviewData(input);
}

function buildNoWritePreviewStatus(actionKey, overrides = {}) {
  const status = {
    action_key: actionKey,
    status: 'preview_only',
    review_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    no_send: true,
    no_upload: true,
    no_external_write: true,
    no_notifications: true,
    no_member_content_publish: true,
    no_zoom_create: true,
    no_vimeo_upload: true,
    no_charge: true,
    no_write_language: 'Preview/read-only state only. No send, upload, meeting creation, payment, external write, or member-content publish runs from this contract.',
  };
  return {
    ...status,
    ...overrides,
  };
}

function externalBlockers(reviewData = {}) {
  return asArray(reviewData.external_blockers).map((item) => compactText(item, 500)).filter(Boolean);
}

function matchingExternalBlocker(reviewData, pattern, fallback = '') {
  return externalBlockers(reviewData).find((item) => pattern.test(item)) || fallback;
}

function buildContentBlockers(reviewData = {}) {
  const transcription = matchingExternalBlocker(
    reviewData,
    /transcription|invalid_credential|credential/i,
    'Hosted transcription remains blocked until a valid credential is approved.',
  );
  const vimeo = matchingExternalBlocker(
    reviewData,
    /vimeo|upload/i,
    'Automated Vimeo upload waits for user-level Vimeo authorization and upload policy.',
  );
  const zoom = matchingExternalBlocker(
    reviewData,
    /zoom|meeting/i,
    'Real Zoom class creation remains operator-gated to prevent duplicate meetings.',
  );
  const resend = matchingExternalBlocker(
    reviewData,
    /email|resend|sender|domain/i,
    'Live email sending waits for Resend sender/domain readiness and approved send policy.',
  );
  const billing = matchingExternalBlocker(
    reviewData,
    /billing|checkout|stripe|charge/i,
    'Real billing/checkout waits for Stripe live-mode decision and operator approval.',
  );
  const infrastructure = matchingExternalBlocker(
    reviewData,
    /railway|dns/i,
    'Separate One Time infrastructure and DNS remain paused for review.',
  );

  return [
    {
      key: 'hosted_transcription_credential',
      label: 'Hosted transcription credential',
      owner: 'Shloimie setup needed',
      status: 'blocked',
      blocked_actions: ['hosted_transcription_retry', 'automatic_transcript_processing'],
      blocker: transcription,
    },
    {
      key: 'manual_vimeo_reference_only',
      label: 'Vimeo upload authorization',
      owner: 'Rabbi decision needed',
      status: 'blocked',
      blocked_actions: ['automated_vimeo_upload', 'video_host_write'],
      blocker: vimeo,
    },
    {
      key: 'zoom_creation_gate',
      label: 'Zoom meeting creation',
      owner: 'Rabbi decision needed',
      status: 'blocked',
      blocked_actions: ['real_zoom_meeting_creation', 'send_join_links'],
      blocker: zoom,
    },
    {
      key: 'resend_sender_domain',
      label: 'Email sender/domain readiness',
      owner: 'Shloimie setup needed',
      status: 'blocked',
      blocked_actions: ['live_email_send', 'notification_send'],
      blocker: resend,
    },
    {
      key: 'billing_live_mode',
      label: 'Billing/live charge approval',
      owner: 'Rabbi decision needed',
      status: 'blocked',
      blocked_actions: ['checkout', 'charge', 'access_grant_from_payment'],
      blocker: billing,
    },
    {
      key: 'separate_infrastructure_paused',
      label: 'Separate Railway/DNS setup',
      owner: 'Shloimie setup needed',
      status: 'blocked',
      blocked_actions: ['dns_change', 'separate_service_provisioning'],
      blocker: infrastructure,
    },
  ];
}

function buildMeetingDropsSection(reviewData = {}) {
  const classSession = reviewData.provider_portal?.class_session || {};
  const transcriptionBlocker = buildContentBlockers(reviewData).find((item) => item.key === 'hosted_transcription_credential');
  return contentSection('meeting_drops', {
    summary: 'Drive briefs and recording intake stay preview-only until transcript processing and owner decisions are cleared.',
    intake: {
      source_types: ['drive_brief', 'recording', 'manual_review_note'],
      route: '/api/bna/project-meetings/one-time-drive-brief/preview',
      sample_session_id: classSession.id || 'TEST-OT-CLASS-001',
      sample_session_title: classSession.title || 'TEST Weekly Mishnah Live Class',
      raw_transcript_body_included: false,
    },
    preview_action_status: buildNoWritePreviewStatus('ACTION-ONETIME-DRIVE-BRIEF-PREVIEW', {
      label: 'Preview Drive Brief',
      status: 'no_write_preview',
      parser_preview_only: true,
    }),
    transcript_processing_status: {
      status: 'review_pending',
      transcript_body_included: false,
      transcript_notes_included: false,
      safe_fields: ['status', 'updated_at', 'source metadata', 'counts', 'blockers'],
    },
    hosted_transcription_blocker: transcriptionBlocker,
    no_write_language: 'Meeting drops may preview routing, counts, decisions, and blockers only; they do not write production records or retry hosted transcription.',
  });
}

function buildClassLibrarySection(reviewData = {}) {
  const portal = reviewData.provider_portal || {};
  const classSession = portal.class_session || {};
  const video = portal.video || reviewData.classroom?.today_video || {};
  const lesson = portal.lesson || {};
  const worksheet = portal.worksheet || {};
  const blockers = buildContentBlockers(reviewData);
  const vimeoBlocker = blockers.find((item) => item.key === 'manual_vimeo_reference_only');
  return contentSection('class_library', {
    summary: 'Class packages are review-scoped and may reference manual hosted media while upload/publish remains gated.',
    class_packages: [
      {
        id: classSession.id || video.id || 'TEST-OT-CLASS-001',
        title: classSession.title || video.title || 'TEST One Time class package',
        class_date: video.class_date || classSession.starts_at || '',
        masechta: classSession.masechta || '',
        perek: classSession.perek || '',
        mishnah_range: classSession.mishnah_range || '',
        package_status: video.package_status || classSession.package_status || 'review_only',
        transcript_status: video.transcript_status || classSession.transcript_status || 'pending review',
        transcript_body_included: false,
        manual_vimeo_reference: {
          label: 'Manual Vimeo sample/reference only',
          review_only: true,
          automated_upload: false,
          provider: video.provider || 'vimeo_manual_reference',
          media_provider: video.media_provider || 'Vimeo manual/sample reference',
          media_url: video.media_url || '',
          embed_url: video.embed_url || '',
          vimeo_video_id: video.vimeo_video_id || '',
          blocker: video.blocker || vimeoBlocker?.blocker || '',
        },
        lesson_links: [
          {
            id: lesson.id || 'TEST-OT-LESSON-001',
            title: lesson.title || video.title || 'Review lesson',
            status: lesson.status || 'review_only',
          },
        ],
        worksheet_links: [
          {
            id: worksheet.id || 'TEST-OT-WORKSHEET-001',
            title: worksheet.title || 'Worksheet/source sheet',
            url: worksheet.url || reviewData.links?.classroom || '',
            status: worksheet.status || 'review_only',
            safe_open_behavior: 'Open existing review/member-library link only; no Drive, Classroom, email, or portal write.',
          },
        ],
      },
    ],
    action_statuses: {
      package_preview: buildNoWritePreviewStatus('ACTION-ONETIME-CLASS-PACKAGE-PREVIEW', {
        label: 'Package Preview',
      }),
      member_preview: buildNoWritePreviewStatus('ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW', {
        label: 'Member Preview',
      }),
      approve: buildNoWritePreviewStatus('ACTION-ONETIME-MEMBER-LIBRARY-APPROVE', {
        label: 'Approve',
        status: 'gated_internal_review',
        requires_approval_phrase: APPROVAL_PHRASE,
        approval_records_internal_state_only: true,
      }),
      publish: buildNoWritePreviewStatus('ACTION-ONETIME-MEMBER-LIBRARY-PUBLISH', {
        label: 'Publish',
        status: 'blocked_until_approval_phrase',
        requires_approval_phrase: APPROVAL_PHRASE,
        member_content_published: false,
      }),
      rollback: buildNoWritePreviewStatus('ACTION-ONETIME-MEMBER-LIBRARY-ROLLBACK', {
        label: 'Rollback',
        status: 'blocked_until_approval_phrase',
        requires_approval_phrase: APPROVAL_PHRASE,
      }),
    },
    upload_blockers: blockers.filter((item) => ['manual_vimeo_reference_only', 'separate_infrastructure_paused'].includes(item.key)),
    publish_blockers: blockers.filter((item) => ['manual_vimeo_reference_only', 'resend_sender_domain', 'billing_live_mode'].includes(item.key)),
  });
}

function buildWorksheetsSourceSheetsSection(reviewData = {}) {
  const portal = reviewData.provider_portal || {};
  const classSession = portal.class_session || {};
  const worksheet = portal.worksheet || {};
  return contentSection('worksheets_source_sheets', {
    summary: 'Worksheet/source-sheet records attach to the One Time class package and open only in safe preview/member-library views.',
    worksheets: [
      {
        id: worksheet.id || 'TEST-OT-WORKSHEET-001',
        title: worksheet.title || 'TEST Pesachim Perek 10 Worksheet',
        attached_class_session_id: classSession.id || 'TEST-OT-CLASS-001',
        attached_class_title: classSession.title || 'TEST Weekly Mishnah Live Class',
        status: worksheet.status || 'review_only',
        url: worksheet.url || reviewData.links?.classroom || '',
        safe_open_behavior: 'Open the linked review resource only. Do not create Google Classroom coursework, Drive files, emails, messages, or public posts.',
      },
    ],
    source_sheets: [
      {
        attached_class_session_id: classSession.id || 'TEST-OT-CLASS-001',
        status: classSession.source_sheet_draft ? 'draft_available' : 'review_needed',
        draft_body_included: false,
        safe_preview_behavior: 'Show status, title, and link metadata only; keep source-sheet drafting first-party and approval-gated.',
      },
    ],
    preview_status: buildNoWritePreviewStatus('ACTION-ONETIME-WORKSHEET-SOURCE-SHEET-PREVIEW', {
      label: 'Open / Preview Worksheet',
    }),
  });
}

function buildQuestionsRepliesSection(reviewData = {}) {
  const privateQuestion = reviewData.provider_portal?.private_question || reviewData.student_portal?.private_question || {};
  return contentSection('questions_replies', {
    summary: 'Student questions and replies stay private until Rabbi/admin moderation chooses a safe next state.',
    private_student_questions: [
      {
        id: privateQuestion.id || 'TEST-OT-Q-001',
        title: privateQuestion.title || 'Private student question',
        body_preview: PRIVATE_QUESTION_WITHHELD,
        raw_body_included: false,
        visibility: privateQuestion.visibility || 'student_private',
        status: privateQuestion.status || 'submitted_for_rabbi_review',
        review_scope: 'rabbi_admin_only',
      },
    ],
    rabbi_replies: {
      status: 'moderation_required',
      reply_body_included: false,
      allowed_states: ['hold_private', 'approve_parent_safe_reply', 'reject_private', 'feature_after_review'],
    },
    moderation_state: {
      parent_hold: 'available',
      approve: 'gated_by_rabbi_review',
      reject: 'private_rejection_only',
      feature: 'gated_by_rabbi_admin_choice',
      public_forum_created: false,
      member_visible_by_default: false,
    },
    privacy_guardrails: [
      'Private question body is not duplicated in this command-center contract.',
      'No public forum post, parent notification, email, WhatsApp, SMS, or portal notification is created from review state.',
      'Question/reply records stay scoped to rabbi_sheller_provider / one_time_mishnah_class.',
    ],
    preview_status: buildNoWritePreviewStatus('ACTION-ONETIME-QUESTION-REPLY-REVIEW', {
      label: 'Question/Reply Moderation Preview',
    }),
  });
}

function buildApprovedAssetsSection(reviewData = {}) {
  const brandAssets = oneTimeBrandConfig.assets || {};
  const siteAssets = oneTimeSiteConfig.assets || {};
  return contentSection('approved_assets', {
    summary: 'Approved One Time review assets are read from committed brand config and shared review data.',
    source_configs: [
      'config/brands/one-time.json',
      'config/service-provider-sites/one-time.json',
      reviewData.brand?.site_config || 'config/service-provider-sites/one-time.json',
    ],
    logo: {
      src: brandAssets.logo,
      review_data_src: reviewData.brand?.logo || '',
      source: 'config/brands/one-time.json',
    },
    hero_portrait: {
      src: brandAssets.hero_portrait,
      review_data_src: reviewData.brand?.hero || '',
      source: 'config/brands/one-time.json',
    },
    teaching_stills: asArray(brandAssets.teaching_stills).map((src) => ({
      src,
      source: 'config/brands/one-time.json',
      status: 'stage_only_review_asset',
    })),
    social_image: {
      src: brandAssets.social_og || siteAssets.social_og || '',
      source: 'config/brands/one-time.json',
    },
    press_logo_inventory: asArray(brandAssets.press_logos).map((src) => ({
      src,
      source: 'config/brands/one-time.json',
      status: 'legacy_inventory_review_only',
    })),
    rights_safe_note: oneTimeSiteConfig.proof_note || 'Review inventory only; does not imply sponsorship, endorsement, or permission status.',
    external_write_performed: false,
  });
}

function buildPublishingReadinessSection(reviewData = {}) {
  const blockers = buildContentBlockers(reviewData);
  return contentSection('publishing_readiness', {
    summary: 'Final publish/send/upload paths are blocked or approval-gated; preview data is ready for Rabbi dashboard integration.',
    ready_items: [
      { key: 'shared_review_packet', label: 'Shared One Time review data', status: 'ready_for_preview' },
      { key: 'manual_vimeo_reference', label: 'Manual Vimeo sample/reference only', status: 'review_ready' },
      { key: 'worksheet_preview', label: 'Worksheet/source-sheet preview link', status: 'review_ready' },
      { key: 'approved_assets', label: 'Approved One Time asset inventory', status: 'review_ready' },
      { key: 'no_write_drive_preview', label: 'Drive brief preview action', status: 'preview_only' },
    ],
    blocked_items: blockers.map((item) => ({
      key: item.key,
      label: item.label,
      owner: item.owner,
      blocked_actions: item.blocked_actions,
      blocker: item.blocker,
    })),
    rabbi_decisions_needed: blockers
      .filter((item) => /Rabbi/.test(item.owner))
      .map((item) => ({
        key: item.key,
        label: item.label,
        next_action: item.blocker,
      })),
    shloimie_setup_needed: blockers
      .filter((item) => /Shloimie/.test(item.owner))
      .map((item) => ({
        key: item.key,
        label: item.label,
        next_action: item.blocker,
      })),
    preview_only_states: [
      buildNoWritePreviewStatus('ONE_TIME_CONTENT_COMMAND_CENTER_PREVIEW', {
        label: 'Content Command Center Contract',
      }),
      buildNoWritePreviewStatus('ACTION-ONETIME-DRIVE-BRIEF-PREVIEW', {
        label: 'Drive Brief Preview',
      }),
      buildNoWritePreviewStatus('ACTION-ONETIME-MEMBER-LIBRARY-PREVIEW', {
        label: 'Member Preview',
      }),
    ],
    approval_phrase: APPROVAL_PHRASE,
  });
}

function buildOneTimeContentCommandCenter(reviewDataOrOptions = {}) {
  const reviewData = resolveSharedReviewData(reviewDataOrOptions);
  const blockers = buildContentBlockers(reviewData);
  const sections = [
    buildMeetingDropsSection(reviewData),
    buildClassLibrarySection(reviewData),
    buildWorksheetsSourceSheetsSection(reviewData),
    buildQuestionsRepliesSection(reviewData),
    buildApprovedAssetsSection(reviewData),
    buildPublishingReadinessSection(reviewData),
  ];
  return {
    schema_version: 'one-time-content-command-center-v1',
    generated_at: reviewData.generated_at,
    source_schema_version: reviewData.schema_version,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    review_only: true,
    external_write_performed: false,
    secrets_included: false,
    no_write_status: buildNoWritePreviewStatus('ONE_TIME_CONTENT_COMMAND_CENTER_CONTRACT', {
      label: 'One Time Content Command Center data/view contract',
    }),
    sections,
    section_map: Object.fromEntries(sections.map((section) => [section.key, section])),
    blockers,
    guardrails: [
      'Use only rabbi_sheller_provider / one_time_mishnah_class records.',
      'Do not duplicate raw private transcript bodies or private student question bodies.',
      'Manual Vimeo reference stays manual/sample/review-only until upload authorization is approved.',
      'Publish, send, upload, meeting creation, billing, and notification actions stay gated or preview-only.',
      'Do not expose secrets, passwords, tokens, API keys, or private account credentials.',
      'Do not mix BNA school accountability/student-goal data into One Time content review.',
    ],
  };
}

module.exports = {
  ONE_TIME_CONTENT_SECTIONS,
  buildOneTimeContentCommandCenter,
  buildMeetingDropsSection,
  buildClassLibrarySection,
  buildWorksheetsSourceSheetsSection,
  buildQuestionsRepliesSection,
  buildApprovedAssetsSection,
  buildPublishingReadinessSection,
  buildContentBlockers,
  buildNoWritePreviewStatus,
};
