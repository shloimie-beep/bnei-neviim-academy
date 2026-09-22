const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const SERVER_PATH = path.join(WORKSPACE_ROOT, 'server.js');

function parseJson(value, fallback = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function createFakeExpress() {
  const routes = [];
  const app = {
    routes,
    disable() {},
    set() {},
    use() {},
    listen() {
      return { close() {} };
    },
  };
  for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
    app[method] = (routePath, ...handlers) => {
      routes.push({ method, routePath, handlers });
      return app;
    };
  }
  const middleware = () => (_req, _res, next) => next && next();
  function express() {
    return app;
  }
  express.json = middleware;
  express.urlencoded = middleware;
  express.raw = middleware;
  express.static = middleware;
  return { express, routes };
}

function routeMatches(routePath, expected) {
  return Array.isArray(routePath) ? routePath.includes(expected) : routePath === expected;
}

function now() {
  return '2026-06-19T11:00:00.000Z';
}

function createFakePostgres() {
  const db = {
    projects: [
      {
        id: 1,
        project_key: 'bna',
        name: 'Bnei Neviim Academy',
        short_name: 'BNA',
      },
    ],
    profiles: [
      {
        id: 1,
        agent_key: 'browser_qa',
        display_name: 'Browser QA',
        agent_type: 'browser_qa',
        capabilities: ['browser_read', 'browser_safe_interaction', 'submit_verification'],
        active: true,
      },
    ],
    templates: [
      {
        id: 1,
        template_key: 'browser_qa_agent_mode',
        version: 1,
        agent_type: 'browser_qa',
        purpose: 'Browser QA route verification',
        template_text: [
          'Agent Run: {{run_id}}',
          'Task: {{task_ref}}',
          'Workspace: {{workspace}}',
          'Target: {{target_url}}',
          'Criteria:',
          '{{acceptance_criteria}}',
          'Allowed:',
          '{{allowed_actions}}',
          'Forbidden:',
          '{{forbidden_actions}}',
          'Open the Agent Run URL: {{agent_run_url}}',
          'Do not include credentials.',
        ].join('\n'),
        active: true,
      },
    ],
    tasks: [
      {
        id: 101,
        title: 'Verify Agent Control demo task',
        display_title: 'Verify Agent Control demo task',
        notes: 'Safe local demo task for Agent Control API readback.',
        stage: 'assigned',
        category: 'operations',
        urgency: 'today',
        source: 'test',
        project_id: 1,
        workspace_id: 1,
        ai_parsed: {
          acceptance_criteria: [
            { id: 'AC-1', label: 'Agent Run page loads', required: true },
            { id: 'AC-2', label: 'Evidence is attached before seal', required: true },
          ],
        },
        implementation_status: 'complete',
        verification_status: 'needed',
        required_verification_mode: 'mixed',
        decision_required: false,
        active_agent_run_id: null,
        created_at: now(),
        updated_at: now(),
      },
    ],
    agentRuns: [],
    events: [],
    artifacts: [],
    taskEvents: [],
    taskActivity: [],
    taskComments: [],
    notifications: [],
    queries: [],
    nextRunId: 1,
    nextEventId: 1,
    nextArtifactId: 1,
    nextTaskId: 500,
    nextTaskEventId: 1,
    nextTaskActivityId: 1,
    nextCommentId: 1,
    nextNotificationId: 1,
  };

  function taskById(id) {
    return db.tasks.find((task) => Number(task.id) === Number(id)) || null;
  }

  function projectForTask(task) {
    return db.projects.find((project) => Number(project.id) === Number(task?.project_id)) || {};
  }

  function profileById(id) {
    return db.profiles.find((profile) => Number(profile.id) === Number(id)) || null;
  }

  function joinedTask(task) {
    if (!task) return null;
    const project = projectForTask(task);
    return {
      ...task,
      project_key: project.project_key || null,
      project_name: project.name || null,
      project_short_name: project.short_name || null,
    };
  }

  function joinedRun(run) {
    if (!run) return null;
    const task = taskById(run.task_id);
    const project = projectForTask(task) || db.projects.find((candidate) => Number(candidate.id) === Number(run.project_id)) || {};
    const profile = profileById(run.agent_profile_id) || {};
    return {
      ...run,
      task_title: task?.title || null,
      task_display_title: task?.display_title || null,
      task_stage: task?.stage || null,
      task_implementation_status: task?.implementation_status || null,
      task_verification_status: task?.verification_status || null,
      task_required_verification_mode: task?.required_verification_mode || null,
      project_key: project.project_key || null,
      project_name: project.name || null,
      project_short_name: project.short_name || null,
      agent_key: profile.agent_key || null,
      agent_display_name: profile.display_name || null,
      agent_type: profile.agent_type || null,
      capabilities: profile.capabilities || [],
      artifact_count: db.artifacts.filter((artifact) => Number(artifact.run_id) === Number(run.id)).length,
      event_count: db.events.filter((event) => Number(event.run_id) === Number(run.id)).length,
    };
  }

  function updateRun(id, patch) {
    const run = db.agentRuns.find((candidate) => Number(candidate.id) === Number(id));
    if (run) Object.assign(run, patch, { updated_at: now() });
    return run;
  }

  function updateTask(id, patch) {
    const task = taskById(id);
    if (task) Object.assign(task, patch, { updated_at: now(), last_activity_at: now() });
    return task;
  }

  db.query = async function query(sql, params = []) {
    const compactSql = String(sql || '').replace(/\s+/g, ' ').trim();
    db.queries.push({ sql: compactSql, params });

    if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(compactSql)) return { rows: [] };

    if (/SELECT t\.\*, p\.project_key/i.test(compactSql)) {
      return { rows: [joinedTask(taskById(params[0]))].filter(Boolean) };
    }

    if (/SELECT run_key FROM bna_agent_runs/i.test(compactSql)) {
      const [taskId, runType, verificationMode] = params;
      const active = db.agentRuns
        .filter((run) =>
          Number(run.task_id) === Number(taskId) &&
          run.run_type === runType &&
          run.verification_mode === verificationMode &&
          ['draft', 'ready', 'claimed', 'running', 'waiting_operator', 'submitted'].includes(run.status)
        )
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
      return { rows: active ? [{ run_key: active.run_key }] : [] };
    }

    if (/SELECT \* FROM bna_agent_profiles WHERE id = \$1/i.test(compactSql)) {
      return { rows: [profileById(params[0])].filter(Boolean) };
    }

    if (/SELECT \* FROM bna_agent_profiles WHERE agent_key = \$1/i.test(compactSql)) {
      return { rows: db.profiles.filter((profile) => profile.agent_key === params[0] && profile.active) };
    }

    if (/FROM bna_agent_prompt_templates/i.test(compactSql)) {
      return { rows: db.templates.filter((template) => template.active && template.agent_type === params[0]).slice(0, 1) };
    }

    if (/INSERT INTO bna_agent_runs/i.test(compactSql)) {
      const row = {
        id: db.nextRunId++,
        run_key: params[0],
        task_id: params[1],
        workspace_id: params[2],
        project_id: params[3],
        batch_id: params[4],
        agent_profile_id: params[5],
        run_type: params[6],
        verification_mode: params[7],
        status: 'ready',
        priority: params[8],
        prompt_version: params[9],
        prompt_text: params[10],
        target_url: params[11],
        acceptance_criteria: params[12],
        allowed_actions: params[13],
        forbidden_actions: params[14],
        context_snapshot: params[15],
        result_payload: {},
        result_summary: null,
        failure_reason: null,
        blocker: null,
        operator_decision_id: null,
        created_by: params[16],
        created_at: now(),
        updated_at: now(),
      };
      db.agentRuns.push(row);
      return { rows: [row] };
    }

    if (/UPDATE bna_tasks SET required_verification_mode = \$1/i.test(compactSql)) {
      const task = updateTask(params[3], {
        required_verification_mode: params[0],
        verification_status: 'ready',
        implementation_status: params[1] || taskById(params[3])?.implementation_status || 'not_started',
        active_agent_run_id: params[2],
        next_action: 'Launch Browser QA agent run',
      });
      return { rows: task ? [task] : [] };
    }

    if (/INSERT INTO bna_task_events/i.test(compactSql)) {
      const row = {
        id: db.nextTaskEventId++,
        task_id: params[0],
        event_type: params[1],
        actor: params[2],
        summary: params[3],
        metadata: parseJson(params[4], {}),
        created_at: now(),
      };
      db.taskEvents.push(row);
      return { rows: [row] };
    }

    if (/INSERT INTO bna_task_activity/i.test(compactSql)) {
      const row = {
        id: db.nextTaskActivityId++,
        task_id: params[0],
        actor: params[1],
        activity_type: params[2],
        summary: params[3],
        metadata: parseJson(params[4], {}),
        created_at: now(),
      };
      db.taskActivity.push(row);
      return { rows: [row] };
    }

    if (/INSERT INTO bna_agent_run_events/i.test(compactSql)) {
      const row = {
        id: db.nextEventId++,
        run_id: params[0],
        event_type: params[1],
        actor_type: params[2],
        actor_id: params[3],
        actor_name: params[4],
        body: params[5],
        metadata: parseJson(params[6], {}),
        created_at: now(),
      };
      db.events.push(row);
      return { rows: [row] };
    }

    if (/INSERT INTO bna_in_app_notifications/i.test(compactSql)) {
      const existing = db.notifications.find((notification) => notification.notification_key === params[0]);
      const sourceContext = parseJson(params[13], {});
      if (existing) {
        Object.assign(existing, {
          project_id: params[1] || existing.project_id,
          workspace_key: params[2],
          recipient_label: params[3],
          recipient_role: params[4],
          event_type: params[5],
          title: params[6],
          body: params[7],
          priority: params[8],
          related_type: params[9],
          related_id: params[10],
          source_table: params[11],
          source_id: params[12],
          source_context: { ...parseJson(existing.source_context, {}), ...sourceContext },
          delivery_state: 'in_app_only',
          no_send: true,
          external_write_performed: false,
          updated_at: now(),
        });
        return { rows: [existing] };
      }
      const row = {
        id: db.nextNotificationId++,
        notification_key: params[0],
        project_id: params[1],
        workspace_key: params[2],
        recipient_label: params[3],
        recipient_role: params[4],
        event_type: params[5],
        title: params[6],
        body: params[7],
        priority: params[8],
        status: 'unread',
        related_type: params[9],
        related_id: params[10],
        source_table: params[11],
        source_id: params[12],
        source_context: sourceContext,
        delivery_state: 'in_app_only',
        no_send: true,
        external_write_performed: false,
        created_by: params[14],
        created_at: now(),
        updated_at: now(),
      };
      db.notifications.push(row);
      return { rows: [row] };
    }

    if (/FROM bna_agent_runs r/i.test(compactSql) && /WHERE r\.run_key = \$1/i.test(compactSql)) {
      return { rows: [joinedRun(db.agentRuns.find((run) => run.run_key === params[0]))].filter(Boolean) };
    }

    if (/FROM bna_agent_runs r/i.test(compactSql)) {
      return { rows: db.agentRuns.map(joinedRun) };
    }

    if (/SELECT \* FROM bna_agent_run_artifacts/i.test(compactSql)) {
      return { rows: db.artifacts.filter((artifact) => Number(artifact.run_id) === Number(params[0])) };
    }

    if (/SELECT \* FROM bna_agent_run_events/i.test(compactSql)) {
      return { rows: db.events.filter((event) => Number(event.run_id) === Number(params[0])) };
    }

    if (/UPDATE bna_agent_runs SET status = 'claimed'/i.test(compactSql)) {
      const run = updateRun(params[1], {
        status: 'claimed',
        claimed_by: params[0],
        claimed_at: now(),
      });
      return { rows: run ? [run] : [] };
    }

    if (/UPDATE bna_tasks SET verification_status = 'running'/i.test(compactSql)) {
      const task = updateTask(params[1], {
        verification_status: 'running',
        active_agent_run_id: params[0],
      });
      return { rows: task ? [task] : [] };
    }

    if (/UPDATE bna_agent_runs SET status = \$1,\s+started_at/i.test(compactSql)) {
      const run = updateRun(params[1], {
        status: params[0],
        started_at: now(),
        last_progress_at: now(),
      });
      return { rows: run ? [run] : [] };
    }

    if (/UPDATE bna_agent_runs SET updated_at = NOW\(\) WHERE id = \$1/i.test(compactSql)) {
      const run = updateRun(params[0], {});
      return { rows: run ? [run] : [] };
    }

    if (/INSERT INTO bna_agent_run_artifacts/i.test(compactSql)) {
      const row = {
        id: db.nextArtifactId++,
        run_id: params[0],
        artifact_type: params[1],
        title: params[2],
        path: params[3],
        url: params[4],
        metadata: parseJson(params[5], {}),
        redaction_status: params[6],
        created_by: params[7],
        created_at: now(),
      };
      db.artifacts.push(row);
      return { rows: [row] };
    }

    if (/UPDATE bna_agent_runs SET status = 'submitted'/i.test(compactSql)) {
      const run = updateRun(params[5], {
        status: 'submitted',
        submitted_at: now(),
        result_summary: params[0],
        failure_reason: params[1] === 'fail' ? params[2] : db.agentRuns.find((candidate) => Number(candidate.id) === Number(params[5]))?.failure_reason,
        blocker: ['blocked', 'needs_operator'].includes(params[1]) ? params[3] : db.agentRuns.find((candidate) => Number(candidate.id) === Number(params[5]))?.blocker,
        result_payload: params[4],
      });
      return { rows: run ? [run] : [] };
    }

    if (/UPDATE bna_tasks SET verification_status = 'submitted'/i.test(compactSql)) {
      const task = updateTask(params[0], { verification_status: 'submitted' });
      return { rows: task ? [task] : [] };
    }

    if (/SELECT \* FROM bna_tasks WHERE parent_task_id = \$1/i.test(compactSql)) {
      const existing = db.tasks.find((task) =>
        Number(task.parent_task_id) === Number(params[0]) &&
        task.item_type === 'decision' &&
        parseJson(task.ai_parsed, {}).agent_run_key === params[1]
      );
      return { rows: existing ? [existing] : [] };
    }

    if (/INSERT INTO bna_tasks \( title, display_title, notes/i.test(compactSql)) {
      const row = {
        id: db.nextTaskId++,
        title: params[0],
        display_title: params[0],
        notes: params[1],
        stage: 'needs_decision',
        category: 'operations',
        urgency: 'today',
        source: 'system',
        created_by: params[2],
        assigned_to: 'Shloimie',
        parent_task_id: params[3],
        project_id: params[4],
        workspace_id: params[5],
        item_type: 'decision',
        task_kind: 'decision',
        decision_required: true,
        decision_owner: 'Shloimie',
        decision_status: 'created',
        decision_prompt: params[6],
        decision_options_json: parseJson(params[7], []),
        next_action: 'Resolve the operator action and resume the agent run',
        why_exists: 'Agent verification cannot continue without a human or external action.',
        ai_parsed: params[8],
        created_at: now(),
        updated_at: now(),
      };
      db.tasks.push(row);
      return { rows: [row] };
    }

    if (/UPDATE bna_agent_runs SET status = \$1,\s+sealed_at/i.test(compactSql)) {
      const run = updateRun(params[5], {
        status: params[0],
        sealed_at: now(),
        result_summary: params[1] || db.agentRuns.find((candidate) => Number(candidate.id) === Number(params[5]))?.result_summary,
        result_payload: params[2],
        operator_decision_id: params[3] || db.agentRuns.find((candidate) => Number(candidate.id) === Number(params[5]))?.operator_decision_id,
        blocker: params[4] || db.agentRuns.find((candidate) => Number(candidate.id) === Number(params[5]))?.blocker,
      });
      return { rows: run ? [run] : [] };
    }

    if (/UPDATE bna_tasks SET verification_status = \$1,\s+decision_required = TRUE/i.test(compactSql)) {
      const task = updateTask(params[3], {
        verification_status: params[0],
        decision_required: true,
        blocked_reason: params[1],
        blocked_at: now(),
        next_action: 'Resolve operator blocker and resume the agent run',
        active_agent_run_id: params[2],
      });
      return { rows: task ? [task] : [] };
    }

    if (/INSERT INTO bna_task_comments/i.test(compactSql)) {
      const row = {
        id: db.nextCommentId++,
        task_id: params[0],
        author: params[1],
        body: params[2],
        visibility: 'internal',
        source: 'system',
        source_context: parseJson(params[3], {}),
        created_at: now(),
      };
      db.taskComments.push(row);
      return { rows: [row] };
    }

    return { rows: [] };
  };

  db.connect = async function connect() {
    return {
      query: db.query,
      release() {},
    };
  };

  return db;
}

