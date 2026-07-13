const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const signupHtml = fs.readFileSync(path.join(root, 'public', 'one-time', 'signup.html'), 'utf8');

function createSignupServer(requests, options = {}) {
  return http.createServer((req, res) => {
    if (req.url === '/one-time/signup' || req.url === '/one-time/signup/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(signupHtml);
      return;
    }
    if (req.url === '/api/one-time/interest' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        const payload = JSON.parse(body || '{}');
        if (options.rejectOnce && !options.rejected) {
          options.rejected = true;
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            code: 'VALIDATION_ERROR',
            field_errors: { email: 'Enter a valid email address.' },
          }));
          return;
        }
        requests.push(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          contact_key: 'bna_contacts:123',
          signup_key: 'bna_product_leads:456',
          confirmation_queued: true,
          reminder_preference: payload.reminder_preference,
          next_path: '/one-time',
          duplicate_submission: false,
          lead: { id: 456, crm_lead_id: 789, contact_key: 'bna_contacts:123' },
          crm_lead_id: 789,
          no_send: true,
          no_checkout: true,
          no_access_granted: true,
          external_write_performed: false,
        }));
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });
}

async function withPage(fn, options = {}) {
  const requests = [];
  const srv = createSignupServer(requests, options);
  await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: options.width || 430, height: 920 } });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
    await fn({ page, requests, baseUrl });
  } finally {
    await browser.close();
    await new Promise((resolve) => srv.close(resolve));
  }
}

async function fillBase(page, {
  audience = 'family',
  reminder = 'email',
  phone = '',
  consent = true,
  email = 'matrix@example.invalid',
  location = 'Ramat Beit Shemesh',
  name = 'Matrix Parent',
} = {}) {
  await page.fill('input[name="contact_name"]', name);
  if (audience) await page.check(`input[name="audience_type"][value="${audience}"]`);
  if (location !== null) {
    await page.fill('input[name="location"]', location);
    await page.dispatchEvent('input[name="location"]', 'input');
  }
  await page.fill('input[name="email"]', email);
  if (phone) await page.fill('input[name="phone"]', phone);
  if (reminder) await page.check(`input[name="reminder_preference"][value="${reminder}"]`);
  if (consent && reminder && reminder !== 'none') await page.check('input[name="reminder_consent"]');
}

async function submit(page) {
  await page.click('button[data-action-id="ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT"]');
}

async function visibleErrorFields(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.field-error.visible')).map((node) => ({
    field: node.getAttribute('data-error-for'),
    text: node.textContent.trim(),
  })));
}

