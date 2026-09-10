const ALLOWED_ALERT_FIELDS = Object.freeze([
  'notification_type',
  'case_ref',
  'product',
  'severity',
  'queue',
  'status',
  'opened_at',
  'control_plane_url',
]);

function assertNoExtraFields(input, allowed = ALLOWED_ALERT_FIELDS) {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(input || {})) {
    if (!allowedSet.has(key)) throw Object.assign(new Error(`unexpected Telegram alert field ${key}`), { code: 'telegram_alert_extra_field' });
  }
}

function assertControlPlaneUrl(value, caseRef) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('control plane URL must use HTTPS');
  if (url.origin !== 'https://control.bnei-neviim.com') throw new Error('control plane URL origin is not allowed');
  if (url.search || url.hash) throw new Error('control plane URL must not contain query or fragment');
  if (!url.pathname.endsWith(`/cases/${caseRef}`)) throw new Error('control plane URL must point at the case ref');
}

function renderTelegramAlert(input) {
  assertNoExtraFields(input);
  if (input.notification_type !== 'control.case.alert.v1') throw new Error('unsupported notification type');
  for (const field of ALLOWED_ALERT_FIELDS) {
    if (!input[field]) throw new Error(`missing Telegram alert field ${field}`);
  }
  assertControlPlaneUrl(input.control_plane_url, input.case_ref);
  const text = [
    'Control Plane case alert',
    `Case: ${input.case_ref}`,
    `Product: ${input.product}`,
    `Severity: ${input.severity}`,
    `Queue: ${input.queue}`,
    `Status: ${input.status}`,
    `Opened: ${input.opened_at}`,
  ].join('\n');
  return {
    text,
    reply_markup: {
      inline_keyboard: [[{ text: 'Open case', url: input.control_plane_url }]],
    },
  };
}

module.exports = {
  ALLOWED_ALERT_FIELDS,
  renderTelegramAlert,
};
