'use strict';

const { deterministicPlan } = require('../planner');
const { buildToolRegistry } = require('../tool-registry');
const { sanitizeHelperPageContext } = require('../context');

const { ensureHelperControlPlaneTables, recordTurn } = require('./audit-ledger');
const { buildRuntimeContext } = require('./runtime-context');
const { createEvidence } = require('./evidence');
const { executeControlledAction } = require('./action-control');
const { resolveControlledRoute } = require('./route-control');
const { renderControlledResponse } = require('./conversation');
const { startUsageMeter } = require('./usage-meter');
const { emitAgentReviewItem } = require('./agent-review-emitter');

function shouldTreatAsRouteAction(action = {}) {
  return action.tool === 'open_operations_view';
}

async function runHelperControlPlaneTurn(input = {}) {
  const db = input.db || null;
  const deps = input.deps || {};
  const message = String(input.message || input.user_message || input.prompt || '').slice(0, 20000);
  const context = buildRuntimeContext({
    ...input.context,
    requestId: input.requestId || input.request_id,
    conversationId: input.conversationId || input.conversation_id,
    sessionId: input.sessionId || input.session_id,
    identity: input.identity || input.context?.identity,
    pageContext: sanitizeHelperPageContext(input.pageContext || input.page_context || input.context?.pageContext || {}),
    userRole: input.userRole || input.user_role || input.context?.userRole,
    workspaceKey: input.workspaceKey || input.workspace_key || input.context?.workspaceKey,
    projectKey: input.projectKey || input.project_key || input.context?.projectKey,
    authStatus: input.authStatus || input.auth_status,
    req: input.req || input.context?.req,
  });
  const evidence = createEvidence(context, input);
  const usage = startUsageMeter(context, input.usage || {});

  await ensureHelperControlPlaneTables(db);
  await recordTurn(db, context, message);

  const registry = input.registry || buildToolRegistry({ ...deps, db });
  const plan = input.plan || deterministicPlan(message, registry, {
    ...(context.registryContext || {}),
    pageContext: context.pageContext,
  });

  const actions = Array.isArray(input.actions)
    ? input.actions
    : Array.isArray(plan?.actions)
      ? plan.actions
      : [];

  if (input.routeIntent) {
    usage.addToolCall('resolveControlledRoute', 'success');
    await resolveControlledRoute({ ...input.routeIntent, message }, context, { db, evidence });
  } else if (actions.length) {
    for (const action of actions.slice(0, 3)) {
      if (shouldTreatAsRouteAction(action)) {
        usage.addToolCall('resolveControlledRoute', 'success');
        await resolveControlledRoute({
          intent: 'open_operations_view',
          target: action.args || {},
          helperTool: 'open_operations_view',
          actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
          message,
        }, context, { db, evidence });
      }
      usage.addToolCall(`executeControlledAction:${action.tool}`, 'success');
      await executeControlledAction({
        toolName: action.tool,
        args: action.args || {},
        confirmationText: input.confirmationText || input.confirmation_text || '',
      }, context, { db, deps, evidence, registry });
    }
  } else {
    await resolveControlledRoute({
      intent: 'public_route',
      target: { route: context.helperRole === 'public_visitor' ? '/' : '/operations' },
      message,
      requireRegisteredAction: false,
    }, context, { db, evidence });
  }

  const response = renderControlledResponse({
    context,
    evidence,
    assistantDraft: input.assistantDraft || input.assistant_draft || '',
  });

  await emitAgentReviewItem({
    user_message: message,
    assistant_response: response,
  }, context, evidence, { db });

  await usage.finish(db, evidence, input.usage_finish || {});

  return {
    request_id: context.requestId,
    context: context.redactedForModel(),
    plan,
    evidence,
    response,
  };
}

module.exports = {
  runHelperControlPlaneTurn,
};
