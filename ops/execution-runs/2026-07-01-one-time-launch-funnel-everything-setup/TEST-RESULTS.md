# Test Results

Preflight:

- PASS `npm run bna:run:status` on previous active run: 23 done / 5 blocked.
- PASS `npm run bna:run:next` on previous active run: no unblocked executable
  batch.
- FAIL `npm run pqc:all`: `watchdog:protocol-drift` found 5 findings in
  `tasks-pending/2026-07-01-onetime-resend-secret-send-readiness.md`.

Protocol cleanup:

- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:next`.
- PASS `npm run watchdog:protocol-drift` after Resend handoff repair.
- PASS `npm run pqc:trace:validate` after Resend trace repair.
- PASS `npm run pqc:all`.

This run will rerun focused validators after route changes.

Canonical domain route batch:

- PASS `node --check server.js`.
- PASS `node --test tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-local-hardening-audit.test.js tests/watchdog-route-security.test.js`.
- PASS `npm run watchdog:security`.
- PASS `npm run railway:doctor`: deployment `0ae3cb12-7f4f-4ae7-9bd9-7dd8f5a78be4` reached `SUCCESS`.
- PASS live BNA root still serves the BNA homepage.
- BLOCKED live `onetimeonetime.com` root: apex served by `Google Frontend`
  with legacy Rabbi preview content, not Railway focused landing.
- BLOCKED live `www.onetimeonetime.com` root: DNS `ENOTFOUND`.
- BLOCKED 2026-07-01T19:26+03:00 read-only resmoke confirmed the same
  external routing state: apex still served `Google Frontend` legacy content,
  `www` still failed to fetch, and BNA root still served Railway.

Buffer/social setup batch:

- PASS `node --check server.js`.
- PASS `node --test tests/communications-integrations-contract.test.js tests/watchdog-action-registry.test.js`.
- PASS `npm run watchdog:actions`.
- PASS `node scripts/generate-one-time-action-coverage.mjs`.
- PASS `node scripts/generate-universal-action-parity.mjs`.
- PASS `npm run railway:doctor`: deployment `b75c6cec-31ea-4b23-8308-71606a3175ba` reached `SUCCESS`.
- PASS live Operations HTML smoke includes `ACTION-BUFFER-SCHEDULE-CONFIRM`
  and One Time disabled-state copy without secret placeholders.

Vimeo/Drive/OBS media pipeline batch:

- PASS keyholder filename scan found only `vimeo-client-id.txt` and
  `vimeo-client-secret.txt` among Vimeo-named files.
- PASS redacted fingerprint readback for the exact Vimeo client ID and client
  secret files, with no secret value printed.
- PASS `node --test tests/one-time-media-local-pipeline.test.js`.
- BLOCKED Vimeo API auth/upload readiness: `VIMEO_ACCESS_TOKEN` was not found
  in the Vimeo-named keyholder filename scan.

Landing/signup batch:

- PASS current-state desktop/mobile Playwright audit captured the old page and
  identified missing 30-day free trial copy.
- PASS Definition of Ready created before editing.
- PASS `node --check server.js`.
- PASS `node --test tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-launch-readiness.test.js`.
- PASS `npm run watchdog:actions`.
- PASS `npm run watchdog:security`.
- PASS regenerated `ops/action-registry/one-time-action-coverage.json`.
- PASS regenerated `ops/action-registry/universal-action-parity.json`.

Paying-users migration audit batch:

- PASS read-only aggregate DB audit wrote
  `ops/one-time-mishnah/funnel/2026-07-01-paying-users-migration-audit.md`
  and `.json`.
- PASS redaction scan found no raw names, emails, phones, customer IDs,
  payment links, invoice URLs, or raw payment rows in the audit artifacts.
- PASS `node --test tests/rabbi-checkout-access.test.js tests/one-time-stripe-local-beta.test.js tests/integrations/w4-onetime-readiness.test.js tests/int05-integrations-closeout.test.js`.
- PASS `node scripts/smoke-one-time-payment-access-class-links.mjs` with
  `external_write_performed=false`.
- PASS `node --test tests/watchdog-action-registry.test.js tests/watchdog-route-security.test.js`.
- PASS post-implementation desktop/mobile Playwright audit found 30-day free
  copy, no payment links, and no direct Zoom links.
- PASS `npm run railway:doctor`: deployment
  `dfc18e8e-d533-4841-a266-4adb36fe5fc7` reached `SUCCESS`.
- PASS live BNA fallback `/one-time` smoke serves the new 30-day free/no-card
  signup copy without payment links or direct Zoom links.
- BLOCKED live campaign domain proof remains under `REQ-20260701-601`:
  `onetimeonetime.com` still serves legacy/non-Railway content and
  `www.onetimeonetime.com` still fails to resolve or reach the app.

Scoped lead/contact tracking batch:

- PASS `node --check server.js`.
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/one-time-launch-readiness.test.js`.
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/one-time-launch-readiness.test.js tests/resend-inbound-crm.test.js tests/communications-integrations-contract.test.js tests/watchdog-route-security.test.js tests/watchdog-action-registry.test.js`.
- PASS `npm run watchdog:security`.
- PASS `npm run watchdog:actions`.
- PASS regenerated `ops/action-registry/one-time-action-coverage.json`.
- PASS regenerated `ops/action-registry/universal-action-parity.json`.
- PASS `npm run railway:doctor`: deployment
  `4fae9506-f07c-4d49-b01a-f200d392ce27` reached `SUCCESS`.
- PASS live BNA fallback synthetic duplicate signup smoke created then deduped
  scoped local records and returned `no_send`, `no_checkout`,
  `no_access_granted`, and `external_write_performed=false`.

30-day free access grant batch:

- PASS `node --check server.js`.
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-launch-readiness.test.js`.
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-launch-readiness.test.js tests/resend-inbound-crm.test.js tests/communications-integrations-contract.test.js tests/watchdog-route-security.test.js tests/watchdog-action-registry.test.js`.
- PASS `npm run watchdog:security`.
- PASS `npm run watchdog:actions`.
- PASS regenerated `ops/action-registry/one-time-action-coverage.json`.
- PASS regenerated `ops/action-registry/universal-action-parity.json`.
- PASS `npm run railway:doctor`: deployment
  `5661544b-b960-48a4-8ef5-41489815e5b1` reached `SUCCESS`.
- PASS live BNA fallback synthetic duplicate access smoke kept product/member/
  access-grant IDs stable and returned `trial` member status, `library,live`
  scopes, `access_grant_performed=true`, no send, no checkout, no payment,
  no subscription, no cancellation/refund, and no external write.

Member login/classroom success path batch:

- PASS `node --test tests/rabbi-checkout-access.test.js tests/one-time-external-user-portal.test.js tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js`.
- PASS live member-path smoke reused an existing safe synthetic member and
  created/exchanged a dry-run member login token without sending email.
- PASS anonymous member APIs returned `401`; invalid classroom access returned
  `401/403`; anonymous responses exposed no Zoom or private media values.
- PASS authenticated member APIs returned library/live access state through
  the approved member flow.
- PASS Playwright desktop screenshots captured anonymous member-login and
  logged-in member states.

Signup confirmation email batch:

- PASS `node --check server.js`.
- PASS `node --test tests/one-time-product-system.test.js tests/one-time-focused-landing.test.js tests/one-time-local-hardening-audit.test.js tests/resend-client.test.js tests/rabbi-checkout-access.test.js`.
- PASS expanded 67-test suite across One Time, Rabbi access, Resend, communications, route/action watchdog contracts.
- PASS `npm run watchdog:security`.
- PASS `npm run watchdog:actions`.
- PASS regenerated `ops/action-registry/one-time-action-coverage.json`.
- PASS regenerated `ops/action-registry/universal-action-parity.json`.
- PASS `npm run railway:doctor`: deployment
  `2afaa69f-5812-46a7-941d-0bf3bee62094` reached `SUCCESS`.
- PASS live synthetic signup confirmation smoke sent one confirmation through
  Resend to a Resend delivered test address and returned a provider message ID.
- PASS live duplicate signup smoke skipped as `confirmation_already_sent` and
  reused the same product/member/access-grant IDs.
- PASS `npm run app:smoke:email-resend-ux`: no bulk/test send controls enabled
  and no send performed by the UX smoke.
- PASS `npm run app:smoke:rabbi-onetime-landing`.
- PASS `npm run app:smoke`.

Reminder metadata batch:

- PASS dry-run metadata packet created for disabled reminder windows,
  eligibility, suppression, idempotency, required inputs, and activation
  blockers.
- BLOCKED activation until final class schedule, cadence, approved copy,
  eligible recipient source, suppression policy, approved seed/test member, and
  explicit approval are supplied.

WhatsApp/contact scope hardening batch:

- PASS redacted live WAPI phonebook scope readback for
  `rabbi_sheller_provider` / `one_time_mishnah_class`; output omitted raw
  names, phones, chats, emails, and message bodies.
- PASS scoped report excluded unscoped WAPI directory rows.
- PASS no WhatsApp send and no external write.
- PASS `node --test tests/wapi-phonebook-report.test.js tests/one-time-communications-workspace.test.js tests/communications-integrations-contract.test.js tests/outbound-text-safety.test.js tests/telegram-note-to-crm.test.js tests/watchdog-action-registry.test.js`.
- PASS `npm run watchdog:actions`.
- PASS `npm run watchdog:security`.
- PASS regenerated `ops/action-registry/one-time-action-coverage.json`.
- PASS regenerated `ops/action-registry/universal-action-parity.json`.

WAPI/Whapi setup blocker batch:

- PASS readiness blocker packet created with credential alias/path, approved
  sending number, account owner, and explicit approval gates.
- PASS existing scoped WAPI phonebook readback proves dry-run/no-send behavior.
- BLOCKED provider setup verification until Whapi/WAPI credential alias/path
  and approved sending number are supplied.

Zoom/class-link security model batch:

- PASS security model packet created.
- PASS live member-path smoke verified anonymous APIs reject missing token and
  invalid classroom access exposes no Zoom/private media values.
- BLOCKED final live-session configuration until approved Zoom/session details
  are supplied.

Campaign/seed-send readiness batch:

- PASS first campaign readiness packet created with final real-send blockers.
- PASS seed-send packet created with seed-only recipient rules and stop rule.
- PASS real-send operator decision handoff created with domain, copy, segment,
  suppression, seed, explicit-send, reminder, WAPI, Vimeo, and Zoom gates.
- BLOCKED real campaign send until final copy, exact segment/list, final
  links/domain state, seed proof, and explicit send approval are supplied.

Verification/deploy/live-smoke aggregate:

- PASS completed safe batches have focused tests, watchdogs, Railway deployment
  proof, and live-smoke evidence recorded in `EVIDENCE.md` and `DEPLOYMENT.md`.
- PASS member-path browser evidence includes anonymous and logged-in desktop
  screenshots.
- PASS read-only campaign-domain resmoke refreshed the external blocker
  evidence without DNS mutation or send.
- BLOCKED final real campaign-domain smoke: `onetimeonetime.com` is not routed
  to Railway and `www.onetimeonetime.com` does not resolve.
- BLOCKED real campaign send readiness: final copy, exact recipient segment or
  list, final links, and explicit send command are not supplied.
