#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const require = createRequire(import.meta.url);
const {
  DEFAULT_NOTIFY_STATE_PATH,
  buildDropoffEmail,
  buildDropoffNotifications,
  driveFileViewUrl,
  newEmptyDropoffState,
  watchedDropoffLanesFromMap,
} = require('../src/lib/bna/one-time-drive-dropoff-notifier');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSecretsDir = path.join(repoRoot, '.secrets');
const defaultMapPath = path.join(repoRoot, 'ops', 'one-time-mishnah-class', 'drive-social-ingestion-map.json');

function argsObject(argv) {
  const args = {
    send: false,
    markExisting: false,
    testEmail: false,
    statePath: path.join(repoRoot, DEFAULT_NOTIFY_STATE_PATH),
    mapPath: defaultMapPath,
    recipient: process.env.ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO || '',
    clientPath: process.env.GOOGLE_OAUTH_CLIENT_PATH || path.join(defaultSecretsDir, 'google-oauth-client.json'),
    tokenPath: process.env.GOOGLE_REFRESH_TOKEN_PATH || path.join(defaultSecretsDir, 'google-refresh-token.txt'),
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--send') args.send = true;
    else if (arg === '--mark-existing') args.markExisting = true;
    else if (arg === '--test-email') args.testEmail = true;
    else if (arg === '--recipient') args.recipient = argv[index += 1] || '';
    else if (arg.startsWith('--recipient=')) args.recipient = arg.slice('--recipient='.length);
    else if (arg === '--state') args.statePath = path.resolve(repoRoot, argv[index += 1] || '');
    else if (arg.startsWith('--state=')) args.statePath = path.resolve(repoRoot, arg.slice('--state='.length));
    else if (arg === '--map') args.mapPath = path.resolve(repoRoot, argv[index += 1] || '');
    else if (arg.startsWith('--map=')) args.mapPath = path.resolve(repoRoot, arg.slice('--map='.length));
    else if (arg === '--client') args.clientPath = argv[index += 1] || '';
    else if (arg.startsWith('--client=')) args.clientPath = arg.slice('--client='.length);
    else if (arg === '--token') args.tokenPath = argv[index += 1] || '';
    else if (arg.startsWith('--token=')) args.tokenPath = arg.slice('--token='.length);
  }
  return args;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function loadClient(clientPath) {
  const parsed = readJson(clientPath);
  const client = parsed?.web || parsed?.installed;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error(`Invalid Google OAuth client JSON at ${clientPath}`);
  }
  return {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || client.redirect_uris?.[0],
  };
}

function loadRefreshToken(tokenPath) {
  if (process.env.GOOGLE_REFRESH_TOKEN) return process.env.GOOGLE_REFRESH_TOKEN;
  if (fs.existsSync(tokenPath)) return fs.readFileSync(tokenPath, 'utf8').trim();
  throw new Error(`Missing Google refresh token at ${tokenPath}`);
}

function authWithRefreshToken(clientPath, tokenPath) {
  const client = loadClient(clientPath);
  const auth = new google.auth.OAuth2(client.clientId, client.clientSecret, client.redirectUri);
  auth.setCredentials({ refresh_token: loadRefreshToken(tokenPath) });
  return auth;
}

