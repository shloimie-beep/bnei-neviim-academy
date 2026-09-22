const DEFAULT_FORBIDDEN_GROUP_ALIASES = {
  payments: ['payments', 'payments_access'],
  payments_access: ['payments', 'payments_access'],
  communications_send: ['communications', 'communications_send'],
  settings: ['settings', 'provider_setup'],
  super_admin_diagnostics: ['super_admin_diagnostics', 'agent_ops', 'global_admin'],
  agent_fleet: ['agent_fleet', 'agent_ops'],
};

function normalizeKey(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeList(values = []) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(normalizeKey).filter(Boolean))];
}

function normalizeToolList(values = []) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort();
}

function contractToolId(contract = {}) {
  return String(contract.source?.helper_tool_name || contract.rabbi_contract?.capability_slug || '').trim();
}

function contractGroups(contract = {}) {
  return normalizeList(contract.rabbi_contract?.capability_groups || []);
}

function contractActionPolicy(contract = {}) {
  return normalizeKey(contract.rabbi_contract?.action_policy || '');
}

function forbiddenGroupAliases(group, aliasMap = DEFAULT_FORBIDDEN_GROUP_ALIASES) {
  const normalized = normalizeKey(group);
  return normalizeList(aliasMap[normalized] || [normalized]);
}

function hasForbiddenGroup(groups, forbiddenGroups, aliasMap = DEFAULT_FORBIDDEN_GROUP_ALIASES) {
  const groupSet = new Set(groups);
  return forbiddenGroups.find((forbiddenGroup) => {
    return forbiddenGroupAliases(forbiddenGroup, aliasMap).some((alias) => groupSet.has(alias));
  }) || '';
}

function scopeMapDefaults(scopeMap = {}) {
  const target = scopeMap.target_account || {};
  const contractLock = (scopeMap.contracts || []).find((contract) => contract.rabbi_contract?.scope_lock)?.rabbi_contract?.scope_lock || {};
  return {
    workspace_key: target.workspace_key || contractLock.workspace_key || '',
    project_key: target.project_key || contractLock.project_key || '',
    provider_scope: contractLock.provider_scope || target.provider_scope || '',
  };
}

function mergeAccountTemplateDefaults(template = {}, account = {}, scopeMap = {}) {
  const invariantPolicy = template.default_invariants?.external_writes || '';
  const mapDefaults = scopeMapDefaults(scopeMap);
  return {
    ...account,
    external_approval_policy: account.external_approval_policy || invariantPolicy || 'blocked_until_explicit_approval',
    workspace_key: account.workspace_key || template.workspace_key || mapDefaults.workspace_key,
    project_key: account.project_key || template.project_key || mapDefaults.project_key,
    provider_scope: account.provider_scope || template.provider_scope || mapDefaults.provider_scope,
  };
}

function requiredFieldStatus(template = {}, provisionedScope = {}) {
  const missing = [];
  const required = Array.isArray(template.required_fields) ? template.required_fields : [];
  for (const field of required) {
    const value = provisionedScope[field];
    if (Array.isArray(value) && value.length === 0) missing.push(field);
    else if (!Array.isArray(value) && (value === undefined || value === null || value === '')) missing.push(field);
  }
  return missing;
}

function evaluateContract(contract, account) {
  const toolId = contractToolId(contract);
  const groups = contractGroups(contract);
  const actionPolicy = contractActionPolicy(contract);
  const allowedSurfaceGroups = normalizeList(account.allowed_surface_groups || []);
  const allowedActionPolicies = normalizeList(account.allowed_action_policies || []);
  const forbiddenSurfaceGroups = normalizeList(account.forbidden_surface_groups || []);
  const explicitAllowedTools = normalizeToolList(account.allowed_tool_ids || []);
  const explicitForbiddenTools = normalizeToolList(account.forbidden_tool_ids || []);
  const reasons = [];

  if (!toolId) {
    reasons.push('missing_tool_id');
  }

  if (allowedSurfaceGroups.length > 0 && !groups.some((group) => allowedSurfaceGroups.includes(group))) {
    reasons.push(`capability_group_not_allowed:${groups.join(',') || 'none'}`);
  }

  const forbiddenGroup = hasForbiddenGroup(groups, forbiddenSurfaceGroups);
  if (forbiddenGroup) {
    reasons.push(`forbidden_surface_group:${forbiddenGroup}`);
  }

  if (allowedActionPolicies.length > 0 && actionPolicy && !allowedActionPolicies.includes(actionPolicy)) {
    reasons.push(`action_policy_not_allowed:${actionPolicy}`);
  }

  if (explicitAllowedTools.length > 0 && !explicitAllowedTools.includes(toolId)) {
    reasons.push('not_in_explicit_allowed_tool_ids');
  }

  if (explicitForbiddenTools.includes(toolId)) {
    reasons.push('explicitly_forbidden_tool_id');
  }

  return {
    action_policy: actionPolicy,
    allowed: reasons.length === 0,
    capability_groups: groups,
    contract_id: contract.id || '',
    reasons,
    tool_id: toolId,
  };
}

