'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const aliases = [
  ['/icons/icon.svg', '/icons/icon-512.png', '512'],
  ['/icons/icon-192.svg', '/icons/icon-192.png', '192'],
  ['/icons/icon-512.svg', '/icons/icon-512.png', '512'],
];

async function startServer(t, oneTime) {
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const env = {};
  for (const key of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'COMSPEC', 'PATHEXT', 'NODE_PATH']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  Object.assign(env, {
    PORT: String(port), NODE_ENV: 'test',
    DATABASE_URL: 'postgres://synthetic:synthetic@127.0.0.1:9/icon_fixture',
    OPS_USERNAME: 'icon-fixture', OPS_PASSWORD: 'local-icon-fixture-only',
    BNA_WEBSITE_ONLY_NO_DB_BOOT: 'true',
    APP_INSTANCE: oneTime ? 'onetime' : 'bna',
    APP_MODE: oneTime ? 'single_tenant' : 'shared_workspace',
  });
  const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output = (output + chunk).slice(-16000); });
  let exited = false;
  let launchError;
  child.on('exit', () => { exited = true; });
  child.on('error', error => { launchError = error; });
  t.after(async () => {
    if (exited || launchError) return;
    const stopped = once(child, 'exit');
    child.kill();
    await stopped;
  });
  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline && !exited && !launchError) {
    try {
      const response = await fetch(`${origin}/api/deploy-info`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return origin;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Icon fixture failed to start: ${launchError?.message || output}`);
}

for (const oneTime of [false, true]) {
  test(`${oneTime ? 'One Time' : 'BNA'}: actual server redirects retired icons to its existing brand bytes`, { timeout: 60000 }, async t => {
    const origin = await startServer(t, oneTime);
    const host = oneTime ? 'join.onetimeonetime.com' : 'bneineviimacademy.org';
    for (const [legacy, target, size] of aliases) {
      await t.test(`${legacy}: GET, HEAD, stale conditional and PNG readback`, async () => {
        const expectedPath = oneTime
          ? `public/images/one-time/social/one-time-icon-${size}.png`
          : `public/icons/icon-${size}.png`;
        const expected = fs.readFileSync(path.join(root, expectedPath));
        for (const method of ['GET', 'HEAD']) {
          const response = await fetch(`${origin}${legacy}?v=old`, {
            method, redirect: 'manual', headers: { Host: host },
          });
          assert.equal(response.status, 302);
          assert.equal(response.headers.get('location'), target);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(new URL(target, `https://${host}`).origin, `https://${host}`);
          if (method === 'HEAD') assert.equal((await response.arrayBuffer()).byteLength, 0);
          else await response.arrayBuffer();
        }
        const oldStat = fs.statSync(path.join(root, 'public', legacy));
        const oldEtag = `W/"${oldStat.size.toString(16)}-${oldStat.mtime.getTime().toString(16)}"`;
        const conditional = await fetch(`${origin}${legacy}`, {
          redirect: 'manual', headers: { Host: host, 'If-None-Match': oldEtag, 'If-Modified-Since': oldStat.mtime.toUTCString() },
        });
        assert.equal(conditional.status, 302, 'retired SVG validators must not keep the old image with 304');
        assert.equal(conditional.headers.get('cache-control'), 'no-store');
        await conditional.arrayBuffer();
        const final = await fetch(`${origin}${legacy}`, { headers: { Host: host } });
        assert.equal(final.status, 200);
        assert.equal(final.url, `${origin}${target}`);
        assert.match(final.headers.get('content-type'), /^image\/png(?:;|$)/);
        assert.deepEqual(Buffer.from(await final.arrayBuffer()), expected);
        const direct = await fetch(`${origin}${target}`, { headers: { Host: host } });
        assert.equal(direct.redirected, false);
        assert.deepEqual(Buffer.from(await direct.arrayBuffer()), expected);
      });
    }
    await t.test('other manifest, private icon and unknown asset requests are unchanged', async () => {
      for (const url of ['/icons/operations-icon.svg', '/icons/parent-icon.svg', '/manifest.json']) {
        const response = await fetch(`${origin}${url}`, { redirect: 'manual', headers: { Host: host } });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('location'), null);
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(root, 'public', url)));
      }
      const unknown = await fetch(`${origin}/icons/not-a-real-icon.svg`, { redirect: 'manual' });
      assert.equal(unknown.status, 404);
      assert.equal(unknown.headers.get('location'), null);
      await unknown.arrayBuffer();
    });
  });
}
