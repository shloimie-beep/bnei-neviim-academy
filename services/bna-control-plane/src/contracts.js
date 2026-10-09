const crypto = require('node:crypto');
const { assertRedactedSummary, assertProductCaseUrl } = require('./security/dlp');

const CONTRACT_VERSION = '1.0.0';

const PRODUCTS = Object.freeze(['one_time', 'bna_school']);
const EVENT_TYPES = Object.freeze([
  'support.case.created.v1',
  'support.case.status_changed.v1',
  'support.case.routing_changed.v1',
  'support.case.sla_changed.v1',
  'support.case.deleted.v1',
  'control.command.result.v1',
]);
const COMMAND_TYPES = Object.freeze([
  'support.case.assign_queue.v1',
  'support.case.set_severity.v1',
  'support.case.request_information.v1',
  'support.case.close.v1',
  'support.case.reopen.v1',
]);
const CASE_KINDS = Object.freeze(['bug', 'access_login', 'class_live', 'billing', 'content', 'complaint', 'safety', 'other']);
const SEVERITIES = Object.freeze(['sev1', 'sev2', 'sev3', 'sev4']);
const QUEUES = Object.freeze(['support_ops', 'school_ops', 'billing_ops', 'technical_ops', 'content_ops']);
const STATUSES = Object.freeze(['new', 'triage', 'waiting_product', 'waiting_customer', 'in_progress', 'resolved', 'closed', 'deleted']);
const REASON_CODES = Object.freeze([
  'routing_correction',
  'severity_correction',
  'missing_information',
  'duplicate_case',
  'resolved_by_product',
  'operator_review',
]);
const TEMPLATE_CODES = Object.freeze([
  'request_reproduction_steps',
  'request_screenshot_in_product',
  'request_error_code',
  'request_account_verification_in_product',
]);
const RESOLUTION_CODES = Object.freeze(['resolved_by_product', 'duplicate_case', 'operator_review']);
const COMMAND_RESULTS = Object.freeze(['accepted', 'applied', 'rejected', 'conflict', 'expired', 'failed']);
const RESULT_CODES = Object.freeze([
  'queue_changed',
  'severity_changed',
  'information_requested',
  'case_closed',
  'case_reopened',
  'stale_product_version',
  'not_authorized',
  'product_policy_rejected',
  'product_deleted',
  'temporary_failure',
]);

const COMMAND_INSTRUCTION_FIELDS = Object.freeze({
  'support.case.assign_queue.v1': ['queue', 'reason_code'],
  'support.case.set_severity.v1': ['severity', 'reason_code'],
  'support.case.request_information.v1': ['template_code', 'reason_code'],
  'support.case.close.v1': ['resolution_code', 'reason_code'],
  'support.case.reopen.v1': ['reason_code'],
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function fail(message, path = '') {
  const error = new Error(path ? `${path}: ${message}` : message);
  error.code = 'schema_validation_failed';
  throw error;
}

function assertObject(value, path) {
  if (!isPlainObject(value)) fail('expected object', path);
}

function assertAdditionalProperties(value, allowed, path) {
  assertObject(value, path);
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) fail(`unexpected property ${key}`, path);
  }
}

function assertString(value, path, { min = 1, max = 512 } = {}) {
  if (typeof value !== 'string') fail('expected string', path);
  if (value.length < min) fail(`expected at least ${min} character(s)`, path);
  if (value.length > max) fail(`expected at most ${max} characters`, path);
}

function assertEnum(value, allowed, path) {
  assertString(value, path);
  if (!allowed.includes(value)) fail(`unsupported value ${value}`, path);
}

function assertInteger(value, path, { min = 0 } = {}) {
  if (!Number.isInteger(value)) fail('expected integer', path);
  if (value < min) fail(`expected integer >= ${min}`, path);
}

function assertIsoTimestamp(value, path) {
  assertString(value, path, { max: 64 });
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || !value.endsWith('Z')) fail('expected UTC ISO timestamp', path);
}

