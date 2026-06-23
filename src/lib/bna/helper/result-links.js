function helperResultLink(recordType, recordId) {
  if (!recordType || recordId === null || recordId === undefined || recordId === '') return null;
  const id = encodeURIComponent(String(recordId));
  const type = String(recordType || '').toLowerCase();
  if (type === 'task' || type === 'decision' || type === 'codex_work_item') return `/operations?view=tasks&task=${id}`;
  if (type === 'student') return `/operations?view=students&student=${id}`;
  if (type === 'content_job') return `/operations?view=content&content_job=${id}`;
  if (type === 'signup' || type === 'contact') return `/operations?view=contacts&signup=${id}`;
  if (type === 'payment_intake') return `/operations?view=accounting&payment_intake=${id}`;
  if (type === 'class_session') return `/operations?view=content&class_session=${id}`;
  if (type === 'helper_audit') return `/operations?view=api_usage&section=errors&helper_audit=${id}`;
  return null;
}

function helperResultCard({
  ok = true,
  tool = '',
  recordType = '',
  recordId = null,
  label = '',
  summary = '',
  url = null,
  status = '',
  data = null,
} = {}) {
  return {
    ok: Boolean(ok),
    tool,
    record_type: recordType || null,
    record_id: recordId === undefined ? null : recordId,
    label: label || (recordType && recordId ? `${recordType.replace(/_/g, ' ')} #${recordId}` : tool),
    summary: summary || '',
    url: url || helperResultLink(recordType, recordId),
    status: status || (ok ? 'executed' : 'failed'),
    data: data || null,
  };
}

module.exports = {
  helperResultCard,
  helperResultLink,
};
