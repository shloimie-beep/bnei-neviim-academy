const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://bna_test:bna_test@127.0.0.1:1/bna_test';
process.env.OPS_USERNAME = process.env.OPS_USERNAME || 'super-admin-test';
process.env.OPS_PASSWORD = process.env.OPS_PASSWORD || 'super-secret-test';
process.env.ONE_TIME_OPS_USERNAME = process.env.ONE_TIME_OPS_USERNAME || 'one-time-test';
process.env.ONE_TIME_OPS_PASSWORD = process.env.ONE_TIME_OPS_PASSWORD || 'one-time-secret-test';
process.env.PAYMENT_REMINDER_SCHEDULER = 'off';

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Assistant memory permissions require Assistant plus context-specific views', () => {
  const server = read('server.js');

  assert.match(server, /const ASSISTANT_MEMORY_MODULE_VIEWS = Object\.freeze\(\{/);
  assert.match(server, /assistant: 'assistant'/);
  assert.match(server, /students: 'students'/);
  assert.match(server, /accounting: 'accounting'/);
  assert.match(server, /const ASSISTANT_MEMORY_SUBJECT_VIEWS = Object\.freeze\(\{/);
  assert.match(server, /student: 'students'/);
  assert.match(server, /family: 'contacts'/);
  assert.match(server, /function assertAssistantMemoryPermission\(identity = \{\}, scope = \{\}\)/);
  assert.match(server, /Assistant memory requires the Assistant view for this workspace/);
  assert.match(server, /Assistant memory for \$\{scope\.module_key\} requires the \$\{moduleView\} view/);
  assert.match(server, /Assistant memory for \$\{scope\.subject_type\} context requires the \$\{subjectView\} view/);
});

test('Assistant memory scope is operations-only and redacts raw user keys from clients', () => {
  const server = read('server.js');
  const operations = read('public/operations.html');

  assert.match(server, /surface: 'operations'/);
  assert.doesNotMatch(server, /surface: input\.surface/);
  assert.match(server, /scope: assistantMemoryScopeForClient\(scope\)/);
  assert.match(server, /user_scope: 'current_user'/);
  assert.doesNotMatch(operations, /memoryScope\.user_key/);
  assert.match(operations, /memoryScope\.user_scope/);
  assert.match(operations, /cache: 'no-store'/);
});

test('Assistant routes set private no-store headers before auth', () => {
  const server = read('server.js');

  assert.match(server, /function assistantPrivateNoStore\(req, res, next\)/);
  assert.match(server, /res\.setHeader\('Cache-Control', 'private, no-store'\)/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/status', assistantPrivateNoStore, requireAdmin/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/memory', assistantPrivateNoStore, requireAdmin/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/actions', assistantPrivateNoStore, requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/actions\/:actionKey', assistantPrivateNoStore, requireAdmin/);
});

test('public unauthenticated requests cannot read Assistant memory or touch the database', async () => {
  const { app, pool } = require('../server');
  const originalQuery = pool.query;
  const calls = [];
  pool.query = async (sql, params = []) => {
    calls.push({ sql: String(sql), params });
    throw new Error('Assistant memory should not query the database for public requests');
  };

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/bna/assistant/memory`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.error, 'Unauthorized');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(calls.length, 0);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    pool.query = originalQuery;
  }
});
