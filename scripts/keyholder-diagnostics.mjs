#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

export const KEYHOLDER_FILES = [
  {
    name: 'openai-api-key.txt',
    aliases: ['openaiv2.txt'],
    label: 'OpenAI API key',
    repo_secret: '.secrets/openai-api-key.txt',
    env_name: 'OPENAI_API_KEY',
  },
  {
    name: 'buffer-api-key.txt',
    label: 'Buffer API key',
    repo_secret: '.secrets/buffer-api-key.txt',
    env_name: 'BUFFER_API_KEY',
  },
  {
    name: 'resend-api-key.txt',
    label: 'Resend API key',
    repo_secret: '.secrets/resend-api-key.txt',
    env_name: 'RESEND_API_KEY',
  },
  {
    name: 'stripe-secret-key.txt',
    label: 'Stripe secret key',
    repo_secret: '.secrets/stripe-secret-key.txt',
    env_name: 'STRIPE_SECRET_KEY',
    optional: true,
  },
  {
    name: 'railway-token.txt',
    label: 'Railway project token',
    repo_secret: '.secrets/railway-token.txt',
    env_name: 'RAILWAY_TOKEN',
  },
  {
    name: 'kimi-api-key.txt',
    label: 'Kimi API key',
    repo_secret: '.secrets/kimi-api-key.txt',
    env_name: 'KIMI_API_KEY',
    optional: true,
  },
  {
    name: 'vimeo-client-id.txt',
    label: 'Vimeo client ID',
    repo_secret: '.secrets/vimeo-client-id.txt',
    env_name: 'VIMEO_CLIENT_ID',
    optional: true,
  },
  {
    name: 'vimeo-client-secret.txt',
    label: 'Vimeo client secret',
    repo_secret: '.secrets/vimeo-client-secret.txt',
    env_name: 'VIMEO_CLIENT_SECRET',
    optional: true,
  },
  {
    name: 'vimeo-access-token.txt',
    aliases: ['one-time-vimeo-access-token.txt'],
    label: 'Vimeo access token',
    repo_secret: '.secrets/vimeo-access-token.txt',
    env_name: 'VIMEO_ACCESS_TOKEN',
    optional: true,
  },
  {
    name: 'vimeo-webhook-secret.txt',
    label: 'Vimeo webhook secret',
    repo_secret: '.secrets/vimeo-webhook-secret.txt',
    env_name: 'VIMEO_WEBHOOK_SECRET',
    optional: true,
  },
  {
    name: 'vimeo-test-project-uri.txt',
    aliases: ['one-time-vimeo-test-project-uri.txt'],
    label: 'Vimeo private test project URI',
    repo_secret: '.secrets/vimeo-test-project-uri.txt',
    env_name: 'VIMEO_TEST_PROJECT_URI',
    optional: true,
  },
  {
    name: 'vimeo-test-project-name.txt',
    aliases: ['one-time-vimeo-test-project-name.txt'],
    label: 'Vimeo private test project name',
    repo_secret: '.secrets/vimeo-test-project-name.txt',
    env_name: 'VIMEO_TEST_PROJECT_NAME',
    optional: true,
  },
];

export function defaultKeyholderDir(env = process.env) {
  if (env.BNA_KEYHOLDER_DIR) return env.BNA_KEYHOLDER_DIR;
  return path.join(env.USERPROFILE || os.homedir(), 'BNA-Keyholder');
}

export function normalizeSecretText(rawValue) {
  const raw = rawValue === undefined || rawValue === null ? '' : String(rawValue);
  const hadBom = raw.charCodeAt(0) === 0xfeff;
  const hadNewline = /\n/.test(raw);
  const hadCarriageReturn = /\r/.test(raw);
  let normalized = raw.replace(/^\uFEFF/, '').trim();
  const surroundingQuotes =
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"));
  if (surroundingQuotes) normalized = normalized.slice(1, -1).trim();
  return {
    normalized,
    raw_length: raw.length,
    normalized_length: normalized.length,
    had_bom: hadBom,
    had_newline: hadNewline,
    had_carriage_return: hadCarriageReturn,
    surrounding_quotes: surroundingQuotes,
    normalization_changed: normalized !== raw,
  };
}

export function fingerprintSecret(normalizedValue) {
  if (!normalizedValue) return '';
  return crypto.createHash('sha256').update(normalizedValue).digest('hex').slice(0, 12);
}

export function inspectSecretText(rawValue, stat = null) {
  const normalized = normalizeSecretText(rawValue);
  return {
    present: Boolean(normalized.normalized),
    length: normalized.raw_length,
    normalized_length: normalized.normalized_length,
    fingerprint: fingerprintSecret(normalized.normalized),
    newline: normalized.had_newline,
    carriage_return: normalized.had_carriage_return,
    bom: normalized.had_bom,
    surrounding_quotes: normalized.surrounding_quotes,
    normalization_changed: normalized.normalization_changed,
    last_modified: stat?.mtime ? stat.mtime.toISOString() : null,
  };
}

function inspectFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return {
      exists: true,
      ...inspectSecretText(fs.readFileSync(filePath, 'utf8'), stat),
    };
  } catch {
    return {
      exists: false,
      present: false,
      length: 0,
      normalized_length: 0,
      fingerprint: '',
      newline: false,
      carriage_return: false,
      bom: false,
      surrounding_quotes: false,
      normalization_changed: false,
      last_modified: null,
    };
  }
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function inspectKeyholder(options = {}) {
  const keyholderDir = options.keyholderDir || defaultKeyholderDir(options.env || process.env);
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const keyholderExists = fs.existsSync(keyholderDir);
  const files = KEYHOLDER_FILES.map((entry) => {
    const keyholderCandidates = [entry.name, ...(entry.aliases || [])].map((name) => ({
      name,
      ...inspectFile(path.join(keyholderDir, name)),
    }));
    const keyholder = keyholderCandidates.find((candidate) => candidate.present) || keyholderCandidates[0];
    const repoSecret = inspectFile(path.join(repoRoot, entry.repo_secret));
    return {
      ...entry,
      keyholder,
      keyholder_candidates: keyholderCandidates,
      repo_secret_present: repoSecret.present,
      repo_secret_fingerprint: repoSecret.fingerprint,
      matches_repo_secret: Boolean(
        keyholder.fingerprint &&
        repoSecret.fingerprint &&
        keyholder.fingerprint === repoSecret.fingerprint
      ),
    };
  });

  return {
    generated_at: new Date().toISOString(),
    keyholder_dir: keyholderDir,
    keyholder_exists: keyholderExists,
    files,
  };
}

function renderMarkdown(report) {
  const lines = [
    `# BNA Keyholder Diagnostics - ${report.generated_at}`,
    '',
    `Keyholder folder: \`${report.keyholder_dir}\``,
    `Folder exists: ${report.keyholder_exists}`,
    '',
    'This report never includes secret values. Fingerprints are the first 12',
    'hex characters of a SHA-256 hash of the normalized file contents.',
    '',
    '## Files',
    '',
  ];

  for (const file of report.files) {
    lines.push(`### ${file.name}`);
    lines.push(`- label: ${file.label}`);
    if (file.aliases?.length) lines.push(`- aliases: ${file.aliases.join(', ')}`);
    lines.push(`- optional: ${Boolean(file.optional)}`);
    lines.push(`- selected_keyholder_file: ${file.keyholder.name || file.name}`);
    lines.push(`- keyholder exists: ${file.keyholder.exists}`);
    lines.push(`- keyholder present: ${file.keyholder.present}`);
    lines.push(`- length: ${file.keyholder.length}`);
    lines.push(`- normalized_length: ${file.keyholder.normalized_length}`);
    lines.push(`- fingerprint: ${file.keyholder.fingerprint || 'none'}`);
    lines.push(`- newline: ${file.keyholder.newline}`);
    lines.push(`- carriage_return: ${file.keyholder.carriage_return}`);
    lines.push(`- bom: ${file.keyholder.bom}`);
    lines.push(`- surrounding_quotes: ${file.keyholder.surrounding_quotes}`);
    lines.push(`- normalization_changed: ${file.keyholder.normalization_changed}`);
    lines.push(`- last_modified: ${file.keyholder.last_modified || 'none'}`);
    lines.push(`- repo_secret: ${file.repo_secret}`);
    lines.push(`- repo_secret_present: ${file.repo_secret_present}`);
    lines.push(`- repo_secret_fingerprint: ${file.repo_secret_fingerprint || 'none'}`);
    lines.push(`- matches_repo_secret: ${file.matches_repo_secret}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function writeReports(report, repoRoot) {
  const reportDir = path.join(repoRoot, 'ops', 'qa-runs');
  fs.mkdirSync(reportDir, { recursive: true });
  const baseName = `${timestampSlug()}-keyholder-diagnostics`;
  const jsonPath = path.join(reportDir, `${baseName}.json`);
  const mdPath = path.join(reportDir, `${baseName}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));
  return { jsonPath, mdPath };
}

function parseArgs(argv) {
  const args = {
    json: false,
    noWrite: false,
    keyholderDir: '',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') args.json = true;
    else if (arg === '--no-write') args.noWrite = true;
    else if (arg === '--dir') {
      args.keyholderDir = argv[i + 1] || '';
      i += 1;
    }
  }
  return args;
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const repoRoot = options.repoRoot || defaultRepoRoot;
  const report = inspectKeyholder({
    keyholderDir: args.keyholderDir || options.keyholderDir,
    repoRoot,
    env: options.env || process.env,
  });
  const paths = args.noWrite ? null : writeReports(report, repoRoot);

  if (args.json) {
    console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  } else {
    console.log(renderMarkdown(report));
    if (paths) {
      console.log(`Reports written: ${path.relative(repoRoot, paths.mdPath)} and ${path.relative(repoRoot, paths.jsonPath)}`);
    }
  }
  return { report, paths };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(`Keyholder diagnostics failed: ${error.message}`);
    process.exitCode = 1;
  });
}
