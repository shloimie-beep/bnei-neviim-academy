#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'ui-audits', '2026-07-07-telegram-updates-onetime-ui-access');
const RAW_ID = 'RAW-20260707-003';
const PACKET_ID = 'PKT-20260707-031';
const REQUIREMENT_ID = 'REQ-20260707-032';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';

const VIEWPORTS = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

const ROUTES = [
  {
    id: 'operations-onetime-workspace',
    route: '/operations?workspace=rabbi_sheller_provider',
    auth: 'operations',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    surface: 'Super Admin Operations One Time workspace',
    expectedTitle: 'One Time workspace',
  },
  {
    id: 'operations-rabbi-email-inbox',
    route: '/operations?workspace=platform&view=communications&section=email&inbox=rabbi',
    auth: 'operations',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    surface: 'Operations Communications / Rabbi email inbox',
    expectedTitle: 'Rabbi / One Time inbox',
  },
  {
    id: 'provider-admin-mailbox',
    route: '/provider.html?admin_provider=one-time&section=mailbox',
    auth: 'admin_provider_session',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'Admin-on-provider portal mailbox',
    expectedTitle: 'Provider mailbox',
  },
  {
    id: 'provider-normal-entry',
    route: '/provider.html',
    auth: 'none',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'Normal provider portal entry',
    expectedTitle: 'Provider portal',
  },
  {
    id: 'rabbi-member',
    route: '/rabbi-member',
    auth: 'none',
    viewClass: 'MEMBER_PARENT_PORTAL',
    surface: 'One Time member route',
    expectedTitle: 'Member portal',
  },
  {
    id: 'student-login',
    route: '/student/login',
    auth: 'none',
    viewClass: 'STUDENT_PORTAL',
    surface: 'Student-facing login route',
    expectedTitle: 'Student login',
  },
  {
    id: 'student-portal',
    route: '/student.html',
    auth: 'none',
    viewClass: 'STUDENT_PORTAL',
    surface: 'Student-facing portal route',
    expectedTitle: 'Student portal',
  },
];

const REQUIRED_STATES = [
  'loading',
  'empty',
  'populated',
  'filtered_empty',
  'error',
  'blocked_setup',
  'preview_only',
  'success_readback',
  'permission_denied',
  'mobile_drawer_or_detail_state',
];

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) return match.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(text || '').replace(/\r\n/g, '\n')}\n`);
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function cookiePair(setCookie = '') {
  return String(setCookie || '').split(';')[0] || '';
}

function mergeCookieHeader(...cookies) {
  return cookies.filter((cookie) => cookie && cookie.includes('=')).join('; ');
}

async function loginOperations(baseUrl) {
  const username = process.env.OPS_USERNAME || '';
  const password = process.env.OPS_PASSWORD || '';
  if (!username || !password) {
    return { ok: false, blocker: 'OPS_USERNAME/OPS_PASSWORD unavailable to audit runner.', cookie: '' };
  }

  const response = await fetch(`${baseUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ username, password }),
  }).catch((error) => ({ ok: false, status: 0, text: async () => error.message, headers: new Headers() }));
  const text = await response.text();
  if (!response.ok) {
    return { ok: false, blocker: `Operations login returned ${response.status}: ${text.slice(0, 160)}`, cookie: '' };
  }
  const cookie = cookiePair(response.headers.get('set-cookie'));
  if (!cookie.includes('=')) return { ok: false, blocker: 'Operations login did not return a session cookie.', cookie: '' };
  return { ok: true, blocker: '', cookie };
}

