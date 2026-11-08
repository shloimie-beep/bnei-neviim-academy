'use strict';
const copy = require('../../../config/bna-interest-copy.json');
const schoolContent = require('../../../config/bna-school-content.json');
const { NOTICE } = require('./interest-launch');
const { renderPrivacyPolicy } = require('./privacy-policy');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const prefix = locale => locale === 'he' ? '/he' : '';
const pageId = (id, locale) => locale === 'he' ? 'H' + id : id;
const articleHref = id => schoolContent.articles.find(article => article.id === id)?.route || (id.startsWith('HA') ? '/he' : '') + '/blog/' + id.toLowerCase();
const FORBIDDEN_LOGISTICS = /\bmornings?\b|\b(?:North Miami|Hollywood|Boca Raton)\b|location to be announced|\b\d{1,2}(?::\d\d)?\s*(?:a\.?m\.?|p\.?m\.?)\b|two.to.two.and.a.half|בבוקר|הבוקר|בבקרים|כשעתיים|המיקום.*יפורסם/i;
const OMISSIONS = [
  'Morning sessions last approximately two to two-and-a-half hours, with parent drop-off.',
  'Location to be announced. Exact days and times are confirmed for each group.',
  'מפגשי הבוקר נמשכים כשעתיים עד שעתיים וחצי, וההורים מביאים את הבנים למסגרת.',
  'המיקום יפורסם בהמשך. הימים והשעות המדויקים ייקבעו לכל קבוצה.',
  'Sessions run for approximately two to two-and-a-half hours in the morning, with parent drop-off.',
  'המתקיימים בבוקר ונמשכים כשעתיים עד שעתיים וחצי.',
  'המפגשים מתקיימים בבוקר ונמשכים כשעתיים עד שעתיים וחצי.',
  'Sessions last approximately two to two-and-a-half hours.',
  'Exact days, times, and location will be arranged for each group.',
  'exact days, times, and location will be arranged for each group.',
  'Location to be announced.', 'המיקום יפורסם בהמשך.', 'המיקום המדויק יפורסם בהמשך.',
  'Exact days and times are confirmed for each group.',
  ' for the morning', ' של הבוקר',
  'הימים והשעות המדויקים ייקבעו לכל קבוצה.',
  'המיקום בדרום פלורידה והשעות המדויקות ייקבעו בתיאום.',
  'למשך כשעתיים עד שעתיים וחצי, ', 'כשעתיים עד שעתיים וחצי; מיקום ושעות בתיאום.',
  'into a full day, ', 'לאורך יום מלא, ', ' לאורך יום מלא', ' ליום מלא',
];
function launchOmissions(value) {
  let result = value;
  for (const omitted of OMISSIONS) result = result.replaceAll(omitted, '');
  return result.replace(/last approximately two to two-and-a-half hours and /g, '')
    .replace(/Kodesh sessions lasting approximately two to two-and-a-half hours/g, 'Kodesh sessions')
    .replace(/הנמשכים כשעתיים עד שעתיים וחצי/g, '')
    .replace(/\bMorning, /g, '').replace(/\bMorning /g, '').replace(/\bmorning-pod/g, 'pod')
    .replace(/ in the morning/g, '').replace(/\bmorning /g, '')
    .replace(/ בבוקר/g, '').replace(/ הבוקר/g, '').replace(/ בבקרים/g, '')
    .replace(/full-day /g, '').replace(/,?\s*;\s*(?=\n|$)/g, '')
    .replace(/ {2,}/g, ' ').trim();
}
function sections(id) {
  const markdown = copy.pages[id]?.markdown || '';
  return markdown.split(/\n(?=### )/).slice(1).map(block => { const nl = block.indexOf('\n'); return { title: block.slice(4, nl).trim(), body: block.slice(nl + 1).trim() }; });
}
function section(id, index) { return sections(id)[index] || { title: '', body: '' }; }
function targetFor(anchor, locale) {
  if (!anchor.startsWith('#')) return /^(?:https:\/\/|mailto:|tel:)/.test(anchor) ? anchor : '#main';
  const match = anchor.match(/^#(h?(?:p|f|a)\d{2})(?:-|$)/i); if (!match) return anchor;
  const rawId = match[1].toUpperCase(), id = rawId.replace(/^H/, ''), pre = prefix(locale);
  const resolved = schoolContent.linkResolver[rawId.toLowerCase()];
  if (resolved && (/^H?A\d{2}$/.test(rawId) || ['P04','P11','HP04','HP11','P17','HP17'].includes(rawId))) return resolved;
  const route = { P01: '/', P02: '/learning-pods', P03: '/academy-2027-28', P04: '/blog#foundations', P05: '/blog', P11: '/#vision', P12: '/support/vision', P15: '/#founder', P16: '/faq', P19: '/join', P20: '/privacy', F01: '/join' }[id];
  if (route) return (route === '/' ? pre || '/' : pre + route);
  if (/^A\d{2}$/.test(id)) return articleHref(rawId);
  return null;
}
function inline(text, locale) {
  return escape(text).replace(/2027–28/g, '<bdi dir="ltr">2027–28</bdi>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_all, label, href) => { const target=targetFor(href.replace(/&amp;/g, '&'),locale);return target ? `<a href="${escape(target)}">${label}</a>` : label; }).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
function paragraphs(body, locale, { omitLogistics = true } = {}) {
  return body.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean).map(part => {
    if (/^(?:Design annotation|Localization annotation|Publication annotation|Publication status|Route:|Search title:|Search description:|Button:|Text link|Helper:|First field:|Options:|כפתור:|קישור:|קישורים:|טקסט עזר:|##)/.test(part)) return '';
    const text = omitLogistics ? launchOmissions(part) : part;
    if (!text || omitLogistics && FORBIDDEN_LOGISTICS.test(text)) return '';
    if (text.startsWith('- ')) return '<ul>' + text.split('\n').map(row => `<li>${inline(row.replace(/^- /, ''), locale)}</li>`).join('') + '</ul>';
    return `<p>${inline(text, locale)}</p>`;
  }).join('\n');
}
function header(locale, route, options = {}) {
  const he = locale === 'he', pre = prefix(locale);
  const alternate = options.alternateRoute || (he ? '' : '/he') + (route === '/' ? '' : route.startsWith('/blog/') ? '/blog' : route);
  const languageLabel = options.equivalentTranslation === false ? (he ? 'English article library' : 'ספריית המאמרים בעברית') : (he ? 'English' : 'עברית');
  const links = [[pre+'/learning-pods', he?'קבוצות לימוד':'Learning Pods'],[pre+'/academy-2027-28',he?'האקדמיה 2027–28':'Academy 2027–28'],[pre+'/blog',he?'הגישה החינוכית':'Teaching Philosophy'],[pre+'/faq',he?'שאלות נפוצות':'FAQ']];
  const nav = links.map(([href,label])=>'<a href="'+href+'">'+escape(label).replace(/2027–28/g,'<bdi dir="ltr">2027–28</bdi>')+'</a>').join('');
  const action = schoolContent.exact[locale].interest_cta;
  return '<a class="skip" href="#main">'+(he?'דלגו לתוכן':'Skip to content')+'</a><header class="launch-header"><div class="launch-wrap header-row"><a class="identity" href="'+(pre||'/')+'" aria-label="Bnei Neviim Academy"><img src="/images/bna-launch/bna-logo.png" width="56" height="56" alt=""><span>Bnei Neviim Academy<small>South Florida</small></span></a><nav class="desktop-navigation" aria-label="'+(he?'ניווט ראשי':'Main navigation')+'">'+nav+'</nav><div class="header-actions"><a class="language-switch" href="'+(alternate||'/')+'" data-language-link>'+languageLabel+'</a><a class="button button-small" href="'+pre+'/join">'+escape(action)+'</a><details class="mobile-menu"><summary aria-label="'+(he?'תפריט':'Menu')+'"><span aria-hidden="true">☰</span></summary><nav aria-label="'+(he?'ניווט נייד':'Mobile navigation')+'">'+nav+'<a href="'+pre+'/join">'+escape(action)+'</a></nav></details></div></div></header>';
}
function footer(locale) { const he = locale === 'he', pre = prefix(locale); return `<footer class="launch-footer"><div class="launch-wrap footer-grid"><a class="identity" href="${pre || '/'}"><img src="/images/bna-launch/bna-logo.png" width="64" height="64" alt=""><span>Bnei Neviim Academy<small>South Florida</small></span></a><nav aria-label="${he ? 'קישורי תחתית' : 'Footer navigation'}"><a href="${pre}/join">${he ? 'הצטרפות ל־BNA' : 'Join BNA'}</a><a href="${pre}/blog">${he ? 'מאמרים' : 'Articles'}</a><a href="${pre}/support/vision">${he ? 'תמכו בחזון של BNA' : 'Support the BNA Vision'}</a><a href="${pre}/privacy">${he ? 'הודעת הפרטיות' : 'Privacy Notice'}</a><a href="/operations">${he ? 'כניסת צוות BNA' : 'BNA Staff Login'}</a></nav><p><a href="mailto:office@bneineviimacademy.org">office@bneineviimacademy.org</a><br><a href="tel:+13054916674" dir="ltr">+1 (305) 491-6674</a></p></div></footer>`; }
function document(title, body, locale, route, script = '', metadata = '', options = {}) {
  const he = locale === 'he';
  const sourceId = { '/': 'P01', '/join': 'F01', '/learning-pods': 'P02', '/academy-2027-28': 'P03', '/philosophy': 'P04', '/vision': 'P11', '/faq': 'P16', '/blog': 'P05', '/support/vision': 'P12' }[route];
  const source = metadata || (sourceId ? copy.pages[pageId(sourceId,locale)]?.markdown || '' : '');
  const selectedTitle = launchOmissions(options.title || source.match(/^Search title: (.+)$/m)?.[1] || title);
  const description = launchOmissions(options.description || source.match(/^Search description: (.+)$/m)?.[1] || schoolContent.exact[locale].vision);
  const canonicalRoute = options.canonicalRoute || (route === '/' ? (he ? '/he' : '/') : prefix(locale) + route);
  const canonical = 'https://bneineviimacademy.org' + canonicalRoute;
  const image = 'https://bneineviimacademy.org' + (options.image || '/images/bna-launch/BNA_Hero_Desktop_APPROVED_SouthFlorida_Gray.png');
  const alternate = options.alternateRoute || (he?'':'/he')+(route==='/'?'':route);
  const alternates = options.equivalentTranslation === false ? '' : '<link rel="alternate" hreflang="'+(he?'en':'he')+'" href="https://bneineviimacademy.org'+(alternate||'/')+'">';
  const commonScript = script.includes('/js/bna-articles.js') ? '' : '<script src="/js/bna-articles.js" defer></script>';
  return '<!doctype html><html lang="'+locale+'" dir="'+(he?'rtl':'ltr')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(selectedTitle)+'</title><meta name="description" content="'+escape(description)+'"><link rel="canonical" href="'+escape(canonical)+'"><link rel="alternate" hreflang="'+locale+'" href="'+escape(canonical)+'">'+alternates+'<meta property="og:type" content="'+(options.ogType||'website')+'"><meta property="og:title" content="'+escape(selectedTitle)+'"><meta property="og:description" content="'+escape(description)+'"><meta property="og:url" content="'+escape(canonical)+'"><meta property="og:image" content="'+escape(image)+'"><meta property="og:locale" content="'+(he?'he_IL':'en_US')+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+escape(selectedTitle)+'"><meta name="twitter:description" content="'+escape(description)+'"><meta name="twitter:image" content="'+escape(image)+'"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Serif+Hebrew:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/bna-interest-launch.css">'+commonScript+script+'</head><body>'+header(locale,route,options)+body+footer(locale)+'</body></html>';
}
function cta(locale, program = 'pod') { const he = locale === 'he'; return `<a class="button" href="${prefix(locale)}/join?interest=${program}">${program === 'academy' ? he ? 'הצטרפו לאקדמיה' : 'Join the Academy' : he ? 'הצטרפו לקבוצת לימוד' : 'Join a Learning Pod'}<span aria-hidden="true">${he ? '←' : '→'}</span></a>`; }
function renderInterestHome(locale = 'en') { return schoolPages.renderHome(locale); }
function renderInfoPage(id, locale = 'en') {
  if (id === 'P16') return schoolPages.renderFaq(locale);
  if (id === 'P17') return schoolPages.renderGuide(locale);
  const he = locale === 'he', resolved = pageId(id, locale), p = copy.pages[resolved]; if (!p) return null;
  const route = { P02: '/learning-pods', P03: '/academy-2027-28', P04: '/philosophy', P11: '/vision', P16: '/faq' }[id];
  let content = '';
  for (const s of sections(resolved)) {
    if (/Location|Schedule|Daily Schedule|מיקום|זמנים|היום|לוח|הרשת הרחבה|The Wider Network/.test(s.title)) continue;
    if (id === 'P16') {
      const parts = s.body.split(/\n(?=#### )/);
      for (const block of parts) { if (!block.startsWith('#### ')) continue; const nl = block.indexOf('\n'), title = launchOmissions(block.slice(5, nl)), body = launchOmissions(block.slice(nl + 1)); if (FORBIDDEN_LOGISTICS.test(title + ' ' + body) || /How long|Where do|location confirmed|כמה זמן|היכן|מיקום/.test(title)) continue; content += `<details class="faq-item"><summary>${inline(title, locale)}</summary>${paragraphs(body, locale)}</details>`; }
    } else content += `<section class="article-section"><h2>${escape(launchOmissions(s.title))}</h2>${paragraphs(s.body, locale)}</section>`;
  }
  return document(launchOmissions(p.title), `<main id="main" class="launch-wrap article-page"><h1>${escape(launchOmissions(p.title))}</h1>${content}<div class="article-cta">${cta(locale, id === 'P03' ? 'academy' : 'pod')}</div></main>`, locale, route);
}
function renderInterestForm(env = process.env, locale = 'en') {
  const he = locale === 'he', pre = prefix(locale), policy = renderPrivacyPolicy(locale, { approved: env.BNA_PRIVACY_RELEASE_APPROVED === 'true', operator: env.BNA_PRIVACY_OPERATOR_LEGAL_NAME, effectiveDate: env.BNA_PRIVACY_EFFECTIVE_DATE });
  const ready = env.BNA_COOP_FORM_ENABLED === 'true' && env.BNA_COOP_INTEREST_GATEWAY_ENABLED === 'true' && Boolean(policy);
  const label = (en, hebrew) => escape(he ? hebrew : en).replace(/2027–28/g, '<bdi dir="ltr">2027–28</bdi>');
  const field = (name, en, hebrew, input, full = false) => `<div class="field ${full ? 'full' : ''}"><label for="interest-${name}">${label(en, hebrew)}</label>${input.replace('<input ', `<input id="interest-${name}" name="${name}" `).replace('<select ', `<select id="interest-${name}" name="${name}" `).replace('<textarea ', `<textarea id="interest-${name}" name="${name}" `)}</div>`;
  const choice = (name, en, hebrew, extra = '') => `<div class="consent-row" ${extra}><label><input type="checkbox" name="${name}" ${name === 'purposeConsent' ? 'required' : ''}><span>${label(en, hebrew)}</span></label></div>`;
  const body = `<main id="main" class="launch-wrap form-page"><div class="form-intro"><span class="section-label">Bnei Neviim Academy</span><h1>${he ? 'הצטרפות ל־BNA' : 'Join BNA'}</h1><p>${he ? 'ספרו במה אתם מתעניינים, מה גיל בנכם והיכן אתם מתגוררים. שלומי ייצור קשר כדי לשוחח על הצעד הבא המתאים.' : "Tell us what you are interested in, your son's age, and where you live. Shloimie will contact you to discuss a suitable next step."}</p><p class="muted">${he ? 'הרשמה להתעניינות היא ללא תשלום. לא נגבה כאן תשלום.' : 'Registering interest is free. No payment is collected here.'}</p></div><form id="coop-interest-form" class="interest-form" data-locale="${locale}"><fieldset ${ready ? '' : 'disabled '}id="coop-fields"><legend>${he ? 'התעניינות בתוכנית' : 'Program Interest'}</legend>${ready ? '' : `<p role="status">${he ? 'הטופס אינו זמין כעת.' : 'The form is temporarily unavailable.'}</p>`}<div class="fields">${field('program', 'What are you interested in?', 'במה אתם מתעניינים?', `<select required><option value="">${he ? 'בחרו תוכנית' : 'Select a program'}</option><option value="pod">${he ? 'קבוצת לימוד' : 'Learning pod'}</option><option value="academy">${he ? 'האקדמיה לשנת הלימודים \u20662027–28\u2069' : 'Academy 2027–28'}</option><option value="both">${he ? 'שתיהן' : 'Both'}</option></select>`, true)}${field('name', 'Parent or guardian name', 'שם ההורה או האפוטרופוס', '<input autocomplete="name" maxlength="160" required>')}${field('contactChannel', 'Preferred reply method', 'אמצעי מענה מועדף', `<select required><option value="email">${he ? 'דוא״ל' : 'Email'}</option><option value="phone">${he ? 'שיחת טלפון' : 'Phone call'}</option><option value="whatsapp">WhatsApp</option></select>`)}${field('email', 'Email address', 'כתובת דוא״ל', '<input type="email" autocomplete="email" dir="ltr" maxlength="254" required>')}${field('phone', 'Phone or WhatsApp number', 'מספר טלפון או וואטסאפ', '<input type="tel" autocomplete="tel" dir="ltr" maxlength="40" aria-describedby="phone-help">')}<p id="phone-help" class="field-help full">${he ? 'הזינו מספר טלפון הכולל קידומת מדינה.' : 'Enter a phone number with its country code.'}</p>${field('language', 'Preferred language', 'שפה מועדפת', `<select required><option value="en" ${he ? '' : 'selected'}>English</option><option value="he" ${he ? 'selected' : ''}>עברית</option></select>`)}${field('area', 'City or general area', 'עיר או אזור כללי', '<input autocomplete="address-level2" maxlength="180" required>')}${field('preferredArea', 'Preferred program area', 'אזור מועדף לפעילות', '<input maxlength="180">')}${field('childAge', "Child's age", 'גיל הילד', '<input type="number" min="1" max="25" inputmode="numeric" required>')}${field('otherChildAge', "Another child's age", 'גיל של ילד נוסף', '<input type="number" min="1" max="25" inputmode="numeric">')}${field('learningArrangement', 'Current learning arrangement', 'מסגרת הלימוד הנוכחית', '<input maxlength="160">')}${field('torahExperience', 'Current Torah learning', 'לימוד התורה הנוכחי', '<textarea rows="3" maxlength="1000"></textarea>', true)}${field('question', 'A brief question or note', 'שאלה או הערה קצרה', '<textarea rows="4" maxlength="2000" aria-describedby="medical-helper"></textarea>', true)}<p id="medical-helper" class="field-help full">${he ? 'אין לצרף לטופס רשומות רפואיות או מידע בריאותי מפורט. אפשר לדון בנושאים רגישים בפרטיות.' : 'Please leave medical records and detailed health information out of this form. Sensitive matters can be discussed privately.'}</p></div><div class="privacy-notice"><p>${he ? 'BNA משתמשת בפרטים האלה כדי להשיב לבקשתכם ולשמור תיעוד פרטי של הפנייה. עדכונים לבחירתכם נפרדים מהבקשה הזאת.' : 'BNA uses these details to respond to your request and keep a private record of the inquiry. Optional updates are separate from this request.'} <a href="${pre}/privacy">${he ? 'הודעת הפרטיות' : 'Privacy Notice'}</a></p>${choice('purposeConsent', NOTICE.en, NOTICE.he)}${choice('articleUpdates', 'Send me BNA educational articles by email.', 'אבקש לקבל בדוא״ל מאמרים חינוכיים של בני נביאים.')}${choice('podUpdates', 'Send me Learning pod updates by email.', 'אבקש לקבל בדוא״ל עדכונים על קבוצות הלימוד.', 'data-pod-updates')}${choice('academyUpdates', 'Send me Academy 2027–28 updates by email.', 'אבקש לקבל בדוא״ל עדכונים על האקדמיה 2027–28.', 'data-academy-updates')}</div><button class="button" type="submit">${he ? 'רישום ההתעניינות שלי' : 'Register My Interest'}</button></fieldset><div id="coop-status" class="save-status" role="status" aria-live="polite" tabindex="-1"></div><button class="button secondary" type="button" id="retry-interest" hidden>${he ? 'נסו שוב' : 'Retry this submission'}</button></form></main>`;
  return document(he ? 'הצטרפות ל־BNA' : 'Join BNA', body, locale, '/join', '<script src="/js/bna-coop-join.js" defer></script>');
}
function renderArticleLibrary(locale = 'en', query = {}) { return schoolPages.renderLibrary(locale, query); }
function renderArticle(slug, locale = 'en') { return schoolPages.renderArticle(slug, locale); }
function renderInterestSupport(env = process.env, locale = 'en') {
  const id = pageId('P12', locale), source = copy.pages[id];
  const existing = require('./support-page').renderSupportPage(env, locale);
  const form = existing.match(/<form\b[^>]*id="support-interest-form"[\s\S]*?<\/form>/)?.[0] || '';
  const unavailable = existing.match(/<p class="note" role="status" data-support-unavailable>[\s\S]*?<\/p>/)?.[0] || '';
  const content = sections(id).filter(item => !/Technology|טכנולוגיה/.test(item.title)).map(item => `<section class="article-section"><h2>${escape(item.title)}</h2>${paragraphs(item.body, locale)}</section>`).join('');
  const body = `<main id="main" class="launch-wrap article-page"><h1>${escape(source.title)}</h1>${content}<section id="form">${unavailable}${form.replace('<form ', '<form class="interest-form" ')}</section></main>`;
  return document(source.title, body, locale, '/support/vision', '<script src="/js/bna-support-interest.js" defer></script>');
}
const schoolPages = require('./school-pages').createSchoolPages({sections, paragraphs, inline, document, launchOmissions, escape, copy});
module.exports = { resolveArticle: schoolPages.findArticle, renderInterestHome, renderInterestForm, renderInfoPage, renderArticleLibrary, renderArticle, renderInterestSupport, sections, paragraphs, launchOmissions, FORBIDDEN_LOGISTICS, escape, document, targetFor };
