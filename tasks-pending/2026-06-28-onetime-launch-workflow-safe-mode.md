# One Time Launch Workflow Safe Mode - 2026-06-28

Source raw input: `RAW-20260628-005`

Execution run: `ops/execution-runs/2026-06-28-onetime-launch-workflow-safe-mode`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Decisions Captured

- `DEC-20260628-001`: Keep this packet in safe/test mode. External actions that remain blocked until explicit operator/account-owner approval are live Resend send, DNS mutation, Replit/domain cutover, live Stripe billing/checkout/charge, live cancellation/refund workflows, Stripe account ownership changes, and any separate Railway/database provisioning.

## Requirement Register

| ID | Packet ID | Requirement | Owner | Status | Acceptance / Evidence Target | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `REQ-20260628-013` | `REQ-ONETIME-ARCH-001` | Confirm shared BNA backend with strict One Time workspace/project isolation. | Codex | Done | One Time views/APIs/CRM/communications/billing/content stay scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`; no separate Railway/DB blocker for current work. | Deployed Railway `51367168-0156-4099-aa53-0b8be7654124`; live workspace taxonomy, live One Time safe smoke, security watchdog, and communications watchdog passed. |
| `REQ-20260628-014` | `REQ-ONETIME-CONTACTS-002` | Re-inventory Downloads spreadsheets with privacy-safe metadata only. | Codex | Done | Latest Rabbi/One Time spreadsheets from the last 10 days classified; hashes/counts/dates recorded; no raw rows/contacts committed. | `ops/imports/2026-06-28-downloads-spreadsheet-inventory.json`; 204 spreadsheets inventoried, 5 within window, raw rows/headers/private values false. |
| `REQ-20260628-015` | `REQ-ONETIME-CONTACTS-003` | Build/import-ready Rabbi contacts dedupe and tagging flow, no send/external CRM. | Codex | Done | Dry-run report before apply; dedupe by email/phone; tags `active_old_app`, `warm_uncontacted`, `imported_needs_review`, `no_send`, `campaign_candidate_30_day_free`, `one_time_mishnah_class`, `rabbi_sheller_provider`; no BNA merge/leak. | `ops/imports/2026-06-28-one-time-launch-contacts-import.md`; 1,520 contacts after dedupe, all `no_send`, required tag contract present, DB write false, external write false. |
| `REQ-20260628-016` | `REQ-ONETIME-EMAIL-004` | Make One Time Resend sender/domain readiness visible for `info@onetimeonetime.com`, no send/DNS mutation. | Codex | Done | Readiness route/UI checks sender identity, domain, blockers, exact env/DNS handoff when available; send remains blocked. | Live One Time safe smoke verified 8 draft emails, sender `info@onetimeonetime.com`, sends disabled, `external_write_performed=false`; DNS handoff recorded. |
| `REQ-20260628-017` | `REQ-ONETIME-EMAIL-005` | Add Operations-visible One Time email workflow/sequence preview with gated sends. | Codex | Done | Sequence area visible; drafts previewable; filters/statuses present; bulk/test send disabled/gated; no GHL/runtime/external CRM. | Live Operations HTML and email workflow API smoke passed; filters include campaign/no-send tags and bulk/test sends are disabled. |
| `REQ-20260628-018` | `REQ-ONETIME-EMAIL-006` | Draft launch email and weekly/trial sequence copy as preview-only. | Codex | Done | Eight draft-only messages use One Time sender, no BNA branding, no private data, no send. | Live One Time email workflow API returned `draft_count=8`, draft status only, and `email_send_performed=false`. |
| `REQ-20260628-019` | `REQ-ONETIME-STRIPE-007` | Update Stripe/trial policy to 30-day no-card trial, no grace, no tax, no Connect, no refunds. | Codex | Done | Policy/tests/readiness/UI no longer require card upfront; sandbox mocks prove no live charge and later conversion only. | Live Rabbi landing and launch JS smoke passed with no-card trial, Stripe-only conversion, no Green Invoice checkout branch, and Stripe live charge blocked. |
| `REQ-20260628-020` | `REQ-ONETIME-SIGNUP-008` | Verify/signup preview flow: no card, One Time list/trial tags, no auto-send. | Codex | Done | Signup preview creates trial/list state without checkout/live charge/send; duplicate/spreadsheet overlap handled. | Protected live `/api/bna/one-time/trial-signup-preview` smoke passed: 30-day no-card trial, referral captured, no checkout/send/charge/write. |
| `REQ-20260628-021` | `REQ-ONETIME-DNS-009` | Produce DNS/domain handoff for `onetimeonetime.com` without mutation or Replit cutover. | Codex | Done | Handoff separates website/Replit from email DNS; exact DNS records listed only if provider output is available. | `ops/one-time-mishnah/2026-06-28-onetime-email-dns-handoff.md`; live smoke confirmed readiness remains preview-only. No DNS mutation or Replit cutover. |
| `REQ-20260628-022` | `REQ-ONETIME-AUDIT-010` | Audit/fix overlap in contacts/content/tags/workspace routing and spreadsheet classification. | Codex | Done | Obvious scope bugs fixed; findings recorded; no raw contact dump; no GHL runtime. | `ops/one-time-mishnah/2026-06-28-onetime-overlap-audit.md`; live taxonomy/One Time smokes and contact import report passed with no raw contact values. |
| `REQ-20260628-023` | `REQ-ONETIME-BRAND-011` | Use existing One Time brand config only where low-risk for identity/sender context. | Codex | Done | Existing brand config remains canonical; public/email/signup context says One Time, no broad redesign. | Live Rabbi landing smoke and live email workflow smoke passed with One Time identity and no BNA sender fallback. |

## Canonical Agent Task

| ID | Canonical Key | Title | Owner | Lane | Status |
| --- | --- | --- | --- | --- | --- |
| `TASK-20260628-005` | `onetime-launch-workflow-safe-mode` | Execute safe/test-mode One Time launch workflow packet through local/repo proof and blockers. | Codex | Agent Activity | completed |

## Known Blocker / Decision

| ID | Owner | Missing Information / Approval | Recommended Option | Alternatives | Consequence | Exact Next Action |
| --- | --- | --- | --- | --- | --- | --- |
| `DEC-20260628-001` | Shloimie + external account owners | DNS mutation, Replit/domain cutover, live Resend send, live Stripe billing/checkout/charge, live cancellation/refund workflow, Stripe account ownership, and separate Railway/database provisioning approval. | Keep all work in safe/test mode; approve only the exact next external action when ready. | Approve DNS/email only; approve Stripe test account setup only; defer all external actions. | Without approval, Codex can build/readiness-smoke locally but cannot send, charge, mutate DNS, disconnect Replit, or provision separate infrastructure. | Provide the exact approved external action, account owner, target account/domain, confirmation phrase, and rollback expectation. |

## Minimum Verification Queue

Completed locally:

- `npm run inventory:downloads-spreadsheets`
- `npm run app:smoke:one-time-crm-import-dedupe`
- `npm run app:smoke:one-time-crm-contacts-ux`
- `npm run app:smoke:email-resend-ux`
- `npm run one-time:smoke:resend-vimeo-stripe`
- `npm run app:smoke:one-time-trial-referral`
- `npm run app:smoke:one-time-payment-access-class-links`
- `npm run stripe:sandbox-smoke`
- `npm run watchdog:security`
- `npm run watchdog:communications`
- `npm run bna:run:validate`
- `npm run secrets:audit`

Completed deployment/live verification:

- Railway deployment `51367168-0156-4099-aa53-0b8be7654124`
- `npm run app:smoke`
- `npm run app:smoke:public-privacy`
- `npm run app:smoke:operations-workspace-taxonomy`
- `npm run app:smoke:rabbi-onetime-landing`
- `npm run app:smoke:one-time-launch-safe-local -- --base-url https://bneineviimacademy.org --report-dir ops\live-smokes`
- `npm run watchdog:security`
- `npm run watchdog:communications`
- `npm run secrets:audit`

External actions still require a future explicit approval under
`DEC-20260628-001`: live email, DNS, Replit/domain cutover, live Stripe,
Green Invoice, GHL, raw contact data, and secrets.
