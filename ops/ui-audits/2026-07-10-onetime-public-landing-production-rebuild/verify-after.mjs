import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('ops/ui-audits/2026-07-10-onetime-public-landing-production-rebuild');
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.ONE_TIME_LOCAL_URL || 'http://127.0.0.1:3210/one-time';
const viewports = [
  { width: 1440, height: 1000 },
  { width: 1280, height: 900 },
  { width: 1024, height: 900 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 360, height: 800 },
  { width: 320, height: 740 },
];

const oldPhrases = [
  'Save My Spot',
  'See How It Works',
  'Join the free class',
  'WhatsApp Robot Scheller',
  'FAQ',
];

function fail(message, details = {}) {
  const error = new Error(message);
  error.details = details;
  throw error;
}

const browser = await chromium.launch();
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text().slice(0, 500) });
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(String(error?.message || error).slice(0, 500));
  });

  await page.route('**/api/one-time/interest', async (route) => {
    const payload = route.request().postDataJSON();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        crm_lead_id: 99001,
        lead: { id: 88001, crm_lead_id: 99001 },
        no_email_sent: true,
        no_whatsapp_or_wapi_sent: true,
        no_checkout: true,
        no_access_granted: true,
        test_payload: payload,
      }),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: path.join(outDir, `after-${viewport.width}.png`),
    fullPage: true,
  });

  const metrics = await page.evaluate((phrases) => {
    const body = document.body;
    const doc = document.documentElement;
    const isVisible = (node) => {
      if (!node) return false;
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const visibleText = (body.innerText || '').replace(/\s+/g, ' ').trim();
    const visibleButtons = [...document.querySelectorAll('a, button')]
      .filter(isVisible)
      .map((node) => (node.textContent || node.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const modal = document.querySelector('[data-signup-modal]');
    const form = document.querySelector('[data-signup-form]');
    const helper = document.querySelector('.bna-bot-launcher');
    return {
      title: document.title,
      h1_count: document.querySelectorAll('h1').length,
      h1_text: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      scroll_width: Math.max(body?.scrollWidth || 0, doc?.scrollWidth || 0),
      client_width: doc?.clientWidth || 0,
      has_horizontal_overflow: Math.max(body?.scrollWidth || 0, doc?.scrollWidth || 0) > (doc?.clientWidth || 0) + 1,
      inline_interest_form_present: Boolean(document.querySelector('#interestForm')),
      modal_present: Boolean(modal),
      form_present: Boolean(form),
      parent_name_present: Boolean(form?.querySelector('[name="parent_name"]')),
      email_present: Boolean(form?.querySelector('[name="email"]')),
      phone_present: Boolean(form?.querySelector('[name="phone"]')),
      student_quick_field_present: Boolean(form?.querySelector('[name*="student"], [name*="learner"]')),
      faq_present: Boolean(document.querySelector('#faq')),
      old_phrases_visible: phrases.filter((phrase) => visibleText.includes(phrase)),
      visible_actions: visibleButtons,
      helper_label: helper?.getAttribute('aria-label') || '',
      helper_title: helper?.getAttribute('title') || '',
      helper_bottom: helper ? Math.round(window.innerHeight - helper.getBoundingClientRect().bottom) : null,
      body_classes: body?.className || '',
    };
  }, oldPhrases);

  if (metrics.has_horizontal_overflow) fail('Horizontal overflow detected', { viewport, metrics });
  if (metrics.h1_count !== 1) fail('Expected exactly one h1', { viewport, metrics });
  if (!metrics.modal_present || !metrics.form_present) fail('Signup modal/form missing', { viewport, metrics });
  if (!metrics.parent_name_present || !metrics.email_present || !metrics.phone_present) fail('Expected signup fields missing', { viewport, metrics });
  if (metrics.student_quick_field_present) fail('Student/learner field present in quick capture', { viewport, metrics });
  if (metrics.faq_present || metrics.old_phrases_visible.length) fail('Old page language still visible', { viewport, metrics });
  if (!/WhatsApp assistant/i.test(metrics.helper_label) || !/WhatsApp assistant/i.test(metrics.helper_title)) {
    fail('Robot Scheller launcher is not labeled as WhatsApp assistant', { viewport, metrics });
  }
  if (metrics.helper_bottom !== null && metrics.helper_bottom > 120) {
    fail('Robot Scheller launcher is not a bottom-corner utility', { viewport, metrics });
  }

  results.push({ viewport, metrics, consoleMessages, pageErrors });
  await page.close();
}

const modalPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const capturedRequests = [];
let modalFinalUrl = '';
await modalPage.route('**/api/one-time/interest', async (route) => {
  const payload = route.request().postDataJSON();
  capturedRequests.push(payload);
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      crm_lead_id: 99001,
      lead: { id: 88001, crm_lead_id: 99001 },
      no_email_sent: true,
      no_whatsapp_or_wapi_sent: true,
      no_checkout: true,
      no_access_granted: true,
    }),
  });
});

