const {
  resolveRole,
  resolveWorkspaceKey,
} = require('../bna/workspace-taxonomy');

const ACTION_CATEGORIES = [
  'tasks',
  'calendar',
  'content',
  'newsletter',
  'email',
  'whatsapp',
  'social',
  'provider',
  'student',
  'parent',
  'communications',
  'accounting',
  'settings',
  'bot',
  'admin',
  'system',
];

const WORKSPACES = {
  PLATFORM: 'platform_control',
  BNA: 'bna_school',
  ONE_TIME: 'one_time',
  RABBI_SHELLER_PROVIDER: 'one_time',
  LEGACY_PLATFORM: 'bna_platform',
  LEGACY_BNA: 'bna',
  LEGACY_RABBI_SHELLER_PROVIDER: 'rabbi_sheller_provider',
};

const ROLES = {
  SUPER_ADMIN: 'platform_super_admin',
  PLATFORM_SUPER_ADMIN: 'platform_super_admin',
  PLATFORM_MANAGER: 'platform_manager',
  SUPPORT_ADMIN: 'support_admin',
  TECHNICAL_AGENT: 'technical_agent',
  ADMIN: 'admin',
  BNA_ADMIN: 'bna_admin',
  SCHOOL_MANAGER: 'school_manager',
  STAFF: 'staff',
  OPERATOR: 'operator',
  PROVIDER_ADMIN: 'provider_admin',
  PROVIDER_MANAGER: 'provider_manager',
  PROVIDER_STAFF: 'provider_staff',
  PARENT: 'parent',
  STUDENT: 'student',
  PARTICIPANT: 'participant',
  SYSTEM: 'system',
};

const ROLE_ALIASES = {
  owner: ROLES.SUPER_ADMIN,
  platform_admin: ROLES.SUPER_ADMIN,
  platform_manager: ROLES.PLATFORM_MANAGER,
  support: ROLES.SUPPORT_ADMIN,
  support_admin: ROLES.SUPPORT_ADMIN,
  technical: ROLES.TECHNICAL_AGENT,
  technical_agent: ROLES.TECHNICAL_AGENT,
  school_admin: ROLES.BNA_ADMIN,
  rabbi: ROLES.BNA_ADMIN,
  rebbe: ROLES.BNA_ADMIN,
  school_manager: ROLES.SCHOOL_MANAGER,
  teacher: ROLES.BNA_ADMIN,
  ops: ROLES.OPERATOR,
  operations: ROLES.OPERATOR,
  provider: ROLES.PROVIDER_ADMIN,
  provider_manager: ROLES.PROVIDER_MANAGER,
  provider_staff: ROLES.PROVIDER_STAFF,
  provider_member: ROLES.PARTICIPANT,
  member: ROLES.PARTICIPANT,
};

function normalizeRole(value) {
  const normalized = String(value || ROLES.OPERATOR)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return resolveRole(ROLE_ALIASES[normalized] || normalized || ROLES.OPERATOR, ROLES.OPERATOR);
}

function normalizeWorkspace(value) {
  return resolveWorkspaceKey(value || WORKSPACES.BNA, WORKSPACES.BNA);
}

function compactText(value, maxLength = 1000) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

module.exports = {
  ACTION_CATEGORIES,
  WORKSPACES,
  ROLES,
  normalizeRole,
  normalizeWorkspace,
  compactText,
};
