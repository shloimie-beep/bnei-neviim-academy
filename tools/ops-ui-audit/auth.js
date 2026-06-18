const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

async function runAuth(config) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeoutMs);
  await page.goto(config.startUrl, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs });
  console.log('');
  console.log('Log in manually in the browser. Return to this terminal and press Enter only after the authenticated Operations shell is visible.');
  console.log('');
  const rl = readline.createInterface({ input, output });
  await rl.question('Press Enter after the authenticated Operations shell is visible...');
  rl.close();
  const verification = await verifyAuthenticated(page, config);
  if (!verification.ok) {
    console.log('Authentication could not be verified, so no storage state was saved.');
    console.log(`Current URL: ${page.url()}`);
    console.log(`Reason: ${verification.reason}`);
    await browser.close();
    process.exitCode = 1;
    return null;
  }
  fs.mkdirSync(path.dirname(config.storageStatePath), { recursive: true });
  await context.storageState({ path: config.storageStatePath });
  console.log(`Saved Operations storage state to: ${config.storageStatePath}`);
  console.log('This file is local-only and covered by .gitignore. Do not share it.');
  await browser.close();
  return config.storageStatePath;
}

async function verifyAuthenticated(page, config) {
  const current = page.url();
  if (/operations-login|login/i.test(new URL(current).pathname)) {
    return { ok: false, reason: 'browser is still on the Operations login page' };
  }
  const shellVisible = await page.locator('.ops-app-shell, .ops-sidebar, [data-current-workspace], text=/BNA Operations/i').first().isVisible({ timeout: 4000 }).catch(() => false);
  if (shellVisible) return { ok: true, reason: 'authenticated Operations shell is visible' };
  const endpoint = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/bna/auth/me', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok, authenticated: data.authenticated === true || data.success === true };
    } catch (err) {
      return { ok: false, error: String(err && err.message || err) };
    }
  }).catch((err) => ({ ok: false, error: String(err && err.message || err) }));
  if (endpoint.ok && endpoint.authenticated) return { ok: true, reason: 'authenticated endpoint returned success' };
  return { ok: false, reason: `Operations shell not visible and auth endpoint did not confirm session (${endpoint.error || endpoint.ok})` };
}

module.exports = {
  runAuth,
  verifyAuthenticated,
};
