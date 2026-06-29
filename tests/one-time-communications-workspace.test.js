const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const resendClient = fs.readFileSync('src/lib/integrations/resend-client.js', 'utf8');
const externalActions = fs.readFileSync('src/lib/integrations/external-actions.js', 'utf8');

test('One Time WhatsApp operator workspace keeps the three-pane no-send contract', () => {
  assert.match(operations, /data-wapi-three-pane-workspace/);
  assert.match(operations, /id="wapiPhonebookPane"/);
  assert.match(operations, /id="wapiConversationPane"/);
  assert.match(operations, /id="wapiDetailsPane"/);
  assert.match(operations, /data-wapi-mobile-back-navigation/);
  assert.match(operations, /function jumpToWapiWorkspacePane/);
  assert.match(operations, /data-wapi-sticky-action-area/);
  assert.match(operations, /data-whatsapp-no-send-actions/);
  assert.match(operations, /Linked parent\/student\/provider\/contact/);
  assert.match(operations, /No WhatsApp message, broadcast, or external CRM write/);
  assert.match(server, /confirm !== 'SEND_WHATSAPP'/);
});

test('One Time email lane exposes draft, readiness, recipient, and approval gates', () => {
  assert.match(operations, /data-communications-channel-rail/);
  assert.match(operations, /sidebarMode === 'modules' \|\| currentView === 'communications'/);
  assert.doesNotMatch(operations, /currentView === 'communications'\) return '<button class="primary-button" onclick="createCommunicationNotePrompt\(\)">New Message<\/button>'/);
  assert.match(operations, /data-email-operator-workspace/);
  assert.match(operations, /data-email-readiness-gates/);
  assert.match(operations, /data-email-draft-editor/);
  assert.match(operations, /id="commEmailFrom"/);
  assert.match(operations, /id="commEmailReplyTo"/);
  assert.match(operations, /id="commEmailTemplate"/);
  assert.match(operations, /id="commEmailRelatedRecord"/);
  assert.match(operations, /data-email-send-gates/);
  assert.match(operations, /function emailDraftCanRequestSend/);
  assert.match(operations, /Send locked/);
  assert.match(operations, /SEND_RESEND_EMAIL/);
  assert.match(operations, /workspaceDataProjectFilters\(\)/);
  assert.match(operations, /reply_to: replyTo/);
  assert.match(operations, /template_key: templateKey/);
  assert.match(operations, /related_record: relatedRecord/);
});

test('Resend draft and send endpoints preserve reply-to while keeping external send approval-gated', () => {
  assert.match(server, /const replyTo = normalizeEmail\(body\.reply_to \|\| body\.replyTo \|\| body\.metadata\?\.reply_to/);
  assert.match(server, /reply_to: row\.reply_to \|\| metadata\.reply_to \|\| null/);
  assert.match(server, /\.\.\.\(\(runtimeConfig\.replyTo \|\| identity\.replyTo\) \? \{ reply_to: runtimeConfig\.replyTo \|\| identity\.replyTo \} : \{\}\)/);
  assert.match(server, /resendConfirm = body\.confirm \|\| body\.confirmation_phrase/);
  assert.match(resendClient, /async function sendResendEmail\(\{ from, to, cc = \[\], bcc = \[\], replyTo = null/);
  assert.match(resendClient, /\.\.\.\(\(replyTo \|\| config\.replyTo\) \? \{ reply_to: replyTo \|\| config\.replyTo \} : \{\}\)/);
  assert.match(externalActions, /'resend:send': 'SEND_RESEND_EMAIL'/);
});
