const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { google } = require('googleapis');
const {
  GOAL_TYPES,
  calculateGroupTorahProgress,
  calculateStudentTorahProgress,
  calculateStudentTripProgress,
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

const app = express();
const PORT = process.env.PORT || 8080;

const DEFAULT_PROJECT_KEY = 'bna';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
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
const PAYMENT_LINK = process.env.PAYMENT_LINK || 'https://mrng.to/r9DSZhhWE9';
const DEFAULT_TUITION_AMOUNT = Number(process.env.BNA_TUITION_AMOUNT || 1000);
const DEFAULT_PAYMENT_INTERVAL_DAYS = Number(process.env.BNA_PAYMENT_INTERVAL_DAYS || 30);
const PAYMENT_REMINDER_DAYS_BEFORE = Number(process.env.BNA_PAYMENT_REMINDER_DAYS_BEFORE || 5);
const WAIVER_VERSION = process.env.BNA_WAIVER_VERSION || '2026-05-28-v1';
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

if (!DATABASE_URL) {
  console.error('FATAL: DATABASE_URL not set');
  process.exit(1);
}

if (!OPS_USERNAME || !OPS_PASSWORD) {
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
  await pool.query(
    `INSERT INTO bna_email_log (
      signup_id, email_type, recipient_email, subject, language,
      provider_message_id, status, error, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
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
  const paymentMethod = signup.payment_method === 'cash' ? 'cash' : 'credit';

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

async function getPaymentReminderCandidates({ daysBefore = PAYMENT_REMINDER_DAYS_BEFORE, limit = 100 } = {}) {
  const today = toDateOnly(new Date());
  const reminderTarget = toDateOnly(addDays(new Date(), Number(daysBefore) || PAYMENT_REMINDER_DAYS_BEFORE));
  const result = await pool.query(
    `SELECT *
     FROM signups
     WHERE payment_due_date IS NOT NULL
       AND COALESCE(status, 'new') <> 'archived'
       AND payment_due_date <= $1::date
       AND payment_status IN ('pending', 'paid', 'partial')
       AND (payment_reminder_sent_at IS NULL OR payment_reminder_sent_at::date < $2::date)
     ORDER BY payment_due_date ASC
     LIMIT $3`,
    [reminderTarget, today, Math.min(Number(limit) || 100, 500)]
  );

  return {
    today,
    reminderTarget,
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
    subject: email.subject,
  };
}

async function runPaymentReminderSweep({ dryRun = false, daysBefore = PAYMENT_REMINDER_DAYS_BEFORE } = {}) {
  const { reminderTarget, candidates } = await getPaymentReminderCandidates({ daysBefore });

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
    found: candidates.length,
    sent,
    failed,
  };
}

function startPaymentReminderScheduler() {
  if (String(process.env.PAYMENT_REMINDER_SCHEDULER || 'on').toLowerCase() === 'off') return;
  const intervalMs = Number(process.env.PAYMENT_REMINDER_SWEEP_MS || 6 * 60 * 60 * 1000);
  setInterval(() => {
    runPaymentReminderSweep()
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

function identifyOpsUser(username, password = null) {
  const user = String(username || '').trim();
  const pass = password === null || password === undefined ? null : String(password || '');
  if (!user) return null;

  if (OPS_USERNAME && user.toLowerCase() === OPS_USERNAME.toLowerCase()) {
    if (pass !== null && pass.toLowerCase() !== String(OPS_PASSWORD || '').toLowerCase()) return null;
    return {
      username: user,
      role: 'admin',
      scope: { type: 'all', projectKey: null },
      allowedViews: ['tasks', 'students', 'content', 'contacts', 'accounting'],
    };
  }

  if (
    ONE_TIME_OPS_USERNAME &&
    ONE_TIME_OPS_PASSWORD &&
    user.toLowerCase() === ONE_TIME_OPS_USERNAME.toLowerCase()
  ) {
    if (pass !== null && pass !== ONE_TIME_OPS_PASSWORD) return null;
    return {
      username: user,
      role: 'project_member',
      scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY },
      allowedViews: ['tasks'],
    };
  }

  return null;
}

function isScopedOpsPathAllowed(req) {
  const routePath = String(req.path || '');
  const method = String(req.method || '').toUpperCase();
  if (routePath === '/operations' && method === 'GET') return true;
  if (routePath === '/api/bna/auth/me' && method === 'GET') return true;
  if (routePath === '/api/bna/projects' && method === 'GET') return true;
  if (routePath === '/api/bna/tasks' && ['GET', 'POST'].includes(method)) return true;
  if (routePath === '/api/bna/tasks/create-from-text' && method === 'POST') return true;
  if (routePath === '/api/bna/create_task_from_text' && method === 'POST') return true;
  if (/^\/api\/bna\/tasks\/\d+$/.test(routePath) && ['GET', 'PATCH'].includes(method)) return true;
  if (/^\/api\/bna\/tasks\/\d+\/comments$/.test(routePath) && ['GET', 'POST'].includes(method)) return true;
  return false;
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
    if (identity.scope.type !== 'all' && !isScopedOpsPathAllowed(req)) {
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
  if (identity.scope.type !== 'all' && !isScopedOpsPathAllowed(req)) {
    return res.status(403).json({ error: 'This login is scoped to One Time Mishnah Class tasks.' });
  }
  req.opsUser = identity.username;
  req.opsIdentity = identity;
  next();
}

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static('public', {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
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
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
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

const createTasksTableSQL = `
CREATE TABLE IF NOT EXISTS bna_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  stage TEXT NOT NULL DEFAULT 'raw_input' CHECK (stage IN ('raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive')),
  category TEXT NOT NULL DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations', 'accountability', 'content', 'technology', 'accounting', 'ghl_setup', 'community', 'general', 'torah_class_prep', 'source_sheets', 'shiur_ideas')),
  urgency TEXT NOT NULL DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
  energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
  estimated_minutes INTEGER,
  due_date DATE,
  planned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  archived_at TIMESTAMP,
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

const createProjectsSQL = `
CREATE TABLE IF NOT EXISTS bna_projects (
  id SERIAL PRIMARY KEY,
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

const createTaskCommentsSQL = `
CREATE TABLE IF NOT EXISTS bna_task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES bna_tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'system',
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'operator', 'project')),
  source TEXT NOT NULL DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'telegram', 'api', 'system')),
  source_context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPaymentLogSQL = `
CREATE TABLE IF NOT EXISTS bna_payment_log (
  id SERIAL PRIMARY KEY,
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

const createTorahLearningGoalsSQL = `
CREATE TABLE IF NOT EXISTS bna_torah_learning_goals (
  id SERIAL PRIMARY KEY,
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

const createGroupGoalsSQL = `
CREATE TABLE IF NOT EXISTS bna_group_goals (
  id SERIAL PRIMARY KEY,
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
  bundle_id INTEGER NOT NULL REFERENCES bna_content_bundles(id) ON DELETE CASCADE,
  content_job_id INTEGER NOT NULL REFERENCES bna_content_jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (bundle_id, content_job_id)
);
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
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_error TEXT;
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
CREATE INDEX IF NOT EXISTS idx_bna_email_log_signup_id ON bna_email_log (signup_id);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_email_type ON bna_email_log (email_type);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_status ON bna_content_jobs (status);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_created_at ON bna_content_jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_class_sessions_class_date ON bna_class_sessions (class_date DESC);
CREATE INDEX IF NOT EXISTS idx_bna_class_sessions_content_job_id ON bna_class_sessions (content_job_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_job_id ON bna_content_outputs (job_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_status ON bna_content_outputs (status);
CREATE INDEX IF NOT EXISTS idx_bna_content_prompt_examples_platform ON bna_content_prompt_examples (platform);
CREATE INDEX IF NOT EXISTS idx_bna_content_bundles_status ON bna_content_bundles (status);
CREATE INDEX IF NOT EXISTS idx_bna_projects_project_key ON bna_projects (project_key);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_project_id ON bna_project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_login_username ON bna_project_members (login_username);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_task_id ON bna_task_comments (task_id);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_created_at ON bna_task_comments (created_at DESC);

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
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS confirmation_email_error TEXT;
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
  WHEN 'inbox' THEN 'raw_input'
  WHEN 'clarify' THEN 'needs_decision'
  WHEN 'plan' THEN 'needs_decision'
  WHEN 'execute' THEN 'in_progress'
  WHEN 'review' THEN 'needs_decision'
  WHEN 'complete' THEN 'done'
  ELSE stage
END
WHERE stage IN ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete');
ALTER TABLE bna_tasks ALTER COLUMN stage SET DEFAULT 'raw_input';
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_stage_check
  CHECK (stage IN ('raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive'));
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
    /\b(accountability|private meeting|check-?in|follow-?up|attendance|engagement|goals?|student goal|student goals|personal goal|personal goals|fitness|exercise|workout|diet goal|work goal|job goal|torah goal|learning goal|group goal|daily completion|progress percent|percentage|points?|camping trip|student ownership|daily follow-?through|work responsibility)\b/.test(text)
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

  const looksLikeClass = fields.classNotes.length
    || fields.topics.length
    || fields.discussions.length
    || fields.sources.length
    || /class|torah|shiur|lesson|newsletter|mishna|mishnah|pasuk|verse|source/i.test(`${job.title || ''} ${job.caption || ''}`);
  if (!looksLikeClass) return null;

  const result = await db.query(
    `INSERT INTO bna_class_sessions (
      content_job_id, class_date, title, summary, topics, discussions, sources,
      student_questions, highlights, newsletter_draft, source_media_url, transcript_text
    ) VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (content_job_id) DO UPDATE SET
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

  const questionLead = /^(are there|is there|do we|does |can we|could we|would it be possible|is it possible|how can|how do|what about|why did|why is|what happened)\b/.test(normalized);
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
  if (/\b(option|choose|decide|should we|what do you recommend|which one)\b/.test(normalized)) return 'needs_decision';
  if (/\b(start|build|fix|wire|set up|setup|configure|process|transcribe|deploy|sync|run|finish|verify|mark|make|create|send|update|change|remove|add|do this|parse|route|file|put it|hide|stop showing|stop sending|get rid)\b/.test(normalized)) return 'assigned';
  return 'raw_input';
}

