# One Time Operator External Setup Checklist - Current

Last reconciled: 2026-07-09T18:12:00+03:00

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

Purpose: clear the remaining external blockers for the full One Time launch
without exposing secrets or authorizing forbidden live actions.

Do not paste secrets into chat, tracked files, screenshots, task titles, or
logs. Use the BNA keyholder or provider dashboards for secret values. Repo
evidence may record only aliases, fingerprints, configured booleans, and
redacted readback.

## Current Launch Status

Immediate launch lane is live:

- `https://join.onetimeonetime.com` is live and scoped to One Time.
- Public lead capture/free-class follow-up is deployed and live-smoked.
- The live interest dry-run proves One Time project/program/CRM/internal-note
  mapping without creating a real lead/contact/reminder.
- Portal/payment/WAPI/campaign automations remain intentionally blocked until
  the external setup items below are supplied and verified.

Full setup readiness is currently 5/8:

- Ready: Railway target, separate DB reference, join domain, hosted class link,
  Vimeo/Drive media setup.
- Blocked: Rabbi Stripe sandbox/price alias, Whapi/WAPI instance and phone,
  campaign copy/list/suppression/seed approval.

Current evidence:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`
- `tasks-pending/2026-07-09-production-readiness-goal.md`

`npm run bna:run:next` reports no unblocked active-run batch. The next Codex
batch starts after one of the external setup items below is complete, or after
the separate active UI lane clears.

## Completed / Not Current Human Blockers

These items must not be re-opened by future agents unless fresh readback
contradicts the current evidence:

- Separate One Time Railway target: ready.
- Separate One Time database reference: ready by Railway service-reference
  readback.
- `join.onetimeonetime.com` domain: ready.
- Hosted Zoom/free-class/class link: present by redacted OneTime Railway
  readback; do not write the raw link to tracked files.
- Vimeo/Drive media setup: ready enough for launch-readiness; private upload
  testing remains a later explicitly approved provider action.

## Priority 1 - Rabbi Stripe Sandbox / Price Alias

Clears: `REQ-20260701-714` and the payment/access part of
`REQ-20260702-108`.

Provide or confirm:

- Rabbi Stripe test secret key alias/path, or explicit confirmation that only a
  live key exists and sandbox smoke is not yet possible.
- Publishable key alias/path if checkout-page smoke needs it.
- Webhook secret alias/path if webhook smoke is in scope.
- `$67/month` One Time membership product/price ID or non-secret alias.
- Permission to create sandbox-only equivalents if no test product exists.
- Confirmation that sandbox/test-mode only is authorized.

Forbidden:

- Do not use real card details.
- Do not run live payments.
- Do not create live checkout links.
- Do not invent refund, legal, tax, or access policy copy.

Codex verification after setup:

- `npm run one-time:setup:check`
- sandbox checkout/subscription/access smoke only if a test key and test price
  are configured;
- webhook/readback smoke only if configured;
- reversible TEST-prefixed access proof only.

## Priority 2 - Whapi/WAPI Provider Details

Clears the WAPI/WhatsApp part of `REQ-20260702-108`. Real sends are still
blocked until a later exact approval packet exists.

Current WAPI readiness:

- Outbound token is configured and OneTime-scoped.
- Class link is configured.
- Provider setup is not ready because instance ID and sender phone metadata are
  missing.
- Auto-reply is not ready because the enable and approval flags are missing.

Provide or confirm:

- Rabbi/One Time Whapi/WAPI provider account.
- Whapi/WAPI instance ID or alias.
- WhatsApp sender phone number metadata.
- Webhook URL/status, if webhook validation is in scope.
- Safe test recipient, if a later packet should test send.
- `ONE_TIME_WAPI_AUTO_REPLY_ENABLED=true`, only when auto-reply is actually
  intended.
- `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM=APPROVE_ONE_TIME_WAPI_AUTO_REPLY`, only
  after the reply copy, recipient scope, sender, and class-link behavior are
  explicitly approved.

Forbidden:

- No WhatsApp broadcast.
- No send to imported leads or contacts.
- No raw phonebook/contact export in tracked files.
- No GHL/LeadConnector runtime.
- No secret/token exposure.
- No cross-workspace contact merge.

Codex verification after setup:

- `npm run one-time:wapi:readiness`
- `npm run one-time:setup:check`
- no-send WAPI scope/readiness tests.

## Priority 3 - Campaign Seed / Real Campaign

Clears: `REQ-20260701-709`, `REQ-20260701-710`, and the campaign part of
`REQ-20260702-108`.

Provide:

- Final campaign copy.
- Exact recipient segment/list source.
- Suppression/unsubscribe proof.
- Final join/member links to use.
- Seed recipient: `sdratler@gmail.com`.
- Explicit seed packet approval.
- Separate explicit real-send command later, if the seed passes.

Forbidden:

- No real campaign send from this checklist.
- No real send without exact recipient source, copy, sender, suppression proof,
  and approval.
- No external CRM/GHL runtime.

Codex verification after setup:

- campaign preview/seed packet validation;
- seed-only send only after exact approval;
- separate real-send approval gate after seed proof.

## Next Codex Run After Setup

Run:

1. `npm run bna:run:next`
2. `npm run one-time:setup:check`
3. `npm run one-time:wapi:readiness`
4. relevant sandbox/no-send/seed-only smoke for the setup item that changed
5. deploy/live smoke only if app-visible or server-visible code/config changed

If a setup item is still missing, Codex should update this checklist with the
exact missing field and continue any independent no-write verification.

External write authorized by this checklist: false.
