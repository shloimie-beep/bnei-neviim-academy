const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const cssPath = 'public/css/one-time-operations.css';

test('One Time Operations brand stylesheet exists with scoped visual tokens', () => {
  assert.equal(fs.existsSync(cssPath), true, `${cssPath} should exist`);

  const css = fs.readFileSync(cssPath, 'utf8');
  const requiredTokens = [
    '--ot-ops-background: #080910',
    '--ot-ops-panel: #10131a',
    '--ot-ops-card: #081323',
    '--ot-ops-card-strong: #102634',
    '--ot-ops-muted-text: #aeb9c6',
    '--ot-ops-accent: #0b9fc9',
    '--ot-ops-accent-deep: #08779c',
    '--ot-ops-warning-gated: #ede518',
    '--ot-ops-success-ready: #08779c',
    '--ot-ops-preview-no-write: #faf9f4',
  ];

  for (const token of requiredTokens) {
    assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(css, /--ot-ops-logo: url\("\/images\/one-time\/brand\/onetimelogo\.webp"\)/);
  assert.match(css, /--ot-ops-hero-portrait: url\("\/images\/one-time\/brand\/onetime-hero-vertical\.webp"\)/);
});

test('One Time Operations CSS is scoped and avoids global body overrides', () => {
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.match(css, /body\.one-time-operations-active/);
  assert.match(css, /\[data-one-time-rabbi-dashboard\]/);
  assert.match(css, /\[data-one-time-rabbi-module\]/);
  assert.doesNotMatch(css, /(^|\n)\s*:root\s*\{/);
  assert.doesNotMatch(css, /(^|\n)\s*body\s*(?:,|\{)/);
  assert.doesNotMatch(css, /(^|\n)\s*\.ops-main\s*\{/);
  assert.doesNotMatch(css, /display:\s*none/i);
  assert.doesNotMatch(css, /visibility:\s*hidden/i);
});

test('One Time Operations card, module, blocker, chip, and mobile selectors are available', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  const expectedSelectors = [
    '.one-time-ops-dashboard-hero',
    '.one-time-ops-package-status',
    '.one-time-ops-module-grid',
    '.one-time-ops-setup-blockers',
    '.one-time-ops-content-card',
    '.one-time-ops-chip',
    '.one-time-ops-mobile-button-row',
    '.one-time-approval-packet',
    '.one-time-lane-grid',
    '.one-time-output-grid',
    '.one-time-blocker-chip',
    '[data-one-time-drive-brief-preview] .example-chip',
  ];

  for (const selector of expectedSelectors) {
    assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
});
