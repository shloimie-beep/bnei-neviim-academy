const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const operationsHtmlPath = path.join(root, 'public', 'operations.html');

const signup = {
  id: 1,
  parent_name: 'Gold Parent',
  student_name: 'Avi Gold',
  parent_email: 'gold@example.test',
  parent_phone: '+972 50 111 2222',
  status: 'signed_up',
  payment_status: 'paid',
  tags: ['priority-family', 'summer'],
  created_at: '2026-07-01T08:00:00.000Z',
  updated_at: '2026-07-03T08:00:00.000Z',
};

const lead = {
  id: 101,
  parent_name: 'Lead Parent',
  student_name: 'Mendy Lead',
  parent_email: 'lead@example.test',
  parent_phone: '+972 50 333 4444',
  lead_type: 'school_interest',
  status: 'interested',
  interest_level: 'hot',
  tags: ['open-house', 'priority-family'],
  created_at: '2026-07-02T08:00:00.000Z',
  updated_at: '2026-07-04T08:00:00.000Z',
};

const communications = [
  {
    id: 501,
    signup_id: 1,
    contact_type: 'signup',
    channel: 'email',
    direction: 'inbound',
    subject: 'Signup note',
    body: 'Signup note for Gold Parent.',
    occurred_at: '2026-07-04T10:00:00.000Z',
  },
  {
    id: 502,
    lead_id: 101,
    contact_type: 'lead',
    channel: 'whatsapp',
    direction: 'inbound',
    subject: 'Lead follow-up',
    body: 'Lead follow-up for open house.',
    occurred_at: '2026-07-04T11:00:00.000Z',
  },
];

function json(res, body, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function serveStatic(res, requestPath) {
  const publicRoot = path.join(root, 'public');
  const filePath = path.normalize(path.join(publicRoot, requestPath.replace(/^\/+/, '')));
  if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/plain',
  });
  res.end(fs.readFileSync(filePath));
  return true;
}

function apiPayload(pathname) {
  if (pathname === '/api/bna/auth/me') {
    return {
      authenticated: true,
      username: 'codex-job101@example.test',
      role: 'owner',
      displayName: 'Job 101 Smoke',
      allowedViews: ['dashboard', 'contacts', 'communications', 'tasks', 'settings'],
      scope: { type: 'project', projectKey: 'bna' },
    };
  }
  if (pathname === '/api/bna/workspace-directory') {
    return {
      categories: [
        {
          id: 'school',
          label: 'School',
          workspaces: [{ workspace_key: 'bna', name: 'BNA', workspace_type: 'school', display_category: 'school', project_key: 'bna' }],
        },
      ],
      review_items: [],
    };
  }
  if (pathname === '/api/bna/workspace-platform') {
    return { workspaces: [{ workspace_key: 'bna', name: 'BNA', workspace_type: 'school', display_category: 'school', project_key: 'bna' }], connector_settings: [], bot_actions: [], bot_action_logs: [] };
  }
  if (pathname === '/api/bna/projects') return { projects: [{ project_key: 'bna', name: 'BNA', short_name: 'BNA' }] };
  if (pathname === '/api/bna/signups') return { signups: [signup] };
  if (pathname === '/api/bna/parent-leads') return { leads: [lead] };
  if (pathname === '/api/bna/contact-communications') return { communications };
  if (pathname === '/api/bna/communications') return { communications: [] };
  if (pathname === '/api/bna/crm/contacts') {
    return {
      total: 2,
      filtered_total: 2,
      filters: {
        contact_types: ['signup', 'lead'],
        statuses: ['signed_up', 'interested'],
        sources: ['signup', 'parent_lead'],
        tags: ['open-house', 'priority-family', 'summer'],
      },
      cards: [
        { id: 'signup:1', display_name: 'Gold Parent', contact_type: 'signup', status: 'signed_up', source: 'signup', phone: signup.parent_phone, email: signup.parent_email, tags: signup.tags, last_contact_at: signup.updated_at },
        { id: 'lead:101', display_name: 'Lead Parent', contact_type: 'lead', status: 'interested', source: 'parent_lead', phone: lead.parent_phone, email: lead.parent_email, tags: lead.tags, last_contact_at: lead.updated_at },
      ],
    };
  }
  if (pathname.startsWith('/api/bna/crm/contacts/')) {
    return { timeline: [{ channel: 'email', type: 'note', body: 'Fixture timeline item.', occurred_at: '2026-07-04T12:00:00.000Z' }] };
  }
  return {
    people: [],
    users: [],
    audit_events: [],
    tasks: [],
    tickets: [],
    providers: [],
    notifications: [],
    payments: [],
    intake: [],
    jobs: [],
    sessions: [],
    meetings: [],
    cards: [],
    announcements: [],
    automations: [],
  };
}

test('Job 101 local Operations smoke unifies contacts, leads, CRM tags, and communication filters', async () => {
  let activePort = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    if (url.pathname === '/operations') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(operationsHtmlPath));
      return;
    }
    if (url.pathname.startsWith('/api/bna/')) return json(res, apiPayload(url.pathname));
    if (serveStatic(res, url.pathname)) return;
    res.writeHead(404);
    res.end('not found');
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  activePort = server.address().port;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(`http://127.0.0.1:${activePort}/operations?workspace=bna&view=contacts&section=overview`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-job101-contact-unified-filters="TASK-20260702-012-B"]', { timeout: 15000 });
    const overviewText = await page.locator('[data-job101-contact-unified-filters]').evaluate((node) => node.textContent.replace(/\s+/g, ' ').trim());
    assert.match(overviewText, /1 signup contacts/);
    assert.match(overviewText, /1 interested parents/);
    assert.match(overviewText, /3 shared tags/);
    assert.match(overviewText, /2 filtered communications/);

    await page.evaluate(() => window.setContactSection('crm_contacts'));
    await page.waitForSelector('[data-action-id="ACTION-CRM-CONTACTS-FILTER"]', { timeout: 10000 });
    await page.waitForFunction(() => /Gold Parent/.test(document.body.textContent) && /Lead Parent/.test(document.body.textContent), null, { timeout: 10000 });
    const crmText = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' ').trim());
    assert.match(crmText, /First-party CRM Contacts/);
    assert.match(crmText, /priority-family/);
    assert.match(crmText, /open-house/);

    await page.evaluate(() => {
      window.setContactSection('interested_parents');
      window.setContactFilter('tag', 'open-house');
    });
    await page.waitForFunction(() => /Lead Parent/.test(document.body.textContent), null, { timeout: 10000 });
    const leadText = await page.evaluate(() => document.body.textContent.replace(/\s+/g, ' ').trim());
    assert.match(leadText, /Lead Parent/);

    await page.evaluate(() => {
      window.setContactSection('notes');
      window.setContactFilter('tag', 'open-house');
    });
    await page.waitForFunction(() => /Lead follow-up/.test(document.body.textContent), null, { timeout: 10000 });
    const openHouseNotesText = (await page.locator('.communications-card').allTextContents()).join(' ');
    assert.match(openHouseNotesText, /Lead follow-up/);
    assert.doesNotMatch(openHouseNotesText, /Signup note for Gold Parent/);

    await page.evaluate(() => window.setContactFilter('tag', 'summer'));
    await page.waitForFunction(() => /Signup note/.test(document.body.textContent), null, { timeout: 10000 });
    const summerNotesText = (await page.locator('.communications-card').allTextContents()).join(' ');
    assert.match(summerNotesText, /Signup note for Gold Parent/);
    assert.doesNotMatch(summerNotesText, /Lead follow-up for open house/);

    assert.deepEqual(pageErrors, []);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
