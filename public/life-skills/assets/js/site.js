/* LS-100: dependency-free public page. No client-data collection or external fetch. */
(function (global) {
  "use strict";
  const TEXT = {
  "he": {
    "brand": "כישורי חיים",
    "tagline": "לחיים שלמים",
    "preview": "תצוגה לבדיקת האתר — לא אתר שפורסם.",
    "navTeaching": "מה לומדים",
    "navFounder": "על שלמה",
    "navFaq": "שאלות נפוצות"
  },
  "en": {
    "brand": "Life Skills",
    "tagline": "",
    "preview": "Website review preview — not a published service page.",
    "navTeaching": "What children learn",
    "navFounder": "About Shlomo",
    "navFaq": "Common questions"
  }
};
  const TITLES = {
    he: "כישורי חיים | טיפול רגשי לבנים בגילאי 8–12",
    en: "Life Skills | Emotional Therapy for Boys Ages 8–12"
  };
  const DESCRIPTIONS = {
    he: "טיפול רגשי לבנים בגילאי 8–12, עם הדרכת הורים מעשית.",
    en: "Emotional therapy for boys ages 8–12, with practical parent guidance."
  };
  function chooseLocale(search, fallback) {
    const requested = new URLSearchParams(search).get("lang");
    return requested === "en" || requested === "he" ? requested : fallback === "en" ? "en" : "he";
  }
  function contactUrl(config) {
    if (!config || config.whatsappVerified !== true || typeof config.whatsappNumber !== "string") return null;
    // Exact E.164 digits without plus, separators, query strings or a local leading zero.
    if (!/^[1-9][0-9]{7,14}$/.test(config.whatsappNumber)) return null;
    return "https://wa.me/" + config.whatsappNumber;
  }
  function photoPath(config) {
    if (!config || config.founderImageApproved !== true || typeof config.founderImage !== "string") return null;
    // Only an explicitly approved same-origin raster asset. No remote tracking, SVG, or traversal.
    return /^assets\/images\/[a-zA-Z0-9_-]+\.(?:webp|jpg|jpeg|png)$/.test(config.founderImage) ? config.founderImage : null;
  }
  function publicationProblems(config) {
    const c = config || {};
    const reasons = [];
    if (!contactUrl(c)) reasons.push("CONTACT_UNVERIFIED");
    if (!photoPath(c)) reasons.push("FOUNDER_PHOTO_UNVERIFIED");
    if (c.locationVerified !== true) reasons.push("LOCATION_UNVERIFIED");
    if (c.legalReviewApproved !== true) reasons.push("LEGAL_REVIEW_UNVERIFIED");
    if (c.publicationApproved !== true) reasons.push("PUBLICATION_NOT_AUTHORIZED");
    return reasons;
  }
  const api = Object.freeze({chooseLocale, contactUrl, photoPath, publicationProblems});
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!global.document) return;
  const doc = global.document;
  const config = global.LIFE_SKILLS_CONFIG || {};
  let locale = chooseLocale(global.location.search, config.defaultLanguage);
  doc.documentElement.classList.add("js");

  function applyLanguage(next, announce) {
    locale = next;
    const direction = next === "he" ? "rtl" : "ltr";
    doc.documentElement.lang = next;
    doc.documentElement.dir = direction;
    doc.documentElement.dataset.locale = next;
    doc.title = TITLES[next];
    doc.querySelector('meta[name="description"]').content = DESCRIPTIONS[next];
    doc.querySelectorAll("[data-ui]").forEach(el => {
      const key = el.dataset.ui;
      el.textContent = key === "skip" ? (next === "he" ? "דלגו לתוכן" : "Skip to content") : TEXT[next][key];
    });
    const tagline = doc.querySelector('[data-ui="tagline"]');
    if (tagline) tagline.hidden = !TEXT[next].tagline;
    doc.querySelector("[data-ui-nav]").setAttribute("aria-label", next === "he" ? "ניווט ראשי" : "Main navigation");
    doc.querySelectorAll("[data-nav]").forEach(el => el.setAttribute("href", "#" + el.dataset.nav + "-" + next));
    doc.querySelectorAll("[data-language]").forEach(el => {
      if (el.dataset.language === next) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    if (announce) doc.getElementById("language-status").textContent = next === "he" ? "השפה שונתה לעברית" : "Language changed to English";
  }
  applyLanguage(locale, false);

  doc.querySelectorAll("[data-language]").forEach(link => link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const next = link.dataset.language;
    const oldHash = global.location.hash;
    // Preserve only our known section anchor. Never propagate arbitrary URL parameters.
    const anchor = /^#(?:teaching|founder|faq|contact)-(he|en)$/.test(oldHash) ? oldHash.replace(/-(he|en)$/, "-" + next) : "";
    global.history.pushState(null, "", global.location.pathname + "?lang=" + next + anchor);
    applyLanguage(next, true);
  }));
  global.addEventListener("popstate", () => applyLanguage(chooseLocale(global.location.search, config.defaultLanguage), true));

  const contact = contactUrl(config);
  doc.querySelectorAll("[data-contact]").forEach(link => {
    if (contact) {
      link.href = contact;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.referrerPolicy = "no-referrer";
    } else {
      link.setAttribute("aria-describedby", "contact-status-" + link.dataset.locale);
      link.addEventListener("click", () => {
        const panel = doc.getElementById("contact-" + link.dataset.locale);
        panel.focus({preventScroll: true});
      });
    }
  });
  doc.querySelectorAll("[data-contact-unavailable]").forEach(panel => {
    panel.id = "contact-status-" + panel.closest("[data-page-locale]").dataset.pageLocale;
    panel.hidden = Boolean(contact);
  });
  let failedPhoto = false;
  const photo = photoPath(config);
  const preview = doc.querySelector("[data-preview]");
  function refreshPreview() { preview.hidden = publicationProblems(config).length === 0 && !failedPhoto; }
  if (photo) {
    doc.querySelectorAll("[data-founder-image]").forEach(img => {
      const placeholder = img.parentElement.querySelector("[data-photo-placeholder]");
      img.addEventListener("load", () => { img.hidden = false; placeholder.hidden = true; refreshPreview(); });
      img.addEventListener("error", () => { img.hidden = true; placeholder.hidden = false; failedPhoto = true; refreshPreview(); });
      img.src = photo;
    });
  }
  refreshPreview();
  // Explicit links to disclosures also open their native accessible disclosure widget.
  doc.querySelectorAll('a[href^="#privacy-"]').forEach(link => link.addEventListener("click", () => {
    const target = doc.getElementById(link.hash.slice(1));
    if (target) target.querySelector("details").open = true;
  }));
})(typeof window !== "undefined" ? window : globalThis);
