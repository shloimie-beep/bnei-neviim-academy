'use strict';

const { HELPER_ROLES } = require('./runtime-context');
const { resolvedRoutes, committedActionResults } = require('./evidence');
const { responseSafetyReport } = require('./response-safety');

function scopeLabel(context = {}) {
  const scope = context.effectiveScope || {};
  if (scope.type === 'all') return 'Current scope: Operations global.';
  if (scope.workspaceKey || scope.workspace_key || scope.projectKey || scope.project_key) {
    return `Current scope: ${scope.workspaceKey || scope.workspace_key || 'workspace'} / ${scope.projectKey || scope.project_key || 'project'}.`;
  }
  if (scope.type === 'parent') return 'Current scope: parent linked-child scope.';
  if (scope.type === 'student') return 'Current scope: student-safe own-record scope.';
  if (scope.type === 'member') return 'Current scope: One Time member scope.';
  if (scope.type === 'classroom') return 'Current scope: One Time classroom scope.';
  if (scope.type === 'public') return 'Current scope: public visitor.';
  return 'Current scope: no private access.';
}

function renderEvidenceResponse(context = {}, evidence = {}) {
  const parts = [];

  if (context.helperRole === HELPER_ROLES.BNA_SUPER_ADMIN) {
    parts.push(scopeLabel(context));
    parts.push('');
  }

  const routes = resolvedRoutes(evidence);
  if (routes.length) {
    for (const route of routes) {
      parts.push(`${route.label || 'Open'}: ${route.url}`);
    }
  }

  const committed = committedActionResults(evidence);
  if (committed.length) {
    for (const result of committed) {
      parts.push(`${result.result_summary || 'Action completed.'} Result record: ${result.result_id}.`);
    }
  }

  const previews = (evidence.action_results || []).filter((result) => result.status === 'preview_prepared');
  for (const preview of previews) {
    parts.push(`${preview.result_summary || 'Preview prepared.'} It has not been saved yet.`);
  }

  const denials = evidence.denials || [];
  for (const denial of denials) {
    parts.push(`I cannot do that because ${denial.user_safe_reason || denial.reason_code || 'the current role or scope does not allow it'}.`);
    if (denial.repair?.status === 'created' && denial.repair?.repair_item_id) {
      parts.push(`Repair item: ${denial.repair.repair_item_id}.`);
    }
  }

  if (!parts.length) {
    parts.push('I could not find a resolver-backed route or typed action result for that request.');
  }

  return parts.join('\n');
}

function renderControlledResponse({ context = {}, evidence = {}, assistantDraft = '' } = {}) {
  const draft = String(assistantDraft || '').trim();
  if (draft) {
    const report = responseSafetyReport(draft, evidence);
    if (report.ok) {
      if (context.helperRole === HELPER_ROLES.BNA_SUPER_ADMIN && !draft.includes('Current scope:')) {
        return `${scopeLabel(context)}\n\n${draft}`;
      }
      return draft;
    }
  }
  return renderEvidenceResponse(context, evidence);
}

module.exports = {
  renderControlledResponse,
  renderEvidenceResponse,
  scopeLabel,
};
