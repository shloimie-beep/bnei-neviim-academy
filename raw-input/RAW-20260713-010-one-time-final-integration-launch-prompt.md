# CODEX EXECUTION PROMPT
## One Time final integration, performance rescue, activation, deployment, and truthful closeout

Repository:
`https://github.com/shloimie-beep/bnei-neviim-academy`

Primary workspace:
`rabbi_sheller_provider`

Primary project:
`one_time_mishnah_class`

Canonical One Time production target:
`https://join.onetimeonetime.com`

Secondary shared-runtime regression target:
`https://bneineviimacademy.org`

Current date/timezone for this run:
`2026-07-13`, `Asia/Jerusalem`

---

# 0. AUTHORITATIVE CORRECTION — READ THIS BEFORE EVERY OLDER FILE

Register this prompt as the newest correction/addendum source in the active execution run. These decisions override older prompts, stale blockers, task descriptions, screenshots, and reports wherever they conflict. Preserve historical evidence; do not rewrite history.

## 0.1 Identity and role model

The canonical spelling is **Shloimie**: `S-H-L-O-I-M-I-E`.

Shloimie has two independent grants:

1. He is the global platform **Super Admin** in the global Super Admin/Operations context.
2. He is also a real **One Time workspace admin member** inside `rabbi_sheller_provider` / `one_time_mishnah_class`.

When Shloimie clicks **OneTime OneTime**, the application must switch him into the One Time tenant context using his actual workspace membership. It must **not** impersonate Rabbi Eli Scheller, replace Shloimie's actor identity with the Rabbi, or use a signed “view as Rabbi” session.

Therefore:

- remove **View as Rabbi** from the normal One Time UI, menus, shortcuts, route/action registries, deep links, tests, and current documentation;
- do not merely CSS-hide the button;
- preserve Shloimie as the actor on every audit event and write;
- use his One Time admin role for tenant authorization;
- keep global-only Super Admin controls in the global context;
- Rabbi Eli Scheller remains a separate user and the provider owner/admin as himself;
- entering One Time is a workspace-context switch, not impersonation;
- if a separate support-only impersonation facility must remain for platform operations, it must not appear in the ordinary One Time path and must not be used for this work.

In older reports, **owner** often meant the person responsible for supplying a value or receiving a safe test. It did not necessarily mean account owner, workspace owner, or provider owner. In all new reports, use **responsible party**. For communication tests, use **Shloimie internal canary destination**.

## 0.2 Secure canary recipient

The secure internal test recipient is **Shloimie**.

- Use Shloimie's canonical, verified WhatsApp number.
- Use Shloimie's canonical, verified email address.
- Resolve both from approved authenticated sources already controlled by Shloimie: Railway/keyholder configuration, the canonical user/contact record, or an existing verified secure provider configuration.
- If a value exists securely but is not installed, store it in the approved Railway/keyholder secret path.
- Never print, commit, paste into task files, expose in screenshots, or log the raw email or phone number.
- Evidence may record only presence, a masked suffix, or a non-reversible fingerprint.
- If more than one plausible phone or email remains after checking authoritative secure sources, do not guess the identity. Finish every independent lane and report the one exact ambiguity.

Legacy variable names such as `ONE_TIME_OWNER_TEST_EMAIL` and `ONE_TIME_OWNER_TEST_WHATSAPP` may remain as compatibility aliases, but user-facing copy and current documentation must call them the **Shloimie internal canary destination**.

## 0.3 Public WhatsApp decision

Public One Time WhatsApp reactive auto-replies are explicitly approved for **every valid new public inbound sender**, after the Shloimie canary and the technical safety gates in this prompt pass.

Do not ask for this approval again. The completed behavior must not remain Shloimie-only or owner-allowlisted.

“Everyone” means all valid new inbound One Time contacts after the activation watermark, except opted-out, blocked, suppressed, bot-originated, provider status/callback, loop-detected, safety-blocked, or human-handoff-paused threads. It does **not** authorize:

- proactive campaigns;
- bulk or historical-backlog messages;
- replies to old messages received before activation;
- Telegram sends;
- unrelated BNA/school outreach;
- messaging people who have not contacted or opted into One Time;
- disclosure of a private Zoom/class link before verified signup and entitlement.

The old variable `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM` is misleading. Public WhatsApp activation must not be coupled to Telegram. Replace or migrate it to a clearly named WhatsApp public-reply gate following repository conventions, preserve rollback compatibility, and keep Telegram disabled unless a separate current requirement explicitly requires it.

## 0.4 Stripe decision

Stripe authorization is granted. Do not ask again for permission to complete Stripe sandbox/test work, reconcile the branch, run synthetic checkouts, deliver signed test webhooks, create/cancel/refund synthetic test subscriptions, mutate synthetic entitlements, merge, deploy, or perform hosted Stripe TEST-mode verification.

The operator states that the current work is still sandbox/test so far. Do not silently cross into real-money mode, and do not label Stripe test-mode proof “live billing.” Before every Stripe write, assert the account/key/object/event mode. Every sandbox object/event must prove `livemode=false`.

If a complete live launch packet already exists in authoritative secure sources and live provider readback unambiguously agrees on the intended account, product, price, webhook, billing policy, cohort, consent/payment-method coverage, and notice preview, this message supplies authorization to configure and activate the intended live checkout. It does not authorize inventing missing financial facts or surprise-charging an existing person who did not actively consent.

Binding One Time billing policy:

