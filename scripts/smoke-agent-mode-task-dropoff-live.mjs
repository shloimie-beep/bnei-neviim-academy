#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, resolveOpsCredentials } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const appUrl = String(process.env.BNA_APP_URL || loadSmokeEnv({ root: repoRoot }).BNA_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseSessionCookie(response) {
  return String(response.headers.get('set-cookie') || '').split(';')[0] || '';
}

async function request(method, endpoint, {
  cookie = '',
  body = null,
  expectStatus = 200,
  acceptStatuses = null,
} = {}) {
  const response = await fetch(`${appUrl}${endpoint}`, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const statuses = acceptStatuses || [expectStatus];
  if (!statuses.includes(response.status)) {
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

async function main() {
  const env = loadSmokeEnv({ root: repoRoot });
  const credentials = resolveOpsCredentials({ env, cwd: repoRoot });
  if (!credentials.username || !credentials.password) {
    throw new Error('OPS credentials unavailable from env or Railway auth fallback.');
  }

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    auth_source: credentials.source,
    steps: [],
    samples: {},
  };
  let cookie = '';

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
      console.error(`FAIL ${name}: ${message}`);
      throw error;
    }
  }

  async function ensureOwnerTaskReview(task) {
    if (task?.agent_mode_review?.prompt_text) return task;
    const { data } = await request('PATCH', `/api/bna/tasks/${task.id}`, {
      cookie,
      body: {
        title: 'Issue #24 owner verification smoke task',
        display_title: 'Issue #24 owner verification smoke task',
        notes: 'Live verification sample for Issue #24 hybrid owner-task workflow.',
        task_kind: 'task',
        item_type: 'task',
        decision_required: false,
        stage: 'assigned',
        assigned_to: 'Shloimie',
        waiting_on: null,
        agent_status: 'none',
        next_action: 'Copy the review prompt, complete the live UI check, and save PASS evidence.',
        next_action_label: 'Copy review prompt',
      },
    });
    return data.task;
  }

  try {
    await step('operations owner login', async () => {
      const { response, data } = await request('POST', '/api/operations/login', {
        body: { username: credentials.username, password: credentials.password },
      });
      cookie = parseSessionCookie(response);
      assert(data.success === true, 'Operations login did not return success.');
      assert(cookie.startsWith('bna_ops_session='), 'Operations login did not set bna_ops_session.');
      return { user: data.user, role: data.role, scoped: data.scope?.type || null };
    });

    await step('owner session readback', async () => {
      const { data } = await request('GET', '/api/bna/auth/me', { cookie });
      assert(data.success === true, 'Owner /me readback failed.');
      return { user: data.user, role: data.role, views: data.allowedViews };
    });

    const ownerTask = await step('sample owner task has Agent Mode panel data', async () => {
      const { data } = await request('POST', '/api/bna/tasks/create-from-text', {
        cookie,
        body: {
          title: 'Issue #24 owner verification smoke task',
          raw_text: 'Owner must open the live Operations task card, copy the review prompt, perform the browser/UI verification, and save PASS evidence.',
          notes: 'Live verification sample for Issue #24 hybrid Agent Mode owner-task workflow.',
          source: 'manual',
          source_channel: 'codex_live_smoke',
          source_ref: 'issue24-agent-mode-smoke-owner-task-20260626',
          created_by: 'codex_live_smoke',
          assigned_to: 'Shloimie',
          category: 'operations',
          urgency: 'low',
          stage: 'assigned',
          project_key: 'bna',
          suppress_agent_inference: true,
          dedupe: true,
          next_action: 'Copy the Agent Mode prompt, complete the live UI check, and save PASS evidence.',
        },
      });
      const task = await ensureOwnerTaskReview(data.task);
      assert(task?.id, 'Owner task create/readback did not return id.');
      assert(task.agent_mode_review?.prompt_text, 'Owner task did not expose Agent Mode prompt text.');
      assert(task.agent_mode_review?.exact_dropoff_url?.includes(`task_id=${task.id}`), 'Owner task drop-off URL is not task-scoped.');
      report.samples.owner_task_id = task.id;
      return {
        task_id: task.id,
        prompt_key: task.agent_mode_review.prompt_key,
        status: task.agent_mode_review.status,
        owner_clarity: task.agent_mode_review.owner_clarity?.key || null,
      };
    });

    const ownerCopy = await step('copy prompt records prompt_copied on owner task', async () => {
      const { data } = await request('POST', `/api/bna/tasks/${ownerTask.task_id}/agent-mode/copy-prompt`, { cookie, body: {} });
      assert(data.success === true, 'Copy prompt did not return success.');
      assert(
        data.agent_mode_review?.status === 'prompt_copied' ||
          (data.agent_mode_review?.status === 'completed' && data.agent_mode_review?.result_ref),
        `Expected prompt_copied or existing completed result, got ${data.agent_mode_review?.status}`
      );
      assert(data.agent_mode_review?.prompt_copied_at, 'Copy prompt did not persist prompt_copied_at.');
      assert(data.prompt_text?.includes(`Prompt key: ${data.agent_mode_review.prompt_key}`), 'Copy prompt did not return prompt text.');
      return {
        task_id: ownerTask.task_id,
        prompt_key: data.agent_mode_review.prompt_key,
        status: data.agent_mode_review.status,
        copied_at: data.agent_mode_review.prompt_copied_at,
        idempotency_key: data.agent_mode_review.idempotency_key,
      };
    });

    const ownerPass = await step('saving PASS attaches AGR evidence to owner task', async () => {
      const { data } = await request('POST', '/api/bna/agent-review/results', {
        cookie,
        body: {
          task_id: ownerTask.task_id,
          context_key: 'owner_task_decision',
          prompt_key: ownerCopy.prompt_key,
          requirement_id: `TASK-${ownerTask.task_id}`,
          idempotency_key: ownerCopy.idempotency_key,
          status: 'pass',
          severity: 'none',
          report_text: 'PASS: live smoke copied the task Agent Mode prompt and saved task-scoped AGR evidence through the typed Agent Review Result API.',
          routes_visited: [`/operations?view=tasks&task=${ownerTask.task_id}`, `/operations/agent-review/dropoff?task_id=${ownerTask.task_id}`],
          last_completed_route: `/operations/agent-review/dropoff?task_id=${ownerTask.task_id}`,
          last_completed_role_context: 'owner_task_decision',
          evidence: ['Live task PASS result saved by scripts/smoke-agent-mode-task-dropoff-live.mjs.'],
        },
      });
      assert(data.success === true, 'PASS result did not return success.');
      assert(data.result_ref, 'PASS result did not return result_ref.');
      assert(data.task_agent_mode_review?.status === 'completed', `Expected completed, got ${data.task_agent_mode_review?.status}`);
      assert(data.task_agent_mode_review?.result_ref === data.result_ref, 'Task review did not link PASS result_ref.');
      report.samples.owner_task_result_ref = data.result_ref;
      return {
        result_ref: data.result_ref,
        task_id: data.task_id,
        status: data.task_agent_mode_review.status,
        readback_url: data.readback_url,
      };
    });

    await step('owner task result is visible from original task and readback API', async () => {
      const [{ data: taskData }, { data: resultData }] = await Promise.all([
        request('GET', `/api/bna/tasks/${ownerTask.task_id}`, { cookie }),
        request('GET', ownerPass.readback_url, { cookie }),
      ]);
      assert(taskData.task?.agent_mode_review?.result_ref === ownerPass.result_ref, 'Original task card does not expose saved AGR result_ref.');
      assert(taskData.task?.agent_mode_review?.result_url?.includes(ownerPass.result_ref), 'Original task card does not expose saved result URL.');
      assert(resultData.result?.result_ref === ownerPass.result_ref, 'AGR readback API did not return the saved PASS result.');
      return {
        task_id: ownerTask.task_id,
        result_ref: ownerPass.result_ref,
        result_url: taskData.task.agent_mode_review.result_url,
      };
    });

    const decision = await step('sample Decision has Agent Mode panel data', async () => {
      const { data } = await request('POST', '/api/bna/tasks/create-from-text', {
        cookie,
        body: {
          title: 'Issue #24 Agent Mode smoke decision',
          raw_text: 'Decision: Shloimie must choose whether the live owner audit is PASS or BLOCKED after reading the result.',
          notes: 'Live verification sample for Issue #24 hybrid Agent Mode Decision workflow.',
          source: 'manual',
          source_channel: 'codex_live_smoke',
          source_ref: 'issue24-agent-mode-smoke-decision-20260626',
          created_by: 'codex_live_smoke',
          assigned_to: 'Shloimie',
          decision_owner: 'Shloimie',
          item_type: 'decision',
          decision_required: true,
          category: 'operations',
          urgency: 'low',
          stage: 'needs_decision',
          project_key: 'bna',
          suppress_agent_inference: true,
          dedupe: true,
          decision_prompt: 'Choose whether the live Agent Mode owner audit should pass or remain blocked.',
          next_action: 'Copy the Agent Mode prompt and save a BLOCKED result to prove repair/rerun behavior.',
        },
      });
      const task = data.task;
      assert(task?.id, 'Decision create/readback did not return id.');
      assert(task.item_type === 'decision' || task.decision_required === true, 'Sample card is not a Decision.');
      assert(task.agent_mode_review?.prompt_text, 'Decision did not expose Agent Mode prompt text.');
      assert(task.agent_mode_review?.owner_clarity?.key === 'owner_must_decide', 'Decision owner clarity is not owner_must_decide.');
      report.samples.decision_id = task.id;
      return {
        task_id: task.id,
        prompt_key: task.agent_mode_review.prompt_key,
        status: task.agent_mode_review.status,
        owner_clarity: task.agent_mode_review.owner_clarity?.key || null,
      };
    });

    const decisionCopy = await step('copy prompt records prompt_copied on Decision', async () => {
      const { data } = await request('POST', `/api/bna/tasks/${decision.task_id}/agent-mode/copy-prompt`, { cookie, body: {} });
      assert(
        data.agent_mode_review?.status === 'prompt_copied' ||
          (data.agent_mode_review?.status === 'rerun_required' && data.agent_mode_review?.result_ref),
        `Expected prompt_copied or existing rerun_required result, got ${data.agent_mode_review?.status}`
      );
      assert(data.agent_mode_review?.prompt_copied_at, 'Copy prompt did not persist prompt_copied_at.');
      return {
        task_id: decision.task_id,
        prompt_key: data.agent_mode_review.prompt_key,
        status: data.agent_mode_review.status,
        idempotency_key: data.agent_mode_review.idempotency_key,
      };
    });

    const decisionBlocked = await step('saving BLOCKED creates repair and rerun prompt for Decision', async () => {
      const { data } = await request('POST', '/api/bna/agent-review/results', {
        cookie,
        body: {
          task_id: decision.task_id,
          decision_id: decision.task_id,
          context_key: 'owner_task_decision',
          prompt_key: decisionCopy.prompt_key,
          requirement_id: `DECISION-${decision.task_id}`,
          idempotency_key: decisionCopy.idempotency_key,
          status: 'blocked',
          severity: 'medium',
          report_text: 'BLOCKED: live smoke intentionally saved a blocked Decision result to verify repair task linkage and rerun prompt generation.',
          blocker: 'Live smoke intentional blocker for Issue #24 repair/rerun evidence.',
          suggested_correction: 'Confirm the repair task stays linked to this Decision and rerun the same prompt after applying the repair.',
          routes_visited: [`/operations?view=tasks&task=${decision.task_id}`, `/operations/agent-review/dropoff?task_id=${decision.task_id}`],
          last_completed_route: `/operations/agent-review/dropoff?task_id=${decision.task_id}`,
          last_completed_role_context: 'owner_task_decision',
          evidence: ['Live Decision BLOCKED result saved by scripts/smoke-agent-mode-task-dropoff-live.mjs.'],
        },
      });
      assert(data.success === true, 'BLOCKED result did not return success.');
      assert(data.result_ref, 'BLOCKED result did not return result_ref.');
      assert(data.task_agent_mode_review?.status === 'rerun_required', `Expected rerun_required, got ${data.task_agent_mode_review?.status}`);
      assert(data.repair_url || data.task_agent_mode_review?.repair_task_id, 'BLOCKED result did not create/link a repair task.');
      assert(data.rerun_prompt?.includes('Rerun'), 'BLOCKED result did not return rerun prompt.');
      report.samples.decision_result_ref = data.result_ref;
      report.samples.repair_task_id = data.task_agent_mode_review?.repair_task_id || null;
      return {
        result_ref: data.result_ref,
        repair_url: data.repair_url,
        repair_task_id: data.task_agent_mode_review?.repair_task_id || null,
        rerun_prompt_present: Boolean(data.rerun_prompt),
        readback_url: data.readback_url,
      };
    });

    await step('Decision result is visible from original card and readback API', async () => {
      const [{ data: taskData }, { data: resultData }] = await Promise.all([
        request('GET', `/api/bna/tasks/${decision.task_id}`, { cookie }),
        request('GET', decisionBlocked.readback_url, { cookie }),
      ]);
      assert(taskData.task?.agent_mode_review?.result_ref === decisionBlocked.result_ref, 'Original Decision card does not expose saved AGR result_ref.');
      assert(taskData.task?.agent_mode_review?.rerun_prompt, 'Original Decision card does not expose rerun prompt.');
      assert(taskData.linked_tasks?.some((task) => Number(task.id) === Number(decisionBlocked.repair_task_id)), 'Original Decision card does not expose linked repair task.');
      assert(resultData.result?.result_ref === decisionBlocked.result_ref, 'AGR readback API did not return the saved BLOCKED result.');
      return {
        decision_id: decision.task_id,
        result_ref: decisionBlocked.result_ref,
        repair_task_id: decisionBlocked.repair_task_id,
        rerun_prompt_visible: Boolean(taskData.task.agent_mode_review.rerun_prompt),
      };
    });

    await step('task-specific drop-off context returns exact URLs and trace status', async () => {
      const { data } = await request('GET', `/api/bna/agent-review/dropoff-context?task_id=${ownerTask.task_id}`, { cookie });
      assert(data.success === true, 'Task drop-off context did not return success.');
      assert(data.prompt?.key === ownerCopy.prompt_key, 'Drop-off context prompt key mismatch.');
      assert(data.prompt?.dropoff_url?.includes(`task_id=${ownerTask.task_id}`), 'Drop-off context URL is not task-scoped.');
      assert(data.newest_recording_trace?.status, 'Drop-off context did not include newest recording trace status.');
      return {
        task_id: ownerTask.task_id,
        prompt_key: data.prompt.key,
        dropoff_url: data.prompt.dropoff_url,
        newest_recording_trace_status: data.newest_recording_trace.status,
      };
    });
  } finally {
    fs.mkdirSync(reportDir, { recursive: true });
    const stamp = report.started_at.replace(/[:.]/g, '-');
    const jsonPath = path.join(reportDir, `${stamp}-agent-mode-task-dropoff-live.json`);
    const mdPath = path.join(reportDir, `${stamp}-agent-mode-task-dropoff-live.md`);
    const failed = report.steps.filter((item) => !item.ok);
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(mdPath, [
      `# Agent Mode Task/Decision Drop-off Live Smoke - ${report.started_at}`,
      '',
      `App: ${report.app_url}`,
      `Result: ${failed.length ? 'failed' : 'passed'}`,
      '',
      '## Samples',
      `- Owner task: ${report.samples.owner_task_id || 'n/a'}`,
      `- Owner PASS result: ${report.samples.owner_task_result_ref || 'n/a'}`,
      `- Decision: ${report.samples.decision_id || 'n/a'}`,
      `- Decision BLOCKED result: ${report.samples.decision_result_ref || 'n/a'}`,
      `- Repair task: ${report.samples.repair_task_id || 'n/a'}`,
      '',
      '## Steps',
      ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
      '',
    ].join('\n'));
    console.log(`Report: ${path.relative(repoRoot, mdPath).replace(/\\/g, '/')}`);
    if (failed.length) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
