const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const shellCss = fs.readFileSync('public/css/bna-app-shell.css', 'utf8');
const appSelectJs = fs.readFileSync('public/js/app-select.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');
const loginHtml = fs.readFileSync('public/operations-login.html', 'utf8');

test('live app pages load the shared BNA brand shell', () => {
  for (const html of [operationsHtml, parentHtml, studentHtml, loginHtml]) {
    assert.match(html, /<link rel="stylesheet" href="\/css\/bna-app-shell\.css">/);
    assert.match(html, /<body class="bna-shell/);
  }

  assert.match(operationsHtml, /class="bna-shell bna-ops-shell-page"/);
  assert.match(parentHtml, /class="bna-shell bna-portal-page bna-parent-page"/);
  assert.match(studentHtml, /class="bna-shell bna-portal-page bna-student-page"/);
  assert.match(loginHtml, /class="bna-shell bna-login-shell"/);
});

test('Operations shell includes branded mobile header and scoped workspace label', () => {
  assert.match(operationsHtml, /class="ops-mobile-brand"/);
  assert.match(operationsHtml, /const logoUrl = workspaceBranding\?\.logo_url \|\| '\/icons\/icon-192\.png'/);
  assert.match(operationsHtml, /class="ops-mobile-mark" src="\$\{escapeHtml\(logoUrl\)\}"/);
  assert.match(operationsHtml, /class="ops-brand-mark" src="\$\{escapeHtml\(logoUrl\)\}"/);
  assert.match(operationsHtml, /onerror="this\.src='\/icons\/icon-192\.png'"/);
  assert.match(operationsHtml, /function renderWorkspaceContextStrip/);
  assert.match(operationsHtml, /function opsWorkspaceLabel/);
  assert.match(operationsHtml, /All Operations/);
  assert.match(operationsHtml, /BNA/);
  assert.match(operationsHtml, /Workspace Directory/);
  assert.match(operationsHtml, /One Time Mishnah Class/);
  assert.match(operationsHtml, /Family App \/ Home Accountability/);
});

test('shared shell defines light BNA palette, sticky toolbar, side menus, and top filters', () => {
  assert.match(shellCss, /--bna-shell-blue:\s*#1e3a5f/);
  assert.match(shellCss, /--bna-shell-gold:\s*#c9a227/);
  assert.match(shellCss, /--bna-shell-sky:\s*#e8f0f8/);
  assert.match(shellCss, /--bna-shell-page:\s*#f7f3e8/);
  assert.doesNotMatch(shellCss, /--bna-shell-blue:\s*#111111|--bna-shell-blue-dark:\s*#050505/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.ops-brand-topbar/);
  assert.match(shellCss, /body\.bna-portal-page \.brand-topbar/);
  assert.match(shellCss, /body\.bna-portal-page \.portal-menu-toggle/);
  assert.match(shellCss, /body\.bna-portal-page \.section-control/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.filter-dropdown-menu/);
  assert.match(shellCss, /@media \(max-width: 768px\)/);
});

test('custom select enhancer uses light in-app menus for Operations and portals', () => {
  assert.match(appSelectJs, /background: #ffffff/);
  assert.match(appSelectJs, /html\[data-app-select-surface="operations"\] \.app-select__button/);
  assert.match(appSelectJs, /html\[data-app-select-surface="operations"\] \.app-select__menu[\s\S]*background: #ffffff/);
  assert.match(appSelectJs, /linear-gradient\(135deg, #fff2bd, #fff1df\)/);
});
