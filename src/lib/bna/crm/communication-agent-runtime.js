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

function normalizeProvider(provider = '') {
  const key = normalizeKey(provider);
  if (key.includes('wapi') || key.includes('whapi')) return 'wapi';
  if (key.includes('resend') || key.includes('email')) return 'resend';
  if (key.includes('telegram')) return 'telegram';
  return key || 'unknown';
}

function normalizeReplyMode(value = '', fallback = 'capture_only') {
  const mode = normalizeKey(value || fallback);
  return ['off', 'capture_only', 'draft', 'live', 'approval_gated'].includes(mode)
    ? mode
    : fallback;
}

function channelFormattingPolicy(channel = '') {
  const normalizedChannel = normalizeChannel(channel);
  if (normalizedChannel === 'email') {
    return {
      format: 'email',
      subject_required: true,
      greeting: 'parent_or_school_safe',
      paragraphs: 'short_email',
      signature: 'concise',
      one_question_at_a_time: false,
      include_public_signup_route: true,
      raw_class_link_delivery: 'server_action_only',
      raw_class_link_in_model_context: false,
      raw_class_link_in_logs: false,
    };
  }
  if (normalizedChannel === 'whatsapp') {
    return {
      format: 'whatsapp',
      short_paragraphs: true,
      one_question_at_a_time: true,
      max_reply_chars: 900,
      include_public_signup_route: true,
      raw_class_link_delivery: 'server_action_only',
      raw_class_link_in_model_context: false,
      raw_class_link_in_logs: false,
    };
  }
  return {
    format: normalizedChannel || 'unknown',
    raw_class_link_delivery: 'server_action_only',
    raw_class_link_in_model_context: false,
    raw_class_link_in_logs: false,
  };
}

function profileChannelBindings(profile = {}) {
  return Array.isArray(profile.channel_bindings) ? profile.channel_bindings : [];
}

function resolveProfileChannelBinding(profile = {}, channel = '', provider = '') {
  const normalizedChannel = normalizeChannel(channel, provider);
  const normalizedProvider = normalizeProvider(provider);
  const candidates = profileChannelBindings(profile).filter((binding = {}) => {
    if (binding.active === false) return false;
    return normalizeChannel(binding.channel || binding.channel_id || '', binding.provider || '') === normalizedChannel;
  });
  if (!candidates.length) return null;
  return candidates.find((binding = {}) => normalizeProvider(binding.provider || '') === normalizedProvider)
    || candidates[0];
}

function profileChannelFormattingPolicy(profile = {}, channel = '', provider = '') {
  const binding = resolveProfileChannelBinding(profile, channel, provider);
  const configured = binding?.formatting_policy || binding?.channel_formatting_policy || {};
  return {
    ...channelFormattingPolicy(channel || binding?.channel || provider),
    ...configured,
  };
}

function knowledgeSnapshotHash(profile = {}) {
  return sha256(JSON.stringify({
    schema_version: profile.schema_version || '',
    profile_key: profile.profile_key || '',
    version: profile.version || '',
    scope: profile.scope || {},
    agent_model: profile.agent_model || {},
    channel_bindings: profile.channel_bindings || [],
    identity: profile.identity || {},
    personality: profile.personality || {},
    goals: profile.goals || [],
    knowledge_base: profile.knowledge_base || {},
    offer: profile.offer || {},
    policies: profile.policies || {},
  }));
}

