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
  PLATFORM: 'platform',
  BNA: 'bna',
  RABBI_SHELLER_PROVIDER: 'rabbi_sheller_provider',
};

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  BNA_ADMIN: 'bna_admin',
  OPERATOR: 'operator',
  PROVIDER_ADMIN: 'provider_admin',
  PARENT: 'parent',
  STUDENT: 'student',
  PARTICIPANT: 'participant',
  SYSTEM: 'system',
};

const ROLE_ALIASES = {
  owner: ROLES.SUPER_ADMIN,
  platform_admin: ROLES.SUPER_ADMIN,
  school_admin: ROLES.BNA_ADMIN,
  teacher: ROLES.BNA_ADMIN,
  ops: ROLES.OPERATOR,
  operations: ROLES.OPERATOR,
  provider: ROLES.PROVIDER_ADMIN,
  provider_member: ROLES.PARTICIPANT,
  member: ROLES.PARTICIPANT,
};

function normalizeRole(value) {
  const normalized = String(value || ROLES.OPERATOR)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return ROLE_ALIASES[normalized] || normalized || ROLES.OPERATOR;
}

function normalizeWorkspace(value) {
  const normalized = String(value || WORKSPACES.BNA)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (['rabbi_sheller', 'sheller', 'one_time', 'one_time_mishnah_class'].includes(normalized)) {
    return WORKSPACES.RABBI_SHELLER_PROVIDER;
  }
  if (normalized === 'school') return WORKSPACES.BNA;
  return normalized || WORKSPACES.BNA;
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
