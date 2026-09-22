const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const memberHtml = fs.readFileSync('public/rabbi-member.html', 'utf8');
const memberJs = fs.readFileSync('public/js/rabbi-member.js', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

function sliceBetween(text, start, end) {
  const startIndex = text.indexOf(start);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = text.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing end marker after ${start}: ${end}`);
  return text.slice(startIndex, endIndex);
}

test('support ticket schema stores ticket numbers and authenticated member context', () => {
  [
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT',
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS workspace_key TEXT',
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS project_key TEXT',
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS requester_user_key TEXT',
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS requester_email TEXT',
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS page_path TEXT',
    'ALTER TABLE bna_support_tickets ADD COLUMN IF NOT EXISTS authenticated_context JSONB',
    'idx_bna_support_tickets_ticket_number_unique',
    "ticket_number = 'OT-SUP-' || LPAD(id::text, 6, '0')",
  ].forEach((needle) => assert.ok(server.includes(needle), needle));
});

test('member support-ticket routes require member auth and persist scoped no-send context', () => {
  const createRoute = sliceBetween(
    server,
    "app.post('/api/rabbi/member/support-tickets'",
    "app.get('/api/rabbi/member/support-tickets/:id'"
  );

  assert.match(createRoute, /rabbiMemberFromSessionToken\(bearerOrBodyToken\(req\)\)/);
  assert.match(createRoute, /relationship_scope: 'one_time_member_project_ticket'/);
  assert.match(createRoute, /workspace_key, project_key, requester_user_key, requester_email/);
  assert.match(createRoute, /requester_display_name, requester_role, page_path, authenticated_context/);
  assert.match(createRoute, /auth_source: 'rabbi_member_session_token'/);
  assert.match(createRoute, /raw_access_code_stored: false/);
  assert.match(createRoute, /support_bot_mode: 'ticket_only'/);
  assert.match(createRoute, /unrestricted_mishnah_study_bot: false/);
  assert.match(createRoute, /external_write_performed: false/);
  assert.match(createRoute, /no_send: true/);

  const listRoute = sliceBetween(
    server,
    "app.get('/api/rabbi/member/support-tickets'",
    "app.post('/api/rabbi/member/support-tickets'"
  );
  assert.match(listRoute, /source_context->>'member_id' = \$2/);
  assert.match(listRoute, /source_context->>'relationship_scope' = 'one_time_member_project_ticket'/);
  assert.match(listRoute, /AND visibility = 'project'/);
});

test('member support views expose staff replies without source context or internal notes', () => {
  const view = sliceBetween(server, 'function memberSupportTicketView', 'function memberQuestionSubmissionView');
  assert.match(view, /staff_internal_notes_returned: false/);
  assert.match(view, /source_context_returned: false/);
  assert.match(view, /other_user_data_returned: false/);
  assert.match(view, /private_notification:/);
  assert.match(view, /staff_replies: visibleComments/);
  assert.match(view, /external_write_performed: false/);
});

test('member private-question route stays private and does not answer as a study bot', () => {
  const questionRoute = sliceBetween(
    server,
    "app.post('/api/rabbi/member/questions'",
    "app.post('/api/webhooks/green-invoice/rabbi'"
  );
  assert.match(questionRoute, /rabbiMemberFromSessionToken\(bearerOrBodyToken\(req\)\)/);
  assert.match(questionRoute, /INSERT INTO bna_one_time_question_reviews/);
  assert.match(questionRoute, /relationship_scope: 'one_time_member_private_question'/);
  assert.match(questionRoute, /no_public_forum: true/);
  assert.match(questionRoute, /no_member_feed: true/);
  assert.match(questionRoute, /forum_post_created, no_send, external_write_performed/);
  assert.doesNotMatch(questionRoute, /buildOneTimeClassroomBotReply/);

  const view = sliceBetween(server, 'function memberQuestionSubmissionView', 'function memberSupportSourceContext');
  assert.match(view, /no_public_forum: true/);
  assert.match(view, /no_member_feed: true/);
  assert.match(view, /internal_notes_returned: false/);
  assert.match(view, /source_context_returned: false/);
  assert.match(view, /staff_reply_available/);
});

test('member page wires visible question and support actions to the guarded APIs', () => {
  [
    'id="questionForm"',
    'id="supportForm"',
    'Submit Question',
    'Open Ticket',
  ].forEach((needle) => assert.ok(memberHtml.includes(needle), needle));

  [
    "api('/api/rabbi/member/questions'",
    "api('/api/rabbi/member/support-tickets'",
    'state.notice = data.question?.question_number',
    'state.notice = data.ticket?.ticket_number',
    'Open a member session before submitting a question.',
    'Open a member session before creating a support ticket.',
  ].forEach((needle) => assert.ok(memberJs.includes(needle), needle));
});

test('route and action registries cover member question and support controls', () => {
  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const supportRoute = routes.get('/api/rabbi/member/support-tickets');
  const supportDetailRoute = routes.get('/api/rabbi/member/support-tickets/:id');
  const questionRoute = routes.get('/api/rabbi/member/questions');
  assert.equal(supportRoute.access, 'private');
  assert.equal(supportRoute.required_role, 'member');
  assert.equal(supportRoute.public_allowed, false);
  assert.match(supportRoute.security_expectation, /no source context or internal notes/i);
  assert.equal(supportDetailRoute.public_allowed, false);
  assert.match(supportDetailRoute.security_expectation, /relationship_scope match/i);
  assert.equal(questionRoute.access, 'private');
  assert.match(questionRoute.security_expectation, /no forum post/i);

  const actions = new Map(actionRegistry.actions.map((action) => [action.action_id, action]));
  assert.equal(actions.get('ACTION-ONETIME-MEMBER-PRIVATE-QUESTION').status, 'active');
  assert.equal(actions.get('ACTION-ONETIME-MEMBER-SUPPORT-TICKET').status, 'active');
  assert.match(actions.get('ACTION-ONETIME-MEMBER-SUPPORT-TICKET').expected_behavior, /authenticated member-scoped support ticket/i);
});
