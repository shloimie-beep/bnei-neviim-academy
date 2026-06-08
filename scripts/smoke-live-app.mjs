#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretsDir = path.join(repoRoot, '.secrets');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

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
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function loadConfig() {
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  return {
    appUrl: env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org',
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
    requireDrive: process.argv.includes('--require-drive'),
    requireGhl: process.argv.includes('--require-ghl'),
    googleRefreshToken: env.GOOGLE_REFRESH_TOKEN || readSecret('google-refresh-token.txt'),
    googleRedirectUri: env.GOOGLE_REDIRECT_URI || '',
    googleDrivePipelineConfig: env.GOOGLE_DRIVE_PIPELINE_CONFIG
      ? JSON.parse(env.GOOGLE_DRIVE_PIPELINE_CONFIG)
      : readJsonIfExists(path.join(secretsDir, 'google-drive-pipeline.json')) || null,
  };
}

function basicAuth(config) {
  return `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`;
}

function absoluteUrl(config, endpoint) {
  return `${config.appUrl.replace(/\/+$/, '')}${endpoint}`;
}

function parseSetCookie(response) {
  const raw = response.headers.get('set-cookie') || '';
  return raw.split(';')[0] || '';
}

async function request(config, method, endpoint, {
  body = null,
  auth = true,
  cookie = '',
  expectStatus = 200,
  acceptStatuses = null,
} = {}) {
  const headers = {};
  if (auth) headers.Authorization = basicAuth(config);
  if (cookie) headers.Cookie = cookie;
  if (body) headers['Content-Type'] = 'application/json';

  const response = await fetch(absoluteUrl(config, endpoint), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const expected = Array.isArray(acceptStatuses) ? acceptStatuses : [expectStatus];
  if (!expected.includes(response.status)) {
    throw new Error(`${method} ${endpoint} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { text };
    }
  }
  return { response, data, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countBy(items, key) {
  return (items || []).reduce((counts, item) => {
    const value = item?.[key] === undefined || item?.[key] === null ? 'unknown' : String(item[key]);
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function summarizeTorahPublic(data) {
  const students = Array.isArray(data.students) ? data.students : [];
  const percentages = students.map((student) => Number(student.percentage || 0));
  const average = percentages.length
    ? Math.round((percentages.reduce((sum, value) => sum + Math.min(100, Math.max(0, value)), 0) / percentages.length) * 10) / 10
    : 0;
  const groupPercentage = Number(data.group?.percentage ?? data.group?.groupPercentage ?? data.group?.group_percentage ?? 0);
  const tripUnlocked = Boolean(data.group?.trip_unlocked ?? data.group?.tripUnlocked ?? false);
  assert(Math.abs(groupPercentage - average) <= 0.51, `Torah group percentage ${groupPercentage} does not match student average ${average}`);
  assert(tripUnlocked === percentages.every((value) => value >= 100), 'Torah trip unlock flag does not match student totals');
  return {
    group_percentage: groupPercentage,
    trip_unlocked: tripUnlocked,
    student_count: students.length,
    students: students.map((student) => `${student.name}:${student.percentage}`),
  };
}

function loadGoogleAuth(config) {
  const clientPath = path.join(secretsDir, 'google-oauth-client.json');
  const parsed = readJsonIfExists(clientPath);
  const client = parsed?.web || parsed?.installed;
  if (!client?.client_id || !client?.client_secret || !config.googleRefreshToken) return null;
  const auth = new google.auth.OAuth2(
    client.client_id,
    client.client_secret,
    config.googleRedirectUri || client.redirect_uris?.[0],
  );
  auth.setCredentials({ refresh_token: config.googleRefreshToken });
  return auth;
}

async function collectWebsiteImageLane(config) {
  const pipeline = config.googleDrivePipelineConfig;
  const folderId = pipeline?.websiteMomentsIntake || pipeline?.simplifiedFolders?.websiteImages || pipeline?.websiteImages;
  const auth = loadGoogleAuth(config);
  if (!folderId || !auth) {
    const skipped = {
      skipped: true,
      reason: !folderId ? 'Website Images folder id missing' : 'Google OAuth credentials missing',
    };
    if (config.requireDrive) throw new Error(skipped.reason);
    return skipped;
  }

  const drive = google.drive({ version: 'v3', auth });
  const [about, folder, files] = await Promise.all([
    drive.about.get({ fields: 'user(emailAddress)' }),
    drive.files.get({
      fileId: folderId,
      supportsAllDrives: true,
      fields: 'id,name,webViewLink',
    }),
    drive.files.list({
      q: [
        `'${String(folderId).replace(/'/g, "\\'")}' in parents`,
        'trashed=false',
        "mimeType contains 'image/'",
      ].join(' and '),
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)',
      orderBy: 'createdTime desc',
      pageSize: 5,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }),
  ]);

  return {
    account: about.data.user?.emailAddress || null,
    folder_id: folderId,
    folder_name: folder.data.name,
    folder_link: folder.data.webViewLink || null,
    pending_image_count_sample: files.data.files?.length || 0,
    newest_images: (files.data.files || []).map((file) => ({
      name: file.name,
      mimeType: file.mimeType,
      createdTime: file.createdTime,
    })),
  };
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-live-app-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-live-app-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Live App Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const suffix = step.error ? ` - ${step.error}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${suffix}`;
    }),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const config = loadConfig();
  if (!config.opsUsername || !config.opsPassword) {
    throw new Error('OPS_USERNAME and OPS_PASSWORD are required for live app smoke tests');
  }

  const report = {
    started_at: new Date().toISOString(),
    app_url: config.appUrl,
    steps: [],
  };
  let sessionCookie = '';

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      const entry = {
        name,
        ok: true,
        duration_ms: Date.now() - started,
        details,
      };
      report.steps.push(entry);
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      const entry = {
        name,
        ok: false,
        duration_ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      };
      report.steps.push(entry);
      console.error(`FAIL ${name}: ${entry.error}`);
      throw error;
    }
  }

  try {
    await step('public health endpoint', async () => {
      const { data } = await request(config, 'GET', '/api/health', { auth: false });
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      assert(data.database === 'connected', 'Database is not connected');
      return { status: data.status, database: data.database, ghl: data.ghl };
    });

    await step('operations login session', async () => {
      const { response, data } = await request(config, 'POST', '/api/operations/login', {
        auth: false,
        body: {
          username: config.opsUsername,
          password: config.opsPassword,
        },
      });
      sessionCookie = parseSetCookie(response);
      assert(data.success === true, 'Login did not return success');
      assert(sessionCookie.includes('bna_ops_session='), 'Login did not set session cookie');
      return { user: data.user, role: data.role, scoped: data.scope?.type || null };
    });

    await step('session auth /me', async () => {
      const { data } = await request(config, 'GET', '/api/bna/auth/me', {
        auth: false,
        cookie: sessionCookie,
      });
      assert(data.success === true, '/me did not return success');
      return { user: data.user, role: data.role, views: data.allowedViews };
    });

    await step('protected API reads', async () => {
      const endpointMap = {
        projects: '/api/bna/projects',
        tasks: '/api/bna/tasks',
        students: '/api/bna/students',
        contentJobs: '/api/bna/content-jobs',
        contentBundles: '/api/bna/content-bundles',
        signups: '/api/bna/signups',
        paymentIntake: '/api/bna/payment-intake',
        payments: '/api/bna/payments',
        paymentReminders: '/api/bna/payment-reminders/due',
        greenInvoiceWebhooks: '/api/bna/green-invoice/webhooks',
        agentFleet: '/api/bna/agent-fleet/status',
      };
      const results = {};
      for (const [key, endpoint] of Object.entries(endpointMap)) {
        const { data } = await request(config, 'GET', endpoint);
        results[key] = data;
      }
      return {
        projects: results.projects.projects?.length || 0,
        tasks: results.tasks.tasks?.length || 0,
        students: results.students.students?.length || 0,
        content_jobs: results.contentJobs.jobs?.length || results.contentJobs.contentJobs?.length || 0,
        content_bundles: results.contentBundles.bundles?.length || 0,
        signups: results.signups.signups?.length || 0,
        payment_intake: results.paymentIntake.items?.length || results.paymentIntake.intake?.length || 0,
        payments: results.payments.payments?.length || 0,
        reminders_due: results.paymentReminders.candidates?.length || 0,
        green_invoice_webhooks: results.greenInvoiceWebhooks.webhooks?.length || 0,
        agent_fleet: results.agentFleet.fleet?.status || 'unknown',
        active_machine_queue: results.agentFleet.queue?.pending ?? null,
      };
    });

    await step('Torah public cumulative progress', async () => {
      const { data } = await request(config, 'GET', '/api/torah-learning/public-summary', { auth: false });
      return summarizeTorahPublic(data);
    });

    await step('Torah admin cumulative fields', async () => {
      const { data } = await request(config, 'GET', '/api/bna/torah-learning');
      const students = Array.isArray(data.students) ? data.students : [];
      for (const student of students) {
        const tripProgress = Number(student.total_trip_progress_percentage ?? student.percentage ?? 0);
        const totalCompleted = Number(student.total_completed_units ?? 0);
        const totalRequired = Number(student.total_required_units ?? 30);
        if (tripProgress >= 100) assert(totalCompleted >= totalRequired, `${student.name} has 100% trip progress without total units complete`);
      }
      return {
        date: data.date,
        group_percentage: data.group?.percentage ?? null,
        trip_unlocked: Boolean(data.group?.trip_unlocked),
        students: students.map((student) => ({
          name: student.name,
          daily_completion_percentage: student.entry?.daily_completion_percentage ?? student.daily_completion_percentage ?? null,
          total_trip_progress_percentage: student.total_trip_progress_percentage ?? student.percentage ?? null,
        })),
      };
    });

    await step('task create comment delete', async () => {
      const title = `Smoke test task ${Date.now()}`;
      const created = await request(config, 'POST', '/api/bna/tasks', {
        body: {
          title,
          notes: 'Temporary task created by npm run app:smoke and deleted in the same smoke run.',
          source: 'manual',
          created_by: 'live-smoke',
          assigned_to: 'Codex',
          category: 'operations',
          urgency: 'low',
        },
      });
      const task = created.data.task;
      assert(task?.id, 'Task create did not return an id');
      await request(config, 'POST', `/api/bna/tasks/${task.id}/comments`, {
        body: {
          body: 'Smoke test comment before cleanup.',
          author: 'live-smoke',
          source: 'system',
        },
      });
      await request(config, 'DELETE', `/api/bna/tasks/${task.id}`);
      return { created_task_id: task.id, deleted: true };
    });

    await step('signup submit dry-run validation', async () => {
      const stamp = Date.now();
      const signerEmail = `smoke+${stamp}@example.com`;
      const signedAt = new Date().toISOString();
      const agreementTypes = [
        'tuition_agreement',
        'parent_handbook',
        'student_code_of_conduct',
        'safety_acknowledgment_waiver',
        'registration_intake_form',
        'parent_agreement_signature_page',
      ];
      const validBody = {
        parent_name: 'Smoke Parent',
        parent_email: signerEmail,
        parent_phone: '0500000000',
        parent2_name: 'Smoke Parent Two',
        parent2_phone: '0500000001',
        student_name: 'Smoke Student',
        student_age: 12,
        student_grade: '7',
        payment_method: 'bank_transfer',
        form_language: 'en',
        waiver_accepted: true,
        waiver_version: 'smoke-test',
        tuition_agreement_accepted: true,
        tuition_agreement_version: 'smoke-test',
        tuition_agreement_signer_name: 'Smoke Parent',
        tuition_agreement_signer_email: signerEmail,
        tuition_agreement_client_signed_at: signedAt,
        registration_package_accepted: true,
        registration_package_version: 'smoke-test',
        registration_package_signer_name: 'Smoke Parent',
        registration_package_signer_email: signerEmail,
        registration_package_client_signed_at: signedAt,
        agreement_signatures: agreementTypes.map((agreementType) => ({
          agreement_type: agreementType,
          agreement_version: 'smoke-test',
          signer_name: 'Smoke Parent',
          signer_email: signerEmail,
          client_signed_at: signedAt,
          language_viewed: 'en',
          accepted: true,
        })),
      };
      const { data } = await request(config, 'POST', '/api/submit?dry_run=true', {
        body: validBody,
      });
      assert(data.success === true && data.dry_run === true, 'Signup dry run did not validate successfully');
      assert(data.paymentMethod === 'bank_transfer', 'Signup dry run did not preserve bank transfer payment method');
      assert(data.normalized?.agreement_signatures?.length === 6, 'Signup dry run did not validate all six agreement signatures');

      const missingSignatureBody = {
        ...validBody,
        agreement_signatures: validBody.agreement_signatures.filter((signature) => signature.agreement_type !== 'parent_handbook'),
      };
      const missing = await request(config, 'POST', '/api/submit?dry_run=true', {
        body: missingSignatureBody,
        expectStatus: 400,
      });
      assert(/parent_handbook/.test(missing.data.error || ''), 'Missing signup document signature did not return the expected validation error');

      const mismatchSignatureBody = {
        ...validBody,
        agreement_signatures: validBody.agreement_signatures.map((signature, index) => index === 0
          ? { ...signature, signer_name: 'Different Parent' }
          : signature),
      };
      const mismatch = await request(config, 'POST', '/api/submit?dry_run=true', {
        body: mismatchSignatureBody,
        expectStatus: 400,
      });
      assert(/Parent 1 name/.test(mismatch.data.error || ''), 'Mismatched signup document signer did not return the expected validation error');
      return {
        validation: data.validation,
        paymentMethod: data.paymentMethod,
        agreementSignatures: data.normalized.agreement_signatures.length,
        missingSignatureRejected: true,
        signerMismatchRejected: true,
        wrote_records: false,
      };
    });

    await step('GHL social diagnostics', async () => {
      const { response, data } = await request(config, 'GET', '/api/bna/ghl-social/diagnostics', {
        acceptStatuses: config.requireGhl ? [200] : [200, 401, 403, 503],
      });
      if (response.status !== 200) {
        return {
          configured: Boolean(data.configured),
          blocked: true,
          status: response.status,
          error: data.error || null,
          hint: data.hint || 'GHL credentials/scopes need account-side attention.',
        };
      }
      assert(data.configured === true, 'GHL is not configured');
      return {
        configured: true,
        blocked: false,
        facebook_accounts: data.facebook_accounts?.length || 0,
        other_accounts: data.other_accounts?.length || 0,
        posts_read_check: data.posts_read_check?.ok || data.posts_read_check?.status || null,
      };
    });

    await step('Drive website image lane', async () => collectWebsiteImageLane(config));
  } finally {
    report.finished_at = new Date().toISOString();
    report.success = report.steps.every((item) => item.ok);
    report.counts = countBy(report.steps, 'ok');
    report.report_files = writeReports(report);
    console.log(`Report: ${report.report_files.markdown}`);
  }

  if (!report.success) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
