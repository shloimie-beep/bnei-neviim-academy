const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const registry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

function action(id) {
  return registry.actions.find((entry) => entry.action_id === id);
}

test('support ticket schema and sanitizer allow Rabbi approval lifecycle statuses', () => {
  for (const status of [
    'awaiting_super_admin_approval',
    'needs_requester_information',
    'approved_for_codex',
    'kept_as_ticket',
    'rejected',
  ]) {
    assert.match(server, new RegExp(status));
  }
  assert.match(server, /bna_support_tickets_status_check/);
  assert.match(server, /function safeSupportTicketStatus/);
});

test('Rabbi Telegram ticket creation is approval-gated and creates no initial Codex job', () => {
  assert.match(bridge, /status:\s*'awaiting_super_admin_approval'/);
  assert.match(bridge, /assigned_to:\s*'Shloimie'/);
  assert.match(bridge, /suppress_task_creation:\s*true/);
  assert.match(bridge, /requires_super_admin_approval:\s*true/);
  assert.match(bridge, /approval_gate:\s*'super_admin_required_before_codex'/);
  assert.match(bridge, /codex_job_created_initially:\s*false/);
  assert.match(bridge, /tasksCreated:\s*0/);

  assert.match(server, /function isRabbiTelegramApprovalTicketContext/);
  assert.match(server, /function supportTicketBlocksAutomaticTask/);
  assert.match(server, /supportTicketBlocksAutomaticTask\(ticket,\s*body\)[\s\S]*\?\s*null[\s\S]*maybeCreateTaskForSupportTicket/);
  assert.match(server, /notifySuperAdminSupportTicket\(\{/);
});

test('Rabbi Telegram ticket creation mirrors into canonical inbound communications without sends or tasks', () => {
  assert.match(server, /async function mirrorRabbiTelegramSupportTicketToInboundCommunication/);
  assert.match(server, /mirrorRabbiTelegramSupportTicketToInboundCommunication\(\{[\s\S]*ticket,[\s\S]*project,[\s\S]*body,[\s\S]*sourceContext:\s*storedSourceContext,[\s\S]*db:\s*client/);
  assert.match(server, /crmInboundIngest\.ingestInboundCommunication\(\{[\s\S]*communicationType:\s*'rabbi_telegram_support_ticket'/);
  assert.match(server, /channel:\s*'telegram'/);
  assert.match(server, /provider:\s*'telegram'/);
  assert.match(server, /source_table:\s*'bna_support_tickets'/);
  assert.match(server, /approval_gate:\s*'super_admin_required_before_codex'/);
  assert.match(server, /createContactOnInbound:\s*false/);
  assert.match(server, /createTaskOnInbound:\s*false/);
  assert.match(server, /ticket_id = \$2/);
  assert.match(server, /canonical_inbound_communication/);
  assert.match(server, /external_write_performed:\s*false/);
});

test('Super Admin ticket approval endpoint is platform-only and idempotent', () => {
  assert.match(server, /app\.post\('\/api\/bna\/support-tickets\/:id\/approval-action'/);
  assert.match(server, /requirePlatformSuperAdminForAction\(req,\s*res\)/);
  assert.match(server, /Only platform_super_admin can perform this approval action/);
  assert.match(server, /idempotency_key/);
  assert.match(server, /duplicate_submission:\s*true/);
  assert.match(server, /createTaskFromText\(\{/);
  assert.match(server, /agent_executable:\s*true/);
  assert.match(server, /ensureAgentJobForTask/);
  assert.match(server, /status = 'approved_for_codex'/);
  assert.match(server, /notifyRabbiSupportTicketStatus/);
});

test('Super Admin Telegram callback buttons call the shared approval endpoint', () => {
  assert.match(bridge, /ticketActionMatch/);
  assert.match(bridge, /\^ticket:\(approve\|ask\|keep\|reject\):/);
  assert.match(bridge, /\/api\/bna\/support-tickets\/\$\{ticketId\}\/approval-action/);
  assert.match(bridge, /action:\s*'approve_for_codex'/);
  assert.match(bridge, /action:\s*'ask_rabbi'/);
  assert.match(bridge, /action:\s*'keep_as_ticket'/);
  assert.match(bridge, /action:\s*'reject'/);
  assert.match(bridge, /telegram-callback-\$\{data\}/);
});

test('action registry covers Rabbi ticket create and Super Admin approval actions', () => {
  for (const id of [
    'ACTION-ONETIME-RABBI-TELEGRAM-TICKET-CREATE',
    'ACTION-ONETIME-RABBI-TICKET-APPROVE-CODEX',
    'ACTION-ONETIME-RABBI-TICKET-ASK-RABBI',
    'ACTION-ONETIME-RABBI-TICKET-KEEP',
    'ACTION-ONETIME-RABBI-TICKET-REJECT',
  ]) {
    assert.ok(action(id), `${id} should be registered`);
  }
  assert.equal(action('ACTION-ONETIME-RABBI-TICKET-APPROVE-CODEX').permission, 'platform_super_admin');
  assert.match(action('ACTION-ONETIME-RABBI-TELEGRAM-TICKET-CREATE').expected_behavior, /creates no Codex task or agent job/);
});
