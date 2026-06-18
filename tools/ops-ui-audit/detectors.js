const { normalizeSeverity, makeIssue } = (() => {
  function normalizeSeverity(value) {
    const raw = String(value || '').toUpperCase();
    return ['P0', 'P1', 'P2', 'P3'].includes(raw) ? raw : 'P2';
  }
  function makeIssue(fields) {
    return {
      id: fields.id,
      severity: normalizeSeverity(fields.severity),
      confidence: fields.confidence || 'medium',
      route: fields.route || '',
      stateId: fields.stateId || '',
      module: fields.module || '',
      viewport: fields.viewport || 'all',
      workspace: fields.workspace || '',
      role: fields.role || '',
      issue: fields.issue || '',
      evidence: fields.evidence || '',
      whyItMatters: fields.whyItMatters || '',
      expectedBehavior: fields.expectedBehavior || '',
      recommendedFix: fields.recommendedFix || '',
      screenshot: fields.screenshot || '',
      proposedTest: fields.proposedTest || '',
      category: fields.category || 'general',
    };
  }
  return { normalizeSeverity, makeIssue };
})();

const NOISY_TERMS = [
  'do not restart',
  'queue health',
  'track agent work',
  'handoff files',
  'raw capture',
  'stale',
  'proof gaps',
  'watchdog',
  'review queue',
  'intake review',
  'debug',
  'save test reset',
  'needs attention',
];

const HELPER_TERMS = ['helper', 'assistant', 'chat', 'bot', 'ask', 'codex', 'sidekick', 'open helper', 'bna helper', 'digital assistant'];

async function collectStateContext(page, config) {
  return page.evaluate(() => {
    const text = (el) => (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
    const pick = (selectors) => {
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        const value = text(el);
        if (value) return value.slice(0, 160);
      }
      return '';
    };
    const activeLabels = [...document.querySelectorAll('[aria-selected="true"], .active, [data-active="true"], [role="tab"][aria-current], [aria-current="page"]')]
      .map(text)
      .filter(Boolean)
      .slice(0, 12);
    const headings = [...document.querySelectorAll('h1,h2,h3,[role="heading"]')]
      .map(text)
      .filter(Boolean)
      .slice(0, 16);
    const modal = pick(['[role="dialog"] h1', '[role="dialog"] h2', '.modal h1', '.modal h2', '.drawer h1', '.drawer h2']);
    return {
      url: location.href,
      route: location.pathname + location.search + location.hash,
      title: document.title,
      mainHeading: pick(['main h1', 'h1', '[data-page-title]', '.page-title']),
      module: pick(['[data-current-module]', '.ops-module-toolbar .active', '.ops-sidebar-button.active', '[aria-current="page"]']),
      workspace: pick(['[data-current-workspace]', '.workspace-label', '.workspace-chip', '.ops-context-strip', '.ops-workspace-summary']),
      role: pick(['[data-current-role]', '.role-label', '.context-role', '.ops-role-chip']),
      selectedContext: pick(['[data-selected-student]', '.student-detail-title', '.selected-student', '.selected-provider']),
      activeLabels,
      majorHeadings: headings,
      modal,
    };
  }, { baseUrl: config.baseUrl });
}

async function collectControlsAndLinks(page) {
  return page.evaluate(() => {
    const labelFor = (el) => {
      const aria = el.getAttribute('aria-label') || el.getAttribute('title') || '';
      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      return (aria || text || el.getAttribute('href') || el.getAttribute('id') || el.tagName).slice(0, 200);
    };
    const selectorFor = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const attrs = ['data-action-id', 'data-testid', 'aria-label', 'name'];
      for (const attr of attrs) {
        const value = el.getAttribute(attr);
        if (value) return `${el.tagName.toLowerCase()}[${attr}="${CSS.escape(value)}"]`;
      }
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 4) {
        const tag = cur.tagName.toLowerCase();
        const parent = cur.parentElement;
        if (!parent) {
          parts.unshift(tag);
          break;
        }
        const same = [...parent.children].filter((child) => child.tagName === cur.tagName);
        const nth = same.length > 1 ? `:nth-of-type(${same.indexOf(cur) + 1})` : '';
        parts.unshift(`${tag}${nth}`);
        cur = parent;
      }
      return parts.join(' > ');
    };
    const elements = [...document.querySelectorAll('a[href], button, [role="button"], [role="tab"], summary, select, input[type="search"]')];
    return elements
      .filter((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      })
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const form = el.closest('form');
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role') || '',
          type: el.getAttribute('type') || '',
          label: labelFor(el),
          href: el.getAttribute('href') || '',
          selector: selectorFor(el),
          disabled: Boolean(el.disabled || el.getAttribute('aria-disabled') === 'true'),
          inForm: Boolean(form),
          formText: form ? (form.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240) : '',
          dataset: Object.entries(el.dataset || {}).map(([key, value]) => `${key}=${value}`).join(' '),
          bounds: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        };
      });
  });
}

