import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const UPDATED_BY = 'codex-brand-prompt-refresh';
const CHANGE_NOTE = 'Professional BNA tone refresh: specific, concise, no fluff, public posts begin with Today at Bnei Neviim Academy when appropriate.';
const PROMPT_PLATFORMS = [
  'whatsapp_update',
  'facebook_post',
  'weekly_newsletter',
  'linkedin_post',
  'youtube_description',
  'blog_draft',
  'google_business_post',
  'daily_report',
  'parent_email',
  'teaching_philosophy_note',
  'short_clip',
];

function parseEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[line.slice(0, separator).trim()] = value;
  }
  return env;
}

function usableSecretValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.includes('[YOUR-PASSWORD]')) return '';
  return normalized;
}

function readLocalSecretFile(name) {
  try {
    return fs.readFileSync(path.join(repoRoot, '.secrets', name), 'utf8').trim();
  } catch {
    return '';
  }
}

function databaseUrl() {
  const localEnv = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...parseEnvFile(path.join(repoRoot, '.env')),
  };
  return usableSecretValue(process.env.DATABASE_URL)
    || usableSecretValue(localEnv.DATABASE_URL)
    || usableSecretValue(readLocalSecretFile('railway-database-url.txt'));
}

function loadDefaultContentPrompts() {
  const serverPath = path.join(repoRoot, 'server.js');
  const serverSource = fs.readFileSync(serverPath, 'utf8');
  const startMarker = 'const DEFAULT_CONTENT_PROMPTS = ';
  const endMarker = ';\n\nasync function ensureDefaultContentPrompts';
  const start = serverSource.indexOf(startMarker);
  const end = serverSource.indexOf(endMarker, start);
  if (start < 0 || end < 0) {
    throw new Error('Could not find DEFAULT_CONTENT_PROMPTS in server.js');
  }

  const declaration = serverSource.slice(start, end + 1);
  const context = {};
  vm.createContext(context);
  return vm.runInContext(`${declaration}\nDEFAULT_CONTENT_PROMPTS;`, context, {
    filename: 'server.js:DEFAULT_CONTENT_PROMPTS',
  });
}

function checkConstraintSql(tableName, constraintName, columnName) {
  const quotedValues = PROMPT_PLATFORMS.map((platform) => `'${platform}'`).join(', ');
  return `
    ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};
    ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName}
      CHECK (${columnName} IN (${quotedValues}));
  `;
}

async function refreshPrompts() {
  const connectionString = databaseUrl();
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured and .secrets/railway-database-url.txt was not found.');
  }

  const defaults = loadDefaultContentPrompts();
  const missing = PROMPT_PLATFORMS.filter((platform) => !defaults[platform]?.prompt_text);
  if (missing.length) {
    throw new Error(`DEFAULT_CONTENT_PROMPTS is missing: ${missing.join(', ')}`);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  const summary = [];

  try {
    await client.query('BEGIN');
    await client.query(checkConstraintSql(
      'bna_content_prompts',
      'bna_content_prompts_platform_check',
      'platform'
    ));
    await client.query(checkConstraintSql(
      'bna_content_prompt_examples',
      'bna_content_prompt_examples_platform_check',
      'platform'
    ));

    for (const platform of PROMPT_PLATFORMS) {
      const config = defaults[platform];
      const existing = (await client.query(
        'SELECT * FROM bna_content_prompts WHERE platform = $1 FOR UPDATE',
        [platform]
      )).rows[0];

      if (!existing) {
        const inserted = (await client.query(
          `INSERT INTO bna_content_prompts (platform, label, prompt_text, version, updated_by, updated_at)
           VALUES ($1, $2, $3, 1, $4, NOW())
           RETURNING *`,
          [platform, config.label, config.prompt_text, UPDATED_BY]
        )).rows[0];
        await client.query(
          `INSERT INTO bna_content_prompt_versions (prompt_id, version, prompt_text, change_note, updated_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (prompt_id, version) DO NOTHING`,
          [inserted.id, inserted.version, inserted.prompt_text, CHANGE_NOTE, UPDATED_BY]
        );
        summary.push({ platform, action: 'inserted', version: inserted.version });
        continue;
      }

      if (
        String(existing.prompt_text || '') === config.prompt_text &&
        String(existing.label || '') === config.label &&
        String(existing.updated_by || '') === UPDATED_BY
      ) {
        summary.push({ platform, action: 'already_current', version: existing.version });
        continue;
      }

      const nextVersion = Number(existing.version || 1) + 1;
      const updated = (await client.query(
        `UPDATE bna_content_prompts
         SET label = $1,
             prompt_text = $2,
             version = $3,
             updated_by = $4,
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [config.label, config.prompt_text, nextVersion, UPDATED_BY, existing.id]
      )).rows[0];
      await client.query(
        `INSERT INTO bna_content_prompt_versions (prompt_id, version, prompt_text, change_note, updated_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [updated.id, updated.version, updated.prompt_text, CHANGE_NOTE, UPDATED_BY]
      );
      summary.push({ platform, action: 'updated', from: existing.version, version: updated.version });
    }

    if (dryRun) {
      await client.query('ROLLBACK');
    } else {
      await client.query('COMMIT');
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors so the original failure remains visible.
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  return summary;
}

refreshPrompts()
  .then((summary) => {
    console.log(`${dryRun ? 'Dry-run completed' : 'Prompt refresh completed'}:`);
    for (const item of summary) {
      const version = item.from ? `v${item.from} -> v${item.version}` : `v${item.version}`;
      console.log(`- ${item.platform}: ${item.action} ${version}`);
    }
  })
  .catch((error) => {
    console.error(`Prompt refresh failed: ${error.message}`);
    process.exitCode = 1;
  });