function inferTaskOwner(text) {
  const normalized = String(text || '').toLowerCase();
  if (/\b(i need you to|i want you|you need to|you have to|you should|can you|please)\b/.test(normalized)) return 'Codex';
  if (/\b(i need to|i should|remind me|my task|for me to)\b/.test(normalized)) return 'Shloimie';
  if (isSpeakerDiarizationText(normalized) && /\b(add|fix|implement|verify|improve|support|label|transcribe|record|recording)\b/.test(normalized)) return 'Codex';
  if (/\b(kimi|kimmy|codex|bot|agent|system|machine task|programming|fix|build|wire|configure|process|transcribe|deploy|verify|parse|parser|routing|dashboard|content section|telegram buttons?)\b/.test(normalized)) return 'Codex';
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
  if (/(railway)/.test(lower) && /(token|deploy|login|logged|problem)/.test(lower)) {
    return 'Stabilize Railway token, deploy, and smoke-test workflow';
  }
  value = value.charAt(0).toUpperCase() + value.slice(1);
  if (value.length > 220) value = `${value.slice(0, 217).trim()}...`;
  return value;
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

  if (!candidates.length) return [];

  return candidates.map((line) => ({
    title: polishTaskCandidateText(line),
    notes: explainTaskCandidate(line),
    stage: inferTaskStage(line),
    category: inferTaskCategory(line),
    urgency: /urgent|asap|right away|immediately|today/i.test(line) ? 'urgent' : 'this_week',
    assigned_to: inferTaskOwner(line),
    project_key: inferProjectKeyFromText(line),
    decision_required: inferTaskStage(line) === 'needs_decision',
    original_text: line,
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

function titleFromRawTaskText(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return '';
  const firstLine = text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || text;
  return polishTaskCandidateText(firstLine).slice(0, 240);
}

async function createTaskFromText(input = {}, options = {}, db = pool) {
  const rawText = String(input.raw_text || input.rawText || input.ramble || input.text || input.title || '').trim();
  const title = String(input.title || titleFromRawTaskText(rawText)).trim();
  if (!title) {
    const error = new Error('Task title or raw text is required');
    error.statusCode = 400;
    throw error;
  }

  const project = await resolveProjectFromInput({ ...input, raw_text: rawText || title }, db);
  if (options.req) assertProjectAccess(options.req, project);

  const inferredStage = inferTaskStage(`${title}\n${rawText}`);
  const decisionRequired =
    input.decision_required !== undefined
      ? Boolean(input.decision_required)
      : Boolean(input.decisionRequired) || inferredStage === 'needs_decision';
  const assignedTo = normalizeTaskAssignee(input.assigned_to || input.assignedTo || input.owner);
  const notes = String(input.notes || input.context || input.source_context?.notes || '').trim()
    || (rawText && rawText !== title ? rawText : null);
  const createdBy = String(input.created_by || input.createdBy || input.author || 'telegram').trim();
  const author = String(input.author || createdBy || '').trim() || null;
  const category = safeTaskCategory(input.category || inferTaskCategory(`${title}\n${rawText}`));
  const stage = String(input.stage || (decisionRequired ? 'needs_decision' : (inferredStage === 'raw_input' ? 'assigned' : inferredStage || 'assigned'))).trim();
  const urgency = safeTaskUrgency(input.urgency);
  const source = String(input.source || 'telegram').trim();
  const aiParsed = input.ai_parsed || {
    parser: 'create_task_from_text-v1',
    kind: decisionRequired ? 'decision' : 'task',
    display_title: title,
    original_text: rawText || title,
    project: project.name,
  };

  const result = await db.query(
    `INSERT INTO bna_tasks (
       title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date,
       source, source_context, created_by, assigned_to, ai_parsed, project_id, decision_required, author
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      title,
      notes,
      stage,
      category,
      urgency,
      input.energy_required || null,
      input.estimated_minutes || null,
      input.due_date || null,
      source,
      sourceContextToText(input.source_context || input.context_metadata || null),
      createdBy,
      assignedTo,
      JSON.stringify(aiParsed),
      project.id,
      decisionRequired,
      author,
    ]
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
      signup_id, name, parent_name, parent_email, parent_phone,
      age, grade, current_school, ghl_contact_id, tags, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (signup_id) DO UPDATE SET
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

    const inserted = await db.query(
      `INSERT INTO bna_students (
        name, parent_name, parent_email, parent_phone, status, tags, notes
      ) VALUES ($1, $2, $3, $4, 'active', $5, $6)
      RETURNING *`,
      [
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
      student_id, goal_minutes, goal_type, active, start_date, end_date
    ) VALUES ($1, $2, $3, TRUE, $4::date, NULL)
    RETURNING *`,
    [studentId, goalMinutes, goalType, monthStart]
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
        COALESCE(daily_completion_percentage, individual_percentage, 0) AS daily_completion_percentage,
        COALESCE(daily_completed_boolean, individual_complete, FALSE) AS daily_completed_boolean
     FROM bna_torah_learning_entries
     WHERE student_id = $1
     ORDER BY date ASC, id ASC`,
    [studentId]
  );

  let completedDailyUnits = 0;
  for (const row of entriesResult.rows) {
    const dailyCompletedBoolean = Boolean(row.daily_completed_boolean);
    if (dailyCompletedBoolean) {
      completedDailyUnits += 1;
    }

    const tripProgress = calculateStudentTripProgress({
      carriedOverCompletedUnits,
      completedDailyUnits,
      totalRequiredUnits,
    });

    await db.query(
      `UPDATE bna_torah_learning_entries
       SET daily_completion_percentage = $2,
           daily_completed_boolean = $3,
           completed_daily_units = $4,
           carried_over_completed_units = $5,
           total_completed_units = $6,
           total_required_units = $7,
           total_trip_progress_percentage = $8,
           updated_at = NOW()
       WHERE id = $1`,
      [
        row.id,
        Number(row.daily_completion_percentage || 0),
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
        student_id, goal_minutes, goal_type, active, start_date, end_date
      ) VALUES ($1, $2, $3, TRUE, $4::date, NULL)
      RETURNING *`,
      [studentId, goalMinutes, goalType, monthStart]
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
  const dailyCompletedBoolean = progress.individualComplete;
  const initialTripProgress = calculateStudentTripProgress({
    carriedOverCompletedUnits,
    completedDailyUnits: dailyCompletedBoolean ? 1 : 0,
    totalRequiredUnits,
  });

  const entryResult = await db.query(
    `INSERT INTO bna_torah_learning_entries (
      student_id, goal_id, date, engaged_listening_minutes, inside_engaged_minutes,
      listening_without_following_minutes, counted_minutes, individual_percentage,
      individual_complete, daily_completion_percentage, daily_completed_boolean,
      completed_daily_units, carried_over_completed_units, total_completed_units,
      total_required_units, total_trip_progress_percentage, note
    ) VALUES (
      $1, $2, $3::date, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
    )
    ON CONFLICT (student_id, date) DO UPDATE SET
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
      dailyCompletedBoolean ? 1 : 0,
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

async function getTorahLearningSummary(dateInput, db = pool) {
  const dateString = toIsoDateValue(dateInput || getTodayDateInTimeZone());
  await ensureTorahGoalsForDate(dateString, db);

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
         SUM(CASE WHEN COALESCE(e.daily_completed_boolean, e.individual_complete, FALSE) THEN 1 ELSE 0 END),
         0
       )::DECIMAL(10,2) AS completed_daily_units_count
       FROM bna_torah_learning_entries e
       WHERE e.student_id = s.id
         AND e.date <= $1::date
     ) e_completed ON TRUE
     WHERE COALESCE(s.status, 'active') NOT IN ('inactive', 'archived')
     ORDER BY s.name ASC`,
    [dateString]
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
      row.daily_completion_percentage !== null && row.daily_completion_percentage !== undefined
        ? Number(row.daily_completion_percentage)
        : row.individual_percentage !== null && row.individual_percentage !== undefined
          ? Number(row.individual_percentage)
          : 0;
    const dailyCompletedBoolean =
      row.daily_completed_boolean !== null && row.daily_completed_boolean !== undefined
        ? Boolean(row.daily_completed_boolean)
        : Boolean(row.individual_complete);

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
            individual_complete: Boolean(row.individual_complete),
            daily_completion_percentage: dailyCompletionPercentage,
            daily_completed_boolean: dailyCompletedBoolean,
            completed_daily_units: Number(row.completed_daily_units ?? completedDailyUnits),
            carried_over_completed_units: Number(row.carried_over_completed_units ?? carriedOverCompletedUnits),
            total_completed_units: Number(row.total_completed_units ?? trip.totalCompletedUnits),
            total_required_units: Number(row.total_required_units ?? totalRequiredUnits),
            total_trip_progress_percentage: Number(row.total_trip_progress_percentage ?? trip.totalTripProgressPercentageRaw),
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
  const result = await db.query(
    `INSERT INTO bna_green_invoice_webhook_log (
      event_key, event_type, payment_status, document_id, transaction_id,
      gateway_transaction_id, payer_name, payer_email, payer_phone, amount, currency,
      webhook_received_at, payload, request_headers
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, $11,
      NOW(), $12, $13
    )
    ON CONFLICT (event_key) DO UPDATE SET
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
  const result = await db.query(
    `SELECT *
     FROM signups
     WHERE (
       ($1 <> '' AND parent_email IS NOT NULL AND lower(parent_email) = lower($1))
       OR ($2 <> '' AND parent_phone IS NOT NULL AND regexp_replace(parent_phone, '\\D', '', 'g') = $2)
       OR ($3 <> '' AND parent_name IS NOT NULL AND lower(parent_name) = lower($3))
     )
     ORDER BY created_at DESC
     LIMIT 1`,
    [
      normalized.payerEmail || '',
      normalizeDigits(normalized.payerPhone || ''),
      normalized.payerName || '',
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
            signup_id, payment_type, amount, currency, method, green_invoice_id,
            green_invoice_url, status, received_by, received_at, notes
          ) VALUES ($1, 'registration', $2, $3, 'green_invoice', $4, $5, 'completed', 'green_invoice_webhook', NOW(), $6)
          RETURNING *`,
          [
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
             ORDER BY received_at DESC
             LIMIT 1`,
            [greenInvoiceId]
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
      signup_id, payment_type, amount, currency, method, green_invoice_id,
      green_invoice_url, status, received_by, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, $9)`,
    [
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
    await pool.query(createSignupsTableSQL);
    await pool.query(createProjectsSQL);
    await pool.query(createTasksTableSQL);
    await pool.query(createProjectMembersSQL);
    await pool.query(createTaskCommentsSQL);
    await pool.query(normalizeTasksCategoryCheckSQL);
    await pool.query(normalizeTasksStageCheckSQL);
    await pool.query(normalizeTasksSourceCheckSQL);
    await pool.query(createPaymentLogSQL);
    await pool.query(createEmailLogSQL);
    await pool.query(createPaymentIntakeSQL);
    await pool.query(createStudentsSQL);
    await pool.query(createTorahLearningGoalsSQL);
    await pool.query(createTorahLearningEntriesSQL);
    await pool.query(createGreenInvoiceWebhookLogSQL);
    await pool.query(createAccountabilityEventsSQL);
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

initDb();

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
  const facebook = accounts.find((account) => String(account.platform || '').toLowerCase() === 'facebook');
  if (!facebook?.id) throw new Error('No connected Facebook account found in GHL');

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

async function upsertProject({ projectKey, name, shortName, description, metadata = {} }, db = pool) {
  const result = await db.query(
    `INSERT INTO bna_projects (project_key, name, short_name, description, metadata)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (project_key) DO UPDATE
       SET name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           description = COALESCE(EXCLUDED.description, bna_projects.description),
           metadata = COALESCE(bna_projects.metadata, '{}'::jsonb) || EXCLUDED.metadata,
           updated_at = NOW()
     RETURNING *`,
    [projectKey, name, shortName || name, description || null, JSON.stringify(metadata || {})]
  );
  return result.rows[0];
}

async function ensureProjectMember(project, personName, fields = {}, db = pool) {
  if (!project?.id || !personName) return null;
  const result = await db.query(
    `INSERT INTO bna_project_members (project_id, person_name, role, access_level, telegram_chat_id, login_username, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (project_id, person_name) DO UPDATE
       SET role = EXCLUDED.role,
           access_level = EXCLUDED.access_level,
           telegram_chat_id = COALESCE(EXCLUDED.telegram_chat_id, bna_project_members.telegram_chat_id),
           login_username = COALESCE(EXCLUDED.login_username, bna_project_members.login_username),
           metadata = COALESCE(bna_project_members.metadata, '{}'::jsonb) || EXCLUDED.metadata,
           active = TRUE,
           updated_at = NOW()
     RETURNING *`,
    [
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

async function ensureDefaultProjects(db = pool) {
  const bna = await upsertProject({
    projectKey: DEFAULT_PROJECT_KEY,
    name: 'BNA',
    shortName: 'BNA',
    description: 'Bnei Neviim Academy operations, students, content, contacts, and accounting.',
  }, db);
  const oneTime = await upsertProject({
    projectKey: ONE_TIME_PROJECT_KEY,
    name: 'One Time Mishnah Class',
    shortName: 'One Time',
    description: 'Rabbi Elie Scheller task manager, comments, Torah class prep, and Mishnah class planning.',
    metadata: {
      agent: 'rabbi-elie-scheller',
      preferred_source_lookup: 'sefaria',
    },
  }, db);

  await ensureProjectMember(bna, 'Shloimie', { role: 'operator', access_level: 'owner' }, db);
  await ensureProjectMember(oneTime, 'Shloimie', { role: 'project owner', access_level: 'owner' }, db);
  await ensureProjectMember(oneTime, 'Rabbi Elie Scheller', {
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

  return { bna, oneTime };
}

async function getProjectByKey(projectKey, db = pool) {
  const normalized = normalizeProjectKey(projectKey || DEFAULT_PROJECT_KEY) || DEFAULT_PROJECT_KEY;
  const result = await db.query('SELECT * FROM bna_projects WHERE project_key = $1 LIMIT 1', [normalized]);
  if (result.rows[0]) return result.rows[0];
  const seeded = await ensureDefaultProjects(db);
  return normalized === ONE_TIME_PROJECT_KEY ? seeded.oneTime : seeded.bna;
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
  return req?.opsIdentity?.scope?.type === 'project'
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

async function assertTaskAccess(req, taskId, db = pool) {
  const scopedProjectKey = opsScopeProjectKey(req);
  if (!scopedProjectKey) return null;
  const result = await db.query(
    `SELECT t.id, p.project_key
     FROM bna_tasks t
     LEFT JOIN bna_projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [taskId]
  );
  const task = result.rows[0];
  if (!task || normalizeProjectKey(task.project_key) !== scopedProjectKey) {
    const error = new Error('This login can only access One Time Mishnah Class tasks.');
    error.statusCode = 403;
    throw error;
  }
  return task;
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

async function insertTorahTimerAccountabilityEvent(client, {
  student,
  job = {},
  sourceUpdate = {},
  torahRecord = null,
  groupGoalEntry = null,
  mapping = {},
}) {
  if (!student || !mapping.hasTimerBreakdown) return null;
  const notes = buildTorahTimerNote(sourceUpdate.notes || null, mapping, job);
  const inserted = (await client.query(
    `INSERT INTO bna_accountability_events (
      event_type, student_id, student_name, title, notes, topic,
      goal_target_value, goal_actual_value, goal_unit, progress_percent,
      engagement_level, follow_up_required, metadata,
      source, source_message_id, source_media_url, occurred_at
    ) VALUES (
      'learning_note', $1, $2, $3, $4, 'Torah daily engagement',
      $5, $6, 'minutes', $7,
      $8, FALSE, $9,
      'recording', $10, $11, NOW()
    )
    RETURNING *`,
    [
      student.id,
      student.name,
      `Torah timer update for ${student.name}`.slice(0, 240),
      notes || null,
      mapping.goalMinutes,
      mapping.countedMinutes,
      mapping.progressPercent,
      mapping.engagementLevel,
      JSON.stringify({
        parser: 'mixed-recording-v1',
        source_content_job_id: job.id || null,
        torah_entry_id: torahRecord?.entry?.id || null,
        group_goal_entry_id: groupGoalEntry?.id || null,
        timer_mapping: mapping,
        original: sourceUpdate,
      }),
      String(job.id || ''),
      job.media_url || null,
    ]
  )).rows[0];
  return inserted;
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
    `INSERT INTO bna_group_goals (title, description, scoring_rule, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING *`,
    [
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
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    class_notes: [{
      title: job?.title || 'Mixed recording',
      summary: 'AI parse timed out, so this recording was filed with a conservative fallback parse for review.',
      topics: ['Tasks', 'Student accountability', 'Torah progress'].filter((topic) => text.toLowerCase().includes(topic.toLowerCase().split(' ')[0])),
      discussions: [],
      sources: [],
    }],
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
    `INSERT INTO bna_content_prompt_examples (platform, title, body, source_output_id, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING *`,
    [platform, output.title || outputTypeLabel(platform), output.body, output.id]
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
  const result = await db.query(
    `INSERT INTO bna_payment_intake (
      signup_id, parent_name, parent_email, parent_phone, student_name,
      amount, currency, method, payment_type, green_invoice_id, green_invoice_url,
      ghl_contact_id, status, source, source_context, received_at, notes
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, COALESCE($7, 'ILS'), $8, COALESCE($9, 'registration'), $10, $11,
      $12, COALESCE($13, 'unmatched'), COALESCE($14, 'manual'), $15,
      COALESCE($16::timestamp, NOW()), $17
    ) RETURNING *`,
    [
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
      legacy: pipeline.legacy,
      brandKit: pipeline.brandKit,
      brandDocs: pipeline.brandDocs,
      platformMemory: pipeline.platformMemory,
      platformDocs: pipeline.platformDocs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    waiver_version
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
  const normalizedPaymentMethod = String(payment_method || '').trim().toLowerCase() === 'cash'
    ? 'cash'
    : 'green_invoice';
  const paymentDueDate = toDateOnly(addDays(new Date(), DEFAULT_PAYMENT_INTERVAL_DAYS));
  const paymentDisplayLabel = normalizedPaymentMethod === 'cash' ? 'Cash' : 'Credit';
  const notes = [
    normalizedLanguage ? `Form Language: ${normalizedLanguage}` : null,
    waiver_accepted ? `Waiver accepted: ${waiver_version || WAIVER_VERSION}` : null,
    address ? `Address: ${address}` : null,
    parent2_name ? `Parent 2 Name: ${parent2_name}` : null,
    parent2_email ? `Parent 2 Email: ${parent2_email}` : null,
    parent2_phone ? `Parent 2 Phone: ${parent2_phone}` : null
  ].filter(Boolean).join('\n');

  if (!normalizedParentName || !normalizedParentEmail || !normalizedParentPhone || !parent2_name || !parent2_phone || !normalizedStudentName) {
    return res.status(400).json({ error: 'Missing required signup details: student name, both parent names, both parent phone numbers, and one parent email are required' });
  }

  if (!waiver_accepted) {
    return res.status(400).json({ error: 'Parent waiver must be accepted before signup' });
  }

  try {
    // Insert signup
    const result = await pool.query(
      `INSERT INTO signups (
        parent_name, parent_email, parent_phone,
        student_name, student_age, student_grade,
        previous_school, reason_applying, special_needs,
        payment_method, payment_amount, payment_interval_days, payment_due_date,
        form_language, waiver_accepted, waiver_accepted_at, waiver_version,
        tags, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, NOW(), $16, $17, $18
      ) RETURNING *`,
      [
        normalizedParentName, normalizedParentEmail, normalizedParentPhone,
        normalizedStudentName, normalizedStudentAge, normalizedStudentGrade,
        normalizedPreviousSchool, normalizedReasonApplying, normalizedSpecialNeeds,
        normalizedPaymentMethod,
        DEFAULT_TUITION_AMOUNT,
        DEFAULT_PAYMENT_INTERVAL_DAYS,
        paymentDueDate,
        normalizedLanguage,
        true,
        waiver_version || WAIVER_VERSION,
        ['parent', 'bna', normalizedLanguage === 'he' ? 'hebrew_form' : 'english_form'],
        notes || null
      ]
    );
    
    let signup = result.rows[0];
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
      res.json({ success: true, signupId: signup.id, paymentMethod: normalizedPaymentMethod === 'green_invoice' ? 'credit' : 'cash', matchedPaymentIntakeId: matchedPaymentIntake.id, confirmationEmailSent: emailResult.ok });
    } else if (normalizedPaymentMethod === 'green_invoice') {
      res.json({ 
        success: true, 
        signupId: signup.id,
        paymentMethod: 'credit',
        paymentLink: PAYMENT_LINK,
        confirmationEmailSent: emailResult.ok
      });
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
      `INSERT INTO bna_payment_log (signup_id, payment_type, amount, method, status, received_by, received_at, notes)
       VALUES ($1, 'registration', $2, $3, 'completed', 'admin', NOW(), $4)`,
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
  const { status, payment_status } = req.query;
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (payment_status) {
    params.push(payment_status);
    conditions.push(`payment_status = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT * FROM signups ${whereClause} ORDER BY created_at DESC`,
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
  try {
    await ensureStudentsFromSignups();
    const result = await pool.query(
      `SELECT s.*,
        COALESCE(goal_counts.open_goals, 0) AS open_goals,
        COALESCE(question_counts.questions, 0) AS questions,
        COALESCE(progress_counts.avg_progress, 0) AS avg_goal_progress,
        next_check.next_check_in_date
       FROM bna_students s
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
       WHERE COALESCE(s.status, 'active') NOT IN ('archived', 'inactive')
       ORDER BY s.name ASC`
    );
    res.json({ students: result.rows });
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
    const existing = (await pool.query(
      `SELECT *
       FROM bna_students
       WHERE lower(name) = lower($1)
          OR lower(regexp_replace(name, '[^a-zA-Z0-9א-ת]+', ' ', 'g')) = lower(regexp_replace($1, '[^a-zA-Z0-9א-ת]+', ' ', 'g'))
       ORDER BY status = 'active' DESC, created_at DESC
       LIMIT 1`,
      [name]
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
         RETURNING *`,
        [parent_name || null, parent_email || null, parent_phone || null, age || null, grade || null, current_school || null, notes || null, tags, status, existing.id]
      )
      : await pool.query(
        `INSERT INTO bna_students (name, parent_name, parent_email, parent_phone, age, grade, current_school, notes, tags, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, parent_name || null, parent_email || null, parent_phone || null, age || null, grade || null, current_school || null, notes || null, tags, status]
      );

    res.json({ success: true, student: result.rows[0], merged_existing: Boolean(existing) });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE bna_students
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/students/:id/access-code', requireAdmin, async (req, res) => {
  try {
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
    res.status(/not found/i.test(err.message) ? 404 : 500).json({ error: err.message });
  }
});

app.post('/api/bna/students/:id/merge', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { source_student_id, source_name } = req.body || {};
  const client = await pool.connect();

  try {
    const target = (await client.query('SELECT * FROM bna_students WHERE id = $1', [id])).rows[0];
    if (!target) return res.status(404).json({ error: 'Target student not found' });

    let source = null;
    if (source_student_id) {
      source = (await client.query('SELECT * FROM bna_students WHERE id = $1', [source_student_id])).rows[0];
    } else if (source_name) {
      source = (await client.query(
        `SELECT * FROM bna_students
         WHERE id <> $1 AND lower(name) = lower($2)
         ORDER BY created_at DESC
         LIMIT 1`,
        [id, source_name]
      )).rows[0];
    }

    if (!source) {
      return res.json({ success: true, target, merged: false, message: 'No duplicate source student found.' });
    }

    await client.query('BEGIN');
    await client.query(
      `UPDATE bna_accountability_events
       SET student_id = $1,
           student_name = COALESCE(student_name, $2),
           updated_at = NOW()
       WHERE student_id = $3`,
      [id, target.name, source.id]
    );
    await client.query(
      `UPDATE bna_group_goal_entries
       SET student_id = $1,
           student_name = COALESCE(student_name, $2),
           updated_at = NOW()
       WHERE student_id = $3`,
      [id, target.name, source.id]
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
         WHERE id = $1`,
        [source.id]
      );
      await client.query(
        `UPDATE bna_students
         SET signup_id = $2,
             parent_name = COALESCE(parent_name, $3),
             parent_email = COALESCE(parent_email, $4),
             parent_phone = COALESCE(parent_phone, $5),
             updated_at = NOW()
         WHERE id = $1
           AND signup_id IS NULL`,
        [id, source.signup_id, source.parent_name, source.parent_email, source.parent_phone]
      );
    }
    await client.query(
      `UPDATE bna_students
       SET signup_id = NULL,
           status = 'inactive',
           notes = CONCAT(COALESCE(notes, ''), CASE WHEN COALESCE(notes, '') = '' THEN '' ELSE E'\n' END, $1::text),
           updated_at = NOW()
       WHERE id = $2`,
      [`Merged into ${target.name} (#${target.id}) on ${new Date().toISOString().slice(0, 10)}.`, source.id]
    );
    await client.query('COMMIT');

    res.json({ success: true, target, source, merged: true });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/bna/accountability', requireAdmin, async (req, res) => {
  const { event_type, student_id, limit = 100 } = req.query;
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

  params.push(Math.min(Number(limit) || 100, 250));
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT a.*, row_to_json(s.*) AS student
       FROM bna_accountability_events a
       LEFT JOIN bna_students s ON s.id = a.student_id
       ${whereClause}
       ORDER BY a.occurred_at DESC, a.created_at DESC
       LIMIT $${params.length}`,
      params
    );
    res.json({ events: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const student = (await pool.query(
      `SELECT id, name
       FROM bna_students
       WHERE student_access_code = $1
         AND COALESCE(student_access_enabled, TRUE) = TRUE
         AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')
       LIMIT 1`,
      [code]
    )).rows[0];
    if (!student) return res.status(404).json({ error: 'Student access code was not found' });

    const goals = (await pool.query(
      `SELECT
          id,
          title,
          topic,
          goal_target_value,
          goal_actual_value,
          goal_unit,
          progress_percent,
          follow_up_required,
          occurred_at,
          updated_at
       FROM bna_accountability_events
       WHERE student_id = $1
         AND event_type = 'student_goal'
       ORDER BY COALESCE(follow_up_required, FALSE) DESC,
                COALESCE(progress_percent, -1) ASC,
                occurred_at DESC,
                id DESC`,
      [student.id]
    )).rows.map((goal) => ({
      id: goal.id,
      title: goal.title,
      topic: goal.topic || '',
      goal_target_value: goal.goal_target_value !== null ? Number(goal.goal_target_value) : null,
      goal_actual_value: goal.goal_actual_value !== null ? Number(goal.goal_actual_value) : null,
      goal_unit: goal.goal_unit || '',
      progress_percent: goal.progress_percent !== null && goal.progress_percent !== undefined
        ? Number(goal.progress_percent)
        : null,
      follow_up_required: Boolean(goal.follow_up_required),
      occurred_at: goal.occurred_at,
      updated_at: goal.updated_at,
    }));

    const torahSummary = await getTorahLearningSummary(getTodayDateInTimeZone());
    const torahRecord = (torahSummary.students || []).find((item) => Number(item.id) === Number(student.id));

    res.json({
      student,
      goals,
      torah: torahRecord
        ? {
            date: torahSummary.date,
            public_trip_percentage: torahRecord.percentage,
            daily_completion_percentage: Number(torahRecord.entry?.daily_completion_percentage || 0),
          }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student-portal/goals/:id/checkoff', async (req, res) => {
  const code = String((req.body || {}).access_code || '').trim();
  const progressPercent = Math.max(0, Math.min(100, Math.round(Number((req.body || {}).progress_percent))));
  if (!code) return res.status(400).json({ error: 'Student access code is required' });
  if (!Number.isFinite(progressPercent)) return res.status(400).json({ error: 'progress_percent must be a number' });

  try {
    const student = (await pool.query(
      `SELECT id, name
       FROM bna_students
       WHERE student_access_code = $1
         AND COALESCE(student_access_enabled, TRUE) = TRUE
         AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')
       LIMIT 1`,
      [code]
    )).rows[0];
    if (!student) return res.status(404).json({ error: 'Student access code was not found' });

    const result = await pool.query(
      `UPDATE bna_accountability_events
       SET progress_percent = $3::numeric,
           goal_actual_value = CASE
             WHEN goal_target_value IS NULL THEN goal_actual_value
             ELSE ROUND((goal_target_value * $3::numeric / 100), 2)
           END,
           follow_up_required = $3::numeric < 100,
           updated_at = NOW()
       WHERE id = $1
         AND student_id = $2
         AND event_type = 'student_goal'
       RETURNING id, title, progress_percent, goal_actual_value, goal_target_value, goal_unit, follow_up_required`,
      [req.params.id, student.id, progressPercent]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Goal was not found for this student' });
    res.json({ success: true, goal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/torah-learning', requireAdmin, async (req, res) => {
  try {
    const summary = await getTorahLearningSummary(req.query.date || getTodayDateInTimeZone());
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/torah-learning/entries', requireAdmin, async (req, res) => {
  try {
    const saved = await upsertTorahLearningEntry(req.body || {});
    const summary = await getTorahLearningSummary((req.body || {}).date || getTodayDateInTimeZone());
    res.json({
      success: true,
      saved,
      summary,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/bna/green-invoice/webhooks', requireAdmin, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  try {
    const result = await pool.query(
      `SELECT l.*,
              row_to_json(s.*) AS signup,
              row_to_json(st.*) AS student
       FROM bna_green_invoice_webhook_log l
       LEFT JOIN signups s ON s.id = l.matched_signup_id
       LEFT JOIN bna_students st ON st.id = l.matched_student_id
       ORDER BY l.webhook_received_at DESC, l.id DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ events: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/green-invoice/webhooks/:id/reprocess', requireAdmin, async (req, res) => {
  try {
    const logResult = await pool.query(
      'SELECT * FROM bna_green_invoice_webhook_log WHERE id = $1 LIMIT 1',
      [req.params.id]
    );
    const logRow = logResult.rows[0];
    if (!logRow) {
      return res.status(404).json({ error: 'Green Invoice webhook log not found' });
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
    const studentResult = await pool.query('SELECT * FROM bna_students WHERE id = $1', [id]);
    const student = studentResult.rows[0];
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await pool.query(
      `UPDATE bna_accountability_events
       SET student_id = NULL,
           student_name = COALESCE(student_name, $2),
           updated_at = NOW()
       WHERE student_id = $1`,
      [id, student.name || null]
    );

    await pool.query(
      `UPDATE bna_students
       SET status = 'inactive',
           updated_at = NOW()
       WHERE id = $1`,
      [id]
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
    res.status(500).json({ error: err.message });
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
    const result = await pool.query(
      `INSERT INTO bna_accountability_events (
        event_type, student_id, student_name, title, notes, topic, question_text,
        goal_target_value, goal_actual_value, goal_unit, progress_percent,
        attendance_status, next_check_in_date, engagement_level, follow_up_required, metadata,
        source, source_message_id, source_media_url, occurred_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, COALESCE($20::timestamp, NOW())
      )
      RETURNING *`,
      [
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

    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE bna_accountability_events
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Accountability event not found' });
    }
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bna/accountability/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM bna_accountability_events WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/group-goals', requireAdmin, async (req, res) => {
  try {
    await ensureDefaultGroupGoal();
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
       LEFT JOIN bna_group_goal_entries e ON e.goal_id = g.id
       LEFT JOIN bna_students s ON s.id = e.student_id
       WHERE g.status <> 'archived'
       GROUP BY g.id
       ORDER BY g.status = 'active' DESC, g.created_at DESC`
    );
    res.json({ goals: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/group-goals', requireAdmin, async (req, res) => {
  const { title, description, target_minutes, scoring_rule, status = 'active', start_date, due_date, metadata } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const result = await pool.query(
      `INSERT INTO bna_group_goals (title, description, target_minutes, scoring_rule, status, start_date, due_date, metadata)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7, $8)
       RETURNING *`,
      [title, description || null, target_minutes || null, scoring_rule || null, status, start_date || null, due_date || null, metadata ? JSON.stringify(metadata) : JSON.stringify({})]
    );
    res.json({ success: true, goal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const goal = (await pool.query('SELECT * FROM bna_group_goals WHERE id = $1', [id])).rows[0];
    if (!goal) return res.status(404).json({ error: 'Group goal not found' });
    const computed = calculateWeightedGoal({
      target_minutes: target_minutes || goal.target_minutes,
      inside_following_minutes,
      inside_listening_minutes,
    });
    const result = await pool.query(
      `INSERT INTO bna_group_goal_entries (
        goal_id, student_id, student_name, recorded_date, target_minutes,
        inside_following_minutes, inside_listening_minutes, distracted_minutes, weighted_minutes,
        progress_percent, notes, source_content_job_id, metadata
      )
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
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
    res.status(500).json({ error: err.message });
  }
});

// BNA dashboard: payment intake for parents who paid before signup
app.get('/api/bna/payment-intake', requireAdmin, async (req, res) => {
  const { status } = req.query;
  const params = [];
  let whereClause = '';

  if (status) {
    params.push(status);
    whereClause = `WHERE i.status = $${params.length}`;
  }

  try {
    const result = await pool.query(
      `SELECT i.*, row_to_json(s.*) AS signup
       FROM bna_payment_intake i
       LEFT JOIN signups s ON s.id = i.signup_id
       ${whereClause}
       ORDER BY i.received_at DESC, i.created_at DESC
       LIMIT 100`,
      params
    );
    res.json({ intake: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  } = req.body || {};

  try {
    let ghlContactId = null;
    if (GHL_PIT_TOKEN && (parent_email || parent_phone || parent_name)) {
      try {
        const nameParts = String(parent_name || 'BNA Parent').trim().split(/\s+/);
        const firstName = nameParts.shift() || 'BNA';
        const lastName = nameParts.join(' ') || 'Parent';
        ghlContactId = await findOrCreateGHLContact(
          parent_email || `${String(parent_phone || Date.now()).replace(/\D/g, '')}@bna.payment-intake`,
          firstName,
          lastName,
          parent_phone || '',
          { tags: ['BNA Parent', 'Payment Intake'] }
        );
        await addTagToContact(ghlContactId, 'BNA Parent');
        await addTagToContact(ghlContactId, 'Payment Intake');
      } catch (ghlErr) {
        console.error('Payment intake GHL sync error:', ghlErr);
      }
    }

    const intake = await createPaymentIntakeRecord({
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
      ghl_contact_id: ghlContactId,
      status,
      source,
      source_context,
      received_at,
      notes,
    });

    res.json({ success: true, intake });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bna/payment-intake/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
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

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE bna_payment_intake
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    res.json({ success: true, intake: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bna/payment-intake/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM bna_payment_intake WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BNA dashboard: content repurposing pipeline
app.get('/api/bna/content-jobs', requireAdmin, async (req, res) => {
  const { status } = req.query;
  const params = [];
  let whereClause = '';

  if (status) {
    params.push(status);
    whereClause = `WHERE j.status = $${params.length}`;
  }

  try {
    const result = await pool.query(
      `SELECT j.*,
        COALESCE(
          json_agg(o.* ORDER BY o.created_at ASC) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) AS outputs
       FROM bna_content_jobs j
       LEFT JOIN bna_content_outputs o ON o.job_id = j.id
       ${whereClause}
       GROUP BY j.id
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
  try {
    const result = await pool.query(
      `SELECT cs.*, row_to_json(j.*) AS content_job
       FROM bna_class_sessions cs
       LEFT JOIN bna_content_jobs j ON j.id = cs.content_job_id
       ORDER BY cs.class_date DESC, cs.created_at DESC
       LIMIT 100`
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const result = await pool.query(
      `INSERT INTO bna_content_prompt_examples (platform, title, body, file_url, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [platform, title, body || null, file_url || null]
    );
    res.json({ success: true, example: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/content-bundles', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
        COALESCE(
          json_agg(
            json_build_object('id', j.id, 'title', j.title, 'mime_type', j.mime_type, 'created_at', j.created_at)
            ORDER BY j.created_at DESC
          ) FILTER (WHERE j.id IS NOT NULL),
          '[]'
        ) AS jobs
       FROM bna_content_bundles b
       LEFT JOIN bna_content_bundle_items i ON i.bundle_id = b.id
       LEFT JOIN bna_content_jobs j ON j.id = i.content_job_id
       WHERE b.status <> 'archived'
       GROUP BY b.id
       ORDER BY b.created_at DESC
       LIMIT 20`
    );
    res.json({ bundles: result.rows });
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
    const bundle = (await client.query(
      `INSERT INTO bna_content_bundles (title, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, start_date || null, end_date || null, notes || null]
    )).rows[0];
    for (const jobId of job_ids.map(Number).filter(Boolean)) {
      await client.query(
        `INSERT INTO bna_content_bundle_items (bundle_id, content_job_id)
         VALUES ($1, $2)
         ON CONFLICT (bundle_id, content_job_id) DO NOTHING`,
        [bundle.id, jobId]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, bundle });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
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

    const { prompt, examples } = await getPromptBundle('weekly_newsletter');
    const draft = await generateDraftWithPrompt({ outputType: 'weekly_newsletter', prompt, examples, jobs, instruction });
    const output = (await pool.query(
      `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata, prompt_id, prompt_version, bundle_id)
       VALUES ($1, 'weekly_newsletter', $2, $3, 'email', 'needs_approval', $4, $5, $6, $7)
       RETURNING *`,
      [
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
    res.status(500).json({ error: err.message });
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
    const jobResult = await client.query(
      `INSERT INTO bna_content_jobs (
        title, source_type, source_message_id, source_chat_id, local_path, media_url,
        drive_file_id, drive_folder_id, drive_stage,
        mime_type, caption, status, transcript_text, transcript_json, parse_json, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        title,
        source_type,
        source_message_id || null,
        source_chat_id || null,
        local_path || null,
        media_url || null,
        drive_file_id || null,
        drive_folder_id || null,
        drive_stage || null,
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
        `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
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
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.patch('/api/bna/content-jobs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
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

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!allowedFields.includes(key)) continue;
    values.push(['transcript_json', 'parse_json'].includes(key) && value ? JSON.stringify(value) : value);
    fields.push(`${key} = $${values.length}`);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'No valid content job fields provided' });
  }

  values.push(id);

  try {
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
    res.status(500).json({ error: err.message });
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
      `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata, prompt_id, prompt_version)
       VALUES ($1, $2, $3, $4, $5, 'needs_approval', $6, $7, $8)
       RETURNING *`,
      [
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
    if (!String(job.transcript_text || '').trim()) {
      return res.status(400).json({ error: 'Content job does not have a transcript yet' });
    }
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
        message: 'This recording was already parsed. Use force if you intentionally want to reparse and create new records.',
        report: previousParse.mixed_recording_parse.report || {},
        counts: previousParse.mixed_recording_parse.counts || {},
      });
    }

    const students = (await pool.query(
      `SELECT *
       FROM bna_students
       WHERE COALESCE(status, 'active') NOT IN ('archived', 'inactive')
       ORDER BY name ASC`
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
        const inserted = await createTaskFromText({
          title,
          raw_text: task.original_text || task.source_text || task.notes || title,
          notes: task.notes || `Extracted from content job #${job.id}: ${job.title || 'Untitled recording'}`,
          stage: 'assigned',
          category: safeTaskCategory(task.category || inferTaskCategory(taskText)),
          urgency: safeTaskUrgency(task.urgency),
          source: 'content_job',
          source_context: { content_job_id: job.id },
          created_by: 'mixed-recording-parser',
          assigned_to: safeTaskOwner(task.assigned_to, task),
          project: task.project || task.project_key || inferProjectKeyFromText(taskText),
          decision_required: Boolean(task.decision_required),
          ai_parsed: {
            parser: 'mixed-recording-v1',
            source_content_job_id: job.id,
            original: task,
          },
        }, {}, client);
        createdTasks.push(inserted);
      }

      for (const event of accountabilityEvents) {
        if (!event?.title) continue;
        const matchedStudent = event.student_id
          ? students.find((student) => Number(student.id) === Number(event.student_id))
          : findStudentForParsedName(event.student_name, students);
        const inserted = (await client.query(
          `INSERT INTO bna_accountability_events (
            event_type, student_id, student_name, title, notes, topic, question_text,
            goal_target_value, goal_actual_value, goal_unit, progress_percent,
            attendance_status, next_check_in_date, engagement_level, follow_up_required, metadata,
            source, source_message_id, source_media_url, occurred_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14, $15, $16,
            'recording', $17, $18, NOW()
          )
          RETURNING *`,
          [
            safeAccountabilityEventType(event.event_type),
            matchedStudent?.id || null,
            matchedStudent?.name || event.student_name || null,
            String(event.title).slice(0, 240),
            event.notes || null,
            event.topic || null,
            event.question_text || null,
            event.goal_target_value || null,
            event.goal_actual_value || null,
            event.goal_unit || null,
            clampProgressPercent(event.progress_percent),
            event.attendance_status || null,
            event.next_check_in_date || null,
            event.engagement_level || null,
            Boolean(event.follow_up_required),
            JSON.stringify({ parser: 'mixed-recording-v1', source_content_job_id: job.id, original: event }),
            String(job.id),
            job.media_url || null,
          ]
        )).rows[0];
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
        const inserted = (await client.query(
          `INSERT INTO bna_group_goal_entries (
            goal_id, student_id, student_name, recorded_date, target_minutes,
            inside_following_minutes, inside_listening_minutes, distracted_minutes, weighted_minutes,
            progress_percent, notes, source_content_job_id, metadata
          )
          VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            goal.id,
            matchedStudent?.id || null,
            matchedStudent?.name || entry.student_name || null,
            entryDate,
            targetMinutes,
            storedInsideFollowingMinutes,
            storedInsideListeningMinutes,
            mapping.distractedMinutes,
            computed.weighted,
            progressPercent,
            entry.notes || null,
            job.id,
            JSON.stringify({ parser: 'mixed-recording-v1', source_content_job_id: job.id, timer_mapping: mapping, original: entry }),
          ]
        )).rows[0];
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
          });
          if (timerEvent) createdEvents.push(timerEvent);
        }
      }

      for (const update of dailyTorahUpdates) {
        const savedUpdates = await upsertParsedDailyTorahUpdate(update, students, job, client);
        createdDailyTorahUpdates.push(...savedUpdates);
        for (const savedUpdate of savedUpdates) {
          const timerEvent = await insertTorahTimerAccountabilityEvent(client, {
            student: savedUpdate.student,
            job,
            sourceUpdate: update,
            torahRecord: savedUpdate,
            mapping: savedUpdate.parser_timer_mapping,
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
    const result = await pool.query(
      `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, output_type, title || null, body || null, platform || null, status, metadata ? JSON.stringify(metadata) : null]
    );
    res.json({ success: true, output: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/content-outputs/:id/actions', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body || {};

  try {
    const output = (await pool.query('SELECT * FROM bna_content_outputs WHERE id = $1', [id])).rows[0];
    if (!output) return res.status(404).json({ error: 'Content output not found' });
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

      const updated = (await pool.query(
        `UPDATE bna_content_outputs
         SET status = 'published',
             metadata = $1,
             approved_at = COALESCE(approved_at, NOW()),
             published_at = NOW(),
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(metadata), id]
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
          `INSERT INTO bna_content_outputs (job_id, output_type, title, body, platform, status, metadata, prompt_id, prompt_version)
           VALUES ($1, $2, $3, $4, $5, 'needs_approval', $6, $7, $8)
           RETURNING *`,
          [job.id, targetType, title, body, platformForOutputType(targetType), JSON.stringify(metadata), prompt.id, prompt.version]
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
        stage: 'assigned',
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
  const { signup_id } = req.query;
  const params = [];
  let whereClause = '';

  if (signup_id) {
    params.push(signup_id);
    whereClause = `WHERE p.signup_id = $${params.length}`;
  }

  try {
    const result = await pool.query(
      `SELECT
        p.*,
        row_to_json(s.*) AS signup
      FROM bna_payment_log p
      LEFT JOIN signups s ON s.id = p.signup_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT 100`,
      params
    );
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bna/payment-reminders/due', requireAdmin, async (req, res) => {
  try {
    const daysBefore = Number(req.query.days_before || req.query.daysBefore || PAYMENT_REMINDER_DAYS_BEFORE);
    const { today, reminderTarget, candidates } = await getPaymentReminderCandidates({ daysBefore });
    res.json({
      success: true,
      today,
      reminderTarget,
      daysBefore,
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
  } = req.body;

  if (!signup_id || !amount || !method) {
    return res.status(400).json({ error: 'signup_id, amount, and method are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bna_payment_log (
        signup_id, payment_type, amount, method, status, received_by, received_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7) RETURNING *`,
      [signup_id, payment_type, amount, method, status, received_by, notes || null]
    );

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
         WHERE id = $3`,
        [amount, method, signup_id, DEFAULT_PAYMENT_INTERVAL_DAYS]
      );
    }

    res.json({ success: true, payment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const result = await runPaymentReminderSweep({ dryRun });
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
        `INSERT INTO bna_payment_log (signup_id, payment_type, amount, method, green_invoice_id, status, received_at)
         VALUES ($1, 'registration', $2, 'green_invoice', $3, 'completed', NOW())`,
        [signup.id, amount, payment_id]
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
        `INSERT INTO bna_payment_log (signup_id, payment_type, amount, method, green_invoice_id, status, received_at)
         VALUES ($1, 'registration', $2, 'green_invoice', $3, 'completed', NOW())`,
        [signup.id, amount, payment_id]
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
    role: identity?.role || 'admin',
    scope: identity?.scope || { type: 'all', projectKey: null },
    allowedViews: identity?.allowedViews || ['tasks', 'students', 'content', 'contacts', 'accounting'],
  });
});

app.get('/api/bna/projects', requireAdmin, async (req, res) => {
  try {
    await ensureDefaultProjects();
    const scopedProjectKey = opsScopeProjectKey(req);
    const params = [];
    let query = 'SELECT * FROM bna_projects WHERE status <> \'archived\'';
    if (scopedProjectKey) {
      query += ' AND project_key = $1';
      params.push(scopedProjectKey);
    }
    query += ' ORDER BY CASE project_key WHEN \'bna\' THEN 1 WHEN \'one_time_mishnah_class\' THEN 2 ELSE 3 END, name ASC';
    const result = await pool.query(query, params);
    res.json({ projects: result.rows });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
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
    params.push(stage);
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
          ai_parsed: {
            parser: 'heuristic-v3',
            kind: 'task_or_decision',
            display_title: candidate.title,
            original_text: candidate.original_text,
            project: candidate.project_key || inferProjectKeyFromText(candidate.original_text),
          },
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
      `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
       VALUES ($1, $2, $3, $4, $5, $6)
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
  ]);
  try {
    await assertTaskAccess(req, id);
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'project' || key === 'project_key' || key === 'project_id') {
        const project = await resolveProjectFromInput({ [key]: value }, pool);
        assertProjectAccess(req, project);
        fields.push(`project_id = $${idx++}`);
        values.push(project.id);
        continue;
      }
      if (!allowedFields.has(key)) continue;
      const nextValue = key === 'assigned_to'
        ? normalizeTaskAssignee(value)
        : key === 'category'
          ? safeTaskCategory(value)
          : value;
      fields.push(`${key} = $${idx++}`);
      values.push(nextValue);
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
    
    CREATE TABLE signups (
      id SERIAL PRIMARY KEY,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
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
    
    CREATE TABLE bna_tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      stage TEXT DEFAULT 'raw_input' CHECK (stage IN ('raw_input', 'needs_decision', 'assigned', 'in_progress', 'done', 'archive')),
      category TEXT DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
      urgency TEXT DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
      energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
      estimated_minutes INTEGER,
      due_date DATE,
      planned_at TIMESTAMP,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      archived_at TIMESTAMP,
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
    VALUES ('Welcome to BNA Operations. Telegram rambles land here as raw input.', 'raw_input', 'operations', 'this_week', 'manual');
  `;
  
  try {
    await pool.query(MIGRATION_SQL);
    await pool.query(createProjectsSQL);
    await pool.query(createProjectMembersSQL);
    await pool.query(createTaskCommentsSQL);
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
        ai_parsed: {
          parser: 'telegram-webhook-heuristic-v3',
          display_title: candidate.title,
          original_text: candidate.original_text,
          project: candidate.project_key || inferProjectKeyFromText(candidate.original_text),
        },
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

// Start server
app.listen(PORT, () => {
  console.log(`BNA Server running on port ${PORT}`);
  startPaymentReminderScheduler();
});
// Deploy timestamp: 2026-05-26T17:02:05Z
