const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { bufferRequest, getBufferConfig } = require('../src/lib/integrations/buffer-client');
const { loadSecret } = require('../src/lib/integrations/secret-loader');

const fixtureKey = 'fixture-buffer-credential';
const configNames = ['BUFFER_API_KEY', 'BUFFER_API_BASE', 'BUFFER_ORGANIZATION_ID', 'BUFFER_DEFAULT_CHANNEL_IDS', 'BNA_KEYHOLDER_DIR', 'KEYHOLDER_DIR'];

function fixture(t) {
  const parent = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(parent, 'bna-buffer-config-'));
  const repoRoot = path.join(root, 'repository');
  fs.mkdirSync(repoRoot);
  const previous = new Map(configNames.map(name => [name, process.env[name]]));
  for (const name of configNames) delete process.env[name];
  process.env.BNA_KEYHOLDER_DIR = path.join(root, 'env-keyholder');
  process.env.KEYHOLDER_DIR = path.join(root, 'secondary-keyholder');
  t.mock.method(os, 'homedir', () => path.join(root, 'home'));
  t.after(() => {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), parent);
    assert.match(path.basename(resolved), /^bna-buffer-config-/);
    assert.equal(fs.lstatSync(root).isSymbolicLink(), false);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return {
    root, repoRoot,
    write(name, value) {
      const destination = path.resolve(repoRoot, name);
      assert.ok(destination.startsWith(root + path.sep));
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, value);
    },
  };
}

function assertDefaultSettings(config) {
  assert.deepEqual(config, {
    apiKey: fixtureKey,
    apiBase: 'https://api.buffer.com',
    organizationId: '',
    defaultChannelIds: [],
  });
}

for (const location of ['keyholder', '.secrets']) {
  for (const name of ['buffer-api-key.txt', 'BUFFER_API_KEY.txt', 'buffer.txt']) {
    test(`raw ${location}/${name} supplies only the Buffer API key`, t => {
      const f = fixture(t);
      f.write(`${location}/${name}`, fixtureKey);
      assertDefaultSettings(getBufferConfig({ repoRoot: f.repoRoot }));
    });
  }

  test(`BOM-prefixed ${location} API-key block cannot become unrelated settings`, t => {
    const f = fixture(t);
    f.write(`${location}/buffer-api-key.txt`, '\uFEFFBUFFER_API_KEY="' + fixtureKey + '"\r\n');
    assertDefaultSettings(getBufferConfig({ repoRoot: f.repoRoot }));
  });

  test(`shared ${location} file still supplies explicitly named Buffer settings`, t => {
    const f = fixture(t);
    f.write(`${location}/buffer-api-key.txt`, [
      '\uFEFFBUFFER_API_KEY="' + fixtureKey + '"',
      'BUFFER_API_BASE=https://api.buffer.fixture/',
      'BUFFER_ORGANIZATION_ID=fixture-org',
      'BUFFER_DEFAULT_CHANNEL_IDS="fixture-channel-a, fixture-channel-b"',
    ].join('\r\n'));
    assert.deepEqual(getBufferConfig({ repoRoot: f.repoRoot }), {
      apiKey: fixtureKey, apiBase: 'https://api.buffer.fixture',
      organizationId: 'fixture-org', defaultChannelIds: ['fixture-channel-a', 'fixture-channel-b'],
    });
  });
}

for (const style of ['upper', 'hyphen']) {
  test(`dedicated ${style} raw configuration retains keyholder precedence`, t => {
    const f = fixture(t);
    f.write('keyholder/buffer-api-key.txt', fixtureKey);
    const filename = name => style === 'upper' ? name + '.txt' : name.toLowerCase().replaceAll('_', '-') + '.txt';
    f.write('keyholder/' + filename('BUFFER_API_BASE'), 'https://api.buffer.keyholder/');
    f.write('keyholder/' + filename('BUFFER_ORGANIZATION_ID'), 'keyholder-org');
    f.write('keyholder/' + filename('BUFFER_DEFAULT_CHANNEL_IDS'), 'channel-a channel-b');
    f.write('.secrets/buffer.txt', 'BUFFER_API_BASE=https://api.buffer.fallback\nBUFFER_ORGANIZATION_ID=fallback-org\nBUFFER_DEFAULT_CHANNEL_IDS=fallback-channel');
    assert.deepEqual(getBufferConfig({ repoRoot: f.repoRoot }), {
      apiKey: fixtureKey, apiBase: 'https://api.buffer.keyholder',
      organizationId: 'keyholder-org', defaultChannelIds: ['channel-a', 'channel-b'],
    });
  });
}

