const crypto = require('crypto');

const ONE_TIME_CLASS_TIME_ZONE = 'Asia/Jerusalem';
const ONE_TIME_CLASS_HOUR = 19;
const ONE_TIME_CLASS_MINUTE = 0;
const ONE_TIME_REMINDER_MINUTES_BEFORE = 30;
const ONE_TIME_REMINDER_WINDOW = '30m';
const ONE_TIME_SCHEDULE_VERSION = 'daily-1900-asia-jerusalem-v1';
const ONE_TIME_REMINDER_CONSENT_POLICY_VERSION = 'one-time-class-reminders-v1-2026-07-12';
const ONE_TIME_LOCAL_CLASS_ACTIVATION_APPROVAL = 'APPROVE_ONE_TIME_LOCAL_CLASS_EMAIL_REMINDERS';
const ONE_TIME_LOCAL_CLASS_OPERATOR_POLICY_VERSION = 'one-time-local-class-email-reminders-v1-2026-07-12';

const ONE_TIME_CITY_OPTIONS = Object.freeze([
  {
    id: 'lakewood-nj-us',
    label: 'Lakewood, New Jersey, United States',
    city: 'Lakewood',
    region: 'New Jersey',
    country: 'United States',
    country_code: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 'new-york-ny-us',
    label: 'New York, New York, United States',
    city: 'New York',
    region: 'New York',
    country: 'United States',
    country_code: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 'brooklyn-ny-us',
    label: 'Brooklyn, New York, United States',
    city: 'Brooklyn',
    region: 'New York',
    country: 'United States',
    country_code: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 'los-angeles-ca-us',
    label: 'Los Angeles, California, United States',
    city: 'Los Angeles',
    region: 'California',
    country: 'United States',
    country_code: 'US',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'london-england-gb',
    label: 'London, England, United Kingdom',
    city: 'London',
    region: 'England',
    country: 'United Kingdom',
    country_code: 'GB',
    timezone: 'Europe/London',
  },
  {
    id: 'manchester-england-gb',
    label: 'Manchester, England, United Kingdom',
    city: 'Manchester',
    region: 'England',
    country: 'United Kingdom',
    country_code: 'GB',
    timezone: 'Europe/London',
  },
  {
    id: 'toronto-ontario-ca',
    label: 'Toronto, Ontario, Canada',
    city: 'Toronto',
    region: 'Ontario',
    country: 'Canada',
    country_code: 'CA',
    timezone: 'America/Toronto',
  },
  {
    id: 'sydney-nsw-au',
    label: 'Sydney, New South Wales, Australia',
    city: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    country_code: 'AU',
    timezone: 'Australia/Sydney',
  },
  {
    id: 'jerusalem-il',
    label: 'Jerusalem, Jerusalem District, Israel',
    city: 'Jerusalem',
    region: 'Jerusalem District',
    country: 'Israel',
    country_code: 'IL',
    timezone: 'Asia/Jerusalem',
  },
  {
    id: 'ramat-beit-shemesh-il',
    label: 'Ramat Beit Shemesh, Jerusalem District, Israel',
    city: 'Ramat Beit Shemesh',
    region: 'Jerusalem District',
    country: 'Israel',
    country_code: 'IL',
    timezone: 'Asia/Jerusalem',
  },
  {
    id: 'melbourne-vic-au',
    label: 'Melbourne, Victoria, Australia',
    city: 'Melbourne',
    region: 'Victoria',
    country: 'Australia',
    country_code: 'AU',
    timezone: 'Australia/Melbourne',
  },
  {
    id: 'beit-shemesh-il',
    label: 'Beit Shemesh, Jerusalem District, Israel',
    city: 'Beit Shemesh',
    region: 'Jerusalem District',
    country: 'Israel',
    country_code: 'IL',
    timezone: 'Asia/Jerusalem',
  },
  {
    id: 'springfield-ma-us',
    label: 'Springfield, Massachusetts, United States',
    city: 'Springfield',
    region: 'Massachusetts',
    country: 'United States',
    country_code: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 'springfield-il-us',
    label: 'Springfield, Illinois, United States',
    city: 'Springfield',
    region: 'Illinois',
    country: 'United States',
    country_code: 'US',
    timezone: 'America/Chicago',
  },
]);

