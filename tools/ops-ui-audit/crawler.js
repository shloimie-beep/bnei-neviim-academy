const fs = require('node:fs');
const path = require('node:path');
const { timestampForRun } = require('./config');
const { collectControlsAndLinks, collectStateContext, runAccessibilityChecks, runDetectors } = require('./detectors');
const { createReviewPackage } = require('./package-export');
const { writeReports } = require('./reporter');
const { captureStateScreenshots, generateContactSheets } = require('./screenshots');
const { classifyAction, isOperationsSafeHref, shouldBlockRequest } = require('./safe-actions');
const { buildStateFingerprint, normalizeUrl } = require('./state-discovery');

async function runAudit(config, options = {}) {
  if (options.smokeLogin) return smokeLogin(config);
  if (!fs.existsSync(config.storageStatePath)) {
    throw new Error(`Missing Operations storage state. Run npm run ops:audit:auth first. Expected: ${config.storageStatePath}`);
  }
  const { chromium } = require('playwright');
  const startedAt = new Date();
  const run = createRun(config, startedAt);
  const browser = await chromium.launch({ headless: options.headed ? false : config.headless });
  const context = await browser.newContext({ storageState: config.storageStatePath, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeoutMs);
  const consoleErrors = [];
  const networkErrors = [];
  const blockedRequests = [];
  page.on('console', (message) => {
    if (['error'].includes(message.type())) {
      consoleErrors.push({ type: message.type(), text: message.text(), location: message.location() });
    }
  });
  page.on('pageerror', (err) => consoleErrors.push({ type: 'pageerror', text: String(err && err.message || err) }));
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && sameOrigin(url, config.baseUrl)) {
      networkErrors.push({ url: safeUrl(url, config.baseUrl), status, statusText: response.statusText() });
    }
  });
  await context.route('**/*', async (route) => {
    const decision = shouldBlockRequest(route.request(), config.baseUrl);
    if (decision.block) {
      blockedRequests.push({ url: safeUrl(route.request().url(), config.baseUrl), method: route.request().method(), reason: decision.reason });
      await route.abort('blockedbyclient');
    } else {
      await route.continue();
    }
  });
  await page.goto(config.startUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
  await settle(page);
  if (await isLoginPage(page)) {
    await browser.close();
    throw new Error('Operations session appears expired. Rerun npm run ops:audit:auth.');
  }

  const stateMap = { states: [], edges: [], unvisitedControls: [] };
  const routeMap = { routes: [] };
  const allControls = [];
  const allLinks = [];
  const allIssues = [];
  const allScreenshots = [];
  const allAccessibility = [];
  const seen = new Map();
  const queue = [];
  let incomplete = false;

  async function recordCurrentState(source = 'initial') {
    await settle(page);
    const contextInfo = await collectStateContext(page, config);
    const fingerprint = buildStateFingerprint({ ...contextInfo, baseUrl: config.baseUrl });
    if (seen.has(fingerprint)) return seen.get(fingerprint);
    const state = {
      id: `STATE-${String(stateMap.states.length + 1).padStart(3, '0')}`,
      index: stateMap.states.length + 1,
      fingerprint,
      source,
      url: page.url(),
      route: normalizeUrl(page.url(), config.baseUrl),
      ...contextInfo,
    };
    seen.set(fingerprint, state);
    stateMap.states.push(state);
    if (!routeMap.routes.some((item) => item.route === state.route)) {
      routeMap.routes.push({ route: state.route, firstStateId: state.id, title: state.title, module: state.module });
    }
    const controls = await collectControlsAndLinks(page);
    for (const control of controls) {
      allControls.push({ ...control, stateId: state.id, route: state.route });
      if (control.href) allLinks.push({ stateId: state.id, route: state.route, label: control.label, href: safeUrl(control.href, config.baseUrl), selector: control.selector });
    }
    const shots = await captureStateScreenshots(page, state, run, config);
    allScreenshots.push(...shots.map(({ absolutePath, ...rest }) => rest));
    for (const viewport of config.viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await settle(page);
      const shot = shots.find((item) => item.viewport === viewport.name);
      allIssues.push(...await runDetectors(page, state, viewport, shot?.path || ''));
    }
    allAccessibility.push({ stateId: state.id, route: state.route, ...(await runAccessibilityChecks(page, state)) });
    queue.push(state);
    return state;
  }

  await recordCurrentState();

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    if (stateMap.states.length >= config.maxStates) {
      incomplete = true;
      break;
    }
    const source = queue[queueIndex];
    await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs }).catch(() => {});
    await settle(page);
    const controls = (await collectControlsAndLinks(page)).slice(0, config.maxActionsPerState);
    for (const control of controls) {
      const actionInfo = classifyAction(control);
      if (!actionInfo.safe || (control.href && !isOperationsSafeHref(control.href, config.baseUrl))) {
        const reason = control.href && !isOperationsSafeHref(control.href, config.baseUrl) ? 'outside Operations audit scope' : actionInfo.reason;
        stateMap.unvisitedControls.push({ stateId: source.id, label: control.label, selector: control.selector, href: safeUrl(control.href, config.baseUrl), reason });
        continue;
      }
      const beforeUrl = page.url();
      const beforeText = await mainText(page);
      let error = '';
      try {
        await page.locator(control.selector).first().click({ timeout: 5000 });
        await settle(page);
      } catch (err) {
        error = String(err && err.message || err).slice(0, 500);
      }
      const afterUrl = page.url();
      const afterText = await mainText(page);
      const target = error ? source : await recordCurrentState(`action:${control.label}`);
      stateMap.edges.push({
        sourceStateId: source.id,
        targetStateId: target.id,
        actionLabel: control.label,
        selector: control.selector,
        role: control.role || control.tag,
        urlChanged: normalizeUrl(beforeUrl, config.baseUrl) !== normalizeUrl(afterUrl, config.baseUrl),
        mainContentChanged: beforeText !== afterText,
        skippedAsRisky: false,
        error,
      });
      await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs }).catch(() => {});
      await settle(page);
      if (stateMap.states.length >= config.maxStates) {
        incomplete = true;
        break;
      }
    }
  }

  const contactSheets = await generateContactSheets(browser, run, config, allScreenshots);
  const metadata = {
    baseUrl: config.baseUrl,
    startPath: config.startPath,
    startUrl: config.startUrl,
    runDir: run.dir,
    runDirRelative: path.relative(config.repoRoot, run.dir).replace(/\\/g, '/'),
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    storageStateUsed: path.relative(config.repoRoot, config.storageStatePath).replace(/\\/g, '/'),
    privacyMode: config.privacyMode,
    viewports: config.viewports,
    incomplete,
    blockedRequests,
    contactSheets,
    canonicalOperations: 'Express GET /operations with requireAdmin serves public/operations.html; public/operations-login.html handles login.',
  };
  const data = {
    metadata,
    routeMap,
    stateMap,
    issues: allIssues,
    links: allLinks,
    controls: [...allControls, ...blockedRequests.map((item) => ({ ...item, skipped: true, reason: item.reason }))],
    consoleErrors,
    networkErrors,
    accessibility: allAccessibility,
    screenshots: allScreenshots,
  };
  writeReports(run, data);
  const packaged = createReviewPackage(run.dir);
  const latest = {
    date: metadata.finishedAt,
    baseUrl: config.baseUrl,
    runPath: path.relative(config.repoRoot, run.dir).replace(/\\/g, '/'),
    zipPath: path.relative(config.repoRoot, packaged.outputPath).replace(/\\/g, '/'),
  };
  fs.mkdirSync(path.dirname(config.latestPath), { recursive: true });
  fs.writeFileSync(config.latestPath, `${JSON.stringify(latest, null, 2)}\n`);
  await browser.close();
  return { runDir: run.dir, zipPath: packaged.outputPath, metadata };
}