test('named fields in the primary credential file retain precedence before dedicated files', t => {
  const f = fixture(t);
  f.write('keyholder/buffer-api-key.txt', `BUFFER_API_KEY=${fixtureKey}\nBUFFER_ORGANIZATION_ID=shared-org`);
  f.write('keyholder/BUFFER_ORGANIZATION_ID.txt', 'dedicated-org');
  assert.equal(getBufferConfig({ repoRoot: f.repoRoot }).organizationId, 'shared-org');
});

test('dedicated configuration retains precedence before the later shared buffer file', t => {
  const f = fixture(t);
  f.write('keyholder/buffer.txt', `BUFFER_API_KEY=${fixtureKey}\nBUFFER_ORGANIZATION_ID=shared-org`);
  f.write('keyholder/BUFFER_ORGANIZATION_ID.txt', 'dedicated-org');
  assert.equal(getBufferConfig({ repoRoot: f.repoRoot }).organizationId, 'dedicated-org');
});

test('environment and explicit options retain precedence', t => {
  const f = fixture(t);
  f.write('keyholder/buffer-api-key.txt', fixtureKey);
  process.env.BUFFER_API_KEY = 'environment-credential';
  process.env.BUFFER_API_BASE = 'BUFFER_API_BASE="https://api.buffer.environment/"';
  process.env.BUFFER_ORGANIZATION_ID = 'environment-org';
  process.env.BUFFER_DEFAULT_CHANNEL_IDS = 'environment-channel';
  assert.deepEqual(getBufferConfig({ repoRoot: f.repoRoot }), {
    apiKey: 'environment-credential', apiBase: 'https://api.buffer.environment',
    organizationId: 'environment-org', defaultChannelIds: ['environment-channel'],
  });
  assert.deepEqual(getBufferConfig({ repoRoot: f.repoRoot, apiKey: fixtureKey,
    apiBase: 'https://api.buffer.explicit/', organizationId: 'explicit-org', defaultChannelIds: ['explicit-channel'] }), {
    apiKey: fixtureKey, apiBase: 'https://api.buffer.explicit',
    organizationId: 'explicit-org', defaultChannelIds: ['explicit-channel'],
  });
});

test('a request with a raw key file uses the official endpoint and the key only as authorization', async t => {
  const f = fixture(t);
  f.write('.secrets/buffer-api-key.txt', fixtureKey);
  let calls = 0;
  const result = await bufferRequest('query Fixture { viewer { id } }', {}, {
    repoRoot: f.repoRoot,
    fetchImpl: async (url, options) => {
      calls += 1;
      assert.equal(url, 'https://api.buffer.com');
      assert.equal(options.headers.Authorization, 'Bearer ' + fixtureKey);
      assert.ok(!options.body.includes(fixtureKey));
      return { ok: true, status: 200, text: async () => JSON.stringify({ data: { viewer: { id: 'fixture-viewer' } } }) };
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(result, { viewer: { id: 'fixture-viewer' } });
});

test('raw fallback restriction preserves default secret loading and named-field lookup', t => {
  const f = fixture(t);
  f.write('keyholder/shared.txt', fixtureKey);
  f.write('.secrets/shared.txt', 'FIXTURE_CONFIG=explicit-setting');
  const options = { envName: 'FIXTURE_CONFIG', fileNames: ['shared.txt'], repoRoot: f.repoRoot, keyholderRoots: [path.join(f.repoRoot, 'keyholder')] };
  assert.equal(loadSecret(options).value, fixtureKey);
  assert.equal(loadSecret({ ...options, rawFileNames: [] }).value, 'explicit-setting');
});
