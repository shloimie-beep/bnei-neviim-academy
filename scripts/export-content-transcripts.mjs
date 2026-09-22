import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'content-memory', 'transcripts');

function parseArgs(argv) {
  const options = {
    includeRawTranscript: false,
    deleteStale: false,
  };
  for (const arg of argv) {
    if (arg === '--include-raw-transcript') options.includeRawTranscript = true;
    else if (arg === '--delete-stale') options.deleteStale = true;
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

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

function slugify(value) {
  return String(value || 'transcript')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'transcript';
}

function yamlString(value) {
  return JSON.stringify(String(value || ''));
}

function loadConfig() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  return {
    appUrl: (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, ''),
    username: env.OPS_USERNAME || '',
    password: env.OPS_PASSWORD || '',
  };
}

async function appRequest(config, endpoint) {
  if (!config.username || !config.password) {
    throw new Error('OPS_USERNAME and OPS_PASSWORD are required to export transcripts.');
  }
  const response = await fetch(`${config.appUrl}${endpoint}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

function outputSummary(outputs = []) {
  if (!Array.isArray(outputs) || !outputs.length) return 'none';
  return outputs
    .map((output) => `${output.output_type || 'output'}:${output.status || 'unknown'}#${output.id}`)
    .join(', ');
}

function renderTranscript(job) {
  const transcript = String(job.transcript_text || '').trim();
  return [
    '---',
    `id: ${job.id}`,
    `title: ${yamlString(job.title || 'Untitled')}`,
    `status: ${yamlString(job.status || '')}`,
    `source_type: ${yamlString(job.source_type || '')}`,
    `created_at: ${yamlString(job.created_at || '')}`,
    `updated_at: ${yamlString(job.updated_at || '')}`,
    `drive_stage: ${yamlString(job.drive_stage || '')}`,
    `drive_file_id: ${yamlString(job.drive_file_id || '')}`,
    `media_url: ${yamlString(job.media_url || '')}`,
    `transcript_chars: ${transcript.length}`,
    `outputs: ${yamlString(outputSummary(job.outputs))}`,
    '---',
    '',
    `# ${job.title || `Content job #${job.id}`}`,
    '',
    `- Content job: #${job.id}`,
    `- Drive stage: ${job.drive_stage || 'none'}`,
    job.media_url ? `- Source file: ${job.media_url}` : '- Source file: none',
    `- Outputs: ${outputSummary(job.outputs)}`,
    '',
    '## Transcript',
    '',
    transcript || '[No transcript text saved for this content job.]',
    '',
  ].join('\n');
}

function renderIndex(jobs, generatedAt) {
  const lines = [
    '# BNA Content Transcript Index',
    '',
    `Generated: ${generatedAt}`,
    '',
    'These transcripts are exported from the live BNA app database into GitHub so agents can use the repo as the canonical memory/source-of-truth. Google Drive remains the source-media intake/library, not the primary transcript store.',
    '',
    '| Job | Title | Status | Drive stage | Transcript | Source |',
    '| --- | --- | --- | --- | ---: | --- |',
  ];

  for (const job of jobs) {
    const transcript = String(job.transcript_text || '').trim();
    const fileName = `${String(job.id).padStart(3, '0')}-${slugify(job.title)}.md`;
    const source = job.media_url ? `[Drive](${job.media_url})` : '';
    lines.push(`| #${job.id} | [${String(job.title || 'Untitled').replace(/\|/g, '\\|')}](${fileName}) | ${job.status || ''} | ${job.drive_stage || ''} | ${transcript.length} | ${source} |`);
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.includeRawTranscript) {
    throw new Error(
      'Refusing to export raw transcript bodies into tracked GitHub files by default. ' +
      'Use npm run content:export-digests for repo-safe memory. If a private owner explicitly approves raw export, rerun with --include-raw-transcript.'
    );
  }

  const config = loadConfig();
  const data = await appRequest(config, '/api/bna/content-jobs');
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  const jobsWithTranscripts = jobs
    .filter((job) => String(job.transcript_text || '').trim())
    .sort((a, b) => Number(b.id) - Number(a.id));

  fs.mkdirSync(outputDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const expectedFiles = new Set(['index.md']);

  for (const job of jobsWithTranscripts) {
    const fileName = `${String(job.id).padStart(3, '0')}-${slugify(job.title)}.md`;
    expectedFiles.add(fileName);
    fs.writeFileSync(path.join(outputDir, fileName), renderTranscript(job));
  }

  fs.writeFileSync(path.join(outputDir, 'index.md'), renderIndex(jobsWithTranscripts, generatedAt));

  if (options.deleteStale) {
    for (const name of fs.readdirSync(outputDir)) {
      if (name.endsWith('.md') && !expectedFiles.has(name)) {
        fs.unlinkSync(path.join(outputDir, name));
      }
    }
  }

  console.log(
    `Exported ${jobsWithTranscripts.length} raw transcript file(s) to ${path.relative(repoRoot, outputDir)}. ` +
    `Deleted stale files: ${options.deleteStale ? 'yes' : 'no'}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
