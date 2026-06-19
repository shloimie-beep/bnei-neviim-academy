const assert = require('node:assert/strict');
const test = require('node:test');

const { buildPlatformContext, unwrap } = require('../../src/platform/core');
const { buildDomainRecordLink, buildPersonUpsertPlan, buildGuardianRelationship, buildServiceProviderProfile, buildStudentProfile } = require('../../src/platform/domain');
const { createCommunity, createCommunityGroup, createCommunityPost, pinCommunityResource, visibleCommunityRecords } = require('../../src/platform/community');
const { attachVideoToLesson, createCourse, createCourseModule, createLesson, createVideoAssetReference, enrollMember, recordProgress } = require('../../src/platform/courses');
const { assignReward, awardReward, createGoal, createMilestone, createRewardCatalogItem, createRewardRule, evaluateRewardEligibility, redeemReward } = require('../../src/platform/rewards');

function adminContext(workspaceId = 'workspace-bna') {
  return buildPlatformContext({
    instance: { id: 'instance-bna', slug: 'bna-platform' },
    organization: { id: 'org-bna', slug: 'bna' },
    workspace: { id: workspaceId, workspace_key: workspaceId, project_key: workspaceId },
    actor: { id: 'admin-1', person_id: 'person-admin', role: 'workspace_admin' },
    memberships: [
      {
        actor_id: 'admin-1',
        instance_id: 'instance-bna',
        workspace_id: workspaceId,
        role: 'workspace_admin',
        status: 'active',
      },
    ],
  });
}

function studentContext() {
  return buildPlatformContext({
    instance: { id: 'instance-bna', slug: 'bna-platform' },
    organization: { id: 'org-bna', slug: 'bna' },
    workspace: { id: 'workspace-bna', workspace_key: 'workspace-bna', project_key: 'workspace-bna' },
    actor: { id: 'student-actor', person_id: 'person-student', student_id: 'student-1', role: 'student' },
    memberships: [
      {
        actor_id: 'student-actor',
        instance_id: 'instance-bna',
        workspace_id: 'workspace-bna',
        role: 'student',
        status: 'active',
      },
    ],
  });
}

test('people services dedupe by email and model student, guardian, and provider profiles', () => {
  const context = adminContext();
  const existing = [{ id: 'person-existing', display_name: 'Existing Parent', email: 'Parent@Example.com' }];

  const plan = unwrap(buildPersonUpsertPlan(context, {
    display_name: 'Parent Example',
    email: 'parent@example.com',
    phone: '+1 555 111 2222',
  }, existing));

  assert.equal(plan.action, 'update_existing_person');
  assert.equal(plan.matched_person_id, 'person-existing');
  assert.ok(plan.identity_keys.some((key) => key.type === 'email'));

  const student = unwrap(buildStudentProfile(context, { name: 'Student Example', student_id: 'legacy-student-1', grade: '7' }));
  assert.equal(student.person.person_type, 'student');
  assert.equal(student.legacy_student_id, 'legacy-student-1');

  const guardian = unwrap(buildGuardianRelationship(context, {
    guardian_person_id: 'person-parent',
    student_person_id: student.person_id,
    relationship: 'father',
  }));
  assert.equal(guardian.relationship, 'father');

  const provider = unwrap(buildServiceProviderProfile(context, {
    display_name: 'Provider Example',
    email: 'provider@example.com',
    slug: 'provider-example',
  }));
  assert.equal(provider.slug, 'provider_example');
  assert.equal(provider.person.person_type, 'service_provider');
});

test('community services create scoped communities, groups, posts, and pinned resources', () => {
  const context = adminContext();
  const community = unwrap(createCommunity(context, { title: 'BNA Parent Community', visibility: 'members' }));
  const group = unwrap(createCommunityGroup(context, community, { label: 'Announcements', channel_type: 'announcement' }));
  const post = unwrap(createCommunityPost(context, group, { body: 'Welcome to the private community.' }));
  const resource = unwrap(pinCommunityResource(context, community, { title: 'Handbook', url: 'https://example.test/handbook' }));

  assert.equal(community.workspace_id, 'workspace-bna');
  assert.equal(group.community_id, community.id);
  assert.equal(post.group_id, group.id);
  assert.equal(resource.pinned, true);

  const otherContext = adminContext('workspace-other');
  assert.deepEqual(visibleCommunityRecords(otherContext, [community, group, post, resource]), []);
});

