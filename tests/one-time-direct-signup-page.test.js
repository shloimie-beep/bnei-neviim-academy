const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const signupHtml = fs.readFileSync(path.join(root, 'public', 'one-time', 'signup.html'), 'utf8');
const landingHtml = fs.readFileSync(path.join(root, 'public', 'one-time', 'index.html'), 'utf8');
const widget = fs.readFileSync(path.join(root, 'public', 'js', 'bna-bot-widget.js'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
const visibleSignupText = signupHtml
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ');

function createSignupServer(requests) {
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
        requests.push(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          lead: { id: 123, crm_lead_id: 456 },
          crm_lead_id: 456,
          no_send: true,
          no_checkout: true,
          no_access_granted: true,
          external_write_performed: false,
        }));
      });
      return;
    }
    if (req.url?.startsWith('/assets/')) {
      res.writeHead(204);
      res.end();
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });
}

test('One Time direct signup route, registries, and landing CTAs are canonical', () => {
  assert.match(server, /function sendOneTimeSignupPage\(req, res\)/);
  assert.match(server, /app\.get\(\['\/one-time\/signup', '\/one-time\/signup\/'\], sendOneTimeSignupPage\)/);

  assert.match(signupHtml, /data-one-time-signup-page/);
  assert.match(signupHtml, /data-one-time-direct-signup-form/);
  assert.match(signupHtml, /name="contact_name"/);
  assert.match(signupHtml, /name="signup_as"/);
  assert.match(signupHtml, /data-signup-type-picker/);
  assert.match(signupHtml, /data-signup-type-option[^>]+data-value="Family"/);
  assert.match(signupHtml, /data-signup-type-option[^>]+data-value="School"/);
  assert.match(signupHtml, /ACTION-ONETIME-SIGNUP-AS-FAMILY/);
  assert.match(signupHtml, /ACTION-ONETIME-SIGNUP-AS-SCHOOL/);
  assert.doesNotMatch(signupHtml, /<select[^>]+name="signup_as"/i);
  assert.doesNotMatch(signupHtml, /<option value="Family">Family<\/option>/);
  assert.doesNotMatch(signupHtml, /<option value="School">School<\/option>/);
  assert.doesNotMatch(signupHtml, /data-signup-type-trigger|data-signup-type-menu/);
  assert.match(signupHtml, /name="city_label"/);
  assert.match(signupHtml, /name="city_id"/);
  assert.match(signupHtml, /name="city_name"/);
  assert.match(signupHtml, /name="city_region"/);
  assert.match(signupHtml, /name="city_country"/);
  assert.match(signupHtml, /name="city_country_code"/);
  assert.match(signupHtml, /name="timezone"/);
  assert.match(signupHtml, /name="browser_timezone"/);
  assert.match(signupHtml, /name="timezone_fallback"/);
  assert.doesNotMatch(signupHtml, /cityOptions|CITY_OPTIONS|Choose the matching city|unambiguous city/);
  assert.match(signupHtml, /City, ZIP\/postal code, or area/);
  assert.match(signupHtml, /No city list is required/);
  assert.match(signupHtml, /area code/);
  assert.match(signupHtml, /name="email"/);
  assert.match(signupHtml, /name="phone"/);
  assert.match(signupHtml, /name="signup_acknowledgement"/);
  assert.match(signupHtml, /name="reminder_preference" value="email"/);
  assert.match(signupHtml, /name="reminder_preference" value="whatsapp"/);
  assert.match(signupHtml, /name="reminder_preference" value="both"/);
  assert.match(signupHtml, /name="reminder_preference" value="none"/);
  assert.match(signupHtml, /Use my detected time zone for class times\. By choosing reminders, I agree to receive class updates and can stop them at any time\./);
  assert.match(signupHtml, /\.consent-check input:checked::before/);
  assert.match(signupHtml, /id="signupAcknowledgement"[^>]+required/);
  assert.match(signupHtml, /Required for WhatsApp reminders/);
  assert.match(signupHtml, /class="required-dot"/);
  assert.doesNotMatch(signupHtml, /Add a phone number if you want WhatsApp reminders/i);
  assert.doesNotMatch(visibleSignupText, /phone\s*(?:\/\s*WhatsApp)?\s*[-:–—]?\s*optional/i);
  assert.doesNotMatch(visibleSignupText, /Optional unless/i);
  assert.doesNotMatch(signupHtml, /<input[^>]+name="reminder_preference"[^>]+checked/i);
  assert.doesNotMatch(signupHtml, /name="(?:student|student_name|studentName|learner_name|learnerName)/i);
  assert.doesNotMatch(visibleSignupText, /No billing|No checkout|No external send|CRM|Codex|configuration|guardrail|setup instructions/i);

  assert.match(landingHtml, /href="\/one-time\/signup"[^>]*ACTION-ONETIME-JOIN-SHIR-CTA/);
  assert.doesNotMatch(landingHtml, /data-signup-modal|data-signup-form|data-signup-trigger|signupDescription/);
  assert.doesNotMatch(landingHtml, /No complicated public checkout|This page records|Choose the right onboarding path/);
  assert.match(widget, /\/one-time\/signup/);
  assert.doesNotMatch(widget, /querySelector\('\[data-signup-trigger\]'\)/);

  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  assert.equal(routes.get('/one-time/signup')?.surface, 'one_time_public_direct_signup');
  assert.equal(routes.get('/one-time/signup')?.public_allowed, true);
  assert.match(routes.get('/one-time/signup')?.security_expectation || '', /optional phone unless WhatsApp/i);

  const actions = new Map(actionRegistry.actions.map((action) => [action.action_id, action]));
  assert.match(actions.get('ACTION-ONETIME-JOIN-SHIR-CTA')?.expected_behavior || '', /\/one-time\/signup/);
  assert.match(actions.get('ACTION-ONETIME-SIGNUP-AS-FAMILY')?.expected_behavior || '', /Family/i);
  assert.match(actions.get('ACTION-ONETIME-SIGNUP-AS-SCHOOL')?.expected_behavior || '', /School/i);
  assert.equal(actions.get('ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT')?.route, '/one-time/signup');
  assert.match(actions.get('ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT')?.expected_behavior || '', /no student name/i);
  assert.match(actions.get('ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT')?.expected_behavior || '', /phone required only for WhatsApp/i);
  assert.equal(actions.get('ACTION-ONETIME-SIGNUP-BACK-HOME')?.route, '/one-time/signup');
});

test('One Time direct signup validates WhatsApp phone and submits first-party payload', async () => {
  const requests = [];
  const srv = createSignupServer(requests);
  await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
  const port = srv.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ timezoneId: 'America/Buenos_Aires' });
  const page = await context.newPage();

  try {
    for (const width of [1440, 1024, 768, 430, 390]) {
      await page.setViewportSize({ width, height: 920 });
      await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        formVisible: Boolean(document.querySelector('[data-one-time-direct-signup-form]')?.offsetParent),
        checkedReminderCount: document.querySelectorAll('input[name="reminder_preference"]:checked').length,
        requiredDotCount: document.querySelectorAll('.required-dot:not([hidden])').length,
        phoneDotVisible: !document.querySelector('[data-phone-required-dot]')?.hidden,
        phoneHintVisible: !document.querySelector('[data-phone-hint]')?.hidden,
        acknowledgementRequired: Boolean(document.querySelector('input[name="signup_acknowledgement"]')?.required),
        acknowledgementChecked: Boolean(document.querySelector('input[name="signup_acknowledgement"]')?.checked),
        phoneLabel: document.querySelector('label[for="phone"]')?.textContent || '',
        consentText: document.querySelector('.consent-copy')?.textContent || '',
        signupTypePickerVisible: Boolean(document.querySelector('[data-signup-type-picker]')?.offsetParent),
        signupTypeOptionCount: document.querySelectorAll('[data-signup-type-option]').length,
        signupTypeVisibleOptionCount: Array.from(document.querySelectorAll('[data-signup-type-option]')).filter((node) => Boolean(node.offsetParent)).length,
        signupTypeSelectCount: document.querySelectorAll('select[name="signup_as"]').length,
        signupTypeValue: document.querySelector('input[name="signup_as"]')?.value || '',
        cityList: document.querySelector('input[name="city_label"]')?.getAttribute('list') || '',
        cityPlaceholder: document.querySelector('input[name="city_label"]')?.getAttribute('placeholder') || '',
        cityHint: document.querySelector('input[name="city_label"]')?.closest('.field')?.querySelector('.field-hint')?.textContent || '',
        timezone: document.querySelector('input[name="timezone"]')?.value || '',
        localClassTime: document.querySelector('[data-local-class-time]')?.textContent || '',
      }));
      assert.equal(metrics.formVisible, true, `form visible at ${width}`);
      assert.equal(metrics.checkedReminderCount, 0, `no preselected reminder at ${width}`);
      assert.ok(metrics.requiredDotCount >= 5, `required dots visible at ${width}`);
      assert.equal(metrics.phoneDotVisible, false, `phone dot hidden before WhatsApp selection at ${width}`);
      assert.equal(metrics.phoneHintVisible, false, `phone hint hidden before WhatsApp selection at ${width}`);
      assert.doesNotMatch(metrics.phoneLabel, /optional/i, `phone label has no optional copy at ${width}`);
      assert.equal(metrics.acknowledgementRequired, true, `acknowledgement required at ${width}`);
      assert.equal(metrics.acknowledgementChecked, false, `acknowledgement not prechecked at ${width}`);
      assert.equal(metrics.signupTypePickerVisible, true, `Family/School buttons visible at ${width}`);
      assert.equal(metrics.signupTypeOptionCount, 2, `Family/School button count at ${width}`);
      assert.equal(metrics.signupTypeVisibleOptionCount, 2, `Family/School visible button count at ${width}`);
      assert.equal(metrics.signupTypeSelectCount, 0, `no Family/School select at ${width}`);
      assert.equal(metrics.signupTypeValue, '', `Family/School starts unselected at ${width}`);
      assert.equal(metrics.cityList, '', `city field is free text at ${width}`);
      assert.match(metrics.cityPlaceholder, /ZIP\/postal code|area/i, `location placeholder accepts zip/area at ${width}`);
      assert.match(metrics.cityHint, /No city list is required/i, `location hint removes city-picker ambiguity at ${width}`);
      assert.equal(metrics.timezone, 'America/Buenos_Aires', `detected timezone stored at ${width}`);
      assert.match(metrics.localClassTime, /where you are/i, `local class time displays at ${width}`);
      assert.match(metrics.consentText, /detected time zone/i, `consent line mentions detected timezone at ${width}`);
      assert.match(metrics.consentText, /reminders/i, `consent line mentions reminders at ${width}`);
      assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `no horizontal overflow at ${width}`);
    }

    await page.setViewportSize({ width: 430, height: 920 });
    await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="contact_name"]', 'Leah Cohen');
    await page.click('[data-signup-type-option][data-value="Family"]');
    assert.equal(await page.locator('input[name="signup_as"]').inputValue(), 'Family');
    assert.equal(await page.locator('[data-signup-type-option][data-value="Family"]').getAttribute('aria-pressed'), 'true');
    await page.fill('input[name="city_label"]', '11230');
    await page.dispatchEvent('input[name="city_label"]', 'input');
    await page.fill('input[name="email"]', 'leah@example.invalid');
    await page.check('input[name="reminder_preference"][value="whatsapp"]');
    assert.equal(await page.locator('[data-phone-required-dot]').evaluate((node) => !node.hidden), true);
    assert.equal(await page.locator('[data-phone-hint]').evaluate((node) => !node.hidden && /Required for WhatsApp reminders/.test(node.textContent || '')), true);
    await page.click('button[data-action-id="ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT"]');
    await page.waitForSelector('[data-error-for="phone"].visible');
    assert.equal(requests.length, 0, 'WhatsApp selection without phone does not submit');

    await page.fill('input[name="phone"]', '+1 732 555 0100');
    await page.check('input[name="signup_acknowledgement"]');
    await page.click('button[data-action-id="ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT"]');
    await page.waitForSelector('[data-success-panel].active');
    assert.equal(requests.length, 1, 'valid signup submits once');

    const payload = requests[0];
    assert.equal(payload.contact_name, 'Leah Cohen');
    assert.equal(payload.parent_name, 'Leah Cohen');
    assert.equal(payload.email, 'leah@example.invalid');
    assert.equal(payload.phone, '+1 732 555 0100');
    assert.equal(payload.whatsapp, '+1 732 555 0100');
    assert.equal(payload.source_landing_page, '/one-time/signup');
    assert.equal(payload.signup_mode, 'one_time_class_signup');
    assert.equal(payload.signup_acknowledgement, true);
    assert.equal(payload.reminder_consent_ack, true);
    assert.equal(payload.location_time_acknowledgement, true);
    assert.equal(payload.consent, true);
    assert.equal(payload.region, 'worldwide');
    assert.equal(payload.timezone, 'America/Buenos_Aires');
    assert.equal(payload.city_id, '');
    assert.equal(payload.city_label, '11230');
    assert.equal(payload.city_name, '11230');
    assert.equal(payload.city_country_code, '');
    assert.equal(payload.browser_timezone, 'America/Buenos_Aires');
    assert.equal(payload.metadata.signup_as, 'Family');
    assert.equal(payload.metadata.city.id, '');
    assert.equal(payload.metadata.city.label, '11230');
    assert.equal(payload.metadata.city.timezone, 'America/Buenos_Aires');
    assert.equal(payload.metadata.timezone_source, 'browser');
    assert.equal(payload.metadata.reminder_preference, 'whatsapp');
    assert.equal(payload.metadata.reminder_consent, true);
    assert.equal(payload.metadata.reminder_consent_acknowledged, true);
    assert.equal(payload.metadata.location_time_acknowledgement, true);
    assert.equal(payload.metadata.reminder_consent_policy_version, 'one-time-class-reminders-v1-2026-07-12');
    assert.equal(Object.prototype.hasOwnProperty.call(payload, 'student_name'), false);
    assert.equal(await page.locator('[data-continue-link]').count(), 0);
    const storedLead = JSON.parse(await page.evaluate(() => window.sessionStorage.getItem('oneTimeSignupLead')));
    assert.equal(storedLead.parent_name, 'Leah Cohen');
    assert.equal(storedLead.contact_name, 'Leah Cohen');
    assert.equal(storedLead.email, 'leah@example.invalid');
    assert.equal(storedLead.phone, '+1 732 555 0100');
    assert.equal(storedLead.signup_as, 'Family');
    assert.equal(storedLead.product_lead_id, '123');
    assert.equal(storedLead.crm_lead_id, '456');
    assert.equal(storedLead.source_landing_page, '/one-time/signup');
    assert.equal(storedLead.city, '11230');
    assert.equal(storedLead.city_context.id, '');
    assert.equal(storedLead.city_context.timezone, 'America/Buenos_Aires');
    assert.deepEqual(storedLead.utm, {});
  } finally {
    await browser.close();
    await new Promise((resolve) => srv.close(resolve));
  }
});
