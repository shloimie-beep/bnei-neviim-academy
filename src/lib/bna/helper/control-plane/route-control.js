'use strict';

const { resolveHelperDestination } = require('../destination-resolver');
const { redactValue } = require('../redaction');
const { addDenial, addRouteResolution, makeId } = require('./evidence');
const { isOneTimeContext, compactText } = require('./runtime-context');
const { recordDenial, recordRouteResolution } = require('./audit-ledger');

const MISHNAH_GENERIC_RE = /\b(?:mishnah|mishna|mishnayos|mishnayot|mishnay[oó]s)\b/i;

function targetLooksOneTime(target = {}, intent = '') {
  const combined = [
    intent,
    target.route,
    target.path,
    target.url,
    target.view,
    target.section,
    target.workspace_key,
    target.workspaceKey,
    target.project_key,
    target.projectKey,
  ].filter(Boolean).join(' ').toLowerCase();
  return /one[-_\s]?time|mishnah|mishna|mishnayos|rabbi[-_\s]?member|member[-_\s]?library|classroom/.test(combined);
}

function denialMessageForReason(reason = '') {
  const text = String(reason || '');
  if (text.includes('ambiguous_mishnah_one_time_context_missing')) {
    return 'Mishnah/Mishna/Mishnayos wording is not enough to choose a One Time destination from this role or workspace.';
  }
  if (text.includes('route_not_registered')) return 'That destination is not registered in the canonical route registry.';
  if (text.includes('role_not_allowed')) return 'This role is not allowed to open that destination.';
  if (text.includes('workspace_scope_mismatch')) return 'That destination belongs to a different workspace scope.';
  if (text.includes('non_same_origin_or_invalid_route')) return 'That destination is not a safe same-origin BNA route.';
  if (text.includes('action_not_registered_or_not_allowed')) return 'The related action is not registered or is not allowed for this role.';
  return 'The helper could not resolve that destination from the current role and scope.';
}

function routeResolutionFromDestination(destination = {}, context = {}) {
  const status = destination.ok ? 'resolved' : 'denied';
  return {
    route_resolution_id: makeId('route_res'),
    request_id: context.requestId,
    status,
    route_id: destination.route_key || null,
    route_key: destination.route_key || null,
    route: destination.route || null,
    url: destination.ok ? destination.path : null,
    attempted_path: destination.attempted_path || null,
    canonical_path: destination.canonical_path || null,
    label: destination.ok
      ? `Open ${destination.section || destination.route_key || destination.path || 'destination'}`
      : null,
    portal: destination.route_key || null,
    workspace_key: destination.workspace_key || null,
    project_key: destination.project_key || null,
    access: destination.access || null,
    required_role: destination.required_role || null,
    authorization_result: destination.authorization_result || null,
    reason_code: destination.ok ? 'allowed' : destination.reason || destination.authorization_result || 'blocked',
    message: destination.ok ? destination.why_correct : denialMessageForReason(destination.reason || destination.authorization_result),
    fallback: destination.fallback || null,
    scope: redactValue(destination.scope || context.effectiveScope || {}),
    checks: destination.checks || {},
    raw_destination: redactValue(destination),
  };
}

