const ROLES = Object.freeze(['cp_viewer', 'cp_triage', 'cp_admin', 'cp_auditor']);

function browserPrincipal({ operatorId = 'op_01J00000000000000000000000', role = 'cp_viewer' } = {}) {
  if (!ROLES.includes(role)) throw new Error(`unsupported role ${role}`);
  return {
    type: 'browser_session',
    operator_id: operatorId,
    role,
  };
}

function testPrincipal(options = {}) {
  if (process.env.NODE_ENV !== 'test') {
    throw Object.assign(new Error('fixture principals are allowed only under NODE_ENV=test'), { code: 'test_principal_forbidden' });
  }
  return browserPrincipal(options);
}

function telegramPrincipal({ chatRef = 'telegram_synthetic_chat' } = {}) {
  return {
    type: 'telegram',
    chat_ref: chatRef,
    role: 'telegram_alert_transport',
  };
}

module.exports = {
  ROLES,
  browserPrincipal,
  telegramPrincipal,
  testPrincipal,
};
