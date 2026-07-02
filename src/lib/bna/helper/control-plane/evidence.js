'use strict';

const crypto = require('crypto');

const { redactValue } = require('../redaction');

function makeId(prefix) {
  if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value || null)).digest('hex');
}

function createEvidence(context = {}, input = {}) {
  return {
    request_id: context.requestId || input.requestId || makeId('helper_req'),
    conversation_id: context.conversationId || input.conversationId || null,
    session_id: context.sessionId || input.sessionId || null,
    helper_role: context.helperRole || null,
    scope: redactValue(context.effectiveScope || {}),
    created_at: new Date().toISOString(),
    route_resolutions: [],
    action_audits: [],
    action_results: [],
    denials: [],
    data_refs: [],
    repair_items: [],
    usage: [],
    review_items: [],
    warnings: [],
  };
}

function addRouteResolution(evidence, resolution) {
  const record = {
    route_resolution_id: resolution.route_resolution_id || makeId('route_res'),
    ...resolution,
  };
  evidence.route_resolutions.push(record);
  return record;
}

function addActionAudit(evidence, audit) {
  const record = {
    audit_id: audit.audit_id || makeId('helper_action_audit'),
    ...audit,
  };
  evidence.action_audits.push(record);
  return record;
}

function addActionResult(evidence, result) {
  const record = {
    result_id: result.result_id || makeId('helper_action_result'),
    ...result,
  };
  evidence.action_results.push(record);
  return record;
}

function addDenial(evidence, denial) {
  const record = {
    denial_id: denial.denial_id || makeId('helper_denial'),
    ...denial,
  };
  evidence.denials.push(record);
  return record;
}

function addDataRef(evidence, ref) {
  const record = {
    data_ref_id: ref.data_ref_id || makeId('helper_data_ref'),
    ...ref,
  };
  evidence.data_refs.push(record);
  return record;
}

function addRepairItem(evidence, repair) {
  const record = {
    repair_item_id: repair.repair_item_id || makeId('helper_repair'),
    ...repair,
  };
  evidence.repair_items.push(record);
  return record;
}

function committedActionResults(evidence = {}) {
  return (evidence.action_results || []).filter((result) => {
    return result.status === 'committed' && result.audit_id && result.result_id;
  });
}

function resolvedRoutes(evidence = {}) {
  return (evidence.route_resolutions || []).filter((route) => route.status === 'resolved' && route.url);
}

function isCommittedResult(result = {}) {
  return Boolean(result.status === 'committed' && result.audit_id && result.result_id);
}

module.exports = {
  addActionAudit,
  addActionResult,
  addDataRef,
  addDenial,
  addRepairItem,
  addRouteResolution,
  committedActionResults,
  createEvidence,
  isCommittedResult,
  makeId,
  redactedValue: redactValue,
  resolvedRoutes,
  sha256,
};