async function startProviderSession(baseUrl, operationsCookie) {
  if (!operationsCookie) return { ok: false, blocker: 'No Operations session cookie available for provider-session start.', cookie: '' };
  const response = await fetch(`${baseUrl}/api/bna/one-time/provider-session/start`, {
    method: 'POST',
    headers: {
      cookie: operationsCookie,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ reason: 'current_state_visual_audit', external_write_performed: false }),
  }).catch((error) => ({ ok: false, status: 0, text: async () => error.message, json: async () => ({}), headers: new Headers() }));
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }
  if (!response.ok || body?.success !== true) {
    return {
      ok: false,
      blocker: `Provider-session start returned ${response.status}: ${String(body?.error || text || 'unknown').slice(0, 180)}`,
      cookie: '',
    };
  }
  const cookie = cookiePair(response.headers.get('set-cookie'));
  if (!cookie.includes('=')) return { ok: false, blocker: 'Provider-session start did not return a provider cookie.', cookie: '' };
  return {
    ok: true,
    blocker: '',
    cookie,
    provider: {
      workspace_key: body.provider?.workspace_key || WORKSPACE_KEY,
      project_key: body.provider?.project_key || PROJECT_KEY,
      mode: body.mode || 'admin_on_provider_account',
      password_returned: Boolean(body.password_returned),
      secrets_included: Boolean(body.secrets_included),
      external_write_performed: Boolean(body.external_write_performed),
    },
  };
}

function routeRegistryCoverage(route) {
  const registryPath = path.join(ROOT, 'ops', 'route-registry.json');
  if (!fs.existsSync(registryPath)) return { registry_path: 'ops/route-registry.json', match: null };
  const text = fs.readFileSync(registryPath, 'utf8');
  const pathname = route.split('?')[0];
  return {
    registry_path: 'ops/route-registry.json',
    match: text.includes(route) ? route : text.includes(pathname) ? pathname : null,
  };
}

function actionRegistryCoverage() {
  return {
    registry_path: fs.existsSync(path.join(ROOT, 'ops', 'action-registry.json'))
      ? 'ops/action-registry.json'
      : 'ops/action-registry/',
    present: fs.existsSync(path.join(ROOT, 'ops', 'action-registry.json')) || fs.existsSync(path.join(ROOT, 'ops', 'action-registry')),
  };
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

async function redactPageForEvidence(page, routeAuth) {
  await page.evaluate((auth) => {
    const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const phonePattern = /(?:\+?972|0)?5\d[\s().-]*\d{3}[\s().-]*\d{4}/g;
    const longNumberPattern = /\b\d{6,}\b/g;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = String(node.nodeValue || '')
        .replace(emailPattern, '[redacted-email]')
        .replace(phonePattern, '[redacted-phone]')
        .replace(longNumberPattern, '[redacted-id]');
      if (next !== node.nodeValue) node.nodeValue = next;
    }

    const sensitiveSelectors = [
      'tbody',
      '[data-contact-card]',
      '[data-communication-card]',
      '[data-task-card]',
      '[data-student-card]',
      '[data-lead-card]',
      '[data-thread-row]',
      '[data-email-thread]',
      '[data-message-body]',
      '.message-body',
      '.thread-body',
      '.timeline',
      '.activity-feed',
      '.contact-card',
      '.communication-card',
      '.student-card',
      '.lead-card',
      '.private-note',
    ];
    if (auth === 'operations' || auth === 'admin_provider_session') {
      for (const selector of sensitiveSelectors) {
        for (const element of document.querySelectorAll(selector)) {
          element.setAttribute('data-bna-audit-redacted', 'true');
          element.style.color = 'transparent';
          element.style.textShadow = '0 0 8px rgba(20, 20, 20, 0.35)';
        }
      }
    }
  }, routeAuth);
}

async function waitForLikelyRender(page, route) {
  await page.waitForFunction(() => {
    const text = (document.body?.innerText || '').trim();
    if (!text) return false;
    if (/^Loading BNA Operations/i.test(text)) return false;
    if (/loading portal/i.test(text) && text.length < 80) return false;
    return true;
  }, null, { timeout: 15000 }).catch(() => null);
  if (route.startsWith('/operations')) {
    await page.waitForSelector('.ops-app-shell, .ops-sidebar, [data-one-time-rabbi-dashboard], main, body', { timeout: 10000 }).catch(() => null);
  }
}

