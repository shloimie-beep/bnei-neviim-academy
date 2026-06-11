const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const operations = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');
const parent = fs.readFileSync(path.join(repoRoot, 'public', 'parent.html'), 'utf8');
const student = fs.readFileSync(path.join(repoRoot, 'public', 'student.html'), 'utf8');
const provider = fs.readFileSync(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
const shellCss = fs.readFileSync(path.join(repoRoot, 'public', 'css', 'bna-app-shell.css'), 'utf8');

test('Operations uses app-wide BNA brand shell and light SaaS toolbar', () => {
  assert.match(operations, /ops-brand-topbar/);
  assert.match(operations, /Bnei Neviim Academy/);
  assert.match(operations, /BNA School Workspace/);
  assert.match(operations, /Platform \/ Super Admin/);
  assert.match(shellCss, /--bna-shell-blue: #111111/);
  assert.doesNotMatch(shellCss, /#1f5f8f|#173f64|rgba\(31, 95, 143|rgba\(23, 63, 100/);
  assert.doesNotMatch(operations, /#1f5f8f|#173f64|rgba\(31, 95, 143|rgba\(23, 63, 100/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.ops-brand-topbar/);
});

test('parent, student, and provider portals share the BNA static brand bar', () => {
  for (const html of [parent, student, provider]) {
    assert.match(html, /brand-topbar/);
    assert.match(html, /brand-mark/);
    assert.match(html, /Bnei Neviim Academy/);
  }
  assert.doesNotMatch(provider, /#1f5f8f|#173f64|rgba\(31, 95, 143|rgba\(23, 63, 100/);
});
