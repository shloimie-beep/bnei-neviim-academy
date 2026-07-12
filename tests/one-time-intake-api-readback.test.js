const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const SERVER_PATH = path.join(WORKSPACE_ROOT, 'server.js');
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';

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
  const staticCalls = [];
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
  express.static = (root, options = {}) => {
    staticCalls.push({ root, options });
    return middleware();
  };
  return { express, routes, staticCalls };
}

function routeMatches(routePath, expected) {
  return Array.isArray(routePath) ? routePath.includes(expected) : routePath === expected;
}

function createFakePostgres() {
  const db = {
    rawIntakes: [],
    parseRuns: [],
    parseItems: [],
    reviews: [],
    queries: [],
    nextRunId: 1,
    nextItemId: 1,
    nextReviewId: 1,
    async query(sql, params = []) {
      const compactSql = String(sql || '').replace(/\s+/g, ' ').trim();
      this.queries.push({ sql: compactSql, params });

      if (/SELECT stable_id FROM bna_raw_intake/i.test(compactSql)) {
        const prefix = String(params[0] || '').replace(/%$/, '');
        const rows = this.rawIntakes
          .filter((row) => row.stable_id.startsWith(prefix))
          .sort((a, b) => b.stable_id.localeCompare(a.stable_id))
          .slice(0, 1)
          .map((row) => ({ stable_id: row.stable_id }));
        return { rows };
      }

      if (/INSERT INTO bna_raw_intake/i.test(compactSql)) {
        const row = {
          id: crypto.randomUUID(),
          stable_id: params[0],
          source_channel: params[1],
          source_message_id: params[2],
          source_user: params[3],
          raw_text: params[4],
          transcript_text: params[5],
          media_url: params[6],
          intake_type: params[7],
          parse_status: 'raw',
          parsed_payload: {},
          created_requirement_ids: [],
          created_task_ids: [],
          created_decision_ids: [],
          created_question_ids: [],
          requirement_register_path: params[8],
          metadata: parseJson(params[9], {}),
          error: null,
          created_at: '2026-06-19T10:00:00.000Z',
          updated_at: '2026-06-19T10:00:00.000Z',
          parsed_at: null,
          archived_at: null,
        };
        this.rawIntakes.push(row);
        return { rows: [row] };
      }

      if (/INSERT INTO bna_intake_parse_runs/i.test(compactSql)) {
        const existing = this.parseRuns.find((row) =>
          row.input_hash === params[4] &&
          row.parser_version === params[5] &&
          row.source_type === params[0] &&
          row.source_id_key === params[2]
        );
        const row = existing || {
          id: this.nextRunId++,
          created_at: '2026-06-19T10:00:01.000Z',
        };
        Object.assign(row, {
          source_type: params[0],
          source_id: params[1],
          source_id_key: params[2],
          source_table: params[3],
          input_hash: params[4],
          parser_version: params[5],
          raw_input: params[6],
          language_json: parseJson(params[7], {}),
          summary: params[8],
          parse_json: parseJson(params[9], {}),
          dry_run: Boolean(params[10]),
          status: existing?.status === 'filed' ? existing.status : params[11],
          created_by: params[12],
          metadata: { ...parseJson(existing?.metadata, {}), ...parseJson(params[13], {}) },
          updated_at: '2026-06-19T10:00:01.000Z',
        });
        if (!existing) this.parseRuns.push(row);
        return { rows: [row] };
      }

      if (/INSERT INTO bna_intake_parse_items/i.test(compactSql)) {
        const parseRunId = params[0];
        const itemKey = params[1];
        let row = this.parseItems.find((item) => item.parse_run_id === parseRunId && item.item_key === itemKey);
        if (!row) {
          row = { id: this.nextItemId++, created_at: '2026-06-19T10:00:02.000Z' };
          this.parseItems.push(row);
        }
        Object.assign(row, {
          parse_run_id: parseRunId,
          item_key: itemKey,
          item_type: params[2],
          title: params[3],
          summary: params[4],
          payload: parseJson(params[5], {}),
          confidence: Number(params[6] || 0),
          status: row.status === 'filed' ? 'filed' : params[7],
          review_reason: params[8],
          source_excerpt: params[9],
          target_table: params[10],
          updated_at: '2026-06-19T10:00:02.000Z',
        });
        return { rows: [row] };
      }

      if (/INSERT INTO bna_parse_review_queue/i.test(compactSql)) {
        const parseRunId = params[0];
        const parseItemId = params[1] === undefined ? null : params[1];
        const reviewType = params[2];
        const reason = params[3];
        const exists = this.reviews.some((review) =>
          review.parse_run_id === parseRunId &&
          String(review.review_type) === String(reviewType) &&
          String(review.reason) === String(reason) &&
          String(review.parse_item_id || '') === String(parseItemId || '')
        );
        if (!exists) {
          this.reviews.push({
            id: this.nextReviewId++,
            parse_run_id: parseRunId,
            parse_item_id: parseItemId,
            review_type: reviewType,
            reason,
            payload: parseJson(params[4], {}),
            status: 'open',
            created_at: '2026-06-19T10:00:03.000Z',
          });
        }
        return { rows: [] };
      }

      if (/UPDATE bna_raw_intake SET parse_status = 'failed'/i.test(compactSql)) {
        const row = this.rawIntakes.find((item) => item.id === params[1]);
        if (row) {
          row.parse_status = 'failed';
          row.error = params[0];
          row.updated_at = '2026-06-19T10:00:04.000Z';
        }
        return { rows: row ? [row] : [] };
      }

      if (/UPDATE bna_raw_intake SET parse_status/i.test(compactSql)) {
        const row = this.rawIntakes.find((item) => item.id === params[8]);
        if (!row) return { rows: [] };
        row.parse_status = params[0];
        row.parsed_payload = parseJson(params[1], {});
        row.created_requirement_ids = params[2] || [];
        row.created_task_ids = params[3] || [];
        row.created_decision_ids = params[4] || [];
        row.created_question_ids = params[5] || [];
        row.requirement_register_path = params[6] || row.requirement_register_path;
        row.metadata = { ...parseJson(row.metadata, {}), ...parseJson(params[7], {}) };
        row.parsed_at = '2026-06-19T10:00:04.000Z';
        row.updated_at = '2026-06-19T10:00:04.000Z';
        return { rows: [row] };
      }

      if (/SELECT q\.\*, i\.item_type/i.test(compactSql)) {
        const parseRunId = params.find((value) => typeof value === 'number') || null;
        const rows = this.reviews
          .filter((review) => !parseRunId || review.parse_run_id === parseRunId)
          .map((review) => {
            const item = this.parseItems.find((candidate) => candidate.id === review.parse_item_id);
            const run = this.parseRuns.find((candidate) => candidate.id === review.parse_run_id);
            return {
              ...review,
              item_type: item?.item_type || null,
              item_title: item?.title || null,
              item_payload: item?.payload || null,
              source_type: run?.source_type || null,
              run_summary: run?.summary || null,
              resolution_json: {},
            };
          });
        return { rows };
      }

      return { rows: [] };
    },
    async connect() {
      return {
        query: this.query.bind(this),
        release() {},
      };
    },
  };
  return db;
}

