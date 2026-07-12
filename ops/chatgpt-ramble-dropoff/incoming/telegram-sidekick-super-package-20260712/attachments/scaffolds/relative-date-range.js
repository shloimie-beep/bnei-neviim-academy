'use strict';

// Dependency-free starter for src/platform/assistant/runtime/time-range.js.
// Codex must audit language coverage and reuse any newer canonical date helper.

const DEFAULT_TIMEZONE = 'Asia/Jerusalem';
const DAY_MS = 24 * 60 * 60 * 1000;

const EN_NUMBERS = Object.freeze({
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
});

const HE_NUMBERS = Object.freeze({
  'אחד': 1, 'אחת': 1, 'שני': 2, 'שתי': 2, 'שניים': 2, 'שתיים': 2,
  'שלושה': 3, 'שלוש': 3, 'ארבעה': 4, 'ארבע': 4, 'חמישה': 5,
  'חמש': 5, 'שישה': 6, 'שש': 6, 'שבעה': 7, 'שבע': 7,
  'שמונה': 8, 'תשעה': 9, 'תשע': 9, 'עשרה': 10, 'עשר': 10,
});

function datePartsInZone(date, timeZone = DEFAULT_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date)
    .filter((part) => part.type !== 'literal')
    .map((part) => [part.type, Number(part.value)]));
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

function shiftCalendarDate(localDate, days) {
  const shifted = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function monthBoundary(localDate, monthDelta = 0) {
  const shifted = new Date(Date.UTC(localDate.year, localDate.month - 1 + monthDelta, 1));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: 1,
  };
}

function zonedDateTimeToUtc(local, timeZone = DEFAULT_TIMEZONE) {
  const targetAsUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour || 0,
    local.minute || 0,
    local.second || 0,
    local.millisecond || 0
  );
  let guess = targetAsUtc;
  for (let i = 0; i < 5; i += 1) {
    const actual = datePartsInZone(new Date(guess), timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
      local.millisecond || 0
    );
    const correction = targetAsUtc - actualAsUtc;
    guess += correction;
    if (correction === 0) break;
  }
  return new Date(guess);
}

function localDateString(localDate) {
  return `${String(localDate.year).padStart(4, '0')}-${String(localDate.month).padStart(2, '0')}-${String(localDate.day).padStart(2, '0')}`;
}

function makeRange({ startDate, endDate, timeZone, interpretation, originalText }) {
  const fromDate = zonedDateTimeToUtc({ ...startDate, hour: 0, minute: 0, second: 0, millisecond: 0 }, timeZone);
  const dayAfter = shiftCalendarDate(endDate, 1);
  const toExclusiveDate = zonedDateTimeToUtc({ ...dayAfter, hour: 0, minute: 0, second: 0, millisecond: 0 }, timeZone);
  return Object.freeze({
    from: fromDate.toISOString(),
    to: new Date(toExclusiveDate.getTime() - 1).toISOString(),
    toExclusive: toExclusiveDate.toISOString(),
    timezone: timeZone,
    localFromDate: localDateString(startDate),
    localToDate: localDateString(endDate),
    interpretation,
    originalText,
  });
}

function parseNumberToken(token) {
  const normalized = String(token || '').trim().toLowerCase();
  if (/^\d{1,3}$/.test(normalized)) return Number(normalized);
  return EN_NUMBERS[normalized] || HE_NUMBERS[normalized] || null;
}

function explicitIsoRange(text) {
  const match = text.match(/(?:from|between|since|מ(?:תאריך)?|בין)\s*(\d{4}-\d{2}-\d{2})(?:\s*(?:to|and|until|ועד|עד|ו)\s*(\d{4}-\d{2}-\d{2}))?/iu);
  if (!match) return null;
  const parse = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
    return { year, month, day };
  };
  const startDate = parse(match[1]);
  const endDate = parse(match[2] || match[1]);
  return startDate && endDate ? { startDate, endDate } : null;
}

