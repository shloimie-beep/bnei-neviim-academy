(function () {
  function language() {
    return window.location.pathname.startsWith("/he") ? "he" : "en";
  }

  function homeUrl(lang = language()) {
    return lang === "he" ? "/he" : "/";
  }

  function blogUrl(lang = language()) {
    return lang === "he" ? "/he/blog" : "/blog";
  }

  function faqUrl(lang = language()) {
    return lang === "he" ? "/he/faq" : "/faq";
  }

  function postUrl(post) {
    return post.lang === "he" ? `/he/blog/${post.slug}` : `/blog/${post.slug}`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setMeta(name, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setMetaProperty(property, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function absoluteUrl(value) {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://bneineviimacademy.org${String(value).startsWith("/") ? "" : "/"}${value}`;
  }

  function setSocialMeta({
    title,
    description,
    path,
    type = "website",
    image = window.BNAContent?.site?.socialImage || "https://bneineviimacademy.org/images/bna-social-preview.png",
    imageAlt = "Bnei Neviim Academy logo",
  } = {}) {
    if (title) {
      setMetaProperty("og:title", title);
      setMeta("twitter:title", title);
    }
    if (description) {
      setMetaProperty("og:description", description);
      setMeta("twitter:description", description);
    }
    setMetaProperty("og:site_name", "Bnei Neviim Academy");
    setMetaProperty("og:type", type);
    if (path) setMetaProperty("og:url", absoluteUrl(path));
    setMetaProperty("og:image", absoluteUrl(image));
    setMetaProperty("og:image:secure_url", absoluteUrl(image));
    setMetaProperty("og:image:width", "1200");
    setMetaProperty("og:image:height", "630");
    setMetaProperty("og:image:alt", imageAlt);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:image", absoluteUrl(image));
  }

  function setTitle(title) {
    if (title) document.title = title;
  }

  function setCanonical(path) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${window.location.origin}${path}`);
  }

  function setJsonLd(id, data) {
    const previous = document.getElementById(id);
    if (previous) previous.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function renderNav(mountId = "navMount") {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    if (mount.hasAttribute("data-bna-site-nav") && window.BNASiteNav?.render) {
      window.BNASiteNav.render(mount);
      return;
    }
    const lang = language();
    const otherLang = lang === "he" ? "en" : "he";
    const labels =
      lang === "he"
        ? {
            home: "בית",
            blog: "מאמרים",
            faq: "שאלות",
            contact: "צור קשר",
            signup: "הרשמה",
            lang: "English",
            categories: "קטגוריות",
            location: "רמת בית שמש",
          }
        : {
            home: "Home",
            blog: "Blog",
            faq: "FAQ",
            contact: "Contact Us",
            signup: "Sign Up",
            lang: "עברית",
            categories: "Categories",
            location: "Ramat Beit Shemesh",
          };
    const categories = (window.BNAContent.categories[lang] || []).map(
      (category) =>
        `<a href="${blogUrl(lang)}?category=${encodeURIComponent(category)}">${escapeHtml(category)}</a>`,
    );

    mount.innerHTML = `
      <nav class="site-nav" aria-label="Primary navigation">
        <div class="site-nav__inner">
          <a class="brand" href="${homeUrl(lang)}">
            <img src="/images/bna-logo-nobg.png" alt="Bnei Neviim Academy">
            <span>
              <strong>Bnei Neviim Academy</strong>
              <span>${escapeHtml(labels.location)}</span>
            </span>
          </a>
          <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
          <div class="nav-links" id="pageNavLinks">
            <a class="nav-link" href="${homeUrl(lang)}">${escapeHtml(labels.home)}</a>
            <details class="nav-dropdown nav-dropdown--desktop">
              <summary>${escapeHtml(labels.blog)}</summary>
              <div class="nav-dropdown__panel">
                <a href="${blogUrl(lang)}"><strong>${escapeHtml(labels.blog)}</strong></a>
                ${categories.join("")}
              </div>
            </details>
            <a class="nav-link nav-link--mobile-only" href="${blogUrl(lang)}">${escapeHtml(labels.blog)}</a>
            <a class="nav-link" href="${faqUrl(lang)}">${escapeHtml(labels.faq)}</a>
            <a class="nav-link nav-link--contact" href="${window.BNAContent.site.whatsapp}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.contact)}</a>
            <a class="nav-link nav-link--signup" href="${window.BNAContent.site.signup}">${escapeHtml(labels.signup)}</a>
            <a class="nav-link" href="${otherLang === "he" ? toHebrewPath() : toEnglishPath()}">${escapeHtml(labels.lang)}</a>
          </div>
        </div>
      </nav>`;

    const toggle = mount.querySelector(".nav-toggle");
    const links = mount.querySelector("#pageNavLinks");
    const closeNav = () => {
      links?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
      links
        ?.querySelectorAll(".nav-dropdown[open]")
        .forEach((dropdown) => dropdown.removeAttribute("open"));
    };

    toggle?.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        links
          .querySelectorAll(".nav-dropdown[open]")
          .forEach((dropdown) => dropdown.removeAttribute("open"));
      }
    });

    links?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  function toHebrewPath() {
    const path = window.location.pathname;
    if (path === "/") return "/he";
    if (path.startsWith("/he")) return path;
    return `/he${path}`;
  }

  function toEnglishPath() {
    const path = window.location.pathname;
    if (path === "/he") return "/";
    if (path.startsWith("/he/")) return path.replace(/^\/he/, "");
    return path;
  }

  function renderFooter(mountId = "footerMount") {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    if (mount.hasAttribute("data-bna-site-footer") && window.BNASiteNav?.renderFooter) {
      window.BNASiteNav.renderFooter(mount);
      return;
    }
    const lang = language();
    const location = lang === "he" ? "רמת בית שמש" : "Ramat Beit Shemesh";
    const nonprofit =
      lang === "he"
        ? "עמותה רשומה במדינת ניו ג׳רזי"
        : "Registered nonprofit in the State of New Jersey";
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="footer-content">
          <strong>${escapeHtml(location)}</strong>
          <div class="footer-socials" aria-label="Social profiles">
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
          <span>&copy; ${new Date().getFullYear()} Bnei Neviim Academy. All rights reserved.</span>
        </div>
      </footer>`;
  }

  function renderBlogCard(post, heading = "h2") {
    const headingTag = heading === "h3" ? "h3" : "h2";
    return `
      <article class="blog-card" data-category="${escapeHtml(post.category)}">
        <a class="blog-card__image" href="${postUrl(post)}" aria-label="${escapeHtml(post.title)}">
          <img src="${escapeHtml(post.image)}" alt="">
        </a>
        <div class="blog-card__body">
          <div class="blog-card__category">${escapeHtml(post.category)}</div>
          <${headingTag}>${escapeHtml(post.title)}</${headingTag}>
          <p>${escapeHtml(post.excerpt)}</p>
          <a class="read-link" href="${postUrl(post)}">${post.lang === "he" ? "קרא עוד" : "Read article"}</a>
        </div>
      </article>`;
  }

  window.BNAPages = {
    language,
    homeUrl,
    blogUrl,
    faqUrl,
    postUrl,
    escapeHtml,
    setMeta,
    setMetaProperty,
    setSocialMeta,
    setTitle,
    setCanonical,
    setJsonLd,
    renderNav,
    renderFooter,
    renderBlogCard,
  };
})();
