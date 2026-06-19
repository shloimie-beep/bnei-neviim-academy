const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'ops', 'playwright-smokes', '2026-06-19-agent-control-browser-local');
const operationsHtmlPath = path.join(root, 'public', 'operations.html');
const runKey = 'run_agent_control_smoke';

const allowedViews = [
  'dashboard',
  'watchdog',
  'pipelines',
  'tasks',
  'agents',
  'students',
  'contacts',
  'intake',
  'community',
  'content',
  'live_classes',
  'calendar',
  'service_providers',
  'communications',
  'internal_dialogue',
  'accounting',
  'automations',
  'api_usage',
  'admin',
  'integrations',
  'settings',
];

const workspaceCategories = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    workspaces: [
      {
        workspace_key: 'platform',
        name: 'Platform Operations',
        workspace_type: 'super_admin',
        display_category: 'super_admin',
        description: 'Global Operations workspace',
      },
    ],
  },
  {
    id: 'school',
    label: 'School',
    workspaces: [
      {
        workspace_key: 'bna',
        name: 'Bnei Neviim Academy',
        workspace_type: 'school',
        display_category: 'school',
        project_key: 'bna',
      },
    ],
  },
  {
    id: 'service_provider',
    label: 'Service Provider',
    workspaces: [
      {
        workspace_key: 'rabbi_sheller_provider',
        name: 'One Time Mishnah Class',
        workspace_type: 'service_provider',
        display_category: 'service_provider',
        project_key: 'one_time_mishnah_class',
      },
    ],
  },
];

const agentProfiles = [
  {
    id: 1,
    profile_id: 1,
    agent_key: 'browser_qa',
    display_name: 'Browser QA',
    agent_type: 'browser_qa',
    description: 'Browser verification and evidence submission.',
    capabilities: ['browser_read', 'browser_safe_interaction', 'submit_verification'],
  },
];

const agentRun = {
  id: 9101,
  run_id: 9101,
  run_key: runKey,
  task_id: 901,
  task_title: 'Verify Agent Control browser flow',
  task_display_title: 'Verify Agent Control browser flow',
  task_stage: 'tasks',
  task_implementation_status: 'complete',
  task_verification_status: 'ready',
  task_required_verification_mode: 'mixed',
  project_key: 'bna',
  project_name: 'Bnei Neviim Academy',
  project_short_name: 'BNA',
  workspace_id: 1,
  project_id: 1,
  agent_profile_id: 1,
  agent_key: 'browser_qa',
  agent_display_name: 'Browser QA',
  agent_type: 'browser_qa',
  capabilities: ['browser_read', 'submit_verification'],
  run_type: 'verification',
  verification_mode: 'mixed',
  status: 'ready',
  priority: 'today',
  prompt_version: 1,
  prompt_text: [
    'Agent Run: run_agent_control_smoke',
    'Task: #901 - Verify Agent Control browser flow',
    'Open the Agent Run URL and use read-only navigation.',
    'Do not include credentials, cookies, API keys, or passwords.',
    'Submit the authoritative result inside BNA Operations.',
  ].join('\n'),
  target_url: '/operations?view=agents',
  acceptance_criteria: [
    { id: 'AC-1', label: 'Agent Control list renders with the prepared run.', required: true },
    { id: 'AC-2', label: 'Agent Run portal renders prompt, progress, evidence, submit, seal, and blocker controls.', required: true },
  ],
  allowed_actions: ['read-only navigation', 'screenshots', 'attach local evidence'],
  forbidden_actions: ['production writes', 'credentials', 'external sends'],
  context_snapshot: { evidence_exempt: false, test_fixture: true },
  result_summary: '',
  result_payload: {},
  blocker: '',
  artifact_count: 1,
  event_count: 2,
  created_at: '2026-06-19T11:10:00.000Z',
  updated_at: '2026-06-19T11:20:00.000Z',
};