function rollingUnitMatch(text) {
  const english = text.match(/\b(?:last|past|previous)\s+(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(day|days|week|weeks|month|months)\b/iu);
  if (english) return { count: parseNumberToken(english[1]), unit: english[2].replace(/s$/, '') };

  if (/(?:השבועיים|שבועיים)(?:\s+ה)?אחרונ(?:ים|ות)?/u.test(text)) return { count: 2, unit: 'week' };
  const hebrew = text.match(/(?:ב|מ)?(?:\s*)?(\d{1,3}|אחד|אחת|שני|שתי|שניים|שתיים|שלושה|שלוש|ארבעה|ארבע|חמישה|חמש|שישה|שש|שבעה|שבע|שמונה|תשעה|תשע|עשרה|עשר)\s*(יום|ימים|שבוע|שבועות|חודש|חודשים)\s*(?:האחרונ(?:ים|ות)|האחרון|האחרונה)?/u);
  if (!hebrew) return null;
  const unit = hebrew[2].startsWith('יום') ? 'day' : hebrew[2].startsWith('שבוע') ? 'week' : 'month';
  return { count: parseNumberToken(hebrew[1]), unit };
}

function startOfWeek(localToday, weekStartsOn = 0) {
  const utcProbe = new Date(Date.UTC(localToday.year, localToday.month - 1, localToday.day));
  const weekday = utcProbe.getUTCDay();
  const delta = -((weekday - weekStartsOn + 7) % 7);
  return shiftCalendarDate(localToday, delta);
}

function resolveRelativeDateRange(text, options = {}) {
  const originalText = String(text || '').trim();
  if (!originalText) return null;
  const normalized = originalText.toLowerCase().replace(/[־–—]/g, '-').replace(/\s+/g, ' ');
  const timeZone = options.timeZone || DEFAULT_TIMEZONE;
  const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
  if (Number.isNaN(now.getTime())) throw new TypeError('options.now must be a valid date');
  const nowParts = datePartsInZone(now, timeZone);
  const today = { year: nowParts.year, month: nowParts.month, day: nowParts.day };

  const explicit = explicitIsoRange(normalized);
  if (explicit) {
    if (Date.UTC(explicit.startDate.year, explicit.startDate.month - 1, explicit.startDate.day) > Date.UTC(explicit.endDate.year, explicit.endDate.month - 1, explicit.endDate.day)) return null;
    return makeRange({ ...explicit, timeZone, interpretation: 'explicit_calendar_dates_inclusive', originalText });
  }

  if (/\b(today)\b/iu.test(normalized) || /(?:^|\s)היום(?:$|\s)/u.test(normalized)) {
    return makeRange({ startDate: today, endDate: today, timeZone, interpretation: 'today_local_calendar_day', originalText });
  }
  if (/\b(yesterday)\b/iu.test(normalized) || /(?:^|\s)אתמול(?:$|\s)/u.test(normalized)) {
    const yesterday = shiftCalendarDate(today, -1);
    return makeRange({ startDate: yesterday, endDate: yesterday, timeZone, interpretation: 'yesterday_local_calendar_day', originalText });
  }

  const thisWeek = /\bthis week\b/iu.test(normalized) || /(?:^|\s)השבוע(?:$|\s)/u.test(normalized);
  const lastWeek = /\b(?:last|previous) week\b/iu.test(normalized) || /שבוע שעבר|השבוע שעבר/u.test(normalized);
  if (thisWeek || lastWeek) {
    const currentStart = startOfWeek(today, options.weekStartsOn ?? 0);
    const startDate = lastWeek ? shiftCalendarDate(currentStart, -7) : currentStart;
    const endDate = lastWeek ? shiftCalendarDate(currentStart, -1) : today;
    return makeRange({ startDate, endDate, timeZone, interpretation: lastWeek ? 'previous_calendar_week' : 'current_calendar_week_to_date', originalText });
  }

  const thisMonth = /\bthis month\b/iu.test(normalized) || /החודש(?: הזה)?/u.test(normalized);
  const lastMonth = /\b(?:last|previous) month\b/iu.test(normalized) || /חודש שעבר|החודש שעבר/u.test(normalized);
  if (thisMonth || lastMonth) {
    const startDate = monthBoundary(today, lastMonth ? -1 : 0);
    const endDate = lastMonth ? shiftCalendarDate(monthBoundary(today, 0), -1) : today;
    return makeRange({ startDate, endDate, timeZone, interpretation: lastMonth ? 'previous_calendar_month' : 'current_calendar_month_to_date', originalText });
  }

  const rolling = rollingUnitMatch(normalized);
  if (rolling && rolling.count > 0 && rolling.count <= 120) {
    let startDate;
    if (rolling.unit === 'day') startDate = shiftCalendarDate(today, -(rolling.count - 1));
    else if (rolling.unit === 'week') startDate = shiftCalendarDate(today, -((rolling.count * 7) - 1));
    else startDate = monthBoundary(today, -(rolling.count - 1));
    return makeRange({
      startDate,
      endDate: today,
      timeZone,
      interpretation: `rolling_${rolling.count}_${rolling.unit}${rolling.count === 1 ? '' : 's'}_inclusive`,
      originalText,
    });
  }

  return null;
}

module.exports = {
  DEFAULT_TIMEZONE,
  datePartsInZone,
  localDateString,
  resolveRelativeDateRange,
  shiftCalendarDate,
  zonedDateTimeToUtc,
};
