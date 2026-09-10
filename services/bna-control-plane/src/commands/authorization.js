const { validateCommandEnvelope } = require('../contracts');

const COMMAND_ROLES = Object.freeze(['cp_triage', 'cp_admin']);

function assertCommandAuthorization({ principal, command, caseRecord } = {}) {
  validateCommandEnvelope(command);
  if (!principal || principal.type !== 'browser_session') {
    throw Object.assign(new Error('commands require browser-session principal'), { code: 'command_principal_denied' });
  }
  if (!COMMAND_ROLES.includes(principal.role)) {
    throw Object.assign(new Error('principal role cannot create commands'), { code: 'command_role_denied' });
  }
  if (!Number.isInteger(command.target.expected_product_version) || command.target.expected_product_version < 1) {
    throw Object.assign(new Error('expected product version required'), { code: 'expected_version_required' });
  }
  if (caseRecord) {
    if (caseRecord.product !== command.target.product) throw Object.assign(new Error('target product mismatch'), { code: 'target_product_mismatch' });
    if (caseRecord.product_case_id !== command.target.product_case_id) throw Object.assign(new Error('target case mismatch'), { code: 'target_case_mismatch' });
    if (caseRecord.product_version !== command.target.expected_product_version) {
      throw Object.assign(new Error('stale product version'), { code: 'expected_version_conflict' });
    }
  }
  return true;
}

module.exports = {
  COMMAND_ROLES,
  assertCommandAuthorization,
};