const REMINDER_PREFERENCES = Object.freeze({
  email: {
    value: 'email',
    label: 'Email reminders',
    summary: 'You asked for daily email reminders before class.',
    channels: ['email'],
    recurring_consent_required: true,
  },
  whatsapp: {
    value: 'whatsapp',
    label: 'WhatsApp reminders',
    summary: 'You asked for daily WhatsApp reminders before class.',
    channels: ['whatsapp'],
    recurring_consent_required: true,
  },
  both: {
    value: 'both',
    label: 'Email and WhatsApp reminders',
    summary: 'You asked for daily email and WhatsApp reminders before class.',
    channels: ['email', 'whatsapp'],
    recurring_consent_required: true,
  },
  none: {
    value: 'none',
    label: 'No daily reminders',
    summary: 'You did not request daily reminders. This confirmation still includes the class link.',
    channels: [],
    recurring_consent_required: false,
  },
});

function compact(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizePhoneDigits(value = '') {
  return String(value || '').replace(/\D+/g, '');
}

function isExplicitTrue(value) {
  if (value === true) return true;
  if (typeof value === 'number') return value === 1;
  return ['1', 'true', 'yes', 'on', 'checked'].includes(compact(value).toLowerCase());
}

function assertPublicSignupError(condition, message, statusCode = 400) {
  if (condition) return;
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function normalizeIanaTimezone(value = '') {
  const timezone = compact(value);
  if (!timezone) return '';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date('2026-01-01T00:00:00Z'));
    return timezone;
  } catch {
    return '';
  }
}

function findOneTimeCitySelection(input = {}) {
  const cityId = compact(input.city_id || input.cityId || input.selected_city_id || input.selectedCityId).toLowerCase();
  const label = compact(input.city_label || input.cityLabel || input.city || input.location || input.label || input.city_name || input.cityName || input.metadata?.city?.label || input.metadata?.city?.name);
  if (cityId) {
    return ONE_TIME_CITY_OPTIONS.find((option) => option.id.toLowerCase() === cityId) || null;
  }
  if (!label) return null;
  const exact = ONE_TIME_CITY_OPTIONS.find((option) => option.label.toLowerCase() === label.toLowerCase());
  if (exact) return exact;
  const byCityName = ONE_TIME_CITY_OPTIONS.filter((option) => option.city.toLowerCase() === label.toLowerCase());
  if (byCityName.length === 1) return byCityName[0];
  return null;
}

function resolveOneTimeCitySelection(input = {}) {
  const option = findOneTimeCitySelection(input);
  const submittedLabel = compact(input.city_label || input.cityLabel || input.city || input.location || input.label || input.city_name || input.cityName || input.metadata?.city?.label || input.metadata?.city?.name);
  const label = submittedLabel || option?.label || '';
  const cityName = compact(input.city_name || input.cityName || input.metadata?.city?.name) || option?.city || label;
  const browserTimezone = normalizeIanaTimezone(input.browser_timezone || input.browserTimeZone || input.metadata?.browser_timezone || input.metadata?.browserTimezone || '');
  const submittedTimezone = normalizeIanaTimezone(input.timezone || input.timeZone || input.time_zone || input.metadata?.timezone || input.metadata?.city?.timezone || '');
  const timezone = submittedTimezone || browserTimezone || option?.timezone || '';
  assertPublicSignupError(Boolean(label), 'City is required.');
  assertPublicSignupError(Boolean(timezone), 'Choose a valid IANA time zone for class-time display.');
  return {
    id: option?.id || compact(input.city_id || input.cityId || ''),
    label,
    city: cityName,
    region: compact(input.city_region || input.cityRegion || input.region || input.metadata?.city?.region) || option?.region || '',
    country: compact(input.city_country || input.cityCountry || input.country || input.metadata?.city?.country) || option?.country || '',
    country_code: compact(input.city_country_code || input.cityCountryCode || input.country_code || input.countryCode || input.metadata?.city?.country_code) || option?.country_code || '',
    timezone,
    browser_timezone: browserTimezone || timezone,
    timezone_mismatch: false,
    timezone_mismatch_review: null,
    timezone_source: browserTimezone && timezone === browserTimezone ? 'browser' : submittedTimezone ? 'submitted' : 'known_city',
  };
}

function normalizeReminderPreference(value) {
  const normalized = compact(value).toLowerCase().replace(/[\s-]+/g, '_');
  const alias = {
    email_reminders: 'email',
    email: 'email',
    whatsapp_reminders: 'whatsapp',
    whatsapp: 'whatsapp',
    email_and_whatsapp: 'both',
    both: 'both',
    no_daily_reminders: 'none',
    none: 'none',
  }[normalized];
  if (!alias || !REMINDER_PREFERENCES[alias]) {
    const error = new Error('Choose a class reminder preference.');
    error.statusCode = 400;
    error.code = 'missing_reminder_preference';
    throw error;
  }
  return REMINDER_PREFERENCES[alias];
}

function reminderChannelsForPreference(value) {
  return [...normalizeReminderPreference(value).channels];
}

function requiresPhoneForReminderPreference(value) {
  return reminderChannelsForPreference(value).includes('whatsapp');
}