function loadServerWithFakes() {
  const fakeDb = createFakePostgres();
  const { express, routes } = createFakeExpress();
  const serverRequire = Module.createRequire(SERVER_PATH);
  const fakeProcess = Object.create(process);
  fakeProcess.env = {
    ...process.env,
    BNA_SKIP_ENV_LOCAL: '1',
    DATABASE_URL: 'postgres://local-agent-control-readback/bna',
    OPS_USERNAME: 'admin@example.test',
    OPS_PASSWORD: 'x',
    OPENAI_API_KEY: '',
    KIMI_API_KEY: '',
    TELEGRAM_BOT_TOKEN: '',
  };
  fakeProcess.exit = (code) => {
    throw new Error(`server.js attempted to exit during test load with code ${code}`);
  };
  const localRequire = (request) => {
    if (request === 'express') return express;
    if (request === 'pg') {
      return {
        Pool: function Pool() {
          return fakeDb;
        },
      };
    }
    return serverRequire(request);
  };
  const moduleContext = { exports: {} };
  const context = {
    ...global,
    AbortController,
    Buffer,
    console,
    exports: moduleContext.exports,
    module: moduleContext,
    process: fakeProcess,
    require: localRequire,
    __dirname: WORKSPACE_ROOT,
    __filename: SERVER_PATH,
  };
  const source = fs
    .readFileSync(SERVER_PATH, 'utf8')
    .replace(/\ninitDb\(\);\n/, '\n// initDb skipped by agent-control-api-readback.test.js\n');
  vm.runInNewContext(source, context, {
    filename: SERVER_PATH,
    displayErrors: true,
  });
  return { fakeDb, routes };
}

