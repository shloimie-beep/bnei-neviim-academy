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
      blog: 'Blog',
      faq: 'FAQ',
      parentLogin: 'Parent Login',
      studentLogin: 'Student Login',
      providerLogin: 'Rabbi / Provider Login',
      providerJoin: 'Become a Service Provider',
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
      blog: 'מאמרים',
      faq: 'שאלות',
      parentLogin: 'הורים',
      studentLogin: 'תלמיד',
      providerLogin: 'רב / ספק',
      providerJoin: 'הצטרפות כספק',
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
              <a class="bna-site-nav-link" href="${homeUrl(lang)}">${escapeHtml(copy.home)}</a>
              <details class="bna-site-nav-dropdown bna-site-nav-dropdown-desktop">
                <summary>${escapeHtml(copy.blog)}</summary>
                <div class="bna-site-nav-dropdown-panel">
                  ${renderBlogDropdown(lang)}
                </div>
              </details>
              <a class="bna-site-nav-link bna-site-nav-mobile-only" href="${blogUrl(lang)}">${escapeHtml(copy.blog)}</a>
              <a class="bna-site-nav-link" href="${faqUrl(lang)}">${escapeHtml(copy.faq)}</a>
              <a class="bna-site-nav-link" href="/parent/login">${escapeHtml(copy.parentLogin)}</a>
              <a class="bna-site-nav-link" href="/student/login">${escapeHtml(copy.studentLogin)}</a>
              <a class="bna-site-nav-link" href="/provider">${escapeHtml(copy.providerLogin)}</a>
              <a class="bna-site-nav-link" href="/become-service-provider">${escapeHtml(copy.providerJoin)}</a>
            </div>
            <div class="bna-site-nav-buttons">
              <button class="bna-site-lang-toggle" id="languageToggle" type="button">${escapeHtml(copy.language)}</button>
              <a class="bna-site-nav-button bna-site-nav-contact" href="https://wa.me/972534932631" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.contact)}</a>
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

  function init() {
    document.querySelectorAll('[data-bna-site-nav]').forEach(renderSiteNav);
  }

  window.BNASiteNav = { render: renderSiteNav };

  init();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
