const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_AGENT_OUTBOX_CHANNEL_KEY,
  communicationAgentMetadata,
  publishedKnowledgeSnapshot,
  resolveAssignedCommunicationAgent,
  resolveProfileChannelBinding,
} = require('../src/lib/bna/crm/communication-agent-runtime');
const { loadProviderLeadBotProfile } = require('../src/lib/bna/provider-lead-bot');
const { createAgentControlSQL } = require('../src/lib/bna/agent-control');

const server = fs.readFileSync('server.js', 'utf8');

function tableSlice(tableName) {
  const start = server.indexOf(`CREATE TABLE IF NOT EXISTS ${tableName}`);
  assert.notEqual(start, -1, `${tableName} table is present`);
  const rest = server.slice(start);
  const next = rest.slice(1).search(/\nCREATE TABLE IF NOT EXISTS /);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

function communicationAgentModelSlice() {
  const start = server.indexOf('const createCommunicationAgentModelSQL = `');
  assert.notEqual(start, -1, 'communication-agent SQL model is present');
  const rest = server.slice(start);
  const endMatch = rest.match(/`;\r?\n\r?\nconst createContactCommunicationsSQL/);
  assert.ok(endMatch, 'communication-agent SQL model has an end marker');
  const end = endMatch.index;
  return rest.slice(0, end);
}

test('communication agents use first-party tables separate from build and QA agents', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communication_agents/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communication_agent_versions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communication_agent_knowledge_sources/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communication_agent_channel_bindings/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_communication_agent_events/);
  assert.match(server, /await pool\.query\(createCommunicationAgentModelSQL\);/);

  assert.match(createAgentControlSQL, /CREATE TABLE IF NOT EXISTS bna_agent_profiles/);
  assert.match(createAgentControlSQL, /agent_type IN \('codex_builder', 'browser_qa', 'playwright_verifier', 'research_agent', 'operator'\)/);
  assert.doesNotMatch(createAgentControlSQL, /bna_communication_agents/);
  assert.doesNotMatch(createAgentControlSQL, /communication_agent/);
});

test('communication-agent model has versions, knowledge, channel bindings, and events', () => {
  const agents = tableSlice('bna_communication_agents');
  const versions = tableSlice('bna_communication_agent_versions');
  const knowledge = tableSlice('bna_communication_agent_knowledge_sources');
  const bindings = tableSlice('bna_communication_agent_channel_bindings');
  const events = tableSlice('bna_communication_agent_events');

  assert.match(agents, /workspace_key TEXT NOT NULL DEFAULT ''/);
  assert.match(agents, /project_key TEXT NOT NULL DEFAULT ''/);
  assert.match(agents, /description TEXT NOT NULL DEFAULT ''/);
  assert.match(agents, /active_version_id INTEGER/);
  assert.match(agents, /created_by TEXT NOT NULL DEFAULT 'system'/);
  assert.match(agents, /UNIQUE \(workspace_key, project_key, agent_key\)/);
  assert.match(server, /CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_communication_agents_key\s+ON bna_communication_agents\(workspace_key, project_key, agent_key\)/);
  assert.match(versions, /UNIQUE \(agent_id, version_key\)/);
  assert.match(versions, /version INTEGER NOT NULL DEFAULT 1/);
  assert.match(versions, /system_prompt TEXT NOT NULL DEFAULT ''/);
  assert.match(versions, /instructions TEXT NOT NULL DEFAULT ''/);
  assert.match(versions, /personality_tone TEXT NOT NULL DEFAULT ''/);
  assert.match(versions, /allowed_capabilities JSONB NOT NULL DEFAULT '\[\]'::jsonb/);
  assert.match(versions, /prohibited_capabilities JSONB NOT NULL DEFAULT '\[\]'::jsonb/);
  assert.match(versions, /escalation_rules JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(versions, /language_policy JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(versions, /response_policy JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(versions, /model_config JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(versions, /prompt_json JSONB/);
  assert.match(versions, /policy_json JSONB/);
  assert.match(versions, /knowledge_snapshot_version TEXT/);
  assert.match(versions, /publication_status TEXT NOT NULL DEFAULT 'draft'/);
  assert.match(versions, /published_by TEXT/);
  assert.match(versions, /bna_communication_agent_versions_publication_status_check/);
  assert.match(server, /bna_communication_agents_active_version_fk/);
  assert.match(knowledge, /workspace_key TEXT NOT NULL DEFAULT ''/);
  assert.match(knowledge, /project_key TEXT NOT NULL DEFAULT ''/);
  assert.match(knowledge, /title TEXT NOT NULL DEFAULT ''/);
  assert.match(knowledge, /source_type TEXT NOT NULL/);
  assert.match(knowledge, /source_ref TEXT NOT NULL/);
  assert.match(knowledge, /approved_content JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(knowledge, /extracted_facts JSONB NOT NULL DEFAULT '\[\]'::jsonb/);
  assert.match(knowledge, /publication_status TEXT NOT NULL DEFAULT 'published'/);
  assert.match(knowledge, /checksum TEXT/);
  assert.match(bindings, /agent_version_id INTEGER REFERENCES bna_communication_agent_versions\(id\)/);
  assert.match(bindings, /workspace_key TEXT NOT NULL DEFAULT ''/);
  assert.match(bindings, /project_key TEXT NOT NULL DEFAULT ''/);
  assert.match(bindings, /channel_id TEXT NOT NULL DEFAULT ''/);
  assert.match(bindings, /channel_binding_key TEXT NOT NULL UNIQUE/);
  assert.match(bindings, /reply_mode TEXT NOT NULL DEFAULT 'capture_only'/);
  assert.match(bindings, /create_task_on_inbound BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(bindings, /human_handoff_mode TEXT NOT NULL DEFAULT 'needs_human_badge'/);
  assert.match(bindings, /channel_formatting_policy JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(bindings, /active BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(bindings, /last_health_check TIMESTAMP/);
  assert.match(bindings, /last_error_redacted TEXT/);
  assert.match(events, /communication_id INTEGER REFERENCES bna_communications\(id\)/);
  assert.match(events, /redacted_metadata JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
});

test('One Time communication-agent seed publishes email and WhatsApp bindings without stale claims', () => {
  const slice = communicationAgentModelSlice();
  assert.match(slice, /'one_time_parent_information_agent'/);
  assert.match(slice, /'Rabbi Scheller''s Digital Assistant'/);
  assert.match(slice, /'one_time_parent_information_agent:2026-07-13-v3:config'/);
  assert.match(slice, /'one_time_inbound_email', 'email', 'resend', 'draft', NULL/);
  assert.match(slice, /'one_time_wapi', 'whatsapp', 'wapi', 'capture_only', 'whatsapp:one_time_agent_reply'/);
  assert.match(slice, /'One Time Mishnayos with Rabbi Eli Scheller'/);
  assert.match(slice, /'Live every day at 7:00 p\.m\. Israel time'/);
  assert.match(slice, /'HaGaon MiVilna 8, Ramat Beit Shemesh Alef'/);
  assert.match(slice, /'https:\/\/join\.onetimeonetime\.com\/one-time\/'/);
  assert.doesNotMatch(slice, /30-day trial|\$67|portal availability|library availability/i);
});

test('communication-agent tables reject secret-shaped JSON instead of storing provider credentials', () => {
  assert.match(server, /const communicationAgentNoSecretsCheck = "\(api\[_-\]\?key\|access\[_-\]\?token\|refresh\[_-\]\?token\|secret\|password\|credential\)";/);
  for (const tableName of [
    'bna_communication_agents',
    'bna_communication_agent_versions',
    'bna_communication_agent_knowledge_sources',
    'bna_communication_agent_channel_bindings',
    'bna_communication_agent_events',
  ]) {
    const slice = tableSlice(tableName);
    assert.match(slice, /\$\{communicationAgentNoSecretsCheck\}/);
    assert.doesNotMatch(slice, /\b(api_key|access_token|refresh_token|password|credential_value)\b/i);
  }
});

test('One Time email and WhatsApp resolve to the same communication-agent model without secrets or tasks', () => {
  const profile = loadProviderLeadBotProfile('one-time');
  const binding = {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  };
  const profileEmailBinding = resolveProfileChannelBinding(profile, 'email', 'resend');
  const profileWhatsappBinding = resolveProfileChannelBinding(profile, 'whatsapp', 'wapi');
  const email = resolveAssignedCommunicationAgent({ binding, channel: 'email', provider: 'resend' });
  const whatsapp = resolveAssignedCommunicationAgent({ binding, channel: 'whatsapp', provider: 'wapi' });

  assert.equal(profile.scope.channel, undefined);
  assert.deepEqual(profile.scope.channels, ['whatsapp', 'email']);
  assert.equal(profile.agent_model.model_family, 'communication_agent');
  assert.equal(profile.agent_model.shared_knowledge_snapshot, true);
  assert.equal(profileEmailBinding.channel_id, 'one_time_inbound_email');
  assert.equal(profileWhatsappBinding.channel_id, 'one_time_wapi');
  assert.equal(profileEmailBinding.agent_version, profileWhatsappBinding.agent_version);
  assert.equal(profileEmailBinding.knowledge_snapshot_ref, profileWhatsappBinding.knowledge_snapshot_ref);
  assert.equal(profileEmailBinding.create_task_on_inbound, false);
  assert.equal(profileWhatsappBinding.create_task_on_inbound, false);
  assert.equal(email.loaded, true);
  assert.equal(whatsapp.loaded, true);
  assert.equal(email.agent_key, 'one_time_parent_information_agent');
  assert.equal(whatsapp.agent_key, email.agent_key);
  assert.equal(email.model_family, 'communication_agent');
  assert.equal(whatsapp.control_plane_table, 'bna_communication_agents');
  assert.equal(email.agent_scope_channel_mode, 'channel_independent');
  assert.equal(whatsapp.agent_scope_channel_mode, 'channel_independent');
  assert.equal(email.shared_knowledge_snapshot, true);
  assert.equal(whatsapp.shared_knowledge_snapshot, true);
  assert.equal(email.build_qa_agent_profile_table, null);
  assert.equal(whatsapp.provider_secret_storage, 'external_provider_connectors_only');
  assert.equal(email.channel_binding_source, 'profile_channel_bindings');
  assert.equal(whatsapp.channel_binding_source, 'profile_channel_bindings');
  assert.equal(email.channel_id, 'one_time_inbound_email');
  assert.equal(whatsapp.channel_id, 'one_time_wapi');
  assert.equal(email.reply_mode, 'draft');
  assert.equal(email.outbox_channel_key, null);
  assert.equal(whatsapp.reply_mode, 'capture_only');
  assert.equal(whatsapp.outbox_channel_key, ONE_TIME_AGENT_OUTBOX_CHANNEL_KEY);
  assert.equal(email.knowledge_snapshot_version, whatsapp.knowledge_snapshot_version);
  assert.equal(email.knowledge_snapshot_hash, whatsapp.knowledge_snapshot_hash);
  assert.equal(email.published_knowledge_snapshot.knowledge_snapshot_version, email.knowledge_snapshot_version);
  assert.equal(whatsapp.published_knowledge_snapshot.knowledge_snapshot_version, email.knowledge_snapshot_version);
  assert.equal(email.channel_formatting_policy.format, 'email');
  assert.equal(email.channel_formatting_policy.subject_required, true);
  assert.equal(email.channel_formatting_policy.structured_paragraphs, true);
  assert.equal(email.channel_formatting_policy.concise_signature, true);
  assert.equal(whatsapp.channel_formatting_policy.format, 'whatsapp');
  assert.equal(whatsapp.channel_formatting_policy.one_question_at_a_time, true);
  assert.equal(whatsapp.channel_formatting_policy.subject_required, false);
  assert.equal(whatsapp.channel_formatting_policy.signature, 'none');
  assert.equal(email.create_task_on_inbound, false);
  assert.equal(whatsapp.create_task_on_inbound, false);
  assert.equal(email.raw_api_key_stored, false);
  assert.equal(whatsapp.raw_secret_returned, false);

  const metadata = communicationAgentMetadata(whatsapp);
  assert.equal(metadata.agent_model_family, 'communication_agent');
  assert.equal(metadata.agent_control_plane_table, 'bna_communication_agents');
  assert.equal(metadata.build_qa_agent_profile_table, null);
  assert.equal(metadata.shared_knowledge_snapshot, true);
  assert.equal(metadata.channel_id, 'one_time_wapi');
  assert.equal(metadata.channel_binding_source, 'profile_channel_bindings');
  assert.equal(metadata.published_knowledge_snapshot.knowledge_snapshot_version, email.knowledge_snapshot_version);
  assert.equal(metadata.published_knowledge_snapshot.approved_public_facts.signup_route, '/one-time/signup');
  assert.equal(metadata.published_knowledge_snapshot.access_policy.portal_access_status, 'not_currently_granted');
  assert.equal(metadata.published_knowledge_snapshot.no_stale_claims, true);
  assert.equal(metadata.channel_formatting_policy.format, 'whatsapp');
  assert.equal(metadata.communication_agent.model_family, 'communication_agent');
  assert.equal(metadata.communication_agent.channel_id, 'one_time_wapi');
  assert.equal(metadata.communication_agent.channel_binding_source, 'profile_channel_bindings');
  assert.equal(metadata.communication_agent.shared_knowledge_snapshot, true);
  assert.equal(metadata.communication_agent.raw_api_key_stored, false);
  assert.equal(metadata.communication_agent.raw_secret_returned, false);
});

test('published One Time knowledge snapshot contains launch-safe public facts only', () => {
  const profile = loadProviderLeadBotProfile('one-time');
  const snapshot = publishedKnowledgeSnapshot(profile);
  const serialized = JSON.stringify(snapshot);

  assert.equal(snapshot.publication_status, 'published');
  assert.equal(snapshot.profile_key, 'one_time_parent_information_agent');
  assert.equal(snapshot.profile_version, '2026-07-13-v3');
  assert.equal(snapshot.approved_public_facts.program, 'One Time Mishnayos with Rabbi Eli Scheller');
  assert.equal(snapshot.approved_public_facts.schedule, 'Live every day at 7:00 p.m. Israel time.');
  assert.equal(snapshot.approved_public_facts.signup_route, '/one-time/signup');
  assert.equal(snapshot.access_policy.portal_access_status, 'not_currently_granted');
  assert.equal(snapshot.access_policy.library_access_status, 'not_currently_granted');
  assert.equal(snapshot.offer_status, 'not_published_for_bot');
  assert.equal(snapshot.class_link_policy.deterministic_server_action_required, true);
  assert.equal(snapshot.class_link_policy.raw_class_link_in_model_context, false);
  assert.equal(snapshot.no_stale_claims, true);
  assert.doesNotMatch(serialized, /30-day|\$67|portal availability|library availability|member area is open|student login is open/i);
});