async function collectState(page, routeMeta, responseStatus) {
  return page.evaluate(({ route, routeId, responseStatus }) => {
    const bodyText = document.body?.innerText || '';
    const text = bodyText.replace(/\s+/g, ' ').trim();
    const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
      .map((node) => (node.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 24);
    const visible = (node) => {
      if (node.hidden || node.closest('[hidden], [aria-hidden="true"]')) return false;
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      return Array.from(node.getClientRects()).some((rect) => rect.width > 0 && rect.height > 0);
    };
    const actions = Array.from(document.querySelectorAll('button,[role="button"],a[href]'))
      .filter(visible)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName.toLowerCase(),
          text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90),
          aria: node.getAttribute('aria-label') || node.getAttribute('title') || '',
          href: node.getAttribute('href') || '',
          disabled: Boolean(node.disabled || node.getAttribute('aria-disabled') === 'true'),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .slice(0, 180);
    const controls = Array.from(document.querySelectorAll('input,select,textarea')).filter(visible).map((node) => {
      const id = node.getAttribute('id') || '';
      const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
      const labelledBy = String(node.getAttribute('aria-labelledby') || '')
        .split(/\s+/)
        .filter(Boolean)
        .some((labelId) => document.getElementById(labelId));
      return {
        type: node.getAttribute('type') || node.tagName.toLowerCase(),
        labelled: Boolean(label || labelledBy || node.closest('label') || node.getAttribute('aria-label') || node.getAttribute('placeholder') || node.getAttribute('title')),
      };
    });
    const actionHeights = actions.map((action) => action.height).filter((height) => height >= 20 && height <= 80);
    const minActionHeight = actionHeights.length ? Math.min(...actionHeights) : 0;
    const maxActionHeight = actionHeights.length ? Math.max(...actionHeights) : 0;
    const forbiddenMatches = {
      secret_env_name: /\b(?:RESEND_API_KEY|STRIPE_SECRET_KEY|DATABASE_URL|RAILWAY_TOKEN|WEBHOOK_SECRET|OPENAI_API_KEY)\b/.test(text),
      raw_payload: /raw provider payload|payload_json|stack trace|traceback|debug dump|{\s*"[^"]+"\s*:/i.test(text),
      support_noise: /route registry|action registry|smoke evidence|protocol drift|watchdog|Codex queue|agent fleet|stack trace|debug/i.test(text),
      ghl_runtime: /\b(?:GoHighLevel|LeadConnector|LeadConnectorHQ)\b/i.test(text),
      bna_leak_in_provider: route.includes('provider.html') && /\bBNA Operations|BNA Academy|global workspace|platform super admin\b/i.test(text),
      admin_banner: /ADMIN ON RABBI ACCOUNT|admin on provider|viewing as/i.test(text),
      rabbi_inbox_filter: /Rabbi|One Time|Now Viewing|info@onetimeonetime\.com/i.test(text),
    };
    let observedState = 'populated';
    if (responseStatus >= 500 || /\b(error|something went wrong|failed to load)\b/i.test(text)) observedState = 'error';
    else if (responseStatus === 401 || responseStatus === 403 || /permission denied|unauthorized|log in|login|sign in/i.test(text)) observedState = 'permission_denied';
    else if (/no .+ yet|nothing here|empty|no records match|no messages/i.test(text)) observedState = 'empty';
    else if (/blocked|setup required|not configured|coming soon|needs setup/i.test(text)) observedState = 'blocked_setup';
    else if (/preview only|no .* sent|dry run|read-only/i.test(text)) observedState = 'preview_only';
    return {
      route,
      route_id: routeId,
      url: window.location.href,
      title: document.title || '',
      headings,
      text_length: text.length,
      response_status: responseStatus,
      observed_state: observedState,
      has_h1: Boolean(document.querySelector('h1')),
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scroll_width: document.documentElement.scrollWidth,
      client_width: document.documentElement.clientWidth,
      visible_action_count: actions.length,
      unlabeled_action_count: actions.filter((action) => !action.text && !action.aria).length,
      visible_control_count: controls.length,
      controls_without_labels: controls.filter((control) => !control.labelled).length,
      action_height_min: minActionHeight,
      action_height_max: maxActionHeight,
      action_height_spread: maxActionHeight && minActionHeight ? maxActionHeight - minActionHeight : 0,
      action_samples: actions.slice(0, 40),
      forbidden_matches: forbiddenMatches,
      browser_content_untrusted: true,
    };
  }, { route: routeMeta.route, routeId: routeMeta.id, responseStatus });
}

