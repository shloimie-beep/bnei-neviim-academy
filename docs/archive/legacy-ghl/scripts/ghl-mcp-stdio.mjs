// Legacy retired GHL archive. GHL/GoHighLevel/LeadConnector is not active BNA runtime and must not be used for new BNA implementation.
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretFilePath = path.join(repoRoot, '.secrets', 'ghl-pit-token.txt');
const DEFAULT_LOCATION_ID = 'IIofSrquLHvNxc8zrpka';

function parseEnvBlock(content = '') {
  const out = {};
  for (const rawLine of String(content || '').split(/\r?\n/)) {
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
    out[key] = value;
  }
  return out;
}

function loadEnvFile(filePath) {
  try {
    return parseEnvBlock(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function loadGhlSecretFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) return {};
    if (!raw.includes('\n') && !raw.startsWith('GHL_PIT_TOKEN=')) {
      return { GHL_PIT_TOKEN: raw };
    }
    return parseEnvBlock(raw);
  } catch {
    return {};
  }
}

const envFile = loadEnvFile(envLocalPath);
const secretFile = loadGhlSecretFile(secretFilePath);
const token = process.env.GHL_PIT_TOKEN || envFile.GHL_PIT_TOKEN || secretFile.GHL_PIT_TOKEN || '';
const locationId = process.env.GHL_LOCATION_ID || envFile.GHL_LOCATION_ID || secretFile.GHL_LOCATION_ID || DEFAULT_LOCATION_ID;

if (!token) {
  console.error('GHL MCP cannot start: GHL_PIT_TOKEN is not configured in the environment, .env.local, or .secrets/ghl-pit-token.txt.');
  process.exit(1);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(command, ['-y', '@drausal/gohighlevel-mcp'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    GHL_LOCATION_ID: locationId,
    LOCATION_ID: locationId,
    BEARER_TOKEN_BEARERAUTH: token,
    BEARER_TOKEN_BEARER: token,
  },
  windowsHide: true,
});

child.on('error', (error) => {
  console.error(`GHL MCP failed to start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
