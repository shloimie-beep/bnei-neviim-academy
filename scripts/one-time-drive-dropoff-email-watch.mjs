#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { google } from 'googleapis';

const require = createRequire(import.meta.url);
const {
  ONE_TIME_DROPOFF_FOLDERS,
  buildOneTimeDriveDropoffContentJobPayload,
} = require('../src/lib/bna/one-time-drive-dropoff-email');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const runtimeConfigPath = path.join(repoRoot, '.runtime', 'one-time-drive-dropoff-notifier.json');
const googleOAuthClientFile = path.join(repoRoot, '.secrets', 'google-oauth-client.json');
const googleRefreshTokenFile = path.join(repoRoot, '.secrets', 'google-refresh-token.txt');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function parseJson(raw, label) {
  const text = String(raw || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON in ${label}`);
  }
}

function readJsonIfExists(filePath, label = filePath) {
  if (!fs.existsSync(filePath)) return null;
  return parseJson(fs.readFileSync(filePath, 'utf8'), label);
}

function loadEnv() {
  return {
    ...parseEnvFile(envLocalPath),
    ...process.env,
  };
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    json: false,
    pageSize: 10,
    recipient: '',
    recipientEnv: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--page-size') {
      args.pageSize = Number(argv[index + 1] || args.pageSize);
      index += 1;
    } else if (arg.startsWith('--page-size=')) {
      args.pageSize = Number(arg.split('=').slice(1).join('=') || args.pageSize);
    } else if (arg === '--recipient') {
      args.recipient = String(argv[index + 1] || '').trim();
      index += 1;
    } else if (arg.startsWith('--recipient=')) {
      args.recipient = String(arg.split('=').slice(1).join('=') || '').trim();
    } else if (arg === '--recipient-env') {
      args.recipientEnv = String(argv[index + 1] || '').trim();
      index += 1;
    } else if (arg.startsWith('--recipient-env=')) {
      args.recipientEnv = String(arg.split('=').slice(1).join('=') || '').trim();
    }
  }
  if (!Number.isFinite(args.pageSize) || args.pageSize < 1) args.pageSize = 10;
  args.pageSize = Math.min(Math.floor(args.pageSize), 100);
  return args;
}

function loadGoogleOAuthClient(env) {
  const clientId = String(env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(env.GOOGLE_CLIENT_SECRET || '').trim();
  if (clientId || clientSecret) {
    if (!clientId || !clientSecret) {
      throw new Error('Incomplete Google OAuth env config: set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }
    return {
      clientId,
      clientSecret,
      redirectUri: env.GOOGLE_REDIRECT_URI || undefined,
    };
  }

  const inlineClient = parseJson(
    env.GOOGLE_OAUTH_CLIENT_JSON || env.GOOGLE_OAUTH_CLIENT_CONFIG || '',
    'GOOGLE_OAUTH_CLIENT_JSON'
  );
  const parsed = inlineClient || readJsonIfExists(googleOAuthClientFile, googleOAuthClientFile);
  const client = parsed?.web || parsed?.installed || parsed || {};
  if (!client.client_id || !client.client_secret) {
    throw new Error('Google OAuth client is not configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_CLIENT_JSON, or provide .secrets/google-oauth-client.json.');
  }
  return {
    clientId: String(client.client_id).trim(),
    clientSecret: String(client.client_secret).trim(),
    redirectUri: env.GOOGLE_REDIRECT_URI || client.redirect_uris?.[0],
  };
}

function loadGoogleDriveAuth(env) {
  const client = loadGoogleOAuthClient(env);
  const refreshToken = String(env.GOOGLE_REFRESH_TOKEN || '').trim() || (
    fs.existsSync(googleRefreshTokenFile)
      ? fs.readFileSync(googleRefreshTokenFile, 'utf8').trim()
      : ''
  );
  if (!refreshToken) {
    throw new Error('Google refresh token is not configured. Set GOOGLE_REFRESH_TOKEN or provide .secrets/google-refresh-token.txt.');
  }
  const auth = new google.auth.OAuth2(client.clientId, client.clientSecret, client.redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

function loadRuntimeConfig() {
  return readJsonIfExists(runtimeConfigPath, runtimeConfigPath) || {};
}

function buildConfig(env, args) {
  const runtimeConfig = loadRuntimeConfig();
  const recipientFromEnv = args.recipientEnv ? String(env[args.recipientEnv] || '').trim() : '';
  return {
    appUrl: String(env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, ''),
    opsUsername: env.ONE_TIME_OPS_USERNAME || env.RABBI_ELIE_SCHELLER_OPS_USERNAME || env.OPS_USERNAME || '',
    opsPassword: env.ONE_TIME_OPS_PASSWORD || env.RABBI_ELIE_SCHELLER_OPS_PASSWORD || env.OPS_PASSWORD || '',
    recipient: args.recipient || recipientFromEnv || String(runtimeConfig.recipient || '').trim(),
    pageSize: args.pageSize,
    dryRun: args.dryRun,
    json: args.json,
  };
}

function basicAuth(config) {
  return `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`;
}

async function appRequest(config, endpoint, body) {
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('Operations credentials are required: set OPS_USERNAME/OPS_PASSWORD or One Time scoped aliases.');
  }
  const response = await fetch(`${config.appUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(config),
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`BNA app ${endpoint} failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return data;
}

async function listFolderFiles(drive, folder, pageSize) {
  const result = await drive.files.list({
    q: `'${folder.id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
    fields: 'files(id,name,mimeType,size,webViewLink,createdTime,modifiedTime,parents)',
    orderBy: 'createdTime desc',
    pageSize,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return (result.data.files || []).map((file) => ({
    ...file,
    sourceFolderId: folder.id,
  }));
}

function resultSummary(file, folder, payload, result = {}) {
  const email = result.email_notification || {};
  return {
    file_name: file.name || payload.title || 'Drive file',
    folder: folder.label,
    classification: payload.parse_json?.drive_dropoff_classification || folder.classification,
    content_job_id: result.job?.id || null,
    created: Boolean(result.created),
    already_sent: Boolean(result.already_sent),
    email_sent: Boolean(email.sent),
    email_skipped: Boolean(email.skipped),
    email_blocked: Boolean(email.blocked),
    email_dry_run: Boolean(email.dry_run),
    email_reason: email.reason || email.blocker || email.error || '',
    open_link_present: Boolean(payload.parse_json?.open_url),
    download_link_present: Boolean(payload.parse_json?.download_url),
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const config = buildConfig(env, args);
  const auth = loadGoogleDriveAuth(env);
  const drive = google.drive({ version: 'v3', auth });
  const summaries = [];
  let fileCount = 0;

  for (const folder of ONE_TIME_DROPOFF_FOLDERS) {
    const files = await listFolderFiles(drive, folder, config.pageSize);
    for (const file of files) {
      fileCount += 1;
      const payload = buildOneTimeDriveDropoffContentJobPayload(file, { folderId: folder.id });
      if (config.dryRun) {
        summaries.push(resultSummary(file, folder, payload, {
          email_notification: { dry_run: true },
        }));
        continue;
      }
      const result = await appRequest(config, '/api/bna/one-time/drive-dropoff-intake', {
        file,
        title: file.name,
        mime_type: file.mimeType,
        media_url: file.webViewLink,
        drive_file_id: file.id,
        drive_folder_id: folder.id,
        drive_stage: folder.stage,
        notify_email: true,
        notify_email_to: config.recipient || undefined,
        intake_source: 'one_time_drive_dropoff_email_watch',
      });
      summaries.push(resultSummary(file, folder, payload, result));
    }
  }

  const output = {
    ok: true,
    dry_run: config.dryRun,
    folders_checked: ONE_TIME_DROPOFF_FOLDERS.map((folder) => ({
      label: folder.label,
      classification: folder.classification,
    })),
    files_seen: fileCount,
    emails_sent: summaries.filter((item) => item.email_sent).length,
    emails_skipped: summaries.filter((item) => item.email_skipped || item.already_sent).length,
    emails_blocked: summaries.filter((item) => item.email_blocked).length,
    recipient_configured: Boolean(config.recipient || env.ONETIME_DRIVE_DROPOFF_NOTIFY_EMAIL || env.ONETIME_POWERPOINT_NOTIFY_EMAIL),
    items: summaries,
  };

  if (config.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`One Time Drive dropoff email watch checked ${output.files_seen} file(s) across ${output.folders_checked.length} folder(s).`);
  console.log(`Email results: sent=${output.emails_sent}, skipped=${output.emails_skipped}, blocked=${output.emails_blocked}. Recipient configured: ${output.recipient_configured ? 'yes' : 'no'}.`);
  for (const item of summaries) {
    console.log(`- ${item.file_name} | ${item.folder} | ${item.classification} | sent=${item.email_sent} skipped=${item.email_skipped || item.already_sent} blocked=${item.email_blocked}`);
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`One Time Drive dropoff email watch failed: ${message}`);
  process.exitCode = 1;
});
