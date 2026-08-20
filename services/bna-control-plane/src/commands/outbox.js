const crypto = require('node:crypto');
const { CONTRACT_VERSION, validateCommandEnvelope } = require('../contracts');
const { assertCommandAuthorization } = require('./authorization');

function opaqueId(prefix, seed) {
  const digest = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 26);
  return `${prefix}${digest}`;
}

function buildCommandEnvelope({ commandType, issuer, target, instruction, trace, now = new Date() }) {
  const seed = `${commandType}:${target.product}:${target.product_case_id}:${target.expected_product_version}:${JSON.stringify(instruction)}:${trace.correlation_id}`;
  const command = {
    contract_version: CONTRACT_VERSION,
    command_id: opaqueId('cmd_', seed),
    command_type: commandType,
    requested_at: now.toISOString(),
    issuer,
    target,
    instruction,
    trace,
  };
  return validateCommandEnvelope(command);
}

function enqueueCommand({ storage, principal, caseRecord, commandType, instruction, reasonCode, now = new Date(), sourceCommit = 'synthetic-test' }) {
  const target = {
    product: caseRecord.product,
    product_case_id: caseRecord.product_case_id,
    expected_product_version: caseRecord.product_version,
  };
  const trace = { correlation_id: caseRecord.correlation_id || opaqueId('corr_', caseRecord.case_ref) };
  const command = buildCommandEnvelope({
    commandType,
    issuer: {
      service: 'bna_control_plane',
      environment: 'test',
      deployment_id: 'synthetic-test',
      source_commit: sourceCommit,
      operator_id: principal.operator_id,
    },
    target,
    instruction: { ...instruction, reason_code: reasonCode || instruction.reason_code || 'operator_review' },
    trace,
    now,
  });
  assertCommandAuthorization({ principal, command, caseRecord });
  return storage.insertCommand({
    command_id: command.command_id,
    command_type: command.command_type,
    target_product: command.target.product,
    product_case_id: command.target.product_case_id,
    expected_product_version: command.target.expected_product_version,
    instruction,
    reason_code: command.instruction.reason_code,
    envelope: command,
  }).record;
}

module.exports = {
  buildCommandEnvelope,
  enqueueCommand,
};