const tasks = [
  {
    id: 901,
    title: 'Verify Agent Control browser flow',
    display_title: 'Verify Agent Control browser flow',
    project_key: 'bna',
    project_name: 'Bnei Neviim Academy',
    stage: 'tasks',
    item_type: 'task',
    status: 'ready',
    urgency: 'today',
    implementation_status: 'complete',
    verification_status: 'ready',
    required_verification_mode: 'mixed',
    agent_status: 'needs_verification',
    active_agent_run_id: 9101,
    assigned_to: 'Browser QA',
    notes: 'Fixture task for local Super Admin Agent Control browser smoke.',
    created_at: '2026-06-19T11:00:00.000Z',
    updated_at: '2026-06-19T11:20:00.000Z',
  },
  {
    id: 902,
    title: 'Prepare Agent Control browser smoke follow-up',
    display_title: 'Prepare Agent Control browser smoke follow-up',
    project_key: 'bna',
    project_name: 'Bnei Neviim Academy',
    stage: 'tasks',
    item_type: 'task',
    status: 'assigned',
    urgency: 'normal',
    implementation_status: 'in_progress',
    verification_status: 'needed',
    required_verification_mode: 'mixed',
    agent_status: 'queued',
    assigned_to: 'Codex',
    notes: 'Open task without an active run to verify the Prepare from active tasks panel.',
    created_at: '2026-06-19T11:05:00.000Z',
    updated_at: '2026-06-19T11:15:00.000Z',
  },
];

const runEvents = [
  {
    id: 1,
    run_id: 9101,
    event_type: 'created',
    actor_name: 'Super Admin',
    body: 'Agent run created for browser smoke.',
    metadata: {},
    created_at: '2026-06-19T11:10:00.000Z',
  },
  {
    id: 2,
    run_id: 9101,
    event_type: 'prompt_generated',
    actor_name: 'Super Admin',
    body: 'Prompt generated without credentials.',
    metadata: {},
    created_at: '2026-06-19T11:10:10.000Z',
  },
];

const runArtifacts = [
  {
    id: 1,
    run_id: 9101,
    artifact_type: 'report',
    title: 'Agent Control API readback report',
    path: 'tests/agent-control-api-readback.test.js',
    url: '',
    redaction_status: 'not_needed',
    metadata: { fixture: true },
    created_at: '2026-06-19T11:12:00.000Z',
  },
];

const agentRunDecisions = [];
const agentRunMutations = [];

function resetInteractiveAgentRunFixture() {
  agentRun.status = 'ready';
  agentRun.result_summary = '';
  agentRun.result_payload = {};
  agentRun.blocker = '';
  agentRun.artifact_count = 1;
  agentRun.event_count = 2;
  agentRun.updated_at = '2026-06-19T11:20:00.000Z';
  runEvents.splice(0, runEvents.length,
    {
      id: 1,
      run_id: 9101,
      event_type: 'created',
      actor_name: 'Super Admin',
      body: 'Agent run created for browser smoke.',
      metadata: {},
      created_at: '2026-06-19T11:10:00.000Z',
    },
    {
      id: 2,
      run_id: 9101,
      event_type: 'prompt_generated',
      actor_name: 'Super Admin',
      body: 'Prompt generated without credentials.',
      metadata: {},
      created_at: '2026-06-19T11:10:10.000Z',
    },
  );
  runArtifacts.splice(0, runArtifacts.length,
    {
      id: 1,
      run_id: 9101,
      artifact_type: 'report',
      title: 'Agent Control API readback report',
      path: 'tests/agent-control-api-readback.test.js',
      url: '',
      redaction_status: 'not_needed',
      metadata: { fixture: true },
      created_at: '2026-06-19T11:12:00.000Z',
    },
  );
  agentRunDecisions.splice(0, agentRunDecisions.length);
  agentRunMutations.splice(0, agentRunMutations.length);
}

