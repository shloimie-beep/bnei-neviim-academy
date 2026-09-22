import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const auditDir = path.join(repoRoot, 'ops', 'system-audits');
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const confirmed = process.argv.includes('APPLY_DECISION_CLASSIFICATION');

function loadDotEnv() {
  const envPath = path.join(repoRoot, '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (!process.env[key]) process.env[key] = rest.join('=').replace(/^['"]|['"]$/g, '');
  }
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function decisionPatchForTopic(topic, row) {
  const title = String(row.title || row.display_title || '').trim();
  const base = {
    summary: title || topic.label,
    why_it_exists: 'Existing decision card needs enough context, options, and recommendation to become actionable.',
    context: String(row.notes || row.summary || row.why_exists || '').trim(),
    options: [],
    recommendation: '',
    next_action: 'Refresh this decision with research/context and return clear options.',
    owner: row.decision_owner || 'Shloimie',
    waiting_on: row.waiting_on || '',
    links: [],
  };
  if (topic.key === 'analytics') {
    return {
      status: 'needs_research',
      route: 'research',
      decision: {
        ...base,
        summary: 'Decide the analytics/tracking model for BNA surfaces',
        context: 'Decision should cover landing pages, payment workflows, ad tracking, internal reporting, and simple server-side event logs.',
        options: [
          { label: 'Option A', title: 'Google Analytics / GTM', description: 'Use GA/GTM for web analytics and campaign tracking.' },
          { label: 'Option B', title: 'Server-side event logs', description: 'Use first-party Operations events for operational reporting.' },
          { label: 'Option C', title: 'Simple internal dashboard metrics', description: 'Track only the few metrics needed for launch decisions.' },
        ],
      },
    };
  }
  if (topic.key === 'pricing') {
    return {
      status: 'needs_research',
      route: 'research',
      decision: {
        ...base,
        summary: 'Decide BNA pricing and payment model',
        context: 'Repo memory says default monthly tuition tracking is 1,000 shekels/month, target is 10-15 kids, and revenue should be reinvested into marketing.',
        options: [
          { label: 'Option A', title: 'Keep 1,000 shekels/month baseline', description: 'Use the current memory default as the operating price.' },
          { label: 'Option B', title: 'Tier or scholarship model', description: 'Add parent-specific pricing exceptions with approval.' },
          { label: 'Option C', title: 'Launch promo then standard price', description: 'Use a short early-family offer with a clear end date.' },
        ],
      },
    };
  }
  if (topic.key === 'account_ownership') {
    return {
      status: 'waiting_on_external_input',
      route: 'external_input',
      decision: {
        ...base,
        summary: 'Decide account ownership and access inventory',
        context: 'Scope includes Railway, GitHub, Google Drive/OAuth, domain/DNS, payment processor, email, ad accounts, Green Invoice if used, and any historical GHL accounts only as legacy references.',
        waiting_on: 'Account/access inventory from Shloimie',
        next_action: 'List current owner, backup owner, recovery email, and missing access for each account.',
      },
    };
  }
  if (topic.key === 'software_ownership') {
    return {
      status: 'waiting_on_external_input',
      route: 'external_input',
      decision: {
        ...base,
        summary: 'Decide software/IP/revenue ownership terms',
        context: 'Do not silently alter partnership, IP, pricing, or revenue terms in source-of-truth docs. This remains an open decision until the terms are explicit.',
        waiting_on: 'Human partnership/IP decision',
        next_action: 'Capture the exact software ownership, revenue split, payout, and backup-owner terms.',
      },
    };
  }
  if (topic.key === 'login_model') {
    return {
      status: 'needs_research',
      route: 'research',
      decision: {
        ...base,
        summary: 'Decide parent/student login model',
        context: 'Current reality includes a private access-code portal at /student.html for student checkoff links. Decision should compare parent login, student access codes, privacy/security, admin support, and CRM implications.',
        options: [
          { label: 'Option A', title: 'Student access-code portal', description: 'Keep simple private student access codes for checkoff flows.' },
          { label: 'Option B', title: 'Parent account login', description: 'Use parent credentials for family-facing management and communications.' },
          { label: 'Option C', title: 'Hybrid parent + student model', description: 'Parents own accounts while students use scoped codes or sessions.' },
        ],
      },
    };
  }
  return { status: 'needs_research', route: 'research', decision: base };
}

const topics = [
  { key: 'analytics', label: 'Decide Analytics', patterns: [/decide analytics/i, /\banalytics\b/i] },
  { key: 'pricing', label: 'Pricing', patterns: [/\bpricing\b/i, /\bprice\b/i, /\btuition\b/i] },
  { key: 'account_ownership', label: 'Account ownership', patterns: [/account ownership/i, /\baccount owner/i] },
  { key: 'software_ownership', label: 'Software ownership / revenue', patterns: [/software ownership/i, /\brevenue\b/i, /\bip ownership\b/i] },
  { key: 'login_model', label: 'Parent/student login model', patterns: [/login model/i, /parent.*student.*login/i, /student.*parent.*login/i] },
];

function matchTopic(row, topic) {
  const text = [row.title, row.display_title, row.summary, row.notes, JSON.stringify(row.ai_parsed || {})].join('\n');
  return topic.patterns.some((pattern) => pattern.test(text));
}

