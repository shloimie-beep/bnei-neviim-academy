const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const preview = fs.readFileSync('public/one-time-preview.html', 'utf8');

test('One Time preview route is static, branded, and not live checkout', () => {
  assert.match(server, /\/preview\/one-time-mishnah/);
  assert.match(server, /one-time-preview\.html/);
  assert.match(preview, /<body class="bna-shell one-time-preview-page">/);
  assert.match(preview, /\/css\/bna-app-shell\.css/);
  assert.match(preview, /\/images\/one-time-logo-black\.png/);
  assert.match(preview, /\/images\/one-time-existing-site-preview\.jpg/);
  assert.match(preview, /Join the Mishnah Shiur/);
  assert.match(preview, /Preview the Video Library/);
  assert.match(preview, /ILS price[\s\S]*TBD/);
  assert.match(preview, /USD price[\s\S]*TBD/);
  assert.match(preview, /Preview only\. Not live checkout\./);
  assert.match(preview, /Do not replace the live Rabbi Scheller site until Shloimie approves/);
});
