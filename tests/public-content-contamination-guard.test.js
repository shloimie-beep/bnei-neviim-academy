const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('public content prompts use shared source-separation guardrails', () => {
  assert.match(server, /const PUBLIC_LEARNING_CONTENT_SOURCE_RULES = \[/);
  assert.match(server, /Silently exclude staff-only operational remarks, admin notes, backend notes, task instructions, UI fixes, prompt\/parser comments/);
  assert.match(server, /Do not mention that excluded remarks were excluded; no meta disclaimers/);
  assert.match(server, /Attendance, tracking, accountability, task, portal, and learning-progress data stay in their own parent\/student\/staff sections/);
});

test('public draft generation filters structured summaries and transcripts before model drafting', () => {
  assert.match(server, /function sanitizePublicLearningText/);
  assert.match(server, /function ensurePublicContentPromptGuardrails/);
  assert.match(server, /system-public-content-guardrail/);
  assert.match(server, /const publicOnly = isPublicContentOutputType\(targetType\);/);
  assert.match(server, /contentSummaryForPrompt\(job, \{ publicOnly \}\)/);
  assert.match(server, /sanitizePublicLearningText\(job\.transcript_text, 18000\)/);
  assert.match(server, /publicLearningContentGuardrails\(targetType\)/);
});

test('class-note extraction treats backend, task, attendance, and Torah progress remarks as non-content', () => {
  assert.match(server, /const OPERATIONAL_ADMIN_REMARK_PATTERNS = \[/);
  assert.match(server, /backend\|admin note\|administrative\|task\|tasks/);
  assert.match(server, /attendance tracking\|tracking details/);
  assert.match(server, /torah progress\|learning progress/);
  assert.match(server, /function isNonContentClassText\(value\) \{\s*return isOperationalAdminRemark\(value\);/);
});

test('Operations Content Library routes corrupted Torah-section task notes to Operations topic', () => {
  assert.match(operations, /function contentLooksOperationalAdminRemarkFromHaystack/);
  assert.match(operations, /wrong section\|railway\|api\|database\|server\|deploy/);
  assert.match(operations, /if \(contentLooksOperationalAdminRemarkFromHaystack\(haystack\)\) return 'operations';/);
});
