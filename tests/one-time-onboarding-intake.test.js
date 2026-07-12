const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const preview = fs.readFileSync(path.join(root, 'public', 'one-time-preview.html'), 'utf8');

function oneTimeOnboardingRouteBody() {
  const start = server.indexOf("app.post('/api/one-time/mishnah/onboarding'");
  const end = server.indexOf("app.post('/api/parent-portal/provider-messages'", start);
  assert.notEqual(start, -1, 'One Time onboarding route should exist');
  assert.notEqual(end, -1, 'route body should end before provider messages route');
  return server.slice(start, end);
}

function createOnboardingServer(requests) {
  return http.createServer((req, res) => {
    if (req.url?.startsWith('/one-time-onboarding') || req.url?.startsWith('/one-time-preview.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(preview);
      return;
    }
    if (req.url === '/api/one-time/mishnah/onboarding' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        const payload = JSON.parse(body || '{}');
        requests.push(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          no_send: true,
          no_checkout: true,
          no_access_granted: true,
          external_write_performed: false,
          local_write_performed: true,
        }));
      });
      return;
    }
    if (req.url?.startsWith('/js/') || req.url?.startsWith('/assets/')) {
      res.writeHead(204);
      res.end();
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });
}

test('One Time Mishnah onboarding route creates scoped local review records only', () => {
  const route = oneTimeOnboardingRouteBody();

  assert.match(route, /ONE_TIME_PROJECT_KEY/);
  assert.match(server, /const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class'/);
  assert.match(server, /function oneTimeOnboardingValidationError/);
  assert.match(server, /function resolveOneTimeOnboardingOriginalCapture/);
  assert.match(route, /resolveOneTimeOnboardingOriginalCapture/);
  assert.match(route, /upsertOneTimePreviewLead/);
  assert.match(route, /upsertOneTimePreviewContact/);
  assert.match(server, /bna_parent_leads/);
  assert.match(server, /bna_product_leads/);
  assert.match(server, /bna_contacts/);
  assert.match(route, /bna_contact_communications/);
  assert.match(route, /bna_support_tickets/);
  assert.match(route, /createTaskFromText/);
  assert.match(server, /product_lead_id: fields\.productLeadId/);
  assert.match(server, /crm_lead_id: fields\.crmLeadId/);
  assert.match(server, /family_school_classification: fields\.audienceType/);
  assert.match(server, /exact_original_capture_verified: true/);
  assert.match(route, /no_send: true/);
  assert.match(route, /external_write_performed: false/);
  assert.match(route, /no_checkout: true/);
  assert.match(route, /no_access_granted: true/);
  assert.doesNotMatch(route, /sendEmail\s*\(/);
  assert.doesNotMatch(route, /sendTelegramNotification\s*\(/);
  assert.doesNotMatch(route, /sendParentMagicLinkWhatsApp/);
  assert.doesNotMatch(route, /SEND_WHATSAPP/);
});

test('One Time Mishnah onboarding supports a no-write dry run preview', () => {
  const route = oneTimeOnboardingRouteBody();

  assert.match(route, /dry_run/);
  assert.match(route, /local_write_performed: false/);
  assert.match(server, /planned_records/);
  assert.match(server, /no_payment_link_sent/);
  assert.match(server, /no_member_access_granted/);
});

test('One Time preview page posts guided intake to the scoped onboarding route', () => {
  assert.match(preview, /id="one-time-onboarding"/);
  assert.match(preview, /data-one-time-onboarding/);
  assert.match(preview, /\/api\/one-time\/mishnah\/onboarding/);
  assert.match(preview, /name="parent_name"/);
  assert.match(preview, /name="parent_email"/);
  assert.match(preview, /name="parent_phone"/);
  assert.match(preview, /name="product_lead_id"/);
  assert.match(preview, /name="crm_lead_id"/);
  assert.match(preview, /name="utm_json"/);
  assert.match(preview, /name="referrer"/);
  assert.match(preview, /name="source_landing_page"/);
  assert.match(preview, /name="audience_type" value="family"/);
  assert.match(preview, /name="audience_type" value="school"/);
  assert.match(preview, /name="family_learner_name"/);
  assert.match(preview, /Please enter your son's name and age or grade/);
  assert.match(preview, /name="school_name"/);
  assert.match(preview, /Please enter the school name and your role/);
  assert.match(preview, /Please continue from your saved signup so this stays linked to the original capture/);
  assert.match(preview, /original_capture/);
  assert.match(preview, /No payment or member access is created from this form/);
  assert.match(preview, /No external message was sent/);
});

test('One Time preview continuation preserves exact lead IDs and branch classifications', async () => {
  const requests = [];
  const srv = createOnboardingServer(requests);
  await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const port = srv.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('oneTimeSignupLead', JSON.stringify({
        parent_name: 'Leah Cohen',
        contact_name: 'Leah Cohen',
        email: 'leah@example.invalid',
        phone: '+1 732 555 0100',
        signup_as: 'Family',
        city: 'Lakewood, New Jersey, United States',
        product_lead_id: '123',
        crm_lead_id: '456',
        source_landing_page: '/one-time/signup',
        referrer: 'https://example.invalid/referral',
        utm: { utm_source: 'newsletter' },
      }));
    });
    await page.goto(`${baseUrl}/one-time-onboarding?utm_campaign=rosh-hashanah`, { waitUntil: 'domcontentloaded' });
    await page.click('button[data-action-id="ACTION-ONETIME-ONBOARDING-SUBMIT"]');
    await page.waitForFunction(() => /son's name and age or grade/i.test(document.querySelector('[data-onetime-onboarding-status]')?.textContent || ''));
    assert.equal(requests.length, 0, 'family branch does not submit without learner details');

    await page.fill('input[name="family_learner_name"]', 'Ari Cohen');
    await page.fill('input[name="family_learner_stage"]', 'Grade 6');
    await page.click('button[data-action-id="ACTION-ONETIME-ONBOARDING-SUBMIT"]');
    await page.waitForFunction(() => /Saved/i.test(document.querySelector('[data-onetime-onboarding-status]')?.textContent || ''));
    assert.equal(requests.length, 1, 'family branch submits after required fields');
    assert.equal(requests[0].parent_name, 'Leah Cohen');
    assert.equal(requests[0].parent_email, 'leah@example.invalid');
    assert.equal(requests[0].audience_type, 'family');
    assert.equal(requests[0].learner_name, 'Ari Cohen');
    assert.equal(requests[0].learner_stage, 'Grade 6');
    assert.equal(requests[0].product_lead_id, '123');
    assert.equal(requests[0].crm_lead_id, '456');
    assert.equal(requests[0].source_landing_page, '/one-time/signup');
    assert.equal(requests[0].referrer, 'https://example.invalid/referral');
    assert.deepEqual(requests[0].utm, { utm_campaign: 'rosh-hashanah', utm_source: 'newsletter' });
    assert.deepEqual(requests[0].original_capture, {
      product_lead_id: '123',
      crm_lead_id: '456',
      source_landing_page: '/one-time/signup',
      referrer: 'https://example.invalid/referral',
      utm: { utm_campaign: 'rosh-hashanah', utm_source: 'newsletter' },
    });

    const schoolPage = await browser.newPage();
    await schoolPage.addInitScript(() => {
      window.sessionStorage.setItem('oneTimeSignupLead', JSON.stringify({
        parent_name: 'Bais Torah',
        contact_name: 'Bais Torah',
        email: 'school@example.invalid',
        phone: '+1 732 555 0102',
        signup_as: 'School',
        audience_type: 'school',
        family_school_classification: 'school',
        city: 'Lakewood, New Jersey, United States',
        product_lead_id: '123',
        crm_lead_id: '456',
        source_landing_page: '/one-time/signup',
        referrer: 'https://example.invalid/referral',
        utm: { utm_source: 'newsletter' },
      }));
    });
    await schoolPage.goto(`${baseUrl}/one-time-onboarding`, { waitUntil: 'domcontentloaded' });
    await schoolPage.click('button[data-action-id="ACTION-ONETIME-ONBOARDING-SUBMIT"]');
    await schoolPage.waitForFunction(() => /school name and your role/i.test(document.querySelector('[data-onetime-onboarding-status]')?.textContent || ''));
    assert.equal(requests.length, 1, 'school branch does not submit without school fields');
    await schoolPage.fill('input[name="school_name"]', 'Bais Torah');
    await schoolPage.fill('input[name="school_role"]', 'Principal');
    await schoolPage.click('button[data-action-id="ACTION-ONETIME-ONBOARDING-SUBMIT"]');
    await schoolPage.waitForFunction(() => /Saved/i.test(document.querySelector('[data-onetime-onboarding-status]')?.textContent || ''));
    assert.equal(requests.length, 2, 'school branch submits after required fields');
    assert.equal(requests[1].audience_type, 'school');
    assert.equal(requests[1].learner_name, 'Bais Torah');
    assert.equal(requests[1].learner_stage, 'Principal');
    assert.equal(requests[1].product_lead_id, '123');
    assert.equal(requests[1].crm_lead_id, '456');

    await schoolPage.goto(`${baseUrl}/one-time-onboarding?audience=family`, { waitUntil: 'domcontentloaded' });
    assert.equal(await schoolPage.locator('input[name="audience_type"]:checked').inputValue(), 'family', 'explicit URL audience overrides saved school branch');
  } finally {
    await browser.close();
    await new Promise((resolve) => srv.close(resolve));
  }
});
