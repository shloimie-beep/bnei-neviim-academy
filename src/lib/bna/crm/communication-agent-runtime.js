const crypto = require('crypto');
const {
  loadProviderLeadBotProfile,
} = require('../provider-lead-bot');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_PROFILE_KEY = 'one-time';
const ONE_TIME_AGENT_OUTBOX_CHANNEL_KEY = 'whatsapp:one_time_agent_reply';

function compact(value = '', max = 1000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizeKey(value = '') {
  return compact(value, 160).toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeChannel(channel = '', provider = '') {
  const key = normalizeKey(channel || provider);
  if (key.includes('whatsapp') || key.includes('wapi') || key.includes('whapi')) return 'whatsapp';
  if (key.includes('email') || key.includes('resend')) return 'email';
  if (key.includes('telegram')) return 'telegram';
  return key || 'unknown';
}

function normalizeReplyMode(value = '', fallback = 'capture_only') {
  const mode = normalizeKey(value || fallback);
  return ['off', 'capture_only', 'draft', 'live', 'approval_gated'].includes(mode)
    ? mode
    : fallback;
}

function knowledgeSnapshotHash(profile = {}) {
  return sha256(JSON.stringify({
    schema_version: profile.schema_version || '',
    profile_key: profile.profile_key || '',
    version: profile.version || '',
    scope: profile.scope || {},
    identity: profile.identity || {},
    personality: profile.personality || {},
    goals: profile.goals || [],
    knowledge_base: profile.knowledge_base || {},
    offer: profile.offer || {},
    policies: profile.policies || {},
  }));
}

function resolveAssignedCommunicationAgent({
  binding = {},
  channel = '',
  provider = '',
} = {}) {
  const workspaceKey = normalizeKey(binding.workspaceKey || binding.workspace_key || binding.workspace || '');
  const projectKey = normalizeKey(binding.projectKey || binding.project_key || binding.project || '');
  const normalizedChannel = normalizeChannel(channel, provider);
  const replyMode = normalizeReplyMode(binding.replyMode || binding.reply_mode || '');

  const oneTimeScope = workspaceKey === ONE_TIME_WORKSPACE_KEY || projectKey === ONE_TIME_PROJECT_KEY;
  if (!oneTimeScope || !['email', 'whatsapp'].includes(normalizedChannel)) {
    return {
      loaded: false,
      reply_mode: replyMode,
      outbox_channel_key: null,
      reason: 'no_channel_agent_binding',
    };
  }

  try {
    const profile = loadProviderLeadBotProfile(ONE_TIME_PROFILE_KEY);
    const snapshotHash = knowledgeSnapshotHash(profile);
    const effectiveReplyMode = normalizeReplyMode(
      binding.replyMode || binding.reply_mode || (normalizedChannel === 'email' ? 'draft' : profile.policies?.activation_mode || 'capture_only'),
      normalizedChannel === 'email' ? 'draft' : 'capture_only'
    );
    return {
      loaded: true,
      agent_key: profile.profile_key,
      display_name: profile.identity?.assistant_name || 'Rabbi Scheller Digital Assistant',
      description: profile.identity?.assistant_subtitle || '',
      workspace_key: profile.scope?.workspace_key || ONE_TIME_WORKSPACE_KEY,
      project_key: profile.scope?.project_key || ONE_TIME_PROJECT_KEY,
      active_version: profile.version,
      agent_version: profile.version,
      agent_version_status: 'published_config',
      knowledge_snapshot_version: `${profile.profile_key}:${profile.version}:${snapshotHash.slice(0, 12)}`,
      knowledge_snapshot_hash: snapshotHash,
      knowledge_source_type: 'service_provider_bot_profile',
      knowledge_source_ref: 'config/service-provider-bots/one-time.json',
      channel: normalizedChannel,
      channel_binding_key: `${ONE_TIME_WORKSPACE_KEY}:${ONE_TIME_PROJECT_KEY}:${normalizedChannel}:${profile.profile_key}`,
      model_family: 'communication_agent',
      control_plane_table: 'bna_communication_agents',
      build_qa_agent_profile_table: null,
      provider_secret_storage: 'external_provider_connectors_only',
      reply_mode: effectiveReplyMode,
      outbox_channel_key: normalizedChannel === 'whatsapp' ? ONE_TIME_AGENT_OUTBOX_CHANNEL_KEY : null,
      create_contact_on_inbound: true,
      create_conversation_on_inbound: true,
      create_task_on_inbound: false,
      raw_api_key_stored: false,
      raw_secret_returned: false,
      raw_class_link_in_model_context: false,
      raw_class_link_in_logs: false,
    };
  } catch (error) {
    return {
      loaded: false,
      reply_mode: replyMode,
      outbox_channel_key: null,
      reason: 'agent_profile_load_failed',
      error_redacted: compact(error.message || String(error), 240),
    };
  }
}

function communicationAgentMetadata(agent = {}) {
  if (!agent.loaded) {
    return {
      agent_loaded: false,
      agent_reply_mode: agent.reply_mode || 'capture_only',
      communication_agent: null,
      agent_load_status: agent.reason || 'not_loaded',
      outbox_status: 'not_created',
      agent_outbox_channel_key: null,
    };
  }
  return {
    agent_loaded: true,
    agent_reply_mode: agent.reply_mode || 'capture_only',
    agent_key: agent.agent_key,
    agent_version: agent.agent_version,
    agent_version_status: agent.agent_version_status,
    knowledge_snapshot_version: agent.knowledge_snapshot_version,
    knowledge_snapshot_hash: agent.knowledge_snapshot_hash,
    knowledge_source_type: agent.knowledge_source_type,
    knowledge_source_ref: agent.knowledge_source_ref,
    channel_binding_key: agent.channel_binding_key,
    agent_model_family: agent.model_family || 'communication_agent',
    agent_control_plane_table: agent.control_plane_table || 'bna_communication_agents',
    build_qa_agent_profile_table: null,
    provider_secret_storage: 'external_provider_connectors_only',
    agent_outbox_channel_key: agent.outbox_channel_key || null,
    outbox_status: 'not_created',
    communication_agent: {
      agent_key: agent.agent_key,
      display_name: agent.display_name,
      active_version: agent.active_version,
      reply_mode: agent.reply_mode,
      channel: agent.channel,
      channel_binding_key: agent.channel_binding_key,
      model_family: agent.model_family || 'communication_agent',
      control_plane_table: agent.control_plane_table || 'bna_communication_agents',
      knowledge_snapshot_version: agent.knowledge_snapshot_version,
      raw_api_key_stored: false,
      raw_secret_returned: false,
      raw_class_link_in_model_context: false,
      raw_class_link_in_logs: false,
    },
  };
}

module.exports = {
  ONE_TIME_AGENT_OUTBOX_CHANNEL_KEY,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  communicationAgentMetadata,
  knowledgeSnapshotHash,
  resolveAssignedCommunicationAgent,
};
