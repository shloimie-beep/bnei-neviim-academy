const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('communications screening classifies inbound messages and creates no-send alerts', () => {
  assert.match(server, /function classifyCommunicationPipeline/);
  assert.match(server, /parent_accountability/);
  assert.match(server, /urgent_needs_attention/);
  assert.match(server, /sleep_routine/);
  assert.match(server, /food_body_regulation/);
  assert.match(server, /non_clinical/);
  assert.match(server, /No external message was sent by this alert/);
  assert.match(server, /communication_attention_required/);
  assert.match(server, /app\.post\('\/api\/bna\/contact-communications\/screening-preview'/);
  assert.match(server, /would_create: \{/);
  assert.match(server, /createCommunicationAttentionArtifacts\(communication, screening/);
  assert.match(server, /dedupeKey = `communication-follow-up:\$\{communication\.id\}`/);
  assert.match(server, /no_medical_diagnosis: true/);
});

test('manual and WAPI communication writes share screening metadata', () => {
  assert.match(server, /mergeCommunicationScreeningMetadata\(body\.metadata \|\| \{\}, screening\)/);
  assert.match(server, /communication_screening: \{/);
  assert.match(server, /classifyCommunicationPipeline\(\{[\s\S]{0,500}channel: 'whatsapp'/);
  assert.match(server, /finalFollowUpRequired/);
  assert.match(server, /attention_artifacts/);
  assert.match(server, /external_write_performed: false/);
});

test('contact import preview supports CSV vCard email exports before commit', () => {
  assert.match(server, /function parseDelimitedContactExport/);
  assert.match(server, /function parseVcardContactExport/);
  assert.match(server, /async function previewContactImport/);
  assert.match(server, /app\.post\('\/api\/bna\/contact-imports\/preview'/);
  assert.match(server, /CSV\/vCard\/email export upload -> field mapping -> dedupe -> tags -> workspace association -> parent\/provider\/student classification -> preview before commit/);
  assert.match(server, /commit_blocked: true/);
  assert.match(server, /source_inventory/);
  assert.match(server, /contactImportPreviewScope/);
  assert.match(server, /contactImportDedupeKey/);
  assert.match(server, /const \{ source_row, \.\.\.safeRow \} = row/);
  assert.match(server, /warm_leads_no_send_until_approval/);
  assert.match(server, /forbidden_external_runtimes: \['ghl', 'go_high_level', 'leadconnector'\]/);
  assert.match(server, /external_crm_write_performed: false/);
  assert.match(server, /No contacts?, tags, emails?, WhatsApp messages?, external CRM records?, GHL\/LeadConnector records?, or billing records? are written/i);
});

test('Operations communications view exposes top news, readable cards, WAPI status, and separated import tooling', () => {
  assert.match(operations, /data-top-filter-rail="true" data-current-module="\$\{escapeHtml\(currentView\)\}"/);
  assert.doesNotMatch(operations, /function renderTopFilterRail\(\) \{[\s\S]{0,240}if \(currentView === 'communications'\) return ''/);
  assert.doesNotMatch(operations, /currentView === 'communications'\s*\?\s*renderCommunicationsChannelRail\('topbar'\)/);
  assert.match(operations, /data-communications-overview-shell/);
  assert.match(operations, /data-communications-readiness-panel/);
  assert.match(operations, /data-communication-import-history/);
  assert.match(operations, /data-communications-no-duplicate-channel-cards/);
  assert.match(operations, /function communicationIsImportAuditItem/);
  assert.match(operations, /Import audit rows stay in Import History/);
  assert.match(operations, /Email, WhatsApp, parent, student, provider, bot, and support lanes are selected from the module rail/);
  assert.doesNotMatch(operations, /data-communications-no-duplicate-channel-cards[\s\S]{0,500}renderContactImportPreviewPanel/);
  assert.match(operations, /data-communication-top-news/);
  assert.match(operations, /data-communication-screening-pipeline/);
  assert.match(operations, /data-contact-import-preview/);
  assert.match(operations, /data-communication-card/);
  assert.match(operations, /communication-detail-grid/);
  assert.match(operations, /function communicationSubject/);
  assert.match(operations, /function communicationStatusLine/);
  assert.match(operations, /function communicationTopNewsItems/);
  assert.match(operations, /function renderContactImportPreviewPanel/);
  assert.match(operations, /previewContactImport/);
  assert.match(operations, /Live WAPI pull/);
  assert.match(operations, /Live pull blocked/);
  assert.match(operations, /Bot Screening/);
  assert.match(operations, /Pipeline Stage/);
  assert.doesNotMatch(operations, /if \(currentView === 'communications'\) return '<button class="primary-button" onclick="createCommunicationNotePrompt\(\)">New Message<\/button>'/);
});
