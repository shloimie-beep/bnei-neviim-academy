const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://bna_test:bna_test@127.0.0.1:1/bna_test';
process.env.OPS_USERNAME = 'super-admin-test';
process.env.OPS_PASSWORD = 'super-secret-test';
process.env.ONE_TIME_OPS_USERNAME = 'one-time-test';
process.env.ONE_TIME_OPS_PASSWORD = 'one-time-secret-test';
process.env.PAYMENT_REMINDER_SCHEDULER = 'off';

const { app, pool } = require('../server');

function basicAuth(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function withServer(fn) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function installMockQuery() {
  const originalQuery = pool.query;
  const calls = [];
  pool.query = async (sql, params = []) => {
    const text = String(sql).replace(/\s+/g, ' ').trim();
    calls.push({ text, params });

    if (text.includes('FROM bna_tasks t') && text.includes('LEFT JOIN bna_projects p') && text.includes('WHERE t.id = $1')) {
      const taskId = Number(params[0]);
      if (taskId === 101) {
        return {
          rows: [{
            id: 101,
            workspace_id: 1,
            project_key: 'bna',
            workspace_key: 'bna'
          }]
        };
      }
      if (taskId === 202) {
        return {
          rows: [{
            id: 202,
            workspace_id: 2,
            project_key: 'one_time_mishnah_class',
            workspace_key: 'one_time_mishnah_class'
          }]
        };
      }
      return { rows: [] };
    }

    if (text.includes('FROM bna_task_comments') && text.includes('WHERE task_id = $1')) {
      return {
        rows: [{
          id: 1,
          task_id: Number(params[0]),
          workspace_id: 2,
          body: 'Scoped comment'
        }]
      };
    }

    throw new Error(`Unexpected test query: ${text}`);
  };

  return {
    calls,
    restore() {
      pool.query = originalQuery;
    }
  };
}

test('HTTP scoped workspace user is denied cross-module enumeration before database access', async () => {
  const mock = installMockQuery();
  try {
    await withServer(async (baseUrl) => {
      for (const { method, path: pathName } of [
        { method: 'GET', path: '/api/bna/students' },
        { method: 'POST', path: '/api/bna/students' },
        { method: 'PATCH', path: '/api/bna/students/1' },
        { method: 'POST', path: '/api/bna/students/1/access-code' },
        { method: 'GET', path: '/api/bna/signups' },
        { method: 'PATCH', path: '/api/bna/signups/1' },
        { method: 'GET', path: '/api/bna/payment-intake' },
        { method: 'POST', path: '/api/bna/payment-intake' },
        { method: 'GET', path: '/api/bna/payments' },
        { method: 'POST', path: '/api/bna/payments' },
        { method: 'GET', path: '/api/bna/content-jobs' },
        { method: 'POST', path: '/api/bna/content-jobs' },
        { method: 'PATCH', path: '/api/bna/content-jobs/1' },
        { method: 'GET', path: '/api/bna/class-sessions' },
        { method: 'GET', path: '/api/bna/content-bundles' },
        { method: 'POST', path: '/api/bna/content-bundles' },
        { method: 'GET', path: '/api/bna/pending-briefs' },
        { method: 'GET', path: '/api/bna/agent-fleet/status' }
      ]) {
        const response = await fetch(`${baseUrl}${pathName}`, {
          method,
          headers: {
            authorization: basicAuth('one-time-test', 'one-time-secret-test'),
            'content-type': 'application/json'
          },
          body: method === 'GET' ? undefined : JSON.stringify({})
        });
        assert.equal(response.status, 403, `${method} ${pathName}`);
      }
    });
    assert.equal(mock.calls.length, 0, 'denied enumeration routes should not query the database');
  } finally {
    mock.restore();
  }
});

test('HTTP scoped workspace user cannot read another workspace task comments by changing task ID', async () => {
  const mock = installMockQuery();
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/bna/tasks/101/comments`, {
        headers: {
          authorization: basicAuth('one-time-test', 'one-time-secret-test')
        }
      });
      const body = await response.json();

      assert.equal(response.status, 403);
      assert.match(body.error, /One Time Mishnah Class tasks/);
    });
  } finally {
    mock.restore();
  }
});

test('HTTP scoped workspace user can read its own workspace task comments', async () => {
  const mock = installMockQuery();
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/bna/tasks/202/comments`, {
        headers: {
          authorization: basicAuth('one-time-test', 'one-time-secret-test')
        }
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.comments.length, 1);
      assert.equal(body.comments[0].task_id, 202);
    });
  } finally {
    mock.restore();
  }
});
