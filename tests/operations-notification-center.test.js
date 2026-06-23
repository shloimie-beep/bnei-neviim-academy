const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('in-app notification storage and APIs are first-party no-send only', () => {
  const server = read('server.js');

  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_in_app_notifications/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_notification_preferences/);
  assert.match(server, /delivery_state TEXT NOT NULL DEFAULT 'in_app_only'/);
  assert.match(server, /no_send BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(server, /external_write_performed BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(server, /telegram_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(server, /email_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(server, /whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(server, /app\.get\('\/api\/bna\/notifications'/);
  assert.match(server, /app\.patch\('\/api\/bna\/notifications\/:id'/);
  assert.match(server, /app\.get\('\/api\/bna\/notification-preferences'/);
  assert.match(server, /app\.patch\('\/api\/bna\/notification-preferences'/);
  assert.match(server, /telegram_enabled = FALSE/);
  assert.match(server, /email_enabled = FALSE/);
  assert.match(server, /whatsapp_enabled = FALSE/);
});

test('notification hooks cover onboarding, support, content, and question review events', () => {
  const server = read('server.js');
  const actionHandlers = read('src/lib/actions/actions/operations.js');

  [
    'parent_lead_submitted',
    'provider_onboarding_submitted',
    'parent_accountability_lead_submitted',
    'one_time_lead_submitted',
    'support_ticket_processed_draft',
    'rabbi_content_added',
  ].forEach((eventType) => assert.match(server, new RegExp(`eventType: '${eventType}'`)));
  assert.match(server, /'support_ticket_created'/);
  assert.match(server, /createInAppNotification\(\{[\s\S]*sourceTable: 'bna_support_tickets'/);

  assert.match(actionHandlers, /eventType: 'one_time_question_needs_review'/);
  assert.match(actionHandlers, /eventType: 'one_time_question_reviewed'/);
  assert.match(actionHandlers, /in_app_notification_only: true/);
  assert.match(actionHandlers, /external_write_performed: false/);
});

test('Operations dashboard renders a private alert center and update actions', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /getNotifications\(filters = \{\}\)/);
  assert.match(operations, /getNotificationPreferences\(filters = \{\}\)/);
  assert.match(operations, /renderNotificationCenter/);
  assert.match(operations, /Private In-app Alerts/);
  assert.match(operations, /No email, WhatsApp, Telegram, portal, CRM, Google, or Buffer write is triggered here/);
  assert.match(operations, /updateNotificationStatus/);
  assert.match(operations, /openCommandTarget\('dashboard', 'alerts'\)/);
});
