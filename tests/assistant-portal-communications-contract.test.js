const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const widget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
const signup = fs.readFileSync('public/signup.html', 'utf8');
const signupHe = fs.readFileSync('public/signup-he.html', 'utf8');
const thankYou = fs.readFileSync('public/signup-thank-you.html', 'utf8');
const student = fs.readFileSync('public/student.html', 'utf8');
const parent = fs.readFileSync('public/parent.html', 'utf8');
const provider = fs.readFileSync('public/provider.html', 'utf8');

test('active email paths normalize sender identity and reject Office P', () => {
  const activeEmailSources = [server, envExample, signup, signupHe].join('\n');

  assert.match(server, /function academySenderIdentity/);
  assert.match(server, /function safeSenderDisplayName/);
  assert.match(server, /Bnei Neviim Academy Office/);
  assert.match(server, /Rabbi Scheller Office/);
  assert.match(server, /EMAIL_PROVIDER/);
  assert.match(server, /async function sendResendMessage/);
  assert.match(server, /async function sendEmail/);
  assert.match(envExample, /EMAIL_PROVIDER=gmail/);
  assert.match(envExample, /RESEND_FROM_NAME=Bnei Neviim Academy Office/);
  assert.doesNotMatch(activeEmailSources, /Office P|office p/);
});

test('communications store full message bodies and are exposed through scoped APIs', () => {
  assert.match(server, /ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS body_text TEXT/);
  assert.match(server, /ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS body_html TEXT/);
  assert.match(server, /ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS from_name TEXT/);
  assert.match(server, /ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS provider TEXT/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communications/);
  assert.match(server, /async function logCommunication/);
  assert.match(server, /await logCommunication\(/);
  assert.match(server, /app\.get\('\/api\/bna\/communications'/);
  assert.match(server, /app\.get\('\/api\/bna\/contacts\/:id\/communications'/);
  assert.match(server, /app\.get\('\/api\/bna\/signups\/:id\/communications'/);
  assert.match(server, /app\.get\('\/api\/bna\/students\/:id\/communications'/);
  assert.match(server, /app\.get\('\/api\/bna\/tasks\/:id\/communications'/);
});

test('credit signups create checkout attempts and abandoned checkout sweep is approval gated', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_checkout_attempts/);
  assert.match(server, /async function createOrUpdateCheckoutAttemptForSignup/);
  assert.match(server, /async function runAbandonedCheckoutSweep/);
  assert.match(server, /function abandonedCheckoutEmail/);
  assert.match(server, /app\.post\('\/api\/bna\/checkout\/attempts'/);
  assert.match(server, /app\.patch\('\/api\/bna\/checkout\/attempts\/:id'/);
  assert.match(server, /app\.post\('\/api\/bna\/checkout\/sweep-abandoned'/);
  assert.match(server, /SEND_ABANDONED_CHECKOUT_EMAILS/);
  assert.match(signup, /checkoutAttemptId/);
  assert.match(signup, /checkoutAttemptToken/);
  assert.match(signupHe, /checkoutAttemptId/);
  assert.match(signupHe, /checkoutAttemptToken/);
  assert.match(thankYou, /markCheckoutRedirected/);
  assert.match(thankYou, /\/api\/bna\/checkout\/attempts\/\$\{encodeURIComponent\(checkoutAttemptId\)\}/);
});

test('signup flow dedupes into first-party contacts, user accounts, and login tokens', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_contacts/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_contact_identities/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_user_accounts/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_login_tokens/);
  assert.match(server, /async function upsertContactFromSignup/);
  assert.match(server, /async function ensureSignupPortalAccess/);
  assert.match(server, /async function ensureUserAccountForRole/);
  assert.match(server, /createParentPasswordResetToken/);
});

test('assistant shell is mobile keyboard aware and persists role-scoped state', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_threads/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_messages/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_memory/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/context'/);
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/threads'/);
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/actions\/:action'/);
  assert.match(widget, /visualViewport/);
  assert.match(widget, /syncVisualViewportHeight/);
  assert.match(widget, /--app-vh/);
  assert.match(widget, /assistant-shell/);
  assert.match(widget, /assistant-messages/);
  assert.match(widget, /assistant-composer/);
  assert.match(widget, /overscroll-behavior: contain/);
});

test('WhatsApp import creates first-party leads and never auto-sends messages', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_message_connectors/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_whatsapp_messages/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_contact_pipeline_events/);
  assert.match(server, /async function importWhatsappMessages/);
  assert.match(server, /async function findOrCreateWhatsappContact/);
  assert.match(server, /app\.post\('\/api\/bna\/whatsapp\/sync'/);
  assert.match(server, /app\.post\('\/api\/bna\/whatsapp\/import'/);
  assert.match(server, /No WhatsApp messages are sent by import/);
  assert.match(server, /auto_sending: false/);
});

test('tickets, communities, classes, files, reviews, and readiness APIs exist', () => {
  assert.match(server, /app\.get\('\/api\/bna\/tickets'/);
  assert.match(server, /app\.post\('\/api\/bna\/tickets'/);
  assert.match(server, /app\.get\('\/api\/bna\/communities'/);
  assert.match(server, /app\.post\('\/api\/bna\/communities'/);
  assert.match(server, /app\.get\('\/api\/bna\/classes'/);
  assert.match(server, /app\.post\('\/api\/bna\/classes\/import'/);
  assert.match(server, /app\.post\('\/api\/bna\/files\/intake'/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_uploaded_files/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_review_requests/);
  assert.match(server, /app\.get\('\/api\/bna\/google\/readiness'/);
  assert.match(server, /app\.get\('\/api\/bna\/resend\/status'/);
});

test('portal pages keep the assistant and avoid horizontal overflow on mobile', () => {
  for (const html of [student, parent, provider]) {
    assert.match(html, /max-width:\s*100%/);
    assert.match(html, /overflow-x:\s*hidden/);
    assert.match(html, /\/js\/bna-bot-widget\.js/);
  }
});
