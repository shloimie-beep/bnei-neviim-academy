const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 8080;

// Environment variables - NO FALLBACKS for production
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPS_USERNAME = process.env.OPS_USERNAME;
const OPS_PASSWORD = process.env.OPS_PASSWORD;
const TELEGRAM_CHAT_ID_BNA =
  process.env.TELEGRAM_CHAT_ID_BNA ||
  process.env.TELEGRAM_CHAT_ID_SHLOIMIE ||
  '';
const DATABASE_URL = process.env.DATABASE_URL;
const PAYMENT_LINK = process.env.PAYMENT_LINK || 'https://mrng.to/r9DSZhhWE9';
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
const SESSION_COOKIE_NAME = 'bna_ops_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const sessions = new Map();

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
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not configured');
  }
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return oauth2Client;
}

function encodeGmailMessage({ to, from, subject, text, html }) {
  const boundary = `bna_${Date.now()}`;
  const headers = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    text || '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    html || text || '',
    `--${boundary}--`,
  ];
  return Buffer.from(`${headers.join('\r\n')}\r\n\r\n${body.join('\r\n')}`)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
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
  const folderNames = [
    '01 Raw Intake',
    '02 Ingesting',
    '03 Transcribed',
    '04 Parsed',
    '05 WhatsApp Ready',
    '06 Newsletter Candidates',
    '07 Social Candidates',
    '08 Blog Candidates',
    '09 Brand Kit Suggestions',
    '10 Approved',
    '11 Published',
    '99 Failed',
  ];
  const folders = {};
  for (const folderName of folderNames) {
    folders[folderName] = await ensureDriveFolder(drive, folderName, root.id);
  }

  const brandKit = await ensureDriveFolder(drive, 'BNA Brand Kit', root.id);
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

  return {
    root,
    folders,
    brandKit,
    brandDocs,
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

function issueSession(username) {
  const sessionId = Buffer.from(`${username}:${Date.now()}:${Math.random().toString(36).slice(2)}`).toString('base64url');
  sessions.set(sessionId, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

function getValidSession(sessionId) {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

function clearSession(sessionId) {
  if (sessionId) sessions.delete(sessionId);
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
function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  const session = getValidSession(cookies[SESSION_COOKIE_NAME]);
  if (session) {
    req.opsUser = session.username;
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
  
  // Case insensitive comparison
  if (user.toLowerCase() !== OPS_USERNAME.toLowerCase() || 
      pass.toLowerCase() !== OPS_PASSWORD.toLowerCase()) {
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      return res.redirect('/operations-login.html');
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.opsUser = user;
  next();
}

// Middleware
app.use(express.json());
app.use(express.static('public', {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
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
`;

const createTasksTableSQL = `
CREATE TABLE IF NOT EXISTS bna_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  stage TEXT NOT NULL DEFAULT 'inbox' CHECK (stage IN ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive')),
  category TEXT NOT NULL DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
  urgency TEXT NOT NULL DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
  energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
  estimated_minutes INTEGER,
  due_date DATE,
  planned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  archived_at TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ramble', 'telegram', 'ghl_webhook', 'green_invoice')),
  source_context TEXT,
  ai_parsed JSONB,
  parent_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL,
  related_contact_email TEXT,
  related_signup_id INTEGER,
  created_by TEXT NOT NULL DEFAULT 'system',
  assigned_to TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'paused', 'graduated', 'inactive')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
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
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'telegram', 'recording', 'ramble', 'import')),
  source_message_id TEXT,
  source_media_url TEXT,
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

const createContentOutputsSQL = `
CREATE TABLE IF NOT EXISTS bna_content_outputs (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES bna_content_jobs(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('whatsapp_update', 'facebook_post', 'youtube_description', 'google_business_post', 'blog_draft', 'weekly_newsletter', 'daily_report', 'parent_email', 'teaching_philosophy_note', 'short_clip')),
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

const createBnaIndexesSQL = `
CREATE INDEX IF NOT EXISTS idx_bna_students_name ON bna_students (name);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_student_id ON bna_accountability_events (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_event_type ON bna_accountability_events (event_type);
CREATE INDEX IF NOT EXISTS idx_bna_accountability_occurred_at ON bna_accountability_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_payment_intake_status ON bna_payment_intake (status);
CREATE INDEX IF NOT EXISTS idx_bna_payment_intake_received_at ON bna_payment_intake (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_status ON bna_content_jobs (status);
CREATE INDEX IF NOT EXISTS idx_bna_content_jobs_created_at ON bna_content_jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_job_id ON bna_content_outputs (job_id);
CREATE INDEX IF NOT EXISTS idx_bna_content_outputs_status ON bna_content_outputs (status);

ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_stage TEXT;
ALTER TABLE bna_content_jobs DROP CONSTRAINT IF EXISTS bna_content_jobs_source_type_check;
ALTER TABLE bna_content_jobs ADD CONSTRAINT bna_content_jobs_source_type_check
  CHECK (source_type IN ('telegram_media', 'telegram_text', 'manual', 'import', 'local_drop', 'google_drive'));
`;

const normalizeTasksCategoryCheckSQL = `
ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_category_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_category_check
  CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations', 'accountability'));
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
  const result = await pool.query('SELECT * FROM signups ORDER BY created_at ASC');
  for (const signup of result.rows) {
    await upsertStudentFromSignup(signup);
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
         updated_at = NOW()
     WHERE id = $4`,
    [
      intake.amount || null,
      loggedMethod,
      intake.green_invoice_id || null,
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

// Initialize database
async function initDb() {
  try {
    await pool.query(createSignupsTableSQL);
    await pool.query(createTasksTableSQL);
    await pool.query(normalizeTasksCategoryCheckSQL);
    await pool.query(createPaymentLogSQL);
    await pool.query(createPaymentIntakeSQL);
    await pool.query(createStudentsSQL);
    await pool.query(createAccountabilityEventsSQL);
    await pool.query(createContentJobsSQL);
    await pool.query(createContentOutputsSQL);
    await pool.query(createBnaIndexesSQL);
    await pool.query(createCliBridgeSQL);
    await ensureStudentsFromSignups();
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

async function createPaymentIntakeRecord(input = {}) {
  const result = await pool.query(
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

app.get('/api/google/oauth/start', requireAdmin, (req, res) => {
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
      stages: Object.fromEntries(Object.entries(pipeline.folders).map(([name, folder]) => [name, folder.id])),
      brandKit: pipeline.brandKit.id,
      brandDocs: Object.fromEntries(Object.entries(pipeline.brandDocs).map(([name, file]) => [name, file.id])),
    };
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
    const oauth2Client = createGoogleOAuthClient(GOOGLE_REDIRECT_URI);
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      return res.status(400).json({ error: 'GOOGLE_REFRESH_TOKEN is not configured' });
    }
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const pipeline = await ensureBnaDrivePipeline(oauth2Client);
    res.json({
      success: true,
      root: pipeline.root,
      folders: pipeline.folders,
      brandKit: pipeline.brandKit,
      brandDocs: pipeline.brandDocs,
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
    form_language
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
  const normalizedPaymentMethod = String(payment_method || '').trim().toLowerCase() === 'cash'
    ? 'cash'
    : 'green_invoice';
  const paymentDisplayLabel = normalizedPaymentMethod === 'cash' ? 'Cash' : 'Credit';
  const notes = [
    form_language ? `Form Language: ${form_language}` : null,
    address ? `Address: ${address}` : null,
    parent2_name ? `Parent 2 Name: ${parent2_name}` : null,
    parent2_email ? `Parent 2 Email: ${parent2_email}` : null,
    parent2_phone ? `Parent 2 Phone: ${parent2_phone}` : null
  ].filter(Boolean).join('\n');

  if (!normalizedParentName || !normalizedParentEmail || !normalizedStudentName) {
    return res.status(400).json({ error: 'Missing required signup details' });
  }

  try {
    // Insert signup
    const result = await pool.query(
      `INSERT INTO signups (
        parent_name, parent_email, parent_phone,
        student_name, student_age, student_grade,
        previous_school, reason_applying, special_needs,
        payment_method, tags, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        normalizedParentName, normalizedParentEmail, normalizedParentPhone,
        normalizedStudentName, normalizedStudentAge, normalizedStudentGrade,
        normalizedPreviousSchool, normalizedReasonApplying, normalizedSpecialNeeds,
        normalizedPaymentMethod,
        ['parent', 'bna', form_language === 'he' ? 'hebrew_form' : 'english_form'],
        notes || null
      ]
    );
    
    const signup = result.rows[0];
    await upsertStudentFromSignup(signup);
    const matchedPaymentIntake = await reconcilePaymentIntakeForSignup(signup);
    
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
    
    // Return payment link for credit payments unless we matched a prior payment intake record.
    if (matchedPaymentIntake) {
      res.json({ success: true, signupId: signup.id, paymentMethod: 'cash', matchedPaymentIntakeId: matchedPaymentIntake.id });
    } else if (normalizedPaymentMethod === 'green_invoice') {
      res.json({ 
        success: true, 
        signupId: signup.id,
        paymentMethod: 'credit',
        paymentLink: PAYMENT_LINK 
      });
    } else {
      res.json({ success: true, signupId: signup.id, paymentMethod: 'cash' });
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
      "UPDATE signups SET payment_status = 'paid', payment_amount = $1, updated_at = NOW() WHERE id = $2",
      [amount, signup_id]
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
        COALESCE(question_counts.questions, 0) AS questions
       FROM bna_students s
       LEFT JOIN (
         SELECT student_id, COUNT(*) AS open_goals
         FROM bna_accountability_events
         WHERE event_type = 'student_goal'
         GROUP BY student_id
       ) goal_counts ON goal_counts.student_id = s.id
       LEFT JOIN (
         SELECT student_id, COUNT(*) AS questions
         FROM bna_accountability_events
         WHERE event_type = 'question'
         GROUP BY student_id
       ) question_counts ON question_counts.student_id = s.id
       ORDER BY s.name ASC`
    );
    res.json({ students: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.post('/api/bna/accountability', requireAdmin, async (req, res) => {
  const {
    event_type,
    student_id,
    student_name,
    title,
    notes,
    topic,
    question_text,
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
        source, source_message_id, source_media_url, occurred_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamp, NOW()))
      RETURNING *`,
      [
        event_type,
        student_id || null,
        student_name || null,
        title,
        notes || null,
        topic || null,
        question_text || null,
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

app.delete('/api/bna/accountability/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM bna_accountability_events WHERE id = $1', [id]);
    res.json({ success: true });
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
    res.json({ success: true, job: result.rows[0] });
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
  const allowedFields = ['title', 'body', 'platform', 'status', 'metadata'];
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
    res.json({ success: true, output: result.rows[0] });
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
             updated_at = NOW()
         WHERE id = $3`,
        [amount, method, signup_id]
      );
    }

    res.json({ success: true, payment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Green Invoice webhook
app.post('/api/webhooks/green-invoice', async (req, res) => {
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
          `Action: Match this to a signup in Billing.`
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
        "UPDATE signups SET payment_status = 'paid', green_invoice_id = $1, updated_at = NOW() WHERE id = $2",
        [payment_id, signup.id]
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
app.get('/api/bna/tasks', requireAdmin, async (req, res) => {
  const { stage, category, urgency } = req.query;
  
  let query = 'SELECT * FROM bna_tasks WHERE 1=1';
  const params = [];
  let paramIdx = 1;
  
  if (stage) {
    query += ` AND stage = $${paramIdx++}`;
    params.push(stage);
  }
  if (category) {
    query += ` AND category = $${paramIdx++}`;
    params.push(category);
  }
  if (urgency) {
    query += ` AND urgency = $${paramIdx++}`;
    params.push(urgency);
  }
  
  query += ' ORDER BY created_at DESC';
  
  try {
    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bna/tasks', requireAdmin, async (req, res) => {
  const { title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date, ramble, source, created_by } = req.body;

  if (ramble && !title) {
    const lines = String(ramble)
      .split(/\r?\n|[.;]/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10);
    const candidates = lines.length ? lines : [String(ramble).trim()];

    try {
      const createdTasks = [];
      for (const candidate of candidates) {
        const isUrgent = /urgent|asap|right away|immediately/i.test(candidate);
        const result = await pool.query(
          `INSERT INTO bna_tasks (title, notes, stage, category, urgency, source, created_by)
           VALUES ($1, $2, 'inbox', 'operations', $3, $4, $5) RETURNING *`,
          [
            candidate.slice(0, 220),
            String(ramble),
            isUrgent ? 'urgent' : 'this_week',
            source || 'ramble',
            created_by || 'operator',
          ]
        );
        createdTasks.push(result.rows[0]);
      }

      return res.json({ success: true, tasks_created: createdTasks.length, tasks: createdTasks });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO bna_tasks (title, notes, stage, category, urgency, energy_required, estimated_minutes, due_date, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual') RETURNING *`,
      [
        title,
        notes || null,
        stage || 'inbox',
        category || 'operations',
        urgency || 'this_week',
        energy_required || null,
        estimated_minutes || null,
        due_date || null,
      ]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bna/tasks/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = [];
  const values = [];
  let idx = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  fields.push('updated_at = NOW()');
  values.push(id);
  
  try {
    const result = await pool.query(
      `UPDATE bna_tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      stage TEXT DEFAULT 'inbox' CHECK (stage IN ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive')),
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
    VALUES ('Welcome to BNA Operations! Drag me to different stages.', 'inbox', 'operations', 'this_week', 'manual');
  `;
  
  try {
    await pool.query(MIGRATION_SQL);
    res.json({ success: true, message: 'Database migrated to BNA schema!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint for operations
app.post('/api/operations/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username.toLowerCase() === OPS_USERNAME.toLowerCase() && 
      password.toLowerCase() === OPS_PASSWORD.toLowerCase()) {
    const sessionId = issueSession(username);
    setSessionCookie(res, sessionId);
    res.json({ success: true, sessionId });
  } else {
    clearSessionCookie(res);
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.delete('/api/bna/tasks/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM bna_tasks WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/operations/logout', (req, res) => {
  const cookies = parseCookies(req);
  clearSession(cookies[SESSION_COOKIE_NAME]);
  clearSessionCookie(res);
  res.json({ success: true });
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
    view_inbox: `Inbox tasks:\n${dashboardUrl}?view=pipeline`,
    view_urgent: `Urgent tasks:\n${dashboardUrl}?view=pipeline`,
    view_pipeline: `Pipeline: inbox, clarify, plan, execute, review, complete, archive.\n${dashboardUrl}?view=pipeline`,
    quick_add: 'Quick add: send a task or ramble in this chat. I will capture it into BNA Operations.',
    view_billing: `Billing dashboard:\n${dashboardUrl}?view=billing`,
    view_signups: `Signups:\n${dashboardUrl}?view=signups`,
    view_accountability: `Accountability tracker:\n${dashboardUrl}?view=accountability`,
  };

  if (replies[data]) {
    await sendTelegramMessage(chatId, replies[data]);
    return;
  }
  
  // Simple responses
  if (data === 'view_inbox') {
    await sendTelegramMessage(chatId, '📥 Inbox: Use the dashboard to view tasks\nhttps://bneineviimacademy.org/operations');
  } else if (data === 'view_urgent') {
    await sendTelegramMessage(chatId, '🔴 Urgent tasks: Check the dashboard\nhttps://bneineviimacademy.org/operations');
  } else if (data === 'view_pipeline') {
    await sendTelegramMessage(chatId, '📊 Pipeline stages:\n📥 Inbox → ❓ Clarify → 📋 Plan → ⚡ Execute → 👀 Review → ✅ Complete → 📦 Archive');
  } else if (data === 'quick_add') {
    await sendTelegramMessage(chatId, '➕ To add a task, just type it!\nExample: "Call Cohen about payment tomorrow"');
  } else if (data === 'view_billing') {
    await sendTelegramMessage(chatId, '💰 Billing dashboard:\nhttps://bneineviimacademy.org/operations');
  } else if (data === 'view_signups') {
    await sendTelegramMessage(chatId, '👨‍👩‍👧‍👦 Signups:\nhttps://bneineviimacademy.org/operations');
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

  try {
    await pool.query(
      `INSERT INTO bna_tasks (title, notes, stage, category, urgency, source, source_context, created_by)
       VALUES ($1, $2, 'inbox', 'operations', $3, 'telegram', $4, 'telegram')`,
      [
        text.slice(0, 220),
        text,
        /urgent|asap|right away|immediately/i.test(text) ? 'urgent' : 'this_week',
        JSON.stringify({ chat_id: chatId, message_id: msg.message_id }),
      ]
    );
  } catch (err) {
    console.error('Telegram task capture error:', err);
  }
  
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
      [{ text: '📥 Inbox', callback_data: 'view_inbox' }, { text: '🔴 Urgent', callback_data: 'view_urgent' }],
      [{ text: '📊 Pipeline', callback_data: 'view_pipeline' }, { text: '➕ Quick Add', callback_data: 'quick_add' }],
      [{ text: '💰 Billing', callback_data: 'view_billing' }, { text: '👨‍👩‍👧‍👦 Signups', callback_data: 'view_signups' }],
      [{ text: '🌐 Open Dashboard', url: 'https://bneineviimacademy.org/operations' }]
    ]
  };
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '⚡ BNA Operations Bot\n\nWhat would you like to do?',
      reply_markup: keyboard
    })
  });
}

async function sendTelegramMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Inbox', callback_data: 'view_inbox' }, { text: 'Urgent', callback_data: 'view_urgent' }],
      [{ text: 'Pipeline', callback_data: 'view_pipeline' }, { text: 'Quick Add', callback_data: 'quick_add' }],
      [{ text: 'Billing', callback_data: 'view_billing' }, { text: 'Signups', callback_data: 'view_signups' }],
      [{ text: 'Accountability', callback_data: 'view_accountability' }],
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
});
// Deploy timestamp: 2026-05-26T17:02:05Z
