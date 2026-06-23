const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  detectTelegramAccountabilityType,
  extractTelegramAccountabilityDetails,
  hasParentAccountabilityRoutingIntent,
  isLikelyTelegramStudentAccountabilityUnit,
} = require('../src/lib/bna/telegram-accountability-parser');
const { parseMetadata } = require('../src/lib/bna/goal-board');

test('Telegram parent meeting chores and bedtime phrase creates review-gated Goal Board metadata', () => {
  const text = [
    'Parent meeting for Menachem: create a goal for chores and bedtime.',
    'Checklist: clean floor before 10:00 PM; be in bed by 10:00 PM.',
    'Consequence: no going out the next day.',
    'Incentive: 80% target earns park time.',
    'Keep parent visible and student hidden pending review.',
  ].join(' ');

  assert.equal(detectTelegramAccountabilityType(text), 'student_goal');
  assert.equal(isLikelyTelegramStudentAccountabilityUnit(text, 'student_goal', null), true);

  const details = extractTelegramAccountabilityDetails(text);
  const goalBoard = parseMetadata(details.metadata).goal_board;

  assert.equal(goalBoard.source, 'parent_meeting');
  assert.equal(goalBoard.section, 'personal_home');
  assert.equal(goalBoard.subsection, 'Chores and bedtime');
  assert.deepEqual(goalBoard.checklist, ['clean floor before 10:00 PM', 'be in bed by 10:00 PM']);
  assert.equal(goalBoard.agreement.bedtime_time, '22:00');
  assert.match(goalBoard.agreement.chosen_consequence, /no going out/i);
  assert.match(goalBoard.consequence.recovery_path, /no going out/i);
  assert.equal(goalBoard.incentive.percent_target, 80);
  assert.equal(goalBoard.parent_visible, true);
  assert.equal(goalBoard.student_visible, false);
  assert.equal(goalBoard.approval_required, true);
  assert.equal(goalBoard.approval_status, 'pending_review');
});

test('Telegram parent update permissions phrase stays parent-visible and student-hidden', () => {
  const text = [
    'Parent update from mother: permission goal for Amitai.',
    'He may go out only after the agreed checklist is done.',
    'Recovery path: ask Rabbi before the permission opens again.',
  ].join(' ');

  const details = extractTelegramAccountabilityDetails(text);
  const goalBoard = parseMetadata(details.metadata).goal_board;

  assert.equal(goalBoard.source, 'parent_update');
  assert.equal(goalBoard.section, 'permissions');
  assert.equal(goalBoard.subsection, 'Permissions');
  assert.equal(goalBoard.parent_visible, true);
  assert.equal(goalBoard.student_visible, false);
  assert.equal(goalBoard.approval_status, 'pending_review');
  assert.match(goalBoard.consequence.recovery_path, /ask Rabbi/i);
});

test('Telegram incentive phrase captures incentive section and percent target', () => {
  const text = 'Goal Board incentive for Hillel: reward if he hits 85% of the weekly target.';
  const details = extractTelegramAccountabilityDetails(text);
  const goalBoard = parseMetadata(details.metadata).goal_board;

  assert.equal(goalBoard.source, 'admin');
  assert.equal(goalBoard.section, 'incentives');
  assert.equal(goalBoard.subsection, 'Incentives');
  assert.equal(goalBoard.incentive.percent_target, 85);
  assert.equal(goalBoard.parent_visible, true);
  assert.equal(goalBoard.student_visible, true);
});

test('Parent accountability media intent is distinct from marketing content intent', () => {
  assert.equal(
    hasParentAccountabilityRoutingIntent('Parent meeting recording from Ahuva: bedtime chores, consequence, incentive target, and WhatsApp button note.'),
    true
  );
  assert.equal(
    hasParentAccountabilityRoutingIntent('WhatsApp parent update: make this into short bullets for parents.'),
    false
  );
});

test('mixed recording parser prompt and persistence preserve Goal Board API fields', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

  assert.match(server, /For student_goal events, include goal_board data when possible/);
  assert.match(server, /Allowed Goal Board sections are: learning, personal_home, permissions, incentives, and meetings/);
  assert.match(server, /function mixedRecordingAccountabilityMetadata/);
  assert.match(server, /parentReviewGoalBoardPayload/);
  assert.match(server, /goalBoardMetadataFromPayload/);
});
