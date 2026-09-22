const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const matrixPath = 'ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md';

test('goal-mode completion matrix covers every original brief phase', () => {
  const matrix = fs.readFileSync(matrixPath, 'utf8');

  const phases = [
    'Phase 0',
    'Phase 1',
    'Phase 2',
    'Phase 3',
    'Phase 4',
    'Phase 5',
    'Phase 6',
    'Phase 7',
    'Phase 8',
    'Phase 9',
    'Phase 10',
    'Phase 11',
    'Phase 12',
    'Phase 13',
    'Phase 14',
    'Phase 15',
    'Phase 16',
  ];

  for (const phase of phases) {
    assert.match(matrix, new RegExp(`\\| ${phase} \\|`));
  }

  assert.match(matrix, /done_deployed/);
  assert.match(matrix, /done_local/);
  assert.match(matrix, /preview_ready/);
  assert.match(matrix, /blocked_owner_or_connector/);
});

test('goal-mode completion matrix preserves approval gates and no-write boundaries', () => {
  const matrix = fs.readFileSync(matrixPath, 'utf8');

  assert.match(matrix, /APPROVE_GOOGLE_LIVE_ADAPTER_TEST/);
  assert.match(matrix, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
  assert.match(matrix, /APPROVE_BUFFER_SOCIAL_DRAFT/);
  assert.match(matrix, /Green Invoice, Stripe, or a short manual/);
  assert.match(matrix, /No payment link|payment links/);
  assert.match(matrix, /Do not convert a blocked\s+connector/);
  assert.match(matrix, /first-party BNA, not GHL/);
  assert.doesNotMatch(matrix, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(matrix, /password\s*[:=]\s*\S+/i);
});

test('goal-mode completion matrix reflects deployed One Time member-library path', () => {
  const matrix = fs.readFileSync(matrixPath, 'utf8');

  assert.match(matrix, /one_time_member_library_items/);
  assert.match(matrix, /Class Package Manager/);
  assert.match(matrix, /\/member-library/);
  assert.match(matrix, /2026-06-15T07-10-48-018Z-one-time-member-library-live-smoke\.md/);
  assert.match(matrix, /first-party path exists/);
  assert.match(matrix, /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/);
});

test('goal-mode completion matrix reflects deployed external access dry-run preview', () => {
  const matrix = fs.readFileSync(matrixPath, 'utf8');

  assert.match(matrix, /dry-run external-access preview endpoint\/form/);
  assert.match(matrix, /New external-user persistence remains disabled/);
  assert.match(matrix, /APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW/);
  assert.doesNotMatch(matrix, /dry-run-first endpoint is implemented/);
});

test('goal-mode completion matrix reflects deployed private One Time question digest preview', () => {
  const matrix = fs.readFileSync(matrixPath, 'utf8');

  assert.match(matrix, /private question digest preview/);
  assert.match(matrix, /b43bdbf2-1526-4cab-86e8-a527f6e76b42/);
  assert.match(matrix, /2026-06-15T13-22-30-000Z-one-time-question-digest-live-smoke\.md/);
  assert.match(matrix, /notifications remain blocked/);
  assert.match(matrix, /moderation, safety, visibility, and send approval/);
});