- `$67 USD/month` recurring;
- provider Stripe account belongs to Rabbi Eli Scheller / One Time;
- no Stripe Connect and no revenue-split/payout work in this launch;
- no Stripe trial object;
- no hidden 30-day trial;
- no `trial_will_end` launch path;
- no card required for the promotional signup unless a newer authoritative decision explicitly changed this;
- promotional access is implemented by the application until the configured Rosh Hashanah campaign deadline in `Asia/Jerusalem`;
- after the promotion, a person begins paid service only after actively completing checkout/consent; do not create a surprise subscription from promotional signup alone;
- `$67/month` is tax-exclusive under the current policy; do not invent automatic-tax behavior;
- no automatic refunds; use the manual refund-review state;
- no grace period;
- receipts/customer-facing billing copy are English unless the user chose another locale;
- provider admins may publish the workspace's live price, but publishing a price is not the same as charging a customer.

Resolve the exact campaign cutoff from the newest authoritative campaign configuration/decision record. If the code lacks an exact timestamp, create a single explicit `Asia/Jerusalem` configuration value derived from the existing Rosh Hashanah campaign deadline, expose the exact customer-facing date before any payment can occur, and test timezone boundaries. Do not scatter hard-coded dates.

## 0.5 Performance and UI decision

The application is currently reported as **unbearably slow and nearly unusable**. This fresh operator report overrides old evidence saying performance instrumentation or budgets passed.

Treat all of the following as **P0 release blockers**:

- slow public and authenticated initial loads;
- slow route changes;
- slow CRM/contact list and contact-detail opening;
- contacts that fail to open on the first click/tap;
- faded, skeleton-like, disabled-looking, or low-contrast contact names after loading;
- content UI that is visually messy, delayed, blank, or unreliable;
- duplicate navigation/toolbars;
- mobile behavior that obscures or overcrowds content.

Do not “fix” this with longer timeouts, permanent skeletons, extra spinners, or cosmetic color patches while the underlying app remains slow.

---

# 1. MISSION AND TERMINAL-STATE POLICY

Operate in goal mode. Audit first, but the audit is only the first gate. Continue through implementation, tests, branch reconciliation, PR review, merge, Railway deployment, integration activation, exact-SHA live proof, evidence cleanup, and authoritative run closeout.

Do not stop after writing a report or listing recommendations. Do not ask the operator to choose routine implementation order. Make reversible technical decisions autonomously and keep independent lanes moving when one lane is blocked.

Every requirement must end truthfully as one of:

- `verified_live`
- `verified_sandbox`
- `already_satisfied`
- `blocked_external`
- `failed`
- `superseded`
- `archived`

Do not use a vague `done` label. An app-visible production requirement is not complete unless its implementation is:

1. committed;
2. pushed;
3. merged into current `origin/master` through an intentional PR/release path;
4. included in the exact deployed SHA;
5. live-smoked in the correct Railway target;
6. externally activated when activation is part of the requirement;
7. evidenced with current, redacted proof.

Do not say “everything is live” if Stripe is only in test mode, WhatsApp is still `capture_only`, Vimeo upload is unproven, the deployed SHA is stale, UI/performance gates fail, or an external integration remains blocked.

---

# 2. PRECISE AUTHORIZATION AND DECISION POLICY

The operator authorizes Codex to:

- inspect all repository files, branches, commits, worktrees, PRs, issues, action/route registries, migrations, deployments, task registers, decisions, evidence, and current run state;
- read secure configuration through approved Railway, keyholder, ignored runtime, and provider-secret paths without exposing raw values;
- create clean worktrees/branches, edit code, add tests, make additive/backward-compatible migrations, update documentation, and generate evidence;
- create and clean up reversible synthetic database/provider records;
- run local, sandbox, hosted-test, production read-only, and bounded live canary tests described here;
- store Shloimie's verified test email/WhatsApp in approved secret configuration;
- send at most one Shloimie canary email and one Shloimie canary WhatsApp message before public activation;
- enable public reactive WhatsApp auto-reply after the required gates pass;
- send transactional signup confirmations to newly opted-in One Time signups after canary verification, with idempotency and suppression controls;
- configure One Time's public WhatsApp, Resend, WAPI, Vimeo, Stripe, Railway, and scoped DNS settings when credentials and target identity are securely proven;
- perform one harmless private/unlisted synthetic Vimeo upload and delete/rollback it;
- fully exercise Stripe test mode, including synthetic checkout, webhook, payment failure/recovery, cancellation, test refund, and synthetic entitlement changes;
- reconcile or replace stale PR #132;
- commit, push, open/update PRs, run CI, merge, deploy to Railway, verify exact SHA, and roll back on failure;
- deploy BNA only when shared-runtime regression coverage requires it;
- make a narrowly scoped `join.onetimeonetime.com` DNS correction if authoritative Railway/GoDaddy records prove it is needed, while preserving the apex, nameservers, email/DKIM/MX, and all unrelated records;
- close or supersede stale tasks/issues only when fresh evidence proves the disposition;
- clean stale branches/worktrees only after proving every unique commit is merged, archived, or intentionally superseded.

Proceed autonomously on implementation order, layout details, refactors, pagination, virtualization, indexes, query consolidation, caching, code splitting, tests, synthetic fixtures, PR splitting, and rollback execution.

Do not fabricate:

- secrets, tokens, account IDs, phone numbers, emails, recipients, or identities;
- production customer data;
- legal/consent/tax promises not present in authoritative records;
- a live customer cohort or payment-method consent;
- destructive migration intent;
- private-media approval;
- an external provider capability that readback does not prove.

Do not expose or commit raw secrets, passwords, tokens, phone numbers, email addresses, chat IDs, Zoom/class links, private message bodies, minors' data, or payment data. Redact screenshots, logs, fixtures, reports, and model context.

Do not add GHL, GoHighLevel, LeadConnector, Base44, Replit, or another external CRM/backend as a new source of truth. The first-party BNA/One Time CRM, existing repository, Railway, and Postgres remain authoritative.

Do not let one genuine missing external value stop unrelated implementation. Exhaust approved secure sources and safe alternatives, finish all independent work, and report one consolidated blocker with the exact missing value and next action.