async function runDetectors(page, state, viewport, screenshotPath = '') {
  const raw = await page.evaluate(({ noisyTerms, helperTerms }) => {
    const issues = [];
    const visibleText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const width = document.documentElement.clientWidth;
    const bodyOverflow = document.documentElement.scrollWidth > width + 2 || document.body.scrollWidth > document.body.clientWidth + 2;
    if (bodyOverflow) issues.push({ severity: 'P1', category: 'layout', issue: 'Body-level horizontal overflow', evidence: `scrollWidth ${document.documentElement.scrollWidth}, clientWidth ${width}` });
    const visible = [...document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="tab"],[tabindex]')].filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    });
    const smallTargets = visible.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    }).slice(0, 12).map((el) => (el.innerText || el.getAttribute('aria-label') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 80));
    if (smallTargets.length) issues.push({ severity: 'P2', category: 'responsive', issue: 'Small mobile tap targets', evidence: smallTargets.join(' | ') });
    const unnamedButtons = visible.filter((el) => ['BUTTON'].includes(el.tagName) || el.getAttribute('role') === 'button')
      .filter((el) => !(el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim())
      .slice(0, 12);
    if (unnamedButtons.length) issues.push({ severity: 'P2', category: 'accessibility', issue: 'Buttons without accessible names', evidence: `${unnamedButtons.length} visible controls` });
    const placeholderLinks = [...document.querySelectorAll('a[href="#"], a[href=""], a[href^="javascript:"]')].slice(0, 12).map((el) => (el.innerText || el.getAttribute('href') || '').trim());
    if (placeholderLinks.length) issues.push({ severity: 'P2', category: 'navigation', issue: 'Placeholder links are visible', evidence: placeholderLinks.join(' | ') });
    const helpers = visible.filter((el) => helperTerms.some((term) => `${el.id} ${el.className} ${el.getAttribute('title') || ''} ${el.getAttribute('aria-label') || ''} ${el.innerText || ''}`.toLowerCase().includes(term)))
      .map((el) => (el.innerText || el.getAttribute('aria-label') || el.id || el.className || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 100));
    if (helpers.length > 1) issues.push({ severity: 'P1', category: 'helper', issue: 'Multiple visible helper entry points', evidence: helpers.join(' | ') });
    const noisy = noisyTerms.filter((term) => visibleText.toLowerCase().includes(term));
    if (noisy.length) issues.push({ severity: 'P2', category: 'information-architecture', issue: 'Internal or unclear operational language visible', evidence: noisy.join(', ') });
    const lang = document.documentElement.getAttribute('lang') || '';
    if (!lang) issues.push({ severity: 'P2', category: 'accessibility', issue: 'Missing html lang attribute', evidence: '<html> has no lang' });
    return issues;
  }, { noisyTerms: NOISY_TERMS, helperTerms: HELPER_TERMS });
  return raw.map((issue, index) => makeIssue({
    id: `${state.id || 'STATE'}-${viewport.name}-${String(index + 1).padStart(2, '0')}`,
    severity: issue.severity,
    confidence: 'medium',
    route: state.route,
    stateId: state.id,
    module: state.module,
    viewport: viewport.name,
    workspace: state.workspace,
    role: state.role,
    issue: issue.issue,
    evidence: issue.evidence,
    whyItMatters: 'This can reduce trust, usability, accessibility, or scannability in the Operations UI.',
    expectedBehavior: 'The screen should remain clear, accessible, responsive, and action-safe at this viewport.',
    recommendedFix: 'Review the cited screen and adjust UI, copy, spacing, or control wiring in a focused product fix.',
    screenshot: screenshotPath,
    proposedTest: 'Add or extend a Playwright regression covering this route/state and viewport.',
    category: issue.category,
  }));
}

async function runAccessibilityChecks(page, state) {
  const summary = { axeAvailable: false, violations: [], basic: [] };
  try {
    const mod = await import('@axe-core/playwright');
    const AxeBuilder = mod.default || mod.AxeBuilder;
    if (AxeBuilder) {
      const results = await new AxeBuilder({ page }).analyze();
      summary.axeAvailable = true;
      summary.violations = results.violations || [];
      return summary;
    }
  } catch {
    summary.axeAvailable = false;
  }
  summary.basic = await page.evaluate(() => {
    const findings = [];
    if (!document.documentElement.getAttribute('lang')) findings.push({ id: 'html-lang', impact: 'moderate', description: 'html lang is missing' });
    const unlabeledInputs = [...document.querySelectorAll('input, textarea, select')].filter((el) => {
      if (el.type === 'hidden') return false;
      if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
      if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false;
      return true;
    });
    if (unlabeledInputs.length) findings.push({ id: 'form-label', impact: 'moderate', description: `${unlabeledInputs.length} controls may be missing labels` });
    const duplicateIds = Object.entries([...document.querySelectorAll('[id]')].reduce((acc, el) => {
      acc[el.id] = (acc[el.id] || 0) + 1;
      return acc;
    }, {})).filter(([, count]) => count > 1);
    if (duplicateIds.length) findings.push({ id: 'duplicate-id', impact: 'minor', description: `${duplicateIds.length} duplicate ids found` });
    return findings;
  }).catch(() => []);
  return summary;
}

module.exports = {
  HELPER_TERMS,
  NOISY_TERMS,
  collectControlsAndLinks,
  collectStateContext,
  makeIssue,
  normalizeSeverity,
  runAccessibilityChecks,
  runDetectors,
};