async function expectSuccess(page, requests, expected) {
  await page.waitForSelector('[data-success-panel].active');
  assert.equal(requests.length, 1);
  const payload = requests[0];
  assert.equal(payload.audience_type, expected.audience);
  assert.equal(payload.reminder_preference, expected.reminder);
  assert.equal(Boolean(payload.phone), Boolean(expected.phone));
  assert.equal(payload.reminder_consent, expected.consent);
  assert.ok(payload.idempotency_key);
  assert.equal(await page.locator('[data-success-panel]').textContent().then((text) => /You're signed up/.test(text)), true);
}

test('One Time signup matrix success combinations and mobile widths', async () => {
  const cases = [
    ['Family + Email reminders + no phone', { audience: 'family', reminder: 'email', consent: true }, { audience: 'family', reminder: 'email', phone: false, consent: true }],
    ['School + Email reminders + no phone', { audience: 'school', reminder: 'email', consent: true }, { audience: 'school', reminder: 'email', phone: false, consent: true }],
    ['Family + No reminders + no phone', { audience: 'family', reminder: 'none', consent: false }, { audience: 'family', reminder: 'none', phone: false, consent: false }],
    ['School + No reminders + no phone', { audience: 'school', reminder: 'none', consent: false }, { audience: 'school', reminder: 'none', phone: false, consent: false }],
    ['WhatsApp + valid phone + consent', { audience: 'family', reminder: 'whatsapp', phone: '+1 732 555 0101', consent: true }, { audience: 'family', reminder: 'whatsapp', phone: true, consent: true }],
    ['Both + valid phone + consent', { audience: 'school', reminder: 'both', phone: '+1 732 555 0102', consent: true }, { audience: 'school', reminder: 'both', phone: true, consent: true }],
  ];
  for (const [label, input, expected] of cases) {
    await withPage(async ({ page, requests }) => {
      await fillBase(page, { ...input, email: `${label.toLowerCase().replace(/[^a-z]+/g, '.')}@example.invalid` });
      await submit(page);
      await expectSuccess(page, requests, expected);
    }, { width: label.includes('School') ? 390 : 430 });
  }
});

test('One Time signup matrix field-specific errors', async () => {
  const cases = [
    ['WhatsApp + no phone', { reminder: 'whatsapp', consent: true }, 'phone', 'Enter a WhatsApp number or choose a different reminder option.'],
    ['Both + no phone', { reminder: 'both', consent: true }, 'phone', 'Enter a WhatsApp number or choose a different reminder option.'],
    ['Missing audience', { audience: '', reminder: 'email', consent: true }, 'audience_type', 'Choose Family or School.'],
    ['Missing location', { location: '', reminder: 'email', consent: true }, 'location', 'Enter your city or location.'],
    ['Missing reminder choice', { reminder: '', consent: false }, 'reminder_preference', 'Choose Email, WhatsApp, Both, or No reminders.'],
    ['Invalid email', { email: 'not-an-email', reminder: 'email', consent: true }, 'email', 'Enter a valid email address.'],
  ];
  for (const [, input, field, text] of cases) {
    await withPage(async ({ page, requests }) => {
      await fillBase(page, input);
      await submit(page);
      const errors = await visibleErrorFields(page);
      assert.deepEqual(errors, [{ field, text }]);
      assert.equal(requests.length, 0);
    });
  }
});

test('One Time signup conditional switching clears hidden/optional validation', async () => {
  await withPage(async ({ page, requests }) => {
    await fillBase(page, { reminder: 'whatsapp', consent: true });
    await submit(page);
    assert.deepEqual(await visibleErrorFields(page), [{
      field: 'phone',
      text: 'Enter a WhatsApp number or choose a different reminder option.',
    }]);
    await page.check('input[name="reminder_preference"][value="email"]');
    assert.equal(await page.locator('[data-error-for="phone"]').evaluate((node) => node.classList.contains('visible')), false);
    await page.check('input[name="reminder_consent"]');
    await submit(page);
    await expectSuccess(page, requests, { audience: 'family', reminder: 'email', phone: false, consent: true });
  });

  await withPage(async ({ page, requests }) => {
    await fillBase(page, { reminder: 'email', consent: true });
    await page.check('input[name="reminder_preference"][value="none"]');
    assert.equal(await page.locator('input[name="reminder_consent"]').evaluate((node) => node.disabled && !node.required && !node.checked), true);
    assert.equal(await page.locator('[data-reminder-consent-field]').evaluate((node) => node.hidden), true);
    await submit(page);
    await expectSuccess(page, requests, { audience: 'family', reminder: 'none', phone: false, consent: false });
  });
});

test('One Time signup audience switching, duplicate submit, server validation, and keyboard completion', async () => {
  await withPage(async ({ page, requests }) => {
    await page.check('input[name="audience_type"][value="family"]');
    assert.equal(await page.locator('input[name="signup_as"]').inputValue(), 'Family');
    await page.check('input[name="audience_type"][value="school"]');
    assert.equal(await page.locator('input[name="signup_as"]').inputValue(), 'School');
    await page.check('input[name="audience_type"][value="family"]');
    assert.equal(await page.locator('input[name="audience_type"]:checked').inputValue(), 'family');
    await fillBase(page, { audience: 'family', reminder: 'none', consent: false });
    await Promise.all([submit(page), submit(page)]);
    await page.waitForSelector('[data-success-panel].active');
    assert.equal(requests.length, 1);
  });

  await withPage(async ({ page, requests }) => {
    await fillBase(page, { reminder: 'email', consent: true });
    await submit(page);
    await page.waitForSelector('[data-error-for="email"].visible');
    assert.deepEqual(await visibleErrorFields(page), [{ field: 'email', text: 'Enter a valid email address.' }]);
    assert.equal(requests.length, 0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('[data-success-panel].active').count(), 0);
  }, { rejectOnce: true });

  await withPage(async ({ page, requests }) => {
    await page.focus('input[name="contact_name"]');
    await page.keyboard.type('Keyboard Parent');
    await page.focus('input[name="audience_type"][value="family"]');
    await page.keyboard.press('Space');
    await page.focus('input[name="location"]');
    await page.keyboard.type('Monsey');
    await page.focus('input[name="email"]');
    await page.keyboard.type('keyboard@example.invalid');
    await page.focus('input[name="reminder_preference"][value="none"]');
    await page.keyboard.press('Space');
    await page.focus('button[data-action-id="ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT"]');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-success-panel].active');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].audience_type, 'family');
    assert.equal(requests[0].reminder_preference, 'none');
  });
});
