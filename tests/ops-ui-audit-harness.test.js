const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { normalizeSeverity } = require('../tools/ops-ui-audit/detectors');
const { VIEWPORTS } = require('../tools/ops-ui-audit/config');
const { collectPackageFiles, shouldIncludePackageFile } = require('../tools/ops-ui-audit/package-export');
const { redactSensitiveText } = require('../tools/ops-ui-audit/privacy');
const { classifyAction } = require('../tools/ops-ui-audit/safe-actions');
const { buildStateFingerprint, normalizeUrl, screenshotFilename } = require('../tools/ops-ui-audit/state-discovery');
const { executiveSummary, screenshotIndex } = require('../tools/ops-ui-audit/reporter');

test('safe-action policy blocks mutating concepts and permits read-only navigation', () => {
  assert.equal(classifyAction({ label: 'Send WhatsApp update' }).safe, false);
  assert.match(classifyAction({ label: 'Send WhatsApp update' }).reason, /send|whatsapp|risky/i);
  assert.equal(classifyAction({ label: 'Open details', role: 'button' }).safe, true);
  assert.equal(classifyAction({ label: 'Save filter', inForm: true }).safe, false);
});

test('operations UI audit covers required Batch 6 viewport widths', () => {
  assert.deepEqual(VIEWPORTS.map((viewport) => viewport.width), [1440, 1024, 768, 430, 390, 360]);
});

test('state fingerprint and route normalization are deterministic', () => {
  const first = buildStateFingerprint({
    url: 'https://bneineviimacademy.org/operations?b=2&a=1&t=123#tasks',
    title: 'BNA Operations',
    mainHeading: 'Tasks',
    activeLabels: ['Done', 'Tasks'],
    workspace: 'BNA',
  });
  const second = buildStateFingerprint({
    url: 'https://bneineviimacademy.org/operations?a=1&b=2#tasks',
    title: 'BNA Operations',
    mainHeading: 'Tasks',
    activeLabels: ['Tasks', 'Done'],
    workspace: 'BNA',
  });
  assert.equal(first, second);
  assert.equal(normalizeUrl('https://bneineviimacademy.org/operations?ts=999&view=tasks&utm_source=x'), '/operations?view=tasks');
});

test('screenshot filenames are stable and filesystem safe', () => {
  const name = screenshotFilename(42, {
    module: 'Tasks',
    activeLabels: ['Decisions'],
    workspace: 'BNA School',
    mainHeading: 'Needs Attention',
  }, 'mobile-390');
  assert.equal(name, '042-tasks-decisions-bna-school-needs-attention.png');
});

test('redaction regexes mask emails phones tokens and long identifiers', () => {
  const redacted = redactSensitiveText('email test@example.com phone +1 (555) 222-3333 token sk_test_123456789012345 id 123456789');
  assert.equal(redacted.includes('test@example.com'), false);
  assert.equal(redacted.includes('555'), false);
  assert.equal(redacted.includes('sk_test'), false);
  assert.match(redacted, /\[email\]/);
  assert.match(redacted, /\[phone\]/);
});

test('report generation helpers produce expected sections', () => {
  const data = syntheticAuditData();
  assert.match(executiveSummary(data), /Top Issues/);
  assert.match(screenshotIndex(data), /screenshots\/mobile-390\/001-tasks\.png/);
});

test('package collection excludes storage state secrets and raw files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ops-ui-audit-package-'));
  fs.mkdirSync(path.join(dir, 'screenshots', 'mobile-390'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.runtime', 'auth'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'AUDIT.md'), '# audit');
  fs.writeFileSync(path.join(dir, 'issues.json'), '[]');
  fs.writeFileSync(path.join(dir, 'screenshots', 'mobile-390', '001.png'), 'png');
  fs.writeFileSync(path.join(dir, '.runtime', 'auth', 'operations-storage-state.json'), '{}');
  fs.writeFileSync(path.join(dir, 'secret-token.txt'), 'secret');
  fs.writeFileSync(path.join(dir, 'raw-unredacted.png'), 'raw');
  const files = collectPackageFiles(dir).map((item) => item.archivePath);
  assert.deepEqual(files.sort(), ['AUDIT.md', 'issues.json', 'screenshots/mobile-390/001.png'].sort());
  assert.equal(shouldIncludePackageFile(path.join(dir, 'agent-review-package.zip'), dir), false);
});

test('severity serialization normalizes invalid values', () => {
  assert.equal(normalizeSeverity('P0'), 'P0');
  assert.equal(normalizeSeverity('bad'), 'P2');
  assert.equal(normalizeSeverity('p3'), 'P3');
});

function syntheticAuditData() {
  return {
    metadata: {
      baseUrl: 'https://bneineviimacademy.org',
      startPath: '/operations',
      startedAt: '2026-06-18T00:00:00.000Z',
      finishedAt: '2026-06-18T00:01:00.000Z',
      privacyMode: 'redact',
      incomplete: false,
      runDir: 'ops/ui-audits/runs/test',
    },
    routeMap: { routes: [{ route: '/operations', firstStateId: 'STATE-001' }] },
    stateMap: { states: [{ id: 'STATE-001', route: '/operations', module: 'Tasks' }], edges: [] },
    issues: [{
      id: 'ISSUE-001',
      severity: 'P2',
      confidence: 'medium',
      issue: 'Synthetic issue',
      route: '/operations',
      viewport: 'mobile-390',
      evidence: 'fixture',
      category: 'layout',
      screenshot: 'screenshots/mobile-390/001-tasks.png',
    }],
    controls: [],
    links: [],
    consoleErrors: [],
    networkErrors: [],
    accessibility: [],
    screenshots: [{ stateId: 'STATE-001', viewport: 'mobile-390', path: 'screenshots/mobile-390/001-tasks.png', metrics: { horizontalOverflow: false } }],
  };
}
