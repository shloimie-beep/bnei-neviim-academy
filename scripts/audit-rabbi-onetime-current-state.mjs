#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const DEFAULT_OUT = path.join(ROOT, 'ops', 'ui-audits', '2026-07-01-rabbi-onetime-current-state');
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const REQUIREMENT_ID = 'REQ-20260701-404';

const VIEWPORTS = [
  { label: '1440-desktop', width: 1440, height: 1000 },
  { label: '1024-desktop-tablet', width: 1024, height: 900 },
  { label: '768-tablet', width: 768, height: 900 },
  { label: '430-mobile', width: 430, height: 932 },
  { label: '390-mobile', width: 390, height: 844 },
];

const ROUTES = [
  {
    id: 'operations-overview',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'Operations One Time overview',
  },
  {
    id: 'operations-participants',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'CRM contacts / participants',
  },
  {
    id: 'operations-crm-contacts',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'One Time CRM contact review',
  },
  {
    id: 'operations-communications',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=providers',
    viewClass: 'EMAIL_PROVIDER_SETUP',
    surface: 'Communications readiness',
  },
  {
    id: 'operations-library',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=one_time_library',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'One Time content library',
  },
  {
    id: 'operations-automations',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=automations&section=center',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    surface: 'Automation center',
  },
  {
    id: 'operations-access',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=access',
    viewClass: 'PAYMENT_PROVIDER_SETUP',
    surface: 'Payments and access',
  },
  {
    id: 'operations-tasks',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=tasks&section=one_time&project=one_time_mishnah_class',
    viewClass: 'RABBI_PROVIDER_ADMIN',
    surface: 'Tasks and decisions',
  },
  {
    id: 'operations-settings',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=settings&section=workspace',
    viewClass: 'SHLOIMIE_PLATFORM_SUPPORT',
    surface: 'Workspace settings',
  },
  { id: 'one-time-public', route: '/one-time', viewClass: 'PUBLIC_MARKETING', surface: 'One Time public landing' },
  { id: 'one-time-member-login', route: '/one-time/member-login', viewClass: 'MEMBER_PARENT_PORTAL', surface: 'One Time member login' },
  { id: 'provider-review', route: '/provider.html?review=one-time', viewClass: 'RABBI_PROVIDER_ADMIN', surface: 'Provider review portal' },
  { id: 'parent-review', route: '/parent.html?review=one-time', viewClass: 'MEMBER_PARENT_PORTAL', surface: 'Parent portal review' },
  { id: 'student-review', route: '/student.html?review=one-time', viewClass: 'STUDENT_PORTAL', surface: 'Student portal review' },
  {
    id: 'one-time-classroom-review',
    route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    viewClass: 'STUDENT_PORTAL',
    surface: 'One Time classroom review',
  },
  { id: 'one-time-email-review', route: '/one-time-email-review.html', viewClass: 'EMAIL_PROVIDER_SETUP', surface: 'One Time email review' },
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

function argValues(name) {
  const raw = argValue(name, '');
  return String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${value.replace(/\r\n/g, '\n')}\n`);
}

function slug(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'route';
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function isOperationsRoute(route = '') {
  return route.startsWith('/operations');
}

async function loginOperations(baseUrl) {
  const username = process.env.OPS_USERNAME || '';
  const password = process.env.OPS_PASSWORD || '';
  if (!username || !password) {
    return { ok: false, blocker: 'OPS_USERNAME/OPS_PASSWORD not available to audit runner.', cookieHeader: '' };
  }
  const response = await fetch(`${baseUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  }).catch((error) => ({ ok: false, status: 0, text: async () => error.message, headers: new Headers() }));
  const text = await response.text();
  if (!response.ok) {
    return { ok: false, blocker: `Operations login returned ${response.status}: ${text.slice(0, 160)}`, cookieHeader: '' };
  }
  const setCookie = response.headers.get('set-cookie') || '';
  const cookieHeader = setCookie.split(';')[0] || '';
  if (!cookieHeader.includes('=')) {
    return { ok: false, blocker: 'Operations login succeeded but did not return a session cookie.', cookieHeader: '' };
  }
  return { ok: true, cookieHeader, blocker: '' };
}

