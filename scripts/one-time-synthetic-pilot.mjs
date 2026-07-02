#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  buildOneTimeInstanceConfig,
  buildOneTimeSeedFixture,
} = require('../src/platform/instances/one-time');
const {
  buildOneTimeClassCourseIngestionPreview,
} = require('../src/platform/ingestion/one-time-class-course-builder');
const {
  buildOneTimeMediaPipelinePreview,
} = require('../src/platform/integrations/media-local-pipeline');
const {
  buildCommunityAnnouncementDraft,
  buildCommunityPrivateReplyPreview,
  buildAnnouncementsFirstDigestPreview,
} = require('../src/platform/community/announcements-first');
const {
  buildOneTimeProgressRewardSeed,
  buildOneTimeProgressRewardSnapshot,
  buildOneTimeProgressRewardViews,
} = require('../src/platform/progress/one-time-progress');
const {
  buildOneTimeResendOutboxPreview,
} = require('../src/platform/integrations/resend-local-outbox');
const {
  applyOneTimeStripeMockEvent,
  buildOneTimeStripeMockCheckout,
  buildOneTimeStripeMockEvent,
  buildOneTimeStripeTrialSignup,
} = require('../src/platform/integrations/stripe-local-beta');

const REQUIREMENT_ID = 'REQ-20260619-422';
const RUN_DIR = 'ops/execution-runs/2026-06-19-onetime-local-beta-hardening';
const DEFAULT_REPORT_PATH = path.join(RUN_DIR, 'evidence', 'req422-synthetic-pilot.json');

const REQUIRED_STAGES = Object.freeze([
  'signup_enrollment',
  'class_ingestion',
  'attendance',
  'media_publishing',
  'announcements',
  'progress',
  'rewards',
  'email_mocks',
  'payment_mocks',
  'admin_closeout',
]);

function hasArg(name) {
  return process.argv.includes(name);
}

function evidencePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function unwrap(result, label) {
  assert.equal(result.ok, true, `${label} should return ok`);
  return result.data;
}

function covered(ok, evidence = [], blockedActions = []) {
  return {
    covered: Boolean(ok),
    evidence,
    blocked_actions: blockedActions,
  };
}

