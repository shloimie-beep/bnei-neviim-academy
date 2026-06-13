#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretsDir = path.join(repoRoot, '.secrets');

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    contacts: true,
    chats: true,
    messages: true,
    dryRun: false,
    count: 500,
    maxPages: 1000,
    maxMessages: 0,
    sort: 'desc',
    requestedBy: 'codex',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--contacts-only') {
      args.contacts = true; args.chats = false; args.messages = false;
    } else if (arg === '--chats-only' || arg === '--groups-only') {
      args.contacts = false; args.chats = true; args.messages = false;
    } else if (arg === '--messages-only' || arg === '--history-only') {
      args.contacts = false; args.chats = false; args.messages = true;
    } else if (arg === '--no-contacts') args.contacts = false;
    else if (arg === '--no-chats' || arg === '--no-groups') args.chats = false;
    else if (arg === '--no-messages' || arg === '--no-history') args.messages = false;
    else if (arg === '--count') args.count = boundedCount(next());
    else if (arg === '--max-pages') args.maxPages = Math.max(Number(next()) || args.maxPages, 1);
    else if (arg === '--max-messages') args.maxMessages = Math.max(Number(next()) || 0, 0);
    else if (arg === '--requested-by') args.requestedBy = String(next() || args.requestedBy);
    else if (arg === '--sort') args.sort = String(next() || args.sort).toLowerCase() === 'asc' ? 'asc' : 'desc';
  }
  return args;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function config() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.example')),
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(secretsDir, 'whapi-env.txt')),
    ...process.env,
  };
  const token =
    env.WAPI_API_TOKEN ||
    env.WHAPI_API_TOKEN ||
    readSecret('wapi-api-token.txt') ||
    readSecret('whapi-api-token.txt') ||
    readSecret('whapi-token.txt');
  const databaseUrl = process.env.DATABASE_URL || readSecret('railway-database-url.txt') || env.DATABASE_URL;
  if (!token) throw new Error('WAPI_API_TOKEN or WHAPI_API_TOKEN is required');
  if (!databaseUrl) throw new Error('DATABASE_URL or .secrets/railway-database-url.txt is required');
  return {
    token,
    databaseUrl,
    baseUrl: (env.WAPI_API_BASE_URL || env.WHAPI_API_BASE_URL || 'https://gate.whapi.cloud').replace(/\/+$/, ''),
  };
}

function boundedCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(Math.max(Math.floor(numeric), 1), 500) : 500;
}

function listFromResponse(json, kind) {
  if (Array.isArray(json)) return json.filter(Boolean);
  const candidates = [
    json?.[kind],
    json?.items,
    json?.messages,
    json?.data?.[kind],
    json?.data?.items,
    json?.data?.messages,
    json?.result?.[kind],
    json?.result?.items,
    json?.data,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.filter(Boolean);
  }
  return [];
}

