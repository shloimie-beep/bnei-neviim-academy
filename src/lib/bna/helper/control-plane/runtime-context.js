'use strict';

const crypto = require('crypto');

const { sanitizeHelperPageContext } = require('../context');
const {
  normalizeProjectKey,
  normalizeWorkspaceKey,
} = require('../permissions');

const HELPER_ROLES = Object.freeze({
  PUBLIC_VISITOR: 'public_visitor',
  BNA_SUPER_ADMIN: 'bna_super_admin',
  RABBI_PROVIDER_ADMIN: 'rabbi_provider_admin',
  PROVIDER_STAFF_PARTICIPANT: 'provider_staff_participant',
  PARENT: 'parent',
  STUDENT: 'student',
  ONE_TIME_MEMBER: 'one_time_member',
  ONE_TIME_CLASSROOM_MEMBER: 'one_time_classroom_member',
  WRONG_ROLE_EXPIRED: 'wrong_role_expired',
});

const AUTH_STATUSES = Object.freeze({
  ANONYMOUS: 'anonymous',
  AUTHENTICATED: 'authenticated',
  EXPIRED: 'expired',
  WRONG_ROLE: 'wrong_role',
});

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';

const ROLE_CAPABILITIES = Object.freeze({
  [HELPER_ROLES.PUBLIC_VISITOR]: [
    'public.read',
    'auth.login',
    'helper.route.resolve_public',
    'helper.response.public_only',
  ],
  [HELPER_ROLES.BNA_SUPER_ADMIN]: [
    'operations.read',
    'operations.switch_workspace',
    'operations.agent_review.read',
    'operations.agent_review.write',
    'helper.route.resolve',
    'helper.action.preview',
    'helper.action.execute',
    'helper.repair.create',
    'helper.usage.read',
  ],
  [HELPER_ROLES.RABBI_PROVIDER_ADMIN]: [
    'provider.read',
    'provider.admin.read',
    'provider.admin.write_safe',
    'one_time.project.read',
    'helper.route.resolve',
    'helper.action.preview',
    'helper.action.execute_safe',
    'helper.repair.create',
  ],
  [HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT]: [
    'provider.read_safe',
    'provider.participant.read_own',
    'provider.support.create',
    'helper.route.resolve',
    'helper.action.preview',
    'helper.action.execute_safe',
  ],
  [HELPER_ROLES.PARENT]: [
    'parent.read_linked_children',
    'parent.support.create',
    'helper.route.resolve',
    'helper.action.preview',
    'helper.action.execute_safe',
  ],
  [HELPER_ROLES.STUDENT]: [
    'student.read_own_safe',
    'student.support.create',
    'helper.route.resolve',
    'helper.action.preview',
  ],
  [HELPER_ROLES.ONE_TIME_MEMBER]: [
    'one_time.member.read_own',
    'one_time.member.question.create',
    'one_time.member.support.create',
    'helper.route.resolve',
    'helper.action.preview',
    'helper.action.execute_safe',
  ],
  [HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER]: [
    'one_time.classroom.read',
    'one_time.member.question.create',
    'one_time.member.support.create',
    'helper.route.resolve',
    'helper.action.preview',
    'helper.action.execute_safe',
  ],
  [HELPER_ROLES.WRONG_ROLE_EXPIRED]: [
    'auth.login',
    'auth.account_switch',
    'helper.route.resolve_public',
  ],
});

const ADMIN_ROLE_SET = new Set([
  'super_admin',
  'platform_manager',
  'support_admin',
  'technical_agent',
  'admin',
  'bna_admin',
  'school_manager',
  'operator',
  'system',
]);

const PROVIDER_ROLE_SET = new Set([
  'provider_admin',
  'provider_manager',
  'provider_staff',
  'participant',
  'service_provider',
  'workspace_owner',
  'one_time_admin',
  'project_owner',
  'member',
  'classroom_member',
]);

