'use strict';

const { makeId } = require('./evidence');

function startUsageMeter(context = {}, input = {}) {
  const startedAt = new Date();
  const state = {
    usage_id: input.usage_id || makeId('helper_usage'),
    request_id: context.requestId,
    conversation_id: context.conversationId || null,
    session_id: context.sessionId || null,
    actor_id: context.actor?.id || null,
    helper_role: context.helperRole || null,
    portal: context.portal || null,
    scope_kind: context.effectiveScope?.type || null,
    model_provider: input.model_provider || null,
    model_name: input.model_name || null,
    input_tokens: Number(input.input_tokens || 0) || null,
    output_tokens: Number(input.output_tokens || 0) || null,
    cached_input_tokens: Number(input.cached_input_tokens || 0) || null,
    reasoning_tokens: Number(input.reasoning_tokens || 0) || null,
    tool_calls: [],
    started_at: startedAt.toISOString(),
    completed_at: null,
  };
  return {
    state,
    addToolCall(name, status = 'success', latencyMs = null) {
      state.tool_calls.push({ name, status, latency_ms: latencyMs });
    },
    async finish(db, evidence = {}, extra = {}) {
      state.completed_at = new Date().toISOString();
      state.route_resolution_count = (evidence.route_resolutions || []).length;
      state.action_preview_count = (evidence.action_results || []).filter((result) => result.status === 'preview_prepared').length;
      state.action_commit_count = (evidence.action_results || []).filter((result) => result.status === 'committed').length;
      state.denial_count = (evidence.denials || []).length;
      state.repair_item_count = (evidence.repair_items || []).length;
      Object.assign(state, extra || {});
      if (db && typeof db.query === 'function') {
        await db.query(`
          INSERT INTO bna_helper_control_api_usage
            (usage_id, request_id, conversation_id, session_id, actor_id, helper_role, portal, scope_kind,
             model_provider, model_name, input_tokens, output_tokens, cached_input_tokens, reasoning_tokens,
             tool_calls, route_resolution_count, action_preview_count, action_commit_count, denial_count,
             repair_item_count, estimated_cost_cents, started_at, completed_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17,$18,$19,$20,$21,$22,$23)
          ON CONFLICT (usage_id) DO NOTHING
        `, [
          state.usage_id,
          state.request_id,
          state.conversation_id,
          state.session_id,
          state.actor_id,
          state.helper_role,
          state.portal,
          state.scope_kind,
          state.model_provider,
          state.model_name,
          state.input_tokens,
          state.output_tokens,
          state.cached_input_tokens,
          state.reasoning_tokens,
          JSON.stringify(state.tool_calls),
          state.route_resolution_count,
          state.action_preview_count,
          state.action_commit_count,
          state.denial_count,
          state.repair_item_count,
          state.estimated_cost_cents || null,
          state.started_at,
          state.completed_at,
        ]);
      }
      return state;
    },
  };
}

module.exports = {
  startUsageMeter,
};