function findRoute(routes, method, routePath) {
  const route = routes.find((candidate) => candidate.method === method && routeMatches(candidate.routePath, routePath));
  assert.ok(route, `${method.toUpperCase()} ${routePath} route should be registered`);
  return route;
}

function jsonResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function superAdminRequest({ body = {}, params = {}, query = {}, path: routePath = '/api/bna/agent-runs' } = {}) {
  return {
    body,
    params,
    query,
    headers: { accept: 'application/json', host: 'localhost:3000' },
    method: 'POST',
    originalUrl: routePath,
    path: routePath,
    protocol: 'http',
    secure: false,
    get(name) {
      return this.headers[String(name || '').toLowerCase()] || '';
    },
    opsUser: 'admin@example.test',
    opsIdentity: {
      username: 'admin@example.test',
      role: 'super_admin',
      displayName: 'Super Admin',
      scope: { type: 'all' },
      allowedViews: ['agents', 'tasks'],
    },
  };
}

function scopedOwnerRequest({ body = {}, params = {}, query = {}, path: routePath = '/api/bna/agent-runs' } = {}) {
  return {
    ...superAdminRequest({ body, params, query, path: routePath }),
    opsUser: 'rabbi-owner@example.test',
    opsIdentity: {
      username: 'rabbi-owner@example.test',
      role: 'project_owner',
      displayName: 'Rabbi Elie Scheller',
      scope: { type: 'project', projectKey: 'one_time_mishnah_class' },
      allowedViews: ['agents', 'tasks'],
    },
  };
}