function provisionAccountBotScope({ template, scopeMap, account, generatedAt } = {}) {
  if (!template || typeof template !== 'object') throw new Error('template is required');
  if (!scopeMap || !Array.isArray(scopeMap.contracts)) throw new Error('scopeMap.contracts is required');
  if (!account || typeof account !== 'object') throw new Error('account is required');

  const resolvedAccount = mergeAccountTemplateDefaults(template, account, scopeMap);
  const evaluatedContracts = scopeMap.contracts.map((contract) => evaluateContract(contract, resolvedAccount));
  const decisionsByTool = new Map();

  for (const decision of evaluatedContracts) {
    if (!decision.tool_id) continue;
    if (!decisionsByTool.has(decision.tool_id)) {
      decisionsByTool.set(decision.tool_id, { allowed_contracts: [], denied_contracts: [] });
    }
    const bucket = decisionsByTool.get(decision.tool_id);
    if (decision.allowed) bucket.allowed_contracts.push(decision);
    else bucket.denied_contracts.push(decision);
  }

  const allowedToolIds = [];
  const forbiddenToolIds = [];
  for (const [toolId, decision] of decisionsByTool.entries()) {
    if (decision.allowed_contracts.length > 0 && decision.denied_contracts.length === 0) {
      allowedToolIds.push(toolId);
    } else {
      forbiddenToolIds.push(toolId);
    }
  }

  const scopeLock = {
    workspace_key: resolvedAccount.workspace_key,
    project_key: resolvedAccount.project_key,
    provider_scope: resolvedAccount.provider_scope,
    server_recomputes_scope: true,
    client_scope_trusted: false,
    cross_workspace_allowed: false,
  };

  const provisionedScope = {
    schema_version: template.schema_version || 1,
    template_key: template.template_key,
    account_key: resolvedAccount.account_key || '',
    account_display_name: resolvedAccount.account_display_name || '',
    workspace_key: resolvedAccount.workspace_key || '',
    project_key: resolvedAccount.project_key || '',
    provider_scope: resolvedAccount.provider_scope || '',
    allowed_surface_groups: normalizeList(resolvedAccount.allowed_surface_groups || []),
    allowed_action_policies: normalizeList(resolvedAccount.allowed_action_policies || []),
    forbidden_surface_groups: normalizeList(resolvedAccount.forbidden_surface_groups || []),
    allowed_tool_ids: allowedToolIds.sort(),
    forbidden_tool_ids: forbiddenToolIds.sort(),
    denied_contracts: evaluatedContracts.filter((decision) => !decision.allowed && decision.tool_id),
    external_approval_policy: resolvedAccount.external_approval_policy,
    default_invariants: template.default_invariants || {},
    natural_language_rule: resolvedAccount.natural_language_rule || template.natural_language_rule || '',
    scope_lock: scopeLock,
    generated_at: generatedAt || new Date().toISOString(),
  };

  provisionedScope.missing_required_fields = requiredFieldStatus(template, provisionedScope);
  return provisionedScope;
}

function provisionTemplateExample({ template, scopeMap, accountKey, generatedAt } = {}) {
  if (!template || !Array.isArray(template.subaccount_examples)) {
    throw new Error('template.subaccount_examples is required');
  }
  const account = template.subaccount_examples.find((example) => example.account_key === accountKey);
  if (!account) throw new Error(`subaccount example not found: ${accountKey}`);
  return provisionAccountBotScope({ template, scopeMap, account, generatedAt });
}

function accountScopeFromContext(context = {}) {
  return (
    context.accountBotScope ||
    context.account_bot_scope ||
    context.helperAccountScope ||
    context.helper_account_scope ||
    context.identity?.accountBotScope ||
    context.identity?.account_bot_scope ||
    context.identity?.helperAccountScope ||
    context.identity?.helper_account_scope ||
    null
  );
}

function helperAccountScopePermission(tool, context = {}) {
  const scope = accountScopeFromContext(context);
  if (!scope) return { applies: false, allowed: true };
  const toolId = String(tool?.name || tool?.id || '').trim();
  if (!toolId) return { applies: true, allowed: false, reason: 'account_scope_tool_not_found' };

  const allowed = normalizeToolList(scope.allowed_tool_ids || []);
  const forbidden = normalizeToolList(scope.forbidden_tool_ids || []);

  if (forbidden.includes(toolId)) {
    return { applies: true, allowed: false, reason: 'permission_denied: account scope forbids tool' };
  }
  if (allowed.length === 0) {
    return { applies: true, allowed: false, reason: 'permission_denied: account scope has no allowed tools' };
  }
  if (!allowed.includes(toolId)) {
    return { applies: true, allowed: false, reason: 'permission_denied: account scope does not allow tool' };
  }
  return { applies: true, allowed: true };
}

module.exports = {
  DEFAULT_FORBIDDEN_GROUP_ALIASES,
  accountScopeFromContext,
  contractToolId,
  evaluateContract,
  helperAccountScopePermission,
  provisionAccountBotScope,
  provisionTemplateExample,
};