function recordRunEvent(eventType, body, metadata = {}) {
  runEvents.push({
    id: runEvents.length + 1,
    run_id: 9101,
    event_type: eventType,
    actor_name: 'Browser QA local smoke',
    body,
    metadata,
    created_at: `2026-06-19T11:${String(20 + runEvents.length).padStart(2, '0')}:00.000Z`,
  });
  agentRun.event_count = runEvents.length;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function handleAgentRunMutation(req, res, pathname) {
  const match = pathname.match(/^\/api\/bna\/agent-runs\/([^/]+)\/([^/]+)$/);
  if (!match || match[1] !== runKey) return false;
  const action = match[2];
  const payload = await readJsonBody(req);
  agentRunMutations.push({ action, payload });

  if (action === 'claim') {
    agentRun.status = 'claimed';
    recordRunEvent('claimed', 'Browser QA local smoke claimed the run.');
    json(res, { success: true, run: agentRun });
    return true;
  }

  if (action === 'progress') {
    recordRunEvent(payload.event_type || 'progress', payload.summary || 'Progress update.', payload.metadata || {});
    json(res, { success: true, event: runEvents[runEvents.length - 1] });
    return true;
  }

  if (action === 'artifacts') {
    const artifact = {
      id: runArtifacts.length + 1,
      run_id: 9101,
      artifact_type: payload.artifact_type || 'note',
      title: payload.title || 'Evidence',
      path: payload.path || '',
      url: payload.url || '',
      redaction_status: payload.redaction_status || 'not_needed',
      metadata: { fixture: true },
      created_at: '2026-06-19T11:30:00.000Z',
    };
    runArtifacts.push(artifact);
    agentRun.artifact_count = runArtifacts.length;
    recordRunEvent('evidence_attached', artifact.title, { path: artifact.path, url: artifact.url });
    json(res, { success: true, artifact });
    return true;
  }

  if (action === 'submit' || action === 'seal') {
    agentRun.result_summary = payload.summary || '';
    agentRun.result_payload = {
      outcome: payload.outcome || 'blocked',
      criterion_results: payload.criterion_results || [],
      automated_gates_passed: Boolean(payload.automated_gates_passed),
    };
    if (action === 'submit') {
      agentRun.status = 'submitted';
      recordRunEvent('submitted', agentRun.result_summary || 'Run submitted for seal.', agentRun.result_payload);
      json(res, { success: true, run: agentRun });
      return true;
    }
    const outcome = payload.outcome || 'blocked';
    agentRun.status = outcome === 'pass' ? 'sealed_pass' : outcome === 'fail' ? 'sealed_fail' : 'blocked';
    recordRunEvent('sealed', agentRun.result_summary || 'Run sealed.', agentRun.result_payload);
    if (['blocked', 'needs_operator'].includes(outcome)) {
      agentRunDecisions.push({
        id: `DEC-${agentRunDecisions.length + 1}`,
        title: 'Manual Agent Mode smoke requires operator/browser judgment',
        source_run_key: runKey,
      });
    }
    json(res, { success: true, run: agentRun, decisions: agentRunDecisions });
    return true;
  }

  if (action === 'block') {
    agentRun.status = 'blocked';
    agentRun.blocker = payload.blocker || 'Needs operator action.';
    recordRunEvent('blocked', agentRun.blocker);
    agentRunDecisions.push({
      id: `DEC-${agentRunDecisions.length + 1}`,
      title: agentRun.blocker,
      source_run_key: runKey,
    });
    json(res, { success: true, run: agentRun, decisions: agentRunDecisions });
    return true;
  }

  return false;
}

function json(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function serveStatic(res, requestPath) {
  const publicRoot = path.join(root, 'public');
  const filePath = path.normalize(path.join(publicRoot, requestPath.replace(/^\/+/, '')));
  if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.html': 'text/html',
    '.webmanifest': 'application/manifest+json',
  }[ext] || 'text/plain';
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fs.readFileSync(filePath));
  return true;
}