async function invokeRouteHandler(route, req) {
  const res = jsonResponse();
  const handler = route.handlers[route.handlers.length - 1];
  await handler(req, res);
  return res;
}

test('Agent Control API lifecycle creates a run, evidence, blocked seal, and one operator Decision locally', async () => {
  const { fakeDb, routes } = loadServerWithFakes();
  const createRoute = findRoute(routes, 'post', '/api/bna/tasks/:taskId/agent-runs');
  const getRoute = findRoute(routes, 'get', '/api/bna/agent-runs/:runKey');
  const claimRoute = findRoute(routes, 'post', '/api/bna/agent-runs/:runKey/claim');
  const progressRoute = findRoute(routes, 'post', '/api/bna/agent-runs/:runKey/progress');
  const artifactRoute = findRoute(routes, 'post', '/api/bna/agent-runs/:runKey/artifacts');
  const submitRoute = findRoute(routes, 'post', '/api/bna/agent-runs/:runKey/submit');
  const sealRoute = findRoute(routes, 'post', '/api/bna/agent-runs/:runKey/seal');

  const createRes = await invokeRouteHandler(createRoute, superAdminRequest({
    path: '/api/bna/tasks/101/agent-runs',
    params: { taskId: '101' },
    body: {
      verification_mode: 'mixed',
      agent_key: 'browser_qa',
      priority: 'today',
      acceptance_criteria: [
        { id: 'AC-1', label: 'Agent Run page loads', required: true },
        { id: 'AC-2', label: 'Evidence is attached before seal', required: true },
      ],
      allowed_actions: ['read-only navigation', 'attach local smoke report'],
      forbidden_actions: ['production writes', 'credentials'],
    },
  }));
  assert.equal(createRes.statusCode, 200);
  assert.equal(createRes.body.success, true);
  assert.equal(createRes.body.run.status, 'ready');
  assert.match(createRes.body.run.prompt_text, /Agent Run:/);
  assert.match(createRes.body.run.prompt_text, /Open the Agent Run URL/);
  assert.doesNotMatch(createRes.body.run.prompt_text, /OPS_PASSWORD|OPENAI_API_KEY/);
  assert.equal(fakeDb.tasks.find((task) => task.id === 101).verification_status, 'ready');
  assert.equal(fakeDb.tasks.find((task) => task.id === 101).active_agent_run_id, createRes.body.run.id);
  assert.equal(fakeDb.notifications.length, 1);
  assert.equal(fakeDb.notifications[0].event_type, 'agent_run_ready');
  assert.equal(fakeDb.notifications[0].workspace_key, 'bna');
  assert.equal(fakeDb.notifications[0].recipient_label, 'Browser QA');
  assert.equal(fakeDb.notifications[0].delivery_state, 'in_app_only');
  assert.equal(fakeDb.notifications[0].no_send, true);
  assert.equal(fakeDb.notifications[0].external_write_performed, false);

  const runKey = createRes.body.run.run_key;
  const detailRes = await invokeRouteHandler(getRoute, superAdminRequest({
    path: `/api/bna/agent-runs/${runKey}`,
    params: { runKey },
  }));
  assert.equal(detailRes.statusCode, 200);
  assert.equal(detailRes.body.run.run_key, runKey);
  assert.equal(detailRes.body.events.length, 2);
  assert.equal(detailRes.body.artifacts.length, 0);

  const claimRes = await invokeRouteHandler(claimRoute, superAdminRequest({
    path: `/api/bna/agent-runs/${runKey}/claim`,
    params: { runKey },
    body: { claimed_by: 'Browser QA local smoke' },
  }));
  assert.equal(claimRes.statusCode, 200);
  assert.equal(claimRes.body.run.status, 'claimed');
  assert.equal(fakeDb.tasks.find((task) => task.id === 101).verification_status, 'running');

  const progressRes = await invokeRouteHandler(progressRoute, superAdminRequest({
    path: `/api/bna/agent-runs/${runKey}/progress`,
    params: { runKey },
    body: {
      event_type: 'progress',
      summary: 'Loaded the Agent Run page and checked the scoped task.',
      metadata: { route: '/operations/agents/runs/demo' },
    },
  }));
  assert.equal(progressRes.statusCode, 200);
  assert.equal(progressRes.body.run.status, 'running');
  assert.equal(fakeDb.notifications.length, 1, 'progress updates should not create alert spam');

  const artifactRes = await invokeRouteHandler(artifactRoute, superAdminRequest({
    path: `/api/bna/agent-runs/${runKey}/artifacts`,
    params: { runKey },
    body: {
      artifact_type: 'report',
      title: 'Local Agent Control smoke report',
      path: 'ops/playwright-smokes/local-agent-control/report.md',
      metadata: { redacted: true },
    },
  }));
  assert.equal(artifactRes.statusCode, 200);
  assert.equal(artifactRes.body.artifact.title, 'Local Agent Control smoke report');
  assert.equal(artifactRes.body.run.artifact_count, 1);

  const submitRes = await invokeRouteHandler(submitRoute, superAdminRequest({
    path: `/api/bna/agent-runs/${runKey}/submit`,
    params: { runKey },
    body: {
      outcome: 'blocked',
      summary: 'Blocked until the operator approves the external-account login step.',
      blocker: 'Operator must approve browser takeover for the external account.',
      criterion_results: [
        { id: 'AC-1', status: 'pass', note: 'Run page loaded in the local route smoke.' },
        { id: 'AC-2', status: 'blocked', note: 'External login requires operator approval.' },
      ],
      routes_tested: ['/operations/agents/runs/demo'],
      viewports_tested: ['1440x900'],
    },
  }));
  assert.equal(submitRes.statusCode, 200);
  assert.equal(submitRes.body.run.status, 'submitted');
  assert.equal(fakeDb.tasks.find((task) => task.id === 101).verification_status, 'submitted');

  const sealRes = await invokeRouteHandler(sealRoute, superAdminRequest({
    path: `/api/bna/agent-runs/${runKey}/seal`,
    params: { runKey },
    body: {
      outcome: 'blocked',
      summary: 'Sealed blocked with one operator Decision.',
      blocker: 'Approve Browser QA login takeover for the external account.',
      criterion_results: [
        { id: 'AC-1', status: 'pass', note: 'Run page loaded in the local route smoke.' },
        { id: 'AC-2', status: 'blocked', note: 'External login requires operator approval.' },
      ],
    },
  }));
  assert.equal(sealRes.statusCode, 200);
  assert.equal(sealRes.body.run.status, 'blocked');
  assert.equal(sealRes.body.decision.item_type, 'decision');
  assert.equal(sealRes.body.decision.parent_task_id, 101);
  assert.match(sealRes.body.decision.notes, /do not share passwords, API keys, refresh tokens/i);
  assert.equal(fakeDb.tasks.find((task) => task.id === 101).verification_status, 'blocked');
  assert.equal(fakeDb.tasks.find((task) => task.id === 101).decision_required, true);
  assert.equal(fakeDb.taskComments.length, 1);
  assert.ok(fakeDb.events.some((event) => event.event_type === 'blocked'));
  assert.ok(fakeDb.taskEvents.some((event) => event.event_type === 'agent_run_blocked'));
  assert.equal(fakeDb.tasks.filter((task) => task.item_type === 'decision').length, 1);
  assert.equal(fakeDb.notifications.length, 2);
  const blockedNotification = fakeDb.notifications.find((notification) => notification.event_type === 'agent_run_blocked');
  assert.ok(blockedNotification, 'blocked seal should create one private in-app alert');
  assert.equal(blockedNotification.priority, 'high');
  assert.equal(blockedNotification.source_table, 'bna_agent_runs');
  assert.equal(blockedNotification.source_context.no_send, true);
  assert.equal(blockedNotification.source_context.external_write_performed, false);
  assert.equal(blockedNotification.source_context.decision_task_id, sealRes.body.decision.id);
  assert.ok(fakeDb.notifications.every((notification) => notification.no_send === true));
  assert.ok(fakeDb.notifications.every((notification) => notification.external_write_performed === false));
});

test('Agent Control lifecycle routes reject scoped non-Super Admin identities before writes', async () => {
  const { fakeDb, routes } = loadServerWithFakes();
  const createRoute = findRoute(routes, 'post', '/api/bna/tasks/:taskId/agent-runs');
  const listRoute = findRoute(routes, 'get', '/api/bna/agent-runs');

  const createRes = await invokeRouteHandler(createRoute, scopedOwnerRequest({
    path: '/api/bna/tasks/101/agent-runs',
    params: { taskId: '101' },
    body: { verification_mode: 'mixed' },
  }));
  assert.equal(createRes.statusCode, 403);
  assert.match(createRes.body.error, /Super Admin only/);
  assert.equal(fakeDb.agentRuns.length, 0);

  const listRes = await invokeRouteHandler(listRoute, scopedOwnerRequest({
    path: '/api/bna/agent-runs',
    query: {},
  }));
  assert.equal(listRes.statusCode, 403);
  assert.match(listRes.body.error, /Super Admin only/);
  assert.equal(fakeDb.events.length, 0);
});