function normalizeSignupAs(value = '') {
  const normalized = compact(value).toLowerCase();
  if (normalized === 'family') return 'Family';
  if (normalized === 'school') return 'School';
  const error = new Error('Choose whether you are signing up as a family or a school.');
  error.statusCode = 400;
  error.code = 'missing_signup_as';
  throw error;
}

function normalizeSignupUtm(input = {}) {
  const metadata = input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
    ? input.metadata
    : {};
  const utm = metadata.utm && typeof metadata.utm === 'object' && !Array.isArray(metadata.utm)
    ? metadata.utm
    : {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = compact(input[key] || input[key.replace('utm_', '')] || metadata[key] || utm[key]);
    if (value) utm[key] = value.slice(0, 180);
  }
  return utm;
}

function buildOneTimeSignupLeadInput(input = {}, { now = new Date() } = {}) {
  const contactName = compact(input.contact_name || input.contactName || input.parent_name || input.parentName || input.name);
  const signupAs = normalizeSignupAs(input.signup_as || input.signupAs || input.audience_type || input.audienceType);
  const city = resolveOneTimeCitySelection(input);
  const email = normalizeEmail(input.email || input.parent_email || input.parentEmail);
  const phone = compact(input.phone || input.parent_phone || input.parentPhone || input.whatsapp || input.whatsapp_phone || input.whatsappPhone);
  const preference = normalizeReminderPreference(input.reminder_preference || input.reminderPreference || input.class_reminders || input.classReminders);
  const inputMetadata = input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
    ? input.metadata
    : {};
  const acknowledgementGiven = isExplicitTrue(input.signup_acknowledgement)
    || isExplicitTrue(input.signupAcknowledgement)
    || isExplicitTrue(input.location_time_acknowledgement)
    || isExplicitTrue(inputMetadata.signup_acknowledgement)
    || isExplicitTrue(inputMetadata.location_time_acknowledgement);
  const recurringConsentGiven = acknowledgementGiven && (
    isExplicitTrue(input.reminder_consent_ack)
    || isExplicitTrue(input.reminderConsentAck)
    || isExplicitTrue(input.reminder_consent)
    || isExplicitTrue(input.consent)
    || isExplicitTrue(inputMetadata.reminder_consent_acknowledged)
    || isExplicitTrue(inputMetadata.reminder_consent)
  );
  assertPublicSignupError(Boolean(contactName), 'Contact name is required.');
  assertPublicSignupError(Boolean(email), 'Email is required.');
  assertPublicSignupError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
  assertPublicSignupError(acknowledgementGiven, 'Check the box to confirm your class-time and reminder preferences.');
  if (preference.channels.includes('whatsapp')) {
    assertPublicSignupError(Boolean(normalizePhoneDigits(phone)), 'Phone / WhatsApp is required for WhatsApp reminders.');
  }
  if (preference.recurring_consent_required) {
    assertPublicSignupError(recurringConsentGiven, 'Confirm reminder consent to receive class reminders.');
  }
  const consentAt = preference.recurring_consent_required && recurringConsentGiven
    ? (now instanceof Date ? now : new Date(now)).toISOString()
    : null;
  const sourceLandingPage = compact(input.source_landing_page || input.sourceLandingPage || input.route || '/one-time/signup') || '/one-time/signup';
  const referrer = compact(input.referrer || input.referer || input.metadata?.referrer).slice(0, 500);
  const metadata = {
    ...inputMetadata,
    one_time_direct_signup: true,
    signup_workflow_version: 'one-time-direct-signup-v1',
    signup_as: signupAs,
    city: {
      id: city.id,
      label: city.label,
      name: city.city,
      region: city.region,
      country: city.country,
      country_code: city.country_code,
      timezone: city.timezone,
    },
    browser_timezone: city.browser_timezone,
    timezone_mismatch: city.timezone_mismatch,
    timezone_mismatch_review: city.timezone_mismatch_review,
    timezone_source: city.timezone_source,
    reminder_preference: preference.value,
    reminder_preference_label: preference.label,
    reminder_channels: preference.channels,
    signup_acknowledgement: acknowledgementGiven,
    location_time_acknowledgement: acknowledgementGiven,
    reminder_consent_acknowledged: preference.recurring_consent_required ? recurringConsentGiven : false,
    reminder_consent_at: consentAt,
    reminder_consent_policy_version: consentAt ? ONE_TIME_REMINDER_CONSENT_POLICY_VERSION : null,
    signup_source: 'one_time_direct_signup_page',
    source_landing_page: sourceLandingPage,
    referrer,
    utm: normalizeSignupUtm(input),
    email_suppression_state: 'active',
    whatsapp_suppression_state: 'active',
    no_portal_onboarding: true,
    no_member_login_created: true,
    no_password_setup: true,
    no_checkout: true,
    no_payment: true,
    no_access_granted: true,
  };
  return {
    parent_name: contactName,
    contact_name: contactName,
    email,
    phone,
    whatsapp: preference.channels.includes('whatsapp') ? phone : '',
    audience: 'parents',
    signup_as: signupAs,
    region: city.country_code || 'worldwide',
    city_id: city.id,
    city_label: city.label,
    city_name: city.city,
    city_region: city.region,
    city_country: city.country,
    city_country_code: city.country_code,
    timezone: city.timezone,
    browser_timezone: city.browser_timezone,
    preferred_class_format: 'daily_live_mishnah_class',
    source_landing_page: sourceLandingPage,
    consent: preference.recurring_consent_required && recurringConsentGiven,
    reminder_preference: preference.value,
    reminder_channels: preference.channels,
    reminder_consent_at: consentAt,
    consent_policy_version: consentAt ? ONE_TIME_REMINDER_CONSENT_POLICY_VERSION : null,
    notes: compact(input.notes || ''),
    metadata,
  };
}

function zoneDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date instanceof Date ? date : new Date(date));
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = Number(part.value);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second || 0,
  };
}

function timezoneOffsetMs(timeZone, instantMs) {
  const parts = zoneDateParts(new Date(instantMs), timeZone);
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
  return localAsUtc - instantMs;
}

function zonedWallTimeToUtc({ timeZone, year, month, day, hour, minute = 0, second = 0 }) {
  let instantMs = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let index = 0; index < 4; index += 1) {
    const offset = timezoneOffsetMs(timeZone, instantMs);
    const next = Date.UTC(year, month - 1, day, hour, minute, second) - offset;
    if (Math.abs(next - instantMs) < 1000) {
      instantMs = next;
      break;
    }
    instantMs = next;
  }
  return new Date(instantMs);
}

function addDaysToZoneDate({ year, month, day }, days) {
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + Number(days || 0));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

function isoDateKey({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function nextOneTimeClassSchedule({ now = new Date() } = {}) {
  const nowDate = now instanceof Date ? now : new Date(now);
  assertPublicSignupError(!Number.isNaN(nowDate.getTime()), 'Invalid current time.');
  const todayInIsrael = zoneDateParts(nowDate, ONE_TIME_CLASS_TIME_ZONE);
  const candidate = zonedWallTimeToUtc({
    timeZone: ONE_TIME_CLASS_TIME_ZONE,
    year: todayInIsrael.year,
    month: todayInIsrael.month,
    day: todayInIsrael.day,
    hour: ONE_TIME_CLASS_HOUR,
    minute: ONE_TIME_CLASS_MINUTE,
  });
  const classDateParts = nowDate.getTime() < candidate.getTime()
    ? { year: todayInIsrael.year, month: todayInIsrael.month, day: todayInIsrael.day }
    : addDaysToZoneDate(todayInIsrael, 1);
  const classInstant = nowDate.getTime() < candidate.getTime()
    ? candidate
    : zonedWallTimeToUtc({
        timeZone: ONE_TIME_CLASS_TIME_ZONE,
        year: classDateParts.year,
        month: classDateParts.month,
        day: classDateParts.day,
        hour: ONE_TIME_CLASS_HOUR,
        minute: ONE_TIME_CLASS_MINUTE,
      });
  return {
    class_date: isoDateKey(classDateParts),
    class_instant: classInstant,
    class_instant_iso: classInstant.toISOString(),
    reminder_instant: new Date(classInstant.getTime() - ONE_TIME_REMINDER_MINUTES_BEFORE * 60 * 1000),
    reminder_instant_iso: new Date(classInstant.getTime() - ONE_TIME_REMINDER_MINUTES_BEFORE * 60 * 1000).toISOString(),
    class_timezone: ONE_TIME_CLASS_TIME_ZONE,
    class_time_label: '7:00 p.m.',
    reminder_time_label: '6:30 p.m.',
    schedule_version: ONE_TIME_SCHEDULE_VERSION,
  };
}

function formatRecipientLocalTime(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date instanceof Date ? date : new Date(date)).replace(/\bAM\b/, 'a.m.').replace(/\bPM\b/, 'p.m.');
}

function buildClassTimeDisplay({ classInstant, city }) {
  const selectedCity = city?.timezone ? city : resolveOneTimeCitySelection(city || {});
  return {
    recipient_local_time: formatRecipientLocalTime(classInstant, selectedCity.timezone),
    city_label: selectedCity.label,
    city_name: selectedCity.city || selectedCity.name,
    city_timezone: selectedCity.timezone,
    israel_time: '7:00 p.m.',
    israel_timezone: ONE_TIME_CLASS_TIME_ZONE,
  };
}

function buildOneTimeSignupConfirmationEmail({
  contactName,
  city,
  classInstant,
  zoomJoinUrl,
  reminderPreference,
} = {}) {
  const preference = normalizeReminderPreference(reminderPreference || 'none');
  const display = buildClassTimeDisplay({ classInstant, city });
  const joinUrl = compact(zoomJoinUrl);
  assertPublicSignupError(/^https:\/\//i.test(joinUrl), 'Current One Time class join link is not configured.');
  const text = [
    `Hi ${compact(contactName) || 'there'},`,
    '',
    "You're signed up for Rabbi Eli Scheller's live Mishnah class.",
    '',
    'The class meets every day at:',
    '',
    `${display.recipient_local_time} in ${display.city_name || display.city_label}`,
    '7:00 p.m. Israel time',
    '',
    'Join the class:',
    joinUrl,
    '',
    preference.summary,
    '',
    'Looking forward to learning together,',
    'One Time Mishnayos',
  ].join('\n');
  return {
    from: 'One Time Mishnayos <info@onetimeonetime.com>',
    reply_to: 'info@onetimeonetime.com',
    subject: "You're signed up for Rabbi Scheller's 7 PM Mishnah class",
    text,
    html: text.split('\n').map((line) => line ? line.replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    }[char])) : '').join('<br>'),
    display,
  };
}