function loadServerWithFakes() {
  const fakeDb = createFakePostgres();
  const { express, routes, staticCalls } = createFakeExpress();
  const serverRequire = Module.createRequire(SERVER_PATH);
  const fakeProcess = Object.create(process);
  fakeProcess.env = {
    ...process.env,
    BNA_SKIP_ENV_LOCAL: '1',
    BNA_INTAKE_AI_ENABLED: '0',
    DATABASE_URL: 'postgres://local-readback-only/bna',
    OPS_USERNAME: 'admin@example.test',
    OPS_PASSWORD: 'admin-pass',
    ONE_TIME_OWNER_USERNAME: 'rabbi-owner@example.test',
    ONE_TIME_OWNER_PASSWORD: 'owner-pass',
    ONE_TIME_MANAGER_USERNAME: 'shloimie-admin@example.test',
    ONE_TIME_MANAGER_PASSWORD: 'manager-pass',
    ONE_TIME_OPS_USERNAME: '',
    ONE_TIME_OPS_PASSWORD: '',
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
    crypto,
    exports: moduleContext.exports,
    module: moduleContext,
    process: fakeProcess,
    require: localRequire,
    __dirname: WORKSPACE_ROOT,
    __filename: SERVER_PATH,
  };
  const source = fs
    .readFileSync(SERVER_PATH, 'utf8')
    .replace(/\ninitDb\(\);\n/, '\n// initDb skipped by one-time-intake-api-readback.test.js\n');
  vm.runInNewContext(source, context, {
    filename: SERVER_PATH,
    displayErrors: true,
  });
  return { fakeDb, routes, staticCalls };
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
    redirect(url) {
      this.statusCode = 302;
      this.redirect_url = url;
      return this;
    },
  };
}

