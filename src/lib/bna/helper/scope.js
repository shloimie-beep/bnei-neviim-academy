const { clientSafetyPolicy, safetyPolicyForScope } = require('./safety');

function compactText(value = '', maxLength = 1000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeKey(value = '') {
  return compactText(value, 160).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function titleCaseName(value = '') {
  return compactText(value, 120)
    .replace(/@.*$/, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : '')
    .join(' ');
}

function displayPersonName(context = {}) {
  const identity = context.identity || {};
  const raw = identity.displayName
    || identity.display_name
    || identity.name
    || context.userDisplayName
    || context.user_display_name
    || context.userName
    || context.user_name
    || '';
  const name = titleCaseName(raw);
  if (!name || /^(admin|administrator|operations|operator|dashboard|bna helper)$/i.test(name)) return '';
  return name;
}

function possessiveHelperName(name = '', suffix = 'BNA Helper') {
  const clean = titleCaseName(name);
  if (!clean) return '';
  return `${clean}${/s$/i.test(clean) ? "'" : "'s"} ${suffix}`;
}

function workspaceDisplayName(context = {}) {
  const workspace = context.pageContext?.workspace || {};
  const name = workspace.displayName
    || workspace.display_name
    || context.workspaceDisplayName
    || context.workspace_display_name
    || context.project?.name
    || context.project?.short_name
    || '';
  const clean = compactText(name, 140);
  if (!clean || /^platform$/i.test(clean)) return '';
  return clean;
}

function roleFromContext(context = {}) {
  return normalizeKey(context.identity?.role || context.userRole || context.actor?.role || 'admin');
}

function scopeTypeFromContext(context = {}) {
  const role = roleFromContext(context);
  const identityScope = context.identity?.scope || {};
  const workspaceKey = normalizeKey(context.workspaceKey || context.workspace_key || context.pageContext?.workspace?.workspaceKey);
  const projectKey = normalizeKey(context.projectKey || context.project_key || context.pageContext?.workspace?.projectKey);
  const page = normalizeKey(context.pageContext?.page || context.pageContext?.surface);

  if (workspaceKey.includes('family') || workspaceKey.includes('household') || identityScope.type === 'family') return 'family';
  if (role.includes('student') || identityScope.type === 'student' || page === 'student') return 'student';
  if (role.includes('parent') || identityScope.type === 'parent' || page === 'parent') return 'parent';
  if (workspaceKey === 'rabbi_sheller_provider' || projectKey === 'one_time_mishnah_class') return 'rabbi';
  if (role.includes('provider') || identityScope.type === 'provider' || workspaceKey.includes('provider')) return 'provider';
  return 'admin';
}

function scopeIdFromContext(context = {}, scopeType = scopeTypeFromContext(context)) {
  const identityScope = context.identity?.scope || {};
  if (identityScope.id || identityScope.scopeId) return compactText(identityScope.id || identityScope.scopeId, 180);
  if (scopeType === 'student') return compactText(context.studentId || context.pageContext?.selectedRecord?.id || 'student', 180);
  if (scopeType === 'parent') return compactText(context.parentId || context.userName || 'parent', 180);
  if (scopeType === 'family') return compactText(context.familyId || context.workspaceKey || 'family', 180);
  if (scopeType === 'provider') return compactText(context.providerId || context.pageContext?.workspace?.providerId || context.workspaceKey || 'provider', 180);
  if (scopeType === 'rabbi') return 'one_time_mishnah_class';
  return compactText(context.workspaceKey || 'platform', 180);
}

function helperNameForScope(scopeType = 'admin', context = {}) {
  const person = displayPersonName(context);
  if (scopeType === 'rabbi' && person) return possessiveHelperName(person, 'One Time Helper');
  if (['admin', 'provider'].includes(scopeType) && person) return possessiveHelperName(person, scopeType === 'provider' ? 'Provider Helper' : 'BNA Helper');
  if (scopeType === 'parent' && person) return possessiveHelperName(person, 'Parent Helper');
  if (scopeType === 'student' && person) return possessiveHelperName(person, 'Student Helper');
  if (scopeType === 'family' && person) return possessiveHelperName(person, 'Family Helper');
  if (scopeType === 'rabbi') return 'Rabbi Scheller Helper';
  if (scopeType === 'provider') return workspaceDisplayName(context) ? `${workspaceDisplayName(context)} Provider Helper` : 'Provider Helper';
  if (scopeType === 'parent') return 'Parent Helper';
  if (scopeType === 'student') return 'Student Helper';
  if (scopeType === 'family') return 'Family Helper';
  return workspaceDisplayName(context) ? `${workspaceDisplayName(context)} Helper` : 'BNA Operations Helper';
}

function toneProfileForScope(scopeType = 'admin') {
  if (scopeType === 'student') return {
    displayTone: 'simple, safe, encouraging, and age-appropriate',
    communicationStyle: { pace: 'short', formality: 'friendly', audience: 'student' },
  };
  if (scopeType === 'parent') return {
    displayTone: 'warm, clear, respectful, and practical',
    communicationStyle: { pace: 'clear', formality: 'professional-warm', audience: 'parent' },
  };
  if (scopeType === 'rabbi') return {
    displayTone: 'professional, warm, Torah-centered, and draft-first',
    communicationStyle: { pace: 'concise', formality: 'respectful', audience: 'Rabbi/provider' },
  };
  if (scopeType === 'provider') return {
    displayTone: 'professional, useful, brand-aware, and scope-aware',
    communicationStyle: { pace: 'concise', formality: 'professional', audience: 'provider' },
  };
  if (scopeType === 'family') return {
    displayTone: 'warm, practical, accountability-focused, and parent-safe',
    communicationStyle: { pace: 'clear', formality: 'family-practical', audience: 'family' },
  };
  return {
    displayTone: 'direct, high-signal, operational, and plainspoken',
    communicationStyle: { pace: 'fast', formality: 'operator-direct', audience: 'admin' },
  };
}

function knowledgeSourcesForScope(scopeType = 'admin') {
  if (scopeType === 'student') {
    return ['student profile', 'student-visible goals', 'assignments', 'calendar', 'worksheets', 'student-visible questions'];
  }
  if (scopeType === 'parent') {
    return ['family profile', 'parent-visible student progress', 'parent requests', 'payment status when allowed', 'support tickets'];
  }
  if (scopeType === 'rabbi') {
    return ['One Time workspace', 'Rabbi class media', 'source sheets', 'student question queue', 'library drafts', 'launch checklist'];
  }
  if (scopeType === 'provider') {
    return ['provider profile', 'brand kit', 'provider assets', 'offers', 'leads', 'provider integrations', 'workspace tasks'];
  }
  if (scopeType === 'family') {
    return ['family routines', 'home goals', 'parent notes', 'child progress summaries', 'support tasks'];
  }
  return ['BNA memory', 'Operations tasks', 'decisions', 'pending blockers', 'students', 'content', 'contacts', 'accounting', 'integrations', 'system state'];
}

function visibleDataFiltersForScope(scopeType = 'admin', context = {}) {
  const base = {
    workspaceKey: context.workspaceKey || null,
    projectKey: context.projectKey || null,
  };
  if (scopeType === 'student') return { ...base, studentId: context.studentId || context.pageContext?.selectedRecord?.id || null, studentSafeOnly: true };
  if (scopeType === 'parent') return { ...base, parentId: context.parentId || null, familyOnly: true, parentVisibleOnly: true };
  if (scopeType === 'provider' || scopeType === 'rabbi') return { ...base, providerId: context.providerId || context.pageContext?.workspace?.providerId || null, providerOnly: true };
  if (scopeType === 'family') return { ...base, familyId: context.familyId || null, familyOnly: true };
  return { ...base, adminAllScope: true };
}

function suggestedActionsForScope(scopeType = 'admin') {
  if (scopeType === 'student') return ['Show my assignments', 'Explain this goal', 'Ask for help'];
  if (scopeType === 'parent') return ['Show child progress', 'Ask a question', 'Update helper preferences'];
  if (scopeType === 'rabbi') return ['Create class calendar draft', 'Draft parent update', 'Create Codex task'];
  if (scopeType === 'provider') return ['Update provider profile', 'Create offer draft', 'Show integration status'];
  if (scopeType === 'family') return ['Create family goal', 'Summarize child progress', 'Ask support'];
  return ['Create task', 'Create decision', 'Check integrations', 'Show Codex queue'];
}

function resolveHelperScope(context = {}) {
  const scopeType = scopeTypeFromContext(context);
  const scopeId = scopeIdFromContext(context, scopeType);
  const tone = toneProfileForScope(scopeType);
  const visibleDataFilters = visibleDataFiltersForScope(scopeType, context);
  const safety = safetyPolicyForScope({ scopeType, scopeId, visibleDataFilters });
  return {
    scopeType,
    scopeId,
    helperName: helperNameForScope(scopeType, context),
    workspaceKey: context.workspaceKey || null,
    projectKey: context.projectKey || null,
    role: roleFromContext(context),
    knowledgeSources: knowledgeSourcesForScope(scopeType),
    toneProfile: tone,
    displayTone: tone.displayTone,
    safetyPolicy: clientSafetyPolicy(safety),
    visibleDataFilters,
    suggestedActions: suggestedActionsForScope(scopeType),
    accessSummary: compactText(`${helperNameForScope(scopeType, context)} can use ${knowledgeSourcesForScope(scopeType).slice(0, 4).join(', ')} in this scope.`),
  };
}

module.exports = {
  helperNameForScope,
  knowledgeSourcesForScope,
  resolveHelperScope,
  scopeIdFromContext,
  scopeTypeFromContext,
  suggestedActionsForScope,
  toneProfileForScope,
  visibleDataFiltersForScope,
};