---

# 3. KNOWN PRIOR STATE — VERIFY, DO NOT BLINDLY TRUST

The preceding audit recorded:

- One Time application SHA `49f3edda2da37e3afd9bdf3056ab5f6fc91e981c`;
- Railway deployment `fe180cfc-322c-46cc-acde-4e1314e42291`;
- a deployed dedicated One Time shell, route modules, CRM, mobile CRM, Communication Agents interface/runtime, performance instrumentation, WAPI inbound capture, and much of the Drive/edit/transcription/metadata pipeline;
- WhatsApp in `capture_only` rather than public `auto_reply` mode;
- email in `draft` mode;
- contact/conversation capture enabled;
- ordinary automatic task creation disabled;
- Resend connected and domain-verified, but no current Shloimie canary proof;
- Vimeo `/me` read access but no private upload-to-member-library proof;
- two Vimeo apps created previously, with possible confusion between app credentials and a user upload bearer token;
- PR #132 open/draft/unmerged/unmergeable/stale, with roughly 106 files and 32,000 additions;
- Stripe Billing V2 tested in sandbox but not reconciled, merged, deployed, and proven as the production runtime;
- stale contradictions among `SYSTEM-STATE.md`, the active `run.json`, `NEXT-SESSION.md`, requirements, and deployment evidence;
- a non-terminal active run and final release matrix;
- earlier performance notes about public transfer size, Tasks DOM weight, roughly 503 contacts rendered at once, and a CSS collision producing faded lead/contact cards;
- `join.onetimeonetime.com` and/or related alias/DNS/fingerprint verification as previously incomplete;
- Zoom managed-link groundwork tested synthetically, while the existing free-class Zoom link remained the intended real link for now.

Freshly re-read every item from GitHub, the local repo, Railway, database state, provider state, and the live applications. Old task titles and reports are leads, not proof.

---

# 4. REQUIRED SOURCE-OF-TRUTH READ

Before product edits, inspect at minimum:

1. `AGENTS.md`
2. `README.md`
3. `BNA-START-HERE.md`
4. `docs/BNA-RAMBLE-TO-DONE.md`
5. `docs/PRODUCT-QUALITY-COMPILER.md`
6. `SYSTEM-STATE.md`
7. `MEMORY.md`
8. `TASKS.md`
9. `memory-topics/one-time-rabbi-sheller.md`
10. `memory-topics/stripe-payments.md`
11. `ops/execution-runs/latest.json`
12. every file in the active execution run
13. `tasks-pending/2026-07-13-onetime-drive-classroom-video-automation.md`
14. PR #132's Billing V2 register, commits, reviews, tests, and handoffs
15. the current source, migrations, scripts, tests, action registry, route registry, deploy scripts, and smoke scripts
16. the latest public landing/UI/image/copy dropoffs and unresolved frontend-audit issues
17. the Zoom rollout evidence and current free-class-link configuration

Register this prompt with the next available RAW/REQ IDs unless the execution CLI proves the current run is already terminal. If the old run is terminal, open a linked correction/closeout run rather than rewriting it.

---

# 5. GATE 1 — FREEZE, FETCH, AND CAPTURE CURRENT TRUTH

Do not edit product code until this gate is captured.

Run the repository's current equivalents of:

```bash
git fetch origin --prune
git status --short
git branch -vv
git worktree list --porcelain
git log --oneline --decorate --graph -n 100
gh pr list --state all
gh issue list --state open
npm run bna:run:status
npm run bna:run:resume
npm run bna:run:blockers
npm run bna:run:source-coverage
npm run bna:run:stale-evidence
npm run production:readiness:snapshot
npm run production:readiness:gate -- --json
npm run secrets:audit
```

If a named script was legitimately renamed, use and record its canonical successor. Do not silently skip it.

Record:

- current local branch/SHA;
- current `origin/master` SHA;
- every dirty file and owning lane;
- every worktree and branch;
- every open PR and mergeability state;
- relevant issues and active requirements;
- PR #132's exact base/head/merge-base/conflicts;
- current One Time and BNA `/api/deploy-info` readbacks;
- Railway project/service/environment/deployment IDs and `SUCCESS` state;
- database migration/readback state;
- provider modes and secure configuration presence, never raw values;
- whether commits after each deployed SHA contain runtime changes or evidence only;
- current canonical DNS/TLS behavior for `join.onetimeonetime.com`;
- current public page fingerprint and unexpected redirects/content;
- current integration activation states: capture, draft, test, live, or blocked.

Do not alter a dirty or occupied worktree owned by another agent/lane. Create a clean integration worktree from current `origin/master`. Parallel lanes may use separate bounded worktrees, but one final integrator owns reconciliation, PRs, merges, deployments, and closeout.

Create a current audit at:

```text
ops/system-audits/2026-07-13-onetime-final-integration-launch/report.md
ops/system-audits/2026-07-13-onetime-final-integration-launch/report.json
```

For each workstream, distinguish:

- implemented;
- locally tested;
- sandbox/provider-tested;
- committed;
- pushed;
- merged;
- deployed;
- exact-SHA live-smoked;
- provider-configured;
- externally activated.

Audit at least these workstreams separately:

1. public landing/signup;
2. dedicated One Time shell and navigation;
3. Shloimie identity/workspace membership and Rabbi identity separation;
4. CRM aggregation and workspace isolation;
5. CRM add/update/archive/link-member/link-family/link-student/follow-up/task actions;
6. mailbox/email threads;
7. Communication Agents UI/API/runtime;
8. WAPI inbound lead capture;
9. public WhatsApp response runtime;
10. Resend draft/transactional send path;
11. Telegram readiness and disabled state;
12. public/authenticated performance and RUM;
13. Drive stable-file intake/exactly-once orchestration;
14. media edit/transcription/metadata/knowledge handoff;
15. Vimeo account/apps/token/upload/privacy/rollback;
16. classroom review package and member-library publication;
17. Zoom existing free link and managed-link test lane;
18. Stripe Billing V2 and provider Billing UI;
19. billing notices/refunds/entitlement lifecycle;
20. CI, PR review, release, deployment, DNS, rollback;
21. source-of-truth/run consistency.

