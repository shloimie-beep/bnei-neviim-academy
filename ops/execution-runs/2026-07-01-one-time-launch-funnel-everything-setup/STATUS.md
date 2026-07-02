# Status

Current status: `in_progress`.

- Raw intake: created.
- Requirement register: created.
- Execution run: created and selected in `ops/execution-runs/latest.json`.
- `REQ-20260701-616`: done. Structured requirements validate, Product Quality
  drift was repaired, trace validation passes, and `npm run pqc:all` passes.
- `REQ-20260701-601`: blocked externally. Local implementation, focused tests,
  Railway deploy, and BNA-root smoke are complete, but `onetimeonetime.com`
  is not routed to Railway and `www.onetimeonetime.com` does not resolve.
  A 2026-07-01T19:26+03:00 read-only resmoke confirmed the blocker remains.
- `REQ-20260701-610`: done. One Time schedule confirmation is
  disabled/server-blocked until a future approved social packet supplies
  `APPROVE_ONE_TIME_BUFFER_SCHEDULE`; Railway deployment
  `b75c6cec-31ea-4b23-8308-71606a3175ba` and live smoke pass.
- `REQ-20260701-611`: blocked externally. Redacted keyholder readback found
  Vimeo client ID and client secret files only, local no-write media pipeline
  tests pass, and the Drive/Vimeo/OBS/classroom pipeline packet is written.
  API auth/upload readiness needs `VIMEO_ACCESS_TOKEN` plus Vimeo owner, plan,
  scope, privacy, and private test-folder decisions.
- `REQ-20260701-602`: done. `/one-time` now presents the 30-day free/no-card
  signup CTA, posts to the scoped One Time intake path with trial-preview
  metadata, and is deployed to Railway deployment
  `dfc18e8e-d533-4841-a266-4adb36fe5fc7`. Live BNA fallback smoke passes;
  real campaign-domain smoke remains blocked under `REQ-20260701-601`.
- `REQ-20260701-603`: done. `/api/one-time/interest` now dedupes the scoped
  One Time product lead, upserts a Rabbi-workspace contact, upserts a
  project-scoped parent lead, and logs a project-scoped internal communication
  note. Railway deployment `4fae9506-f07c-4d49-b01a-f200d392ce27` reached
  `SUCCESS`; live synthetic duplicate signup smoke passed with no send, no
  checkout, no access grant, and no external write.
- `REQ-20260701-604`: done. `/api/one-time/interest` now grants idempotent
  30-day local trial access through `bna_members` and `bna_access_grants`.
  Railway deployment `5661544b-b960-48a4-8ef5-41489815e5b1` reached
  `SUCCESS`; live synthetic duplicate access smoke passed with `trial`
  member status, `library,live` scopes, same access-grant ID on duplicate,
  no send, no checkout, no payment/subscription/refund/cancellation, and no
  external write.
- `REQ-20260701-605`: done. `/one-time/member-login`, `/rabbi-member`, the
  member session/library/live-session APIs, and the classroom entry path were
  inspected and live-smoked. The deployed member path exposes only a safe
  public login shell to anonymous users, supports dry-run member login without
  sending email, returns authenticated library/live access state for a safe
  synthetic member, and does not expose Zoom/private media values to anonymous
  requests. Final live Zoom/session details remain under `REQ-20260701-612`.
- `REQ-20260701-606`: done. `/api/one-time/interest` now sends one
  transactional signup confirmation through the One Time Resend sender after
  the local trial access grant commits. Railway deployment
  `2afaa69f-5812-46a7-941d-0bf3bee62094` reached `SUCCESS`; live synthetic
  Resend delivered-address smoke sent the first confirmation and skipped the
  duplicate as already sent while reusing the same product/member/access-grant
  IDs. Bulk campaign sends, imported-list sends, WhatsApp, checkout/payment,
  subscription/refund/cancellation, DNS, GHL, and external CRM writes remain
  blocked.
- `REQ-20260701-607`: needs operator decision. Dry-run reminder sequence
  metadata is prepared, but reminder activation needs final class schedule,
  cadence, approved copy, eligible recipient source, suppression policy,
  seed/test member, and explicit activation approval.
- `REQ-20260701-608`: blocked. WAPI/Whapi readiness blocker packet is
  prepared; existing local tooling remains no-send/read-only. Provider setup
  verification needs exact credential alias/path and approved sending number.
- `REQ-20260701-609`: already satisfied. Existing WAPI/WhatsApp phonebook
  tooling already enforces scoped, dry-run, no-send behavior for
  `rabbi_sheller_provider` / `one_time_mishnah_class`. A redacted live scoped
  readback excluded unscoped WAPI directory rows and wrote no raw names,
  phones, chats, or message bodies. Focused WAPI/contact/communications tests
  and action/security watchdogs pass.
- `REQ-20260701-613`: done. Read-only aggregate paying-user/access audit
  inspected One Time member access, access grants, checkout records, payment
  events, provider settings, tier link counts, and legacy signup payment
  status counts. The audit includes no raw names, emails, phones, customer
  IDs, payment links, invoice URLs, or raw payment rows. No Stripe/Green
  Invoice API call, checkout, charge, payment-link creation, subscription
  change, cancellation, refund, or external write occurred.
- `REQ-20260701-612`: needs operator decision. Zoom/class-link security model
  is documented and live member-path smoke proves anonymous users do not see
  Zoom/private media values. Final Zoom/session details are still needed before
  configuring live records.
- `REQ-20260701-614`: needs operator decision. First campaign and seed-send
  packets are prepared with real-send blockers; real campaign send still needs
  final subject/body, exact segment/list, final links/domain state, seed proof,
  and explicit send approval. A consolidated real-send operator decision
  handoff now records the exact send gates and resume rules.
- `REQ-20260701-615`: blocked externally. All safe completed app-visible and
  server-visible batches have focused tests, watchdogs, deployment, live-smoke,
  and screenshot/browser evidence where applicable. The remaining verification
  gap is final campaign-domain proof and real campaign send readiness:
  `onetimeonetime.com` is not routed to Railway and final copy/list/links/
  approval are not supplied. The latest read-only resmoke still shows the
  campaign domain outside Railway.
- Local `/one-time` funnel implementation may proceed while the public
  `onetimeonetime.com` domain remains externally blocked; real campaign sending
  still waits for domain proof and explicit final approval.
- Blocked/decision items are scoped to campaign approval, external provider
  credentials/accounts, DNS, Zoom/class details, Vimeo/Drive ownership, and
  paying-user billing source.
