# BNA Tasks

## Now

- [ ] Test the WhatsApp-first content lane with a real long video upload
- [ ] Complete Google OAuth once and create the live `BNA V2` Drive pipeline folders
- [ ] Wire `/ingest_drive` in Telegram after Drive folder IDs are available in Railway
- [ ] Send parent signup links to cash-paid parents and reconcile their payment-intake records after form submission
- [ ] Build the content parser beyond WhatsApp: transcript -> tasks, accountability, class notes, parent notes, newsletter snippets
- [ ] Add edit/regenerate flow for rejected WhatsApp drafts
- [ ] Add a true publish workflow from Telegram uploads into GHL social posting later
- [ ] Add blog-create flow later, after the WhatsApp lane is reliable
- [ ] Add approval rules and safer target-selection for multi-account publishing
- [x] Wire OpenAI transcription for Telegram audio/video uploads, including long-video audio chunking
- [x] Add Telegram approve/reject buttons for WhatsApp content drafts
- [x] Add local `media-drop/inbox` ingest path for videos too large to send through Telegram
- [x] Add Google OAuth callback/setup endpoints and Drive pipeline folder generator
- [x] Add Hebrew signup form at `/signup-he.html`
- [x] Add repo-side BNA Brand Kit skeleton
- [x] Align app-side AI config to `kimi-k2.6`
- [x] Set up the Telegram -> local Kimi CLI bridge into this repo brain
- [x] Fix the hosted operations login/session flow and redeploy it
- [x] Fix the signup payment flow to `Cash` vs `Credit` and redeploy it
- [x] Remove the broken `mailto:` signup fallback that opened the email app
- [x] Wire Telegram media intake into local storage with GHL upload deferred until publish approval
- [x] Add Telegram commands for `/accounts`, `/blogs`, and `/queue`

## Next

- [ ] Add Shotstack or Creatomate credentials and render adapter for platform-specific video edits
- [ ] Add weekly newsletter builder from approved class recordings and parent-update videos
- [ ] Clean out stale family-accountability docs, prompts, and dead code paths
- [ ] Decide whether the long-term runtime stays Express or moves fully to Next
- [ ] Rebuild the operations dashboard against one canonical API surface
- [ ] Add smoke tests for login, task APIs, signup submit, and GHL sync
- [ ] Configure Green Invoice webhook verification and payment reconciliation
- [ ] Add a bot command to trigger Railway deploys and smoke checks from Telegram

## Blockers

- [ ] Blog posting needs a real blog site configured in GHL first
- [ ] Google posting needs explicit alias selection because multiple Google accounts are connected
- [ ] Voice transcription is still not wired; voice files are saved, not transcribed
- [ ] GHL blog posting needs a configured blog site before blog drafts can publish directly

## Recent Wins

- [x] Found and fixed the GHL auth issue in code by switching to the current HighLevel PIT API
- [x] Found and fixed the broken operations login/session flow in local code
- [x] Confirmed local Kimi CLI is configured for `kimi-k2.6`
- [x] Created a repo-level pending-work convention using `tasks-pending/*.md`
- [x] Local Telegram bot now routes directly to local Kimi CLI on `kimi-k2.6`
- [x] Confirmed the connected GHL social accounts for Facebook, YouTube, and Google
- [x] Confirmed GHL media upload works from local code
- [x] Confirmed GHL social draft creation works from local code
- [x] Added Content tab and database tables for raw uploads, platform drafts, and approval status
- [x] Added shared content pipeline brief at `tasks-pending/2026-05-27-content-repurposing-pipeline.md`

## Read Next

- `tasks-pending/2026-05-26-login-ghl-audit.md`
- `tasks-pending/2026-05-27-content-repurposing-pipeline.md`
- `tasks-pending/2026-05-27-bna-telegram-accountability-audit.md`
- `memory/2026-05-26.md`
