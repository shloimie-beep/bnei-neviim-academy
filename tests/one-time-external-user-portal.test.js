const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const serverJs = fs.readFileSync('server.js', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const driveScript = fs.readFileSync('scripts/setup-one-time-partnership-drive.mjs', 'utf8');
const telegramBridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');

test('One Time login is promoted to a scoped external admin workspace', () => {
  assert.match(serverJs, /const platformAllowedViews = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'students', 'contacts', 'intake', 'community', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'accounting', 'automations', 'api_usage', 'admin', 'integrations', 'settings'\]/);
  assert.match(serverJs, /const providerAllowedViews = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'intake', 'community', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'automations', 'api_usage', 'integrations', 'settings'\]/);
  assert.match(serverJs, /role: 'project_owner'/);
  assert.match(serverJs, /role: 'project_manager'/);
  assert.match(serverJs, /allowedViews: ownerAllowedViews/);
  assert.match(serverJs, /allowedViews: managerAllowedViews/);
  assert.match(serverJs, /const ONE_TIME_OPS_USERNAME/);
  assert.match(serverJs, /old ONE_TIME_OPS_USERNAME maps to manager role/);
  assert.match(serverJs, /role: 'external account admin'/);
  assert.match(serverJs, /account_type: 'external_user'/);
  assert.match(serverJs, /access_level: 'manager'/);
});

