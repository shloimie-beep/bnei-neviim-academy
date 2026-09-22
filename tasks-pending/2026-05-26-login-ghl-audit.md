# Pending Work: Login, GHL, and System Audit

## Read This First

This is the current implementation brief for the next Kimi coding session in
the BNA repo.

## What Was Already Fixed Locally

### Operations Login

- The login flow was broken because the login page wrote a `sessionId` to
  `localStorage`, but `/operations` only trusted a Basic Auth header on the
  page request.
- The dashboard JS also tried to generate Basic Auth in the browser instead of
  using one server-side auth path.
- Local fix already applied:
  - `server.js` now issues and validates a `bna_ops_session` cookie
  - `/api/operations/login` sets the cookie
  - `/api/operations/logout` clears it
  - `/operations` now uses the same auth middleware as API routes
  - `public/operations.html` now uses same-origin credentials instead of
    browser-built Basic Auth

### GHL Integration

- The PIT token is valid.
- The old code was using the wrong API generation:
  - old: `https://rest.gohighlevel.com/v1`
  - current: `https://services.leadconnectorhq.com`
- Local fix already applied:
  - switched to current LeadConnector API
  - added `Version: 2021-07-28`
  - replaced dead `contacts/lookup` logic with current contact search
  - switched custom fields to `/locations/:locationId/customFields`
  - normalized `GHL_PIT_TOKEN` parsing so env-block pastes do not break auth

## What Still Needs To Happen

1. Redeploy Railway so the fixed login/session code is live.
2. Fix the `signups` table mismatch:
   - app code expects payment + GHL columns
   - live DB still has the older signup shape
   - this currently breaks `/api/submit` and `/api/pending-payments`
3. Re-test:
   - login page
   - dashboard task API
   - signup submit
   - GHL sync
4. Clean stale docs/config that still imply this repo is the old family app.

## Highest-Value Next Actions

- Start by inspecting `server.js`, `public/operations-login.html`,
  `public/operations.html`, and `TASKS.md`
- Confirm the hosted environment has:
  - `OPS_USERNAME`
  - `OPS_PASSWORD`
  - `DATABASE_URL`
  - `GHL_PIT_TOKEN`
  - `GHL_LOCATION_ID`
- Create or apply a real SQL migration for the `signups` table instead of
  relying on `CREATE TABLE IF NOT EXISTS`
- Re-run smoke tests after deploy

## Related Files

- `TASKS.md`
- `memory/2026-05-26.md`
- `AGENTS.md`
- `MEMORY.md`
