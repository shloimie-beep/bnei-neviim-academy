const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('One Time Safe Role Preview uses scoped equal-height responsive action grids', () => {
  const html = read('public/operations.html');

  assert.match(html, /class="task-actions one-time-perspective-actions"/);
  assert.match(html, /class="service-meta one-time-perspective-meta"/);
  assert.match(html, /\.one-time-perspective-actions\s*{[^}]*display:\s*grid;/s);
  assert.match(html, /\.one-time-perspective-actions\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(html, /\.one-time-perspective-actions \.task-action\s*{[^}]*min-height:\s*42px;/s);
  assert.match(html, /\.one-time-perspective-actions \.task-action\s*{[^}]*width:\s*100%;/s);
  assert.match(html, /@media \(max-width:\s*640px\)\s*{[\s\S]*?\.one-time-perspective-actions\s*{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(html, /\.one-time-perspective-meta\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(html, /\.one-time-perspective-meta \.status-pill\s*{[^}]*min-height:\s*30px;/s);
  assert.match(html, /@media \(max-width:\s*640px\)\s*{[\s\S]*?\.one-time-perspective-meta\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s);
});

test('One Time admin-provider route shows session-required guidance instead of generic password prompt', () => {
  const html = read('public/provider.html');

  assert.match(html, /one-time-admin-provider-login/);
  assert.match(html, /One Time provider session required/);
  assert.match(html, /This page never asks for Rabbi, student, or member passwords/);
  assert.match(html, /loginForm\?\.classList\.add\('hidden'\)/);
  assert.match(html, /Return to Super Admin Inbox/);
  assert.match(html, /Open Read-only Review Preview/);
});
