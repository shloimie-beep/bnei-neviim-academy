const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const classroom = fs.readFileSync('public/one-time-classroom.html', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));

test('server declares badge audit schema, seeds, and no-write readiness route', () => {
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
    "app.post('/api/bna/student-badges/:id/reverse', requireAdmin",
    'reversal_reason is required',
    'buildGamificationBadgeReadiness',
    'public_individual_leaderboard_enabled: false',
    "routePath === '/api/bna/gamification/badge-readiness' && method === 'GET'",
    "api\\/bna\\/student-badges\\/\\d+\\/reverse",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('Operations Community ledger shows no-write badge audit readiness', () => {
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

test('public One Time classroom does not render a ranked public leaderboard', () => {
  assert.match(classroom, /Approved Participation/);
  assert.match(classroom, /renderApprovedParticipation/);
  assert.match(classroom, /participation_summary/);
  assert.match(classroom, /Reviewed/);
  assert.doesNotMatch(classroom, />Leaderboard</);
  assert.doesNotMatch(classroom, /class="rank"/);
  assert.doesNotMatch(classroom, /Number\(row\.points/);
  assert.doesNotMatch(classroom, /Number\(row\.rank/);
});

test('server member-safe classroom payload keeps leaderboard empty', () => {
  assert.match(server, /function oneTimeClassroomParticipationSummary/);
  assert.match(server, /participation_summary: participation\.participation_summary/);
  assert.match(server, /leaderboard: \[\]/);
  assert.doesNotMatch(server, /oneTimeClassroomLeaderboard/);
});

test('route registry declares private no-write badge readiness route', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const row = routes.get('/api/bna/gamification/badge-readiness');
  assert.ok(row, 'badge readiness route should be registered');
  assert.equal(row.access, 'private');
  assert.equal(row.public_allowed, false);
  assert.equal(row.workspace_scope_required, true);
  assert.match(row.security_expectation, /no badge award/i);
  assert.match(row.security_expectation, /public individual leaderboard/i);
  const reversal = routes.get('/api/bna/student-badges/:id/reverse');
  assert.ok(reversal, 'manual reversal route should be registered');
  assert.equal(reversal.public_allowed, false);
  assert.match(reversal.security_expectation, /reversal reason/i);
  assert.match(reversal.security_expectation, /audit event/i);
});
