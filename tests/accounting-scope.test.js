const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('accounting read APIs accept the Operations workspace project filter', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/payments', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /const \{ signup_id, project \} = req\.query;/);
  assert.match(server, /FROM bna_payment_log pay/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = COALESCE\(pay\.workspace_id, s\.workspace_id\)/);
  assert.match(server, /addAccountingProjectCondition\(conditions, params, projectKey, 'proj', 'w'\);/);
  assert.match(server, /res\.json\(\{ payments: result\.rows, project: projectKey \|\| 'all' \}\);/);

  assert.match(server, /app\.get\('\/api\/bna\/payment-intake', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /FROM bna_payment_intake i/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = COALESCE\(i\.workspace_id, s\.workspace_id\)/);
  assert.match(server, /res\.json\(\{ intake: result\.rows, project: projectKey \|\| 'all' \}\);/);

  assert.match(server, /app\.get\('\/api\/bna\/payment-reminders\/due', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /getPaymentReminderCandidates\(\{ daysBefore, projectKey \}\)/);
  assert.match(server, /project,\s+found: candidates\.length/);
  assert.match(server, /runPaymentReminderSweep\(\{ projectKey: DEFAULT_PROJECT_KEY \}\)/);

  assert.match(server, /app\.get\('\/api\/bna\/green-invoice\/webhooks', requireAdmin, async \(req, res\) => \{/);
  assert.match(server, /LEFT JOIN bna_workspaces w ON w\.id = COALESCE\(l\.workspace_id, s\.workspace_id, st\.workspace_id\)/);
  assert.match(server, /res\.json\(\{ events: result\.rows, project: projectKey \|\| 'all' \}\);/);
});

test('accounting mutations require explicit confirmations and scoped record access', () => {
  const server = read('server.js');

  assert.match(server, /Completed payment logs require confirm: LOG_PAYMENT/);
  assert.match(server, /await assertSignupAccountingAccess\(req, signup_id, projectKey\)/);
  assert.match(server, /WHERE id = \$3\s+AND workspace_id IS NOT DISTINCT FROM \$5/);

  assert.match(server, /Paid-intake reconciliation requires confirm: RECONCILE_PAID_INTAKE/);
  assert.match(server, /await assertPaymentIntakeAccountingAccess\(req, intakeId, projectKey, client\)/);
  assert.match(server, /No active student found for \$\{studentName\} in the selected accounting workspace/);

  assert.match(server, /Payment intake capture requires confirm: CAPTURE_PAYMENT_INTAKE/);
  assert.match(server, /await resolveAccountingProjectForWrite\(req, req\.body \|\| \{\}\)/);
  assert.match(server, /Legacy GHL sync is disabled for BNA payment intake/);
  assert.match(server, /workspace_id: signup\?\.workspace_id \|\| project\.workspace_id/);

  assert.match(server, /Payment intake updates require confirm: UPDATE_PAYMENT_INTAKE/);
  assert.match(server, /await assertPaymentIntakeAccountingAccess\(req, id, projectKey\)/);
  assert.match(server, /Payment intake deletes require confirm: DELETE_PAYMENT_INTAKE/);

  assert.match(server, /Green Invoice reprocess requires confirm: REPROCESS_GREEN_INVOICE/);
  assert.match(server, /Green Invoice webhook log not found in the selected workspace/);
});

test('Green Invoice matching is constrained to the BNA school workspace', () => {
  const server = read('server.js');

  assert.match(server, /async function findMatchingSignupForGreenInvoice\(normalized, db = pool\) \{/);
  assert.match(server, /const defaultWorkspace = await getDefaultSchoolWorkspace\(db\);/);
  assert.match(server, /AND workspace_id IS NOT DISTINCT FROM \$4/);
  assert.match(server, /WHERE green_invoice_id = \$1\s+AND workspace_id IS NOT DISTINCT FROM \$2/);
  assert.match(server, /workspace_id = COALESCE\(workspace_id, \$9\)/);
  assert.match(server, /workspace_id: webhookLog\.workspace_id \|\| null/);
});

test('Operations accounting UI sends workspace filters and confirmation tokens', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /api\.getPayments\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /api\.getPaymentIntake\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /api\.getPaymentReminderDue\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /api\.getGreenInvoiceWebhooks\(\{ limit: 50, project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /paymentReminderPreview = null;/);
  assert.match(operations, /greenInvoiceWebhooks = \[\];/);

  assert.match(operations, /confirm: 'LOG_PAYMENT'/);
  assert.match(operations, /confirm: 'CAPTURE_PAYMENT_INTAKE'/);
  assert.match(operations, /confirm: 'UPDATE_PAYMENT_INTAKE'/);
  assert.match(operations, /Type REPROCESS_GREEN_INVOICE to reprocess this webhook/);
  assert.match(operations, /confirm: 'REPROCESS_GREEN_INVOICE'/);
  assert.match(operations, /project: selectedProjectFilter\(\) \|\| undefined/);
});
