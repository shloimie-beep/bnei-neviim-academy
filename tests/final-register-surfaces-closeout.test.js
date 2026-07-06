const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const agents = fs.readFileSync('AGENTS.md', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const provider = fs.readFileSync('public/provider.html', 'utf8');
const home = fs.readFileSync('public/index.html', 'utf8');
const siteNav = fs.readFileSync('public/js/bna-site-nav.js', 'utf8');
const helperRegistry = fs.readFileSync('src/lib/bna/helper/tool-registry.js', 'utf8');
const helperPlanner = fs.readFileSync('src/lib/bna/helper/planner.js', 'utf8');
const helperPermissions = fs.readFileSync('src/lib/bna/helper/permissions.js', 'utf8');

test('uploaded recordings and freeform rambles share canonical raw-first intake', () => {
  assert.match(server, /app\.post\('\/api\/bna\/intake\/parse'/);
  assert.match(server, /app\.post\('\/api\/bna\/recording-intake\/parse-mixed-recording'/);
  assert.match(server, /app\.post\('\/api\/bna\/content-jobs\/:id\/parse-mixed-recording'/);
  assert.match(server, /if \(!force && previousParse\?\.mixed_recording_parse\?\.parsed_at\)/);
  assert.match(server, /dry-run reused the stored parse/);
  assert.match(server, /const intake = await createCanonicalIntakeParseRun/);
  assert.match(server, /source_type: sourceType/);
  assert.match(server, /source_table: contentBacked && job\.id \? 'bna_content_jobs' : null/);
  assert.match(server, /raw_intake: intake\.raw_intake/);
  assert.match(server, /raw_intake_stable_id: intake\.raw_intake\?\.stable_id/);
  assert.match(server, /intake_parse_run_id: intake\.parse_run\.id/);
});

test('public service-provider flow points to provider index, join flow, portal, classroom, and plans', () => {
  assert.match(siteNav, /serviceProvidersUrl/);
  assert.match(siteNav, /\/providers\/join\?onboard=provider/);
  assert.match(home, /Service Provider Network/);
  assert.match(home, /href="\/providers\/join\?onboard=provider"/);
  assert.match(provider, /href="\/service-providers"/);
  assert.match(provider, /href="\/providers\/join\?onboard=provider"/);
  assert.match(provider, /data-provider-section="class_setup"/);
  assert.match(provider, /data-provider-natural-language-classroom/);
  assert.match(provider, /billing_period/);
  assert.match(provider, /does not create Google Classroom courses, publish a public community, send messages, charge anyone, or grant access/i);
  assert.match(server, /app\.get\(\['\/service-providers'/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/classroom-drafts'/);
  assert.match(server, /app\.get\('\/api\/provider-plans'/);
});

test('calendar and classroom are internal-first while Google remains a guarded connector', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_calendar_events/);
  assert.match(server, /app\.get\('\/api\/bna\/calendar-events'/);
  assert.match(server, /app\.post\('\/api\/bna\/calendar-events'/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/classroom'/);
  assert.match(server, /no_classroom_write_performed/);
  assert.match(operations, /BNA internal calendar works now/);
  assert.match(operations, /Google is a connector, not a blocker/);
  assert.match(operations, /BNA Classroom is first-party and usable now/);
  assert.match(operations, /Coming soon \/ internal-first/);
});

test('provider-owned API keys use safe references, rotation status, and helper controls', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_secret_refs/);
  assert.match(server, /encrypted_secret TEXT/);
  assert.match(server, /needs_rotation/);
  assert.match(operations, /Encrypted storage/);
  assert.match(operations, /Rotation reminder/);
  assert.match(helperRegistry, /name: 'save_provider_api_key'/);
  assert.match(helperRegistry, /name: 'rotate_provider_api_key'/);
  assert.match(helperRegistry, /raw_secret_stored: false/);
  assert.match(helperPlanner, /rotate_provider_api_key/);
  assert.match(helperPermissions, /'save_provider_api_key'/);
  assert.match(helperPermissions, /'rotate_provider_api_key'/);
});

test('helper can create and edit local automation and billing workflow metadata', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_automations/);
  assert.match(server, /app\.get\('\/api\/bna\/automations'/);
  assert.match(server, /app\.patch\('\/api\/bna\/automations\/:id'/);
  assert.match(helperRegistry, /name: 'create_automation'/);
  assert.match(helperRegistry, /name: 'update_automation'/);
  assert.match(helperRegistry, /no_send_publish_charge_or_sync/);
  assert.match(helperRegistry, /INSERT INTO bna_automations/);
  assert.match(helperPlanner, /create_automation/);
  assert.match(helperPlanner, /update_automation/);
  assert.match(helperPlanner, /billing workflow/);
  assert.match(helperPermissions, /'create_automation'/);
  assert.match(helperPermissions, /'update_automation'/);
});

test('operations copy and closeout protocol explain sections and require evidence', () => {
  for (const marker of [
    'local-toolbar-copy',
    'Queue Health',
    'Create automation with helper',
    'Billing & Payments',
    'Provider Index',
    'Calendar & Classroom',
    'Communications',
    'Intake Review',
  ]) {
    assert.ok(operations.includes(marker), marker);
  }
  assert.match(agents, /Completion requires evidence/);
  assert.match(agents, /ops\/agent-task-ledger\.jsonl/);
  assert.match(agents, /ops\/agent-changelog\.md/);
  assert.match(agents, /watchdog:audit/);
  assert.match(agents, /terminal status/);
});
