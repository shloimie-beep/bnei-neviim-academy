# BNA Tasks

## Now

- [ ] Redeploy Railway so the fixed operations login/session flow goes live
- [ ] Apply the signup schema migration so `/api/submit` and billing endpoints stop failing
- [ ] Re-test end-to-end signup -> DB -> GHL sync after the schema fix
- [x] Align app-side AI config to `kimi-k2.6`
- [x] Set up the Telegram -> local Kimi CLI bridge into this repo brain

## Next

- [ ] Clean out stale family-accountability docs, prompts, and dead code paths
- [ ] Decide whether the long-term runtime stays Express or moves fully to Next
- [ ] Rebuild the operations dashboard against one canonical API surface
- [ ] Add smoke tests for login, task APIs, signup submit, and GHL sync
- [ ] Configure Green Invoice webhook verification and payment reconciliation

## Blockers

- [ ] Railway has to be redeployed before the login fix is live on the hosted app
- [ ] Signup flow still depends on a mismatched `signups` table schema
- [ ] Voice/photo intake is still not wired in the local Telegram -> Kimi bridge

## Recent Wins

- [x] Found and fixed the GHL auth issue in code by switching to the current HighLevel PIT API
- [x] Found and fixed the broken operations login/session flow in local code
- [x] Confirmed local Kimi CLI is configured for `kimi-k2.6`
- [x] Created a repo-level pending-work convention using `tasks-pending/*.md`
- [x] Local Telegram bot now routes directly to local Kimi CLI on `kimi-k2.6`

## Read Next

- `tasks-pending/2026-05-26-login-ghl-audit.md`
- `memory/2026-05-26.md`