async function resolveControlledRoute(input = {}, context = {}, options = {}) {
  const evidence = options.evidence || null;
  const db = options.db || null;
  const message = compactText(input.message || input.userMessage || input.user_message || '', 2000);
  const intent = input.intent || 'helper_navigation';
  const target = input.target || {};
  const requireRegisteredAction = input.requireRegisteredAction !== undefined
    ? Boolean(input.requireRegisteredAction)
    : Boolean(input.actionId || input.actionKey || input.helperTool);

  if (
    MISHNAH_GENERIC_RE.test(message || intent || '') &&
    targetLooksOneTime(target, intent) &&
    !isOneTimeContext(context)
  ) {
    const resolution = {
      route_resolution_id: makeId('route_res'),
      request_id: context.requestId,
      status: 'denied',
      route_id: null,
      route_key: null,
      route: null,
      url: null,
      attempted_path: target.route || target.path || target.url || null,
      canonical_path: null,
      label: null,
      portal: null,
      workspace_key: context.effectiveScope?.workspaceKey || context.effectiveScope?.workspace_key || null,
      project_key: context.effectiveScope?.projectKey || context.effectiveScope?.project_key || null,
      authorization_result: 'ambiguous_mishnah_one_time_context_missing',
      reason_code: 'ambiguous_mishnah_one_time_context_missing',
      message: denialMessageForReason('ambiguous_mishnah_one_time_context_missing'),
      fallback: { path: fallbackPathForContext(context), reason: 'safe_context_fallback' },
      scope: redactValue(context.effectiveScope || {}),
      checks: {
        same_origin: true,
        route_registered: false,
        action_registered: false,
        role_allowed: false,
        workspace_allowed: false,
        typed_action_allowed: false,
        one_time_context_allowed: false,
        browser_click_substitution_allowed: false,
      },
    };
    if (evidence) addRouteResolution(evidence, resolution);
    await recordRouteResolution(db, context, resolution);
    const denial = {
      kind: 'ambiguous_request',
      reason_code: resolution.reason_code,
      user_safe_reason: resolution.message,
      repair: { status: 'not_allowed', reason: 'context_does_not_support_one_time_resolution' },
    };
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
    return resolution;
  }

  const destination = resolveHelperDestination({
    intent,
    actor: {
      role: context.registryContext?.identity?.role || context.registryContext?.userRole || context.actor?.role || 'guest',
      scope: context.registryContext?.identity?.scope || context.effectiveScope || {},
      workspace_key: context.effectiveScope?.workspaceKey || context.effectiveScope?.workspace_key || context.registryContext?.workspaceKey || '',
      project_key: context.effectiveScope?.projectKey || context.effectiveScope?.project_key || context.registryContext?.projectKey || '',
      user_id: context.actor?.id || 'helper',
    },
    context: context.registryContext || context,
    channel: input.channel || 'helper_control_plane',
    target,
    actionId: input.actionId || input.action_id || '',
    actionKey: input.actionKey || input.action_key || '',
    helperTool: input.helperTool || input.helper_tool || '',
    reason: input.reason || 'Helper control-plane route resolution',
    requireRegisteredAction,
  });

  const resolution = routeResolutionFromDestination(destination, context);
  if (evidence) addRouteResolution(evidence, resolution);
  await recordRouteResolution(db, context, resolution);

  if (resolution.status !== 'resolved') {
    const denial = {
      kind: 'unsupported_route',
      reason_code: resolution.reason_code,
      user_safe_reason: resolution.message,
      repair: {
        status: 'available',
        action_id: context.capabilities?.includes('helper.repair.create') ? 'create_support_ticket' : null,
        fallback_path: resolution.fallback?.path || null,
      },
    };
    if (evidence) addDenial(evidence, denial);
    await recordDenial(db, context, denial);
  }

  return resolution;
}

function fallbackPathForContext(context = {}) {
  if (context.helperRole === 'parent') return '/parent';
  if (context.helperRole === 'student') return '/student';
  if (String(context.helperRole || '').includes('provider')) return '/provider';
  if (String(context.helperRole || '').includes('one_time')) return '/rabbi-member';
  if (context.helperRole === 'bna_super_admin') return '/operations';
  return '/';
}

function assertResolvedRoute(resolution = {}) {
  if (resolution.status !== 'resolved' || !resolution.url) {
    const error = new Error(resolution.message || 'Route was not resolved.');
    error.code = resolution.reason_code || 'route_not_resolved';
    error.resolution = resolution;
    throw error;
  }
  return resolution.url;
}

module.exports = {
  MISHNAH_GENERIC_RE,
  assertResolvedRoute,
  denialMessageForReason,
  fallbackPathForContext,
  resolveControlledRoute,
  routeResolutionFromDestination,
  targetLooksOneTime,
};