async function authenticate(route, username, password, routePath = '/api/bna/intake/parse') {
  const req = {
    body: {},
    headers: {
      accept: 'application/json',
      authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
    method: 'POST',
    originalUrl: routePath,
    path: routePath,
    query: {},
    secure: false,
  };
  const res = jsonResponse();
  let nextCalled = false;
  await route.handlers[0](req, res, () => {
    nextCalled = true;
  });
  return { req, res, nextCalled };
}

async function invokeRouteHandler(route, req) {
  const res = jsonResponse();
  const handler = route.handlers[route.handlers.length - 1];
  await handler(req, res);
  return res;
}

function scopedRequest(body = {}) {
  return {
    body,
    headers: { accept: 'application/json' },
    method: 'POST',
    originalUrl: '/api/bna/intake/parse',
    path: '/api/bna/intake/parse',
    query: {},
    secure: false,
    opsUser: 'rabbi-owner@example.test',
    opsIdentity: {
      username: 'rabbi-owner@example.test',
      role: 'project_owner',
      scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY },
      allowedViews: ['intake', 'tasks', 'community', 'content', 'calendar', 'integrations', 'settings'],
      displayName: 'Rabbi Ellie Scheller',
    },
  };
}

function scopedRecords(parsed = {}) {
  return [
    ...(parsed.tasks || []),
    ...(parsed.decisions || []),
    ...(parsed.content_items || []),
    ...(parsed.community_records || []),
    ...(parsed.integration_items || []),
    ...(parsed.service_provider_items || []),
    ...(parsed.calendar_events || []),
  ];
}

test('scoped One Time owner and admin auth can reach the canonical intake parse API', async () => {
  const { routes } = loadServerWithFakes();
  const route = findRoute(routes, 'post', '/api/bna/intake/parse');

  const owner = await authenticate(route, 'rabbi-owner@example.test', 'owner-pass');
  assert.equal(owner.nextCalled, true);
  assert.equal(owner.req.opsIdentity.role, 'project_owner');
  assert.equal(owner.req.opsIdentity.scope.type, 'project');
  assert.equal(owner.req.opsIdentity.scope.projectKey, ONE_TIME_PROJECT_KEY);
  assert.equal(owner.req.opsIdentity.displayName, 'Rabbi Ellie Scheller');

  const admin = await authenticate(route, 'shloimie-admin@example.test', 'manager-pass');
  assert.equal(admin.nextCalled, true);
  assert.equal(admin.req.opsIdentity.role, 'project_manager');
  assert.equal(admin.req.opsIdentity.scope.type, 'project');
  assert.equal(admin.req.opsIdentity.scope.projectKey, ONE_TIME_PROJECT_KEY);
  assert.equal(admin.req.opsIdentity.displayName, 'Shloimie');
});

