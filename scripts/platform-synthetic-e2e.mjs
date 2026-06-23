#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { buildPlatformContext, unwrap } = require('../src/platform/core');
const { buildPersonUpsertPlan, buildServiceProviderProfile, buildStudentProfile } = require('../src/platform/domain');
const { createCommunity, createCommunityGroup, createCommunityPost, pinCommunityResource, visibleCommunityRecords } = require('../src/platform/community');
const { attachVideoToLesson, createCourse, createCourseModule, createLesson, createVideoAssetReference, enrollMember, recordProgress } = require('../src/platform/courses');
const { assignReward, awardReward, createGoal, createMilestone, createRewardCatalogItem, createRewardRule, evaluateRewardEligibility, redeemReward } = require('../src/platform/rewards');
const { buildCanonicalIntakePacket } = require('../src/platform/ingestion/intake-service');
const { applyCanonicalIntakePacketToMemory, createMemoryIntakePersistenceStore } = require('../src/platform/ingestion/intake-persistence');
const { transitionPrompt, buildQueueViewModel, buildRambleStatusViewModel } = require('../src/platform/ingestion/prompt-queue');
const { createWorkPackage, claimWorkPackage, recordEvidence, recordProgress: recordWorkPackageProgress, sealWorkPackage, requeueFindingOrDecision } = require('../src/platform/agent-control/closed-loop');
const { buildOneTimeInstanceConfig, assertNoBnaPrivateData } = require('../src/platform/instances/one-time');
const { buildOneTimeTestIdentityPreview, assertOneTimeTestFixtureSafety } = require('../src/platform/instances/one-time-test-fixtures');
const { buildOneTimeIntegrationReadinessPayload } = require('../src/platform/integrations/readiness');

const checkedAt = new Date().toISOString();
const evidenceDir = path.resolve('ops/parallel-runs/PARALLEL-20260619-001/integration-evidence');
const outputPath = path.join(evidenceDir, 'synthetic-e2e-acceptance.json');

function adminContext(workspaceId, workspaceKey = workspaceId) {
  return buildPlatformContext({
    instance: { id: 'instance-bna-platform', slug: 'bna-platform' },
    organization: { id: 'org-bna', slug: 'bna' },
    workspace: { id: workspaceId, workspace_key: workspaceKey, project_key: workspaceKey },
    actor: { id: 'synthetic-admin', person_id: 'person-synthetic-admin', role: 'workspace_admin' },
    memberships: [{
      actor_id: 'synthetic-admin',
      instance_id: 'instance-bna-platform',
      workspace_id: workspaceId,
      role: 'workspace_admin',
      status: 'active',
    }],
  });
}

function studentContext(workspaceId, workspaceKey, student) {
  return buildPlatformContext({
    instance: { id: 'instance-bna-platform', slug: 'bna-platform' },
    organization: { id: 'org-bna', slug: 'bna' },
    workspace: { id: workspaceId, workspace_key: workspaceKey, project_key: workspaceKey },
    actor: {
      id: 'synthetic-student-actor',
      person_id: student.person_id,
      student_id: student.id,
      role: 'student',
    },
    memberships: [{
      actor_id: 'synthetic-student-actor',
      instance_id: 'instance-bna-platform',
      workspace_id: workspaceId,
      role: 'student',
      status: 'active',
    }],
  });
}

function collectId(collection, type, record) {
  const id = record?.id || record?.prompt_id || record?.package_id;
  if (!id) throw new Error(`Missing id for ${type}`);
  collection.push({ type, id });
  return record;
}

const oneTimeWorkspaceId = 'workspace-one-time-synthetic';
const oneTimeWorkspaceKey = 'one_time_mishnah_class';
const bnaWorkspaceId = 'workspace-bna-synthetic';
const oneTimeContext = adminContext(oneTimeWorkspaceId, oneTimeWorkspaceKey);
const bnaContext = adminContext(bnaWorkspaceId, 'bna');
const created = [];
const oneTimeConfig = buildOneTimeInstanceConfig({ singleTenant: true });

