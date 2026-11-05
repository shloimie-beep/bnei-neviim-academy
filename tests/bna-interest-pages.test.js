'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const pages=require('../src/lib/bna/interest-pages'),copy=require('../config/bna-interest-copy.json');
test('approved articles retain source titles and Torah references while omitting launch logistics',()=>{
  for(const[id,article]of Object.entries(copy.articles)){
    const html=pages.renderArticle(id.toLowerCase());assert.ok(html,id);
    assert.ok(html.includes(pages.escape(article.title)),id+' approved title');
    const main=html.slice(html.indexOf('<main'),html.indexOf('</main>'));
    assert.doesNotMatch(main,/Route:|Search title:|Search description:|# Hebrew Website Pages|Publication annotation/);
    assert.equal(/\bmornings?\b|two.to.two.and.a.half|כשעתיים|בבוקר|הבוקר|location to be announced/i.test(html),false,id+' launch omissions');
    const route=article.markdown.match(/Route: `(?:\/he)?\/blog\/([^`]+)`/)?.[1];
    if(route)assert.ok(pages.renderArticle(route),'approved route '+route);
  }
  assert.ok(pages.renderArticle('a23').includes('Mishlei 4:22'));
  assert.ok(pages.renderArticle('a18').includes('Devarim 4:28'));
  assert.equal(pages.renderArticle('unregistered-article'),null);
});
test('shared form retains three program choices, required email, area and separate unchecked updates',()=>{
  for(const locale of ['en','he']){
    const html=pages.renderInterestForm({},locale);
    for(const program of ['pod','academy','both'])assert.ok(html.includes('value="'+program+'"'));
    assert.match(html,/name="email"[^>]*required/);assert.match(html,/name="area"/);assert.match(html,/name="preferredArea"/);
    assert.doesNotMatch(html,/name="(?:articleUpdates|podUpdates|academyUpdates)"[^>]*checked/);
    assert.match(html,/fieldset disabled/);assert.match(html,/\/privacy/);
  }
});
test('landing uses approved source sections and original full hero bytes in both languages',()=>{
  for(const locale of ['en','he']){
    const html=pages.renderInterestHome(locale);
    assert.match(html,/BNA_Hero_Desktop_APPROVED_SouthFlorida_Gray.png/);assert.match(html,/BNA_Hero_Mobile_APPROVED_SouthFlorida_Gray.png/);
    assert.ok(html.includes(pages.escape(pages.sections(locale==='he'?'HP01':'P01')[9].title)));
    assert.equal(/\bmornings?\b|two.to.two.and.a.half|כשעתיים|בבוקר|הבוקר|location to be announced/i.test(html),false);
  }
  const expected={'BNA_Hero_Desktop_APPROVED_SouthFlorida_Gray.png':'cec2fe9408a5dd86a2714eae811abc50906dfb596e6aaae7085faeb09589df0d','BNA_Hero_Mobile_APPROVED_SouthFlorida_Gray.png':'420fcf315b7ab5844e3722a5c57913e8b661bf3a063eb6ccb893397b31768eb7'};
  for(const[file,hash]of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public/images/bna-launch/'+file)).digest('hex'),hash);
});
