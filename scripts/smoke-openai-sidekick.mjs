#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const { buildBnaAiContextSummary } = require('../src/lib/bna/ai-context');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretsDir = path.join(repoRoot, '.secrets');
const reportDir = path.join(repoRoot, 'ops', 'openai-smokes');

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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? normalizeLoadedSecret(fs.readFileSync(filePath, 'utf8')) : '';
}

function normalizeLoadedSecret(value) {
  let normalized = String(value || '').replace(/^\uFEFF/, '').trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function normalizeAiPrimaryProvider(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (['kimi', 'kimmy', 'moonshot', 'moonshot_ai'].includes(normalized)) return 'kimi';
  return 'openai';
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function countJsonl(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean).length;
}

function compactTask(task) {
  return {
    id: task.id,
    title: task.title,
    stage: task.stage,
    assigned_to: task.assigned_to || null,
    category: task.category || null,
    project: task.project_short_name || task.project_name || null,
  };
}

function compactContentJob(job) {
  return {
    id: job.id,
    title: job.title,
    status: job.status,
    drive_stage: job.drive_stage || null,
    transcript_chars: String(job.transcript_text || '').length,
    outputs: Array.isArray(job.outputs)
      ? job.outputs.map((output) => ({
        id: output.id,
        type: output.output_type,
        status: output.status,
      }))
      : [],
  };
}

function compactStudent(student) {
  return {
    id: student.id,
    name: student.name,
    status: student.status || null,
    parent_name: student.parent_name || null,
    torah_trip_progress_percentage: student.torah_trip_progress_percentage ?? null,
  };
}

function compactPayment(item) {
  return {
    id: item.id,
    student_name: item.student_name || item.child_name || item.name || null,
    parent_name: item.parent_name || null,
    status: item.payment_status || item.status || null,
    method: item.payment_method || item.method || null,
    amount: item.payment_amount || item.amount || null,
    due: item.payment_due_date || null,
  };
}

function countBy(items = [], field, fallback = 'unknown') {
  return (Array.isArray(items) ? items : []).reduce((counts, item) => {
    const key = String(item?.[field] || fallback);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function sanitizeForPrompt(summary) {
  return JSON.parse(JSON.stringify(summary, (key, value) => {
    if (/password|token|secret|key|authorization|access_code|pin/i.test(key)) return '[redacted]';
    if (typeof value === 'string' && value.length > 1000) return `${value.slice(0, 1000)}...[truncated]`;
    return value;
  }));
}

function selectAiSmokeProvider(env) {
  const openaiApiKey = readSecret('openai-api-key.txt') || normalizeLoadedSecret(env.OPENAI_API_KEY) || '';
  const kimiApiKey = readSecret('kimi-api-key.txt') || normalizeLoadedSecret(env.KIMI_API_KEY) || '';
  const preferred = normalizeAiPrimaryProvider(env.BNA_AI_PRIMARY_PROVIDER || env.AI_PRIMARY_PROVIDER || 'openai');
  if (preferred === 'kimi' && kimiApiKey) {
    return {
      provider: 'kimi',
      label: 'Kimi',
      apiKey: kimiApiKey,
      baseUrl: env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1',
      model: env.KIMI_MODEL || 'kimi-k2.6',
    };
  }
  if (openaiApiKey) {
    return {
      provider: 'openai',
      label: 'OpenAI',
      apiKey: openaiApiKey,
      baseUrl: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: env.OPENAI_MODEL || 'gpt-4.1-mini',
    };
  }
  if (kimiApiKey) {
    return {
      provider: 'kimi',
      label: 'Kimi',
      apiKey: kimiApiKey,
      baseUrl: env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1',
      model: env.KIMI_MODEL || 'kimi-k2.6',
    };
  }
  return {
    provider: preferred,
    label: preferred === 'kimi' ? 'Kimi' : 'OpenAI',
    apiKey: '',
    baseUrl: preferred === 'kimi' ? (env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1') : (env.OPENAI_BASE_URL || 'https://api.openai.com/v1'),
    model: preferred === 'kimi' ? (env.KIMI_MODEL || 'kimi-k2.6') : (env.OPENAI_MODEL || 'gpt-4.1-mini'),
  };
}

async function appRequest(config, endpoint) {
  const response = await fetch(`${config.appUrl.replace(/\/+$/, '')}${endpoint}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`,
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${endpoint} failed ${response.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function collectAppData(config) {
  const endpointMap = {
    health: '/api/health',
    projects: '/api/bna/projects',
    tasks: '/api/bna/tasks',
    agentFleet: '/api/bna/agent-fleet/status',
    students: '/api/bna/students',
    torah: '/api/bna/torah-learning',
    accountability: '/api/bna/accountability?limit=40',
    devices: '/api/bna/devices',
    deviceAccessRules: '/api/bna/device-access-rules',
    contentJobs: '/api/bna/content-jobs',
    contentPrompts: '/api/bna/content-prompts',
    contentBundles: '/api/bna/content-bundles',
    signups: '/api/bna/signups',
    paymentIntake: '/api/bna/payment-intake',
    payments: '/api/bna/payments',
    supportTickets: '/api/bna/support-tickets',
    greenInvoiceWebhooks: '/api/bna/green-invoice/webhooks',
  };
  const entries = await Promise.allSettled(Object.entries(endpointMap).map(async ([key, endpoint]) => {
    const data = await appRequest(config, endpoint);
    return [key, { endpoint, ok: true, data }];
  }));

  const result = {};
  for (const entry of entries) {
    if (entry.status === 'fulfilled') {
      const [key, value] = entry.value;
      result[key] = value;
    }
  }
  const errors = entries
    .filter((entry) => entry.status === 'rejected')
    .map((entry) => entry.reason instanceof Error ? entry.reason.message : String(entry.reason));
  return { result, errors };
}

function loadGoogleAuth(env) {
  const clientPath = path.join(secretsDir, 'google-oauth-client.json');
  const tokenPath = path.join(secretsDir, 'google-refresh-token.txt');
  const parsed = readJsonIfExists(clientPath);
  const client = parsed?.web || parsed?.installed;
  const refreshToken = env.GOOGLE_REFRESH_TOKEN || (fs.existsSync(tokenPath) ? fs.readFileSync(tokenPath, 'utf8').trim() : '');
  if (!client?.client_id || !client?.client_secret || !refreshToken) return null;
  const auth = new google.auth.OAuth2(client.client_id, client.client_secret, env.GOOGLE_REDIRECT_URI || client.redirect_uris?.[0]);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

async function collectDriveData(env) {
  const pipeline = env.GOOGLE_DRIVE_PIPELINE_CONFIG
    ? JSON.parse(env.GOOGLE_DRIVE_PIPELINE_CONFIG)
    : readJsonIfExists(path.join(secretsDir, 'google-drive-pipeline.json')) || {};
  const auth = loadGoogleAuth(env);
  if (!auth || !pipeline.root) {
    return { ok: false, pipelineConfigured: Boolean(pipeline.root), folders: {}, error: 'Google auth or pipeline root missing' };
  }
  const drive = google.drive({ version: 'v3', auth });
  const about = await drive.about.get({ fields: 'user(emailAddress)' });
  const folderEntries = Object.entries(pipeline.simplifiedFolders || {});
  const folders = {};
  for (const [key, folderId] of folderEntries) {
    if (!folderId) continue;
    const folder = await drive.files.get({
      fileId: folderId,
      supportsAllDrives: true,
      fields: 'id,name,webViewLink',
    });
    const children = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'files(id,name,mimeType,modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 8,
    });
    folders[key] = {
      id: folderId,
      name: folder.data.name,
      recent_count: children.data.files?.length || 0,
      recent_names: (children.data.files || []).map((file) => file.name),
    };
  }
  return {
    ok: true,
    account: about.data.user?.emailAddress || null,
    root: pipeline.root,
    sourceOfTruth: pipeline.sourceOfTruth || null,
    folders,
  };
}

function collectRepoData() {
  const contextFiles = [
    'AGENTS.md',
    'MEMORY.md',
    'TASKS.md',
    'SYSTEM-STATE.md',
    'PROJECT-NOTES.md',
    'ops/agent-task-ledger.jsonl',
    'ops/agent-changelog.md',
    'content-memory/transcripts/index.md',
  ];
  const files = {};
  for (const file of contextFiles) {
    const filePath = path.join(repoRoot, file);
    files[file] = {
      exists: fs.existsSync(filePath),
      chars: fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').length : 0,
      records: file.endsWith('.jsonl') ? countJsonl(filePath) : undefined,
    };
  }
  const transcriptsDir = path.join(repoRoot, 'content-memory', 'transcripts');
  const transcriptFiles = fs.existsSync(transcriptsDir)
    ? fs.readdirSync(transcriptsDir).filter((name) => name.endsWith('.md') && name !== 'index.md')
    : [];
  return {
    files,
    transcript_export_count: transcriptFiles.length,
    newest_task_pending: fs.existsSync(path.join(repoRoot, 'tasks-pending'))
      ? fs.readdirSync(path.join(repoRoot, 'tasks-pending')).filter((name) => name.endsWith('.md')).sort().slice(-5)
      : [],
  };
}

async function askAiProvider(config, expected, promptData) {
  const response = await fetch(`${config.aiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.aiApiKey}`,
    },
    body: JSON.stringify({
      model: config.aiModel,
      temperature: config.aiProvider === 'kimi' ? 1 : 0,
      messages: [
        {
          role: 'system',
          content: 'You are a smoke-test respondent. Use only the JSON data in the user message. Return compact JSON only, no Markdown.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            instruction: 'Return the requested fields exactly from this system data.',
            requested_fields: [
              'active_codex_count',
              'active_codex_ids',
              'student_names',
              'torah_group_percentage',
              'transcript_job_count',
              'pending_payment_students',
              'drive_raw_folder_name',
              'repo_transcript_export_count',
              'operations_sections',
              'task_stage_counts',
              'content_prompt_count',
              'device_count',
              'agent_fleet_status',
              'brand_kit_file_count',
            ],
            expected_shape: expected,
            system_data: promptData,
          }),
        },
      ],
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${config.aiProviderLabel} smoke failed ${response.status}: ${text.slice(0, 500)}`);
  const content = JSON.parse(text)?.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`${config.aiProviderLabel} did not return JSON: ${content.slice(0, 500)}`);
  return JSON.parse(jsonMatch[0]);
}

function renderMarkdown(report) {
  const lines = [
    `# AI Sidekick Smoke - ${report.generated_at}`,
    '',
    `Overall: ${report.ok ? 'PASS' : 'FAIL'}`,
    '',
    `Provider: ${report.ai_provider} (${report.ai_model})`,
    '',
    '## Checks',
    '',
  ];
  for (const check of report.checks) {
    lines.push(`- ${check.ok ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? ` - ${check.detail}` : ''}`);
  }
  lines.push('', '## Expected', '', '```json', JSON.stringify(report.expected, null, 2), '```');
  lines.push('', '## AI Returned', '', '```json', JSON.stringify(report.openai_answer, null, 2), '```');
  lines.push('', '## Live Counts', '', '```json', JSON.stringify(report.live_counts, null, 2), '```');
  if (report.errors.length) {
    lines.push('', '## Errors', '');
    for (const error of report.errors) lines.push(`- ${error}`);
  }
  return `${lines.join('\n')}\n`;
}

function telegramChunks(text, maxLength = 3900) {
  const chunks = [];
  let remaining = String(text || '').trim();
  while (remaining.length > maxLength) {
    let index = remaining.lastIndexOf('\n\n', maxLength);
    if (index < maxLength * 0.5) index = remaining.lastIndexOf('\n', maxLength);
    if (index < maxLength * 0.5) index = remaining.lastIndexOf(' ', maxLength);
    if (index < maxLength * 0.5) index = maxLength;
    chunks.push(remaining.slice(0, index).trim());
    remaining = remaining.slice(index).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function sendTelegram(config, text) {
  if (!config.telegramToken || !config.telegramChatId) return false;
  for (const chunk of telegramChunks(text)) {
    const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.telegramChatId, text: chunk }),
    });
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error(`Telegram send failed: ${JSON.stringify(body)}`);
  }
  return true;
}

async function main() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  const aiProvider = selectAiSmokeProvider(env);
  const config = {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
    aiProvider: aiProvider.provider,
    aiProviderLabel: aiProvider.label,
    aiApiKey: aiProvider.apiKey,
    aiBaseUrl: aiProvider.baseUrl,
    aiModel: aiProvider.model,
    telegramToken: readSecret('telegram-bot-token.txt') || env.TELEGRAM_BOT_TOKEN_BNA || env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: env.TELEGRAM_CHAT_ID_BNA || env.TELEGRAM_CHAT_ID || '',
  };

  const errors = [];
  const checks = [];
  const repo = collectRepoData();
  const aiContext = buildBnaAiContextSummary({ repoRoot });

  if (!config.opsUsername || !config.opsPassword) errors.push('OPS_USERNAME/OPS_PASSWORD missing');
  if (!config.aiApiKey) errors.push(`${config.aiProviderLabel} key missing`);

  let app = { result: {}, errors: [] };
  if (config.opsUsername && config.opsPassword) {
    app = await collectAppData(config);
    errors.push(...app.errors);
  }

  let drive = {};
  try {
    drive = await collectDriveData(env);
  } catch (error) {
    drive = { ok: false, error: error instanceof Error ? error.message : String(error) };
    errors.push(`Drive smoke failed: ${drive.error}`);
  }

  const tasks = app.result.tasks?.data?.tasks || [];
  const activeTasks = tasks.filter((task) => !['done', 'archive'].includes(String(task.stage || '')));
  const codexTasks = activeTasks.filter((task) => /codex|kimi|system|agent/i.test(String(task.assigned_to || '')));
  const students = app.result.students?.data?.students || [];
  const devices = app.result.devices?.data?.devices || [];
  const contentPrompts = app.result.contentPrompts?.data?.prompts || [];
  const contentJobs = app.result.contentJobs?.data?.jobs || [];
  const transcriptJobs = contentJobs.filter((job) => String(job.transcript_text || '').trim());
  const signups = app.result.signups?.data?.signups || [];
  const payments = [
    ...(app.result.payments?.data?.payments || []),
    ...(app.result.paymentIntake?.data?.payments || []),
    ...(app.result.paymentIntake?.data?.intake || []),
  ];
  const pendingPaymentStudents = [
    ...signups
      .filter((item) => /pending|unpaid|due|failed/i.test(String(item.payment_status || item.status || '')))
      .map((item) => item.student_name || item.child_name || item.name || item.parent_name || item.parent_email || 'unknown'),
    ...payments
    .filter((item) => /pending|unpaid|due/i.test(String(item.payment_status || item.status || '')))
      .map((item) => item.student_name || item.child_name || item.name || item.parent_name || item.parent_email || 'unknown'),
  ].filter(Boolean);
  const torahGroup = app.result.torah?.data?.group || app.result.torah?.data?.summary || {};
  const torahStudents = app.result.torah?.data?.students || [];
  const torahGroupPercentage = Number(
    torahGroup.groupPercentage ??
    torahGroup.groupPercentageRaw ??
    torahGroup.group_progress_percentage ??
    torahGroup.group_percentage ??
    torahGroup.progress_percentage ??
    (torahStudents.length
      ? torahStudents.reduce((sum, student) => sum + Number(student.total_trip_progress_percentage || student.progress_percentage || 0), 0) / torahStudents.length
      : 0)
  );

  const expected = {
    active_codex_count: codexTasks.length,
    active_codex_ids: codexTasks.map((task) => task.id),
    student_names: students.map((student) => student.name).filter(Boolean),
    torah_group_percentage: Math.round(torahGroupPercentage),
    transcript_job_count: transcriptJobs.length,
    pending_payment_students: [...new Set(pendingPaymentStudents)],
    drive_raw_folder_name: drive.folders?.rawIntake?.name || null,
    repo_transcript_export_count: repo.transcript_export_count,
    operations_sections: ['Tasks', 'Students', 'Content', 'Contacts', 'Accounting', 'Team'],
    task_stage_counts: countBy(tasks, 'stage'),
    content_prompt_count: contentPrompts.length,
    device_count: devices.length,
    agent_fleet_status: app.result.agentFleet?.data?.fleet?.status || app.result.agentFleet?.data?.status || 'unknown',
    brand_kit_file_count: aiContext.counts.brand_kit_files,
  };

  const promptData = sanitizeForPrompt({
    repo,
    ai_context: {
      counts: aiContext.counts,
      sources: aiContext.summary_text,
    },
    app: {
      projects: app.result.projects?.data?.projects || [],
      operations_ui: {
        sections: expected.operations_sections,
        subtabs: {
          Tasks: ['Overview', 'Decisions', 'My Tasks', 'Schedule', 'Research', 'Changelog', 'Done'],
          Students: ['Overview', 'Group Goal', 'Student List', 'Student Profile', 'Goal Board', 'Tablet Access', 'Questions', 'Portal Links'],
          Content: ['Library', 'Selected', 'Repurpose', 'Newsletter', 'Prompts', 'Bundles'],
          Contacts: ['People', 'Parents', 'Interested Parents', 'Providers', 'Communications', 'Students', 'Intake', 'Needs Follow-up', 'Tags'],
          Accounting: ['Overview', 'Payments', 'Needs Attention', 'Paid', 'Needs Signup', 'Exceptions'],
          Team: ['Tickets & Messages'],
        },
        actions: ['Open card/details', 'Add comment', 'Mark done', 'Open Ticket', 'Select content', 'View/Edit Prompt', 'Make output', 'Mark follow-up', 'Open student', 'Review payment status'],
      },
      tasks: {
        active_codex: codexTasks.map(compactTask),
        active_total: activeTasks.length,
        stage_counts: expected.task_stage_counts,
      },
      students: students.map(compactStudent),
      torah: {
        group_percentage: expected.torah_group_percentage,
        students: torahStudents.map((student) => ({
          name: student.name,
          total_trip_progress_percentage: student.total_trip_progress_percentage ?? student.progress_percentage ?? null,
        })),
      },
      content: {
        transcript_jobs: transcriptJobs.map(compactContentJob),
        prompts: contentPrompts.map((prompt) => ({
          platform: prompt.platform,
          label: prompt.label || prompt.title || prompt.platform,
          version: prompt.version,
          examples: Array.isArray(prompt.examples) ? prompt.examples.length : 0,
        })),
        bundles: app.result.contentBundles?.data?.bundles || [],
      },
      devices: devices.map((device) => ({
        id: device.id,
        student_name: device.student?.name || device.student_name || null,
        device_name: device.device_name,
        status: device.status,
      })),
      agent_fleet: app.result.agentFleet?.data || {},
      accounting: {
        pending_payment_students: expected.pending_payment_students,
        sample_payments: payments.slice(0, 12).map(compactPayment),
      },
    },
    drive,
  });

  let openaiAnswer = null;
  try {
    openaiAnswer = await askAiProvider(config, expected, promptData);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const normalizeArray = (value) => Array.isArray(value) ? value.map(String).sort() : [];
  checks.push({
    name: 'repo context files readable',
    ok: ['AGENTS.md', 'MEMORY.md', 'TASKS.md', 'SYSTEM-STATE.md'].every((file) => repo.files[file]?.chars > 100),
    detail: `${Object.values(repo.files).filter((file) => file.exists).length} files found`,
  });
  checks.push({
    name: 'brand kit context readable',
    ok: aiContext.counts.brand_kit_files >= 6,
    detail: `${aiContext.counts.brand_kit_files} brand kit files`,
  });
  checks.push({
    name: 'transcript exports readable',
    ok: repo.transcript_export_count > 0 && repo.files['content-memory/transcripts/index.md']?.chars > 100,
    detail: `${repo.transcript_export_count} transcript files`,
  });
  checks.push({
    name: 'protected app APIs readable',
    ok: ['projects', 'tasks', 'students', 'torah', 'contentJobs', 'signups', 'paymentIntake', 'payments'].every((key) => app.result[key]?.ok),
    detail: `${Object.keys(app.result).length} endpoints returned`,
  });
  checks.push({
    name: 'Operations system endpoints readable',
    ok: ['agentFleet', 'accountability', 'devices', 'deviceAccessRules', 'contentPrompts', 'contentBundles'].every((key) => app.result[key]?.ok),
    detail: `${expected.operations_sections.length} sections, ${expected.content_prompt_count} prompts, ${expected.device_count} devices`,
  });
  checks.push({
    name: 'Drive folders readable',
    ok: Boolean(drive.ok && drive.folders?.rawIntake?.name && drive.folders?.processedRecordings?.name),
    detail: drive.ok ? `${Object.keys(drive.folders || {}).length} folders read as ${drive.account}` : drive.error,
  });
  checks.push({
    name: 'AI returned expected active Codex task count',
    ok: Number(openaiAnswer?.active_codex_count) === expected.active_codex_count,
    detail: `expected ${expected.active_codex_count}, got ${openaiAnswer?.active_codex_count}`,
  });
  checks.push({
    name: 'AI returned expected student names',
    ok: expected.student_names.length > 0 && expected.student_names.every((name) => normalizeArray(openaiAnswer?.student_names).includes(String(name))),
    detail: `${expected.student_names.length} expected student(s)`,
  });
  checks.push({
    name: 'AI returned expected transcript job count',
    ok: Number(openaiAnswer?.transcript_job_count) === expected.transcript_job_count,
    detail: `expected ${expected.transcript_job_count}, got ${openaiAnswer?.transcript_job_count}`,
  });
  checks.push({
    name: 'AI returned Operations section map',
    ok: expected.operations_sections.every((section) => normalizeArray(openaiAnswer?.operations_sections).includes(section)),
    detail: `${expected.operations_sections.join(', ')}`,
  });
  checks.push({
    name: 'AI returned live dashboard counts',
    ok:
      Number(openaiAnswer?.content_prompt_count) === expected.content_prompt_count &&
      Number(openaiAnswer?.device_count) === expected.device_count,
    detail: `prompts ${expected.content_prompt_count}, devices ${expected.device_count}`,
  });
  checks.push({
    name: 'AI returned Drive raw folder name',
    ok: String(openaiAnswer?.drive_raw_folder_name || '') === String(expected.drive_raw_folder_name || ''),
    detail: expected.drive_raw_folder_name || 'missing',
  });
  checks.push({
    name: 'AI returned brand kit file count',
    ok: Number(openaiAnswer?.brand_kit_file_count) === expected.brand_kit_file_count,
    detail: `expected ${expected.brand_kit_file_count}, got ${openaiAnswer?.brand_kit_file_count}`,
  });

  const liveCounts = {
    tasks_total: tasks.length,
    active_tasks: activeTasks.length,
    active_codex_tasks: codexTasks.length,
    students: students.length,
    devices: devices.length,
    transcript_jobs: transcriptJobs.length,
    content_prompts: contentPrompts.length,
    pending_payment_students: expected.pending_payment_students.length,
    drive_folders: Object.keys(drive.folders || {}).length,
    brand_kit_files: aiContext.counts.brand_kit_files,
  };

  const report = {
    generated_at: new Date().toISOString(),
    ok: checks.every((check) => check.ok) && errors.length === 0,
    ai_provider: config.aiProviderLabel,
    ai_model: config.aiModel,
    checks,
    errors,
    expected,
    openai_answer: openaiAnswer,
    live_counts: liveCounts,
    report_paths: {},
  };

  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.generated_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-openai-sidekick-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-openai-sidekick-smoke.md`);
  report.report_paths = {
    json: relative(jsonPath),
    markdown: relative(mdPath),
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, renderMarkdown(report));

  const summary = [
    `AI sidekick smoke: ${report.ok ? 'PASS' : 'FAIL'}`,
    '',
    `Repo files: ${Object.values(repo.files).filter((file) => file.exists).length} readable`,
    `Brand kit files: ${aiContext.counts.brand_kit_files} readable`,
    `Transcript exports: ${repo.transcript_export_count}`,
    `Protected app endpoints: ${Object.keys(app.result).length} readable`,
    `Operations sections: ${expected.operations_sections.join(', ')}`,
    `Content prompts: ${expected.content_prompt_count}`,
    `Devices: ${expected.device_count}`,
    `Drive folders: ${Object.keys(drive.folders || {}).length} readable`,
    `AI provider: ${config.aiProviderLabel} (${config.aiModel})`,
    '',
    `Active Codex tasks: ${expected.active_codex_count} (${expected.active_codex_ids.join(', ') || 'none'})`,
    `Students: ${expected.student_names.join(', ') || 'none'}`,
    `Transcript jobs: ${expected.transcript_job_count}`,
    `Pending payment names detected: ${expected.pending_payment_students.join(', ') || 'none'}`,
    `Drive raw folder: ${expected.drive_raw_folder_name || 'missing'}`,
    '',
    `Report: ${report.report_paths.markdown}`,
  ].join('\n');

  if (process.argv.includes('--telegram')) {
    await sendTelegram(config, summary);
  }

  console.log(summary);
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