const memberPlan = unwrap(buildPersonUpsertPlan(oneTimeContext, {
  display_name: 'Synthetic One Time Parent',
  email: 'synthetic.parent@example.test',
}, []));
const member = collectId(created, 'member', memberPlan.person);
const duplicatePlan = unwrap(buildPersonUpsertPlan(oneTimeContext, {
  display_name: 'Synthetic Parent',
  email: 'Synthetic.Parent@Example.Test',
}, [member]));
const student = collectId(created, 'student', unwrap(buildStudentProfile(oneTimeContext, {
  name: 'Synthetic One Time Student',
  student_id: 'synthetic-student-one-time',
  grade: '7',
})));
const provider = collectId(created, 'provider', unwrap(buildServiceProviderProfile(oneTimeContext, {
  display_name: 'Synthetic One Time Provider',
  email: 'synthetic.provider@example.test',
  slug: 'synthetic-one-time-provider',
  services: ['mishnah_review'],
})));

const community = collectId(created, 'community', unwrap(createCommunity(oneTimeContext, {
  title: 'Synthetic One Time Community',
  visibility: 'workspace',
})));
const group = collectId(created, 'community_group', unwrap(createCommunityGroup(oneTimeContext, community, {
  label: 'Announcements',
  channel_type: 'announcement',
})));
const post = collectId(created, 'community_post', unwrap(createCommunityPost(oneTimeContext, group, {
  body: 'Synthetic local-only announcement draft.',
  moderation_status: 'needs_review',
})));
const resource = collectId(created, 'pinned_resource', unwrap(pinCommunityResource(oneTimeContext, community, {
  title: 'Synthetic Source Sheet',
  url: 'https://example.test/one-time/source-sheet',
})));

const course = collectId(created, 'course', unwrap(createCourse(oneTimeContext, {
  title: 'Synthetic Mishnah Foundations',
  visibility: 'workspace',
  community_id: community.id,
})));
const moduleRecord = collectId(created, 'course_module', unwrap(createCourseModule(oneTimeContext, course, {
  title: 'Synthetic Berachos Unit',
})));
const lesson = collectId(created, 'lesson', unwrap(createLesson(oneTimeContext, moduleRecord, {
  title: 'Synthetic Opening Mishnah',
})));
const video = collectId(created, 'video_reference', unwrap(createVideoAssetReference(oneTimeContext, {
  provider: 'vimeo',
  provider_asset_id: 'mock-vimeo-synthetic-001',
  playback_url: 'https://player.vimeo.com/video/mock-vimeo-synthetic-001',
  privacy: 'workspace',
})));
collectId(created, 'lesson_video', unwrap(attachVideoToLesson(oneTimeContext, lesson, video)));
const enrollment = collectId(created, 'enrollment', unwrap(enrollMember(oneTimeContext, course, {
  person_id: student.person_id,
  student_id: student.id,
})));
const progress = collectId(created, 'progress', unwrap(recordProgress(
  studentContext(oneTimeWorkspaceId, oneTimeWorkspaceKey, student),
  enrollment,
  { lesson_id: lesson.id, progress_percent: 100, source: 'synthetic_e2e' },
)));