function candidateWhereSql() {
  return `
    COALESCE(decision_required, FALSE)
    OR stage = 'needs_decision'
    OR COALESCE(item_type, '') = 'decision'
    OR COALESCE(task_kind, '') = 'decision'
    OR COALESCE(decision_status, '') <> ''
    OR title ILIKE ANY($1)
    OR COALESCE(notes, '') ILIKE ANY($1)
    OR COALESCE(ai_parsed::text, '') ILIKE ANY($1)
  `;
}

async function run() {
  loadDotEnv();
  fs.mkdirSync(auditDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mdPath = path.join(auditDir, `${timestamp}-decision-lifecycle-audit.md`);
  const jsonPath = path.join(auditDir, `${timestamp}-decision-lifecycle-audit.json`);
  const report = {
    generated_at: new Date().toISOString(),
    mode: apply ? 'apply' : 'dry-run',
    applied: false,
    blocker: null,
    classifications: [],
    missing_expected: [],
    report_paths: { markdown: path.relative(repoRoot, mdPath), json: path.relative(repoRoot, jsonPath) },
  };

  if (apply && !confirmed) {
    report.blocker = 'Apply mode requires --apply --confirm APPLY_DECISION_CLASSIFICATION.';
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PG_CONNECTION_STRING;
  if (!connectionString) {
    report.blocker = report.blocker || 'No DATABASE_URL/POSTGRES_URL/PG_CONNECTION_STRING was available for live task audit.';
    return writeReport(report, mdPath, jsonPath);
  }

  const client = new pg.Client({ connectionString, ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } });
  await client.connect();
  try {
    const searchPatterns = ['%decision%', '%decide%', '%analytics%', '%pricing%', '%account ownership%', '%software ownership%', '%revenue%', '%parent/student%', '%login model%', '%Send to Codex%', '%My task%', '%Done%', '%bot-created%', '%decision bot%'];
    const rows = (await client.query(
      `SELECT *
       FROM bna_tasks
       WHERE ${candidateWhereSql()}
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 500`,
      [searchPatterns]
    )).rows;

    for (const topic of topics) {
      const match = rows.find((row) => matchTopic(row, topic));
      if (!match) {
        report.missing_expected.push(topic.label);
        continue;
      }
      const patch = decisionPatchForTopic(topic, match);
      const parsed = parseJson(match.ai_parsed, {});
      const nextDecision = { ...(parsed.decision || {}), ...patch.decision };
      const oldStatus = match.decision_status || (match.stage === 'needs_decision' ? 'created' : null);
      report.classifications.push({
        id: match.id,
        title: match.display_title || match.title,
        topic: topic.label,
        old_status: oldStatus,
        new_status: patch.status,
        route: patch.route,
        notes: apply ? 'classified' : 'dry-run only',
      });
      if (apply && !report.blocker) {
        await client.query(
          `UPDATE bna_tasks
           SET decision_status = $1,
               decision_route = $2,
               decision_last_activity_at = NOW(),
               ai_parsed = $3::jsonb,
               updated_at = NOW()
           WHERE id = $4`,
          [patch.status, patch.route, JSON.stringify({ ...parsed, decision: nextDecision }), match.id]
        );
        await client.query(
          `INSERT INTO bna_task_comments (task_id, author, body, visibility, source, source_context)
           VALUES ($1, 'system', $2, 'system', 'system', $3::jsonb)`,
          [match.id, `Decision lifecycle audit classified this card as ${patch.status}.`, JSON.stringify({ script: 'audit-decision-lifecycle', topic: topic.key })]
        );
        await client.query(
          `INSERT INTO bna_task_activity (task_id, actor, activity_type, summary, metadata)
           VALUES ($1, 'system', 'decision_lifecycle_classified', $2, $3::jsonb)`,
          [match.id, `Classified as ${patch.status}.`, JSON.stringify({ script: 'audit-decision-lifecycle', topic: topic.key, old_status: oldStatus })]
        );
      }
    }
    report.applied = Boolean(apply && !report.blocker);
  } finally {
    await client.end();
  }
  writeReport(report, mdPath, jsonPath);
}

function writeReport(report, mdPath, jsonPath) {
  const lines = [
    '# Decision Lifecycle Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Mode: ${report.mode}`,
    `Applied: ${report.applied ? 'yes' : 'no'}`,
    report.blocker ? `Blocker: ${report.blocker}` : '',
    '',
    '## Classifications',
    '',
    report.classifications.length
      ? report.classifications.map((item) => `- #${item.id} ${item.title}: ${item.old_status || 'none'} -> ${item.new_status}; route=${item.route}; notes=${item.notes}`).join('\n')
      : '- None',
    '',
    '## Missing Expected Decisions',
    '',
    report.missing_expected.length
      ? report.missing_expected.map((topic) => `- ${topic} not found in live tasks/API`).join('\n')
      : '- None',
    '',
  ].filter((line) => line !== '');
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`, 'utf8');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Decision audit report: ${path.relative(repoRoot, mdPath)}`);
  if (report.blocker) {
    console.log(`Blocker: ${report.blocker}`);
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
