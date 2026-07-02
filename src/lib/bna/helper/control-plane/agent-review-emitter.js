'use strict';

const { buildAgentReviewRepairItem } = require('../../agent-review-hub');
const { redactValue } = require('../redaction');
const { makeId } = require('./evidence');

function severityForCategory(category = '') {
  if (['invented_link_attempt', 'no_audit_receipt', 'privacy_denial'].includes(category)) return 'high';
  if (['wrong_scope_attempt', 'ambiguous_mishnah_route', 'unsupported_action', 'missing_route'].includes(category)) return 'medium';
  return 'low';
}

function reviewCategoryFromEvidence(evidence = {}) {
  if ((evidence.warnings || []).some((warning) => warning.code === 'invented_link_attempt')) return 'invented_link_attempt';
  if ((evidence.denials || []).some((denial) => denial.reason_code === 'ambiguous_mishnah_one_time_context_missing')) return 'ambiguous_mishnah_route';
  if ((evidence.denials || []).some((denial) => denial.kind === 'unsafe_data_request')) return 'privacy_denial';
  if ((evidence.denials || []).some((denial) => denial.kind === 'unsupported_action')) return 'unsupported_action';
  if ((evidence.route_resolutions || []).some((route) => route.reason_code && String(route.reason_code).includes('route_not_registered'))) return 'missing_route';
  if ((evidence.route_resolutions || []).some((route) => route.reason_code && String(route.reason_code).includes('workspace_scope_mismatch'))) return 'wrong_scope_attempt';
  return null;
}

async function emitAgentReviewItem(input = {}, context = {}, evidence = {}, options = {}) {
  const category = input.category || reviewCategoryFromEvidence(evidence);
  if (!category) return null;
  const severity = input.severity || severityForCategory(category);
  const repair = buildAgentReviewRepairItem({
    resultRef: context.requestId,
    promptKey: input.prompt_key || 'helper-control-plane',
    requirementId: input.requirement_id || 'REQ-HELPER-CONTROL-PLANE',
    status: severity === 'low' ? 'blocked' : 'fail',
    severity,
    blocker: input.blocker || category,
  });
  const item = {
    review_item_id: input.review_item_id || makeId('helper_review'),
    request_id: context.requestId,
    conversation_id: context.conversationId || null,
    severity,
    category,
    actor_role: context.helperRole || null,
    scope: redactValue(context.effectiveScope || {}),
    user_message_redacted: String(input.user_message || '').slice(0, 12000),
    assistant_response_redacted: String(input.assistant_response || '').slice(0, 12000),
    route_resolution_ids: (evidence.route_resolutions || []).map((item) => item.route_resolution_id).filter(Boolean),
    action_audit_ids: (evidence.action_audits || []).map((item) => item.audit_id).filter(Boolean),
    action_result_ids: (evidence.action_results || []).map((item) => item.result_id).filter(Boolean),
    denial_ids: (evidence.denials || []).map((item) => item.denial_id).filter(Boolean),
    proposed_repair: repair || {},
    status: 'open',
  };

  const db = options.db || null;
  if (db && typeof db.query === 'function') {
    await db.query(`
      INSERT INTO bna_helper_control_agent_review_items
        (review_item_id, request_id, conversation_id, severity, category, actor_role, scope,
         user_message_redacted, assistant_response_redacted, route_resolution_ids, action_audit_ids,
         action_result_ids, denial_ids, proposed_repair, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,$14::jsonb,$15)
      ON CONFLICT (review_item_id) DO NOTHING
    `, [
      item.review_item_id,
      item.request_id,
      item.conversation_id,
      item.severity,
      item.category,
      item.actor_role,
      JSON.stringify(item.scope),
      item.user_message_redacted,
      item.assistant_response_redacted,
      JSON.stringify(item.route_resolution_ids),
      JSON.stringify(item.action_audit_ids),
      JSON.stringify(item.action_result_ids),
      JSON.stringify(item.denial_ids),
      JSON.stringify(item.proposed_repair),
      item.status,
    ]);
  }

  if (Array.isArray(evidence.review_items)) evidence.review_items.push(item);
  return item;
}

module.exports = {
  emitAgentReviewItem,
  reviewCategoryFromEvidence,
  severityForCategory,
};