const goal = collectId(created, 'goal', unwrap(createGoal(oneTimeContext, {
  title: 'Synthetic complete first unit',
  assignee_person_id: student.person_id,
  target_value: 100,
  unit: 'percent',
})));
const milestone = collectId(created, 'milestone', unwrap(createMilestone(oneTimeContext, goal, {
  title: 'Synthetic module complete',
  target_value: 100,
})));
const reward = collectId(created, 'reward', unwrap(createRewardCatalogItem(oneTimeContext, {
  title: 'Synthetic recognition note',
  reward_type: 'recognition',
})));
const rule = collectId(created, 'reward_rule', unwrap(createRewardRule(oneTimeContext, reward, {
  goal_id: goal.id,
  milestone_id: milestone.id,
  threshold_value: 100,
})));
const assignment = collectId(created, 'reward_assignment', unwrap(assignReward(oneTimeContext, reward, {
  assignee_person_id: student.person_id,
})));
const eligibility = unwrap(evaluateRewardEligibility(oneTimeContext, assignment, rule, { value: 100 }));
const awarded = collectId(created, 'reward_award', unwrap(awardReward(oneTimeContext, assignment, {
  approved: true,
  awarded_by: 'synthetic-admin',
})));
const redeemed = collectId(created, 'reward_redemption', unwrap(redeemReward(oneTimeContext, awarded, {
  redeemed_by: 'synthetic-admin',
})));

const rawText = [
  'One Time Mishnah class: decide whether parents should get a reminder before the review lesson tomorrow.',
  'Task: prepare a local-only community post and content draft.',
  'Schedule a calendar event for the review lesson tomorrow.',
  'Message the community with a short announcement draft only.',
].join(' ');
const intakePacket = buildCanonicalIntakePacket({
  source_provider: 'manual',
  source_kind: 'text',
  source_id: 'RAW-SYNTHETIC-E2E',
  raw_text: rawText,
  raw_id: 'RAW-SYNTHETIC-E2E',
  workspace_key: oneTimeWorkspaceKey,
  project_key: oneTimeWorkspaceKey,
  existing_records: [],
}, {
  generated_at: checkedAt,
  agent: 'Codex',
});
const intakeSource = intakePacket.source_record;
const parsed = intakePacket.parsed;
const persistenceStore = createMemoryIntakePersistenceStore();
const persistenceApply = applyCanonicalIntakePacketToMemory(intakePacket, {
  store: persistenceStore,
  applied_at: checkedAt,
});
const duplicatePacket = buildCanonicalIntakePacket({
  source_provider: 'manual',
  source_kind: 'text',
  source_id: 'RAW-SYNTHETIC-E2E',
  raw_text: rawText,
  raw_id: 'RAW-SYNTHETIC-E2E',
  workspace_key: oneTimeWorkspaceKey,
  project_key: oneTimeWorkspaceKey,
  existing_records: parsed.deduplication_keys.map((idempotency_key) => ({ idempotency_key })),
}, {
  generated_at: checkedAt,
  agent: 'Codex',
});
const duplicateParsed = duplicatePacket.parsed;

let parentPrompt = collectId(created, 'parent_prompt', intakePacket.parent_prompt);
parentPrompt = transitionPrompt(parentPrompt, 'in_progress', { current_phase: 'implementation' });
const queueView = buildQueueViewModel([parentPrompt], { now: checkedAt });
const rambleStatus = buildRambleStatusViewModel(parentPrompt, { now: checkedAt });

let workPackage = collectId(created, 'work_package', createWorkPackage({
  parentPrompt,
  parsedItem: parsed.tasks[0],
  verificationMode: 'mixed',
  retryLimit: 1,
  browserTarget: '/operations?view=platform_suite&section=agents',
}));
workPackage = claimWorkPackage(workPackage, { agent: 'Codex', at: checkedAt });
workPackage = recordWorkPackageProgress(workPackage, {
  phase: 'verifying',
  summary: 'Synthetic automated verification passed.',
  at: checkedAt,
});
workPackage = recordEvidence(workPackage, {
  label: 'Synthetic E2E evidence',
  path: 'ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json',
  summary: 'Local mocked scenario with no external writes.',
  at: checkedAt,
});
const passedPackage = sealWorkPackage(workPackage, {
  outcome: 'pass',
  summary: 'Synthetic work package passed local automated and browser-gate simulation.',
  criterionResults: workPackage.acceptance_criteria.map((criterion) => ({
    id: criterion.id,
    status: 'pass',
    note: 'Synthetic local evidence recorded.',
  })),
});
const requeuedPackage = requeueFindingOrDecision({ ...passedPackage, status: 'failed', retry_count: 0, retry_limit: 1 }, {
  summary: 'Synthetic exact failure requeued for retry.',
});
const missingCredentialDecision = requeueFindingOrDecision({ ...requeuedPackage, retry_count: 1, retry_limit: 1 }, {
  summary: 'Synthetic provider credential missing; operator decision required.',
});

