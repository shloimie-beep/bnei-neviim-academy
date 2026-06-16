import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(repoRoot, 'screenshots');
const requestedPort = Number(process.env.INT05_SMOKE_PORT || 0);
let activePort = requestedPort;

const cards = [
  ['keyholder', 'Keyholder / Secrets', true, 'configured', 'env_keyholder_secrets', [], ['print_secret', 'commit_secret']],
  ['google_drive', 'Google Drive', false, 'not_configured', 'oauth_refresh_token', ['Google OAuth client is not configured.'], ['drive_write_without_google_approval']],
  ['telegram', 'Telegram Bridge', false, 'not_configured', 'bridge_polling_primary', ['Allowed Telegram chat IDs are not configured.'], ['token_print', 'chat_id_print']],
  ['gmail_payment_reminders', 'Gmail / Payment Reminders', true, 'configured', 'manual_preview_default', ['Scheduled live payment reminders are disabled by default.'], ['default_live_scheduler']],
  ['resend', 'Resend', false, 'not_configured', 'draft_preview_only', ['Exact Resend DNS records must be copied from the dashboard before production send.'], ['send_without_verified_domain']],
  ['stripe', 'Stripe', true, 'configured_test_mode', 'test', ['Stripe account ownership must be documented before checkout or live billing.'], ['live_billing']],
  ['green_invoice', 'Green Invoice', true, 'configured_but_insufficient_scope', 'webhook_intake', ['Exact Green Invoice webhook signature verification still needs confirmation/configuration.'], ['signature_assumption']],
  ['buffer', 'Buffer', false, 'not_configured', 'draft_and_schedule_gate', ['Buffer key is not configured.'], ['publish_now']],
  ['wapi', 'WAPI / WhatsApp', false, 'needs_api_key', 'provider_owned_readiness', ['Provider-owned WAPI/WhatsApp API key or instance credentials are not configured for this workspace.'], ['send_without_confirm']],
  ['godaddy_dns', 'GoDaddy / DNS', false, 'blocked_until_thursday', 'owner_access_required', ['GoDaddy Delegate Access/DNS is blocked until Thursday owner access/2FA is repaired.'], ['dns_write']],
  ['provider_scoped_integrations', 'Provider-Owned Integration Records', true, 'ready_for_test', 'workspace_provider_scoped', [], ['raw_secret_return']],
  ['zoom', 'Zoom', false, 'not_configured', 'server_to_server_oauth', ['Zoom account owner/admin must be documented before meeting creation.'], ['meeting_create', 'account_grant']],
  ['video_hosting', 'Vimeo / Video Hosting', false, 'manual_upload_required', 'vimeo', ['Vimeo access token is not configured server-side.'], ['provider_upload']],
  ['ghl_social', 'GHL Social / Legacy CRM', false, 'not_configured', 'archived_by_policy', ['Active BNA policy says GHL is not an active runtime.'], ['new_ghl_runtime']],
  ['external_action_gates', 'External-Action Gates', true, 'configured', 'preview_first', ['Live scheduler remains off unless explicitly enabled.'], ['send_without_confirm', 'bill_without_confirm', 'publish_without_confirm']],
].map(([provider, label, configured, status, mode, blockers, blockedActions]) => ({
  provider,
  label,
  configured,
  status,
  mode,
  accountOwner: provider === 'keyholder' ? 'operator' : 'unknown',
  safeActions: ['readiness_check', 'preview'],
  blockedActions,
  blockers,
  lastCheckedAt: new Date().toISOString(),
}));

function json(res, body) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function serveStatic(res, relativePath) {
  const filePath = path.join(repoRoot, 'public', relativePath.replace(/^\/+/, ''));
  if (!filePath.startsWith(path.join(repoRoot, 'public')) || !fs.existsSync(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'text/plain',
  });
  res.end(fs.readFileSync(filePath));
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
  if (url.pathname === '/operations') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(repoRoot, 'public', 'operations.html')));
    return;
  }
  if (url.pathname === '/api/bna/auth/me') {
    return json(res, {
      authenticated: true,
      username: 'smoke',
      role: 'platform_admin',
      allowedViews: ['dashboard', 'integrations', 'settings', 'admin'],
      workspace: 'platform',
    });
  }
  if (url.pathname === '/api/bna/workspace-directory') return json(res, { workspaces: [], review_items: [] });
  if (url.pathname === '/api/bna/workspace-platform') return json(res, { workspaces: [], connector_settings: [], bot_actions: [], bot_action_logs: [] });
  if (url.pathname.startsWith('/api/bna/workspace-settings/') && url.pathname.endsWith('/branding')) return json(res, { workspace_key: 'platform', display_name: 'BNA Operations' });
  if (url.pathname === '/api/bna/integrations/status') return json(res, { success: true, generated_at: new Date().toISOString(), preview_first: true, external_write_performed: false, cards });
  if (url.pathname.startsWith('/api/bna/')) return json(res, {});
  if (serveStatic(res, url.pathname)) return;
  res.writeHead(404);
  res.end('not found');
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(requestedPort, '127.0.0.1', resolve);
});
activePort = server.address().port;
fs.mkdirSync(screenshotsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(`http://127.0.0.1:${activePort}/operations?view=integrations&section=readiness`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-integrations-readiness]', { timeout: 10000 });
  await page.screenshot({ path: path.join(screenshotsDir, 'int-05-integrations-desktop.png'), fullPage: true });
  const actionGateCard = page.locator('[data-integrations-readiness] article', { hasText: 'External-Action Gates' }).first();
  await actionGateCard.screenshot({ path: path.join(screenshotsDir, 'int-05-action-gate-preview.png') });

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(`http://127.0.0.1:${activePort}/operations?view=integrations&section=readiness`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-integrations-readiness]', { timeout: 10000 });
  await page.screenshot({ path: path.join(screenshotsDir, 'int-05-integrations-mobile.png'), fullPage: true });

  const result = await page.evaluate(() => ({
    heading: document.querySelector('[data-integrations-readiness] h3')?.textContent || '',
    cardCount: document.querySelectorAll('[data-integrations-readiness] article').length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  if (errors.length) throw new Error(`Browser console errors: ${errors.join('; ')}`);
  if (result.heading !== 'Integration Readiness') throw new Error(`Unexpected heading: ${result.heading}`);
  if (result.cardCount < 15) throw new Error(`Expected at least 15 readiness cards, got ${result.cardCount}`);
  if (result.horizontalOverflow) throw new Error('Mobile readiness view has horizontal overflow');
  console.log(JSON.stringify({
    success: true,
    desktop: 'screenshots/int-05-integrations-desktop.png',
    mobile: 'screenshots/int-05-integrations-mobile.png',
    actionGate: 'screenshots/int-05-action-gate-preview.png',
    ...result,
  }, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