function createRun(config, date) {
  const name = `${timestampForRun(date)}-operations-ui`;
  const dir = path.join(config.outputRoot, name);
  const screenshotsDir = path.join(dir, 'screenshots');
  const contactSheetsDir = path.join(dir, 'contact-sheets');
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(contactSheetsDir, { recursive: true });
  for (const viewport of config.viewports) fs.mkdirSync(path.join(screenshotsDir, viewport.name), { recursive: true });
  return { dir, screenshotsDir, contactSheetsDir };
}

async function smokeLogin(config) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: config.headless });
  const page = await browser.newPage();
  await page.goto(config.startUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
  await settle(page);
  const login = await isLoginPage(page);
  const result = { ok: login, url: page.url(), expected: 'unauthenticated browser reaches Operations login' };
  await browser.close();
  return result;
}

async function isLoginPage(page) {
  const url = page.url();
  if (/operations-login|login/i.test(url)) return true;
  return page.locator('input[type="password"], text=/Sign in to BNA Operations/i').first().isVisible({ timeout: 1500 }).catch(() => false);
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(200).catch(() => {});
}

async function mainText(page) {
  return page.evaluate(() => (document.querySelector('main')?.innerText || document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 2000)).catch(() => '');
}

function sameOrigin(url, baseUrl) {
  try {
    return new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function safeUrl(url, baseUrl) {
  try {
    const parsed = new URL(url, baseUrl);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return String(url || '');
  }
}

module.exports = {
  createRun,
  runAudit,
  smokeLogin,
};
