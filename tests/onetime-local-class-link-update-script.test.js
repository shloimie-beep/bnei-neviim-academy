const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'send-onetime-local-class-link-update.mjs'), 'utf8');

test('One Time local-student current-link resend runner is explicitly approval gated', () => {
  assert.match(script, /requires --send after operator approval/);
  assert.match(script, /--confirm-current-link-send=SEND_TO_LOCAL_STUDENTS/);
  assert.match(script, /--expected-count/);
  assert.match(script, /Expected .* local-student recipients but scoped CRM resolved/);
});

test('One Time local-student current-link resend runner resolves only scoped local tags', () => {
  assert.match(script, /WORKSPACE_KEY = 'rabbi_sheller_provider'/);
  assert.match(script, /PROJECT_KEY = 'one_time_mishnah_class'/);
  assert.match(script, /hasFlag\('railway-auth'\)[\s\S]*\? DEFAULT_APP_URL/);
  assert.match(script, /local_class_attendee/);
  assert.match(script, /zoom_mishnayos_class/);
  assert.match(script, /local_student/);
  assert.match(script, /\/api\/bna\/parent-leads\?project_key=\$\{PROJECT_KEY\}&workspace=\$\{WORKSPACE_KEY\}/);
});

test('One Time local-student current-link resend runner sends individual One Time email drafts only', () => {
  assert.match(script, /to: \[lead\.email\]/);
  assert.match(script, /source: 'one_time_local_student_current_link_resend'/);
  assert.match(script, /Current Zoom link for today's Mishnayos class/);
  assert.match(script, /One Time Mishnayos/);
  assert.doesNotMatch(script, /Bnei Neviim Academy/);
  assert.doesNotMatch(script, /BNA Academy/);
});

test('One Time local-student current-link resend runner keeps secrets out of evidence', () => {
  assert.match(script, /redactedZoomUrl/);
  assert.match(script, /pwd=\[redacted\]/);
  assert.match(script, /maskEmail/);
  assert.match(script, /exact_zoom_url_not_stored_in_evidence: true/);
  assert.match(script, /No WhatsApp\/WAPI/);
});
