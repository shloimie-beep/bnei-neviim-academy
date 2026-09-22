(function oneTimePortalShell() {
  const REVIEW_VALUES = new Set(['one-time', 'onetime', '1', 'true']);
  const REVIEW_ACCESS_CODE = 'TEST-ONETIME-REVIEW-ACCESS';
  const MENU_ID_PREFIX = 'one-time-portal-menu';

  const params = new URLSearchParams(window.location.search);
  const body = document.body;
  const path = window.location.pathname;

  function isOneTimePortal() {
    return body?.dataset?.oneTimeWorkspace === 'rabbi_sheller_provider'
      || body?.dataset?.oneTimeProject === 'one_time_mishnah_class'
      || /^(\/rabbi-member|\/member-library|\/one-time-classroom|\/one-time-parent|\/parent\.html|\/student(?:\.html)?)/.test(path);
  }

  function isReviewMode() {
    return REVIEW_VALUES.has(String(params.get('review') || '').toLowerCase())
      || body.classList.contains('one-time-review-active')
      || /review/.test(String(body.dataset.oneTimeRabbiDashboard || ''));
  }

  function normalizeText(node, nextText) {
    if (node && node.textContent.trim() !== nextText) node.textContent = nextText;
  }

  function normalizeFamilyPortalLabels() {
    if (!/^\/rabbi-member/.test(path)) return;
    document.title = isReviewMode() ? 'One Time Family Portal Preview' : 'One Time Family Portal';
    normalizeText(document.getElementById('memberAreaTitle'), 'One Time Family Portal');
    document.querySelectorAll('.member-brand-lockup small').forEach((node) => normalizeText(node, isReviewMode() ? 'Family portal preview' : 'Family portal'));
    document.querySelectorAll('a').forEach((link) => {
      const text = link.textContent.trim();
      const href = link.getAttribute('href') || '';
      if (/^\/rabbi-member/.test(href) && ['Home', 'Member Home'].includes(text)) {
        link.textContent = 'Family Portal';
      }
    });
    normalizeText(document.querySelector('#member-access h2'), isReviewMode() ? 'Family Portal preview' : 'Request family portal link');
    const submit = document.querySelector('#loginForm button[type="submit"]');
    if (submit && !isReviewMode()) submit.textContent = 'Request family portal link';
  }

  function normalizeParentSetupLabels() {
    if (!/^\/one-time-parent/.test(path)) return;
    document.title = 'One Time Parent Account Setup / Reset';
    normalizeText(document.querySelector('.brand-subtitle'), 'Parent account setup/reset');
    normalizeText(document.querySelector('.route-pill'), 'Private setup/reset link');
    normalizeText(document.querySelector('.intro h1'), 'Set or reset your One Time parent password.');
    normalizeText(document.querySelector('.card h2'), 'Set or reset parent password');
    const copy = document.getElementById('setupCopy');
    if (copy) copy.textContent = 'Use the newest account setup/reset link from your One Time invite email. This link can only be used once.';
  }

  function exitPreviewHref() {
    if (/^\/parent\.html/.test(path)) return '/one-time-parent';
    if (/^\/student(?:\.html)?/.test(path)) return '/student';
    if (/^\/one-time-classroom/.test(path)) return '/one-time-classroom';
    if (/^\/member-library/.test(path)) return '/member-library';
    if (/^\/rabbi-member/.test(path)) return '/rabbi-member';
    return '/one-time';
  }

  function previewHrefFor(link) {
    const raw = link.getAttribute('href') || '';
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return raw;
    let url;
    try {
      url = new URL(raw, window.location.origin);
    } catch {
      return raw;
    }
    if (url.origin !== window.location.origin) return raw;
    if (/^\/rabbi-member/.test(url.pathname)) {
      url.searchParams.set('review', 'one-time');
    } else if (/^\/member-library/.test(url.pathname)) {
      url.searchParams.set('review', 'one-time');
    } else if (/^\/one-time-classroom/.test(url.pathname)) {
      url.pathname = '/one-time-classroom.html';
      url.searchParams.set('review', 'one-time');
      url.searchParams.set('code', REVIEW_ACCESS_CODE);
    } else if (/^\/student(?:\.html)?/.test(url.pathname)) {
      url.pathname = '/student.html';
      url.searchParams.set('review', 'one-time');
    } else if (/^\/parent(?:\.html)?/.test(url.pathname) || /^\/one-time-parent/.test(url.pathname)) {
      url.pathname = '/parent.html';
      url.searchParams.set('review', 'one-time');
    } else {
      return raw;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function preservePreviewLinks(root = document) {
    if (!isReviewMode()) return;
    root.querySelectorAll('a[href]').forEach((link) => {
      if (link.dataset.oneTimePreviewExit === 'true') return;
      const next = previewHrefFor(link);
      if (next && next !== link.getAttribute('href')) {
        link.setAttribute('href', next);
        link.dataset.oneTimePreviewPreserved = 'true';
      }
    });
  }

  function injectPreviewBanner() {
    if (!isReviewMode() || document.querySelector('[data-one-time-preview-banner]')) return;
    body.classList.add('one-time-review-active');
    body.dataset.oneTimePreviewMode = 'true';
    const banner = document.createElement('div');
    banner.className = 'one-time-portal-preview-banner';
    banner.setAttribute('role', 'status');
    banner.dataset.oneTimePreviewBanner = 'true';
    banner.innerHTML = `
      <strong>TEST PREVIEW</strong>
      <span>SAMPLE DATA</span>
      <span>NO WRITES</span>
      <a href="${exitPreviewHref()}" data-one-time-preview-exit="true" data-action-id="ACTION-ONETIME-PORTAL-EXIT-PREVIEW">Exit Preview</a>
    `;
    body.insertBefore(banner, body.firstChild);
  }

  function focusableElements(button, nav) {
    return [button, ...Array.from(nav.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))]
      .filter((node) => node && node.offsetParent !== null);
  }

  function ensureBackdrop() {
    let backdrop = document.querySelector('[data-one-time-portal-menu-backdrop]');
    if (backdrop) return backdrop;
    backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'one-time-portal-menu-backdrop';
    backdrop.setAttribute('aria-label', 'Close One Time portal menu');
    backdrop.dataset.oneTimePortalMenuBackdrop = 'true';
    backdrop.dataset.actionId = 'ACTION-ONETIME-PORTAL-MENU-TOGGLE';
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function menuButtonHtml() {
    return `
      <span class="one-time-portal-menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      <span>Menu</span>
    `;
  }

  function chooseNav() {
    const candidates = [
      '.member-topbar',
      '.member-nav',
      '.top-actions',
      '.one-time-parent-nav',
      '.nav',
      '.portal-topbar-actions',
    ];
    for (const selector of candidates) {
      const node = document.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function wireMenu() {
    const nav = chooseNav();
    if (!nav || nav.dataset.oneTimePortalMenuWired === 'true') return;
    nav.dataset.oneTimePortalMenuWired = 'true';
    nav.classList.add('one-time-portal-nav');
    nav.id = nav.id || `${MENU_ID_PREFIX}-${Math.random().toString(36).slice(2, 8)}`;

    let button = document.querySelector(`[aria-controls="${nav.id}"].one-time-portal-menu-button`);
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'one-time-portal-menu-button';
      button.setAttribute('aria-controls', nav.id);
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open One Time portal menu');
      button.dataset.actionId = 'ACTION-ONETIME-PORTAL-MENU-TOGGLE';
      button.innerHTML = menuButtonHtml();
      if (nav.classList.contains('member-topbar')) {
        const brand = nav.querySelector('.member-brand-lockup');
        if (brand) brand.insertAdjacentElement('afterend', button);
        else nav.insertBefore(button, nav.firstChild);
      } else {
        nav.parentNode.insertBefore(button, nav);
      }
    }

    const backdrop = ensureBackdrop();
    let lastFocus = null;

    function setOpen(open, shouldFocus = true) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.setAttribute('aria-label', open ? 'Close One Time portal menu' : 'Open One Time portal menu');
      nav.classList.toggle('one-time-portal-menu-open', open);
      body.classList.toggle('one-time-portal-menu-open', open);
      backdrop.hidden = !open;
      if (open) {
        lastFocus = document.activeElement;
        const first = focusableElements(button, nav).find((node) => node !== button);
        if (shouldFocus && first) first.focus();
      } else if (shouldFocus) {
        (lastFocus && document.contains(lastFocus) ? lastFocus : button).focus();
      }
    }

    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    backdrop.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (button.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = focusableElements(button, nav);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function run() {
    if (!isOneTimePortal()) return;
    body.classList.add('one-time-portal-shell-ready');
    normalizeFamilyPortalLabels();
    normalizeParentSetupLabels();
    injectPreviewBanner();
    preservePreviewLinks();
    wireMenu();

    const observer = new MutationObserver(() => {
      normalizeFamilyPortalLabels();
      normalizeParentSetupLabels();
      preservePreviewLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      normalizeFamilyPortalLabels();
      normalizeParentSetupLabels();
      preservePreviewLinks();
    }, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
