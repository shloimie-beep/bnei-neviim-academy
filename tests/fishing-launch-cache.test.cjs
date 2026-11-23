const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

function loadWorker() {
  const listeners = {};
  const removed = [];
  const cacheNames = ['bna-public-v10', 'bna-public-v11', 'bna-public-v12', 'operations-keep'];
  vm.runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    URL,
    self: { location: { origin: 'https://bneineviimacademy.org' },
      addEventListener: (event, fn) => { listeners[event] = fn; },
      clients: { claim: async () => {} } },
    caches: { keys: async () => cacheNames, delete: async name => removed.push(name),
      open: async () => ({ match: async key => key === '/' ? 'school homepage' : undefined }) },
    fetch: async (request, init) => { if (init?.cache === 'reload') return 'fresh icon'; throw Error('offline'); },
  });
  async function offline(path) {
    let response;
    const request = { method: 'GET', url: new URL(path, 'https://bneineviimacademy.org').href };
    listeners.fetch({ request, respondWith: result => { response = result; } });
    return response === undefined ? 'network' : await response;
  }
  return { offline, listeners, removed };
}

test('the school shell never supplies Fishing pages, aliases, images or retired icons', async () => {
  const { offline } = loadWorker();
  for (const path of ['/fishing-academy', '/he/fishing-academy/', '/he/fishing-academy/apply',
    '/en/florida/?academy-image=reel', '/he/florida/confirm-interest', '/groups/brand/jlfa-logo-locked-v1.png',
    '/_next/static/chunks/app.js', '/fonts/Heebo-wght.ttf',
    'https://life-skills.bneineviimacademy.org/en/florida']) {
    assert.equal(await offline(path), 'network', path);
  }
  for (const path of ['/icons/icon.svg?old', '/icons/icon-192.svg', '/icons/icon-512.svg']) {
    assert.equal(await offline(path), 'fresh icon', path);
  }
  assert.equal(await offline('/signup.html'), 'school homepage');
});

test('a worker upgrade retires old school caches and preserves unrelated app storage', async () => {
  const { listeners, removed } = loadWorker();
  let activation;
  listeners.activate({ waitUntil: work => { activation = work; } });
  await activation;
  assert.deepEqual(removed.sort(), ['bna-public-v10', 'bna-public-v11']);
});
