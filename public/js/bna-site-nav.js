(function () {
  const BLOG_CATEGORIES = {
    en: [
      ['All Articles', '/blog'],
      ['Alternative School', '/blog?category=Alternative%20School'],
      ['Torah Learning', '/blog?category=Torah%20Learning'],
      ['Jewish Unschooling', '/blog?category=Jewish%20Unschooling'],
      ['ADHD / Learning Differences', '/blog?category=ADHD%20%2F%20Learning%20Differences'],
      ['Homeschooling', '/blog?category=Homeschooling'],
      ['Parenting', '/blog?category=Parenting'],
      ['Self-Governance', '/blog?category=Self-Governance'],
      ['Technology', '/blog?category=Technology'],
      ['Future Vision', '/blog?category=Future%20Vision'],
    ],
    he: [
      ['כל המאמרים', '/he/blog'],
      ['מסגרות אלטרנטיביות', '/he/blog?category=Alternative%20School'],
      ['לימוד תורה', '/he/blog?category=Torah%20Learning'],
      ['חינוך ביתי', '/he/blog?category=Homeschooling'],
      ['הורות', '/he/blog?category=Parenting'],
      ['אחריות אישית', '/he/blog?category=Self-Governance'],
      ['טכנולוגיה', '/he/blog?category=Technology'],
      ['חזון עתידי', '/he/blog?category=Future%20Vision'],
    ],
  };

  const COPY = {
    en: {
      brand: "Bnei Nevi'im Academy",
      location: 'Ramat Beit Shemesh',
      home: 'Home',
      school: 'School',
      parents: 'Families',
      serviceProviders: 'Service Providers',
      audience: 'Explore',
      portals: 'Portal Login',
      blog: 'Blog',
      faq: 'FAQ',
      parentLogin: 'Parent Login',
      studentLogin: 'Student Login',
      providerLogin: 'Rabbi / Provider Login',
      providerJoin: 'Advertise your program for free',
      contact: 'Contact Us',
      signup: 'Register',
      backToRegistration: 'Back to registration',
      language: 'עברית',
      openMenu: 'Open navigation menu',
    },
    he: {
      brand: "Bnei Nevi'im Academy",
      location: 'רמת בית שמש',
      home: 'בית',
      school: 'בית הספר',
      parents: 'משפחות',
      serviceProviders: 'ספקי שירות',
      audience: 'למי זה מתאים',
      portals: 'כניסה לפורטלים',
      blog: 'מאמרים',
      faq: 'שאלות',
      parentLogin: 'הורים',
      studentLogin: 'תלמיד',
      providerLogin: 'רב / ספק',
      providerJoin: 'פרסמו את התוכנית בחינם',
      contact: 'צור קשר',
      signup: 'הרשמה',
      backToRegistration: 'חזרה להרשמה',
      language: 'English',
      openMenu: 'פתיחת תפריט ניווט',
    },
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function selectedLanguage(mount) {
    const explicit = mount?.dataset.navLanguage || '';
    if (/^he/i.test(explicit)) return 'he';
    if (/^en/i.test(explicit)) return 'en';
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang') || '';
    if (/^he/i.test(queryLang)) return 'he';
    if (/^en/i.test(queryLang)) return 'en';
    if (document.documentElement.lang.toLowerCase().startsWith('he')) return 'he';
    if (window.location.pathname.startsWith('/he')) return 'he';
    return 'en';
  }

  function homeUrl(lang) {
    return lang === 'he' ? '/he' : '/';
  }

  function blogUrl(lang) {
    return lang === 'he' ? '/he/blog' : '/blog';
  }

  function faqUrl(lang) {
    return lang === 'he' ? '/he/faq' : '/faq';
  }

  function schoolUrl(lang) {
    return lang === 'he' ? '/he/school' : '/school';
  }

  function parentsUrl(lang) {
    return lang === 'he' ? '/he/parents' : '/parents';
  }

  function serviceProvidersUrl(lang) {
    return lang === 'he' ? '/he/service-providers' : '/service-providers';
  }

  function signupUrl(lang) {
    return lang === 'he' ? '/signup-he.html' : '/signup.html';
  }

  function languageSwitchUrl(lang) {
    const next = lang === 'he' ? 'en' : 'he';
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.endsWith('/signup-he.html') || path.endsWith('/signup.html')) {
      return signupUrl(next);
    }

    if (path.endsWith('/signup-thank-you.html')) {
      params.set('lang', next);
      return `${path}?${params.toString()}`;
    }

    if (/^\/(?:he\/)?school\/?$/.test(path)) return schoolUrl(next);
    if (/^\/(?:he\/)?(?:parents|families|parent-app)\/?$/.test(path)) return parentsUrl(next);
    if (/^\/(?:he\/)?(?:service-providers|providers|community)\/?$/.test(path)) return serviceProvidersUrl(next);

    if (path.endsWith('/documents/registration-document')) {
      params.set('lang', next);
      const returnUrl = params.get('return');
      if (!returnUrl || /signup(?:-he)?\.html/.test(returnUrl)) {
        params.set('return', signupUrl(next));
      }
      return `${path}?${params.toString()}`;
    }

    if (next === 'he') {
      if (path === '/' || path === '/index.html') return '/he';
      if (path.startsWith('/he')) return path;
      return `/he${path}`;
    }

    if (path === '/he') return '/';
    if (path.startsWith('/he/')) return path.replace(/^\/he/, '');
    return path || '/';
  }

  function registrationLink(mount, lang) {
    const context = mount?.dataset.navContext || '';
    if (context === 'registration-document') {
      const params = new URLSearchParams(window.location.search);
      return params.get('return') || signupUrl(lang);
    }
    return signupUrl(lang);
  }

  function registrationLabel(mount, lang) {
    const context = mount?.dataset.navContext || '';
    return context === 'registration-document' ? COPY[lang].backToRegistration : COPY[lang].signup;
  }

  function renderBlogDropdown(lang) {
    return (BLOG_CATEGORIES[lang] || BLOG_CATEGORIES.en)
      .map(([label, href]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
      .join('');
  }

  function renderAudienceDropdown(active, copy, lang) {
    const items = [
      { id: 'school', href: schoolUrl(lang), label: copy.school || COPY.en.school },
      { id: 'parents', href: parentsUrl(lang), label: copy.parents || COPY.en.parents },
      { id: 'service-providers', href: serviceProvidersUrl(lang), label: copy.serviceProviders || COPY.en.serviceProviders },
    ];
    const activeAttrs = items.some((item) => item.id === active) ? ' aria-current="page"' : '';
    return `
      <details class="bna-site-nav-dropdown bna-site-nav-audience">
        <summary${activeAttrs}>${escapeHtml(copy.audience || COPY.en.audience)}</summary>
        <div class="bna-site-nav-dropdown-panel">
          ${items.map((item) => `<a href="${escapeHtml(item.href)}"${active === item.id ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>`).join('')}
        </div>
      </details>`;
  }

  function renderPortalDropdown(copy) {
    const items = [
      [copy.parentLogin || COPY.en.parentLogin, '/parent/login'],
      [copy.studentLogin || COPY.en.studentLogin, '/student/login'],
      [copy.providerLogin || COPY.en.providerLogin, '/provider'],
    ];
    return `
      <details class="bna-site-nav-dropdown bna-site-nav-portals">
        <summary>${escapeHtml(copy.portals || COPY.en.portals)}</summary>
        <div class="bna-site-nav-dropdown-panel">
          ${items.map(([label, href]) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join('')}
        </div>
      </details>`;
  }

  function inferActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '/' || path === '/he' || path === '/index.html') return 'home';
    if (path.endsWith('/school')) return 'school';
    if (/\/(?:parents|families|parent-app)$/.test(path)) return 'parents';
    if (/\/(?:service-providers|providers|community)$/.test(path)) return 'service-providers';
    if (path.includes('/blog')) return 'blog';
    if (path.includes('/faq')) return 'faq';
    if (path.includes('/signup') || path.includes('/register')) return 'signup';
    return '';
  }

  function renderNavLink(active, { id, href, label, classes = '' }) {
    const isActive = active === id;
    const className = `bna-site-nav-link${classes ? ` ${classes}` : ''}${isActive ? ' is-active' : ''}`;
    const activeAttrs = isActive ? ' aria-current="page"' : '';
    return `<a class="${escapeHtml(className)}" href="${escapeHtml(href)}"${activeAttrs}>${escapeHtml(label)}</a>`;
  }

  function closeNav(mount) {
    const links = mount.querySelector('.bna-site-nav-actions');
    const toggle = mount.querySelector('.bna-site-nav-toggle');
    links?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    mount.querySelectorAll('.bna-site-nav-dropdown[open]').forEach((dropdown) => {
      dropdown.removeAttribute('open');
    });
  }

  function renderSiteNav(mount) {
    if (!mount) return;
    if (mount.dataset.bnaSiteNavRendered === 'true') return;
    mount.dataset.bnaSiteNavRendered = 'true';
    const lang = selectedLanguage(mount);
    const copy = COPY[lang] || COPY.en;
    const active = mount?.dataset.navActive || inferActiveNav();
    const signupHref = registrationLink(mount, lang);
    const signupLabel = registrationLabel(mount, lang);
    const switchHref = languageSwitchUrl(lang);

    mount.innerHTML = `
      <nav class="bna-site-nav" aria-label="Primary navigation">
        <div class="bna-site-nav-inner">
          <a class="bna-site-brand" href="${homeUrl(lang)}">
            <img src="/images/bna-logo-nobg.png" alt="Bnei Neviim Academy">
            <span class="bna-site-brand-text">
              <span class="bna-site-brand-name">${escapeHtml(copy.brand)}</span>
              <span class="bna-site-brand-location" id="brandSubtitle">${escapeHtml(copy.location)}</span>
            </span>
          </a>
          <button class="bna-site-nav-toggle" type="button" aria-label="${escapeHtml(copy.openMenu)}" aria-expanded="false">
            <span class="bna-site-nav-toggle-lines" aria-hidden="true"></span>
          </button>
          <div class="bna-site-nav-actions" id="mainNavActions">
            <div class="bna-site-nav-menu" aria-label="Primary links">
              ${renderNavLink(active, { id: 'home', href: homeUrl(lang), label: copy.home })}
              ${renderAudienceDropdown(active, copy, lang)}
              <details class="bna-site-nav-dropdown bna-site-nav-dropdown-desktop">
                <summary>${escapeHtml(copy.blog)}</summary>
                <div class="bna-site-nav-dropdown-panel">
                  ${renderBlogDropdown(lang)}
                </div>
              </details>
              ${renderNavLink(active, { id: 'blog', href: blogUrl(lang), label: copy.blog, classes: 'bna-site-nav-mobile-only' })}
              ${renderNavLink(active, { id: 'faq', href: faqUrl(lang), label: copy.faq })}
              ${renderPortalDropdown(copy)}
            </div>
            <div class="bna-site-nav-buttons">
              <button class="bna-site-lang-toggle" id="languageToggle" type="button">${escapeHtml(copy.language)}</button>
              <a class="bna-site-nav-button bna-site-nav-contact" href="https://wa.me/972534932631" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.contact)}</a>
              <a class="bna-site-nav-button bna-site-nav-provider" href="/become-service-provider?onboard=provider">${escapeHtml(copy.providerJoin)}</a>
              <a class="bna-site-nav-button bna-site-nav-signup" id="backLink" href="${escapeHtml(signupHref)}">${escapeHtml(signupLabel)}</a>
            </div>
          </div>
        </div>
      </nav>`;

    const toggle = mount.querySelector('.bna-site-nav-toggle');
    const links = mount.querySelector('.bna-site-nav-actions');
    const languageToggle = mount.querySelector('#languageToggle');

    toggle?.addEventListener('click', () => {
      if (!links) return;
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        mount.querySelectorAll('.bna-site-nav-dropdown[open]').forEach((dropdown) => {
          dropdown.removeAttribute('open');
        });
      }
    });

    languageToggle?.addEventListener('click', () => {
      window.location.href = switchHref;
    });

    links?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeNav(mount));
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('.bna-site-nav')) closeNav(mount);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav(mount);
    });
  }

  function renderSiteFooter(mount) {
    if (!mount) return;
    if (mount.dataset.bnaSiteFooterRendered === 'true') return;
    mount.dataset.bnaSiteFooterRendered = 'true';
    const lang = selectedLanguage(mount);
    const copy = COPY[lang] || COPY.en;
    const nonprofit = lang === 'he'
      ? '\u05e2\u05de\u05d5\u05ea\u05d4 \u05e8\u05e9\u05d5\u05de\u05d4 \u05d1\u05de\u05d3\u05d9\u05e0\u05ea \u05e0\u05d9\u05d5 \u05d2\u05f3\u05e8\u05d6\u05d9'
      : 'Registered nonprofit in the State of New Jersey';
    const copyright = lang === 'he'
      ? '\u00a9 2025 \u05d0\u05e7\u05d3\u05de\u05d9\u05d9\u05ea \u05d1\u05e0\u05d9 \u05e0\u05d1\u05d9\u05d0\u05d9\u05dd. \u05db\u05dc \u05d4\u05d6\u05db\u05d5\u05d9\u05d5\u05ea \u05e9\u05de\u05d5\u05e8\u05d5\u05ea.'
      : "\u00a9 2025 Bnei Nevi'im Academy. All rights reserved.";
    mount.innerHTML = `
      <footer class="bna-site-footer">
        <div class="bna-site-footer-inner">
          <strong>${escapeHtml(copy.brand)}</strong>
          <span>${escapeHtml(copy.location)}</span>
          <div class="bna-site-footer-socials" aria-label="Social profiles">
            <a href="https://www.youtube.com/channel/UCKnmIcZqhzNCdAbE6RK-U-g" target="_blank" rel="noopener noreferrer" aria-label="Bnei Neviim Academy on YouTube">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/108630189/" target="_blank" rel="noopener noreferrer" aria-label="Bnei Neviim Academy on LinkedIn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.91 1.64-1.86 3.37-1.86 3.61 0 4.28 2.38 4.28 5.47v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.76C.79 0 0 .77 0 1.72v20.55C0 23.22.79 24 1.76 24h20.47c.97 0 1.77-.78 1.77-1.73V1.72C24 .77 23.2 0 22.23 0Z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590512065756" target="_blank" rel="noopener noreferrer" aria-label="Bnei Neviim Academy on Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.39A12 12 0 0 0 24 12Z"/></svg>
            </a>
          </div>
          <span>${escapeHtml(nonprofit)}</span>
          <span>${escapeHtml(copyright)}</span>
        </div>
      </footer>`;
  }

  function init() {
    document.querySelectorAll('[data-bna-site-nav]').forEach(renderSiteNav);
    document.querySelectorAll('[data-bna-site-footer]').forEach(renderSiteFooter);
  }

  window.BNASiteNav = { render: renderSiteNav, renderFooter: renderSiteFooter };

  init();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
