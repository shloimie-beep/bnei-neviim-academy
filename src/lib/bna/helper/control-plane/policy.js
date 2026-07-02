'use strict';

const { HELPER_ROLES } = require('./runtime-context');

const BASE_POLICY = Object.freeze({
  rules: [
    'Do not invent links.',
    'Every internal link must come from the canonical route registry and helper destination resolver.',
    'Every action must be a typed registered helper action.',
    'Do not claim an action is done unless a committed action result record exists.',
    'Do not leak cross-workspace, cross-family, cross-student, cross-provider, or cross-member data.',
    'If the helper cannot act, give the structured reason and create or link a repair/support item only when a typed action allows it.',
  ],
});

const ROLE_POLICIES = Object.freeze({
  [HELPER_ROLES.PUBLIC_VISITOR]: {
    role: HELPER_ROLES.PUBLIC_VISITOR,
    prompt_name: 'Public Visitor Helper',
    allowed_portals: ['public'],
    summary: 'Public-only helper. No private routes, data, actions, or Operations links.',
  },
  [HELPER_ROLES.BNA_SUPER_ADMIN]: {
    role: HELPER_ROLES.BNA_SUPER_ADMIN,
    prompt_name: 'BNA Super Admin Helper',
    allowed_portals: ['operations', 'provider', 'parent', 'student', 'one_time', 'one_time_classroom'],
    summary: 'Operations helper. Must state explicit scope before private workspace data or actions.',
    required_disclosures: ['current_effective_scope'],
  },
  [HELPER_ROLES.RABBI_PROVIDER_ADMIN]: {
    role: HELPER_ROLES.RABBI_PROVIDER_ADMIN,
    prompt_name: 'Rabbi Scheller Provider Admin Helper',
    allowed_portals: ['provider', 'one_time', 'one_time_classroom'],
    summary: 'Provider admin helper scoped to rabbi_sheller_provider / one_time_mishnah_class.',
  },
  [HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT]: {
    role: HELPER_ROLES.PROVIDER_STAFF_PARTICIPANT,
    prompt_name: 'Provider Staff/Participant Helper',
    allowed_portals: ['provider'],
    summary: 'Provider-safe helper. No admin-only settings or other participant records.',
  },
  [HELPER_ROLES.PARENT]: {
    role: HELPER_ROLES.PARENT,
    prompt_name: 'Parent Helper',
    allowed_portals: ['parent'],
    summary: 'Parent helper. Linked children only.',
  },
  [HELPER_ROLES.STUDENT]: {
    role: HELPER_ROLES.STUDENT,
    prompt_name: 'Student Helper',
    allowed_portals: ['student'],
    summary: 'Student-safe helper. Own student-safe data only.',
  },
  [HELPER_ROLES.ONE_TIME_MEMBER]: {
    role: HELPER_ROLES.ONE_TIME_MEMBER,
    prompt_name: 'One Time Member Helper',
    allowed_portals: ['one_time', 'one_time_member'],
    summary: 'One Time member helper. Own member/library/support/question scope only.',
  },
  [HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER]: {
    role: HELPER_ROLES.ONE_TIME_CLASSROOM_MEMBER,
    prompt_name: 'One Time Classroom Helper',
    allowed_portals: ['one_time_classroom'],
    summary: 'One Time classroom helper. Assigned classroom only.',
  },
  [HELPER_ROLES.WRONG_ROLE_EXPIRED]: {
    role: HELPER_ROLES.WRONG_ROLE_EXPIRED,
    prompt_name: 'Wrong Role or Expired Session Helper',
    allowed_portals: ['public', 'login'],
    summary: 'No private data or private actions. Explain login/account-switch/support path only.',
  },
});

function policyForContext(context = {}) {
  return {
    ...BASE_POLICY,
    ...(ROLE_POLICIES[context.helperRole] || ROLE_POLICIES[HELPER_ROLES.WRONG_ROLE_EXPIRED]),
    restrictions: context.restrictions || [],
    capabilities: context.capabilities || [],
  };
}

function renderPolicyPrompt(context = {}) {
  const policy = policyForContext(context);
  return [
    `You are ${policy.prompt_name}.`,
    '',
    policy.summary,
    '',
    'Rules:',
    ...BASE_POLICY.rules.map((rule) => `- ${rule}`),
    '',
    'Current restrictions:',
    ...(policy.restrictions || []).map((rule) => `- ${rule}`),
    '',
    'Capabilities:',
    ...(policy.capabilities || []).map((capability) => `- ${capability}`),
  ].join('\n');
}

module.exports = {
  BASE_POLICY,
  ROLE_POLICIES,
  policyForContext,
  renderPolicyPrompt,
};
