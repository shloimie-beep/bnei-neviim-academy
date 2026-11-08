'use strict';

const content = require('../../../config/bna-school-content.json');
const ORIGIN = 'https://bneineviimacademy.org';
const TOPICS = {
  en: { foundations: 'Foundations', torah: 'Torah Learning', parents: 'Parents & Education', technology: 'Technology', future: 'Future Academy' },
  he: { foundations: 'יסודות הגישה', torah: 'לימוד תורה', parents: 'הורים וחינוך', technology: 'טכנולוגיה', future: 'האקדמיה בעתיד' }
};

function createSchoolPages({ sections, paragraphs, inline, document, launchOmissions, escape, copy }) {
  const pre = locale => locale === 'he' ? '/he' : '';
  const labels = locale => content.exact[locale];
  const readingText = value => escape(value).replace(/\b2027–28\b/g, '<bdi dir="ltr">2027–28</bdi>');
  const pageSections = (id, locale) => sections(locale === 'he' ? 'H' + id : id);
  const emphasized = (text, phrase, locale) => {
    const at = text.indexOf(phrase);
    return at < 0 ? inline(text, locale) : inline(text.slice(0, at), locale) + '<strong>' + inline(phrase, locale) + '</strong>' + inline(text.slice(at + phrase.length), locale);
  };
  const registerLink = (locale, interest) => `<a class="button" href="${pre(locale)}/join${interest ? '?interest=' + interest : ''}">${escape(labels(locale).interest_cta)}<span aria-hidden="true">${locale === 'he' ? '←' : '→'}</span></a>`;
  const articleCard = (article, locale, hidden = false) => `<article class="article-card" data-article-card data-topic="${article.topic}" data-search="${escape((article.title + ' ' + launchOmissions(article.excerpt)).toLocaleLowerCase())}"${hidden ? ' hidden' : ''}>${article.thumbnail ? `<a tabindex="-1" aria-hidden="true" href="${article.route}"><img src="/images/bna-launch/${article.thumbnail}" alt="" width="600" height="400" loading="lazy"></a>` : '<div class="article-card-rule" aria-hidden="true"></div>'}<div class="article-card-copy"><p class="article-topic">${escape(TOPICS[locale][article.topic])}</p><h2><a href="${article.route}">${escape(article.title)}</a></h2><p class="article-excerpt">${inline(launchOmissions(article.excerpt), article.language)}</p><a class="text-link" href="${article.route}">${escape(labels(locale).read_article)}<span class="sr-only">: ${escape(article.title)}</span></a></div></article>`;
  const script = '<script src="/js/bna-articles.js" defer></script>';

  function renderHome(locale = 'en') {
    const he = locale === 'he', l = labels(locale), s = pageSections('P01', locale);
    const featured = (he ? ['HA03', 'HA05', 'HA06'] : ['A19', 'A09', 'A20']).map(id => content.articles.find(a => a.id === id));
    const intro = pageSections('P05', locale)[0].body.split('\n\n')[0];
    const section = (className, id, title, body) => `<section class="launch-section ${className}" id="${id}"><div class="launch-wrap reading-width"><h2>${escape(title)}</h2>${body}</div></section>`;
    const body = `<main id="main"><section class="approved-hero" aria-label="Bnei Neviim Academy — South Florida"><h1 class="sr-only">כי מלאה הארץ דעה את ה׳ כמים לים מכסים · Bnei Neviim Academy · South Florida · Raising the generation of the Geulah.</h1><picture><source media="(max-width: 700px)" srcset="/images/bna-launch/BNA_Hero_Mobile_APPROVED_SouthFlorida_Gray.png"><img src="/images/bna-launch/BNA_Hero_Desktop_APPROVED_SouthFlorida_Gray.png" width="1672" height="941" alt="" fetchpriority="high"></picture></section><section class="who-we-are launch-wrap"><p${he ? ' lang="en" dir="ltr"' : ''}>${inline(s[1].body.split('\n\n')[0], 'en')}</p></section>${section('vision-section', 'vision', l.vision_heading, `<p class="statement">${emphasized(l.vision, content.exact.emphasis['vision_' + locale], locale)}</p>`)}<section class="launch-section mission-section" id="mission"><div class="launch-wrap editorial-grid photo-panel"><figure><img src="/images/bna-launch/bunny.png" width="1920" height="1080" alt="${he ? 'נער מחזיק ארנב במהלך פעילות חינוכית קודמת' : 'A boy holding a rabbit during earlier educational work'}" loading="lazy"></figure><div class="cream-panel"><h2>${escape(l.mission_heading)}</h2><p class="statement">${emphasized(l.mission, content.exact.emphasis['mission_' + locale], locale)}</p></div></div></section><section class="launch-section pod-section" id="learning-pods"><div class="launch-wrap two-column"><div><span class="section-label">${he ? 'התחלה צנועה' : 'Humble Beginnings'}</span><h2>${escape(launchOmissions(s[3].title))}</h2></div><div>${paragraphs(s[3].body, locale)}${registerLink(locale, 'pod')}</div></div></section><section class="launch-section academy-section" id="academy"><div class="launch-wrap editorial-grid photo-panel"><figure><img src="/images/bna-launch/huddle.png" width="1366" height="768" alt="${he ? 'בנים משתפים פעולה סביב פעילות מעשית' : 'Boys collaborating around a practical activity'}" loading="lazy"></figure><div class="cream-panel"><span class="section-label"><bdi dir="ltr">2027–28</bdi></span><h2>${readingText(s[4].title)}</h2>${paragraphs(s[4].body, locale)}${registerLink(locale, 'academy')}</div></div></section><section class="launch-section founder-section" id="founder"><div class="launch-wrap founder-grid"><img class="founder-portrait" src="/images/bna-launch/founder.jpg" width="720" height="720" alt="${he ? 'שלומי דרטלר' : 'Shloimie Dratler'}" loading="lazy"><div><h2>${escape(s[6].title)}</h2>${paragraphs(s[6].body, locale)}</div></div></section><section class="launch-section testimonial-section"><div class="launch-wrap testimonial-grid"><img src="/images/bna-launch/boys-with-sticks.jpg" alt="${he ? 'שני בנים עם מקלות בחורשה, במסגרת עבודה חינוכית קודמת' : 'Two boys holding sticks during earlier educational work'}" loading="lazy"><div><h2>${escape(s[8].title)}</h2><div lang="en" dir="ltr">${paragraphs(s[8].body.split('\n\n')[0], 'en')}</div>${paragraphs(s[8].body.split('\n\n').slice(1).join('\n\n'), locale)}</div></div></section><section class="launch-section philosophy-preview" id="philosophy"><div class="launch-wrap"><div class="section-heading"><div><h2>${escape(l.philosophy_heading)}</h2>${paragraphs(intro, locale)}</div><a class="text-link" href="${pre(locale)}/blog">${escape(l.articles_cta)}</a></div><div class="article-grid">${featured.map(a => articleCard(a, locale)).join('')}</div></div></section>${section('faq-invitation', 'faq', l.faq_heading, `<p>${escape(l.faq_preview)}</p><a class="text-link" href="${pre(locale)}/faq">${escape(l.faq_cta)}</a>`)}${section('final-interest', 'interest', s.at(-1).title, paragraphs(s.at(-1).body, locale) + registerLink(locale))}</main>`;
    return document('Bnei Neviim Academy — South Florida', body, locale, '/', '', '', { description: l.vision });
  }

  function renderLibrary(locale = 'en', query = {}) {
    const he = locale === 'he', l = labels(locale), topic = Object.hasOwn(TOPICS[locale], query.topic) ? query.topic : '', q = typeof query.q === 'string' ? query.q.slice(0, 160) : '';
    const articles = content.articles.filter(a => a.language === locale);
    const matches = a => (!topic || a.topic === topic) && (a.title + ' ' + launchOmissions(a.excerpt)).toLocaleLowerCase().includes(q.toLocaleLowerCase().trim());
    const resultCount = articles.filter(matches).length;
    const intro = pageSections('P05', locale)[0].body.split('\n\n')[0];
    const philosophy = pageSections('P04', locale).map(s => `<section class="article-section"><h3>${escape(s.title)}</h3>${paragraphs(s.body, locale)}</section>`).join('');
    const body = `<main id="main" class="launch-wrap library-page"><header class="library-heading"><h1>${escape(l.articles_heading)}</h1>${paragraphs(intro, locale)}</header><form class="library-filters" data-library-filters method="get" action="${pre(locale)}/blog"><div><label for="article-search">${he ? 'חיפוש מאמרים' : 'Search articles'}</label><input id="article-search" type="search" name="q" maxlength="160" value="${escape(q)}" placeholder="${he ? 'נושא או שם מאמר' : 'Topic or article title'}"></div><div><label for="article-topic">${he ? 'נושא' : 'Topic'}</label><select id="article-topic" name="topic"><option value="">${escape(l.all_articles)}</option>${Object.entries(TOPICS[locale]).map(([key, text]) => `<option value="${key}"${topic === key ? ' selected' : ''}>${escape(text)}</option>`).join('')}</select></div><button class="button" type="submit">${he ? 'חיפוש' : 'Search'}</button><a class="text-link" data-clear-filters href="${pre(locale)}/blog">${escape(l.clear_filters)}</a></form><p class="result-count" data-result-count role="status" aria-live="polite">${resultCount} ${he ? 'מאמרים' : 'articles'}</p><div class="article-grid" data-article-grid>${articles.map(a => articleCard(a, locale, !matches(a))).join('')}</div><div class="empty-articles" data-empty-articles${resultCount ? ' hidden' : ''}><h2>${escape(l.empty_articles)}</h2><a class="button secondary" data-clear-filters href="${pre(locale)}/blog">${escape(l.clear_filters)}</a></div><section class="philosophy-foundations reading-width" id="foundations"><h2>${escape(l.philosophy_heading)}</h2>${philosophy}</section></main>`;
    return document(l.articles_heading, body, locale, '/blog', script, '', { title: l.articles_heading, description: intro, alternateRoute: (he ? '' : '/he') + '/blog' });
  }

  function findArticle(slug, locale) {
    const id = String(slug).match(/^(h?a\d{2})(?:-|$)/i)?.[1]?.toUpperCase();
    if (id) return content.articles.find(a => a.id === id);
    const candidates = content.articles.filter(a => a.language === locale);
    return candidates.find(a => a.route.split('/').at(-1) === slug) || content.articles.find(a => a.route.split('/').at(-1) === slug);
  }
  function shareRow(article, locale, final = false) {
    const l = labels(locale), url = ORIGIN + article.route, whatsapp = 'https://wa.me/?text=' + encodeURIComponent(article.title + '\n' + url);
    return `<section class="article-share${final ? ' article-share-end' : ''}" data-article-share data-canonical="${url}" data-title="${escape(article.title)}">${final ? `<h2>${escape(l.share_heading)}</h2><p>${escape(l.share_prompt)}</p>` : ''}<div class="share-actions"><a class="button" href="${whatsapp}" target="_blank" rel="noopener noreferrer">${escape(l.whatsapp)}</a><button class="button secondary" type="button" data-native-share>${escape(l.share)}</button><button class="button secondary" type="button" data-copy-link>${escape(l.copy_link)}</button></div><p class="share-status" role="status" aria-live="polite" data-share-status data-copied="${escape(l.copied)}" data-fallback="${escape(l.copy_error)}"></p><label class="copy-fallback" hidden>${escape(l.copy_error)}<input readonly type="url" dir="ltr" value="${url}" aria-label="${escape(l.copy_link)}"></label></section>`;
  }
  function renderArticle(slug, locale = 'en') {
    const article = findArticle(slug, locale);
    if (!article) return null;
    const actualLocale = article.language, l = labels(actualLocale), he = actualLocale === 'he';
    const equivalent = content.articles.find(a => a.language !== actualLocale && a.route.split('/').at(-1) === article.route.split('/').at(-1));
    const rawBody = launchOmissions(article.body);
    const emphasis = article.emphasis_candidates?.find(candidate => rawBody.includes(candidate));
    let bodyHtml = rawBody.split(/\n(?=#{2,6} )/).map(block => {
      const heading = block.match(/^(#{2,6}) ([^\n]+)(?:\n|$)/);
      if (!heading) return paragraphs(block, actualLocale);
      const level = Math.max(2, heading[1].length - 1);
      return `<section class="article-section"><h${level}>${inline(heading[2].trim(), actualLocale)}</h${level}>${paragraphs(block.slice(heading[0].length), actualLocale)}</section>`;
    }).join('');
    if (emphasis) { const exactHtml = inline(emphasis, actualLocale); bodyHtml = bodyHtml.replace(exactHtml, '<strong>' + exactHtml + '</strong>'); }
    const related = content.articles.filter(a => a.language === actualLocale && a.id !== article.id && a.topic === article.topic).slice(0, 3);
    const body = `<main id="main" class="launch-wrap editorial-article"><nav class="breadcrumb" aria-label="${he ? 'מיקום במאמרים' : 'Article navigation'}"><a href="${pre(actualLocale)}/blog?topic=${article.topic}">${escape(l.all_articles)}</a><span aria-hidden="true"> / </span><a href="${pre(actualLocale)}/blog?topic=${article.topic}">${escape(TOPICS[actualLocale][article.topic])}</a></nav><header class="article-heading"><p class="article-topic">${escape(TOPICS[actualLocale][article.topic])}</p><h1>${escape(article.title)}</h1></header>${shareRow(article, actualLocale)}${article.thumbnail ? `<figure class="article-lead-image"><img src="/images/bna-launch/${article.thumbnail}" width="1200" height="800" alt="" loading="eager"></figure>` : ''}<article class="article-body">${bodyHtml}</article>${shareRow(article, actualLocale, true)}${related.length ? `<section class="related-articles"><h2>${escape(l.related)}</h2><div class="article-grid">${related.map(a => articleCard(a, actualLocale)).join('')}</div></section>` : ''}</main>`;
    return document(article.title, body, actualLocale, article.route.replace(/^\/he(?=\/)/, ''), script, article.sourceMarkdown, { canonicalRoute: article.route, alternateRoute: equivalent?.route || (he ? '' : '/he') + '/blog', equivalentTranslation: Boolean(equivalent), image: article.thumbnail ? '/images/bna-launch/' + article.thumbnail : undefined, ogType: 'article' });
  }

  function renderFaq(locale = 'en') {
    const l = labels(locale), he = locale === 'he', records = content.faq.filter(f => f.language === locale), categories = [...new Set(records.map(f => f.category))];
    const categoryId = category => 'faq-category-' + categories.indexOf(category);
    const body = `<main id="main" class="launch-wrap faq-page"><header><h1>${escape(l.faq_heading)}</h1><p>${escape(l.faq_preview)}</p></header><nav class="faq-categories" aria-label="${he ? 'נושאי שאלות' : 'FAQ categories'}">${categories.map(c => `<a href="#${categoryId(c)}">${readingText(c)}</a>`).join('')}</nav>${categories.map(category => `<section class="faq-category" id="${categoryId(category)}"><h2>${readingText(category)}</h2>${records.filter(f => f.category === category).map(f => `<details class="faq-item" id="${f.id.toLowerCase()}"><summary>${inline(f.question, locale)}</summary>${paragraphs(f.answer, locale)}</details>`).join('')}</section>`).join('')}<div class="faq-interest">${registerLink(locale)}</div></main>`;
    return document(l.faq_heading, body, locale, '/faq', script, '', { title: l.faq_heading });
  }

  function renderGuide(locale = 'en') {
    const guide=content.guides[locale];
    const source=guide.sourceMarkdown.split(/\n(?=### )/).slice(1);
    const body=`<main id="main" class="launch-wrap article-page"><h1>${escape(guide.title)}</h1>${source.map(block=>{const nl=block.indexOf('\n');return `<section class="article-section"><h2>${escape(block.slice(4,nl))}</h2>${paragraphs(block.slice(nl+1),locale)}</section>`;}).join('')}<a class="text-link" href="${pre(locale)}/faq">${escape(labels(locale).faq_cta)}</a></main>`;
    return document(guide.title,body,locale,'/parents/guide','',guide.sourceMarkdown,{alternateRoute:(locale==='he'?'':'/he')+'/parents/guide'});
  }

  return { renderHome, renderLibrary, renderArticle, renderFaq, renderGuide, findArticle };
}

module.exports = { createSchoolPages, TOPICS };
