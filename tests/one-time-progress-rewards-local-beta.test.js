const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID,
  buildOneTimeProgressRewardContract,
  buildOneTimeProgressRewardSeed,
  buildOneTimeProgressRewardSnapshot,
  buildOneTimeProgressRewardViews,
} = require('../src/platform/progress');
const { buildOneTimeInstanceConfig } = require('../src/platform/instances/one-time');

test('One Time instance exposes local progress and reward contracts with seed data', () => {
  const config = buildOneTimeInstanceConfig();

  assert.equal(config.progress_rewards.requirement_id, 'REQ-20260619-414');
  assert.equal(config.progress_rewards.mode, 'local_seed_progress_rewards');
  assert.equal(config.progress_rewards.preview_only, true);
  assert.equal(config.progress_rewards.external_write_performed, false);
  assert.equal(config.progress_rewards.privacy_policy.parent_scope, 'linked_students_only');
  assert.equal(config.progress_rewards.privacy_policy.student_scope, 'own_record_only');
  assert.equal(config.progress_rewards.privacy_policy.public_individual_leaderboard_enabled, false);
  assert.ok(Array.isArray(config.seed.progress_rewards.students));
  assert.ok(config.seed.progress_rewards.students.length >= 2);
});

test('local snapshot calculates attendance, progress, milestones, achievements, and reward reviews', () => {
  const seed = buildOneTimeProgressRewardSeed();
  const snapshot = buildOneTimeProgressRewardSnapshot({ seed });
  const student = snapshot.students.find((row) => row.student_id === 'ot-student-001');

  assert.equal(snapshot.requirement_id, ONE_TIME_PROGRESS_REWARDS_REQUIREMENT_ID);
  assert.equal(snapshot.preview_only, true);
  assert.equal(snapshot.external_write_performed, false);
  assert.equal(snapshot.production_mutation_performed, false);
  assert.equal(snapshot.source, 'local_seed_or_test_data');
  assert.equal(snapshot.group_summary.student_count, 2);
  assert.equal(snapshot.group_summary.attended_minutes, 200);
  assert.ok(snapshot.group_summary.average_course_progress_percent > 0);
  assert.equal(snapshot.reward_policy.automatic_award_performed, false);
  assert.equal(snapshot.reward_policy.public_individual_leaderboard_enabled, false);

  assert.equal(student.attendance.sessions_seen, 3);
  assert.equal(student.attendance.present_count, 2);
  assert.equal(student.attendance.attended_minutes, 110);
  assert.equal(student.attendance.attendance_percent, 81);
  assert.equal(student.course_progress.lessons_seen, 3);
  assert.equal(student.course_progress.progress_percent, 70);
  assert.ok(student.milestones.some((milestone) => milestone.key === 'first_class' && milestone.status === 'achieved'));
  assert.ok(student.achievements.some((achievement) => achievement.status === 'achieved_parent_visible'));
  assert.ok(student.reward_reviews.some((reward) => reward.eligibility_state === 'eligible_for_review'));
  assert.ok(student.reward_reviews.some((reward) => reward.eligibility_state === 'not_yet_eligible'));
  assert.equal(student.reward_reviews.every((reward) => reward.automatic_award_performed === false), true);
});

test('privacy views limit student, parent, provider, and public readback', () => {
  const snapshot = buildOneTimeProgressRewardSnapshot();
  const studentView = buildOneTimeProgressRewardViews(snapshot, {
    viewer: 'student',
    student_id: 'ot-student-002',
  });
  const parentView = buildOneTimeProgressRewardViews(snapshot, {
    viewer: 'parent',
    linked_student_ids: ['ot-student-001'],
  });
  const providerView = buildOneTimeProgressRewardViews(snapshot, { viewer: 'provider' });
  const publicView = buildOneTimeProgressRewardViews(snapshot, { viewer: 'public' });

  assert.deepEqual(studentView.students.map((row) => row.student_id), ['ot-student-002']);
  assert.equal(studentView.privacy.own_record_only, true);
  assert.equal(studentView.privacy.other_student_records_returned, false);
  assert.deepEqual(parentView.students.map((row) => row.student_id), ['ot-student-001']);
  assert.equal(parentView.privacy.linked_students_only, true);
  assert.equal(providerView.students.length, 2);
  assert.equal(publicView.students.length, 0);
  assert.equal(publicView.privacy.aggregate_only, true);
  assert.equal(publicView.group_summary.student_count, 2);
  assert.equal(publicView.privacy.public_individual_leaderboard_enabled, false);

  const serialized = JSON.stringify({ studentView, parentView, providerView, publicView, snapshot });
  assert.doesNotMatch(serialized, /private-parent-a@example/);
  assert.doesNotMatch(serialized, /private-parent-b@example/);
  assert.doesNotMatch(serialized, /not returned/);
});

test('progress and rewards doc records no-write privacy contract', () => {
  const contract = buildOneTimeProgressRewardContract();
  const doc = fs.readFileSync('docs/product/one-time-progress-rewards-local-beta.md', 'utf8');

  assert.equal(contract.preview_only, true);
  assert.match(doc, /attendance sessions and exact attended minutes/i);
  assert.match(doc, /Rewards do not auto-award/i);
  assert.match(doc, /linked students only/i);
  assert.match(doc, /Public view:[\s\S]*aggregate only[\s\S]*no leaderboard/i);
  assert.match(doc, /external_write_performed: false/);
});