---

# 6. GATE 2 — REPRODUCE THE P0 DEFECTS BEFORE FIXING THEM

Use the real role path, realistic synthetic data where needed, and current production behavior.

## 6.1 Role-path baseline

Test these principals separately:

- anonymous visitor;
- Shloimie as global Super Admin;
- Shloimie as One Time workspace admin member;
- Rabbi Eli Scheller as his own provider owner/admin account;
- One Time parent/member/student;
- unrelated authenticated user with no One Time membership;
- wrong-workspace user.

For Shloimie:

1. log in as Shloimie;
2. verify the global Super Admin context;
3. click OneTime OneTime;
4. verify ordinary One Time admin context without impersonation;
5. open deep links for CRM, mailbox, Communications, Billing, content/library, and settings;
6. refresh, use back/forward, and return to global Operations;
7. capture actor/role/workspace audit evidence.

Search source, rendered HTML, tests, action registries, route registries, shortcuts, mobile menus, and documentation for case/spacing variants of “View as Rabbi.” Record every production-facing occurrence.

## 6.2 Performance and UI baseline

Profile these critical journeys:

- public landing and signup;
- initial authenticated One Time shell;
- CRM contact list;
- opening a contact detail;
- searching/filtering CRM;
- mailbox/thread opening;
- Communication Agents;
- content/library/latest video;
- Billing;
- mobile list -> detail -> subview -> back.

Use a representative dataset of at least 1,000 synthetic/scoped contacts and 500 synthetic/scoped conversation/thread records if production-safe data is insufficient. Do not expose real contact details.

For every route, capture 10 cold and 10 warm samples on desktop 1440 and mobile 390 under controlled Fast 4G/4x CPU conditions where supported. Record median and p95, not one Lighthouse screenshot.

Capture:

- navigation timing and user timing;
- server timing/trace spans;
- network waterfall;
- duplicate/repeated requests;
- API payload and compressed transfer sizes;
- database query counts and slow-query/`EXPLAIN ANALYZE` evidence;
- N+1 patterns;
- session/workspace resolution time;
- bundle/chunk sizes and code loading;
- hydration/render/main-thread long tasks;
- DOM node count and list-row count;
- memory growth across 20 repeated route/list-detail cycles;
- provider calls blocking first-party rendering;
- cache keys/invalidation and tenant scoping;
- errors, timeouts, 4xx/5xx, blank states, and permanent skeletons.

Reproduce and screenshot:

- faded contact names;
- selected, hover, focus, disabled, archived, suppressed, missing-field, loading, error, and empty states;
- long English name and Hebrew/RTL name;
- contact first-click failure/delay;
- duplicate navigation/toolbars;
- clipped/overlapping mobile content;
- content panels that do not open or remain blank.

Required visual widths: `1440`, `1024`, `768`, `430`, and `390`.

---

# 7. GATE 3 — FIX IDENTITY, NAVIGATION, CRM UI, CONTENT UI, AND PERFORMANCE

## 7.1 Identity and tenancy acceptance

Implement and prove all of the following:

- Shloimie's signed-in principal remains Shloimie everywhere.
- Global context uses his global `super_admin` grant.
- One Time context uses his real workspace-admin membership.
- No “View as Rabbi” label/button/action is present anywhere in the normal One Time path.
- A One Time write records Shloimie's canonical actor user ID, the One Time workspace/project, the workspace-admin role, and `impersonation=false` or the repository's equivalent.
- Rabbi's actor ID is never substituted for Shloimie's.
- Refresh, deep links, mobile navigation, and back/forward preserve the correct context.
- Switching back restores the global Super Admin UI.
- Rabbi sees his provider controls as himself and never sees global Super Admin controls.
- A nonmember direct link receives 403/404 according to the canonical privacy policy.
- No One Time query/action exposes BNA, Family, another provider, or global data.
- Any cache added for speed includes workspace, user, permission/role, and relevant entitlement scope.

Add integration tests that would fail on impersonation, conflicting client-supplied workspace IDs, actor substitution, or cross-workspace reads/writes.

## 7.2 CRM/contact/content UI acceptance

Fix the root state/CSS/data flow, not just one selector.

- Active contact names must have computed opacity `1`, including all ancestors.
- Normal and essential text must meet WCAG AA contrast of at least 4.5:1.
- Yellow may be an accent, but not low-contrast body/name text.
- Missing phone/email/optional fields must not make the contact name look disabled.
- Archived/suppressed contacts require an explicit badge/state; essential text remains readable.
- Skeleton/loading styling must be removed immediately when data resolves.
- The first click/tap produces visible feedback within 100 ms and opens the correct contact.
- Contact detail performance must meet the budgets below.
- No transparent overlay, stale backdrop, disabled parent, or pointer-event collision may block input.
- Selected, hover, keyboard-focus, error, empty, loading, and offline/retry states must be obvious and accessible.
- Search/filter/refresh must not duplicate rows, drop selection incorrectly, or cross workspaces.
- Mobile must use a clean list -> detail -> subview flow with a reliable Back action.
- No duplicate header/toolbars, unexplained blank panels, horizontal page scroll, overlapping actions, clipped names, or dead buttons.
- Content/library UI must open reliably on the first action and show clear loading/error/empty states.
- Use one contextual top rail; do not stack a duplicate module toolbar and filter rail.

Capture visual-regression proof for default list, selected detail, search result, loading/error, content open, and mobile states.

## 7.3 Performance acceptance

