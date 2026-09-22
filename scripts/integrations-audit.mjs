import fs from 'node:fs';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function assertIncludes(haystack, needle, label = needle) {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing integration audit evidence: ${label}`);
  }
}

const server = read('server.js');
const operations = read('public/operations.html');
const helperRegistry = read('src/lib/bna/helper/tool-registry.js');
const vimeo = read('src/lib/integrations/vimeo.js');

[
  'CREATE TABLE IF NOT EXISTS bna_provider_integrations',
  'CREATE TABLE IF NOT EXISTS bna_provider_secret_refs',
  'CREATE TABLE IF NOT EXISTS bna_provider_integration_audit_log',
  'CREATE TABLE IF NOT EXISTS bna_dns_setup_tasks',
  'buildGodaddyDnsStatusCard',
  'buildWapiStatusCard',
  'provider_scoped_integrations',
  'bna_external_action_audit',
].forEach((needle) => assertIncludes(server, needle));

[
  'show_integration_status',
  'save_provider_api_key',
  'mark_integration_blocked_until_thursday',
  'create_dns_setup_task',
  'prepare_vimeo_upload',
  'attach_vimeo_url_to_library_item',
].forEach((needle) => assertIncludes(helperRegistry, needle));

[
  'function normalizeVimeoTokenInput',
  'function testVimeoAuth',
  'function listVimeoFolders',
  'function listRecentVimeoVideos',
  'function createVimeoUploadIntent',
  'function attachVimeoUrl',
  'function parseVimeoUrl',
  'function mapVimeoApiErrorToAction',
].forEach((needle) => assertIncludes(vimeo, needle));

[
  'Integration Readiness',
  'Preview-first by policy',
  'blocked_until_thursday',
].forEach((needle) => assertIncludes(operations + server, needle));

console.log(JSON.stringify({
  ok: true,
  checked_at: new Date().toISOString(),
  checks: {
    provider_scoped_schema: true,
    secret_reference_model: true,
    dns_task_model: true,
    helper_integration_tools: true,
    vimeo_adapter: true,
    operations_readiness_cards: true,
  },
}, null, 2));
