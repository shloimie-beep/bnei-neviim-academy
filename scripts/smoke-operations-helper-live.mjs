#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
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

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-operations-helper-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-operations-helper-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Operations Helper Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const detail = step.error ? ` - ${step.error}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${detail}`;
    }),
    '',
    '## Helper Summary',
    `- helper_name: ${report.helper_summary?.helper_name || 'n/a'}`,
    `- allowed_tools_checked: ${(report.helper_summary?.allowed_tools_checked || []).join(', ') || 'none'}`,
    `- plans_checked: ${(report.helper_summary?.plans_checked || []).join(', ') || 'none'}`,
    `- actions_executed: ${report.helper_summary?.actions_executed || 0}`,
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data };
}

async function main() {
  const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required');
  const auth = basicAuthHeader(username, password);

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    helper_summary: {
      helper_name: '',
      allowed_tools_checked: [],
      plans_checked: [],
      actions_executed: 0,
    },
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.steps.push({
        name,
        ok: false,
        duration_ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  const pageContext = {
    route: '/operations',
    page: 'operations',
    view: 'tasks',
    workspace: {
      workspaceKey: 'bna',
      projectKey: 'bna',
      displayName: 'Bnei Neviim Academy',
      workspaceType: 'school',
      roleLabel: 'BNA Admin',
    },
    actor: {
      role: 'admin',
      allowedViews: ['tasks', 'content', 'calendar', 'admin'],
    },
    visibleSection: 'tasks',
    selectedRecord: { type: 'task', id: '321' },
    availableClientActions: [
      'open_operations_view',
      'update_task',
      'mark_task_done',
      'create_support_ticket',
    ],
  };

  async function plan(message, overridePageContext = pageContext) {
    const { data } = await requestJson(`${appUrl}/api/bna/helper/plan`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        workspace_key: 'bna',
        project_key: 'bna',
        pageContext: overridePageContext,
        auto_execute_safe: false,
        client_request_id: `helper_live_smoke_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      }),
    });
    assert(data.success === true, `${message}: plan response did not return success`);
    assert(['planned', 'confirmation_required'].includes(data.status), `${message}: expected planned or confirmation_required status, got ${data.status}`);
    assert(Array.isArray(data.actions) && data.actions.length >= 1, `${message}: expected at least one action`);
    const action = data.actions[0];
    assert(['planned', 'needs_confirmation'].includes(action.status), `${message}: action should remain planned or need confirmation`);
    assert(action.result === null || action.result === undefined, `${message}: action unexpectedly has a result`);
    report.helper_summary.plans_checked.push(message);
    return action;
  }

  try {
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      assert(data.database === 'connected', 'Database is not connected');
      return { status: data.status, database: data.database };
    });

    await step('helper context exposes branded name and required tools', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/helper/context?workspace_key=bna&project_key=bna`, {
        headers: { Authorization: auth },
      });
      assert(data.success === true, 'Helper context did not return success');
      assert(data.helperName && data.helperName !== 'BNA Helper', `Helper name is too generic: ${data.helperName}`);
      const allowed = Array.isArray(data.allowedTools) ? data.allowedTools : [];
      const requiredTools = ['open_operations_view', 'create_support_ticket', 'update_task', 'mark_task_done'];
      for (const tool of requiredTools) {
        assert(allowed.includes(tool), `Allowed tools did not include ${tool}`);
      }
      report.helper_summary.helper_name = data.helperName;
      report.helper_summary.allowed_tools_checked = requiredTools;
      return { helperName: data.helperName, allowedTools: requiredTools };
    });

    await step('helper plans task navigation without executing', async () => {
      const action = await plan('go back to task 123');
      assert(action.tool === 'open_operations_view', `Expected open_operations_view, got ${action.tool}`);
      assert(action.args_preview?.task_id === 123, `Expected task_id 123, got ${action.args_preview?.task_id}`);
      return { tool: action.tool, args_preview: action.args_preview };
    });

    await step('helper plans lane navigation without executing', async () => {
      const decisionAction = await plan('decisions');
      assert(decisionAction.tool === 'open_operations_view', `Expected open_operations_view, got ${decisionAction.tool}`);
      assert(decisionAction.args_preview?.section === 'decisions', `Expected decisions section, got ${decisionAction.args_preview?.section}`);
      const calendarAction = await plan('open the calendar schedule week');
      assert(calendarAction.tool === 'open_operations_view', `Expected open_operations_view, got ${calendarAction.tool}`);
      assert(calendarAction.args_preview?.section === 'schedule', `Expected schedule section, got ${calendarAction.args_preview?.section}`);
      assert(calendarAction.args_preview?.calendar_mode === 'week', `Expected week calendar mode, got ${calendarAction.args_preview?.calendar_mode}`);
      return {
        decisions: decisionAction.args_preview,
        calendar: calendarAction.args_preview,
      };
    });

    await step('helper preserves current settings calendar classroom deep link', async () => {
      const settingsPageContext = {
        ...pageContext,
        route: '/operations?view=settings&section=calendar_classroom&workspace=bna',
        view: 'settings',
        visibleSection: 'settings',
        selectedRecord: null,
        query: {
          view: 'settings',
          section: 'calendar_classroom',
          workspace: 'bna',
        },
      };
      const currentAction = await plan('open a link to this page', settingsPageContext);
      assert(currentAction.tool === 'open_operations_view', `Expected open_operations_view, got ${currentAction.tool}`);
      assert(currentAction.args_preview?.view === 'settings', `Expected settings view, got ${currentAction.args_preview?.view}`);
      assert(currentAction.args_preview?.section === 'calendar_classroom', `Expected calendar_classroom section, got ${currentAction.args_preview?.section}`);
      assert(currentAction.args_preview?.workspace_key === 'bna', `Expected bna workspace, got ${currentAction.args_preview?.workspace_key}`);

      const settingsAction = await plan('open settings calendar classroom');
      assert(settingsAction.tool === 'open_operations_view', `Expected open_operations_view, got ${settingsAction.tool}`);
      assert(settingsAction.args_preview?.view === 'settings', `Expected settings view, got ${settingsAction.args_preview?.view}`);
      assert(settingsAction.args_preview?.section === 'calendar_classroom', `Expected calendar_classroom section, got ${settingsAction.args_preview?.section}`);
      assert(settingsAction.args_preview?.workspace_key === 'bna', `Expected bna workspace, got ${settingsAction.args_preview?.workspace_key}`);

      return {
        current_page: currentAction.args_preview,
        explicit_settings: settingsAction.args_preview,
      };
    });

    await step('helper plans task edit and completion without executing', async () => {
      const editAction = await plan('edit task 44 title to Fix the parent reset copy');
      assert(editAction.tool === 'update_task', `Expected update_task, got ${editAction.tool}`);
      assert(editAction.args_preview?.task_id === 44, `Expected task_id 44, got ${editAction.args_preview?.task_id}`);
      assert(editAction.args_preview?.title === 'Fix the parent reset copy', `Unexpected edit title: ${editAction.args_preview?.title}`);
      const doneAction = await plan('mark this done');
      assert(doneAction.tool === 'mark_task_done', `Expected mark_task_done, got ${doneAction.tool}`);
      assert(doneAction.args_preview?.task_id === 321, `Expected selected task_id 321, got ${doneAction.args_preview?.task_id}`);
      return {
        edit: editAction.args_preview,
        done: doneAction.args_preview,
      };
    });

    await step('helper plans support ticket without executing', async () => {
      const action = await plan('report problem the task page button looks wrong');
      assert(action.tool === 'create_support_ticket', `Expected create_support_ticket, got ${action.tool}`);
      assert(action.args_preview?.category === 'link', `Expected link category, got ${action.args_preview?.category}`);
      assert(action.args_preview?.severity === 'normal', `Expected normal severity, got ${action.args_preview?.severity}`);
      return { tool: action.tool, args_preview: action.args_preview };
    });
  } finally {
    report.finished_at = new Date().toISOString();
    report.success = report.steps.every((item) => item.ok);
    report.report_files = writeReports(report);
    console.log(`Report: ${report.report_files.markdown}`);
  }

  if (!report.success) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