Use stricter existing repository budgets when they exist. Otherwise the following are minimum launch gates:

- public controlled LCP `<= 2.5s`, INP `<= 200ms`, CLS `<= 0.10`, and TTFB `<= 800ms`;
- authenticated usable content `<= 2.0s` desktop warm and `<= 3.5s` mobile cold;
- route actions show feedback `<= 100ms`;
- meaningful client route content p95 `<= 1.5s` desktop and `<= 2.5s` mobile;
- CRM contact detail p95 `<= 800ms` desktop and `<= 1.2s` mobile after selection;
- common first-party read APIs p95 `<= 750ms`;
- first-party writes p95 `<= 1.5s`, excluding third-party provider completion;
- no critical first-party request over 5 seconds;
- 20 route/list-detail cycles produce 0 timeouts, 0 5xx, 0 blank screens, 0 infinite skeletons, and no unbounded memory/DOM growth;
- contact list is server-paginated or virtualized, with a bounded initial render such as 50–100 rows rather than the entire CRM;
- one navigation performs one request per distinct dataset unless a documented retry occurs;
- public initial compressed JS target `<= 300KB` and total initial transfer `<= 1.5MB`, excluding lazy media;
- authenticated initial compressed JS target `<= 500KB` with bounded route chunks; if the current architecture makes a byte target genuinely inapplicable, document why and enforce an equivalent route/user-timing budget;
- optional integrations/providers do not block rendering of first-party data.

Investigate and fix actual causes: overfetch, N+1 queries, missing indexes, sequential waterfalls, duplicate fetches, oversized DTOs, session/workspace lookups, eager global bundles, unbounded DOM, unnecessary rerenders, synchronous media work, missing compression/cache headers, Railway cold start, and provider calls on the critical path.

Add CI performance regression gates and retain deployed RUM/trace instrumentation. If production RUM lacks enough post-deploy samples, report `synthetic verified; RUM pending`, not fully RUM-verified.

---

# 8. GATE 4 — FINISH PUBLIC LANDING, COPY, ASSETS, SIGNUP, AND RESPONSIVE UI

Audit the newest UI/image/copy dropoffs and implement any missed requirements. Do not assume a prior “deployed” label means the visible page matches.

Binding current public/content requirements include:

- One Time branding is black/yellow with a black/white logo treatment;
- the page and authenticated shell must feel like One Time, not a lightly relabeled BNA Operations screen;
- remove stale 30-day-trial copy;
- public offer copy uses free promotional access until the configured Rosh Hashanah deadline and `$67/month` afterward;
- do not imply a Stripe trial object;
- do not promise immediate private portal/class-link access before signup/verification;
- timezone-sensitive schedule/campaign text uses Israel time;
- no private Zoom/class link is exposed to anonymous leads or model context;
- signup and bot paths dedupe contacts and remain workspace-scoped.

The current **What you receive** content is:

1. **Live Daily Mishnayos** — engaging hybrid streaming class from Eretz Yisrael.
2. **Online class library** — for review and catching up on missed classes.
3. **Secure student portal** — gamified access to Rabbi Scheller and student-scoped updates.
4. **Parent portal** — admin updates and access to tech help.
5. **Weekly review sheets**.
6. **Stay in the loop and up to date**.

Use the approved visual hierarchy for this section: the icon sits above the card/bubble, the item title is clearly separated beneath the icon, and the supporting bullet/copy sits inside the bubble. Keep the cards compact, aligned, readable, and consistent rather than turning them into oversized generic panels.

Remove the separate items **Monitored platform** and **Questions with Rabbi Scheller** where they duplicate the portal/support explanation.

Locate and verify the latest approved assets by exact filename/hash before use; do not substitute stock images:

- excitement: `WhatsApp Image 2026-07-13 at 14.37.22 (1).jpeg`, cropped/zoomed to emphasize the excited class/kids;
- clarity: `WhatsApp Image 2026-07-13 at 14.37.21 (1).jpeg`;
- accomplishment: `Toronto.jpg`;
- “Who it's for” dark-background image: `Norfolk, Virginia.jpg`, with the approved dark overlay.

If a filename has multiple copies, resolve it from the newest approved asset dropoff/Drive mapping and record the selected hash. Do not invent an asset.

On signup/form submit, after consent and canary verification:

- create/resolve exactly one One Time CRM contact;
- create exactly one lead/conversation state;
- send at most one idempotent transactional confirmation email and one WhatsApp confirmation where the person supplied/consented to the respective channel;
- never include the private live-class link before verification/entitlement;
- route school/BNA leads to the approved “we'll be in touch” handoff without leaking One Time or BNA data;
- show a clear success state and recovery path;
- verify replay, refresh, and double-submit do not duplicate contacts or sends.

Verify the final landing/signup at all required widths, with actual assets and production network behavior.

---

# 9. GATE 5 — COMPLETE SHLOIMIE CANARIES AND ACTIVATE PUBLIC WHATSAPP

## 9.1 Readiness and secure storage

