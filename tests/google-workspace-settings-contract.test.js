const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('Operations exposes a Google Workspace readiness settings panel', () => {
  assert.match(operations, /getGoogleIntegrationStatus\(\) \{ return this\.request\('GET', '\/integrations\/google\/status'\); \}/);
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
  assert.match(operations, /disconnectGoogleConnection/);
  assert.match(operations, /DISCONNECT_GOOGLE/);
});

test('Google integrations status is available through the BNA Operations API namespace', () => {
  assert.match(server, /function sendGoogleIntegrationStatus/);
  assert.match(server, /app\.get\('\/api\/integrations\/google\/status', requireAdmin, sendGoogleIntegrationStatus\)/);
  assert.match(server, /app\.get\('\/api\/bna\/integrations\/google\/status', requireAdmin, sendGoogleIntegrationStatus\)/);
  assert.match(server, /FROM bna_google_connections/);
  assert.match(server, /googleIntegrationRowsFromOAuthConnection/);
  assert.match(server, /google_business_profile/);
});

test('Google OAuth connections can be disconnected through a confirmation-gated endpoint', () => {
  assert.match(server, /async function disconnectGoogleConnection/);
  assert.match(server, /app\.post\('\/api\/google\/connections\/:connectionId\/disconnect', requireAdmin, disconnectGoogleConnection\)/);
  assert.match(server, /app\.post\('\/api\/bna\/integrations\/google\/connections\/:connectionId\/disconnect', requireAdmin, disconnectGoogleConnection\)/);
  assert.match(server, /confirm === 'DISCONNECT_GOOGLE'/);
  assert.match(server, /refresh_token = NULL/);
  assert.match(server, /status = 'revoked'/);
});
