const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'operations.html'), 'utf8');
const screenshotDir = path.join(ROOT, 'ops', 'playwright-smokes', '2026-06-23-service-provider-studio-local');

function json(body) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('Operations Studio browser smoke renders and exercises the local no-send workflow', async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const project = {
    id: 101,
    project_id: 2,
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    project_name: 'One Time Mishnah Class',
    project_short_name: 'One Time',
    title: 'One Time Mishnah Studio Pilot',
    format: 'slideshow_video',
    status: 'storyboard',
    brief_json: { goal: 'Create a short review video.', target_audience: 'Members' },
    character_bible: [],
    guardrails: ['No publish or send action.'],
    scene_count: 2,
    open_jobs: 0,
    updated_at: new Date('2026-06-23T09:00:00Z').toISOString(),
  };
  const detail = {
    success: true,
    project,
    sources: [{
      id: 11,
      title: 'Pilot source',
      source_type: 'manual',
      source_hash: 'abc123',
      raw_text_preview: 'Mishnah learning begins with careful words and a warm teacher.',
      annotations: [],
      metadata: {},
    }],
    scenes: [{
      id: 21,
      scene_key: 'scene_1',
      position: 1,
      title: 'Careful Words',
      body: 'Open with the learning goal.',
      narration: 'Every Mishnah begins with careful words.',
      visual_prompt: 'Clean beis midrash table, warm light',
      duration_seconds: 12,
      status: 'draft',
      version: 1,
      character_refs: [],
      asset_refs: [],
      style_json: {},
      metadata: {},
    }],
    prompt_layers: [],
    correction_patches: [],
    jobs: [],
    assets: [],
    exports: [],
    usage_events: [],
    usage_rollup: { totals: { input_tokens: 100, output_tokens: 60, media_seconds: 12, estimated_cost_usd: 0 }, event_count: 1 },
  };

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    if (pathname === '/operations') return route.fulfill({ status: 200, contentType: 'text/html', body: html });
    if (pathname.startsWith('/css/') || pathname.startsWith('/js/')) {
      const filePath = path.join(ROOT, 'public', pathname.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        const contentType = pathname.endsWith('.css') ? 'text/css' : 'application/javascript';
        return route.fulfill({ status: 200, contentType, body: fs.readFileSync(filePath, 'utf8') });
      }
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    }
    if (pathname === '/api/bna/auth/me') {
      return route.fulfill(json({
        username: 'studio-smoke',
        role: 'project_owner',
        scope: { type: 'project', projectKey: 'one_time_mishnah_class' },
        workspace_role: 'owner',
        workspace_role_label: 'Workspace Owner',
        allowedViews: ['dashboard', 'watchdog', 'service_providers', 'agents', 'platform_suite', 'contacts', 'community', 'studio', 'content', 'live_classes', 'calendar', 'communications', 'tasks', 'automations', 'integrations', 'api_usage', 'settings'],
      }));
    }
    if (pathname === '/api/bna/workspace-directory') {
      return route.fulfill(json({ categories: [] }));
    }
    if (pathname === '/api/bna/workspace-settings/rabbi_sheller_provider/branding') {
      return route.fulfill(json({ workspace_name_override: 'One Time Mishnah Class' }));
    }
    if (pathname === '/api/bna/projects') {
      return route.fulfill(json({ projects: [{ project_key: 'one_time_mishnah_class', name: 'One Time Mishnah Class', short_name: 'One Time' }] }));
    }
    if (pathname === '/api/bna/studio/dashboard') {
      return route.fulfill(json({
        success: true,
        projects: [project],
        jobs: detail.jobs,
        usage_rollup: { totals: { input_tokens: 100, output_tokens: 60, media_seconds: 12, estimated_cost_usd: 0 }, event_count: 1 },
        price_catalog: [{ provider: 'mock', model: 'deterministic-v1', input_per_1m: 0, output_per_1m: 0, media_second: 0, status: 'active' }],
        pilot_fixture: null,
        no_external_writes: true,
      }));
    }
    if (pathname === '/api/bna/studio/usage') {
      return route.fulfill(json({
        success: true,
        events: [{ provider: 'mock', model: 'deterministic-v1', operation: 'render_mock', input_tokens: 100, output_tokens: 60, media_seconds: 12, estimated_cost_usd: 0, status: 'succeeded' }],
        rollup: { totals: { input_tokens: 100, output_tokens: 60, media_seconds: 12, estimated_cost_usd: 0 }, event_count: 1 },
        budgets: [{ workspace_key: 'rabbi_sheller_provider', monthly_budget_usd: 0, alert_threshold_usd: 0 }],
      }));
    }
    if (pathname === '/api/bna/studio/projects/101' && request.method() === 'GET') {
      return route.fulfill(json(clone(detail)));
    }
    if (pathname === '/api/bna/studio/projects/101/source' && request.method() === 'POST') {
      detail.sources.unshift({ id: 12, title: 'Smoke source', source_type: 'manual', source_hash: 'def456', raw_text_preview: 'Fresh source text from the smoke test.', annotations: [], metadata: {} });
      project.status = 'structuring';
      return route.fulfill(json({ success: true, source: detail.sources[0], normalized: { normalized_text: 'Fresh source text from the smoke test.' } }));
    }
    if (pathname === '/api/bna/studio/projects/101/storyboard' && request.method() === 'POST') {
      detail.scenes[0].title = 'Smoke Storyboard Scene';
      project.status = 'storyboard';
      return route.fulfill(json({ success: true, scenes: detail.scenes, storyboard: { scenes: detail.scenes } }));
    }
    if (pathname === '/api/bna/studio/projects/101/prompt-compile' && request.method() === 'POST') {
      const compiled = {
        compiled_hash: 'compiled-smoke',
        compiled_prompt: '### LAYER 1\nUNTRUSTED_SOURCE_BEGIN\nFresh source\nUNTRUSTED_SOURCE_END',
        layers: [{ layer_type: 'source_context', layer_key: 'source', label: 'Source', content: 'UNTRUSTED_SOURCE_BEGIN\nFresh source\nUNTRUSTED_SOURCE_END', hash: 'layer-hash' }],
      };
      detail.prompt_layers = compiled.layers.map((layer, index) => ({ ...layer, id: index + 1, status: 'active', layer_hash: layer.hash }));
      return route.fulfill(json({ success: true, compiled_prompt: compiled }));
    }
    if (pathname === '/api/bna/studio/projects/101/handoff' && request.method() === 'POST') {
      const handoff = { idempotency_key: 'studio_handoff_smoke', external_write_performed: false, no_publish: true };
      detail.exports = [{ id: 31, export_type: 'content_handoff', status: 'draft', content_job_id: 44, created_at: new Date('2026-06-23T10:00:00Z').toISOString() }];
      return route.fulfill(json({ success: true, handoff, export: detail.exports[0] }));
    }
    if (pathname.startsWith('/api/bna/')) {
      return route.fulfill(json({ success: true }));
    }
    return route.fulfill({ status: 404, contentType: 'text/plain', body: `Unhandled ${pathname}` });
  });

  try {
    await page.goto('http://studio-smoke.local/operations?view=studio&workspace=rabbi_sheller_provider&studio_project=101', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="service-provider-studio"]');
    assert.match(await page.locator('body').innerText(), /Universal Service Provider Studio/);
    assert.match(await page.locator('body').innerText(), /One Time Mishnah Studio Pilot/);
    await page.screenshot({ path: path.join(screenshotDir, 'desktop-overview.png'), fullPage: true });

    await page.getByRole('button', { name: /Source/ }).first().click();
    await page.locator('textarea[name="raw_text"]').fill('Fresh source text from the smoke test.');
    await page.getByRole('button', { name: 'Save Source' }).click();
    await page.waitForFunction(() => document.body.textContent.includes('Source saved and normalized.'));

    await page.getByRole('button', { name: /Storyboard/ }).first().click();
    await page.getByRole('button', { name: 'Generate Storyboard' }).click();
    await page.waitForFunction(() => document.body.textContent.includes('Storyboard generated.'));

    await page.getByRole('button', { name: /Prompts/ }).first().click();
    await page.getByRole('button', { name: 'Compile Prompt' }).click();
    await page.waitForFunction(() => document.body.textContent.includes('Latest Compiled Prompt'));

    await page.getByRole('button', { name: /Handoff/ }).first().click();
    await page.getByRole('button', { name: 'Create Content Handoff' }).click();
    await page.waitForFunction(() => document.body.textContent.includes('Content handoff created.'));

    await page.setViewportSize({ width: 390, height: 900 });
    await page.evaluate(() => window.toggleBnaHelper?.(false));
    await page.addStyleTag({ content: '.bna-helper-dock,.bna-helper-backdrop{display:none!important;}' });
    await page.waitForFunction(() => document.body.textContent.includes('Latest Handoff'));
    await page.evaluate(() => {
      const target = Array.from(document.querySelectorAll('h1,h2,h3,h4,section,article,div'))
        .find((node) => /\bLatest Handoff\b/.test(node.textContent || ''));
      target?.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, 'mobile-handoff.png'), fullPage: true });
    const body = await page.locator('body').innerText();
    assert.match(body, /It does not publish, send, schedule, upload, or call an external social provider/);
  } finally {
    await browser.close();
  }
});
