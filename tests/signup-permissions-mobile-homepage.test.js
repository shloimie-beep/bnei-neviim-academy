const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const home = fs.readFileSync('public/index.html', 'utf8');
const signupEn = fs.readFileSync('public/signup.html', 'utf8');
const signupHe = fs.readFileSync('public/signup-he.html', 'utf8');
const signupThankYou = fs.readFileSync('public/signup-thank-you.html', 'utf8');
const signupDocuments = fs.readFileSync('public/js/signup-documents.js', 'utf8');
const registrationDocumentHtml = fs.readFileSync('public/documents/registration-document.html', 'utf8');
const registrationDocumentPage = fs.readFileSync('public/js/registration-document-page.js', 'utf8');
const siteNavCss = fs.readFileSync('public/css/bna-site-nav.css', 'utf8');
const siteNavJs = fs.readFileSync('public/js/bna-site-nav.js', 'utf8');

test('signup stores parent permission profile and pickup responsibility fields', () => {
  assert.match(server, /parent_permissions JSONB DEFAULT '\{\}'/);
  assert.match(server, /pickup_responsibility_acknowledged BOOLEAN DEFAULT FALSE/);
  assert.match(server, /pickup_dropoff_notes TEXT/);
  assert.match(server, /parent_permission_notes TEXT/);
  assert.match(server, /function buildParentPermissions/);
  assert.match(server, /permission_leave_premises/);
  assert.match(server, /permission_walk_unaccompanied/);
  assert.match(server, /permission_swimming/);
  assert.match(server, /permission_buy_food/);
  assert.match(server, /permission_junk_food/);
  assert.match(server, /permission_spend_money/);
  assert.match(server, /permission_stay_late/);
  assert.match(server, /parent_permissions = \$22::jsonb/);
  assert.match(server, /parent_permissions, pickup_responsibility_acknowledged, pickup_dropoff_notes, parent_permission_notes/);
  assert.match(server, /parent_permissions: parentPermissions/);
});

test('English and Hebrew signup forms collect parent permissions before submit', () => {
  for (const html of [signupEn, signupHe]) {
    assert.match(html, /id="permission_leave_premises"/);
    assert.match(html, /id="permission_walk_unaccompanied"/);
    assert.match(html, /id="permission_swimming"/);
    assert.match(html, /id="permission_buy_food"/);
    assert.match(html, /id="permission_junk_food"/);
    assert.match(html, /id="permission_spend_money"/);
    assert.match(html, /id="permission_stay_late"/);
    assert.match(html, /type="hidden" id="pickup_responsibility_acknowledged"[^>]*value="true"/);
    assert.doesNotMatch(html, /id="pickup_responsibility_acknowledged"[^>]*required/);
    assert.match(html, /id="pickup_dropoff_notes"/);
    assert.match(html, /id="parent_permission_notes"/);
    assert.match(html, /function pickupResponsibilityAcknowledged/);
    assert.match(html, /function collectParentPermissions/);
    assert.match(html, /parent_permissions: collectParentPermissions\(\)/);
  }
});

test('parent name fields are explicitly black for readability', () => {
  for (const html of [signupEn, signupHe]) {
    assert.match(html, /parent-section-divider/);
    assert.match(html, /label\[for="parent1_name"\]/);
    assert.match(html, /label\[for="parent2_name"\]/);
    assert.match(html, /#parent1_name,\s*\r?\n\s*#parent2_name\s*\{\s*\r?\n\s*color: #000;/);
    assert.match(html, /-webkit-text-fill-color: #000;/);
  }
});

test('registration pages use the shared main-site navigation shell', () => {
  for (const html of [signupEn, signupHe, signupThankYou, registrationDocumentHtml]) {
    assert.match(html, /\/css\/bna-site-nav\.css/);
    assert.match(html, /data-bna-site-nav/);
    assert.match(html, /\/js\/bna-site-nav\.js/);
  }
  assert.match(siteNavCss, /\.bna-site-nav-toggle/);
  assert.match(siteNavCss, /\.bna-site-nav-actions\.is-open/);
  assert.match(siteNavJs, /Parent Login/);
  assert.match(siteNavJs, /Student Login/);
  assert.match(siteNavJs, /Rabbi \/ Provider Login/);
  assert.match(siteNavJs, /bna-site-nav-dropdown-panel/);
});

test('mobile homepage has compact role-aware nav and smaller hero spots badge', () => {
  assert.match(home, /class="nav-menu-toggle"/);
  assert.match(home, /data-i18n="navParentLogin"[^>]*\/parent\/login/);
  assert.match(home, /data-i18n="navStudentLogin"[^>]*\/student\/login/);
  assert.match(home, /data-i18n="navProviderAccess"[^>]*\/provider/);
  assert.match(home, /data-i18n="navProviderJoin"[^>]*\/providers\/join/);
  assert.match(home, /href="\/signup\.html" class="nav-btn nav-btn-signup" data-i18n="navSignup"/);
  assert.match(home, /navProviderAccess: "Rabbi \/ Provider Login"/);
  assert.match(home, /background-position: 48% 50%/);
  assert.match(home, /top: 258px/);
  assert.match(home, /max-width: 148px/);
  assert.match(home, /font-size: 14px/);
});

test('all four signup documents open as full registration pages and return signatures to the form', () => {
  assert.match(server, /app\.get\('\/documents\/registration-document'/);
  for (const agreementType of [
    'parent_handbook',
    'tuition_agreement',
    'safety_acknowledgment_waiver',
    'student_code_of_conduct',
  ]) {
    assert.match(signupDocuments, new RegExp(`'${agreementType}'`));
    assert.match(signupDocuments, new RegExp(`document=\\$\\{encodeURIComponent\\(doc\\.type\\)\\}`));
  }
  assert.match(signupDocuments, /Open each document as a full registration page/);
  assert.match(signupDocuments, /window\.open\(`\/documents\/registration-document\?document=/);
  assert.match(signupDocuments, /window\.BnaRegistrationDocuments/);
  assert.match(registrationDocumentHtml, /data-nav-context="registration-document"/);
  assert.match(siteNavJs, /id="backLink"/);
  assert.match(siteNavJs, /id="languageToggle"/);
  assert.match(registrationDocumentHtml, /id="documentContent"/);
  assert.match(registrationDocumentHtml, /id="signatureSection"/);
  assert.match(registrationDocumentHtml, /\/js\/signup-documents\.js/);
  assert.match(registrationDocumentHtml, /\/js\/registration-document-page\.js/);
  assert.match(registrationDocumentPage, /core\.signatureStorageKey/);
  assert.match(registrationDocumentPage, /source: 'bna-signup-document-signature'/);
  assert.match(registrationDocumentPage, /window\.opener\.postMessage/);
  assert.match(registrationDocumentPage, /window\.close\(\)/);
  assert.match(registrationDocumentPage, /window\.location\.href = returnUrl/);
});
