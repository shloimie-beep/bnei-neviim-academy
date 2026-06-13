const DEFAULT_TIMEZONE = 'Asia/Jerusalem';
const DEFAULT_START_AT = '2026-06-12T18:17:00+03:00';
const DEFAULT_RESUME_AT = '2026-06-13T20:22:00+03:00';

function parseInstant(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function boolEnv(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function formatJerusalem(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(',', '');
}

function currentShabbosGuardWindow(now = new Date(), env = process.env) {
  const disabled = boolEnv(env.BNA_SHABBOS_GUARD_DISABLED);
  const startAt = parseInstant(env.BNA_SHABBOS_GUARD_START_AT || env.SHABBOS_GUARD_START_AT || DEFAULT_START_AT);
  const resumeAt = parseInstant(
    env.BNA_SHABBOS_GUARD_RESUME_AT ||
    env.BNA_SHABBOS_GUARD_END_AT ||
    env.SHABBOS_GUARD_RESUME_AT ||
    env.SHABBOS_GUARD_END_AT ||
    DEFAULT_RESUME_AT
  );
  const nowDate = parseInstant(now) || new Date();
  const active = !disabled && Boolean(startAt && resumeAt && nowDate >= startAt && nowDate < resumeAt);
  return {
    active,
    disabled,
    timezone: DEFAULT_TIMEZONE,
    startAt: startAt ? startAt.toISOString() : null,
    resumeAt: resumeAt ? resumeAt.toISOString() : null,
    startAtLocal: formatJerusalem(startAt),
    resumeAtLocal: formatJerusalem(resumeAt),
    now: nowDate.toISOString(),
    nowLocal: formatJerusalem(nowDate),
    reason: active ? 'shabbos_guard_active' : 'shabbos_guard_inactive',
  };
}

function shabbosGuardMessage(kind = 'outbound action', guard = currentShabbosGuardWindow()) {
  return `Shabbos guard is active; ${kind} is blocked until ${guard.resumeAtLocal || guard.resumeAt || 'the configured resume time'} ${guard.timezone}.`;
}

function assertOutboundAllowed(kind = 'outbound action', now = new Date(), env = process.env) {
  const guard = currentShabbosGuardWindow(now, env);
  if (!guard.active) return guard;
  const error = new Error(shabbosGuardMessage(kind, guard));
  error.code = 'SHABBOS_GUARD_ACTIVE';
  error.status = 409;
  error.statusCode = 409;
  error.guard = guard;
  throw error;
}

module.exports = {
  DEFAULT_TIMEZONE,
  DEFAULT_START_AT,
  DEFAULT_RESUME_AT,
  currentShabbosGuardWindow,
  shabbosGuardMessage,
  assertOutboundAllowed,
};
