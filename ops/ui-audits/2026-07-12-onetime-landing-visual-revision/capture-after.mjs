import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.ONETIME_CAPTURE_BASE_URL || 'http://127.0.0.1:3212';
const outDir = path.resolve('ops/ui-audits/2026-07-12-onetime-landing-visual-revision');
const viewports = [1440, 1024, 768, 430, 390];

function heightFor(width) {
  if (width >= 1200) return 1000;
  if (width >= 768) return 980;
  return 920;
}

async function pageMetrics(page) {
  return page.evaluate(() => {
    const sectionIds = Array.from(document.querySelectorAll('main section[id]')).map((node) => node.id);
    const links = Array.from(document.querySelectorAll('a[href*="signup"]')).map((node) => ({
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
      href: node.getAttribute('href'),
      action: node.getAttribute('data-action-id') || ''
    }));
    const tickerText = (document.querySelector('[data-rosh-hashanah-ticker]')?.textContent || '').replace(/\s+/g, ' ').trim();
    const daysMatch = tickerText.match(/(\d+)\s+DAYS\s+UNTIL\s+ROSH HASHANAH/i);
    const launcher = document.querySelector('.bna-bot-launcher');
    const avatar = document.querySelector('.bna-bot-launcher .bna-bot-avatar');
    const avatarRect = avatar?.getBoundingClientRect();
    const avatarStyle = avatar ? getComputedStyle(avatar) : null;
    const tickerTrack = document.querySelector('.ticker-track');
    const tickerStyle = tickerTrack ? getComputedStyle(tickerTrack) : null;
    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.scrollWidth,
      sectionIds,
      signupLinks: links,
      tickerText,
      roshDays: daysMatch ? Number(daysMatch[1]) : null,
      reducedMotionAnimation: tickerStyle?.animationName || '',
      launcher: launcher ? {
        text: launcher.textContent.replace(/\s+/g, ' ').trim(),
        right: Math.round(window.innerWidth - launcher.getBoundingClientRect().right),
        bottom: Math.round(window.innerHeight - launcher.getBoundingClientRect().bottom),
        width: Math.round(launcher.getBoundingClientRect().width),
        height: Math.round(launcher.getBoundingClientRect().height)
      } : null,
      avatar: avatar ? {
        tagName: avatar.tagName.toLowerCase(),
        src: avatar.getAttribute('src') || '',
        objectFit: avatarStyle?.objectFit || '',
        width: Math.round(avatarRect.width),
        height: Math.round(avatarRect.height),
        naturalWidth: avatar.naturalWidth || 0,
        naturalHeight: avatar.naturalHeight || 0,
        complete: Boolean(avatar.complete)
      } : null
    };
  });
}

async function captureRoute(browser, route, prefix) {
  const results = {};
  for (const width of viewports) {
    const page = await browser.newPage({ viewport: { width, height: heightFor(width) } });
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, `after-${prefix}-${width}.png`), fullPage: true });
    results[width] = await pageMetrics(page);
    await page.close();
  }
  return results;
}

async function captureRobot(browser) {
  const results = {};
  for (const width of [1440, 768, 430, 390]) {
    const page = await browser.newPage({ viewport: { width, height: heightFor(width) } });
    await page.goto(`${baseUrl}/one-time`, { waitUntil: 'networkidle' });
    const launcher = page.locator('.bna-bot-launcher');
    await launcher.waitFor({ timeout: 5000 });
    await launcher.screenshot({ path: path.join(outDir, `robot-closed-${width}.png`) });
    await launcher.click();
    const panel = page.locator('#bnaBotPanel');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    await panel.screenshot({ path: path.join(outDir, `robot-open-${width}.png`) });
    const currentInfoButton = page.getByRole('button', { name: /Current class information/i });
    await currentInfoButton.click();
    await page.getByText(/We are up to Maseches Berachos now/i).waitFor({ timeout: 5000 });
    results[width] = await page.evaluate(() => {
      const panelAvatar = document.querySelector('#bnaBotPanel .bna-bot-avatar');
      const rect = panelAvatar?.getBoundingClientRect();
      const style = panelAvatar ? getComputedStyle(panelAvatar) : null;
      return {
        currentInfoVisible: /We are up to Maseches Berachos now/i.test(document.body.textContent || ''),
        panelAvatar: panelAvatar ? {
          tagName: panelAvatar.tagName.toLowerCase(),
          src: panelAvatar.getAttribute('src') || '',
          objectFit: style?.objectFit || '',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          naturalWidth: panelAvatar.naturalWidth || 0,
          naturalHeight: panelAvatar.naturalHeight || 0,
          complete: Boolean(panelAvatar.complete)
        } : null
      };
    });
    await page.close();
  }
  return results;
}

async function captureSignupSubmit(browser) {
  const context = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 430, height: 920 } });
  const page = await context.newPage();
  let payload = null;
  await page.route('**/api/one-time/interest', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        lead: { id: 123, crm_lead_id: 456 },
        crm_lead_id: 456,
        external_write_performed: false,
        no_checkout: true,
        no_access_granted: true
      })
    });
  });
  await page.goto(`${baseUrl}/one-time/signup`, { waitUntil: 'networkidle' });
  await page.fill('input[name="contact_name"]', 'Leah Cohen');
  await page.selectOption('select[name="signup_as"]', 'Family');
  await page.fill('input[name="city_label"]', 'Buenos Aires');
  await page.fill('input[name="email"]', 'leah@example.invalid');
  await page.check('input[name="reminder_preference"][value="email"]');
  await page.check('input[name="signup_acknowledgement"]');
  await page.click('button[data-action-id="ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT"]');
  await page.waitForSelector('[data-success-panel].active', { timeout: 5000 });
  await page.screenshot({ path: path.join(outDir, 'after-signup-success-430.png'), fullPage: true });
  const successState = await page.evaluate(() => ({
    successText: document.querySelector('[data-success-panel]')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    storedLead: JSON.parse(window.sessionStorage.getItem('oneTimeSignupLead') || '{}')
  }));
  await context.close();
  return { payload, successState };
}

async function captureReducedMotion(browser) {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 920 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/one-time`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'reduced-motion-landing-390.png'), fullPage: true });
  const metrics = await pageMetrics(page);
  await context.close();
  return metrics;
}

const browser = await chromium.launch();
try {
  const landing = await captureRoute(browser, '/one-time', 'landing');
  const signup = await captureRoute(browser, '/one-time/signup', 'signup');
  const robot = await captureRobot(browser);
  const signupSubmit = await captureSignupSubmit(browser);
  const reducedMotion = await captureReducedMotion(browser);
  const report = {
    generated_at: new Date().toISOString(),
    baseUrl,
    landing,
    signup,
    robot,
    signupSubmit,
    reducedMotion,
    expectedRoshDaysOn20260712: 61,
    noMergeOrDeployPerformed: true
  };
  await fs.writeFile(path.join(outDir, 'after-metrics.json'), `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await browser.close();
}
