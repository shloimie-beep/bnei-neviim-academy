'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const pages = require('../src/lib/bna/interest-pages');
const content = require('../config/bna-school-content.json');
const strip = html => html.replace(/<\/(?:p|h[1-6]|li|section)>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const plain = markdown => markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^#{1,6} /gm, '').replace(/^- /gm, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

test('one exact current Vision and Mission, fixed source hierarchy and protected images', () => {
  for (const locale of ['en', 'he']) {
    const html = pages.renderInterestHome(locale), l = content.exact[locale];
    assert.equal(html.split('<h2>' + l.vision_heading + '</h2>').length - 1, 1);
    assert.equal(html.split('<h2>' + l.mission_heading + '</h2>').length - 1, 1);
    assert.ok(strip(html).includes(l.vision)); assert.ok(strip(html).includes(l.mission));
    assert.doesNotMatch(html, /The BNA Vision|increasingly internal|<details class="faq-item"/);
    const order = ['id="vision"', 'id="mission"', 'id="learning-pods"', 'id="academy"', 'id="founder"', 'testimonial-section', 'id="philosophy"', 'id="faq"', 'id="interest"'];
    assert.deepEqual(order.map(x => html.indexOf(x)).slice().sort((a,b) => a-b), order.map(x=>html.indexOf(x)));
    assert.ok(order.every(x => html.includes(x)));
    assert.match(html, /join\?interest=pod/); assert.match(html, /join\?interest=academy/);
    assert.match(html, /bunny\.png/); assert.match(html, /huddle\.png/); assert.match(html, /boys-with-sticks\.jpg/);
    assert.equal((html.match(/data-article-card/g) || []).length, 3);
  }
});

test('all protected educational article bodies survive scoped logistics and presentation-instruction omissions', () => {
  assert.equal(content.articles.length, 29);
  for (const article of content.articles) {
    assert.equal(crypto.createHash('sha256').update(article.sourceMarkdown).digest('hex'), article.source_sha256, article.id + ' immutable source');
    const html = pages.renderArticle(article.id.toLowerCase(), article.language);
    const body = html.match(/<article class="article-body">([\s\S]*?)<\/article>/)?.[1];
    assert.ok(body, article.id);
    const actual=strip(body),expected=plain(pages.launchOmissions(article.body).replace(/^(?:Button:|כפתור:)[^\n]*\n?/gm,''));
    let mismatch=0;while(mismatch<Math.min(actual.length,expected.length)&&actual[mismatch]===expected[mismatch])mismatch++;
    assert.ok(actual===expected,article.id+' complete educational display; first mismatch '+mismatch+' actual='+actual.slice(mismatch,mismatch+160)+' expected='+expected.slice(mismatch,mismatch+160));
    assert.doesNotMatch(html, /Route:|Search title:|Search description:|Publication annotation/);
    assert.equal(pages.FORBIDDEN_LOGISTICS.test(html), false, article.id);
    assert.equal((html.match(/data-article-share /g) || []).length, 2);
    assert.doesNotMatch(html.slice(html.indexOf('<main'), html.indexOf('</main>')), /class="article-cta"/);
    assert.ok(html.includes('property="og:url" content="https://bneineviimacademy.org' + article.route + '"'));
    const encoded = encodeURIComponent(article.title + '\nhttps://bneineviimacademy.org' + article.route);
    assert.ok(html.includes('https://wa.me/?text=' + encoded));
  }
});

test('library language coverage, server filter/empty states and source-preserving foundation content', () => {
  for (const [locale, count] of [['en',23],['he',6]]) {
    const all = pages.renderArticleLibrary(locale);
    assert.equal((all.match(/data-article-card /g)||[]).length, count);
    assert.match(all, /id="foundations"/); assert.match(all, /data-library-filters/);
    assert.match(all, /name="q"/); assert.match(all, /name="topic"/);
    const empty = pages.renderArticleLibrary(locale, {q:'zzzzzz-not-a-title'});
    assert.equal((empty.match(/data-article-card[^>]+ hidden/g)||[]).length, count);
    assert.ok(empty.includes('<div class="empty-articles" data-empty-articles>'));
    const escaped = pages.renderArticleLibrary(locale, {q:'"><script>alert(1)</script>',topic:'foreign-program'});
    assert.doesNotMatch(escaped, /<script>alert/);
    assert.ok(pages.renderArticleLibrary(locale,{topic:'foundations'}).includes('value="foundations" selected'));
  }
});

test('canonical FAQ accounts for all80 records, publishes70 and withholds logistics/directory promises', () => {
  assert.equal(content.faqAccounting.length,80); assert.equal(content.faq.length,70);
  assert.equal(content.faqAccounting.filter(f=>f.disposition==='suppress').length,8);
  assert.equal(content.faqAccounting.filter(f=>f.disposition==='conditional').length,2);
  for (const locale of ['en','he']) {
    const html=pages.renderInfoPage('P16',locale);
    assert.equal((html.match(/<details class="faq-item"/g)||[]).length,35);
    assert.equal((html.match(/class="faq-category"/g)||[]).length,5);
    assert.doesNotMatch(html,/faq-en-26|faq-he-26|parent directory|אינדקס הורים/i);
    assert.equal(pages.FORBIDDEN_LOGISTICS.test(html),false);
    for(const record of content.faq.filter(f=>f.language===locale))assert.ok(html.includes('id="'+record.id.toLowerCase()+'"'));
  }
});

test('article language links never invent translations and share canonical URLs contain no visitor state', () => {
  const englishOnly=pages.renderArticle('a18','en');
  assert.match(englishOnly,/ספריית המאמרים בעברית/);
  assert.doesNotMatch(englishOnly,/hreflang="he"/);
  const paired=pages.renderArticle('a09','en');
  assert.ok(paired.includes('hreflang="he" href="https://bneineviimacademy.org/he/blog/self-governance-in-jewish-education"'));
  assert.equal(pages.renderArticle('missing-article','en'),null);
  assert.doesNotMatch(englishOnly,/<a href="\/join">Free AI Software for Jewish Schools/);
  assert.doesNotMatch(pages.renderArticle('a22','en'),/<a href="\/join">Teach at BNA/);
  assert.ok(pages.renderInterestHome('he').includes('rel="canonical" href="https://bneineviimacademy.org/he"'));
});