async function fetchPagedList({ baseUrl, token, endpoint, kind, count, sort, maxPages }) {
  const all = [];
  const seen = new Set();
  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * count;
    const params = new URLSearchParams({ count: String(count), offset: String(offset), sort });
    const response = await fetch(`${baseUrl}${endpoint}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (!response.ok) {
      throw new Error(`${endpoint} failed ${response.status}: ${text.slice(0, 500)}`);
    }
    const rows = listFromResponse(json || {}, kind);
    let newInPage = 0;
    for (const row of rows) {
      const id = providerId(row, kind);
      const fingerprint = id || JSON.stringify(row).slice(0, 240);
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      all.push(row);
      newInPage += 1;
    }
    if (rows.length < count || newInPage === 0) break;
  }
  return all;
}

function providerId(row = {}, kind = '') {
  if (kind === 'messages') return firstText(row.id, row.message_id, row.messageId);
  if (kind === 'chats') return firstText(row.id, row.chat_id, row.chatId);
  return firstText(row.id, row.contact_id, row.contactId, row.phone, row.number);
}

function firstText(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object') continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function booleanValue(...values) {
  for (const value of values) {
    if (value === true || value === false) return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string' && value.trim()) {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes'].includes(normalized)) return true;
      if (['false', '0', 'no'].includes(normalized)) return false;
    }
  }
  return false;
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function phoneFromId(value) {
  const raw = String(value || '').replace(/@.*/, '');
  const phone = digits(raw);
  return phone.length >= 7 ? `+${phone}` : '';
}

function timestampToIso(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const ms = numeric > 10_000_000_000 ? numeric : numeric * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function messageText(message = {}) {
  return firstText(
    typeof message.text === 'object' ? message.text.body : message.text,
    message.body,
    message.caption,
    message.conversation,
    message.message?.conversation,
    message.extendedTextMessage?.text,
    message.imageMessage?.caption,
    message.videoMessage?.caption
  );
}

function messageChatId(message = {}) {
  return firstText(message.chat_id, message.chatId, message.to, message.from, message.recipient_id, message.sender);
}

function messageFromNumber(message = {}) {
  return firstText(message.from, message.sender, message.author, message.participant, message.chat_id, message.chatId);
}

function messageType(message = {}) {
  return firstText(message.type, message.message_type, message.messageType, message.mediaType, message.mimetype, message.status ? 'status' : '');
}

function mediaUrl(message = {}) {
  return firstText(message.mediaUrl, message.media_url, message.downloadUrl, message.download_url, message.media?.url);
}

function mediaType(message = {}) {
  return firstText(message.mediaType, message.mimeType, message.mimetype, message.media?.mimeType, message.media?.mimetype);
}

function displayName(row = {}) {
  return firstText(row.name, row.pushname, row.pushName, row.push_name, row.display_name, row.title);
}

function chatType(row = {}) {
  const id = providerId(row, 'chats');
  const type = firstText(row.type, row.kind);
  if (id.endsWith('@g.us') || /group/i.test(type)) return 'group';
  if (id === 'status@broadcast' || /broadcast/i.test(type)) return 'broadcast';
  if (/contact/i.test(type)) return 'contact';
  return type || 'chat';
}

function lastMessageTimestamp(chat = {}) {
  return timestampToIso(
    chat.last_message?.timestamp ||
    chat.last_message?.time ||
    chat.last_message_at ||
    chat.timestamp ||
    chat.time
  );
}

function lastMessagePreview(chat = {}) {
  return messageText(chat.last_message || {}).replace(/\s+/g, ' ').slice(0, 240);
}

async function ensureSchema(pool) {
  await pool.query(`
CREATE TABLE IF NOT EXISTS bna_wapi_directory_sync_runs (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  requested_by TEXT DEFAULT 'codex',
  dry_run BOOLEAN DEFAULT FALSE,
  contacts_fetched INTEGER NOT NULL DEFAULT 0,
  contacts_upserted INTEGER NOT NULL DEFAULT 0,
  chats_fetched INTEGER NOT NULL DEFAULT 0,
  chats_upserted INTEGER NOT NULL DEFAULT 0,
  groups_upserted INTEGER NOT NULL DEFAULT 0,
  messages_fetched INTEGER NOT NULL DEFAULT 0,
  messages_imported INTEGER NOT NULL DEFAULT 0,
  messages_duplicate INTEGER NOT NULL DEFAULT 0,
  messages_failed INTEGER NOT NULL DEFAULT 0,
  provider_response_summary JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_wapi_contacts (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'whapi',
  provider_contact_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  push_name TEXT,
  phone TEXT,
  saved BOOLEAN DEFAULT FALSE,
  raw JSONB NOT NULL DEFAULT '{}',
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_wapi_chats (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'whapi',
  provider_chat_id TEXT NOT NULL UNIQUE,
  chat_type TEXT,
  display_name TEXT,
  phone TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  not_spam BOOLEAN DEFAULT NULL,
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  raw JSONB NOT NULL DEFAULT '{}',
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_wapi_contacts_phone ON bna_wapi_contacts (phone);
CREATE INDEX IF NOT EXISTS idx_bna_wapi_chats_type ON bna_wapi_chats (chat_type);
CREATE INDEX IF NOT EXISTS idx_bna_wapi_chats_group ON bna_wapi_chats (is_group);
CREATE INDEX IF NOT EXISTS idx_bna_wapi_chats_last_message ON bna_wapi_chats (last_message_at DESC);
`);
}

async function startRuns(pool, args) {
  const directoryRun = (await pool.query(
    `INSERT INTO bna_wapi_directory_sync_runs (requested_by, dry_run)
     VALUES ($1, $2)
     RETURNING *`,
    [args.requestedBy, args.dryRun]
  )).rows[0];
  const messageRun = args.messages
    ? (await pool.query(
      `INSERT INTO bna_wapi_sync_runs (
         requested_by, count_requested, offset_requested, sort_order, dry_run,
         provider_endpoint, provider_params
       ) VALUES ($1, $2, 0, $3, $4, '/messages/list', $5)
       RETURNING *`,
      [
        args.requestedBy,
        args.count,
        args.sort,
        args.dryRun,
        JSON.stringify({ count: args.count, offset: 0, sort: args.sort, max_pages: args.maxPages, max_messages: args.maxMessages || null }),
      ]
    )).rows[0]
    : null;
  return { directoryRun, messageRun };
}

async function upsertContacts(pool, contacts = [], dryRun = false) {
  let upserted = 0;
  for (const contact of contacts) {
    const id = providerId(contact, 'contacts');
    if (!id) continue;
    if (dryRun) {
      upserted += 1;
      continue;
    }
    await pool.query(
      `INSERT INTO bna_wapi_contacts (
         provider_contact_id, display_name, push_name, phone, saved, raw, last_synced_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (provider_contact_id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           push_name = EXCLUDED.push_name,
           phone = EXCLUDED.phone,
           saved = EXCLUDED.saved,
           raw = EXCLUDED.raw,
           last_synced_at = NOW(),
           updated_at = NOW()`,
      [
        id,
        displayName(contact) || null,
        firstText(contact.pushname, contact.pushName, contact.push_name) || null,
        phoneFromId(id) || null,
        booleanValue(contact.saved),
        JSON.stringify(contact),
      ]
    );
    upserted += 1;
  }
  return upserted;
}

async function upsertChats(pool, chats = [], dryRun = false) {
  let upserted = 0;
  let groups = 0;
  for (const chat of chats) {
    const id = providerId(chat, 'chats');
    if (!id) continue;
    const type = chatType(chat);
    const isGroup = type === 'group';
    if (isGroup) groups += 1;
    if (dryRun) {
      upserted += 1;
      continue;
    }
    await pool.query(
      `INSERT INTO bna_wapi_chats (
         provider_chat_id, chat_type, display_name, phone, is_group,
         not_spam, last_message_at, last_message_preview, raw, last_synced_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::timestamp, $8, $9, NOW(), NOW())
       ON CONFLICT (provider_chat_id) DO UPDATE
       SET chat_type = EXCLUDED.chat_type,
           display_name = EXCLUDED.display_name,
           phone = EXCLUDED.phone,
           is_group = EXCLUDED.is_group,
           not_spam = EXCLUDED.not_spam,
           last_message_at = EXCLUDED.last_message_at,
           last_message_preview = EXCLUDED.last_message_preview,
           raw = EXCLUDED.raw,
           last_synced_at = NOW(),
           updated_at = NOW()`,
      [
        id,
        type,
        displayName(chat) || null,
        phoneFromId(id) || null,
        isGroup,
        chat.not_spam === undefined ? null : booleanValue(chat.not_spam),
        lastMessageTimestamp(chat),
        lastMessagePreview(chat) || null,
        JSON.stringify(chat),
      ]
    );
    upserted += 1;
  }
  return { upserted, groups };
}

async function contactMatch(pool, message) {
  const chatId = messageChatId(message);
  const isGroup = chatId.endsWith('@g.us');
  if (isGroup) return { contact_type: 'general' };
  const phone = phoneFromId(chatId || messageFromNumber(message));
  const clean = digits(phone);
  const suffix = clean.length >= 7 ? clean.slice(-9) : '';
  if (!clean && !suffix) return { contact_type: 'general' };
  const params = [clean, suffix];
  const phoneCondition = `
    ($1 <> '' AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $1)
    OR ($2 <> '' AND right(regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g'), 9) = $2)
  `;
  const lead = (await pool.query(
    `SELECT id, project_id, parent_name FROM bna_parent_leads
     WHERE (${phoneCondition}
       OR EXISTS (
         SELECT 1 FROM unnest(COALESCE(other_phones, '{}'::text[])) AS phone_values(value)
         WHERE ($1 <> '' AND regexp_replace(COALESCE(phone_values.value, ''), '\\D', '', 'g') = $1)
            OR ($2 <> '' AND right(regexp_replace(COALESCE(phone_values.value, ''), '\\D', '', 'g'), 9) = $2)
       ))
       AND COALESCE(status, 'interested') <> 'archived'
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    params
  )).rows[0];
  if (lead) return { contact_type: 'lead', lead_id: lead.id, project_id: lead.project_id || null, matched_name: lead.parent_name || null };
  const signup = (await pool.query(
    `SELECT id, project_id, parent_name, student_name FROM signups
     WHERE (${phoneCondition}) AND COALESCE(status, 'new') <> 'archived'
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    params
  )).rows[0];
  if (signup) return { contact_type: 'signup', signup_id: signup.id, project_id: signup.project_id || null, matched_name: signup.parent_name || signup.student_name || null };
  const student = (await pool.query(
    `SELECT id, project_id, name, parent_name FROM bna_students
     WHERE (${phoneCondition}) AND COALESCE(status, 'active') <> 'inactive'
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    params
  )).rows[0];
  if (student) return { contact_type: 'student', student_id: student.id, project_id: student.project_id || null, matched_name: student.parent_name || student.name || null };
  return { contact_type: 'general' };
}

async function chatLookup(pool, chatId) {
  if (!chatId) return null;
  const row = (await pool.query(
    `SELECT provider_chat_id, chat_type, display_name, is_group
     FROM bna_wapi_chats
     WHERE provider_chat_id = $1
     LIMIT 1`,
    [chatId]
  )).rows[0];
  return row || null;
}

async function importMessages(pool, messages = [], messageRunId, dryRun = false) {
  let imported = 0;
  let duplicates = 0;
  let failed = 0;
  const failures = [];
  for (const message of messages) {
    const messageId = providerId(message, 'messages');
    if (!messageId) {
      failed += 1;
      failures.push({ reason: 'missing_message_id', keys: Object.keys(message).slice(0, 15) });
      continue;
    }
    try {
      const existing = (await pool.query(
        `SELECT id FROM bna_contact_communications
         WHERE source = 'wapi'
           AND source_context->>'message_id' = $1
         LIMIT 1`,
        [messageId]
      )).rows[0];
      if (existing) {
        duplicates += 1;
        continue;
      }
      if (dryRun) {
        imported += 1;
        continue;
      }
      const chatId = messageChatId(message);
      const chat = await chatLookup(pool, chatId);
      const match = await contactMatch(pool, message);
      const fromMe = booleanValue(message.from_me, message.fromMe);
      const text = messageText(message);
      const type = messageType(message) || 'message';
      const isGroup = Boolean(chat?.is_group || chatId.endsWith('@g.us'));
      const name = displayName(message) || chat?.display_name || firstText(message.pushName, message.push_name, message.sender_name) || match.matched_name || phoneFromId(chatId) || chatId || 'unknown';
      const direction = fromMe ? 'outbound' : 'inbound';
      const summary = [
        'WhatsApp',
        isGroup ? `group ${chat?.display_name || name}` : fromMe ? `to ${name}` : `from ${name}`,
        text ? `: ${text}` : ` ${type}`,
      ].join('').replace(/\s+/g, ' ').slice(0, 240);
      const sourceContext = {
        message_id: messageId,
        chat_id: chatId || null,
        from_number: messageFromNumber(message) || null,
        from_me: fromMe,
        wapi_sync_run_id: messageRunId,
        imported_at: new Date().toISOString(),
        timestamp: firstText(message.timestamp, message.time, message.t) || null,
      };
      const metadata = {
        source: 'wapi',
        import_source: 'whapi_full_sync',
        chat_type: chat?.chat_type || (isGroup ? 'group' : 'contact'),
        chat_name: chat?.display_name || null,
        is_group: isGroup,
        from_me: fromMe,
        message_type: type,
        delivery_status: firstText(message.status) || undefined,
        has_media: Boolean(mediaUrl(message) || mediaType(message)),
        media_type: mediaType(message) || null,
        media_url: mediaUrl(message) || null,
        matched_name: match.matched_name || null,
      };
      const bodyLines = [];
      if (text) bodyLines.push(text);
      if (mediaUrl(message)) bodyLines.push(`Media: ${mediaUrl(message)}`);
      if (mediaType(message)) bodyLines.push(`Media type: ${mediaType(message)}`);
      await pool.query(
        `INSERT INTO bna_contact_communications (
          project_id, contact_type, lead_id, signup_id, student_id,
          channel, direction, summary, body, follow_up_required,
          occurred_at, created_by, source, source_context, metadata
        ) VALUES (
          $1, $2, $3, $4, $5,
          'whatsapp', $6, $7, $8, $9,
          COALESCE($10::timestamp, NOW()), 'Whapi sync', 'wapi', $11, $12
        )`,
        [
          match.project_id || null,
          match.contact_type || 'general',
          match.lead_id || null,
          match.signup_id || null,
          match.student_id || null,
          direction,
          summary,
          bodyLines.join('\n') || null,
          direction === 'inbound',
          timestampToIso(firstText(message.timestamp, message.time, message.t)),
          JSON.stringify(sourceContext),
          JSON.stringify(metadata),
        ]
      );
      imported += 1;
    } catch (error) {
      failed += 1;
      failures.push({ message_id: messageId, error: error.message });
    }
  }
  return { imported, duplicates, failed, failures };
}

async function updateRuns(pool, directoryRunId, messageRunId, summary, status = 'completed', errorMessage = '') {
  await pool.query(
    `UPDATE bna_wapi_directory_sync_runs
     SET status = $2,
         contacts_fetched = $3,
         contacts_upserted = $4,
         chats_fetched = $5,
         chats_upserted = $6,
         groups_upserted = $7,
         messages_fetched = $8,
         messages_imported = $9,
         messages_duplicate = $10,
         messages_failed = $11,
         provider_response_summary = $12,
         error_message = NULLIF($13, ''),
         finished_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      directoryRunId,
      status,
      summary.contactsFetched,
      summary.contactsUpserted,
      summary.chatsFetched,
      summary.chatsUpserted,
      summary.groupsUpserted,
      summary.messagesFetched,
      summary.messagesImported,
      summary.messagesDuplicate,
      summary.messagesFailed,
      JSON.stringify(summary),
      errorMessage,
    ]
  );
  if (messageRunId) {
    await pool.query(
      `UPDATE bna_wapi_sync_runs
       SET status = $2,
           fetched_count = $3,
           imported_count = $4,
           duplicate_count = $5,
           failed_count = $6,
           provider_response_summary = $7,
           error_message = NULLIF($8, ''),
           finished_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [
        messageRunId,
        status,
        summary.messagesFetched,
        summary.messagesImported,
        summary.messagesDuplicate,
        summary.messagesFailed,
        JSON.stringify(summary),
        errorMessage,
      ]
    );
  }
}

async function main() {
  const args = parseArgs();
  const cfg = config();
  const pool = new Pool({ connectionString: cfg.databaseUrl, ssl: { rejectUnauthorized: false } });
  let directoryRun = null;
  let messageRun = null;
  const summary = {
    contactsFetched: 0,
    contactsUpserted: 0,
    chatsFetched: 0,
    chatsUpserted: 0,
    groupsUpserted: 0,
    messagesFetched: 0,
    messagesImported: 0,
    messagesDuplicate: 0,
    messagesFailed: 0,
    failures: [],
    dryRun: args.dryRun,
  };
  try {
    await ensureSchema(pool);
    ({ directoryRun, messageRun } = await startRuns(pool, args));
    if (args.contacts) {
      const contacts = await fetchPagedList({ ...cfg, endpoint: '/contacts', kind: 'contacts', count: args.count, sort: args.sort, maxPages: args.maxPages });
      summary.contactsFetched = contacts.length;
      summary.contactsUpserted = await upsertContacts(pool, contacts, args.dryRun);
    }
    if (args.chats) {
      const chats = await fetchPagedList({ ...cfg, endpoint: '/chats', kind: 'chats', count: args.count, sort: args.sort, maxPages: args.maxPages });
      summary.chatsFetched = chats.length;
      const chatResult = await upsertChats(pool, chats, args.dryRun);
      summary.chatsUpserted = chatResult.upserted;
      summary.groupsUpserted = chatResult.groups;
    }
    if (args.messages) {
      let messages = await fetchPagedList({ ...cfg, endpoint: '/messages/list', kind: 'messages', count: args.count, sort: args.sort, maxPages: args.maxPages });
      if (args.maxMessages > 0) messages = messages.slice(0, args.maxMessages);
      summary.messagesFetched = messages.length;
      const messageResult = await importMessages(pool, messages, messageRun?.id || null, args.dryRun);
      summary.messagesImported = messageResult.imported;
      summary.messagesDuplicate = messageResult.duplicates;
      summary.messagesFailed = messageResult.failed;
      summary.failures = messageResult.failures.slice(0, 25);
    }
    await updateRuns(pool, directoryRun.id, messageRun?.id || null, summary);
    console.log(JSON.stringify({ success: true, directory_sync_run_id: directoryRun.id, message_sync_run_id: messageRun?.id || null, ...summary }, null, 2));
  } catch (error) {
    if (directoryRun?.id) {
      await updateRuns(pool, directoryRun.id, messageRun?.id || null, summary, 'failed', error.message).catch(() => {});
    }
    console.error(JSON.stringify({ success: false, error: error.message, ...summary }, null, 2));
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
