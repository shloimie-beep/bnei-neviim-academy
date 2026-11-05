'use strict';
const copy = require('../../../config/bna-interest-copy.json');
const { NOTICE } = require('./interest-launch');
const { renderPrivacyPolicy } = require('./privacy-policy');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const prefix = locale => locale === 'he' ? '/he' : '';
const pageId = (id, locale) => locale === 'he' ? 'H' + id : id;
const articleHref = id => copy.articles[id]?.markdown.match(/Route: `([^`]+)`/)?.[1] || (id.startsWith('HA') ? '/he' : '') + '/blog/' + id.toLowerCase();
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
  const route = { P01: '/', P02: '/learning-pods', P03: '/academy-2027-28', P04: '/philosophy', P05: '/blog', P11: '/vision', P12: '/support/vision', P15: '/#founder', P16: '/faq', P19: '/join', P20: '/privacy', F01: '/join' }[id];
  if (route) return (route === '/' ? pre || '/' : pre + route);
  if (/^A\d{2}$/.test(id)) return articleHref(rawId);
  return pre + '/join';
}
function inline(text, locale) {
  return escape(text).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_all, label, href) => `<a href="${escape(targetFor(href.replace(/&amp;/g, '&'), locale))}">${label}</a>`).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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
function header(locale, route) {
  const he = locale === 'he', pre = prefix(locale), alternate = (he ? '' : '/he') + (route === '/' ? '' : route.startsWith('/blog/') ? '/blog' : route);
  return `<a class="skip" href="#main">${he ? 'דלגו לתוכן' : 'Skip to content'}</a><header class="launch-header"><div class="launch-wrap header-row"><a class="identity" href="${pre || '/'}" aria-label="Bnei Neviim Academy"><img src="/images/bna-launch/bna-logo.png" width="56" height="56" alt=""><span>Bnei Neviim Academy<small>South Florida</small></span></a><nav class="desktop-navigation" aria-label="${he ? 'ניווט ראשי' : 'Main navigation'}"><a href="${pre}/learning-pods">${he ? 'קבוצות לימוד' : 'Learning Pods'}</a><a href="${pre}/academy-2027-28">${he ? 'האקדמיה 2027–28' : 'Academy 2027–28'}</a><a href="${pre}/philosophy">${he ? 'הגישה החינוכית' : 'Teaching Philosophy'}</a><a href="${pre}/faq">${he ? 'שאלות נפוצות' : 'FAQ'}</a></nav><div class="header-actions"><a class="language-switch" href="${alternate || '/'}" data-language-link>${he ? 'English' : 'עברית'}</a><a class="button button-small" href="${pre}/join?interest=pod">${he ? 'הצטרפו לקבוצת לימוד' : 'Join a Learning Pod'}</a><details class="mobile-menu"><summary aria-label="${he ? 'תפריט' : 'Menu'}"><span aria-hidden="true">☰</span></summary><nav aria-label="${he ? 'ניווט נייד' : 'Mobile navigation'}"><a href="${pre}/learning-pods">${he ? 'קבוצות לימוד' : 'Learning Pods'}</a><a href="${pre}/academy-2027-28">${he ? 'האקדמיה 2027–28' : 'Academy 2027–28'}</a><a href="${pre}/philosophy">${he ? 'הגישה החינוכית' : 'Teaching Philosophy'}</a><a href="${pre}/blog">${he ? 'מאמרים' : 'Articles'}</a><a href="${pre}/faq">${he ? 'שאלות נפוצות' : 'FAQ'}</a><a href="${pre}/join?interest=pod">${he ? 'הצטרפו לקבוצת לימוד' : 'Join a Learning Pod'}</a></nav></details></div></div></header>`;
}
function footer(locale) { const he = locale === 'he', pre = prefix(locale); return `<footer class="launch-footer"><div class="launch-wrap footer-grid"><a class="identity" href="${pre || '/'}"><img src="/images/bna-launch/bna-logo.png" width="64" height="64" alt=""><span>Bnei Neviim Academy<small>South Florida</small></span></a><nav aria-label="${he ? 'קישורי תחתית' : 'Footer navigation'}"><a href="${pre}/join">${he ? 'הצטרפות ל־BNA' : 'Join BNA'}</a><a href="${pre}/blog">${he ? 'מאמרים' : 'Articles'}</a><a href="${pre}/support/vision">${he ? 'תמכו בחזון של BNA' : 'Support the BNA Vision'}</a><a href="${pre}/privacy">${he ? 'הודעת הפרטיות' : 'Privacy Notice'}</a><a href="/operations">${he ? 'כניסת צוות BNA' : 'BNA Staff Login'}</a></nav><p><a href="mailto:office@bneineviimacademy.org">office@bneineviimacademy.org</a><br><a href="tel:+13054916674" dir="ltr">+1 (305) 491-6674</a></p></div></footer>`; }
function document(title, body, locale, route, script = '', metadata = '') {
  const he = locale === 'he';
  const sourceId = { '/': 'P01', '/join': 'F01', '/learning-pods': 'P02', '/academy-2027-28': 'P03', '/philosophy': 'P04', '/vision': 'P11', '/faq': 'P16', '/blog': 'P05', '/support/vision': 'P12' }[route];
  const source = metadata || (sourceId ? copy.pages[pageId(sourceId, locale)]?.markdown || '' : '');
  const selectedTitle = launchOmissions(source.match(/^Search title: (.+)$/m)?.[1] || title);
  const description = launchOmissions(source.match(/^Search description: (.+)$/m)?.[1] || copy.pages[pageId('P01', locale)].markdown.match(/^Search description: (.+)$/m)?.[1] || '');
  return `<!doctype html><html lang="${locale}" dir="${he ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(selectedTitle)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="https://bneineviimacademy.org${prefix(locale)}${route === '/' ? '/' : route}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Serif+Hebrew:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/bna-interest-launch.css">${script}</head><body>${header(locale, route)}${body}${footer(locale)}</body></html>`;
}
function cta(locale, program = 'pod') { const he = locale === 'he'; return `<a class="button" href="${prefix(locale)}/join?interest=${program}">${program === 'academy' ? he ? 'הצטרפו לאקדמיה' : 'Join the Academy' : he ? 'הצטרפו לקבוצת לימוד' : 'Join a Learning Pod'}<span aria-hidden="true">${he ? '←' : '→'}</span></a>`; }
function renderInterestHome(locale = 'en') {
  const he = locale === 'he', id = pageId('P01', locale), s = sections(id), vision = section(pageId('P11', locale), 0);
  const block = (index, attrs = '', image = '') => `<section class="launch-section" ${attrs}><div class="launch-wrap ${image ? 'editorial-grid' : 'reading-width'}">${image ? `<figure><img src="/images/bna-launch/${image}" alt="" loading="lazy" width="1366" height="768"></figure>` : ''}<div><h2>${escape(launchOmissions(s[index]?.title || ''))}</h2>${paragraphs(s[index]?.body || '', locale)}</div></div></section>`;
  const body = `<main id="main"><section class="approved-hero" aria-label="Bnei Neviim Academy — South Florida"><h1 class="sr-only">כי מלאה הארץ דעה את ה׳ כמים לים מכסים · Bnei Neviim Academy · South Florida · Raising the generation of the Geulah.</h1><picture><source media="(max-width: 700px)" srcset="/images/bna-launch/BNA_Hero_Mobile_APPROVED_SouthFlorida_Gray.png"><img src="/images/bna-launch/BNA_Hero_Desktop_APPROVED_SouthFlorida_Gray.png" width="1672" height="941" alt="" fetchpriority="high"></picture></section><section class="who-we-are launch-wrap"><p ${he ? 'lang="en" dir="ltr"' : ''}>${inline(section(id, 1).body.split('\n\n')[0], 'en')}</p></section><section class="launch-section vision-section" id="vision"><div class="launch-wrap two-column"><div><span class="section-label">${he ? 'החזון' : 'Vision'}</span><h2>${escape(vision.title)}</h2></div><div>${paragraphs(vision.body, locale)}</div></div></section><section class="launch-section mission-section" id="mission"><div class="launch-wrap editorial-grid"><figure><img src="/images/bna-launch/bunny.png" width="1920" height="1080" alt="" loading="lazy"></figure><div><span class="section-label">${he ? 'קהילה חינוכית' : 'Mission'}</span><h2>${escape(s[2].title)}</h2>${paragraphs(s[2].body, locale)}</div></div></section><section class="launch-section pod-section" id="learning-pods"><div class="launch-wrap two-column"><div><span class="section-label">${he ? 'קבוצת לימוד' : 'Humble Beginnings'}</span><h2>${escape(launchOmissions(s[3].title))}</h2></div><div>${paragraphs(s[3].body, locale)}${cta(locale)}</div></div></section><section class="launch-section academy-section" id="academy"><div class="launch-wrap editorial-grid"><figure><img src="/images/bna-launch/huddle.png" width="1366" height="768" alt="" loading="lazy"></figure><div><span class="section-label">2027–28</span><h2>${escape(s[4].title)}</h2>${paragraphs(s[4].body, locale)}${cta(locale, 'academy')}</div></div></section>${block(5)}<section class="launch-section founder-section" id="founder"><div class="launch-wrap founder-grid"><img class="founder-portrait" src="/images/bna-launch/founder.jpg" width="720" height="720" alt="${he ? 'שלומי דרטלר' : 'Shloimie Dratler'}" loading="lazy"><div><h2>${escape(s[6].title)}</h2>${paragraphs(s[6].body, locale)}</div></div></section><section class="launch-section testimonial-section"><div class="launch-wrap testimonial-grid"><img src="/images/bna-launch/boys-with-sticks.jpg" alt="" loading="lazy"><div><h2>${escape(s[8].title)}</h2>${paragraphs(s[8].body, locale)}</div></div></section>${block(7)}<section class="launch-section"><div class="launch-wrap reading-width"><h2>${escape(s[9].title)}</h2>${paragraphs(s[9].body, locale)}<a class="text-link" href="${prefix(locale)}/blog">${he ? 'מאמרים' : 'Articles'}</a></div></section><section class="launch-section"><div class="launch-wrap reading-width"><h2>${escape(s[10].title)}</h2>${s[10].body.split(/\n(?=#### )/).filter(part => part.startsWith('#### ') && !/Where will|היכן/.test(part)).map(part => { const nl = part.indexOf('\n'); return `<details class="faq-item"><summary>${inline(part.slice(5, nl), locale)}</summary>${paragraphs(part.slice(nl + 1), locale)}</details>`; }).join('')}<a href="${prefix(locale)}/faq">${he ? 'שאלות נפוצות' : 'Frequently Asked Questions'}</a></div></section><section class="launch-section final-interest"><div class="launch-wrap reading-width"><h2>${escape(s.at(-1).title)}</h2>${paragraphs(s.at(-1).body, locale)}${cta(locale)}</div></section></main>`;
  return document(he ? 'לימוד תורה בדרום פלורידה' : 'South Florida Torah Learning', body, locale, '/');
}
function renderInfoPage(id, locale = 'en') {
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
  const label = (en, hebrew) => escape(he ? hebrew : en);
  const field = (name, en, hebrew, input, full = false) => `<div class="field ${full ? 'full' : ''}"><label for="interest-${name}">${label(en, hebrew)}</label>${input.replace('<input ', `<input id="interest-${name}" name="${name}" `).replace('<select ', `<select id="interest-${name}" name="${name}" `).replace('<textarea ', `<textarea id="interest-${name}" name="${name}" `)}</div>`;
  const choice = (name, en, hebrew, extra = '') => `<div class="consent-row" ${extra}><label><input type="checkbox" name="${name}" ${name === 'purposeConsent' ? 'required' : ''}><span>${label(en, hebrew)}</span></label></div>`;
  const body = `<main id="main" class="launch-wrap form-page"><div class="form-intro"><span class="section-label">Bnei Neviim Academy</span><h1>${he ? 'הצטרפות ל־BNA' : 'Join BNA'}</h1><p>${he ? 'ספרו במה אתם מתעניינים, מה גיל בנכם והיכן אתם מתגוררים. שלומי ייצור קשר כדי לשוחח על הצעד הבא המתאים.' : "Tell us what you are interested in, your son's age, and where you live. Shloimie will contact you to discuss a suitable next step."}</p><p class="muted">${he ? 'הרשמה להתעניינות היא ללא תשלום. לא נגבה כאן תשלום.' : 'Registering interest is free. No payment is collected here.'}</p></div><form id="coop-interest-form" class="interest-form" data-locale="${locale}"><fieldset ${ready ? '' : 'disabled '}id="coop-fields"><legend>${he ? 'התעניינות בתוכנית' : 'Program Interest'}</legend>${ready ? '' : `<p role="status">${he ? 'הטופס אינו זמין כעת.' : 'The form is temporarily unavailable.'}</p>`}<div class="fields">${field('program', 'What are you interested in?', 'במה אתם מתעניינים?', `<select required><option value="">${he ? 'בחרו תוכנית' : 'Select a program'}</option><option value="pod">${he ? 'קבוצת לימוד' : 'Learning pod'}</option><option value="academy">${he ? 'האקדמיה לשנת הלימודים 2027–28' : 'Academy 2027–28'}</option><option value="both">${he ? 'שתיהן' : 'Both'}</option></select>`, true)}${field('name', 'Parent or guardian name', 'שם ההורה או האפוטרופוס', '<input autocomplete="name" maxlength="160" required>')}${field('contactChannel', 'Preferred reply method', 'אמצעי מענה מועדף', `<select required><option value="email">${he ? 'דוא״ל' : 'Email'}</option><option value="phone">${he ? 'שיחת טלפון' : 'Phone call'}</option><option value="whatsapp">WhatsApp</option></select>`)}${field('email', 'Email address', 'כתובת דוא״ל', '<input type="email" autocomplete="email" dir="ltr" maxlength="254" required>')}${field('phone', 'Phone or WhatsApp number', 'מספר טלפון או וואטסאפ', '<input type="tel" autocomplete="tel" dir="ltr" maxlength="40" aria-describedby="phone-help">')}<p id="phone-help" class="field-help full">${he ? 'הזינו מספר טלפון הכולל קידומת מדינה.' : 'Enter a phone number with its country code.'}</p>${field('language', 'Preferred language', 'שפה מועדפת', `<select required><option value="en" ${he ? '' : 'selected'}>English</option><option value="he" ${he ? 'selected' : ''}>עברית</option></select>`)}${field('area', 'City or general area', 'עיר או אזור כללי', '<input autocomplete="address-level2" maxlength="180" required>')}${field('preferredArea', 'Preferred program area', 'אזור מועדף לפעילות', '<input maxlength="180">')}${field('childAge', "Child's age", 'גיל הילד', '<input type="number" min="1" max="25" inputmode="numeric" required>')}${field('otherChildAge', "Another child's age", 'גיל של ילד נוסף', '<input type="number" min="1" max="25" inputmode="numeric">')}${field('learningArrangement', 'Current learning arrangement', 'מסגרת הלימוד הנוכחית', '<input maxlength="160">')}${field('torahExperience', 'Current Torah learning', 'לימוד התורה הנוכחי', '<textarea rows="3" maxlength="1000"></textarea>', true)}${field('question', 'A brief question or note', 'שאלה או הערה קצרה', '<textarea rows="4" maxlength="2000" aria-describedby="medical-helper"></textarea>', true)}<p id="medical-helper" class="field-help full">${he ? 'אין לצרף לטופס רשומות רפואיות או מידע בריאותי מפורט. אפשר לדון בנושאים רגישים בפרטיות.' : 'Please leave medical records and detailed health information out of this form. Sensitive matters can be discussed privately.'}</p></div><div class="privacy-notice"><p>${he ? 'BNA משתמשת בפרטים האלה כדי להשיב לבקשתכם ולשמור תיעוד פרטי של הפנייה. עדכונים לבחירתכם נפרדים מהבקשה הזאת.' : 'BNA uses these details to respond to your request and keep a private record of the inquiry. Optional updates are separate from this request.'} <a href="${pre}/privacy">${he ? 'הודעת הפרטיות' : 'Privacy Notice'}</a></p>${choice('purposeConsent', NOTICE.en, NOTICE.he)}${choice('articleUpdates', 'Send me BNA educational articles by email.', 'אבקש לקבל בדוא״ל מאמרים חינוכיים של בני נביאים.')}${choice('podUpdates', 'Send me Learning pod updates by email.', 'אבקש לקבל בדוא״ל עדכונים על קבוצות הלימוד.', 'data-pod-updates')}${choice('academyUpdates', 'Send me Academy 2027–28 updates by email.', 'אבקש לקבל בדוא״ל עדכונים על האקדמיה 2027–28.', 'data-academy-updates')}</div><button class="button" type="submit">${he ? 'רישום ההתעניינות שלי' : 'Register My Interest'}</button></fieldset><div id="coop-status" class="save-status" role="status" aria-live="polite" tabindex="-1"></div><button class="button secondary" type="button" id="retry-interest" hidden>${he ? 'נסו שוב' : 'Retry this submission'}</button></form></main>`;
  return document(he ? 'הצטרפות ל־BNA' : 'Join BNA', body, locale, '/join', '<script src="/js/bna-coop-join.js" defer></script>');
}
function renderArticleLibrary(locale = 'en') {
  const he = locale === 'he', articles = Object.entries(copy.articles).filter(([id, article]) => (he ? id.startsWith('HA') : /^A/.test(id)));
  return document(he ? 'מאמרים' : 'Articles', `<main id="main" class="launch-wrap article-page"><h1>${he ? 'מאמרים' : 'Articles'}</h1><ul class="article-list">${articles.map(([id, article]) => `<li><a href="${articleHref(id)}">${escape(article.title)}</a></li>`).join('')}</ul></main>`, locale, '/blog');
}
function renderArticle(slug, locale = 'en') {
  const key = String(slug).match(/^(h?a\d{2})(?:-|$)/i)?.[1]?.toUpperCase();
  const slugify = text => text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const article = key ? copy.articles[key] : Object.values(copy.articles).find(item => item.markdown.match(/Route: `(?:\/he)?\/blog\/([^`]+)`/)?.[1] === slug || slugify(item.title) === slug);
  if (!article) return null;
  const actualKey = key || Object.keys(copy.articles).find(id => copy.articles[id] === article);
  const actualLocale = actualKey?.startsWith('HA') ? 'he' : 'en';
  const content = article.markdown.split(/\n(?=### )/).map((block, index) => { if (!index) return paragraphs(block.replace(/^## [^\n]+\n/, ''), actualLocale); const nl = block.indexOf('\n'); return `<section class="article-section"><h2>${inline(block.slice(4, nl).trim(), actualLocale)}</h2>${paragraphs(block.slice(nl + 1), actualLocale)}</section>`; }).join('');
  return document(article.title, `<main id="main" class="launch-wrap article-page"><h1>${escape(article.title)}</h1>${content}<div class="article-cta">${cta(actualLocale)}</div></main>`, actualLocale, articleHref(actualKey).replace(/^\/he(?=\/)/, ''), '', article.markdown);
}
function renderInterestSupport(env = process.env, locale = 'en') {
  const id = pageId('P12', locale), source = copy.pages[id];
  const existing = require('./support-page').renderSupportPage(env, locale);
  const form = existing.match(/<form\b[^>]*id="support-interest-form"[\s\S]*?<\/form>/)?.[0] || '';
  const unavailable = existing.match(/<p class="note" role="status" data-support-unavailable>[\s\S]*?<\/p>/)?.[0] || '';
  const content = sections(id).filter(item => !/Technology|טכנולוגיה/.test(item.title)).map(item => `<section class="article-section"><h2>${escape(item.title)}</h2>${paragraphs(item.body, locale)}</section>`).join('');
  const body = `<main id="main" class="launch-wrap article-page"><h1>${escape(source.title)}</h1>${content}<section id="form">${unavailable}${form.replace('<form ', '<form class="interest-form" ')}</section></main>`;
  return document(source.title, body, locale, '/support/vision', '<script src="/js/bna-support-interest.js" defer></script>');
}
module.exports = { renderInterestHome, renderInterestForm, renderInfoPage, renderArticleLibrary, renderArticle, renderInterestSupport, sections, paragraphs, launchOmissions, FORBIDDEN_LOGISTICS, escape, document, targetFor };