function routeRegistryCoverage(route) {
  const registryPath = path.join(ROOT, 'ops', 'route-registry.json');
  if (!fs.existsSync(registryPath)) return { present: false, registry_path: 'ops/route-registry.json', match: null };
  const text = fs.readFileSync(registryPath, 'utf8');
  const pathname = route.split('?')[0];
  return {
    present: true,
    registry_path: 'ops/route-registry.json',
    match: text.includes(route) ? route : text.includes(pathname) ? pathname : null,
  };
}

function actionRegistryPresent() {
  return fs.existsSync(path.join(ROOT, 'ops', 'action-registry.json')) || fs.existsSync(path.join(ROOT, 'ops', 'action-registry'));
}

async function redactPrivateEvidence(page, route) {
  await page.evaluate((isOps) => {
    const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const phonePattern = /(?:\+?972|0)?5\d[\s().-]*\d{3}[\s().-]*\d{4}/g;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = String(node.nodeValue || '')
        .replace(emailPattern, '[redacted-email]')
        .replace(phonePattern, '[redacted-phone]');
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    if (!isOps) return;
    const selectors = [
      'tbody',
      '[data-contact-card]',
      '[data-communication-card]',
      '[data-task-card]',
      '[data-student-card]',
      '[data-lead-card]',
      '.contact-card',
      '.communication-card',
      '.task-card',
      '.student-card',
      '.lead-card',
      '.timeline',
      '.activity-feed',
      '.message-body',
      '.private-note',
    ];
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        element.setAttribute('data-bna-audit-redacted', 'true');
        element.style.color = 'transparent';
        element.style.textShadow = '0 0 8px rgba(20, 20, 20, 0.35)';
      }
    }
  }, isOperationsRoute(route));
}

async function waitForOperationsRender(page, route) {
  if (!isOperationsRoute(route)) return;
  await page.waitForFunction(() => {
    const text = (document.body?.innerText || '').trim();
    if (!text) return false;
    if (/^Loading BNA Operations/i.test(text)) return false;
    return Boolean(document.querySelector('.ops-app-shell, .ops-sidebar, .page-heading, [data-one-time-rabbi-dashboard]'));
  }, null, { timeout: 15000 }).catch(() => null);
}

async function collectPageState(page, route, responseStatus) {
  return page.evaluate(({ route, responseStatus }) => {
    const text = document.body?.innerText || '';
    const title = document.title || '';
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 20).map((node) => node.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean);
    const buttons = Array.from(document.querySelectorAll('button,[role="button"],a[href]')).map((node) => ({
      tag: node.tagName.toLowerCase(),
      text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      aria: node.getAttribute('aria-label') || node.getAttribute('title') || '',
      disabled: Boolean(node.disabled || node.getAttribute('aria-disabled') === 'true'),
      href: node.getAttribute('href') || '',
    })).slice(0, 160);
    const unlabeledButtons = buttons.filter((button) => !button.text && !button.aria).length;
    const isVisibleFormControl = (node) => {
      const type = String(node.getAttribute('type') || '').toLowerCase();
      if (type === 'hidden' || node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
      if (node.closest('[hidden], [aria-hidden="true"]')) return false;
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      return Array.from(node.getClientRects()).some((rect) => rect.width > 0 && rect.height > 0);
    };
    const inputs = Array.from(document.querySelectorAll('input,select,textarea')).filter(isVisibleFormControl).map((node) => {
      const id = node.getAttribute('id') || '';
      const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
      const ariaLabelledBy = node.getAttribute('aria-labelledby') || '';
      const labelledBy = ariaLabelledBy
        ? ariaLabelledBy.split(/\s+/).some((labelId) => labelId && document.getElementById(labelId))
        : false;
      return {
        type: node.getAttribute('type') || node.tagName.toLowerCase(),
        labelled: Boolean(label || labelledBy || node.closest('label') || node.getAttribute('aria-label') || node.getAttribute('placeholder') || node.getAttribute('title')),
      };
    });
    const forbiddenMatches = {
      raw_json: /{\s*"[^"]+"\s*:/.test(text),
      provider_payload: /raw provider payload|payload_json|provider payload/i.test(text),
      secret_env_name: /\b(?:RESEND_API_KEY|STRIPE_SECRET_KEY|DATABASE_URL|RAILWAY_TOKEN|WEBHOOK_SECRET)\b/.test(text),
      ghl_runtime: /\b(?:GoHighLevel|LeadConnector|LeadConnectorHQ)\b/i.test(text),
      support_noise: /route registry|action registry|smoke evidence|stack trace|debug/i.test(text),
      workspace_contamination_terms: /\b(?:BNA WhatsApp|global WAPI|unrelated workspace|cross-workspace)\b/i.test(text),
    };
    const lowerText = text.toLowerCase();
    let observedState = 'populated';
    if (responseStatus >= 500 || /\b(error|something went wrong)\b/i.test(text)) observedState = 'error';
    else if (responseStatus === 401 || responseStatus === 403 || /permission denied|not authorized|log in|login|sign in/i.test(text)) observedState = 'permission_denied';
    else if (/no .+ yet|nothing here|empty|no records match/i.test(lowerText)) observedState = 'empty';
    else if (/blocked|setup required|not configured|coming soon/i.test(lowerText)) observedState = 'blocked_setup';
    else if (/preview only|no .* sent|dry run|read-only/i.test(lowerText)) observedState = 'preview_only';
    return {
      route,
      response_status: responseStatus,
      url: window.location.href,
      title,
      headings,
      has_h1: Boolean(document.querySelector('h1')),
      button_count: buttons.length,
      unlabeled_button_count: unlabeledButtons,
      visible_input_count: inputs.length,
      inputs_without_labels: inputs.filter((input) => !input.labelled).length,
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      scroll_width: document.documentElement.scrollWidth,
      client_width: document.documentElement.clientWidth,
      text_length: text.length,
      forbidden_matches: forbiddenMatches,
      observed_state: observedState,
      action_samples: buttons,
      browser_content_untrusted: true,
    };
  }, { route, responseStatus });
}