test('One Time intake parse API writes and reads back raw intake, parse run, items, and reviews locally', async () => {
  const { fakeDb, routes } = loadServerWithFakes();
  const route = findRoute(routes, 'post', '/api/bna/intake/parse');
  const body = {
    source_type: 'drive',
    source_channel: 'drive',
    source_id: 'drive-rabbi-elie-one-time-20260619',
    raw_input: [
      'Route this to One Time for Rabbi Elie Scheller.',
      'Task: Codex should create the internal One Time calendar and member-library checklist.',
      'Decision: choose the Resend account and DNS authority before any email send.',
      'Integration: prepare Zoom and Vimeo readiness without storing secrets.',
    ].join('\n'),
  };

  const first = await invokeRouteHandler(route, scopedRequest(body));
  assert.equal(first.statusCode, 200);
  assert.equal(first.body.success, true);
  assert.ok(['parsed', 'needs_review'].includes(first.body.raw_intake.parse_status));
  assert.equal(first.body.raw_intake.source_channel, 'drive');
  assert.equal(first.body.raw_intake.metadata.scoped_workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(first.body.raw_intake.metadata.scoped_project_key, ONE_TIME_PROJECT_KEY);
  assert.equal(first.body.parse_run.metadata.workspace_key, ONE_TIME_WORKSPACE_KEY);
  assert.equal(first.body.parse_run.metadata.project_key, ONE_TIME_PROJECT_KEY);
  assert.equal(first.body.ramble_to_done.adapter_key, 'file_intake');
  assert.equal(first.body.ramble_to_done.raw_intake_stable_id, first.body.raw_intake.stable_id);
  assert.equal(first.body.ramble_to_done.no_lost_sentence_gate.ok, true);
  assert.ok(first.body.ramble_to_done.source_statement_count >= 4);
  assert.ok(first.body.ramble_to_done.source_statement_ids.every((id) => id.startsWith(`${first.body.raw_intake.stable_id}:S`)));
  assert.ok(first.body.ramble_to_done.requirement_rows.length >= 1);
  assert.ok(first.body.ramble_to_done.jobs.length >= first.body.ramble_to_done.requirement_rows.length);
  assert.ok(first.body.ramble_to_done.receipts.some((receipt) => receipt.receipt_type === 'worker_health' && receipt.status === 'online'));
  assert.equal(first.body.ramble_to_done.external_write_performed, false);
  assert.equal(first.body.parsed.ramble_to_done.raw_intake_stable_id, first.body.raw_intake.stable_id);
  assert.equal(first.body.parse_run.metadata.ramble_to_done.raw_intake_stable_id, first.body.raw_intake.stable_id);
  assert.ok(first.body.raw_intake.created_task_ids.length >= 1);
  assert.ok(scopedRecords(first.body.parsed).length >= 1);
  assert.ok(scopedRecords(first.body.parsed).every((item) => item.workspace_key === ONE_TIME_WORKSPACE_KEY));
  assert.ok(scopedRecords(first.body.parsed).every((item) => item.project_key === ONE_TIME_PROJECT_KEY));
  assert.equal(fakeDb.rawIntakes.length, 1);
  assert.equal(fakeDb.parseRuns.length, 1);
  assert.ok(fakeDb.parseItems.length >= 1);

  const second = await invokeRouteHandler(route, scopedRequest(body));
  assert.equal(second.statusCode, 200);
  assert.equal(second.body.success, true);
  assert.equal(second.body.parse_run.id, first.body.parse_run.id);
  assert.equal(fakeDb.rawIntakes.length, 2, 'raw provenance should be preserved for each submitted intake');
  assert.equal(fakeDb.parseRuns.length, 1, 'parse runs should upsert idempotently by source and hash');
  assert.deepEqual(
    fakeDb.parseItems.map((item) => item.item_key),
    [...new Set(fakeDb.parseItems.map((item) => item.item_key))],
    'parse item upsert should not duplicate item keys'
  );
});

test('scoped One Time intake parse rejects attempts to override into BNA workspace', async () => {
  const { fakeDb, routes } = loadServerWithFakes();
  const route = findRoute(routes, 'post', '/api/bna/intake/parse');
  const res = await invokeRouteHandler(route, scopedRequest({
    workspace_key: 'bna',
    project_key: 'bna',
    raw_input: 'Route this to One Time: create the Vimeo readiness task.',
  }));

  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /scoped provider workspace|One Time Mishnah Class/);
  assert.equal(fakeDb.rawIntakes.length, 0);
  assert.equal(fakeDb.parseRuns.length, 0);
});

test('public static cache policy caches public assets without caching private shells', async () => {
  const { staticCalls } = loadServerWithFakes();
  const publicStatic = staticCalls.find((call) => call.root === 'public');
  assert.ok(publicStatic, 'public static middleware should be registered');
  assert.equal(typeof publicStatic.options.setHeaders, 'function');

  function cacheFor(relativePath) {
    const res = jsonResponse();
    publicStatic.options.setHeaders(res, path.join(WORKSPACE_ROOT, relativePath));
    return res.headers['cache-control'] || '';
  }

  assert.equal(cacheFor('public/js/bna-bot-widget.js'), 'public, max-age=300, must-revalidate');
  assert.equal(cacheFor('public/css/one-time-shared-review.css'), 'public, max-age=300, must-revalidate');
  assert.equal(
    cacheFor('public/images/one-time/brand/onetimelogo.webp'),
    'public, max-age=86400, stale-while-revalidate=604800'
  );
  assert.equal(cacheFor('public/one-time/index.html'), 'no-store');
  assert.equal(cacheFor('public/sw.js'), 'no-store');
  assert.equal(cacheFor('public/manifest.json'), 'no-store');
  assert.equal(cacheFor('public/js/operations-shell.js'), 'private, no-cache, max-age=0, must-revalidate');
  assert.equal(cacheFor('public/js/operations-deferred-renderers.js'), 'private, no-cache, max-age=0, must-revalidate');
});