function publishedKnowledgeSnapshot(profile = {}) {
  const publicFacts = profile.knowledge_base?.public_facts || {};
  const accessPolicy = profile.knowledge_base?.access_policy || {};
  return {
    publication_status: 'published',
    source_type: 'service_provider_bot_profile',
    source_ref: 'config/service-provider-bots/one-time.json',
    profile_key: profile.profile_key || '',
    profile_version: profile.version || '',
    approved_public_facts: {
      program: publicFacts.program || '',
      teacher: publicFacts.teacher || '',
      schedule: publicFacts.schedule || '',
      local_location: publicFacts.local_location || '',
      signup_route: publicFacts.signup_route || '/one-time/signup',
      audience: Array.isArray(publicFacts.audience) ? publicFacts.audience : [],
      class_link_behavior: publicFacts.class_link_behavior || '',
    },
    access_policy: {
      portal_access_status: accessPolicy.portal_access_status || 'not_currently_granted',
      member_area_status: accessPolicy.member_area_status || 'not_currently_granted',
      library_access_status: accessPolicy.library_access_status || 'not_currently_granted',
      student_login_status: accessPolicy.student_login_status || 'not_currently_granted',
      parent_login_status: accessPolicy.parent_login_status || 'not_currently_granted',
      safe_public_answer: accessPolicy.safe_public_answer || '',
    },
    offer_status: profile.offer?.status || 'not_published_for_bot',
    safe_offer_summary: profile.offer?.safe_summary || '',
    unpublished_claim_categories_blocked: [
      'trial_terms',
      'renewal_pricing',
      'payment_flow',
      'portal_access',
      'library_access',
      'member_access',
    ],
    class_link_policy: {
      deterministic_server_action_required: true,
      raw_class_link_in_model_context: false,
      raw_class_link_in_logs: false,
      raw_class_link_returned_in_metadata: false,
    },
    no_stale_claims: true,
  };
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
    const publishedKnowledge = publishedKnowledgeSnapshot(profile);
    const profileBinding = resolveProfileChannelBinding(profile, normalizedChannel, provider);
    const formattingPolicy = profileChannelFormattingPolicy(profile, normalizedChannel, provider);
    const profileBindingHasOutbox = profileBinding && Object.prototype.hasOwnProperty.call(profileBinding, 'outbox_channel_key');
    const defaultOutboxChannelKey = normalizedChannel === 'whatsapp' ? ONE_TIME_AGENT_OUTBOX_CHANNEL_KEY : null;
    const effectiveReplyMode = normalizeReplyMode(
      binding.replyMode || binding.reply_mode || profileBinding?.reply_mode || (normalizedChannel === 'email' ? 'draft' : profile.policies?.activation_mode || 'capture_only'),
      normalizedChannel === 'email' ? 'draft' : 'capture_only'
    );
    return {
      loaded: true,
      agent_key: profile.profile_key,
      display_name: profile.identity?.assistant_name || 'Rabbi Scheller Digital Assistant',
      description: profile.agent_model?.description || profile.identity?.assistant_subtitle || '',
      workspace_key: profile.scope?.workspace_key || ONE_TIME_WORKSPACE_KEY,
      project_key: profile.scope?.project_key || ONE_TIME_PROJECT_KEY,
      scope_channels: Array.isArray(profile.scope?.channels) ? profile.scope.channels : [normalizedChannel],
      agent_scope_channel_mode: 'channel_independent',
      active_version: profile.version,
      agent_version: profile.version,
      agent_version_status: 'published_config',
      shared_knowledge_snapshot: true,
      knowledge_snapshot_version: `${profile.profile_key}:${profile.version}:${snapshotHash.slice(0, 12)}`,
      knowledge_snapshot_hash: snapshotHash,
      published_knowledge_snapshot: {
        ...publishedKnowledge,
        knowledge_snapshot_version: `${profile.profile_key}:${profile.version}:${snapshotHash.slice(0, 12)}`,
        knowledge_snapshot_hash: snapshotHash,
      },
      knowledge_source_type: 'service_provider_bot_profile',
      knowledge_source_ref: 'config/service-provider-bots/one-time.json',
      channel: normalizedChannel,
      provider: normalizeProvider(provider),
      channel_id: profileBinding?.channel_id || `one_time_${normalizedChannel}`,
      channel_binding_key: `${ONE_TIME_WORKSPACE_KEY}:${ONE_TIME_PROJECT_KEY}:${normalizedChannel}:${profile.profile_key}`,
      channel_binding_source: profileBinding ? 'profile_channel_bindings' : 'runtime_default',
      channel_formatting_policy: formattingPolicy,
      model_family: 'communication_agent',
      control_plane_table: 'bna_communication_agents',
      build_qa_agent_profile_table: null,
      provider_secret_storage: 'external_provider_connectors_only',
      reply_mode: effectiveReplyMode,
      outbox_channel_key: profileBindingHasOutbox ? profileBinding.outbox_channel_key : defaultOutboxChannelKey,
      create_contact_on_inbound: profileBinding?.create_contact_on_inbound !== false,
      create_conversation_on_inbound: profileBinding?.create_conversation_on_inbound !== false,
      create_task_on_inbound: profileBinding?.create_task_on_inbound === true,
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
    agent_scope_channel_mode: agent.agent_scope_channel_mode || 'channel_independent',
    shared_knowledge_snapshot: agent.shared_knowledge_snapshot === true,
    knowledge_snapshot_version: agent.knowledge_snapshot_version,
    knowledge_snapshot_hash: agent.knowledge_snapshot_hash,
    knowledge_source_type: agent.knowledge_source_type,
    knowledge_source_ref: agent.knowledge_source_ref,
    channel_id: agent.channel_id || null,
    channel_binding_key: agent.channel_binding_key,
    channel_binding_source: agent.channel_binding_source || 'runtime_default',
    channel_formatting_policy: agent.channel_formatting_policy || channelFormattingPolicy(agent.channel),
    published_knowledge_snapshot: agent.published_knowledge_snapshot || null,
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
      provider: agent.provider,
      channel_id: agent.channel_id || null,
      channel_binding_key: agent.channel_binding_key,
      channel_binding_source: agent.channel_binding_source || 'runtime_default',
      channel_formatting_policy: agent.channel_formatting_policy || channelFormattingPolicy(agent.channel),
      published_knowledge_snapshot: agent.published_knowledge_snapshot || null,
      model_family: agent.model_family || 'communication_agent',
      control_plane_table: agent.control_plane_table || 'bna_communication_agents',
      knowledge_snapshot_version: agent.knowledge_snapshot_version,
      shared_knowledge_snapshot: agent.shared_knowledge_snapshot === true,
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
  channelFormattingPolicy,
  communicationAgentMetadata,
  knowledgeSnapshotHash,
  publishedKnowledgeSnapshot,
  profileChannelFormattingPolicy,
  resolveProfileChannelBinding,
  resolveAssignedCommunicationAgent,
};
