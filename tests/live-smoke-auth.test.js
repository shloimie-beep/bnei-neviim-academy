const assert = require('node:assert/strict');
const test = require('node:test');

async function authModule() {
  return import('../scripts/lib/live-smoke-auth.mjs');
}

test('live smoke auth prefers explicit OPS env credentials', async () => {
  const { resolveOpsCredentials } = await authModule();
  let called = false;
  const credentials = resolveOpsCredentials({
    env: { OPS_USERNAME: 'admin@example.test', OPS_PASSWORD: 'admin-pass' },
    execFileSync: () => {
      called = true;
      throw new Error('should not call Railway');
    },
  });

  assert.equal(called, false);
  assert.deepEqual(credentials, {
    username: 'admin@example.test',
    password: 'admin-pass',
    source: 'env',
  });
});

test('live smoke auth parses Railway variable JSON without exposing values', async () => {
  const { parseRailwayVariables } = await authModule();
  assert.deepEqual(parseRailwayVariables(JSON.stringify({
    OPS_USERNAME: 'ops@example.test',
    OPS_PASSWORD: 'ops-pass',
    OTHER: { value: 'wrapped' },
  })), {
    OPS_USERNAME: 'ops@example.test',
    OPS_PASSWORD: 'ops-pass',
    OTHER: 'wrapped',
  });

  assert.deepEqual(parseRailwayVariables(JSON.stringify([
    { name: 'OPS_USERNAME', value: 'array-user' },
    { name: 'OPS_PASSWORD', value: 'array-pass' },
  ])), {
    OPS_USERNAME: 'array-user',
    OPS_PASSWORD: 'array-pass',
  });
});

test('live smoke auth falls back to temp-linked Railway variables', async () => {
  const { resolveOpsCredentials } = await authModule();
  const calls = [];
  let variableCallCount = 0;
  const credentials = resolveOpsCredentials({
    env: {},
    cwd: 'repo',
    tmpdir: () => 'tmp-root',
    mkdtempSync: (prefix) => `${prefix}abc`,
    rmSync: (dir, options) => calls.push(['rm', dir, options.recursive, options.force]),
    execFileSync: (command, args, options) => {
      calls.push([command, ...args, `cwd=${options.cwd}`]);
      if (args.includes('variable')) {
        variableCallCount += 1;
        if (variableCallCount === 1) throw new Error('not linked');
        return JSON.stringify({
          OPS_USERNAME: 'railway@example.test',
          OPS_PASSWORD: 'railway-pass',
        });
      }
      if (args.includes('link')) return '{}';
      throw new Error(`unexpected command ${command} ${args.join(' ')}`);
    },
  });

  assert.equal(credentials.username, 'railway@example.test');
  assert.equal(credentials.password, 'railway-pass');
  assert.equal(credentials.source, 'railway');
  assert.ok(calls.some((call) => call.includes('link')));
  assert.ok(calls.some((call) => call[0] === 'rm'));
});