function defaultApiPayload(pathname) {
  if (pathname === '/api/bna/auth/me') {
    return {
      authenticated: true,
      username: 'admin@example.test',
      role: 'super_admin',
      displayName: 'Super Admin',
      allowedViews,
      scope: { type: 'all' },
    };
  }
  if (pathname === '/api/bna/workspace-directory') return { categories: workspaceCategories, review_items: [] };
  if (pathname === '/api/bna/workspace-platform') {
    return {
      workspaces: workspaceCategories.flatMap((category) => category.workspaces),
      connector_settings: [],
      bot_actions: [],
      bot_action_logs: [],
    };
  }
  if (/^\/api\/bna\/workspace-settings\/[^/]+\/branding$/.test(pathname)) {
    return {
      workspace_key: 'platform',
      workspace_name_override: 'Platform Operations',
      logo_url: '/icons/operations-icon.svg',
    };
  }
  if (pathname === '/api/bna/projects') {
    return {
      projects: [
        { id: 1, project_key: 'bna', name: 'Bnei Neviim Academy', short_name: 'BNA' },
        { id: 7, project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time' },
      ],
    };
  }
  if (pathname === '/api/bna/tasks') return { tasks };
  if (pathname === '/api/bna/agent-fleet/status') {
    return {
      queue: { pending: 1, in_progress: 0, blocked: 0, latest_task: { id: 902, title: tasks[1].title } },
      fleet: { status: 'running', stale: false, last_seen_at: '2026-06-19T11:25:00.000Z' },
    };
  }
  if (pathname === '/api/bna/agent-profiles') return { success: true, profiles: agentProfiles };
  if (pathname === '/api/bna/agent-runs') return { success: true, runs: [agentRun], summary: { ready: 1 } };
  if (pathname === `/api/bna/agent-runs/${runKey}`) {
    return {
      success: true,
      run: agentRun,
      events: runEvents,
      artifacts: runArtifacts,
      task: tasks[0],
    };
  }
  if (pathname === '/api/bna/people') return { people: [] };
  if (pathname === '/api/bna/students') return { students: [] };
  if (pathname === '/api/bna/calendar-events') return { events: [] };
  if (pathname === '/api/bna/support-tickets') return { tickets: [] };
  if (pathname === '/api/bna/notifications') return { notifications: [], summary: { unread: 0 } };
  if (pathname === '/api/bna/automations') return { automations: [], filters: {} };
  if (pathname === '/api/bna/integrations/status') return { success: true, cards: [] };
  if (pathname === '/api/bna/ops/queue-health') return { success: true, queue: { pending: 1, running: 0, stale_candidates: [] } };
  if (pathname.startsWith('/api/bna/')) return {};
  return null;
}

async function withServer(callback) {
  fs.mkdirSync(outDir, { recursive: true });
  let activePort = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    if (req.method === 'POST' && url.pathname.startsWith('/api/bna/agent-runs/')) {
      handleAgentRunMutation(req, res, url.pathname).then((handled) => {
        if (!handled) {
          res.writeHead(404);
          res.end('not found');
        }
      });
      return;
    }
    if (url.pathname === '/operations' || url.pathname.startsWith('/operations/agents/runs/')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(operationsHtmlPath));
      return;
    }
    const payload = defaultApiPayload(url.pathname);
    if (payload !== null) return json(res, payload);
    if (serveStatic(res, url.pathname)) return;
    res.writeHead(404);
    res.end('not found');
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  activePort = server.address().port;
  try {
    await callback(`http://127.0.0.1:${activePort}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(metrics.scrollWidth <= metrics.width + 1, `${label} overflow ${metrics.scrollWidth} > ${metrics.width}`);
  return metrics;
}

async function waitForMutationCount(expected, label) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    if (agentRunMutations.length >= expected) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(`${label} did not reach ${expected} Agent Run mutations; saw ${agentRunMutations.map((entry) => entry.action).join(', ')}`);
}

test('Super Admin Agent Control browser smoke renders list, run portal, prompt, and evidence controls', async () => {
  await withServer(async (baseUrl) => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    try {
      await page.goto(`${baseUrl}/operations?workspace=platform&view=agents`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.agent-control-center', { timeout: 15000 });
      await page.waitForFunction(() => /Agent Runs/.test(document.body.textContent), null, { timeout: 15000 });

      const listText = await page.locator('.agent-control-center').evaluate((node) => node.innerText.replace(/\s+/g, ' ').trim());
      assert.match(listText, /Agent Control/);
      assert.match(listText, /Agent Runs/);
      assert.match(listText, /Verify Agent Control browser flow/);
      assert.match(listText, /Browser QA/i);
      assert.match(listText, /Copy Prompt/);
      assert.match(listText, /Open ChatGPT/);
      assert.match(listText, /Prepare from active tasks/);
      assert.match(listText, /Prepare Agent Control browser smoke follow-up/);
      assert.doesNotMatch(listText, /One Time Agent Status/);
      const desktopListMetrics = await assertNoHorizontalOverflow(page, 'desktop list');
      await page.screenshot({ path: path.join(outDir, 'desktop-list.png'), fullPage: true });

      await page.getByRole('button', { name: 'Open Run' }).click();
      await page.waitForSelector('.agent-run-portal', { timeout: 15000 });
      await page.waitForSelector(`#agentPrompt-${runKey}`, { timeout: 15000 });
      const runText = await page.locator('.agent-run-portal').evaluate((node) => node.innerText.replace(/\s+/g, ' ').trim());
      assert.match(runText, new RegExp(`Agent Run ${runKey}`, 'i'));
      assert.match(runText, /Run Summary/);
      assert.match(runText, /Agent Prompt/);
      assert.match(runText, /Progress/);
      assert.match(runText, /Evidence/);
      assert.match(runText, /Submit \/ Seal/);
      assert.match(runText, /Blocker \/ Operator Decision/);
      assert.match(runText, /Copy Agent Prompt/);
      assert.match(runText, /Open ChatGPT Agent/);
      assert.match(runText, /Claim Run/);
      assert.match(runText, /Agent Control API readback report/);
      assert.doesNotMatch(runText, /admin-pass|api[_ -]?key\s*[:=]|token\s*[:=]|password\s*[:=]/i);
      const promptText = await page.locator(`#agentPrompt-${runKey}`).inputValue();
      assert.match(promptText, /Do not include credentials/);
      assert.doesNotMatch(promptText, /admin-pass|OPENAI_API_KEY|OPS_PASSWORD/);
      const desktopRunMetrics = await assertNoHorizontalOverflow(page, 'desktop run');
      await page.screenshot({ path: path.join(outDir, 'desktop-run.png'), fullPage: true });

      const viewportResults = [
        { name: 'tablet-run', width: 768, height: 1024, url: `${baseUrl}/operations/agents/runs/${runKey}?run=${runKey}&workspace=platform&view=agents` },
        { name: 'mobile-390-run', width: 390, height: 844, url: `${baseUrl}/operations/agents/runs/${runKey}?run=${runKey}&workspace=platform&view=agents` },
        { name: 'mobile-360-list', width: 360, height: 800, url: `${baseUrl}/operations?workspace=platform&view=agents` },
      ];
      const viewportMetrics = {};
      for (const viewport of viewportResults) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(viewport.url, { waitUntil: 'networkidle' });
        await page.waitForSelector(viewport.name.includes('list') ? '.agent-control-center' : '.agent-run-portal', { timeout: 15000 });
        viewportMetrics[viewport.name] = await assertNoHorizontalOverflow(page, viewport.name);
        await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`), fullPage: true });
      }

      assert.deepEqual(consoleErrors, []);

      const report = {
        ok: true,
        target: '/operations?workspace=platform&view=agents',
        runTarget: `/operations/agents/runs/${runKey}`,
        runKey,
        desktopListMetrics,
        desktopRunMetrics,
        viewportMetrics,
        screenshots: [
          'desktop-list.png',
          'desktop-run.png',
          'tablet-run.png',
          'mobile-390-run.png',
          'mobile-360-list.png',
        ].map((file) => path.relative(root, path.join(outDir, file)).replace(/\\/g, '/')),
        guardrails: {
          productionWrites: false,
          productionDataMutation: false,
          secretsInFixture: false,
          broadCrawl: false,
        },
      };
      fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
      fs.writeFileSync(
        path.join(outDir, 'report.md'),
        [
          '# Agent Control Browser Smoke',
          '',
          'PASS. Super Admin Agent Control list and Agent Run portal rendered with fake local data only.',
          '',
          `- List target: ${report.target}`,
          `- Run target: ${report.runTarget}`,
          `- Run key: ${runKey}`,
          '- Viewports: 1440x900, 768x1024, 390x844, 360x800',
          '- Production writes: no',
          '- Broad crawl: no',
          '',
          'Screenshots:',
          ...report.screenshots.map((screenshot) => `- ${screenshot}`),
          '',
        ].join('\n'),
      );
    } finally {
      await browser.close();
    }
  });
});

test('Super Admin Agent Control browser smoke submits and seals a safe local run', async () => {
  resetInteractiveAgentRunFixture();
  await withServer(async (baseUrl) => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    try {
      await page.goto(`${baseUrl}/operations/agents/runs/${runKey}?run=${runKey}&workspace=platform&view=agents`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.agent-run-portal', { timeout: 15000 });

      const claimButton = page.getByRole('button', { name: 'Claim Run' });
      assert.equal(await claimButton.count(), 1);
      await claimButton.click();
      await waitForMutationCount(1, 'claim');
      await page.waitForFunction(() => /Agent run claimed\.|Claimed/.test(document.body.textContent), null, { timeout: 15000 });

      const progressBox = page.locator('textarea[placeholder="Progress update, finding, or checkpoint..."]');
      assert.equal(await progressBox.count(), 1);
      await progressBox.fill('Manual Agent Mode prompt reviewed; UI controls are present and safe local data only.');
      const progressButton = page.getByRole('button', { name: 'Post Progress' });
      assert.equal(await progressButton.count(), 1);
      await progressButton.click();
      await waitForMutationCount(2, 'progress');
      await page.waitForFunction(() => /Progress posted\.|Manual Agent Mode prompt reviewed/.test(document.body.textContent), null, { timeout: 15000 });

      await page.locator('input[name="title"]').fill('Interactive Agent Control smoke evidence');
      await page.locator('input[name="path"]').fill('ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png');
      const evidenceButton = page.getByRole('button', { name: 'Attach Evidence' });
      assert.equal(await evidenceButton.count(), 1);
      await evidenceButton.click();
      await waitForMutationCount(3, 'evidence');
      await page.waitForFunction(() => /Evidence attached\.|Interactive Agent Control smoke evidence/.test(document.body.textContent), null, { timeout: 15000 });

      await page.locator('textarea[placeholder="Concise verifier result..."]').fill('Interactive local browser flow verified with safe fake data.');
      await page.locator('textarea[name="criterion_note_0"]').fill('Agent Control list and run portal rendered through local browser smoke.');
      await page.locator('textarea[name="criterion_note_1"]').fill('Progress, evidence, submit, and seal controls were exercised with fake local data.');
      const submitButton = page.getByRole('button', { name: 'Submit Result' });
      assert.equal(await submitButton.count(), 1);
      await submitButton.click();
      await waitForMutationCount(4, 'submit');
      await page.waitForFunction(() => /Agent run submitted for seal\.|Submitted/.test(document.body.textContent), null, { timeout: 15000 });

      await page.locator('textarea[placeholder="Concise verifier result..."]').fill('Interactive local browser flow verified with safe fake data.');
      const sealButton = page.getByRole('button', { name: 'Seal Run' });
      assert.equal(await sealButton.count(), 1);
      await sealButton.click();
      await waitForMutationCount(5, 'seal');
      await page.waitForFunction(() => /Agent run sealed\.|Sealed Pass/.test(document.body.textContent), null, { timeout: 15000 });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.agent-run-portal', { timeout: 15000 });
      await page.waitForFunction(() => /Sealed Pass/.test(document.querySelector('.agent-run-portal')?.innerText || ''), null, { timeout: 15000 });

      const finalText = await page.locator('.agent-run-portal').evaluate((node) => node.innerText.replace(/\s+/g, ' ').trim());
      assert.match(finalText, /Sealed Pass/);
      assert.match(finalText, /Interactive Agent Control smoke evidence/);
      assert.match(finalText, /Manual Agent Mode prompt reviewed/);
      assert.doesNotMatch(finalText, /admin-pass|api[_ -]?key\s*[:=]|token\s*[:=]|password\s*[:=]/i);
      await assertNoHorizontalOverflow(page, 'interactive run');
      await page.screenshot({ path: path.join(outDir, 'interactive-run.png'), fullPage: true });

      assert.deepEqual(consoleErrors, []);
      assert.deepEqual(agentRunMutations.map((entry) => entry.action), ['claim', 'progress', 'artifacts', 'submit', 'seal']);
      assert.equal(agentRunDecisions.length, 0);
      assert.equal(agentRun.status, 'sealed_pass');
      assert.equal(runArtifacts.length, 2);
      assert.ok(runEvents.some((event) => event.event_type === 'sealed'));

      const report = {
        ok: true,
        target: `/operations/agents/runs/${runKey}`,
        runKey,
        actionSequence: agentRunMutations.map((entry) => entry.action),
        finalStatus: agentRun.status,
        artifactCount: runArtifacts.length,
        eventTypes: runEvents.map((event) => event.event_type),
        screenshot: path.relative(root, path.join(outDir, 'interactive-run.png')).replace(/\\/g, '/'),
        guardrails: {
          productionWrites: false,
          productionDataMutation: false,
          externalWrites: false,
          secretsInFixture: false,
          broadCrawl: false,
        },
      };
      fs.writeFileSync(path.join(outDir, 'interactive-report.json'), JSON.stringify(report, null, 2));
      fs.writeFileSync(
        path.join(outDir, 'interactive-report.md'),
        [
          '# Agent Control Interactive Browser Smoke',
          '',
          'PASS. The real Operations Agent Run portal controls were exercised with fake local data only.',
          '',
          `- Run target: ${report.target}`,
          `- Run key: ${runKey}`,
          `- Action sequence: ${report.actionSequence.join(' -> ')}`,
          `- Final status: ${report.finalStatus}`,
          `- Artifacts after run: ${report.artifactCount}`,
          '- Production writes: no',
          '- External writes: no',
          '- Broad crawl: no',
          '',
          'Evidence:',
          `- ${report.screenshot}`,
          '',
        ].join('\n'),
      );
    } finally {
      await browser.close();
    }
  });
});