export function buildOneTimeSyntheticPilotScenario(options = {}) {
  const checkedAt = options.checkedAt || '2026-06-20T19:10:00.000Z';
  const instance = buildOneTimeInstanceConfig();
  const seedFixture = buildOneTimeSeedFixture();
  const signup = {
    parent_name: 'Codex Synthetic Parent',
    email: 'codex-synthetic-parent@example.test',
    phone: '+10000000002',
    student_name: 'Codex Synthetic Student',
    region: 'israel',
    preferred_class_format: 'library_live_low_touch',
    consent: true,
    source_landing_page: '/one-time',
  };

  const trialSignup = buildOneTimeStripeTrialSignup({
    ...signup,
    referral_code: 'SYNTHETIC-PILOT',
  }, { checkedAt });
  const checkout = buildOneTimeStripeMockCheckout(signup);
  const paidEvent = buildOneTimeStripeMockEvent('paid', checkout);
  const paymentResult = applyOneTimeStripeMockEvent(checkout, paidEvent);
  const duplicatePaymentResult = applyOneTimeStripeMockEvent(checkout, paidEvent, {
    processed_event_keys: paymentResult.processed_event_keys,
    enrollment_status: paymentResult.enrollment_status,
    access_status: paymentResult.access_status,
  });

  const ingestion = unwrap(buildOneTimeClassCourseIngestionPreview({
    raw_id: 'RAW-20260620-001',
    source_type: 'zoom_recording',
    source_provider: 'codex_synthetic_pilot',
    raw_text: [
      'Course: One Time Mishnah Pilot.',
      'Module 1: Berachos Foundations.',
      'Lesson: Opening Mishnah.',
      'Zoom recording with transcript, attendance minutes, class summary, worksheet, parent update, and each student progress update.',
      'Publish the summary only after Rabbi/admin approval. Do not publish or send yet.',
    ].join(' '),
    transcript_text: 'Synthetic transcript: Rabbi taught the opening Mishnah and assigned review questions.',
    provider_asset_id: 'zoom-recording-synthetic-001',
  }, { checkedAt }), 'class ingestion');

  const zoomAttendance = buildOneTimeMediaPipelinePreview({
    source_type: 'zoom_recording',
    class_session_id: ingestion.drafts.class_session.id,
    class_title: 'Opening Mishnah',
    zoom_meeting_url: 'https://zoom.us/j/123456789?pwd=redacted-token',
    recording_id: 'rec-synthetic-001',
    participant_events: [
      {
        event: 'meeting.participant_joined',
        payload: { object: { id: '123456789', participant: { email: 'student@example.test', user_name: 'Synthetic Student' } } },
        member_id: 1,
      },
      {
        event: 'meeting.participant_left',
        payload: { object: { id: '123456789', participant: { email: 'student@example.test', user_name: 'Synthetic Student' } } },
        member_id: 1,
      },
    ],
  }, {
    checkedAt,
    zoomReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
    zoomOptions: {
      config: {
        accountId: 'acct',
        clientId: 'client',
        clientSecret: 'redacted-secret',
        accountOwner: 'Rabbi Elie Scheller',
        hostUser: 'rabbi@example.test',
        configuredScopes: ['meeting:read:admin'],
      },
    },
  });

  const mediaPublishing = buildOneTimeMediaPipelinePreview({
    source_type: 'vimeo_asset',
    class_session_id: ingestion.drafts.class_session.id,
    class_title: 'Opening Mishnah Replay',
    vimeo_url: 'https://vimeo.com/987654321',
    worksheet_requested: true,
  }, {
    checkedAt,
    videoHostingReadiness: { configured: true, connected: true, account_owner: 'Rabbi Elie Scheller' },
  });

  const announcement = buildCommunityAnnouncementDraft({
    item_type: 'announcement',
    title: 'Opening Mishnah replay draft',
    body: 'Replay and worksheet are ready for Rabbi/admin review before member visibility.',
    audience: 'members',
    links: [{ title: 'Replay draft', url: 'https://example.test/one-time/replay/opening-mishnah?token=redacted' }],
  });
  const reminder = buildCommunityAnnouncementDraft({
    item_type: 'reminder',
    title: 'Review the opening Mishnah',
    body: 'Parents and students should review before the next class once approved.',
    audience: 'parents',
  });
  const privateReply = buildCommunityPrivateReplyPreview({
    thread_id: 'synthetic-opening-mishnah',
    author_type: 'student',
    author_label: 'Synthetic Student',
    body: 'Private student question about the Mishnah.',
  });
  const digest = buildAnnouncementsFirstDigestPreview({
    items: [announcement, reminder, privateReply],
    channels: ['member_portal', 'email'],
  });

  const progressSeed = buildOneTimeProgressRewardSeed();
  const progressSnapshot = buildOneTimeProgressRewardSnapshot({ seed: progressSeed });
  const progressViews = {
    student: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'student', student_id: 'ot-student-001' }),
    parent: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'parent', linked_student_ids: ['ot-student-001'] }),
    provider: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'provider' }),
    public: buildOneTimeProgressRewardViews(progressSnapshot, { viewer: 'public' }),
  };

  const outbox = buildOneTimeResendOutboxPreview([
    {
      template_key: 'receipt_access',
      to: signup.email,
      recipient_name: signup.parent_name,
      service_email_consent: true,
      approved_for_send: false,
      context: { memberUrl: 'https://example.test/rabbi-member?token=redacted' },
    },
    {
      template_key: 'class_reminder',
      to: signup.email,
      recipient_name: signup.parent_name,
      service_email_consent: true,
      approved_for_send: false,
      context: { classTitle: 'Opening Mishnah', startAt: 'Local beta only' },
    },
  ], {
    checkedAt,
    resendReadiness: {
      configured: true,
      connected: false,
      domain_verified: false,
      mode: 'local_preview',
      blocker: 'Live Resend send is not approved for local beta.',
    },
  });

  const adminCloseout = {
    status: 'ready_for_human_review_not_release',
    local_beta_only: true,
    terminal_requirement_status_after_this_stage: 'done_local_synthetic_verified',
    required_human_decisions_before_live: [
      'payment provider/live checkout approval',
      'Resend domain and sender approval',
      'Zoom/Vimeo provider write approval',
      'member-library publish approval',
      'release/deploy approval',
    ],
    blocked_live_actions: [
      'deploy',
      'railway_mutation',
      'production_database_write',
      'live_email_send',
      'live_payment',
      'video_provider_mutation',
      'member_library_publish',
      'access_grant_write',
    ],
  };

  const stageCoverage = {
    signup_enrollment: covered(
      trialSignup.preview_only === true
        && trialSignup.access_status === 'trial'
        && trialSignup.stripe_checkout_created === false
        && trialSignup.policy.trial.card_required === false
        && trialSignup.policy.trial.payment_method_required_at_signup === false
        && checkout.preview_only === true
        && checkout.live_charge_performed === false
        && checkout.enrollment_after_paid === false,
      ['trial signup preview without card', 'conversion checkout mock preview'],
      ['card_upfront', 'payment_method_at_signup', 'live_checkout_create', 'live_charge']
    ),
    class_ingestion: covered(
      ingestion.preview_only === true
        && ingestion.external_write_performed === false
        && ingestion.drafts.course.status === 'draft'
        && ingestion.flow_coverage.class_session === 'drafted',
      ['course/module/lesson/session drafts', 'idempotency keys'],
      ['publish', 'google_classroom_write']
    ),
    attendance: covered(
      ingestion.flow_coverage.attendance_minutes === 'drafted'
        && zoomAttendance.attendance_preview?.counts?.total_events === 2
        && zoomAttendance.attendance_write_performed === false,
      ['ingestion attendance draft', 'Zoom attendance preview'],
      ['attendance_write', 'zoom_webhook_accept']
    ),
    media_publishing: covered(
      mediaPublishing.library_draft.status === 'needs_operator_approval'
        && mediaPublishing.library_draft.publish_enabled === false
        && mediaPublishing.member_library_publish_performed === false,
      ['Vimeo draft library reference', 'worksheet material handoff'],
      ['member_library_publish', 'video_upload', 'drive_permission_write']
    ),
    announcements: covered(
      announcement.no_send === true
        && reminder.no_send === true
        && privateReply.reply_body_returned === false
        && digest.hidden_reply_items === 1,
      ['announcement draft', 'reminder draft', 'private reply review', 'digest preview'],
      ['email_send', 'telegram_send', 'member_feed_reply_publish']
    ),
    progress: covered(
      progressSnapshot.group_summary.student_count === 2
        && progressViews.student.privacy.own_record_only === true
        && progressViews.parent.privacy.linked_students_only === true
        && progressViews.public.privacy.aggregate_only === true,
      ['student/parent/provider/public progress views'],
      ['public_individual_leaderboard', 'private_admin_note_return']
    ),
    rewards: covered(
      progressSnapshot.reward_policy.automatic_award_performed === false
        && progressSnapshot.group_summary.eligible_reward_reviews >= 1,
      ['eligible reward review state', 'operator approval required'],
      ['automatic_reward_award', 'payment_credit']
    ),
    email_mocks: covered(
      outbox.preview_only === true
        && outbox.email_send_performed === false
        && outbox.counts.total === 2,
      ['receipt/access draft', 'class reminder draft'],
      ['email_send', 'domain_dns_mutation']
    ),
    payment_mocks: covered(
      paidEvent.mode === 'test_mock'
        && paymentResult.external_write_performed === false
        && duplicatePaymentResult.duplicate === true,
      ['Stripe paid mock event', 'idempotent replay'],
      ['live_charge', 'external_checkout_session_create']
    ),
    admin_closeout: covered(
      adminCloseout.status === 'ready_for_human_review_not_release'
        && adminCloseout.blocked_live_actions.includes('deploy'),
      ['blocked live actions', 'release decisions'],
      adminCloseout.blocked_live_actions
    ),
  };

  const missingStages = REQUIRED_STAGES.filter((stage) => !stageCoverage[stage]?.covered);
  const noWriteFlags = {
    checkout_external_write: checkout.external_write_performed,
    checkout_live_charge: checkout.live_charge_performed,
    ingestion_external_write: ingestion.external_write_performed,
    ingestion_live_publish: ingestion.live_publish_performed,
    zoom_external_write: zoomAttendance.external_write_performed,
    zoom_attendance_write: zoomAttendance.attendance_write_performed,
    media_external_write: mediaPublishing.external_write_performed,
    media_publish: mediaPublishing.member_library_publish_performed,
    announcement_external_write: announcement.external_write_performed,
    digest_external_write: digest.external_write_performed,
    progress_external_write: progressSnapshot.external_write_performed,
    outbox_external_write: outbox.external_write_performed,
    outbox_send: outbox.email_send_performed,
      payment_event_external_write: paymentResult.external_write_performed,
      trial_signup_external_write: trialSignup.external_write_performed,
      trial_signup_live_charge: trialSignup.live_charge_performed,
  };
  const writeViolations = Object.entries(noWriteFlags)
    .filter(([, value]) => value !== false)
    .map(([key]) => key);

  return {
    requirement_id: REQUIREMENT_ID,
    generated_at: checkedAt,
    scenario_id: 'one-time-local-beta-synthetic-pilot-v1',
    preview_only: true,
    local_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    success: missingStages.length === 0 && writeViolations.length === 0,
    missing_stages: missingStages,
    write_violations: writeViolations,
    stage_coverage: stageCoverage,
    no_write_flags: noWriteFlags,
    signup,
    enrollment: {
      trial_signup: trialSignup,
      checkout,
      paid_event: {
        event_id: paidEvent.event_id,
        event_type: paidEvent.event_type,
        payment_status: paidEvent.payment_status,
        mode: paidEvent.mode,
        external_write_performed: paidEvent.external_write_performed,
      },
      payment_result: paymentResult,
      duplicate_payment_result: duplicatePaymentResult,
    },
    instance_summary: {
      workspace_key: instance.instance.workspace_key,
      project_key: instance.instance.project_key,
      deployment_mode: instance.instance.deployment_mode,
      primary_offer: instance.product.primary_offer,
      seed_fixture_id: seedFixture.fixture_id || seedFixture.seed_id || 'one-time-seed-fixture',
    },
    class_ingestion: {
      builder_version: ingestion.builder_version,
      source_fingerprint: ingestion.idempotency.source_fingerprint,
      drafts: ingestion.drafts,
      flow_coverage: ingestion.flow_coverage,
      review_items: ingestion.review_items,
      decisions: ingestion.decisions,
      tasks: ingestion.tasks,
    },
    attendance: {
      zoom_counts: zoomAttendance.attendance_preview?.counts,
      meeting_preview: zoomAttendance.meeting_preview,
      attendance_write_performed: zoomAttendance.attendance_write_performed,
    },
    media_publishing: {
      source: mediaPublishing.source,
      video_reference: mediaPublishing.video_reference,
      library_draft: mediaPublishing.library_draft,
      worksheet_material_handoff: mediaPublishing.worksheet_material_handoff,
      blocked_actions: mediaPublishing.blocked_actions,
    },
    announcements: {
      announcement,
      reminder,
      private_reply: privateReply,
      digest,
    },
    progress_rewards: {
      group_summary: progressSnapshot.group_summary,
      reward_policy: progressSnapshot.reward_policy,
      student_view: progressViews.student,
      parent_view: progressViews.parent,
      provider_view: progressViews.provider,
      public_view: progressViews.public,
    },
    email_mocks: outbox,
    admin_closeout: adminCloseout,
  };
}

export function writeOneTimeSyntheticPilotReport(report, reportPath = DEFAULT_REPORT_PATH) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('one-time-synthetic-pilot.mjs')) {
  const report = buildOneTimeSyntheticPilotScenario({
    checkedAt: hasArg('--current-time') ? new Date().toISOString() : undefined,
  });
  assert.equal(report.success, true, JSON.stringify({
    missing_stages: report.missing_stages,
    write_violations: report.write_violations,
  }, null, 2));
  const reportPath = hasArg('--write-report') ? writeOneTimeSyntheticPilotReport(report) : '';
  const output = {
    success: report.success,
    requirement_id: report.requirement_id,
    scenario_id: report.scenario_id,
    stage_count: Object.keys(report.stage_coverage).length,
    missing_stages: report.missing_stages,
    write_violations: report.write_violations,
    external_write_performed: report.external_write_performed,
    production_mutation_performed: report.production_mutation_performed,
    report: reportPath ? evidencePath(reportPath) : null,
  };
  if (hasArg('--json') || !hasArg('--write-report')) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(`Synthetic pilot passed: ${output.stage_count} stages covered.`);
  }
}
