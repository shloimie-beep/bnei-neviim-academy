const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Operations exposes Google readiness under the Integrations module', () => {
  assert.match(operations, /getGoogleIntegrationStatus\(\) \{ return this\.request\('GET', '\/integrations\/google\/status'\); \}/);
  assert.match(operations, /integrations: 'integrations'/);
  assert.match(operations, /let currentView = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'agents', 'platform_suite', 'students', 'community', 'content', 'contacts', 'intake', 'live_classes', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'accounting', 'automations', 'api_usage', 'admin', 'integrations', 'settings'\]/);
  assert.match(operations, /const INTEGRATIONS_SUBTABS = \[/);
  assert.match(operations, /Operations > Integrations/);
  assert.match(operations, /case 'integrations': content = renderIntegrations\(\); break;/);
  assert.match(operations, /renderGoogleWorkspaceSettings\(\{ canonicalRoute: true \}\)/);
  assert.match(operations, /Canonical route: Operations > Integrations > Google/);
  assert.match(operations, /google_workspace/);
  assert.match(operations, /Google Workspace/);
  assert.match(operations, /Google Drive/);
  assert.match(operations, /Google Calendar/);
  assert.match(operations, /Google Classroom/);
  assert.match(operations, /Google Business Profile/);
  assert.match(operations, /business\.manage only after provider approval/);
  assert.match(operations, /preview\/dry-run now, execute only for connected test users/i);
  assert.match(operations, /google_drive_find_file_preview/);
  assert.match(operations, /google_drive_create_doc_preview/);
  assert.match(operations, /google_drive_create_folder_preview/);
  assert.match(operations, /google_drive_move_file_preview/);
  assert.match(operations, /calendar_batch_launch_plan_preview/);
  assert.match(operations, /8-week plan/);
  assert.match(operations, /classroom_topic_material_preview/);
  assert.match(operations, /Topic\/material/);
  assert.match(operations, /function attrValueJson/);
  assert.match(operations, /previewGoogleIntegrationAction\(\$\{attrJson\(action\.id\)\}, \$\{attrValueJson\(action\.inputs \|\| \{\}\)\}\)/);
  assert.match(operations, /workspace_key: targetWorkspace/);
  assert.match(operations, /disconnectGoogleConnection/);
  assert.match(operations, /DISCONNECT_GOOGLE/);
  assert.match(operations, /GOOGLE_ACTION_AUDIT_KEYS/);
  assert.match(operations, /function renderGoogleActionAuditLog/);
  assert.match(operations, /Google Action Audit/);
  assert.match(operations, /capture_provider_google_business_link/);
  assert.match(operations, /google_business_place_id_lookup/);
  assert.match(operations, /google_business_list_locations_preview/);
  assert.match(operations, /Place ID/);
  assert.match(operations, /Locations/);
  assert.match(operations, /Read-only preview\/execution evidence/);
  assert.match(operations, /botActionLogs \|\| \[\]/);
  assert.match(operations, /\.google-action-audit-log \.data-table \{\s*background: #ffffff;/);
  assert.match(operations, /\.google-action-audit-log table \{\s*border-collapse: collapse;/);
  assert.match(operations, /function googleAuditValueText/);
  assert.match(operations, /value\.blocker[\s\S]*value\.next_confirmation/);
  assert.match(operations, /details\.map\(googleAuditValueText\)/);
  assert.match(operations, /function renderGoogleLiveAdapterApprovalPacket/);
  assert.match(operations, /Google Live Adapter Approval Packet/);
  assert.match(operations, /No live Google read\/write runs from this packet/);
  assert.match(operations, /APPROVE_GOOGLE_LIVE_ADAPTER_TEST/);
  assert.match(operations, /Drive scope policy/);
  assert.match(operations, /Smoke evidence/);
  assert.match(operations, /Preview Decision Draft/);
  assert.match(operations, /function approvalDecisionDraft/);
  assert.match(operations, /function previewApprovalDecisionDraft/);
  assert.match(operations, /action_id: 'create_decision'/);
  assert.match(operations, /dry_run: true/);
  assert.match(operations, /approval_packet_\$\{kind\}/);
  assert.match(operations, /google_live_adapter/);
  assert.match(operations, /No decision task was created and no external write ran/);
  assert.match(operations, /creates no decision task and performs no connector read\/write/);
});

test('Operations auth allows the Integrations module for admin and provider workspaces', () => {
  assert.match(server, /platformAllowedViews = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'agents', 'platform_suite', 'students', 'contacts', 'intake', 'community', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'accounting', 'automations', 'api_usage', 'admin', 'integrations', 'settings'\]/);
  assert.match(server, /providerAllowedViews = \['dashboard', 'watchdog', 'pipelines', 'tasks', 'agents', 'contacts', 'intake', 'community', 'content', 'live_classes', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'automations', 'api_usage', 'integrations', 'settings'\]/);
  assert.doesNotMatch(server, /providerAllowedViews = \[[^\]]*'platform_suite'/);
  assert.match(server, /allowedViews: identity\?\.allowedViews \|\| \['dashboard', 'watchdog', 'pipelines', 'tasks', 'agents', 'platform_suite', 'students', 'contacts', 'intake', 'community', 'content', 'calendar', 'service_providers', 'communications', 'internal_dialogue', 'accounting', 'automations', 'api_usage', 'admin', 'integrations', 'settings'\]/);
});

test('Google integrations status is available through the BNA Operations API namespace', () => {
  assert.match(server, /function sendGoogleIntegrationStatus/);
  assert.match(server, /app\.get\('\/api\/integrations\/google\/status', requireAdmin, sendGoogleIntegrationStatus\)/);
  assert.match(server, /app\.get\('\/api\/bna\/integrations\/google\/status', requireAdmin, sendGoogleIntegrationStatus\)/);
  assert.match(server, /FROM bna_google_connections/);
  assert.match(server, /googleIntegrationRowsFromOAuthConnection/);
  assert.match(server, /google_business_profile/);
  assert.match(server, /default_scopes: DEFAULT_GOOGLE_SCOPES/);
  assert.match(server, /required_scopes: DEFAULT_GOOGLE_SCOPES/);
  assert.match(server, /configured_scopes: configuredScopes/);
  assert.match(server, /configured_scope_warnings/);
  assert.match(server, /not requested by a bare OAuth start/);
  assert.match(server, /Bare OAuth starts request identity only/);
});

test('Google OAuth connections can be disconnected through a confirmation-gated endpoint', () => {
  assert.match(server, /async function disconnectGoogleConnection/);
  assert.match(server, /app\.post\('\/api\/google\/connections\/:connectionId\/disconnect', requireAdmin, disconnectGoogleConnection\)/);
  assert.match(server, /app\.post\('\/api\/bna\/integrations\/google\/connections\/:connectionId\/disconnect', requireAdmin, disconnectGoogleConnection\)/);
  assert.match(server, /confirm === 'DISCONNECT_GOOGLE'/);
  assert.match(server, /refresh_token = NULL/);
  assert.match(server, /status = 'revoked'/);
});