function compactText(value = '', max = 500) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeList(value) {
  return Array.isArray(value) ? value.filter((item) => item !== undefined && item !== null) : [];
}

function stableRequestId(prefix = 'helper_req') {
  if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

function normalizeRoleName(value = '') {
  const normalized = compactText(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (['guest', 'anonymous', 'anonymous_public', 'public'].includes(normalized)) return 'guest';
  if (['owner', 'platform_admin'].includes(normalized)) return 'super_admin';
  if (['provider', 'service_provider', 'service_provider_admin', 'project_owner', 'one_time_admin', 'workspace_owner'].includes(normalized)) return 'provider_admin';
  if (['member_parent', 'member'].includes(normalized)) return 'member';
  return normalized || 'guest';
}

function inferAuthStatus(input = {}) {
  const explicit = compactText(input.authStatus || input.auth_status || '', 40).toLowerCase();
  if (['expired', 'wrong_role', 'anonymous', 'authenticated'].includes(explicit)) return explicit;
  const identity = safeObject(input.identity || input.actor || {});
  if (input.expiredSession || identity.expired || input.sessionExpired) return AUTH_STATUSES.EXPIRED;
  if (input.wrongRole || identity.wrong_role) return AUTH_STATUSES.WRONG_ROLE;
  if (identity.user_id || identity.userId || identity.username || identity.id || identity.role || input.userRole) return AUTH_STATUSES.AUTHENTICATED;
  return AUTH_STATUSES.ANONYMOUS;
}

function inferRole(input = {}) {
  const authStatus = inferAuthStatus(input);
  if (authStatus === AUTH_STATUSES.EXPIRED || authStatus === AUTH_STATUSES.WRONG_ROLE) {
    return HELPER_ROLES.WRONG_ROLE_EXPIRED;
  }

  const identity = safeObject(input.identity || input.actor || {});
  const scope = safeObject(identity.scope || input.scope || {});
  const pageContext = safeObject(input.pageContext || input.page_context || {});
  const route = compactText(pageContext.route || pageContext.path || input.currentPath || input.current_path || '', 300).toLowerCase();
  const role = normalizeRoleName(identity.role || input.userRole || input.user_role || pageContext.actor?.role || '');
  const scopeType = compactText(scope.type || input.scopeType || input.scope_type || '', 80).toLowerCase();
  const workspaceKey = normalizeWorkspaceKey(
    input.workspaceKey ||
    input.workspace_key ||
    scope.workspaceKey ||
    scope.workspace_key ||
    pageContext.workspace?.workspaceKey ||
    pageContext.workspace?.workspace_key ||
    ''
  );
  const projectKey = normalizeProjectKey(
    input.projectKey ||
    input.project_key ||
    scope.projectKey ||
    scope.project_key ||
    pageContext.workspace?.projectKey ||
    pageContext.workspace?.project_key ||
    ''
  );

  if (role === 'guest' || authStatus === AUTH_STATUSES.ANONYMOUS) return HELPER_ROLES.PUBLIC_VISITOR;
  if (role === 'parent' || scopeType === 'parent' || scopeType === 'family') return HELPER_ROLES.PARENT;
  if (role === 'student' || scopeType === 'student') return HELPER_ROLES.STUDENT;

  if (scopeType === 'classroom' || role === 'classroom_member' || route.includes('one-time-classroom')) {
    return HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER;
  }

  if (
    scopeType === 'member' ||
    role === 'member' ||
    route.includes('rabbi-member') ||
    route.includes('member-library')
  ) {
    return HELPER_ROLES.ONE_TIME_MEMBER;
  }

  if (role === 'super_admin' || scopeType === 'all') return HELPER_ROLES.BNA_SUPER_ADMIN;

  if (
    ['provider_admin', 'provider_manager'].includes(role) ||
    (PROVIDER_ROLE_SET.has(role) && projectKey === ONE_TIME_PROJECT_KEY) ||
    workspaceKey === ONE_TIME_WORKSPACE_KEY
  ) {
    return HELPER_ROLES.RABBI_PROVIDER_ADMIN;
  }

  if (PROVIDER_ROLE_SET.has(role)) return HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT;

  if (ADMIN_ROLE_SET.has(role)) return HELPER_ROLES.BNA_SUPER_ADMIN;

  return HELPER_ROLES.WRONG_ROLE_EXPIRED;
}

function normalizeLinkedChildIds(input = {}) {
  const identity = safeObject(input.identity || input.actor || {});
  const scope = safeObject(identity.scope || input.scope || {});
  return safeList(
    input.linkedChildIds ||
    input.linked_child_ids ||
    scope.linkedChildIds ||
    scope.linked_child_ids ||
    identity.linkedChildIds ||
    identity.linked_child_ids ||
    []
  ).map((item) => String(item));
}

function buildEffectiveScope(input = {}, helperRole = inferRole(input)) {
  const identity = safeObject(input.identity || input.actor || {});
  const scope = safeObject(identity.scope || input.scope || {});
  const pageContext = sanitizeHelperPageContext(input.pageContext || input.page_context || {});
  const workspaceKey = normalizeWorkspaceKey(
    input.workspaceKey ||
    input.workspace_key ||
    scope.workspaceKey ||
    scope.workspace_key ||
    pageContext.workspace?.workspaceKey ||
    pageContext.workspace?.workspace_key ||
    ''
  );
  const projectKey = normalizeProjectKey(
    input.projectKey ||
    input.project_key ||
    scope.projectKey ||
    scope.project_key ||
    pageContext.workspace?.projectKey ||
    pageContext.workspace?.project_key ||
    ''
  );

  if (helperRole === HELPER_ROLES.WRONG_ROLE_EXPIRED) {
    return {
      type: 'none',
      reason: inferAuthStatus(input) === AUTH_STATUSES.EXPIRED ? 'expired_session' : 'wrong_role',
    };
  }

  if (helperRole === HELPER_ROLES.PUBLIC_VISITOR) {
    return {
      type: 'public',
      workspaceKey: 'public',
      workspace_key: 'public',
      projectKey: 'bna_public',
      project_key: 'bna_public',
    };
  }

  if (helperRole === HELPER_ROLES.BNA_SUPER_ADMIN) {
    if (scope.type === 'all' || input.allScope) {
      return {
        type: 'all',
        workspaceKey: workspaceKey || 'bna',
        workspace_key: workspaceKey || 'bna',
        projectKey: projectKey || 'bna',
        project_key: projectKey || 'bna',
      };
    }
    return {
      type: 'project',
      workspaceKey: workspaceKey || 'bna',
      workspace_key: workspaceKey || 'bna',
      projectKey: projectKey || 'bna',
      project_key: projectKey || 'bna',
      selectedBy: input.selectedBy || input.selected_by || 'runtime_context',
    };
  }

  if (helperRole === HELPER_ROLES.RABBI_PROVIDER_ADMIN || helperRole === HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT) {
    return {
      type: scope.type || 'project',
      workspaceKey: workspaceKey || ONE_TIME_WORKSPACE_KEY,
      workspace_key: workspaceKey || ONE_TIME_WORKSPACE_KEY,
      projectKey: projectKey || ONE_TIME_PROJECT_KEY,
      project_key: projectKey || ONE_TIME_PROJECT_KEY,
      providerId: input.providerId || input.provider_id || scope.providerId || scope.provider_id || null,
      provider_id: input.providerId || input.provider_id || scope.providerId || scope.provider_id || null,
    };
  }

  if (helperRole === HELPER_ROLES.PARENT) {
    return {
      type: 'parent',
      parentId: input.parentId || input.parent_id || scope.parentId || scope.parent_id || identity.user_id || identity.userId || null,
      parent_id: input.parentId || input.parent_id || scope.parentId || scope.parent_id || identity.user_id || identity.userId || null,
      familyId: input.familyId || input.family_id || scope.familyId || scope.family_id || null,
      family_id: input.familyId || input.family_id || scope.familyId || scope.family_id || null,
      linkedChildIds: normalizeLinkedChildIds(input),
      linked_child_ids: normalizeLinkedChildIds(input),
      workspaceKey: 'bna',
      workspace_key: 'bna',
      projectKey: 'bna',
      project_key: 'bna',
    };
  }

  if (helperRole === HELPER_ROLES.STUDENT) {
    return {
      type: 'student',
      studentId: input.studentId || input.student_id || scope.studentId || scope.student_id || identity.user_id || identity.userId || null,
      student_id: input.studentId || input.student_id || scope.studentId || scope.student_id || identity.user_id || identity.userId || null,
      workspaceKey: 'bna',
      workspace_key: 'bna',
      projectKey: 'bna',
      project_key: 'bna',
    };
  }

  if (helperRole === HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER) {
    return {
      type: 'classroom',
      workspaceKey: workspaceKey || ONE_TIME_WORKSPACE_KEY,
      workspace_key: workspaceKey || ONE_TIME_WORKSPACE_KEY,
      projectKey: projectKey || ONE_TIME_PROJECT_KEY,
      project_key: projectKey || ONE_TIME_PROJECT_KEY,
      memberId: input.memberId || input.member_id || scope.memberId || scope.member_id || identity.user_id || identity.userId || null,
      member_id: input.memberId || input.member_id || scope.memberId || scope.member_id || identity.user_id || identity.userId || null,
      classroomId: input.classroomId || input.classroom_id || scope.classroomId || scope.classroom_id || null,
      classroom_id: input.classroomId || input.classroom_id || scope.classroomId || scope.classroom_id || null,
    };
  }

  if (helperRole === HELPER_ROLES.ONE_TIME_MEMBER) {
    return {
      type: 'member',
      workspaceKey: workspaceKey || ONE_TIME_WORKSPACE_KEY,
      workspace_key: workspaceKey || ONE_TIME_WORKSPACE_KEY,
      projectKey: projectKey || ONE_TIME_PROJECT_KEY,
      project_key: projectKey || ONE_TIME_PROJECT_KEY,
      memberId: input.memberId || input.member_id || scope.memberId || scope.member_id || identity.user_id || identity.userId || null,
      member_id: input.memberId || input.member_id || scope.memberId || scope.member_id || identity.user_id || identity.userId || null,
    };
  }

  return {
    type: 'none',
    reason: 'wrong_role',
  };
}

function capabilitiesForRole(helperRole) {
  return [...(ROLE_CAPABILITIES[helperRole] || ROLE_CAPABILITIES[HELPER_ROLES.WRONG_ROLE_EXPIRED])];
}

function hasCapability(context, capability) {
  return Array.isArray(context?.capabilities) && context.capabilities.includes(capability);
}

function isOneTimeContext(context = {}) {
  const scope = context.effectiveScope || context.scope || {};
  const projectKey = normalizeProjectKey(scope.projectKey || scope.project_key || context.projectKey || context.project_key || '');
  const workspaceKey = normalizeWorkspaceKey(scope.workspaceKey || scope.workspace_key || context.workspaceKey || context.workspace_key || '');
  return (
    context.helperRole === HELPER_ROLES.ONE_TIME_MEMBER ||
    context.helperRole === HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER ||
    context.helperRole === HELPER_ROLES.RABBI_PROVIDER_ADMIN ||
    projectKey === ONE_TIME_PROJECT_KEY ||
    workspaceKey === ONE_TIME_WORKSPACE_KEY ||
    hasCapability(context, 'one_time.member.read_own') ||
    hasCapability(context, 'one_time.classroom.read') ||
    hasCapability(context, 'one_time.project.read')
  );
}

function registryContextFromRuntime(context = {}) {
  const scope = context.effectiveScope || {};
  const roleForRegistry = (() => {
    if (context.helperRole === HELPER_ROLES.PUBLIC_VISITOR) return 'guest';
    if (context.helperRole === HELPER_ROLES.BNA_SUPER_ADMIN) return 'super_admin';
    if (context.helperRole === HELPER_ROLES.RABBI_PROVIDER_ADMIN) return 'provider_admin';
    if (context.helperRole === HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT) return 'participant';
    if (context.helperRole === HELPER_ROLES.PARENT) return 'parent';
    if (context.helperRole === HELPER_ROLES.STUDENT) return 'student';
    if (context.helperRole === HELPER_ROLES.ONE_TIME_MEMBER) return 'member';
    if (context.helperRole === HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER) return 'member';
    return 'guest';
  })();

  return {
    req: context.req || null,
    userName: context.actor?.displayName || context.actor?.id || 'BNA Helper',
    userRole: roleForRegistry,
    workspaceKey: scope.workspaceKey || scope.workspace_key || context.workspaceKey || 'bna',
    workspace_key: scope.workspaceKey || scope.workspace_key || context.workspaceKey || 'bna',
    projectKey: scope.projectKey || scope.project_key || context.projectKey || 'bna',
    project_key: scope.projectKey || scope.project_key || context.projectKey || 'bna',
    providerId: scope.providerId || scope.provider_id || context.providerId || null,
    studentId: scope.studentId || scope.student_id || context.studentId || null,
    parentId: scope.parentId || scope.parent_id || context.parentId || null,
    helperScope: {
      scopeType: scope.type || 'none',
      workspaceKey: scope.workspaceKey || scope.workspace_key || null,
      projectKey: scope.projectKey || scope.project_key || null,
    },
    identity: {
      role: roleForRegistry,
      username: context.actor?.id || context.actor?.displayName || 'helper',
      scope,
    },
    pageContext: context.pageContext || {},
    selectedRecord: context.pageContext?.selectedRecord || null,
  };
}

function redactedForModel(context = {}) {
  const scope = context.effectiveScope || {};
  return {
    requestId: context.requestId,
    helperRole: context.helperRole,
    authStatus: context.authStatus,
    portal: context.portal,
    actor: {
      authenticated: Boolean(context.actor?.isAuthenticated),
      role: context.actor?.role || null,
    },
    effectiveScope: {
      type: scope.type,
      reason: scope.reason || null,
      workspaceKey: scope.workspaceKey || scope.workspace_key || null,
      projectKey: scope.projectKey || scope.project_key || null,
      linkedChildCount: Array.isArray(scope.linkedChildIds || scope.linked_child_ids)
        ? (scope.linkedChildIds || scope.linked_child_ids).length
        : undefined,
      hasStudentId: Boolean(scope.studentId || scope.student_id),
      hasParentId: Boolean(scope.parentId || scope.parent_id),
      hasMemberId: Boolean(scope.memberId || scope.member_id),
      hasClassroomId: Boolean(scope.classroomId || scope.classroom_id),
    },
    capabilities: context.capabilities || [],
    routeContext: {
      route: context.pageContext?.route || null,
      page: context.pageContext?.page || null,
      view: context.pageContext?.view || null,
      section: context.pageContext?.visibleSection || null,
    },
    restrictions: context.restrictions || [],
  };
}

function restrictionsForRole(helperRole) {
  if (helperRole === HELPER_ROLES.PUBLIC_VISITOR) {
    return [
      'Public visitors may receive public routes only.',
      'Do not expose private portal links, private records, support internals, or Operations routes.',
    ];
  }
  if (helperRole === HELPER_ROLES.BNA_SUPER_ADMIN) {
    return [
      'Super-admin responses that discuss private data must state the current effective scope.',
      'Workspace-scoped actions must use the selected workspace/project scope explicitly.',
    ];
  }
  if (helperRole === HELPER_ROLES.PARENT) {
    return [
      'Parent scope may access linked children only.',
      'Do not expose unlinked students, provider admin pages, or staff notes.',
    ];
  }
  if (helperRole === HELPER_ROLES.STUDENT) {
    return [
      'Student scope may access own student-safe data only.',
      'Do not expose billing, parent-only data, staff notes, or other students.',
    ];
  }
  if (helperRole === HELPER_ROLES.RABBI_PROVIDER_ADMIN || helperRole === HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT) {
    return [
      'Provider scope is limited to its own workspace/project.',
      'Do not expose other providers, parent-only pages, unrelated BNA records, or unrestricted One Time records.',
    ];
  }
  if (helperRole === HELPER_ROLES.ONE_TIME_MEMBER || helperRole === HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER) {
    return [
      'One Time scope is limited to the member/classroom relationship.',
      'Do not expose BNA school records, raw recordings, provider admin notes, or other members.',
    ];
  }
  return [
    'Expired or wrong-role sessions may receive login/account-switch/support routes only.',
    'Do not expose private data or private destination existence.',
  ];
}

function buildRuntimeContext(input = {}) {
  const authStatus = inferAuthStatus(input);
  const helperRole = inferRole(input);
  const effectiveScope = buildEffectiveScope(input, helperRole);
  const pageContext = sanitizeHelperPageContext(input.pageContext || input.page_context || {});
  const capabilities = capabilitiesForRole(helperRole);
  const identity = safeObject(input.identity || input.actor || {});
  const actorId = compactText(identity.user_id || identity.userId || identity.username || identity.id || input.userId || input.user_id || '', 160) || null;
  const context = {
    requestId: input.requestId || input.request_id || stableRequestId(),
    sessionId: input.sessionId || input.session_id || input.req?.sessionID || null,
    conversationId: input.conversationId || input.conversation_id || null,
    now: input.now || new Date().toISOString(),
    portal: input.portal || pageContext.page || portalFromRoute(pageContext.route || input.currentPath || ''),
    authStatus,
    helperRole,
    actor: {
      id: actorId,
      displayName: compactText(identity.displayName || identity.name || identity.username || actorId || '', 160),
      isAuthenticated: authStatus === AUTH_STATUSES.AUTHENTICATED,
      role: normalizeRoleName(identity.role || input.userRole || input.user_role || ''),
    },
    effectiveScope,
    capabilities,
    pageContext,
    req: input.req || null,
    featureFlags: safeObject(input.featureFlags || input.feature_flags),
    safety: {
      privateDataAllowed: ![HELPER_ROLES.PUBLIC_VISITOR, HELPER_ROLES.WRONG_ROLE_EXPIRED].includes(helperRole),
      allowActionExecution: capabilities.some((capability) => capability.startsWith('helper.action.execute')),
      crossWorkspaceAllowed: helperRole === HELPER_ROLES.BNA_SUPER_ADMIN,
      oneTimeContextAllowed: false,
    },
    restrictions: restrictionsForRole(helperRole),
  };
  context.safety.oneTimeContextAllowed = isOneTimeContext(context);
  context.registryContext = registryContextFromRuntime(context);
  context.redactedForModel = () => redactedForModel(context);
  return context;
}

function portalFromRoute(route = '') {
  const path = compactText(route, 300).toLowerCase();
  if (path.startsWith('/operations')) return 'operations';
  if (path.startsWith('/provider')) return 'provider';
  if (path.startsWith('/parent')) return 'parent';
  if (path.startsWith('/student')) return 'student';
  if (path.includes('rabbi-member') || path.includes('member-library')) return 'one_time_member';
  if (path.includes('one-time-classroom')) return 'one_time_classroom';
  if (path.includes('one-time') || path.includes('/rabbi')) return 'one_time_public';
  return 'public';
}

module.exports = {
  AUTH_STATUSES,
  HELPER_ROLES,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  buildEffectiveScope,
  buildRuntimeContext,
  capabilitiesForRole,
  compactText,
  hasCapability,
  inferAuthStatus,
  inferRole,
  isOneTimeContext,
  normalizeRoleName,
  redactedForModel,
  registryContextFromRuntime,
  restrictionsForRole,
  stableRequestId,
};