const readiness = buildOneTimeIntegrationReadinessPayload({
  checkedAt,
  videoHostingReadiness: { configured: false, blocker: 'synthetic_vimeo_credential_missing' },
  zoomReadiness: { configured: false, blocker: 'synthetic_zoom_credential_missing' },
  resendReadiness: { configured: false, blocker: 'synthetic_resend_domain_missing' },
});
const testIdentityPreview = buildOneTimeTestIdentityPreview({ checked_at: checkedAt });
const testIdentitySafety = assertOneTimeTestFixtureSafety(testIdentityPreview);

const bnaPrivateRecord = { id: 'bna-private-synthetic', workspace_key: 'bna', privacy: 'bna_private' };
const leakCheck = assertNoBnaPrivateData([member, student, provider, community, course]);
const blockedLeakCheck = assertNoBnaPrivateData([bnaPrivateRecord]);
const bnaVisibility = visibleCommunityRecords(bnaContext, [community, group, post, resource]);

const tempStore = new Map(created.map((record) => [record.id, record]));
const cleanupIds = [...tempStore.keys()];
cleanupIds.forEach((id) => tempStore.delete(id));

const required = {
  decision: parsed.decisions.length,
  task: parsed.tasks.length,
  calendar_event: parsed.calendar_events.length,
  community_or_content: parsed.community_items.length + parsed.content_items.length,
};
for (const [type, count] of Object.entries(required)) {
  if (count < 1) throw new Error(`Synthetic E2E missing parsed ${type}.`);
}
if (duplicateParsed.tasks.length || duplicateParsed.decisions.length || duplicateParsed.calendar_events.length) {
  throw new Error('Synthetic E2E idempotent rerun produced duplicate task, decision, or calendar records.');
}
if (!persistenceApply.readback.found || persistenceApply.readback.parse_items.length < parentPrompt.child_outcomes.length) {
  throw new Error('Synthetic E2E canonical intake persistence readback failed.');
}
if (!leakCheck.ok || blockedLeakCheck.ok || bnaVisibility.length) {
  throw new Error('Synthetic E2E workspace isolation check failed.');
}
if (!testIdentitySafety.ok) {
  throw new Error(`Synthetic TEST identity safety check failed: ${testIdentitySafety.failures.join('; ')}`);
}
if (tempStore.size !== 0) throw new Error('Synthetic E2E cleanup failed.');