function addFinding(findings, input) {
  const id = `VQF-${String(findings.length + 1).padStart(3, '0')}`;
  findings.push({
    finding_id: id,
    route: input.route,
    viewport: input.viewport,
    screenshot_path: input.screenshot_path,
    defect_codes: input.defect_codes,
    severity: input.severity,
    classification: input.classification,
    user_impact: input.user_impact,
    expected_fix: input.expected_fix,
    owner: input.owner || 'Codex next implementation packet',
    requirement_id: REQUIREMENT_ID,
    terminal_status: 'open_audit_finding',
    before_evidence: input.screenshot_path,
    after_evidence_or_blocker: 'Not applicable in audit-only packet.',
  });
}

function findingsFromState(findings, capture) {
  const { state, routeMeta, viewport, screenshotPath } = capture;
  const base = {
    route: routeMeta.route,
    viewport: viewport.label,
    screenshot_path: screenshotPath,
  };
  if (state.horizontal_overflow) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-RESP-001', 'VQ-LAYOUT-007'],
      severity: viewport.width <= 430 ? 'P1' : 'P2',
      classification: ['PLATFORM_STANDARD'],
      user_impact: 'The page horizontally overflows, making the workflow feel broken and difficult on the audited viewport.',
      expected_fix: 'Constrain layout, tables, rails, drawers, and action rows so the audited viewport has no unintended horizontal page overflow.',
    });
  }
  if (!state.has_h1) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-IA-006', 'VQ-A11Y-007'],
      severity: 'P2',
      classification: ['PLATFORM_STANDARD'],
      user_impact: 'The user and assistive technology cannot identify the screen purpose from a stable page heading.',
      expected_fix: 'Add one clear route-level heading that matches the user mental model for this surface.',
    });
  }
  if (state.unlabeled_button_count > 0) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-A11Y-004', 'VQ-ACTION-003'],
      severity: 'P2',
      classification: ['PLATFORM_STANDARD'],
      user_impact: `${state.unlabeled_button_count} action(s) lack visible text or an accessible label.`,
      expected_fix: 'Give every icon-only or empty action a visible label, aria-label, title, or replace it with a clearly labeled control.',
    });
  }
  if (state.inputs_without_labels > 0) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-A11Y-006'],
      severity: 'P1',
      classification: ['PLATFORM_STANDARD'],
      user_impact: `${state.inputs_without_labels} field(s) lack clear labels/instructions.`,
      expected_fix: 'Add programmatic labels and visible instructions for every form control.',
    });
  }
  if (state.forbidden_matches.secret_env_name || state.forbidden_matches.provider_payload || state.forbidden_matches.raw_json) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-DATA-004', 'VQ-CRED-002'],
      severity: 'P1',
      classification: ['SUPPORT_ONLY_VISIBILITY_BUG'],
      user_impact: 'A user-facing view appears to expose raw/internal implementation or provider setup details.',
      expected_fix: 'Move raw/debug/provider details behind a support drawer or replace with user-actionable status copy.',
    });
  }
  if (state.forbidden_matches.ghl_runtime) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-CRED-002'],
      severity: 'P1',
      classification: ['WORKSPACE_SPECIFIC_CONFIG'],
      user_impact: 'A first-party BNA / One Time view references GHL/LeadConnector language against current no-GHL policy.',
      expected_fix: 'Remove active GHL/LeadConnector references from normal One Time UI and use first-party CRM pattern language.',
    });
  }
  if (isOperationsRoute(routeMeta.route) && state.forbidden_matches.support_noise) {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-IA-004', 'VQ-CRED-005'],
      severity: 'P2',
      classification: ['SUPPORT_ONLY_VISIBILITY_BUG'],
      user_impact: 'Support/protocol/debug wording appears in a Rabbi/provider workflow where it may distract or confuse.',
      expected_fix: 'Keep support diagnostics in a role-gated support drawer and show only actionable readiness/status in the Rabbi workflow.',
    });
  }
  if (routeMeta.id.includes('participants') && state.observed_state === 'populated') {
    addFinding(findings, {
      ...base,
      defect_codes: ['VQ-CRM-001', 'VQ-CRM-003'],
      severity: 'P2',
      classification: ['PLATFORM_STANDARD'],
      user_impact: 'CRM route requires human review against list/detail and contact-drawer standards before implementation.',
      expected_fix: 'Verify contacts use searchable list/detail or pipeline structure with lifecycle, source, last activity, next action, and scoped communication history.',
    });
  }
}

