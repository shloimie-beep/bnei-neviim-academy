'use strict';

const studio = require('./service-provider-studio');

const OPENART_MCP_SOURCE_URL = 'https://openart.ai/mcp/';
const OPENART_APP_URL = 'https://openart.ai/';

function envFlag(env = {}, key = '') {
  return /^(?:1|true|yes|connected|enabled)$/i.test(String(env[key] || '').trim());
}

function openArtMcpStatus(env = process.env) {
  const oauthConnected = envFlag(env, 'OPENART_MCP_CONNECTED')
    || envFlag(env, 'OPENART_OAUTH_CONNECTED')
    || envFlag(env, 'OPENART_CONNECTED');

  return {
    provider: 'openart',
    mcp_server: 'openart',
    connected: oauthConnected,
    status: oauthConnected ? 'configured_no_live_smoke_only' : 'blocked_no_oauth',
    source_url: OPENART_MCP_SOURCE_URL,
    app_url: OPENART_APP_URL,
    next_action: oauthConnected
      ? 'Run a supervised no-live account/readiness smoke before enabling any generation call.'
      : 'Shloimie must sign up for OpenArt and connect OAuth/MCP before live generation is enabled.',
    allowed_from_bna: [
      'prepare OpenArt-ready prompts',
      'organize character/reference checklists',
      'prepare MCP request plans',
      'show OAuth/readiness blocker',
    ],
    blocked_until_connected: [
      'live image generation',
      'live video generation',
      'reference upload',
      'credit-consuming render',
      'workspace switching in OpenArt',
    ],
    no_live_call: true,
    external_write_performed: false,
  };
}

function normalizeReferenceList(references = []) {
  const rows = Array.isArray(references) ? references : [references].filter(Boolean);
  return rows.map((reference, index) => {
    if (typeof reference === 'string') {
      return {
        reference_key: `reference_${index + 1}`,
        label: reference.slice(0, 120),
        source: reference,
      };
    }
    return {
      reference_key: studio.safeText(reference.reference_key || reference.key, `reference_${index + 1}`),
      label: studio.safeText(reference.label || reference.title || reference.name, `Reference ${index + 1}`),
      source: studio.safeText(reference.source || reference.url || reference.note || reference.description),
    };
  }).filter((reference) => reference.label || reference.source);
}

function buildOpenArtMcpRequestPlan({ project = {}, prompt_export = {}, references = [], env = process.env } = {}) {
  const status = openArtMcpStatus(env);
  const refList = normalizeReferenceList(references);
  const promptText = studio.safeText(prompt_export.copy_text || prompt_export.prompt || prompt_export.compiled_prompt);

  return {
    provider: 'openart',
    mcp_server: 'openart',
    status: status.status,
    connected: status.connected,
    requires_oauth: !status.connected,
    no_live_call: true,
    external_write_performed: false,
    project: {
      workspace_key: project.workspace_key || 'rabbi_sheller_provider',
      project_key: project.project_key || 'one_time_mishnah_class',
      studio_project_id: project.id || null,
      title: project.title || null,
    },
    prepared_actions: [
      {
        intent: 'check_account_and_credits',
        enabled_after_oauth: true,
        live_call_now: false,
      },
      {
        intent: 'upload_character_or_style_references',
        enabled_after_oauth: refList.length > 0,
        live_call_now: false,
        reference_count: refList.length,
      },
      {
        intent: 'generate_image_or_video_from_prompt',
        enabled_after_oauth: Boolean(promptText),
        live_call_now: false,
        prompt_hash: promptText ? studio.sha256(promptText) : null,
      },
      {
        intent: 'organize_openart_project_assets',
        enabled_after_oauth: true,
        live_call_now: false,
      },
    ],
    references: refList,
    prompt_preview: promptText.slice(0, 500),
    next_action: status.next_action,
  };
}

module.exports = {
  OPENART_MCP_SOURCE_URL,
  OPENART_APP_URL,
  openArtMcpStatus,
  normalizeReferenceList,
  buildOpenArtMcpRequestPlan,
};