function buildOneTimeClassReminderMessage({ city, classInstant, zoomJoinUrl, channel = 'email' } = {}) {
  const display = city?.timezone
    ? buildClassTimeDisplay({ classInstant, city })
    : {
        recipient_local_time: '',
        city_label: '',
        city_name: '',
        israel_time: '7:00 p.m.',
        israel_timezone: ONE_TIME_CLASS_TIME_ZONE,
      };
  const joinUrl = compact(zoomJoinUrl);
  assertPublicSignupError(/^https:\/\//i.test(joinUrl), 'Current One Time class join link is not configured.');
  const localLine = display.recipient_local_time
    ? `Your local time: ${display.recipient_local_time}`
    : 'The class starts in 30 minutes - 7:00 p.m. Israel time.';
  if (compact(channel).toLowerCase() === 'whatsapp') {
    return [
      "Hi, this is Rabbi Scheller's digital assistant.",
      "We're about to begin in 30 minutes. It's going to be an awesome class today.",
      '',
      localLine,
      'Israel time: 7:00 p.m.',
      '',
      'Join Zoom:',
      joinUrl,
    ].join('\n');
  }
  return [
    "Rabbi Scheller's Mishnah class starts in 30 minutes.",
    '',
    localLine,
    'Israel time: 7:00 p.m.',
    '',
    'Join Zoom:',
    joinUrl,
  ].join('\n');
}

function buildReminderIdempotencyKey({ classDate, contactId, channel, scheduleVersion = ONE_TIME_SCHEDULE_VERSION } = {}) {
  const parts = [
    compact(classDate),
    compact(contactId),
    compact(channel).toLowerCase(),
    ONE_TIME_REMINDER_WINDOW,
    compact(scheduleVersion || ONE_TIME_SCHEDULE_VERSION),
  ];
  assertPublicSignupError(parts.every(Boolean), 'Reminder idempotency key requires class date, contact ID, channel, and schedule version.');
  return parts.join(':');
}

function safeRecipientHash(value = '') {
  const normalized = compact(value).toLowerCase();
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

function buildOneTimeSignupOutboxEvents({
  productLeadId,
  crmLeadId,
  contactName,
  signupAs,
  email,
  phone,
  city,
  reminderPreference,
  sourceLandingPage = '/one-time/signup',
} = {}) {
  const preference = normalizeReminderPreference(reminderPreference || 'none');
  const contactKey = crmLeadId || productLeadId || safeRecipientHash(email || phone || contactName);
  assertPublicSignupError(Boolean(contactKey), 'Outbox event requires a contact reference.');
  const basePayload = {
    workflow: 'one_time_direct_signup',
    workflow_version: 'v1',
    product_lead_id: productLeadId || null,
    crm_lead_id: crmLeadId || null,
    contact_name: compact(contactName),
    signup_as: normalizeSignupAs(signupAs),
    city: city?.id ? city : resolveOneTimeCitySelection(city || {}),
    reminder_preference: preference.value,
    reminder_preference_label: preference.label,
    reminder_channels: preference.channels,
    source_landing_page: sourceLandingPage,
    class_link_source: 'server_side_one_time_class_link_alias',
    raw_join_url_in_payload: false,
    no_portal_onboarding: true,
    no_checkout: true,
    no_payment: true,
    no_access_granted: true,
  };
  const events = [{
    delivery_key: `one-time:signup-confirmation-email:${contactKey}:v1`,
    idempotency_key: `one-time-signup-confirmation-email:${contactKey}:v1`,
    channel_key: 'email:one_time_signup_confirmation',
    recipient_identity_key: safeRecipientHash(email),
    payload: {
      ...basePayload,
      to_hash: safeRecipientHash(email),
      template_key: 'one_time_signup_confirmation_v1',
    },
  }, {
    delivery_key: `one-time:rabbi-signup-alert:${contactKey}:v1`,
    idempotency_key: `one-time-rabbi-signup-alert:${contactKey}:v1`,
    channel_key: 'telegram:one_time_rabbi_operator',
    recipient_identity_key: 'one_time_rabbi_operator',
    payload: {
      ...basePayload,
      alert_type: 'new_one_time_signup',
      secure_crm_deep_link: `/provider.html?admin_provider=one-time&section=crm&lead=${encodeURIComponent(String(crmLeadId || ''))}`,
      zoom_url_included: false,
    },
  }];
  if (preference.channels.includes('whatsapp')) {
    events.push({
      delivery_key: `one-time:signup-confirmation-whatsapp:${contactKey}:v1`,
      idempotency_key: `one-time-signup-confirmation-whatsapp:${contactKey}:v1`,
      channel_key: 'whatsapp:one_time_signup_confirmation',
      recipient_identity_key: safeRecipientHash(phone),
      payload: {
        ...basePayload,
        to_hash: safeRecipientHash(phone),
        template_key: 'one_time_signup_whatsapp_confirmation_v1',
      },
    });
  }
  return events;
}

function buildRabbiSignupTelegramAlert({
  contactName,
  signupAs,
  city,
  reminderPreference,
  crmLeadId,
  crmDeepLink,
} = {}) {
  const preference = normalizeReminderPreference(reminderPreference || 'none');
  const selectedCity = city?.id ? city : resolveOneTimeCitySelection(city || {});
  const cityLine = selectedCity.country
    ? `${selectedCity.city}, ${selectedCity.country}`
    : (selectedCity.city || selectedCity.label || 'Not provided');
  return [
    'New One Time signup',
    `- Contact: ${compact(contactName) || 'Not provided'}`,
    `- Signing up as: ${normalizeSignupAs(signupAs)}`,
    `- City: ${cityLine}`,
    `- Reminders: ${preference.label}`,
    `- CRM lead: ${crmLeadId || 'pending'}`,
    `- Review: ${compact(crmDeepLink) || '/provider.html?admin_provider=one-time&section=crm'}`,
  ].join('\n');
}

function buildLocalClassSegmentPreview(rows = []) {
  const seen = new Set();
  const eligibleSeen = new Set();
  let duplicateCount = 0;
  let validEmailCount = 0;
  let suppressedCount = 0;
  const contacts = rows.map((row) => {
    const email = normalizeEmail(row.parent_email || row.email || row.email_address || '');
    const phone = normalizePhoneDigits(row.parent_phone || row.phone || row.whatsapp || '');
    const canonical = email || phone || String(row.id || row.contact_id || '').trim();
    const duplicate = Boolean(canonical && seen.has(canonical));
    if (duplicate) duplicateCount += 1;
    if (canonical) seen.add(canonical);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const suppressed = Boolean(row.suppressed || row.email_suppressed || row.unsubscribed || row.archived);
    if (validEmail) validEmailCount += 1;
    if (suppressed) suppressedCount += 1;
    if (!duplicate && validEmail && !suppressed && canonical) eligibleSeen.add(canonical);
    return {
      masked_reference: `contact:${String(row.id || row.contact_id || 'unknown').replace(/\d(?=\d{2})/g, '*')}`,
      email_present: Boolean(email),
      valid_email: validEmail,
      duplicate,
      suppressed,
      status: row.status || row.contact_status || 'unknown',
    };
  });
  const expectedCount = 3;
  const blockers = [];
  if (rows.length !== expectedCount) blockers.push('count_mismatch');
  if (duplicateCount > 0) blockers.push('duplicate_contacts');
  if (validEmailCount !== rows.length) blockers.push('invalid_or_missing_email');
  if (suppressedCount > 0) blockers.push('suppressed_or_archived_contact');
  return {
    expected_count: expectedCount,
    actual_count: rows.length,
    valid_email_count: validEmailCount,
    duplicate_count: duplicateCount,
    suppressed_count: suppressedCount,
    eligible_email_contact_count: eligibleSeen.size,
    activation_blocked: blockers.length > 0,
    activation_blockers: blockers,
    status: blockers.length === 0 ? 'ready_for_operator_personal_test_gate' : `blocked_${blockers[0]}`,
    contacts,
  };
}

function buildLocalClassReminderActivationPlan(rows = [], {
  operatorPersonalTestPassed = false,
  approvalPhrase = '',
  approvedAt = new Date(),
  approvedBy = 'operator',
} = {}) {
  const preview = buildLocalClassSegmentPreview(rows);
  const blockers = [...(preview.activation_blockers || [])];
  if (operatorPersonalTestPassed !== true) blockers.push('operator_personal_test_required');
  if (compact(approvalPhrase) !== ONE_TIME_LOCAL_CLASS_ACTIVATION_APPROVAL) {
    blockers.push('activation_approval_phrase_required');
  }
  const approvedAtIso = (approvedAt instanceof Date ? approvedAt : new Date(approvedAt)).toISOString();
  const activationBlocked = blockers.length > 0;
  const updates = activationBlocked
    ? []
    : rows.map((row) => {
        const email = normalizeEmail(row.parent_email || row.email || row.email_address || '');
        const phone = normalizePhoneDigits(row.parent_phone || row.phone || row.whatsapp || '');
        const contactId = row.id || row.contact_id || '';
        return {
          contact_id: contactId || null,
          masked_reference: `contact:${String(contactId || 'unknown').replace(/\d(?=\d{2})/g, '*')}`,
          canonical_contact_hash: safeRecipientHash(email || phone || contactId),
          reminder_channels: ['email'],
          whatsapp_reminders_active: false,
          metadata_patch: {
            reminder_source: 'operator_approved_local_class_tag',
            reminder_preference: 'email',
            reminder_channels: ['email'],
            local_class_reminders_active: true,
            operator_approved_at: approvedAtIso,
            operator_approved_by: compact(approvedBy) || 'operator',
            operator_approval_policy_version: ONE_TIME_LOCAL_CLASS_OPERATOR_POLICY_VERSION,
            operator_personal_test_passed: true,
            whatsapp_reminders_active: false,
            no_portal_onboarding: true,
            no_member_login_created: true,
            no_student_portal_created: true,
            no_password_setup: true,
            no_checkout: true,
            no_payment: true,
            no_access_granted: true,
          },
        };
      });
  return {
    approval_required: ONE_TIME_LOCAL_CLASS_ACTIVATION_APPROVAL,
    activation_blocked: activationBlocked,
    activation_blockers: blockers,
    status: activationBlocked ? `blocked_${blockers[0] || 'activation'}` : 'ready_to_activate_email_only_after_operator_test',
    preview,
    update_count: updates.length,
    email_reminder_contact_count: updates.length,
    whatsapp_reminder_contact_count: 0,
    updates,
    no_mutation_performed: true,
    external_send_performed: false,
    no_portal_onboarding: true,
    no_member_login_created: true,
    no_student_portal_created: true,
    no_password_setup: true,
    no_checkout: true,
    no_payment: true,
    no_access_granted: true,
  };
}

function oneTimeClassReminderEnvReadiness(env = process.env) {
  const enabled = /^(?:1|true|yes)$/i.test(String(env.ONE_TIME_CLASS_REMINDERS_ENABLED || '').trim());
  const confirmOk = String(env.ONE_TIME_CLASS_REMINDERS_CONFIRM || '').trim() === 'APPROVE_ONE_TIME_CLASS_REMINDERS';
  const cronSecret = compact(env.CRON_SECRET);
  const blockers = [];
  if (!enabled) blockers.push('ONE_TIME_CLASS_REMINDERS_ENABLED must equal true');
  if (!confirmOk) blockers.push('ONE_TIME_CLASS_REMINDERS_CONFIRM must equal APPROVE_ONE_TIME_CLASS_REMINDERS');
  if (!cronSecret) blockers.push('CRON_SECRET missing');
  return {
    ready: enabled && confirmOk && Boolean(cronSecret),
    enabled,
    confirm_ok: confirmOk,
    cron_secret_configured: Boolean(cronSecret),
    blockers,
  };
}

function oneTimeWapiReminderEnvReadiness(env = process.env) {
  const tokenPresent = Boolean(compact(env.ONE_TIME_WAPI_API_TOKEN || env.ONETIME_WAPI_API_TOKEN || env.RABBI_SHELLER_WAPI_API_TOKEN || env.RABBI_SCHELLER_WAPI_API_TOKEN));
  const apiBasePresent = Boolean(compact(env.ONE_TIME_WAPI_API_BASE_URL || env.ONETIME_WAPI_API_BASE_URL || env.RABBI_SHELLER_WAPI_API_BASE_URL || env.RABBI_SCHELLER_WAPI_API_BASE_URL));
  const instancePresent = Boolean(compact(env.ONE_TIME_WHAPI_INSTANCE_ID || env.ONE_TIME_WAPI_INSTANCE_ID));
  const senderPhone = compact(env.ONE_TIME_WHAPI_PHONE || env.ONE_TIME_WAPI_PHONE);
  const senderDigits = normalizePhoneDigits(senderPhone);
  const requiredSenderDigits = normalizePhoneDigits(env.ONE_TIME_WAPI_REQUIRED_SENDER_DIGITS || env.ONE_TIME_WHATSAPP_REQUIRED_SENDER_DIGITS || '');
  const classLinkPresent = Boolean(compact(env.ONE_TIME_WHATSAPP_CLASS_LINK || env.ONE_TIME_LIVE_CLASS_URL || env.ONE_TIME_ZOOM_JOIN_URL || env.ONE_TIME_TONIGHT_CLASS_LINK || env.ONE_TIME_CURRENT_CLASS_LINK || env.ONETIME_CLASS_LINK));
  const remindersEnabled = /^(?:1|true|yes|live)$/i.test(String(env.ONE_TIME_WHATSAPP_CLASS_REMINDERS_ENABLED || env.ONE_TIME_WAPI_CLASS_REMINDERS_ENABLED || '').trim());
  const reminderConfirm = String(env.ONE_TIME_WHATSAPP_CLASS_REMINDERS_CONFIRM || env.ONE_TIME_WAPI_CLASS_REMINDERS_CONFIRM || '').trim();
  const remindersApproved = reminderConfirm === 'APPROVE_ONE_TIME_WHATSAPP_CLASS_REMINDERS';
  const missing = [];
  if (!tokenPresent) missing.push('ONE_TIME_WAPI_API_TOKEN missing');
  if (!apiBasePresent) missing.push('ONE_TIME_WAPI_API_BASE_URL missing');
  if (!instancePresent) missing.push('ONE_TIME_WHAPI_INSTANCE_ID missing');
  if (!senderDigits) missing.push('ONE_TIME_WHAPI_PHONE missing');
  if (requiredSenderDigits && !senderDigits.includes(requiredSenderDigits)) {
    missing.push('ONE_TIME_WHAPI_PHONE does not match required sender digits');
  }
  if (!classLinkPresent) missing.push('ONE_TIME_WHATSAPP_CLASS_LINK missing');
  if (!remindersEnabled) missing.push('ONE_TIME_WHATSAPP_CLASS_REMINDERS_ENABLED=true');
  if (!remindersApproved) missing.push('ONE_TIME_WHATSAPP_CLASS_REMINDERS_CONFIRM=APPROVE_ONE_TIME_WHATSAPP_CLASS_REMINDERS');
  return {
    ready: missing.length === 0,
    missing,
    enabled: remindersEnabled,
    approved: remindersApproved,
    sender_binding_configured: Boolean(senderDigits),
    required_sender_digits_configured: Boolean(requiredSenderDigits),
    qr_action_if_auth_expired: 'Rabbi Scheller must scan the Whapi channel QR from his WhatsApp phone.',
  };
}

module.exports = {
  ONE_TIME_CITY_OPTIONS,
  ONE_TIME_CLASS_HOUR,
  ONE_TIME_CLASS_MINUTE,
  ONE_TIME_CLASS_TIME_ZONE,
  ONE_TIME_LOCAL_CLASS_ACTIVATION_APPROVAL,
  ONE_TIME_LOCAL_CLASS_OPERATOR_POLICY_VERSION,
  ONE_TIME_REMINDER_CONSENT_POLICY_VERSION,
  ONE_TIME_REMINDER_MINUTES_BEFORE,
  ONE_TIME_SCHEDULE_VERSION,
  REMINDER_PREFERENCES,
  buildClassTimeDisplay,
  buildLocalClassReminderActivationPlan,
  buildLocalClassSegmentPreview,
  buildOneTimeClassReminderMessage,
  buildOneTimeSignupConfirmationEmail,
  buildOneTimeSignupLeadInput,
  buildOneTimeSignupOutboxEvents,
  buildRabbiSignupTelegramAlert,
  buildReminderIdempotencyKey,
  findOneTimeCitySelection,
  formatRecipientLocalTime,
  nextOneTimeClassSchedule,
  normalizeIanaTimezone,
  normalizeReminderPreference,
  oneTimeClassReminderEnvReadiness,
  oneTimeWapiReminderEnvReadiness,
  reminderChannelsForPreference,
  requiresPhoneForReminderPreference,
  resolveOneTimeCitySelection,
  safeRecipientHash,
  timezoneOffsetMs,
  zonedWallTimeToUtc,
};