test('course services support module, lesson, provider-neutral video, enrollment, and progress', () => {
  const admin = adminContext();
  const course = unwrap(createCourse(admin, { title: 'Mishnah Foundations', visibility: 'student' }));
  const module = unwrap(createCourseModule(admin, course, { title: 'Berachos Unit 1' }));
  const lesson = unwrap(createLesson(admin, module, { title: 'Lesson 1: Opening Mishnah' }));
  const video = unwrap(createVideoAssetReference(admin, {
    provider: 'vimeo',
    provider_asset_id: 'vimeo-123',
    source_url: 'https://vimeo.com/123',
    playback_url: 'https://player.vimeo.com/video/123',
    thumbnail_url: 'https://example.test/thumb.jpg',
    privacy: 'workspace',
  }));
  const attachment = unwrap(attachVideoToLesson(admin, lesson, video));
  const enrollment = unwrap(enrollMember(admin, course, {
    person_id: 'person-student',
    student_id: 'student-1',
  }));
  const progress = unwrap(recordProgress(studentContext(), enrollment, {
    lesson_id: lesson.id,
    progress_percent: 100,
    source: 'student_portal',
  }));

  assert.equal(course.title, 'Mishnah Foundations');
  assert.equal(module.course_id, course.id);
  assert.equal(lesson.module_id, module.id);
  assert.equal(video.provider, 'vimeo');
  assert.equal(attachment.video_asset_id, video.id);
  assert.equal(enrollment.status, 'active');
  assert.equal(progress.status, 'completed');
});

test('reward services keep incentive policy neutral and require approval before award', () => {
  const context = adminContext();
  const goal = unwrap(createGoal(context, {
    title: 'Complete first unit',
    assignee_person_id: 'person-student',
    target_value: 100,
    unit: 'percent',
  }));
  const milestone = unwrap(createMilestone(context, goal, { title: 'Finish module one', target_value: 100 }));
  const reward = unwrap(createRewardCatalogItem(context, { title: 'Recognition note', reward_type: 'recognition' }));
  const rule = unwrap(createRewardRule(context, reward, { goal_id: goal.id, milestone_id: milestone.id, threshold_value: 100 }));
  const assignment = unwrap(assignReward(context, reward, { assignee_person_id: 'person-student' }));
  const eligibility = unwrap(evaluateRewardEligibility(context, assignment, rule, { value: 100 }));

  assert.equal(eligibility.eligible, true);
  assert.equal(eligibility.automatic_award_performed, false);
  assert.equal(eligibility.policy_state, 'neutral_model_workspace_policy_required');

  const blockedAward = awardReward(context, assignment, {});
  assert.equal(blockedAward.ok, false);
  assert.equal(blockedAward.error.code, 'reward_award_needs_approval');

  const awarded = unwrap(awardReward(context, assignment, { approved: true, awarded_by: 'Shloimie' }));
  assert.equal(awarded.award_state, 'awarded');

  const redeemed = unwrap(redeemReward(context, awarded, { redeemed_by: 'Shloimie' }));
  assert.equal(redeemed.redeem_state, 'redeemed');
});

test('domain link service connects records to existing task and Decision surfaces without creating another task manager', () => {
  const context = adminContext();
  const link = unwrap(buildDomainRecordLink(context, {
    source_type: 'course',
    source_id: 'course-1',
    target_type: 'task',
    target_id: 'TASK-20260619-001',
    relationship: 'implementation_task',
  }));

  assert.equal(link.source_type, 'course');
  assert.equal(link.target_type, 'task');
  assert.equal(link.target_id, 'TASK-20260619-001');
});
