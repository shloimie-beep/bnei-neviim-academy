# One Time Launch Unblocker Readiness - 2026-07-02

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Summary

Safe local work continued even though `npm run bna:run:next` reported no
unblocked executable batch. Requirements `REQ-20260701-705`, `706`, `707`,
`709`, and the local portion of `717` are now evidence-backed locally.

No live campaign send, live payment, DNS mutation, provider mutation, real
WhatsApp send, hard delete, GHL/LeadConnector runtime, or privacy-sensitive
export was performed.

## Commands And Results

- PASS `npm run pqc:all`
- PASS `npm run bna:run:status`
- PASS `npm run bna:run:next` with no unblocked executable batch before this
  readiness update.
- PASS `npm run app:smoke:one-time-trial-referral`
- PASS `npm run app:smoke:one-time-payment-access-class-links`
- PASS `node --test tests/one-time-local-beta-product-contract.test.js tests/one-time-stripe-local-beta.test.js tests/one-time-class-course-ingestion.test.js tests/one-time-announcements-first-community.test.js tests/one-time-progress-rewards-local-beta.test.js`
- PASS `node --test tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-product-system.test.js tests/one-time-external-user-portal.test.js tests/one-time-role-auth-model.test.js`
- PASS `npm run app:smoke:one-time-launch-safe-local`
- PASS `node --test tests/one-time-drive-dropoff-email-watch.test.js tests/one-time-media-local-pipeline.test.js tests/provider-api-usage-readiness.test.js tests/one-time-launch-readiness.test.js`
- PASS `node --test tests/one-time-resend-local-outbox.test.js tests/assistant-campaign-control-contract.test.js tests/communications-integrations-contract.test.js tests/resend-client.test.js tests/resend-inbound-crm.test.js tests/resend-inbound-webhook.test.js`
- EXPECTED BLOCKED `npm run one-time:railway-target:guard`
- PASS no-write `npm run one-time:railway-provision:check -- --write-report`
- PASS no-write `npm run one-time:db:bootstrap`
- PASS `npm run railway:doctor` for current BNA production service
- PASS `npm run bna:run:blockers`
- PASS `npm run bna:run:source-coverage`
- PASS `npm run bna:run:stale-evidence`
- PASS `npm run bna:run:validate`
- PASS `npm run bna:run:status`
- PASS `npm run bna:run:next` with no unblocked executable batch remaining.
- EXPECTED BLOCKED `npm run one-time:setup:check` with 0/8 external setup
  areas ready and no external writes or secret values printed.
- PASS `npm run secrets:audit`
- PASS `git diff --check` with line-ending warnings only.

Final active-run validation after requirement/status updates:

- PASS `npm run bna:run:validate`
- PASS `npm run bna:run:status`
- PASS `npm run bna:run:source-coverage` with 31 source statements and 0
  unmapped executable statements.
- PASS `npm run bna:run:stale-evidence`

## Requirement Evidence

### REQ-20260701-705

Local proof confirms no-card 30-day signup/trial behavior, referral capture, no
checkout creation, no live charge, no external write, and scoped One Time access
contracts. Final launch status still requires deployment/live smoke against the
selected One Time service/database.

### REQ-20260701-706

Local proof confirms member/admin workspace, private-question/community
contracts, class/course/video references, role-scoped portals, and parent/student
scope contracts. Final live content/session proof still depends on the selected
service and final Zoom/session details.

### REQ-20260701-707

Local proof confirms attendance/progress/media pipeline contracts and class-link
access smoke behavior without manual attendance or external writes. Final launch
status still requires deployed/live smoke.

### REQ-20260701-709

Local proof confirms draft-only email workflow/outbox, suppression/consent
policy, and campaign controls. Real seed/campaign send remains blocked until the
final live join link, exact recipient segment/list, suppression proof, final
copy, and an explicit campaign packet exist.

### REQ-20260701-717

Local validation is partially complete. Deploy/live smoke remains blocked until
separate Railway service, separate database, and `join.onetimeonetime.com`
custom-domain/DNS setup are ready.

## Infrastructure Blocker

`npm run one-time:railway-target:guard` reports:

- missing explicit One Time Railway service target;
- missing `PUBLIC_SITE_MODE=one_time`;
- missing `DEFAULT_WORKSPACE_KEY=rabbi_sheller_provider`;
- missing `DEFAULT_PROJECT_KEY=one_time_mishnah_class`;
- missing `ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com`.

`npm run one-time:db:bootstrap` reports separate One Time DB URL missing.

## Operator Checklist

Detailed checklist:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json`

Post-setup deploy/live-smoke packet:

- `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`
- `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/manifest.json`

1. Confirm/create exact separate Railway project/service/environment labels for
   One Time.
2. Confirm/create separate One Time database alias for keyholder/Railway.
3. Set the four required One Time service env values listed above.
4. Configure `join.onetimeonetime.com` only; do not touch apex/root.
5. Provide Zoom session details, Vimeo token alias/path, Rabbi Stripe test
   alias/product price, and Whapi/WAPI provider details through keyholder/private
   setup channels.