function assertOpaqueId(value, path, prefix) {
  assertString(value, path, { min: prefix.length + 10, max: 96 });
  if (!value.startsWith(prefix)) fail(`expected ${prefix} prefix`, path);
  if (!/^[a-z0-9_]+$/i.test(value)) fail('expected opaque alphanumeric id', path);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateProducer(producer, path) {
  assertAdditionalProperties(producer, ['product', 'environment', 'deployment_id', 'source_commit'], path);
  assertEnum(producer.product, PRODUCTS, `${path}.product`);
  assertString(producer.environment, `${path}.environment`, { max: 80 });
  assertString(producer.deployment_id, `${path}.deployment_id`, { max: 120 });
  assertString(producer.source_commit, `${path}.source_commit`, { min: 7, max: 40 });
}

function validateTrace(trace, path) {
  assertAdditionalProperties(trace, ['correlation_id'], path);
  assertOpaqueId(trace.correlation_id, `${path}.correlation_id`, 'corr_');
}

function validateCase(caseRecord, product, eventType, path) {
  assertAdditionalProperties(caseRecord, [
    'product_case_id',
    'case_kind',
    'severity',
    'queue',
    'status',
    'redacted_summary',
    'product_case_url',
    'product_version',
    'opened_at',
    'updated_at',
    'closed_at',
  ], path);
  assertOpaqueId(caseRecord.product_case_id, `${path}.product_case_id`, 'case_');
  assertEnum(caseRecord.case_kind, CASE_KINDS, `${path}.case_kind`);
  assertEnum(caseRecord.severity, SEVERITIES, `${path}.severity`);
  assertEnum(caseRecord.queue, QUEUES, `${path}.queue`);
  assertEnum(caseRecord.status, STATUSES, `${path}.status`);
  assertInteger(caseRecord.product_version, `${path}.product_version`, { min: 1 });
  assertIsoTimestamp(caseRecord.opened_at, `${path}.opened_at`);
  assertIsoTimestamp(caseRecord.updated_at, `${path}.updated_at`);
  if (caseRecord.closed_at !== undefined && caseRecord.closed_at !== null) assertIsoTimestamp(caseRecord.closed_at, `${path}.closed_at`);
  if (caseRecord.redacted_summary !== undefined && caseRecord.redacted_summary !== null) {
    assertRedactedSummary(caseRecord.redacted_summary, `${path}.redacted_summary`);
  }
  assertProductCaseUrl({
    product,
    productCaseId: caseRecord.product_case_id,
    url: caseRecord.product_case_url,
    path: `${path}.product_case_url`,
  });
  if (eventType === 'support.case.deleted.v1' && caseRecord.status !== 'deleted') {
    fail('deleted event requires deleted status', `${path}.status`);
  }
}

function validateCommandResult(commandResult, path) {
  assertAdditionalProperties(commandResult, [
    'command_id',
    'product_case_id',
    'result',
    'result_code',
    'product_version',
  ], path);
  assertOpaqueId(commandResult.command_id, `${path}.command_id`, 'cmd_');
  assertOpaqueId(commandResult.product_case_id, `${path}.product_case_id`, 'case_');
  assertEnum(commandResult.result, COMMAND_RESULTS, `${path}.result`);
  assertEnum(commandResult.result_code, RESULT_CODES, `${path}.result_code`);
  assertInteger(commandResult.product_version, `${path}.product_version`, { min: 1 });
}

function validateSupportCaseEvent(event) {
  assertAdditionalProperties(event, [
    'contract_version',
    'event_id',
    'event_type',
    'occurred_at',
    'producer',
    'case',
    'command_result',
    'trace',
  ], 'event');
  assertEnum(event.contract_version, [CONTRACT_VERSION], 'event.contract_version');
  assertOpaqueId(event.event_id, 'event.event_id', 'evt_');
  assertEnum(event.event_type, EVENT_TYPES, 'event.event_type');
  assertIsoTimestamp(event.occurred_at, 'event.occurred_at');
  validateProducer(event.producer, 'event.producer');
  validateTrace(event.trace, 'event.trace');

  if (event.event_type === 'control.command.result.v1') {
    if (event.case !== undefined) fail('command result event must not include case', 'event.case');
    validateCommandResult(event.command_result, 'event.command_result');
  } else {
    if (event.command_result !== undefined) fail('case event must not include command_result', 'event.command_result');
    validateCase(event.case, event.producer.product, event.event_type, 'event.case');
  }
  return clone(event);
}

function validateIssuer(issuer, path) {
  assertAdditionalProperties(issuer, [
    'service',
    'environment',
    'deployment_id',
    'source_commit',
    'operator_id',
  ], path);
  assertEnum(issuer.service, ['bna_control_plane'], `${path}.service`);
  assertString(issuer.environment, `${path}.environment`, { max: 80 });
  assertString(issuer.deployment_id, `${path}.deployment_id`, { max: 120 });
  assertString(issuer.source_commit, `${path}.source_commit`, { min: 7, max: 40 });
  assertOpaqueId(issuer.operator_id, `${path}.operator_id`, 'op_');
}

function validateCommandTarget(target, path) {
  assertAdditionalProperties(target, ['product', 'product_case_id', 'expected_product_version'], path);
  assertEnum(target.product, PRODUCTS, `${path}.product`);
  assertOpaqueId(target.product_case_id, `${path}.product_case_id`, 'case_');
  assertInteger(target.expected_product_version, `${path}.expected_product_version`, { min: 1 });
}

function validateCommandInstruction(commandType, instruction, path) {
  const fields = COMMAND_INSTRUCTION_FIELDS[commandType];
  assertAdditionalProperties(instruction, fields, path);
  if (instruction.reason_code !== undefined) assertEnum(instruction.reason_code, REASON_CODES, `${path}.reason_code`);
  if (instruction.queue !== undefined) assertEnum(instruction.queue, QUEUES, `${path}.queue`);
  if (instruction.severity !== undefined) assertEnum(instruction.severity, SEVERITIES, `${path}.severity`);
  if (instruction.template_code !== undefined) assertEnum(instruction.template_code, TEMPLATE_CODES, `${path}.template_code`);
  if (instruction.resolution_code !== undefined) assertEnum(instruction.resolution_code, RESOLUTION_CODES, `${path}.resolution_code`);
}

function validateCommandEnvelope(command) {
  assertAdditionalProperties(command, [
    'contract_version',
    'command_id',
    'command_type',
    'requested_at',
    'issuer',
    'target',
    'instruction',
    'trace',
  ], 'command');
  assertEnum(command.contract_version, [CONTRACT_VERSION], 'command.contract_version');
  assertOpaqueId(command.command_id, 'command.command_id', 'cmd_');
  assertEnum(command.command_type, COMMAND_TYPES, 'command.command_type');
  assertIsoTimestamp(command.requested_at, 'command.requested_at');
  validateIssuer(command.issuer, 'command.issuer');
  validateCommandTarget(command.target, 'command.target');
  validateCommandInstruction(command.command_type, command.instruction, 'command.instruction');
  validateTrace(command.trace, 'command.trace');
  return clone(command);
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function stableFingerprint(value) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function parseJsonStrict(raw) {
  try {
    return JSON.parse(Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw));
  } catch (error) {
    const err = new Error(`invalid JSON: ${error.message}`);
    err.code = 'invalid_json';
    throw err;
  }
}

module.exports = {
  CASE_KINDS,
  COMMAND_INSTRUCTION_FIELDS,
  COMMAND_RESULTS,
  COMMAND_TYPES,
  CONTRACT_VERSION,
  EVENT_TYPES,
  PRODUCTS,
  QUEUES,
  REASON_CODES,
  SEVERITIES,
  STATUSES,
  TEMPLATE_CODES,
  canonicalJson,
  parseJsonStrict,
  stableFingerprint,
  validateCommandEnvelope,
  validateSupportCaseEvent,
};