async function captureRoute(browser, baseUrl, routeMeta, viewport, cookieHeader, outDir) {
  const headers = cookieHeader && isOperationsRoute(routeMeta.route) ? { Cookie: cookieHeader } : {};
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    extraHTTPHeaders: headers,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 500));
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message.slice(0, 500)));
  page.on('response', (response) => {
    if (response.status() >= 400) networkErrors.push({ url: response.url(), status: response.status() });
  });

  const target = `${baseUrl}${routeMeta.route}`;
  let responseStatus = 0;
  let navigationError = null;
  try {
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    responseStatus = response?.status() || 0;
    await page.waitForTimeout(1800);
    await waitForOperationsRender(page, routeMeta.route);
  } catch (error) {
    navigationError = error.message;
  }
  await redactPrivateEvidence(page, routeMeta.route).catch(() => null);
  await page.addStyleTag({
    content: '* { animation-duration: 0s !important; transition-duration: 0s !important; }',
  }).catch(() => null);

  const screenshotName = `${routeMeta.id}-${viewport.label}.png`;
  const screenshotPath = path.join(outDir, 'screenshots', screenshotName);
  let screenshotError = null;
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 120000 });
  } catch (error) {
    screenshotError = error.message;
    await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 60000 }).catch((fallbackError) => {
      screenshotError = `${screenshotError}; viewport fallback failed: ${fallbackError.message}`;
      writeText(`${screenshotPath}.txt`, `Screenshot capture failed: ${screenshotError}`);
    });
  }

  const state = await collectPageState(page, routeMeta.route, responseStatus).catch((error) => ({
    route: routeMeta.route,
    response_status: responseStatus,
    url: target,
    title: '',
    headings: [],
    has_h1: false,
    button_count: 0,
    unlabeled_button_count: 0,
    visible_input_count: 0,
    inputs_without_labels: 0,
    horizontal_overflow: false,
    scroll_width: viewport.width,
    client_width: viewport.width,
    text_length: 0,
    forbidden_matches: {},
    observed_state: navigationError ? 'error' : 'permission_denied',
    action_samples: [],
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
  const ariaPath = path.join(outDir, 'aria', `${routeMeta.id}-${viewport.label}.txt`);
  writeText(ariaPath, aria || 'ARIA snapshot unavailable in this Playwright runtime.');

  const accessibilityPath = path.join(outDir, 'accessibility', `${routeMeta.id}-${viewport.label}.json`);
  writeJson(accessibilityPath, {
    route: routeMeta.route,
    viewport: viewport.label,
    checks: {
      horizontal_overflow: state.horizontal_overflow,
      unlabeled_button_count: state.unlabeled_button_count,
      visible_input_count: state.visible_input_count,
      inputs_without_labels: state.inputs_without_labels,
      has_h1: state.has_h1,
      browser_content_untrusted: true,
    },
    note: 'Automated heuristics supplement, not replace, visual inspection and axe/manual accessibility review.',
  });

  await context.close();
  return {
    route: routeMeta.route,
    route_id: routeMeta.id,
    surface: routeMeta.surface,
    view_class: routeMeta.viewClass,
    viewport: viewport.label,
    width: viewport.width,
    height: viewport.height,
    target_url: target,
    response_status: responseStatus,
    final_url: state.url || target,
    screenshot_path: path.relative(ROOT, screenshotPath).replace(/\\/g, '/'),
    aria_path: path.relative(ROOT, ariaPath).replace(/\\/g, '/'),
    accessibility_path: path.relative(ROOT, accessibilityPath).replace(/\\/g, '/'),
    navigation_error: navigationError,
    screenshot_error: screenshotError,
    console_errors: consoleErrors,
    network_errors: networkErrors.slice(0, 25),
    state,
    route_registry: routeRegistryCoverage(routeMeta.route),
    action_registry_present: actionRegistryPresent(),
    privacy_redaction: isOperationsRoute(routeMeta.route)
      ? 'Operations screenshot text was client-side redacted for emails/phones and likely row/card bodies before capture.'
      : 'Email/phone text was client-side redacted before capture.',
  };
}

function buildStateMatrix(captures, requirementId = REQUIREMENT_ID) {
  const byRoute = new Map();
  for (const capture of captures) {
    if (!byRoute.has(capture.route_id)) byRoute.set(capture.route_id, []);
    byRoute.get(capture.route_id).push(capture);
  }
  const rows = [];
  for (const [routeId, routeCaptures] of byRoute.entries()) {
    const route = routeCaptures[0];
    for (const state of REQUIRED_STATES) {
      const observed = routeCaptures.find((capture) => capture.state.observed_state === state);
      rows.push({
        route_id: routeId,
        route: route.route,
        state,
        observed: Boolean(observed),
        viewport: observed?.viewport || 'not_exercised',
        auth_role: route.route.startsWith('/operations') ? 'OPS_USER if login succeeded, otherwise logged-out/auth-blocker' : route.view_class,
        workspace_key: WORKSPACE_KEY,
        project_key: PROJECT_KEY,
        how_to_enter_state: observed ? 'Captured directly during current-state audit.' : 'Not exercised in screenshot-only audit; implementation packet must define fixture or interaction path.',
        expected_visible_title: route.surface,
        expected_visible_message: observed ? 'Observed in screenshot evidence.' : 'Must be specified in follow-up implementation packet.',
        expected_primary_action: 'Must be classified by follow-up implementation packet.',
        expected_secondary_actions: [],
        forbidden_content: ['secrets', 'raw provider payloads', 'raw private contact/student/parent data', 'GHL runtime references'],
        screenshot_required: true,
        screenshot_path: observed?.screenshot_path || null,
        aria_semantic_expectation: 'Clear page heading, labeled controls, and role-appropriate structure.',
        accessibility_expectation: 'No P0/P1 accessibility defect; no mobile overflow; controls labeled.',
        test_smoke_assertion: 'Follow-up packet must convert this audit row into deterministic smoke assertions where feasible.',
        requirement_id: requirementId,
      });
    }
  }
  return rows;
}

function markdownTable(rows, columns) {
  const header = `| ${columns.join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(row[column] ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  return [header, sep, ...body].join('\n');
}

function writeReports({ outDir, baseUrl, auth, captures, findings, stateMatrix, routes = ROUTES, runMeta = {} }) {
  const routeRows = routes.map((route) => ({
    id: route.id,
    route: route.route,
    surface: route.surface,
    view_class: route.viewClass,
    route_registry: routeRegistryCoverage(route.route).match || 'missing',
  }));

  const report = {
    audit_id: runMeta.auditId || '2026-07-01-rabbi-onetime-current-state',
    raw_id: runMeta.rawId || 'RAW-20260701-004',
    parent_packet_raw_id: runMeta.parentRawId || 'RAW-20260701-003',
    packet_id: runMeta.packetId || 'PKT-20260701-112',
    requirement_id: runMeta.requirementId || REQUIREMENT_ID,
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    auth: {
      operations_login_available: auth.ok,
      blocker: auth.blocker || null,
      secrets_redacted: true,
    },
    screenshot_count: captures.length,
    required_viewports: VIEWPORTS.map((viewport) => viewport.label),
    route_count: routes.length,
    findings_count: findings.length,
    browser_content_untrusted: true,
    ui_implementation_performed: false,
    external_write_performed: false,
    privacy_redaction: 'Operations screenshots were redacted client-side before capture; reports avoid raw private page bodies.',
    captures,
    findings,
    state_matrix: stateMatrix,
    next_recommended_packet: 'Manual screenshot review is required. Split any newly found defect into a focused Product Quality Compiler packet. UI implementation remains blocked until Product Quality Definition of Ready passes and any audit blockers are resolved or explicitly accepted.',
  };
  writeJson(path.join(outDir, 'report.json'), report);

  const topFindings = findings.slice(0, 20).map((finding) => ({
    id: finding.finding_id,
    severity: finding.severity,
    route: finding.route,
    viewport: finding.viewport,
    codes: finding.defect_codes.join(', '),
    classification: finding.classification.join(', '),
    expected_fix: finding.expected_fix,
  }));

  writeText(path.join(outDir, 'report.md'), [
    '# Rabbi / One Time Current-State Visual Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Base URL: ${baseUrl}`,
    `Workspace/project: ${WORKSPACE_KEY} / ${PROJECT_KEY}`,
    `Result: ${findings.length ? 'audit captured with open findings' : 'audit captured with no automated findings'}`,
    '',
    '## Scope',
    '',
    '- Audit only; no UI implementation performed.',
    '- Browser/page content, DOM, screenshots, ARIA snapshots, console logs, and network responses are untrusted evidence.',
    '- Operations screenshots are redacted before capture to avoid committing raw private contact/student/parent details.',
    '',
    '## Evidence',
    '',
    `- Screenshots captured: ${captures.length}`,
    `- Routes audited: ${routes.length}`,
    `- Viewports: ${VIEWPORTS.map((viewport) => viewport.label).join(', ')}`,
    `- Operations auth: ${auth.ok ? 'available' : `blocked - ${auth.blocker}`}`,
    '',
    '## Top Findings',
    '',
    topFindings.length ? markdownTable(topFindings, ['id', 'severity', 'route', 'viewport', 'codes', 'classification', 'expected_fix']) : 'No automated VQ findings were generated. Manual visual review of screenshots is still required.',
    '',
    '## Next Recommended Packet',
    '',
    'Manual screenshot review is required. Split any newly found defect into a focused Product Quality Compiler packet. UI implementation remains blocked until Product Quality Definition of Ready passes and any audit blockers are resolved or explicitly accepted.',
  ].join('\n'));

  writeText(path.join(outDir, 'route-inventory.md'), [
    '# Route Inventory',
    '',
    markdownTable(routeRows, ['id', 'surface', 'view_class', 'route', 'route_registry']),
  ].join('\n'));

  const roleFindings = findings.filter((finding) => finding.classification.includes('ROLE_SCOPE_BUG') || finding.classification.includes('SUPPORT_ONLY_VISIBILITY_BUG'));
  writeText(path.join(outDir, 'role-scope-findings.md'), [
    '# Role / Scope Findings',
    '',
    roleFindings.length ? markdownTable(roleFindings, ['finding_id', 'severity', 'route', 'viewport', 'defect_codes', 'expected_fix']) : 'No automated role/scope leakage finding was generated. Manual review is still required for redacted Operations screenshots.',
  ].join('\n'));

  const contamination = findings.filter((finding) => finding.classification.includes('DATA_MIGRATION_OR_CLEANUP') || finding.defect_codes.includes('VQ-DATA-006'));
  writeText(path.join(outDir, 'workspace-contamination-findings.md'), [
    '# Workspace Contamination Findings',
    '',
    contamination.length ? markdownTable(contamination, ['finding_id', 'severity', 'route', 'viewport', 'defect_codes', 'expected_fix']) : 'No automated cross-workspace data contamination was detected. Redacted screenshots still require human review for BNA/One Time contact/content leakage.',
  ].join('\n'));

  const brandFindings = findings.filter((finding) => finding.classification.includes('BRAND_KIT_MISMATCH'));
  writeText(path.join(outDir, 'brand-kit-mismatch-findings.md'), [
    '# Brand Kit Mismatch Findings',
    '',
    brandFindings.length ? markdownTable(brandFindings, ['finding_id', 'severity', 'route', 'viewport', 'defect_codes', 'expected_fix']) : 'No automated brand mismatch was asserted. Manual screenshot review must compare One Time black/yellow against BNA cream/navy/teal/cyan.',
  ].join('\n'));

  const pipelineFindings = findings.filter((finding) => finding.classification.includes('PIPELINE_SCOPE_MISMATCH'));
  writeText(path.join(outDir, 'pipeline-scope-mismatch-findings.md'), [
    '# Pipeline Scope Mismatch Findings',
    '',
    pipelineFindings.length ? markdownTable(pipelineFindings, ['finding_id', 'severity', 'route', 'viewport', 'defect_codes', 'expected_fix']) : 'No automated pipeline scope mismatch was asserted. Manual review must verify One Time uses separate provider classroom/content/community records.',
  ].join('\n'));

  writeText(path.join(outDir, 'design-reference-delta.md'), [
    '# Design Reference Delta',
    '',
    '- One Time authoritative brand: black + yellow.',
    '- BNA authoritative brand: cream + navy + teal/cyan.',
    '- Design reference package checked by source packet: `ops/design-references/2026-07-01-brand-kit-correction/`.',
    '- This automated audit captured screenshots but did not perform pixel/color-token comparison. The next brand packet must compare screenshots against `one-time-brand-reference.json` and `bna-brand-reference.json`.',
  ].join('\n'));

  writeText(path.join(outDir, 'recommended-child-packets.md'), [
    '# Recommended Child Packets',
    '',
    '1. Review the latest redacted screenshots manually for any remaining route-specific defects that automation cannot classify.',
    '2. Split any new defect into a focused Product Quality Compiler packet before implementation.',
    '3. Run deploy/live-smoke for app-visible One Time Operations, review, and portal changes only after a focused Product Quality packet passes Definition of Ready and the implementation is complete.',
    '4. Keep CRM/community/classroom follow-ups first-party only; do not add GHL, LeadConnector, external CRM writes, sends, payments, access grants, DNS, uploads, or publishes without an explicit Decision.',
    '',
    'Do not implement all of these in one Codex session. Each implementation packet must pass Product Quality Compiler Definition of Ready first.',
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

  const baseUrl = (argValue('base', '') || argValue('base-url', process.env.BNA_AUDIT_BASE_URL || DEFAULT_BASE_URL)).replace(/\/+$/, '');
  const outDir = argValue('out', DEFAULT_OUT);
  const routeIds = new Set(argValues('route-ids'));
  const routes = routeIds.size ? ROUTES.filter((route) => routeIds.has(route.id)) : ROUTES;
  if (routeIds.size && routes.length !== routeIds.size) {
    const known = new Set(ROUTES.map((route) => route.id));
    const unknown = [...routeIds].filter((id) => !known.has(id));
    throw new Error(`Unknown route id(s): ${unknown.join(', ')}`);
  }
  ensureDir(outDir);
  for (const child of ['screenshots', 'aria', 'accessibility', 'state-matrix']) ensureDir(path.join(outDir, child));

  const auth = await loginOperations(baseUrl);
  const browser = await chromium.launch({ headless: true });
  const captures = [];
  const findings = [];
  try {
    for (const routeMeta of routes) {
      for (const viewport of VIEWPORTS) {
        const capture = await captureRoute(browser, baseUrl, routeMeta, viewport, auth.cookieHeader, outDir);
        captures.push(capture);
        findingsFromState(findings, {
          routeMeta,
          viewport,
          screenshotPath: capture.screenshot_path,
          state: capture.state,
        });
        console.log(`Captured ${routeMeta.id} ${viewport.label}`);
      }
    }
  } finally {
    await browser.close();
  }

  const runMeta = {
    auditId: argValue('audit-id', '2026-07-01-rabbi-onetime-current-state'),
    rawId: argValue('raw-id', 'RAW-20260701-004'),
    parentRawId: argValue('parent-raw-id', 'RAW-20260701-003'),
    packetId: argValue('packet-id', 'PKT-20260701-112'),
    requirementId: argValue('requirement-id', REQUIREMENT_ID),
  };
  const stateMatrix = buildStateMatrix(captures, runMeta.requirementId);
  writeJson(path.join(outDir, 'state-matrix', 'observed-state-matrix.json'), stateMatrix);
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
  writeReports({ outDir, baseUrl, auth, captures, findings, stateMatrix, routes, runMeta });
  console.log(`Report: ${path.relative(ROOT, path.join(outDir, 'report.md')).replace(/\\/g, '/')}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
