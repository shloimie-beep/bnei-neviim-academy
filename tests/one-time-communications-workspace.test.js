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
  assert.match(operations, /data-whatsapp-send-readiness/);
  assert.match(operations, /data-whatsapp-send-confirmation-gate/);
  assert.match(operations, /Linked parent\/student\/provider\/contact/);
  assert.match(operations, /Raw provider payloads are hidden by default/);
  assert.match(operations, /wapiGroupRelatedDecisions/);
  assert.match(operations, /wapiGroupInternalNotes/);
  assert.match(operations, /communicationAttachmentSummary/);
  assert.match(operations, /\.sort\(\(a, b\) => Date\.parse\(a\.at \|\| 0\) - Date\.parse\(b\.at \|\| 0\)\)/);
  assert.match(operations, /wapiMobilePane = 'conversation'/);
  assert.match(operations, /wapiPaneClass/);
  assert.match(operations, /getWapiPhonebookReport\(100, \{ workspace: currentWorkspaceKey\(\) \}\)/);
  assert.match(operations, /SEND_WHATSAPP/);
  assert.match(operations, /No WhatsApp message, broadcast, or external CRM write/);
  assert.match(server, /confirm !== 'SEND_WHATSAPP'/);
  assert.match(server, /app\.get\('\/api\/bna\/whatsapp\/messages'/);
  assert.match(server, /buildWapiPhonebookReport\(\{[\s\S]{0,120}projectKey,[\s\S]{0,80}workspaceId/);
  assert.match(server, /raw_payload_hidden: !includeRaw/);
  assert.match(server, /Raw WhatsApp provider payload readback requires an unscoped Operations admin login/);
  assert.doesNotMatch(server, /SELECT m\.\*,[\s\S]{0,300}FROM bna_whatsapp_messages m/);
});

test('One Time email lane exposes draft, readiness, recipient, and approval gates', () => {
  assert.match(operations, /data-email-operator-workspace/);
  assert.match(operations, /data-email-readiness-gates/);
  assert.match(operations, /Provider account/);
  assert.match(operations, /Sender identity/);
  assert.match(operations, /data-email-draft-editor/);
  assert.match(operations, /id="commEmailFrom"/);
  assert.match(operations, /id="commEmailReplyTo"/);
  assert.match(operations, /id="commEmailTemplate"/);
  assert.match(operations, /id="commEmailRelatedRecord"/);
  assert.match(operations, /id="commEmailHtml"/);
  assert.match(operations, /name="html"/);
  assert.match(operations, /formValue\('html', 'commEmailHtml'\)/);
  assert.match(operations, /querySelector\?\.\(`\[name="\$\{name\}"\]`\)/);
  assert.match(operations, /data-email-send-gates/);
  assert.match(operations, /function emailDraftCanRequestSend/);
  assert.match(operations, /Send locked/);
  assert.match(operations, /Type SEND_RESEND_EMAIL/);
  assert.match(operations, /SEND_RESEND_EMAIL/);
  assert.match(operations, /data-resend-webhook-events/);
  assert.match(operations, /Raw provider payloads are hidden by default/);
  assert.match(operations, /workspaceDataProjectFilters\(\)/);
  assert.match(operations, /reply_to: replyTo/);
  assert.match(operations, /template_key: templateKey/);
  assert.match(operations, /related_record: relatedRecord/);
});

test('One Time CRM Contacts UX keeps lead review scoped and no-send', () => {
  assert.match(operations, /data-one-time-crm-contacts-ux/);
  assert.match(operations, /Workspace-scoped One Time\/Rabbi leads and members only/);
  assert.match(operations, /function oneTimeCrmLeadRows\(\)/);
  assert.match(operations, /normalizeProjectKey\(rawProjectKey\)/);
  assert.match(operations, /currentWorkspaceIsOneTime\(\)/);
  assert.match(operations, /one-time-no-send-until-approved/);
  assert.match(operations, /one-time-campaign-staging/);
  assert.match(operations, /No email, WhatsApp, payment, or external CRM write/);
  assert.match(operations, /Dedupe \/ review/);
  assert.match(operations, /data-one-time-crm-contact-row/);
  assert.match(server, /app\.get\('\/api\/bna\/parent-leads'/);
  assert.match(server, /appendRequestedProjectScopeCondition\(req, conditions, params, 'l\.project_id'\)/);
});

test('Resend draft and send endpoints preserve reply-to while keeping external send approval-gated', () => {
  assert.match(server, /const replyTo = normalizeEmail\(body\.reply_to \|\| body\.replyTo \|\| body\.metadata\?\.reply_to/);
  assert.match(server, /reply_to: row\.reply_to \|\| metadata\.reply_to \|\| null/);
  assert.match(server, /\.\.\.\(replyTo \? \{ reply_to: replyTo \} : \{\}\)/);
  assert.match(server, /resendConfirm = body\.confirm \|\| body\.confirmation_phrase/);
  assert.match(server, /findCrossWorkspaceEmailRecipientConflicts/);
  assert.match(server, /Recipient belongs to a different workspace\/project/);
  assert.match(server, /processResendWebhook/);
  assert.match(resendClient, /async function sendResendEmail\(\{ from, to, cc = \[\], bcc = \[\], replyTo = null/);
  assert.match(resendClient, /\.\.\.\(replyTo \? \{ reply_to: replyTo \} : \{\}\)/);
  assert.match(resendClient, /function verifyResendWebhookRequest/);
  assert.match(externalActions, /'resend:send': 'SEND_RESEND_EMAIL'/);
});
