const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const googleIntegrations = fs.readFileSync('src/lib/bna/google-integrations.js', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');

function envLineValue(name) {
  const match = envExample.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

test('Google OAuth defaults are identity-only and broad scopes are opt-in', () => {
  assert.match(server, /const DEFAULT_GOOGLE_SCOPES = \[\s*'https:\/\/www\.googleapis\.com\/auth\/userinfo\.email',\s*\]/);
  assert.equal(envLineValue('GOOGLE_SCOPES'), 'https://www.googleapis.com/auth/userinfo.email');

  const defaultScopeBlock = server.match(/const DEFAULT_GOOGLE_SCOPES = \[[\s\S]*?\];/)?.[0] || '';
  assert.doesNotMatch(defaultScopeBlock, /gmail\.send|\/auth\/drive'|classroom\.rosters|classroom\.profile\.emails|\/auth\/calendar'/);

  assert.match(envExample, /do not include Gmail, broad Drive, Classroom rosters/);
  assert.match(envExample, /GOOGLE_SCOPE_EXAMPLE_DRIVE_FILE=https:\/\/www\.googleapis\.com\/auth\/drive\.file/);
  assert.doesNotMatch(envLineValue('GOOGLE_SCOPES'), /gmail\.send|\/auth\/drive|classroom\.rosters|classroom\.profile\.emails/);
});

test('OAuth start requires an explicit configured-scope or Drive setup request', () => {
  assert.match(server, /include_configured_scopes/);
  assert.match(server, /scope_preset/);
  assert.match(server, /setupDrivePipelineRequested/);
  assert.doesNotMatch(server, /const setupDrivePipeline = !hasExplicitScopeRequest/);
  assert.match(server, /features: scopeFeatures/);
});

test('Google integration configured checks use the shared secrets-aware OAuth loader', () => {
  const integrationOauthStartBlock = server.match(
    /app\.get\('\/api\/integrations\/google\/oauth\/start'[\s\S]*?app\.get\('\/api\/integrations\/google\/oauth\/callback'/
  )?.[0] || '';

  assert.match(server, /function googleOAuthClientConfigured\(\) \{/);
  assert.match(server, /const config = loadGoogleOAuthClient\(\);[\s\S]*return Boolean\(config\.clientId && config\.clientSecret\);/);
  assert.match(server, /function googleIntegrationReadinessPayload\(\) \{\s*const oauthConfigured = googleOAuthClientConfigured\(\);/);
  assert.match(server, /function providerGoogleBusinessStatus[\s\S]*const configured = googleOAuthClientConfigured\(\);/);
  assert.match(server, /function buildGoogleDriveStatusCard\(\) \{\s*const oauthJsonPresent = googleOAuthClientConfigured\(\);/);
  assert.match(integrationOauthStartBlock, /if \(!googleOAuthClientConfigured\(\)\)/);
  assert.doesNotMatch(integrationOauthStartBlock, /process\.env\.GOOGLE_CLIENT_ID|process\.env\.GOOGLE_CLIENT_SECRET/);
});

test('role defaults and Classroom feature scopes avoid roster and profile-email scope creep', () => {
  assert.match(googleIntegrations, /\[GOOGLE_CONNECTION_ROLES\.ADMIN_TEACHER\]: \['identity'\]/);
  assert.match(googleIntegrations, /\[GOOGLE_CONNECTION_ROLES\.STUDENT\]: \['identity'\]/);
  assert.match(googleIntegrations, /\[GOOGLE_CONNECTION_ROLES\.PARENT\]: \['identity'\]/);

  const classroomManageBlock = googleIntegrations.match(/classroom_manage: \[[\s\S]*?\],/)?.[0] || '';
  assert.match(classroomManageBlock, /classroom_courses_readonly/);
  assert.match(classroomManageBlock, /classroom_coursework_students/);
  assert.match(classroomManageBlock, /classroom_courseworkmaterials/);
  assert.match(classroomManageBlock, /classroom_topics/);
  assert.doesNotMatch(classroomManageBlock, /classroom_rosters_readonly|classroom_profile_emails/);
});

test('OAuth callback page redacts refresh tokens instead of displaying secret values', () => {
  assert.match(server, /const displayEnvLines = \[/);
  assert.match(server, /GOOGLE_REFRESH_TOKEN=<stored under \$\{path\.relative/);
  assert.match(server, /This page only shows redacted metadata/);
  assert.match(server, /do not paste from this page into Railway/);
  assert.doesNotMatch(server, /These values include secrets\. Paste them into Railway variables/);
});