function driveLiteral(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function listFolderFiles(drive, folderId) {
  const files = [];
  let pageToken = '';
  do {
    const result = await drive.files.list({
      q: `'${driveLiteral(folderId)}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,webViewLink,parents,createdTime,modifiedTime,size)',
      pageSize: 100,
      pageToken: pageToken || undefined,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'createdTime desc,name',
    });
    files.push(...(result.data.files || []));
    pageToken = result.data.nextPageToken || '';
  } while (pageToken);
  return files;
}

function encodeGmailMessage({ to, from = 'me', subject, text }) {
  const headers = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ];
  const raw = `${headers.join('\r\n')}\r\n\r\n${text || ''}`;
  return Buffer.from(raw, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function sendGmailDigest(gmail, { to, subject, text }) {
  const raw = encodeGmailMessage({ to, subject, text });
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
  return result.data;
}

function loadState(statePath) {
  const state = readJson(statePath, newEmptyDropoffState());
  return {
    ...newEmptyDropoffState(),
    ...state,
    seen_file_ids: state?.seen_file_ids || {},
    send_log: Array.isArray(state?.send_log) ? state.send_log : [],
  };
}

function markSeen(state, updates, { notified = false, messageId = '' } = {}) {
  const next = {
    ...state,
    updated_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
    seen_file_ids: { ...(state.seen_file_ids || {}) },
    send_log: Array.isArray(state.send_log) ? [...state.send_log] : [],
  };
  for (const update of updates) {
    next.seen_file_ids[update.id] = {
      ...update,
      notified: notified || update.notified || false,
      message_id: messageId || update.message_id || '',
    };
  }
  if (messageId) {
    next.send_log.push({
      at: new Date().toISOString(),
      message_id: messageId,
      file_count: updates.length,
    });
    next.send_log = next.send_log.slice(-50);
  }
  return next;
}

function redactedSummary({ lanes, filesByLane, notifications, suppressions, sentMessage }) {
  return {
    checked_at: new Date().toISOString(),
    watched_folders: lanes.map((lane) => ({
      key: lane.key,
      title: lane.title,
      folder_url: lane.webViewLink,
      item_count: (filesByLane[lane.key] || []).length,
    })),
    new_notification_count: notifications.length,
    notifications: notifications.map((item) => ({
      lane_key: item.lane_key,
      file_name: item.file_name,
      mimeType: item.mimeType,
      route: item.route,
      view_url: item.view_url,
      direct_download_available: item.direct_download_available,
      download_url: item.download_url || '',
    })),
    suppressed_count: suppressions.length,
    suppressions: suppressions.map((item) => ({
      lane_key: item.lane_key,
      name: item.name,
      reason: item.reason,
    })),
    email_sent: Boolean(sentMessage?.id),
    message_id: sentMessage?.id || '',
  };
}

async function main() {
  const args = argsObject(process.argv);
  const map = readJson(args.mapPath);
  const lanes = watchedDropoffLanesFromMap(map);
  if (lanes.length !== 2 || lanes.some((lane) => !lane.id)) {
    throw new Error(`Expected exactly two Rabbi-facing Drive drop-off folders in ${args.mapPath}`);
  }

  const auth = authWithRefreshToken(args.clientPath, args.tokenPath);
  const drive = google.drive({ version: 'v3', auth });
  const gmail = google.gmail({ version: 'v1', auth });
  const filesByLane = {};

  for (const lane of lanes) {
    filesByLane[lane.key] = await listFolderFiles(drive, lane.id);
  }

  let state = loadState(args.statePath);
  const scannedAt = new Date().toISOString();

  if (args.markExisting) {
    const updates = lanes.flatMap((lane) => (filesByLane[lane.key] || []).map((file) => ({
      id: file.id,
      lane_key: lane.key,
      lane_title: lane.title,
      name: file.name,
      mimeType: file.mimeType,
      createdTime: file.createdTime || '',
      modifiedTime: file.modifiedTime || '',
      view_url: driveFileViewUrl(file),
      first_seen_at: scannedAt,
      notified: false,
    })));
    state = markSeen(state, updates);
    writeJson(args.statePath, state);
    console.log(JSON.stringify({
      ok: true,
      mode: 'mark-existing',
      state_path: args.statePath,
      marked_seen: updates.length,
      watched_folders: lanes.map((lane) => ({ key: lane.key, title: lane.title, folder_url: lane.webViewLink })),
    }, null, 2));
    return;
  }

  const { notifications, seenUpdates, suppressions } = buildDropoffNotifications({ lanes, filesByLane, state });
  let sentMessage = null;

  if (args.testEmail) {
    if (!args.recipient) throw new Error('Missing --recipient or ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO for --test-email');
    const email = {
      subject: 'Rabbi Drive drop-off notifier is active',
      text: [
        'The Rabbi Drive drop-off notifier is active.',
        '',
        'Watched folders:',
        ...lanes.map((lane) => `- ${lane.title}: ${lane.webViewLink}`),
        '',
        'Future new uploads in these folders will trigger a download/open-link email.',
      ].join('\n'),
    };
    sentMessage = await sendGmailDigest(gmail, { to: args.recipient, ...email });
  } else if (notifications.length && args.send) {
    if (!args.recipient) throw new Error('Missing --recipient or ONE_TIME_DRIVE_DROPOFF_NOTIFY_TO for --send');
    const email = buildDropoffEmail({ notifications, scannedAt });
    sentMessage = await sendGmailDigest(gmail, { to: args.recipient, ...email });
  }

  if (args.send || args.testEmail) {
    state = markSeen(state, seenUpdates, { notified: Boolean(sentMessage?.id), messageId: sentMessage?.id || '' });
    state.last_scan_at = scannedAt;
    writeJson(args.statePath, state);
  }

  console.log(JSON.stringify(redactedSummary({ lanes, filesByLane, notifications, suppressions, sentMessage }), null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
  }, null, 2));
  process.exitCode = 1;
});