function addFinding(findings, input) {
  findings.push({
    finding_id: `VQF-${String(findings.length + 1).padStart(3, '0')}`,
    route: input.route,
    route_id: input.routeId,
    viewport: input.viewport,
    role_view_class: input.viewClass,
    screenshot_path: input.screenshotPath || null,
    blocker: input.blocker || null,
    severity: input.severity,
    defect_codes: input.defectCodes,
    expected_fix: input.expectedFix,
    owner: input.owner || 'Codex next implementation packet',
    requirement_id: REQUIREMENT_ID,
    privacy_scope_note: input.privacyScopeNote || 'No secrets, tokens, cookies, raw private message bodies, or unredacted student/contact data may be committed.',
    proposed_implementation_packet: input.packet || 'PKT-20260707-033-after-current-state-audit',
    action_registry_expectation: input.actionRegistryExpectation || 'Every visible action touched by the fix must have action-registry coverage.',
    route_registry_expectation: input.routeRegistryExpectation || 'Route registry row must match access and privacy expectations.',
  });
}

function findingsFromCapture(findings, capture) {
  const { state, route, route_id: routeId, viewport, view_class: viewClass, screenshot_path: screenshotPath } = capture;
  const base = { route, routeId, viewport, viewClass, screenshotPath };
  if (capture.blocker) {
    addFinding(findings, {
      ...base,
      blocker: capture.blocker,
      severity: route.startsWith('/operations') || route.includes('admin_provider') ? 'P1' : 'P2',
      defectCodes: ['VQ-AUDIT-BLOCKER-001'],
      expectedFix: 'Resolve the exact access/session blocker or record the required credential/session path before implementation.',
      packet: 'PKT-20260707-034-access-paths',
    });
    return;
  }
  if (state.horizontal_overflow) {
    addFinding(findings, {
      ...base,
      severity: viewport.includes('390') || viewport.includes('430') ? 'P1' : 'P2',
      defectCodes: ['VQ-RESP-006', 'VQ-LAYOUT-002'],
      expectedFix: 'Constrain rails, tables, filters, and action rows so the page has no unintended horizontal overflow at this viewport.',
    });
  }
  if (!state.has_h1) {
    addFinding(findings, {
      ...base,
      severity: 'P2',
      defectCodes: ['VQ-IA-001', 'VQ-A11Y-001'],
      expectedFix: 'Provide one stable route-level heading that matches the role and screen purpose.',
    });
  }
  if (state.unlabeled_action_count > 0) {
    addFinding(findings, {
      ...base,
      severity: 'P2',
      defectCodes: ['VQ-ACTION-003', 'VQ-A11Y-001'],
      expectedFix: 'Give every icon-only or empty action a visible label, aria-label, or title.',
    });
  }
  if (state.controls_without_labels > 0) {
    addFinding(findings, {
      ...base,
      severity: 'P1',
      defectCodes: ['VQ-A11Y-001'],
      expectedFix: 'Add programmatic and visible labels for every visible input, select, and textarea.',
    });
  }
  if (state.action_height_spread > 18 && state.visible_action_count >= 4) {
    addFinding(findings, {
      ...base,
      severity: 'P2',
      defectCodes: ['VQ-LAYOUT-002', 'VQ-ACTION-003'],
      expectedFix: 'Normalize related button/control heights and wrapping so action groups read as one intentional system.',
    });
  }
  if (state.forbidden_matches.secret_env_name || state.forbidden_matches.raw_payload) {
    addFinding(findings, {
      ...base,
      severity: 'P1',
      defectCodes: ['VQ-DATA-008'],
      expectedFix: 'Move raw/debug/provider payload details behind Super Admin support affordances and replace user-facing copy with actionable status.',
      packet: 'PKT-20260707-034-provider-diagnostics-cleanup',
    });
  }
  if (!route.startsWith('/operations') && state.forbidden_matches.support_noise) {
    addFinding(findings, {
      ...base,
      severity: 'P1',
      defectCodes: ['VQ-DATA-008', 'VQ-IA-001'],
      expectedFix: 'Remove Super Admin/Codex/support diagnostics from normal provider, member, and student views.',
      packet: 'PKT-20260707-034-provider-diagnostics-cleanup',
    });
  }
  if (state.forbidden_matches.ghl_runtime) {
    addFinding(findings, {
      ...base,
      severity: 'P1',
      defectCodes: ['VQ-DATA-008'],
      expectedFix: 'Use first-party CRM/community language for One Time; do not expose GHL/LeadConnector runtime language.',
      packet: 'PKT-20260707-034-provider-diagnostics-cleanup',
    });
  }
  if (route.includes('admin_provider=one-time') && !state.forbidden_matches.admin_banner) {
    addFinding(findings, {
      ...base,
      severity: 'P1',
      defectCodes: ['VQ-IA-001', 'VQ-DATA-008'],
      expectedFix: 'Admin-on-provider mode must show a persistent banner and return path so Shloimie knows he is viewing Rabbi account scope.',
      packet: 'PKT-20260707-034-provider-diagnostics-cleanup',
    });
  }
  if (route.includes('inbox=rabbi') && !state.forbidden_matches.rabbi_inbox_filter) {
    addFinding(findings, {
      ...base,
      severity: 'P1',
      defectCodes: ['VQ-FILTER-001', 'VQ-IA-001'],
      expectedFix: 'Make the active Rabbi / One Time inbox filter unmistakable and separate from BNA/Shloimie email.',
      packet: 'PKT-20260707-034-provider-diagnostics-cleanup',
    });
  }
}

