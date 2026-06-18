const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { google } = require('googleapis');
const {
  GOAL_TYPES,
  calculateDailyCompletedUnits,
  calculateGroupTorahProgress,
  calculateStudentTorahProgress,
  calculateStudentTripProgress,
  dailyCompletionPercentageFromEntry,
  dailyTripUnitFromEntry,
  normalizeParsedTorahEngagement,
  normalizeGoalType,
  validateGoalMinutes,
  validateNonNegativeMinutes,
  validatePositiveNumber,
} = require('./src/lib/bna/torah-learning');
const {
  normalizeDigits,
  normalizeGreenInvoiceWebhookPayload,
} = require('./src/lib/bna/green-invoice');
const {
  goalBoardBucket,
  goalBoardStatus,
  metadataAfterProgressUpdate,
  metadataWithGoalBoard,
  normalizeGoalBoardMetadata,
  rawGoalBoardMetadata,
  safeGoalBoardStudentView,
  automaticDeviceAccessForCompletion,
} = require('./src/lib/bna/goal-board');
const {
  DEVICE_ACCESS_STATES,
  createDeviceControlProvider,
  deviceAccessStateLabel,
  normalizeDeviceAccessState,
  normalizeDurationMinutes,
} = require('./src/lib/bna/device-control');
const {
  assertWorkspaceType,
  createSuperAdminIdentity,
  createWorkspaceIdentity,
  isGlobalOpsScope,
} = require('./src/lib/bna/workspace-scope');
const {
  assertScopedTaskAccess,
  scopedRouteAllowed,
} = require('./src/lib/bna/workspace-auth');

const app = express();
const PORT = process.env.PORT || 8080;

const DEFAULT_PROJECT_KEY = 'bna';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const DEFAULT_WORKSPACE_KEY = DEFAULT_PROJECT_KEY;
const ONE_TIME_WORKSPACE_KEY = ONE_TIME_PROJECT_KEY;
const BNA_TASK_CATEGORIES = [
  'admin',
  'marketing',
  'parent_coaching',
  'student_operations',
  'finance',
  'legal',
  'communications',
  'operations',
  'accountability',
];
const ONE_TIME_TASK_CATEGORIES = [
  'content',
  'technology',
  'accounting',
  'ghl_setup',
  'community',
  'general',
  'torah_class_prep',
  'source_sheets',
  'shiur_ideas',
];
const ALL_TASK_CATEGORIES = [...new Set([...BNA_TASK_CATEGORIES, ...ONE_TIME_TASK_CATEGORIES])];

function readLocalSecretFile(name) {
  try {
    return fs.readFileSync(path.join(__dirname, '.secrets', name), 'utf8').trim();
  } catch {
    return '';
  }
}

function usableSecretValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.includes('[YOUR-PASSWORD]')) return '';
  return normalized;
}

// Environment variables - NO FALLBACKS for production
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPS_USERNAME = process.env.OPS_USERNAME;
const OPS_PASSWORD = process.env.OPS_PASSWORD;
const ONE_TIME_OPS_USERNAME =
  process.env.ONE_TIME_OPS_USERNAME ||
  process.env.RABBI_ELIE_SCHELLER_OPS_USERNAME ||
  '';
const ONE_TIME_OPS_PASSWORD =
  process.env.ONE_TIME_OPS_PASSWORD ||
  process.env.RABBI_ELIE_SCHELLER_OPS_PASSWORD ||
  '';
const TELEGRAM_CHAT_ID_BNA =
  process.env.TELEGRAM_CHAT_ID_BNA ||
  process.env.TELEGRAM_CHAT_ID_SHLOIMIE ||
  '';
const DATABASE_URL =
  usableSecretValue(process.env.DATABASE_URL) ||
  usableSecretValue(readLocalSecretFile('railway-database-url.txt'));
const PAYMENT_LINK = process.env.PAYMENT_LINK || 'https://mrng.to/rCH4DWiR5t';
const DEFAULT_TUITION_AMOUNT = Number(process.env.BNA_TUITION_AMOUNT || 1000);
const DEFAULT_PAYMENT_INTERVAL_DAYS = Number(process.env.BNA_PAYMENT_INTERVAL_DAYS || 30);
const PAYMENT_REMINDER_DAYS_BEFORE = Number(process.env.BNA_PAYMENT_REMINDER_DAYS_BEFORE || 5);
const WAIVER_VERSION = process.env.BNA_WAIVER_VERSION || '2026-05-28-v1';
const TUITION_AGREEMENT_VERSION = process.env.BNA_TUITION_AGREEMENT_VERSION || '2026-06-07-v1';
const TUITION_AGREEMENT_TITLE = 'Bnei Neviim Academy Tuition Agreement';
const TUITION_AGREEMENT_TEXT = `Bnei Neviim Academy is a private Torah learning and mentoring program. It is not a Ministry of Education-recognized school. Parents are responsible for arranging any legal homeschooling registration or other educational status required for their child.

The standard tuition rate is ₪1,000 per month, or ₪12,000 for a full tuition year.

The tuition year runs from July 1 through June 30. Tuition is billed according to the civil calendar and is due at the beginning of each civil month. The program schedule itself follows the Jewish calendar.

There is no separate signup fee. A place in the program is reserved only once the first tuition payment has been made and the required registration forms have been signed.

For students who join after the beginning of a month, tuition may be prorated based on the student’s start date, calculated according to the number of calendar days in that month.

For students who paid at the end of May 2026, that payment will be applied to June 2026 tuition. The next regular tuition payment is due July 1, 2026.

Once a month has begun, the full tuition for that month is due and non-refundable. This applies even if the child attends for only part of the month, only one week, or only a few days.

If a parent wishes to withdraw a child from the program, 30 days’ notice is required. Tuition remains due during the 30-day notice period. If the notice period continues into a new month, tuition for that month is also due.

Scheduled breaks, Jewish holidays, Chol HaMoed, fast days, summer breaks, and other calendar adjustments do not reduce the monthly tuition amount. Tuition reserves the child’s place in the program and supports the continuity of the program as a whole.

Payment may be made by cash, bank transfer, credit card, or another method approved by the program director.`;
const TUITION_AGREEMENT_TEXT_HE = `Bnei Neviim Academy היא תכנית פרטית ללימוד תורה וליווי אישי. היא אינה בית ספר המוכר על ידי משרד החינוך. ההורים אחראים להסדיר כל רישום לחינוך ביתי או כל מעמד חינוכי אחר הנדרש על פי דין עבור ילדם.

שכר הלימוד הרגיל הוא 1,000 ש"ח לחודש, או 12,000 ש"ח לשנת לימוד מלאה.

שנת שכר הלימוד נמשכת מ-1 ביולי עד 30 ביוני. שכר הלימוד מחויב לפי הלוח האזרחי והוא לתשלום בתחילת כל חודש אזרחי. סדר התכנית עצמה פועל לפי הלוח היהודי.

אין תשלום הרשמה נפרד. מקום בתכנית נשמר רק לאחר שהתשלום הראשון של שכר הלימוד שולם והטפסים הנדרשים נחתמו.

לתלמידים המצטרפים לאחר תחילת חודש, שכר הלימוד עשוי להיות מחושב באופן יחסי לפי תאריך תחילת ההשתתפות, בהתאם למספר הימים הקלנדריים באותו חודש.

לתלמידים ששילמו בסוף מאי 2026, התשלום יחול על שכר הלימוד של יוני 2026. התשלום הרגיל הבא לתשלום הוא ב-1 ביולי 2026.

לאחר שהחודש התחיל, שכר הלימוד המלא עבור אותו חודש חל ואינו ניתן להחזר. הדבר נכון גם אם הילד השתתף רק בחלק מהחודש, שבוע אחד, או מספר ימים.

אם הורה מבקש להוציא את הילד מהתכנית, נדרשת הודעה מוקדמת של 30 יום. שכר הלימוד ממשיך לחול במהלך תקופת ההודעה. אם תקופת ההודעה נמשכת לתוך חודש חדש, שכר הלימוד עבור אותו חודש חל גם כן.

חופשות מתוכננות, חגים, חול המועד, תעניות, חופשות קיץ ושינויים בלוח השנה אינם מפחיתים את שכר הלימוד החודשי. שכר הלימוד שומר את מקומו של הילד בתכנית ותומך ברציפות התכנית כולה.

ניתן לשלם במזומן, העברה בנקאית, כרטיס אשראי, או דרך אחרת שאושרה על ידי מנהל התכנית.`;
const REGISTRATION_PACKAGE_VERSION = process.env.BNA_REGISTRATION_PACKAGE_VERSION || '2026-2027-v1';
const REGISTRATION_PACKAGE_TITLE = 'Bnei Neviim Academy Registration Documents Package';
const REGISTRATION_PACKAGE_PATH = path.join(__dirname, 'public', 'documents', 'bnei_neviim_registration_documents_bilingual_codex.md');
const REGISTRATION_PACKAGE_TEXT = (() => {
  try {
    return fs.readFileSync(REGISTRATION_PACKAGE_PATH, 'utf8');
  } catch (error) {
    console.warn('Registration document package could not be loaded:', error.message);
    return 'Bnei Neviim Academy Registration Documents Package';
  }
})();
const REQUIRED_SIGNUP_AGREEMENT_DEFINITIONS = [
  {
    agreement_type: 'tuition_agreement',
    package_index: null,
    version: TUITION_AGREEMENT_VERSION,
    title: {
      en: TUITION_AGREEMENT_TITLE,
      he: 'הסכם שכר לימוד - Bnei Neviim Academy',
    },
  },
  {
    agreement_type: 'parent_handbook',
    package_index: 1,
    version: REGISTRATION_PACKAGE_VERSION,
    title: {
      en: 'Bnei Neviim Academy Parent Handbook',
      he: 'מדריך הורים - Bnei Neviim Academy',
    },
  },
  {
    agreement_type: 'student_code_of_conduct',
    package_index: 2,
    version: REGISTRATION_PACKAGE_VERSION,
    title: {
      en: 'Bnei Neviim Academy Student Handbook / Code of Conduct',
      he: 'מדריך תלמידים / קוד התנהגות - Bnei Neviim Academy',
    },
  },
  {
    agreement_type: 'safety_acknowledgment_waiver',
    package_index: 3,
    version: REGISTRATION_PACKAGE_VERSION,
    title: {
      en: 'Bnei Neviim Academy Safety Acknowledgment and Waiver',
      he: 'אישור בטיחות, הצהרה וויתור - Bnei Neviim Academy',
    },
  },
];
const BNA_TIME_ZONE = process.env.BNA_TIME_ZONE || 'Asia/Jerusalem';
const DEFAULT_TORAH_GOAL_MINUTES = Number(process.env.BNA_DEFAULT_TORAH_GOAL_MINUTES || 10);
const DEFAULT_TORAH_TRIP_REQUIRED_UNITS = Number(process.env.BNA_TORAH_TRIP_REQUIRED_UNITS || 30);
const DEFAULT_TORAH_MIGRATION_CARRIED_OVER_UNITS = Number(process.env.BNA_TORAH_CARRIED_OVER_UNITS || 3.5);
const TORAH_TEMP_SEED_DATE = '2026-06-03';
const WEBSITE_BLOG_STORE_PATH = path.join(__dirname, 'content-memory', 'website-blog-posts.json');
const PUBLIC_WEBSITE_BLOG_PATH = path.join(__dirname, 'public', 'data', 'website-blog-posts.json');
const STATIC_WEBSITE_CONTENT_PATH = path.join(__dirname, 'public', 'js', 'bna-content.js');
const OPENAI_API_KEY = usableSecretValue(process.env.OPENAI_API_KEY);
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const KIMI_API_KEY =
  usableSecretValue(process.env.KIMI_API_KEY) ||
  usableSecretValue(readLocalSecretFile('kimi-api-key.txt'));
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1';
const KIMI_MODEL = process.env.KIMI_MODEL || 'kimi-k2.6';
const CONTENT_AI_API_KEY = OPENAI_API_KEY || KIMI_API_KEY;
const CONTENT_AI_BASE_URL = OPENAI_API_KEY ? OPENAI_BASE_URL : KIMI_BASE_URL;
const CONTENT_AI_MODEL = OPENAI_API_KEY ? OPENAI_MODEL : KIMI_MODEL;
const CONTENT_AI_PROVIDER = OPENAI_API_KEY ? 'openai' : 'kimi';

function contentAiFallbackConfig() {
  if (CONTENT_AI_PROVIDER === 'openai' && KIMI_API_KEY) {
    return {
      provider: 'kimi',
      apiKey: KIMI_API_KEY,
      baseUrl: KIMI_BASE_URL,
      model: KIMI_MODEL,
    };
  }
  if (CONTENT_AI_PROVIDER === 'kimi' && OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: OPENAI_API_KEY,
      baseUrl: OPENAI_BASE_URL,
      model: OPENAI_MODEL,
    };
  }
  return null;
}
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  'https://bneineviimacademy.org/api/google/oauth/callback';
const GOOGLE_SCOPES = (process.env.GOOGLE_SCOPES || [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ')).split(/\s+/).filter(Boolean);
const GOOGLE_DRIVE_PIPELINE_ROOT_NAME = process.env.GOOGLE_DRIVE_PIPELINE_ROOT_NAME || 'BNA V2';

if (!DATABASE_URL && require.main === module) {
  console.error('FATAL: DATABASE_URL not set');
  process.exit(1);
}

if ((!OPS_USERNAME || !OPS_PASSWORD) && require.main === module) {
  console.error('FATAL: OPS_USERNAME and OPS_PASSWORD must be set');
  process.exit(1);
}

function parseEnvBlock(rawValue) {
  if (!rawValue) return {};
  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) return acc;
      acc[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1).trim();
      return acc;
    }, {});
}

function loadEnvBlockFile(filePath) {
  try {
    return parseEnvBlock(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

const localGhlSecrets = loadEnvBlockFile(path.join(__dirname, '.secrets', 'ghl-pit-token.txt'));
const inlineGhlSecrets = parseEnvBlock(process.env.GHL_PIT_TOKEN || '');

function pickRawValue(envValue, inlineValue, fileValue) {
  if (envValue && !envValue.includes('\n') && !envValue.startsWith('GHL_PIT_TOKEN=')) {
    return envValue.trim();
  }
  return inlineValue || fileValue || '';
}

// GHL Configuration
const GHL_PIT_TOKEN = pickRawValue(
  process.env.GHL_PIT_TOKEN,
  inlineGhlSecrets.GHL_PIT_TOKEN,
  localGhlSecrets.GHL_PIT_TOKEN
);
const GHL_LOCATION_ID =
  process.env.GHL_LOCATION_ID ||
  inlineGhlSecrets.GHL_LOCATION_ID ||
  localGhlSecrets.GHL_LOCATION_ID ||
  'IIofSrquLHvNxc8zrpka';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const GHL_SOCIAL_API_VERSION = '2023-02-21';
const GHL_DEFAULT_FACEBOOK_ACCOUNT_ID =
  process.env.GHL_DEFAULT_FACEBOOK_ACCOUNT_ID ||
  inlineGhlSecrets.GHL_DEFAULT_FACEBOOK_ACCOUNT_ID ||
  localGhlSecrets.GHL_DEFAULT_FACEBOOK_ACCOUNT_ID ||
  process.env.GHL_FACEBOOK_ACCOUNT_ID ||
  inlineGhlSecrets.GHL_FACEBOOK_ACCOUNT_ID ||
  localGhlSecrets.GHL_FACEBOOK_ACCOUNT_ID ||
  '';
const BUFFER_ACCESS_TOKEN = String(process.env.BUFFER_ACCESS_TOKEN || process.env.BUFFER_API_TOKEN || '').trim();
const BUFFER_PROFILE_FACEBOOK_ID = String(process.env.BUFFER_PROFILE_FACEBOOK_ID || process.env.BUFFER_FACEBOOK_PROFILE_ID || '').trim();
const BUFFER_PROFILE_FACEBOOK_LABEL = String(process.env.BUFFER_PROFILE_FACEBOOK_LABEL || process.env.BUFFER_FACEBOOK_PROFILE_LABEL || '').trim();
const BUFFER_PROFILE_LINKEDIN_ID = String(process.env.BUFFER_PROFILE_LINKEDIN_ID || process.env.BUFFER_LINKEDIN_PROFILE_ID || '').trim();
const BUFFER_PROFILE_LINKEDIN_LABEL = String(process.env.BUFFER_PROFILE_LINKEDIN_LABEL || process.env.BUFFER_LINKEDIN_PROFILE_LABEL || '').trim();
const BUFFER_PROFILE_YOUTUBE_ID = String(process.env.BUFFER_PROFILE_YOUTUBE_ID || process.env.BUFFER_YOUTUBE_PROFILE_ID || '').trim();
const BUFFER_PROFILE_YOUTUBE_LABEL = String(process.env.BUFFER_PROFILE_YOUTUBE_LABEL || process.env.BUFFER_YOUTUBE_PROFILE_LABEL || '').trim();
const BUFFER_SOCIAL_LAST_ERROR = String(process.env.BUFFER_SOCIAL_LAST_ERROR || process.env.BUFFER_LAST_ERROR || '').trim();
const SESSION_COOKIE_NAME = 'bna_ops_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

// Sessions table SQL
const createSessionsSQL = `
CREATE TABLE IF NOT EXISTS bna_sessions (
  session_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_sessions_expires ON bna_sessions(expires_at);
`;

function loadGoogleOAuthClient() {
  const localClientPath = path.join(__dirname, '.secrets', 'google-oauth-client.json');
  const localClient = (() => {
    try {
      const parsed = JSON.parse(fs.readFileSync(localClientPath, 'utf8'));
      return parsed.web || parsed.installed || {};
    } catch {
      return {};
    }
  })();

  return {
    clientId: process.env.GOOGLE_CLIENT_ID || localClient.client_id || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || localClient.client_secret || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || localClient.redirect_uris?.[0] || GOOGLE_REDIRECT_URI,
  };
}

function createGoogleOAuthClient(redirectUri = GOOGLE_REDIRECT_URI) {
  const config = loadGoogleOAuthClient();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Google OAuth client is not configured');
  }
  return new google.auth.OAuth2(config.clientId, config.clientSecret, redirectUri || config.redirectUri);
}

function createGoogleClientFromRefreshToken() {
  const oauth2Client = createGoogleOAuthClient(GOOGLE_REDIRECT_URI);
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || readLocalSecretFile('google-refresh-token.txt');
  if (!refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not configured');
  }
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function encodeGmailMessage({ to, from, subject, text, html }) {
  const boundary = `bna_${Date.now()}`;
  const encodedSubject = Buffer.from(String(subject || ''), 'utf8').toString('base64');
  const encodePart = (value) => Buffer
    .from(String(value || ''), 'utf8')
    .toString('base64')
    .replace(/.{1,76}/g, '$&\r\n')
    .trim();
  const headers = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: =?UTF-8?B?${encodedSubject}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodePart(text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodePart(html || text),
    `--${boundary}--`,
  ];
  return Buffer.from(`${headers.join('\r\n')}\r\n\r\n${body.join('\r\n')}`)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function toIsoDateValue(value) {
  if (!value) return '';
  if (value instanceof Date) {
    const parts = getDatePartsInTimeZone(value, BNA_TIME_ZONE);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  if (Number.isFinite(parsed.getTime())) {
    const parts = getDatePartsInTimeZone(parsed, BNA_TIME_ZONE);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  return text.slice(0, 10);
}

function getDatePartsInTimeZone(date = new Date(), timeZone = BNA_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
}

function getTodayDateInTimeZone(timeZone = BNA_TIME_ZONE) {
  const parts = getDatePartsInTimeZone(new Date(), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function firstDayOfMonth(dateString) {
  const value = toIsoDateValue(dateString);
  return `${value.slice(0, 7)}-01`;
}

function addMonthsToDateString(dateString, monthsToAdd) {
  const [year, month, day] = toIsoDateValue(dateString)
    .split('-')
    .map((value) => Number(value));
  const date = new Date(Date.UTC(year, (month || 1) - 1 + Number(monthsToAdd || 0), day || 1));
  return toDateOnly(date);
}

function addDaysToDateString(dateString, daysToAdd) {
  const date = new Date(`${toIsoDateValue(dateString)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Number(daysToAdd || 0));
  return toDateOnly(date);
}

function diffCalendarMonths(startDateString, endDateString) {
  const [startYear, startMonth] = toIsoDateValue(startDateString).slice(0, 7).split('-').map(Number);
  const [endYear, endMonth] = toIsoDateValue(endDateString).slice(0, 7).split('-').map(Number);
  return (endYear - startYear) * 12 + (endMonth - startMonth);
}

function normalizeLooseText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, '');
}

function normalizeLanguage(value) {
  return String(value || '').toLowerCase().startsWith('he') ? 'he' : 'en';
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

async function findExistingSignupForRegistration({ parentEmail, parentPhone, parentName, studentName }) {
  const studentKey = normalizeLooseText(studentName);
  if (!studentKey) return null;

  const parentEmailKey = String(parentEmail || '').trim().toLowerCase();
  const parentPhoneKey = normalizePhoneDigits(parentPhone);
  const parentNameKey = normalizeLooseText(parentName);

  const result = await pool.query(
    `SELECT *
     FROM signups
     WHERE COALESCE(status, 'new') <> 'archived'
       AND (
         ($1 <> '' AND lower(parent_email) = $1)
         OR ($2 <> '' AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $2)
         OR ($3 <> '' AND lower(student_name) = $3)
         OR ($4 <> '' AND lower(parent_name) = $4)
       )
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 50`,
    [
      parentEmailKey,
      parentPhoneKey,
      String(studentName || '').trim().toLowerCase(),
      String(parentName || '').trim().toLowerCase(),
    ]
  );

  return result.rows.find((signup) => {
    if (normalizeLooseText(signup.student_name) !== studentKey) return false;
    return (
      (parentEmailKey && String(signup.parent_email || '').trim().toLowerCase() === parentEmailKey)
      || (parentPhoneKey && normalizePhoneDigits(signup.parent_phone) === parentPhoneKey)
      || (parentNameKey && normalizeLooseText(signup.parent_name) === parentNameKey)
    );
  }) || null;
}

async function sendGmailMessage({ to, subject, text, html }) {
  const auth = createGoogleClientFromRefreshToken();
  const gmail = google.gmail({ version: 'v1', auth });
  const fromEmail = process.env.GMAIL_FROM || 'me';
  const fromName = process.env.GMAIL_FROM_NAME || 'Bnei Neviim Academy Office';
  const from = fromEmail === 'me' ? fromEmail : `"${fromName}" <${fromEmail}>`;
  const raw = encodeGmailMessage({ to, from, subject, text, html });
  return gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}

async function logEmail({
  signupId = null,
  emailType,
  to,
  subject,
  language = 'en',
  providerMessageId = null,
  status = 'sent',
  error = null,
  metadata = null,
}) {
  let workspaceId = null;
  if (signupId) {
    const signup = (await pool.query('SELECT workspace_id FROM signups WHERE id = $1 LIMIT 1', [signupId])).rows[0];
    workspaceId = signup?.workspace_id || null;
  }
  if (!workspaceId) workspaceId = (await getDefaultSchoolWorkspace(pool)).id;
  await pool.query(
    `INSERT INTO bna_email_log (
      workspace_id, signup_id, email_type, recipient_email, subject, language,
      provider_message_id, status, error, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      workspaceId,
      signupId,
      emailType,
      to,
      subject,
      normalizeLanguage(language),
      providerMessageId,
      status,
      error,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
}

function signupConfirmationEmail(signup, { matchedPayment = null } = {}) {
  const lang = normalizeLanguage(signup.form_language);
  const dueDate = signup.payment_due_date ? toDateOnly(signup.payment_due_date) : toDateOnly(addDays(signup.created_at || new Date(), DEFAULT_PAYMENT_INTERVAL_DAYS));
  const amount = Number(signup.payment_amount || DEFAULT_TUITION_AMOUNT);
  const isPaid = signup.payment_status === 'paid' || Boolean(matchedPayment);
  const paymentMethod = signup.payment_method === 'cash'
    ? 'cash'
    : signup.payment_method === 'bank_transfer'
      ? 'bank_transfer'
      : 'credit';

  if (lang === 'he') {
    const subject = 'ברוכים הבאים ל-Bnei Neviim Academy';
    const text = [
      `${signup.parent_name || 'שלום'}, שלום`,
      '',
      `ברוכים הבאים ל-Bnei Neviim Academy. קיבלנו את טופס ההרשמה עבור ${signup.student_name}, ושמרנו את הפרטים במערכת.`,
      isPaid
        ? `התשלום בסך ${amount} ש"ח נרשם אצלנו.`
        : paymentMethod === 'cash'
          ? `בחרתם תשלום במזומן. התשלום בסך ${amount} ש"ח עדיין מסומן כפתוח במערכת.`
          : paymentMethod === 'bank_transfer'
            ? `בחרתם תשלום בהעברה בנקאית. התשלום הראשון של שכר הלימוד בסך ${amount} ש"ח עדיין מסומן כפתוח במערכת עד שנאשר את קבלתו.`
            : `בחרתם תשלום באשראי. אם עדיין לא השלמתם את התשלום, אנא השתמשו בקישור התשלום שקיבלתם לאחר השליחה.`,
      `החיוב הבא/תזכורת התשלום הבאה נקבעת כל ${signup.payment_interval_days || DEFAULT_PAYMENT_INTERVAL_DAYS} יום. התאריך הבא במערכת: ${dueDate}.`,
      '',
      'שמחים להתחיל את התהליך יחד.',
      '',
      'בברכה,',
      'משרד Bnei Neviim Academy',
    ].join('\n');
    return { subject, text, html: `<div dir="rtl">${text.replace(/\n/g, '<br>')}</div>` };
  }

  const subject = 'Welcome to Bnei Neviim Academy';
  const text = [
    `Hi ${signup.parent_name || ''},`,
    '',
    `Welcome to Bnei Neviim Academy. We received the signup form for ${signup.student_name}, and the details are now saved in our system.`,
    isPaid
      ? `Your payment of ILS ${amount} has been recorded in our system.`
      : paymentMethod === 'cash'
        ? `You selected cash. The ILS ${amount} payment is still marked as due in our system.`
        : paymentMethod === 'bank_transfer'
          ? `You selected bank transfer. The ILS ${amount} first tuition payment is still marked as due until we confirm receipt.`
        : 'You selected credit. If you have not completed payment yet, please use the payment link from the confirmation page.',
    `Payments are tracked every ${signup.payment_interval_days || DEFAULT_PAYMENT_INTERVAL_DAYS} days. The next due date in our system is ${dueDate}.`,
    '',
    'We are looking forward to beginning the process together.',
    '',
    'Thank you,',
    'Bnei Neviim Academy Office',
  ].join('\n');
  return { subject, text, html: text.replace(/\n/g, '<br>') };
}

async function sendSignupConfirmationEmail(signup, options = {}) {
  const email = signupConfirmationEmail(signup, options);
  try {
    const result = await sendGmailMessage({
      to: signup.parent_email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    await logEmail({
      signupId: signup.id,
      emailType: 'signup_confirmation',
      to: signup.parent_email,
      subject: email.subject,
      language: signup.form_language,
      providerMessageId: result.data.id,
      metadata: { payment_method: signup.payment_method, payment_due_date: signup.payment_due_date },
    });
    await pool.query(
      `UPDATE signups
       SET confirmation_email_sent_at = NOW(), confirmation_email_error = NULL
       WHERE id = $1`,
      [signup.id]
    );
    return { ok: true, id: result.data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logEmail({
      signupId: signup.id,
      emailType: 'signup_confirmation',
      to: signup.parent_email,
      subject: email.subject,
      language: signup.form_language,
      status: 'failed',
      error: message,
    }).catch(() => {});
    await pool.query(
      `UPDATE signups SET confirmation_email_error = $1 WHERE id = $2`,
      [message, signup.id]
    ).catch(() => {});
    return { ok: false, error: message };
  }
}

function paymentReminderEmail(signup) {
  const lang = normalizeLanguage(signup.form_language);
  const amount = Number(signup.payment_amount || DEFAULT_TUITION_AMOUNT);
  const dueDate = signup.payment_due_date ? toDateOnly(signup.payment_due_date) : '';

  if (lang === 'he') {
    const subject = 'תזכורת תשלום - Bnei Neviim Academy';
    const text = [
      `${signup.parent_name || 'שלום'},`,
      '',
      `זוהי תזכורת ידידותית שהתשלום הבא עבור ${signup.student_name} בסך ${amount} ש"ח אמור להתקבל בתאריך ${dueDate}.`,
      'אם כבר שילמתם, תודה רבה - נעדכן את המערכת בהתאם.',
      '',
      'בברכה,',
      'משרד Bnei Neviim Academy',
    ].join('\n');
    return { subject, text, html: `<div dir="rtl">${text.replace(/\n/g, '<br>')}</div>` };
  }

  const subject = 'Payment reminder - Bnei Neviim Academy';
  const text = [
    `Hi ${signup.parent_name || ''},`,
    '',
    `This is a friendly reminder that the next payment for ${signup.student_name}, ILS ${amount}, is due on ${dueDate}.`,
    'If you already paid, thank you - we will update the system accordingly.',
    '',
    'Thank you,',
    'Bnei Neviim Academy Office',
  ].join('\n');
  return { subject, text, html: text.replace(/\n/g, '<br>') };
}

async function getPaymentReminderCandidates({ daysBefore = PAYMENT_REMINDER_DAYS_BEFORE, limit = 100, projectKey = '' } = {}) {
  const today = toDateOnly(new Date());
  const reminderTarget = toDateOnly(addDays(new Date(), Number(daysBefore) || PAYMENT_REMINDER_DAYS_BEFORE));
  const params = [reminderTarget, today];
  const conditions = [
    's.payment_due_date IS NOT NULL',
    "COALESCE(s.status, 'new') <> 'archived'",
    's.payment_due_date <= $1::date',
    "s.payment_status IN ('pending', 'paid', 'partial')",
    '(s.payment_reminder_sent_at IS NULL OR s.payment_reminder_sent_at::date < $2::date)',
  ];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  params.push(Math.min(Number(limit) || 100, 500));
  const result = await pool.query(
    `SELECT s.*,
            proj.project_key,
            proj.name AS project_name,
            proj.short_name AS project_short_name,
            w.workspace_key,
            w.workspace_type,
            w.name AS workspace_name
     FROM signups s
     LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
     LEFT JOIN LATERAL (
       SELECT p.project_key, p.name, p.short_name
       FROM bna_projects p
       WHERE p.workspace_id = s.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.payment_due_date ASC
     LIMIT $${params.length}`,
    params
  );

  return {
    today,
    reminderTarget,
    project: projectKey || 'all',
    candidates: result.rows,
  };
}

function summarizePaymentReminderCandidate(signup) {
  const email = paymentReminderEmail(signup);
  return {
    signup_id: signup.id,
    parent_name: signup.parent_name,
    student_name: signup.student_name,
    parent_email: signup.parent_email,
    payment_method: signup.payment_method,
    payment_status: signup.payment_status,
    payment_amount: signup.payment_amount || DEFAULT_TUITION_AMOUNT,
    payment_due_date: signup.payment_due_date,
    last_payment_at: signup.last_payment_at,
    language: normalizeLanguage(signup.form_language),
    project_key: signup.project_key || signup.workspace_key || null,
    project_name: signup.project_name || signup.workspace_name || null,
    project_short_name: signup.project_short_name || null,
    workspace_key: signup.workspace_key || null,
    workspace_name: signup.workspace_name || null,
    subject: email.subject,
  };
}

async function runPaymentReminderSweep({ dryRun = false, daysBefore = PAYMENT_REMINDER_DAYS_BEFORE, projectKey = '' } = {}) {
  const { reminderTarget, candidates, project } = await getPaymentReminderCandidates({ daysBefore, projectKey });

  const sent = [];
  const failed = [];
  for (const signup of candidates) {
    const email = paymentReminderEmail(signup);
    if (dryRun) {
      sent.push({ ...summarizePaymentReminderCandidate(signup), to: signup.parent_email, dryRun: true });
      continue;
    }

    try {
      const gmailResult = await sendGmailMessage({
        to: signup.parent_email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      await logEmail({
        signupId: signup.id,
        emailType: 'payment_reminder',
        to: signup.parent_email,
        subject: email.subject,
        language: signup.form_language,
        providerMessageId: gmailResult.data.id,
        metadata: { payment_due_date: signup.payment_due_date },
      });
      await pool.query(
        'UPDATE signups SET payment_reminder_sent_at = NOW(), updated_at = NOW() WHERE id = $1',
        [signup.id]
      );
      sent.push({ signup_id: signup.id, to: signup.parent_email, id: gmailResult.data.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await logEmail({
        signupId: signup.id,
        emailType: 'payment_reminder',
        to: signup.parent_email,
        subject: email.subject,
        language: signup.form_language,
        status: 'failed',
        error: message,
      }).catch(() => {});
      failed.push({ signup_id: signup.id, to: signup.parent_email, error: message });
    }
  }

  return {
    success: failed.length === 0,
    dryRun,
    reminderTarget,
    project,
    found: candidates.length,
    sent,
    failed,
  };
}

function startPaymentReminderScheduler() {
  if (String(process.env.PAYMENT_REMINDER_SCHEDULER || 'on').toLowerCase() === 'off') return;
  const intervalMs = Number(process.env.PAYMENT_REMINDER_SWEEP_MS || 6 * 60 * 60 * 1000);
  setInterval(() => {
    runPaymentReminderSweep({ projectKey: DEFAULT_PROJECT_KEY })
      .then((result) => {
        if (result.found || result.failed.length) {
          console.log(`Payment reminder sweep: found=${result.found} sent=${result.sent.length} failed=${result.failed.length}`);
        }
      })
      .catch((error) => console.error('Payment reminder sweep failed:', error));
  }, intervalMs).unref();
}

async function findDriveFolder(drive, name, parentId = 'root') {
  const safeName = String(name).replace(/'/g, "\\'");
  const safeParent = String(parentId).replace(/'/g, "\\'");
  const result = await drive.files.list({
    q: [
      "mimeType='application/vnd.google-apps.folder'",
      'trashed=false',
      `name='${safeName}'`,
      `'${safeParent}' in parents`,
    ].join(' and '),
    fields: 'files(id,name,webViewLink)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return result.data.files?.[0] || null;
}

async function ensureDriveFolder(drive, name, parentId = 'root') {
  const existing = await findDriveFolder(drive, name, parentId);
  if (existing) return { ...existing, created: false };

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId === 'root' ? undefined : [parentId],
    },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true,
  });
  return { ...created.data, created: true };
}

async function ensureGoogleDoc(drive, name, parentId) {
  const safeName = String(name).replace(/'/g, "\\'");
  const safeParent = String(parentId).replace(/'/g, "\\'");
  const existing = await drive.files.list({
    q: [
      "mimeType='application/vnd.google-apps.document'",
      'trashed=false',
      `name='${safeName}'`,
      `'${safeParent}' in parents`,
    ].join(' and '),
    fields: 'files(id,name,webViewLink)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  if (existing.data.files?.[0]) return { ...existing.data.files[0], created: false };

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentId],
    },
    fields: 'id,name,webViewLink',
    supportsAllDrives: true,
  });
  return { ...created.data, created: true };
}

async function ensureBnaDrivePipeline(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const root = await ensureDriveFolder(drive, GOOGLE_DRIVE_PIPELINE_ROOT_NAME, 'root');
  const websiteMomentsIntake = await ensureDriveFolder(drive, '00 Upload Here - Website Images', root.id);
  const rawIntake = await ensureDriveFolder(drive, '00 Upload Here - Raw Media Intake', root.id);
  const processing = await ensureDriveFolder(drive, '10 Processing - Temporary', root.id);
  const processed = await ensureDriveFolder(drive, '20 Processed Recordings - Source Media', root.id);
  const approved = await ensureDriveFolder(drive, '30 Approved Website Assets', root.id);
  const failed = await ensureDriveFolder(drive, '90 Failed - Needs Review', root.id);
  const legacy = await ensureDriveFolder(drive, '_Archive - Legacy Pipeline Folders', root.id);
  const oneTimeRoot = await ensureDriveFolder(drive, 'Workspace - One Time Mishnah Class', root.id);
  const oneTimeRawIntake = await ensureDriveFolder(drive, '00 Upload Here - One Time Mishnah Intake', oneTimeRoot.id);
  const oneTimeProcessing = await ensureDriveFolder(drive, '10 One Time Processing - Temporary', oneTimeRoot.id);
  const oneTimeProcessed = await ensureDriveFolder(drive, '20 One Time Processed Recordings - Source Media', oneTimeRoot.id);
  const oneTimeApproved = await ensureDriveFolder(drive, '30 One Time Approved Assets', oneTimeRoot.id);
  const oneTimeFailed = await ensureDriveFolder(drive, '90 One Time Failed - Needs Review', oneTimeRoot.id);

  const folders = {
    '01 Raw Intake': rawIntake,
    '02 Ingesting': processing,
    '03 Transcribed': processed,
    '04 Parsed': processed,
    '05 WhatsApp Ready': processed,
    '06 Newsletter Candidates': processed,
    '07 Social Candidates': processed,
    '08 Blog Candidates': processed,
    '09 Brand Kit Suggestions': legacy,
    '10 Approved': approved,
    '11 Published': approved,
    '99 Failed': failed,
  };
  const workspaceFolders = {
    [DEFAULT_WORKSPACE_KEY]: {
      root,
      rawIntake,
      websiteImages: websiteMomentsIntake,
      processing,
      processedRecordings: processed,
      approvedAssets: approved,
      failedNeedsReview: failed,
    },
    [ONE_TIME_WORKSPACE_KEY]: {
      root: oneTimeRoot,
      rawIntake: oneTimeRawIntake,
      processing: oneTimeProcessing,
      processedRecordings: oneTimeProcessed,
      approvedAssets: oneTimeApproved,
      failedNeedsReview: oneTimeFailed,
    },
  };

  const brandKit = await ensureDriveFolder(drive, 'GitHub Canonical - Drive Brand Mirror (Deprecated)', legacy.id);
  const brandDocs = {};
  for (const docName of [
    '01 Core Beliefs',
    '02 Teaching Voice',
    '03 Parent Messaging',
    '04 Student Growth Principles',
    '05 Phrases To Use',
    '06 Phrases To Avoid',
    '07 Brand Kit Suggestions Inbox',
  ]) {
    brandDocs[docName] = await ensureGoogleDoc(drive, docName, brandKit.id);
  }

  const platformMemory = await ensureDriveFolder(drive, 'Platform Memory', brandKit.id);
  const platformDocs = {};
  for (const docName of [
    'WhatsApp Prompt',
    'WhatsApp Approved Examples',
    'Facebook Prompt',
    'Facebook Approved Examples',
    'YouTube Prompt',
    'Blog Prompt',
    'Newsletter Prompt',
  ]) {
    platformDocs[docName] = await ensureGoogleDoc(drive, docName, platformMemory.id);
  }

  return {
    root,
    websiteMomentsIntake,
    folders,
    workspaceFolders,
    legacy,
    brandKit,
    brandDocs,
    platformMemory,
    platformDocs,
  };
}

function parseCookies(req) {
  const rawCookie = req.headers.cookie || '';
  if (!rawCookie) return {};

  return rawCookie
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex <= 0) return acc;
      const key = part.slice(0, separatorIndex);
      const value = decodeURIComponent(part.slice(separatorIndex + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function generateStudentAccessCode() {
  return crypto.randomBytes(9).toString('base64url');
}

function studentPortalUrl(req, code) {
  const forwardedProto = String(req.get('x-forwarded-proto') || '').split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'https';
  const origin = `${protocol}://${req.get('host')}`;
  return `${origin}/student.html?code=${encodeURIComponent(code)}`;
}

async function ensureStudentAccessCode(studentId, { regenerate = false } = {}, db = pool) {
  const current = (await db.query(
    `SELECT id, name, student_access_code
     FROM bna_students
     WHERE id = $1
       AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')`,
    [studentId]
  )).rows[0];
  if (!current) {
    throw new Error('Student not found');
  }
  if (current.student_access_code && !regenerate) {
    return current.student_access_code;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateStudentAccessCode();
    try {
      const result = await db.query(
        `UPDATE bna_students
         SET student_access_code = $2,
             student_access_enabled = TRUE,
             student_access_created_at = COALESCE(student_access_created_at, NOW()),
             updated_at = NOW()
         WHERE id = $1
         RETURNING student_access_code`,
        [studentId, code]
      );
      return result.rows[0].student_access_code;
    } catch (error) {
      if (error.code !== '23505') throw error;
    }
  }
  throw new Error('Could not generate a unique student access code');
}

async function findStudentByAccessCode(code, db = pool) {
  return (await db.query(
    `SELECT id, name
     FROM bna_students
     WHERE student_access_code = $1
       AND COALESCE(student_access_enabled, TRUE) = TRUE
       AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')
     LIMIT 1`,
    [String(code || '').trim()]
  )).rows[0] || null;
}

function goalBoardAdminView(row) {
  const goalBoard = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata), {
    category: row?.topic || '',
  });
  return {
    ...row,
    metadata: row?.metadata || {},
    goal_board: goalBoard,
    goal_board_status: goalBoardStatus(row),
    goal_board_bucket: goalBoardBucket(row),
    student_view: safeGoalBoardStudentView(row),
  };
}

function goalBoardMetadataFromPayload(payload = {}, previousMetadata = {}) {
  const existingGoalBoard = normalizeGoalBoardMetadata(rawGoalBoardMetadata(previousMetadata));
  const explicitGoalBoard = payload.goal_board && typeof payload.goal_board === 'object' ? payload.goal_board : {};
  const explicitAgreement = explicitGoalBoard.agreement && typeof explicitGoalBoard.agreement === 'object' ? explicitGoalBoard.agreement : {};
  const explicitConsequence = explicitGoalBoard.consequence && typeof explicitGoalBoard.consequence === 'object' ? explicitGoalBoard.consequence : {};
  const source = payload.source || explicitGoalBoard.source || existingGoalBoard.source || 'admin';
  const merged = {
    ...existingGoalBoard,
    ...explicitGoalBoard,
    source,
    category: payload.category ?? payload.topic ?? explicitGoalBoard.category ?? existingGoalBoard.category,
    urgency: payload.urgency ?? explicitGoalBoard.urgency ?? existingGoalBoard.urgency,
    status: payload.status ?? explicitGoalBoard.status ?? existingGoalBoard.status,
    due_at: payload.due_at ?? explicitGoalBoard.due_at ?? existingGoalBoard.due_at,
    optional_scheduled_at: payload.optional_scheduled_at ?? explicitGoalBoard.optional_scheduled_at ?? existingGoalBoard.optional_scheduled_at,
    student_owned: payload.student_owned ?? explicitGoalBoard.student_owned ?? source === 'self',
    approval_required: payload.approval_required ?? explicitGoalBoard.approval_required ?? existingGoalBoard.approval_required,
    approval_status: payload.approval_status ?? explicitGoalBoard.approval_status ?? existingGoalBoard.approval_status,
    student_summary: payload.student_summary ?? explicitGoalBoard.student_summary ?? existingGoalBoard.student_summary,
    private_note: payload.private_note ?? explicitGoalBoard.private_note ?? existingGoalBoard.private_note,
    reflection_note: payload.reflection_note ?? explicitGoalBoard.reflection_note ?? existingGoalBoard.reflection_note,
    youtube_url: payload.youtube_url ?? explicitGoalBoard.youtube_url ?? existingGoalBoard.classroom?.youtube_url,
    classroom_link: payload.classroom_link ?? explicitGoalBoard.classroom_link ?? existingGoalBoard.classroom?.alternate_link,
    classroom_state: payload.classroom_state ?? explicitGoalBoard.classroom_state ?? existingGoalBoard.classroom?.state,
    work_type: payload.work_type ?? explicitGoalBoard.work_type ?? existingGoalBoard.classroom?.work_type,
    agreement_type: payload.agreement_type ?? explicitGoalBoard.agreement_type ?? explicitAgreement.type ?? existingGoalBoard.agreement?.type,
    bedtime_time: payload.bedtime_time ?? explicitGoalBoard.bedtime_time ?? explicitAgreement.bedtime_time ?? existingGoalBoard.agreement?.bedtime_time,
    wake_time: payload.wake_time ?? explicitGoalBoard.wake_time ?? explicitAgreement.wake_time ?? existingGoalBoard.agreement?.wake_time,
    student_commitment: payload.student_commitment ?? explicitGoalBoard.student_commitment ?? explicitAgreement.student_commitment ?? existingGoalBoard.agreement?.student_commitment,
    chosen_consequence: payload.chosen_consequence ?? explicitGoalBoard.chosen_consequence ?? explicitAgreement.chosen_consequence ?? existingGoalBoard.agreement?.chosen_consequence,
    recovery_path: payload.recovery_path ?? explicitGoalBoard.recovery_path ?? explicitConsequence.recovery_path ?? existingGoalBoard.consequence?.recovery_path,
    device_access_state: payload.device_access_state ?? explicitGoalBoard.device_access_state ?? explicitConsequence.device_access_state ?? existingGoalBoard.consequence?.device_access_state,
    duration_minutes: payload.duration_minutes ?? explicitGoalBoard.duration_minutes ?? explicitConsequence.duration_minutes ?? existingGoalBoard.consequence?.duration_minutes,
    auto_apply_on_completion: payload.auto_apply_on_completion ?? explicitGoalBoard.auto_apply_on_completion ?? explicitConsequence.auto_apply_on_completion ?? existingGoalBoard.consequence?.auto_apply_on_completion,
    success_device_access_state: payload.success_device_access_state ?? explicitGoalBoard.success_device_access_state ?? explicitConsequence.success_device_access_state ?? existingGoalBoard.consequence?.success_device_access_state,
    success_duration_minutes: payload.success_duration_minutes ?? explicitGoalBoard.success_duration_minutes ?? explicitConsequence.success_duration_minutes ?? existingGoalBoard.consequence?.success_duration_minutes,
    success_applied_at: payload.success_applied_at ?? explicitGoalBoard.success_applied_at ?? explicitConsequence.success_applied_at ?? existingGoalBoard.consequence?.success_applied_at,
    success_applied_by: payload.success_applied_by ?? explicitGoalBoard.success_applied_by ?? explicitConsequence.success_applied_by ?? existingGoalBoard.consequence?.success_applied_by,
    consequence_status: payload.consequence_status ?? explicitGoalBoard.consequence_status ?? explicitConsequence.status ?? existingGoalBoard.consequence?.status,
    review_reason: payload.review_reason ?? explicitGoalBoard.review_reason ?? explicitConsequence.review_reason ?? existingGoalBoard.consequence?.review_reason,
  };

  if (merged.approval_required && !payload.approval_status && !explicitGoalBoard.approval_status) {
    merged.approval_status = 'pending_review';
    merged.status = 'waiting';
  }

  return metadataWithGoalBoard(previousMetadata, merged);
}

async function getGoalBoardEvent(id, db = pool) {
  return (await db.query(
    `SELECT a.*, row_to_json(s.*) AS student
     FROM bna_accountability_events a
     LEFT JOIN bna_students s ON s.id = a.student_id
     WHERE a.id = $1
       AND a.event_type = 'student_goal'
     LIMIT 1`,
    [id]
  )).rows[0] || null;
}

function safeDevicePlatform(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['android', 'ios', 'web', 'unknown'].includes(normalized) ? normalized : 'android';
}

function deviceSessionView(session) {
  if (!session || typeof session !== 'object' || !session.id) return null;
  return {
    ...session,
    status: normalizeDeviceAccessState(session.status),
    status_label: deviceAccessStateLabel(session.status),
    provider_result: parseJsonMaybe(session.provider_result),
  };
}

function deviceRecordView(row = {}) {
  return {
    ...row,
    status: normalizeDeviceAccessState(row.status),
    status_label: deviceAccessStateLabel(row.status),
    metadata: parseJsonMaybe(row.metadata),
    active_session: deviceSessionView(parseJsonMaybe(row.active_session)),
    latest_session: deviceSessionView(parseJsonMaybe(row.latest_session)),
  };
}

async function expireDeviceAccessSessions(db = pool) {
  const providerResult = {
    ok: true,
    provider: 'mock',
    action: 'expireApprovedAccess',
    resulting_status: DEVICE_ACCESS_STATES.EXPIRED,
    real_device_call: false,
    message: 'Mock access session expired. No real device call was made.',
    recorded_at: new Date().toISOString(),
  };
  const expired = await db.query(
    `UPDATE bna_device_access_sessions
     SET status = 'expired',
         ended_at = COALESCE(ended_at, NOW()),
         provider_result = COALESCE(provider_result, '{}'::jsonb) || $1::jsonb,
         updated_at = NOW()
     WHERE status IN ('approved_access', 'manual_override')
       AND expires_at IS NOT NULL
       AND expires_at <= NOW()
       AND ended_at IS NULL
     RETURNING device_id`,
    [JSON.stringify(providerResult)]
  );
  const deviceIds = [...new Set(expired.rows.map((row) => Number(row.device_id)).filter(Boolean))];
  if (deviceIds.length) {
    await db.query(
      `UPDATE bna_devices
       SET status = 'expired',
           updated_at = NOW()
       WHERE id = ANY($1::int[])`,
      [deviceIds]
    );
  }
  return deviceIds;
}

async function getDeviceRecord(deviceId, db = pool) {
  const result = await db.query(
    `SELECT d.*,
            row_to_json(s.*) AS student,
            row_to_json(active_session.*) AS active_session,
            row_to_json(latest_session.*) AS latest_session
     FROM bna_devices d
     LEFT JOIN bna_students s ON s.id = d.student_id
     LEFT JOIN LATERAL (
       SELECT *
       FROM bna_device_access_sessions das
       WHERE das.device_id = d.id
         AND das.ended_at IS NULL
       ORDER BY das.created_at DESC, das.id DESC
       LIMIT 1
     ) active_session ON TRUE
     LEFT JOIN LATERAL (
       SELECT *
       FROM bna_device_access_sessions das
       WHERE das.device_id = d.id
       ORDER BY das.created_at DESC, das.id DESC
       LIMIT 1
     ) latest_session ON TRUE
     WHERE d.id = $1
     LIMIT 1`,
    [deviceId]
  );
  return result.rows[0] ? deviceRecordView(result.rows[0]) : null;
}

async function getStudentDeviceAccessSummary(studentId, db = pool) {
  await expireDeviceAccessSessions(db);
  const result = await db.query(
    `SELECT d.*,
            row_to_json(active_session.*) AS active_session,
            row_to_json(latest_session.*) AS latest_session,
            COUNT(*) OVER () AS device_count
     FROM bna_devices d
     LEFT JOIN LATERAL (
       SELECT *
       FROM bna_device_access_sessions das
       WHERE das.device_id = d.id
         AND das.ended_at IS NULL
       ORDER BY das.created_at DESC, das.id DESC
       LIMIT 1
     ) active_session ON TRUE
     LEFT JOIN LATERAL (
       SELECT *
       FROM bna_device_access_sessions das
       WHERE das.device_id = d.id
       ORDER BY das.created_at DESC, das.id DESC
       LIMIT 1
     ) latest_session ON TRUE
     WHERE d.student_id = $1
     ORDER BY d.updated_at DESC, d.id DESC
     LIMIT 1`,
    [studentId]
  );
  const row = result.rows[0];
  if (!row) {
    return {
      provider_mode: 'mock',
      real_device_calls_enabled: false,
      device_count: 0,
      status: 'not_configured',
      status_label: 'Not Configured',
    };
  }
  const device = deviceRecordView(row);
  return {
    provider_mode: 'mock',
    real_device_calls_enabled: false,
    device_count: Number(row.device_count || 0),
    device_id: device.id,
    device_name: device.device_name,
    status: device.status,
    status_label: device.status_label,
    expires_at: device.active_session?.expires_at || null,
    latest_session: device.latest_session,
  };
}

async function getPreferredDeviceForStudent(studentId, db = pool) {
  await expireDeviceAccessSessions(db);
  const result = await db.query(
    `SELECT id
     FROM bna_devices
     WHERE student_id = $1
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`,
    [studentId]
  );
  return result.rows[0]?.id || null;
}

async function applyDeviceAccessAction({
  deviceId,
  status,
  durationMinutes = 60,
  reason = '',
  goalId = null,
  ruleId = null,
  approvedBy = 'admin',
}, db = pool) {
  await expireDeviceAccessSessions(db);
  const device = (await db.query('SELECT * FROM bna_devices WHERE id = $1 LIMIT 1', [deviceId])).rows[0];
  if (!device) {
    const error = new Error('Device not found');
    error.statusCode = 404;
    throw error;
  }

  const normalizedStatus = normalizeDeviceAccessState(status);
  const duration = normalizeDurationMinutes(durationMinutes);
  const provider = createDeviceControlProvider(device.provider || 'mock');
  let providerResult;
  const expiresAtSql = 'CASE WHEN $8::int IS NULL THEN NULL ELSE NOW() + ($8::int * INTERVAL \'1 minute\') END';
  let expiresAtValue = null;

  if (normalizedStatus === DEVICE_ACCESS_STATES.LOCKED) {
    providerResult = await provider.lockDevice(device.id, reason);
  } else if (normalizedStatus === DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY) {
    providerResult = await provider.setAccountabilityOnly(device.id, reason);
  } else if (normalizedStatus === DEVICE_ACCESS_STATES.MANUAL_OVERRIDE) {
    providerResult = await provider.setManualOverride(device.id, duration, reason);
    expiresAtValue = duration;
  } else if (normalizedStatus === DEVICE_ACCESS_STATES.EXPIRED) {
    providerResult = await provider.markExpired(device.id, reason);
  } else {
    providerResult = await provider.unlockDevice(device.id, duration, reason);
    expiresAtValue = duration;
  }

  await db.query(
    `UPDATE bna_device_access_sessions
     SET ended_at = COALESCE(ended_at, NOW()),
         updated_at = NOW()
     WHERE device_id = $1
       AND ended_at IS NULL`,
    [device.id]
  );

  const sessionResult = await db.query(
    `INSERT INTO bna_device_access_sessions (
       workspace_id, device_id, student_id, goal_id, rule_id, status, started_at, expires_at,
       approved_by, reason, provider, provider_result
      ) VALUES (
       $1, $2, $3, $4, $5, $6, NOW(), ${expiresAtSql},
       $7, $9, 'mock', $10
      )
      RETURNING *`,
    [
      device.workspace_id || null,
      device.id,
      device.student_id || null,
      goalId || null,
      ruleId || null,
      normalizedStatus,
      approvedBy || 'admin',
      expiresAtValue,
      reason || null,
      JSON.stringify(providerResult),
    ]
  );

  await db.query(
    `UPDATE bna_devices
     SET status = $2,
         last_seen_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [device.id, normalizedStatus]
  );

  return {
    session: deviceSessionView(sessionResult.rows[0]),
    device: await getDeviceRecord(device.id, db),
    provider_result: providerResult,
  };
}

function identifyOpsUser(username, password = null) {
  const user = String(username || '').trim();
  const pass = password === null || password === undefined ? null : String(password || '');
  if (!user) return null;

  if (OPS_USERNAME && user.toLowerCase() === OPS_USERNAME.toLowerCase()) {
    if (pass !== null && pass.toLowerCase() !== String(OPS_PASSWORD || '').toLowerCase()) return null;
    return createSuperAdminIdentity(user, ['tasks', 'assistant', 'calendar', 'students', 'content', 'contacts', 'accounting', 'automations', 'integrations', 'users']);
  }

  if (
    ONE_TIME_OPS_USERNAME &&
    ONE_TIME_OPS_PASSWORD &&
    user.toLowerCase() === ONE_TIME_OPS_USERNAME.toLowerCase()
  ) {
    if (pass !== null && pass !== ONE_TIME_OPS_PASSWORD) return null;
    return createWorkspaceIdentity({
      username: user,
      role: 'workspace_member',
      workspaceType: 'service_provider',
      workspaceKey: ONE_TIME_PROJECT_KEY,
      projectKey: ONE_TIME_PROJECT_KEY,
      allowedViews: ['tasks', 'assistant', 'calendar'],
    });
  }

  return null;
}

function isScopedOpsPathAllowed(req) {
  return scopedRouteAllowed(req.opsIdentity, { path: req.path, method: req.method });
}

async function issueSession(username) {
  const sessionId = Buffer.from(`${username}:${Date.now()}:${Math.random().toString(36).slice(2)}`).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.query(
    `INSERT INTO bna_sessions (session_id, username, expires_at) VALUES ($1, $2, $3)`,
    [sessionId, username, expiresAt]
  );
  return sessionId;
}

async function getValidSession(sessionId) {
  if (!sessionId) return null;
  const result = await pool.query(
    `SELECT * FROM bna_sessions WHERE session_id = $1 AND expires_at > NOW()`,
    [sessionId]
  );
  if (result.rows.length === 0) return null;
  return {
    username: result.rows[0].username,
    expiresAt: new Date(result.rows[0].expires_at).getTime(),
  };
}

async function clearSession(sessionId) {
  if (sessionId) {
    await pool.query(`DELETE FROM bna_sessions WHERE session_id = $1`, [sessionId]);
  }
}

async function cleanupExpiredSessions() {
  await pool.query(`DELETE FROM bna_sessions WHERE expires_at <= NOW()`);
}

function setSessionCookie(res, sessionId) {
  const cookie = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  res.setHeader('Set-Cookie', cookie.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// Admin auth middleware - case insensitive
async function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  const session = await getValidSession(cookies[SESSION_COOKIE_NAME]);
  if (session) {
    const identity = identifyOpsUser(session.username);
    if (!identity) {
      await clearSession(cookies[SESSION_COOKIE_NAME]);
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session user is no longer allowed' });
    }
    if (!isGlobalOpsScope(identity.scope) && !isScopedOpsPathAllowed(req)) {
      return res.status(403).json({ error: 'This login is scoped to One Time Mishnah Class tasks.' });
    }
    req.opsUser = identity.username;
    req.opsIdentity = identity;
    return next();
  }

  const authHeader = req.headers.authorization;
  
  // If no auth header, redirect to login page
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Check if request wants HTML (browser) or JSON (API)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      return res.redirect('/operations-login.html');
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const creds = Buffer.from(authHeader.slice(6), 'base64').toString();
  const [user, pass] = creds.split(':');

  const identity = identifyOpsUser(user, pass);
  if (!identity) {
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      return res.redirect('/operations-login.html');
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!isGlobalOpsScope(identity.scope) && !isScopedOpsPathAllowed(req)) {
    return res.status(403).json({ error: 'This login is scoped to One Time Mishnah Class tasks.' });
  }
  req.opsUser = identity.username;
  req.opsIdentity = identity;
  next();
}

async function identifyAdminRequest(req) {
  const cookies = parseCookies(req);
  const session = await getValidSession(cookies[SESSION_COOKIE_NAME]);
  if (session) {
    const identity = identifyOpsUser(session.username);
    return isGlobalOpsScope(identity?.scope) ? identity : null;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) return null;

  const creds = Buffer.from(authHeader.slice(6), 'base64').toString();
  const [user, pass] = creds.split(':');
  const identity = identifyOpsUser(user, pass);
  return isGlobalOpsScope(identity?.scope) ? identity : null;
}

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static('public', {
  setHeaders(res, filePath) {
    const isHtml = filePath.endsWith('.html');
    const isServiceWorker = filePath.endsWith('sw.js');
    const isManifest = filePath.endsWith('manifest.json');
    if (isHtml || isServiceWorker || isManifest) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create tables if not exists - BNA Schema
const createSignupsTableSQL = `
CREATE TABLE IF NOT EXISTS signups (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  parent_phone TEXT,
  student_name TEXT NOT NULL,
  student_age INTEGER,
  student_grade TEXT,
  previous_school TEXT,
  reason_applying TEXT,
  special_needs TEXT,
  payment_method TEXT DEFAULT 'green_invoice',
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_currency TEXT DEFAULT 'ILS',
  payment_interval_days INTEGER DEFAULT 30,
  payment_due_date DATE,
  last_payment_at TIMESTAMP,
  payment_reminder_sent_at TIMESTAMP,
  green_invoice_id TEXT,
  cash_receipt_photo_url TEXT,
  cash_received_at TIMESTAMP,
  cash_notes TEXT,
  form_language TEXT DEFAULT 'en',
  waiver_accepted BOOLEAN DEFAULT FALSE,
  waiver_accepted_at TIMESTAMP,
  waiver_version TEXT,
  tuition_agreement_accepted BOOLEAN DEFAULT FALSE,
  tuition_agreement_accepted_at TIMESTAMP,
  tuition_agreement_version TEXT,
  tuition_agreement_signer_name TEXT,
  tuition_agreement_signer_email TEXT,
  tuition_agreement_client_signed_at TIMESTAMP,
  confirmation_email_sent_at TIMESTAMP,
  confirmation_email_error TEXT,
  ghl_parent_contact_id TEXT,
  ghl_student_contact_id TEXT,
  ghl_synced_at TIMESTAMP,
  ghl_sync_error TEXT,
  status TEXT DEFAULT 'new',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createSignupAgreementSignaturesSQL = `
CREATE TABLE IF NOT EXISTS bna_signup_agreement_signatures (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  signup_id INTEGER NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL,
  agreement_title TEXT NOT NULL,
  agreement_version TEXT NOT NULL,
  agreement_text TEXT,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  client_signed_at TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (signup_id, agreement_type, agreement_version)
);
`;

const createTasksTableSQL = `
CREATE TABLE IF NOT EXISTS bna_tasks (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  stage TEXT NOT NULL DEFAULT 'ready' CHECK (stage IN ('decision_required', 'ready', 'in_progress', 'blocked', 'done', 'archived')),
  category TEXT NOT NULL DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations', 'accountability', 'content', 'technology', 'accounting', 'ghl_setup', 'community', 'general', 'torah_class_prep', 'source_sheets', 'shiur_ideas')),
  urgency TEXT NOT NULL DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
  energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
  estimated_minutes INTEGER,
  due_date DATE,
  planned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  archived_at TIMESTAMP,
  blocker_reason TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ramble', 'telegram', 'web', 'google_drive', 'content_job', 'import', 'ghl_webhook', 'green_invoice')),
  source_context TEXT,
  ai_parsed JSONB,
  parent_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL,
  related_contact_email TEXT,
  related_signup_id INTEGER,
  created_by TEXT NOT NULL DEFAULT 'system',
  assigned_to TEXT,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createWorkspacesSQL = `
CREATE TABLE IF NOT EXISTS bna_workspaces (
  id SERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL UNIQUE,
  workspace_type TEXT NOT NULL CHECK (workspace_type IN ('school', 'service_provider', 'family')),
  name TEXT NOT NULL,
  short_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createProjectsSQL = `
CREATE TABLE IF NOT EXISTS bna_projects (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  project_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createProjectMembersSQL = `
CREATE TABLE IF NOT EXISTS bna_project_members (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  access_level TEXT NOT NULL DEFAULT 'member' CHECK (access_level IN ('owner', 'manager', 'member', 'viewer')),
  telegram_chat_id TEXT,
  login_username TEXT,
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, person_name)
);
`;

const createWorkspaceInvitationsSQL = `
CREATE TABLE IF NOT EXISTS bna_workspace_invitations (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  person_name TEXT,
  role TEXT DEFAULT 'member',
  access_level TEXT NOT NULL DEFAULT 'member' CHECK (access_level IN ('owner', 'manager', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by TEXT,
  invite_token_hash TEXT,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createTaskCommentsSQL = `
CREATE TABLE IF NOT EXISTS bna_task_comments (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  task_id INTEGER NOT NULL REFERENCES bna_tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'system',
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'operator', 'project')),
  source TEXT NOT NULL DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'telegram', 'api', 'system')),
  source_context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createAssistantMemorySQL = `
CREATE TABLE IF NOT EXISTS bna_assistant_memory (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  user_key TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'workspace_member',
  surface TEXT NOT NULL DEFAULT 'operations' CHECK (surface IN ('operations', 'student_portal', 'public')),
  module_key TEXT NOT NULL DEFAULT 'assistant',
  subject_type TEXT NOT NULL DEFAULT 'workspace' CHECK (subject_type IN ('workspace', 'student', 'family', 'provider', 'task', 'content', 'none')),
  subject_id TEXT NOT NULL DEFAULT '',
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'scoped' CHECK (visibility IN ('scoped', 'user', 'workspace')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (workspace_id, project_id, user_key, user_role, surface, module_key, subject_type, subject_id, memory_key)
);
`;

const createAgentRuntimeStatusSQL = `
CREATE TABLE IF NOT EXISTS bna_agent_runtime_status (
  agent_key TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('unknown', 'running', 'stopped', 'error')),
  pid INTEGER,
  mode TEXT,
  host TEXT,
  started_at TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stale_after_ms INTEGER DEFAULT 180000,
  current_task_id INTEGER,
  queue_size INTEGER,
  ready_count INTEGER,
  details JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPaymentLogSQL = `
CREATE TABLE IF NOT EXISTS bna_payment_log (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  signup_id INTEGER NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('registration', 'tuition', 'materials', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  method TEXT NOT NULL CHECK (method IN ('green_invoice', 'cash', 'bank_transfer', 'check')),
  green_invoice_id TEXT,
  green_invoice_url TEXT,
  receipt_photo_url TEXT,
  received_by TEXT,
  received_at TIMESTAMP,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createEmailLogSQL = `
CREATE TABLE IF NOT EXISTS bna_email_log (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  signup_id INTEGER REFERENCES signups(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  error TEXT,
  metadata JSONB,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPaymentIntakeSQL = `
CREATE TABLE IF NOT EXISTS bna_payment_intake (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  signup_id INTEGER REFERENCES signups(id) ON DELETE SET NULL,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  student_name TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'ILS',
  method TEXT NOT NULL DEFAULT 'unknown' CHECK (method IN ('green_invoice', 'cash', 'credit', 'bank_transfer', 'check', 'unknown')),
  payment_type TEXT NOT NULL DEFAULT 'registration' CHECK (payment_type IN ('registration', 'tuition', 'materials', 'other')),
  green_invoice_id TEXT,
  green_invoice_url TEXT,
  ghl_contact_id TEXT,
  status TEXT NOT NULL DEFAULT 'unmatched' CHECK (status IN ('unmatched', 'matched', 'needs_signup', 'completed', 'ignored')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'telegram', 'green_invoice', 'import')),
  source_context JSONB,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  matched_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createStudentsSQL = `
CREATE TABLE IF NOT EXISTS bna_students (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  signup_id INTEGER UNIQUE REFERENCES signups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  age INTEGER,
  grade TEXT,
  current_school TEXT,
  ghl_contact_id TEXT,
  student_access_code TEXT UNIQUE,
  student_access_enabled BOOLEAN DEFAULT TRUE,
  student_access_created_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'paused', 'graduated', 'inactive')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createDevicesSQL = `
CREATE TABLE IF NOT EXISTS bna_devices (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android' CHECK (platform IN ('android', 'ios', 'web', 'unknown')),
  provider TEXT NOT NULL DEFAULT 'mock',
  provider_device_id TEXT,
  status TEXT NOT NULL DEFAULT 'accountability_only' CHECK (status IN ('locked', 'accountability_only', 'approved_access', 'expired', 'manual_override')),
  last_seen_at TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createTorahLearningGoalsSQL = `
CREATE TABLE IF NOT EXISTS bna_torah_learning_goals (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  student_id INTEGER NOT NULL REFERENCES bna_students(id) ON DELETE CASCADE,
  goal_minutes DECIMAL(10,2) NOT NULL CHECK (goal_minutes > 0),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('LISTENING', 'INSIDE')),
  active BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createTorahLearningEntriesSQL = `
CREATE TABLE IF NOT EXISTS bna_torah_learning_entries (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  student_id INTEGER NOT NULL REFERENCES bna_students(id) ON DELETE CASCADE,
  goal_id INTEGER NOT NULL REFERENCES bna_torah_learning_goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  engaged_listening_minutes DECIMAL(10,2) DEFAULT 0 CHECK (engaged_listening_minutes >= 0),
  inside_engaged_minutes DECIMAL(10,2) DEFAULT 0 CHECK (inside_engaged_minutes >= 0),
  listening_without_following_minutes DECIMAL(10,2) DEFAULT 0 CHECK (listening_without_following_minutes >= 0),
  counted_minutes DECIMAL(10,2) NOT NULL DEFAULT 0,
  individual_percentage DECIMAL(10,2) NOT NULL DEFAULT 0,
  individual_complete BOOLEAN DEFAULT FALSE,
  daily_completion_percentage DECIMAL(10,2) NOT NULL DEFAULT 0,
  daily_completed_boolean BOOLEAN DEFAULT FALSE,
  completed_daily_units DECIMAL(10,2) NOT NULL DEFAULT 0,
  carried_over_completed_units DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_completed_units DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_required_units DECIMAL(10,2) NOT NULL DEFAULT 30 CHECK (total_required_units > 0),
  total_trip_progress_percentage DECIMAL(10,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, date)
);
`;

const createGreenInvoiceWebhookLogSQL = `
CREATE TABLE IF NOT EXISTS bna_green_invoice_webhook_log (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL UNIQUE,
  event_type TEXT,
  payment_status TEXT,
  document_id TEXT,
  transaction_id TEXT,
  gateway_transaction_id TEXT,
  payer_name TEXT,
  payer_email TEXT,
  payer_phone TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'ILS',
  webhook_received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  last_reprocessed_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  matched_signup_id INTEGER REFERENCES signups(id) ON DELETE SET NULL,
  matched_student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  payment_intake_id INTEGER REFERENCES bna_payment_intake(id) ON DELETE SET NULL,
  payment_log_id INTEGER REFERENCES bna_payment_log(id) ON DELETE SET NULL,
  response_status INTEGER,
  processing_notes TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  request_headers JSONB DEFAULT '{}',
  error_stack TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createAccountabilityEventsSQL = `
CREATE TABLE IF NOT EXISTS bna_accountability_events (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('class_session', 'learning_note', 'question', 'student_goal', 'private_meeting', 'decision')),
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  student_name TEXT,
  title TEXT NOT NULL,
  notes TEXT,
  topic TEXT,
  question_text TEXT,
  goal_target_value DECIMAL(10,2),
  goal_actual_value DECIMAL(10,2),
  goal_unit TEXT,
  progress_percent INTEGER,
  attendance_status TEXT,
  next_check_in_date DATE,
  engagement_level TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'telegram', 'recording', 'ramble', 'import')),
  source_message_id TEXT,
  source_media_url TEXT,
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createDeviceAccessRulesSQL = `
CREATE TABLE IF NOT EXISTS bna_device_access_rules (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE CASCADE,
  device_id INTEGER REFERENCES bna_devices(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL DEFAULT 'goal_approval' CHECK (rule_type IN ('goal_approval', 'schedule', 'manual')),
  required_goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  schedule JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createDeviceAccessSessionsSQL = `
CREATE TABLE IF NOT EXISTS bna_device_access_sessions (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  device_id INTEGER NOT NULL REFERENCES bna_devices(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL,
  rule_id INTEGER REFERENCES bna_device_access_rules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'accountability_only' CHECK (status IN ('locked', 'accountability_only', 'approved_access', 'expired', 'manual_override')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  ended_at TIMESTAMP,
  approved_by TEXT,
  reason TEXT,
  provider TEXT NOT NULL DEFAULT 'mock',
  provider_result JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createGroupGoalsSQL = `
CREATE TABLE IF NOT EXISTS bna_group_goals (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_minutes DECIMAL(10,2),
  scoring_rule TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  start_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createGroupGoalEntriesSQL = `
CREATE TABLE IF NOT EXISTS bna_group_goal_entries (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  goal_id INTEGER REFERENCES bna_group_goals(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  student_name TEXT,
  recorded_date DATE DEFAULT CURRENT_DATE,
  target_minutes DECIMAL(10,2),
  inside_following_minutes DECIMAL(10,2) DEFAULT 0,
  inside_listening_minutes DECIMAL(10,2) DEFAULT 0,
  distracted_minutes DECIMAL(10,2) DEFAULT 0,
  weighted_minutes DECIMAL(10,2),
  progress_percent INTEGER,
  notes TEXT,
  source_content_job_id INTEGER REFERENCES bna_content_jobs(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createContentJobsSQL = `
CREATE TABLE IF NOT EXISTS bna_content_jobs (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'telegram_media' CHECK (source_type IN ('telegram_media', 'telegram_text', 'manual', 'import', 'local_drop', 'google_drive')),
  source_message_id TEXT,
  source_chat_id TEXT,
  local_path TEXT,
  media_url TEXT,
  drive_file_id TEXT,
  drive_folder_id TEXT,
  drive_stage TEXT,
  mime_type TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'ingested' CHECK (status IN ('ingested', 'transcribing', 'transcribed', 'parsing', 'drafting', 'needs_approval', 'approved', 'published', 'blocked', 'archived')),
  transcript_text TEXT,
  transcript_json JSONB,
  parse_json JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createClassSessionsSQL = `
CREATE TABLE IF NOT EXISTS bna_class_sessions (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  content_job_id INTEGER UNIQUE REFERENCES bna_content_jobs(id) ON DELETE SET NULL,
  class_date DATE,
  title TEXT NOT NULL,
  summary TEXT,
  topics JSONB DEFAULT '[]',
  discussions JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  student_questions JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  newsletter_draft TEXT,
  source_media_url TEXT,
  transcript_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createContentOutputsSQL = `
CREATE TABLE IF NOT EXISTS bna_content_outputs (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  job_id INTEGER NOT NULL REFERENCES bna_content_jobs(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('whatsapp_update', 'facebook_post', 'linkedin_post', 'youtube_description', 'google_business_post', 'blog_draft', 'weekly_newsletter', 'daily_report', 'parent_email', 'teaching_philosophy_note', 'short_clip')),
  title TEXT,
  body TEXT,
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'needs_approval', 'approved', 'rejected', 'published', 'archived')),
  metadata JSONB,
  approved_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createContentPromptsSQL = `
CREATE TABLE IF NOT EXISTS bna_content_prompts (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('whatsapp_update', 'facebook_post', 'weekly_newsletter', 'linkedin_post', 'youtube_description', 'blog_draft')),
  label TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createContentPromptVersionsSQL = `
CREATE TABLE IF NOT EXISTS bna_content_prompt_versions (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER NOT NULL REFERENCES bna_content_prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  change_note TEXT,
  updated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (prompt_id, version)
);
`;

const createContentPromptExamplesSQL = `
CREATE TABLE IF NOT EXISTS bna_content_prompt_examples (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp_update', 'facebook_post', 'weekly_newsletter', 'linkedin_post', 'youtube_description', 'blog_draft')),
  title TEXT NOT NULL,
  body TEXT,
  source_output_id INTEGER REFERENCES bna_content_outputs(id) ON DELETE SET NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createContentBundlesSQL = `
CREATE TABLE IF NOT EXISTS bna_content_bundles (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  bundle_type TEXT NOT NULL DEFAULT 'weekly_newsletter' CHECK (bundle_type IN ('weekly_newsletter')),
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'approved', 'published', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createContentBundleItemsSQL = `
CREATE TABLE IF NOT EXISTS bna_content_bundle_items (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
  bundle_id INTEGER NOT NULL REFERENCES bna_content_bundles(id) ON DELETE CASCADE,
  content_job_id INTEGER NOT NULL REFERENCES bna_content_jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (bundle_id, content_job_id)
);
`;

const createWorkspaceScopeMigrationSQL = `
ALTER TABLE signups ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_signup_agreement_signatures ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_project_members ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_workspace_invitations ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_workspace_invitations ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES bna_projects(id) ON DELETE CASCADE;
ALTER TABLE bna_task_comments ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS user_role TEXT NOT NULL DEFAULT 'workspace_member';
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS surface TEXT NOT NULL DEFAULT 'operations';
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS module_key TEXT NOT NULL DEFAULT 'assistant';
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS subject_type TEXT NOT NULL DEFAULT 'workspace';
ALTER TABLE bna_assistant_memory ADD COLUMN IF NOT EXISTS subject_id TEXT NOT NULL DEFAULT '';
ALTER TABLE bna_payment_log ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_payment_intake ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_torah_learning_goals ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_green_invoice_webhook_log ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_group_goals ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_group_goal_entries ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_class_sessions ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_content_outputs ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_content_prompt_examples ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_content_bundles ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;
ALTER TABLE bna_content_bundle_items ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bna_workspaces_workspace_key ON bna_workspaces (workspace_key);
CREATE INDEX IF NOT EXISTS idx_bna_workspaces_workspace_type ON bna_workspaces (workspace_type);
CREATE INDEX IF NOT EXISTS idx_signups_workspace_id ON signups (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_signup_agreements_workspace_id ON bna_signup_agreement_signatures (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_workspace_id ON bna_tasks (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_projects_workspace_id ON bna_projects (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_workspace_id ON bna_project_members (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_workspace_invitations_workspace_id ON bna_workspace_invitations (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_workspace_invitations_project_id ON bna_workspace_invitations (project_id);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_workspace_id ON bna_task_comments (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_assistant_memory_workspace_id ON bna_assistant_memory (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_assistant_memory_scope ON bna_assistant_memory (workspace_id, project_id, user_key, user_role, surface, module_key, subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_bna_payment_log_workspace_id ON bna_payment_log (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_workspace_id ON bna_email_log (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_payment_intake_workspace_id ON bna_payment_intake (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_students_workspace_id ON bna_students (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_devices_workspace_id ON bna_devices (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_torah_goals_workspace_id ON bna_torah_learning_goals (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_torah_entries_workspace_id ON bna_torah_learning_entries (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_green_invoice_workspace_id ON bna_green_invoice_webhook_log (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_workspace_id ON bna_accountability_events (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_rules_workspace_id ON bna_device_access_rules (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_sessions_workspace_id ON bna_device_access_sessions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_group_goals_workspace_id ON bna_group_goals (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_group_entries_workspace_id ON bna_group_goal_entries (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_workspace_id ON bna_content_jobs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_class_sessions_workspace_id ON bna_class_sessions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_workspace_id ON bna_content_outputs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_prompt_examples_workspace_id ON bna_content_prompt_examples (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_bundles_workspace_id ON bna_content_bundles (workspace_id);
CREATE INDEX IF NOT EXISTS idx_bna_bundle_items_workspace_id ON bna_content_bundle_items (workspace_id);
`;

const createBnaIndexesSQL = `
ALTER TABLE signups ADD COLUMN IF NOT EXISTS payment_interval_days INTEGER DEFAULT 30;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS payment_due_date DATE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS payment_reminder_sent_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS form_language TEXT DEFAULT 'en';
ALTER TABLE signups ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS waiver_version TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_accepted_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_version TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_signer_name TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_signer_email TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_client_signed_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_error TEXT;
ALTER TABLE signups ALTER COLUMN parent_email DROP NOT NULL;
ALTER TABLE bna_payment_intake ADD COLUMN IF NOT EXISTS matched_at TIMESTAMP;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS goal_target_value DECIMAL(10,2);
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS goal_actual_value DECIMAL(10,2);
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS goal_unit TEXT;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS progress_percent INTEGER;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS attendance_status TEXT;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS next_check_in_date DATE;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS engagement_level TEXT;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_accountability_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS student_access_code TEXT UNIQUE;
ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS student_access_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS student_access_created_at TIMESTAMP;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mock';
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS provider_device_id TEXT;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'accountability_only';
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS required_goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}';
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS rule_id INTEGER REFERENCES bna_device_access_rules(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mock';
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS provider_result JSONB DEFAULT '{}';
ALTER TABLE bna_devices DROP CONSTRAINT IF EXISTS bna_devices_status_check;
ALTER TABLE bna_devices
  ADD CONSTRAINT bna_devices_status_check
  CHECK (status IN ('locked', 'accountability_only', 'approved_access', 'expired', 'manual_override'));
ALTER TABLE bna_devices DROP CONSTRAINT IF EXISTS bna_devices_platform_check;
ALTER TABLE bna_devices
  ADD CONSTRAINT bna_devices_platform_check
  CHECK (platform IN ('android', 'ios', 'web', 'unknown'));
ALTER TABLE bna_device_access_rules DROP CONSTRAINT IF EXISTS bna_device_access_rules_rule_type_check;
ALTER TABLE bna_device_access_rules
  ADD CONSTRAINT bna_device_access_rules_rule_type_check
  CHECK (rule_type IN ('goal_approval', 'schedule', 'manual'));
ALTER TABLE bna_device_access_rules DROP CONSTRAINT IF EXISTS bna_device_access_rules_duration_minutes_check;
ALTER TABLE bna_device_access_rules
  ADD CONSTRAINT bna_device_access_rules_duration_minutes_check
  CHECK (duration_minutes > 0 AND duration_minutes <= 1440);
ALTER TABLE bna_device_access_sessions DROP CONSTRAINT IF EXISTS bna_device_access_sessions_status_check;
ALTER TABLE bna_device_access_sessions
  ADD CONSTRAINT bna_device_access_sessions_status_check
  CHECK (status IN ('locked', 'accountability_only', 'approved_access', 'expired', 'manual_override'));
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS daily_completion_percentage DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS daily_completed_boolean BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS completed_daily_units DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS carried_over_completed_units DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS total_completed_units DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS total_required_units DECIMAL(10,2) NOT NULL DEFAULT 30;
ALTER TABLE bna_torah_learning_entries ADD COLUMN IF NOT EXISTS total_trip_progress_percentage DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE bna_group_goal_entries ADD COLUMN IF NOT EXISTS distracted_minutes DECIMAL(10,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bna_students_name ON bna_students (name);
CREATE INDEX IF NOT EXISTS idx_bna_students_access_code ON bna_students (student_access_code);
CREATE INDEX IF NOT EXISTS idx_bna_devices_student_id ON bna_devices (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_devices_status ON bna_devices (status);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_rules_student_id ON bna_device_access_rules (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_rules_device_id ON bna_device_access_rules (device_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_rules_goal_id ON bna_device_access_rules (required_goal_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_device_id ON bna_device_access_sessions (device_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_student_id ON bna_device_access_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_goal_id ON bna_device_access_sessions (goal_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_status ON bna_device_access_sessions (status);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_expires_at ON bna_device_access_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_bna_torah_learning_goals_student_id ON bna_torah_learning_goals (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_torah_learning_goals_start_date ON bna_torah_learning_goals (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_bna_torah_learning_entries_student_id ON bna_torah_learning_entries (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_torah_learning_entries_date ON bna_torah_learning_entries (date DESC);
CREATE INDEX IF NOT EXISTS idx_bna_green_invoice_webhook_log_status ON bna_green_invoice_webhook_log (status);
CREATE INDEX IF NOT EXISTS idx_bna_green_invoice_webhook_log_received_at ON bna_green_invoice_webhook_log (webhook_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_green_invoice_webhook_log_transaction_id ON bna_green_invoice_webhook_log (transaction_id);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_student_id ON bna_accountability_events (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_event_type ON bna_accountability_events (event_type);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_occurred_at ON bna_accountability_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_next_check_in ON bna_accountability_events (next_check_in_date);
CREATE INDEX IF NOT EXISTS idx_bna_group_goals_status ON bna_group_goals (status);
CREATE INDEX IF NOT EXISTS idx_bna_group_goal_entries_goal_id ON bna_group_goal_entries (goal_id);
CREATE INDEX IF NOT EXISTS idx_bna_group_goal_entries_student_id ON bna_group_goal_entries (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_group_goal_entries_recorded_date ON bna_group_goal_entries (recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_bna_payment_intake_status ON bna_payment_intake (status);
CREATE INDEX IF NOT EXISTS idx_bna_payment_intake_received_at ON bna_payment_intake (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_signups_payment_due_date ON signups (payment_due_date);
CREATE INDEX IF NOT EXISTS idx_signups_payment_status ON signups (payment_status);
CREATE INDEX IF NOT EXISTS idx_bna_signup_agreement_signatures_signup_id ON bna_signup_agreement_signatures (signup_id);
CREATE INDEX IF NOT EXISTS idx_bna_signup_agreement_signatures_type ON bna_signup_agreement_signatures (agreement_type);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_signup_id ON bna_email_log (signup_id);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_email_type ON bna_email_log (email_type);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_status ON bna_content_jobs (status);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_created_at ON bna_content_jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_class_sessions_class_date ON bna_class_sessions (class_date DESC);
CREATE INDEX IF NOT EXISTS idx_bna_class_sessions_content_job_id ON bna_class_sessions (content_job_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_job_id ON bna_content_outputs (job_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_status ON bna_content_outputs (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_tasks_mixed_parser_item_key_unique
  ON bna_tasks ((ai_parsed->>'parser_item_key'))
  WHERE ai_parsed->>'parser' = 'mixed-recording-v1' AND ai_parsed ? 'parser_item_key';
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_accountability_mixed_parser_item_key_unique
  ON bna_accountability_events ((metadata->>'parser_item_key'))
  WHERE metadata->>'parser' = 'mixed-recording-v1' AND metadata ? 'parser_item_key';
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_group_entries_mixed_parser_item_key_unique
  ON bna_group_goal_entries ((metadata->>'parser_item_key'))
  WHERE metadata->>'parser' = 'mixed-recording-v1' AND metadata ? 'parser_item_key';
CREATE INDEX IF NOT EXISTS idx_bna_content_prompt_examples_platform ON bna_content_prompt_examples (platform);
CREATE INDEX IF NOT EXISTS idx_bna_content_bundles_status ON bna_content_bundles (status);
CREATE INDEX IF NOT EXISTS idx_bna_projects_project_key ON bna_projects (project_key);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_project_id ON bna_project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_login_username ON bna_project_members (login_username);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_task_id ON bna_task_comments (task_id);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_created_at ON bna_task_comments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_runtime_last_seen ON bna_agent_runtime_status (last_seen_at DESC);

ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_stage TEXT;
ALTER TABLE bna_content_outputs ADD COLUMN IF NOT EXISTS prompt_id INTEGER REFERENCES bna_content_prompts(id) ON DELETE SET NULL;
ALTER TABLE bna_content_outputs ADD COLUMN IF NOT EXISTS prompt_version INTEGER;
ALTER TABLE bna_content_outputs ADD COLUMN IF NOT EXISTS bundle_id INTEGER REFERENCES bna_content_bundles(id) ON DELETE SET NULL;
ALTER TABLE bna_content_outputs DROP CONSTRAINT IF EXISTS bna_content_outputs_output_type_check;
ALTER TABLE bna_content_outputs ADD CONSTRAINT bna_content_outputs_output_type_check
  CHECK (output_type IN ('whatsapp_update', 'facebook_post', 'linkedin_post', 'youtube_description', 'google_business_post', 'blog_draft', 'weekly_newsletter', 'daily_report', 'parent_email', 'teaching_philosophy_note', 'short_clip'));
ALTER TABLE bna_content_prompts DROP CONSTRAINT IF EXISTS bna_content_prompts_platform_check;
ALTER TABLE bna_content_prompts ADD CONSTRAINT bna_content_prompts_platform_check
  CHECK (platform IN ('whatsapp_update', 'facebook_post', 'weekly_newsletter', 'linkedin_post', 'youtube_description', 'blog_draft'));
ALTER TABLE bna_content_prompt_examples DROP CONSTRAINT IF EXISTS bna_content_prompt_examples_platform_check;
ALTER TABLE bna_content_prompt_examples ADD CONSTRAINT bna_content_prompt_examples_platform_check
  CHECK (platform IN ('whatsapp_update', 'facebook_post', 'weekly_newsletter', 'linkedin_post', 'youtube_description', 'blog_draft'));
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_required BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS blocker_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_bna_tasks_project_id ON bna_tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_decision_required ON bna_tasks (decision_required);
ALTER TABLE bna_content_jobs DROP CONSTRAINT IF EXISTS bna_content_jobs_source_type_check;
ALTER TABLE bna_content_jobs ADD CONSTRAINT bna_content_jobs_source_type_check
  CHECK (source_type IN ('telegram_media', 'telegram_text', 'manual', 'import', 'local_drop', 'google_drive'));
ALTER TABLE signups ADD COLUMN IF NOT EXISTS payment_interval_days INTEGER DEFAULT 30;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS payment_due_date DATE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS payment_reminder_sent_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS form_language TEXT DEFAULT 'en';
ALTER TABLE signups ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS waiver_version TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_accepted_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_version TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_signer_name TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_signer_email TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS tuition_agreement_client_signed_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_error TEXT;
ALTER TABLE signups ALTER COLUMN parent_email DROP NOT NULL;
`;

const normalizeTasksCategoryCheckSQL = `
ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_category_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_category_check
  CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations', 'accountability', 'content', 'technology', 'accounting', 'ghl_setup', 'community', 'general', 'torah_class_prep', 'source_sheets', 'shiur_ideas'));
`;

const normalizeTasksStageCheckSQL = `
ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_stage_check;
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'bna_tasks'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%stage%'
  LOOP
    EXECUTE format('ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
  END LOOP;
END $$;
UPDATE bna_tasks
SET stage = CASE stage
  WHEN 'raw_input' THEN 'ready'
  WHEN 'inbox' THEN 'ready'
  WHEN 'needs_decision' THEN 'decision_required'
  WHEN 'assigned' THEN 'ready'
  WHEN 'clarify' THEN 'decision_required'
  WHEN 'plan' THEN 'decision_required'
  WHEN 'execute' THEN 'in_progress'
  WHEN 'review' THEN 'decision_required'
  WHEN 'complete' THEN 'done'
  WHEN 'archive' THEN 'archived'
  ELSE stage
END
WHERE stage IN ('raw_input', 'inbox', 'needs_decision', 'assigned', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive');
ALTER TABLE bna_tasks ALTER COLUMN stage SET DEFAULT 'ready';
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_stage_check
  CHECK (stage IN ('decision_required', 'ready', 'in_progress', 'blocked', 'done', 'archived'));
`;

const normalizeTasksSourceCheckSQL = `
ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_source_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_source_check
  CHECK (source IN ('manual', 'ramble', 'telegram', 'web', 'google_drive', 'content_job', 'import', 'ghl_webhook', 'green_invoice'));
`;

const createCliBridgeSQL = `
CREATE TABLE IF NOT EXISTS cli_bridge_messages (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  metadata JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

function toJsonArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined && String(item).trim());
  if (!value) return [];
  if (typeof value === 'string') return value.split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean);
  return [value];
}

function parseJsonMaybe(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function classNotesFromParse(parsed = {}) {
  return [
    ...(Array.isArray(parsed.class_notes) ? parsed.class_notes : []),
    ...(Array.isArray(parsed.mixed_recording_parse?.class_notes) ? parsed.mixed_recording_parse.class_notes : []),
  ].filter((note) => note && typeof note === 'object');
}

function classNoteValues(notes = [], key, aliases = []) {
  return notes.flatMap((note) =>
    [key, ...aliases].flatMap((field) => toJsonArray(note[field]))
  );
}

function classContentItemText(item) {
  if (!item) return '';
  if (typeof item === 'object') {
    return [
      item.reference,
      item.source,
      item.book,
      item.chapter_verse,
      item.hebrew_source,
      item.hebrew_text,
      item.text,
      item.reader,
    ].filter(Boolean).join(' - ');
  }
  return String(item);
}

function isNonContentClassText(value) {
  const text = String(value || '').toLowerCase();
  if (!text.trim()) return false;
  return (
    /\b(codex|kimi|kimmy|dashboard|telegram|bot|bridge|railway|ghl|green invoice|webhook|parser|routing|database|deploy|task|tasks|my task|for me|app build|coding)\b/.test(text) ||
    /\b(accountability|private meeting|check-?in|follow-?up|attendance|engagement|goals?|student goal|student goals|personal goal|personal goals|fitness|exercise|workout|diet goal|work goal|job goal|torah goal|learning goal|group goal|daily completion|progress percent|percentage|points?|camping trip|student ownership|daily follow-?through|work responsibility)\b/.test(text) ||
    /\b(torah progress|student progress|progress update|timer update|torah timer|parser fallback|fallback parse|review accountability notes)\b/.test(text)
  );
}

function toClassContentArray(values, limit = 20) {
  const seen = new Set();
  const result = [];
  for (const item of toJsonArray(values)) {
    const text = classContentItemText(item).replace(/\s+/g, ' ').trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key) || isNonContentClassText(text)) continue;
    seen.add(key);
    result.push(text);
    if (result.length >= limit) break;
  }
  return result;
}

function firstClassContentText(values) {
  for (const item of toJsonArray(values)) {
    const text = classContentItemText(item).replace(/\s+/g, ' ').trim();
    if (text && !isNonContentClassText(text)) return text;
  }
  return '';
}

function classContentFieldsFromParsed(parsed = {}) {
  const classNotes = classNotesFromParse(parsed);
  const topics = toClassContentArray([
    ...toJsonArray(parsed.topics),
    ...classNoteValues(classNotes, 'topics'),
  ]);
  const discussions = toClassContentArray([
    ...toJsonArray(parsed.discussions),
    ...toJsonArray(parsed.questions_or_discussions),
    ...classNoteValues(classNotes, 'discussions', ['questions_or_discussions']),
  ]);
  const sources = toClassContentArray([
    ...toJsonArray(parsed.sources),
    ...toJsonArray(parsed.source_texts),
    ...toJsonArray(parsed.torah_sources),
    ...classNoteValues(classNotes, 'sources', ['source_texts', 'torah_sources']),
  ]);
  const studentQuestions = toClassContentArray([
    ...toJsonArray(parsed.student_questions),
    ...classNoteValues(classNotes, 'student_questions', ['questions']),
  ]);
  const highlights = toClassContentArray([
    ...toJsonArray(parsed.highlights),
    ...toJsonArray(parsed.newsletter_highlights),
    ...classNoteValues(classNotes, 'highlights', ['newsletter_highlights']),
  ]);
  const summary = firstClassContentText([
    parsed.summary,
    ...classNotes.map((note) => note.summary),
  ]);

  return {
    classNotes,
    summary,
    topics,
    discussions,
    sources,
    studentQuestions,
    highlights,
  };
}

async function upsertClassSessionFromContentJob(db, job) {
  if (!job) return null;
  const parsed = parseJsonMaybe(job.parse_json);
  const fields = classContentFieldsFromParsed(parsed);
  if (parsed?.intake_lane === 'tasks_students' || parsed?.routing?.parser_only) {
    return null;
  }

  const hasStructuredClassContent = Boolean(fields.summary
    || fields.topics.length
    || fields.discussions.length
    || fields.sources.length
    || fields.studentQuestions.length
    || fields.highlights.length);
  const titleLooksLikeClass = /class|torah|shiur|lesson|newsletter|mishna|mishnah|pasuk|verse|source/i.test(`${job.title || ''} ${job.caption || ''}`)
    && !isNonContentClassText(`${job.title || ''} ${job.caption || ''}`);
  if (!hasStructuredClassContent && !titleLooksLikeClass) return null;

  const result = await db.query(
    `INSERT INTO bna_class_sessions (
      workspace_id, content_job_id, class_date, title, summary, topics, discussions, sources,
      student_questions, highlights, newsletter_draft, source_media_url, transcript_text
    ) VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (content_job_id) DO UPDATE SET
      workspace_id = COALESCE(EXCLUDED.workspace_id, bna_class_sessions.workspace_id),
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      topics = EXCLUDED.topics,
      discussions = EXCLUDED.discussions,
      sources = EXCLUDED.sources,
      student_questions = EXCLUDED.student_questions,
      highlights = EXCLUDED.highlights,
      newsletter_draft = EXCLUDED.newsletter_draft,
      source_media_url = EXCLUDED.source_media_url,
      transcript_text = EXCLUDED.transcript_text,
      updated_at = NOW()
    RETURNING *`,
    [
      job.workspace_id || null,
      job.id,
      job.created_at || null,
      job.title,
      fields.summary || null,
      JSON.stringify(fields.topics),
      JSON.stringify(fields.discussions),
      JSON.stringify(fields.sources),
      JSON.stringify(fields.studentQuestions),
      JSON.stringify(fields.highlights),
      parsed.newsletter_draft || null,
      job.media_url || null,
      job.transcript_text || null,
    ]
  );
  return result.rows[0] || null;
}

function isSpeakerDiarizationText(text) {
  const normalized = String(text || '').toLowerCase();
  return /\b(speaker|speakers|speaker labels?|who said what|diari[sz]e|diari[sz]ation)\b/.test(normalized)
    && /\b(record|recording|audio|video|transcript|transcribe|whisper|class)\b/.test(normalized);
}

function isPureCapabilityQuestion(text) {
  const normalized = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return false;

  const questionLead = /^(are there|is there|is this|do we|does |can i|can we|can you|can the|could i|could we|could this|would i|would we|would it be possible|is it possible|will i|will we|will it|will this|how can|how do|what about|why did|why is|what happened)\b/.test(normalized);
  const questionInside = /\b(is there (?:some sort of )?way|are there ways|does .+ support|can .+ label|can .+ record|why did .+ happen)\b/.test(normalized);
  const explicitWork = /\b(i need you|i want you|you need to|you have to|please|check|fix|build|wire|set up|setup|configure|deploy|update|change|remove|add|create|make|run|sync|implement|queue|file|capture|task|todo|mark|send|call|email|pay|paid)\b/.test(normalized);

  return (questionLead || questionInside) && !explicitWork;
}

function inferTaskCategory(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(source sheet|sourcesheet|mekorot|mareh mekomos|marei mekomos)\b/.test(normalized)) return 'source_sheets';
  if (/\b(shiur idea|shiur topic|topic ideas?|brainstorm.*shiur|mishnah class idea)\b/.test(normalized)) return 'shiur_ideas';
  if (/\b(mishnah class|mishna class|torah class prep|class prep|prepare.*shiur|prepare.*mishnah)\b/.test(normalized)) return 'torah_class_prep';
  if (/\b(ghl setup|ghl|go high level|highlevel)\b/.test(normalized) && /\b(one time|rabbi|mishnah|mishna)\b/.test(normalized)) return 'ghl_setup';
  if (/\b(admin|administration|logistics|schedule|registration)\b/.test(normalized) && /\b(one time|rabbi|mishnah|mishna)\b/.test(normalized)) return 'admin';
  if (/\b(community|participant|attendee|registration|one time)\b/.test(normalized) && /\b(mishnah|mishna|rabbi|class)\b/.test(normalized)) return 'community';
  if (/\b(login|access|bot|telegram|openai|web search|agent|api|tooling)\b/.test(normalized) && /\b(rabbi|one time|mishnah|mishna)\b/.test(normalized)) return 'technology';
  if (isSpeakerDiarizationText(normalized)) return 'content';
  const parserRoutingWork = /\b(parse|parser|route|routing|button|dashboard|operations|section|lane|telegram|bot|bridge|codex|app|system)\b/.test(normalized)
    && /\b(task|tasks|student|students|accountability|content|recording|transcript)\b/.test(normalized);
  if (parserRoutingWork) return 'operations';
  if (/\b(pay|paid|payment|cash|credit|invoice|tuition|billing|accounting)\b/.test(normalized)) return 'finance';
  if (/\b(student|goal|meeting|accountability|question|class|shiur)\b/.test(normalized)) return 'accountability';
  if (/\b(whatsapp|facebook|youtube|blog|newsletter|marketing|social|post|publish|caption|repurpose)\b/.test(normalized)) return 'marketing';
  if (/\b(parent|email|message|communicat|form|signup|contact)\b/.test(normalized)) return 'communications';
  if (/\b(video|recording|transcript|content)\b/.test(normalized)) return 'operations';
  return 'operations';
}

function inferTaskStage(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(option|choose|decide|should we|what do you recommend|which one)\b/.test(normalized)) return 'decision_required';
  if (/\b(start|build|fix|wire|set up|setup|configure|process|transcribe|deploy|sync|run|finish|verify|mark|make|create|send|update|change|remove|add|do this|parse|route|file|put it|hide|stop showing|stop sending|get rid)\b/.test(normalized)) return 'ready';
  return 'ready';
}

function inferTaskOwner(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(i need you to|i want you|you need to|you have to|you should|can you|please)\b/.test(normalized)) return 'Codex';
  if (/(planned briefs?|plan briefs?|implementation briefs?|briefs section|section planned? briefs?)/.test(normalized) && /\b(can we|get rid|remove|hide|stop showing|should never|codex|kodak)\b/.test(normalized)) return 'Codex';
  if (/\b(i need to|i should|remind me|my task|for me to)\b/.test(normalized)) return 'Shloimie';
  if (isSpeakerDiarizationText(normalized) && /\b(add|fix|implement|verify|improve|support|label|transcribe|record|recording)\b/.test(normalized)) return 'Codex';
  if (/\b(kimi|kimmy|codex|kodak|codak|bot|agent|system|machine task|programming|fix|build|wire|configure|process|transcribe|deploy|verify|parse|parser|routing|dashboard|task manager|content section|telegram buttons?)\b/.test(normalized)) return 'Codex';
  return null;
}

function polishTaskCandidateText(text) {
  let value = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\b(umm+|uh+|like|you know|basically|okay so|ok so|yeah|right|just|also)\b/gi, ' ')
    .replace(/\b(can you|could you|i need you to|i want you to|you need to|please|no codex|codex|kimi|kimmy|mr kenny)\b/gi, '')
    .replace(/\b(i don't know|i have no idea|what in the world)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!value) return 'Review captured task';
  const lower = value.toLowerCase();
  if (/build everything/.test(lower)) {
    if (/(future|remember|means|confirm|confirmation|order)/.test(lower)) {
      return 'Remember build everything means work through queued tasks without order confirmation';
    }
    return 'Work through queued Codex tasks in a practical order';
  }
  if (/(telegram|message|reply|response)/.test(lower) && /(cut off|cutoff|middle of a sentence|just says c|truncated)/.test(lower)) {
    return 'Fix Telegram replies that appear cut off after capture summaries';
  }
  if (isSpeakerDiarizationText(lower)) {
    return 'Verify speaker-label transcription for multi-speaker class recordings';
  }
  if (/(telegram|bot)/.test(lower) && /(button|buttons|quick action|mine|urgent|done|get rid|don't need)/.test(lower)) {
    return 'Remove Telegram task quick-action buttons';
  }
  if (/(parse|parser|route|routing|right section|right lane)/.test(lower) && /(task|tasks|students|accountability|content|contacts|accounting|app)/.test(lower)) {
    return 'Route Telegram captures to the correct app lane';
  }
  if (/(parse|parser|routing|button)/.test(lower) && /(task|tasks|student|students|accountability|content)/.test(lower)) {
    return 'Route task and student recordings outside Content';
  }
  if (/natural language/.test(lower) && /task/.test(lower)) {
    return 'Clean raw natural-language wording from the Tasks dashboard';
  }
  if (/(same task file|same page|exact same page|changelog|change log)/.test(lower) && /(kimi|codex|agent|task)/.test(lower)) {
    return 'Keep Codex work on the shared task and changelog ledger';
  }
  if (/(website|homepage|progress|pages? learned)/.test(lower) && /(30|page|pages|progress|learned)/.test(lower)) {
    const pageMatch = lower.match(/(?:at|to|did|learned|finished|up to|update(?:d)?(?:\s+to)?)\s*(\d+(?:\.\d+)?|\d+\s+and\s+a\s+half|three\s+and\s+a\s+half|three|four|five)\s*(?:pages?|\/30)?/);
    const wordPages = {
      three: '3',
      four: '4',
      five: '5',
      'three and a half': '3.5',
    };
    const pages = pageMatch
      ? (wordPages[pageMatch[1]] || pageMatch[1].replace(/\s+and\s+a\s+half/, '.5'))
      : null;
    return pages
      ? `Update homepage learning progress to ${pages} of 30 pages`
      : 'Update homepage 30-page learning progress';
  }
  if (/(carousel|image slider|slider|learning moments)/.test(lower) && /(image|drive|intake)/.test(lower)) {
    return 'Use the newest Drive intake images for the homepage Learning Moments carousel';
  }
  if (/(planned briefs?|plan briefs?|implementation briefs?|briefs section|section planned? briefs?)/.test(lower) && /(get rid|remove|don't want|do not want|should never|codex|kodak)/.test(lower)) {
    return 'Remove planned briefs from the operator-facing Tasks dashboard';
  }
  if (/(railway)/.test(lower) && /(token|deploy|login|logged|problem)/.test(lower)) {
    return 'Stabilize Railway token, deploy, and smoke-test workflow';
  }
  value = value.charAt(0).toUpperCase() + value.slice(1);
  if (value.length > 220) value = `${value.slice(0, 217).trim()}...`;
  return value;
}

function taskTitleLooksRawForServer(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  if (text.length > 150) return true;
  if (/\b(umm+|uh+|you know|i want you to|i need you to|what i want you to do|can you|could you|i don't know)\b/i.test(text)) return true;
  if (text.length > 95 && (lower.match(/\b(and|also|then|so)\b/g) || []).length >= 4) return true;
  return false;
}

function cleanTaskTitleForStorage(title, rawText = '') {
  const candidate = String(title || '').replace(/\s+/g, ' ').trim();
  if (!candidate) return '';
  if (!taskTitleLooksRawForServer(candidate)) return candidate.slice(0, 240);
  return polishTaskCandidateText([rawText, candidate].filter(Boolean).join(' ')).slice(0, 240);
}

function explainTaskCandidate(line) {
  const category = inferTaskCategory(line);
  const owner = inferTaskOwner(line) || 'Unassigned';
  return [
    `Clear task extracted from Telegram input.`,
    `Owner: ${owner}.`,
    `Area: ${category}.`,
    `Original input was condensed and rephrased so the dashboard does not show raw ramble text.`,
  ].join(' ');
}

function isLowConfidenceTaskIntake(text) {
  const normalized = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized || isPureCapabilityQuestion(normalized)) return false;
  if (/^(thanks|thank you|ok|okay|yes|no|hi|hello|good morning|good night)\b/.test(normalized)) return false;
  const hasWorkDomain = /\b(task|tasks|decision|decisions|review|queue|routing|route|parser|telegram|bot|dashboard|operations|student|students|accountability|content|contacts|accounting|calendar|signup|payment|class|goal|website|portal|openai|agent|codex|kimi)\b/.test(normalized);
  const uncertainty = /\b(maybe|not sure|unclear|figure out|somewhere|whatever|review this|look at this|this thing|something with|where does this go)\b/.test(normalized);
  const hasLongContext = normalized.split(/\s+/).length >= 9;
  return hasWorkDomain && (uncertainty || hasLongContext);
}

function buildLowConfidenceIntakeDecision(text) {
  const rawText = String(text || '').trim();
  const category = inferTaskCategory(rawText);
  const projectKey = inferProjectKeyFromText(rawText);
  return {
    title: 'Decide where to route captured intake',
    notes: [
      'Low-confidence intake needs an operator routing choice before it becomes work.',
      'Option A: File as my task',
      'Option B: Send to Codex',
      'Option C: Archive as no action',
    ].join('\n'),
    stage: 'decision_required',
    category,
    urgency: /urgent|asap|right away|immediately|today/i.test(rawText) ? 'today' : 'this_week',
    assigned_to: null,
    project_key: projectKey,
    decision_required: true,
    original_text: rawText,
    intake_confidence: 'low',
    routing: {
      route: 'decision',
      confidence: 'low',
      reason: 'No clear owner/action combination was detected.',
    },
    options: [
      {
        label: 'File as my task',
        value: 'Turn this into operator work.',
        updates: { stage: 'ready', decision_required: false, assigned_to: 'Shloimie', category },
      },
      {
        label: 'Send to Codex',
        value: 'Turn this into agent implementation work.',
        updates: { stage: 'ready', decision_required: false, assigned_to: 'Codex', category },
      },
      {
        label: 'Archive',
        value: 'No task is needed from this capture.',
        updates: { stage: 'archived', decision_required: false, assigned_to: null },
      },
    ],
  };
}

function taskCandidateAiParsed(candidate, parser) {
  return {
    parser,
    kind: candidate.decision_required ? 'routing_decision' : 'task_or_decision',
    display_title: candidate.title,
    display_note: candidate.intake_confidence === 'low'
      ? 'Low-confidence intake needs a routing choice before it becomes work.'
      : undefined,
    original_text: candidate.original_text,
    project: candidate.project_key || inferProjectKeyFromText(candidate.original_text),
    intake_confidence: candidate.intake_confidence || 'high',
    routing: candidate.routing || {
      route: 'auto_file',
      confidence: 'high',
      reason: 'Clear action/owner signals were detected.',
    },
    options: candidate.options || [],
  };
}

function parseRambleIntoTaskCandidates(ramble) {
  const text = String(ramble || '').trim();
  if (!text) return [];
  if (isPureCapabilityQuestion(text)) return [];

  const fragments = text
    .split(/\r?\n|[.;]|(?:\s+-\s+)/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 8)
    .slice(0, 14);

  const actionable = fragments.filter((line) =>
    /\b(need|needs|fix|build|wire|set up|setup|configure|process|transcribe|send|call|email|pay|paid|mark|track|create|make|run|deploy|sync|finish|add|remove|change|update|parse|route|file|hide|stop|put)\b|\b(get rid|you have to|you should)\b/i.test(line)
  );
  const decisionable = fragments.filter((line) =>
    /\b(option|choose|decide|should we|what do you recommend|which one)\b/i.test(line)
  );
  const candidates = [...new Set([...actionable, ...decisionable])].slice(0, 8);

  if (!candidates.length) {
    return isLowConfidenceTaskIntake(text) ? [buildLowConfidenceIntakeDecision(text)] : [];
  }

  return candidates.map((line) => ({
    title: polishTaskCandidateText(line),
    notes: explainTaskCandidate(line),
    stage: inferTaskStage(line),
    category: inferTaskCategory(line),
    urgency: /urgent|asap|right away|immediately|today/i.test(line) ? 'urgent' : 'this_week',
    assigned_to: inferTaskOwner(line),
    project_key: inferProjectKeyFromText(line),
    decision_required: inferTaskStage(line) === 'decision_required',
    original_text: line,
    intake_confidence: 'high',
    routing: {
      route: 'auto_file',
      confidence: 'high',
      reason: 'Clear action/owner signals were detected.',
    },
  }));
}

function normalizeTaskAssignee(value) {
  const raw = String(value || '').trim();
  if (!raw || /^(unassigned|none|no one|null)$/i.test(raw)) return null;
  if (/^(rabbi elie scheller|rabbi elie|elie scheller|rabbi)$/i.test(raw)) return 'Rabbi Elie Scheller';
  if (/^(shloimie|shlomo|operator|me|myself)$/i.test(raw)) return 'Shloimie';
  if (/^(kimi|kimmy|codex|agent|system|ai)$/i.test(raw)) return 'Codex';
  return raw.slice(0, 120);
}

function sourceContextToText(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function mixedRecordingParserItemKey(jobId, lane, parts = []) {
  const source = parts
    .flatMap((part) => Array.isArray(part) ? part : [part])
    .map((part) => {
      if (part === undefined || part === null) return '';
      if (typeof part === 'object') return JSON.stringify(part);
      return String(part);
    })
    .map((part) => normalizeLooseText(part) || String(part).trim().toLowerCase())
    .filter(Boolean)
    .join('|');
  const fingerprint = crypto
    .createHash('sha256')
    .update(source || `${jobId}|${lane}`)
    .digest('hex')
    .slice(0, 20);
  return `mixed-recording:${jobId}:${lane}:${fingerprint}`;
}

function mixedRecordingParserMetadata(job = {}, lane, parserItemKey, original, extra = {}) {
  return {
    parser: 'mixed-recording-v1',
    source_content_job_id: job.id || null,
    parser_lane: lane,
    parser_item_key: parserItemKey,
    source_workspace_id: job.workspace_id || null,
    ...extra,
    original,
  };
}

function titleFromRawTaskText(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return '';
  const firstLine = text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || text;
  return polishTaskCandidateText(firstLine).slice(0, 240);
}

async function createTaskFromText(input = {}, options = {}, db = pool) {
  const rawText = String(input.raw_text || input.rawText || input.ramble || input.text || input.title || '').trim();
  const title = cleanTaskTitleForStorage(input.title || titleFromRawTaskText(rawText), rawText);
  if (!title) {
    const error = new Error('Task title or raw text is required');
    error.statusCode = 400;
    throw error;
  }

  const project = await resolveProjectFromInput({ ...input, raw_text: rawText || title }, db);
  if (options.req) assertProjectAccess(options.req, project);

  const inferredStage = inferTaskStage(`${title}\n${rawText}`);
  const requestedDecisionRequired =
    input.decision_required !== undefined
      ? Boolean(input.decision_required)
      : Boolean(input.decisionRequired) || inferredStage === 'decision_required';
  const assignedTo = normalizeTaskAssignee(input.assigned_to || input.assignedTo || input.owner);
  const notes = String(input.notes || input.context || input.source_context?.notes || '').trim()
    || (rawText && rawText !== title ? rawText : null);
  const createdBy = String(input.created_by || input.createdBy || input.author || 'telegram').trim();
  const author = String(input.author || createdBy || '').trim() || null;
  const category = safeTaskCategory(input.category || inferTaskCategory(`${title}\n${rawText}`));
  const stage = normalizeTaskStageValue(input.stage || (requestedDecisionRequired ? 'decision_required' : inferredStage || 'ready'), {
    decisionRequired: requestedDecisionRequired,
  });
  const decisionRequired = taskDecisionRequiredForStage(stage, requestedDecisionRequired);
  const urgency = safeTaskUrgency(input.urgency);
  const source = safeTaskSource(input.source || 'telegram');
  const blockerReason = String(input.blocker_reason || input.blocker || input.blocked_reason || '').trim() || null;
  const aiParsed = input.ai_parsed || {
    parser: 'create_task_from_text-v1',
    kind: decisionRequired ? 'decision' : 'task',
    display_title: title,
    original_text: rawText || title,
    project: project.name,
  };
  const aiParsedJson = JSON.stringify(aiParsed);
  const parserItemKey = aiParsed && typeof aiParsed === 'object'
    ? String(aiParsed.parser_item_key || '').trim()
    : '';
  const taskValues = [
    project.workspace_id || null,
    title,
    notes,
    stage,
    category,
    urgency,
    input.energy_required || null,
    input.estimated_minutes || null,
    input.due_date || null,
    blockerReason,
    source,
    sourceContextToText(input.source_context || input.context_metadata || null),
    createdBy,
    assignedTo,
    aiParsedJson,
    project.id,
    decisionRequired,
    author,
  ];

  if (parserItemKey) {
    const existing = await db.query(
      `UPDATE bna_tasks
       SET workspace_id = $1,
           title = $2,
           notes = $3,
           stage = $4,
           category = $5,
           urgency = $6,
           energy_required = $7,
           estimated_minutes = $8,
           due_date = $9,
           blocker_reason = $10,
           source = $11,
           source_context = $12,
           created_by = COALESCE(created_by, $13),
           assigned_to = $14,
           ai_parsed = $15,
           project_id = $16,
           decision_required = $17,
           author = COALESCE($18, author),
           updated_at = NOW()
       WHERE ai_parsed->>'parser_item_key' = $19
       RETURNING *`,
      [...taskValues, parserItemKey]
    );
    if (existing.rows[0]) {
      return {
        ...existing.rows[0],
        project_key: project.project_key,
        project_name: project.name,
        project_short_name: project.short_name,
      };
    }
  }

  const result = await db.query(
    `INSERT INTO bna_tasks (
       workspace_id, title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date,
       blocker_reason, source, source_context, created_by, assigned_to, ai_parsed, project_id, decision_required, author
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
    taskValues
  );
  return {
    ...result.rows[0],
    project_key: project.project_key,
    project_name: project.name,
    project_short_name: project.short_name,
  };
}

async function upsertStudentFromSignup(signup) {
  if (!signup?.student_name) return null;

  const result = await pool.query(
    `INSERT INTO bna_students (
      workspace_id, signup_id, name, parent_name, parent_email, parent_phone,
      age, grade, current_school, ghl_contact_id, tags, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (signup_id) DO UPDATE SET
      workspace_id = COALESCE(EXCLUDED.workspace_id, bna_students.workspace_id),
      name = EXCLUDED.name,
      parent_name = EXCLUDED.parent_name,
      parent_email = EXCLUDED.parent_email,
      parent_phone = EXCLUDED.parent_phone,
      age = EXCLUDED.age,
      grade = EXCLUDED.grade,
      current_school = EXCLUDED.current_school,
      ghl_contact_id = COALESCE(EXCLUDED.ghl_contact_id, bna_students.ghl_contact_id),
      tags = EXCLUDED.tags,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING *`,
    [
      signup.workspace_id || null,
      signup.id,
      signup.student_name,
      signup.parent_name || null,
      signup.parent_email || null,
      signup.parent_phone || null,
      signup.student_age || null,
      signup.student_grade || null,
      signup.previous_school || null,
      signup.ghl_student_contact_id || null,
      ['student', 'bna'],
      signup.notes || null,
    ]
  );

  return result.rows[0];
}

async function ensureStudentsFromSignups() {
  const result = await pool.query("SELECT * FROM signups WHERE COALESCE(status, 'new') <> 'archived' ORDER BY created_at ASC");
  for (const signup of result.rows) {
    await upsertStudentFromSignup(signup);
  }
}

const TORAH_STUDENT_SEEDS = [
  {
    name: 'Huda Weber',
    aliases: ['Huda Weber', 'Huda', 'Weber'],
    goal_minutes: DEFAULT_TORAH_GOAL_MINUTES,
    goal_type: GOAL_TYPES.INSIDE,
    carried_over_completed_units: DEFAULT_TORAH_MIGRATION_CARRIED_OVER_UNITS,
    total_required_units: DEFAULT_TORAH_TRIP_REQUIRED_UNITS,
  },
  {
    name: 'Hillel Baraka',
    aliases: ['Hillel Baraka', 'Hillel Braka', 'Hillel'],
    goal_minutes: DEFAULT_TORAH_GOAL_MINUTES,
    goal_type: GOAL_TYPES.INSIDE,
    carried_over_completed_units: DEFAULT_TORAH_MIGRATION_CARRIED_OVER_UNITS,
    total_required_units: DEFAULT_TORAH_TRIP_REQUIRED_UNITS,
  },
  {
    name: 'Menachem Mendel Dratler',
    aliases: ['Menachem Mendel Dratler', 'menachem', 'Menachem'],
    goal_minutes: DEFAULT_TORAH_GOAL_MINUTES,
    goal_type: GOAL_TYPES.INSIDE,
    carried_over_completed_units: DEFAULT_TORAH_MIGRATION_CARRIED_OVER_UNITS,
    total_required_units: DEFAULT_TORAH_TRIP_REQUIRED_UNITS,
  },
  {
    name: 'Eitan Chaim Golombo',
    aliases: ['Eitan Chaim Golombo', 'Eitan Chaim Golambo', 'Eitan Chaim', 'Golambo', 'Golombo', 'Colombo', 'Lumbo'],
    goal_minutes: DEFAULT_TORAH_GOAL_MINUTES,
    goal_type: GOAL_TYPES.INSIDE,
    carried_over_completed_units: DEFAULT_TORAH_MIGRATION_CARRIED_OVER_UNITS,
    total_required_units: DEFAULT_TORAH_TRIP_REQUIRED_UNITS,
  },
  {
    name: 'Amitai Kosofsky',
    aliases: ['Amitai Kosofsky', 'Amitay Kosofsky', 'אמיתי קוסובסקי'],
    goal_minutes: DEFAULT_TORAH_GOAL_MINUTES,
    goal_type: GOAL_TYPES.INSIDE,
    carried_over_completed_units: DEFAULT_TORAH_MIGRATION_CARRIED_OVER_UNITS,
    total_required_units: DEFAULT_TORAH_TRIP_REQUIRED_UNITS,
  },
];

function findTorahSeedByName(name) {
  const normalizedName = normalizeLooseText(name);
  return TORAH_STUDENT_SEEDS.find((seed) =>
    [seed.name, ...(seed.aliases || [])].some((alias) => normalizeLooseText(alias) === normalizedName)
  ) || null;
}

function torahSeedOrder(name) {
  const normalizedName = normalizeLooseText(name);
  const index = TORAH_STUDENT_SEEDS.findIndex((seed) =>
    [seed.name, ...(seed.aliases || [])].some((alias) => normalizeLooseText(alias) === normalizedName)
  );
  return index >= 0 ? index : 999;
}

function getTorahTripDefaultsForStudent(studentOrName) {
  const name = typeof studentOrName === 'string'
    ? studentOrName
    : studentOrName?.name || '';
  const seed = findTorahSeedByName(name);
  return {
    carriedOverCompletedUnits: Number(seed?.carried_over_completed_units ?? 0),
    totalRequiredUnits: Number(seed?.total_required_units ?? DEFAULT_TORAH_TRIP_REQUIRED_UNITS),
  };
}

async function ensureTorahSeedStudents(db = pool) {
  const [studentsResult, signupsResult, intakeResult] = await Promise.all([
    db.query('SELECT * FROM bna_students ORDER BY id ASC'),
    db.query("SELECT * FROM signups WHERE COALESCE(status, 'new') <> 'archived' ORDER BY created_at ASC"),
    db.query("SELECT * FROM bna_payment_intake WHERE status IN ('unmatched', 'needs_signup', 'completed', 'matched') ORDER BY received_at DESC"),
  ]);

  const students = studentsResult.rows.slice();
  const signups = signupsResult.rows;
  const intakeRows = intakeResult.rows;

  for (const seed of TORAH_STUDENT_SEEDS) {
    const aliases = [seed.name, ...(seed.aliases || [])].map(normalizeLooseText);
    const exactSeedName = normalizeLooseText(seed.name);
    const matchingStudent =
      students.find((student) => normalizeLooseText(student.name) === exactSeedName) ||
      students.find((student) => aliases.includes(normalizeLooseText(student.name)) && !/merged into/i.test(student.notes || '')) ||
      students.find((student) => aliases.includes(normalizeLooseText(student.name)));
    const matchingSignup = signups.find((signup) => aliases.includes(normalizeLooseText(signup.student_name)));
    const matchingIntake = intakeRows.find((row) => aliases.includes(normalizeLooseText(row.student_name)));

    if (matchingStudent) {
      const updated = await db.query(
        `UPDATE bna_students
         SET name = $2,
             parent_name = COALESCE(parent_name, $3),
             parent_email = COALESCE(parent_email, $4),
             parent_phone = COALESCE(parent_phone, $5),
             status = 'active',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          matchingStudent.id,
          seed.name,
          matchingSignup?.parent_name || matchingIntake?.parent_name || matchingStudent.parent_name || null,
          matchingSignup?.parent_email || matchingStudent.parent_email || null,
          matchingSignup?.parent_phone || matchingStudent.parent_phone || null,
        ]
      );
      const index = students.findIndex((student) => Number(student.id) === Number(matchingStudent.id));
      if (index >= 0) students[index] = updated.rows[0];
      continue;
    }

    if (matchingSignup) {
      const inserted = await upsertStudentFromSignup({
        ...matchingSignup,
        student_name: seed.name,
      });
      students.push(inserted);
      continue;
    }

    const defaultWorkspace = await getDefaultSchoolWorkspace(db);
    const inserted = await db.query(
      `INSERT INTO bna_students (
        workspace_id, name, parent_name, parent_email, parent_phone, status, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
      RETURNING *`,
      [
        defaultWorkspace.id,
        seed.name,
        matchingIntake?.parent_name || null,
        null,
        matchingIntake?.parent_phone || null,
        ['student', 'bna', 'torah_goal'],
        `Seeded for Torah learning group goal on ${TORAH_TEMP_SEED_DATE}.`,
      ]
    );
    students.push(inserted.rows[0]);
  }
}

async function getTorahStudents(dateString = getTodayDateInTimeZone(), db = pool) {
  const result = await db.query(
    `SELECT s.*
     FROM bna_students s
     WHERE COALESCE(s.status, 'active') NOT IN ('inactive', 'archived')
       AND EXISTS (
         SELECT 1
         FROM bna_torah_learning_goals g
         WHERE g.student_id = s.id
           AND g.start_date <= $1::date
           AND (g.end_date IS NULL OR g.end_date >= $1::date)
       )
     ORDER BY s.id ASC`,
    [dateString]
  );

  const usedIds = new Set();
  return TORAH_STUDENT_SEEDS.map((seed) => {
    const aliases = [seed.name, ...(seed.aliases || [])].map(normalizeLooseText);
    const exactSeedName = normalizeLooseText(seed.name);
    const match =
      result.rows.find((student) =>
        !usedIds.has(Number(student.id)) &&
        normalizeLooseText(student.name) === exactSeedName
      ) ||
      result.rows.find((student) =>
        !usedIds.has(Number(student.id)) &&
        aliases.includes(normalizeLooseText(student.name))
      );
    if (!match) return null;
    usedIds.add(Number(match.id));
    return match;
  }).filter(Boolean);
}

async function getTorahGoalForDate(studentId, dateString, db = pool) {
  const result = await db.query(
    `SELECT *
     FROM bna_torah_learning_goals
     WHERE student_id = $1
       AND start_date <= $2::date
       AND (end_date IS NULL OR end_date >= $2::date)
     ORDER BY start_date DESC, id DESC
     LIMIT 1`,
    [studentId, dateString]
  );
  return result.rows[0] || null;
}

async function getLatestTorahGoal(studentId, db = pool) {
  const result = await db.query(
    `SELECT *
     FROM bna_torah_learning_goals
     WHERE student_id = $1
     ORDER BY start_date DESC, id DESC
     LIMIT 1`,
    [studentId]
  );
  return result.rows[0] || null;
}

async function createTorahGoalForMonth(studentId, dateString, seedConfig, db = pool) {
  const monthStart = firstDayOfMonth(dateString);
  const student = (await db.query('SELECT workspace_id FROM bna_students WHERE id = $1 LIMIT 1', [studentId])).rows[0] || {};
  const latestGoal = await getLatestTorahGoal(studentId, db);
  let goalMinutes = Number(seedConfig?.goal_minutes || DEFAULT_TORAH_GOAL_MINUTES);
  let goalType = seedConfig?.goal_type || GOAL_TYPES.LISTENING;

  if (latestGoal) {
    const monthsElapsed = Math.max(1, diffCalendarMonths(firstDayOfMonth(latestGoal.start_date), monthStart));
    goalMinutes = Number(latestGoal.goal_minutes) + monthsElapsed * 5;
    goalType = latestGoal.goal_type || goalType;

    await db.query(
      `UPDATE bna_torah_learning_goals
       SET active = FALSE,
           end_date = COALESCE(end_date, $2::date),
           updated_at = NOW()
       WHERE id = $1`,
      [latestGoal.id, addDaysToDateString(monthStart, -1)]
    );
  }

  const inserted = await db.query(
    `INSERT INTO bna_torah_learning_goals (
      workspace_id, student_id, goal_minutes, goal_type, active, start_date, end_date
    ) VALUES ($1, $2, $3, $4, TRUE, $5::date, NULL)
    RETURNING *`,
    [student.workspace_id || null, studentId, goalMinutes, goalType, monthStart]
  );
  return inserted.rows[0];
}

async function ensureTorahGoalsForDate(dateString, db = pool) {
  await ensureTorahSeedStudents(db);
  const students = await db.query(
    `SELECT s.*
     FROM bna_students s
     WHERE COALESCE(s.status, 'active') NOT IN ('inactive', 'archived')
       AND EXISTS (
         SELECT 1
         FROM (
           SELECT $1::text AS name UNION ALL
           SELECT $2::text UNION ALL
           SELECT $3::text UNION ALL
           SELECT $4::text UNION ALL
           SELECT $5::text
         ) seeded
         WHERE lower(s.name) = lower(seeded.name)
       )
     ORDER BY s.name ASC`,
    TORAH_STUDENT_SEEDS.map((seed) => seed.name)
  );

  for (const student of students.rows) {
    const existingGoal = await getTorahGoalForDate(student.id, dateString, db);
    if (existingGoal) continue;
    await createTorahGoalForMonth(student.id, dateString, findTorahSeedByName(student.name), db);
  }
}

async function refreshTorahTripProgressSnapshots(studentId, options = {}, db = pool) {
  const studentResult = await db.query(
    `SELECT id, name
     FROM bna_students
     WHERE id = $1
     LIMIT 1`,
    [studentId]
  );
  const student = studentResult.rows[0];
  if (!student) return;

  const defaultTrip = getTorahTripDefaultsForStudent(student);
  const carriedOverCompletedUnits = validateNonNegativeMinutes(
    options.carriedOverCompletedUnits ?? defaultTrip.carriedOverCompletedUnits,
    'carried_over_completed_units'
  );
  const totalRequiredUnits = validatePositiveNumber(
    options.totalRequiredUnits ?? defaultTrip.totalRequiredUnits,
    'total_required_units'
  );

  const entriesResult = await db.query(
    `SELECT
        id,
        individual_percentage,
        individual_complete,
        COALESCE(daily_completion_percentage, individual_percentage, 0) AS daily_completion_percentage,
        COALESCE(daily_completed_boolean, individual_complete, FALSE) AS daily_completed_boolean
     FROM bna_torah_learning_entries
     WHERE student_id = $1
     ORDER BY date ASC, id ASC`,
    [studentId]
  );

  let completedDailyUnits = 0;
  for (const row of entriesResult.rows) {
    const dailyCompletionPercentage = dailyCompletionPercentageFromEntry(row);
    const dailyCompletedUnits = calculateDailyCompletedUnits(dailyCompletionPercentage);
    const dailyCompletedBoolean = dailyCompletedUnits >= 1;
    completedDailyUnits += dailyCompletedUnits;

    const tripProgress = calculateStudentTripProgress({
      carriedOverCompletedUnits,
      completedDailyUnits,
      totalRequiredUnits,
    });

    await db.query(
      `UPDATE bna_torah_learning_entries
       SET daily_completion_percentage = $2,
           daily_completed_boolean = $3,
           individual_complete = $3,
           completed_daily_units = $4,
           carried_over_completed_units = $5,
           total_completed_units = $6,
           total_required_units = $7,
           total_trip_progress_percentage = $8,
           updated_at = NOW()
       WHERE id = $1`,
      [
        row.id,
        dailyCompletionPercentage,
        dailyCompletedBoolean,
        tripProgress.completedDailyUnits,
        tripProgress.carriedOverCompletedUnits,
        tripProgress.totalCompletedUnits,
        tripProgress.totalRequiredUnits,
        tripProgress.totalTripProgressPercentageRaw,
      ]
    );
  }
}

async function upsertTorahLearningEntry(input = {}, db = pool) {
  const studentId = Number(input.student_id);
  if (!Number.isFinite(studentId)) {
    throw new Error('student_id is required');
  }

  const date = toIsoDateValue(input.date || getTodayDateInTimeZone());
  const goalMinutes = validateGoalMinutes(input.goal_minutes);
  const goalType = normalizeGoalType(input.goal_type);
  const engagedListeningMinutes = validateNonNegativeMinutes(
    input.engaged_listening_minutes ?? 0,
    'engaged_listening_minutes'
  );
  const insideEngagedMinutes = validateNonNegativeMinutes(
    input.inside_engaged_minutes ?? 0,
    'inside_engaged_minutes'
  );
  const listeningWithoutFollowingMinutes = validateNonNegativeMinutes(
    input.listening_without_following_minutes ?? 0,
    'listening_without_following_minutes'
  );

  const studentResult = await db.query(
    `SELECT *
     FROM bna_students
     WHERE id = $1
       AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')`,
    [studentId]
  );
  const student = studentResult.rows[0];
  if (!student) {
    throw new Error('Student not found');
  }

  await ensureTorahGoalsForDate(date, db);
  let goal = await getTorahGoalForDate(studentId, date, db);
  const monthStart = firstDayOfMonth(date);

  if (goal && firstDayOfMonth(goal.start_date) === monthStart) {
    const updatedGoal = await db.query(
      `UPDATE bna_torah_learning_goals
       SET goal_minutes = $2,
           goal_type = $3,
           active = TRUE,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [goal.id, goalMinutes, goalType]
    );
    goal = updatedGoal.rows[0];
  } else {
    await db.query(
      `UPDATE bna_torah_learning_goals
       SET active = FALSE,
           end_date = COALESCE(end_date, $2::date),
           updated_at = NOW()
       WHERE student_id = $1
         AND (end_date IS NULL OR end_date >= $2::date)`,
      [studentId, addDaysToDateString(monthStart, -1)]
    );
    const insertedGoal = await db.query(
      `INSERT INTO bna_torah_learning_goals (
        workspace_id, student_id, goal_minutes, goal_type, active, start_date, end_date
      ) VALUES ($1, $2, $3, $4, TRUE, $5::date, NULL)
      RETURNING *`,
      [student.workspace_id || null, studentId, goalMinutes, goalType, monthStart]
    );
    goal = insertedGoal.rows[0];
  }

  const progress = calculateStudentTorahProgress({
    goalMinutes,
    goalType,
    engagedListeningMinutes,
    insideEngagedMinutes,
    listeningWithoutFollowingMinutes,
  });

  const existingEntryResult = await db.query(
    `SELECT *
     FROM bna_torah_learning_entries
     WHERE student_id = $1
       AND date = $2::date
     LIMIT 1`,
    [studentId, date]
  );
  const existingEntry = existingEntryResult.rows[0] || null;
  const tripDefaults = getTorahTripDefaultsForStudent(student);
  const carriedOverCompletedUnits = validateNonNegativeMinutes(
    input.carried_over_completed_units
      ?? existingEntry?.carried_over_completed_units
      ?? tripDefaults.carriedOverCompletedUnits,
    'carried_over_completed_units'
  );
  const totalRequiredUnits = validatePositiveNumber(
    input.total_required_units
      ?? existingEntry?.total_required_units
      ?? tripDefaults.totalRequiredUnits,
    'total_required_units'
  );
  const dailyCompletionPercentage = progress.individualPercentageRaw;
  const completedDailyUnit = calculateDailyCompletedUnits(dailyCompletionPercentage);
  const dailyCompletedBoolean = completedDailyUnit >= 1;
  const initialTripProgress = calculateStudentTripProgress({
    carriedOverCompletedUnits,
    completedDailyUnits: completedDailyUnit,
    totalRequiredUnits,
  });

  const entryResult = await db.query(
    `INSERT INTO bna_torah_learning_entries (
      workspace_id, student_id, goal_id, date, engaged_listening_minutes, inside_engaged_minutes,
      listening_without_following_minutes, counted_minutes, individual_percentage,
      individual_complete, daily_completion_percentage, daily_completed_boolean,
      completed_daily_units, carried_over_completed_units, total_completed_units,
      total_required_units, total_trip_progress_percentage, note
    ) VALUES (
      $1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
    ON CONFLICT (student_id, date) DO UPDATE SET
      workspace_id = COALESCE(EXCLUDED.workspace_id, bna_torah_learning_entries.workspace_id),
      goal_id = EXCLUDED.goal_id,
      engaged_listening_minutes = EXCLUDED.engaged_listening_minutes,
      inside_engaged_minutes = EXCLUDED.inside_engaged_minutes,
      listening_without_following_minutes = EXCLUDED.listening_without_following_minutes,
      counted_minutes = EXCLUDED.counted_minutes,
      individual_percentage = EXCLUDED.individual_percentage,
      individual_complete = EXCLUDED.individual_complete,
      daily_completion_percentage = EXCLUDED.daily_completion_percentage,
      daily_completed_boolean = EXCLUDED.daily_completed_boolean,
      completed_daily_units = EXCLUDED.completed_daily_units,
      carried_over_completed_units = EXCLUDED.carried_over_completed_units,
      total_completed_units = EXCLUDED.total_completed_units,
      total_required_units = EXCLUDED.total_required_units,
      total_trip_progress_percentage = EXCLUDED.total_trip_progress_percentage,
      note = EXCLUDED.note,
      updated_at = NOW()
    RETURNING *`,
    [
      student.workspace_id || null,
      studentId,
      goal.id,
      date,
      engagedListeningMinutes,
      insideEngagedMinutes,
      listeningWithoutFollowingMinutes,
      progress.countedMinutes,
      progress.individualPercentageRaw,
      progress.individualComplete,
      dailyCompletionPercentage,
      dailyCompletedBoolean,
      completedDailyUnit,
      carriedOverCompletedUnits,
      initialTripProgress.totalCompletedUnits,
      totalRequiredUnits,
      initialTripProgress.totalTripProgressPercentageRaw,
      input.note || null,
    ]
  );

  await refreshTorahTripProgressSnapshots(
    studentId,
    {
      carriedOverCompletedUnits,
      totalRequiredUnits,
    },
    db
  );

  const refreshedEntryResult = await db.query(
    `SELECT *
     FROM bna_torah_learning_entries
     WHERE id = $1
     LIMIT 1`,
    [entryResult.rows[0].id]
  );
  const entry = refreshedEntryResult.rows[0] || entryResult.rows[0];
  const trip = calculateStudentTripProgress({
    carriedOverCompletedUnits: Number(entry.carried_over_completed_units || carriedOverCompletedUnits),
    completedDailyUnits: Number(entry.completed_daily_units || 0),
    totalRequiredUnits: Number(entry.total_required_units || totalRequiredUnits),
  });

  return {
    student,
    goal,
    entry,
    progress,
    trip,
  };
}

async function upsertParsedDailyTorahUpdate(update = {}, students = [], job = {}, db = pool) {
  const allActiveStudents = Boolean(update.all_active_students)
    || /^all(?:_active)?$/i.test(String(update.student_name || '').trim())
    || /^all active/i.test(String(update.student_name || '').trim());
  const matchedStudents = allActiveStudents
    ? students
    : [update.student_id
      ? students.find((student) => Number(student.id) === Number(update.student_id))
      : findStudentForParsedName(update.student_name, students)
    ].filter(Boolean);

  if (!matchedStudents.length) return [];

  const date = toIsoDateValue(update.date || getTodayDateInTimeZone());
  await ensureTorahGoalsForDate(date, db);
  const saved = [];

  for (const student of matchedStudents) {
    const goal = await getTorahGoalForDate(student.id, date, db);
    if (!goal) continue;
    const goalMinutes = Number(goal.goal_minutes || DEFAULT_TORAH_GOAL_MINUTES);
    const mapping = normalizeParsedTorahEngagement(update, {
      goalMinutes,
      goalType: goal.goal_type || GOAL_TYPES.LISTENING,
    });
    if (!mapping.hasProgressSignal) continue;
    const torahEntry = await upsertTorahLearningEntry(
      {
        student_id: student.id,
        date,
        goal_minutes: mapping.goalMinutes,
        goal_type: mapping.goalType,
        engaged_listening_minutes: mapping.engagedListeningMinutes,
        inside_engaged_minutes: mapping.insideEngagedMinutes,
        listening_without_following_minutes: mapping.listeningWithoutFollowingMinutes,
        note: buildTorahTimerNote(update.notes || null, mapping, job)
          || `Daily Torah completion parsed from content job #${job.id}.`,
      },
      db
    );
    saved.push({
      ...torahEntry,
      parser_daily_update: update,
      parser_timer_mapping: mapping,
    });
  }

  return saved;
}

async function seedTodayTorahLearningSnapshot(db = pool) {
  await ensureTorahGoalsForDate(TORAH_TEMP_SEED_DATE, db);
  const students = await getTorahStudents(TORAH_TEMP_SEED_DATE, db);
  for (const student of students) {
    const goal = await getTorahGoalForDate(student.id, TORAH_TEMP_SEED_DATE, db);
    if (!goal) continue;

    const existingSeedEntry = await db.query(
      `SELECT id
       FROM bna_torah_learning_entries
       WHERE student_id = $1
         AND date = $2::date
       LIMIT 1`,
      [student.id, TORAH_TEMP_SEED_DATE]
    );
    if (existingSeedEntry.rows[0]) continue;

    const tripDefaults = getTorahTripDefaultsForStudent(student);
    const goalMinutes = Number(goal.goal_minutes);
    await upsertTorahLearningEntry(
      {
        student_id: student.id,
        date: TORAH_TEMP_SEED_DATE,
        goal_minutes: goalMinutes,
        goal_type: goal.goal_type,
        engaged_listening_minutes: goal.goal_type === GOAL_TYPES.LISTENING ? goalMinutes : 0,
        inside_engaged_minutes: goal.goal_type === GOAL_TYPES.INSIDE ? goalMinutes : 0,
        listening_without_following_minutes: 0,
        carried_over_completed_units: tripDefaults.carriedOverCompletedUnits,
        total_required_units: tripDefaults.totalRequiredUnits,
        note: 'Seeded migration snapshot: daily completion is 100% on 2026-06-03, while cumulative trip progress is 4.5 out of 30 units (15%) before real tracking starts on 2026-06-04.',
      },
      db
    );
  }
}

function emptyTorahLearningSummary(dateInput, projectKey = DEFAULT_PROJECT_KEY) {
  const dateString = toIsoDateValue(dateInput || getTodayDateInTimeZone());
  return {
    date: dateString,
    group: {
      groupPercentageRaw: 0,
      groupPercentage: 0,
      tripUnlocked: false,
      activeStudentCount: 0,
    },
    students: [],
    project: normalizeProjectKey(projectKey || DEFAULT_PROJECT_KEY) || DEFAULT_PROJECT_KEY,
  };
}

async function getTorahLearningSummary(dateInput, db = pool, options = {}) {
  const dateString = toIsoDateValue(dateInput || getTodayDateInTimeZone());
  const projectKey = normalizeProjectKey(options.projectKey || DEFAULT_PROJECT_KEY) || DEFAULT_PROJECT_KEY;
  if (projectKey !== DEFAULT_PROJECT_KEY) {
    return emptyTorahLearningSummary(dateString, projectKey);
  }
  await ensureTorahGoalsForDate(dateString, db);
  const params = [dateString];
  const conditions = ["COALESCE(s.status, 'active') NOT IN ('inactive', 'archived')"];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');

  const result = await db.query(
    `SELECT
        s.id AS student_id,
        s.name AS student_name,
        s.parent_name,
        g.id AS goal_id,
        g.goal_minutes,
        g.goal_type,
        g.start_date,
        g.end_date,
        e_daily.id AS entry_id,
        e_daily.date,
        e_daily.engaged_listening_minutes,
        e_daily.inside_engaged_minutes,
        e_daily.listening_without_following_minutes,
        e_daily.counted_minutes,
        e_daily.individual_percentage,
        e_daily.individual_complete,
        e_daily.daily_completion_percentage,
        e_daily.daily_completed_boolean,
        e_daily.completed_daily_units,
        e_daily.carried_over_completed_units,
        e_daily.total_completed_units,
        e_daily.total_required_units,
        e_daily.total_trip_progress_percentage,
        e_daily.note,
        e_progress.id AS progress_entry_id,
        e_progress.date AS progress_date,
        e_progress.completed_daily_units AS progress_completed_daily_units,
        e_progress.carried_over_completed_units AS progress_carried_over_completed_units,
        e_progress.total_completed_units AS progress_total_completed_units,
        e_progress.total_required_units AS progress_total_required_units,
        e_progress.total_trip_progress_percentage AS progress_total_trip_progress_percentage,
        e_completed.completed_daily_units_count
     FROM bna_students s
     LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
     LEFT JOIN LATERAL (
       SELECT p.project_key
       FROM bna_projects p
       WHERE p.workspace_id = s.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     JOIN LATERAL (
       SELECT *
       FROM bna_torah_learning_goals g
       WHERE g.student_id = s.id
         AND g.start_date <= $1::date
         AND (g.end_date IS NULL OR g.end_date >= $1::date)
       ORDER BY g.start_date DESC, g.id DESC
       LIMIT 1
     ) g ON TRUE
     LEFT JOIN LATERAL (
       SELECT *
       FROM bna_torah_learning_entries e
       WHERE e.student_id = s.id
         AND e.date = $1::date
       ORDER BY e.id DESC
       LIMIT 1
     ) e_daily ON TRUE
     LEFT JOIN LATERAL (
       SELECT *
       FROM bna_torah_learning_entries e
       WHERE e.student_id = s.id
         AND e.date <= $1::date
       ORDER BY e.date DESC, e.id DESC
       LIMIT 1
     ) e_progress ON TRUE
     LEFT JOIN LATERAL (
       SELECT COALESCE(
         SUM(
           LEAST(
             1::numeric,
             GREATEST(
               0::numeric,
               COALESCE(
                 e.daily_completion_percentage,
                 e.individual_percentage,
                 CASE WHEN COALESCE(e.daily_completed_boolean, e.individual_complete, FALSE) THEN 100 ELSE 0 END
               )::numeric / 100
             )
           )
         ),
         0
       )::DECIMAL(10,2) AS completed_daily_units_count
       FROM bna_torah_learning_entries e
       WHERE e.student_id = s.id
         AND e.date <= $1::date
     ) e_completed ON TRUE
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.name ASC`,
    params
  );

  const usedStudentIds = new Set();
  const selectedRows = TORAH_STUDENT_SEEDS.map((seed) => {
    const aliases = [seed.name, ...(seed.aliases || [])].map(normalizeLooseText);
    const exactSeedName = normalizeLooseText(seed.name);
    const match =
      result.rows.find((row) =>
        !usedStudentIds.has(Number(row.student_id)) &&
        normalizeLooseText(row.student_name) === exactSeedName
      ) ||
      result.rows.find((row) =>
        !usedStudentIds.has(Number(row.student_id)) &&
        aliases.includes(normalizeLooseText(row.student_name))
      );
    if (!match) return null;
    usedStudentIds.add(Number(match.student_id));
    return { seed, row: match };
  }).filter(Boolean);

  const students = selectedRows.map(({ seed, row }) => {
    const tripDefaults = getTorahTripDefaultsForStudent(row.student_name);
    const carriedOverCompletedUnits =
      row.progress_carried_over_completed_units !== null && row.progress_carried_over_completed_units !== undefined
        ? Number(row.progress_carried_over_completed_units)
        : row.carried_over_completed_units !== null && row.carried_over_completed_units !== undefined
          ? Number(row.carried_over_completed_units)
          : tripDefaults.carriedOverCompletedUnits;
    const totalRequiredUnits =
      row.progress_total_required_units !== null && row.progress_total_required_units !== undefined
        ? Number(row.progress_total_required_units)
        : row.total_required_units !== null && row.total_required_units !== undefined
          ? Number(row.total_required_units)
          : tripDefaults.totalRequiredUnits;
    const completedDailyUnits =
      row.completed_daily_units_count !== null && row.completed_daily_units_count !== undefined
        ? Number(row.completed_daily_units_count)
        : row.progress_completed_daily_units !== null && row.progress_completed_daily_units !== undefined
          ? Number(row.progress_completed_daily_units)
          : 0;
    const trip = calculateStudentTripProgress({
      carriedOverCompletedUnits,
      completedDailyUnits,
      totalRequiredUnits,
    });
    const dailyCompletionPercentage =
      dailyCompletionPercentageFromEntry(row);
    const dailyCompletedBoolean = dailyCompletionPercentage >= 100;

    return {
      id: row.student_id,
      name: seed.name,
      parent_name: row.parent_name,
      goal: {
        id: row.goal_id,
        goal_minutes: Number(row.goal_minutes),
        goal_type: row.goal_type,
        start_date: row.start_date ? toIsoDateValue(row.start_date) : null,
        end_date: row.end_date ? toIsoDateValue(row.end_date) : null,
      },
      entry: row.entry_id
        ? {
            id: row.entry_id,
            date: row.date ? toIsoDateValue(row.date) : dateString,
            engaged_listening_minutes: Number(row.engaged_listening_minutes || 0),
            inside_engaged_minutes: Number(row.inside_engaged_minutes || 0),
            listening_without_following_minutes: Number(row.listening_without_following_minutes || 0),
            counted_minutes: Number(row.counted_minutes || 0),
            individual_percentage: Number(row.individual_percentage || 0),
            individual_complete: dailyCompletedBoolean,
            daily_completion_percentage: dailyCompletionPercentage,
            daily_completed_boolean: dailyCompletedBoolean,
            completed_daily_units: trip.completedDailyUnits,
            carried_over_completed_units: trip.carriedOverCompletedUnits,
            total_completed_units: trip.totalCompletedUnits,
            total_required_units: trip.totalRequiredUnits,
            total_trip_progress_percentage: trip.totalTripProgressPercentageRaw,
            note: row.note || '',
          }
        : null,
      trip: {
        snapshot_date: row.progress_date ? toIsoDateValue(row.progress_date) : null,
        carried_over_completed_units: trip.carriedOverCompletedUnits,
        completed_daily_units: trip.completedDailyUnits,
        total_completed_units: trip.totalCompletedUnits,
        total_required_units: trip.totalRequiredUnits,
        total_trip_progress_percentage: trip.totalTripProgressPercentageRaw,
        total_trip_progress_percentage_rounded: trip.totalTripProgressPercentage,
        total_trip_complete: trip.totalTripComplete,
      },
      percentage: trip.totalTripProgressPercentage,
      complete: trip.totalTripComplete,
    };
  });

  const group = calculateGroupTorahProgress(students.map((student) => student.percentage));
  return {
    date: dateString,
    group: {
      groupPercentageRaw: group.groupPercentageRaw,
      groupPercentage: group.groupPercentage,
      tripUnlocked: group.tripUnlocked,
      activeStudentCount: students.length,
    },
    students,
    project: projectKey,
  };
}

function buildGreenInvoiceHeaderSnapshot(headers = {}) {
  const keys = [
    'content-type',
    'user-agent',
    'x-forwarded-for',
    'x-green-invoice-signature',
    'x-green-invoice-topic',
    'x-greeninvoice-topic',
    'x-webhook-topic',
  ];
  return keys.reduce((acc, key) => {
    if (headers[key] !== undefined) acc[key] = headers[key];
    return acc;
  }, {});
}

async function upsertGreenInvoiceWebhookLog(normalized, headers = {}, db = pool) {
  const defaultWorkspace = await getDefaultSchoolWorkspace(db);
  const result = await db.query(
    `INSERT INTO bna_green_invoice_webhook_log (
      workspace_id, event_key, event_type, payment_status, document_id, transaction_id,
      gateway_transaction_id, payer_name, payer_email, payer_phone, amount, currency,
      webhook_received_at, payload, request_headers
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12,
      NOW(), $13, $14
    )
    ON CONFLICT (event_key) DO UPDATE SET
      workspace_id = COALESCE(bna_green_invoice_webhook_log.workspace_id, EXCLUDED.workspace_id),
      event_type = EXCLUDED.event_type,
      payment_status = EXCLUDED.payment_status,
      document_id = EXCLUDED.document_id,
      transaction_id = EXCLUDED.transaction_id,
      gateway_transaction_id = EXCLUDED.gateway_transaction_id,
      payer_name = EXCLUDED.payer_name,
      payer_email = EXCLUDED.payer_email,
      payer_phone = EXCLUDED.payer_phone,
      amount = EXCLUDED.amount,
      currency = EXCLUDED.currency,
      webhook_received_at = NOW(),
      payload = EXCLUDED.payload,
      request_headers = EXCLUDED.request_headers,
      attempt_count = bna_green_invoice_webhook_log.attempt_count + 1,
      updated_at = NOW()
    RETURNING *`,
    [
      defaultWorkspace.id,
      normalized.eventKey,
      normalized.eventType,
      normalized.paymentStatus,
      normalized.documentId,
      normalized.transactionId,
      normalized.gatewayTransactionId,
      normalized.payerName,
      normalized.payerEmail,
      normalized.payerPhone,
      normalized.amount,
      normalized.currency || 'ILS',
      JSON.stringify(normalized.rawPayload || {}),
      JSON.stringify(buildGreenInvoiceHeaderSnapshot(headers)),
    ]
  );
  return result.rows[0];
}

async function findMatchingSignupForGreenInvoice(normalized, db = pool) {
  const defaultWorkspace = await getDefaultSchoolWorkspace(db);
  const result = await db.query(
    `SELECT *
     FROM signups
     WHERE (
       ($1 <> '' AND parent_email IS NOT NULL AND lower(parent_email) = lower($1))
       OR ($2 <> '' AND parent_phone IS NOT NULL AND regexp_replace(parent_phone, '\\D', '', 'g') = $2)
       OR ($3 <> '' AND parent_name IS NOT NULL AND lower(parent_name) = lower($3))
     )
       AND workspace_id IS NOT DISTINCT FROM $4
     ORDER BY created_at DESC
     LIMIT 1`,
    [
      normalized.payerEmail || '',
      normalizeDigits(normalized.payerPhone || ''),
      normalized.payerName || '',
      defaultWorkspace.id,
    ]
  );
  return result.rows[0] || null;
}

async function processGreenInvoiceWebhook(rawPayload, headers = {}, options = {}) {
  const db = options.db || pool;
  const forceReprocess = Boolean(options.forceReprocess);
  const normalized = normalizeGreenInvoiceWebhookPayload(rawPayload, headers);
  let webhookLog = await upsertGreenInvoiceWebhookLog(normalized, headers, db);

  if (!forceReprocess && webhookLog.status === 'processed') {
    return {
      duplicate: true,
      matched: Boolean(webhookLog.matched_signup_id),
      webhookLog,
      normalized,
    };
  }

  const acceptableStatuses = new Set(['completed', 'paid', 'success', 'succeeded', 'received', 'unknown']);
  if (!acceptableStatuses.has(String(normalized.paymentStatus || '').toLowerCase())) {
    const ignored = await db.query(
      `UPDATE bna_green_invoice_webhook_log
       SET status = 'ignored',
           response_status = 202,
           processing_notes = $2,
           processed_at = NOW(),
           error_stack = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [webhookLog.id, `Ignored event with status ${normalized.paymentStatus || 'unknown'}.`]
    );
    return {
      duplicate: false,
      matched: false,
      ignored: true,
      webhookLog: ignored.rows[0],
      normalized,
    };
  }

  try {
    const signup = await findMatchingSignupForGreenInvoice(normalized, db);
    const student = signup
      ? (
          await db.query(
            'SELECT id, name FROM bna_students WHERE signup_id = $1 ORDER BY id DESC LIMIT 1',
            [signup.id]
          )
        ).rows[0] || null
      : null;

    const greenInvoiceId = normalized.transactionId || normalized.gatewayTransactionId || normalized.documentId;
    let paymentIntakeId = null;
    let paymentLogId = null;
    const processingNotes = [];

    if (signup) {
      const existingPayment = greenInvoiceId
        ? (
            await db.query(
              `SELECT id
               FROM bna_payment_log
               WHERE signup_id = $1
                 AND green_invoice_id = $2
               ORDER BY created_at DESC
               LIMIT 1`,
              [signup.id, greenInvoiceId]
            )
          ).rows[0]
        : null;

      if (existingPayment) {
        paymentLogId = existingPayment.id;
        processingNotes.push(`Payment log ${existingPayment.id} already existed for this Green Invoice event.`);
      } else {
        const paymentLogResult = await db.query(
          `INSERT INTO bna_payment_log (
            workspace_id, signup_id, payment_type, amount, currency, method, green_invoice_id,
            green_invoice_url, status, received_by, received_at, notes
          ) VALUES ($1, $2, 'registration', $3, $4, 'green_invoice', $5, $6, 'completed', 'green_invoice_webhook', NOW(), $7)
          RETURNING *`,
          [
            signup.workspace_id || null,
            signup.id,
            normalized.amount || 0,
            normalized.currency || 'ILS',
            greenInvoiceId,
            normalized.greenInvoiceUrl,
            `Processed from Green Invoice webhook ${normalized.eventType}.`,
          ]
        );
        paymentLogId = paymentLogResult.rows[0]?.id || null;
        processingNotes.push(`Created payment log ${paymentLogId}.`);
      }

      await db.query(
        `UPDATE signups
         SET payment_status = 'paid',
             payment_method = 'green_invoice',
             payment_amount = COALESCE($2, payment_amount),
             green_invoice_id = COALESCE($1, green_invoice_id),
             last_payment_at = COALESCE(last_payment_at, NOW()),
             payment_due_date = (NOW()::date + COALESCE(payment_interval_days, $3) * INTERVAL '1 day')::date,
             payment_reminder_sent_at = NULL,
             updated_at = NOW()
         WHERE id = $4`,
        [greenInvoiceId, normalized.amount, DEFAULT_PAYMENT_INTERVAL_DAYS, signup.id]
      );
      processingNotes.push(`Updated signup ${signup.id} to paid.`);

      webhookLog = (
        await db.query(
          `UPDATE bna_green_invoice_webhook_log
           SET status = 'processed',
               workspace_id = COALESCE($6, workspace_id),
               matched_signup_id = $2,
               matched_student_id = $3,
               payment_log_id = $4,
               processing_notes = $5,
               response_status = 200,
               processed_at = NOW(),
               last_reprocessed_at = CASE WHEN attempt_count > 1 THEN NOW() ELSE last_reprocessed_at END,
               error_stack = NULL,
               updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [
            webhookLog.id,
            signup.id,
            student?.id || null,
             paymentLogId,
             processingNotes.join(' '),
             signup.workspace_id || student?.workspace_id || null,
           ]
         )
      ).rows[0];

      return {
        duplicate: false,
        matched: true,
        signup,
        student,
        paymentLogId,
        paymentIntakeId,
        webhookLog,
        normalized,
      };
    }

    const existingIntake = greenInvoiceId
      ? (
          await db.query(
            `SELECT *
             FROM bna_payment_intake
             WHERE green_invoice_id = $1
               AND workspace_id IS NOT DISTINCT FROM $2
             ORDER BY received_at DESC
             LIMIT 1`,
            [greenInvoiceId, webhookLog.workspace_id || null]
          )
        ).rows[0]
      : null;

    if (existingIntake) {
      paymentIntakeId = existingIntake.id;
      await db.query(
        `UPDATE bna_payment_intake
         SET parent_name = COALESCE(parent_name, $2),
             parent_email = COALESCE(parent_email, $3),
             parent_phone = COALESCE(parent_phone, $4),
             amount = COALESCE($5, amount),
             currency = COALESCE($6, currency),
             green_invoice_url = COALESCE($7, green_invoice_url),
             workspace_id = COALESCE(workspace_id, $9),
             status = CASE WHEN status = 'completed' THEN status ELSE 'needs_signup' END,
             source = 'green_invoice',
             source_context = $8,
             updated_at = NOW()
         WHERE id = $1`,
        [
          existingIntake.id,
          normalized.payerName,
          normalized.payerEmail,
          normalized.payerPhone,
          normalized.amount,
          normalized.currency || 'ILS',
          normalized.greenInvoiceUrl,
          JSON.stringify(normalized.rawPayload || {}),
          webhookLog.workspace_id || null,
        ]
      );
      processingNotes.push(`Updated existing payment intake ${existingIntake.id}.`);
    } else {
      const intake = await createPaymentIntakeRecord(
        {
          parent_name: normalized.payerName,
          parent_email: normalized.payerEmail,
          parent_phone: normalized.payerPhone,
          amount: normalized.amount,
          currency: normalized.currency || 'ILS',
          method: 'green_invoice',
          payment_type: 'registration',
          green_invoice_id: greenInvoiceId,
          green_invoice_url: normalized.greenInvoiceUrl,
          workspace_id: webhookLog.workspace_id || null,
          status: 'needs_signup',
          source: 'green_invoice',
          source_context: normalized.rawPayload || {},
          notes: 'Green Invoice payment received before a matching BNA signup was found.',
        },
        db
      );
      paymentIntakeId = intake.id;
      processingNotes.push(`Created payment intake ${intake.id}.`);
    }

    webhookLog = (
      await db.query(
        `UPDATE bna_green_invoice_webhook_log
         SET status = 'processed',
             payment_intake_id = $2,
             processing_notes = $3,
             response_status = 200,
             processed_at = NOW(),
             last_reprocessed_at = CASE WHEN attempt_count > 1 THEN NOW() ELSE last_reprocessed_at END,
             error_stack = NULL,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [webhookLog.id, paymentIntakeId, processingNotes.join(' ')]
      )
    ).rows[0];

    return {
      duplicate: false,
      matched: false,
      paymentLogId,
      paymentIntakeId,
      webhookLog,
      normalized,
    };
  } catch (error) {
    webhookLog = (
      await db.query(
        `UPDATE bna_green_invoice_webhook_log
         SET status = 'failed',
             response_status = 500,
             processing_notes = $2,
             error_stack = $3,
             processed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [webhookLog.id, error.message, error.stack || error.message]
      )
    ).rows[0];
    throw Object.assign(error, { webhookLog, normalized });
  }
}

async function runGreenInvoiceFollowUps(result) {
  if (!result || result.duplicate) return;

  try {
    if (result.matched && result.signup) {
      await sendTelegramNotification(
        `<b>Green Invoice payment recorded</b>\n\n` +
        `Parent: ${result.signup.parent_name || result.normalized?.payerName || 'Unknown'}\n` +
        `Student: ${result.signup.student_name || 'Unknown'}\n` +
        `Amount: ₪${result.normalized?.amount || 'Unknown'}\n` +
        `Signup: #${result.signup.id}`
      );
      return;
    }

    if (!result.matched && result.paymentIntakeId) {
      await sendTelegramNotification(
        `<b>Unmatched Green Invoice payment</b>\n\n` +
        `Parent: ${result.normalized?.payerName || 'Unknown'}\n` +
        `Email: ${result.normalized?.payerEmail || 'Unknown'}\n` +
        `Amount: ₪${result.normalized?.amount || 'Unknown'}\n` +
        `Payment intake: #${result.paymentIntakeId}\n` +
        `Action: match this parent to a signup in Accounting.`
      );
    }
  } catch (error) {
    console.error('[green-invoice-follow-up]', error);
  }
}

async function reconcilePaymentIntakeForSignup(signup) {
  const result = await pool.query(
    `SELECT *
     FROM bna_payment_intake
     WHERE status IN ('unmatched', 'needs_signup')
       AND (
         (parent_email IS NOT NULL AND lower(parent_email) = lower($1))
         OR (parent_phone IS NOT NULL AND regexp_replace(parent_phone, '\\D', '', 'g') = regexp_replace($2, '\\D', '', 'g'))
         OR (parent_name IS NOT NULL AND lower(parent_name) = lower($3))
       )
     ORDER BY received_at DESC
     LIMIT 1`,
    [signup.parent_email || '', signup.parent_phone || '', signup.parent_name || '']
  );

  const intake = result.rows[0];
  if (!intake) return null;
  const loggedMethod = ['cash', 'green_invoice', 'bank_transfer', 'check'].includes(intake.method)
    ? intake.method
    : intake.method === 'credit'
      ? 'green_invoice'
      : 'cash';

  await pool.query(
    `INSERT INTO bna_payment_log (
      workspace_id, signup_id, payment_type, amount, currency, method, green_invoice_id,
      green_invoice_url, status, received_by, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9, $10)`,
    [
      signup.workspace_id || intake.workspace_id || null,
      signup.id,
      intake.payment_type || 'registration',
      intake.amount || 0,
      intake.currency || 'ILS',
      loggedMethod,
      intake.green_invoice_id || null,
      intake.green_invoice_url || null,
      intake.source || 'payment_intake',
      `Auto-matched from payment intake #${intake.id}. ${intake.notes || ''}`.trim(),
    ]
  );

  await pool.query(
    `UPDATE signups
     SET payment_status = 'paid',
         payment_amount = COALESCE($1, payment_amount),
         payment_method = COALESCE($2, payment_method),
         green_invoice_id = COALESCE($3, green_invoice_id),
         last_payment_at = COALESCE($4, NOW()),
         payment_due_date = (COALESCE($4, NOW())::date + COALESCE(payment_interval_days, $5) * INTERVAL '1 day')::date,
         payment_reminder_sent_at = NULL,
         updated_at = NOW()
     WHERE id = $6`,
    [
      intake.amount || null,
      loggedMethod,
      intake.green_invoice_id || null,
      intake.received_at || null,
      DEFAULT_PAYMENT_INTERVAL_DAYS,
      signup.id,
    ]
  );

  await pool.query(
    `UPDATE bna_payment_intake
     SET signup_id = $1,
         status = 'completed',
         matched_at = NOW(),
         updated_at = NOW()
     WHERE id = $2`,
    [signup.id, intake.id]
  );

  return intake;
}

const DEFAULT_CONTENT_PROMPTS = {
  whatsapp_update: {
    label: 'WhatsApp',
    prompt_text: [
      'Write a short WhatsApp update for Bnei Neviim Academy parents.',
      'Use English unless Hebrew is explicitly requested.',
      'Use concise bullet points with professional, direct parent-update language.',
      'Include the actual punch lines, logistics, questions, and practical updates from the content.',
      'If the copy will be pasted under an uploaded video, write it like a compact newsletter caption: video-summary bullets first, weekly recap bullets second.',
      'If the video or recording has one main message or concern, summarize that first in bullet points instead of burying it in a mixed list.',
      'If there are extra class details or activities, put them in a separate section like "This week at BNA".',
      'Do not open with "Today at Bnei Neviim Academy".',
      'Do not use corny marketing language like "our learners explored", "special moments", "that is very special", or "the practical message is simple".',
      'Do not write "if Torah really matters, the basics have to support it"; state the sleep, breakfast, food, screens, and routine points directly.',
      'Do not use meta labels like "Main message from the video" when the message is going under the video.',
      'Return only the message to copy/paste.',
    ].join('\n'),
  },
  facebook_post: {
    label: 'Facebook',
    prompt_text: [
      'Write a Facebook post for Bnei Neviim Academy.',
      'Use English unless Hebrew is explicitly requested.',
      'Make it warmer and more narrative than WhatsApp, but still natural and not promotional.',
      'Include the specific idea or punch line from the recording, not only a vague summary.',
      'Avoid phrases like "Today at Bnei Neviim Academy", "our learners explored", "journey", and "special moments".',
      'Return only the post text.',
    ].join('\n'),
  },
  weekly_newsletter: {
    label: 'Newsletter',
    prompt_text: [
      'Write a parent-facing weekly update from multiple Bnei Neviim Academy recordings.',
      'Use English unless Hebrew is explicitly requested.',
      'Organize by what was learned, key discussions/questions, sources, student growth moments, and logistics.',
      'Use the actual ideas and punch lines from the transcripts instead of vague summaries.',
      'Keep it warm, useful, compact, and not corny.',
      'Return only the newsletter draft.',
    ].join('\n'),
  },
  linkedin_post: {
    label: 'LinkedIn',
    prompt_text: [
      'Write a professional LinkedIn post from this Bnei Neviim Academy content.',
      'Focus on education, motivation, child development, learning culture, and practical insight.',
      'Keep it grounded and not salesy.',
      'Return only the post text.',
    ].join('\n'),
  },
  youtube_description: {
    label: 'YouTube',
    prompt_text: [
      'Write a YouTube title and description from this Bnei Neviim Academy content.',
      'Include a concise description, topic bullets, and relevant Torah/learning terms.',
      'Do not invent details.',
      'Return only the title and description.',
    ].join('\n'),
  },
  blog_draft: {
    label: 'Website Blog',
    prompt_text: [
      'Write an English website blog article for Bnei Neviim Academy from this source material.',
      'Use a clear SEO-friendly title, a practical introduction, and useful section flow.',
      'Include the actual topics, questions, Torah ideas, and examples from the recording.',
      'Keep it grounded and parent-facing, not corny, vague, or over-marketed.',
      'Do not invent facts, legal status, credentials, student details, or quotes.',
      'Return only the article draft text. Use short paragraphs and markdown headings if helpful.',
    ].join('\n'),
  },
};

async function ensureDefaultContentPrompts() {
  for (const [platform, config] of Object.entries(DEFAULT_CONTENT_PROMPTS)) {
    const result = await pool.query(
      `INSERT INTO bna_content_prompts (platform, label, prompt_text, version, updated_by)
       VALUES ($1, $2, $3, 1, 'system')
       ON CONFLICT (platform) DO NOTHING
       RETURNING *`,
      [platform, config.label, config.prompt_text]
    );
    const prompt = result.rows[0] || (await pool.query('SELECT * FROM bna_content_prompts WHERE platform = $1', [platform])).rows[0];
    if (prompt) {
      await pool.query(
        `INSERT INTO bna_content_prompt_versions (prompt_id, version, prompt_text, change_note, updated_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (prompt_id, version) DO NOTHING`,
        [prompt.id, prompt.version || 1, prompt.prompt_text, 'Initial/default prompt', prompt.updated_by || 'system']
      );
    }
  }
}

// Initialize database
async function initDb() {
  try {
    await pool.query(createWorkspacesSQL);
    await pool.query(createSignupsTableSQL);
    await pool.query(createSignupAgreementSignaturesSQL);
    await pool.query(createTasksTableSQL);
    await pool.query(createProjectsSQL);
    await pool.query(createProjectMembersSQL);
    await pool.query(createWorkspaceInvitationsSQL);
    await pool.query(createTaskCommentsSQL);
    await pool.query(createAssistantMemorySQL);
    await pool.query(createAgentRuntimeStatusSQL);
    await pool.query(normalizeTasksCategoryCheckSQL);
    await pool.query(normalizeTasksStageCheckSQL);
    await pool.query(normalizeTasksSourceCheckSQL);
    await pool.query(createPaymentLogSQL);
    await pool.query(createEmailLogSQL);
    await pool.query(createPaymentIntakeSQL);
    await pool.query(createStudentsSQL);
    await pool.query(createDevicesSQL);
    await pool.query(createTorahLearningGoalsSQL);
    await pool.query(createTorahLearningEntriesSQL);
    await pool.query(createGreenInvoiceWebhookLogSQL);
    await pool.query(createAccountabilityEventsSQL);
    await pool.query(createDeviceAccessRulesSQL);
    await pool.query(createDeviceAccessSessionsSQL);
    await pool.query(createGroupGoalsSQL);
    await pool.query(createGroupGoalEntriesSQL);
    await pool.query(createContentJobsSQL);
    await pool.query(createClassSessionsSQL);
    await pool.query(createContentOutputsSQL);
    await pool.query(createContentPromptsSQL);
    await pool.query(createContentPromptVersionsSQL);
    await pool.query(createContentPromptExamplesSQL);
    await pool.query(createContentBundlesSQL);
    await pool.query(createContentBundleItemsSQL);
    await pool.query(createWorkspaceScopeMigrationSQL);
    await pool.query(createBnaIndexesSQL);
    await pool.query(createCliBridgeSQL);
    await pool.query(createSessionsSQL);
    await ensureDefaultProjects();
    await ensureDefaultContentPrompts();
    ensureWebsiteBlogDataFiles();
    await ensureStudentsFromSignups();
    await ensureTorahSeedStudents();
    await seedTodayTorahLearningSnapshot();
    await cleanupExpiredSessions();
    console.log('Database initialized - BNA tables created');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

if (require.main === module) {
  initDb();
}

// GHL Helper Functions
async function ghlRequest(endpoint, options = {}) {
  const url = `${GHL_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_PIT_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': GHL_API_VERSION,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function ghlSocialRequest(endpoint, options = {}) {
  if (!GHL_PIT_TOKEN) throw new Error('GHL_PIT_TOKEN not configured');
  const response = await fetch(`${GHL_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_PIT_TOKEN}`,
      'Accept': 'application/json',
      'Version': GHL_SOCIAL_API_VERSION,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    const socialError = new Error(`GHL social API error: ${response.status} - ${error}`);
    socialError.status = response.status;
    socialError.endpoint = endpoint;
    socialError.body = error;
    socialError.hint = ghlSocialErrorHint(response.status, error);
    throw socialError;
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function ghlSocialErrorHint(status, body = '') {
  const text = String(body || '').toLowerCase();
  if (status === 401 && text.includes('command timed out')) {
    return 'GHL can read Social Planner data, but create-post is being refused. Recreate or edit the BNA sub-account Private Integration Token with the Social Planner post.write scope enabled.';
  }
  if (status === 401) {
    return 'Check that the token is a BNA sub-account Private Integration Token and includes Social Planner permissions for this location.';
  }
  if (status === 422) {
    return 'GHL reached the Social Planner API, but rejected the request shape. Check accountIds, type, status, summary, and media fields.';
  }
  return 'Check the GHL Social Planner token permissions and connected social account status.';
}

async function listGhlSocialAccounts() {
  const data = await ghlSocialRequest(`/social-media-posting/${GHL_LOCATION_ID}/accounts`);
  return data?.results?.accounts || [];
}

function usableSocialAccountsForPlatform(accounts, platform) {
  const requestedPlatform = String(platform || '').toLowerCase();
  return (accounts || []).filter((account) =>
    String(account.platform || '').toLowerCase() === requestedPlatform
    && !account.isExpired
    && !account.deleted
    && account.id
  );
}

function resolveGhlFacebookAccount(accounts) {
  const facebookAccounts = usableSocialAccountsForPlatform(accounts, 'facebook');
  if (!facebookAccounts.length) {
    const error = new Error('No active connected Facebook account found in GHL');
    error.status = 409;
    error.hint = 'Connect or refresh the BNA Facebook account in GHL Social Planner.';
    throw error;
  }

  if (GHL_DEFAULT_FACEBOOK_ACCOUNT_ID) {
    const configured = facebookAccounts.find((account) => String(account.id) === String(GHL_DEFAULT_FACEBOOK_ACCOUNT_ID));
    if (configured) return configured;
    const error = new Error('Configured GHL_DEFAULT_FACEBOOK_ACCOUNT_ID does not match an active Facebook account');
    error.status = 409;
    error.hint = 'Run /accounts, copy the intended Facebook account id, and update GHL_DEFAULT_FACEBOOK_ACCOUNT_ID.';
    throw error;
  }

  if (facebookAccounts.length === 1) return facebookAccounts[0];

  const error = new Error('Multiple active Facebook accounts are connected; refusing to pick one automatically');
  error.status = 409;
  error.hint = 'Set GHL_DEFAULT_FACEBOOK_ACCOUNT_ID to the approved BNA Facebook account before creating GHL drafts from Content.';
  throw error;
}

async function getDefaultGhlUserId() {
  const data = await ghlSocialRequest(`/users/?locationId=${encodeURIComponent(GHL_LOCATION_ID)}`);
  const userId = data?.users?.[0]?.id;
  if (!userId) throw new Error('No GHL user found for this location');
  return userId;
}

async function uploadLocalFileToGhlSocial(filePath, options = {}) {
  const fileBuffer = fs.readFileSync(filePath);
  const filename = options.filename || path.basename(filePath);
  const mimeType = options.mimeType || 'application/octet-stream';
  const form = new FormData();

  form.append('locationId', GHL_LOCATION_ID);
  form.append('hosted', 'false');
  form.append('name', filename);
  form.append('file', new Blob([fileBuffer], { type: mimeType }), filename);

  const response = await fetch(`${GHL_API_BASE}/medias/upload-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_PIT_TOKEN}`,
      'Version': GHL_SOCIAL_API_VERSION,
    },
    body: form,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL media upload failed: ${response.status} - ${error}`);
  }

  return response.json();
}

function socialPostTypeForMedia(mediaItems) {
  return mediaItems.some((item) => String(item.type || '').startsWith('video/')) ? 'reel' : 'post';
}

async function createFacebookDraftFromContent(job, output) {
  const accounts = await listGhlSocialAccounts();
  const facebook = resolveGhlFacebookAccount(accounts);

  const media = [];
  const localPath = job.local_path ? path.resolve(__dirname, job.local_path) : '';
  const mimeType = String(job.mime_type || '').toLowerCase();
  if (localPath && fs.existsSync(localPath) && !mimeType.startsWith('audio/')) {
    const uploaded = await uploadLocalFileToGhlSocial(localPath, {
      filename: path.basename(localPath),
      mimeType: job.mime_type || 'application/octet-stream',
    });
    if (uploaded?.url) {
      media.push({
        url: uploaded.url,
        type: job.mime_type || 'application/octet-stream',
        caption: output.body || '',
      });
    }
  }

  const userId = await getDefaultGhlUserId();
  const created = await ghlSocialRequest(`/social-media-posting/${GHL_LOCATION_ID}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountIds: [facebook.id],
        userId,
        summary: output.body || '',
        media,
        type: socialPostTypeForMedia(media),
      status: 'draft',
    }),
  });

  return { account: facebook, media, created };
}

function outputTypeLabel(outputType) {
  return ({
    whatsapp_update: 'WhatsApp update',
    facebook_post: 'Facebook post',
    weekly_newsletter: 'weekly newsletter',
    linkedin_post: 'LinkedIn post',
    youtube_description: 'YouTube description',
    blog_draft: 'website blog',
  })[outputType] || outputType;
}

function platformForOutputType(outputType) {
  return ({
    whatsapp_update: 'whatsapp',
    facebook_post: 'facebook',
    weekly_newsletter: 'email',
    linkedin_post: 'linkedin',
    youtube_description: 'youtube',
    blog_draft: 'website',
  })[outputType] || null;
}

function parseOutputType(value) {
  if (!value) return null;
  const aliases = {
    whatsapp: 'whatsapp_update',
    facebook: 'facebook_post',
    newsletter: 'weekly_newsletter',
    linkedin: 'linkedin_post',
    youtube: 'youtube_description',
    blog: 'blog_draft',
    website_blog: 'blog_draft',
    website: 'blog_draft',
  };
  return aliases[value] || value;
}

function contentSummaryForPrompt(job) {
  const parsed = typeof job.parse_json === 'string' ? safeJsonParse(job.parse_json) : (job.parse_json || {});
  const classContent = classContentFieldsFromParsed(parsed);
  return JSON.stringify({
    title: job.title,
    caption: job.caption,
    summary: classContent.summary || '',
    topics: classContent.topics,
    discussions: classContent.discussions,
    sources: classContent.sources,
    student_questions: classContent.studentQuestions,
    highlights: classContent.highlights,
  }, null, 2);
}

function safeJsonParse(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  ensureParentDirectory(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function slugifyWebsiteBlog(value) {
  return String(value || 'bna-article')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'bna-article';
}

function stripMarkdownMarker(value) {
  return String(value || '')
    .replace(/^#{1,6}\s+/, '')
    .replace(/^\*\*(.+)\*\*$/, '$1')
    .trim();
}

function excerptFromText(value, maxLength = 220) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim()}...`;
}

function inferWebsiteBlogCategory({ title = '', body = '', metadata = {} } = {}) {
  if (metadata.category) return String(metadata.category);
  const text = `${title} ${body}`.toLowerCase();
  if (/(adhd|attention|focus|movement|learn differently)/.test(text)) return 'ADHD / Learning Differences';
  if (/(parent|mother|father|home|family|motivat|discipline)/.test(text)) return 'Parenting';
  if (/(technology|phone|screen|device|digital)/.test(text)) return 'Technology';
  if (/(responsibility|accountability|self-governance|ownership)/.test(text)) return 'Self-Governance';
  if (/(homeschool|legal|register|signup|tuition)/.test(text)) return 'Homeschooling';
  if (/(torah|chumash|tanach|sefer|limudei|kodesh|learning)/.test(text)) return 'Torah Learning';
  return 'Alternative School';
}

function parseWebsiteBlogBody(output, job, metadata) {
  const rawBody = String(output.body || '').trim();
  const lines = rawBody.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const heading = lines.find((line) => /^#\s+/.test(line) || /^title\s*:/i.test(line));
  const headingTitle = heading
    ? stripMarkdownMarker(heading.replace(/^title\s*:\s*/i, ''))
    : '';
  const title = stripMarkdownMarker(
    metadata.title || output.title || headingTitle || job?.title || 'Bnei Neviim Academy article'
  );
  const paragraphs = rawBody
    .split(/\n\s*\n+/)
    .map((block) => stripMarkdownMarker(block.replace(/^title\s*:\s*/i, '')))
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((block, index) => index > 0 || block.toLowerCase() !== title.toLowerCase());
  const body = paragraphs.length
    ? paragraphs
    : [String(job?.summary || job?.transcript_text || 'Bnei Neviim Academy update.').slice(0, 1200)];
  const excerpt = excerptFromText(metadata.excerpt || body.find((paragraph) => paragraph.length > 40) || body[0] || title);
  const category = inferWebsiteBlogCategory({ title, body: rawBody, metadata });

  return {
    title,
    body,
    excerpt,
    category,
  };
}

function normalizeProjectKey(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!normalized) return '';
  if (['bna', 'bnei_neviim', 'bnei_neviim_academy', 'academy'].includes(normalized)) return DEFAULT_PROJECT_KEY;
  if (
    [
      'one_time',
      'one_time_mishnah',
      'one_time_mishna',
      'one_time_mishnah_class',
      'one_time_mishna_class',
      'mishna',
      'mishnah',
      'mishna_learning',
      'mishnah_learning',
      'rabbi_elie_scheller',
      'elie_scheller',
    ].includes(normalized)
  ) {
    return ONE_TIME_PROJECT_KEY;
  }
  return normalized;
}

function inferProjectKeyFromText(text, fallback = DEFAULT_PROJECT_KEY) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(one time|mishnah|mishna|rabbi elie scheller|elie scheller|source sheet|shiur idea|shiur topics?)\b/.test(normalized)) {
    return ONE_TIME_PROJECT_KEY;
  }
  return fallback || DEFAULT_PROJECT_KEY;
}

async function upsertWorkspace({ workspaceKey, workspaceType, name, shortName, metadata = {} }, db = pool) {
  const normalizedType = assertWorkspaceType(workspaceType);
  const result = await db.query(
    `INSERT INTO bna_workspaces (workspace_key, workspace_type, name, short_name, metadata)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (workspace_key) DO UPDATE
       SET workspace_type = EXCLUDED.workspace_type,
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           metadata = COALESCE(bna_workspaces.metadata, '{}'::jsonb) || EXCLUDED.metadata,
           status = 'active',
           updated_at = NOW()
     RETURNING *`,
    [workspaceKey, normalizedType, name, shortName || name, JSON.stringify(metadata || {})]
  );
  return result.rows[0];
}

async function ensureDefaultWorkspaces(db = pool) {
  const bnaWorkspace = await upsertWorkspace({
    workspaceKey: DEFAULT_WORKSPACE_KEY,
    workspaceType: 'school',
    name: 'BNA',
    shortName: 'BNA',
    metadata: {
      canonical: true,
      default_project_key: DEFAULT_PROJECT_KEY,
    },
  }, db);

  const oneTimeWorkspace = await upsertWorkspace({
    workspaceKey: ONE_TIME_WORKSPACE_KEY,
    workspaceType: 'service_provider',
    name: 'One Time Mishnah Class',
    shortName: 'One Time',
    metadata: {
      canonical: true,
      default_project_key: ONE_TIME_PROJECT_KEY,
      agent: 'rabbi-elie-scheller',
    },
  }, db);

  return { bnaWorkspace, oneTimeWorkspace };
}

async function getDefaultSchoolWorkspace(db = pool) {
  const existing = (await db.query(
    'SELECT * FROM bna_workspaces WHERE workspace_key = $1 LIMIT 1',
    [DEFAULT_WORKSPACE_KEY]
  )).rows[0];
  if (existing) return existing;
  return (await ensureDefaultWorkspaces(db)).bnaWorkspace;
}

async function upsertProject({ workspaceId, projectKey, name, shortName, description, metadata = {} }, db = pool) {
  const result = await db.query(
    `INSERT INTO bna_projects (workspace_id, project_key, name, short_name, description, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (project_key) DO UPDATE
       SET workspace_id = COALESCE(EXCLUDED.workspace_id, bna_projects.workspace_id),
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           description = COALESCE(EXCLUDED.description, bna_projects.description),
           metadata = COALESCE(bna_projects.metadata, '{}'::jsonb) || EXCLUDED.metadata,
           updated_at = NOW()
     RETURNING *`,
    [workspaceId || null, projectKey, name, shortName || name, description || null, JSON.stringify(metadata || {})]
  );
  return result.rows[0];
}

async function ensureProjectMember(project, personName, fields = {}, db = pool) {
  if (!project?.id || !personName) return null;
  const workspaceId = fields.workspace_id || fields.workspaceId || project.workspace_id || null;
  const result = await db.query(
    `INSERT INTO bna_project_members (workspace_id, project_id, person_name, role, access_level, telegram_chat_id, login_username, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (project_id, person_name) DO UPDATE
       SET workspace_id = COALESCE(EXCLUDED.workspace_id, bna_project_members.workspace_id),
           role = EXCLUDED.role,
           access_level = EXCLUDED.access_level,
           telegram_chat_id = COALESCE(EXCLUDED.telegram_chat_id, bna_project_members.telegram_chat_id),
           login_username = COALESCE(EXCLUDED.login_username, bna_project_members.login_username),
           metadata = COALESCE(bna_project_members.metadata, '{}'::jsonb) || EXCLUDED.metadata,
           active = TRUE,
           updated_at = NOW()
     RETURNING *`,
    [
      workspaceId,
      project.id,
      personName,
      fields.role || 'member',
      fields.access_level || 'member',
      fields.telegram_chat_id || null,
      fields.login_username || null,
      JSON.stringify(fields.metadata || {}),
    ]
  );
  return result.rows[0];
}

async function backfillWorkspaceScope({ bnaWorkspace, oneTimeWorkspace }, db = pool) {
  const bnaWorkspaceId = bnaWorkspace?.id;
  const oneTimeWorkspaceId = oneTimeWorkspace?.id || bnaWorkspaceId;
  if (!bnaWorkspaceId) return;

  await db.query(
    `UPDATE bna_projects
     SET workspace_id = $1, updated_at = NOW()
     WHERE project_key = $2 AND workspace_id IS DISTINCT FROM $1`,
    [bnaWorkspaceId, DEFAULT_PROJECT_KEY]
  );
  await db.query(
    `UPDATE bna_projects
     SET workspace_id = $1, updated_at = NOW()
     WHERE project_key = $2 AND workspace_id IS DISTINCT FROM $1`,
    [oneTimeWorkspaceId, ONE_TIME_PROJECT_KEY]
  );
  await db.query(
    `UPDATE bna_project_members pm
     SET workspace_id = p.workspace_id, updated_at = NOW()
     FROM bna_projects p
     WHERE pm.project_id = p.id
       AND p.workspace_id IS NOT NULL
       AND pm.workspace_id IS DISTINCT FROM p.workspace_id`
  );
  await db.query(
    `UPDATE bna_tasks t
     SET workspace_id = p.workspace_id, updated_at = NOW()
     FROM bna_projects p
     WHERE t.project_id = p.id
       AND p.workspace_id IS NOT NULL
       AND t.workspace_id IS DISTINCT FROM p.workspace_id`
  );
  await db.query(
    `UPDATE bna_task_comments c
     SET workspace_id = t.workspace_id, updated_at = NOW()
     FROM bna_tasks t
     WHERE c.task_id = t.id
       AND t.workspace_id IS NOT NULL
       AND c.workspace_id IS DISTINCT FROM t.workspace_id`
  );
  await db.query(`UPDATE signups SET workspace_id = $1, updated_at = NOW() WHERE workspace_id IS NULL`, [bnaWorkspaceId]);
  await db.query(`UPDATE bna_students SET workspace_id = $1, updated_at = NOW() WHERE workspace_id IS NULL`, [bnaWorkspaceId]);
  await db.query(
    `UPDATE bna_signup_agreement_signatures a
     SET workspace_id = s.workspace_id
     FROM signups s
     WHERE a.signup_id = s.id
       AND s.workspace_id IS NOT NULL
       AND a.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_payment_log l
     SET workspace_id = s.workspace_id
     FROM signups s
     WHERE l.signup_id = s.id
       AND s.workspace_id IS NOT NULL
       AND l.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_email_log e
     SET workspace_id = s.workspace_id
     FROM signups s
     WHERE e.signup_id = s.id
       AND s.workspace_id IS NOT NULL
       AND e.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_payment_intake p
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM signups s
     WHERE p.signup_id = s.id
       AND s.workspace_id IS NOT NULL
       AND p.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_green_invoice_webhook_log g
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM signups s
     WHERE g.matched_signup_id = s.id
       AND s.workspace_id IS NOT NULL
       AND g.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_devices d
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE d.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND d.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_torah_learning_goals g
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE g.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND g.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_torah_learning_entries e
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE e.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND e.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_accountability_events e
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE e.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND e.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_device_access_rules r
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE r.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND r.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_device_access_sessions a
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE a.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND a.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_group_goal_entries e
     SET workspace_id = s.workspace_id, updated_at = NOW()
     FROM bna_students s
     WHERE e.student_id = s.id
       AND s.workspace_id IS NOT NULL
       AND e.workspace_id IS DISTINCT FROM s.workspace_id`
  );
  await db.query(
    `UPDATE bna_content_jobs
     SET workspace_id = $1, updated_at = NOW()
     WHERE workspace_id IS NULL
       AND lower(COALESCE(title, '') || ' ' || COALESCE(caption, '') || ' ' || COALESCE(transcript_text, '') || ' ' || COALESCE(notes, ''))
         ~ '(one time|mishnah|mishna|rabbi elie scheller|source sheet|shiur)'`,
    [oneTimeWorkspaceId]
  );
  await db.query(`UPDATE bna_content_jobs SET workspace_id = $1, updated_at = NOW() WHERE workspace_id IS NULL`, [bnaWorkspaceId]);
  await db.query(
    `UPDATE bna_class_sessions c
     SET workspace_id = j.workspace_id, updated_at = NOW()
     FROM bna_content_jobs j
     WHERE c.content_job_id = j.id
       AND j.workspace_id IS NOT NULL
       AND c.workspace_id IS DISTINCT FROM j.workspace_id`
  );
  await db.query(
    `UPDATE bna_content_outputs o
     SET workspace_id = j.workspace_id, updated_at = NOW()
     FROM bna_content_jobs j
     WHERE o.job_id = j.id
       AND j.workspace_id IS NOT NULL
       AND o.workspace_id IS DISTINCT FROM j.workspace_id`
  );
  await db.query(
    `UPDATE bna_content_prompt_examples e
     SET workspace_id = o.workspace_id, updated_at = NOW()
     FROM bna_content_outputs o
     WHERE e.source_output_id = o.id
       AND o.workspace_id IS NOT NULL
       AND e.workspace_id IS DISTINCT FROM o.workspace_id`
  );
  await db.query(`UPDATE bna_content_bundles SET workspace_id = $1, updated_at = NOW() WHERE workspace_id IS NULL`, [bnaWorkspaceId]);
  await db.query(
    `UPDATE bna_content_bundle_items i
     SET workspace_id = b.workspace_id
     FROM bna_content_bundles b
     WHERE i.bundle_id = b.id
       AND b.workspace_id IS NOT NULL
       AND i.workspace_id IS DISTINCT FROM b.workspace_id`
  );

  const defaultSchoolTables = [
    'bna_payment_intake',
    'bna_green_invoice_webhook_log',
    'bna_devices',
    'bna_torah_learning_goals',
    'bna_torah_learning_entries',
    'bna_accountability_events',
    'bna_device_access_rules',
    'bna_device_access_sessions',
    'bna_group_goals',
    'bna_group_goal_entries',
    'bna_class_sessions',
    'bna_content_outputs',
    'bna_content_prompt_examples',
    'bna_content_bundles',
    'bna_content_bundle_items',
  ];
  for (const table of defaultSchoolTables) {
    await db.query(`UPDATE ${table} SET workspace_id = $1 WHERE workspace_id IS NULL`, [bnaWorkspaceId]);
  }
}

async function ensureDefaultProjects(db = pool) {
  const { bnaWorkspace, oneTimeWorkspace } = await ensureDefaultWorkspaces(db);
  const bna = await upsertProject({
    workspaceId: bnaWorkspace.id,
    projectKey: DEFAULT_PROJECT_KEY,
    name: 'BNA',
    shortName: 'BNA',
    description: 'Bnei Neviim Academy operations, students, content, contacts, and accounting.',
  }, db);
  const oneTime = await upsertProject({
    workspaceId: oneTimeWorkspace.id,
    projectKey: ONE_TIME_PROJECT_KEY,
    name: 'One Time Mishnah Class',
    shortName: 'One Time',
    description: 'Rabbi Elie Scheller task manager, comments, Torah class prep, and Mishnah class planning.',
    metadata: {
      agent: 'rabbi-elie-scheller',
      preferred_source_lookup: 'sefaria',
    },
  }, db);

  await ensureProjectMember(bna, 'Shloimie', { workspace_id: bnaWorkspace.id, role: 'operator', access_level: 'owner' }, db);
  await ensureProjectMember(oneTime, 'Shloimie', { workspace_id: oneTimeWorkspace.id, role: 'project owner', access_level: 'owner' }, db);
  await ensureProjectMember(oneTime, 'Rabbi Elie Scheller', {
    workspace_id: oneTimeWorkspace.id,
    role: 'collaborator',
    access_level: 'member',
    login_username: ONE_TIME_OPS_USERNAME || null,
  }, db);

  await db.query(
    `UPDATE bna_tasks
     SET project_id = $1
     WHERE project_id IS NULL`,
    [bna.id]
  );
  await db.query(
    `UPDATE bna_tasks
     SET project_id = $1
     WHERE
       category IN ('torah_class_prep', 'source_sheets', 'shiur_ideas', 'ghl_setup', 'community')
       OR lower(COALESCE(title, '') || ' ' || COALESCE(notes, '')) ~ '(one time|mishnah|mishna|rabbi elie scheller|source sheet|shiur)'`,
    [oneTime.id]
  );
  await backfillWorkspaceScope({ bnaWorkspace, oneTimeWorkspace }, db);

  return { bna, oneTime, bnaWorkspace, oneTimeWorkspace };
}

async function getProjectByKey(projectKey, db = pool) {
  const normalized = normalizeProjectKey(projectKey || DEFAULT_PROJECT_KEY) || DEFAULT_PROJECT_KEY;
  const result = await db.query('SELECT * FROM bna_projects WHERE project_key = $1 LIMIT 1', [normalized]);
  if (result.rows[0]) return result.rows[0];
  const seeded = await ensureDefaultProjects(db);
  return normalized === ONE_TIME_PROJECT_KEY ? seeded.oneTime : seeded.bna;
}

async function projectKeyForWorkspaceId(workspaceId, fallback = DEFAULT_PROJECT_KEY, db = pool) {
  if (!workspaceId) return fallback;
  const result = await db.query(
    `SELECT project_key
     FROM bna_projects
     WHERE workspace_id = $1
     ORDER BY id ASC
     LIMIT 1`,
    [workspaceId]
  );
  const rawProjectKey = result.rows[0]?.project_key;
  return rawProjectKey ? normalizeProjectKey(rawProjectKey) : fallback;
}

function readGoogleDrivePipelineConfig() {
  const inlineConfig = String(process.env.GOOGLE_DRIVE_PIPELINE_CONFIG || '').trim();
  if (inlineConfig) {
    try {
      return JSON.parse(inlineConfig);
    } catch {
      return {};
    }
  }
  return readJsonFile(path.join(__dirname, '.secrets', 'google-drive-pipeline.json'), {});
}

function driveStageConfigKey(stage = '') {
  const normalized = normalizeLooseText(stage || 'raw intake');
  if (normalized.includes('website') || normalized.includes('image') || normalized.includes('moment')) return 'websiteImages';
  if (normalized.includes('approved') || normalized.includes('published')) return 'approvedAssets';
  if (normalized.includes('failed') || normalized.includes('review')) return 'failedNeedsReview';
  if (normalized.includes('parsed') || normalized.includes('processed') || normalized.includes('recording')) return 'processedRecordings';
  if (normalized.includes('processing') || normalized.includes('ingesting') || normalized.includes('transcrib')) return 'processing';
  return 'rawIntake';
}

function driveStageLabelForKey(stageKey) {
  return {
    rawIntake: '01 Raw Intake',
    websiteImages: '00 Website Images',
    processing: '02 Ingesting',
    processedRecordings: '04 Parsed',
    approvedAssets: '10 Approved',
    failedNeedsReview: '99 Failed',
  }[stageKey] || '01 Raw Intake';
}

function driveFolderCandidateKeys(stageKey) {
  const common = ['folderId', 'folder_id', 'driveFolderId', 'drive_folder_id'];
  return {
    rawIntake: ['rawIntake', 'raw_intake', 'rawIntakeFolderId', 'intakeFolderId', 'intake_folder_id', ...common],
    websiteImages: ['websiteImages', 'website_images', 'websiteMomentsIntake', 'websiteMomentsFolderId', ...common],
    processing: ['processing', 'ingesting', 'processingFolderId', ...common],
    processedRecordings: ['processedRecordings', 'processed_recordings', 'parsed', 'processed', 'parsedFolderId', ...common],
    approvedAssets: ['approvedAssets', 'approved_assets', 'approved', 'published', 'approvedFolderId', ...common],
    failedNeedsReview: ['failedNeedsReview', 'failed_needs_review', 'failed', 'review', 'failedFolderId', ...common],
  }[stageKey] || common;
}

function pickConfiguredDriveId(source = {}, keys = []) {
  if (!source || typeof source !== 'object') return '';
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object' && typeof value.id === 'string' && value.id.trim()) return value.id.trim();
  }
  return '';
}

function driveWorkspaceConfig(config = {}, workspaceKey = DEFAULT_PROJECT_KEY) {
  const key = normalizeProjectKey(workspaceKey || DEFAULT_PROJECT_KEY);
  return config.workspaces?.[key]
    || config.workspaceFolders?.[key]
    || config.workspace_folders?.[key]
    || config.projects?.[key]
    || {};
}

function configuredDriveFolderId(config = {}, workspaceKey = DEFAULT_PROJECT_KEY, stage = '01 Raw Intake') {
  const key = normalizeProjectKey(workspaceKey || DEFAULT_PROJECT_KEY);
  const stageKey = driveStageConfigKey(stage);
  const keys = driveFolderCandidateKeys(stageKey);
  const workspaceConfig = driveWorkspaceConfig(config, key);
  const workspaceFolder = pickConfiguredDriveId(workspaceConfig, keys)
    || pickConfiguredDriveId(workspaceConfig.folders, keys)
    || pickConfiguredDriveId(workspaceConfig.simplifiedFolders, keys)
    || pickConfiguredDriveId(workspaceConfig.stages, [driveStageLabelForKey(stageKey), stageKey, ...keys]);
  if (workspaceFolder) return workspaceFolder;

  if (key !== DEFAULT_PROJECT_KEY) return '';
  return pickConfiguredDriveId(config.simplifiedFolders, keys)
    || pickConfiguredDriveId(config.folders, keys)
    || pickConfiguredDriveId(config.stages, [driveStageLabelForKey(stageKey), stageKey, ...keys])
    || '';
}

function collectConfiguredDriveIds(value, ids = new Set()) {
  if (!value) return ids;
  if (typeof value === 'string' && value.trim()) {
    ids.add(value.trim());
    return ids;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectConfiguredDriveIds(item, ids));
    return ids;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectConfiguredDriveIds(item, ids));
  }
  return ids;
}

function workspaceKeyForDriveFolderId(folderId, config = readGoogleDrivePipelineConfig()) {
  const target = String(folderId || '').trim();
  if (!target) return '';
  const workspaceSources = {
    ...(config.workspaces || {}),
    ...(config.workspaceFolders || {}),
    ...(config.workspace_folders || {}),
    ...(config.projects || {}),
  };
  for (const [workspaceKey, workspaceConfig] of Object.entries(workspaceSources)) {
    if (collectConfiguredDriveIds(workspaceConfig).has(target)) return normalizeProjectKey(workspaceKey);
  }
  if (collectConfiguredDriveIds(config.simplifiedFolders || {}).has(target)) return DEFAULT_PROJECT_KEY;
  return '';
}

async function resolveContentWorkspaceRouting(req, input = {}, db = pool) {
  const driveConfig = readGoogleDrivePipelineConfig();
  const folderProjectKey = workspaceKeyForDriveFolderId(input.drive_folder_id || input.driveFolderId, driveConfig);
  const requestedWorkspaceId = Number(input.workspace_id || input.workspaceId || 0) || null;
  const requestedWorkspaceProjectKey = requestedWorkspaceId
    ? await projectKeyForWorkspaceId(requestedWorkspaceId, '', db)
    : '';
  const projectHint = input.project
    || input.project_key
    || input.projectName
    || input.project_name
    || requestedWorkspaceProjectKey
    || folderProjectKey;
  const normalizedProjectHint = projectHint ? normalizeProjectKey(projectHint) : '';
  const project = await getProjectByKey(
    normalizedProjectHint ||
      inferProjectKeyFromText(`${input.title || ''}\n${input.caption || ''}\n${input.notes || ''}\n${input.transcript_text || ''}`),
    db
  );
  assertProjectAccess(req, project);

  if (folderProjectKey && normalizeProjectKey(project.project_key) !== folderProjectKey) {
    const error = new Error('Drive folder belongs to a different workspace.');
    error.statusCode = 400;
    throw error;
  }

  if (requestedWorkspaceId && project.workspace_id && Number(project.workspace_id) !== requestedWorkspaceId) {
    const error = new Error('Requested workspace does not match the resolved content project.');
    error.statusCode = 400;
    throw error;
  }

  const defaultWorkspace = await getDefaultSchoolWorkspace(db);
  const workspaceId = project.workspace_id || requestedWorkspaceId || defaultWorkspace.id;
  const stage = input.drive_stage || input.driveStage || '01 Raw Intake';
  const configuredFolderId = configuredDriveFolderId(driveConfig, project.project_key, stage);
  return {
    project,
    workspaceId,
    driveFolderId: String(input.drive_folder_id || input.driveFolderId || configuredFolderId || '').trim() || null,
    driveStage: stage,
    driveConfigWorkspaceKey: normalizeProjectKey(project.project_key),
    driveRoutingConfigured: Boolean(configuredFolderId),
  };
}

async function assertContentJobAccess(req, jobId, db = pool) {
  const result = await db.query(
    `SELECT j.id, j.workspace_id, p.project_key, w.workspace_key
     FROM bna_content_jobs j
     LEFT JOIN bna_workspaces w ON w.id = j.workspace_id
     LEFT JOIN LATERAL (
       SELECT project_key
       FROM bna_projects p
       WHERE p.workspace_id = j.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) p ON TRUE
     WHERE j.id = $1`,
    [jobId]
  );
  const job = result.rows[0];
  if (!job) return null;
  const scopedProjectKey = opsScopeProjectKey(req);
  if (scopedProjectKey && normalizeProjectKey(job.project_key || job.workspace_key) !== scopedProjectKey) {
    const error = new Error('This login can only access its scoped workspace content.');
    error.statusCode = 403;
    throw error;
  }
  return job;
}

function assertContentJobsSingleWorkspace(jobs = []) {
  const workspaceIds = [...new Set(
    jobs
      .map((job) => (job?.workspace_id ? String(job.workspace_id) : ''))
      .filter(Boolean)
  )];
  if (workspaceIds.length > 1) {
    const error = new Error('Content jobs from different workspaces cannot be combined.');
    error.statusCode = 400;
    throw error;
  }
  return workspaceIds[0] ? Number(workspaceIds[0]) : null;
}

async function resolveProjectFromInput(input = {}, db = pool) {
  if (input.project_id) {
    const byId = (await db.query('SELECT * FROM bna_projects WHERE id = $1 LIMIT 1', [input.project_id])).rows[0];
    if (byId) return byId;
  }
  const projectValue = input.project || input.project_key || input.projectName || input.project_name;
  return getProjectByKey(
    normalizeProjectKey(projectValue) ||
      inferProjectKeyFromText(input.raw_text || input.ramble || input.title || input.notes || ''),
    db
  );
}

function opsScopeProjectKey(req) {
  return req?.opsIdentity?.scope?.type === 'project' || req?.opsIdentity?.scope?.type === 'workspace'
    ? req.opsIdentity.scope.projectKey
    : '';
}

function assertProjectAccess(req, project) {
  const scopedProjectKey = opsScopeProjectKey(req);
  if (!scopedProjectKey) return;
  if (normalizeProjectKey(project?.project_key) !== scopedProjectKey) {
    const error = new Error('This login can only access One Time Mishnah Class tasks.');
    error.statusCode = 403;
    throw error;
  }
}

function accountingProjectKeyFromRequest(req, input = {}) {
  const scopedProjectKey = opsScopeProjectKey(req);
  if (scopedProjectKey) return normalizeProjectKey(scopedProjectKey);
  return normalizeProjectKey(
    req?.query?.project ||
    req?.query?.project_key ||
    input.project ||
    input.project_key ||
    input.projectName ||
    input.project_name ||
    ''
  );
}

function addAccountingProjectCondition(conditions, params, projectKey, projectAlias = 'proj', workspaceAlias = 'w') {
  const normalizedProjectKey = normalizeProjectKey(projectKey);
  if (!normalizedProjectKey) return;
  params.push(normalizedProjectKey);
  conditions.push(`COALESCE(${projectAlias}.project_key, ${workspaceAlias}.workspace_key, '') = $${params.length}`);
}

function scopedAccountingNotFoundStatus(req) {
  return opsScopeProjectKey(req) ? 403 : 404;
}

async function resolveAccountingProjectForWrite(req, input = {}, db = pool) {
  const projectKey = accountingProjectKeyFromRequest(req, input) || DEFAULT_PROJECT_KEY;
  const project = await getProjectByKey(projectKey, db);
  assertProjectAccess(req, project);
  return project;
}

async function assertSignupAccountingAccess(req, signupId, projectKey = accountingProjectKeyFromRequest(req), db = pool) {
  const params = [signupId];
  const conditions = ['s.id = $1'];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const result = await db.query(
    `SELECT s.*,
            proj.project_key,
            proj.name AS project_name,
            proj.short_name AS project_short_name,
            w.workspace_key,
            w.workspace_type,
            w.name AS workspace_name
     FROM signups s
     LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
     LEFT JOIN LATERAL (
       SELECT p.project_key, p.name, p.short_name
       FROM bna_projects p
       WHERE p.workspace_id = s.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    params
  );
  const signup = result.rows[0];
  if (!signup) {
    const error = new Error('Signup is not visible in the selected accounting workspace.');
    error.statusCode = scopedAccountingNotFoundStatus(req);
    throw error;
  }
  return signup;
}

async function assertPaymentIntakeAccountingAccess(req, intakeId, projectKey = accountingProjectKeyFromRequest(req), db = pool) {
  const params = [intakeId];
  const conditions = ['i.id = $1'];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const result = await db.query(
    `SELECT i.*,
            proj.project_key,
            proj.name AS project_name,
            proj.short_name AS project_short_name,
            w.workspace_key,
            w.workspace_type,
            w.name AS workspace_name
     FROM bna_payment_intake i
     LEFT JOIN bna_workspaces w ON w.id = i.workspace_id
     LEFT JOIN LATERAL (
       SELECT p.project_key, p.name, p.short_name
       FROM bna_projects p
       WHERE p.workspace_id = i.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    params
  );
  const intake = result.rows[0];
  if (!intake) {
    const error = new Error('Payment intake record is not visible in the selected accounting workspace.');
    error.statusCode = scopedAccountingNotFoundStatus(req);
    throw error;
  }
  return intake;
}

function studentProjectKeyFromRequest(req, input = {}) {
  const scopedProjectKey = opsScopeProjectKey(req);
  if (scopedProjectKey) return normalizeProjectKey(scopedProjectKey);
  return normalizeProjectKey(
    req?.query?.project ||
    req?.query?.project_key ||
    input.project ||
    input.project_key ||
    input.projectName ||
    input.project_name ||
    ''
  );
}

function scopedStudentNotFoundStatus(req) {
  return opsScopeProjectKey(req) ? 403 : 404;
}

async function resolveStudentProjectForWrite(req, input = {}, db = pool) {
  const projectKey = studentProjectKeyFromRequest(req, input) || DEFAULT_PROJECT_KEY;
  const project = await getProjectByKey(projectKey, db);
  assertProjectAccess(req, project);
  return project;
}

function assertTorahProjectAccess(projectKey = DEFAULT_PROJECT_KEY) {
  const normalizedProjectKey = normalizeProjectKey(projectKey || DEFAULT_PROJECT_KEY) || DEFAULT_PROJECT_KEY;
  if (normalizedProjectKey !== DEFAULT_PROJECT_KEY) {
    const error = new Error('Torah learning is only available in the BNA workspace.');
    error.statusCode = 403;
    throw error;
  }
  return normalizedProjectKey;
}

async function assertStudentAccess(req, studentId, projectKey = studentProjectKeyFromRequest(req), db = pool) {
  const params = [studentId];
  const conditions = ['s.id = $1'];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const result = await db.query(
    `SELECT s.*,
            proj.project_key,
            proj.name AS project_name,
            proj.short_name AS project_short_name,
            w.workspace_key,
            w.workspace_type,
            w.name AS workspace_name
     FROM bna_students s
     LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
     LEFT JOIN LATERAL (
       SELECT p.project_key, p.name, p.short_name
       FROM bna_projects p
       WHERE p.workspace_id = s.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    params
  );
  const student = result.rows[0];
  if (!student) {
    const error = new Error('Student is not visible in the selected workspace.');
    error.statusCode = scopedStudentNotFoundStatus(req);
    throw error;
  }
  return student;
}

async function assertDeviceAccess(req, deviceId, projectKey = studentProjectKeyFromRequest(req), db = pool) {
  const params = [deviceId];
  const conditions = ['d.id = $1'];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const result = await db.query(
    `SELECT d.*,
            s.id AS student_id,
            s.name AS student_name,
            proj.project_key,
            w.workspace_key
     FROM bna_devices d
     LEFT JOIN bna_students s ON s.id = d.student_id
     LEFT JOIN bna_workspaces w ON w.id = COALESCE(d.workspace_id, s.workspace_id)
     LEFT JOIN LATERAL (
       SELECT p.project_key
       FROM bna_projects p
       WHERE p.workspace_id = COALESCE(d.workspace_id, s.workspace_id)
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    params
  );
  const device = result.rows[0];
  if (!device) {
    const error = new Error('Device is not visible in the selected student workspace.');
    error.statusCode = scopedStudentNotFoundStatus(req);
    throw error;
  }
  return device;
}

async function assertAccountabilityEventAccess(req, eventId, projectKey = studentProjectKeyFromRequest(req), db = pool) {
  const params = [eventId];
  const conditions = ['a.id = $1'];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const result = await db.query(
    `SELECT a.*,
            s.name AS student_name,
            proj.project_key,
            w.workspace_key
     FROM bna_accountability_events a
     LEFT JOIN bna_students s ON s.id = a.student_id
     LEFT JOIN bna_workspaces w ON w.id = COALESCE(a.workspace_id, s.workspace_id)
     LEFT JOIN LATERAL (
       SELECT p.project_key
       FROM bna_projects p
       WHERE p.workspace_id = COALESCE(a.workspace_id, s.workspace_id)
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    params
  );
  const event = result.rows[0];
  if (!event) {
    const error = new Error('Student accountability record is not visible in the selected workspace.');
    error.statusCode = scopedStudentNotFoundStatus(req);
    throw error;
  }
  return event;
}

async function assertGroupGoalAccess(req, goalId, projectKey = studentProjectKeyFromRequest(req), db = pool) {
  const params = [goalId];
  const conditions = ['g.id = $1'];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const result = await db.query(
    `SELECT g.*,
            proj.project_key,
            w.workspace_key
     FROM bna_group_goals g
     LEFT JOIN bna_workspaces w ON w.id = g.workspace_id
     LEFT JOIN LATERAL (
       SELECT p.project_key
       FROM bna_projects p
       WHERE p.workspace_id = g.workspace_id
       ORDER BY p.id ASC
       LIMIT 1
     ) proj ON TRUE
     WHERE ${conditions.join(' AND ')}
     LIMIT 1`,
    params
  );
  const goal = result.rows[0];
  if (!goal) {
    const error = new Error('Group goal is not visible in the selected workspace.');
    error.statusCode = scopedStudentNotFoundStatus(req);
    throw error;
  }
  return goal;
}

async function assertTaskAccess(req, taskId, db = pool) {
  const scopedProjectKey = opsScopeProjectKey(req);
  if (!scopedProjectKey) return null;
  const result = await db.query(
    `SELECT t.id, t.workspace_id, p.project_key, w.workspace_key
     FROM bna_tasks t
     LEFT JOIN bna_projects p ON p.id = t.project_id
     LEFT JOIN bna_workspaces w ON w.id = COALESCE(t.workspace_id, p.workspace_id)
     WHERE t.id = $1`,
    [taskId]
  );
  const task = result.rows[0];
  if (!task) {
    const error = new Error('This login can only access One Time Mishnah Class tasks.');
    error.statusCode = 403;
    throw error;
  }
  try {
    assertScopedTaskAccess(req.opsIdentity, task, 'This login can only access One Time Mishnah Class tasks.');
  } catch (error) {
    error.statusCode = error.statusCode || 403;
    throw error;
  }
  return task;
}

const PENDING_BRIEFS_DIR = path.join(__dirname, 'tasks-pending');
const PENDING_BRIEF_WORK_BADGES = [
  {
    id: 'goal_board',
    label: 'Goal Board',
    pattern: /\b(goal board|student-owned goal|student owned goal|classroom assignment|morning learning|private meeting|natural consequence)\b/i,
  },
  {
    id: 'device_control',
    label: 'Device Control',
    pattern: /\b(device control|device-control|qstudio|qustodio|headwind|freekiosk|mdm|tablet|allowlist|kiosk|lock task|lock-task)\b/i,
  },
  {
    id: 'rabbi_bot',
    label: 'Rabbi Bot',
    pattern: /\b(rabbi elie|rabbi bot|one time mishnah|one time mishna|mishnah class|mishna class|scoped bot|bot profile)\b/i,
  },
  {
    id: 'ui',
    label: 'UI',
    pattern: /\b(ui|dashboard|operations|task manager|student page|homepage|carousel|card|cards|modal|filter chip|operations content)\b/i,
  },
  {
    id: 'drive_content',
    label: 'Drive/Content',
    pattern: /\b(drive|content|blog|website moment|raw intake|newsletter|prompt studio|prompt|transcript|image lane|learning moments|ghl|social post|facebook|whatsapp)\b/i,
  },
  {
    id: 'parsing',
    label: 'Parsing',
    pattern: /\b(parser|parsing|parse|routing|recording|audio|video upload|voice|ramble|intake lane|mixed recording|transcribe)\b/i,
  },
];

function limitText(value, max = 320) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 3)).trim() + '...';
}

function markdownField(content, field) {
  const match = String(content || '').match(new RegExp(`^${field}\\s*:\\s*(.+)$`, 'im'));
  return match ? match[1].trim() : '';
}

function normalizeBriefHeading(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function markdownSection(content, headings = []) {
  const wanted = new Set(headings.map(normalizeBriefHeading));
  const lines = String(content || '').split(/\r?\n/);
  let start = -1;
  let level = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{2,6})\s+(.+?)\s*$/);
    if (!match) continue;
    if (wanted.has(normalizeBriefHeading(match[2]))) {
      start = i + 1;
      level = match[1].length;
      break;
    }
  }

  if (start === -1) return '';

  const collected = [];
  for (let i = start; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{2,6})\s+/);
    if (match && match[1].length <= level) break;
    collected.push(lines[i]);
  }
  return collected.join('\n').trim();
}

function firstMarkdownParagraph(markdown) {
  const chunks = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\n\s*\n+/);

  for (const chunk of chunks) {
    const text = chunk
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !/^#{1,6}\s/.test(line))
      .filter((line) => !/^(date|task|status|source)\s*:/i.test(line))
      .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
      .filter(Boolean)
      .join(' ')
      .replace(/`([^`]+)`/g, '$1')
      .trim();

    if (text) return limitText(text);
  }

  return '';
}

function pendingBriefSummary(content) {
  const preferredSections = [
    'Goal',
    'Product Goal',
    'Operator Intent',
    'Boundary',
    'Recommendation',
    'Requirements',
    'Suggested Implementation Shape',
    'Status',
  ];

  for (const section of preferredSections) {
    const summary = firstMarkdownParagraph(markdownSection(content, [section]));
    if (summary) return summary;
  }

  return firstMarkdownParagraph(content);
}

function pendingBriefLifecycle(content, statusLine) {
  const status = String(statusLine || '').toLowerCase();
  const leadingText = `${statusLine || ''}\n${String(content || '').slice(0, 5000)}`.toLowerCase();
  const statusOrLeading = status || leadingText;

  if (/\b(planning-only|planning only|documentation-only|documentation only|design handoff|pending implementation|do not build)\b/.test(statusOrLeading)) {
    return {
      stage: 'planned',
      label: 'Planned',
      reason: statusLine || 'Markdown brief exists, but implementation is still pending.',
    };
  }

  if (/\bdeploy(?:ment)?\/restart is needed\b|\bdeploy(?:ment)? needed\b|\brestart needed\b|\blive values still needed\b|\bimplemented locally\b|\blocal implementation\b/.test(statusOrLeading)) {
    return {
      stage: 'implementing',
      label: 'Implementing',
      reason: statusLine || 'Implementation exists locally or needs live setup before it is finished.',
    };
  }

  if (/\b(deployed|deployed\/restarted|running in production|live in production)\b/.test(status) && !/\b(needed|pending|not yet|still needed)\b/.test(status)) {
    return {
      stage: 'deployed',
      label: 'Deployed',
      reason: statusLine || 'Brief says the work is deployed.',
    };
  }

  if (/\b(verified|verification passed|tests? passed|smoke passed|completed locally)\b/.test(statusOrLeading)) {
    return {
      stage: 'verified',
      label: 'Verified',
      reason: statusLine || 'Brief includes verification evidence.',
    };
  }

  return {
    stage: 'planned',
    label: 'Planned',
    reason: statusLine || 'Markdown brief exists, but no implementation status was found.',
  };
}

function pendingBriefBadges(content, title) {
  const text = `${title || ''}\n${content || ''}`;
  const badges = PENDING_BRIEF_WORK_BADGES
    .filter((badge) => badge.pattern.test(text))
    .map(({ id, label }) => ({ id, label }));

  if (!badges.length) return [{ id: 'ui', label: 'UI' }];
  return badges;
}

function pendingBriefFromFile(fileName) {
  const fullPath = path.join(PENDING_BRIEFS_DIR, fileName);
  const stat = fs.statSync(fullPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : fileName.replace(/\.md$/i, '').replace(/-/g, ' ');
  const statusLine = markdownField(content, 'Status');
  const lifecycle = pendingBriefLifecycle(content, statusLine);
  const taskMatch = markdownField(content, 'Task').match(/#?(\d+)/);
  const date = markdownField(content, 'Date') || (fileName.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || '';
  const projectKey = inferProjectKeyFromText(`${title}\n${content}`, DEFAULT_PROJECT_KEY);

  return {
    id: `brief:${fileName}`,
    title,
    file_name: fileName,
    file_path: `tasks-pending/${fileName}`,
    date,
    task_id: taskMatch ? Number(taskMatch[1]) : null,
    status_text: statusLine,
    lifecycle_stage: lifecycle.stage,
    lifecycle_label: lifecycle.label,
    lifecycle_reason: lifecycle.reason,
    project_key: projectKey,
    project_name: projectKey === ONE_TIME_PROJECT_KEY ? 'One Time Mishnah Class' : 'BNA',
    project_short_name: projectKey === ONE_TIME_PROJECT_KEY ? 'One Time' : 'BNA',
    badges: pendingBriefBadges(content, title),
    summary: pendingBriefSummary(content),
    created_at: date || stat.birthtime.toISOString(),
    updated_at: stat.mtime.toISOString(),
    file_mtime: stat.mtime.toISOString(),
  };
}

function listPendingBriefs(req) {
  if (!fs.existsSync(PENDING_BRIEFS_DIR)) return [];
  const scopedProjectKey = opsScopeProjectKey(req);
  const briefs = fs.readdirSync(PENDING_BRIEFS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => pendingBriefFromFile(entry.name))
    .filter((brief) => !scopedProjectKey || normalizeProjectKey(brief.project_key) === scopedProjectKey);

  const lifecycleRank = { planned: 0, implementing: 1, verified: 2, deployed: 3 };
  return briefs.sort((a, b) => {
    const rank = (lifecycleRank[a.lifecycle_stage] ?? 4) - (lifecycleRank[b.lifecycle_stage] ?? 4);
    if (rank !== 0) return rank;
    return Date.parse(b.updated_at || 0) - Date.parse(a.updated_at || 0);
  });
}

function readWebsiteBlogStore() {
  const store = readJsonFile(WEBSITE_BLOG_STORE_PATH, { posts: [] });
  return {
    posts: Array.isArray(store.posts) ? store.posts : [],
  };
}

function normalizeWebsiteBlogText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const WEBSITE_BLOG_STOP_WORDS = new Set([
  'about',
  'academy',
  'alternative',
  'because',
  'beit',
  'bnei',
  'boys',
  'child',
  'children',
  'education',
  'from',
  'have',
  'into',
  'learning',
  'neviim',
  'parents',
  'school',
  'shemsh',
  'shemesh',
  'that',
  'their',
  'this',
  'torah',
  'what',
  'when',
  'where',
  'with',
]);

function websiteBlogTokens(value) {
  return normalizeWebsiteBlogText(value)
    .split(' ')
    .filter((token) => token.length >= 4 && !WEBSITE_BLOG_STOP_WORDS.has(token));
}

function websiteBlogTokenSimilarity(a, b) {
  const aTokens = new Set(websiteBlogTokens(a));
  const bTokens = new Set(websiteBlogTokens(b));
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  return overlap / Math.min(aTokens.size, bTokens.size);
}

function websitePostComparisonText(post) {
  return [
    post.title,
    post.category,
    post.excerpt,
    post.metaDescription,
    Array.isArray(post.body) ? post.body.slice(0, 3).join(' ') : post.body,
  ].filter(Boolean).join(' ');
}

function normalizeWebsiteBlogSummary(post, source = 'dynamic') {
  if (!post || !post.title || !post.slug) return null;
  return {
    id: post.id || null,
    sourceOutputId: post.sourceOutputId || null,
    sourceContentJobId: post.sourceContentJobId || null,
    source,
    lang: post.lang || 'en',
    slug: post.slug,
    status: post.status || (source === 'static' ? 'published' : ''),
    category: post.category || 'Torah Learning',
    title: post.title,
    metaDescription: post.metaDescription || '',
    excerpt: post.excerpt || post.metaDescription || '',
    body: Array.isArray(post.body) ? post.body : [],
    keywords: Array.isArray(post.keywords) ? post.keywords : [],
    publishedAt: post.publishedAt || '',
  };
}

function readStaticWebsiteBlogPosts() {
  try {
    if (!fs.existsSync(STATIC_WEBSITE_CONTENT_PATH)) return [];
    const sandbox = {
      window: {},
      console: {
        error() {},
        log() {},
        warn() {},
      },
      fetch() {
        return Promise.resolve({ ok: false, json: async () => ({ posts: [] }) });
      },
    };
    vm.runInNewContext(fs.readFileSync(STATIC_WEBSITE_CONTENT_PATH, 'utf8'), sandbox, {
      filename: STATIC_WEBSITE_CONTENT_PATH,
      timeout: 1000,
    });
    return (sandbox.window?.BNAContent?.blogPosts || [])
      .map((post) => normalizeWebsiteBlogSummary(post, 'static'))
      .filter(Boolean);
  } catch (err) {
    console.warn('[website-blog] Could not read static blog catalog:', err.message);
    return [];
  }
}

function readAllWebsiteBlogSummaries() {
  const byKey = new Map();
  for (const post of readStaticWebsiteBlogPosts()) {
    byKey.set(`${post.lang}:${post.slug}`, post);
  }
  for (const post of readWebsiteBlogStore().posts) {
    const normalized = normalizeWebsiteBlogSummary(post, 'dynamic');
    if (!normalized || normalized.status !== 'published') continue;
    byKey.set(`${normalized.lang}:${normalized.slug}`, normalized);
  }
  return [...byKey.values()];
}

function websiteBlogNonRedundancyContext() {
  const posts = readAllWebsiteBlogSummaries()
    .filter((post) => post.lang === 'en')
    .slice(0, 36);
  if (!posts.length) {
    return [
      'No existing website article catalog was found.',
      'Still avoid generic duplicate BNA positioning copy; use only the fresh source material.',
    ].join('\n');
  }

  const lines = posts.map((post, index) => [
    `${index + 1}. ${post.title}`,
    `[${post.category}]`,
    `slug: ${post.slug}`,
    `angle: ${excerptFromText(post.excerpt || post.metaDescription || post.body?.[0] || '', 220)}`,
  ].filter(Boolean).join(' '));

  return [
    'Existing website articles already published or built into the website:',
    ...lines,
    '',
    'Non-redundancy rules:',
    '- Compare the source material against the existing article map before drafting.',
    '- Do not reuse an existing title, article structure, thesis, or generic BNA positioning article.',
    '- If the same broad topic already exists, write only if the source gives a fresh concrete angle, story, question, update, or practical distinction.',
    '- If there is no fresh non-redundant article angle, return a short note that begins exactly: NON-REDUNDANT BLOG NOT FOUND:',
    '- If a fresh angle exists, make the title and introduction clearly different from existing articles.',
  ].join('\n');
}

function writePublishedWebsiteBlogFeed(store = readWebsiteBlogStore()) {
  const posts = (store.posts || [])
    .filter((post) => post.status === 'published')
    .map((post) => ({
      lang: post.lang || 'en',
      slug: post.slug,
      category: post.category,
      title: post.title,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: Array.isArray(post.keywords) ? post.keywords : [],
      image: post.image,
      excerpt: post.excerpt,
      body: Array.isArray(post.body) ? post.body : [],
      cta: post.cta,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      generated: true,
    }))
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
  writeJsonFile(PUBLIC_WEBSITE_BLOG_PATH, { posts });
  return posts;
}

function ensureWebsiteBlogDataFiles() {
  const store = readWebsiteBlogStore();
  writeJsonFile(WEBSITE_BLOG_STORE_PATH, store);
  writePublishedWebsiteBlogFeed(store);
}

function uniqueWebsiteBlogSlug(baseSlug, posts, currentPostId = null) {
  const root = baseSlug || 'bna-article';
  let slug = root;
  let suffix = 2;
  const taken = (candidate) => posts.some((post) => post.slug === candidate && post.id !== currentPostId);
  while (taken(slug)) {
    slug = `${root}-${suffix++}`;
  }
  return slug;
}

function findRedundantWebsiteBlogCandidate(candidate, existingPosts, currentPostId = null) {
  const candidateTitle = normalizeWebsiteBlogText(candidate.title);
  const candidateSlug = slugifyWebsiteBlog(candidate.slug || candidate.title);
  const candidateText = websitePostComparisonText(candidate);

  for (const post of existingPosts) {
    if (!post || (currentPostId && post.id === currentPostId)) continue;
    if (post.lang && candidate.lang && post.lang !== candidate.lang) continue;

    const postTitle = normalizeWebsiteBlogText(post.title);
    if (postTitle && candidateTitle && postTitle === candidateTitle) {
      return { post, reason: 'same title' };
    }

    const postSlug = slugifyWebsiteBlog(post.slug || post.title);
    if (postSlug && candidateSlug && postSlug === candidateSlug) {
      return { post, reason: 'same slug' };
    }

    const titleSimilarity = websiteBlogTokenSimilarity(candidate.title, post.title);
    const bodySimilarity = websiteBlogTokenSimilarity(candidateText, websitePostComparisonText(post));
    if ((titleSimilarity >= 0.72 && bodySimilarity >= 0.55) || bodySimilarity >= 0.78) {
      return {
        post,
        reason: `high overlap (${Math.round(Math.max(titleSimilarity, bodySimilarity) * 100)}%)`,
      };
    }
  }

  return null;
}

function publishWebsiteBlogFromOutput(output, job) {
  const now = new Date().toISOString();
  const metadata = safeJsonParse(output.metadata);
  const store = readWebsiteBlogStore();
  const existingIndex = store.posts.findIndex((post) => Number(post.sourceOutputId) === Number(output.id));
  const existing = existingIndex >= 0 ? store.posts[existingIndex] : null;
  if (/^NON-REDUNDANT BLOG NOT FOUND:/i.test(String(output.body || '').trim())) {
    throw new Error('This draft says there is no non-redundant blog angle. Regenerate with a fresh angle or update an existing article instead of publishing this note.');
  }
  const parsed = parseWebsiteBlogBody(output, job, metadata.website_blog || metadata);
  const baseSlug = slugifyWebsiteBlog((metadata.website_blog || metadata).slug || parsed.title);
  const redundancy = findRedundantWebsiteBlogCandidate(
    {
      id: existing?.id || null,
      lang: 'en',
      slug: baseSlug,
      category: parsed.category,
      title: parsed.title,
      excerpt: parsed.excerpt,
      body: parsed.body,
    },
    readAllWebsiteBlogSummaries(),
    existing?.id || null
  );
  if (redundancy) {
    throw new Error(`Potentially redundant blog draft: ${redundancy.reason} with "${redundancy.post.title}". Regenerate with a clearly fresh angle before publishing.`);
  }
  const slug = existing?.slug || uniqueWebsiteBlogSlug(baseSlug, store.posts, existing?.id);
  const post = {
    id: existing?.id || crypto.randomUUID(),
    sourceOutputId: output.id,
    sourceContentJobId: output.job_id,
    lang: 'en',
    slug,
    status: 'published',
    category: parsed.category,
    title: parsed.title,
    metaTitle: `${parsed.title} | Bnei Neviim Academy`,
    metaDescription: excerptFromText((metadata.website_blog || metadata).metaDescription || parsed.excerpt, 155),
    keywords: [
      'Bnei Neviim Academy',
      'Torah learning',
      'alternative school Beit Shemesh',
      parsed.category,
    ].filter(Boolean),
    image: (metadata.website_blog || metadata).image || '/images/learning-moments/forest-learning-01-web.jpg',
    excerpt: parsed.excerpt,
    body: parsed.body,
    cta: (metadata.website_blog || metadata).cta || 'Contact Bnei Neviim Academy to discuss whether this Torah learning environment is the right fit for your son.',
    publishedAt: existing?.publishedAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store.posts[existingIndex] = post;
  } else {
    store.posts.unshift(post);
  }
  writeJsonFile(WEBSITE_BLOG_STORE_PATH, store);
  writePublishedWebsiteBlogFeed(store);
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    url: `/blog/${post.slug}`,
    publishedAt: post.publishedAt,
  };
}

function extractJsonPayload(text) {
  const raw = String(text || '').trim();
  if (!raw) return {};
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  try {
    return JSON.parse(candidate);
  } catch {}
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(candidate.slice(first, last + 1));
    } catch {}
  }
  return {};
}

function normalizeNameForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function studentAliasesForServer(student) {
  const normalized = normalizeNameForMatch(student?.name);
  const parts = normalized.split(/\s+/).filter((part) => part.length >= 3);
  const aliases = new Set([normalized, ...parts]);
  const haystack = `${student?.name || ''} ${student?.notes || ''}`.toLowerCase();
  if (/golambo|golamb/i.test(haystack)) {
    ['eitan', 'eitan chaim', 'eitan chaim golambo', 'golambo', 'shalom golambo'].forEach((alias) => aliases.add(normalizeNameForMatch(alias)));
  }
  if (/kosovsky|קוסובסקי|אמיתי/.test(haystack)) {
    ['amitay', 'amitai', 'amiti', 'amitai kosovsky', 'amitay kosovsky', 'kosovsky'].forEach((alias) => aliases.add(normalizeNameForMatch(alias)));
  }
  return [...aliases].filter((alias) => alias.length >= 3);
}

function findStudentForParsedName(name, students) {
  const normalized = normalizeNameForMatch(name);
  if (!normalized) return null;
  return students.find((student) => studentAliasesForServer(student).some((alias) => normalized.includes(alias) || alias.includes(normalized))) || null;
}

function calculateWeightedGoal({ target_minutes, inside_following_minutes, inside_listening_minutes }) {
  const target = Number(target_minutes || 0);
  const following = Number(inside_following_minutes || 0);
  const listening = Number(inside_listening_minutes || 0);
  const weighted = following + (listening * 0.5);
  const progress = target > 0 ? Math.max(0, Math.min(100, Math.round((weighted / target) * 100))) : null;
  return { weighted, progress };
}

function clampProgressPercent(value) {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function compactMinuteValue(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return '0';
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1).replace(/\.0$/, '');
}

function buildTorahTimerNote(baseNote, mapping = {}, job = {}) {
  const timerParts = [];
  if (mapping.hasTimerBreakdown) {
    timerParts.push(`inside ${compactMinuteValue(mapping.insideEngagedMinutes)} min`);
    timerParts.push(`listening ${compactMinuteValue(mapping.listeningWithoutFollowingMinutes)} min`);
    if (Number(mapping.distractedMinutes || 0) > 0) {
      timerParts.push(`distracted ${compactMinuteValue(mapping.distractedMinutes)} min`);
    }
    if (Number(mapping.timerTotalMinutes || 0) > 0) {
      timerParts.push(`timer ${compactMinuteValue(mapping.timerTotalMinutes)} min`);
    }
    timerParts.push(`counted ${compactMinuteValue(mapping.countedMinutes)} / ${compactMinuteValue(mapping.goalMinutes)} min`);
    timerParts.push(`daily ${compactMinuteValue(mapping.dailyCompletionPercentage)}%`);
    if (mapping.engagementPercent !== null && mapping.engagementPercent !== undefined) {
      timerParts.push(`engagement ${compactMinuteValue(mapping.engagementPercent)}%`);
    }
  }

  return [
    baseNote,
    timerParts.length ? `Timer mapping: ${timerParts.join('; ')}.` : '',
    job?.id ? `Parsed from content job #${job.id}.` : '',
  ].filter(Boolean).join(' ');
}

async function upsertMixedRecordingAccountabilityEvent(client, input = {}) {
  const metadata = input.metadata || {};
  const parserItemKey = String(metadata.parser_item_key || input.parser_item_key || '').trim();
  const values = [
    input.workspace_id || null,
    safeAccountabilityEventType(input.event_type),
    input.student_id || null,
    input.student_name || null,
    String(input.title || 'Recording note').slice(0, 240),
    input.notes || null,
    input.topic || null,
    input.question_text || null,
    input.goal_target_value || null,
    input.goal_actual_value || null,
    input.goal_unit || null,
    clampProgressPercent(input.progress_percent),
    input.attendance_status || null,
    input.next_check_in_date || null,
    input.engagement_level || null,
    Boolean(input.follow_up_required),
    JSON.stringify(metadata),
    input.source_message_id || null,
    input.source_media_url || null,
  ];

  if (parserItemKey) {
    const existing = await client.query(
      `UPDATE bna_accountability_events
       SET workspace_id = $1,
           event_type = $2,
           student_id = $3,
           student_name = $4,
           title = $5,
           notes = $6,
           topic = $7,
           question_text = $8,
           goal_target_value = $9,
           goal_actual_value = $10,
           goal_unit = $11,
           progress_percent = $12,
           attendance_status = $13,
           next_check_in_date = $14,
           engagement_level = $15,
           follow_up_required = $16,
           metadata = $17,
           source = 'recording',
           source_message_id = $18,
           source_media_url = $19,
           updated_at = NOW()
       WHERE metadata->>'parser_item_key' = $20
       RETURNING *`,
      [...values, parserItemKey]
    );
    if (existing.rows[0]) return existing.rows[0];
  }

  return (await client.query(
    `INSERT INTO bna_accountability_events (
      workspace_id, event_type, student_id, student_name, title, notes, topic, question_text,
      goal_target_value, goal_actual_value, goal_unit, progress_percent,
      attendance_status, next_check_in_date, engagement_level, follow_up_required, metadata,
      source, source_message_id, source_media_url, occurred_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12,
      $13, $14, $15, $16, $17,
      'recording', $18, $19, NOW()
    )
    RETURNING *`,
    values
  )).rows[0];
}

async function upsertMixedRecordingGroupGoalEntry(client, input = {}) {
  const metadata = input.metadata || {};
  const parserItemKey = String(metadata.parser_item_key || input.parser_item_key || '').trim();
  const values = [
    input.workspace_id || null,
    input.goal_id,
    input.student_id || null,
    input.student_name || null,
    input.recorded_date,
    input.target_minutes || null,
    input.inside_following_minutes || 0,
    input.inside_listening_minutes || 0,
    input.distracted_minutes || 0,
    input.weighted_minutes || 0,
    clampProgressPercent(input.progress_percent),
    input.notes || null,
    input.source_content_job_id || null,
    JSON.stringify(metadata),
  ];

  if (parserItemKey) {
    const existing = await client.query(
      `UPDATE bna_group_goal_entries
       SET workspace_id = $1,
           goal_id = $2,
           student_id = $3,
           student_name = $4,
           recorded_date = $5::date,
           target_minutes = $6,
           inside_following_minutes = $7,
           inside_listening_minutes = $8,
           distracted_minutes = $9,
           weighted_minutes = $10,
           progress_percent = $11,
           notes = $12,
           source_content_job_id = $13,
           metadata = $14,
           updated_at = NOW()
       WHERE metadata->>'parser_item_key' = $15
       RETURNING *`,
      [...values, parserItemKey]
    );
    if (existing.rows[0]) return existing.rows[0];
  }

  return (await client.query(
    `INSERT INTO bna_group_goal_entries (
      workspace_id, goal_id, student_id, student_name, recorded_date, target_minutes,
      inside_following_minutes, inside_listening_minutes, distracted_minutes, weighted_minutes,
      progress_percent, notes, source_content_job_id, metadata
    )
    VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    values
  )).rows[0];
}

async function insertTorahTimerAccountabilityEvent(client, {
  student,
  job = {},
  sourceUpdate = {},
  torahRecord = null,
  groupGoalEntry = null,
  mapping = {},
  parserItemKey = '',
}) {
  if (!student || !mapping.hasTimerBreakdown) return null;
  const notes = buildTorahTimerNote(sourceUpdate.notes || null, mapping, job);
  return upsertMixedRecordingAccountabilityEvent(client, {
    workspace_id: student.workspace_id || job.workspace_id || null,
    event_type: 'learning_note',
    student_id: student.id,
    student_name: student.name,
    title: `Torah timer update for ${student.name}`.slice(0, 240),
    notes: notes || null,
    topic: 'Torah daily engagement',
    goal_target_value: mapping.goalMinutes,
    goal_actual_value: mapping.countedMinutes,
    goal_unit: 'minutes',
    progress_percent: mapping.progressPercent,
    engagement_level: mapping.engagementLevel,
    follow_up_required: false,
    metadata: mixedRecordingParserMetadata(job, 'torah_timer_event', parserItemKey || mixedRecordingParserItemKey(job.id, 'torah_timer_event', [
      student.id,
      torahRecord?.entry?.date,
      groupGoalEntry?.id,
      sourceUpdate,
    ]), sourceUpdate, {
      torah_entry_id: torahRecord?.entry?.id || null,
      group_goal_entry_id: groupGoalEntry?.id || null,
      timer_mapping: mapping,
    }),
    source_message_id: String(job.id || ''),
    source_media_url: job.media_url || null,
  });
}

function safeTaskCategory(value) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases = {
    tech: 'technology',
    torah_prep: 'torah_class_prep',
    class_prep: 'torah_class_prep',
    source_sheet: 'source_sheets',
    sources: 'source_sheets',
    shiur_idea: 'shiur_ideas',
    shiur_topics: 'shiur_ideas',
    billing: 'accounting',
    finance: 'finance',
    ghl: 'ghl_setup',
  };
  const category = aliases[normalized] || normalized;
  return ALL_TASK_CATEGORIES.includes(category) ? category : 'operations';
}

function safeTaskUrgency(value) {
  const allowed = new Set(['urgent', 'today', 'this_week', 'low']);
  return allowed.has(value) ? value : 'this_week';
}

const CANONICAL_TASK_STAGES = new Set([
  'decision_required',
  'ready',
  'in_progress',
  'blocked',
  'done',
  'archived',
]);

const TASK_STAGE_ALIASES = {
  raw_input: 'ready',
  inbox: 'ready',
  needs_decision: 'decision_required',
  assigned: 'ready',
  clarify: 'decision_required',
  plan: 'decision_required',
  execute: 'in_progress',
  review: 'decision_required',
  complete: 'done',
  archive: 'archived',
};

function normalizeTaskStageValue(stage, options = {}) {
  const raw = String(stage || '').trim().toLowerCase();
  const mapped = TASK_STAGE_ALIASES[raw] || raw;
  if (CANONICAL_TASK_STAGES.has(mapped)) return mapped;
  return options.decisionRequired ? 'decision_required' : 'ready';
}

function taskDecisionRequiredForStage(stage, explicitValue) {
  const normalized = normalizeTaskStageValue(stage);
  if (explicitValue !== undefined) return Boolean(explicitValue) || normalized === 'decision_required';
  return normalized === 'decision_required';
}

function safeTaskSource(value) {
  const normalized = String(value || '').trim().toLowerCase();
  const allowed = new Set(['manual', 'ramble', 'telegram', 'web', 'google_drive', 'content_job', 'import', 'ghl_webhook', 'green_invoice']);
  return allowed.has(normalized) ? normalized : 'manual';
}

function safeTaskOwner(value, task = {}) {
  const raw = String(value || '').trim();
  if (/^(rabbi elie scheller|rabbi elie|elie scheller|rabbi)$/i.test(raw)) return 'Rabbi Elie Scheller';
  if (/^(unassigned|none|no one)$/i.test(raw)) return null;
  if (/^(shloimie|shlomo|operator|me|myself)$/i.test(raw)) return 'Shloimie';
  if (/^(kimi|kimmy|codex|agent|system|ai)$/i.test(raw)) return 'Codex';
  const inferred = inferTaskOwner([
    task.title,
    task.notes,
    task.original_text,
    task.source_text,
  ].filter(Boolean).join(' '));
  return inferred || 'Codex';
}

function safeAccountabilityEventType(value) {
  const allowed = new Set(['class_session', 'learning_note', 'question', 'student_goal', 'private_meeting', 'decision']);
  return allowed.has(value) ? value : 'learning_note';
}

async function ensureDefaultGroupGoal(client = pool) {
  const existing = (await client.query(
    `SELECT *
     FROM bna_group_goals
     WHERE status = 'active'
       AND lower(title) = lower($1)
     ORDER BY created_at DESC
     LIMIT 1`,
    ['Inside Learning Group Goal']
  )).rows[0];
  if (existing) return existing;

  return (await client.query(
    `INSERT INTO bna_group_goals (workspace_id, title, description, scoring_rule, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING *`,
    [
      (await getDefaultSchoolWorkspace(client)).id,
      'Inside Learning Group Goal',
      'Group Torah learning goal: minutes following inside count at 100%; minutes only listening count at 50%. The group is only complete when every boy reaches 100%.',
      'following_inside_minutes + (listening_inside_minutes * 0.5); group completion = min(student progress), only 100 when every boy is 100.',
    ]
  )).rows[0];
}

function focusTranscriptForMixedParse(text, maxChars = 22000) {
  const transcript = String(text || '');
  if (transcript.length <= maxChars) return transcript;
  const headChars = Math.round(maxChars * 0.62);
  const tailChars = maxChars - headChars;
  return [
    transcript.slice(0, headChars),
    '',
    `[Middle of long transcript omitted for parser speed: ${transcript.length - maxChars} characters]`,
    '',
    transcript.slice(-tailChars),
  ].join('\n');
}

function titleFromTaskSentence(sentence) {
  const lower = sentence.toLowerCase();
  if (lower.includes('content') && (lower.includes('bullet') || lower.includes('card') || lower.includes('collapsible'))) return 'Clean Content cards and topic bullets';
  if (lower.includes('remotion') || lower.includes('video editor') || lower.includes('natural language')) return 'Improve natural-language video editing workflow';
  if (lower.includes('green invoice') || lower.includes('webhook')) return 'Audit Green Invoice webhook processing';
  if (lower.includes('torah') || lower.includes('group goal') || lower.includes('inside')) return 'Update Torah learning group-goal tracking';
  if (lower.includes('drive folder') || lower.includes('website moments')) return 'Confirm Website Moments Drive intake folder';
  if (lower.includes('parse') || lower.includes('routing')) return 'Improve mixed-recording parser routing';
  if (lower.includes('telegram')) return 'Improve Telegram parse report';
  return 'Review extracted operator task';
}

function taskOwnerFromSentence(sentence) {
  return inferTaskOwner(sentence) || (/(\bmy task\b|\bfor me\b|\bi need to\b|\bremind me\b)/i.test(sentence) ? 'Shloimie' : 'Codex');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\$&');
}

function extractNearbyText(text, index, length, radius = 220) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + length + radius);
  return text.slice(start, end);
}

function extractMinutesNearLabel(text, labelPatterns = []) {
  const labels = labelPatterns.map((pattern) => pattern instanceof RegExp ? pattern.source : escapeRegExp(pattern));
  if (!labels.length) return null;
  const labelSource = `(?:${labels.join('|')})`;
  const patterns = [
    new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:minutes?|mins?|min)\\s*(?:of\\s+|for\\s+)?${labelSource}`, 'i'),
    new RegExp(`${labelSource}.{0,28}?(\\d+(?:\\.\\d+)?)\\s*(?:minutes?|mins?|min)`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const numeric = Number(match[1]);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return null;
}

function extractTimerBreakdownFromSegment(segment) {
  const insideMinutes = extractMinutesNearLabel(segment, [
    /inside(?:\s+following)?/,
    /following(?:\s+inside)?/,
    /followed\s+along/,
  ]);
  const listeningMinutes = extractMinutesNearLabel(segment, [
    /listening\s+without\s+following/,
    /listening\s+but\s+not\s+following/,
    /only\s+listening/,
    /listening\s+only/,
  ]);
  const distractedMinutes = extractMinutesNearLabel(segment, [
    /distracted/,
    /off[\s-]?task/,
    /not\s+engaged/,
  ]);
  const timerTotalMinutes = extractMinutesNearLabel(segment, [
    /timer/,
    /observed/,
    /session/,
  ]);
  if ([insideMinutes, listeningMinutes, distractedMinutes, timerTotalMinutes].every((value) => value === null)) {
    return null;
  }
  return {
    inside_engaged_minutes: insideMinutes || 0,
    listening_without_following_minutes: listeningMinutes || 0,
    distracted_minutes: distractedMinutes || 0,
    timer_total_minutes: timerTotalMinutes || undefined,
  };
}

function basicMixedRecordingParse({ job, students, error }) {
  const text = String(job?.transcript_text || '');
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter((sentence) => sentence.length > 20);
  const taskSentences = sentences
    .filter((sentence) => /\b(need you|we need|fix|audit|green invoice|webhook|drive folder|website|update|build|task|telegram|parser|routing|content|collapsible|bullet|codex|kimi|remotion|video editor)\b/i.test(sentence))
    .slice(0, 16);
  const tasks = taskSentences.map((sentence) => ({
    title: titleFromTaskSentence(sentence),
    notes: sentence.slice(0, 1200),
    category: /green invoice|payment|webhook/i.test(sentence) ? 'finance' : 'operations',
    urgency: /right now|today|urgent|immediate/i.test(sentence) ? 'today' : 'this_week',
    assigned_to: taskOwnerFromSentence(sentence),
  }));

  const accountabilityEvents = [];
  for (const student of students) {
    const aliases = studentAliasesForServer(student);
    const mentioned = aliases.some((alias) => alias && text.toLowerCase().includes(alias));
    if (!mentioned) continue;
    if (!/\b(goal|meeting|accountability|question|progress|inside|listening|percent|%)\b/i.test(text)) continue;
    accountabilityEvents.push({
      event_type: 'learning_note',
      student_name: student.name,
      title: `Review accountability notes for ${student.name}`,
      notes: 'The deterministic fallback detected this student in a mixed recording. Review the transcript and refine goals/progress if needed.',
      follow_up_required: true,
    });
  }

  const groupEntries = [];
  const lowerText = text.toLowerCase();
  const seenProgressStudents = new Set();
  for (const student of students) {
    for (const alias of studentAliasesForServer(student)) {
      if (!alias || alias.length < 3) continue;
      const aliasPattern = escapeRegExp(alias).replace(/\s+/g, '\\s+');
      const progressRegex = new RegExp(`${aliasPattern}.{0,35}?(\\d{1,3})\\s*(?:%|percent)`, 'i');
      const match = lowerText.match(progressRegex);
      const progress = match ? clampProgressPercent(match[1]) : null;
      if (progress === null || seenProgressStudents.has(student.id)) continue;
      seenProgressStudents.add(student.id);
      groupEntries.push({
        student_name: student.name,
        progress_percent: progress,
        notes: 'Captured by deterministic fallback from spoken student-percentage shorthand.',
      });
      break;
    }
  }

  const dailyTorahUpdates = [];
  const seenTimerStudents = new Set();
  for (const student of students) {
    for (const alias of studentAliasesForServer(student)) {
      if (!alias || alias.length < 3) continue;
      const aliasPattern = escapeRegExp(alias).replace(/\s+/g, '\\s+');
      const match = lowerText.match(new RegExp(aliasPattern, 'i'));
      if (!match) continue;
      const segment = extractNearbyText(text, match.index || 0, match[0].length);
      const breakdown = extractTimerBreakdownFromSegment(segment);
      if (!breakdown) continue;
      dailyTorahUpdates.push({
        student_name: student.name,
        goal_type: 'INSIDE',
        ...breakdown,
        notes: 'Captured by deterministic fallback from spoken Torah timer details.',
      });
      if (breakdown.inside_engaged_minutes || breakdown.listening_without_following_minutes) {
        groupEntries.push({
          student_name: student.name,
          target_minutes: breakdown.timer_total_minutes || undefined,
          inside_following_minutes: breakdown.inside_engaged_minutes || 0,
          inside_listening_minutes: breakdown.listening_without_following_minutes || 0,
          distracted_minutes: breakdown.distracted_minutes || 0,
          notes: 'Captured by deterministic fallback from spoken Torah timer details.',
        });
      }
      seenTimerStudents.add(student.id);
      break;
    }
  }
  const hasStudentSpecificProgress = students.some((student) =>
    studentAliasesForServer(student).some((alias) => {
      if (!alias || alias.length < 3) return false;
      const aliasPattern = escapeRegExp(alias).replace(/\s+/g, '\\s+');
      return new RegExp(
        `${aliasPattern}.{0,80}\\b(half|full|whole|completed|finished|\\d+(?:\\.\\d+)?\\s*(?:%|percent|minutes?|mins?))\\b`,
        'i'
      ).test(lowerText);
    })
  );
  const allStudentsDailyCompletion =
    /\b(all|everyone|every boy|all boys)\b.{0,50}\b(today|daily|goal|goals)\b.{0,50}\b(100\s*%|100\s*percent|completed|finished|reached)\b/i.test(text)
    || /\b(100\s*%|100\s*percent|completed|finished|reached)\b.{0,50}\b(today|daily|goal|goals)\b.{0,50}\b(all|everyone|every boy|all boys)\b/i.test(text);
  if (allStudentsDailyCompletion && !hasStudentSpecificProgress && !seenTimerStudents.size) {
    for (const student of students) {
      dailyTorahUpdates.push({
        student_name: student.name,
        daily_completion_percentage: 100,
        daily_completed_boolean: true,
        completed_daily_units_delta: 1,
        notes: 'Captured by deterministic fallback from all-students daily completion shorthand.',
      });
    }
  }

  return {
    tasks,
    accountability_events: accountabilityEvents.slice(0, 20),
    group_goal_entries: groupEntries,
    daily_torah_updates: dailyTorahUpdates,
    class_notes: [],
    report: {
      summary: 'The AI parser did not finish the long mixed-recording parse in time. A conservative fallback extracted obvious tasks, student mentions, percentage shorthand, and obvious daily Torah completion for review.',
      needs_review: ['Review this recording manually in Operations before relying on every extracted item.'],
      parser_fallback: 'deterministic',
      primary_error: error?.message || String(error || ''),
    },
  };
}

async function fetchChatCompletionText({ provider, baseUrl, apiKey, payload, timeoutMs = 85000 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`${provider} chat completion failed: ${response.status} ${body.slice(0, 500)}`);
    }
    const data = JSON.parse(body);
    return String(data?.choices?.[0]?.message?.content || '');
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`${provider} chat completion timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateMixedRecordingParse({ job, students }) {
  if (!CONTENT_AI_API_KEY) {
    throw new Error('No content AI key is configured. Set KIMI_API_KEY or OPENAI_API_KEY.');
  }
  const studentList = students.map((student) => ({
    id: student.id,
    name: student.name,
    parent_name: student.parent_name,
    aliases: studentAliasesForServer(student),
  }));
  const messages = [
    {
      role: 'system',
      content: [
        'You parse Bnei Neviim Academy mixed audio transcripts into structured operational records.',
        'The transcript may include general tasks, private student accountability, student goals, group Torah learning goals, and class notes.',
        'Do not invent facts. If a student is unclear, keep student_name text and omit student_id.',
        'All operator-facing titles, summaries, topics, discussions, notes, and report text must be in English. Translate Hebrew, Yiddish, or other spoken-language content into natural English.',
        'Sources may include Hebrew sefer names or Hebrew verse text only when the transcript clearly includes them; otherwise write the source in English and do not invent chapter or verse numbers.',
        'Return ONLY valid JSON with keys: tasks, accountability_events, group_goal_entries, daily_torah_updates, class_notes, report.',
        'Tasks are non-student work only. If the operator says "my task", "for me", "I need to", or "remind me", set assigned_to to "Shloimie".',
        'If the operator asks Codex, the bot, the system, the app, the website, the dashboard, the parser, Railway, GHL, Remotion, or code to do something, set assigned_to to "Codex".',
        'Machine/coding tasks should be concrete and actionable, not raw rambles. Use short titles such as "Fix Content card summaries" or "Improve recording parser routing".',
        'Student accountability is ONLY named student goals, struggles, decisions, questions, private meetings, attendance, progress, next check-ins, or notes about how a discussion went.',
        'Do not put student accountability into tasks unless it is a general system/admin follow-up; named boy updates belong in accountability_events and/or group_goal_entries.',
        'Content/class notes are ONLY teaching philosophy, actual class topics, verses/sources learned, class discussions, and class questions. Do not put tasks, private meetings, goals, progress, accountability, attendance, follow-up items, coding/system work, or operator personal tasks into class_notes.',
        'For class_notes, topics must be very short 2-5 word labels, not full sentence bullets.',
        'If a verse/source is heard, include the best source reference available, for example book/parsha/topic, and include Hebrew source text only if it is present in the transcript.',
        'If a student question or reader can be determined from the class discussion, include it in student_questions or discussions without exposing private accountability details.',
        'Daily Torah completion is separate from cumulative trip progress. If a boy completed 100% of today, put that in daily_torah_updates with daily_completion_percentage 100 and daily_completed_boolean true. Do not describe it as 100% of the whole trip unless the transcript explicitly says all 30 units are complete.',
        'For spoken Torah timer updates, prefer exact minutes over a flat percentage: inside/following-along minutes go in inside_engaged_minutes, listening-but-not-following minutes go in listening_without_following_minutes, and distracted/off-task time goes in distracted_minutes. Include timer_total_minutes when the total observed timer duration is heard.',
        'Scoring rule: for INSIDE goals, inside/following minutes count 100%, listening without following counts 50%, and distracted/off-task minutes count 0%. For LISTENING goals, engaged listening minutes count 100%.',
        'Use daily_torah_updates for named boy daily Torah timer/completion updates. Use group_goal_entries too when the same update is clearly part of the active inside-learning group goal. Do not put timer accountability into Content class notes.',
        'If the operator says a shorthand such as "Kosofsky: 50%", include progress_percent even when exact minutes are unknown.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        `Content job #${job.id}: ${job.title || 'Untitled'}`,
        '',
        'Known students:',
        JSON.stringify(studentList, null, 2),
        '',
        'Return JSON schema:',
        JSON.stringify({
          tasks: [{ title: 'clear action, not raw wording', notes: 'context and why it matters', category: 'operations|accountability|communications|marketing|finance|admin|student_operations', urgency: 'urgent|today|this_week|low', assigned_to: 'Codex|Shloimie' }],
          accountability_events: [{ event_type: 'student_goal|private_meeting|question|decision|learning_note', student_name: 'name heard', title: 'short title', notes: 'details', topic: 'topic', question_text: 'if question', progress_percent: 50, goal_target_value: 20, goal_actual_value: 10, goal_unit: 'minutes', engagement_level: 'high|medium|low', follow_up_required: true }],
          group_goal_entries: [{ student_name: 'name heard', target_minutes: 20, inside_following_minutes: 10, inside_listening_minutes: 10, distracted_minutes: 0, progress_percent: 75, notes: 'details' }],
          daily_torah_updates: [{ student_name: 'name heard or ALL_ACTIVE', all_active_students: false, date: 'YYYY-MM-DD if heard', goal_minutes: 20, goal_type: 'INSIDE', engaged_listening_minutes: 20, inside_engaged_minutes: 10, listening_without_following_minutes: 10, distracted_minutes: 0, timer_total_minutes: 20, daily_completion_percentage: 75, daily_completed_boolean: false, completed_daily_units_delta: 0, notes: 'admin-visible daily completion notes' }],
          class_notes: [{ title: 'class note', summary: 'what was learned', topics: ['2-5 word topic'], discussions: ['fuller discussion/question'], sources: ['source/reference if heard, Hebrew text only if heard'], student_questions: ['student name if known: question'], highlights: ['short highlight'] }],
          report: { summary: 'short operator-facing report', needs_review: ['unclear item'] },
        }, null, 2),
        '',
        'Transcript:',
        focusTranscriptForMixedParse(job.transcript_text),
      ].join('\n'),
    },
  ];
  const primaryPayload = {
    model: CONTENT_AI_MODEL,
    temperature: CONTENT_AI_PROVIDER === 'kimi' ? 1 : 0.2,
    messages,
  };

  try {
    const content = await fetchChatCompletionText({
      provider: CONTENT_AI_PROVIDER,
      baseUrl: CONTENT_AI_BASE_URL,
      apiKey: CONTENT_AI_API_KEY,
      payload: primaryPayload,
    });
    return extractJsonPayload(content);
  } catch (primaryError) {
    const fallback = contentAiFallbackConfig();
    if (!fallback) {
      return basicMixedRecordingParse({ job, students, error: primaryError });
    }
    console.warn(`[mixed-recording-parse] ${CONTENT_AI_PROVIDER} failed; trying ${fallback.provider} fallback.`, primaryError.message);
    try {
      const fallbackContent = await fetchChatCompletionText({
        provider: fallback.provider,
        baseUrl: fallback.baseUrl,
        apiKey: fallback.apiKey,
        payload: {
          model: fallback.model,
          temperature: fallback.provider === 'kimi' ? 1 : 0.2,
          messages,
        },
      });
      const parsed = extractJsonPayload(fallbackContent);
      parsed.report = {
        ...(parsed.report || {}),
        ai_fallback: fallback.provider,
        primary_error: primaryError.message,
      };
      return parsed;
    } catch (fallbackError) {
      return basicMixedRecordingParse({
        job,
        students,
        error: new Error(`${primaryError.message}; ${fallback.provider} fallback failed: ${fallbackError.message}`),
      });
    }
  }
}

async function getPromptBundle(outputType) {
  const platform = parseOutputType(outputType);
  const prompt = (await pool.query('SELECT * FROM bna_content_prompts WHERE platform = $1', [platform])).rows[0];
  if (!prompt) throw new Error(`No prompt configured for ${platform}`);
  const examples = (await pool.query(
    `SELECT *
     FROM bna_content_prompt_examples
     WHERE platform = $1 AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 5`,
    [platform]
  )).rows;
  return { prompt, examples };
}

async function generateDraftWithPrompt({ outputType, prompt, examples, jobs, instruction = '' }) {
  if (!CONTENT_AI_API_KEY) {
    throw new Error('No content AI key is configured. Set KIMI_API_KEY or OPENAI_API_KEY.');
  }
  const targetType = parseOutputType(outputType);
  const transcriptBlock = jobs.map((job, index) => [
    `CONTENT ITEM ${index + 1}: ${job.title || `Job ${job.id}`}`,
    '',
    'Structured summary:',
    contentSummaryForPrompt(job),
    '',
    'Transcript:',
    String(job.transcript_text || '').slice(0, 18000),
  ].join('\n')).join('\n\n---\n\n');

  const examplesBlock = examples.length
    ? examples.map((example, index) => [
      `Example ${index + 1}: ${example.title}`,
      String(example.body || '').slice(0, 1500),
    ].join('\n')).join('\n\n')
    : 'No approved examples saved yet.';
  const blogNonRedundancyBlock = targetType === 'blog_draft'
    ? websiteBlogNonRedundancyContext()
    : '';

  const messages = [
    {
      role: 'system',
      content: [
        `You generate ${outputTypeLabel(targetType)} drafts for Bnei Neviim Academy.`,
        'Follow the platform prompt exactly.',
        'Use approved examples as style references, not as facts.',
        'Do not invent details.',
        targetType === 'blog_draft'
          ? 'For website blogs, actively avoid redundant articles by comparing against the existing website article map before drafting.'
          : '',
        'Return only the final draft text.',
      ].filter(Boolean).join(' '),
    },
    {
      role: 'user',
      content: [
        'Platform prompt:',
        prompt.prompt_text,
        '',
        `Prompt version: v${prompt.version}`,
        '',
        'Operator instruction:',
        instruction || '[none]',
        '',
        'Approved examples:',
        examplesBlock,
        '',
        blogNonRedundancyBlock
          ? ['Existing website article map and non-redundancy rules:', blogNonRedundancyBlock, ''].join('\n')
          : '',
        'Content source material:',
        transcriptBlock,
      ].filter((part) => part !== '').join('\n'),
    },
  ];
  const primary = {
    provider: CONTENT_AI_PROVIDER,
    baseUrl: CONTENT_AI_BASE_URL,
    apiKey: CONTENT_AI_API_KEY,
    model: CONTENT_AI_MODEL,
  };
  const requestDraft = async (providerConfig) => fetchChatCompletionText({
    provider: providerConfig.provider,
    baseUrl: providerConfig.baseUrl,
    apiKey: providerConfig.apiKey,
    payload: {
      model: providerConfig.model,
      temperature: providerConfig.provider === 'kimi' ? 1 : 0.35,
      messages,
    },
  });

  try {
    return String(await requestDraft(primary)).trim();
  } catch (primaryError) {
    const fallback = contentAiFallbackConfig();
    if (!fallback) throw primaryError;
    console.warn(`[content-draft] ${primary.provider} failed; trying ${fallback.provider} fallback.`, primaryError.message);
    try {
      return String(await requestDraft(fallback)).trim();
    } catch (fallbackError) {
      throw new Error(`${primary.provider} draft generation failed: ${primaryError.message}; ${fallback.provider} fallback failed: ${fallbackError.message}`);
    }
  }
}

async function saveApprovedOutputAsExample(output) {
  if (!output?.body || !output?.output_type) return null;
  const platform = parseOutputType(output.output_type);
  if (output.id) {
    const existing = (await pool.query(
      'SELECT * FROM bna_content_prompt_examples WHERE source_output_id = $1 LIMIT 1',
      [output.id]
    )).rows[0];
    if (existing) return existing;
  }
  const result = await pool.query(
    `INSERT INTO bna_content_prompt_examples (workspace_id, platform, title, body, source_output_id, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING *`,
    [output.workspace_id || null, platform, output.title || outputTypeLabel(platform), output.body, output.id]
  );
  return result.rows[0];
}

async function findOrCreateGHLContact(email, firstName, lastName, phone, customFields = {}) {
  // Search for existing contact
  const searchRes = await ghlRequest(`/contacts?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`);
  
  let contactId;
  if (searchRes.contacts && searchRes.contacts.length > 0) {
    contactId = searchRes.contacts[0].id;
    // Update existing
    await ghlRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        ...customFields
      })
    });
  } else {
    // Create new
    const createRes = await ghlRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName,
        lastName,
        email,
        phone,
        ...customFields
      })
    });
    contactId = createRes.contact.id;
  }
  
  return contactId;
}

async function addTagToContact(contactId, tag) {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags: [tag] })
  });
}

async function createPaymentIntakeRecord(input = {}, db = pool) {
  let workspaceId = input.workspace_id || input.workspaceId || null;
  if (!workspaceId && input.signup_id) {
    const signup = (await db.query('SELECT workspace_id FROM signups WHERE id = $1 LIMIT 1', [input.signup_id])).rows[0];
    workspaceId = signup?.workspace_id || null;
  }
  if (!workspaceId) {
    workspaceId = (await getDefaultSchoolWorkspace(db)).id;
  }

  const result = await db.query(
    `INSERT INTO bna_payment_intake (
      workspace_id, signup_id, parent_name, parent_email, parent_phone, student_name,
      amount, currency, method, payment_type, green_invoice_id, green_invoice_url,
      ghl_contact_id, status, source, source_context, received_at, notes
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, COALESCE($8, 'ILS'), $9, COALESCE($10, 'registration'), $11, $12,
      $13, COALESCE($14, 'unmatched'), COALESCE($15, 'manual'), $16,
      COALESCE($17::timestamp, NOW()), $18
    ) RETURNING *`,
    [
      workspaceId,
      input.signup_id || null,
      input.parent_name || null,
      input.parent_email || null,
      input.parent_phone || null,
      input.student_name || null,
      input.amount || null,
      input.currency || 'ILS',
      input.method || 'unknown',
      input.payment_type || 'registration',
      input.green_invoice_id || null,
      input.green_invoice_url || null,
      input.ghl_contact_id || null,
      input.status || 'unmatched',
      input.source || 'manual',
      input.source_context ? JSON.stringify(input.source_context) : null,
      input.received_at || null,
      input.notes || null,
    ]
  );

  return result.rows[0];
}

// Telegram notification
async function sendTelegramNotification(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID_BNA) return;
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID_BNA,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      ghl: GHL_PIT_TOKEN ? 'configured' : 'not configured'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/google/oauth/start', (req, res) => {
  try {
    const redirectUri = req.query.redirect_uri || GOOGLE_REDIRECT_URI;
    const oauth2Client = createGoogleOAuthClient(redirectUri);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_SCOPES,
      include_granted_scopes: true,
      state: Buffer.from(JSON.stringify({
        setup: true,
        redirectUri,
        ts: Date.now(),
      })).toString('base64url'),
    });
    res.redirect(url);
  } catch (err) {
    res.status(500).send(`Google OAuth start failed: ${err.message}`);
  }
});

app.get('/api/google/oauth/callback', async (req, res) => {
  const { code, error, state } = req.query;
  if (error) {
    return res.status(400).send(`Google OAuth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Google OAuth callback missing code');
  }

  try {
    let parsedState = {};
    try {
      parsedState = JSON.parse(Buffer.from(String(state || ''), 'base64url').toString('utf8'));
    } catch {}

    const redirectUri = parsedState.redirectUri || GOOGLE_REDIRECT_URI;
    const oauth2Client = createGoogleOAuthClient(redirectUri);
    const { tokens } = await oauth2Client.getToken(String(code));
    oauth2Client.setCredentials(tokens);
    const pipeline = await ensureBnaDrivePipeline(oauth2Client);
    const folderConfig = {
      root: pipeline.root.id,
      websiteMomentsIntake: pipeline.websiteMomentsIntake.id,
      stages: Object.fromEntries(Object.entries(pipeline.folders).map(([name, folder]) => [name, folder.id])),
      sourceOfTruth: {
        transcripts: 'GitHub content-memory/transcripts plus live app database',
        brandKit: 'GitHub brand-kit/',
        platformMemory: 'GitHub content-memory/',
        driveRole: 'operator upload/source-media library only',
        updatedAt: new Date().toISOString(),
      },
      simplifiedFolders: {
        rawIntake: pipeline.folders['01 Raw Intake'].id,
        websiteImages: pipeline.websiteMomentsIntake.id,
        processing: pipeline.folders['02 Ingesting'].id,
        processedRecordings: pipeline.folders['04 Parsed'].id,
        approvedAssets: pipeline.folders['10 Approved'].id,
        failedNeedsReview: pipeline.folders['99 Failed'].id,
        legacyArchive: pipeline.legacy?.id || null,
      },
      workspaces: Object.fromEntries(Object.entries(pipeline.workspaceFolders).map(([workspaceKey, folders]) => [workspaceKey, {
        root: folders.root?.id || null,
        rawIntake: folders.rawIntake?.id || null,
        websiteImages: folders.websiteImages?.id || null,
        processing: folders.processing?.id || null,
        processedRecordings: folders.processedRecordings?.id || null,
        approvedAssets: folders.approvedAssets?.id || null,
        failedNeedsReview: folders.failedNeedsReview?.id || null,
      }])),
      brandKit: pipeline.brandKit.id,
      brandDocs: Object.fromEntries(Object.entries(pipeline.brandDocs).map(([name, file]) => [name, file.id])),
      platformMemory: pipeline.platformMemory.id,
      platformDocs: Object.fromEntries(Object.entries(pipeline.platformDocs).map(([name, file]) => [name, file.id])),
    };
    const secretsDir = path.join(__dirname, '.secrets');
    fs.mkdirSync(secretsDir, { recursive: true });
    const envLines = [
      `GOOGLE_CLIENT_ID=${loadGoogleOAuthClient().clientId}`,
      'GOOGLE_CLIENT_SECRET=<paste from your OAuth client JSON>',
      `GOOGLE_REDIRECT_URI=${redirectUri}`,
      tokens.refresh_token ? `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}` : 'GOOGLE_REFRESH_TOKEN=<no refresh token returned; re-run from /api/google/oauth/start>',
      `GOOGLE_DRIVE_PIPELINE_ROOT_NAME=${GOOGLE_DRIVE_PIPELINE_ROOT_NAME}`,
      `GOOGLE_DRIVE_PIPELINE_FOLDER_ID=${pipeline.root.id}`,
      `GOOGLE_DRIVE_PIPELINE_CONFIG=${JSON.stringify(folderConfig)}`,
      `GOOGLE_SCOPES=${GOOGLE_SCOPES.join(' ')}`,
    ];
    if (tokens.refresh_token) {
      fs.writeFileSync(path.join(secretsDir, 'google-refresh-token.txt'), `${tokens.refresh_token}\n`);
    }
    fs.writeFileSync(path.join(secretsDir, 'google-drive-pipeline.json'), `${JSON.stringify(folderConfig, null, 2)}\n`);
    fs.writeFileSync(path.join(secretsDir, 'railway-google-env.txt'), `${envLines.join('\n')}\n`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html><head><title>BNA Google Connected</title><style>
body{font-family:system-ui,sans-serif;max-width:920px;margin:40px auto;padding:0 20px;line-height:1.5}
pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:18px;border-radius:12px}
.ok{color:#166534;font-weight:700}.warn{color:#9a3412}
</style></head><body>
<h1 class="ok">Google connected for BNA V2</h1>
<p>The Drive pipeline folders were created or confirmed under <strong>${GOOGLE_DRIVE_PIPELINE_ROOT_NAME}</strong>.</p>
<p class="warn">These values include secrets. Paste them into Railway variables, then close this page.</p>
<pre>${envLines.join('\n').replace(/</g, '&lt;')}</pre>
<p>Root folder: <a href="${pipeline.root.webViewLink}" target="_blank" rel="noreferrer">${pipeline.root.webViewLink}</a></p>
</body></html>`);
  } catch (err) {
    res.status(500).send(`Google OAuth callback failed: ${err.message}`);
  }
});

app.post('/api/google/drive/setup', requireAdmin, async (req, res) => {
  try {
    const oauth2Client = createGoogleClientFromRefreshToken();
    const pipeline = await ensureBnaDrivePipeline(oauth2Client);
    res.json({
      success: true,
      root: pipeline.root,
      websiteMomentsIntake: pipeline.websiteMomentsIntake,
      folders: pipeline.folders,
      workspaceFolders: pipeline.workspaceFolders,
      legacy: pipeline.legacy,
      brandKit: pipeline.brandKit,
      brandDocs: pipeline.brandDocs,
      platformMemory: pipeline.platformMemory,
      platformDocs: pipeline.platformDocs,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/email/send', requireAdmin, async (req, res) => {
  const { to, subject, text, html } = req.body || {};
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'to, subject, and text/html are required' });
  }

  try {
    const result = await sendGmailMessage({ to, subject, text, html });
    res.json({ success: true, id: result.data.id });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/email/signup-link', requireAdmin, async (req, res) => {
  const { to, parent_name, lang = 'he' } = req.body || {};
  if (!to) {
    return res.status(400).json({ error: 'to is required' });
  }

  const signupUrl = lang === 'he'
    ? 'https://bneineviimacademy.org/signup-he.html'
    : 'https://bneineviimacademy.org/signup.html';
  const subject = lang === 'he'
    ? 'טופס הרשמה ל-Bnei Neviim Academy'
    : 'Bnei Neviim Academy signup form';
  const greeting = parent_name ? `${parent_name} שלום,` : 'שלום,';
  const text = lang === 'he'
    ? `${greeting}\n\nתודה רבה. כדי שנוכל לשמור את הפרטים בצורה מסודרת במערכת, אנא מלאו את טופס ההרשמה כאן:\n${signupUrl}\n\nאם כבר שילמתם, נעדכן את התשלום אצלנו לאחר קבלת הפרטים.\n\nבברכה,\nמשרד Bnei Neviim Academy`
    : `Hi ${parent_name || ''},\n\nPlease fill out the Bnei Neviim Academy signup form so we can keep your contact and student details properly in our system:\n${signupUrl}\n\nIf you already paid, we will match the payment internally after the form is submitted.\n\nThank you,\nBnei Neviim Academy Office`;

  try {
    const result = await sendGmailMessage({
      to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>'),
    });
    res.json({ success: true, id: result.data.id, signupUrl });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/email-log', requireAdmin, async (req, res) => {
  const { signup_id } = req.query;
  const params = [];
  let whereClause = '';
  if (signup_id) {
    params.push(signup_id);
    whereClause = `WHERE signup_id = $${params.length}`;
  }

  try {
    const result = await pool.query(
      `SELECT * FROM bna_email_log ${whereClause} ORDER BY created_at DESC LIMIT 100`,
      params
    );
    res.json({ emails: result.rows });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/signups/:id/send-confirmation', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM signups WHERE id = $1', [req.params.id]);
    const signup = result.rows[0];
    if (!signup) return res.status(404).json({ error: 'Signup not found' });

    const emailResult = await sendSignupConfirmationEmail(signup);
    res.json({ success: emailResult.ok, email: emailResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getRequestIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.ip || req.socket?.remoteAddress || null;
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\$&');
}

function getRegistrationPackageLanguageBlock(language) {
  const markdown = String(REGISTRATION_PACKAGE_TEXT || '');
  const split = markdown.split(/^#\s+(?:HEBREW VERSION|גרסה עברית)\s*$/m);
  return language === 'he' ? (split[1] || markdown) : (split[0] || markdown);
}

function extractRegistrationPackageDocumentText(language, index) {
  const block = getRegistrationPackageLanguageBlock(language);
  const label = language === 'he' ? `מסמך ${index}:` : `Document ${index}:`;
  const nextLabel = language === 'he' ? `מסמך ${index + 1}:` : `Document ${index + 1}:`;
  const startRegex = new RegExp(`^## ${escapeRegExp(label)}`, 'm');
  const nextRegex = new RegExp(`^## ${escapeRegExp(nextLabel)}`, 'm');
  const startMatch = block.match(startRegex);
  if (!startMatch || typeof startMatch.index !== 'number') {
    return REGISTRATION_PACKAGE_TEXT;
  }
  const start = startMatch.index;
  const rest = block.slice(start + startMatch[0].length);
  const endMatch = rest.match(nextRegex);
  if (!endMatch || typeof endMatch.index !== 'number') return block.slice(start).trim();
  return block.slice(start, start + startMatch[0].length + endMatch.index).trim();
}

function getSignupAgreementSnapshot(definition, language) {
  const normalizedLanguage = normalizeLanguage(language);
  if (definition.agreement_type === 'tuition_agreement') {
    return normalizedLanguage === 'he' ? TUITION_AGREEMENT_TEXT_HE : TUITION_AGREEMENT_TEXT;
  }
  return extractRegistrationPackageDocumentText(normalizedLanguage, definition.package_index);
}

function getSignatureValue(signature, snakeKey, camelKey) {
  if (!signature || typeof signature !== 'object') return undefined;
  return signature[snakeKey] !== undefined ? signature[snakeKey] : signature[camelKey];
}

function buildRequiredSignupAgreementRecords({
  signatures,
  language,
  parentName,
  parentEmail,
}) {
  const normalizedLanguage = normalizeLanguage(language);
  const provided = Array.isArray(signatures) ? signatures : [];
  const byType = new Map();
  for (const signature of provided) {
    const type = String(getSignatureValue(signature, 'agreement_type', 'agreementType') || '').trim();
    if (type && !byType.has(type)) byType.set(type, signature);
  }

  const parentNameTrim = String(parentName || '').trim();
  const parentEmailTrim = String(parentEmail || '').trim();
  const records = [];

  for (const definition of REQUIRED_SIGNUP_AGREEMENT_DEFINITIONS) {
    const signature = byType.get(definition.agreement_type);
    if (!signature || signature.accepted === false || signature.accepted === 'false') {
      return { ok: false, error: `Missing required signature for ${definition.agreement_type}` };
    }

    const signerName = String(getSignatureValue(signature, 'signer_name', 'signerName') || '').trim();
    const signerEmail = String(getSignatureValue(signature, 'signer_email', 'signerEmail') || '').trim();
    const clientSignedAt = getSignatureValue(signature, 'client_signed_at', 'clientSignedAt') || null;
    const agreementVersion = String(getSignatureValue(signature, 'agreement_version', 'agreementVersion') || definition.version).trim() || definition.version;
    const languageViewed = normalizeLanguage(getSignatureValue(signature, 'language_viewed', 'languageViewed') || normalizedLanguage);

    if (!signerName) {
      return { ok: false, error: `Signature for ${definition.agreement_type} requires a parent name` };
    }
    if (!signerEmail) {
      return { ok: false, error: `Signature for ${definition.agreement_type} requires a parent email` };
    }
    if (parentNameTrim && signerName !== parentNameTrim) {
      return { ok: false, error: `Signature for ${definition.agreement_type} must match Parent 1 name on the form` };
    }
    if (parentEmailTrim && signerEmail !== parentEmailTrim) {
      return { ok: false, error: `Signature for ${definition.agreement_type} must match Parent 1 email on the form` };
    }
    if (!clientSignedAt) {
      return { ok: false, error: `Signature for ${definition.agreement_type} requires a client signed timestamp` };
    }

    records.push({
      agreement_type: definition.agreement_type,
      agreement_title: definition.title[languageViewed] || definition.title[normalizedLanguage] || definition.title.en,
      agreement_version: agreementVersion,
      agreement_text: getSignupAgreementSnapshot(definition, languageViewed),
      signer_name: signerName,
      signer_email: signerEmail,
      client_signed_at: clientSignedAt,
      language_viewed: languageViewed,
    });
  }

  return { ok: true, records };
}

// Submit signup
app.post('/api/submit', async (req, res) => {
  const {
    parent_name, parent_email, parent_phone,
    student_name, student_age, student_grade,
    previous_school, reason_applying, special_needs,
    payment_method,
    parent1_name, parent1_email, parent1_phone,
    parent2_name, parent2_email, parent2_phone,
    address, child_name, child_age, current_school, hobbies,
    form_language,
    waiver_accepted,
    waiver_version,
    tuition_agreement_accepted,
    tuition_agreement_version,
    tuition_agreement_signer_name,
    tuition_agreement_signer_email,
    tuition_agreement_client_signed_at,
    registration_package_accepted,
    registration_package_version,
    registration_package_signer_name,
    registration_package_signer_email,
    registration_package_client_signed_at,
    agreement_signatures = []
  } = req.body;

  const normalizedParentName = parent_name || parent1_name;
  const normalizedParentEmail = parent_email || parent1_email;
  const normalizedParentPhone = parent_phone || parent1_phone || '';
  const normalizedStudentName = student_name || child_name;
  const normalizedStudentAge = student_age || child_age || null;
  const normalizedStudentGrade = student_grade || null;
  const normalizedPreviousSchool = previous_school || current_school || '';
  const normalizedReasonApplying = reason_applying || hobbies || '';
  const normalizedSpecialNeeds = special_needs || '';
  const normalizedLanguage = normalizeLanguage(form_language);
  const agreementValidation = buildRequiredSignupAgreementRecords({
    signatures: agreement_signatures,
    language: normalizedLanguage,
    parentName: normalizedParentName,
    parentEmail: normalizedParentEmail,
  });
  const requiredAgreementRecords = agreementValidation.records || [];
  const tuitionAgreementRecord = requiredAgreementRecords.find((record) => record.agreement_type === 'tuition_agreement') || {};
  const safetyAgreementRecord = requiredAgreementRecords.find((record) => record.agreement_type === 'safety_acknowledgment_waiver') || {};
  const normalizedTuitionAgreementVersion = tuitionAgreementRecord.agreement_version || tuition_agreement_version || TUITION_AGREEMENT_VERSION;
  const normalizedTuitionSignerName = String(tuitionAgreementRecord.signer_name || tuition_agreement_signer_name || '').trim();
  const normalizedTuitionSignerEmail = String(tuitionAgreementRecord.signer_email || tuition_agreement_signer_email || '').trim();
  const normalizedTuitionClientSignedAt = tuitionAgreementRecord.client_signed_at || tuition_agreement_client_signed_at || null;
  const normalizedWaiverAccepted = requiredAgreementRecords.some((record) => record.agreement_type === 'safety_acknowledgment_waiver');
  const normalizedWaiverVersion = safetyAgreementRecord.agreement_version || waiver_version || REGISTRATION_PACKAGE_VERSION;
  const rawPaymentMethod = String(payment_method || '').trim().toLowerCase();
  const normalizedPaymentMethod = rawPaymentMethod === 'cash'
    ? 'cash'
    : rawPaymentMethod === 'bank_transfer'
      ? 'bank_transfer'
      : 'green_invoice';
  const paymentDueDate = toDateOnly(addDays(new Date(), DEFAULT_PAYMENT_INTERVAL_DAYS));
  const paymentDisplayLabel = normalizedPaymentMethod === 'cash'
    ? 'Cash'
    : normalizedPaymentMethod === 'bank_transfer'
      ? 'Bank transfer'
      : 'Credit';
  const notes = [
    normalizedLanguage ? `Form Language: ${normalizedLanguage}` : null,
    normalizedWaiverAccepted ? `Safety waiver accepted: ${normalizedWaiverVersion}` : null,
    requiredAgreementRecords.length ? `Signed documents: ${requiredAgreementRecords.map((record) => record.agreement_type).join(', ')}` : null,
    tuitionAgreementRecord.agreement_type ? `Tuition agreement accepted: ${normalizedTuitionAgreementVersion}` : null,
    normalizedTuitionSignerName ? `Tuition agreement signer: ${normalizedTuitionSignerName}` : null,
    address ? `Address: ${address}` : null,
    parent2_name ? `Parent 2 Name: ${parent2_name}` : null,
    parent2_email ? `Parent 2 Email: ${parent2_email}` : null,
    parent2_phone ? `Parent 2 Phone: ${parent2_phone}` : null
  ].filter(Boolean).join('\n');

  if (!normalizedParentName || !normalizedParentEmail || !normalizedParentPhone || !parent2_name || !parent2_phone || !normalizedStudentName) {
    return res.status(400).json({ error: 'Missing required signup details: student name, both parent names, both parent phone numbers, and one parent email are required' });
  }

  if (!agreementValidation.ok) {
    return res.status(400).json({ error: agreementValidation.error || 'All required registration documents must be opened and signed before signup' });
  }

  const dryRunSignup = ['true', '1', 'yes'].includes(String(req.query.dry_run || req.query.dryRun || req.body?.dry_run || req.body?.dryRun || '').toLowerCase());
  if (dryRunSignup) {
    const identity = await identifyAdminRequest(req);
    if (!identity) {
      return res.status(401).json({ error: 'Signup dry run requires an admin session or Basic auth' });
    }
    return res.json({
      success: true,
      dry_run: true,
      validation: 'passed',
      paymentMethod: normalizedPaymentMethod === 'green_invoice' ? 'credit' : normalizedPaymentMethod,
      payment_due_date: paymentDueDate,
      normalized: {
        parent_name: normalizedParentName,
        parent_email: normalizedParentEmail,
        parent_phone_present: Boolean(normalizedParentPhone),
        parent2_name,
        parent2_phone_present: Boolean(parent2_phone),
        student_name: normalizedStudentName,
        form_language: normalizedLanguage,
        waiver_version: normalizedWaiverVersion,
        tuition_agreement_version: normalizedTuitionAgreementVersion,
        tuition_agreement_signer_name: normalizedTuitionSignerName,
        tuition_agreement_signer_email: normalizedTuitionSignerEmail || null,
        agreement_signatures: requiredAgreementRecords.map((record) => ({
          agreement_type: record.agreement_type,
          agreement_version: record.agreement_version,
          language_viewed: record.language_viewed,
        })),
      },
      note: 'Dry run validated the signup payload without writing signup, student, email, Telegram, payment, or GHL records.',
    });
  }

  try {
    const defaultWorkspace = await getDefaultSchoolWorkspace(pool);
    const registrationTags = ['parent', 'bna', normalizedLanguage === 'he' ? 'hebrew_form' : 'english_form', 'registration_2026_2027'];
    const existingSignup = await findExistingSignupForRegistration({
      parentEmail: normalizedParentEmail,
      parentPhone: normalizedParentPhone,
      parentName: normalizedParentName,
      studentName: normalizedStudentName,
    });

    const signupValues = [
      normalizedParentName, normalizedParentEmail, normalizedParentPhone,
      normalizedStudentName, normalizedStudentAge, normalizedStudentGrade,
      normalizedPreviousSchool, normalizedReasonApplying, normalizedSpecialNeeds,
      normalizedPaymentMethod,
      DEFAULT_TUITION_AMOUNT,
      DEFAULT_PAYMENT_INTERVAL_DAYS,
      paymentDueDate,
      normalizedLanguage,
      normalizedWaiverAccepted,
      normalizedWaiverVersion,
      true,
      normalizedTuitionAgreementVersion,
      normalizedTuitionSignerName,
      normalizedTuitionSignerEmail || null,
      normalizedTuitionClientSignedAt,
      registrationTags,
      notes || null,
      defaultWorkspace.id,
    ];

    let result;
    if (existingSignup) {
      result = await pool.query(
        `UPDATE signups
         SET parent_name = $1,
             parent_email = $2,
             parent_phone = $3,
             student_name = $4,
             student_age = $5,
             student_grade = $6,
             previous_school = $7,
             reason_applying = $8,
             special_needs = $9,
             payment_method = $10,
             payment_amount = COALESCE(payment_amount, $11),
             payment_interval_days = COALESCE(payment_interval_days, $12),
             payment_due_date = COALESCE(payment_due_date, $13),
             form_language = $14,
             waiver_accepted = $15,
             waiver_accepted_at = NOW(),
             waiver_version = $16,
             tuition_agreement_accepted = $17,
             tuition_agreement_accepted_at = NOW(),
             tuition_agreement_version = $18,
             tuition_agreement_signer_name = $19,
             tuition_agreement_signer_email = $20,
             tuition_agreement_client_signed_at = $21,
             tags = (
               SELECT ARRAY(
                 SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || $22::text[])
               )
              ),
              notes = trim(BOTH FROM concat_ws(E'\n\n', notes, $23)),
              workspace_id = COALESCE(workspace_id, $24),
              updated_at = NOW()
         WHERE id = $25
          RETURNING *`,
        [...signupValues, existingSignup.id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO signups (
          parent_name, parent_email, parent_phone,
          student_name, student_age, student_grade,
          previous_school, reason_applying, special_needs,
          payment_method, payment_amount, payment_interval_days, payment_due_date,
          form_language, waiver_accepted, waiver_accepted_at, waiver_version,
           tuition_agreement_accepted, tuition_agreement_accepted_at, tuition_agreement_version,
           tuition_agreement_signer_name, tuition_agreement_signer_email, tuition_agreement_client_signed_at,
           tags, notes, workspace_id
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           $10, $11, $12, $13, $14, $15, NOW(), $16,
           $17, NOW(), $18, $19, $20, $21, $22, $23, $24
         ) RETURNING *`,
        signupValues
      );
    }

    let signup = result.rows[0];
    for (const agreement of requiredAgreementRecords) {
      await pool.query(
        `INSERT INTO bna_signup_agreement_signatures (
           workspace_id, signup_id, agreement_type, agreement_title, agreement_version,
           agreement_text, signer_name, signer_email, client_signed_at,
           ip_address, user_agent, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
          ON CONFLICT (signup_id, agreement_type, agreement_version) DO UPDATE SET
            workspace_id = COALESCE(EXCLUDED.workspace_id, bna_signup_agreement_signatures.workspace_id),
            agreement_title = EXCLUDED.agreement_title,
           agreement_text = EXCLUDED.agreement_text,
           signer_name = EXCLUDED.signer_name,
           signer_email = EXCLUDED.signer_email,
           client_signed_at = EXCLUDED.client_signed_at,
           ip_address = EXCLUDED.ip_address,
           user_agent = EXCLUDED.user_agent,
           metadata = EXCLUDED.metadata`,
        [
          signup.workspace_id || null,
          signup.id,
          agreement.agreement_type,
          agreement.agreement_title,
          agreement.agreement_version,
          agreement.agreement_text,
          agreement.signer_name,
          agreement.signer_email || null,
          agreement.client_signed_at,
          getRequestIp(req),
          req.get('user-agent') || null,
          JSON.stringify({
            form_language: normalizedLanguage,
            language_viewed: agreement.language_viewed,
            source: 'public_signup',
            document_source_file: agreement.agreement_type === 'tuition_agreement'
              ? null
              : '/documents/bnei_neviim_registration_documents_bilingual_codex.md',
            electronic_signature_notice: 'Clicking the signature button is the parent electronic signature for this document.',
          }),
        ]
      );
    }
    await upsertStudentFromSignup(signup);
    const matchedPaymentIntake = await reconcilePaymentIntakeForSignup(signup);
    if (matchedPaymentIntake) {
      const refreshed = await pool.query('SELECT * FROM signups WHERE id = $1', [signup.id]);
      signup = refreshed.rows[0] || signup;
    }
    
    // Notify via Telegram
    await sendTelegramNotification(
      `🎉 <b>New Signup!</b>\n\n` +
      `Parent: ${normalizedParentName}\n` +
      `Student: ${normalizedStudentName}\n` +
      `Payment: ${matchedPaymentIntake ? `Matched prior ${matchedPaymentIntake.method} payment` : paymentDisplayLabel}`
    );
    
    // Sync to GHL if configured
    if (GHL_PIT_TOKEN) {
      try {
        const [parentFirst, ...parentLast] = normalizedParentName.split(' ');
        const parentId = await findOrCreateGHLContact(
          normalizedParentEmail,
          parentFirst,
          parentLast.join(' ') || '',
          normalizedParentPhone,
          { tags: ['BNA Parent'] }
        );
        await addTagToContact(parentId, 'BNA Parent');
        
        const [studentFirst, ...studentLast] = normalizedStudentName.split(' ');
        const studentId = await findOrCreateGHLContact(
          `${studentFirst.toLowerCase()}@bna.student`,
          studentFirst,
          studentLast.join(' ') || '',
          '',
          { tags: ['BNA Student'] }
        );
        await addTagToContact(studentId, 'BNA Student');
        
        await pool.query(
          'UPDATE signups SET ghl_parent_contact_id = $1, ghl_student_contact_id = $2, ghl_synced_at = NOW() WHERE id = $3',
          [parentId, studentId, signup.id]
        );
        await pool.query(
          'UPDATE bna_students SET ghl_contact_id = $1, updated_at = NOW() WHERE signup_id = $2',
          [studentId, signup.id]
        );
      } catch (ghlErr) {
        console.error('GHL sync error:', ghlErr);
        await pool.query(
          'UPDATE signups SET ghl_sync_error = $1 WHERE id = $2',
          [ghlErr.message, signup.id]
        );
      }
    }

    const emailResult = await sendSignupConfirmationEmail(signup, { matchedPayment: matchedPaymentIntake });
    if (!emailResult.ok) {
      console.error('Signup confirmation email error:', emailResult.error);
    }
    
    // Return payment link for credit payments unless we matched a prior payment intake record.
    if (matchedPaymentIntake) {
      res.json({ success: true, signupId: signup.id, paymentMethod: normalizedPaymentMethod === 'green_invoice' ? 'credit' : normalizedPaymentMethod, matchedPaymentIntakeId: matchedPaymentIntake.id, confirmationEmailSent: emailResult.ok });
    } else if (normalizedPaymentMethod === 'green_invoice') {
      res.json({ 
        success: true, 
        signupId: signup.id,
        paymentMethod: 'credit',
        paymentLink: PAYMENT_LINK,
        confirmationEmailSent: emailResult.ok
      });
    } else if (normalizedPaymentMethod === 'bank_transfer') {
      res.json({ success: true, signupId: signup.id, paymentMethod: 'bank_transfer', confirmationEmailSent: emailResult.ok });
    } else {
      res.json({ success: true, signupId: signup.id, paymentMethod: 'cash', confirmationEmailSent: emailResult.ok });
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to save signup' });
  }
});

// Admin: Get signups
app.get('/api/signups', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM signups ORDER BY created_at DESC'
    );
    res.json({ signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get pending payments
app.get('/api/pending-payments', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM signups WHERE payment_status != 'paid' ORDER BY created_at DESC"
    );
    res.json({ signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Log payment
app.post('/api/payment-complete', requireAdmin, async (req, res) => {
  const { signup_id, amount, method, notes } = req.body;
  
  try {
    // Create payment log
    await pool.query(
      `INSERT INTO bna_payment_log (workspace_id, signup_id, payment_type, amount, method, status, received_by, received_at, notes)
       SELECT workspace_id, id, 'registration', $2, $3, 'completed', 'admin', NOW(), $4
       FROM signups
       WHERE id = $1`,
      [signup_id, amount, method, notes]
    );
    
    // Update signup
    await pool.query(
      `UPDATE signups
       SET payment_status = 'paid',
           payment_amount = $1,
           last_payment_at = NOW(),
           payment_due_date = (NOW()::date + COALESCE(payment_interval_days, $3) * INTERVAL '1 day')::date,
           payment_reminder_sent_at = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [amount, signup_id, DEFAULT_PAYMENT_INTERVAL_DAYS]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BNA dashboard: signups
app.get('/api/bna/signups', requireAdmin, async (req, res) => {
  const { status, payment_status, project } = req.query;
  const conditions = [];
  const params = [];
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = normalizeProjectKey(project);
  const projectKey = scopedProjectKey || requestedProjectKey;

  if (status) {
    params.push(status);
    conditions.push(`s.status = $${params.length}`);
  }

  if (payment_status) {
    params.push(payment_status);
    conditions.push(`s.payment_status = $${params.length}`);
  }

  if (scopedProjectKey && requestedProjectKey && requestedProjectKey !== scopedProjectKey) {
    return res.status(403).json({ error: 'This login can only access its scoped workspace community.' });
  }

  if (projectKey) {
    params.push(projectKey);
    conditions.push(`COALESCE(p.project_key, w.workspace_key, '') = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT s.*,
              p.project_key,
              p.name AS project_name,
              p.short_name AS project_short_name,
              w.workspace_key,
              w.workspace_type,
              w.name AS workspace_name
       FROM signups s
       LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
       LEFT JOIN LATERAL (
         SELECT project_key, name, short_name
         FROM bna_projects p
         WHERE p.workspace_id = s.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) p ON TRUE
       ${whereClause}
       ORDER BY s.created_at DESC`,
      params
    );
    res.json({ signups: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bna/signups/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    'parent_name',
    'parent_email',
    'parent_phone',
    'student_name',
    'student_age',
    'student_grade',
    'previous_school',
    'reason_applying',
    'special_needs',
    'payment_method',
    'payment_status',
    'payment_amount',
    'cash_notes',
    'status',
    'notes',
  ];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.includes(key)) continue;
    values.push(value);
    fields.push(`${key} = $${values.length}`);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No valid signup fields provided' });
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE signups SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    res.json({ success: true, signup: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BNA dashboard: students and accountability
app.get('/api/bna/students', requireAdmin, async (req, res) => {
  const projectKey = studentProjectKeyFromRequest(req);
  const params = [];
  const conditions = ["COALESCE(s.status, 'active') NOT IN ('archived', 'inactive')"];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    await ensureStudentsFromSignups();
    const result = await pool.query(
      `SELECT s.*,
        proj.project_key,
        proj.name AS project_name,
        proj.short_name AS project_short_name,
        w.workspace_key,
        w.workspace_type,
        w.name AS workspace_name,
        COALESCE(goal_counts.open_goals, 0) AS open_goals,
        COALESCE(question_counts.questions, 0) AS questions,
        COALESCE(progress_counts.avg_progress, 0) AS avg_goal_progress,
        COALESCE(device_counts.device_count, 0) AS device_count,
        latest_device.status AS device_status,
        latest_device.device_name AS latest_device_name,
        next_check.next_check_in_date
       FROM bna_students s
       LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key, p.name, p.short_name
         FROM bna_projects p
         WHERE p.workspace_id = s.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       LEFT JOIN (
         SELECT student_id, COUNT(*) AS open_goals
         FROM bna_accountability_events
         WHERE event_type = 'student_goal'
         GROUP BY student_id
       ) goal_counts ON goal_counts.student_id = s.id
       LEFT JOIN (
         SELECT student_id, ROUND(AVG(progress_percent))::int AS avg_progress
         FROM bna_accountability_events
         WHERE progress_percent IS NOT NULL
         GROUP BY student_id
       ) progress_counts ON progress_counts.student_id = s.id
       LEFT JOIN (
         SELECT student_id, MIN(next_check_in_date) AS next_check_in_date
         FROM bna_accountability_events
         WHERE next_check_in_date IS NOT NULL AND next_check_in_date >= CURRENT_DATE
         GROUP BY student_id
       ) next_check ON next_check.student_id = s.id
       LEFT JOIN (
         SELECT student_id, COUNT(*) AS questions
         FROM bna_accountability_events
         WHERE event_type = 'question'
         GROUP BY student_id
       ) question_counts ON question_counts.student_id = s.id
       LEFT JOIN (
         SELECT student_id, COUNT(*) AS device_count
         FROM bna_devices
         GROUP BY student_id
       ) device_counts ON device_counts.student_id = s.id
       LEFT JOIN LATERAL (
         SELECT device_name, status
         FROM bna_devices d
         WHERE d.student_id = s.id
         ORDER BY d.updated_at DESC, d.id DESC
         LIMIT 1
       ) latest_device ON TRUE
       ${whereClause}
       ORDER BY s.name ASC`,
      params
    );
    res.json({ students: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/students', requireAdmin, async (req, res) => {
  const {
    name,
    parent_name,
    parent_email,
    parent_phone,
    age,
    grade,
    current_school,
    notes,
    tags = [],
    status = 'active',
  } = req.body || {};

  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const project = await resolveStudentProjectForWrite(req, req.body || {});
    const workspaceId = project.workspace_id || (await getDefaultSchoolWorkspace(pool)).id;
    const existing = (await pool.query(
      `SELECT *
       FROM bna_students
       WHERE workspace_id IS NOT DISTINCT FROM $2
         AND (
           lower(name) = lower($1)
           OR lower(regexp_replace(name, '[^a-zA-Z0-9?-?]+', ' ', 'g')) = lower(regexp_replace($1, '[^a-zA-Z0-9?-?]+', ' ', 'g'))
         )
       ORDER BY status = 'active' DESC, created_at DESC
       LIMIT 1`,
      [name, workspaceId]
    )).rows[0];

    const result = existing
      ? await pool.query(
        `UPDATE bna_students
         SET parent_name = COALESCE($1, parent_name),
             parent_email = COALESCE($2, parent_email),
             parent_phone = COALESCE($3, parent_phone),
             age = COALESCE($4, age),
             grade = COALESCE($5, grade),
             current_school = COALESCE($6, current_school),
             notes = COALESCE($7, notes),
             tags = CASE WHEN cardinality($8::text[]) > 0 THEN $8::text[] ELSE tags END,
             status = $9,
             updated_at = NOW()
         WHERE id = $10
           AND workspace_id IS NOT DISTINCT FROM $11
         RETURNING *`,
        [parent_name || null, parent_email || null, parent_phone || null, age || null, grade || null, current_school || null, notes || null, tags, status, existing.id, workspaceId]
      )
      : await pool.query(
        `INSERT INTO bna_students (workspace_id, name, parent_name, parent_email, parent_phone, age, grade, current_school, notes, tags, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [workspaceId, name, parent_name || null, parent_email || null, parent_phone || null, age || null, grade || null, current_school || null, notes || null, tags, status]
      );

    res.json({ success: true, student: result.rows[0], merged_existing: Boolean(existing), project: project.project_key });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/students/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowedFields = ['name', 'parent_name', 'parent_email', 'parent_phone', 'age', 'grade', 'current_school', 'notes', 'tags', 'status'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, field)) continue;
    values.push(field === 'tags' ? req.body[field] || [] : req.body[field]);
    updates.push(`${field} = $${values.length}`);
  }

  if (!updates.length) return res.status(400).json({ error: 'No supported fields to update' });

  try {
    const student = await assertStudentAccess(req, id, studentProjectKeyFromRequest(req, req.body || {}));
    values.push(id);
    values.push(student.workspace_id || null);
    const result = await pool.query(
      `UPDATE bna_students
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length - 1}
         AND workspace_id IS NOT DISTINCT FROM $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(scopedStudentNotFoundStatus(req)).json({ error: 'Student not found in selected workspace' });
    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/students/:id/access-code', requireAdmin, async (req, res) => {
  try {
    await assertStudentAccess(req, req.params.id, studentProjectKeyFromRequest(req, req.body || {}));
    const code = await ensureStudentAccessCode(
      req.params.id,
      { regenerate: Boolean((req.body || {}).regenerate) }
    );
    res.json({
      success: true,
      access_code: code,
      url: studentPortalUrl(req, code),
    });
  } catch (err) {
    res.status(err.statusCode || (/not found/i.test(err.message) ? 404 : 500)).json({ error: err.message });
  }
});

app.get('/api/bna/devices', requireAdmin, async (req, res) => {
  const conditions = [];
  const params = [];
  const projectKey = studentProjectKeyFromRequest(req);
  if (req.query.student_id) {
    params.push(req.query.student_id);
    conditions.push(`d.student_id = $${params.length}`);
  }
  if (req.query.status) {
    params.push(normalizeDeviceAccessState(req.query.status));
    conditions.push(`d.status = $${params.length}`);
  }
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    await expireDeviceAccessSessions();
    const result = await pool.query(
      `SELECT d.*,
              row_to_json(s.*) AS student,
              row_to_json(active_session.*) AS active_session,
              row_to_json(latest_session.*) AS latest_session
       FROM bna_devices d
       LEFT JOIN bna_students s ON s.id = d.student_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(d.workspace_id, s.workspace_id)
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = COALESCE(d.workspace_id, s.workspace_id)
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       LEFT JOIN LATERAL (
         SELECT *
         FROM bna_device_access_sessions das
         WHERE das.device_id = d.id
           AND das.ended_at IS NULL
         ORDER BY das.created_at DESC, das.id DESC
         LIMIT 1
       ) active_session ON TRUE
       LEFT JOIN LATERAL (
         SELECT *
         FROM bna_device_access_sessions das
         WHERE das.device_id = d.id
         ORDER BY das.created_at DESC, das.id DESC
         LIMIT 1
       ) latest_session ON TRUE
       ${whereClause}
       ORDER BY s.name ASC NULLS LAST, d.device_name ASC, d.id ASC`,
      params
    );
    res.json({
      provider_mode: 'mock',
      real_device_calls_enabled: false,
      project: projectKey || 'all',
      devices: result.rows.map(deviceRecordView),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/students/:id/devices', requireAdmin, async (req, res) => {
  const deviceName = String((req.body || {}).device_name || (req.body || {}).name || '').trim();
  const provider = String((req.body || {}).provider || 'mock').trim().toLowerCase();
  if (!deviceName) return res.status(400).json({ error: 'device_name is required' });
  if (provider !== 'mock') {
    return res.status(400).json({ error: 'Only the mock device provider is enabled until real hardware/admin credentials are confirmed.' });
  }

  try {
    const student = await assertStudentAccess(req, req.params.id, studentProjectKeyFromRequest(req, req.body || {}));
    if (['inactive', 'archived'].includes(String(student.status || '').toLowerCase())) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const status = normalizeDeviceAccessState((req.body || {}).status || DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY);
    const result = await pool.query(
      `INSERT INTO bna_devices (
         workspace_id, student_id, device_name, platform, provider, provider_device_id, status, notes, metadata
       ) VALUES (
         $1, $2, $3, $4, 'mock', $5, $6, $7, $8
       )
       RETURNING *`,
      [
        student.workspace_id || null,
        student.id,
        deviceName,
        safeDevicePlatform((req.body || {}).platform),
        (req.body || {}).provider_device_id || null,
        status,
        (req.body || {}).notes || null,
        JSON.stringify((req.body || {}).metadata || {}),
      ]
    );
    const actionResult = await applyDeviceAccessAction({
      deviceId: result.rows[0].id,
      status,
      reason: 'Initial mock device registration',
      approvedBy: req.opsUser || 'admin',
    });
    res.json({ success: true, device: actionResult.device, session: actionResult.session });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/devices/:id', requireAdmin, async (req, res) => {
  const allowedFields = new Set(['device_name', 'platform', 'provider_device_id', 'notes', 'metadata']);
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.has(key)) continue;
    values.push(key === 'platform' ? safeDevicePlatform(value) : key === 'metadata' ? JSON.stringify(value || {}) : value);
    fields.push(`${key} = $${values.length}`);
  }

  if (!fields.length) return res.status(400).json({ error: 'No supported device fields supplied' });
  values.push(req.params.id);

  try {
    const device = await assertDeviceAccess(req, req.params.id, studentProjectKeyFromRequest(req, req.body || {}));
    const result = await pool.query(
      `UPDATE bna_devices
       SET ${fields.join(', ')},
           updated_at = NOW()
       WHERE id = $${values.length}
         AND workspace_id IS NOT DISTINCT FROM $${values.length + 1}
       RETURNING *`,
      [...values, device.workspace_id || null]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Device not found' });
    res.json({ success: true, device: await getDeviceRecord(result.rows[0].id) });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/devices/:id/actions', requireAdmin, async (req, res) => {
  const action = String((req.body || {}).action || '').trim().toLowerCase();
  const requestedStatus = (req.body || {}).status;
  const status = requestedStatus
    ? normalizeDeviceAccessState(requestedStatus)
    : ({
        lock: DEVICE_ACCESS_STATES.LOCKED,
        locked: DEVICE_ACCESS_STATES.LOCKED,
        accountability_only: DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY,
        set_accountability_only: DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY,
        approve_access: DEVICE_ACCESS_STATES.APPROVED_ACCESS,
        approved_access: DEVICE_ACCESS_STATES.APPROVED_ACCESS,
        unlock: DEVICE_ACCESS_STATES.APPROVED_ACCESS,
        expire: DEVICE_ACCESS_STATES.EXPIRED,
        expired: DEVICE_ACCESS_STATES.EXPIRED,
        manual_override: DEVICE_ACCESS_STATES.MANUAL_OVERRIDE,
      })[action || ''];
  if (!status) return res.status(400).json({ error: 'Unsupported device action' });

  try {
    await assertDeviceAccess(req, req.params.id, studentProjectKeyFromRequest(req, req.body || {}));
    const result = await applyDeviceAccessAction({
      deviceId: req.params.id,
      status,
      durationMinutes: (req.body || {}).duration_minutes,
      reason: (req.body || {}).reason || action || status,
      goalId: (req.body || {}).goal_id || null,
      ruleId: (req.body || {}).rule_id || null,
      approvedBy: req.opsUser || 'admin',
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/device-access-rules', requireAdmin, async (req, res) => {
  const conditions = [];
  const params = [];
  const projectKey = studentProjectKeyFromRequest(req);
  if (req.query.student_id) {
    params.push(req.query.student_id);
    conditions.push(`r.student_id = $${params.length}`);
  }
  if (req.query.device_id) {
    params.push(req.query.device_id);
    conditions.push(`r.device_id = $${params.length}`);
  }
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT r.*, row_to_json(s.*) AS student, row_to_json(d.*) AS device
       FROM bna_device_access_rules r
       LEFT JOIN bna_students s ON s.id = r.student_id
       LEFT JOIN bna_devices d ON d.id = r.device_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(r.workspace_id, s.workspace_id, d.workspace_id)
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = COALESCE(r.workspace_id, s.workspace_id, d.workspace_id)
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       ${whereClause}
       ORDER BY r.enabled DESC, r.created_at DESC`,
      params
    );
    res.json({ rules: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/device-access-rules', requireAdmin, async (req, res) => {
  const duration = normalizeDurationMinutes((req.body || {}).duration_minutes);
  const ruleType = ['goal_approval', 'schedule', 'manual'].includes((req.body || {}).rule_type)
    ? (req.body || {}).rule_type
    : 'goal_approval';

  try {
    const project = await resolveStudentProjectForWrite(req, req.body || {});
    const student = (req.body || {}).student_id
      ? await assertStudentAccess(req, (req.body || {}).student_id, project.project_key)
      : null;
    const device = (req.body || {}).device_id
      ? await assertDeviceAccess(req, (req.body || {}).device_id, project.project_key)
      : null;
    const requiredGoal = (req.body || {}).required_goal_id
      ? await assertAccountabilityEventAccess(req, (req.body || {}).required_goal_id, project.project_key)
      : null;
    const workspaceId = student?.workspace_id || device?.workspace_id || requiredGoal?.workspace_id || project.workspace_id;
    const result = await pool.query(
      `INSERT INTO bna_device_access_rules (
         workspace_id, student_id, device_id, rule_type, required_goal_id, duration_minutes, schedule, enabled, notes
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, COALESCE($8::boolean, TRUE), $9
       )
       RETURNING *`,
      [
        workspaceId || null,
        (req.body || {}).student_id || null,
        (req.body || {}).device_id || null,
        ruleType,
        (req.body || {}).required_goal_id || null,
        duration,
        JSON.stringify((req.body || {}).schedule || {}),
        Object.prototype.hasOwnProperty.call(req.body || {}, 'enabled') ? Boolean((req.body || {}).enabled) : null,
        (req.body || {}).notes || null,
      ]
    );
    res.json({ success: true, rule: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/device-access-rules/:id', requireAdmin, async (req, res) => {
  const allowedFields = new Set(['student_id', 'device_id', 'rule_type', 'required_goal_id', 'duration_minutes', 'schedule', 'enabled', 'notes']);
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.has(key)) continue;
    const nextValue = key === 'duration_minutes'
      ? normalizeDurationMinutes(value)
      : key === 'schedule' ? JSON.stringify(value || {}) : value;
    values.push(nextValue);
    fields.push(`${key} = $${values.length}`);
  }
  if (!fields.length) return res.status(400).json({ error: 'No supported rule fields supplied' });
  try {
    const projectKey = studentProjectKeyFromRequest(req, req.body || {});
    const current = await (async () => {
      const params = [req.params.id];
      const conditions = ['r.id = $1'];
      addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
      const result = await pool.query(
        `SELECT r.*
         FROM bna_device_access_rules r
         LEFT JOIN bna_students s ON s.id = r.student_id
         LEFT JOIN bna_devices d ON d.id = r.device_id
         LEFT JOIN bna_workspaces w ON w.id = COALESCE(r.workspace_id, s.workspace_id, d.workspace_id)
         LEFT JOIN LATERAL (
           SELECT p.project_key
           FROM bna_projects p
           WHERE p.workspace_id = COALESCE(r.workspace_id, s.workspace_id, d.workspace_id)
           ORDER BY p.id ASC
           LIMIT 1
         ) proj ON TRUE
         WHERE ${conditions.join(' AND ')}
         LIMIT 1`,
        params
      );
      return result.rows[0] || null;
    })();
    if (!current) return res.status(scopedStudentNotFoundStatus(req)).json({ error: 'Device access rule not found in selected workspace' });
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'student_id') && (req.body || {}).student_id) {
      await assertStudentAccess(req, (req.body || {}).student_id, projectKey);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'device_id') && (req.body || {}).device_id) {
      await assertDeviceAccess(req, (req.body || {}).device_id, projectKey);
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'required_goal_id') && (req.body || {}).required_goal_id) {
      await assertAccountabilityEventAccess(req, (req.body || {}).required_goal_id, projectKey);
    }
    values.push(req.params.id);
    values.push(current.workspace_id || null);
    const result = await pool.query(
      `UPDATE bna_device_access_rules
       SET ${fields.join(', ')},
           updated_at = NOW()
       WHERE id = $${values.length - 1}
         AND workspace_id IS NOT DISTINCT FROM $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(scopedStudentNotFoundStatus(req)).json({ error: 'Device access rule not found in selected workspace' });
    res.json({ success: true, rule: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/device-access/reviews/:goalId/actions', requireAdmin, async (req, res) => {
  const action = String((req.body || {}).action || '').trim().toLowerCase();
  if (!['approve', 'deny', 'manual_override'].includes(action)) {
    return res.status(400).json({ error: 'Unsupported review action' });
  }

  try {
    const current = await assertAccountabilityEventAccess(req, req.params.goalId, studentProjectKeyFromRequest(req, req.body || {}));
    if (!current) return res.status(404).json({ error: 'Goal Board review item not found' });
    const goalBoard = normalizeGoalBoardMetadata(rawGoalBoardMetadata(current.metadata), {
      category: current.topic || '',
    });
    const requestedStateRaw = goalBoard.consequence.device_access_state;
    const requestedState = requestedStateRaw ? normalizeDeviceAccessState(requestedStateRaw) : '';
    const approvedAt = new Date().toISOString();
    let metadata = current.metadata;
    let deviceResult = null;

    if (action === 'deny') {
      metadata = goalBoardMetadataFromPayload({
        consequence_status: 'denied',
        approval_status: 'denied',
        status: 'active',
        goal_board: {
          consequence: {
            approved_by: req.opsUser || 'admin',
            approved_at: approvedAt,
          },
        },
      }, metadata);
    } else {
      metadata = goalBoardMetadataFromPayload({
        consequence_status: action === 'manual_override' ? 'overridden' : 'approved',
        approval_status: 'approved',
        status: 'active',
        goal_board: {
          consequence: {
            approved_by: req.opsUser || 'admin',
            approved_at: approvedAt,
          },
        },
      }, metadata);

      const deviceId = (req.body || {}).device_id;
      if (!deviceId) return res.status(400).json({ error: 'device_id is required before applying a mock device action' });
      await assertDeviceAccess(req, deviceId, studentProjectKeyFromRequest(req, req.body || {}));
      const status = action === 'manual_override'
        ? DEVICE_ACCESS_STATES.MANUAL_OVERRIDE
        : (requestedState || DEVICE_ACCESS_STATES.APPROVED_ACCESS);
      deviceResult = await applyDeviceAccessAction({
        deviceId,
        status,
        durationMinutes: (req.body || {}).duration_minutes || goalBoard.consequence.duration_minutes || 60,
        reason: (req.body || {}).reason || goalBoard.consequence.review_reason || current.title,
        goalId: current.id,
        approvedBy: req.opsUser || 'admin',
      });
    }

    const updated = await pool.query(
      `UPDATE bna_accountability_events
       SET metadata = $2,
           updated_at = NOW()
       WHERE id = $1
         AND event_type = 'student_goal'
       RETURNING *`,
      [current.id, JSON.stringify(metadata)]
    );

    res.json({
      success: true,
      item: goalBoardAdminView(updated.rows[0]),
      device: deviceResult?.device || null,
      session: deviceResult?.session || null,
      provider_result: deviceResult?.provider_result || null,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/students/:id/goal-board', requireAdmin, async (req, res) => {
  try {
    const student = await assertStudentAccess(req, req.params.id, studentProjectKeyFromRequest(req));
    if (['inactive', 'archived'].includes(String(student.status || '').toLowerCase())) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const result = await pool.query(
      `SELECT a.*, row_to_json(s.*) AS student
       FROM bna_accountability_events a
       LEFT JOIN bna_students s ON s.id = a.student_id
       WHERE a.student_id = $1
         AND a.event_type = 'student_goal'
       ORDER BY COALESCE(NULLIF(a.metadata->'goal_board'->>'due_at', '')::timestamp, a.occurred_at) ASC,
                a.id DESC`,
      [req.params.id]
    );
    res.json({ student, items: result.rows.map(goalBoardAdminView), project: student.project_key || student.workspace_key || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/students/:id/goal-board', requireAdmin, async (req, res) => {
  const title = String((req.body || {}).title || '').trim();
  if (!title) return res.status(400).json({ error: 'Goal title is required' });

  try {
    const student = await assertStudentAccess(req, req.params.id, studentProjectKeyFromRequest(req, req.body || {}));
    if (['inactive', 'archived'].includes(String(student.status || '').toLowerCase())) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const metadata = goalBoardMetadataFromPayload({
      ...(req.body || {}),
      source: (req.body || {}).source || 'admin',
      student_owned: (req.body || {}).source === 'self',
      approval_status: (req.body || {}).approval_required ? 'pending_review' : 'approved',
      status: (req.body || {}).approval_required ? 'waiting' : ((req.body || {}).status || 'active'),
    });
    const goalBoard = normalizeGoalBoardMetadata(rawGoalBoardMetadata(metadata));
    const targetValue = (req.body || {}).target_value || (req.body || {}).goal_target_value || null;
    const targetUnit = (req.body || {}).target_unit || (req.body || {}).goal_unit || null;
    const requestedProgress = (req.body || {}).progress_percent !== undefined && (req.body || {}).progress_percent !== null && (req.body || {}).progress_percent !== ''
      ? Number((req.body || {}).progress_percent)
      : 0;
    if (!Number.isFinite(requestedProgress)) return res.status(400).json({ error: 'progress_percent must be a number' });
    const progressPercent = Math.max(0, Math.min(100, requestedProgress));

    const result = await pool.query(
      `INSERT INTO bna_accountability_events (
        workspace_id, event_type, student_id, student_name, title, notes, topic,
        goal_target_value, goal_actual_value, goal_unit, progress_percent,
        follow_up_required, metadata, source, occurred_at
      ) VALUES (
        $1, 'student_goal', $2, $3, $4, $5, $6,
        $7, NULL, $8, $9,
        $10, $11, 'manual', NOW()
      )
      RETURNING *`,
      [
        student.workspace_id || null,
        student.id,
        student.name,
        title,
        (req.body || {}).private_note || (req.body || {}).notes || null,
        goalBoard.category || null,
        targetValue,
        targetUnit,
        progressPercent,
        progressPercent < 100,
        JSON.stringify(metadata),
      ]
    );
    res.json({ success: true, item: goalBoardAdminView(result.rows[0]) });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/goal-board/:id', requireAdmin, async (req, res) => {
  try {
    const current = await assertAccountabilityEventAccess(req, req.params.id, studentProjectKeyFromRequest(req, req.body || {}));
    if (!current) return res.status(404).json({ error: 'Goal Board item not found' });
    if (current.event_type !== 'student_goal') return res.status(404).json({ error: 'Goal Board item not found' });

    let metadata = goalBoardMetadataFromPayload(req.body || {}, current.metadata);
    if ((req.body || {}).action === 'approve_consequence') {
      metadata = goalBoardMetadataFromPayload({
        consequence_status: 'approved',
        approval_status: 'approved',
        status: 'active',
        goal_board: {
          consequence: {
            approved_by: req.opsUser || 'admin',
            approved_at: new Date().toISOString(),
          },
        },
      }, metadata);
    } else if ((req.body || {}).action === 'deny_consequence') {
      metadata = goalBoardMetadataFromPayload({
        consequence_status: 'denied',
        approval_status: 'denied',
        status: 'active',
      }, metadata);
    } else if ((req.body || {}).action === 'override_consequence') {
      metadata = goalBoardMetadataFromPayload({
        consequence_status: 'overridden',
        status: 'active',
      }, metadata);
    }

    const goalBoard = normalizeGoalBoardMetadata(rawGoalBoardMetadata(metadata));
    const hasProgressUpdate = Object.prototype.hasOwnProperty.call(req.body || {}, 'progress_percent');
    const requestedProgress = Number((req.body || {}).progress_percent);
    if (hasProgressUpdate && !Number.isFinite(requestedProgress)) {
      return res.status(400).json({ error: 'progress_percent must be a number' });
    }
    const progressPercent = hasProgressUpdate
      ? Math.max(0, Math.min(100, requestedProgress))
      : current.progress_percent;
    if (hasProgressUpdate) {
      metadata = metadataAfterProgressUpdate({ ...current, metadata }, progressPercent);
    }
    const title = Object.prototype.hasOwnProperty.call(req.body || {}, 'title') ? (req.body || {}).title : current.title;
    const notes = Object.prototype.hasOwnProperty.call(req.body || {}, 'private_note')
      ? (req.body || {}).private_note
      : Object.prototype.hasOwnProperty.call(req.body || {}, 'notes') ? (req.body || {}).notes : current.notes;
    const targetValue = Object.prototype.hasOwnProperty.call(req.body || {}, 'target_value')
      ? (req.body || {}).target_value
      : Object.prototype.hasOwnProperty.call(req.body || {}, 'goal_target_value') ? (req.body || {}).goal_target_value : current.goal_target_value;
    const targetUnit = Object.prototype.hasOwnProperty.call(req.body || {}, 'target_unit')
      ? (req.body || {}).target_unit
      : Object.prototype.hasOwnProperty.call(req.body || {}, 'goal_unit') ? (req.body || {}).goal_unit : current.goal_unit;

    const result = await pool.query(
      `UPDATE bna_accountability_events
       SET title = $2,
           notes = $3,
           topic = $4,
           goal_target_value = $5,
           goal_actual_value = CASE
             WHEN $5::numeric IS NULL THEN goal_actual_value
             WHEN $6::numeric IS NULL THEN goal_actual_value
             ELSE ROUND(($5::numeric * $6::numeric / 100), 2)
           END,
           goal_unit = $7,
           progress_percent = $6,
           follow_up_required = COALESCE($6, 0) < 100,
           metadata = $8,
           updated_at = NOW()
       WHERE id = $1
         AND workspace_id IS NOT DISTINCT FROM $9
         AND event_type = 'student_goal'
       RETURNING *`,
      [
        req.params.id,
        title,
        notes || null,
        goalBoard.category || null,
        targetValue || null,
        progressPercent !== undefined && progressPercent !== null ? progressPercent : null,
        targetUnit || null,
        JSON.stringify(metadata),
        current.workspace_id || null,
      ]
    );
    if (!result.rows[0]) return res.status(scopedStudentNotFoundStatus(req)).json({ error: 'Goal Board item not found in selected workspace' });
    res.json({ success: true, item: goalBoardAdminView(result.rows[0]) });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/students/:id/merge', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { source_student_id, source_name } = req.body || {};
  const client = await pool.connect();

  try {
    const projectKey = studentProjectKeyFromRequest(req, req.body || {});
    const target = await assertStudentAccess(req, id, projectKey, client);

    let source = null;
    if (source_student_id) {
      source = await assertStudentAccess(req, source_student_id, projectKey || target.project_key, client);
    } else if (source_name) {
      source = (await client.query(
        `SELECT * FROM bna_students
         WHERE id <> $1
           AND workspace_id IS NOT DISTINCT FROM $3
           AND lower(name) = lower($2)
         ORDER BY created_at DESC
         LIMIT 1`,
        [id, source_name, target.workspace_id || null]
      )).rows[0];
    }

    if (!source) {
      return res.json({ success: true, target, merged: false, message: 'No duplicate source student found.' });
    }
    if (source.workspace_id !== target.workspace_id) {
      return res.status(400).json({ error: 'Duplicate student merge must stay inside one workspace.' });
    }

    await client.query('BEGIN');
    await client.query(
      `UPDATE bna_accountability_events
       SET student_id = $1,
           student_name = COALESCE(student_name, $2),
           updated_at = NOW()
       WHERE student_id = $3
         AND workspace_id IS NOT DISTINCT FROM $4`,
      [id, target.name, source.id, target.workspace_id || null]
    );
    await client.query(
      `UPDATE bna_group_goal_entries
       SET student_id = $1,
           student_name = COALESCE(student_name, $2),
           updated_at = NOW()
       WHERE student_id = $3
         AND workspace_id IS NOT DISTINCT FROM $4`,
      [id, target.name, source.id, target.workspace_id || null]
    );
    if (!target.signup_id && source.signup_id) {
      await client.query(
        `UPDATE signups
         SET student_name = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [target.name, source.signup_id]
      );
      await client.query(
        `UPDATE bna_students
         SET signup_id = NULL,
             updated_at = NOW()
         WHERE id = $1
           AND workspace_id IS NOT DISTINCT FROM $2`,
        [source.id, target.workspace_id || null]
      );
      await client.query(
        `UPDATE bna_students
         SET signup_id = $2,
             parent_name = COALESCE(parent_name, $3),
             parent_email = COALESCE(parent_email, $4),
             parent_phone = COALESCE(parent_phone, $5),
             updated_at = NOW()
         WHERE id = $1
           AND workspace_id IS NOT DISTINCT FROM $6
           AND signup_id IS NULL`,
        [id, source.signup_id, source.parent_name, source.parent_email, source.parent_phone, target.workspace_id || null]
      );
    }
    await client.query(
      `UPDATE bna_students
       SET signup_id = NULL,
           status = 'inactive',
           notes = CONCAT(COALESCE(notes, ''), CASE WHEN COALESCE(notes, '') = '' THEN '' ELSE E'\n' END, $1::text),
           updated_at = NOW()
       WHERE id = $2
         AND workspace_id IS NOT DISTINCT FROM $3`,
      [`Merged into ${target.name} (#${target.id}) on ${new Date().toISOString().slice(0, 10)}.`, source.id, target.workspace_id || null]
    );
    await client.query('COMMIT');

    res.json({ success: true, target, source, merged: true });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/bna/accountability', requireAdmin, async (req, res) => {
  const { event_type, student_id, limit = 100 } = req.query;
  const projectKey = studentProjectKeyFromRequest(req);
  const conditions = [];
  const params = [];

  if (event_type) {
    params.push(event_type);
    conditions.push(`a.event_type = $${params.length}`);
  }

  if (student_id) {
    params.push(student_id);
    conditions.push(`a.student_id = $${params.length}`);
  }

  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  params.push(Math.min(Number(limit) || 100, 250));
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT a.*,
              row_to_json(s.*) AS student,
              proj.project_key,
              w.workspace_key,
              w.workspace_type,
              w.name AS workspace_name
       FROM bna_accountability_events a
       LEFT JOIN bna_students s ON s.id = a.student_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(a.workspace_id, s.workspace_id)
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = COALESCE(a.workspace_id, s.workspace_id)
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       ${whereClause}
       ORDER BY a.occurred_at DESC, a.created_at DESC
       LIMIT $${params.length}`,
      params
    );
    res.json({ events: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/torah-learning/public-summary', async (req, res) => {
  try {
    const summary = await getTorahLearningSummary(req.query.date || getTodayDateInTimeZone());
    res.json({
      date: summary.date,
      group: summary.group,
      students: summary.students.map((student) => ({
        id: student.id,
        name: student.name,
        percentage: student.percentage,
        complete: student.complete,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/student-portal', async (req, res) => {
  const code = String(req.query.code || '').trim();
  if (!code) return res.status(400).json({ error: 'Student access code is required' });

  try {
    const student = await findStudentByAccessCode(code);
    if (!student) return res.status(404).json({ error: 'Student access code was not found' });

    const goals = (await pool.query(
      `SELECT
          id,
          title,
          topic,
          notes,
          goal_target_value,
          goal_actual_value,
          goal_unit,
          progress_percent,
          follow_up_required,
          metadata,
          occurred_at,
          updated_at
       FROM bna_accountability_events
       WHERE student_id = $1
         AND event_type = 'student_goal'
         AND COALESCE((metadata->'goal_board'->>'status'), '') <> 'archived'
       ORDER BY COALESCE(follow_up_required, FALSE) DESC,
                COALESCE(progress_percent, -1) ASC,
                occurred_at DESC,
                id DESC`,
      [student.id]
    )).rows
      .map((goal) => safeGoalBoardStudentView(goal))
      .filter((goal) => goal.status !== 'archived');

    const torahSummary = await getTorahLearningSummary(getTodayDateInTimeZone());
    const torahRecord = (torahSummary.students || []).find((item) => Number(item.id) === Number(student.id));
    const dailyCompletion = Number(torahRecord?.entry?.daily_completion_percentage || 0);
    const deviceAccess = await getStudentDeviceAccessSummary(student.id);

    res.json({
      student,
      goals,
      device_access: deviceAccess,
      torah: torahRecord
        ? {
            date: torahSummary.date,
            public_trip_percentage: torahRecord.percentage,
            daily_completion_percentage: dailyCompletion,
            morning_goal_status: dailyCompletion >= 100 ? 'done' : dailyCompletion > 0 ? 'in_progress' : 'not_yet',
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student-portal/goals', async (req, res) => {
  const code = String((req.body || {}).access_code || '').trim();
  const title = String((req.body || {}).title || '').trim();
  if (!code) return res.status(400).json({ error: 'Student access code is required' });
  if (!title) return res.status(400).json({ error: 'Goal title is required' });

  try {
    const student = await findStudentByAccessCode(code);
    if (!student) return res.status(404).json({ error: 'Student access code was not found' });

    const metadata = goalBoardMetadataFromPayload({
      ...(req.body || {}),
      source: 'self',
      student_owned: true,
      status: (req.body || {}).approval_required ? 'waiting' : 'active',
      approval_status: (req.body || {}).approval_required ? 'pending_review' : 'approved',
    });
    const goalBoard = normalizeGoalBoardMetadata(rawGoalBoardMetadata(metadata));
    const result = await pool.query(
      `INSERT INTO bna_accountability_events (
        workspace_id, event_type, student_id, student_name, title, notes, topic,
        goal_target_value, goal_actual_value, goal_unit, progress_percent,
        follow_up_required, metadata, source, occurred_at
      ) VALUES (
        $1, 'student_goal', $2, $3, $4, NULL, $5,
        $6, NULL, $7, 0,
        TRUE, $8, 'manual', NOW()
      )
      RETURNING *`,
      [
        student.workspace_id || null,
        student.id,
        student.name,
        title,
        goalBoard.category || null,
        (req.body || {}).target_value || (req.body || {}).goal_target_value || null,
        (req.body || {}).target_unit || (req.body || {}).goal_unit || null,
        JSON.stringify(metadata),
      ]
    );
    res.json({ success: true, goal: safeGoalBoardStudentView(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student-portal/goals/:id/checkoff', async (req, res) => {
  const code = String((req.body || {}).access_code || '').trim();
  const progressPercent = Math.max(0, Math.min(100, Math.round(Number((req.body || {}).progress_percent))));
  if (!code) return res.status(400).json({ error: 'Student access code is required' });
  if (!Number.isFinite(progressPercent)) return res.status(400).json({ error: 'progress_percent must be a number' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const student = await findStudentByAccessCode(code, client);
    if (!student) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student access code was not found' });
    }

    const current = await getGoalBoardEvent(req.params.id, client);
    if (!current || Number(current.student_id) !== Number(student.id)) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Goal was not found for this student' });
    }
    let metadata = metadataAfterProgressUpdate(current, progressPercent);
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'reflection_note')) {
      metadata = goalBoardMetadataFromPayload({ reflection_note: (req.body || {}).reflection_note }, metadata);
    }

    const autoAccess = automaticDeviceAccessForCompletion({ ...current, metadata }, progressPercent);
    let deviceAccessResult = null;
    let deviceAccessStatus = null;

    const result = await client.query(
      `UPDATE bna_accountability_events
       SET progress_percent = $3::numeric,
           goal_actual_value = CASE
             WHEN goal_target_value IS NULL THEN goal_actual_value
             ELSE ROUND((goal_target_value * $3::numeric / 100), 2)
           END,
           follow_up_required = $3::numeric < 100,
           metadata = $4,
           updated_at = NOW()
       WHERE id = $1
         AND student_id = $2
         AND event_type = 'student_goal'
       RETURNING *`,
      [req.params.id, student.id, progressPercent, JSON.stringify(metadata)]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Goal was not found for this student' });
    }

    if (autoAccess) {
      const deviceId = await getPreferredDeviceForStudent(student.id, client);
      if (deviceId) {
        deviceAccessResult = await applyDeviceAccessAction({
          deviceId,
          status: autoAccess.status,
          durationMinutes: autoAccess.durationMinutes,
          reason: autoAccess.reason,
          goalId: result.rows[0].id,
          approvedBy: 'student_checkoff',
        }, client);
        metadata = goalBoardMetadataFromPayload({
          goal_board: {
            consequence: {
              success_applied_at: autoAccess.appliedAt,
              success_applied_by: 'student_checkoff',
            },
          },
        }, metadata);
        const stamped = await client.query(
          `UPDATE bna_accountability_events
           SET metadata = $2,
               updated_at = NOW()
           WHERE id = $1
             AND event_type = 'student_goal'
           RETURNING *`,
          [result.rows[0].id, JSON.stringify(metadata)]
        );
        result.rows[0] = stamped.rows[0] || result.rows[0];
        deviceAccessStatus = 'applied';
      } else {
        deviceAccessStatus = 'no_device_configured';
      }
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      goal: safeGoalBoardStudentView(result.rows[0]),
      automatic_device_access: autoAccess
        ? {
            status: deviceAccessStatus,
            requested_state: autoAccess.status,
            duration_minutes: autoAccess.durationMinutes,
            device: deviceAccessResult?.device || null,
            session: deviceAccessResult?.session || null,
          }
        : null,
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback failures; the original error is more useful.
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/bna/torah-learning', requireAdmin, async (req, res) => {
  try {
    const projectKey = studentProjectKeyFromRequest(req) || DEFAULT_PROJECT_KEY;
    const summary = await getTorahLearningSummary(
      req.query.date || getTodayDateInTimeZone(),
      pool,
      { projectKey }
    );
    res.json(summary);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/torah-learning/entries', requireAdmin, async (req, res) => {
  try {
    const projectKey = assertTorahProjectAccess(studentProjectKeyFromRequest(req, req.body || {}) || DEFAULT_PROJECT_KEY);
    await assertStudentAccess(req, (req.body || {}).student_id, projectKey);
    const saved = await upsertTorahLearningEntry(req.body || {});
    const summary = await getTorahLearningSummary(
      (req.body || {}).date || getTodayDateInTimeZone(),
      pool,
      { projectKey }
    );
    res.json({
      success: true,
      saved,
      summary,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
});

app.post('/api/bna/torah-learning/reconcile-trip-progress', requireAdmin, async (req, res) => {
  const body = req.body || {};
  let projectKey;
  try {
    projectKey = assertTorahProjectAccess(studentProjectKeyFromRequest(req, body) || DEFAULT_PROJECT_KEY);
  } catch (err) {
    return res.status(err.statusCode || 403).json({ error: err.message });
  }
  if (body.confirm !== 'RECONCILE_TORAH_TRIP_PROGRESS') {
    return res.status(400).json({
      error: 'Trip progress reconciliation requires confirm: RECONCILE_TORAH_TRIP_PROGRESS',
    });
  }

  const carriedOverCompletedUnits = validateNonNegativeMinutes(
    body.carried_over_completed_units ?? 3.5,
    'carried_over_completed_units'
  );
  const totalRequiredUnits = validatePositiveNumber(
    body.total_required_units ?? 30,
    'total_required_units'
  );
  const recalculateFromDailyPercentages = body.recalculate_from_daily_percentages !== false;
  const completedDailyUnits = recalculateFromDailyPercentages
    ? null
    : validateNonNegativeMinutes(
      body.completed_daily_units ?? 1,
      'completed_daily_units'
    );
  const flatTrip = recalculateFromDailyPercentages
    ? null
    : calculateStudentTripProgress({
      carriedOverCompletedUnits,
      completedDailyUnits,
      totalRequiredUnits,
    });
  const studentNames = Array.isArray(body.student_names) && body.student_names.length
    ? body.student_names.map((name) => String(name || '').trim()).filter(Boolean)
    : TORAH_STUDENT_SEEDS.map((seed) => seed.name);
  if (
    !recalculateFromDailyPercentages
    && studentNames.length > 1
    && body.apply_uniform_to_all_students !== true
  ) {
    return res.status(400).json({
      error: 'Refusing uniform Torah trip reconciliation for multiple students. Keep recalculate_from_daily_percentages enabled, provide one student_name, or explicitly set apply_uniform_to_all_students: true.',
    });
  }
  const canonicalCompletedDates = Array.isArray(body.canonical_completed_dates)
    ? body.canonical_completed_dates.map((date) => toIsoDateValue(date)).filter(Boolean)
    : null;
  const note = String(body.note || '').trim()
    || 'Admin reconciliation: reset cumulative trip snapshot to migration target; canonical completed dates may normalize which daily rows count as completed units.';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const students = (await client.query(
      `SELECT s.id, s.name
       FROM bna_students s
       LEFT JOIN bna_workspaces w ON w.id = s.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = s.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       WHERE COALESCE(s.status, 'active') NOT IN ('inactive', 'archived')
         AND lower(s.name) = ANY($1::text[])
         AND COALESCE(proj.project_key, w.workspace_key, '') = $2
       ORDER BY name ASC`,
      [studentNames.map((name) => name.toLowerCase()), projectKey]
    )).rows;

    const updatedRows = [];
    for (const student of students) {
      let result;
      if (recalculateFromDailyPercentages) {
        // eslint-disable-next-line no-await-in-loop
        await client.query(
          `UPDATE bna_torah_learning_entries
           SET note = CONCAT(
                 COALESCE(NULLIF(note, ''), ''),
                 CASE WHEN COALESCE(NULLIF(note, ''), '') = '' THEN '' ELSE E'\n' END,
                 $2::text
               ),
               updated_at = NOW()
           WHERE student_id = $1`,
          [student.id, note]
        );
        // eslint-disable-next-line no-await-in-loop
        await refreshTorahTripProgressSnapshots(
          student.id,
          { carriedOverCompletedUnits, totalRequiredUnits },
          client
        );
        // eslint-disable-next-line no-await-in-loop
        result = await client.query(
          `SELECT id, student_id, date, daily_completed_boolean,
                  individual_complete, completed_daily_units,
                  carried_over_completed_units, total_completed_units,
                  total_required_units, total_trip_progress_percentage
           FROM bna_torah_learning_entries
           WHERE student_id = $1
           ORDER BY date ASC, id ASC`,
          [student.id]
        );
      } else {
        // eslint-disable-next-line no-await-in-loop
        result = await client.query(
          `UPDATE bna_torah_learning_entries
           SET completed_daily_units = $2,
               carried_over_completed_units = $3,
               total_completed_units = $4,
               total_required_units = $5,
               total_trip_progress_percentage = $6,
               daily_completed_boolean = CASE
                 WHEN $8::date[] IS NULL THEN daily_completed_boolean
                 ELSE date = ANY($8::date[])
               END,
               individual_complete = CASE
                 WHEN $8::date[] IS NULL THEN individual_complete
                 ELSE date = ANY($8::date[])
               END,
               note = CONCAT(
                 COALESCE(NULLIF(note, ''), ''),
                 CASE WHEN COALESCE(NULLIF(note, ''), '') = '' THEN '' ELSE E'\n' END,
                 $7::text
               ),
               updated_at = NOW()
           WHERE student_id = $1
           RETURNING id, student_id, date, daily_completed_boolean,
                     individual_complete, completed_daily_units,
                     carried_over_completed_units, total_completed_units,
                     total_required_units, total_trip_progress_percentage`,
          [
            student.id,
            flatTrip.completedDailyUnits,
            flatTrip.carriedOverCompletedUnits,
            flatTrip.totalCompletedUnits,
            flatTrip.totalRequiredUnits,
            flatTrip.totalTripProgressPercentageRaw,
            note,
            canonicalCompletedDates,
          ]
        );
      }
      updatedRows.push({
        student_id: student.id,
        student_name: student.name,
        updated_entries: result.rows,
      });
    }

    await client.query('COMMIT');
    const summary = await getTorahLearningSummary(
      body.date || getTodayDateInTimeZone(),
      pool,
      { projectKey }
    );
    res.json({
      success: true,
      mode: recalculateFromDailyPercentages ? 'recalculate_from_daily_percentages' : 'flat_override',
      trip: flatTrip,
      canonical_completed_dates: canonicalCompletedDates,
      updated: updatedRows,
      summary,
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/bna/green-invoice/webhooks', requireAdmin, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const projectKey = accountingProjectKeyFromRequest(req);
  const params = [];
  const conditions = [];
  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  params.push(limit);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const result = await pool.query(
      `SELECT l.*,
              row_to_json(s.*) AS signup,
              row_to_json(st.*) AS student,
              proj.project_key,
              proj.name AS project_name,
              proj.short_name AS project_short_name,
              w.workspace_key,
              w.workspace_type,
              w.name AS workspace_name
       FROM bna_green_invoice_webhook_log l
       LEFT JOIN signups s ON s.id = l.matched_signup_id
       LEFT JOIN bna_students st ON st.id = l.matched_student_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(l.workspace_id, s.workspace_id, st.workspace_id)
       LEFT JOIN LATERAL (
         SELECT p.project_key, p.name, p.short_name
         FROM bna_projects p
         WHERE p.workspace_id = COALESCE(l.workspace_id, s.workspace_id, st.workspace_id)
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       ${whereClause}
       ORDER BY l.webhook_received_at DESC, l.id DESC
       LIMIT $${params.length}`,
      params
    );
    res.json({ events: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/green-invoice/webhooks/:id/reprocess', requireAdmin, async (req, res) => {
  if (String(req.body?.confirm || '') !== 'REPROCESS_GREEN_INVOICE') {
    return res.status(400).json({
      error: 'Green Invoice reprocess requires confirm: REPROCESS_GREEN_INVOICE',
      hint: 'Only reprocess after checking the selected workspace and webhook payload.',
    });
  }

  try {
    const projectKey = accountingProjectKeyFromRequest(req, req.body || {});
    const params = [req.params.id];
    const conditions = ['l.id = $1'];
    addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
    const logResult = await pool.query(
      `SELECT l.*
       FROM bna_green_invoice_webhook_log l
       LEFT JOIN bna_workspaces w ON w.id = l.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = l.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      params
    );
    const logRow = logResult.rows[0];
    if (!logRow) {
      return res.status(scopedAccountingNotFoundStatus(req)).json({ error: 'Green Invoice webhook log not found in the selected workspace' });
    }

    const result = await processGreenInvoiceWebhook(
      logRow.payload || {},
      logRow.request_headers || {},
      { forceReprocess: true }
    );
    runGreenInvoiceFollowUps(result);
    res.json({
      success: true,
      matched: result.matched,
      duplicate: result.duplicate,
      paymentIntakeId: result.paymentIntakeId || null,
      paymentLogId: result.paymentLogId || null,
      webhookLog: result.webhookLog,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bna/students/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const student = await assertStudentAccess(req, id, studentProjectKeyFromRequest(req));

    await pool.query(
      `UPDATE bna_accountability_events
       SET student_id = NULL,
           student_name = COALESCE(student_name, $2),
           updated_at = NOW()
       WHERE student_id = $1
         AND workspace_id IS NOT DISTINCT FROM $3`,
      [id, student.name || null, student.workspace_id || null]
    );

    await pool.query(
      `UPDATE bna_students
       SET status = 'inactive',
           updated_at = NOW()
       WHERE id = $1
         AND workspace_id IS NOT DISTINCT FROM $2`,
      [id, student.workspace_id || null]
    );

    if (student.signup_id) {
      await pool.query(
        `UPDATE signups
         SET status = 'archived',
             notes = CONCAT(COALESCE(notes, ''), CASE WHEN COALESCE(notes, '') = '' THEN '' ELSE E'\n' END, $1::text),
             updated_at = NOW()
         WHERE id = $2`,
        [`Archived with student cleanup on ${new Date().toISOString().slice(0, 10)}.`, student.signup_id]
      );
    }

    res.json({ success: true, student_id: Number(id), archived_signup_id: student.signup_id || null });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/accountability', requireAdmin, async (req, res) => {
  const {
    event_type,
    student_id,
    student_name,
    title,
    notes,
    topic,
    question_text,
    goal_target_value,
    goal_actual_value,
    goal_unit,
    progress_percent,
    attendance_status,
    next_check_in_date,
    engagement_level,
    follow_up_required = false,
    metadata,
    source = 'manual',
    source_message_id,
    source_media_url,
    occurred_at,
  } = req.body || {};

  if (!event_type || !title) {
    return res.status(400).json({ error: 'event_type and title are required' });
  }

  try {
    const projectKey = studentProjectKeyFromRequest(req, req.body || {});
    const student = student_id
      ? await assertStudentAccess(req, student_id, projectKey)
      : null;
    const project = !student
      ? await resolveStudentProjectForWrite(req, req.body || {})
      : null;
    const workspaceId = student?.workspace_id || project?.workspace_id || (await getDefaultSchoolWorkspace(pool)).id;
    const result = await pool.query(
      `INSERT INTO bna_accountability_events (
        workspace_id, event_type, student_id, student_name, title, notes, topic, question_text,
        goal_target_value, goal_actual_value, goal_unit, progress_percent,
        attendance_status, next_check_in_date, engagement_level, follow_up_required, metadata,
        source, source_message_id, source_media_url, occurred_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, COALESCE($21::timestamp, NOW())
      )
      RETURNING *`,
      [
        workspaceId,
        event_type,
        student_id || null,
        student_name || null,
        title,
        notes || null,
        topic || null,
        question_text || null,
        goal_target_value || null,
        goal_actual_value || null,
        goal_unit || null,
        progress_percent !== undefined && progress_percent !== null ? Math.max(0, Math.min(100, Number(progress_percent))) : null,
        attendance_status || null,
        next_check_in_date || null,
        engagement_level || null,
        Boolean(follow_up_required),
        metadata ? JSON.stringify(metadata) : JSON.stringify({}),
        source,
        source_message_id || null,
        source_media_url || null,
        occurred_at || null,
      ]
    );

    res.json({ success: true, event: result.rows[0], project: student?.project_key || project?.project_key || DEFAULT_PROJECT_KEY });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/accountability/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    'event_type',
    'student_id',
    'student_name',
    'title',
    'notes',
    'topic',
    'question_text',
    'goal_target_value',
    'goal_actual_value',
    'goal_unit',
    'progress_percent',
    'attendance_status',
    'next_check_in_date',
    'engagement_level',
    'follow_up_required',
    'metadata',
    'source_media_url',
    'occurred_at',
  ];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, field)) continue;
    values.push(field === 'metadata' && req.body[field] ? JSON.stringify(req.body[field]) : req.body[field]);
    updates.push(`${field} = $${values.length}`);
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'No supported fields to update' });
  }

  try {
    const projectKey = studentProjectKeyFromRequest(req, req.body || {});
    const current = await assertAccountabilityEventAccess(req, id, projectKey);
    if (
      Object.prototype.hasOwnProperty.call(req.body || {}, 'student_id') &&
      req.body.student_id
    ) {
      await assertStudentAccess(req, req.body.student_id, projectKey || current.project_key);
    }
    values.push(id);
    values.push(current.workspace_id || null);
    const result = await pool.query(
      `UPDATE bna_accountability_events
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length - 1}
         AND workspace_id IS NOT DISTINCT FROM $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) {
      return res.status(scopedStudentNotFoundStatus(req)).json({ error: 'Accountability event not found in selected workspace' });
    }
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.delete('/api/bna/accountability/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const current = await assertAccountabilityEventAccess(req, id, studentProjectKeyFromRequest(req));
    await pool.query(
      'DELETE FROM bna_accountability_events WHERE id = $1 AND workspace_id IS NOT DISTINCT FROM $2',
      [id, current.workspace_id || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/group-goals', requireAdmin, async (req, res) => {
  try {
    await ensureDefaultGroupGoal();
    const projectKey = studentProjectKeyFromRequest(req);
    const params = [];
    const conditions = ["g.status <> 'archived'"];
    addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const result = await pool.query(
      `SELECT g.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id,
              'student_id', e.student_id,
              'student_name', COALESCE(s.name, e.student_name),
              'recorded_date', e.recorded_date,
              'target_minutes', e.target_minutes,
              'inside_following_minutes', e.inside_following_minutes,
              'inside_listening_minutes', e.inside_listening_minutes,
              'distracted_minutes', e.distracted_minutes,
              'weighted_minutes', e.weighted_minutes,
              'progress_percent', e.progress_percent,
              'notes', e.notes,
              'source_content_job_id', e.source_content_job_id
            )
            ORDER BY e.recorded_date DESC, e.created_at DESC
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'
        ) AS entries,
        COALESCE(MIN(e.progress_percent) FILTER (WHERE e.progress_percent IS NOT NULL), 0) AS group_progress_percent,
        COUNT(e.id) FILTER (WHERE e.progress_percent >= 100) AS students_complete,
        COUNT(e.id) AS entries_count
       FROM bna_group_goals g
       LEFT JOIN bna_workspaces w ON w.id = g.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = g.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       LEFT JOIN bna_group_goal_entries e ON e.goal_id = g.id
       LEFT JOIN bna_students s ON s.id = e.student_id
       ${whereClause}
       GROUP BY g.id
       ORDER BY g.status = 'active' DESC, g.created_at DESC`,
      params
    );
    res.json({ goals: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/group-goals', requireAdmin, async (req, res) => {
  const { title, description, target_minutes, scoring_rule, status = 'active', start_date, due_date, metadata } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const project = await resolveStudentProjectForWrite(req, req.body || {});
    const result = await pool.query(
      `INSERT INTO bna_group_goals (workspace_id, title, description, target_minutes, scoring_rule, status, start_date, due_date, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE), $8, $9)
       RETURNING *`,
      [project.workspace_id, title, description || null, target_minutes || null, scoring_rule || null, status, start_date || null, due_date || null, metadata ? JSON.stringify(metadata) : JSON.stringify({})]
    );
    res.json({ success: true, goal: result.rows[0], project: project.project_key });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/group-goals/:id/entries', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    student_id,
    student_name,
    recorded_date,
    target_minutes,
    inside_following_minutes = 0,
    inside_listening_minutes = 0,
    distracted_minutes = 0,
    notes,
    source_content_job_id,
    metadata,
  } = req.body || {};

  try {
    const projectKey = studentProjectKeyFromRequest(req, req.body || {});
    const goal = await assertGroupGoalAccess(req, id, projectKey);
    const student = student_id
      ? await assertStudentAccess(req, student_id, projectKey || goal.project_key)
      : null;
    if (student && String(student.workspace_id || '') !== String(goal.workspace_id || '')) {
      return res.status(400).json({ error: 'Group goal entry student must belong to the same workspace as the goal.' });
    }
    const computed = calculateWeightedGoal({
      target_minutes: target_minutes || goal.target_minutes,
      inside_following_minutes,
      inside_listening_minutes,
    });
    const result = await pool.query(
      `INSERT INTO bna_group_goal_entries (
        workspace_id, goal_id, student_id, student_name, recorded_date, target_minutes,
        inside_following_minutes, inside_listening_minutes, distracted_minutes, weighted_minutes,
        progress_percent, notes, source_content_job_id, metadata
      )
       VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        goal.workspace_id || null,
        id,
        student_id || null,
        student_name || null,
        recorded_date || null,
        target_minutes || goal.target_minutes || null,
        inside_following_minutes || 0,
        inside_listening_minutes || 0,
        distracted_minutes || 0,
        computed.weighted,
        computed.progress,
        notes || null,
        source_content_job_id || null,
        metadata ? JSON.stringify(metadata) : JSON.stringify({}),
      ]
    );
    res.json({ success: true, entry: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// BNA dashboard: payment intake for parents who paid before signup
app.get('/api/bna/payment-intake', requireAdmin, async (req, res) => {
  const { status, project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = [];

  if (status) {
    params.push(status);
    conditions.push(`i.status = $${params.length}`);
  }

  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT i.*,
              row_to_json(s.*) AS signup,
              proj.project_key,
              proj.name AS project_name,
              proj.short_name AS project_short_name,
              w.workspace_key,
              w.workspace_type,
              w.name AS workspace_name
       FROM bna_payment_intake i
       LEFT JOIN signups s ON s.id = i.signup_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(i.workspace_id, s.workspace_id)
       LEFT JOIN LATERAL (
         SELECT p.project_key, p.name, p.short_name
         FROM bna_projects p
         WHERE p.workspace_id = COALESCE(i.workspace_id, s.workspace_id)
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       ${whereClause}
       ORDER BY i.received_at DESC, i.created_at DESC
       LIMIT 100`,
      params
    );
    res.json({ intake: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/payment-intake/reconcile-paid', requireAdmin, async (req, res) => {
  if (String(req.body?.confirm || '') !== 'RECONCILE_PAID_INTAKE') {
    return res.status(400).json({
      error: 'Paid-intake reconciliation requires confirm: RECONCILE_PAID_INTAKE',
      hint: 'Review the selected workspace and records before creating/updating signups and payment logs.',
    });
  }

  const records = Array.isArray(req.body?.records) ? req.body.records : [];
  if (!records.length) {
    return res.status(400).json({ error: 'records array is required' });
  }
  const projectKey = accountingProjectKeyFromRequest(req, req.body || {}) || DEFAULT_PROJECT_KEY;

  const client = await pool.connect();
  const results = [];

  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE signups ALTER COLUMN parent_email DROP NOT NULL');

    for (const input of records) {
      const intakeId = Number(input.intake_id || input.intakeId || 0);
      const studentName = String(input.student_name || input.studentName || '').trim();
      const parentName = String(input.parent_name || input.parentName || '').trim();
      const parentEmail = String(input.parent_email || input.parentEmail || '').trim() || null;
      const parentPhone = String(input.parent_phone || input.parentPhone || '').trim() || null;
      const method = String(input.method || '').trim();
      const amount = Number(input.amount || 0);
      const paidAt = input.paid_at || input.paidAt || null;
      const dueDate = input.due_date || input.dueDate || null;
      const note = String(input.note || input.notes || '').trim()
        || 'Admin-created from paid intake; missing official signup fields intentionally left blank.';

      if (!intakeId || !studentName || !parentName || !amount || !method || !paidAt || !dueDate) {
        throw new Error('Each record requires intake_id, student_name, parent_name, amount, method, paid_at, and due_date');
      }

      const intakeRecord = await assertPaymentIntakeAccountingAccess(req, intakeId, projectKey, client);
      const student = (await client.query(
        `SELECT st.*
         FROM bna_students st
         LEFT JOIN bna_workspaces w ON w.id = st.workspace_id
         LEFT JOIN LATERAL (
           SELECT p.project_key
           FROM bna_projects p
           WHERE p.workspace_id = st.workspace_id
           ORDER BY p.id ASC
           LIMIT 1
         ) proj ON TRUE
         WHERE lower(st.name) = lower($1)
           AND st.status <> 'inactive'
           AND COALESCE(proj.project_key, w.workspace_key, '') = $2
         ORDER BY st.id DESC
         LIMIT 1`,
        [studentName, projectKey]
      )).rows[0];

      if (!student) {
        throw new Error(`No active student found for ${studentName} in the selected accounting workspace`);
      }
      const defaultWorkspace = await getDefaultSchoolWorkspace(client);
      const workspaceId = student.workspace_id || intakeRecord.workspace_id || defaultWorkspace.id;

      const existingSignup = student.signup_id
        ? (await client.query(
            'SELECT * FROM signups WHERE id = $1 AND workspace_id IS NOT DISTINCT FROM $2',
            [student.signup_id, workspaceId]
          )).rows[0]
        : (await client.query(
            'SELECT * FROM signups WHERE lower(student_name) = lower($1) AND workspace_id IS NOT DISTINCT FROM $2 ORDER BY id DESC LIMIT 1',
            [studentName, workspaceId]
          )).rows[0];

      const adminTags = ['parent', 'bna', 'admin_intake'];
      let signup;
      let signupCreated = false;

      if (existingSignup) {
        signup = (await client.query(
          `UPDATE signups
           SET parent_name = COALESCE(NULLIF($2, ''), parent_name),
               parent_email = COALESCE($3, parent_email),
               parent_phone = COALESCE($4, parent_phone),
               student_name = $5,
               payment_method = $6,
               payment_status = 'paid',
               payment_amount = $7,
               payment_currency = 'ILS',
               payment_interval_days = COALESCE(payment_interval_days, $8),
               payment_due_date = $9,
               last_payment_at = $10,
               status = COALESCE(NULLIF(status, ''), 'new'),
               tags = (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || $11::text[]))),
               notes = CASE
                 WHEN notes IS NULL OR notes = '' THEN $12
                WHEN notes LIKE '%' || $12 || '%' THEN notes
                ELSE notes || E'\n' || $12
               END,
               workspace_id = COALESCE(workspace_id, $13),
               updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [
            existingSignup.id,
            parentName,
            parentEmail,
            parentPhone,
            studentName,
            method,
            amount,
            DEFAULT_PAYMENT_INTERVAL_DAYS,
            dueDate,
            paidAt,
            adminTags,
            note,
            workspaceId,
          ]
        )).rows[0];
      } else {
        signup = (await client.query(
          `INSERT INTO signups (
             workspace_id, parent_name, parent_email, parent_phone, student_name,
             payment_method, payment_status, payment_amount, payment_currency,
             payment_interval_days, payment_due_date, last_payment_at,
             status, tags, notes, created_at, updated_at
           ) VALUES ($1,$2,$3,$4,$5,$6,'paid',$7,'ILS',$8,$9,$10,'new',$11::text[],$12,NOW(),NOW())
           RETURNING *`,
          [
            workspaceId,
            parentName,
            parentEmail,
            parentPhone,
            studentName,
            method,
            amount,
            DEFAULT_PAYMENT_INTERVAL_DAYS,
            dueDate,
            paidAt,
            adminTags,
            note,
          ]
        )).rows[0];
        signupCreated = true;
      }

      await client.query(
        `UPDATE bna_students
         SET signup_id = $1,
             parent_name = COALESCE(NULLIF($2, ''), parent_name),
             parent_email = COALESCE($3, parent_email),
             parent_phone = COALESCE($4, parent_phone),
             updated_at = NOW()
         WHERE id = $5`,
        [signup.id, parentName, parentEmail, parentPhone, student.id]
      );

      const existingPayment = (await client.query(
        `SELECT id
         FROM bna_payment_log
         WHERE signup_id = $1
           AND payment_type = 'registration'
           AND amount = $2
           AND method = $3
           AND status = 'completed'
           AND received_at::date = $4::date
         ORDER BY id DESC
         LIMIT 1`,
        [signup.id, amount, method, paidAt]
      )).rows[0];

      let paymentLogId = existingPayment?.id || null;
      if (!paymentLogId) {
        paymentLogId = (await client.query(
          `INSERT INTO bna_payment_log (
             workspace_id, signup_id, payment_type, amount, currency, method,
             received_by, received_at, notes, status
           ) VALUES ($1,$2,'registration',$3,'ILS',$4,'admin_paid_intake_reconcile',$5,$6,'completed')
           RETURNING id`,
          [workspaceId, signup.id, amount, method, paidAt, note]
        )).rows[0].id;
      }

      const intake = (await client.query(
          `UPDATE bna_payment_intake
           SET signup_id = $1,
              workspace_id = COALESCE(workspace_id, $11),
              parent_name = COALESCE(NULLIF($2, ''), parent_name),
             parent_email = COALESCE($3, parent_email),
             parent_phone = COALESCE($4, parent_phone),
             student_name = $5,
             amount = $6,
             method = $7,
             status = 'matched',
             received_at = COALESCE(received_at, $8),
             matched_at = COALESCE(matched_at, NOW()),
             notes = CASE
               WHEN notes IS NULL OR notes = '' THEN $9
               WHEN notes LIKE '%' || $9 || '%' THEN notes
               ELSE notes || E'\n' || $9
             END,
             updated_at = NOW()
          WHERE id = $10
            AND (workspace_id IS NULL OR workspace_id IS NOT DISTINCT FROM $11)
          RETURNING id, status, signup_id`,
        [
          signup.id,
          parentName,
          parentEmail,
          parentPhone,
          studentName,
          amount,
          method,
          paidAt,
          note,
          intakeId,
          workspaceId,
        ]
      )).rows[0];

      if (!intake) {
        throw new Error(`No payment intake record found for id ${intakeId}`);
      }

      results.push({
        intake_id: intake.id,
        intake_status: intake.status,
        student_id: student.id,
        student_name: studentName,
        signup_id: signup.id,
        signup_created: signupCreated,
        payment_log_id: paymentLogId,
      });
    }

    const remainingParams = [];
    const remainingConditions = ["i.status = 'needs_signup'"];
    addAccountingProjectCondition(remainingConditions, remainingParams, projectKey, 'proj', 'w');
    const remainingNeedsSignup = (await client.query(
      `SELECT i.id, i.parent_name, i.student_name, i.amount, i.method
       FROM bna_payment_intake i
       LEFT JOIN bna_workspaces w ON w.id = i.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key
         FROM bna_projects p
         WHERE p.workspace_id = i.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) proj ON TRUE
       WHERE ${remainingConditions.join(' AND ')}
       ORDER BY i.id`,
      remainingParams
    )).rows;

    await client.query('COMMIT');
    res.json({ success: true, results, remaining_needs_signup: remainingNeedsSignup });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(err.statusCode || 500).json({ error: err.message, stack: err.stack });
  } finally {
    client.release();
  }
});

app.post('/api/bna/payment-intake', requireAdmin, async (req, res) => {
  const {
    signup_id,
    parent_name,
    parent_email,
    parent_phone,
    student_name,
    amount,
    currency,
    method = 'unknown',
    payment_type = 'registration',
    green_invoice_id,
    green_invoice_url,
    status = 'unmatched',
    source = 'manual',
    source_context,
    received_at,
    notes,
    confirm,
  } = req.body || {};

  if (String(confirm || '') !== 'CAPTURE_PAYMENT_INTAKE') {
    return res.status(400).json({
      error: 'Payment intake capture requires confirm: CAPTURE_PAYMENT_INTAKE',
      hint: 'Review the selected workspace and payment details before creating an intake record.',
    });
  }

  try {
    const project = await resolveAccountingProjectForWrite(req, req.body || {});
    const signup = signup_id ? await assertSignupAccountingAccess(req, signup_id, project.project_key) : null;
    if (req.body?.sync_legacy_ghl) {
      return res.status(400).json({
        error: 'Legacy GHL sync is disabled for BNA payment intake.',
        hint: 'Capture the first-party BNA payment record only; do not mutate GHL from Operations.',
      });
    }

    const intake = await createPaymentIntakeRecord({
      workspace_id: signup?.workspace_id || project.workspace_id,
      signup_id,
      parent_name,
      parent_email,
      parent_phone,
      student_name,
      amount,
      currency,
      method,
      payment_type,
      green_invoice_id,
      green_invoice_url,
      ghl_contact_id: null,
      status,
      source,
      source_context,
      received_at,
      notes,
    });

    res.json({ success: true, intake });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/payment-intake/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (String(req.body?.confirm || '') !== 'UPDATE_PAYMENT_INTAKE') {
    return res.status(400).json({
      error: 'Payment intake updates require confirm: UPDATE_PAYMENT_INTAKE',
      hint: 'Review the selected workspace and update before changing intake status/details.',
    });
  }

  const projectKey = accountingProjectKeyFromRequest(req, req.body || {});
  const allowedFields = [
    'signup_id',
    'parent_name',
    'parent_email',
    'parent_phone',
    'student_name',
    'amount',
    'currency',
    'method',
    'payment_type',
    'green_invoice_id',
    'green_invoice_url',
    'ghl_contact_id',
    'status',
    'received_at',
    'notes',
  ];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.includes(key)) continue;
    values.push(value);
    fields.push(`${key} = $${values.length}`);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No valid payment intake fields provided' });
  }

  let existingIntake;
  try {
    existingIntake = await assertPaymentIntakeAccountingAccess(req, id, projectKey);
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'signup_id') && req.body.signup_id) {
      await assertSignupAccountingAccess(req, req.body.signup_id, projectKey);
    }
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }

  values.push(id);
  values.push(existingIntake.workspace_id || null);

  try {
    const result = await pool.query(
      `UPDATE bna_payment_intake
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length - 1}
         AND workspace_id IS NOT DISTINCT FROM $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) {
      return res.status(scopedAccountingNotFoundStatus(req)).json({ error: 'Payment intake record not found in the selected workspace' });
    }
    res.json({ success: true, intake: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.delete('/api/bna/payment-intake/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (String(req.body?.confirm || '') !== 'DELETE_PAYMENT_INTAKE') {
    return res.status(400).json({
      error: 'Payment intake deletes require confirm: DELETE_PAYMENT_INTAKE',
      hint: 'Deleting accounting intake is permanent enough to require an explicit confirmation.',
    });
  }

  try {
    const existingIntake = await assertPaymentIntakeAccountingAccess(req, id, accountingProjectKeyFromRequest(req, req.body || {}));
    await pool.query(
      'DELETE FROM bna_payment_intake WHERE id = $1 AND workspace_id IS NOT DISTINCT FROM $2',
      [id, existingIntake.workspace_id || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// BNA dashboard: content repurposing pipeline
app.get('/api/bna/content-jobs', requireAdmin, async (req, res) => {
  const { status, project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = [];

  if (status) {
    params.push(status);
    conditions.push(`j.status = $${params.length}`);
  }

  if (projectKey) {
    params.push(projectKey);
    conditions.push(`COALESCE(p.project_key, w.workspace_key, '') = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    await ensureDefaultProjects();
    const result = await pool.query(
      `SELECT j.*,
        p.project_key,
        p.name AS project_name,
        p.short_name AS project_short_name,
        w.workspace_key,
        w.workspace_type,
        w.name AS workspace_name,
        CASE
          WHEN COALESCE(NULLIF(TRIM(j.transcript_text), ''), '') <> '' THEN 'transcribed'
          WHEN j.status = 'transcribing' THEN 'transcribing'
          WHEN j.status = 'ingested' THEN 'not_transcribed'
          ELSE 'missing_transcript'
        END AS transcript_status,
        CASE
          WHEN j.parse_json IS NOT NULL THEN 'parsed'
          ELSE 'not_parsed'
        END AS parse_status,
        COUNT(o.id)::int AS output_count,
        COUNT(o.id) FILTER (WHERE o.status = 'needs_approval')::int AS needs_approval_output_count,
        COUNT(o.id) FILTER (WHERE o.status = 'approved')::int AS approved_output_count,
        COUNT(o.id) FILTER (WHERE o.status = 'published')::int AS published_output_count,
        MAX(o.updated_at) AS latest_output_at,
        COALESCE(
          json_agg(to_jsonb(o) ORDER BY o.created_at ASC) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) AS outputs
       FROM bna_content_jobs j
       LEFT JOIN bna_content_outputs o ON o.job_id = j.id
       LEFT JOIN bna_workspaces w ON w.id = j.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key, p.name, p.short_name
         FROM bna_projects p
         WHERE p.workspace_id = j.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) p ON TRUE
       ${whereClause}
       GROUP BY j.id, p.project_key, p.name, p.short_name, w.workspace_key, w.workspace_type, w.name
       ORDER BY j.created_at DESC
       LIMIT 100`,
      params
    );
    res.json({ jobs: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/class-sessions', requireAdmin, async (req, res) => {
  const { project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = [];

  if (projectKey) {
    params.push(projectKey);
    conditions.push(`COALESCE(p.project_key, w.workspace_key, '') = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    await ensureDefaultProjects();
    const result = await pool.query(
      `SELECT cs.*,
        row_to_json(j.*) AS content_job,
        p.project_key,
        p.name AS project_name,
        p.short_name AS project_short_name,
        w.workspace_key,
        w.workspace_type,
        w.name AS workspace_name
       FROM bna_class_sessions cs
       LEFT JOIN bna_content_jobs j ON j.id = cs.content_job_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(cs.workspace_id, j.workspace_id)
       LEFT JOIN LATERAL (
         SELECT p.project_key, p.name, p.short_name
         FROM bna_projects p
         WHERE p.workspace_id = COALESCE(cs.workspace_id, j.workspace_id)
         ORDER BY p.id ASC
         LIMIT 1
       ) p ON TRUE
       ${whereClause}
       ORDER BY cs.class_date DESC, cs.created_at DESC
       LIMIT 100`,
      params
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/calendar', requireAdmin, async (req, res) => {
  try {
    await ensureDefaultProjects();
    const scopedProjectKey = opsScopeProjectKey(req);
    const requestedProjectKey = req.query?.project && req.query.project !== 'all'
      ? normalizeProjectKey(req.query.project)
      : '';
    const projectKey = scopedProjectKey || requestedProjectKey;

    const projectParams = [];
    const workspaceParams = [];
    let taskScopeClause = '';
    let workspaceScopeClause = '';
    if (projectKey) {
      projectParams.push(projectKey);
      workspaceParams.push(projectKey);
      taskScopeClause = `AND COALESCE(p.project_key, '') = $${projectParams.length}`;
      workspaceScopeClause = `AND COALESCE(w.workspace_key, '') = $${workspaceParams.length}`;
    }

    const [taskRows, classRows, accountabilityRows, groupGoalRows] = await Promise.all([
      pool.query(
        `SELECT t.id, t.title, t.notes, t.stage, t.urgency, t.assigned_to, t.due_date, t.planned_at,
                p.project_key, p.short_name AS project_short_name, p.name AS project_name
         FROM bna_tasks t
         LEFT JOIN bna_projects p ON p.id = t.project_id
         WHERE (t.due_date IS NOT NULL OR t.planned_at IS NOT NULL)
           AND COALESCE(t.stage, '') <> 'archived'
           ${taskScopeClause}
         ORDER BY COALESCE(t.due_date::timestamp, t.planned_at, t.created_at) ASC
         LIMIT 160`,
        projectParams
      ),
      pool.query(
        `SELECT cs.id, cs.title, cs.summary, cs.class_date, cs.created_at,
                w.workspace_key, w.name AS workspace_name
         FROM bna_class_sessions cs
         LEFT JOIN bna_workspaces w ON w.id = cs.workspace_id
         WHERE cs.class_date IS NOT NULL
           ${workspaceScopeClause}
         ORDER BY cs.class_date ASC, cs.created_at ASC
         LIMIT 120`,
        workspaceParams
      ),
      pool.query(
        `SELECT a.id, a.event_type, a.title, a.topic, a.student_name, a.next_check_in_date,
                a.follow_up_required, a.occurred_at, a.created_at, s.name AS linked_student_name,
                w.workspace_key, w.name AS workspace_name
         FROM bna_accountability_events a
         LEFT JOIN bna_students s ON s.id = a.student_id
         LEFT JOIN bna_workspaces w ON w.id = COALESCE(a.workspace_id, s.workspace_id)
         WHERE (a.next_check_in_date IS NOT NULL OR a.occurred_at IS NOT NULL)
           ${workspaceScopeClause}
         ORDER BY COALESCE(a.next_check_in_date::timestamp, a.occurred_at, a.created_at) ASC
         LIMIT 160`,
        workspaceParams
      ),
      pool.query(
        `SELECT g.id, g.title, g.description, g.due_date, g.status,
                w.workspace_key, w.name AS workspace_name
         FROM bna_group_goals g
         LEFT JOIN bna_workspaces w ON w.id = g.workspace_id
         WHERE g.due_date IS NOT NULL
           AND COALESCE(g.status, 'active') <> 'archived'
           ${workspaceScopeClause}
         ORDER BY g.due_date ASC, g.created_at ASC
         LIMIT 80`,
        workspaceParams
      ),
    ]);

    const events = [
      ...taskRows.rows.map((task) => ({
        id: `task:${task.id}`,
        source_type: 'task',
        title: task.title,
        subtitle: task.assigned_to ? `Owner: ${task.assigned_to}` : 'Task',
        starts_at: task.due_date || task.planned_at,
        status: task.stage || 'ready',
        urgency: task.urgency || 'this_week',
        project_key: task.project_key || null,
        workspace_label: task.project_short_name || task.project_name || task.project_key || null,
        href: '/operations?view=tasks',
      })),
      ...classRows.rows.map((session) => ({
        id: `class:${session.id}`,
        source_type: 'class_session',
        title: session.title || 'Class session',
        subtitle: session.summary || 'Class session',
        starts_at: session.class_date,
        status: 'scheduled',
        workspace_key: session.workspace_key || null,
        workspace_label: session.workspace_name || session.workspace_key || null,
        href: '/operations?view=content',
      })),
      ...accountabilityRows.rows.map((event) => ({
        id: `accountability:${event.id}`,
        source_type: event.next_check_in_date ? 'check_in' : 'accountability_event',
        title: event.next_check_in_date
          ? `Check in: ${event.student_name || event.linked_student_name || event.title || 'student'}`
          : event.title || event.topic || 'Student event',
        subtitle: event.topic || event.event_type || 'Student accountability',
        starts_at: event.next_check_in_date || event.occurred_at || event.created_at,
        status: event.follow_up_required ? 'follow_up' : event.event_type || 'event',
        workspace_key: event.workspace_key || null,
        workspace_label: event.workspace_name || event.workspace_key || null,
        href: '/operations?view=students',
      })),
      ...groupGoalRows.rows.map((goal) => ({
        id: `group_goal:${goal.id}`,
        source_type: 'group_goal',
        title: goal.title || 'Group goal',
        subtitle: goal.description || 'Group goal due date',
        starts_at: goal.due_date,
        status: goal.status || 'active',
        workspace_key: goal.workspace_key || null,
        workspace_label: goal.workspace_name || goal.workspace_key || null,
        href: '/operations?view=students&section=group_goal',
      })),
    ].sort((a, b) => Date.parse(a.starts_at || 0) - Date.parse(b.starts_at || 0));

    res.json({ events, project: projectKey || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/content-prompts', requireAdmin, async (req, res) => {
  try {
    await ensureDefaultContentPrompts();
    const prompts = await pool.query(
      `SELECT p.*,
        COALESCE(
          json_agg(e.* ORDER BY e.created_at DESC) FILTER (WHERE e.id IS NOT NULL),
          '[]'
        ) AS examples
       FROM bna_content_prompts p
       LEFT JOIN bna_content_prompt_examples e ON e.platform = p.platform AND e.status = 'active'
       GROUP BY p.id
       ORDER BY p.id ASC`
    );
    res.json({ prompts: prompts.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bna/content-prompts/:platform', requireAdmin, async (req, res) => {
  const platform = parseOutputType(req.params.platform);
  const { prompt_text, change_note, updated_by = 'operator' } = req.body || {};
  if (!prompt_text) return res.status(400).json({ error: 'prompt_text is required' });

  try {
    const existing = (await pool.query('SELECT * FROM bna_content_prompts WHERE platform = $1', [platform])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Prompt not found' });
    const nextVersion = Number(existing.version || 1) + 1;
    const updated = await pool.query(
      `UPDATE bna_content_prompts
       SET prompt_text = $1, version = $2, updated_by = $3, updated_at = NOW()
       WHERE platform = $4
       RETURNING *`,
      [prompt_text, nextVersion, updated_by, platform]
    );
    await pool.query(
      `INSERT INTO bna_content_prompt_versions (prompt_id, version, prompt_text, change_note, updated_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [existing.id, nextVersion, prompt_text, change_note || null, updated_by]
    );
    res.json({ success: true, prompt: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bna/group-goal-entries/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bna_group_goal_entries WHERE id = $1 RETURNING *',
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Group goal entry not found' });
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/content-prompts/:platform/examples', requireAdmin, async (req, res) => {
  const platform = parseOutputType(req.params.platform);
  const { title, body, file_url } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const defaultWorkspace = await getDefaultSchoolWorkspace(pool);
    const result = await pool.query(
      `INSERT INTO bna_content_prompt_examples (workspace_id, platform, title, body, file_url, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [defaultWorkspace.id, platform, title, body || null, file_url || null]
    );
    res.json({ success: true, example: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/content-bundles', requireAdmin, async (req, res) => {
  const { project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = ["b.status <> 'archived'"];

  if (projectKey) {
    params.push(projectKey);
    conditions.push(`COALESCE(p.project_key, w.workspace_key, '') = $${params.length}`);
  }

  try {
    await ensureDefaultProjects();
    const result = await pool.query(
      `SELECT b.*,
        p.project_key,
        p.name AS project_name,
        p.short_name AS project_short_name,
        w.workspace_key,
        w.workspace_type,
        w.name AS workspace_name,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', j.id,
              'title', j.title,
              'mime_type', j.mime_type,
              'created_at', j.created_at,
              'status', j.status,
              'summary', COALESCE(
                j.parse_json->>'summary',
                j.parse_json->'mixed_recording_parse'->'report'->>'summary',
                NULLIF(j.caption, ''),
                NULLIF(j.notes, '')
              ),
              'drive_stage', j.drive_stage
            )
            ORDER BY j.created_at DESC
          )
          FROM bna_content_bundle_items i
          JOIN bna_content_jobs j ON j.id = i.content_job_id
          WHERE i.bundle_id = b.id
        ), '[]'::json) AS jobs,
        COALESCE((
          SELECT json_agg(o.* ORDER BY o.created_at DESC)
          FROM bna_content_outputs o
          WHERE o.bundle_id = b.id
            AND o.status <> 'archived'
        ), '[]'::json) AS outputs
       FROM bna_content_bundles b
       LEFT JOIN bna_workspaces w ON w.id = b.workspace_id
       LEFT JOIN LATERAL (
         SELECT p.project_key, p.name, p.short_name
         FROM bna_projects p
         WHERE p.workspace_id = b.workspace_id
         ORDER BY p.id ASC
         LIMIT 1
       ) p ON TRUE
       WHERE ${conditions.join(' AND ')}
       ORDER BY b.created_at DESC
       LIMIT 20`,
      params
    );
    res.json({ bundles: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bna/content-bundles/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowedFields = ['title', 'notes', 'status', 'start_date', 'end_date'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.includes(key)) continue;
    if (key === 'status' && !['draft', 'generated', 'approved', 'sent', 'archived'].includes(String(value || ''))) continue;
    values.push(value || null);
    fields.push(`${key} = $${values.length}`);
  }

  if (!fields.length) return res.status(400).json({ error: 'No valid bundle fields provided' });
  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE bna_content_bundles
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Bundle not found' });
    res.json({ success: true, bundle: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/content-bundles', requireAdmin, async (req, res) => {
  const { title, start_date, end_date, job_ids = [], notes } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ids = job_ids.map(Number).filter(Boolean);
    const defaultWorkspace = await getDefaultSchoolWorkspace(client);
    const selectedJobs = ids.length
      ? (await client.query(
          'SELECT id, workspace_id FROM bna_content_jobs WHERE id = ANY($1::int[]) ORDER BY created_at ASC',
          [ids]
        )).rows
      : [];
    const selectedWorkspaceId = assertContentJobsSingleWorkspace(selectedJobs);
    const requestedWorkspaceId = Number(req.body?.workspace_id || req.body?.workspaceId || 0) || null;
    if (requestedWorkspaceId && selectedWorkspaceId && requestedWorkspaceId !== selectedWorkspaceId) {
      const error = new Error('Requested bundle workspace does not match selected content jobs.');
      error.statusCode = 400;
      throw error;
    }
    const workspaceId = requestedWorkspaceId || selectedWorkspaceId || defaultWorkspace.id;
    const bundle = (await client.query(
      `INSERT INTO bna_content_bundles (workspace_id, title, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [workspaceId, title, start_date || null, end_date || null, notes || null]
    )).rows[0];
    for (const jobId of ids) {
      await client.query(
        `INSERT INTO bna_content_bundle_items (workspace_id, bundle_id, content_job_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (bundle_id, content_job_id) DO NOTHING`,
        [workspaceId, bundle.id, jobId]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, bundle });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/bna/content-bundles/:id/generate', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { instruction = '' } = req.body || {};
  try {
    const bundle = (await pool.query('SELECT * FROM bna_content_bundles WHERE id = $1', [id])).rows[0];
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' });
    const jobs = (await pool.query(
      `SELECT j.*
       FROM bna_content_bundle_items i
       JOIN bna_content_jobs j ON j.id = i.content_job_id
       WHERE i.bundle_id = $1
       ORDER BY j.created_at ASC`,
      [id]
    )).rows;
    if (!jobs.length) return res.status(400).json({ error: 'Bundle has no content items' });
    assertContentJobsSingleWorkspace(jobs);

    const { prompt, examples } = await getPromptBundle('weekly_newsletter');
    const draft = await generateDraftWithPrompt({ outputType: 'weekly_newsletter', prompt, examples, jobs, instruction });
    const output = (await pool.query(
      `INSERT INTO bna_content_outputs (workspace_id, job_id, output_type, title, body, platform, status, metadata, prompt_id, prompt_version, bundle_id)
       VALUES ($1, $2, 'weekly_newsletter', $3, $4, 'email', 'needs_approval', $5, $6, $7, $8)
       RETURNING *`,
      [
        bundle.workspace_id || jobs[0].workspace_id || null,
        jobs[0].id,
        `${bundle.title} newsletter draft`,
        draft,
        JSON.stringify({
          bundle_id: bundle.id,
          job_ids: jobs.map((job) => job.id),
          ai_provider: CONTENT_AI_PROVIDER,
          ai_model: CONTENT_AI_MODEL,
        }),
        prompt.id,
        prompt.version,
        bundle.id,
      ]
    )).rows[0];
    await pool.query("UPDATE bna_content_bundles SET status = 'generated', updated_at = NOW() WHERE id = $1", [id]);
    res.json({ success: true, output, prompt });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/content-jobs', requireAdmin, async (req, res) => {
  const {
    title,
    source_type = 'manual',
    source_message_id,
    source_chat_id,
    local_path,
    media_url,
    drive_file_id,
    drive_folder_id,
    drive_stage,
    mime_type,
    caption,
    status = 'ingested',
    transcript_text,
    transcript_json,
    parse_json,
    notes,
    outputs = [],
  } = req.body || {};

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const driveRouting = await resolveContentWorkspaceRouting(req, {
      ...req.body,
      title,
      caption,
      notes,
      transcript_text,
      drive_folder_id,
      drive_stage,
    }, client);
    const jobResult = await client.query(
      `INSERT INTO bna_content_jobs (
        workspace_id, title, source_type, source_message_id, source_chat_id, local_path, media_url,
        drive_file_id, drive_folder_id, drive_stage,
        mime_type, caption, status, transcript_text, transcript_json, parse_json, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        driveRouting.workspaceId,
        title,
        source_type,
        source_message_id || null,
        source_chat_id || null,
        local_path || null,
        media_url || null,
        drive_file_id || null,
        driveRouting.driveFolderId,
        driveRouting.driveStage,
        mime_type || null,
        caption || null,
        status,
        transcript_text || null,
        transcript_json ? JSON.stringify(transcript_json) : null,
        parse_json ? JSON.stringify(parse_json) : null,
        notes || null,
      ]
    );

    const job = jobResult.rows[0];
    const createdOutputs = [];
    for (const output of outputs) {
      const outputResult = await client.query(
        `INSERT INTO bna_content_outputs (workspace_id, job_id, output_type, title, body, platform, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          job.workspace_id || null,
          job.id,
          output.output_type,
          output.title || null,
          output.body || null,
          output.platform || null,
          output.status || 'draft',
          output.metadata ? JSON.stringify(output.metadata) : null,
        ]
      );
      createdOutputs.push(outputResult.rows[0]);
    }
    await upsertClassSessionFromContentJob(client, job);

    await client.query('COMMIT');
    res.json({ success: true, job, outputs: createdOutputs });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.patch('/api/bna/content-jobs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existingJobContext = await assertContentJobAccess(req, id);
    if (!existingJobContext) return res.status(404).json({ error: 'Content job not found' });
    const allowedFields = [
      'title',
      'status',
      'transcript_text',
      'transcript_json',
      'parse_json',
      'drive_file_id',
      'drive_folder_id',
      'drive_stage',
      'notes',
    ];
    const fields = [];
    const values = [];
    const body = { ...(req.body || {}) };

    if (Object.prototype.hasOwnProperty.call(body, 'drive_folder_id') || Object.prototype.hasOwnProperty.call(body, 'drive_stage')) {
      const driveRouting = await resolveContentWorkspaceRouting(req, {
        ...body,
        project: existingJobContext.project_key || existingJobContext.workspace_key,
        workspace_id: existingJobContext.workspace_id,
      }, pool);
      if (Object.prototype.hasOwnProperty.call(body, 'drive_folder_id')) body.drive_folder_id = driveRouting.driveFolderId;
      if (Object.prototype.hasOwnProperty.call(body, 'drive_stage')) body.drive_stage = driveRouting.driveStage;
    }

    for (const [key, value] of Object.entries(body)) {
      if (!allowedFields.includes(key)) continue;
      values.push(['transcript_json', 'parse_json'].includes(key) && value ? JSON.stringify(value) : value);
      fields.push(`${key} = $${values.length}`);
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'No valid content job fields provided' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE bna_content_jobs
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    await upsertClassSessionFromContentJob(pool, result.rows[0]);
    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/content-jobs/bulk-generate', requireAdmin, async (req, res) => {
  const { job_ids = [], output_type, instruction = '' } = req.body || {};
  const ids = [...new Set((Array.isArray(job_ids) ? job_ids : []).map(Number).filter(Boolean))];
  const targetType = parseOutputType(output_type);

  if (!ids.length) {
    return res.status(400).json({ error: 'job_ids must include at least one content item' });
  }
  if (!targetType) {
    return res.status(400).json({ error: 'output_type is required' });
  }

  try {
    const jobs = (await pool.query(
      `SELECT *
       FROM bna_content_jobs
       WHERE id = ANY($1::int[])
         AND status <> 'archived'
       ORDER BY created_at ASC`,
      [ids]
    )).rows;
    if (!jobs.length) return res.status(404).json({ error: 'No matching content items found' });
    assertContentJobsSingleWorkspace(jobs);

    const { prompt, examples } = await getPromptBundle(targetType);
    const body = await generateDraftWithPrompt({
      outputType: targetType,
      prompt,
      examples,
      jobs,
      instruction,
    });
    const title = `${outputTypeLabel(targetType)} draft from ${jobs.length} content item${jobs.length === 1 ? '' : 's'}`;
    const metadata = {
      generated_at: new Date().toISOString(),
      source: 'content_multi_select',
      job_ids: jobs.map((job) => job.id),
      requested_job_ids: ids,
      prompt_version: prompt.version,
      ai_provider: CONTENT_AI_PROVIDER,
      ai_model: CONTENT_AI_MODEL,
      instruction,
    };
    const output = (await pool.query(
      `INSERT INTO bna_content_outputs (workspace_id, job_id, output_type, title, body, platform, status, metadata, prompt_id, prompt_version)
       VALUES ($1, $2, $3, $4, $5, $6, 'needs_approval', $7, $8, $9)
       RETURNING *`,
      [
        jobs[0].workspace_id || null,
        jobs[0].id,
        targetType,
        title,
        body,
        platformForOutputType(targetType),
        JSON.stringify(metadata),
        prompt.id,
        prompt.version,
      ]
    )).rows[0];

    await pool.query(
      `UPDATE bna_content_jobs
       SET status = 'needs_approval', updated_at = NOW()
       WHERE id = ANY($1::int[])
         AND status <> 'published'`,
      [jobs.map((job) => job.id)]
    );

    res.json({
      success: true,
      output,
      jobs,
      prompt: {
        id: prompt.id,
        platform: prompt.platform,
        version: prompt.version,
        updated_at: prompt.updated_at,
      },
      message: `${outputTypeLabel(targetType)} generated from ${jobs.length} selected content item${jobs.length === 1 ? '' : 's'} using prompt v${prompt.version}.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/content-jobs/:id/parse-mixed-recording', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    dry_run = false,
    force = false,
    instruction = '',
    archive_source_after_parse = false,
  } = req.body || {};

  try {
    const job = (await pool.query('SELECT * FROM bna_content_jobs WHERE id = $1', [id])).rows[0];
    if (!job) return res.status(404).json({ error: 'Content job not found' });
    await assertContentJobAccess(req, id);
    if (!String(job.transcript_text || '').trim()) {
      return res.status(400).json({ error: 'Content job does not have a transcript yet' });
    }
    const defaultSchoolWorkspace = await getDefaultSchoolWorkspace(pool);
    job.workspace_id = job.workspace_id || defaultSchoolWorkspace.id;
    const jobProjectKey = await projectKeyForWorkspaceId(job.workspace_id, DEFAULT_PROJECT_KEY, pool);
    const previousParse = typeof job.parse_json === 'string' ? safeJsonParse(job.parse_json) : (job.parse_json || {});
    if (!dry_run && !force && previousParse?.mixed_recording_parse?.parsed_at) {
      if (archive_source_after_parse && job.status !== 'archived') {
        await pool.query(
          `UPDATE bna_content_jobs
           SET status = 'archived',
               drive_stage = '04 Parsed',
               updated_at = NOW()
           WHERE id = $1`,
          [job.id]
        );
      }
      return res.json({
        success: true,
        skipped: true,
        dry_run: false,
        message: 'This recording was already parsed. Use force if you intentionally want to reparse and refresh source-linked records.',
        report: previousParse.mixed_recording_parse.report || {},
        counts: previousParse.mixed_recording_parse.counts || {},
      });
    }

    const students = (await pool.query(
      `SELECT *
       FROM bna_students
       WHERE COALESCE(status, 'active') NOT IN ('archived', 'inactive')
         AND workspace_id = $1
       ORDER BY name ASC`,
      [job.workspace_id]
    )).rows;

    const parsed = await generateMixedRecordingParse({
      job: {
        ...job,
        transcript_text: [
          instruction ? `Operator instruction:\n${instruction}\n\n` : '',
          job.transcript_text,
        ].join(''),
      },
      students,
    });

    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks.slice(0, 30) : [];
    const accountabilityEvents = Array.isArray(parsed.accountability_events) ? parsed.accountability_events.slice(0, 60) : [];
    const groupEntries = Array.isArray(parsed.group_goal_entries) ? parsed.group_goal_entries.slice(0, 60) : [];
    const dailyTorahUpdates = Array.isArray(parsed.daily_torah_updates) ? parsed.daily_torah_updates.slice(0, 60) : [];
    const classNotes = Array.isArray(parsed.class_notes) ? parsed.class_notes.slice(0, 20) : [];
    const report = parsed.report || {};

    if (dry_run) {
      return res.json({
        success: true,
        dry_run: true,
        parsed: { tasks, accountability_events: accountabilityEvents, group_goal_entries: groupEntries, daily_torah_updates: dailyTorahUpdates, class_notes: classNotes, report },
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const createdTasks = [];
      const createdEvents = [];
      const createdGroupEntries = [];
      const createdTorahEntries = [];
      const createdDailyTorahUpdates = [];
      const goal = groupEntries.length ? await ensureDefaultGroupGoal(client) : null;

      for (const task of tasks) {
        if (!task?.title) continue;
        const title = String(task.title).slice(0, 240);
        const taskText = [
          title,
          task.notes,
          task.original_text,
          task.source_text,
          job.title,
          job.caption,
        ].filter(Boolean).join('\n');
        const parserItemKey = mixedRecordingParserItemKey(job.id, 'task', [
          title,
          task.notes,
          task.original_text,
          task.source_text,
          task.project,
          task.project_key,
          task.assigned_to,
        ]);
        const inserted = await createTaskFromText({
          title,
          raw_text: task.original_text || task.source_text || task.notes || title,
          notes: task.notes || `Extracted from content job #${job.id}: ${job.title || 'Untitled recording'}`,
          stage: 'ready',
          category: safeTaskCategory(task.category || inferTaskCategory(taskText)),
          urgency: safeTaskUrgency(task.urgency),
          source: 'content_job',
          source_context: {
            content_job_id: job.id,
            parser: 'mixed-recording-v1',
            parser_lane: 'task',
            parser_item_key: parserItemKey,
            source_workspace_id: job.workspace_id || null,
          },
          created_by: 'mixed-recording-parser',
          assigned_to: safeTaskOwner(task.assigned_to, task),
          project: task.project || task.project_key || inferProjectKeyFromText(taskText, jobProjectKey),
          decision_required: Boolean(task.decision_required),
          ai_parsed: mixedRecordingParserMetadata(job, 'task', parserItemKey, task),
        }, {}, client);
        createdTasks.push(inserted);
      }

      for (const event of accountabilityEvents) {
        if (!event?.title) continue;
        const matchedStudent = event.student_id
          ? students.find((student) => Number(student.id) === Number(event.student_id))
          : findStudentForParsedName(event.student_name, students);
        const eventType = safeAccountabilityEventType(event.event_type);
        const title = String(event.title).slice(0, 240);
        const parserItemKey = mixedRecordingParserItemKey(job.id, 'accountability_event', [
          eventType,
          matchedStudent?.id || event.student_id || event.student_name,
          title,
          event.notes,
          event.topic,
          event.question_text,
          event.next_check_in_date,
          event.progress_percent,
        ]);
        const inserted = await upsertMixedRecordingAccountabilityEvent(client, {
          workspace_id: matchedStudent?.workspace_id || job.workspace_id || null,
          event_type: eventType,
          student_id: matchedStudent?.id || null,
          student_name: matchedStudent?.name || event.student_name || null,
          title,
          notes: event.notes || null,
          topic: event.topic || null,
          question_text: event.question_text || null,
          goal_target_value: event.goal_target_value || null,
          goal_actual_value: event.goal_actual_value || null,
          goal_unit: event.goal_unit || null,
          progress_percent: event.progress_percent,
          attendance_status: event.attendance_status || null,
          next_check_in_date: event.next_check_in_date || null,
          engagement_level: event.engagement_level || null,
          follow_up_required: Boolean(event.follow_up_required),
          metadata: mixedRecordingParserMetadata(job, 'accountability_event', parserItemKey, event),
          source_message_id: String(job.id),
          source_media_url: job.media_url || null,
        });
        createdEvents.push(inserted);
      }

      for (const entry of groupEntries) {
        const matchedStudent = entry.student_id
          ? students.find((student) => Number(student.id) === Number(entry.student_id))
          : findStudentForParsedName(entry.student_name, students);
        const entryDate = toIsoDateValue(entry.recorded_date || getTodayDateInTimeZone());
        let activeTorahGoal = null;
        if (matchedStudent) {
          await ensureTorahGoalsForDate(entryDate, client);
          activeTorahGoal = await getTorahGoalForDate(matchedStudent.id, entryDate, client);
        }
        const targetMinutes = Number(entry.target_minutes || goal.target_minutes || activeTorahGoal?.goal_minutes || DEFAULT_TORAH_GOAL_MINUTES) || null;
        const mapping = normalizeParsedTorahEngagement(
          {
            ...entry,
            goal_minutes: targetMinutes,
            goal_type: GOAL_TYPES.INSIDE,
            inside_engaged_minutes: entry.inside_engaged_minutes ?? entry.inside_following_minutes,
            listening_without_following_minutes: entry.listening_without_following_minutes ?? entry.inside_listening_minutes,
          },
          {
            goalMinutes: targetMinutes || DEFAULT_TORAH_GOAL_MINUTES,
            goalType: GOAL_TYPES.INSIDE,
          }
        );
        const storedInsideFollowingMinutes = mapping.hasTimerBreakdown
          ? mapping.insideEngagedMinutes
          : Number(entry.inside_following_minutes || entry.inside_engaged_minutes || 0);
        const storedInsideListeningMinutes = mapping.hasTimerBreakdown
          ? mapping.listeningWithoutFollowingMinutes
          : Number(entry.inside_listening_minutes || entry.listening_without_following_minutes || 0);
        const computed = calculateWeightedGoal({
          target_minutes: targetMinutes,
          inside_following_minutes: storedInsideFollowingMinutes,
          inside_listening_minutes: storedInsideListeningMinutes,
        });
        const explicitProgress = clampProgressPercent(entry.progress_percent);
        const progressPercent = explicitProgress !== null ? explicitProgress : computed.progress;
        const parserItemKey = mixedRecordingParserItemKey(job.id, 'group_goal_entry', [
          matchedStudent?.id || entry.student_id || entry.student_name,
          entryDate,
          targetMinutes,
          storedInsideFollowingMinutes,
          storedInsideListeningMinutes,
          mapping.distractedMinutes,
          progressPercent,
          entry.notes,
        ]);
        const inserted = await upsertMixedRecordingGroupGoalEntry(client, {
          workspace_id: matchedStudent?.workspace_id || goal.workspace_id || job.workspace_id || null,
          goal_id: goal.id,
          student_id: matchedStudent?.id || null,
          student_name: matchedStudent?.name || entry.student_name || null,
          recorded_date: entryDate,
          target_minutes: targetMinutes,
          inside_following_minutes: storedInsideFollowingMinutes,
          inside_listening_minutes: storedInsideListeningMinutes,
          distracted_minutes: mapping.distractedMinutes,
          weighted_minutes: computed.weighted,
          progress_percent: progressPercent,
          notes: entry.notes || null,
          source_content_job_id: job.id,
          metadata: mixedRecordingParserMetadata(job, 'group_goal_entry', parserItemKey, entry, {
            timer_mapping: mapping,
          }),
        });
        createdGroupEntries.push(inserted);

        if (matchedStudent && targetMinutes && mapping.hasProgressSignal) {
          const torahEntry = await upsertTorahLearningEntry(
            {
              student_id: matchedStudent.id,
              date: entryDate,
              goal_minutes: mapping.goalMinutes,
              goal_type: mapping.goalType,
              engaged_listening_minutes: mapping.engagedListeningMinutes,
              inside_engaged_minutes: mapping.insideEngagedMinutes,
              listening_without_following_minutes: mapping.listeningWithoutFollowingMinutes,
              note: buildTorahTimerNote(entry.notes || null, mapping, job),
            },
            client
          );
          createdTorahEntries.push(torahEntry);
          const timerEvent = await insertTorahTimerAccountabilityEvent(client, {
            student: matchedStudent,
            job,
            sourceUpdate: entry,
            torahRecord: torahEntry,
            groupGoalEntry: inserted,
            mapping,
            parserItemKey: mixedRecordingParserItemKey(job.id, 'torah_timer_event', [
              matchedStudent.id,
              entryDate,
              'group_goal_entry',
              parserItemKey,
            ]),
          });
          if (timerEvent) createdEvents.push(timerEvent);
        }
      }

      for (const update of dailyTorahUpdates) {
        const updateItemKey = mixedRecordingParserItemKey(job.id, 'daily_torah_update', [
          update.student_id,
          update.student_name,
          update.all_active_students,
          update.date || getTodayDateInTimeZone(),
          update.goal_minutes,
          update.goal_type,
          update.engaged_listening_minutes,
          update.inside_engaged_minutes,
          update.listening_without_following_minutes,
          update.distracted_minutes,
          update.daily_completion_percentage,
          update.completed_daily_units_delta,
          update.notes,
        ]);
        const savedUpdates = await upsertParsedDailyTorahUpdate(update, students, job, client);
        createdDailyTorahUpdates.push(...savedUpdates);
        for (const savedUpdate of savedUpdates) {
          const timerEvent = await insertTorahTimerAccountabilityEvent(client, {
            student: savedUpdate.student,
            job,
            sourceUpdate: update,
            torahRecord: savedUpdate,
            mapping: savedUpdate.parser_timer_mapping,
            parserItemKey: mixedRecordingParserItemKey(job.id, 'torah_timer_event', [
              savedUpdate.student?.id,
              savedUpdate.entry?.date,
              'daily_torah_update',
              updateItemKey,
            ]),
          });
          if (timerEvent) createdEvents.push(timerEvent);
        }
      }

      const nextParse = {
        ...previousParse,
        mixed_recording_parse: {
          parsed_at: new Date().toISOString(),
          report,
          class_notes: classNotes,
          counts: {
            tasks: createdTasks.length,
            accountability_events: createdEvents.length,
            group_goal_entries: createdGroupEntries.length,
            daily_torah_updates: createdDailyTorahUpdates.length,
            torah_learning_entries: createdTorahEntries.length + createdDailyTorahUpdates.length,
          },
        },
      };
      await client.query(
        `UPDATE bna_content_jobs
         SET parse_json = $1,
             drive_stage = '04 Parsed',
             status = CASE WHEN $3 THEN 'archived' ELSE status END,
             updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(nextParse), job.id, Boolean(archive_source_after_parse)]
      );
      await upsertClassSessionFromContentJob(client, {
        ...job,
        parse_json: nextParse,
        status: archive_source_after_parse ? 'archived' : job.status,
        drive_stage: '04 Parsed',
      });

      await client.query('COMMIT');
      return res.json({
        success: true,
        dry_run: false,
        report,
        class_notes: classNotes,
        created: {
          tasks: createdTasks,
          accountability_events: createdEvents,
          group_goal_entries: createdGroupEntries,
          daily_torah_updates: createdDailyTorahUpdates,
          torah_learning_entries: [...createdTorahEntries, ...createdDailyTorahUpdates],
        },
        counts: {
          tasks: createdTasks.length,
          accountability_events: createdEvents.length,
          group_goal_entries: createdGroupEntries.length,
          daily_torah_updates: createdDailyTorahUpdates.length,
          torah_learning_entries: createdTorahEntries.length + createdDailyTorahUpdates.length,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/content-jobs/:id/outputs', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { output_type, title, body, platform, status = 'draft', metadata } = req.body || {};

  if (!output_type) {
    return res.status(400).json({ error: 'output_type is required' });
  }

  try {
    await assertContentJobAccess(req, id);
    const job = (await pool.query('SELECT workspace_id FROM bna_content_jobs WHERE id = $1', [id])).rows[0];
    if (!job) return res.status(404).json({ error: 'Content job not found' });
    const result = await pool.query(
      `INSERT INTO bna_content_outputs (workspace_id, job_id, output_type, title, body, platform, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [job.workspace_id || null, id, output_type, title || null, body || null, platform || null, status, metadata ? JSON.stringify(metadata) : null]
    );
    res.json({ success: true, output: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/content-outputs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowedFields = ['title', 'body', 'platform', 'status', 'metadata', 'prompt_id', 'prompt_version', 'bundle_id'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.includes(key)) continue;
    values.push(key === 'metadata' && value ? JSON.stringify(value) : value);
    fields.push(`${key} = $${values.length}`);
  }

  if (req.body?.status === 'approved') fields.push('approved_at = NOW()');
  if (req.body?.status === 'published') fields.push('published_at = NOW()');

  if (!fields.length) {
    return res.status(400).json({ error: 'No valid content output fields provided' });
  }

  values.push(id);

  try {
    const outputContext = (await pool.query('SELECT job_id FROM bna_content_outputs WHERE id = $1', [id])).rows[0];
    if (!outputContext) return res.status(404).json({ error: 'Content output not found' });
    await assertContentJobAccess(req, outputContext.job_id);
    const result = await pool.query(
      `UPDATE bna_content_outputs
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    if (['approved', 'published'].includes(String(result.rows[0]?.status || ''))) {
      await saveApprovedOutputAsExample(result.rows[0]);
    }
    res.json({ success: true, output: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/content-outputs/:id/actions', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body || {};

  try {
    const output = (await pool.query('SELECT * FROM bna_content_outputs WHERE id = $1', [id])).rows[0];
    if (!output) return res.status(404).json({ error: 'Content output not found' });
    await assertContentJobAccess(req, output.job_id);
    const job = (await pool.query('SELECT * FROM bna_content_jobs WHERE id = $1', [output.job_id])).rows[0];

    if (action === 'approve_publish') {
      const metadata = safeJsonParse(output.metadata) || {};
      let publishResult = null;

      if (output.output_type === 'facebook_post') {
        try {
          publishResult = await createFacebookDraftFromContent(job, output);
          metadata.ghl_facebook_draft_created_at = new Date().toISOString();
          metadata.ghl_account_id = publishResult.account.id;
          metadata.ghl_account_name = publishResult.account.name;
          metadata.ghl_result = publishResult.created;
          metadata.media_uploaded = publishResult.media.length > 0;
        } catch (err) {
          return res.status(err.status === 401 ? 502 : err.status || 500).json({
            error: err.message,
            endpoint: err.endpoint || null,
            hint: err.hint || null,
            ghl_status: err.status || null,
            ghl_body: err.body ? String(err.body).slice(0, 500) : null,
          });
        }
      }

      if (output.output_type === 'blog_draft') {
        publishResult = publishWebsiteBlogFromOutput(output, job);
        metadata.website_blog = {
          ...(metadata.website_blog || {}),
          ...publishResult,
          published_to_website_at: new Date().toISOString(),
        };
      }

      const marksExternalPublish = ['facebook_post', 'blog_draft'].includes(output.output_type);
      const nextStatus = marksExternalPublish ? 'published' : 'approved';
      const updated = (await pool.query(
        `UPDATE bna_content_outputs
         SET status = $3,
             metadata = $1,
             approved_at = COALESCE(approved_at, NOW()),
             published_at = CASE WHEN $3 = 'published' THEN NOW() ELSE published_at END,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(metadata), id, nextStatus]
      )).rows[0];
      await saveApprovedOutputAsExample(updated);
      return res.json({
        success: true,
        output: updated,
        message: output.output_type === 'facebook_post'
          ? `Facebook draft created in GHL for ${publishResult?.account?.name || 'Facebook'}.`
          : output.output_type === 'blog_draft'
            ? `Website blog published at ${publishResult?.url || '/blog'}.`
            : `${outputTypeLabel(output.output_type)} approved and saved as an example.`,
        result: publishResult?.created || publishResult || null,
      });
    }

    return res.status(400).json({ error: 'Unknown content output action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/ghl-social/diagnostics', requireAdmin, async (req, res) => {
  if (!GHL_PIT_TOKEN) {
    return res.status(503).json({
      configured: false,
      error: 'GHL_PIT_TOKEN is not configured',
    });
  }

  try {
    const accounts = await listGhlSocialAccounts();
    const usersData = await ghlSocialRequest(`/users/?locationId=${encodeURIComponent(GHL_LOCATION_ID)}`);
    let postsList = null;
    let postsListError = null;

    try {
      postsList = await ghlSocialRequest(`/social-media-posting/${GHL_LOCATION_ID}/posts/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: '1', type: 'all' }),
      });
    } catch (err) {
      postsListError = {
        status: err.status || 500,
        error: err.message,
        hint: err.hint || null,
      };
    }

    res.json({
      configured: true,
      location_id: GHL_LOCATION_ID,
      default_facebook_account_id: GHL_DEFAULT_FACEBOOK_ACCOUNT_ID || null,
      default_facebook_account_configured: Boolean(GHL_DEFAULT_FACEBOOK_ACCOUNT_ID),
      facebook_accounts: accounts
        .filter((account) => String(account.platform || '').toLowerCase() === 'facebook')
        .map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          isExpired: Boolean(account.isExpired),
          deleted: Boolean(account.deleted),
        })),
      other_accounts: accounts
        .filter((account) => String(account.platform || '').toLowerCase() !== 'facebook')
        .map((account) => ({
          platform: account.platform,
          name: account.name,
          type: account.type,
          isExpired: Boolean(account.isExpired),
        })),
      users: (usersData?.users || []).map((user) => ({
        id: user.id,
        name: user.name,
        role: user.roles?.role || null,
      })),
      posts_read_check: postsListError || {
        ok: true,
        statusCode: postsList?.statusCode || null,
        message: postsList?.message || null,
      },
      post_write_scope_required: 'socialplanner/post.write',
    });
  } catch (err) {
    res.status(err.status || 500).json({
      configured: true,
      error: err.message,
      endpoint: err.endpoint || null,
      hint: err.hint || null,
    });
  }
});

app.post('/api/bna/content-jobs/:id/actions', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { action, output_type, instruction = '' } = req.body || {};

  try {
    const jobResult = await pool.query('SELECT * FROM bna_content_jobs WHERE id = $1', [id]);
    const job = jobResult.rows[0];
    if (!job) return res.status(404).json({ error: 'Content job not found' });
    await assertContentJobAccess(req, id);

    const outputsResult = await pool.query(
      `SELECT * FROM bna_content_outputs
       WHERE job_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    const outputs = outputsResult.rows;

    if (action === 'generate_output' || action === 'regenerate_output') {
      const targetType = parseOutputType(output_type);
      const { prompt, examples } = await getPromptBundle(targetType);
      const body = await generateDraftWithPrompt({ outputType: targetType, prompt, examples, jobs: [job], instruction });
      const title = `${outputTypeLabel(targetType)} draft`;
      const metadata = {
        generated_at: new Date().toISOString(),
        source: 'content_prompt_studio',
        prompt_version: prompt.version,
        ai_provider: CONTENT_AI_PROVIDER,
        ai_model: CONTENT_AI_MODEL,
        instruction,
      };
      const existing = outputs.find((item) => item.output_type === targetType && item.status !== 'archived');
      const result = existing
        ? await pool.query(
          `UPDATE bna_content_outputs
           SET title = $1,
               body = $2,
               platform = $3,
               status = 'needs_approval',
               metadata = $4,
               prompt_id = $5,
               prompt_version = $6,
               updated_at = NOW()
           WHERE id = $7
           RETURNING *`,
          [title, body, platformForOutputType(targetType), JSON.stringify(metadata), prompt.id, prompt.version, existing.id]
        )
        : await pool.query(
          `INSERT INTO bna_content_outputs (workspace_id, job_id, output_type, title, body, platform, status, metadata, prompt_id, prompt_version)
           VALUES ($1, $2, $3, $4, $5, $6, 'needs_approval', $7, $8, $9)
           RETURNING *`,
          [job.workspace_id || null, job.id, targetType, title, body, platformForOutputType(targetType), JSON.stringify(metadata), prompt.id, prompt.version]
        );

      await pool.query(
        `UPDATE bna_content_jobs
         SET status = 'needs_approval', updated_at = NOW()
         WHERE id = $1 AND status <> 'published'`,
        [job.id]
      );

      return res.json({
        success: true,
        output: result.rows[0],
        prompt: {
          id: prompt.id,
          platform: prompt.platform,
          version: prompt.version,
          updated_at: prompt.updated_at,
        },
        message: `${outputTypeLabel(targetType)} generated with prompt v${prompt.version}.`,
      });
    }

    if (action === 'whatsapp_copy') {
      const output = outputs.find((item) =>
        item.output_type === 'whatsapp_update' && item.status !== 'archived' && item.body
      );
      if (!output) return res.status(404).json({ error: 'No WhatsApp draft found for this content job' });
      return res.json({ success: true, output_id: output.id, body: output.body });
    }

    if (action === 'facebook_draft') {
      const output = outputs.find((item) =>
        item.output_type === 'facebook_post' && item.status !== 'archived' && item.body
      );
      if (!output) return res.status(404).json({ error: 'No Facebook draft found for this content job' });

      let result;
      try {
        result = await createFacebookDraftFromContent(job, output);
      } catch (err) {
        return res.status(err.status === 401 ? 502 : err.status || 500).json({
          error: err.message,
          endpoint: err.endpoint || null,
          hint: err.hint || null,
          ghl_status: err.status || null,
          ghl_body: err.body ? String(err.body).slice(0, 500) : null,
        });
      }
      await pool.query(
        `UPDATE bna_content_outputs
         SET status = 'approved',
             metadata = $1,
             approved_at = COALESCE(approved_at, NOW()),
             updated_at = NOW()
         WHERE id = $2`,
        [
          JSON.stringify({
            ghl_facebook_draft_created_at: new Date().toISOString(),
            ghl_account_id: result.account.id,
            ghl_account_name: result.account.name,
            ghl_result: result.created,
            media_uploaded: result.media.length > 0,
          }),
          output.id,
        ]
      );
      return res.json({
        success: true,
        message: `Facebook draft created in GHL for ${result.account.name || 'Facebook'}.`,
        media_uploaded: result.media.length > 0,
        result: result.created,
      });
    }

    if (action === 'tasks_from_recording') {
      const transcriptNote = job.transcript_text
        ? `Transcript is stored on content job #${job.id}. Use it to extract clear Shloimie tasks and decisions.`
        : 'Transcript is not captured yet; wait for transcription before extracting tasks.';
      const task = await createTaskFromText({
        title: `Break recording into tasks: ${job.title || `Content job #${job.id}`}`,
        raw_text: [
          job.title,
          job.caption,
          job.notes,
          job.transcript_text ? job.transcript_text.slice(0, 1200) : '',
        ].filter(Boolean).join('\n'),
        notes: [
          transcriptNote,
          `Content job: #${job.id}`,
          job.media_url ? `Drive link: ${job.media_url}` : '',
          job.notes || '',
        ].filter(Boolean).join('\n'),
        stage: 'ready',
        category: 'operations',
        urgency: 'today',
        source: 'content_job',
        source_context: { content_job_id: job.id },
        created_by: 'dashboard',
        assigned_to: 'Codex',
        project: inferProjectKeyFromText(`${job.title || ''}\n${job.caption || ''}\n${job.notes || ''}`),
        ai_parsed: { parser: 'dashboard-action', action: 'tasks_from_recording' },
      });
      return res.json({
        success: true,
        message: 'Queued this recording for Codex to break into tasks.',
        task,
      });
    }

    return res.status(400).json({ error: 'Unknown content action' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BNA dashboard: payments
app.get('/api/bna/payments', requireAdmin, async (req, res) => {
  const { signup_id, project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = [];

  if (signup_id) {
    params.push(signup_id);
    conditions.push(`pay.signup_id = $${params.length}`);
  }

  addAccountingProjectCondition(conditions, params, projectKey, 'proj', 'w');
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT
        pay.*,
        row_to_json(s.*) AS signup,
        proj.project_key,
        proj.name AS project_name,
        proj.short_name AS project_short_name,
        w.workspace_key,
        w.workspace_type,
        w.name AS workspace_name
      FROM bna_payment_log pay
      LEFT JOIN signups s ON s.id = pay.signup_id
      LEFT JOIN bna_workspaces w ON w.id = COALESCE(pay.workspace_id, s.workspace_id)
      LEFT JOIN LATERAL (
        SELECT p.project_key, p.name, p.short_name
        FROM bna_projects p
        WHERE p.workspace_id = COALESCE(pay.workspace_id, s.workspace_id)
        ORDER BY p.id ASC
        LIMIT 1
      ) proj ON TRUE
      ${whereClause}
      ORDER BY pay.created_at DESC
      LIMIT 100`,
      params
    );
    res.json({ payments: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/payment-reminders/due', requireAdmin, async (req, res) => {
  try {
    const daysBefore = Number(req.query.days_before || req.query.daysBefore || PAYMENT_REMINDER_DAYS_BEFORE);
    const projectKey = accountingProjectKeyFromRequest(req);
    const { today, reminderTarget, candidates, project } = await getPaymentReminderCandidates({ daysBefore, projectKey });
    res.json({
      success: true,
      today,
      reminderTarget,
      daysBefore,
      project,
      found: candidates.length,
      reminders: candidates.map(summarizePaymentReminderCandidate),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/payment-reminders/run', requireAdmin, async (req, res) => {
  const dryRun = req.body?.dryRun !== false;
  const confirm = String(req.body?.confirm || '');
  const projectKey = accountingProjectKeyFromRequest(req, req.body || {});
  if (!dryRun && confirm !== 'SEND_REMINDERS') {
    return res.status(400).json({
      error: 'Live payment reminders require confirm: SEND_REMINDERS',
      hint: 'Run a dry run first, then resend with dryRun:false and confirm:"SEND_REMINDERS" if the preview is correct.',
    });
  }

  try {
    const result = await runPaymentReminderSweep({
      dryRun,
      daysBefore: Number(req.body?.daysBefore || PAYMENT_REMINDER_DAYS_BEFORE),
      projectKey,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/payments', requireAdmin, async (req, res) => {
  const {
    signup_id,
    amount,
    method,
    payment_type = 'registration',
    status = 'completed',
    received_by = 'operator',
    notes,
    confirm,
  } = req.body;

  if (!signup_id || !amount || !method) {
    return res.status(400).json({ error: 'signup_id, amount, and method are required' });
  }

  if (status === 'completed' && String(confirm || '') !== 'LOG_PAYMENT') {
    return res.status(400).json({
      error: 'Completed payment logs require confirm: LOG_PAYMENT',
      hint: 'Preview the selected workspace and payment details, then resend with confirm:"LOG_PAYMENT".',
    });
  }

  try {
    const projectKey = accountingProjectKeyFromRequest(req, req.body || {});
    const signup = await assertSignupAccountingAccess(req, signup_id, projectKey);
    const result = await pool.query(
      `INSERT INTO bna_payment_log (
        workspace_id, signup_id, payment_type, amount, method, status, received_by, received_at, notes
      )
       SELECT s.workspace_id, s.id, $2, $3, $4, $5, $6, NOW(), $7
       FROM signups s
       WHERE s.id = $1
       RETURNING *`,
      [signup_id, payment_type, amount, method, status, received_by, notes || null]
    );
    const payment = result.rows[0];
    if (!payment) {
      return res.status(404).json({ error: 'Signup not found for payment logging' });
    }

    if (status === 'completed') {
      await pool.query(
        `UPDATE signups
         SET payment_status = 'paid',
             payment_amount = $1,
             cash_received_at = CASE WHEN $2 = 'cash' THEN NOW() ELSE cash_received_at END,
             last_payment_at = NOW(),
             payment_due_date = (NOW()::date + COALESCE(payment_interval_days, $4) * INTERVAL '1 day')::date,
             payment_reminder_sent_at = NULL,
             updated_at = NOW()
         WHERE id = $3
           AND workspace_id IS NOT DISTINCT FROM $5`,
        [amount, method, signup_id, DEFAULT_PAYMENT_INTERVAL_DAYS, signup.workspace_id || null]
      );
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/cron/payment-reminders', async (req, res) => {
  const secret = req.query.secret || req.headers['x-cron-secret'];
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dryRun = String(req.query.dryRun || req.query.dry_run || '').toLowerCase() === 'true';
  if (!process.env.CRON_SECRET && !dryRun) {
    return res.status(403).json({
      error: 'CRON_SECRET is required before cron can send live payment reminders',
      hint: 'Use dryRun=true to preview, or set CRON_SECRET in Railway and pass it as x-cron-secret.',
    });
  }

  try {
    const projectKey = normalizeProjectKey(req.query.project || DEFAULT_PROJECT_KEY) || DEFAULT_PROJECT_KEY;
    const result = await runPaymentReminderSweep({ dryRun, projectKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/webhooks/green-invoice', async (req, res) => {
  const receivedAt = new Date().toISOString();

  try {
    const normalized = normalizeGreenInvoiceWebhookPayload(req.body || {}, req.headers || {});
    console.log('[green-invoice] received', {
      receivedAt,
      eventType: normalized.eventType,
      eventKey: normalized.eventKey,
      transactionId: normalized.transactionId,
      documentId: normalized.documentId,
      payerEmail: normalized.payerEmail,
      amount: normalized.amount,
    });

    const result = await processGreenInvoiceWebhook(req.body || {}, req.headers || {});
    res.json({
      success: true,
      matched: result.matched,
      duplicate: result.duplicate,
      webhookLogId: result.webhookLog?.id || null,
      paymentIntakeId: result.paymentIntakeId || null,
      paymentLogId: result.paymentLogId || null,
    });
    runGreenInvoiceFollowUps(result);
  } catch (err) {
    console.error('[green-invoice] webhook error', {
      receivedAt,
      error: err.message,
      webhookLogId: err.webhookLog?.id || null,
      eventKey: err.normalized?.eventKey || null,
    });
    res.status(500).json({ error: err.message });
  }
});

// Disabled duplicate retained for reference; the live webhook is the audited route above.
app.post('/api/webhooks/green-invoice-disabled-audited-duplicate', async (req, res) => {
  const signature = req.headers['x-green-invoice-signature'];
  if (process.env.GREEN_INVOICE_SECRET && signature) {
    // TODO: Implement signature verification when Green Invoice signing details are confirmed.
  }

  try {
    const result = await processGreenInvoiceWebhook(req.body, req.headers);
    await runGreenInvoiceFollowUps(result);
    res.status(result.ignored ? 202 : 200).json({
      success: true,
      duplicate: Boolean(result.duplicate),
      ignored: Boolean(result.ignored),
      matched: Boolean(result.matched),
      payment_intake_id: result.paymentIntakeId || null,
      payment_log_id: result.paymentLogId || null,
      webhook_log_id: result.webhookLog?.id || null,
      event_key: result.normalized?.eventKey || null,
    });
  } catch (err) {
    console.error('Green Invoice webhook error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      webhook_log_id: err.webhookLog?.id || null,
    });
  }
});

// Green Invoice webhook - normalized handler. Keep this before the legacy handler below.
app.post('/api/webhooks/green-invoice-disabled-normalized-legacy', async (req, res, next) => {
  const signature = req.headers['x-green-invoice-signature'];
  if (process.env.GREEN_INVOICE_SECRET && signature) {
    // TODO: Implement signature verification when Green Invoice signing details are confirmed.
  }

  const { email, payment_id, amount, status, name, phone, payment_url, green_invoice_url, raw_status } = normalizeGreenInvoiceWebhookPayload(req.body);
  const normalizedPhone = phone ? String(phone).replace(/\D/g, '') : '';

  try {
    if (status !== 'completed') {
      return res.json({ success: true, ignored: true, status, raw_status, message: 'Webhook was not a completed/paid payment event' });
    }

    const signupResult = await pool.query(
      `SELECT *
       FROM signups
       WHERE ($1::text IS NOT NULL AND lower(parent_email) = lower($1))
          OR ($2::text IS NOT NULL AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $2)
       ORDER BY created_at DESC
       LIMIT 1`,
      [email || null, normalizedPhone || null]
    );

    if (signupResult.rows.length === 0) {
      let ghlContactId = null;
      if (GHL_PIT_TOKEN && (email || phone || name)) {
        try {
          const nameParts = String(name || 'BNA Parent').trim().split(/\s+/);
          const firstName = nameParts.shift() || 'BNA';
          const lastName = nameParts.join(' ') || 'Parent';
          ghlContactId = await findOrCreateGHLContact(
            email || `${String(phone || Date.now()).replace(/\D/g, '')}@bna.payment-intake`,
            firstName,
            lastName,
            phone || '',
            { tags: ['BNA Parent', 'Payment Intake'] }
          );
          await addTagToContact(ghlContactId, 'BNA Parent');
          await addTagToContact(ghlContactId, 'Payment Intake');
        } catch (ghlErr) {
          console.error('Unmatched Green Invoice GHL sync error:', ghlErr);
        }
      }

      await createPaymentIntakeRecord({
        parent_name: name || null,
        parent_email: email || null,
        parent_phone: phone || null,
        amount,
        method: 'green_invoice',
        green_invoice_id: payment_id,
        green_invoice_url: green_invoice_url || payment_url || null,
        ghl_contact_id: ghlContactId,
        status: 'needs_signup',
        source: 'green_invoice',
        source_context: { normalized: { email, payment_id, amount, status, name, phone, raw_status }, raw: req.body },
        notes: 'Green Invoice payment received before a matching BNA signup was found.',
      });

      await sendTelegramNotification(
        `<b>Unmatched Green Invoice Payment</b>\n\n` +
        `Name: ${name || 'Unknown'}\n` +
        `Email: ${email || 'Unknown'}\n` +
        `Phone: ${phone || 'Unknown'}\n` +
        `Amount: ₪${amount || 'Unknown'}\n` +
        `Action: Match this to a contact in Accounting.`
      );

      return res.json({ success: true, matched: false, message: 'Payment intake recorded for later matching' });
    }

    const signup = signupResult.rows[0];
    const existingPayment = payment_id
      ? (await pool.query(
        `SELECT *
         FROM bna_payment_log
         WHERE signup_id = $1 AND green_invoice_id = $2
         LIMIT 1`,
        [signup.id, payment_id]
      )).rows[0]
      : null;

    if (!existingPayment) {
      await pool.query(
        `INSERT INTO bna_payment_log (workspace_id, signup_id, payment_type, amount, method, green_invoice_id, status, received_at)
         VALUES ($1, $2, 'registration', $3, 'green_invoice', $4, 'completed', NOW())`,
        [signup.workspace_id || null, signup.id, amount, payment_id]
      );
    }

    await pool.query(
      `UPDATE signups
       SET payment_status = 'paid',
           payment_amount = COALESCE($3, payment_amount),
           green_invoice_id = COALESCE($1, green_invoice_id),
           last_payment_at = NOW(),
           payment_due_date = (NOW()::date + COALESCE(payment_interval_days, $4) * INTERVAL '1 day')::date,
           payment_reminder_sent_at = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [payment_id || null, signup.id, amount || null, DEFAULT_PAYMENT_INTERVAL_DAYS]
    );

    await sendTelegramNotification(
      `💰 <b>Payment Received!</b>\n\n` +
      `Parent: ${signup.parent_name}\n` +
      `Amount: ₪${amount || 'Unknown'}\n` +
      `Method: Green Invoice${existingPayment ? '\nDuplicate webhook ignored for payment log.' : ''}`
    );

    res.json({ success: true, matched: true, duplicate_payment_log: Boolean(existingPayment) });
  } catch (err) {
    console.error('Green Invoice normalized webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Green Invoice webhook legacy fallback (unreachable while normalized handler above is registered)
app.post('/api/webhooks/green-invoice-disabled-legacy-fallback', async (req, res) => {
  // Verify signature if configured
  const signature = req.headers['x-green-invoice-signature'];
  if (process.env.GREEN_INVOICE_SECRET && signature) {
    // TODO: Implement signature verification
  }
  
  const { email, payment_id, amount, status, name, phone, payment_url, green_invoice_url } = req.body;
  
  try {
    // Find signup by email
    const signupResult = await pool.query(
      'SELECT * FROM signups WHERE parent_email = $1',
      [email]
    );
    
    if (signupResult.rows.length === 0) {
      if (status === 'completed') {
        let ghlContactId = null;
        if (GHL_PIT_TOKEN && (email || phone || name)) {
          try {
            const nameParts = String(name || 'BNA Parent').trim().split(/\s+/);
            const firstName = nameParts.shift() || 'BNA';
            const lastName = nameParts.join(' ') || 'Parent';
            ghlContactId = await findOrCreateGHLContact(
              email || `${String(phone || Date.now()).replace(/\D/g, '')}@bna.payment-intake`,
              firstName,
              lastName,
              phone || '',
              { tags: ['BNA Parent', 'Payment Intake'] }
            );
            await addTagToContact(ghlContactId, 'BNA Parent');
            await addTagToContact(ghlContactId, 'Payment Intake');
          } catch (ghlErr) {
            console.error('Unmatched Green Invoice GHL sync error:', ghlErr);
          }
        }

        await createPaymentIntakeRecord({
          parent_name: name || null,
          parent_email: email || null,
          parent_phone: phone || null,
          amount,
          method: 'green_invoice',
          green_invoice_id: payment_id,
          green_invoice_url: green_invoice_url || payment_url || null,
          ghl_contact_id: ghlContactId,
          status: 'needs_signup',
          source: 'green_invoice',
          source_context: req.body,
          notes: 'Green Invoice payment received before a matching BNA signup was found.',
        });

        await sendTelegramNotification(
          `<b>Unmatched Green Invoice Payment</b>\n\n` +
          `Name: ${name || 'Unknown'}\n` +
          `Email: ${email || 'Unknown'}\n` +
          `Amount: ₪${amount || 'Unknown'}\n` +
          `Action: Match this to a contact in Accounting.`
        );
      }

      return res.json({ success: true, matched: false, message: 'Payment intake recorded for later matching' });
    }
    
    const signup = signupResult.rows[0];
    
    if (status === 'completed') {
      // Create payment log
      await pool.query(
        `INSERT INTO bna_payment_log (workspace_id, signup_id, payment_type, amount, method, green_invoice_id, status, received_at)
         VALUES ($1, $2, 'registration', $3, 'green_invoice', $4, 'completed', NOW())`,
        [signup.workspace_id || null, signup.id, amount, payment_id]
      );
      
      // Update signup
      await pool.query(
        `UPDATE signups
         SET payment_status = 'paid',
             payment_amount = COALESCE($3, payment_amount),
             green_invoice_id = $1,
             last_payment_at = NOW(),
             payment_due_date = (NOW()::date + COALESCE(payment_interval_days, $4) * INTERVAL '1 day')::date,
             payment_reminder_sent_at = NULL,
             updated_at = NOW()
         WHERE id = $2`,
        [payment_id, signup.id, amount || null, DEFAULT_PAYMENT_INTERVAL_DAYS]
      );
      
      await sendTelegramNotification(
        `💰 <b>Payment Received!</b>\n\n` +
        `Parent: ${signup.parent_name}\n` +
        `Amount: ₪${amount}\n` +
        `Method: Green Invoice`
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Task API
app.get('/api/bna/auth/me', requireAdmin, (req, res) => {
  const identity = req.opsIdentity || identifyOpsUser(req.opsUser || OPS_USERNAME);
  res.json({
    success: true,
    user: identity?.username || req.opsUser || null,
    role: identity?.role || 'super_admin',
    scope: identity?.scope || { type: 'global', workspaceType: null, workspaceKey: null, projectKey: null },
    allowedViews: identity?.allowedViews || ['tasks', 'assistant', 'calendar', 'students', 'content', 'contacts', 'accounting', 'automations', 'integrations', 'users'],
  });
});

function operationsAssistantStatus(identity = {}, projectKey = '') {
  const openaiConfigured = Boolean(OPENAI_API_KEY);
  const fallbackConfigured = Boolean(KIMI_API_KEY);
  const activeProvider = openaiConfigured
    ? 'openai'
    : fallbackConfigured
      ? 'fallback_configured'
      : 'not_configured';
  return {
    identity: 'BNA Assistant',
    visible_label: 'BNA Assistant',
    surface: 'operations',
    preferred_provider: 'openai',
    active_provider: activeProvider,
    provider_status: openaiConfigured ? 'ready' : 'needs_openai_key',
    model: openaiConfigured ? OPENAI_MODEL : null,
    openai_configured: openaiConfigured,
    fallback_configured: fallbackConfigured,
    workspace_project: projectKey || 'all',
    user_role: identity.role || 'workspace_member',
    scope_type: identity.scope?.type || 'workspace',
    duplicate_personas: [],
    capabilities: [
      'operations_navigation',
      'content_and_task_context_summary',
      'drafting_guidance',
    ],
    disabled_until_verified: [
      'scoped_memory',
      'backend_actions',
      'confirmation_tiers',
      'action_audit_log',
    ],
  };
}

function normalizeAssistantModuleKey(value = 'assistant') {
  const key = String(value || 'assistant')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || 'assistant';
}

function normalizeAssistantSubjectType(value = 'workspace') {
  const type = String(value || 'workspace').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return ['workspace', 'student', 'family', 'provider', 'task', 'content', 'none'].includes(type)
    ? type
    : 'workspace';
}

function assistantUserKey(identity = {}) {
  return String(identity.username || identity.user || 'operations_user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]+/g, '_')
    .slice(0, 160) || 'operations_user';
}

async function resolveAssistantMemoryScope(req, input = {}, db = pool) {
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = normalizeProjectKey(
    input.project ||
    input.project_key ||
    input.workspace_project ||
    input.workspace ||
    ''
  );
  const project = await getProjectByKey(scopedProjectKey || requestedProjectKey || DEFAULT_PROJECT_KEY, db);
  assertProjectAccess(req, project);
  const identity = req.opsIdentity || {};
  const subjectType = normalizeAssistantSubjectType(input.subject_type || input.subjectType || 'workspace');
  return {
    workspace_id: project.workspace_id || null,
    project_id: project.id || null,
    project_key: normalizeProjectKey(project.project_key) || DEFAULT_PROJECT_KEY,
    workspace_key: normalizeProjectKey(project.workspace_key || project.project_key) || DEFAULT_WORKSPACE_KEY,
    user_key: assistantUserKey(identity),
    user_role: identity.role || 'workspace_member',
    surface: 'operations',
    module_key: normalizeAssistantModuleKey(input.module || input.module_key || input.view || 'assistant'),
    subject_type: subjectType,
    subject_id: String(input.subject_id || input.subjectId || '').trim().slice(0, 120),
  };
}

app.get('/api/bna/assistant/status', requireAdmin, (req, res) => {
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = req.query.project && req.query.project !== 'all'
    ? normalizeProjectKey(req.query.project)
    : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  res.json({
    success: true,
    assistant: operationsAssistantStatus(req.opsIdentity || {}, projectKey),
    generated_at: new Date().toISOString(),
  });
});

app.get('/api/bna/assistant/memory', requireAdmin, async (req, res) => {
  try {
    const scope = await resolveAssistantMemoryScope(req, req.query || {});
    const result = await pool.query(
      `SELECT
         id, memory_key, memory_value, visibility, metadata,
         module_key, subject_type, subject_id, created_at, updated_at
       FROM bna_assistant_memory
       WHERE workspace_id IS NOT DISTINCT FROM $1
         AND project_id IS NOT DISTINCT FROM $2
         AND user_key = $3
         AND user_role = $4
         AND surface = $5
         AND module_key = $6
         AND subject_type = $7
         AND subject_id = $8
       ORDER BY updated_at DESC, id DESC
       LIMIT 50`,
      [
        scope.workspace_id,
        scope.project_id,
        scope.user_key,
        scope.user_role,
        scope.surface,
        scope.module_key,
        scope.subject_type,
        scope.subject_id,
      ]
    );
    res.json({
      success: true,
      scope,
      memories: result.rows,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

function fallbackAutomationScopes(projectKey = '') {
  const all = [
    {
      project_key: DEFAULT_PROJECT_KEY,
      project_name: 'BNA',
      project_short_name: 'BNA',
      workspace_id: null,
      workspace_key: DEFAULT_WORKSPACE_KEY,
      workspace_type: 'school',
      workspace_name: 'BNA',
      workspace_short_name: 'BNA',
    },
    {
      project_key: ONE_TIME_PROJECT_KEY,
      project_name: 'One Time Mishnah Class',
      project_short_name: 'One Time',
      workspace_id: null,
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      workspace_type: 'service_provider',
      workspace_name: 'One Time Mishnah Class',
      workspace_short_name: 'One Time',
    },
  ];
  return projectKey ? all.filter((scope) => scope.project_key === projectKey) : all;
}

async function automationWorkspaceScopes(projectKey = '') {
  const params = [];
  let query = `
    SELECT
      p.project_key,
      p.name AS project_name,
      p.short_name AS project_short_name,
      p.workspace_id,
      w.workspace_key,
      w.workspace_type,
      w.name AS workspace_name,
      w.short_name AS workspace_short_name
    FROM bna_projects p
    LEFT JOIN bna_workspaces w ON w.id = p.workspace_id
    WHERE p.status <> 'archived'`;
  if (projectKey) {
    params.push(projectKey);
    query += ` AND p.project_key = $${params.length}`;
  }
  query += `
    ORDER BY CASE p.project_key WHEN 'bna' THEN 1 WHEN 'one_time_mishnah_class' THEN 2 ELSE 3 END, p.name ASC`;

  const result = await pool.query(query, params);
  const rows = result.rows || [];
  return rows.length ? rows : fallbackAutomationScopes(projectKey);
}

function automationWorkspaceLabel(scope = {}) {
  return scope.workspace_short_name || scope.project_short_name || scope.workspace_name || scope.project_name || scope.project_key || 'Workspace';
}

function workspacePredicate(alias, workspaceId) {
  return workspaceId
    ? `${alias}.workspace_id = $1`
    : `${alias}.workspace_id IS NULL`;
}

function automationBase({ scope, automationKey, title, owner, status, lastRunAt = null, nextRunAt = null, failureReason = null, details = {} }) {
  return {
    id: `${scope.project_key}:${automationKey}`,
    automation_key: automationKey,
    title,
    owner,
    status,
    workspace_id: scope.workspace_id || null,
    workspace_key: scope.workspace_key || scope.project_key,
    workspace_label: automationWorkspaceLabel(scope),
    project_key: scope.project_key,
    project_name: scope.project_name,
    project_short_name: scope.project_short_name,
    last_run_at: lastRunAt,
    next_run_at: nextRunAt,
    failure_reason: failureReason,
    details,
  };
}

async function paymentReminderAutomation(scope) {
  if (scope.project_key !== DEFAULT_PROJECT_KEY) return null;
  const workspaceId = scope.workspace_id || null;
  const daysBeforeParam = workspaceId ? '$2' : '$1';
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (
         WHERE payment_due_date IS NOT NULL
           AND COALESCE(status, 'new') <> 'archived'
           AND payment_due_date <= (CURRENT_DATE + ${daysBeforeParam}::int)
           AND payment_status IN ('pending', 'paid', 'partial')
       )::int AS due_count,
       MAX(payment_reminder_sent_at) AS last_run_at,
       MIN(payment_due_date) FILTER (WHERE payment_due_date >= CURRENT_DATE) AS next_due_at
     FROM signups s
     WHERE ${workspacePredicate('s', workspaceId)}`,
    workspaceId ? [workspaceId, Number(PAYMENT_REMINDER_DAYS_BEFORE || 7)] : [Number(PAYMENT_REMINDER_DAYS_BEFORE || 7)]
  );
  const row = result.rows[0] || {};
  const schedulerSetting = String(process.env.PAYMENT_REMINDER_SCHEDULER || '').trim().toLowerCase();
  const schedulerPaused = schedulerSetting === 'off' || schedulerSetting === 'false' || schedulerSetting === '0';
  return automationBase({
    scope,
    automationKey: 'payment_reminders',
    title: 'Payment reminders',
    owner: 'BNA Accounting',
    status: schedulerPaused ? 'paused' : 'ready',
    lastRunAt: row.last_run_at || null,
    nextRunAt: schedulerPaused ? null : getTodayDateInTimeZone(),
    failureReason: null,
    details: {
      due_count: Number(row.due_count || 0),
      next_due_at: row.next_due_at || null,
      scheduler: schedulerPaused ? 'paused' : 'enabled',
    },
  });
}

async function greenInvoiceAutomation(scope) {
  if (scope.project_key !== DEFAULT_PROJECT_KEY) return null;
  const workspaceId = scope.workspace_id || null;
  const result = await pool.query(
    `SELECT
       MAX(webhook_received_at) AS last_run_at,
       COUNT(*) FILTER (WHERE status = 'failed')::int AS failed_count,
       COUNT(*) FILTER (WHERE status = 'received')::int AS pending_count,
       MAX(COALESCE(processing_notes, error_stack)) FILTER (WHERE status = 'failed') AS latest_failure
     FROM bna_green_invoice_webhook_log l
     WHERE ${workspacePredicate('l', workspaceId)}`,
    workspaceId ? [workspaceId] : []
  );
  const row = result.rows[0] || {};
  const failedCount = Number(row.failed_count || 0);
  const pendingCount = Number(row.pending_count || 0);
  return automationBase({
    scope,
    automationKey: 'green_invoice_webhooks',
    title: 'Green Invoice webhooks',
    owner: 'BNA Accounting',
    status: failedCount ? 'failed' : pendingCount ? 'attention' : 'ready',
    lastRunAt: row.last_run_at || null,
    nextRunAt: null,
    failureReason: failedCount
      ? (row.latest_failure || `${failedCount} webhook event${failedCount === 1 ? '' : 's'} failed.`)
      : null,
    details: {
      failed_count: failedCount,
      pending_count: pendingCount,
    },
  });
}

async function contentDriveAutomation(scope, driveConfig) {
  const workspaceId = scope.workspace_id || null;
  const rawFolderId = configuredDriveFolderId(driveConfig, scope.project_key, '01 Raw Intake');
  const result = await pool.query(
    `SELECT
       MAX(created_at) AS last_run_at,
       COUNT(*) FILTER (WHERE status = 'failed')::int AS failed_count,
       COUNT(*) FILTER (WHERE status IN ('ingested', 'transcribing', 'transcribed', 'parsing', 'drafting', 'needs_approval'))::int AS active_count
     FROM bna_content_jobs j
     WHERE ${workspacePredicate('j', workspaceId)}
       AND (
         source_type = 'google_drive'
         OR drive_file_id IS NOT NULL
         OR drive_folder_id IS NOT NULL
       )`,
    workspaceId ? [workspaceId] : []
  );
  const row = result.rows[0] || {};
  const failedCount = Number(row.failed_count || 0);
  const hasFolder = Boolean(rawFolderId);
  return automationBase({
    scope,
    automationKey: 'content_drive_intake',
    title: 'Content Drive intake',
    owner: 'Content Operations',
    status: hasFolder ? (failedCount ? 'attention' : 'ready') : 'needs_configuration',
    lastRunAt: row.last_run_at || null,
    nextRunAt: null,
    failureReason: hasFolder ? null : 'Drive raw-intake folder is not configured for this workspace.',
    details: {
      raw_folder_configured: hasFolder,
      failed_count: failedCount,
      active_count: Number(row.active_count || 0),
    },
  });
}

async function codexRuntimeStatus() {
  return (await pool.query(
    `SELECT *,
            CASE
              WHEN last_seen_at IS NULL THEN true
              ELSE last_seen_at < NOW() - (COALESCE(stale_after_ms, 180000) * INTERVAL '1 millisecond')
            END AS stale
     FROM bna_agent_runtime_status
     WHERE agent_key = 'codex-fleet'
     ORDER BY last_seen_at DESC
     LIMIT 1`
  )).rows[0] || null;
}

async function codexTaskAutomation(scope, runtime) {
  const result = await pool.query(
    `WITH machine_tasks AS (
       SELECT t.*
       FROM bna_tasks t
       LEFT JOIN bna_projects p ON p.id = t.project_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(t.workspace_id, p.workspace_id)
       WHERE COALESCE(p.project_key, w.workspace_key, '') = $1
         AND (
           LOWER(COALESCE(t.assigned_to, '')) LIKE '%codex%'
           OR LOWER(COALESCE(t.assigned_to, '')) LIKE '%kimi%'
           OR LOWER(COALESCE(t.assigned_to, '')) LIKE '%system%'
         )
     )
     SELECT
       COUNT(*) FILTER (
         WHERE COALESCE(stage, '') NOT IN ('done', 'archive', 'archived')
           AND completed_at IS NULL
           AND verified_at IS NULL
       )::int AS open_count,
       COUNT(*) FILTER (
         WHERE stage = 'in_progress'
           AND completed_at IS NULL
           AND verified_at IS NULL
       )::int AS in_progress_count,
       COUNT(*) FILTER (
         WHERE urgency IN ('urgent', 'today')
           AND COALESCE(stage, '') NOT IN ('done', 'archive', 'archived')
           AND completed_at IS NULL
           AND verified_at IS NULL
       )::int AS urgent_today_count
     FROM machine_tasks`,
    [scope.project_key]
  );
  const row = result.rows[0] || {};
  const runtimeStatus = runtime?.status || 'unknown';
  const stale = Boolean(runtime?.stale);
  return automationBase({
    scope,
    automationKey: 'codex_task_automation',
    title: 'Codex task automation',
    owner: 'Codex',
    status: stale ? 'stale' : runtimeStatus,
    lastRunAt: runtime?.last_seen_at || null,
    nextRunAt: null,
    failureReason: stale
      ? 'No recent Codex runtime heartbeat has been recorded.'
      : runtimeStatus === 'error'
        ? 'Codex runtime reported an error.'
        : null,
    details: {
      open_count: Number(row.open_count || 0),
      in_progress_count: Number(row.in_progress_count || 0),
      urgent_today_count: Number(row.urgent_today_count || 0),
    },
  });
}

app.get('/api/bna/automations/status', requireAdmin, async (req, res) => {
  try {
    const scopedProjectKey = opsScopeProjectKey(req);
    const requestedProjectKey = req.query.project && req.query.project !== 'all'
      ? normalizeProjectKey(req.query.project)
      : '';
    const projectKey = scopedProjectKey || requestedProjectKey;
    const scopes = await automationWorkspaceScopes(projectKey);
    const driveConfig = readGoogleDrivePipelineConfig();
    const runtime = await codexRuntimeStatus();
    const automations = [];

    for (const scope of scopes) {
      const payment = await paymentReminderAutomation(scope);
      if (payment) automations.push(payment);
      const greenInvoice = await greenInvoiceAutomation(scope);
      if (greenInvoice) automations.push(greenInvoice);
      automations.push(await contentDriveAutomation(scope, driveConfig));
      automations.push(await codexTaskAutomation(scope, runtime));
    }

    res.json({
      success: true,
      project: projectKey || 'all',
      generated_at: new Date().toISOString(),
      automations,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

const SOCIAL_INTEGRATION_TARGETS = [
  {
    integrationKey: 'buffer_facebook',
    provider: 'Buffer',
    platform: 'Facebook',
    profileId: () => BUFFER_PROFILE_FACEBOOK_ID,
    profileLabel: () => BUFFER_PROFILE_FACEBOOK_LABEL,
  },
  {
    integrationKey: 'buffer_linkedin',
    provider: 'Buffer',
    platform: 'LinkedIn',
    profileId: () => BUFFER_PROFILE_LINKEDIN_ID,
    profileLabel: () => BUFFER_PROFILE_LINKEDIN_LABEL,
  },
  {
    integrationKey: 'buffer_youtube',
    provider: 'Buffer',
    platform: 'YouTube',
    profileId: () => BUFFER_PROFILE_YOUTUBE_ID,
    profileLabel: () => BUFFER_PROFILE_YOUTUBE_LABEL,
  },
];

function maskedIntegrationIdentity(value = '') {
  const clean = String(value || '').trim();
  if (!clean) return '';
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
}

function socialIntegrationStatus(scope, target, generatedAt) {
  const profileId = target.profileId();
  const profileLabel = target.profileLabel();
  const isBnaWorkspace = normalizeProjectKey(scope.project_key) === DEFAULT_PROJECT_KEY;
  const accountIdentity = profileLabel || maskedIntegrationIdentity(profileId);

  if (!isBnaWorkspace) {
    return {
      id: `${scope.project_key}:${target.integrationKey}`,
      integration_key: target.integrationKey,
      provider: target.provider,
      platform: target.platform,
      status: 'not_connected',
      account_identity: null,
      last_check_at: generatedAt,
      needed_action: 'Connect a workspace-specific Buffer profile before using this social target.',
      failure_reason: null,
      workspace_id: scope.workspace_id || null,
      workspace_key: scope.workspace_key || scope.project_key,
      workspace_label: automationWorkspaceLabel(scope),
      project_key: scope.project_key,
    };
  }

  if (BUFFER_SOCIAL_LAST_ERROR) {
    return {
      id: `${scope.project_key}:${target.integrationKey}`,
      integration_key: target.integrationKey,
      provider: target.provider,
      platform: target.platform,
      status: 'error',
      account_identity: accountIdentity || null,
      last_check_at: generatedAt,
      needed_action: 'Resolve the Buffer connector error before creating social drafts.',
      failure_reason: BUFFER_SOCIAL_LAST_ERROR.slice(0, 500),
      workspace_id: scope.workspace_id || null,
      workspace_key: scope.workspace_key || scope.project_key,
      workspace_label: automationWorkspaceLabel(scope),
      project_key: scope.project_key,
    };
  }

  if (!BUFFER_ACCESS_TOKEN || !profileId) {
    return {
      id: `${scope.project_key}:${target.integrationKey}`,
      integration_key: target.integrationKey,
      provider: target.provider,
      platform: target.platform,
      status: 'not_connected',
      account_identity: accountIdentity || null,
      last_check_at: generatedAt,
      needed_action: `Configure BUFFER_ACCESS_TOKEN and the ${target.platform} Buffer profile ID before use.`,
      failure_reason: null,
      workspace_id: scope.workspace_id || null,
      workspace_key: scope.workspace_key || scope.project_key,
      workspace_label: automationWorkspaceLabel(scope),
      project_key: scope.project_key,
    };
  }

  return {
    id: `${scope.project_key}:${target.integrationKey}`,
    integration_key: target.integrationKey,
    provider: target.provider,
    platform: target.platform,
    status: 'connected',
    account_identity: accountIdentity,
    last_check_at: generatedAt,
    needed_action: 'Ready for approved Buffer draft creation.',
    failure_reason: null,
    workspace_id: scope.workspace_id || null,
    workspace_key: scope.workspace_key || scope.project_key,
    workspace_label: automationWorkspaceLabel(scope),
    project_key: scope.project_key,
  };
}

app.get('/api/bna/integrations/status', requireAdmin, async (req, res) => {
  try {
    const scopedProjectKey = opsScopeProjectKey(req);
    const requestedProjectKey = req.query.project && req.query.project !== 'all'
      ? normalizeProjectKey(req.query.project)
      : '';
    const projectKey = scopedProjectKey || requestedProjectKey;
    const scopes = await automationWorkspaceScopes(projectKey);
    const generatedAt = new Date().toISOString();
    const integrations = scopes.flatMap((scope) =>
      SOCIAL_INTEGRATION_TARGETS.map((target) => socialIntegrationStatus(scope, target, generatedAt))
    );

    res.json({
      success: true,
      project: projectKey || 'all',
      generated_at: generatedAt,
      integrations,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/users', requireAdmin, async (req, res) => {
  const { project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = [];

  if (projectKey) {
    params.push(projectKey);
    conditions.push(`COALESCE(p.project_key, w.workspace_key, '') = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT
         pm.id,
         pm.person_name,
         pm.role,
         pm.access_level,
         pm.telegram_chat_id,
         pm.login_username,
         pm.active,
         pm.created_at,
         pm.updated_at,
         p.project_key,
         p.name AS project_name,
         p.short_name AS project_short_name,
         w.workspace_key,
         w.workspace_type,
         w.name AS workspace_name
       FROM bna_project_members pm
       LEFT JOIN bna_projects p ON p.id = pm.project_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(pm.workspace_id, p.workspace_id)
       ${whereClause}
       ORDER BY
         CASE pm.access_level WHEN 'owner' THEN 1 WHEN 'manager' THEN 2 WHEN 'member' THEN 3 ELSE 4 END,
         pm.person_name ASC`,
      params
    );
    res.json({ users: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/invitations', requireAdmin, async (req, res) => {
  const { project } = req.query;
  const scopedProjectKey = opsScopeProjectKey(req);
  const requestedProjectKey = project && project !== 'all' ? normalizeProjectKey(project) : '';
  const projectKey = scopedProjectKey || requestedProjectKey;
  const params = [];
  const conditions = [];

  if (projectKey) {
    params.push(projectKey);
    conditions.push(`COALESCE(p.project_key, w.workspace_key, '') = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT
         i.id,
         i.email,
         i.person_name,
         i.role,
         i.access_level,
         i.status,
         i.invited_by,
         i.expires_at,
         i.accepted_at,
         i.revoked_at,
         i.created_at,
         i.updated_at,
         p.project_key,
         p.name AS project_name,
         p.short_name AS project_short_name,
         w.workspace_key,
         w.workspace_type,
         w.name AS workspace_name
       FROM bna_workspace_invitations i
       LEFT JOIN bna_projects p ON p.id = i.project_id
       LEFT JOIN bna_workspaces w ON w.id = COALESCE(i.workspace_id, p.workspace_id)
       ${whereClause}
       ORDER BY
         CASE i.status WHEN 'pending' THEN 1 WHEN 'accepted' THEN 2 WHEN 'expired' THEN 3 ELSE 4 END,
         i.created_at DESC`,
      params
    );
    res.json({ invitations: result.rows, project: projectKey || 'all' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/agent-fleet/status', requireAdmin, async (req, res) => {
  try {
    const runtime = (await pool.query(
      `SELECT *,
              CASE
                WHEN last_seen_at IS NULL THEN true
                ELSE last_seen_at < NOW() - (COALESCE(stale_after_ms, 180000) * INTERVAL '1 millisecond')
              END AS stale
       FROM bna_agent_runtime_status
       WHERE agent_key = 'codex-fleet'
       ORDER BY last_seen_at DESC
       LIMIT 1`
    )).rows[0] || null;

    const queue = (await pool.query(
      `WITH machine_tasks AS (
         SELECT *,
                (
                  LOWER(COALESCE(assigned_to, '')) LIKE '%codex%'
                  OR LOWER(COALESCE(assigned_to, '')) LIKE '%kimi%'
                  OR LOWER(COALESCE(assigned_to, '')) LIKE '%system%'
                ) AS is_machine
         FROM bna_tasks
       )
       SELECT
         COUNT(*) FILTER (
           WHERE is_machine
             AND COALESCE(stage, '') NOT IN ('done', 'archive', 'archived')
             AND completed_at IS NULL
             AND verified_at IS NULL
         )::int AS pending,
         COUNT(*) FILTER (
           WHERE is_machine
             AND stage = 'in_progress'
             AND completed_at IS NULL
             AND verified_at IS NULL
         )::int AS in_progress,
         COUNT(*) FILTER (
           WHERE is_machine
             AND urgency IN ('urgent', 'today')
             AND COALESCE(stage, '') NOT IN ('done', 'archive', 'archived')
             AND completed_at IS NULL
             AND verified_at IS NULL
         )::int AS urgent_today,
         COUNT(*) FILTER (
           WHERE is_machine
             AND (completed_at IS NOT NULL OR verified_at IS NOT NULL OR stage = 'done')
         )::int AS completed
       FROM machine_tasks`
    )).rows[0] || {};

    const latestTask = (await pool.query(
      `SELECT id, title, stage, urgency, assigned_to, created_at, started_at
       FROM bna_tasks
       WHERE (
         LOWER(COALESCE(assigned_to, '')) LIKE '%codex%'
         OR LOWER(COALESCE(assigned_to, '')) LIKE '%kimi%'
         OR LOWER(COALESCE(assigned_to, '')) LIKE '%system%'
       )
       AND COALESCE(stage, '') NOT IN ('done', 'archive', 'archived')
       AND completed_at IS NULL
       AND verified_at IS NULL
       ORDER BY
         CASE urgency WHEN 'urgent' THEN 1 WHEN 'today' THEN 2 WHEN 'this_week' THEN 3 ELSE 4 END,
         created_at DESC
       LIMIT 1`
    )).rows[0] || null;

    res.json({
      success: true,
      fleet: runtime ? {
        status: runtime.status,
        pid: runtime.pid,
        mode: runtime.mode,
        host: runtime.host,
        started_at: runtime.started_at,
        last_seen_at: runtime.last_seen_at,
        stale: Boolean(runtime.stale),
        current_task_id: runtime.current_task_id,
        queue_size: runtime.queue_size,
        ready_count: runtime.ready_count,
      } : {
        status: 'unknown',
        stale: true,
      },
      queue: {
        pending: Number(queue.pending || 0),
        in_progress: Number(queue.in_progress || 0),
        urgent_today: Number(queue.urgent_today || 0),
        completed: Number(queue.completed || 0),
        latest_task: latestTask,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/agent-fleet/status', requireAdmin, async (req, res) => {
  const {
    agent_key = 'codex-fleet',
    status = 'running',
    pid = null,
    mode = null,
    host = null,
    started_at = null,
    stale_after_ms = 180000,
    current_task_id = null,
    queue_size = null,
    ready_count = null,
    details = {},
  } = req.body || {};
  const allowedStatus = ['unknown', 'running', 'stopped', 'error'].includes(String(status))
    ? String(status)
    : 'unknown';

  try {
    const result = await pool.query(
      `INSERT INTO bna_agent_runtime_status (
         agent_key, status, pid, mode, host, started_at, last_seen_at,
         stale_after_ms, current_task_id, queue_size, ready_count, details, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11::jsonb, NOW())
       ON CONFLICT (agent_key) DO UPDATE SET
         status = EXCLUDED.status,
         pid = EXCLUDED.pid,
         mode = EXCLUDED.mode,
         host = EXCLUDED.host,
         started_at = COALESCE(EXCLUDED.started_at, bna_agent_runtime_status.started_at),
         last_seen_at = NOW(),
         stale_after_ms = EXCLUDED.stale_after_ms,
         current_task_id = EXCLUDED.current_task_id,
         queue_size = EXCLUDED.queue_size,
         ready_count = EXCLUDED.ready_count,
         details = EXCLUDED.details,
         updated_at = NOW()
       RETURNING *`,
      [
        String(agent_key || 'codex-fleet').slice(0, 120),
        allowedStatus,
        pid === null || pid === undefined ? null : Number(pid),
        mode ? String(mode).slice(0, 80) : null,
        host ? String(host).slice(0, 160) : null,
        started_at || null,
        Number(stale_after_ms || 180000),
        current_task_id === null || current_task_id === undefined ? null : Number(current_task_id),
        queue_size === null || queue_size === undefined ? null : Number(queue_size),
        ready_count === null || ready_count === undefined ? null : Number(ready_count),
        JSON.stringify(details || {}),
      ]
    );
    res.json({ success: true, status: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/projects', requireAdmin, async (req, res) => {
  try {
    await ensureDefaultProjects();
    const scopedProjectKey = opsScopeProjectKey(req);
    const params = [];
    let query = `
      SELECT
        p.*,
        w.workspace_type,
        w.workspace_key,
        w.name AS workspace_name
      FROM bna_projects p
      LEFT JOIN bna_workspaces w ON w.id = p.workspace_id
      WHERE p.status <> 'archived'`;
    if (scopedProjectKey) {
      query += ' AND p.project_key = $1';
      params.push(scopedProjectKey);
    }
    query += ' ORDER BY CASE p.project_key WHEN \'bna\' THEN 1 WHEN \'one_time_mishnah_class\' THEN 2 ELSE 3 END, p.name ASC';
    const result = await pool.query(query, params);
    res.json({ projects: result.rows });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get('/api/bna/pending-briefs', requireAdmin, (req, res) => {
  try {
    const briefs = listPendingBriefs(req);
    const lifecycle_counts = briefs.reduce((counts, brief) => {
      const key = brief.lifecycle_stage || 'planned';
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, { planned: 0, implementing: 0, verified: 0, deployed: 0 });

    res.json({
      success: true,
      briefs,
      lifecycle_counts,
      source_dir: 'tasks-pending',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/tasks', requireAdmin, async (req, res) => {
  const { stage, category, urgency, project } = req.query;
  
  let query = `
    SELECT
      t.*,
      p.project_key,
      p.name AS project_name,
      p.short_name AS project_short_name,
      COALESCE(comment_counts.comment_count, 0)::int AS comment_count
    FROM bna_tasks t
    LEFT JOIN bna_projects p ON p.id = t.project_id
    LEFT JOIN (
      SELECT task_id, COUNT(*) AS comment_count
      FROM bna_task_comments
      GROUP BY task_id
    ) comment_counts ON comment_counts.task_id = t.id
    WHERE 1=1`;
  const params = [];
  let paramIdx = 1;

  const scopedProjectKey = opsScopeProjectKey(req);
  const projectKey = scopedProjectKey || (project && project !== 'all' ? normalizeProjectKey(project) : '');
  
  if (stage) {
    query += ` AND t.stage = $${paramIdx++}`;
    params.push(normalizeTaskStageValue(stage));
  }
  if (category) {
    query += ` AND t.category = $${paramIdx++}`;
    params.push(category);
  }
  if (urgency) {
    query += ` AND t.urgency = $${paramIdx++}`;
    params.push(urgency);
  }
  if (projectKey) {
    query += ` AND COALESCE(p.project_key, $${paramIdx}) = $${paramIdx++}`;
    params.push(projectKey);
  }
  
  query += ' ORDER BY t.created_at DESC';
  
  try {
    await ensureDefaultProjects();
    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/tasks', requireAdmin, async (req, res) => {
  const { title, ramble, source, created_by } = req.body;

  if (ramble && !title) {
    const text = String(ramble).trim();
    const candidates = parseRambleIntoTaskCandidates(text);

    try {
      const createdTasks = [];

      for (const candidate of candidates) {
        const task = await createTaskFromText({
          title: candidate.title,
          raw_text: candidate.original_text,
          notes: candidate.notes,
          stage: candidate.stage,
          category: candidate.category,
          urgency: candidate.urgency,
          source: source || 'ramble',
          created_by: created_by || 'operator',
          assigned_to: candidate.assigned_to,
          project: candidate.project_key || inferProjectKeyFromText(candidate.original_text),
          decision_required: candidate.decision_required,
          ai_parsed: taskCandidateAiParsed(candidate, 'heuristic-v3'),
        },
        { req }
      );
        createdTasks.push(task);
      }

      return res.json({ success: true, tasks_created: createdTasks.length, tasks: createdTasks });
    } catch (err) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  if (!title && !req.body.raw_text && !req.body.rawText && !req.body.text) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  try {
    const task = await createTaskFromText({
      ...req.body,
      source: req.body.source || 'manual',
      created_by: req.body.created_by || 'dashboard',
    }, { req });
    res.json({ success: true, task });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

async function createTaskFromTextRoute(req, res) {
  try {
    const task = await createTaskFromText({
      ...req.body,
      source: req.body?.source || 'telegram',
      created_by: req.body?.created_by || req.body?.author || 'telegram',
    }, { req });
    res.json({ success: true, task });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

app.post('/api/bna/tasks/create-from-text', requireAdmin, createTaskFromTextRoute);
app.post('/api/bna/create_task_from_text', requireAdmin, createTaskFromTextRoute);

app.get('/api/bna/tasks/:id/comments', requireAdmin, async (req, res) => {
  try {
    await assertTaskAccess(req, req.params.id);
    const result = await pool.query(
      `SELECT *
       FROM bna_task_comments
       WHERE task_id = $1
       ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json({ comments: result.rows });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/bna/tasks/:id/comments', requireAdmin, async (req, res) => {
  const body = String(req.body?.body || req.body?.comment || '').trim();
  if (!body) return res.status(400).json({ error: 'Comment body is required' });
  try {
    await assertTaskAccess(req, req.params.id);
    const result = await pool.query(
      `INSERT INTO bna_task_comments (workspace_id, task_id, author, body, visibility, source, source_context)
       SELECT COALESCE(t.workspace_id, p.workspace_id), t.id, $2, $3, $4, $5, $6
       FROM bna_tasks t
       LEFT JOIN bna_projects p ON p.id = t.project_id
       WHERE t.id = $1
       RETURNING *`,
      [
        req.params.id,
        String(req.body?.author || req.opsUser || 'dashboard').slice(0, 120),
        body,
        ['internal', 'operator', 'project'].includes(req.body?.visibility) ? req.body.visibility : 'internal',
        ['dashboard', 'telegram', 'api', 'system'].includes(req.body?.source) ? req.body.source : 'dashboard',
        JSON.stringify(req.body?.source_context || {}),
      ]
    );
    res.json({ success: true, comment: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.patch('/api/bna/tasks/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = [];
  const values = [];
  let idx = 1;
  
  const allowedFields = new Set([
    'title',
    'notes',
    'stage',
    'category',
    'urgency',
    'energy_required',
    'estimated_minutes',
    'due_date',
    'planned_at',
    'started_at',
    'completed_at',
    'archived_at',
    'assigned_to',
    'verified_at',
    'verification_notes',
    'decision_required',
    'author',
    'blocker_reason',
  ]);
  try {
    await assertTaskAccess(req, id);
    let normalizedStageUpdate = null;
    let sawDecisionRequiredUpdate = false;
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'project' || key === 'project_key' || key === 'project_id') {
        const project = await resolveProjectFromInput({ [key]: value }, pool);
        assertProjectAccess(req, project);
        fields.push(`project_id = $${idx++}`);
        values.push(project.id);
        continue;
      }
      if (!allowedFields.has(key)) continue;
      let nextValue = value;
      if (key === 'assigned_to') nextValue = normalizeTaskAssignee(value);
      if (key === 'blocker_reason') nextValue = String(value || '').trim().slice(0, 500) || null;
      if (key === 'category') nextValue = safeTaskCategory(value);
      if (key === 'stage') {
        normalizedStageUpdate = normalizeTaskStageValue(value, {
          decisionRequired: Boolean(updates.decision_required),
        });
        nextValue = normalizedStageUpdate;
      }
      if (key === 'decision_required') {
        sawDecisionRequiredUpdate = true;
        nextValue = Boolean(value);
      }
      fields.push(`${key} = $${idx++}`);
      values.push(nextValue);
    }
    if (normalizedStageUpdate === 'decision_required' && !sawDecisionRequiredUpdate) {
      fields.push(`decision_required = $${idx++}`);
      values.push(true);
    }
    if (normalizedStageUpdate === 'archived' && updates.archived_at === undefined) {
      fields.push('archived_at = NOW()');
    }
    if (!fields.length) return res.status(400).json({ error: 'No allowed task fields supplied' });
    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      `UPDATE bna_tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Database migration endpoint
app.post('/api/bna/migrate-db', requireAdmin, async (req, res) => {
  const MIGRATION_SQL = `
    DROP TABLE IF EXISTS bna_payment_log CASCADE;
    DROP TABLE IF EXISTS bna_tasks CASCADE;
    DROP TABLE IF EXISTS signups CASCADE;

    CREATE TABLE IF NOT EXISTS bna_workspaces (
      id SERIAL PRIMARY KEY,
      workspace_key TEXT NOT NULL UNIQUE,
      workspace_type TEXT NOT NULL CHECK (workspace_type IN ('school', 'service_provider', 'family')),
      name TEXT NOT NULL,
      short_name TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE signups (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT,
      parent_phone TEXT,
      student_name TEXT NOT NULL,
      student_age INTEGER,
      student_grade TEXT,
      previous_school TEXT,
      reason_applying TEXT,
      special_needs TEXT,
      payment_method TEXT DEFAULT 'green_invoice',
      payment_status TEXT DEFAULT 'pending',
      payment_amount DECIMAL(10,2),
      payment_currency TEXT DEFAULT 'ILS',
      green_invoice_id TEXT,
      cash_receipt_photo_url TEXT,
      cash_received_at TIMESTAMP,
      cash_notes TEXT,
      form_language TEXT DEFAULT 'en',
      waiver_accepted BOOLEAN DEFAULT FALSE,
      waiver_accepted_at TIMESTAMP,
      waiver_version TEXT,
      tuition_agreement_accepted BOOLEAN DEFAULT FALSE,
      tuition_agreement_accepted_at TIMESTAMP,
      tuition_agreement_version TEXT,
      tuition_agreement_signer_name TEXT,
      tuition_agreement_signer_email TEXT,
      tuition_agreement_client_signed_at TIMESTAMP,
      ghl_parent_contact_id TEXT,
      ghl_student_contact_id TEXT,
      ghl_synced_at TIMESTAMP,
      ghl_sync_error TEXT,
      status TEXT DEFAULT 'new',
      tags TEXT[] DEFAULT '{}',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE bna_signup_agreement_signatures (
      id SERIAL PRIMARY KEY,
      signup_id INTEGER NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
      agreement_type TEXT NOT NULL,
      agreement_title TEXT NOT NULL,
      agreement_version TEXT NOT NULL,
      agreement_text TEXT,
      signer_name TEXT NOT NULL,
      signer_email TEXT,
      signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      client_signed_at TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (signup_id, agreement_type, agreement_version)
    );
    
    CREATE TABLE bna_tasks (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      notes TEXT,
      stage TEXT DEFAULT 'ready' CHECK (stage IN ('decision_required', 'ready', 'in_progress', 'blocked', 'done', 'archived')),
      category TEXT DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
      urgency TEXT DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
      energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
      estimated_minutes INTEGER,
      due_date DATE,
      planned_at TIMESTAMP,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      archived_at TIMESTAMP,
      blocker_reason TEXT,
      source TEXT DEFAULT 'manual',
      source_context TEXT,
      ai_parsed JSONB,
      parent_task_id INTEGER REFERENCES bna_tasks(id),
      related_contact_email TEXT,
      related_signup_id INTEGER,
      created_by TEXT DEFAULT 'system',
      assigned_to TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE bna_payment_log (
      id SERIAL PRIMARY KEY,
      workspace_id INTEGER REFERENCES bna_workspaces(id) ON DELETE SET NULL,
      signup_id INTEGER REFERENCES signups(id) ON DELETE CASCADE,
      payment_type TEXT DEFAULT 'registration',
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'ILS',
      method TEXT,
      green_invoice_id TEXT,
      green_invoice_url TEXT,
      receipt_photo_url TEXT,
      received_by TEXT,
      received_at TIMESTAMP,
      notes TEXT,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    INSERT INTO bna_tasks (title, stage, category, urgency, source) 
    VALUES ('Welcome to BNA Operations. Telegram rambles land here as raw input.', 'ready', 'operations', 'this_week', 'manual');
  `;
  
  try {
    await pool.query(createWorkspacesSQL);
    await pool.query(MIGRATION_SQL);
    await pool.query(createProjectsSQL);
    await pool.query(createProjectMembersSQL);
    await pool.query(createWorkspaceInvitationsSQL);
    await pool.query(createTaskCommentsSQL);
    await pool.query(createAssistantMemorySQL);
    await pool.query(createWorkspaceScopeMigrationSQL);
    await pool.query(createBnaIndexesSQL);
    await pool.query(normalizeTasksCategoryCheckSQL);
    await pool.query(normalizeTasksStageCheckSQL);
    await pool.query(normalizeTasksSourceCheckSQL);
    await ensureDefaultProjects();
    res.json({ success: true, message: 'Database migrated to BNA schema!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint for operations
app.post('/api/operations/login', async (req, res) => {
  const { username, password } = req.body;

  const identity = identifyOpsUser(username, password);
  if (identity) {
    const sessionId = await issueSession(identity.username);
    setSessionCookie(res, sessionId);
    res.json({
      success: true,
      sessionId,
      user: identity.username,
      role: identity.role,
      scope: identity.scope,
      allowedViews: identity.allowedViews,
    });
  } else {
    clearSessionCookie(res);
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.delete('/api/bna/tasks/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await assertTaskAccess(req, id);
    await pool.query('DELETE FROM bna_tasks WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/operations/logout', async (req, res) => {
  const cookies = parseCookies(req);
  await clearSession(cookies[SESSION_COOKIE_NAME]);
  clearSessionCookie(res);
  res.json({ success: true });
});

// Public website clean routes
app.get(['/he'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(['/blog', '/he/blog'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get(['/faq', '/he/faq'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

app.get(['/blog/:slug', '/he/blog/:slug'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'blog-post.html'));
});

// Operations dashboard - with login redirect
app.get('/operations', requireAdmin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'operations.html'));
});

// Telegram webhook handler
app.post('/api/bna/telegram', async (req, res) => {
  const update = req.body;
  
  // Handle callback queries (button clicks)
  if (update.callback_query) {
    await handleTelegramCallback(update.callback_query);
    return res.json({ ok: true });
  }
  
  // Handle messages
  if (update.message) {
    await handleTelegramMessage(update.message);
    return res.json({ ok: true });
  }
  
  res.json({ ok: true });
});

async function handleTelegramCallback(query) {
  const chatId = query.message?.chat?.id;
  const data = query.callback_data;
  
  // Answer callback
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: query.id })
  });

  const dashboardUrl = 'https://bneineviimacademy.org/operations';
  const replies = {
    view_inbox: `Raw task inputs:\n${dashboardUrl}?view=tasks`,
    view_urgent: `Urgent tasks:\n${dashboardUrl}?view=tasks`,
    view_pipeline: `Tasks: decisions, my tasks, changelog, and done.\n${dashboardUrl}?view=tasks`,
    quick_add: 'Quick add: send a task or ramble in this chat. I will capture it into BNA Operations.',
    view_billing: `Accounting dashboard:\n${dashboardUrl}?view=accounting`,
    view_signups: `Contacts:\n${dashboardUrl}?view=contacts`,
    view_accountability: `Students and accountability:\n${dashboardUrl}?view=students`,
  };

  if (replies[data]) {
    await sendTelegramMessage(chatId, replies[data]);
    return;
  }
}

async function handleTelegramMessage(msg) {
  const chatId = msg.chat?.id;
  const text = msg.text || '';
  
  if (text === '/start') {
    await sendTelegramMenu(chatId);
    return;
  }
  
  // Store message in CLI bridge
  try {
    await pool.query(
      `INSERT INTO cli_bridge_messages (source, message_type, content, metadata)
       VALUES ($1, $2, $3, $4)`,
      ['telegram', 'text', text, JSON.stringify({ chat_id: chatId, message_id: msg.message_id })]
    );
  } catch (err) {
    console.error('CLI bridge error:', err);
  }

  let capturedCandidates = [];
  try {
    const candidates = parseRambleIntoTaskCandidates(text);
    capturedCandidates = candidates;
    for (const candidate of candidates) {
      await createTaskFromText({
        title: candidate.title,
        raw_text: candidate.original_text,
        notes: candidate.notes,
        stage: candidate.stage,
        category: candidate.category,
        urgency: candidate.urgency,
        source: 'telegram',
        source_context: { chat_id: chatId, message_id: msg.message_id },
        created_by: 'telegram',
        assigned_to: candidate.assigned_to,
        project: candidate.project_key || inferProjectKeyFromText(candidate.original_text),
        decision_required: candidate.decision_required,
        ai_parsed: taskCandidateAiParsed(candidate, 'telegram-webhook-heuristic-v3'),
      });
    }
  } catch (err) {
    console.error('Telegram task capture error:', err);
  }

  const visibleTitles = capturedCandidates
    .map((candidate) => candidate.title)
    .filter(Boolean)
    .slice(0, 3);
  const confirmation = visibleTitles.length
    ? ['Captured:', ...visibleTitles.map((title) => `- ${title}`)].join('\n')
    : 'Captured. I will refine this into the right BNA lane.';
  await sendTelegramMessage(chatId, `${confirmation}\n\nView Tasks: https://bneineviimacademy.org/operations?view=tasks`);
  return;
  
  // Simple task parsing
  if (text.toLowerCase().includes('urgent') || text.toLowerCase().includes('asap')) {
    await sendTelegramMessage(chatId, `🔴 Got it! Urgent task recorded: "${text}"\n\nView in dashboard: https://bneineviimacademy.org/operations`);
  } else {
    await sendTelegramMessage(chatId, `✅ Task recorded: "${text}"\n\nView in dashboard: https://bneineviimacademy.org/operations`);
  }
}

async function sendTelegramMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Tasks', callback_data: 'view_pipeline' }, { text: 'Urgent', callback_data: 'view_urgent' }],
      [{ text: 'Contacts', callback_data: 'view_signups' }, { text: 'Accounting', callback_data: 'view_billing' }],
      [{ text: 'Students', callback_data: 'view_accountability' }],
      [{ text: 'Open BNA Dashboard', url: 'https://bneineviimacademy.org/operations' }]
    ]
  };

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: 'BNA Operations Bot\n\nWhat would you like to do?',
      reply_markup: keyboard
    })
  });
}

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return;
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`BNA Server running on port ${PORT}`);
    startPaymentReminderScheduler();
  });
}

module.exports = {
  app,
  initDb,
  pool,
};
// Deploy timestamp: 2026-05-26T17:02:05Z
