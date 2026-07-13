#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  buildOneTimeDriveBriefIngestionPreview,
} = require('../src/lib/bna/one-time-drive-brief');
const {
  parseIntakeText,
} = require('../src/lib/bna/intake-parser');
const {
  buildUnifiedFileMediaIntake,
} = require('../src/platform/assistant/file-media-intake');
const stripe = require('../src/lib/integrations/stripe');
const videoHosting = require('../src/lib/integrations/video-hosting');
const vimeo = require('../src/lib/integrations/vimeo');

const root = process.cwd();
const runId = '2026-06-24-owner-review-external-readiness';
const outDir = path.join(root, 'ops', 'qa-runs', runId);
const docsDir = path.join(root, 'docs', 'owner-review');
const reportJson = path.join(outDir, 'report.json');
const reportMd = path.join(outDir, 'report.md');
const readinessDoc = path.join(docsDir, 'EXTERNAL-READINESS-AUDIT.md');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function escapeMd(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function gitHead() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function check(id, ok, evidence) {
  return { id, ok: Boolean(ok), evidence };
}

function summarizeChecks(checks) {
  return {
    ok: checks.every((item) => item.ok),
    checks,
  };
}

function providerActor() {
  return {
    user_id: 'owner-review-provider',
    identity_key: 'identity_owner_review_provider',
    role: 'provider_admin',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    provider_id: 'sheller',
  };
}

function runClassDriveReadiness() {
  const server = readText('server.js');
  const workflow = readText('ops/one-time-mishnah/content-media-intake-workflow.md');
  const actor = providerActor();
  const recording = buildUnifiedFileMediaIntake({
    channel: 'website_assistant',
    actor,
    filename: 'owner-review-class-01.mp4',
    mime_type: 'video/mp4',
    size_bytes: 2200000,
    checksum: 'owner-review-class-recording',
    caption: 'Turn this recording into a lesson for the One Time class.',
    transcript_text: 'Rabbi Scheller learned Mishnah Berachos and a student asked a question.',
    provider_id: 'sheller',
    audience_scope: { provider_id: 'sheller' },
  });
  const worksheet = buildUnifiedFileMediaIntake({
    channel: 'telegram',
    actor,
    filename: 'owner-review-worksheet.pdf',
    mime_type: 'application/pdf',
    size_bytes: 30000,
    checksum: 'owner-review-worksheet',
    caption: 'Add this PDF as a worksheet for the class.',
    provider_id: 'sheller',
    audience_scope: { provider_id: 'sheller' },
  });
  const parsed = parseIntakeText({
    raw_input: [
      'Class recording: Rabbi Scheller learned Mishnah Berachos with a pasuk source.',
      'A student asked why the Mishnah changes the language.',
      'Research: find Rashi and Gemara sources for the worksheet.',
      'Route this to the One Time Mishnah workspace.',
    ].join(' '),
    source_type: 'class_recording',
    workspace_key: 'one_time_mishnah_class',
    source_date: '2026-06-24',
  });
  const driveBrief = buildOneTimeDriveBriefIngestionPreview({
    text: [
      '# Owner Review One Time Integration Brief',
      '| Account | Current state | Needed decision |',
      '| --- | --- | --- |',
      '| Drive | Upload folder selected later | Approve read-only folder/job range |',
      '| Vimeo | Manual URL mode first | Decide token/app owner |',
      '| Stripe | Sandbox required later | Decide account owner and policy |',
    ].join('\n'),
    source: 'owner-review-local-sample',
    fetched_at: '2026-06-24T00:00:00.000Z',
  });
  const sourceChecks = [
    check('content_media_workflow_exists', workflow.includes('## Workflow Stages'), 'ops/one-time-mishnah/content-media-intake-workflow.md'),
    check('provider_class_media_dry_run_route_exists', server.includes("app.post('/api/provider-portal/one-time/class-media'"), '/api/provider-portal/one-time/class-media'),
    check('mixed_recording_parse_route_exists', server.includes("app.post('/api/bna/content-jobs/:id/parse-mixed-recording'"), '/api/bna/content-jobs/:id/parse-mixed-recording'),
    check('one_time_drive_preview_route_exists', server.includes('one-time-drive-brief/preview'), '/api/bna/one-time-drive-brief/preview'),
    check('class_session_readback_route_exists', server.includes("app.get('/api/bna/class-sessions'"), '/api/bna/class-sessions'),
  ];
  const behaviorChecks = [
    check('recording_routes_to_class_course_media', recording.linked_outcomes?.[0]?.kind === 'class_course_media', recording.linked_outcomes?.[0]?.target),
    check('recording_ready_for_parse_without_external_write', recording.processing?.status === 'ready_for_parse' && recording.linked_outcomes?.[0]?.external_write_performed === false, recording.processing?.status),
    check('worksheet_routes_to_resource_review', worksheet.linked_outcomes?.[0]?.kind === 'worksheet_resource', worksheet.linked_outcomes?.[0]?.target),
    check('class_parser_extracts_notes_questions_research', parsed.class_session_notes.length > 0 && parsed.student_questions.length > 0 && parsed.research_items.length > 0, `notes=${parsed.class_session_notes.length}; questions=${parsed.student_questions.length}; research=${parsed.research_items.length}`),
    check('drive_brief_preview_is_scoped_no_write', driveBrief.dry_run === true && driveBrief.external_write_performed === false && driveBrief.routing?.workspace_key === 'rabbi_sheller_provider', driveBrief.routing?.workspace_key),
  ];
  return {
    requirement_id: 'REQ-20260624-021',
    label: 'Class Drive intake, transcription, parsing, and read-model readiness',
    status: 'credential_free_ready_with_external_blockers',
    source_contract: summarizeChecks(sourceChecks),
    behavior: summarizeChecks(behaviorChecks),
    samples: {
      recording_outcome: recording.linked_outcomes?.[0],
      worksheet_outcome: worksheet.linked_outcomes?.[0],
      parser_counts: {
        class_session_notes: parsed.class_session_notes.length,
        student_questions: parsed.student_questions.length,
        research_items: parsed.research_items.length,
        workspace_routing: parsed.workspace_routing.length,
      },
      drive_brief_counts: driveBrief.counts,
    },
    blockers: [
      'Read-only production class/job range and source folder approval are required before inspecting real uploaded classes such as jobs 64-74.',
      'Google Drive auth selection and folder permissions are required before real Drive file readback.',
      'OpenAI/transcription credentials and explicit media-processing approval are required before transcribing real class media.',
      'Ambiguous student/person matching must stay human-review gated before official records or linked profiles change.',
    ],
  };
}

function runStripeReadiness() {
  const server = readText('server.js');
  const safeSmoke = readText('scripts/smoke-one-time-resend-vimeo-stripe-safe.mjs');
  const readiness = stripe.getStripeReadiness({
    config: {
      configured: false,
      mode: 'test',
      accountOwner: 'unknown',
      providerAccount: null,
    },
  });
  const checkoutPreview = stripe.buildCheckoutPreview({
    title: 'One Time Membership',
    amount: 6700,
    currency: 'usd',
    success_url: 'https://example.test/success',
    cancel_url: 'https://example.test/cancel',
  }, { config: readiness });
  const localBeta = stripe.buildOneTimeStripeLocalBetaPlan({}, { config: {
    configured: true,
    mode: 'test',
    accountOwner: 'Rabbi Ellie Scheller',
    providerAccount: 'acct_test_redacted',
  } });
  const sourceChecks = [
    check('stripe_status_route_exists', server.includes("app.get('/api/bna/integrations/stripe/status'"), '/api/bna/integrations/stripe/status'),
    check('stripe_checkout_preview_route_exists', server.includes("app.post('/api/bna/integrations/stripe/checkout-preview'"), '/api/bna/integrations/stripe/checkout-preview'),
    check(
      'stripe_checkout_create_is_approval_gated',
      server.includes("app.post('/api/bna/integrations/stripe/checkout-create'")
        && server.includes('stripeIntegration.assertCheckoutCreateApproved')
        && server.includes("action: 'checkout_create'")
        && server.includes('previewOnly: true'),
      'approval-gated checkout create route with preview-only failure audit'
    ),
    check('safe_smoke_blocks_live_key', safeSmoke.includes('stripe_live_key_blocked_for_no_charge_sandbox_smoke'), 'safe smoke live-key blocker'),
    check('safe_smoke_does_not_create_stripe_objects', !/\.checkout\.sessions\.create\s*\(|\.customers\.create\s*\(|\.subscriptions\.create\s*\(|\.paymentLinks\.create\s*\(/.test(safeSmoke), 'no create calls in safe smoke'),
  ];
  const behaviorChecks = [
    check('readiness_reports_not_configured', readiness.status === 'not_configured', readiness.status),
    check('checkout_preview_is_no_write', checkoutPreview.preview_only === true && checkoutPreview.external_write_performed === false, 'preview_only'),
    check('local_beta_disables_live_billing', localBeta.actions.live_charge_enabled === false && localBeta.actions.checkout_session_creation_enabled === false, 'live_charge=false; checkout_session=false'),
    check(
      'local_beta_has_test_policy_shape',
      localBeta.launch_trial.trial_days === 0
        && localBeta.launch_trial.stripe_trial_enabled === false
        && localBeta.launch_trial.renewal_amount_cents === 6700,
      '0 trial days; Stripe trial disabled; 6700 cents',
    ),
  ];
  return {
    requirement_id: 'REQ-20260624-022',
    label: 'Stripe sandbox readiness',
    status: 'credential_free_ready_with_external_blockers',
    source_contract: summarizeChecks(sourceChecks),
    behavior: summarizeChecks(behaviorChecks),
    samples: {
      readiness_status: readiness.status,
      readiness_blockers: readiness.blockers,
      checkout_preview: {
        preview_only: checkoutPreview.preview_only,
        external_write_performed: checkoutPreview.external_write_performed,
        checkout: checkoutPreview.checkout,
      },
      local_beta_actions: localBeta.actions,
    },
    blockers: [
      'Stripe sandbox secret key and webhook secret must be stored in the approved secret path before real sandbox API/readback tests.',
      'Account owner, price/trial/cancel/refund/tax/grace/revenue policies must be decided before live billing launch.',
      'Live payment links, checkout session creation, charges, refunds, subscriptions, and invoice credits require explicit approval and rollback evidence.',
    ],
  };
}

function runVimeoReadiness() {
  const server = readText('server.js');
  const safeSmoke = readText('scripts/smoke-one-time-resend-vimeo-stripe-safe.mjs');
  const safeVideoConfig = {
    providerDecision: 'vimeo',
    vimeoToken: '',
    vimeoClientId: '',
    vimeoClientSecret: '',
    accountOwner: 'unknown',
    vimeoPlan: '',
    automatedUploadEnabled: false,
    allowedEmbedDomains: [],
  };
  const readiness = videoHosting.getVideoHostingReadiness({ config: safeVideoConfig });
  const recordingPipeline = videoHosting.buildRecordingPipelinePreview({
    event: 'recording.completed',
    source_recording_id: 'owner-review-recording',
    class_session: {
      id: 1,
      title: 'Owner Review Mishnah Class',
      summary: 'Summary saved for review.',
      transcript_text: 'Transcript saved for review.',
      media_url: 'https://vimeo.com/123456789',
    },
    metadata: { masechta: 'Berachos', perek: '1', mishnah: '1' },
    recording_files: [
      { id: 'speaker-share', recording_type: 'shared_screen_with_speaker_view', file_type: 'mp4', size_bytes: 100 },
      { id: 'audio', recording_type: 'audio_only', file_type: 'm4a', size_bytes: 50 },
    ],
    processing_completed: true,
    playback_verified: true,
  }, { config: safeVideoConfig });
  const attach = vimeo.attachVimeoUrl({
    content_id: 'owner-review-library-item',
    vimeo_url: 'https://player.vimeo.com/video/123456789',
  });
  const uploadIntent = vimeo.createVimeoUploadIntent({
    title: 'Owner Review Upload',
  }, { token: '', accountOwner: 'unknown', uploadAccess: false });
  const sourceChecks = [
    check('video_hosting_status_route_exists', server.includes("app.get('/api/bna/integrations/video-hosting/status'"), '/api/bna/integrations/video-hosting/status'),
    check('vimeo_status_route_exists', server.includes("app.get('/api/bna/integrations/vimeo/status'"), '/api/bna/integrations/vimeo/status'),
    check('recording_pipeline_preview_route_exists', server.includes("app.post('/api/bna/video-library/recording-pipeline-preview'"), '/api/bna/video-library/recording-pipeline-preview'),
    check('vimeo_upload_route_is_blocked', server.includes('Video upload is not enabled in this closeout pass'), 'upload blocker'),
    check('safe_smoke_does_not_call_vimeo_api', !/vimeoApiRequest\s*\(/.test(safeSmoke), 'no Vimeo API request in safe smoke'),
  ];
  const behaviorChecks = [
    check('readiness_reports_manual_ready', readiness.status === 'manual_ready', readiness.status),
    check('recording_pipeline_is_preview_only', recordingPipeline.preview_only === true && recordingPipeline.external_write_performed === false, recordingPipeline.status),
    check('recording_pipeline_keeps_api_upload_disabled', recordingPipeline.gates.api_upload_enabled === false && recordingPipeline.gates.provider_publish_enabled === false, 'api/provider publish disabled'),
    check('manual_vimeo_url_attach_parses_embed', attach.ok === true && attach.library_item?.vimeo_id === '123456789', attach.status),
    check('upload_intent_is_manual_without_token', uploadIntent.status === 'manual_ready' && uploadIntent.legacy_status === 'manual_upload_required' && uploadIntent.external_write_performed === false, uploadIntent.status),
  ];
  return {
    requirement_id: 'REQ-20260624-023',
    label: 'Vimeo/video-hosting readiness',
    status: 'credential_free_ready_with_external_blockers',
    source_contract: summarizeChecks(sourceChecks),
    behavior: summarizeChecks(behaviorChecks),
    samples: {
      readiness_status: readiness.status,
      readiness_blockers: readiness.blockers,
      recording_pipeline: {
        status: recordingPipeline.status,
        manual_vimeo_ready: recordingPipeline.summary.manual_vimeo_ready,
        api_upload_enabled: recordingPipeline.gates.api_upload_enabled,
        provider_publish_enabled: recordingPipeline.gates.provider_publish_enabled,
        notification_send_enabled: recordingPipeline.gates.notification_send_enabled,
      },
      attach_status: attach.status,
      upload_intent_status: uploadIntent.status,
    },
    blockers: [
      'Vimeo primary account owner, user token, app credentials, plan/quota, folder, privacy default, allowed embed domains, and callback URL need approved readback before API upload.',
      'Real Vimeo upload, provider publish/unpublish/delete, and playback verification require explicit operator approval and a synthetic non-sensitive asset.',
      'Manual Vimeo URL attachment remains the credential-free path; member-library publish remains first-party approval gated.',
    ],
  };
}

function writeReports(report) {
  ensureDir(outDir);
  ensureDir(docsDir);
  fs.writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`);

  const rows = report.sections.map((section) => `| ${escapeMd(section.requirement_id)} | ${escapeMd(section.label)} | ${escapeMd(section.status)} | ${section.source_contract.ok ? 'PASS' : 'FAIL'} | ${section.behavior.ok ? 'PASS' : 'FAIL'} |`);
  const blockerRows = report.sections.flatMap((section) => section.blockers.map((blocker) => `| ${escapeMd(section.requirement_id)} | ${escapeMd(blocker)} |`));
  const lines = [
    '# External Readiness Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Release candidate SHA: ${report.release_candidate_sha}`,
    '',
    'Guardrail: this audit is credential-free. It uses source inspection and local no-write preview builders only. It did not use external credentials, read production state, mutate a production database, deploy, send email or Telegram messages, publish, upload, charge, alter DNS, or request secret values.',
    '',
    '## Summary',
    '',
    `- Overall: ${report.summary.ok ? 'PASS' : 'FAIL'}`,
    `- External writes performed: ${report.summary.external_write_performed ? 'YES' : 'NO'}`,
    '',
    '| Requirement | Area | Status | Source contract | Local behavior |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '## Remaining External Blockers',
    '',
    '| Requirement | Blocker |',
    '| --- | --- |',
    ...blockerRows,
    '',
    '## Verdict',
    '',
    report.summary.ok
      ? 'Credential-free readiness is present for class/Drive intake contracts, Stripe no-charge preview behavior, and Vimeo/manual video-hosting previews. Real production readback, real Drive/transcription, Stripe sandbox/live operations, and Vimeo API upload remain approval/credential gated.'
      : 'External readiness audit needs review.',
    '',
  ];
  fs.writeFileSync(reportMd, lines.join('\n'));
  fs.writeFileSync(readinessDoc, lines.join('\n'));
}

function main() {
  const sections = [
    runClassDriveReadiness(),
    runStripeReadiness(),
    runVimeoReadiness(),
  ];
  const serialized = JSON.stringify(sections);
  const secretLeak = /sk_(?:live|test)_[A-Za-z0-9]|Bearer\s+[A-Za-z0-9._-]{12,}|vimeo-secret-token|password\s*[:=]/i.test(serialized);
  const report = {
    generated_at: new Date().toISOString(),
    release_candidate_sha: gitHead(),
    guardrails: {
      external_credentials: false,
      production_state_readback: false,
      production_database_mutation: false,
      deploy: false,
      external_send_publish_upload_charge_dns: false,
    },
    sections,
  };
  report.summary = {
    ok: sections.every((section) => section.source_contract.ok && section.behavior.ok) && !secretLeak,
    secret_leak_detected: secretLeak,
    external_write_performed: false,
    paths: {
      markdown: rel(reportMd),
      json: rel(reportJson),
      owner_review_doc: rel(readinessDoc),
    },
  };
  writeReports(report);
  if (!report.summary.ok) {
    console.error(JSON.stringify(report.summary, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(`External readiness audit passed. Reports: ${rel(readinessDoc)} ${rel(reportJson)}`);
}

main();