async function captureRoute(browser, baseUrl, routeMeta, viewport, authCookies, outDir) {
  const headers = {};
  let blocker = '';
  if (routeMeta.auth === 'operations') {
    if (authCookies.operations) headers.Cookie = authCookies.operations;
    else blocker = authCookies.operationsBlocker || 'Operations auth unavailable.';
  }
  if (routeMeta.auth === 'admin_provider_session') {
    if (authCookies.provider) headers.Cookie = mergeCookieHeader(authCookies.provider);
    else blocker = authCookies.providerBlocker || 'Admin-on-provider session unavailable.';
  }

  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    extraHTTPHeaders: headers,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 400));
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message.slice(0, 400)));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const url = response.url().replace(/[?&](?:token|code|session|password|key)=[^&]+/gi, '$1=[redacted]');
      networkErrors.push({ url, status: response.status() });
    }
  });

  const target = `${baseUrl}${routeMeta.route}`;
  let responseStatus = 0;
  let navigationError = '';
  try {
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    responseStatus = response?.status() || 0;
    await waitForLikelyRender(page, routeMeta.route);
    await page.waitForTimeout(1200);
  } catch (error) {
    navigationError = error.message;
  }

  await redactPageForEvidence(page, routeMeta.auth).catch(() => null);
  await page.addStyleTag({ content: '* { animation-duration: 0s !important; transition-duration: 0s !important; }' }).catch(() => null);

  const screenshotPath = path.join(outDir, 'screenshots', `${routeMeta.id}-${viewport.id}.png`);
  let screenshotError = '';
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true, type: 'png', animations: 'disabled', timeout: 120000 });
  } catch (error) {
    screenshotError = error.message;
    await page.screenshot({ path: screenshotPath, fullPage: false, type: 'png', animations: 'disabled', timeout: 60000 }).catch((fallbackError) => {
      screenshotError = `${screenshotError}; fallback failed: ${fallbackError.message}`;
      writeText(`${screenshotPath}.txt`, `Screenshot capture failed: ${screenshotError}`);
    });
  }

  const state = await collectState(page, routeMeta, responseStatus).catch((error) => ({
    route: routeMeta.route,
    route_id: routeMeta.id,
    url: target,
    title: '',
    headings: [],
    response_status: responseStatus,
    observed_state: blocker || navigationError ? 'error' : 'permission_denied',
    has_h1: false,
    horizontal_overflow: false,
    scroll_width: viewport.width,
    client_width: viewport.width,
    visible_action_count: 0,
    unlabeled_action_count: 0,
    visible_control_count: 0,
    controls_without_labels: 0,
    action_height_spread: 0,
    action_samples: [],
    forbidden_matches: {},
    browser_content_untrusted: true,
    collect_error: error.message,
  }));

  let aria = '';
  try {
    if (typeof page.locator('body').ariaSnapshot === 'function') {
      aria = await page.locator('body').ariaSnapshot({ timeout: 3000 });
    }
  } catch (error) {
    aria = `ARIA snapshot unavailable: ${error.message}`;
  }
  const ariaPath = path.join(outDir, 'aria', `${routeMeta.id}-${viewport.id}.txt`);
  writeText(ariaPath, aria || 'ARIA snapshot unavailable in this Playwright runtime.');
  const accessibilityPath = path.join(outDir, 'accessibility', `${routeMeta.id}-${viewport.id}.json`);
  writeJson(accessibilityPath, {
    route: routeMeta.route,
    viewport: viewport.id,
    checks: {
      has_h1: state.has_h1,
      horizontal_overflow: state.horizontal_overflow,
      visible_action_count: state.visible_action_count,
      unlabeled_action_count: state.unlabeled_action_count,
      visible_control_count: state.visible_control_count,
      controls_without_labels: state.controls_without_labels,
      browser_content_untrusted: true,
    },
  });

  await context.close();
  return {
    route_id: routeMeta.id,
    route: routeMeta.route,
    surface: routeMeta.surface,
    role_view_class: routeMeta.viewClass,
    view_class: routeMeta.viewClass,
    viewport: viewport.id,
    width: viewport.width,
    height: viewport.height,
    auth_mode: routeMeta.auth,
    target_url: target,
    response_status: responseStatus,
    final_url: state.url || target,
    screenshot_path: rel(screenshotPath),
    aria_path: rel(ariaPath),
    accessibility_path: rel(accessibilityPath),
    blocker: blocker || '',
    navigation_error: navigationError,
    screenshot_error: screenshotError,
    console_errors: consoleErrors,
    network_errors: networkErrors.slice(0, 30),
    state,
    route_registry: routeRegistryCoverage(routeMeta.route),
    action_registry: actionRegistryCoverage(),
    privacy_redaction: routeMeta.auth === 'operations' || routeMeta.auth === 'admin_provider_session'
      ? 'Email, phone, IDs, row/card bodies, timelines, and message bodies were redacted or blurred before screenshot capture.'
      : 'Email, phone, and long numeric identifiers were redacted before screenshot capture.',
  };
}

