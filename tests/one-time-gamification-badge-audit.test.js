const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const classroom = fs.readFileSync('public/one-time-classroom.html', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

test('server declares badge audit schema, seeds, award/reversal routes, and read-only readiness route', () => {
  [
    'bna_badge_audit_events',
    'ALTER TABLE bna_student_badges ADD COLUMN IF NOT EXISTS reversal_reason',
    'ALTER TABLE bna_student_badges ADD COLUMN IF NOT EXISTS audit_json',
    'oneTimeBadgeDefinitions()',
    "requirement_id: 'REQ-20260619-310'",
    'badgeAwardIdempotencyKey',
    'badgeReversalIdempotencyKey',
    'evaluateAutomaticBadgeAwards',
    "app.get('/api/bna/gamification/badge-readiness', requireAdmin",
    "app.post('/api/bna/student-badges/rabbi-award', requireAdmin",
    "app.post('/api/bna/student-badges/:id/reverse', requireAdmin",
    'badge_slug must be a Rabbi-awarded badge',
    'source_event_ref or source_event_id is required',
    'reversal_reason is required',
    'buildGamificationBadgeReadiness',
    'public_individual_leaderboard_enabled: false',
    "routePath === '/api/bna/gamification/badge-readiness' && method === 'GET'",
    "routePath === '/api/bna/student-badges/rabbi-award' && method === 'POST'",
    "api\\/bna\\/student-badges\\/\\d+\\/reverse",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations Community ledger shows implemented read-only badge audit readiness', () => {
  assert.match(operations, /getWs11BadgeReadiness/);
  assert.match(operations, /renderCommunityBadgeReadinessPanel/);
  assert.match(operations, /data-one-time-badge-audit-readiness/);
  assert.match(operations, /REQ-20260619-310/);
  assert.match(operations, /Gamification \/ Badge Audit/);
  assert.match(operations, /Server-side event badges and manual reversals are implemented/);
  assert.match(operations, /No badge award, badge reversal, parent\/student notification, automatic access grant, prize\/coupon\/credit, negative-point action, or public individual leaderboard runs from this panel/);
  assert.match(operations, /First Class/);
  assert.match(operations, /Thoughtful Question/);
  assert.equal(packageJson.scripts['app:smoke:one-time-gamification'], 'node scripts/smoke-one-time-gamification-live.mjs');
});

test('public One Time classroom renders an approved-only rewards scoreboard', () => {
  assert.match(classroom, /Rewards Scoreboard/);
  assert.match(classroom, /Class Updates/);
  assert.match(classroom, /renderRewardsScoreboard/);
  assert.match(classroom, /renderClassUpdates/);
  assert.match(classroom, /participation_summary/);
  assert.match(classroom, /state\.classroom\?\.leaderboard/);
  assert.match(classroom, /state\.classroom\?\.class_updates/);
  assert.match(classroom, /Approved rewards will appear after Rabbi\/admin review/);
  assert.match(classroom, /Approved class updates will appear here after Rabbi\/admin review/);
  assert.match(classroom, /reward-chip/);
  assert.match(classroom, /public_points/);
  assert.match(classroom, /public_rank/);
  assert.doesNotMatch(classroom, /negative points|automatic prizes|coupon|discount|access grant/i);
});

test('server member-safe classroom payload exposes only approved reward scoreboard rows', () => {
  assert.match(server, /function oneTimeClassroomParticipationSummary/);
  assert.match(server, /function oneTimeClassroomRewardsScoreboard/);
  assert.match(server, /ONE_TIME_CLASSROOM_REWARD_WEIGHTS/);
  assert.match(server, /approved_question: 5/);
  assert.match(server, /approved_response: 3/);
  assert.match(server, /rabbi_featured: 8/);
  assert.match(server, /assignment_participation: 2/);
  assert.match(server, /if \(event\.status !== 'approved' \|\| event\.visibility !== 'classroom'\) continue/);
  assert.match(server, /participation_summary: participation\.participation_summary/);
  assert.match(server, /leaderboard: participation\.leaderboard/);
  assert.match(server, /class_updates: oneTimeClassroomUpdates\(threads, participation\)/);
  assert.match(server, /reward_policy: participation\.reward_policy/);
  assert.match(server, /Raw private replies, held responses, rejected messages, and unreviewed student text are not exposed/);
});

test('route registry declares private badge readiness and badge mutation routes', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const row = routes.get('/api/bna/gamification/badge-readiness');
  assert.ok(row, 'badge readiness route should be registered');
  assert.equal(row.access, 'private');
  assert.equal(row.public_allowed, false);
  assert.equal(row.workspace_scope_required, true);
  assert.match(row.security_expectation, /no badge award/i);
  assert.match(row.security_expectation, /public individual leaderboard/i);
  const award = routes.get('/api/bna/student-badges/rabbi-award');
  assert.ok(award, 'Rabbi award route should be registered');
  assert.equal(award.access, 'private');
  assert.equal(award.public_allowed, false);
  assert.equal(award.workspace_scope_required, true);
  assert.match(award.security_expectation, /Rabbi-awarded badge slug/i);
  assert.match(award.security_expectation, /audit event/i);
  assert.match(award.security_expectation, /no external notification/i);
  const reversal = routes.get('/api/bna/student-badges/:id/reverse');
  assert.ok(reversal, 'manual reversal route should be registered');
  assert.equal(reversal.access, 'private');
  assert.equal(reversal.public_allowed, false);
  assert.equal(reversal.workspace_scope_required, true);
  assert.match(reversal.security_expectation, /reversal reason/i);
  assert.match(reversal.security_expectation, /audit event/i);
  assert.match(reversal.security_expectation, /public individual leaderboard/i);
});
