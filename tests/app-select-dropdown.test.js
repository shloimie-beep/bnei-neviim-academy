const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const appSelectScript = fs.readFileSync('public/js/app-select.js', 'utf8');

function publicHtmlFiles(dir = 'public') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return publicHtmlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

test('every public page with native select controls loads the in-app select enhancer', () => {
  const pagesWithSelects = publicHtmlFiles()
    .map((file) => ({ file, html: fs.readFileSync(file, 'utf8') }))
    .filter(({ html }) => /<select\b/i.test(html));

  assert.deepEqual(
    pagesWithSelects.map(({ file }) => file.replace(/\\/g, '/')).sort(),
    [
      'public/operations.html',
      'public/parent.html',
      'public/providers-join.html',
      'public/service-providers.html',
      'public/signup-he.html',
      'public/signup.html',
      'public/student.html',
    ]
  );

  for (const { file, html } of pagesWithSelects) {
    assert.match(html, /<script src="\/js\/app-select\.js"><\/script>/, `${file} should load app-select.js`);
  }
});

test('shared select enhancer hides the native picker and renders a fixed in-app menu', () => {
  assert.match(appSelectScript, /const nativeClass = "app-select-native"/);
  assert.match(appSelectScript, /display: none !important/);
  assert.match(appSelectScript, /\.app-select__menu[\s\S]*position: fixed/);
  assert.match(appSelectScript, /\.app-select__menu[\s\S]*z-index: 7000/);
  assert.match(appSelectScript, /aria-haspopup", "listbox"/);
  assert.match(appSelectScript, /aria-expanded", "true"/);
});

test('shared select enhancer preserves select values and delegated change handlers', () => {
  assert.match(appSelectScript, /state\.select\.selectedIndex = index/);
  assert.match(appSelectScript, /state\.select\.dispatchEvent\(new Event\("input", \{ bubbles: true \}\)\)/);
  assert.match(appSelectScript, /state\.select\.dispatchEvent\(new Event\("change", \{ bubbles: true \}\)\)/);
  assert.match(appSelectScript, /new MutationObserver/);
  assert.match(appSelectScript, /document\.querySelectorAll\("select"\)\.forEach\(enhanceSelect\)/);
});