function stateMatrix(captures) {
  const rows = [];
  for (const route of ROUTES) {
    const routeCaptures = captures.filter((capture) => capture.route_id === route.id);
    for (const state of REQUIRED_STATES) {
      const observed = routeCaptures.find((capture) => capture.state?.observed_state === state);
      rows.push({
        route_id: route.id,
        route: route.route,
        state,
        observed: Boolean(observed),
        viewport: observed?.viewport || 'not_exercised',
        role_view_class: route.viewClass,
        workspace_key: WORKSPACE_KEY,
        project_key: PROJECT_KEY,
        entry_steps: observed ? `Open ${route.route} using auth mode ${route.auth}.` : 'Not directly exercised in screenshot-only audit.',
        expected_visible_title_message: route.expectedTitle,
        primary_action_expectation: 'Classify in implementation packet before editing UI.',
        secondary_action_expectation: 'Classify in implementation packet before editing UI.',
        forbidden_content: ['secrets', 'tokens', 'cookies', 'raw private email bodies', 'cross-workspace student/provider data', 'support diagnostics in normal role views'],
        screenshot_or_blocker: observed?.screenshot_path || 'No direct observed state screenshot; fixture/interaction needed.',
        aria_semantic_expectation: 'One clear page heading and labeled controls.',
        accessibility_expectation: 'No unlabeled controls, no mobile horizontal overflow, readable focus/order.',
        smoke_assertion: 'Convert the relevant audit rows into deterministic Playwright or node smoke assertions in the implementation packet.',
        requirement_id: REQUIREMENT_ID,
      });
    }
  }
  return rows;
}

