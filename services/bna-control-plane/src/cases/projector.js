const crypto = require('node:crypto');

const CASE_FIELDS = Object.freeze([
  'case_ref',
  'product',
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
  'source_event_id',
  'correlation_id',
]);

function caseRefFor(product, productCaseId) {
  const digest = crypto.createHash('sha256').update(`${product}:${productCaseId}`).digest('hex').slice(0, 26);
  return `cp_${digest}`;
}

function pickCaseProjection(event) {
  const source = event.case;
  const record = {
    case_ref: caseRefFor(event.producer.product, source.product_case_id),
    product: event.producer.product,
    product_case_id: source.product_case_id,
    case_kind: source.case_kind,
    severity: source.severity,
    queue: source.queue,
    status: source.status,
    redacted_summary: source.redacted_summary || null,
    product_case_url: source.product_case_url,
    product_version: source.product_version,
    opened_at: source.opened_at,
    updated_at: source.updated_at,
    closed_at: source.closed_at || null,
    source_event_id: event.event_id,
    correlation_id: event.trace.correlation_id,
  };
  return Object.fromEntries(CASE_FIELDS.map((key) => [key, record[key]]));
}

function projectEvent(event, storage) {
  if (event.event_type === 'control.command.result.v1') {
    storage.recordCommandResult(event.command_result);
    storage.audit('command_result_projected', {
      event_id: event.event_id,
      command_id: event.command_result.command_id,
      result: event.command_result.result,
    });
    return { projected: 'command_result', command_id: event.command_result.command_id };
  }

  const projection = pickCaseProjection(event);
  if (event.event_type === 'support.case.deleted.v1') {
    storage.deleteCase(projection.case_ref);
    storage.appendCaseProjection({
      case_ref: projection.case_ref,
      event_id: event.event_id,
      event_type: event.event_type,
      result: 'deleted',
    });
    return { projected: 'case_deleted', case_ref: projection.case_ref };
  }

  const saved = storage.upsertCase(projection);
  storage.appendCaseProjection({
    case_ref: saved.case_ref,
    event_id: event.event_id,
    event_type: event.event_type,
    product_version: saved.product_version,
    status: saved.status,
    queue: saved.queue,
    severity: saved.severity,
  });
  if (event.event_type === 'support.case.created.v1') {
    storage.enqueueTelegramAlert({
      notification_type: 'control.case.alert.v1',
      case_ref: saved.case_ref,
      product: saved.product,
      severity: saved.severity,
      queue: saved.queue,
      status: saved.status,
      opened_at: saved.opened_at,
      control_plane_url: `https://control.bnei-neviim.com/cases/${saved.case_ref}`,
    });
  }
  return { projected: 'case', case_ref: saved.case_ref };
}

module.exports = {
  CASE_FIELDS,
  caseRefFor,
  pickCaseProjection,
  projectEvent,
};