test('One Time admin can receive a short-lived one-click Operations access link', () => {
  assert.match(serverJs, /CREATE TABLE IF NOT EXISTS bna_ops_access_links/);
  assert.match(serverJs, /token_hash TEXT NOT NULL UNIQUE/);
  assert.doesNotMatch(serverJs, /ops_access_links[\s\S]{0,180}token TEXT/);
  assert.match(serverJs, /OPS_ACCESS_LINK_TTL_MS = 1000 \* 60 \* 20/);
  assert.match(serverJs, /function oneTimeOperationsReturnPath/);
  assert.match(serverJs, /workspace', 'rabbi_sheller_provider'/);
  assert.match(serverJs, /view', 'tasks'/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/ops-access-links'/);
  assert.match(serverJs, /Only the platform admin can create Operations access links/);
  assert.match(serverJs, /app\.get\('\/operations-access'/);
  assert.match(serverJs, /redeemOpsAccessLink/);
  assert.match(serverJs, /used_at = NOW\(\)/);
  assert.match(serverJs, /setSessionCookie\(res, redeemed\.sessionId\)/);
});

test('One Time external admin appears in super-admin user management without parent-account mixing', () => {
  assert.match(serverJs, /account_type: 'external_user'/);
  assert.match(serverJs, /role: 'external account admin'/);
  assert.match(serverJs, /ONE_TIME_OWNER_USERNAME/);
  assert.match(serverJs, /ONE_TIME_MANAGER_USERNAME/);
  assert.match(serverJs, /login_username: ONE_TIME_OPS_USERNAME \|\| null/);
  assert.match(operationsHtml, /data-super-admin-user-management/);
  assert.match(operationsHtml, /adminExternalUserRows/);
  assert.match(operationsHtml, /one_time_mishnah_class/);
  assert.match(operationsHtml, /External provider\/Rabbi users are project members or Operations identities, not parent portal accounts/);
  assert.match(operationsHtml, /This panel manages BNA Operations access only\. It does not create Rabbi-owned app\/admin\/member credentials/);
  assert.doesNotMatch(operationsHtml, /parent portal account for Rabbi/i);
});

test('One Time scoped routes include team tickets and project-owned record APIs without roadmap access', () => {
  assert.doesNotMatch(serverJs, /routePath === '\/api\/bna\/one-time\/roadmap'/);
  assert.match(serverJs, /routePath === '\/api\/bna\/support-tickets'/);
  assert.match(serverJs, /routePath === '\/api\/bna\/students'/);
  assert.match(serverJs, /routePath === '\/api\/bna\/parent-leads'/);
  assert.match(serverJs, /routePath === '\/api\/bna\/content-jobs'/);
  assert.match(serverJs, /routePath === '\/api\/bna\/payments'/);
  assert.match(serverJs, /function projectIdScopeCondition/);
  assert.match(serverJs, /async function assertProjectOwnedRowAccess/);
});

test('support tickets are persisted separately from project tasks with comments and task handoff', () => {
  assert.match(serverJs, /CREATE TABLE IF NOT EXISTS bna_support_tickets/);
  assert.match(serverJs, /CREATE TABLE IF NOT EXISTS bna_support_ticket_comments/);
  assert.match(serverJs, /app\.get\('\/api\/bna\/support-tickets'/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/support-tickets'/);
  assert.match(serverJs, /app\.patch\('\/api\/bna\/support-tickets\/:id'/);
  assert.match(serverJs, /maybeCreateTaskForSupportTicket/);
  assert.match(serverJs, /Support ticket #\$\{ticket\.id\}/);
});

test('One Time proposal workflow tasks are seeded idempotently with schedule fields', () => {
  assert.match(serverJs, /ONE_TIME_PROPOSAL_SEED = 'one-time-full-workflow-2026-06-10'/);
  assert.match(serverJs, /ONE_TIME_WORKFLOW_MAP = \[/);
  assert.match(serverJs, /code: 'T'[\s\S]*name: 'Internal app operating workflow'/);
  assert.match(serverJs, /function oneTimeProposalSeedTasks/);
  assert.match(serverJs, /async function ensureOneTimeProposalTasks/);
  assert.match(serverJs, /existing\.ai_parsed->>'proposal_seed'/);
  assert.match(serverJs, /proposal_schedule_source: 'tasks_schedule'/);
  assert.match(serverJs, /due_date, planned_at/);
  assert.match(serverJs, /app\.get\('\/api\/bna\/one-time\/roadmap'/);
});

test('Workflow A lead capture card documents legacy CRM fields, approval gate, and smoke tests', () => {
  assert.match(serverJs, /code: 'A'[\s\S]*name: 'Lead capture'[\s\S]*required_fields: \[/);
  assert.match(serverJs, /membership_intent_options: \[[\s\S]*'Video Library'[\s\S]*'Live Membership'/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-lead'[\s\S]*'one-time-intent:live'/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM contact, custom-field, tag, form, pipeline, or workflow writes until Shloimie approves/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Post-approval live smoke creates or updates one approved test lead in legacy CRM/);
  assert.match(operationsHtml, /function renderTaskWorkflowPanel/);
  assert.match(operationsHtml, /workflow\.required_fields/);
  assert.match(operationsHtml, /Membership Intent/);
  assert.match(operationsHtml, /Workflow \$\{escapeHtml\(workflow\.code/);
  assert.match(driveScript, /requiredFields: \[[\s\S]*parent or buyer name[\s\S]*membership intent/);
  assert.match(driveScript, /Approval gate: \$\{workflow\.approvalGate\}/);
});

test('Workflow B reactivation card documents list segmentation before any sends', () => {
  assert.match(serverJs, /code: 'B'[\s\S]*name: 'Email list and past customer reactivation'[\s\S]*assignee: 'Codex'[\s\S]*owner: 'Shloimie'/);
  assert.match(serverJs, /implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required reactivation fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*interested email list, prior \$9 customer, prior \$30 customer[\s\S]*current email status: approved, unsubscribed, bounced, do-not-contact/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-list:interested'[\s\S]*'one-time-prior-price:9'[\s\S]*'one-time-prior-price:30'[\s\S]*'one-time-do-not-email'/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Do not merge warm interested-list leads[\s\S]*Workflow A lead capture[\s\S]*Workflow N support tickets/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'source_list_id'[\s\S]*'prior_purchase_amount'[\s\S]*'suppression_reason'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Live read-only legacy CRM audit on 2026-06-11[\s\S]*Past Customer Review Blast[\s\S]*email campaigns returned HTTP 401/);
  assert.match(serverJs, /approval_gate: 'No list import, contact update, tag\/custom-field\/workflow, email template\/campaign, SMS\/WhatsApp/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Dry-run segmentation maps sample interested, prior \$9, prior \$30[\s\S]*Post-approval live smoke sends only to approved internal\/test recipients/);
  assert.match(serverJs, /task\.key === 'workflow-b' \|\| \['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(operationsHtml, /Smoke Tests/);
  assert.match(driveScript, /code: 'B'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required reactivation fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-list:interested'[\s\S]*'one-time-prior-price:30'/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Do not merge warm interested-list leads[\s\S]*Workflow A lead capture/);
  assert.match(driveScript, /approvalGate: 'No list import, contact update, tag\/custom-field\/workflow, email template\/campaign/);
});

test('Workflow C landing page routing card documents US and UK market routing before writes', () => {
  assert.match(serverJs, /code: 'C'[\s\S]*name: 'Landing page routing US\/UK'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required routing fields'/);
  assert.match(serverJs, /market_versions: \[[\s\S]*US landing page\/version[\s\S]*UK landing page\/version[\s\S]*Default\/unknown version/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*market=us[\s\S]*market=uk[\s\S]*Do not enable automatic redirects/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'utm_source'[\s\S]*'checkout_destination'/);
  assert.match(serverJs, /approval_gate: 'No public routing, redirect, legacy CRM funnel, domain\/DNS, form, tracking-script, or payment-link change until Shloimie approves/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Dry-run URL matrix verifies sample US, UK, unknown, email, ad, and referral links/);
  assert.match(operationsHtml, /workflow\.required_fields_label \|\| 'Required Lead Fields'/);
  assert.match(operationsHtml, /Market Versions/);
  assert.match(operationsHtml, /Routing Rules/);
  assert.match(operationsHtml, /Tracking Fields/);
  assert.match(driveScript, /code: 'C'[\s\S]*requiredFieldsLabel: 'Required routing fields'/);
  assert.match(driveScript, /marketVersions: \[[\s\S]*US landing page\/version[\s\S]*UK landing page\/version/);
  assert.match(driveScript, /routingRules: \[[\s\S]*market=us[\s\S]*market=uk/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow D abandoned checkout card documents recovery fields before any legacy CRM writes', () => {
  assert.match(serverJs, /code: 'D'[\s\S]*name: 'Abandoned checkout'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required checkout recovery fields'/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-checkout-started'[\s\S]*'one-time-payment-completed'/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*checkout-start event[\s\S]*Payment success[\s\S]*Workflow F/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'checkout_session_id'[\s\S]*'recovery_revenue_amount'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Live read-only audit on 2026-06-10[\s\S]*legacy CRM custom fields/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, payment-link\/funnel, webhook, email\/SMS\/WhatsApp, or reporting write until Shloimie approves/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Dry-run payload maps one sample checkout-started event[\s\S]*payment-success event/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(driveScript, /code: 'D'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required checkout recovery fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-checkout-abandoned'/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, payment-link\/funnel, webhook, email\/SMS\/WhatsApp/);
});

test('Workflow E payment success card documents access grant and buyer notification before writes', () => {
  assert.match(serverJs, /code: 'E'[\s\S]*name: 'Payment success'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required payment success fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*trusted payment event id[\s\S]*buyer contact id[\s\S]*access destination\/provider/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-payment-completed'[\s\S]*'one-time-access-granted'[\s\S]*'one-time-welcome-sent'/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*trusted payment webhook[\s\S]*Payment success suppresses Workflow D[\s\S]*Failed recurring payment belongs to Workflow F/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'payment_event_id'[\s\S]*'access_status'[\s\S]*'welcome_message_id'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*general legacy CRM paid\/setup tags[\s\S]*Generic legacy CRM payment order\/transaction\/subscription list attempts returned HTTP 422/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription, webhook, membership\/community access, email\/SMS\/WhatsApp, receipt, or reporting write until Shloimie approves/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Dry-run payload maps one sample payment-success event[\s\S]*Idempotency dry-run replays the same payment event[\s\S]*Post-approval live smoke uses one approved test purchase/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(driveScript, /code: 'E'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required payment success fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-payment-completed'[\s\S]*'one-time-access-granted'/);
  assert.match(driveScript, /routingRules: \[[\s\S]*trusted payment webhook[\s\S]*Payment success suppresses Workflow D/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription, webhook, membership\/community access/);
});

test('Workflow F failed payment card documents recurring recovery before billing writes', () => {
  assert.match(serverJs, /code: 'F'[\s\S]*name: 'Failed payment'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required failed payment fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*trusted failed-payment event id[\s\S]*subscription id[\s\S]*grace window start\/end/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-payment-failed'[\s\S]*'one-time-payment-recovered'[\s\S]*'one-time-do-not-dunning'/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*trusted subscription\/invoice payment event[\s\S]*checkout-started or abandoned session[\s\S]*Cancellation and refund-driven access removal belong to Workflow G/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'payment_event_id'[\s\S]*'failed_attempt_count'[\s\S]*'owner_alert_status'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Live read-only legacy CRM audit on 2026-06-10[\s\S]*paid-recurring[\s\S]*Green Invoice webhook deliveries/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription, webhook, membership\/community access, email\/SMS\/WhatsApp, owner alert/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Dry-run payload maps one sample failed recurring payment event[\s\S]*Idempotency dry-run replays the same failed attempt[\s\S]*Post-approval live smoke uses one approved sandbox\/test subscription/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(driveScript, /code: 'F'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required failed payment fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-payment-failed'[\s\S]*'one-time-payment-recovered'/);
  assert.match(driveScript, /routingRules: \[[\s\S]*trusted subscription\/invoice payment event[\s\S]*Workflow D and successful first payment stays in Workflow E/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription, webhook, membership\/community access, email\/SMS\/WhatsApp, owner alert/);
});

test('Workflow G cancellation card documents request, refund, access, approval gate, and smoke tests', () => {
  assert.match(serverJs, /code: 'G'[\s\S]*name: 'Cancellation'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required cancellation fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*verified cancellation request id[\s\S]*refund\/credit status[\s\S]*access destination\/provider/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-cancellation-requested'[\s\S]*'one-time-refund-approved'[\s\S]*'one-time-access-removed'/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*verified customer request[\s\S]*route to Workflow H[\s\S]*Failed recurring payment without a customer cancellation request stays in Workflow F/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'cancellation_request_id'[\s\S]*'refund_status'[\s\S]*'churn_reporting_month'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*previously only a placeholder[\s\S]*payment_log status includes refunded[\s\S]*refund\/cancellation policy/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription cancellation or refund/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow G[\s\S]*Dry-run payload maps one cancel-at-period-end[\s\S]*Idempotency dry-run replays/);
  assert.match(serverJs, /\|\| task\.key === 'workflow-g'/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(operationsHtml, /Smoke Tests/);
  assert.match(driveScript, /code: 'G'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required cancellation fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-cancellation-requested'[\s\S]*'one-time-access-removed'/);
  assert.match(driveScript, /routingRules: \[[\s\S]*verified customer request[\s\S]*route to Workflow H[\s\S]*stays in Workflow F/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription cancellation or refund/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow H upgrade/downgrade card documents tier changes before access or billing writes', () => {
  assert.match(serverJs, /code: 'H'[\s\S]*name: 'Upgrade\/downgrade'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required tier-change fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*trusted tier-change event id[\s\S]*current tier before change[\s\S]*requested target tier/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-upgrade-requested'[\s\S]*'one-time-downgrade-requested'[\s\S]*'one-time-access-updated'/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*trusted subscription\/payment provider event[\s\S]*Library-to-Live upgrades[\s\S]*Live-to-Library downgrades/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'tier_change_event_id'[\s\S]*'current_tier'[\s\S]*'live_access_status'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*no exact One Time, Mishnah, Scheller, Video Library, Live Membership, upgrade, downgrade[\s\S]*Quality Tier[\s\S]*no One Time membership, subscription, tier-change/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription, webhook, membership\/community\/live-class access, email\/SMS\/WhatsApp, owner alert/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Dry-run payload maps one Library-to-Live upgrade[\s\S]*Idempotency dry-run replays the same tier-change event[\s\S]*Post-approval live smoke uses one approved sandbox\/test subscription/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(driveScript, /code: 'H'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required tier-change fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-upgrade-requested'[\s\S]*'one-time-downgrade-requested'/);
  assert.match(driveScript, /routingRules: \[[\s\S]*trusted subscription\/payment provider event[\s\S]*Library-to-Live upgrades[\s\S]*Live-to-Library downgrades/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, payment-product\/order\/subscription, webhook, membership\/community\/live-class access/);
});

test('Workflow I class reminder card documents five-class Live reminders before any sends', () => {
  assert.match(serverJs, /code: 'I'[\s\S]*name: 'Class reminders'[\s\S]*assignee: 'Codex'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required class reminder fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*class\/session id or calendar event id[\s\S]*five-class weekly schedule version[\s\S]*same-day class status/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-live-reminders-enabled'[\s\S]*'one-time-live-reminder-24h'[\s\S]*'one-time-do-not-remind'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Calendar or task schedule[\s\S]*Membership\/access workflows[\s\S]*legacy CRM calendar\/workflows may become a send channel/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*confirmed Live Membership recipients[\s\S]*Library-only members do not receive live-class reminders[\s\S]*Workflow J for recordings/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'class_session_id'[\s\S]*'reminder_window'[\s\S]*'suppression_reason'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*previously only a placeholder[\s\S]*Live read-only legacy CRM probe on 2026-06-11[\s\S]*no dedicated One Time live-class reminder send\/log table/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow\/calendar write, Google Calendar\/Zoom\/access-system change/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow I[\s\S]*Dry-run weekly matrix maps five sample classes[\s\S]*Eligibility smoke verifies Library-only/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(operationsHtml, /Smoke Tests/);
  assert.match(driveScript, /code: 'I'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required class reminder fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-live-reminders-enabled'[\s\S]*'one-time-live-reminder-30m'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Calendar or task schedule[\s\S]*Membership\/access workflows/);
  assert.match(driveScript, /routingRules: \[[\s\S]*confirmed Live Membership recipients[\s\S]*Library-only members do not receive live-class reminders/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow\/calendar write, Google Calendar\/Zoom\/access-system change/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow J recording posted card documents guarded member-library posting before sends', () => {
  assert.match(serverJs, /code: 'J'[\s\S]*name: 'Recording posted'[\s\S]*assignee: 'Rabbi Elie Scheller'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required recording posting fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*class\/session id or calendar event id from Workflow I[\s\S]*source recording asset id[\s\S]*archive\/source retention location/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-recording-received'[\s\S]*'one-time-recording-posted'[\s\S]*'one-time-manual-recording-review'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Workflow I post-class handoff[\s\S]*Operations Content jobs and bna_class_sessions[\s\S]*member-library posting needs a separate approved destination/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Do not post raw recordings automatically[\s\S]*Video Library and Live Membership members[\s\S]*Workflow J is the member recording library path/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'recording_asset_id'[\s\S]*'privacy_review_status'[\s\S]*'notification_status'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow J was previously only a placeholder[\s\S]*project-scoped bna_content_jobs[\s\S]*no dedicated One Time recording post/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, Buffer\/social post, blog\/public website post, Vimeo\/Replit\/Rabbi-app\/video-library write/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow J[\s\S]*Dry-run recording payload maps one completed class[\s\S]*Privacy smoke verifies raw\/private recordings/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(operationsHtml, /Smoke Tests/);
  assert.match(driveScript, /code: 'J'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required recording posting fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-recording-received'[\s\S]*'one-time-recording-posted'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Workflow I post-class handoff[\s\S]*Operations Content jobs and bna_class_sessions/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Do not post raw recordings automatically[\s\S]*Video Library and Live Membership members/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, Buffer\/social post, blog\/public website post, Vimeo\/Replit\/Rabbi-app\/video-library write/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow K worksheet/source sheet card documents guarded material posting before writes', () => {
  assert.match(serverJs, /code: 'K'[\s\S]*name: 'Worksheet\/source sheet posted'[\s\S]*assignee: 'Codex'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required worksheet\/source-sheet posting fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*class\/session id or calendar event id from Workflow I[\s\S]*related recording id or member-library lesson id from Workflow J[\s\S]*archive\/source retention location/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-material-source-check'[\s\S]*'one-time-worksheet-posted'[\s\S]*'one-time-source-sheet-posted'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Workflow I post-class handoff[\s\S]*Workflow J recording handoff[\s\S]*bna_assignments and Google Classroom sync/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Do not post AI-generated worksheets[\s\S]*Source sheets must preserve citations[\s\S]*Link Workflow K artifacts to Workflow J recordings/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'worksheet_or_source_sheet_id'[\s\S]*'source_check_status'[\s\S]*'notification_status'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow K was previously only a placeholder[\s\S]*project-scoped bna_content_jobs, bna_class_sessions, and bna_assignments[\s\S]*no dedicated One Time worksheet\/source-sheet post/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow, Google Classroom\/coursework, Google Calendar, Drive permission\/document, Sefaria sheet/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow K[\s\S]*Dry-run material payload maps one completed class[\s\S]*Source-quality smoke verifies missing citations/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(operationsHtml, /Smoke Tests/);
  assert.match(driveScript, /code: 'K'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required worksheet\/source-sheet posting fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-material-source-check'[\s\S]*'one-time-source-sheet-posted'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Workflow I post-class handoff[\s\S]*Workflow J recording handoff/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Do not post AI-generated worksheets[\s\S]*Source sheets must preserve citations/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow, Google Classroom\/coursework, Google Calendar, Drive permission\/document, Sefaria sheet/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow L question submission card documents private intake without a public forum', () => {
  assert.match(serverJs, /code: 'L'[\s\S]*name: 'Question submission'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required question intake fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*member\/contact id or verified email\/phone[\s\S]*question text[\s\S]*response status: received, triaged, assigned/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Private member form or portal submission once approved[\s\S]*no public forum[\s\S]*Optional legacy CRM form\/webhook only after Workflow A\/C/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Every submission stays private by default[\s\S]*Duplicate questions should be grouped[\s\S]*Billing, login, broken link, or access questions route to Workflow N/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'question_submission_id'[\s\S]*'digest_batch_id'[\s\S]*'follow_up_task_id'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow L as a placeholder[\s\S]*No dedicated One Time question submission table[\s\S]*Confirm identity source/);
  assert.match(serverJs, /approval_gate: 'No public forum, member-visible question feed, legacy CRM form\/tag\/workflow, notification/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow L[\s\S]*Privacy smoke verifies sample output[\s\S]*confirms no public forum\/feed was created/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Routing Rules/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'L'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required question intake fields'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Private member form or portal submission once approved[\s\S]*no public forum/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Every submission stays private by default[\s\S]*Duplicate questions should be grouped/);
  assert.match(driveScript, /approvalGate: 'No public forum, member-visible question feed, legacy CRM form\/tag\/workflow, notification/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow M parent update card documents relevant updates before any sends', () => {
  assert.match(serverJs, /code: 'M'[\s\S]*name: 'Parent update'[\s\S]*assignee: 'Rabbi Elie Scheller'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required parent\/member update fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*parent\/member update id and update type[\s\S]*source trigger: manual Rabbi\/Shloimie update[\s\S]*privacy review status/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-parent-update-needed'[\s\S]*'one-time-parent-update-sent'[\s\S]*'one-time-channel:portal'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Contacts and Communications[\s\S]*Workflow I\/J\/K\/L handoffs[\s\S]*legacy CRM email\/SMS, WhatsApp\/WAPI/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*relationship and operations messages[\s\S]*verified One Time recipients[\s\S]*AI-generated drafts remain private/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'parent_update_id'[\s\S]*'privacy_review_status'[\s\S]*'communication_id'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow M was previously only a placeholder[\s\S]*bna_parent_leads and bna_contact_communications[\s\S]*requires explicit confirm SEND_WHATSAPP/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow\/contact-list write, email template\/campaign, SMS\/WhatsApp\/Telegram\/portal notification/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow M[\s\S]*Dry-run update payload maps one sample class\/material\/question update[\s\S]*Privacy smoke verifies child names/);
  assert.match(serverJs, /\|\| task\.key === 'workflow-m'/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'M'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required parent\/member update fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-parent-update-needed'[\s\S]*'one-time-channel:whatsapp'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Contacts and Communications[\s\S]*Workflow I\/J\/K\/L handoffs/);
  assert.match(driveScript, /routingRules: \[[\s\S]*relationship and operations messages[\s\S]*verified One Time recipients/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow\/contact-list write, email template\/campaign, SMS\/WhatsApp\/Telegram\/portal notification/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow O referral card documents happy-member referrals before asks or rewards', () => {
  assert.match(serverJs, /code: 'O'[\s\S]*name: 'Referral'[\s\S]*assignee: 'Shloimie'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required referral fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*referral request id and referrer contact\/member id[\s\S]*happy-member signal[\s\S]*thank-you status, reward\/credit\/gift policy approval/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-referral-candidate'[\s\S]*'one-time-referral-lead'[\s\S]*'one-time-source:referral'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Contacts and Communications[\s\S]*Workflow M parent\/member update replies[\s\S]*legacy CRM forms, referral links, coupons, rewards/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Ask for referrals only from happy, eligible members[\s\S]*Referred prospects enter Workflow A[\s\S]*Thank-you messages, credits, gifts/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'referral_request_id'[\s\S]*'referral_code'[\s\S]*'reward_status'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow O was previously only a placeholder[\s\S]*source=referral[\s\S]*requires explicit confirm SEND_WHATSAPP/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow\/contact-list write, referral form\/link\/code\/coupon/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow O[\s\S]*Dry-run referral request payload maps one happy active member[\s\S]*Dry-run referred-lead payload maps one referred prospect/);
  assert.match(serverJs, /\|\| task\.key === 'workflow-o'/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'O'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required referral fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-referral-candidate'[\s\S]*'one-time-source:referral'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Contacts and Communications[\s\S]*Workflow M parent\/member update replies/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Ask for referrals only from happy, eligible members[\s\S]*Referred prospects enter Workflow A/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow\/contact-list write, referral form\/link\/code\/coupon/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow P testimonial and reputation card documents consent before public proof or review asks', () => {
  assert.match(serverJs, /code: 'P'[\s\S]*name: 'Testimonial\/reputation'[\s\S]*assignee: 'Rabbi Elie Scheller'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required testimonial\/reputation fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*testimonial or reputation request id[\s\S]*consent basis and approved use scope[\s\S]*privacy review status/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-testimonial-candidate'[\s\S]*'one-time-testimonial-approved'[\s\S]*'one-time-review-request-sent'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Contacts and Communications[\s\S]*Workflow M parent\/member update replies[\s\S]*legacy CRM reputation\/review widgets/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Ask for testimonials only from happy, eligible parents[\s\S]*Treat every raw compliment[\s\S]*Google\/Facebook review requests should use neutral approved copy/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'testimonial_request_id'[\s\S]*'consent_status'[\s\S]*'review_provider'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow P was previously only a placeholder[\s\S]*no dedicated One Time testimonial[\s\S]*No legacy CRM\/reputation\/review/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM tag\/custom-field\/workflow\/reputation\/review-widget write/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow P[\s\S]*Dry-run testimonial request payload maps one happy eligible member[\s\S]*Reputation request dry-run maps one approved review ask/);
  assert.match(serverJs, /'workflow-p'/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'P'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required testimonial\/reputation fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-testimonial-candidate'[\s\S]*'one-time-review-request-sent'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Contacts and Communications[\s\S]*Workflow M parent\/member update replies/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Ask for testimonials only from happy, eligible parents[\s\S]*Treat every raw compliment/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM tag\/custom-field\/workflow\/reputation\/review-widget write/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow Q organic content upload card documents Rabbi source material before social uploads', () => {
  assert.match(serverJs, /code: 'Q'[\s\S]*name: 'Organic content upload'[\s\S]*assignee: 'Rabbi Elie Scheller'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required organic content fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*organic content id, source asset id[\s\S]*source ownership and release status[\s\S]*Torah\/source\/Rabbi review status/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-organic-intake'[\s\S]*'one-time-buffer-draft-created'[\s\S]*'one-time-platform:youtube'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Drive 04 Content and Media Intake[\s\S]*Rabbi video prompt patch library[\s\S]*Operations Content outputs can generate Facebook/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Organic posts use only reviewed public-safe source material[\s\S]*Text-only Buffer drafts are still external scheduler writes[\s\S]*Organic winner metrics can suggest Workflow R/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'organic_content_id'[\s\S]*'prompt_stack_id'[\s\S]*'buffer_post_id'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow Q was previously only a placeholder[\s\S]*rabbi-video-prompt-library\.mjs[\s\S]*can attach direct hosted image\/video URLs through Buffer assets/);
  assert.match(serverJs, /approval_gate: 'No Buffer\/social post or draft, Buffer social post\/scheduler write/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow Q[\s\S]*Prompt-library smoke composes one one-time-vertical-short[\s\S]*Dry-run organic package maps one Rabbi video\/source-sheet sample/);
  assert.match(serverJs, /'workflow-q'/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'Q'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required organic content fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-organic-intake'[\s\S]*'one-time-buffer-draft-created'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Drive 04 Content and Media Intake[\s\S]*Rabbi video prompt patch library/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Organic posts use only reviewed public-safe source material[\s\S]*Text-only Buffer drafts are still external scheduler writes/);
  assert.match(driveScript, /approvalGate: 'No Buffer\/social post or draft, Buffer social post\/scheduler write/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('One Time Drive/social ingestion map is backend-scoped and login-gated', () => {
  assert.match(driveScript, /CONTENT_MEDIA_INTAKE_FOLDERS = \[/);
  assert.match(driveScript, /04\.00 Upload Here - Rabbi Video Drops/);
  assert.match(driveScript, /one_time_video_drop/);
  assert.match(driveScript, /04\.30 Social Output Drafts - Platform Review/);
  assert.match(driveScript, /SOCIAL_PLATFORM_SETUP = \[/);
  assert.match(driveScript, /Facebook[\s\S]*LinkedIn[\s\S]*YouTube[\s\S]*Instagram[\s\S]*WhatsApp Status/);
  assert.match(driveScript, /LOGIN_RELEASE_GUARD = \{/);
  assert.match(driveScript, /whatsappRequestCopy: 'Hi Rabbi Elie, before I send the scoped One Time login/);
  assert.match(driveScript, /drive-social-ingestion-map\.json/);
  assert.match(serverJs, /ONE_TIME_DRIVE_SOCIAL_INGESTION_MAP_PATH/);
  assert.match(serverJs, /function oneTimeDriveSocialIngestionMap\(\)/);
  assert.match(serverJs, /function oneTimeAppAccessReadinessPayload\(\)/);
  assert.match(serverJs, /drive_social_ingestion: oneTimeDriveSocialMap/);
  assert.match(serverJs, /app\.get\('\/api\/bna\/one-time\/drive-social-ingestion'/);
  assert.match(serverJs, /app\.get\('\/api\/bna\/one-time\/app-access-readiness'/);
  assert.match(serverJs, /ready_for_member_library_publish: false/);
  assert.match(serverJs, /no_admin_password_reset/);
  assert.match(serverJs, /Provider record lacks Rabbi contact email/);
  assert.match(operationsHtml, /Drive \/ Social Intake/);
  assert.match(operationsHtml, /function renderDriveSocialIngestionSettings/);
  assert.match(operationsHtml, /function renderOneTimeAppAccessReadinessCard/);
  assert.match(operationsHtml, /Check App Access/);
  assert.match(operationsHtml, /prepareSocialPlatformConnector/);
  assert.match(operationsHtml, /Login Release Guard/);
  assert.match(driveScript, /ONE_TIME_APP_ACCESS_READINESS = \{/);
  assert.match(driveScript, /app_access_readiness: ONE_TIME_APP_ACCESS_READINESS/);
});

test('Workflow R organic winner to paid ad card documents approval-gated ad promotion before spend', () => {
  assert.match(serverJs, /code: 'R'[\s\S]*name: 'Organic winner to paid ad'[\s\S]*assignee: 'Codex'[\s\S]*owner: 'Shloimie'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required paid-ad promotion fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*paid ad test id, organic content id[\s\S]*winner evidence: platform[\s\S]*budget and schedule/);
  assert.match(serverJs, /proposed_tags: \[[\s\S]*'one-time-ad-candidate'[\s\S]*'one-time-paid-ad-budget-approved'[\s\S]*'one-time-ad-platform:meta'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Workflow Q organic content upload[\s\S]*archived BNA Facebook ads tracker[\s\S]*Workflow C landing-page routing/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*Workflow R starts only from a reviewed Workflow Q organic winner[\s\S]*Start with a capped test budget[\s\S]*Keep organic performance reporting separate/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'paid_ad_test_id'[\s\S]*'ad_account_id_hash'[\s\S]*'cost_per_lead'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow R was previously only a placeholder[\s\S]*Buffer configured as the active organic social posting provider[\s\S]*archived BNA Meta\/Facebook ad-spend export/);
  assert.match(serverJs, /approval_gate: 'No Meta\/Facebook\/Instagram, Google\/YouTube, LinkedIn, legacy CRM ads\/campaign/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow R[\s\S]*Dry-run ad-candidate payload maps one Workflow Q organic winner[\s\S]*Budget guard smoke verifies missing budget approval/);
  assert.match(serverJs, /task\.key === 'workflow-r'/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'R'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required paid-ad promotion fields'/);
  assert.match(driveScript, /proposedTags: \[[\s\S]*'one-time-ad-candidate'[\s\S]*'one-time-paid-ad-budget-approved'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Workflow Q organic content upload[\s\S]*archived BNA Facebook ads tracker/);
  assert.match(driveScript, /routingRules: \[[\s\S]*Workflow R starts only from a reviewed Workflow Q organic winner[\s\S]*Start with a capped test budget/);
  assert.match(driveScript, /approvalGate: 'No Meta\/Facebook\/Instagram, Google\/YouTube, LinkedIn, legacy CRM ads\/campaign/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow N support ticket card documents quick reporting, triage, approval gate, and smoke tests', () => {
  assert.match(serverJs, /code: 'N'[\s\S]*name: 'Support ticket'[\s\S]*implementation_status: 'implemented_dashboard_api_pending_rabbi_bot_runtime'/);
  assert.match(serverJs, /required_fields_label: 'Required ticket fields'/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Support tab[\s\S]*Rabbi scoped Telegram bot[\s\S]*POST \/api\/bna\/support-tickets/);
  assert.match(serverJs, /support_categories: \[[\s\S]*'bot_api'[\s\S]*'task_manager'[\s\S]*'student_parent_data'/);
  assert.match(serverJs, /ticket_lifecycle: \[[\s\S]*open: newly reported[\s\S]*triage:[\s\S]*resolved:/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*automatically create a linked Codex repair task[\s\S]*High and blocking tickets notify/);
  assert.match(serverJs, /Resolving or closing a ticket creates a local processed-notification draft[\s\S]*no email, WhatsApp, SMS, Telegram, or portal message is sent automatically/);
  assert.match(serverJs, /approval_gate: 'No new notification destination, auto-fix behavior, ticket auto-close rule/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow N[\s\S]*Support API read smoke verifies \/api\/bna\/support-tickets[\s\S]*Resolution smoke moves one ticket to resolved/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(serverJs, /existing\.ai_parsed->>'seed_key' = \$8/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Support Categories/);
  assert.match(operationsHtml, /Ticket Lifecycle/);
  assert.match(driveScript, /code: 'N'[\s\S]*implementationStatus: 'implemented_dashboard_api_pending_rabbi_bot_runtime'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Support tab[\s\S]*Rabbi scoped Telegram bot/);
  assert.match(driveScript, /supportCategories: \[[\s\S]*'bot_api'[\s\S]*'task_manager'/);
  assert.match(driveScript, /ticketLifecycle: \[[\s\S]*open: newly reported[\s\S]*closed:/);
  assert.match(driveScript, /Resolving or closing a ticket creates a local processed-notification draft[\s\S]*no email, WhatsApp, SMS, Telegram, or portal message is sent automatically/);
  assert.match(driveScript, /Intake channels: \$\{workflow\.intakeChannels\.join/);
  assert.match(driveScript, /Support categories: \$\{workflow\.supportCategories\.join/);
  assert.match(driveScript, /Ticket lifecycle: \$\{workflow\.ticketLifecycle\.join/);
});

test('support ticket resolution creates a first-party no-send processed notification draft', () => {
  assert.match(serverJs, /const SUPPORT_TICKET_PROCESSED_STATUSES = new Set\(\['resolved', 'closed'\]\)/);
  assert.match(serverJs, /async function maybeCreateSupportTicketProcessedNotification/);
  assert.match(serverJs, /source_context->>'support_ticket_id'/);
  assert.match(serverJs, /INSERT INTO bna_contact_communications \([\s\S]*VALUES \(\$1, 'general', 'internal_note', 'internal_note'/);
  assert.match(serverJs, /ticket_processed_notification: true/);
  assert.match(serverJs, /external_write_performed: false/);
  assert.match(serverJs, /No email, WhatsApp, SMS, Telegram, or portal message was sent automatically/);
  assert.match(serverJs, /notification_draft: notificationDraft/);
  assert.match(operationsHtml, /result\?\.notification_draft[\s\S]*No email was sent/);
});

test('Workflow S monthly financial report card documents revenue, expenses, split, approval gate, and smoke tests', () => {
  assert.match(serverJs, /code: 'S'[\s\S]*name: 'Monthly financial report'[\s\S]*implementation_status: 'documented_pending_approval'/);
  assert.match(serverJs, /required_fields_label: 'Required monthly report fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*gross collected revenue by currency and source[\s\S]*approved hard expenses[\s\S]*Rabbi Elie share, Shloimie share/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Accounting view[\s\S]*Payment provider exports or webhooks[\s\S]*Drive finance folder/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*shared One Time platform[\s\S]*trusted payment-success records from Workflow E[\s\S]*50\/50 split is calculated after approved hard expenses/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'gross_revenue'[\s\S]*'net_distributable_amount'[\s\S]*'distribution_status'/);
  assert.match(serverJs, /current_state_checklist: \[[\s\S]*Workflow S was previously only a placeholder card[\s\S]*does not yet have a dedicated One Time monthly financial report table[\s\S]*No legacy CRM\/payment-provider\/accounting writes were made/);
  assert.match(serverJs, /approval_gate: 'No legacy CRM\/payment-provider\/accounting-system write, Drive export as final, partner report send/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow S[\s\S]*Dry-run report maps one sample month[\s\S]*Exception smoke verifies unpaid checkouts/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Intake Channels/);
  assert.match(operationsHtml, /Tracking Fields/);
  assert.match(operationsHtml, /Smoke Tests/);
  assert.match(driveScript, /code: 'S'[\s\S]*implementationStatus: 'documented_pending_approval'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required monthly report fields'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Accounting view[\s\S]*Payment provider exports or webhooks/);
  assert.match(driveScript, /routingRules: \[[\s\S]*shared One Time platform[\s\S]*50\/50 split is calculated after approved hard expenses/);
  assert.match(driveScript, /approvalGate: 'No legacy CRM\/payment-provider\/accounting-system write, Drive export as final, partner report send/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('Workflow T internal app operating card documents status loop, approval gate, and smoke tests', () => {
  assert.match(serverJs, /code: 'T'[\s\S]*name: 'Internal app operating workflow'[\s\S]*implementation_status: 'documented_status_loop_pending_runtime_followups'/);
  assert.match(serverJs, /required_fields_label: 'Required status fields'/);
  assert.match(serverJs, /required_fields: \[[\s\S]*task id, title, project, stage[\s\S]*support ticket id[\s\S]*bot\/runtime identity/);
  assert.match(serverJs, /intake_channels: \[[\s\S]*Operations Tasks, Schedule, and Team views[\s\S]*Agent fleet supervisor[\s\S]*Agent watchdog/);
  assert.match(serverJs, /routing_rules: \[[\s\S]*One Time task\/status writes stay scoped[\s\S]*Support-ticket repairs keep the ticket status[\s\S]*After app-visible\/server-visible changes/);
  assert.match(serverJs, /tracking_fields: \[[\s\S]*'agent_runtime_status\.agent_key'[\s\S]*'watchdog severity and latest report path'[\s\S]*'live smoke report path'/);
  assert.match(serverJs, /approval_gate: 'No task-stage closure, support-ticket auto-close, bot runtime\/credential change/);
  assert.match(serverJs, /smoke_tests: \[[\s\S]*Read-only roadmap\/API smoke shows Workflow T[\s\S]*Status smoke runs agent fleet\/watchdog status commands[\s\S]*Post-change app smoke runs node --check/);
  assert.match(serverJs, /\['workflow-d', 'workflow-e', 'workflow-f', 'workflow-h', 'workflow-i', 'workflow-j', 'workflow-k', 'workflow-l', 'workflow-n', 'workflow-p', 'workflow-q', 'workflow-s', 'workflow-t'\]\.includes\(task\.key\)/);
  assert.match(operationsHtml, /Tracking Fields/);
  assert.match(operationsHtml, /Observe Before Approval/);
  assert.match(driveScript, /code: 'T'[\s\S]*implementationStatus: 'documented_status_loop_pending_runtime_followups'/);
  assert.match(driveScript, /requiredFieldsLabel: 'Required status fields'/);
  assert.match(driveScript, /intakeChannels: \[[\s\S]*Operations Tasks, Schedule, and Team views[\s\S]*Agent watchdog/);
  assert.match(driveScript, /routingRules: \[[\s\S]*One Time task\/status writes stay scoped[\s\S]*After app-visible\/server-visible changes/);
  assert.match(driveScript, /approvalGate: 'No task-stage closure, support-ticket auto-close, bot runtime\/credential change/);
  assert.match(driveScript, /Smoke tests: \$\{workflow\.smokeTests\.join/);
});

test('existing BNA record tables gained project ownership for scoped reuse', () => {
  for (const table of [
    'signups',
    'bna_parent_leads',
    'bna_contact_communications',
    'bna_students',
    'bna_payment_log',
    'bna_payment_intake',
    'bna_accountability_events',
    'bna_group_goals',
    'bna_content_jobs',
    'bna_class_sessions',
    'bna_content_bundles',
    'bna_assignments',
  ]) {
    assert.match(serverJs, new RegExp(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS project_id`));
  }
  assert.match(serverJs, /async function ensureProjectOwnershipBackfill/);
});

test('Operations UI exposes Team/Admin and task Calendar without a separate Roadmap section', () => {
  assert.match(operationsHtml, /\{ id: 'admin', label: 'Team \/ Admin'/);
  assert.match(operationsHtml, /\{ id: 'schedule', label: 'Calendar'/);
  assert.match(operationsHtml, /roadmap: 'tasks'/);
  assert.match(operationsHtml, /roadmap: 'schedule'/);
  assert.match(operationsHtml, /getSupportTickets\(filters = \{\}\)/);
  assert.match(operationsHtml, /createSupportTicket\(ticket\)/);
  assert.match(operationsHtml, /function renderSupport\(\)/);
  assert.match(operationsHtml, /case 'admin': content = renderTeamAdmin\(\)/);
  assert.match(operationsHtml, /function renderTaskSchedule/);
  assert.match(operationsHtml, /function renderTaskWorkflowPanel/);
  assert.doesNotMatch(operationsHtml, /\{ id: 'roadmap', label: 'Roadmap'/);
  assert.doesNotMatch(operationsHtml, /getOneTimeRoadmap\(\)/);
  assert.doesNotMatch(operationsHtml, /function renderRoadmap\(\)/);
  assert.doesNotMatch(operationsHtml, /Planned Briefs|Pending Briefs|Implementation Briefs/);
});

test('Operations support ticket reporting uses an in-app form instead of native prompts', () => {
  const supportTicketFlow = operationsHtml.match(/function createSupportTicketPrompt\(\) \{[\s\S]*?async function updateSupportTicketStatus/)?.[0] || '';
  assert.match(operationsHtml, /function renderSupportTicketModal\(\)/);
  assert.match(operationsHtml, /onclick="openSupportTicketForm\(\)">Open Ticket/);
  assert.match(operationsHtml, /id="supportTicketModalTitle">Report a Problem/);
  assert.match(operationsHtml, /for="supportTicketDescription">Issue/);
  assert.match(operationsHtml, /id="supportTicketExpected"/);
  assert.match(operationsHtml, /for="supportTicketContext">App context/);
  assert.match(operationsHtml, /for="supportTicketRoute">Current route/);
  assert.match(operationsHtml, /report_mode: 'in_app_support_ticket_form'/);
  assert.match(operationsHtml, /onclick="openSupportTicketForm\(\)">Report problem/);
  assert.match(operationsHtml, /function currentSupportTicketSourceContext\(\)/);
  assert.match(operationsHtml, /function openSupportTicketResultView\(\)/);
  assert.match(operationsHtml, /communicationsSection = 'support_threads'/);
  assert.match(operationsHtml, /source_context: currentSupportTicketSourceContext\(\)/);
  assert.match(supportTicketFlow, /openSupportTicketForm\(\)/);
  assert.doesNotMatch(supportTicketFlow, /prompt\(/);
  assert.doesNotMatch(operationsHtml, /What is wrong here\?/);
});

test('Drive setup prefers the June 10 final proposal and archives the June 9 draft', () => {
  assert.match(driveScript, /FINAL_PROPOSAL_NAME = 'Rabbi_Sheller_Shloimie_50_50_Full_Workflow_Proposal_2026-06-10\.docx'/);
  assert.match(driveScript, /OLD_PROPOSAL_NAME = 'Rabbi_Sheller_Shloimie_50_50_Partnership_Proposal_2026-06-09\.docx'/);
  assert.match(driveScript, /Full_Workflow_Proposal/);
  assert.match(driveScript, /archiveOldProposalCopy/);
  assert.match(driveScript, /Historical Drafts/);
  assert.match(driveScript, /Workflow Map From Final Proposal/);
});

test('Rabbi Telegram bridge captures support tickets and requires an allowed chat id', () => {
  assert.match(telegramBridge, /function hasExplicitScopedSupportTicketIntent/);
  assert.match(telegramBridge, /\/api\/bna\/support-tickets/);
  assert.match(telegramBridge, /support_ticket_created/);
  assert.match(telegramBridge, /supportTicketsCreated/);
  assert.match(telegramBridge, /TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER/);
  assert.match(telegramBridge, /scoped bot requires TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER/);
});