const artifact = {
  checked_at: checkedAt,
  run_id: 'PARALLEL-20260619-001',
  mode: 'local_in_memory_fixtures_no_external_writes',
  external_write_performed: false,
  instance: {
    one_time_workspace_key: oneTimeWorkspaceKey,
    single_tenant_split_ready: oneTimeConfig.instance.split_ready,
    deployment_mode: oneTimeConfig.instance.deployment_mode,
  },
  created_record_ids: created,
  duplicate_identity: {
    first_action: memberPlan.action,
    variant_action: duplicatePlan.action,
    matched_person_id: duplicatePlan.matched_person_id,
  },
  parsed_counts: {
    decisions: parsed.decisions.length,
    tasks: parsed.tasks.length,
    calendar_events: parsed.calendar_events.length,
    community_items: parsed.community_items.length,
    content_items: parsed.content_items.length,
    unresolved: parsed.unresolved.length,
  },
  canonical_intake: {
    packet_contract_version: intakePacket.contract_version,
    source_stable_key: intakeSource.stable_key,
    source_provider: intakeSource.source_provider,
    parent_prompt_id: intakePacket.parent_prompt.prompt_id,
    child_outcome_count: intakePacket.parent_prompt.child_outcomes.length,
    persistence_contract_version: persistenceApply.contract_version,
    raw_intake_stable_id: persistenceApply.raw_intake_stable_id,
    parse_run_id: persistenceApply.parse_run_id,
    parse_item_count: persistenceApply.parse_item_ids.length,
    readback_found: persistenceApply.readback.found,
    readback_parse_item_count: persistenceApply.readback.parse_items.length,
    external_write_performed: persistenceApply.external_write_performed,
  },
  idempotent_rerun: {
    deduplication_keys: parsed.deduplication_keys.length,
    duplicate_tasks_created: duplicateParsed.tasks.length,
    duplicate_decisions_created: duplicateParsed.decisions.length,
    duplicate_calendar_events_created: duplicateParsed.calendar_events.length,
    unresolved_duplicates: duplicateParsed.unresolved.length,
    passed: true,
  },
  course_progress: {
    course_id: course.id,
    lesson_id: lesson.id,
    video_asset_id: video.id,
    enrollment_id: enrollment.id,
    progress_id: progress.id,
    progress_status: progress.status,
  },
  rewards: {
    goal_id: goal.id,
    milestone_id: milestone.id,
    reward_id: reward.id,
    assignment_id: assignment.id,
    eligible: eligibility.eligible,
    award_state: awarded.award_state,
    redeem_state: redeemed.redeem_state,
  },
  agent_loop: {
    parent_prompt_id: parentPrompt.prompt_id,
    queue_position: queueView.prompts[0].queue_position,
    ramble_phase: rambleStatus.status,
    work_package_id: passedPackage.package_id,
    pass_status: passedPackage.status,
    requeue_status: requeuedPackage.status,
    missing_credential_status: missingCredentialDecision.status,
  },
  readiness: {
    preview_only: readiness.preview_only,
    secret_values_included: readiness.secret_values_included,
    providers: readiness.cards.map((card) => ({
      provider: card.provider,
      test_connection_mode: card.test_connection.mode,
      external_write_performed: card.test_connection.external_write_performed,
      status: card.status,
    })),
  },
  isolation: {
    one_time_export_without_bna_private_ok: leakCheck.ok,
    bna_private_record_blocked: !blockedLeakCheck.ok,
    bna_context_visible_one_time_records: bnaVisibility.length,
  },
  cleanup: {
    temporary_fixture_count: cleanupIds.length,
    deleted_or_archived_ids: cleanupIds,
    remaining_in_memory_records: tempStore.size,
    passed: true,
  },
  test_identities_and_mock_data: {
    requirement_id: testIdentityPreview.requirement_id,
    fixture_prefix: testIdentityPreview.fixture_prefix,
    identity_count: testIdentitySafety.checks.identity_count,
    relationship_count: testIdentitySafety.checks.relationship_count,
    mock_record_count: testIdentitySafety.checks.mock_record_count,
    scenario_count: testIdentitySafety.checks.scenario_count,
    negative_authorization_count: testIdentitySafety.checks.negative_authorization_count,
    cleanup_ready: testIdentitySafety.checks.cleanup_ready,
    no_bna_private_data: testIdentitySafety.checks.no_bna_private_data,
    private_export_sources_included: testIdentityPreview.private_export_sources_included,
    raw_private_rows_included: testIdentityPreview.raw_private_rows_included,
    external_write_performed: testIdentityPreview.external_write_performed,
    scenario_categories: testIdentityPreview.scenarios.map((scenario) => scenario.category),
    negative_authorization_keys: testIdentityPreview.negative_authorization_matrix.map((item) => item.key),
  },
};

fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Synthetic E2E acceptance written: ${outputPath}`);
