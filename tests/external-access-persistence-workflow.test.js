const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packet = fs.readFileSync('ops/access/external-access-persistence-workflow.md', 'utf8');
const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const serverJs = fs.readFileSync('server.js', 'utf8');

test('external access persistence packet defines the approval-gated write target', () => {
  assert.match(packet, /APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW/);
  assert.match(packet, /A valid approval must include the phrase plus every required field/);
  assert.match(packet, /Workspace\/project key/);
  assert.match(packet, /Account classification: external Operations user/);
  assert.match(packet, /Access level must be one of `owner`, `manager`,\s+`member`, or `viewer`/);
  assert.match(packet, /Scoped Operations username/);
  assert.match(packet, /Rollback\/revoke owner and revoke steps/);
  assert.match(packet, /Required readback evidence/);
  assert.match(packet, /Preview\/target endpoint:\s*\n\n`POST \/api\/bna\/admin\/external-access`/);
  assert.match(packet, /`dry_run:true` returns a no-write preview\/readback/);
});

test('external access packet keeps parent, provider, billing, member, and live-app credentials separate', () => {
  const guardedBoundaries = [
    /not parent accounts/,
    /not the approved external-account creation workflow by itself/,
    /Do not create or store a raw password/,
    /Do not send email, WhatsApp, SMS, Telegram, or portal messages/,
    /Do not create parent magic links, parent password resets, provider-portal\s+setup tokens, member-library credentials, checkout sessions, billing rows,\s+or Rabbi-owned live-app accounts/s,
    /every external-write flag as false/,
    /Parent portal login and student portal login do not accept the external\s+username/s,
    /Provider portal login does not accept the external username unless a separate\s+provider setup token\/password flow was explicitly used/s,
    /no email, WhatsApp, SMS, Telegram, billing, member-library,\s+Google, Drive, Buffer, WAPI, external CRM, or Rabbi live-app write occurred/s,
  ];
  for (const boundary of guardedBoundaries) assert.match(packet, boundary);
});

test('current Admin Users runtime exposes dry-run preview but blocks real external-access writes', () => {
  assert.match(operationsHtml, /Users \/ External Access/);
  assert.match(operationsHtml, /Create external user', 'Preview only'/);
  assert.match(operationsHtml, /data-admin-external-access-preview/);
  assert.match(operationsHtml, /previewAdminExternalAccess/);
  assert.match(operationsHtml, /api\.previewExternalAccess/);
  assert.match(operationsHtml, /Real write locked/);
  assert.match(operationsHtml, /No email, WhatsApp, password reset, billing, member-library, or external connector write runs from this panel/);
  assert.match(operationsHtml, /createAdminOpsAccessLink/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/ops-access-links'/);
  assert.match(serverJs, /Only the platform admin can create Operations access links/);
  assert.match(serverJs, /OPS_ACCESS_LINK_TTL_MS = 1000 \* 60 \* 20/);
  assert.match(serverJs, /app\.post\('\/api\/bna\/admin\/external-access'/);
  assert.match(serverJs, /Only the platform admin can preview external Operations access changes/);
  assert.match(serverJs, /External access persistence writes are not enabled yet/);
  assert.match(serverJs, /external_write_performed: false/);
  assert.match(serverJs, /no_parent_account_created: true/);
  assert.match(serverJs, /no_member_library_access_created: true/);
  assert.match(serverJs, /no_rabbi_live_app_credentials_created: true/);
  assert.doesNotMatch(operationsHtml, /createParentAccountFromExternalUser|sendExternalUserInviteEmail|createExternalUserInvite/);
});