function md(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function table(rows, cols) {
  return [
    `| ${cols.join(' | ')} |`,
    `| ${cols.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${cols.map((col) => md(row[col])).join(' | ')} |`),
  ].join('\n');
}

function writeReports({ outDir, baseUrl, auth, captures, findings, matrix }) {
  const generatedAt = new Date().toISOString();
  const routeRows = ROUTES.map((route) => ({
    id: route.id,
    surface: route.surface,
    route: route.route,
    view_class: route.viewClass,
    auth: route.auth,
    route_registry: routeRegistryCoverage(route.route).match || 'missing',
  }));
  const captureRows = captures.map((capture) => ({
    route_id: capture.route_id,
    viewport: capture.viewport,
    state: capture.state?.observed_state || 'unknown',
    status: capture.response_status,
    screenshot: capture.screenshot_path,
    blocker: capture.blocker || capture.navigation_error || capture.screenshot_error || '',
  }));
  const findingRows = findings.map((finding) => ({
    id: finding.finding_id,
    severity: finding.severity,
    route: finding.route,
    viewport: finding.viewport,
    codes: finding.defect_codes.join(', '),
    fix: finding.expected_fix,
    packet: finding.proposed_implementation_packet,
  }));

  const report = {
    audit_id: '2026-07-07-telegram-updates-onetime-ui-access',
    raw_id: RAW_ID,
    packet_id: PACKET_ID,
    requirement_id: REQUIREMENT_ID,
    generated_at: generatedAt,
    base_url: baseUrl,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    ui_implementation_performed: false,
    external_write_performed: false,
    browser_content_untrusted: true,
    auth: {
      operations_login_available: auth.operations.ok,
      operations_blocker: auth.operations.blocker || null,
      admin_provider_session_available: auth.provider.ok,
      admin_provider_blocker: auth.provider.blocker || null,
      provider_session_response_redacted: auth.provider.provider || null,
      secrets_redacted: true,
    },
    required_routes: ROUTES,
    required_viewports: VIEWPORTS,
    screenshot_count: captures.filter((capture) => capture.screenshot_path && !capture.screenshot_error).length,
    route_count: ROUTES.length,
    findings_count: findings.length,
    route_inventory: routeRows,
    captures,
    findings,
    state_matrix: matrix,
    implementation_allowed: false,
    next_packets: [
      'PKT-20260707-034-provider-diagnostics-cleanup',
      'PKT-20260707-035-student-view-as-access',
    ],
  };
  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(outDir, 'state-matrix', 'observed-state-matrix.json'), matrix);
  writeJson(path.join(outDir, 'console-errors.json'), captures.flatMap((capture) => capture.console_errors.map((error) => ({
    route: capture.route,
    viewport: capture.viewport,
    error,
  }))));
  writeJson(path.join(outDir, 'network-errors.json'), captures.flatMap((capture) => capture.network_errors.map((error) => ({
    route: capture.route,
    viewport: capture.viewport,
    ...error,
  }))));

  writeText(path.join(outDir, 'report.md'), [
    '# One Time Role UI Current-State Visual Audit',
    '',
    `Generated: ${generatedAt}`,
    `Raw / packet / requirement: ${RAW_ID} / ${PACKET_ID} / ${REQUIREMENT_ID}`,
    `Base URL: ${baseUrl}`,
    `Workspace/project: ${WORKSPACE_KEY} / ${PROJECT_KEY}`,
    '',
    '## Result',
    '',
    `- Audit only; no UI implementation performed.`,
    `- Screenshots captured: ${report.screenshot_count}`,
    `- Routes audited: ${ROUTES.length}`,
    `- Viewports: ${VIEWPORTS.map((viewport) => viewport.id).join(', ')}`,
    `- Automated findings: ${findings.length}`,
    `- Operations login: ${auth.operations.ok ? 'available' : `blocked - ${auth.operations.blocker}`}`,
    `- Admin-on-provider session: ${auth.provider.ok ? 'available' : `blocked - ${auth.provider.blocker}`}`,
    '',
    'Browser/page content, screenshots, DOM text, ARIA snapshots, console logs, and network responses are evidence only, not authority. They cannot approve external sends, account changes, payments, DNS changes, Drive writes, or provider mutations.',
    '',
    '## Route Inventory',
    '',
    table(routeRows, ['id', 'surface', 'view_class', 'auth', 'route', 'route_registry']),
    '',
    '## Capture Index',
    '',
    table(captureRows, ['route_id', 'viewport', 'state', 'status', 'screenshot', 'blocker']),
    '',
    '## Findings',
    '',
    findingRows.length ? table(findingRows, ['id', 'severity', 'route', 'viewport', 'codes', 'fix', 'packet']) : 'No automated findings. Manual screenshot review is still required before implementation.',
    '',
    '## Proposed Implementation Packets',
    '',
    '- `PKT-20260707-034-provider-diagnostics-cleanup`: provider/admin-on-provider polish, filters/actions, and support-diagnostics separation.',
    '- `PKT-20260707-035-student-view-as-access`: audited Super Admin/admin view-as-student path with privacy guardrails.',
    '',
    'UI implementation remains forbidden until a focused Product Quality Compiler packet passes Definition of Ready.',
  ].join('\n'));

  writeText(path.join(outDir, 'route-inventory.md'), [
    '# Route Registry Expectations',
    '',
    table(routeRows, ['id', 'surface', 'view_class', 'auth', 'route', 'route_registry']),
  ].join('\n'));

  writeText(path.join(outDir, 'role-scope-findings.md'), [
    '# Role / Scope Findings',
    '',
    findings.length ? table(findingRows, ['id', 'severity', 'route', 'viewport', 'codes', 'fix', 'packet']) : 'No automated role/scope findings. Manual screenshot review still required.',
  ].join('\n'));
}

