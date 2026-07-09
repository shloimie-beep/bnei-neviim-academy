# RAW-20260709-011 - One Time parallel frontend audit, static chrome, landing reframe, Agent Mode prompts

Source channel: codex_chat attachment plus GitHub issue #128
Source file: `C:\Users\User\.codex\attachments\a8bfe37b-f416-4bc1-9749-8bd79972df38\pasted-text.txt`
GitHub issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/128
Captured at: 2026-07-09
Workspace: `rabbi_sheller_provider`
Project: `one_time_mishnah_class`
Privacy classification: product/audit instructions, no secrets preserved here

## Raw intake

Goal mode, but PARALLEL-SAFE AUDIT MODE FIRST.

Pick up GitHub issue #128 for the One Time front-end "million-dollar app"
audit, static chrome, landing reframe, and Agent Mode prompt generation.

Important: another Codex agent may currently be deploying or editing
app-visible One Time work. Do not create file conflicts. Before implementation,
run a control-tower/dirty-worktree/current-branch check. If another active
agent is touching the same files, do not edit those files. Produce audit
evidence, prompts, and implementation packets only.

Latest owner decisions:

1. Countdown: use Israel time, timezone `Asia/Jerusalem`. The countdown is to
   Rosh Hashanah / the new year, not a generic 30-day countdown. Use
   `/api/one-time/campaign` or config/env deadline, not a hardcoded UI guess.
   For 2026, configure the campaign deadline to Erev Rosh Hashanah in Israel
   time around sundown/launch cutoff unless a later owner correction changes
   it.
2. Price: after the free period, the price is `$67`. This is approved as
   copy/config only. Do not enable Stripe, checkout, subscriptions, payment
   links, charges, refunds, or access automation in this packet.
3. Signup behavior: when a family signs up, they go into the One Time
   CRM/tracking flow. They should get a link for now. Keep this as first-party
   CRM/manual follow-up unless a later packet explicitly approves automated
   email/WhatsApp/Zoom sends. Preserve `/api/one-time/interest`.
4. Rabbi dashboard: Rabbi Scheller's dashboard must be a scoped Operations
   layout, not a simplified provider portal. It should mirror Shloimie's
   Operations IA pattern: left workspace sidebar, compact top command rail,
   categories/subcategories/tabs/filters, aligned action buttons, CRM
   tracking, content pipeline, communications, and scoped payments/status
   visibility where allowed. It must only show `rabbi_sheller_provider` /
   `one_time_mishnah_class` data. No random BNA data. No Super Admin data. No
   unrelated provider records. No unrelated students. No diagnostic admin
   leakage.

First phase: audit and screenshots only.

Run or extend Playwright audit so it captures full-page screenshots,
first-viewport screenshots, header/topbar crops, footer crops, mobile
screenshots, DOM/ARIA snapshots where possible, and measurements for overflow,
clipped text, first-content y, topbar height, active nav styling, tap-target
size, logo size, and duplicate nav/filter rows.

Routes:

- `/one-time`
- `/one-time/mishnayos`
- `/rabbi-member`
- `/member-library`
- `/one-time-classroom`
- `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
- `/provider.html?review=one-time`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview` if Operations auth is available
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi` if Operations auth is available

Viewports:

- 1440 desktop
- 1024 desktop/tablet
- 768 tablet
- 430 mobile
- 390 mobile

Evidence storage:

- `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/screenshots/`
- `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/report.md`
- `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/report.json`
- `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/manifest.json`

Drive mirror rule: if an approved Drive audit-upload utility and credentials
are already available, mirror the finished audit package to the approved Drive
folder. If not, do not block the audit. Record: "Drive mirror unavailable;
repo evidence saved." Never upload screenshots containing secrets, Stripe
keys, Railway variables, tokens, webhooks, private student data, private
family data, or admin credentials.

Designer audit language: write the report as a senior front-end designer
briefing Codex. Use specific UI directions in normal language.

Quality bar: black/yellow One Time brand, no BNA bleed, one canonical
header/footer system, premium spacing rhythm, large clean logo, active yellow
nav with black text, inactive dark/cream/yellow nav, compact top bars, no
wasted first viewport, left-sidebar/top-command-rail hierarchy for Rabbi
scoped Operations, consistent cards/buttons/forms/filters, no squeezed right
cards, no mobile overflow, 44px tap targets, intentional proof strip, helper
does not block CTA/form, and public form does not promise portal/payment/access
/Zoom if not live.

Create or update Agent Mode prompt files:

- `public/agent-review-prompts/one-time-public-landing-million-dollar-audit.md`
- `public/agent-review-prompts/one-time-static-chrome-consistency-audit.md`
- `public/agent-review-prompts/one-time-member-classroom-consistency-audit.md`
- `public/agent-review-prompts/one-time-provider-operations-layout-parity-audit.md`
- `public/agent-review-prompts/one-time-mobile-responsive-audit.md`
- `public/agent-review-prompts/one-time-brand-asset-proof-strip-audit.md`
- `public/agent-review-prompts/one-time-helper-overlay-conversion-audit.md`
- `public/agent-review-prompts/one-time-final-visual-regression-pass.md`

Each prompt must include exact routes, viewport sizes, screenshot requirements,
visual defect checklist, forbidden external actions, exact output format,
pass/fail/blocked rules, and instructions to submit/seal results without
asking the operator if enough evidence exists.

Do not implement broad UI fixes until:

1. control tower confirms no collision with current deploy agent;
2. screenshots are captured;
3. findings are split into small implementation packets.

If no collision exists, implement first safe packet only: static One Time
chrome with canonical header/footer, larger logo, active yellow nav,
public/member/classroom consistency, mobile-safe nav, and no BNA brand bleed.

If collision exists, stop before editing shared app files and return with
screenshot report, exact defects, exact likely files, patch plan, and "blocked
by active deploy lane" status for implementation.

Hard constraints: no live email, WhatsApp/WAPI, Telegram, SMS, campaign sends,
password handoffs, Stripe/payment/checkout/subscription/charge/refund/access
grant, DNS, Resend, Railway, Stripe, Zoom, Vimeo, Drive, external-provider
mutation, private-data display, GHL/LeadConnector runtime behavior, or copying
secret/key/token/account-ID data into files, logs, prompts, reports, or
commits.

## GitHub issue #128 readback

Issue #128 is open as of 2026-07-09. It includes the same ChatGPT drop-off
scope, plus two follow-up comments by `sdratler` clarifying the Rosh Hashanah
Israel-time countdown, `$67` price after the free period, signup into the
first-party One Time CRM/tracking flow, scoped Operations-style Rabbi
dashboard, and the parallel-safe audit-first lane.