await modalPage.goto(baseUrl, { waitUntil: 'networkidle' });
await modalPage.getByRole('button', { name: 'Sign Up Now' }).first().click();
await modalPage.getByRole('dialog', { name: 'Sign Up Now' }).waitFor({ state: 'visible' });
await modalPage.getByRole('button', { name: 'Sign Up Now' }).last().click();
await modalPage.getByText('Please fix the highlighted fields.').waitFor({ state: 'visible' });
await modalPage.getByLabel('Parent or contact name').fill('Agent Mode Parent');
await modalPage.getByLabel('Email').fill('agent-mode+onetime@example.invalid');
await modalPage.getByLabel(/Phone/).fill('+1 555 0100');
await modalPage.getByRole('button', { name: 'Sign Up Now' }).last().click();
await modalPage.getByText('Choose the right onboarding path.').waitFor({ state: 'visible' });

if (capturedRequests.length !== 1) fail('Expected one intercepted signup request', { capturedRequests });
const payload = capturedRequests[0];
if (payload.student_name || payload.studentName || payload.learner_name || payload.learnerName) {
  fail('Signup payload included a student/learner name', { payload });
}
if (payload.parent_name !== 'Agent Mode Parent' || payload.email !== 'agent-mode+onetime@example.invalid') {
  fail('Signup payload did not include required parent/email fields', { payload });
}
if (!payload.metadata || payload.metadata.raw_intake_id !== 'RAW-20260710-007') {
  fail('Signup payload missing protocol metadata', { payload });
}
if (payload.metadata.addendum_raw_intake_id !== 'RAW-20260710-008') {
  fail('Signup payload missing addendum metadata', { payload });
}
await modalPage.locator('.signup-dialog').screenshot({ path: path.join(outDir, 'focus-signup-dialog-390.png') });

const continueButton = modalPage.getByRole('button', { name: 'Continue' });
if (await continueButton.isEnabled()) fail('Continue should be disabled before audience choice');
await modalPage.getByLabel('Family').check();
if (!(await continueButton.isEnabled())) fail('Continue should enable after audience choice');
await continueButton.click();
await modalPage.waitForURL(/\/one-time-preview\?/, { timeout: 5000 });
const finalUrl = new URL(modalPage.url());
modalFinalUrl = modalPage.url();
if (finalUrl.searchParams.get('audience') !== 'family' || finalUrl.searchParams.get('lead_hint') !== 'captured') {
  fail('Onboarding URL missing expected non-secret routing params', { url: modalPage.url() });
}
for (const sensitive of ['email', 'phone', 'parent_name']) {
  if (finalUrl.searchParams.has(sensitive)) fail('Onboarding URL leaked contact data', { url: modalPage.url(), sensitive });
}
await modalPage.screenshot({ path: path.join(outDir, 'after-modal-success-390.png'), fullPage: true });
await modalPage.close();

const focusDesktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await focusDesktop.goto(baseUrl, { waitUntil: 'networkidle' });
await focusDesktop.locator('.site-header').screenshot({ path: path.join(outDir, 'focus-sticky-header-1440.png') });
await focusDesktop.locator('.hero').screenshot({ path: path.join(outDir, 'focus-hero-1440.png') });
await focusDesktop.locator('#rabbi').screenshot({ path: path.join(outDir, 'focus-rabbi-press-1440.png') });
await focusDesktop.locator('#teaching').screenshot({ path: path.join(outDir, 'focus-teaching-carousel-1440.png') });
await focusDesktop.locator('#receive').screenshot({ path: path.join(outDir, 'focus-benefits-grid-1440.png') });
await focusDesktop.locator('[data-one-time-canonical-footer]').screenshot({ path: path.join(outDir, 'focus-footer-1440.png') });
await focusDesktop.locator('.bna-bot-launcher').screenshot({ path: path.join(outDir, 'focus-robot-scheller-launcher-1440.png') });
await focusDesktop.close();

const focusMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await focusMobile.goto(baseUrl, { waitUntil: 'networkidle' });
await focusMobile.getByRole('button', { name: 'Open navigation' }).click();
await focusMobile.screenshot({ path: path.join(outDir, 'focus-mobile-menu-390.png'), fullPage: false });
await focusMobile.close();

await browser.close();

const report = {
  generated_at: new Date().toISOString(),
  base_url: baseUrl,
  viewports: results,
  modal_flow: {
    captured_request_count: capturedRequests.length,
    payload_keys: Object.keys(capturedRequests[0] || {}).sort(),
    final_url: modalFinalUrl,
    final_url_params: Object.fromEntries(new URL(modalFinalUrl).searchParams.entries()),
  },
};

fs.writeFileSync(path.join(outDir, 'after-metrics.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Verified ${viewports.length} after screenshots and modal flow in ${outDir}`);