1. Resolve and install Shloimie's verified email/WhatsApp as secure canary destinations.
2. Verify WAPI/Whapi provider identity and readiness.
3. Verify Resend sender/domain/readiness for `info@onetimeonetime.com` or the current authoritative sender.
4. Verify OpenAI communication-agent runtime, published One Time knowledge snapshot, policy filters, and safe fallback.
5. Verify the channel is scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`.
6. Add an explicit activation timestamp/watermark so old inbound backlog is not answered.
7. Verify a kill switch and rollback path.

## 9.2 Bounded canaries

Send no more than:

- one Shloimie internal canary email;
- one Shloimie internal canary WhatsApp.

Use unique test-run IDs and idempotency keys. Verify:

- provider acceptance/delivery/readback where supported;
- scoped contact creation/resolution;
- conversation/timeline/outbox state;
- no automatic ordinary task;
- replay does not duplicate contact, inbound message, reply, outbox row, ticket, or task;
- opt-out/suppression behavior;
- human-handoff behavior;
- private class/Zoom links never enter model context or logs;
- redacted receipts only;
- cleanup/archive of synthetic canary records under existing test policy.

## 9.3 Public activation

After canaries and tests pass, activate reactive auto-reply for every valid **new** public inbound sender. Do not leave an owner allowlist.

Prove this matrix with synthetic/provider-safe inbound tests, not by messaging unrelated people:

- unknown sender -> exactly one One Time contact, one conversation, one timely reply;
- existing contact -> append to thread without duplicate contact;
- identical webhook replay -> no duplicate inbound, outbox, reply, ticket, or task;
- two rapid messages -> preserved order and no reply storm;
- own-number echoes, bot messages, delivery/status callbacks -> no loop/reply;
- provider/LLM failure -> one safe fallback with bounded retry and no duplicate sends;
- `STOP`/opt-out -> suppression and no further automation except one allowed confirmation;
- human-help, complaint, safety uncertainty, or Rabbi-specific question -> handoff ticket and automation pause for that thread;
- private Zoom/class-link request before signup -> no private link or student data;
- school/BNA lead -> approved handoff copy and no workspace leakage;
- valid opted-in signup -> confirmation at most once;
- ordinary inbound -> no ordinary task unless a genuine handoff/support ticket is required;
- logs/traces/model context -> redacted phone, secrets, private links, and sensitive content.

Target operational proof:

- reply enqueue p95 `<= 10s`;
- provider acceptance `<= 30s`, subject to provider availability;
- channel readback shows `auto_reply`, not `capture_only`;
- kill switch test passes;
- exact deployed SHA and activation configuration are recorded.

Public WhatsApp activation does not activate Telegram. Keep Telegram disabled unless a distinct current requirement exists.

Run the dependent final communication/integration verifier after activation.

---

# 10. GATE 6 — RECONCILE, TEST, MERGE, AND DEPLOY STRIPE BILLING V2

PR #132 must not be merged wholesale from a stale/conflicted base.

## 10.1 Branch reconciliation

In a clean worktree based on current `origin/master`, inspect the current equivalents of:

```bash
git log origin/master..origin/codex/onetime-rosh-hashanah-billing-platform-v2
git diff --stat origin/master...origin/codex/onetime-rosh-hashanah-billing-platform-v2
git range-diff <merge-base>..origin/master <merge-base>..origin/codex/onetime-rosh-hashanah-billing-platform-v2
```

Identify billing-only commits/files and preserve all newer master behavior, especially:

- WAPI inbound capture and public-reply work;
- Communication Agents runtime/UI/API;
- dedicated One Time routes/modules;
- current CRM aggregation/actions;
- identity/workspace isolation fixes;
- performance instrumentation and optimizations;
- generated Operations artifact rules;
- first-party no-GHL policy.

Either rebase intentionally or create a bounded replacement branch/PR and cherry-pick/reimplement only valid Billing V2 work. If #132 is superseded, preserve its valid commits/evidence, cross-link the replacement, and close it only after the replacement is safe. Never force-resolve conflicts or normalize a 100-file conflict dump.

## 10.2 Required Billing V2 behavior

Prove:

- `$67/month` server-owned product/price selection;
- exact provider/workspace binding;
- no client-controlled price ID;
- no Stripe trial object or hidden free period;
- application-level promotional access only;
- correct campaign cutoff/timezone boundary;
- no card required for promotional signup under the current policy;
- paid service begins only after active checkout/consent;
- raw-body signature-verified webhook without breaking other middleware;
- idempotent and out-of-order-safe checkout/payment/invoice/failure/recovery/renewal/cancellation/refund-review/entitlement lifecycle;
- no automatic refunds;
- no grace period;
- no stale “30-day trial” UI/email copy;
- responsive provider Billing UI;
- explicit test/live mode labeling;
- live actions fail closed unless current configuration and launch data agree.

Run, when present/current, at minimum:

```bash
npm run stripe:sandbox-smoke
npm run stripe:sandbox-e2e
node --test tests/one-time-billing-sandbox-e2e-verifier.test.js
node --test tests/stripe-billing-lifecycle.test.js
node --test tests/one-time-stripe-local-beta.test.js
node --test tests/one-time-provider-review-navigation.test.js
node --test tests/one-time-provider-operations-login.test.js
node --test tests/one-time-shared-review-branding.test.js
node --test tests/rabbi-scheller-auth-navigation-contract.test.js
npm run operations:check-generated
npm run operations:check-canonical
npm run bna:run:validate
npm run watchdog:actions
npm run watchdog:security
npm run secrets:audit
npm test
git diff --check
```

Add tests for duplicate/out-of-order webhook events, wrong workspace, wrong price, wrong mode, promotion cutoff, no-card promo access, post-promo payment-required state, and tenant-safe entitlement updates.

Verify hosted Railway Stripe TEST-mode keys and webhook delivery. Assert every created/read object/event has `livemode=false`. Deploy the live-capable Billing UI/runtime after CI passes, but report it as `verified_sandbox` until live account/configuration/checkout are actually proven.

If authoritative secure readback proves a complete live launch packet, verify the live account belongs to the intended One Time/Rabbi provider, create/reuse one canonical `$67/month` price, install the signature-verified webhook, activate the new-customer checkout, and perform read-only/provider configuration verification. Do not charge old promotional users without a recorded active checkout/consent and exact cohort evidence.

---

# 11. GATE 7 — COMPLETE VIMEO, DRIVE, CLASSROOM, MEMBER LIBRARY, AND ZOOM PROOF

## 11.1 Vimeo account/app reconciliation

Inspect both accidentally created Vimeo apps and every secret reference without exposing values.

- Determine which Vimeo account actually owns the real Rabbi Scheller/One Time library.
- Distinguish `client_id`/`client_secret` app credentials from a user access/upload bearer token.
- Read `/me` and token/account capabilities.
- Verify upload, edit, privacy, file/playback, folder/project, and deletion scopes.
- Do not replace a working user token with app credentials.
- Do not delete/revoke either app until dependency/reference searches prove it is unused and recovery metadata is preserved.
- If one app is conclusively unused, remove/revoke it safely and record the reason without secrets.

## 11.2 Synthetic private Vimeo proof

1. Use or create a clearly named private test folder/project when permitted.
2. Generate a harmless short synthetic video locally.
3. Upload exactly one private/unlisted synthetic video through the guarded smoke path.
4. Verify creation, processing completion, privacy, playback/readback, metadata update, retry, idempotency/duplicate handling, no public visibility, and deletion/rollback.
5. Delete/rollback the synthetic media after evidence unless policy requires retention in the private test folder.
6. Record only redacted IDs/fingerprints.

Do not call read-only `/me` access upload-ready.

## 11.3 Drive/media pipeline proof

Verify with synthetic media:

- stable-file admission;
- exactly-once content-job planning;
- lease/retry/dead-letter behavior;
- OBS/MKV intake;
- conservative edit and media validation;
- output hash/duplicate protection;
- chunked long-form transcription;
- redacted evidence;
- metadata extraction/versioning;
- knowledge handoff;
- review/approval gate;
- Vimeo handoff;
- cleanup/rollback.

OpenAI remains the primary transcription/AI path under current configuration. Do not treat Kimi as an audio-transcription fallback; any Kimi fallback is limited to approved post-transcription analysis/processing.

## 11.4 Classroom/member proof

After synthetic Vimeo proof succeeds:

- build one synthetic Drive-origin review package;
- approve it through the guarded test path;
- publish it only to a synthetic TEST member/access record;
- prove latest-video and older-library behavior for parent/member/student roles;
- prove anonymous, expired, and wrong-workspace denial;
- prove the Rabbi/One Time admin review path;
- remove synthetic access/media/database records;
- close `REQ-20260713-918`, `919`, and `920` only if their real acceptance criteria pass.

Inventory existing real Vimeo videos read-only and prepare a deduped import/link plan. Link or publish only media already marked approved in authoritative One Time records. Do not guess that private class footage is approved, and never delete a real video as cleanup.

## 11.5 Zoom invariant

The current real production class link remains the existing approved free-class Zoom link already stored in the system. Do not replace it with a newly generated managed meeting/registrant link during this launch.

Codex may:

- verify the stored production URL by redacted fingerprint/readback;
- verify alias/DNS behavior;
- run one reversible synthetic managed Zoom canary if the existing test gate allows it;
- create/read/delete only synthetic meeting/registrant records;
- verify mute-on-join/host identity configuration in the synthetic lane.

Keep managed real-member Zoom links feature-disabled until that separate rollout is explicitly adopted. This is not a blocker to launching the current free-link workflow.

---

# 12. GATE 8 — HARDEN PR, CI, DNS, DEPLOYMENT, AND ROLLBACK

## 12.1 PR/CI

Use bounded PR-first integration. Do not use detached-worktree `git push origin HEAD:master` as the normal release path.

If effective PR CI is absent, add a bounded workflow covering the current equivalents of:

- dependency install/syntax checks;
- generated/canonical Operations checks;
- execution-run validation;
- secret audit;
- action/security watchdogs;
- focused identity/workspace tests;
- focused CRM/UI tests;
- focused WAPI/communication-agent tests;
- focused Vimeo/Drive tests;
- focused Stripe tests when billing files change;
- accessibility checks;
- performance budgets;
- full test suite when repository runtime permits.

Never place provider secrets in GitHub Actions.

Before merge:

- branch is based on current master;
- conflicts are resolved intentionally;
- migrations are additive/backward-compatible or have a tested rollback;
- focused and full tests pass;
- secret/security/generated-artifact/accessibility/performance checks pass;
- structured self-review is recorded;
- CI is green;
- the exact commit tested is the commit merged.

## 12.2 DNS/TLS

Verify `join.onetimeonetime.com` against the authoritative Railway custom-domain target.

If a DNS correction is needed and authenticated provider access exists, change only the minimum `join` record(s). Preserve:

- apex behavior unless a current requirement explicitly changes it;
- nameservers;
- MX/email records;
- DKIM/SPF/DMARC/Resend records;
- unrelated CNAME/A/TXT records;
- existing website/service records.

Then verify propagation, TLS issuance, canonical redirect behavior, expected page fingerprint, and no Railway target mismatch. Record redacted before/after values and rollback records. If authenticated DNS access is unavailable, do not block code/deployment work; report the exact record and provider action needed.

## 12.3 Exact-SHA deploy

For every merged runtime release:

1. record PR and merge SHA;
2. fast-forward local master only;
3. confirm a clean tree;
4. run the release gate;
5. record previous SHA/deployment as rollback target;
6. deploy One Time first;
7. run Railway doctor/target verification;
8. verify successful migration/readback;
9. verify `/api/deploy-info` equals the merge SHA and identifies `target_app=one-time`;
10. run public/authenticated/live-role smokes;
11. deploy BNA only if shared runtime changed;
12. if BNA deployed, prove BNA privacy/workspace/branding/auth regression;
13. update evidence only after success.

Automatically roll back on:

- auth or actor-identity failure;
- workspace/data leakage;
- failed/unsafe migration;
- repeated 5xx/blank core routes;
- broken landing/signup/CRM core path;
- missing private-link protection;
- material performance regression against the release candidate;
- integration loop/duplicate-message storm.

---

# 13. GATE 9 — REQUIRED EXACT-DEPLOYMENT LIVE VERIFICATION

Run the repository's current live-smoke packages and browser proof for:

- One Time separate-instance exact-SHA;
- canonical DNS/TLS and landing fingerprint;
- public landing/signup/double-submit;
- Shloimie global -> One Time admin context;
- no View as Rabbi/impersonation;
- provider route modules;
- CRM list/search/detail/actions;
- faded-name/contrast/first-click acceptance;
- mobile 430/390 flow;
- mailbox/email DTO;
- Communication Agents API/UI/runtime;
- WAPI inbound capture;
- public WhatsApp auto-reply activation/readback;
- delivery outbox and idempotency;
- Shloimie email/WhatsApp canaries;
- performance budgets and RUM/traces;
- workspace/privacy isolation;
- parent/member/student/classroom authorization;
- Vimeo synthetic workflow;
- Drive/classroom/member synthetic workflow;
- Stripe hosted TEST-mode lifecycle;
- current free-class Zoom-link fingerprint;
- BNA taxonomy/privacy/branding/auth regression if shared runtime changed.

Verify relevant UI at `1440`, `1024`, `768`, `430`, and `390`. Screenshots must contain no raw secrets, contact details, payment details, private messages, class links, or minors' data.

Do not mark the deployment verified from a build log alone. The exact deployed SHA, target application, role behavior, user journey, provider activation state, and rollback target must agree.

---

# 14. GATE 10 — RECONCILE SOURCE OF TRUTH, ISSUES, TASKS, AND ACTIVE RUN

Without deleting historical evidence, reconcile current pointers/status in:

- `BNA-START-HERE.md`;
- `SYSTEM-STATE.md` with a current dated section;
- active `run.json`;
- `STATUS.md`;
- `NEXT-SESSION.md`;
- `BATCH-STATUS.md`;
- `DEPLOYMENT.md`;
- `EVIDENCE.md`;
- `TEST-RESULTS.md`;
- `requirements.json`;
- `FINAL-REPORT.md` only after fresh verification;
- `TASKS.md`;
- relevant memory topics;
- `ops/execution-runs/latest.json`;
- release ledger/changelog.

Audit open issues/PRs/tasks for the One Time frontend audit, verifier loop, Agent Review, video production, Vimeo, Stripe #132, Communications, WhatsApp activation, DNS, Zoom, and deployment closeout.

For each, either:

- close it with current merge/deployment/live evidence;
- supersede it with a cross-linked replacement;
- leave it open with one current blocker, responsible party, and exact next action;
- archive it only when it is truly obsolete.

Remove stale branches/worktrees only after confirming every unique commit is merged, archived, or intentionally superseded.

Run final current equivalents of:

```bash
npm test
npm run bna:run:validate
npm run bna:run:source-coverage
npm run bna:run:stale-evidence
npm run production:readiness:gate -- --json
npm run secrets:audit
npm run watchdog:actions
npm run watchdog:security
git diff --check
git status --short
```

Seal the authoritative run only with its truthful terminal status. A valid release can contain a narrowly identified `blocked_external` lane, but the report must never present that lane as live.

---

# 15. REQUIRED EVIDENCE MATRIX

Create one row per requirement/workstream with these columns:

| Requirement | Expected behavior | Baseline | Source files | Branch/PR | Local tests | Sandbox/provider proof | Merge SHA | Deployment ID/SHA | Live role/device proof | Activation state | Cleanup | Rollback | Final status | Blocker/next action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Mandatory rows:

- Shloimie identity/context switch;
- removal of View as Rabbi;
- workspace isolation;
- CRM names/first-click/content UI;
- public/authenticated performance;
- landing/copy/assets/signup;
- WAPI capture;
- Shloimie email canary;
- Shloimie WhatsApp canary;
- public WhatsApp auto-reply;
- Resend;
- Communication Agents;
- Telegram disabled/readiness state;
- Stripe Billing V2;
- Drive/edit/transcription;
- Vimeo app/token/upload/delete;
- classroom/member publication;
- current Zoom-link invariant;
- parent/member/student access;
- CI/PR/deployment/DNS/rollback;
- source-of-truth/run reconciliation.

---

# 16. FINAL RESPONSE CONTRACT

Do not finish only in chat. Write and seal the authoritative result in the execution run/Operations system, then provide the final concise handoff.

The final report and final response must include:

1. current `origin/master` SHA;
2. every PR merged, closed, or superseded;
3. exact One Time deployed SHA and Railway deployment ID/status;
4. exact BNA deployed SHA/ID when applicable;
5. previous rollback SHA/deployment;
6. every test command and outcome;
7. every exact-SHA live smoke and outcome;
8. before/after performance measurements with median/p95 and device/network conditions;
9. Shloimie role/context results and audit actor proof;
10. confirmation that View as Rabbi is absent from the normal One Time path;
11. CRM faded-name, first-click, mobile, and content-UI results;
12. Shloimie canary counts: email `0 or 1`, WhatsApp `0 or 1`;
13. whether public WhatsApp auto-reply is active for all valid new inbound senders;
14. WhatsApp activation watermark, kill switch, idempotency, opt-out, and rollback proof;
15. Stripe mode (`test` or `live`) and full lifecycle result;
16. whether any real charge/refund/subscription/access mutation occurred;
17. Vimeo account/app resolution and synthetic upload/delete result;
18. Drive/classroom/member synthetic proof and cleanup;
19. Zoom existing-free-link verification and managed-link state;
20. DNS/TLS/canonical-domain result;
21. all real emails/messages/media publications that occurred, if any;
22. all synthetic records cleaned up;
23. current source-of-truth files updated;
24. active-run terminal status;
25. remaining blockers, each with responsible party and one exact next action.

The assignment is complete only after the unblocked work is implemented, merged, deployed, live-verified, activated where approved, documented, and truthfully closed.
