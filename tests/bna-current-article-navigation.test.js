'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const source = fs.readFileSync('public/js/bna-site-nav.js', 'utf8');

function render(pathname, lang) {
  const document = {documentElement:{lang,dataset:{}},readyState:'complete',querySelector:()=>null,
    querySelectorAll:()=>[],addEventListener:()=>{}};
  const window = {location:{pathname,search:''}};
  vm.runInNewContext(source,{window,document,URLSearchParams,Element:class {}});
  const mount = () => ({dataset:{},innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]});
  const nav=mount(),footer=mount();
  window.BNASiteNav.render(nav);window.BNASiteNav.renderFooter(footer);
  return {nav:nav.innerHTML,footer:footer.innerHTML};
}

test('current EN and HE article entry points lead to the released co-op and owner queue',()=>{
  for(const [path,lang] of [['/blog','en'],['/blog/torah-that-answers-real-life','en'],['/he/blog','he'],['/he/blog/torah-that-answers-real-life','he']]){
    const {nav,footer}=render(path,lang),prefix=lang==='he'?'/he':'';
    assert.ok(nav.includes(`href="${prefix}/join"`));
    assert.ok(nav.includes(`href="${prefix || '/'}#programs"`));
    assert.ok(footer.includes(`href="${prefix}/fishing-academy"`));
    assert.ok(footer.includes('href="tel:+13054916674"'));
    assert.doesNotMatch(nav,/bna-site-nav-contact|bna-site-nav-provider/);
    assert.ok(footer.includes(`https://life-skills.bneineviimacademy.org/${lang}/app/clients`));
    assert.ok(footer.includes(`href="${prefix}/privacy"`));
    assert.doesNotMatch(nav+footer,/Beit Shemesh|בית שמש|signup(?:-he)?\.html|\/parent\/login|\/student\/login|Registered nonprofit/);
  }
});

test('current homepage, co-op and Support share the article shell without legacy portals',()=>{
 for(const [path,lang] of [['/','en'],['/he','he'],['/join','en'],['/he/join','he'],['/support','en'],['/he/support','he']]){
  const {nav,footer}=render(path,lang);
  assert.match(nav,/bna-site-nav--current/);assert.match(footer,/bna-site-footer--current/);
  assert.match(nav,/Join the Learning Co-op/);assert.match(nav,/aria-expanded="false"/);
  assert.doesNotMatch(nav+footer,/Ramat Beit Shemesh|\/signup\.html|Registered nonprofit|\/student\/login/);
  if(/join|support/.test(path)){assert.match(nav,/data-lang-toggle/);assert.match(nav,/data-en-href="\/(?:join|support)"/);}
 }
});

test('article-shell change preserves existing provider and historical portal navigation',()=>{
  const {nav,footer}=render('/providers','en');
  assert.ok(nav.includes('/parent/login'));assert.ok(nav.includes('/student/login'));
  assert.ok(nav.includes('/signup.html'));assert.ok(footer.includes('/provider'));
});
