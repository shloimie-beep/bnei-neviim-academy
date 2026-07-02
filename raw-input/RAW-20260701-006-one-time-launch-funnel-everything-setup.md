# RAW-20260701-006 - One Time Launch Funnel Everything Setup

Source channel: `codex_chat_attachment`
Captured at: `2026-07-01T17:00:00+03:00`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Source file: `raw-input/RAW-20260701-006-one-time-launch-funnel-everything-setup-source.txt`
Source SHA-256: `468a10a81c829764a738241317a46cf9c4666dd16d9b720346afb012c453bfac`
Parse status: `registered`

## Raw Source

The full pasted source is preserved in:

`raw-input/RAW-20260701-006-one-time-launch-funnel-everything-setup-source.txt`

## Operator Intent

- Build the real One Time / Rabbi Sheller launch funnel end-to-end.
- Campaign traffic goes to `https://onetimeonetime.com/?utm_source=email&utm_medium=launch&utm_campaign=free_mishnayos_class`.
- `/one-time` remains the internal fallback route.
- `/rabbi` is legacy/alias route, not a new parallel funnel.
- New signups get exactly 30 days free from signup by default.
- Public landing pages must not expose raw Zoom links.
- Signup should create/update scoped One Time CRM/contact/member state, grant free access, and send a confirmation email when safe.
- WhatsApp setup follows Whapi/WAPI, not WATI, unless Shloimie creates a future provider-change Decision.
- Vimeo/Drive/OBS pipeline belongs to Rabbi / One Time and must not mix BNA classroom/content records.
- Existing paying users are audited/migrated/grandfathered; do not mass-cancel them.

## Safety Guardrails

- No secrets printed or committed.
- No bulk real campaign send.
- No WhatsApp send.
- No live Stripe payment.
- No existing paid-user cancellation.
- No production hard delete.
- No GHL/LeadConnector runtime.
- No BNA classroom/content/contact data mixed into One Time.
- DNS changes are manual/operator-owned only.

## Parsed Lanes

- Requirements: `REQ-20260701-601` through `REQ-20260701-616`.
- Decisions/blockers:
  - final campaign copy and exact recipient segment;
  - final class/live session details and Zoom/class link;
  - Whapi/WAPI account/token;
  - Vimeo upload token/readiness and Drive folder owner;
  - DNS records for `onetimeonetime.com` if not already pointed at Railway;
  - existing paying-user billing source and migration owner.
- Requirement register: `tasks-pending/2026-07-01-one-time-launch-funnel-everything-setup.md`.
- Execution run: `ops/execution-runs/2026-07-01-one-time-launch-funnel-everything-setup/`.