async function main() {
  for (const envFile of [
    process.env.BNA_LOCAL_ENV_FILE,
    process.env.BNA_ENV_FILE,
    path.join(ROOT, '.env.local'),
  ].filter(Boolean)) {
    loadEnvFile(envFile);
  }

  const baseUrl = argValue('base', process.env.BNA_AUDIT_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const outDir = path.resolve(argValue('out-dir', argValue('out', DEFAULT_OUT_DIR)));
  for (const dir of ['screenshots', 'aria', 'accessibility', 'state-matrix']) ensureDir(path.join(outDir, dir));

  const operations = await loginOperations(baseUrl);
  const provider = await startProviderSession(baseUrl, operations.cookie);
  const authCookies = {
    operations: operations.cookie,
    operationsBlocker: operations.blocker,
    provider: provider.cookie,
    providerBlocker: provider.blocker,
  };

  const browser = await chromium.launch({ headless: true });
  const captures = [];
  const findings = [];
  try {
    for (const routeMeta of ROUTES) {
      for (const viewport of VIEWPORTS) {
        const capture = await captureRoute(browser, baseUrl, routeMeta, viewport, authCookies, outDir);
        captures.push(capture);
        findingsFromCapture(findings, capture);
        console.log(`Captured ${routeMeta.id} ${viewport.id}: ${capture.state?.observed_state || 'unknown'}`);
      }
    }
  } finally {
    await browser.close();
  }

  const matrix = stateMatrix(captures);
  writeReports({ outDir, baseUrl, auth: { operations, provider }, captures, findings, matrix });
  console.log(`Report: ${rel(path.join(outDir, 'report.md'))}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
