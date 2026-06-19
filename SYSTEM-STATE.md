# BNA Current System State

Last updated: 2026-06-19

2026-06-19 One Time ramble/agent/integrations follow-up:
- Active run remains `ops/execution-runs/2026-06-18-bna-platform-completion/`;
  this was resumed, not restarted.
- Newest Drive source for Rabbi Elie / One Time was discovered as
  `2026-06-18-rabbi-elie-scheller.md` with Drive ID
  `1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI`.
- A local no-write parser/preview now maps that brief into scoped One Time
  Decisions, Tasks, Calendar, Content, Community, Integration records, and
  Notes with deterministic idempotency keys. Evidence:
  `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/`.
- Operations Content > Meeting Drops has a `Preview Drive Brief` action. It
  shows counts, owner/admin assignments, idempotency, secret-scan status, and
  credential blockers without creating production rows.
- Local One Time seed model: Rabbi Elie Scheller is project owner / owner;
  Shloimie is project admin / manager. Legacy `ONE_TIME_OPS_USERNAME` remains
  manager compatibility, not owner.
- Secure Vimeo, Zoom, Resend, and operator credential handoff docs exist under
  `docs/integrations/`. Live provider setup remains blocked on external owner
  credentials/actions and explicit approval.
- Corrected active-run requirements so non-screenshot work no longer waits on
  the UI audit package; only screenshot-specific visual findings depend on the
  uploaded audit evidence.

2026-06-18 durable ramble-to-done execution-run setup:
- New GitHub/Codex sessions should start with `BNA-START-HERE.md`, then read
  `docs/BNA-RAMBLE-TO-DONE.md` and the run pointed to by
  `ops/execution-runs/latest.json`.
- Active run: `ops/execution-runs/2026-06-18-bna-platform-completion/`.
- The June 18 UI remediation areas imported into the run remain blocked on:
  `Waiting for user to upload agent-review-package.zip or audit output path`.
- The existing Operations UI audit harness from PR #2 is not replaced by this
  protocol setup.

2026-06-17 universal agentic goal-memory/watchdog hardening closeout:
- Completed `RAW-20260617-005` / `GOAL-20260617-005`, the downloaded
  universal agentic goal memory and watchdog hardening prompt.
- Future rambles, GPT/Codex output packets, helper messages, class recordings,
  communications, contact/provider/accounting items, student observations, and
  research notes now have a raw-first intake and goal-memory path with stable
  IDs, parsed lanes, goal candidates, action/route registry coverage, watchdog
  checks, repair-task hooks, and evidence-required closeout.
- Added durable source-of-truth files: `QUALITY-GOALS.md`, `GOAL-MODE.md`,
  `AGENTIC-MEMORY.md`, `memory-topics/`, `ops/action-registry.json`,
  `ops/route-registry.json`, goal/watchdog audit READMEs, raw fallback docs,
  and the dated install register
  `tasks-pending/2026-06-17-universal-agentic-goal-memory-watchdog-hardening.md`.
- Added runtime/parser/watchdog layer:
  `railway-migration-2026-06-17-agentic-goal-memory.sql`,
  `src/lib/bna/intake-schema.js`, `src/lib/bna/goal-registry.js`,
  `src/lib/bna/goal-memory.js`, `src/lib/bna/ramble-protocol.js`, hardened
  `src/lib/bna/intake-parser.js`, helper tools `capture_raw_intake`,
  `show_goal_status`, `run_watchdog_audit`, and package watchdog scripts.
- Verification passed: focused hardening tests 11/11, full `npm test`
  713/713, `npm run watchdog:all`, OpenAI/Kimi sidekick smoke
  `ops/openai-smokes/2026-06-17T12-00-36-308Z-openai-sidekick-smoke.md`,
  Railway deployment `a2a5bf56-4661-4063-8ead-e1c66010ac9e`, Railway doctor
  `SUCCESS`, live app smoke
  `ops/live-smokes/2026-06-17T12-03-49-136Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T12-04-00-461Z-public-route-privacy-smoke.md`,
  and Operations helper smoke
  `ops/live-smokes/2026-06-17T12-03-48-493Z-operations-helper-live-smoke.md`.
- New targeted watchdog reports had zero findings after fixes. The general
  watchdog report `ops/watchdog-audits/2026-06-17T12-09-watchdog-audit.md`
  still lists seven older queue/proof hygiene findings that pre-date this
  install.
- Closeout audits:
  `ops/goal-audits/2026-06-17-goal-memory-install-audit.md`,
  `ops/watchdog-audits/2026-06-17-watchdog-install-audit.md`, and
  `ops/raw-intake-audits/2026-06-17-raw-intake-backfill-plan.md`.
- Commit was not performed because the worktree contains extensive
  pre-existing mixed-scope dirty changes; no files were staged.

2026-06-17 final website correction register closeout:
- Completed the remaining pending rows: `REQ-20260616-003`,
  `REQ-20260616-004`, `REQ-20260616-061`, `REQ-20260616-062`, and
  `REQ-20260616-065` through `REQ-20260616-069`.
- Final register status is 69 Done, 1 Blocked, 0 Pending. The only blocked
  item is `REQ-20260616-030`, live Rabbi payment-link creation, pending
  explicit Stripe or Green Invoice choice plus credentials/payment links.
- Recording-intake and content-backed mixed recording parsing now share the
  canonical raw-first intake path with rambles. Stale content job `27` was
  reprocessed live into `RAW-20260617-004` / parse run `4`; the rerun audit
  found zero older open raw rows, zero pending uploads, and zero unparsed
  transcript jobs.
- Public provider flow now connects homepage provider CTA, provider index,
  join route, provider portal, first-party classroom setup, and provider plans.
- Final desktop/mobile Browser audit passed for homepage, provider, and
  Operations final surfaces after fixing homepage slide-in media overflow.
- BNA internal calendar/classroom is the working source of truth. Google
  Calendar/Classroom remain guarded coming-soon connectors.
- Provider/workspace API-key settings now expose encrypted-storage copy,
  secret references, rotation reminders, and helper save/rotate controls
  without exposing secrets.
- BNA Helper now plans guarded `create_automation` and `update_automation`
  actions for local automation and billing workflow metadata only, with no
  external sends, syncs, charges, or publishing.
- Verification passed: syntax checks, full `npm test` 702/702, local Browser
  proof `ops/playwright-smokes/2026-06-17-final-register-surfaces-local/report.md`,
  Railway deployment `b3b7e0f6-1f07-4ec1-8ff4-f65c701ff58d`, Railway doctor
  `SUCCESS`, final live app smoke
  `ops/live-smokes/2026-06-17T11-22-42-701Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T11-23-39-214Z-public-route-privacy-smoke.md`,
  and final register-surface smoke
  `ops/live-smokes/2026-06-17T11-24-18-485Z-final-register-surfaces-live-smoke.md`.
- Proof bundle: `ops/system-audits/2026-06-17-final-register-surfaces-audit.md`.
- Final watchdog proof: `ops/watchdog-audits/2026-06-17T11-28-watchdog-audit.md`;
  it reported zero ramble-protocol findings, no UI issues, and no
  repo/source-of-truth drift for this closeout while preserving older
  queue/proof hygiene findings.

2026-06-17 Content/research scope closeout:
- Completed `REQ-20260616-047` through `REQ-20260616-052`.
- Content jobs and class sessions now accept explicit `project_key` / `project`
  filters. Operations Content loads jobs, class sessions, and meetings through
  the active workspace project key so BNA and One Time content do not bleed
  into each other.
- BNA admin Prompt Library reads API `prompt_text`, lazily refreshes slow prompt
  loads, and shows 11 prompt previews in readable light-theme cards.
- Operations Content Research is direct-linkable/mobile-safe and backed by
  scoped class-session data, with source-sheet and public-bibliography task
  actions remaining first-party review tasks only.
- Student portal keeps an anonymous-safe shell while authenticated student
  payloads use portal-safe question views with source/follow-up enrichment.
- Audit/proof: `ops/system-audits/2026-06-17-content-research-scope-audit.md`.
- Verification passed: focused content/portal tests 37/37, full `npm test`
  692/692, local targeted smoke
  `ops/live-smokes/2026-06-17T10-04-36-603Z-content-research-scope-live-smoke.md`,
  local browser proof
  `ops/playwright-smokes/2026-06-17-content-research-scope-local/report.md`,
  Railway deployment `b695d66b-da92-4d00-8a9b-e8a0035334d5`, live app smoke
  `ops/live-smokes/2026-06-17T10-08-41-988Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T10-08-54-466Z-public-route-privacy-smoke.md`,
  and targeted live content/research smoke
  `ops/live-smokes/2026-06-17T10-08-41-217Z-content-research-scope-live-smoke.md`.
- Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T10-16-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift
  while preserving older queue/proof hygiene findings.

2026-06-17 Provider classroom/settings closeout:
- Completed `REQ-20260616-043` through `REQ-20260616-046`.
- Service-provider classroom/community setup can now be drafted from natural
  language through `create_provider_classroom_draft`, exposed in the shared
  action registry, BNA Helper planner, Telegram routing, and provider portal.
- Classroom drafts are first-party BNA task/setup records only. The path records
  class count, dialogue style, student access, display rules, message
  permissions, private student-to-teacher replies, moderation requirement, and
  public-display intent, while explicitly avoiding Google Classroom writes,
  payments, access grants, live sends, and external writes.
- Operations Provider Onboarding and One Time classroom settings expose
  classroom/community setup controls, class/member lists, teacher posts,
  questions/replies, private student replies, no student-student chat by
  default, and display/publish controls.
- Provider Index settings are reorganized into Public Provider Index, Provider
  Plans, Provider Entitlements, Provider Onboarding, and Commercial Models with
  `Free for now` visible.
- Verification passed: focused action/helper/provider tests 46/46, full
  `npm test` 689/689, local targeted smoke
  `ops/live-smokes/2026-06-17T09-26-25-520Z-provider-classroom-settings-live-smoke.md`,
  local desktop/mobile browser proof
  `ops/playwright-smokes/2026-06-17-provider-classroom-settings-local/report.md`,
  Railway deployment `b0fa9953-9529-45d8-a56d-c74d428154ff`, live app smoke
  `ops/live-smokes/2026-06-17T09-31-13-642Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T09-31-23-384Z-public-route-privacy-smoke.md`,
  and targeted live provider/classroom smoke
  `ops/live-smokes/2026-06-17T09-31-12-926Z-provider-classroom-settings-live-smoke.md`.

2026-06-17 Operations settings/dashboard/integrations/automations closeout:
- Completed `REQ-20260616-032` through `REQ-20260616-042`.
- Dashboard overview now has one compact context strip for workspace, role,
  view, and filter state; alert metric cards render on the Alerts subview
  instead of duplicating on overview.
- Settings category pages now use compact leaf tabs/pills. Users & Roles,
  Learning Portal Access, Bots & AI usage limits, Billing & Payments, real
  Integrations, Google Calendar/Classroom, and Automation Center each expose a
  clearer operator-facing settings surface.
- Real integrations are separated into Resend Email Provider, Buffer Social
  Scheduler, WAPI/WhatsApp, Payment Provider, Google Calendar, and Google
  Classroom cards. Secret/token copy uses provider-scoped secret-reference
  wording; the live smoke confirmed no `BUFFER_API_KEY` or `RESEND_API_KEY`
  strings are exposed in Operations UI.
- Google Calendar and Google Classroom remain `Coming soon / internal-first`;
  BNA internal calendar/classroom are the current source of truth until Google
  sync is explicitly approved.
- Automation Center rows now surface name, purpose, trigger, action,
  workspace, enabled/disabled status, last-run evidence, and Edit/Details, plus
  a `Create automation with helper` entry that opens the helper without running
  external writes.
- Verification passed: focused Operations/settings tests, full `npm test`
  684/684, local desktop/mobile browser proof
  `ops/playwright-smokes/2026-06-17-operations-settings-dashboard-local/report.md`,
  Railway deployment `5bd23d08-d44b-41ea-b8f1-5fca56edad80`, Railway doctor
  `SUCCESS`, live app smoke
  `ops/live-smokes/2026-06-17T08-58-38-007Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T08-58-23-715Z-public-route-privacy-smoke.md`,
  and targeted Operations smoke
  `ops/live-smokes/2026-06-17T08-58-37-286Z-operations-settings-dashboard-live-smoke.md`.
- Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T09-04-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift.

2026-06-17 safe OpenAI keyholder / Kimi fallback closeout:
- Completed `REQ-20260616-031`.
- OpenAI loading now supports the outside-repo BNA keyholder alias
  `openaiv2.txt` across `server.js`, the Telegram bridge, the OpenAI smoke,
  keyholder diagnostics, and OpenAI diagnostics. The key was not copied into
  the repo, `.secrets`, Railway, screenshots, logs, or chat.
- Diagnostics now redact key/token/secret-looking error text and report only
  source metadata, fingerprints, and OpenAI request IDs. Existing key-shaped QA
  artifact fragments were redacted; the QA artifact scan now finds no remaining
  long `sk-...` strings outside secret storage.
- Verification passed: syntax checks, focused AI/keyholder tests 23/23, full
  `npm test` 676/676, keyholder diagnostics
  `ops/qa-runs/2026-06-17T08-07-21-079Z-keyholder-diagnostics.md`, OpenAI
  diagnostics `ops/qa-runs/2026-06-17T08-07-32-779Z-openai-diagnostics.md`,
  OpenAI primary smoke
  `ops/openai-smokes/2026-06-17T08-12-06-839Z-openai-sidekick-smoke.md`, Kimi
  fallback/temporary-primary smoke
  `ops/openai-smokes/2026-06-17T08-13-22-082Z-openai-sidekick-smoke.md`,
  Railway deployment `4381af8c-e48c-4d86-9997-1fe319a5acfa`, live app smoke
  `ops/live-smokes/2026-06-17T08-11-48-107Z-live-app-smoke.md`, and public
  privacy smoke
  `ops/live-smokes/2026-06-17T08-11-58-671Z-public-route-privacy-smoke.md`.
- Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T08-22-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift
  while preserving older queue/proof hygiene findings.
- Production/Railway still has the old OpenAI env fingerprint and should only
  be rotated after explicit operator approval. Until then,
  `BNA_AI_PRIMARY_PROVIDER=kimi` remains valid for production hosted chat.

2026-06-18 academy Telegram OpenAI-primary / Kimi-fallback closeout:
- The academy Telegram worker now runs OpenAI primary with Kimi fallback.
- OpenAI diagnostics passed locally through the keyholder `openaiv2.txt`
  source; the raw key was not printed, copied, or committed.
- Telegram text-generation paths that were previously OpenAI-only now use the
  shared OpenAI/Kimi provider chain: WhatsApp drafts, Facebook drafts, weekly
  reports, transcript topic inventories, content titles, content draft
  revisions, and image descriptions. OpenAI remains required for audio/video
  transcription.
- Worker code deployment `d4df557d-c041-4293-add1-e8ccd8f0bc79` reached
  `SUCCESS`.
- Worker provider-order deployment `ae652bb9-572d-4a22-b2e9-ecc9dae5cb9a`
  reached `SUCCESS`; startup log showed
  `ApiPath=OpenAI API (gpt-4.1-mini) -> Kimi API (kimi-k2.6)`,
  `OpenAIKey=yes`, and `KimiKey=yes`.
- Verification passed: focused Telegram/provider tests 24/24, full
  `npm test` 784/784, OpenAI diagnostics PASS, Kimi API health check status
  200, Telegram status API configured with no blockers, and Telegram webhook
  pending updates 0.

2026-06-17 Rabbi Scheller / OneTime landing closeout:
- Completed `REQ-20260616-028` and `REQ-20260616-029`.
- `REQ-20260616-030` is terminal `Blocked` for live payment-link creation:
  $67/$149 pricing and UI/config placeholders are implemented, but no local
  Stripe or Green Invoice key/link was configured for creating live payment
  links.
- `/rabbi`, `/rabbi-preview`, and `/one-time-mishnayos` serve the BNA-owned
  OneTimeOneTime service-provider landing preview. The page is noindex,
  preview-only, black/white/bright-yellow, uses the existing OneTime preview
  image, and does not replace the BNA homepage.
- Public tier API and UI now expose `$67` and `$149`; Stripe and Green Invoice
  checkout buttons stay disabled with explicit setup-blocked copy until a
  provider link/key is configured. No live charge, access grant, email,
  WhatsApp, social post, DNS write, upload, or external connector write was
  performed.
- Verification passed: focused Rabbi/provider/privacy tests 28/28, full
  `npm test` 675/675, local Browser proof
  `ops/playwright-smokes/2026-06-17-rabbi-onetime-landing-local/browser-smoke.json`,
  local scripted smoke
  `ops/playwright-smokes/2026-06-17-rabbi-onetime-landing-local/2026-06-17T07-47-55-000Z-rabbi-onetime-landing-smoke.md`,
  Railway deployment `9c24a5ba-320e-4e39-bc33-8228d51e72b4`, live app smoke
  `ops/live-smokes/2026-06-17T07-50-32-133Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T07-50-42-044Z-public-route-privacy-smoke.md`,
  Rabbi landing smoke
  `ops/live-smokes/2026-06-17T07-50-31-511Z-rabbi-onetime-landing-smoke.md`,
  and live Browser proof
  `ops/playwright-smokes/2026-06-17-rabbi-onetime-landing-live/browser-smoke.json`.
- Post-closeout watchdog proof:
  `ops/watchdog-audits/2026-06-17T07-56-watchdog-audit.md`; it reported zero
  ramble-protocol findings, no UI issues, and no repo/source-of-truth drift
  while preserving older broad queue hygiene findings.

2026-06-17 public/portal navigation and positioning closeout:
- Completed `REQ-20260616-020`, `REQ-20260616-021`, `REQ-20260616-025`,
  `REQ-20260616-026`, and `REQ-20260616-064`.
- The current public top nav is grouped as `Explore` for School, Families, and
  Service Providers, plus `Portal Login` for Parent Login, Student Login,
  Provider Portal, and Operations Login. Public portal links route to safe
  entry points only: `/parent/login`, `/student/login`, `/provider`, and
  `/operations-login.html`.
- Parent, student, provider, and parent-login portal pages now include
  consistent topbar links back to the public site and related safe entry pages.
- Homepage positioning now separates Schools / AI Microschool, Families /
  Parent App, and Service Provider Network, and includes one-man Jewish AI
  microschool, natural-language school management, AI overhead reduction, and
  better rabbi pay messaging.
- Verification passed: focused public/portal tests 34/34, full `npm test`
  675/675, local Browser proof
  `ops/playwright-smokes/2026-06-17-public-navigation-positioning-local/report.md`,
  Railway deployment `f0bfc896-88ae-4752-b331-7a02c06566b3`, live app smoke
  `ops/live-smokes/2026-06-17T07-20-54-869Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-17T07-21-05-219Z-public-route-privacy-smoke.md`,
  and public-navigation smoke
  `ops/live-smokes/2026-06-17T07-20-54-368Z-public-navigation-positioning-smoke.md`.

2026-06-16 on-page scoped helper / tool parity local update:
- Added the page-native scoped helper foundation requested in
  `C:\Users\User\Downloads\2026-06-16-codex-on-page-scoped-helper-tool-parity-prompt (1).md`.
- New helper modules cover scope resolution, safety policy, profile and
  questionnaire storage, scoped knowledge, confirmation gates, and planner
  compatibility under `src/lib/bna/helper/`.
- Helper registry/client metadata now includes side-effect level, allowed
  scopes, required role, confirmation policy, and audit metadata; scoped
  permissions prevent provider, parent/family, and student helpers from using
  global admin or cross-scope tools.
- Startup SQL and `railway-migration-2026-06-16-helper-profile-knowledge.sql`
  add `bna_helper_action_log`, `bna_helper_profiles`, and
  `bna_helper_knowledge_items`; the canonical tool audit log remains in place.
- Operations now exposes a scoped helper card with helper name, access summary,
  tool count, safety level, suggested actions, and `Teach helper`.
- Generated helper parity artifacts:
  `ops/helper-tool-parity-map.md` and `ops/helper-tool-parity-map.json` with
  254 records across Operations, parent, provider, Rabbi, and student surfaces.
- Local proof passed: `npm run helper:parity`, `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`, focused helper tests
  14/14, desktop/mobile Playwright Operations launcher smoke with screenshots
  under `screenshots/helper-parity-operations-*.png`, and full `npm test`
  666/666.
- This update did not deploy, apply live migrations, send email/WhatsApp/social
  posts, upload video, change DNS, charge payments, grant accounts, copy
  credentials, publish public/member content, or perform external writes.

2026-06-16 ramble watchdog / self-healing operating-system update:
- Added the repo watchdog rules at `ops/watchdog-rules.md`.
- Added `npm run watchdog:audit` through `scripts/watchdog-audit.mjs`; reports
  write to `ops/watchdog-audits/`.
- Added GOAL-009 in `ops/operating-goals.md` and
  `ops/operating-goals.json` for ramble watchdog / goal-led work until done.
- Extended prompt intake records with stable prompt IDs, source type, linked
  goal IDs, linked decision/pending arrays, and linked proof path aliases.
- Added and deployed the Operations `Watchdog` module and allowed-view
  defaults for the control center.
- Current watchdog cleanup report:
  `ops/watchdog-audits/2026-06-17T13-26-watchdog-audit.md`; severity is ok with
  zero findings. The prompt register now has zero unmapped sources and zero
  prompt sources without a durable path. Remaining choice: whether audits stay
  explicit commands or become an automatic Downloads/attachments monitor.
- Deployed commit `3b34755` to Railway production deployment
  `fac52051-3b45-4f41-ab7e-22df8789f32d`; Railway doctor reached `SUCCESS`.
- Live proof passed: `npm run app:smoke`,
  `npm run app:smoke:public-privacy`, `npm run app:smoke:student-auth`,
  `npm run app:smoke:operator-setup`,
  `npm run app:smoke:onboarding-intake`,
  `npm run app:smoke:signup-credit-email-preview`,
  `npm run app:smoke:ws11-parent-progress`, live Watchdog browser smoke
  `ops/live-smokes/2026-06-16T15-20-14-711Z-watchdog-live-smoke.md`, and
  direct authenticated readback that `allowedViews` includes `watchdog` and
  integration status still returns 15 redacted cards.
- This update did not send, publish, charge, change DNS, upload video, grant
  access, copy credentials, or perform external writes.

2026-06-16 operating goals and UI closeout register update:
- Added durable operating-goals registers:
  `ops/operating-goals.md` and `ops/operating-goals.json`.
- Added the One Time Thursday owner-access checklist at
  `ops/thursday-access-checklist.md`, including Zoom, GoDaddy/DNS, Vimeo,
  Resend, Buffer, WAPI/WhatsApp, Stripe, Google Drive, and old One Time app
  preservation/migration gates.
- Added UI closeout consolidation at
  `ops/ui-audits/2026-06-16-ui-closeout.md` with curated screenshot proof under
  `ops/ui-audits/2026-06-16/`. This consolidates existing UI-01, HELPER-03,
  INT-05, RABBI-04, and COMMUNITY-06 local proof.
- This update did not perform external sends, billing, checkout creation,
  Zoom/Vimeo writes, Buffer publishing/scheduling, WAPI sends, DNS changes,
  Google writes, account grants, credential copying, or a new live deployment.

2026-06-16 One Time integrations/access/agent audit deployed and verified:
- Completed cycle `2026-06-16-one-time-integrations-access-agent-audit` after
  the operator asked to clean/stabilize the dirty multi-agent worktree, make
  natural-language updates/deploys reliable, and audit why requests were not
  reaching honest completion.
- Release branch:
  `codex/one-time-integrations-access-audit-2026-06-16`. Stabilization commit:
  `35e0571` (`chore: stabilize provider integrations and release state`);
  deployed closeout tip: `a2d29e6`
  (`docs: record deployment closeout and prompt intake`).
- Built and deployed the provider-scoped integration foundation: additive
  `bna_provider_integrations` fields, `bna_provider_secret_refs`,
  `bna_provider_integration_audit_log`, expanded DNS task fields/statuses,
  migration `railway-migration-2026-06-16-provider-integrations-secret-storage.sql`,
  WAPI and GoDaddy/DNS readiness cards, provider-owned integration status card,
  and `npm run integrations:audit`.
- Expanded BNA Helper with scoped, audited integration tools:
  `show_integration_status`, `create_integration_setup_task`,
  `save_provider_api_key`, `rotate_provider_api_key`,
  `test_resend_connection`, `test_buffer_connection`,
  `test_vimeo_connection`, `test_wapi_connection`,
  `mark_integration_blocked_until_thursday`, `create_dns_setup_task`,
  `prepare_vimeo_upload`, `mark_manual_vimeo_upload_needed`, and
  `attach_vimeo_url_to_library_item`. These tools store secret references and
  HMAC fingerprints only; raw pasted keys are not returned in helper output.
- Added a real Vimeo adapter surface for token normalization/redaction, auth
  readiness, folder/video listing, upload intent preview, manual URL attach,
  URL parsing, and actionable error mapping. API upload remains blocked unless
  account/token/upload access and approval are explicit; manual Vimeo upload
  plus paste-URL fallback is available.
- Created the evidence audit
  `ops/audits/2026-06-16-agent-work-gap-audit.md`. Finding: the main failure
  pattern was formerly local-only work piling up behind dirty-tree release
  coordination and external blockers, not Codex being unable to see the prompt
  material.
- Added the first canonical prompt intake register pass:
  `npm run prompts:audit`, `scripts/prompts-audit.mjs`,
  `ops/prompt-intake-register.jsonl`, `ops/prompt-intake-summary.md`,
  `ops/system-audits/2026-06-16-prompt-intake-register.md`, and
  `tasks-pending/2026-06-16-prompt-intake-register.md`.
- Cleaned release hygiene: removed staged runtime PID artifacts, added `*.pid`
  to `.gitignore`, passed `git diff --cached --check`, and confirmed the
  worktree was clean before deploy.
- Deployed Railway production deployment
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; Railway doctor reached `SUCCESS`.
- Verification passed: changed-file syntax checks, focused provider/helper/
  INT-05 tests 20/20, full `npm test` 654/654, `npm run secrets:audit` with
  2397 tracked paths checked and 0 tracked secret-risk files found,
  `npm run integrations:audit`, `npm run smoke:int05-integrations` locally
  with 15 cards/no mobile overflow, main live app smoke
  `ops/live-smokes/2026-06-16T14-58-54-693Z-live-app-smoke.md`, public privacy
  smoke `ops/live-smokes/2026-06-16T15-00-57-827Z-public-route-privacy-smoke.md`,
  student-auth smoke
  `ops/live-smokes/2026-06-16T15-00-50-386Z-student-auth-policy-live-smoke.md`,
  operator setup smoke
  `ops/live-smokes/2026-06-16T15-00-50-453Z-operator-setup-live-smoke.md`,
  assistant onboarding intake smoke
  `ops/live-smokes/2026-06-16T15-01-04-172Z-assistant-onboarding-intake-live-smoke.md`,
  signup credit email preview smoke
  `ops/live-smokes/2026-06-16T15-01-04-150Z-signup-credit-email-preview-live-smoke.md`,
  and WS11 parent-progress smoke
  `ops/live-smokes/2026-06-16T15-01-04-286Z-ws11-parent-progress-live-smoke.md`.
- Direct authenticated live read of `/api/bna/integrations/status` returned 15
  readiness cards from `https://bneineviimacademy.org`, including WAPI/
  WhatsApp, GoDaddy/DNS, provider-owned integration records, and Vimeo/video
  hosting; the payload check did not find raw secret patterns.
- Thursday blockers remain external/human-gated: Zoom Server-to-Server OAuth
  owner/developer access, GoDaddy Delegate/DNS access, Resend account/domain
  DNS, Vimeo account/API/upload readiness, Buffer account/channels, WAPI/
  WhatsApp ownership, and Stripe pricing/payment ownership.
- Still not approved/performed: live sends, charges, checkout creation, Zoom
  writes, Vimeo uploads, Buffer publishes/schedules, WAPI sends, DNS writes,
  account grants, credential copying, public/member publishing, and final
  pricing/legal/payment decisions.

2026-06-16 UI-01 public/Operations shell cleanup implemented locally:
- Public site shell strategy now uses the shared `bna-site-nav` navigation and
  footer across homepage, blog, FAQ, article, signup, provider, registration,
  and new audience pages. `BNAPages` delegates to the shared shell when the
  shared mounts are present.
- Public audience routes `/school`, `/parents`, `/families`, `/parent-app`,
  and Hebrew aliases are served from static public pages, while
  `/service-providers` remains the public provider directory. The visible top
  nav was later regrouped on 2026-06-17 under `Explore` and `Portal Login`.
  Public, parent, and Operations PWA manifest identities remain separate.
- Operations top shell now prioritizes actionable status chips for decisions,
  agent work, student accountability, and alerts. The redundant context strip
  and dead scoped-search input were removed.
- Operations uses one private helper entry path through the topbar/mobile
  header and the scoped helper drawer. The public `bna-bot-widget.js` launcher
  is not mounted inside Operations.
- Platform Operations navigation now includes the real Calendar module, so
  `/operations?view=calendar` stays on Calendar instead of falling back to the
  dashboard.
- Local verification passed `node --check server.js`, shared nav JS checks,
  executable inline-script parsing, focused UI tests 34/34, full `npm test`
  646/646, local authenticated browser screenshots in `screenshots/ui-01/`,
  and 375px no-horizontal-overflow smoke on public and Operations routes.
- Accumulated deploy was later completed in Railway deployment
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667` with Railway doctor and live smoke
  coverage. UI-specific visual/browser follow-up can still be run as a narrow
  QA task if more screenshot proof is needed.

2026-06-16 RABBI-04 OneTime Mishnayos product system implemented locally:
- Added a first-party draft product-system layer for Rabbi Scheller / OneTime
  Mishnayos: candidate tiers, regional noindex funnels, product decisions,
  interest leads, 7pm Israel schedule/calendar records, and fixture-only
  source-prep jobs.
- The new public `/one-time`, `/one-time/us`, `/one-time/uk`,
  `/one-time/israel`, `/one-time/interest`, and `/one-time/member-login`
  pages are draft/noindex and interest-only. Pricing remains
  decision-pending; there are no checkout buttons, payment provider writes, or
  member access grants.
- Operations now surfaces the OneTime product decisions, candidate pricing,
  regional funnels, first-party leads, calendar status, and source-prep status
  in the scoped provider workspace without external writes.
- Verification passed: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`, inline script parsing for
  `public/operations.html` and `public/one-time/index.html`, focused
  OneTime/Rabbi/assistant/UI tests 25/25, full `npm test` 646/646, and local
  desktop/mobile screenshot proof in `screenshots/rabbi-04/report.md`.
- Accumulated deploy was later completed in Railway deployment
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667` with Railway doctor and live smoke
  coverage. Final prices, tier names, refund/legal copy, billing provider
  readiness, launch copy, and any live sends, external writes, checkout,
  Zoom/Google/Drive/Buffer actions, or member grants still need explicit
  approval.

2026-06-16 COMMUNITY-06 additive extension deployed with live follow-up gates:
- Added first-party One Time Mishnayos assigned course questions and responses
  on top of the deployed WS11 community foundation, including additive schema
  SQL in `server.js` and `railway-migration-2026-06-16-community-06.sql`.
- Operations now has a Community module for courses, worksheets, course
  questions, approval queue, ledger, and parent preview readback. Student
  portal renders Mishnah Community progress and lets the authenticated/current
  access-code student answer assigned questions without setting visibility or
  approval fields. Parent portal APIs expose progress/activity/worksheets/
  questions/shoutouts only through parent-scoped guards and approved
  parent-visible rows.
- Verification passed local syntax checks, public inline script parsing,
  focused WS11/gamification/parent privacy tests 15/15, refreshed contract
  tests, full `npm test` 640/640, and local Playwright screenshots:
  `screenshots/community-06/operations-community-desktop.png`,
  `screenshots/community-06/operations-community-mobile.png`,
  `screenshots/community-06/student-community-desktop.png`,
  `screenshots/community-06/student-community-mobile.png`,
  `screenshots/community-06/parent-progress-desktop.png`, and
  `screenshots/community-06/parent-progress-mobile.png`.
- Parent screenshot proof remained at the login-gated parent portal because no
  parent password/access code was available locally and no parent credential was
  created or rotated. Accumulated deploy was later completed in Railway
  deployment `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; WS11 parent-progress live
  smoke passed. Additional parent visual proof still requires an approved
  parent credential/session path.

2026-06-16 INT-05 safe integrations closeout implemented locally:
- Added a protected consolidated integrations readiness/status API and
  Operations > Integrations > Readiness panel for keyholder/secrets, Google
  Drive, Telegram, Gmail/payment reminders, Resend, Stripe, Green Invoice,
  Buffer, Zoom, Vimeo/video hosting, archived GHL Social, and external-action
  gates.
- Integration readiness responses and UI cards show only redacted metadata:
  configured status, account-owner metadata, safe preview actions, blocked
  actions, and blockers. They do not expose raw tokens, keys, access codes, DNS
  secrets, or provider credentials.
- Added central external-action gate helpers and audit storage. Buffer
  schedule/publish, Resend send, Gmail payment reminders, Stripe checkout/live
  billing, Zoom meeting creation, video uploads, Google writes, and GHL writes
  require explicit confirmation before any external action can run.
- Resend provider sends now require the exact `SEND_RESEND_EMAIL` phrase in
  addition to verified-domain/account readiness, and write redacted
  external-action audit summaries.
- Exact protected integration namespace aliases exist for Telegram status,
  Buffer drafts/schedules, and Resend status/email-preview/send, while the
  existing Communications endpoints remain intact.
- Payment reminder scheduling is now default-disabled. Live scheduled payment
  reminders require both live mode and the exact
  `ENABLE_SCHEDULED_PAYMENT_REMINDERS` confirmation.
- Added provider-safe readiness/preview modules for Stripe, Zoom, and
  provider-neutral video hosting/Vimeo, plus separate Shloimie/BNA and Rabbi
  Resend profile handling.
- Added docs for Zoom setup, video-hosting decisions, and Telegram bridge
  reality. Zoom scope/account guidance was checked against official Zoom
  developer docs.
- Local verification passed: syntax checks, focused integration/redaction tests
  26/26, Operations inline-script parse, full `npm test` 649/649, tracked
  secret audit, and `npm run smoke:int05-integrations` with desktop/mobile/
  action-gate screenshots.
- Accumulated deploy was later completed in Railway deployment
  `db7ea5aa-c4cd-49df-9b74-f233c3e53667`; Railway doctor and live smoke
  coverage passed, and direct authenticated `/api/bna/integrations/status`
  readback returned 15 cards. No external sends, publishes, schedules,
  billing, Zoom/Vimeo writes, Google writes, DNS writes, account grants, active
  GHL runtime, or credential copying were performed.

2026-06-16 WS11 and Operator Setup targeted live closeout complete:
- Fixed a live WS11 startup migration gap: `createWs11CommunityGamificationSQL`
  now runs during normal DB startup and the compatibility migration route
  before `ensureWs11CommunityFoundation` seeds the One Time Mishnah community,
  course, and badges.
- Added repeatable targeted live smoke scripts:
  `scripts/smoke-ws11-parent-progress-live.mjs` and
  `scripts/smoke-operator-setup-live.mjs`, exposed as
  `npm run app:smoke:ws11-parent-progress` and
  `npm run app:smoke:operator-setup`.
- Railway deployment `7c8c7010-497c-41c7-a127-6370cca049eb` reached `SUCCESS`.
  Verification passed: `node --check server.js`, focused WS11/Operator tests,
  full `npm test` 621/621, Railway doctor, main live app smoke
  `ops/live-smokes/2026-06-16T11-01-05-357Z-live-app-smoke.md`, public privacy
  smoke
  `ops/live-smokes/2026-06-16T11-01-21-841Z-public-route-privacy-smoke.md`,
  student-auth smoke
  `ops/live-smokes/2026-06-16T11-01-04-242Z-student-auth-policy-live-smoke.md`,
  WS11 parent-progress smoke
  `ops/live-smokes/2026-06-16T11-00-29-396Z-ws11-parent-progress-live-smoke.md`,
  and Operator Setup smoke
  `ops/live-smokes/2026-06-16T11-00-45-574Z-operator-setup-live-smoke.md`.
- WS11 live smoke proved live tables/seed rows, anonymous parent WS11 lockout,
  temporary parent-session readback, and filtering of temporary unapproved
  gamification, shoutout, worksheet draft, and parent-progress report rows.
- Operator Setup live smoke proved Super Admin session access, hardened
  session cookie flags, no-secret package creation, blank sensitive env values
  in the safe package, and one-time download redemption.
- Still open: local laptop `npm run doctor` wants a usable local
  `DATABASE_URL`; queue cleanup decisions; WS06 Buffer/Resend credentials/DNS;
  and human product/legal/billing/account/asset decisions.

2026-06-16 full WS01-WS11 closeout plus parent-managed student login complete:
- Cycle `2026-06-16-full-ws-prompt-closeout-parent-student-login` was completed from
  `C:\Users\User\Downloads\2026-06-16-full-ws-closeout-parent-student-login-codex-prompt.md`,
  which points to authoritative attachment
  `C:\Users\User\.codex\attachments\a1e0641b-6e96-450e-b6ea-fb46b5ef62c1\pasted-text.txt`.
- Parent-managed student username/password login is deployed while preserving
  current private access-code links as rollout fallback.
- Parents can create/reset a student username/password from the authenticated
  parent portal for linked students only; students get a separate session
  cookie from parent and Operations sessions; student self-reset remains out of
  scope for v1.
- Railway deployment `dfbc65fa-fec4-4633-b45f-93adce342cc4` reached SUCCESS.
  Verification passed: `node --check server.js`, portal inline script parse,
  focused auth/portal/privacy tests 35/35, full `npm test` 620/620, local
  screenshot smoke
  `ops/playwright-smokes/2026-06-16-parent-student-login-local/report.md`,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-16T07-12-31-276Z-live-app-smoke.md`, public privacy
  smoke
  `ops/live-smokes/2026-06-16T07-12-37-866Z-public-route-privacy-smoke.md`,
  and student-auth audit smoke
  `ops/live-smokes/2026-06-16T07-14-26-412Z-student-auth-policy-live-smoke.md`.
- External-gated lanes remain blocked unless explicit approval/test fixtures
  exist: external sends, Google writes, Buffer publishes/schedules, billing,
  payment collection, Zoom/Vimeo writes, member publishing, account grants,
  credential copying, DNS/account setup, and live real-credential creation.
- WS01-WS11 matrix is recorded in
  `tasks-pending/2026-06-16-full-ws-closeout-parent-student-login.md`; remaining
  open items are live DB/readback, credential/DNS/account, and human
  legal/billing/product/asset decisions where noted.

2026-06-16 fullclean/debug/deploy/audit closeout:
- Deployed the accumulated local BNA app bundle to Railway production service
  `skillful-motivation`; deployment
  `81912f69-e43f-4131-96f1-a6b26bb95166` reached `SUCCESS`.
- Verified the production app after deploy with Railway doctor, main live app
  smoke, public route privacy smoke, student auth policy smoke, assistant
  onboarding intake smoke, signup credit email preview smoke, AI sidekick smoke
  through the configured Kimi fallback provider, and guarded dry-run email
  smoke.
- Local verification before deploy passed syntax checks, public/Operations
  inline-script parsing, full `npm test` 617/617, `git diff --check` with only
  line-ending warnings, `npm run ops:audit-queue`, and
  `npm run task:rabbi-flow-audit`.
- Non-destructive cleanup performed: stopped stale local `server.js` processes
  on ports `8092` and `8098`, and removed the generated `.deploy-railway`
  bundle after Railway accepted the deployment. Source files, task records, and
  runtime proof logs were not deleted.
- Current local doctor caveat: `npm run doctor` still cannot fully pass on this
  laptop because the local `.env.local` database URL is not usable for doctor;
  production health and DB-backed live smokes passed through Railway secrets.
- Audit findings: Operations queue audit reported 6 active fresh items, 117
  active stale items, 19 blocked, 23 pending Shloimie, 73 pending external, 306
  completed verified, 25 done missing report, 230 duplicate, 55 abandoned
  unknown, and 546 do-not-redo. Rabbi/One Time audit found 242 related tasks,
  188 human blockers/decisions, and 0 Codex-ready items. The obvious next
  upgrades are queue cleanup/reconciliation, missing local DB configuration,
  and human/credential/DNS/account decisions rather than new unstarted code.

2026-06-15 WS04 Operations queue/audit reconciler deployed:
- Added a normalized Operations queue-health model and `npm run ops:audit-queue`
  CLI that reconciles `AGENTS.md`, `TASKS.md`, `SYSTEM-STATE.md`, the
  agent ledger/changelog, fleet run proofs, pending briefs, runtime locks,
  ops proof artifacts, and live task data into stable statuses:
  `active_fresh`, `active_stale`, `blocked`, `pending_shloimie`,
  `pending_external`, `completed_verified`, `done_missing_report`,
  `duplicate`, `abandoned_unknown`, and `do_not_redo`.
- Added protected Operations APIs for queue health, latest audit readback,
  allowlisted report-file serving, and conservative Codex-owned requeue.
  Requeue is only surfaced for machine-owned stale/unknown live task items
  and never for completed, duplicate, blocked, pending-human, pending-external,
  or do-not-redo work.
- Operations Tasks now shows a Queue Health panel/table, task/detail audit
  badges, safe proof links through `/api/bna/ops/report`, and visible requeue
  controls only for safe items. The agent fleet now writes `run_id` and
  `heartbeat_at`, refreshes active locks while running, appends normalized
  started/done/blocked ledger records, and includes queue-health counts in
  `npm run agent:fleet:status`.
- Latest local audit artifact: `ops/queue-audits/latest.json` generated
  `2026-06-15T14:54:29.762Z` with 846 live/deployed items on Railway,
  5 safe Codex-owned requeue candidates, and all unknowns surfaced rather
  than hidden.
- Verification passed: queue reconciler syntax/checks, focused queue/UI/fleet
  regression tests 16/16, `npm run ops:audit-queue`, JSON audit mode,
  `npm run agent:fleet:status`, local in-app Browser Operations queue panel
  smoke, Railway deployment `5650e674-7717-4a10-b306-f64eb4a72698` SUCCESS,
  Railway doctor SUCCESS, final live app smoke
  `ops/live-smokes/2026-06-15T15-04-05-384Z-live-app-smoke.md`, and live
  queue/report-link smoke (`/api/bna/ops/queue-health?latest=1` 200,
  protected report link 200).
- Broad `npm test` remains blocked by unrelated pre-existing dirty workspace
  contract drift: `tests/workspace-person-household-provider-contract.test.js`
  rejects a legacy `Parent Households` marker that the dirty Operations HTML
  still contains. WS04 targeted coverage passed.

2026-06-15 WS07 Automation Center compact layout implemented locally:
- Added first-party `bna_automations` and `bna_automation_runs` registry
  tables with non-destructive migration SQL, startup bootstrapping, and default
  BNA/One Time automation metadata seeds.
- Added protected Operations APIs for listing automation registry rows, reading
  detail with recent runs and related tasks, and editing safe metadata only.
  Project-scoped Operations users can read their project automations but cannot
  patch registry metadata.
- Operations now has a first-class Automations view separate from Settings >
  Automation Library. The compact center shows filters, dense rows, owners,
  workspace/package/service metadata, setup blockers, recent runs, related
  tasks, and guarded metadata editing without live run/enable controls.
- Local verification passed: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`, Operations inline-script
  compile, focused Automation Center/Library tests, and full `npm test`
  587/587. Local browser smoke reached the protected Automation Center shell
  with filters and clean empty state and no console errors.
- Live completion remains blocked because the configured database host
  `db.amipeuneopdbzuhlnimt.supabase.co` did not resolve from this machine.
  Registry-row readback, migration application, deploy, Railway doctor, and
  live smoke still need reachable database/deployment access.

2026-06-15 Local Classroom-first and Buffer draft-only flow deployed:
- Operations Students > Classroom now uses a first-party Classroom layout with
  Stream, Classwork, People, Calendar, and Review lanes over existing BNA
  assignment/schedule data. It explicitly works without Google Classroom OAuth.
- Google Classroom/Calendar sync remains optional, visibly gated, and secondary
  to the internal BNA classroom/calendar.
- Rabbi Elie Scheller / One Time now has a local classroom/content handoff in
  Operations Content > One Time Library for class sessions, assignments and
  materials, source sheets, worksheets, recordings, questions, and reviewable
  content outputs.
- One Time member-library publishing, public/member Q&A, notifications,
  rewards, and leaderboards remain approval-gated. The current implementation
  is classroom/content handoff and readback, not public publishing.
- Buffer social approval is draft-only. Social outputs store Buffer draft id/
  status metadata and record any requested publish intent as blocked by policy;
  no auto-publish or mass scheduling is triggered.
- Email remains the current manual/Gmail-style low-volume path. Resend readiness
  remains visible as an integration, but Resend campaigns and warm email
  automation are not required for the classroom/social flow.
- Verification passed: focused classroom/social tests, full `npm test` 578/578,
  Railway deployment `1fefad7b-38a2-463f-86bd-ec43df529f2b` SUCCESS, Railway
  doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T14-50-29-888Z-live-app-smoke.md`, and targeted
  live classroom smoke
  `ops/playwright-smokes/2026-06-15-local-classroom-buffer-draft-live/report.md`.

2026-06-15 WS08 workspace directory model implemented locally; superseded by the 2026-06-17 deployed taxonomy closeout:
- Operations now has a protected `/api/bna/workspace-directory` read endpoint
  that builds the visible workspace directory from existing project/workspace
  data, filters it by the logged-in Operations scope, and returns only the
  approved display categories: `Super Admin`, `School`, `Service Provider`,
  and `Family`.
- The Operations sidebar and Admin > Workspaces directory consume that display
  model while preserving existing workspace keys and project routing. `BNA`
  maps to `School`; `One Time Mishnah Class` maps to `Service Provider`;
  family and household items collapse under `Family`.
- 2026-06-17 deployed Railway `d5ee8e25-d777-4f76-bc38-fcfee8db4874`:
  Operations now shows explicit `Workspace type` and `Specific workspace`
  selector steps, API directory items include `role_label` and `scope_label`,
  and old visible Family/Home Accountability labels are removed from workspace
  UI/API output.
- `SDDraftler` is not categorized by name. It remains a review item until
  runtime project/person/family/household data confirms its identity.

2026-06-15 WS06 safe communications integrations implemented locally:
- Added a shared communications secret loader that checks process env,
  keyholder files, and `.secrets` without printing secret contents. The default
  external keyholder path remains outside the repo at `C:\Users\User\BNA-Keyholder`.
- Buffer is now wired as a safe Operations integration: readiness and channel
  endpoints, local `bna_social_posts` drafts, optional Buffer provider drafts,
  and schedule preview/confirm endpoints. Buffer writes stay draft-only unless
  Operations submits an explicit schedule confirmation token/phrase.
- Resend is now wired as a safe Operations integration: readiness, domain list,
  domain verify trigger, local `bna_email_drafts`, and guarded send. Production
  send is blocked unless the configured Resend domain is verified or
  `RESEND_SEND_FALLBACK_APPROVED=true` is explicitly set server-side.
- Resend ownership metadata is tracked separately from sender/domain config:
  `RESEND_ACCOUNT_OWNER`, `RESEND_PROVIDER_ACCOUNT`, `RESEND_DOMAIN`, and
  `RESEND_FROM`/`RESEND_FROM_EMAIL` are distinct readiness fields.
- DNS setup tasks are first-party records in `bna_dns_setup_tasks`. Full DNS
  values copied from the Resend dashboard can be stored, but truncated
  screenshot values are rejected into `needs_values` with a note to recopy the
  complete record.
- Operations > Integrations now has a Communications tab for Buffer readiness,
  channels, social drafts, schedule confirmation, Resend readiness, email
  drafts, send gating, domain verify, and DNS tasks. Telegram `/accounts` now
  reads the readiness-aware Buffer endpoints, and `scripts/buffer-ops.mjs`
  remains draft-only.
- Verification passed locally: syntax checks for `server.js`,
  `scripts/telegram-kimi-bridge.mjs`, `scripts/buffer-ops.mjs`, and the new
  integration modules; focused communications tests; and full `npm test`
  578/578.
- Live activation is still blocked until server-side Buffer/Resend credentials,
  Buffer organization/channel IDs, full Resend DNS record values, deployment,
  Railway doctor, and live smoke/readiness checks are completed. No real Buffer
  post, Resend email send, DNS write, or secret disclosure was performed.

2026-06-15 WS10 One Time product/payment decision state reconciled:
- Created the canonical decision handoff
  `tasks-pending/2026-06-15-one-time-product-payments-decisions.md` for One
  Time pricing, software ownership/revenue, business/bank/payment processor
  ownership, Stripe, GreenInvoice, parent/student/member login, materials
  access, Rabbi email/Resend, website assets, and stale-doc cleanup.
- Current checkout/access reality is preview and approval-gated: the Rabbi
  checkout/access schema, public preview pages, member access helpers, Stripe
  and GreenInvoice provider settings, and Rabbi webhook routes exist, but live
  checkout remains blocked until owner-approved prices, provider of record,
  account owner, product/price IDs or payment links, webhook secrets, refund
  policy, test buyer, and rollback/revoke path exist.
- Architecture direction is captured without making legal/accounting choices:
  American payments direction is Stripe, Israeli payments direction is
  GreenInvoice, and business/bank/payment processor setup should be under
  Rabbi Elie Scheller unless legal/accounting structure changes.
- App/workspace ownership is explicitly separate from merchant account,
  software/IP, tax, bank, and revenue-share ownership. Rabbi email/Resend
  sender/domain setup is explicitly separate from Shloimie personal/family/BNA
  sender setup.
- Website/landing-page assets remain one external blocker cluster. Do not add
  duplicate website-asset cards; WS03 owns duplicate Pending/access cleanup.
- WS10-specific verification passed: `node --check server.js`, `node --check
  scripts/telegram-kimi-bridge.mjs`, focused Rabbi checkout/audit-doc tests
  8/8, and `git diff --check` for touched files with line-ending warnings
  only. A full `npm test` run passed 548/548 before the final record updates;
  the later final full-suite rerun failed two unrelated Operations shell
  contract assertions against the already-dirty `public/operations.html` /
  workspace-shell test area, which WS10 did not edit. No deployment was
  required because this pass changed documentation, decision routing, and
  scoped agent guidance only.

2026-06-15 Operations login email alias deployed:
- Operations login now accepts configured super-admin aliases from
  `OPS_LOGIN_ALIASES`, `OPS_ADMIN_EMAIL`, `OPERATIONS_ADMIN_EMAIL`,
  `BNA_ADMIN_EMAIL`, `EMAIL_CC_SHLOIMIE`, or `SHLOIMIE_EMAIL`, while still
  issuing the session under canonical `OPS_USERNAME`.
- The login screen now labels the identifier field as `Operations email or
  username`, trims whitespace before submit, and explains that parent,
  student, and provider portal passwords stay separate.
- The public homepage now includes a protected `Operations` navigation link to
  `/operations`; public and Operations PWA manifests remain separate.
- Production Railway variable `OPS_LOGIN_ALIASES` was set from the configured
  operator email alias without printing the value. No parent/provider password,
  parent account, provider account, email send, WhatsApp send, billing action,
  or connector write was created.
- Verification passed: `node --check server.js`, focused Operations/privacy/
  brand tests 18/18, Operations login focused test 10/10, executable inline
  script parse for Operations login and homepage, full `npm test` 538/538,
  Railway deployment `60cbeae6-28d9-4333-9e0c-23f14f746238` SUCCESS,
  Railway doctor SUCCESS, live login/homepage/manifest readback, live
  Operations alias-login API smoke, live browser Operations login at 390px, and
  live app smoke
  `ops/live-smokes/2026-06-15T14-21-52-913Z-live-app-smoke.md`.

2026-06-15 One Time question public/member approval gate deployed:
- Operations Settings > Advanced > Approval Gates now includes
  `One Time question public/member surface` with the approval phrase
  `APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE`.
- The owner approval unblocker pack now includes the matching copy-paste
  template and required fields for one exact private digest item, target
  surface, answer visibility, Rabbi/admin reviewer, student identity policy,
  reward/badge policy, leaderboard policy, notification policy, safety
  escalation owner, rollback/unpublish path, and smoke readback.
- The goal-mode blocker matrix now reflects the deployed private question
  digest preview and keeps public/member question surfaces, answers, rewards,
  leaderboards, and notifications blocked until moderation, safety, visibility,
  and send approvals exist.
- Verification passed: focused gateboard/pack/matrix/One Time tests 22/22,
  full `npm test` 537/537, Railway deployment
  `020a76c5-7a86-4bf0-b6ea-719417bcc211` SUCCESS, Railway doctor SUCCESS, live
  app smoke `ops/live-smokes/2026-06-15T13-30-27-504Z-live-app-smoke.md`, and
  targeted live gateboard/digest guardrail smoke
  `ops/live-smokes/2026-06-15T13-31-15-000Z-one-time-question-public-surface-gate-live-smoke.md`.
- Guardrail: this is a read-only approval/readback lane. No public forum post,
  member-visible answer, reward, badge, leaderboard, notification, student
  identity exposure, send, Google, Buffer/social, billing, member-library,
  WAPI, external CRM, or connector write was performed.

2026-06-15 Private One Time question digest preview deployed:
- `GET /api/bna/one-time/question-moderation` now returns a read-only
  `digest_preview` package for the private Rabbi-facing moderation workflow.
- Operations Content > One Time Library renders `Private Question Digest
  Preview` with sections for triage, Rabbi review, source-sheet support,
  parent/member-safe response drafting, clarification, duplicate grouping, and
  rejected-private review where matching rows exist.
- The digest includes next steps, duplicate-topic candidates, and guardrails,
  but omits submitter identities from preview items.
- The surface is intentionally no-write: no forum post, member-visible answer,
  email, WhatsApp, SMS, Telegram, portal notification, Google, Buffer/social,
  billing, member-library, WAPI, external CRM, or connector write is performed.
- Verification passed: focused One Time moderation/forum/action tests 42/42,
  full `npm test` 536/536, Railway deployment
  `b43bdbf2-1526-4cab-86e8-a527f6e76b42` SUCCESS, Railway doctor SUCCESS, live
  app smoke `ops/live-smokes/2026-06-15T13-21-40-918Z-live-app-smoke.md`, and
  targeted digest smoke
  `ops/live-smokes/2026-06-15T13-22-30-000Z-one-time-question-digest-live-smoke.md`.

2026-06-15 Owner approval gateboard deployed:
- Operations Settings > Advanced now includes Approval Gates, a read-only
  owner-decision cockpit for the remaining gated lanes: Google live adapter,
  One Time member-library publishing, One Time billing/refund policy,
  Buffer/social draft or publish, Rabbi live app access/reset, External Access
  persistence, and Google public OAuth verification.
- Each gate shows the approval or confirmation phrase plus required fields and
  guardrails. It is intentionally phrase/readback only: it does not approve,
  send, publish, bill, grant access, create checkout, create credentials, call
  Google/Drive/Classroom/Business Profile, write Buffer/social, write WAPI, or
  write an external CRM.
- The goal-mode blocker matrix now reflects the deployed External Access
  dry-run preview endpoint/form; only real persistence remains approval-gated.
- Verification passed: focused Operations/matrix/owner-pack tests 15/15, full
  `npm test` 536/536, Railway deployment
  `6ff9c6f2-4a5c-4cfb-aecd-13d6fa88ecb2` SUCCESS, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T13-11-58-594Z-live-app-smoke.md`, targeted
  authenticated gateboard readback, and browser unauthenticated redirect smoke
  `ops/live-smokes/2026-06-15T13-14-03-396Z-owner-approval-gateboard-live-smoke.md`.

2026-06-15 External Access create/edit dry-run preview deployed:
- Operations Admin > Users now includes an "External Access Create/Edit
  Preview" form for platform-admin planning of external Operations users.
- The preview endpoint is `POST /api/bna/admin/external-access`; it accepts
  `dry_run:true` and returns a no-write readback package for person,
  workspace membership, project member, optional access-link plan, audit
  labels, guardrails, and required staff readback.
- Real persistence remains disabled. `dry_run:false` without
  `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` is rejected, and even a
  supplied phrase still returns the current preview-only/persistence-disabled
  response until the full workflow is approved.
- Verification passed: `node --check server.js`, focused
  external-access/Admin Users tests 44/44, full `npm test` 534/534, Railway
  deployment `937f5cf9-d824-43ed-93c1-fd532e94864f` SUCCESS, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T13-02-14-730Z-live-app-smoke.md`, and targeted
  live endpoint smoke
  `ops/live-smokes/2026-06-15T13-03-12-297Z-external-access-preview-live-smoke.md`.
- Guardrail: the live smoke confirmed `external_write_performed:false`,
  `no_send:true`, no parent/student/provider/member/Rabbi credential creation,
  no access-link creation, and no Google Drive / Buffer / WAPI / external CRM
  write.

2026-06-15 Public helper bot and ecosystem landing section deployed:
- The public homepage now loads `public/js/bna-helper-knowledge.js` before the
  universal helper widget. The helper has deterministic paths for signing up a
  child, learning about BNA, student reflection, service-provider interest,
  self-governance, SODAS parenting help, and general questions.
- Helper nudges are now quiet and delayed: first nudge after 12 seconds,
  second nudge 45 seconds later, with 24-hour localStorage suppression after
  dismissal. The helper no longer auto-opens the full panel on visitors.
- Self-governance copy is grounded in the BNA model: freedom with structure,
  relationship, Torah responsibility, choices, ownership, goals, consequences,
  and internal motivation. SODAS starts with Situation and feeling, then moves
  toward options and consequences one question at a time.
- The homepage now includes the "A Learning Ecosystem, Not Just a Morning
  Program" section with morning Torah learning, family/homeschool support,
  evening programs/chugim, service-provider network, placeholder graphics, and
  parent/provider/helper CTAs.
- Hebrew mode initializes helper labels from the `/he` route immediately, so
  the widget does not flash or lock into English before the page language
  script finishes.
- Verification passed: syntax checks for helper scripts, focused
  helper/assistant tests 16/16, full `npm test` 529/529,
  `npm run screenshot` across mobile/tablet/desktop widths, local Browser
  desktop/mobile/Hebrew smoke, Railway deployment
  `a96f5825-43eb-4027-8bf9-070029af75af` SUCCESS, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T12-28-14-117Z-live-app-smoke.md`, and live
  Browser desktop plus Hebrew mobile helper smoke on production.
- Guardrail: no live LLM dependency was added for the basic helper paths, no
  therapy/medical claim was added, no private student data is exposed, and no
  external CRM/GHL, WhatsApp, email, Buffer/social, Google, billing,
  member-library, or Rabbi live-site action was performed by the targeted
  helper checks.

2026-06-15 Public helper backend knowledge context deployed:
- The hosted public assistant now reads the curated public helper knowledge
  module from `public/js/bna-helper-knowledge.js` in a sandbox and injects
  sanitized signup, BNA model, service-provider ecosystem, student,
  self-governance, and SODAS parenting reflection lines into
  `buildPublicAssistantKnowledgeBase`.
- The public assistant also uses bounded file-backed retrieval from
  `src/lib/bna/public-helper-retrieval.js`: query-scored snippets from
  `public/js/bna-content.js`, curated brand-kit notes, safe-status transcript
  markdown, and existing approved/published DB content outputs. Transcript
  files marked `needs_approval` or `archived` are excluded from the retrieval
  corpus.
- The source boundary remains explicit: this is curated public helper context,
  plus bounded retrieval, not exhaustive transcript training, and the assistant
  must not claim it is trained on all transcripts.
- Verification passed: `node --check server.js`, focused helper/assistant
  tests 17/17, full `npm test` 530/530, Railway deployment
  `a7f78fc9-e0f6-401f-9ee3-289a45ccab2e` SUCCESS, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T12-39-02-000Z-live-app-smoke.md`, and targeted
  public assistant SODAS smoke
  `ops/live-smokes/2026-06-15T12-39-23-967Z-public-helper-knowledge-live-smoke.md`.
- Retrieval follow-up verification also passed: `node --check server.js`,
  `node --check src/lib/bna/public-helper-retrieval.js`, focused
  retrieval/helper/assistant tests 21/21, full `npm test` 534/534, Railway
  deployment `08a1bef5-b9b7-41fc-ac4f-574a73a16731` SUCCESS, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T12-48-55-011Z-live-app-smoke.md`, and targeted
  public assistant retrieval smoke
  `ops/live-smokes/2026-06-15T12-50-35-267Z-public-helper-retrieval-live-smoke.md`.

2026-06-15 Assistant onboarding intake capture deployed:
- Parent, student, and service-provider assistant messages that explicitly ask
  to save/capture/store/submit onboarding context now create
  `bna_assistant_onboarding_intakes` review drafts.
- Intake rows store role, surface, language, topic, source message, extracted
  first-party fields, open review questions, and scope ids when available.
- Guardrails are explicit in data and assistant metadata: `no_send:true`,
  `durable_profile_write_performed:false`,
  `external_write_performed:false`, and no child-visible or public-provider
  write. The next record change still requires staff review or an explicit
  approved portal action.
- The first targeted production smoke on deployment
  `c24ffa25-be88-4d38-9b78-5e1bebc678cb` caught a routing bug where public
  lead reminders shadowed authenticated student capture. Routing now evaluates
  explicit role intake capture before anonymous public lead reminders.
- Final Railway deployment `39012fde-d811-4c8d-853f-8b52da7eb2b8` reached
  `SUCCESS`.
- Verification passed: `node --check server.js`, `node --check`
  `scripts/smoke-assistant-onboarding-intake-live.mjs`, focused
  assistant/workspace/portal tests 53/53, full `npm test` 523/523, Railway
  doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T11-50-12-417Z-live-app-smoke.md`, and targeted
  onboarding intake smoke
  `ops/live-smokes/2026-06-15T11-50-42-993Z-assistant-onboarding-intake-live-smoke.md`.
- Targeted smoke used a live student access context without printing the raw
  access code, verified DB readback, then archived the smoke intake and thread.
  No email, WhatsApp, SMS, Telegram, Buffer/social, Google/Drive/Classroom,
  billing/access, member-library, external CRM, or Rabbi live-site action was
  performed.

2026-06-15 Student portal access-code fallback deployed:
- This private-code-only policy was superseded on 2026-06-16 by
  parent-managed student username/password login with access-code fallback.
- Runtime persists fallback access-code attempts in
  `bna_student_portal_auth_attempts` with hashed IP/access-code identifiers,
  success/failure/throttled outcomes, sanitized route-path storage, and
  metadata proving raw code/IP are not stored.
- Audit count/record calls use the primary pool outside caller transactions,
  so rejected write attempts keep audit/rate-limit evidence even when the
  application transaction rolls back; the in-memory limiter remains as fallback.
- Deployment note: `0c57ca17-461b-4d04-ba56-ab3243b14aa0` crashed because the
  deploy bundle omitted `railway-migration-2026-06-15-rabbi-checkout-access.sql`.
  `scripts/railway-redeploy.ps1` now copies root `railway-migration-*.sql`
  files into the bundle. Final Railway deployment
  `367994a3-04b6-4de4-8abd-0061d68222bf` reached `SUCCESS`.
- Verification passed: `node --check server.js`, `node --check`
  `scripts/smoke-student-portal-auth-policy-live.mjs`, focused portal/auth
  tests 42/42, full `npm test` 495/495, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T08-16-28-472Z-live-app-smoke.md`, and targeted
  auth audit live smoke
  `ops/live-smokes/2026-06-15T08-18-36-134Z-student-auth-policy-live-smoke.md`.
- Guardrail: targeted auth smoke created one expected first-party invalid-code
  audit row only. It sent no email, WhatsApp, SMS, Telegram, Buffer/social,
  Google/Drive/Classroom, billing/access, member-library, external CRM, or
  Rabbi live-site action.

2026-06-15 Railway latest deployment doctor current:
- `npm run railway:doctor` now reports production service `skillful-motivation`
  on deployment `988985c6-f310-4f84-b169-85878aa16d3c` with status `SUCCESS`.
- The stale bad deployment `47f8d5d1-c425-4a79-8e31-ec4cb71f5dcc` is no longer
  the deployment record returned by the doctor.
- No deploy was run for this check; this was read-only live verification.

2026-06-15 WAPI lead-candidate review importer deployed:
- WAPI phonebook correction preview now plans a local
  `bna_parent_leads` `create_lead_candidate` write for unmatched WhatsApp
  school/content/group-interest contacts.
- Existing `lead`, `signup`, or `student` matches are treated as current-family
  matches and skip duplicate lead-candidate creation.
- Confirmed apply remains gated by `APPLY_WAPI_CORRECTION`, writes only
  first-party BNA contact/lead rows, and keeps WhatsApp sends and external CRM
  writes blocked.
- Verification passed: `node --check server.js`, `node --check`
  `src/lib/bna/wapi-phonebook-report.js`, focused WAPI/Whapi tests 13/13,
  full `npm test` 488/488, Railway deployment
  `988985c6-f310-4f84-b169-85878aa16d3c`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T07-48-33-953Z-live-app-smoke.md`, and
  no-write WAPI lead-candidate preview smoke
  `ops/live-smokes/2026-06-15T07-49-22-656Z-wapi-lead-candidate-preview-live-smoke.md`.
- Guardrail: the targeted live smoke used `dry_run:true`; it performed no local
  row write, WhatsApp send, broadcast, external CRM write, Buffer/social,
  Google, billing, member-library, or Rabbi live-site write.

2026-06-15 Buffer hosted-media asset support deployed:
- Buffer social output publishing now builds media assets from stable direct
  hosted image/video URLs and sends them through Buffer's current ordered
  `assets` array on `createPost`.
- Local file paths and Drive/Dropbox preview links are rejected before a Buffer
  write so media jobs do not silently degrade into text-only drafts.
- Buffer output metadata now records whether media was attached, the media URL,
  media type, thumbnail URL, and confirms no binary upload was performed by
  BNA.
- Verification passed: `node --check server.js`, `node --check`
  `src/lib/bna/buffer-media-assets.js`, focused Buffer/One Time/Google tests,
  full `npm test` 484/484, Railway deployment
  `a6c7b3a4-0e2c-456a-9a26-f93af982f2fa`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T07-40-12-729Z-live-app-smoke.md`, and
  no-write hosted-media preview smoke
  `ops/live-smokes/2026-06-15T07-41-24-838Z-buffer-hosted-media-preview-live-smoke.md`.
- Guardrail: the targeted live smoke used the existing preview action only. No
  Buffer draft, publish, media upload, email, WhatsApp, Google, billing,
  member-library, external CRM, or Rabbi live-site write was performed. Actual
  Buffer drafts/publishes still require stable hosted media, approved source,
  channel/account, schedule, rollback/no-post policy, and
  `APPROVE_BUFFER_SOCIAL_DRAFT`.

2026-06-15 signup credit confirmation preview deployed:
- The admin resend route `/api/bna/signups/:id/send-confirmation` now supports
  `dry_run:true` and returns a no-send `email_preview` with recipient count,
  payment method, payment-link inclusion status, and a redacted body preview.
- The same route now uses the configured `PAYMENT_LINK` for unpaid credit
  confirmation resends instead of composing without a link.
- Added `scripts/smoke-signup-credit-email-preview.mjs` and
  `npm run app:smoke:signup-credit-email-preview`.
- Verification passed: `node --check server.js`, `node --check`
  `scripts/smoke-signup-credit-email-preview.mjs`, focused signup/portal tests
  32/32, full `npm test` 478/478, Railway deployment
  `c9c861e4-4e1e-4f2e-9fed-7db972d9b1ab`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T07-26-35-552Z-live-app-smoke.md`, and
  targeted no-send preview smoke
  `ops/live-smokes/2026-06-15T07-26-34-821Z-signup-credit-email-preview-live-smoke.md`.
- Guardrail: the targeted smoke used `dry_run:true`, sent no email, created no
  checkout/payment activity, wrote no local rows, and did not touch WhatsApp,
  Google, Buffer/social, external CRM, or Rabbi live-site state. Actual
  email-log/send proof remains future work for approved test recipients only.

2026-06-15 One Time member-library publishing slice deployed:
- The first-party One Time class-package/member-library path is deployed for
  `one_time_mishnah_class`.
- Class packages are anchored to `bna_class_sessions` and supported by
  `one_time_class_assets`, `one_time_member_library_items`,
  `one_time_member_access`, and `one_time_library_publish_events`.
- Operations Content > One Time Library now has a Class Package Manager for
  Vimeo/manual hosted URLs, linked worksheets/source sheets, explicit
  visibility/tier targeting, approval, publish, rollback, and smoke.
- Public `/member-library` and `GET /api/member-library?code=...` read only
  active-code, tier-visible, published safe fields and omit approval flags,
  rollback metadata, private transcript notes, and unrelated BNA
  student/accounting data.
- Verification passed: focused member-library tests 7/7, overlapping One Time
  regression tests 46/46, full `npm test` 470/470, Railway deployment
  `16920b4a-751a-4ee3-8534-9193a2739a7c`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T07-09-28-789Z-live-app-smoke.md`, focused
  member-library smoke
  `ops/live-smokes/2026-06-15T07-10-48-018Z-one-time-member-library-live-smoke.md`,
  and Browser render check for live `/member-library`.
- Guardrail: a real member-visible publish still requires explicit
  `member_library` destination, visibility/audience tier,
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING`, smoke evidence, and
  rollback/revoke readiness. No real Vimeo upload/API, Drive/video-host write,
  email, WhatsApp, Buffer/social, checkout/billing, external CRM, public forum,
  or student goal-checkoff merge was added.

2026-06-15 Google test-user OAuth scope guard deployed:
- Runtime Google OAuth defaults now start from least privilege:
  `DEFAULT_GOOGLE_SCOPES` is only
  `https://www.googleapis.com/auth/userinfo.email`.
- A bare `/api/google/oauth/start` no longer requests the configured scope set
  or Drive-pipeline setup implicitly. Broader Calendar, Classroom, Drive, or
  Business Profile scopes require an explicit feature/scope/setup request tied
  to the owner approval packet and smoke target.
- Operations Google readiness now separates `default_scopes` and
  `required_scopes` from `configured_scopes`. Follow-up Railway config cleanup
  narrowed production `GOOGLE_SCOPES` to identity-only too; the latest live
  readback shows configured/default/required scopes are all
  `https://www.googleapis.com/auth/userinfo.email`, with zero
  configured-scope warnings.
- Google role defaults in `src/lib/bna/google-integrations.js` are
  identity-only, and Classroom manage no longer includes roster/profile-email
  scopes by default.
- OAuth callback pages redact refresh-token values; tokens stay under ignored
  `.secrets/` files.
- Verification passed: syntax checks, focused Google OAuth/scope tests 18/18,
  full `npm test` 463/463, Railway deployment
  `8a02f9fb-6044-48ee-bfeb-747bfeecee2f`, Railway config update plus
  deployment `16920b4a-751a-4ee3-8534-9193a2739a7c`, Railway doctor SUCCESS,
  live app smoke `ops/live-smokes/2026-06-15T07-09-09-425Z-live-app-smoke.md`,
  and targeted live Google readiness readback.
- Guardrail verified: no OAuth flow, consent-screen change, Google account
  connection, Google/Drive/Classroom/Calendar/Business Profile read/write,
  email/WhatsApp/SMS/Telegram send, checkout/access, billing, member-library,
  Buffer/social, WAPI, external CRM, or Rabbi live-site write was performed.

2026-06-15 Google public OAuth verification packet added:
- Added `ops/google-integrations/google-public-oauth-verification-packet.md`
  for Phase 2 Mode C public production OAuth readiness.
- The packet was anchored to official Google OAuth app verification, API
  Services User Data Policy, sensitive-scope verification, restricted-scope
  verification, and demo-video guidance checked on 2026-06-15.
- Added `APPROVE_GOOGLE_PUBLIC_OAUTH_VERIFICATION_PACKET` to the owner approval
  pack, separate from `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Added `tests/google-public-oauth-verification-packet.test.js`; verification
  passed with focused Google/owner-pack tests 6/6 and full `npm test` 459/459.
- No deployment was required because this is local docs/test coverage only. No
  OAuth start, Google account connection, consent-screen change, verification
  submission, Google read/write, Drive/Classroom/Calendar/Business Profile
  write, send, or external connector action was performed.

2026-06-15 External Access persistence workflow readiness packet added:
- Added `ops/access/external-access-persistence-workflow.md` as the
  approval-gated implementation target for turning Admin > Users / External
  Access from read-only review into a controlled create/edit workflow later.
- Added `APPROVE_EXTERNAL_ACCESS_PERSISTENCE_WORKFLOW` to
  `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md`.
- Added `tests/external-access-persistence-workflow.test.js` to pin the
  packet, required fields, no-parent-account separation, no-provider-password
  separation, no Rabbi live-app credentials, no billing/member access, no send,
  and the fact that the current runtime remains read-only except for existing
  short-lived Operations access links.
- Verification passed: focused external-access/owner-pack tests 5/5 and full
  `npm test` 455/455. No deployment was required because this is local
  docs/test coverage only.

2026-06-15 Goal-mode completion/blocker matrix added:
- Added `ops/goalmode/2026-06-15-goal-completion-blocker-matrix.md` as the
  phase-by-phase readout for the original 2026-06-14 goal-mode brief.
- The matrix covers phases 0-16, labels each lane as `done_deployed`,
  `done_local`, `preview_ready`, or `blocked_owner_or_connector`, and lists
  the remaining owner/connector blockers.
- It preserves the approval gates for Google live adapters, One Time member
  library publishing, One Time billing/provider policy, Buffer/social drafts,
  and Rabbi live app access.
- Verification passed: `node --check tests/goalmode-completion-matrix.test.js`,
  focused matrix test 2/2, and full `npm test` 444/444. No deployment was
  required because this is local documentation/test coverage only.

2026-06-15 Owner approval unblocker pack added:
- Added `ops/goalmode/2026-06-15-owner-approval-unblocker-pack.md` as the
  single copy-paste approval template pack for the remaining owner/connector
  gates.
- The pack covers Google live adapter smoke, One Time member-library
  publishing smoke, One Time billing/refund policy, Buffer/social draft or
  publish, and Rabbi live app access confirmation.
- Each template requires required fields plus the approval phrase; a bare
  phrase without target/source/rollback/readback details is incomplete.
- Added `tests/goalmode-owner-approval-unblocker-pack.test.js`; focused pack
  test passed 2/2. No deployment was required and no live write was performed.

2026-06-15 Observable Codex queue lifecycle canonicalized and deployed:
- Corrected the deployed observable Telegram/bot -> ticket -> task -> Codex
  job flow so `bna_agent_jobs.status` uses the canonical agent lifecycle:
  `queued`, `running`, `completed`, `failed`, and
  `blocked_needs_human_decision`.
- Kept ticket/operator labels separate: `bna_tickets.status` may still show
  `queued_for_codex`, `in_progress`, `done`, `failed`, or `needs_decision`,
  while job rows stay in the machine lifecycle used by task/agent status.
- Updated the server bootstrap SQL, standalone Railway migration,
  queue/list/claim/heartbeat/complete/block APIs, stale detector, task
  enrichment query, and agent fleet supervisor queue selector.
- Strengthened `tests/observable-codex-queue.test.js` so the regression checks
  canonical job statuses instead of merely finding old queue strings.
- Verification passed: `node --check server.js`,
  `node --check scripts/agent-fleet-supervisor.mjs`,
  `node --check scripts/telegram-kimi-bridge.mjs`, focused observable queue
  test 4/4, full `npm test` 443/443, pre-deploy Railway doctor, Railway
  deployment `bee86ce8-747b-4287-90e3-bfa86f7077ab` SUCCESS, post-deploy
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-15T06-07-20-124Z-live-app-smoke.md`, and targeted
  live `/api/bna/codex-queue/status?limit=5` readback with five canonical
  `queued` jobs sampled.
- Guardrail verified: no Google, Drive, Calendar, Classroom, Vimeo, Buffer,
  WhatsApp, email, external connector, or external CRM write was performed.

2026-06-15 Phase 1 public route privacy smoke coverage added:
- Added `scripts/smoke-public-route-privacy.mjs` and package command
  `npm run app:smoke:public-privacy` to repeatedly audit the Phase 1
  unauthenticated route list from the 2026-06-14 follow-up brief.
- Added `tests/public-route-privacy-contract.test.js` to pin the route/auth
  contract: public route shells must not embed known private student data,
  student portal access must require a fresh URL credential and clear stale
  stored codes, parent/student/provider APIs stay server-gated, and Operations
  remains admin-gated.
- Live unauthenticated route smoke passed for `/`, `/parent`, `/parent.html`,
  `/parent/login`, `/student`, `/student.html`, `/student/login`, `/signup`,
  `/signup.html`, `/signup-he`, `/providers`, `/service-providers`,
  `/become-service-provider`, `/operations`, `/api/parent-portal`,
  `/api/parent-portal/session`, and `/api/student-portal`.
- Verification passed: `node --check scripts/smoke-public-route-privacy.mjs`,
  focused route/privacy/portal/provider tests 50/50, full `npm test` 439/439,
  focused `git diff --check` with only LF/CRLF warnings, and live route smoke
  `ops/live-smokes/2026-06-15T05-55-49-944Z-public-route-privacy-smoke.md`.
- No deployment was required because this slice added test/smoke tooling and a
  live audit report only; no runtime app files changed.

2026-06-15 Public homepage Torah progress privacy hotfix deployed:
- Replaced the public homepage Torah trip fallback from five named student
  cards to three aggregate cards: class trip progress, current anonymous
  range, and trip status.
- Updated the public homepage runtime renderer so live Torah progress responses
  render only aggregate/range cards and never write `student.name` values into
  the public DOM.
- Updated `/api/torah-learning/public-summary` to return group fields plus
  aggregate `metrics`, with `students: []` kept only as a compatibility empty
  array. The private/admin Torah summary helper still carries student records
  for authenticated Operations/portal views.
- Added `tests/public-homepage-privacy.test.js` and updated
  `scripts/smoke-live-app.mjs` so live smoke enforces the new aggregate-only
  public contract.
- Verification passed: homepage inline JavaScript parse, focused privacy/Torah
  tests 25/25, full `npm test` 435/435, `git diff --check` with only LF/CRLF
  warnings, Railway deployment `0562f80d-b24d-463b-bef4-7f027fdad077`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T05-46-52-317Z-live-app-smoke.md`, and focused
  live privacy readback
  `ops/live-smokes/2026-06-15T05-47-38-650Z-public-homepage-privacy-live-smoke.md`.
- Guardrail verified: the live public homepage and public Torah API omit the
  five full student names, stale per-student renderer strings, parent names or
  emails, goal minutes, and student access codes. No email, WhatsApp, Google,
  Buffer, external connector, CRM write, task write, or portal credential
  action was performed.

2026-06-15 Decision card context polish deployed:
- Deployed the Phase 8.3 Operations Tasks > Decisions follow-up so decision
  detail cards show question-style prompts, workspace/owner/due context,
  Option A/B/C choice cards, pros, cons, consequences, recommendation,
  `Needs more info`, and an inline decision comment box.
- The decision comment box uses the existing task-comment API with
  `visibility: workspace`, `source: dashboard`, and `requeue: false`; it does
  not choose an option, create an agent job, send a message, or touch any
  external connector.
- Added contract coverage in
  `tests/operations-task-comments-and-dictation.test.js`.
- Verification passed: Operations inline script parse, focused
  task/action-registry tests 42/42, full `npm test` 433/433,
  `git diff --check` with only LF/CRLF warnings, local in-app Browser readback
  before the browser reload policy blocked further local browser use, Railway
  deployment `03ad6a70-0f58-40c1-abb4-f2a6bfe4e3a5`, Railway doctor SUCCESS,
  live app smoke
  `ops/live-smokes/2026-06-15T05-28-00-126Z-live-app-smoke.md`, and focused
  live HTTP readback
  `ops/live-smokes/2026-06-15T05-30-30-413Z-operations-decision-card-ui-live-smoke.md`.
- Guardrail verified: the focused live readback was HTTP-only after
  Operations login. No task update, comment creation, choose-decision action,
  external connector action, email, WhatsApp, Google, Buffer, or CRM write was
  attempted.

2026-06-15 Task Calendar selected-day polish deployed:
- Deployed the Phase 8.4 Operations Tasks > Calendar follow-up so the
  selected-day panel now shows an explicit `Selected: Weekday, Month Day,
  Year` label, Hebrew date/item context, Add Task, Move Selected Task, and a
  Google Calendar dry-run action.
- The dry-run action is wired through `sync_google_calendar` with
  `dry_run: true`, `requested_from: task_calendar_selected_day`, and
  `no_google_calendar_write: true`.
- Added contract coverage in
  `tests/operations-task-comments-and-dictation.test.js` and reusable focused
  smoke coverage under
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/`.
- Verification passed: Operations inline script parse, focused
  task/action/Google tests 45/45, full `npm test` 427/427, local in-app Browser
  check, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-local/report.md`,
  Railway deployment `84bd450e-d5e9-409c-8126-29a147ab51cd`, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T05-14-42-829Z-live-app-smoke.md`, and focused
  live smoke
  `ops/playwright-smokes/2026-06-15-task-calendar-selected-day-live/report.md`.
- Guardrail verified: focused live smoke recorded zero write requests after
  login. No Google Calendar event, internal calendar event, email, WhatsApp,
  Buffer/social action, external connector write, or external CRM write was
  triggered.

2026-06-15 Student assistant onboarding coach deployed:
- Deployed a deterministic role-specific onboarding coach inside the shared
  assistant path so student help/setup requests are answered before the generic
  portal support-ticket fallback.
- Student guidance now covers Today, goals, daily checkoff, questions,
  reflection, and messaging Rabbi/Shloimie; parent/provider onboarding topics
  are also routed through the same no-write coach shape.
- Updated the student widget intro copy in `public/js/bna-bot-widget.js` and
  added contract coverage in `tests/universal-assistant-contract.test.js`.
- Verification passed: syntax checks, focused assistant/portal tests 49/49,
  local fixture Playwright smoke
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-local/report.md`,
  in-app Browser fixture check, full `npm test` 427/427, Railway deployment
  `6b77f88f-7508-43ac-b107-c713d29c34a3`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T04-57-22-945Z-live-app-smoke.md`, and
  focused live fixture smoke
  `ops/playwright-smokes/2026-06-15-assistant-onboarding-coach-live/report.md`.
- Guardrail verified: no support ticket, durable profile/goal write, real
  student checkoff/message, email, WhatsApp, Google Drive, Buffer, external
  connector write, or external CRM write is performed by the coaching path.

2026-06-15 Admin Users external access surface deployed:
- Deployed Operations Admin > Users / External Access for super-admin review
  of external project users without treating Rabbi/provider users as parents.
- The surface separates External Users and Internal Users, shows workspace,
  role, access level, and login username, and exposes the existing guarded
  20-minute Operations access-link action only for configured login usernames.
- Added/updated contract coverage in `tests/operations-pwa-login.test.js` and
  `tests/one-time-external-user-portal.test.js`.
- Verification passed: Operations inline script parse, focused Operations/One
  Time tests 41/41, full `npm test` 426/426, local browser smoke
  `ops/playwright-smokes/2026-06-15-admin-users-local/report.md`, Railway
  deployment `8d87ea87-8034-4533-85f7-71b70e99ccb5`, Railway doctor SUCCESS,
  live app smoke `ops/live-smokes/2026-06-15T04-38-14-284Z-live-app-smoke.md`,
  and focused live smoke
  `ops/playwright-smokes/2026-06-15-admin-users-live/report.md`.
- Guardrail verified: focused live smoke recorded zero write requests after
  login. No email, WhatsApp, password reset, parent account creation, billing
  link, Zoom/access change, member-library publish, Google/Drive action,
  Buffer/social action, external connector write, or external CRM write was
  triggered.

2026-06-15 One Time partnership drafting pack documented:
- Added `ops/one-time-mishnah/partnership-drafting-pack.md` as the local
  draft-only handoff for Claude or another writing assistant.
- The pack covers a cleaner agreement draft, values checklist,
  refund/cancellation policy options, family/device/Zoom/access rules,
  landing-page copy, launch emails, and reactivation copy while preserving
  first-party BNA Operations/no-GHL boundaries.
- Added `tests/one-time-partnership-drafting-pack.test.js` to keep the required
  artifacts, source boundaries, approval phrases, suppression rules, and
  no-secret/no-live-action guardrails durable.
- Verification passed: `node --check` on the new test, focused One
  Time/drafting tests 48/48, full `npm test` 424/424, and `git diff --check`
  with only the existing LF/CRLF warnings.
- No deployment was required because this is local documentation/test coverage
  only. No Google Doc/Drive upload, email, WhatsApp, Buffer/social action,
  billing link, Zoom/access change, member-library publish, ad spend, or
  external CRM write was performed.

2026-06-15 One Time content/media intake workflow documented:
- Added `ops/one-time-mishnah/content-media-intake-workflow.md` as the
  internal-first map for moving One Time Drive drops through recording/session
  records, transcripts/source notes, source sheets, worksheets, question
  digests, organic clips, ad candidates, approval packages, posting, and
  reporting.
- Added `tests/one-time-content-media-intake-workflow.test.js` to keep the
  workflow coverage, first-party record mapping, approval phrases, and no-secret
  guardrails durable.
- Verification passed: `node --check` on the new test, focused One Time/content
  tests 46/46, full `npm test` 422/422, and `git diff --check` with only the
  existing LF/CRLF warnings.
- No deployment was required because this is local documentation/test coverage
  only. No One Time app access, member-library publish, Google/Drive/Buffer/
  video-host write, WhatsApp/email send, access grant, ad spend, or external CRM
  write was performed.

2026-06-15 One Time first-party capability map documented:
- Added `ops/one-time-mishnah/first-party-capability-map.md` to map what BNA
  Operations can own before external Rabbi/One Time writes.
- The map covers contacts/identities, tags/segments, pipelines/opportunities,
  calendars/classes, payments/access, workflows/automations,
  community/membership support, content/media intake, Buffer/social previews,
  WhatsApp/WAPI communications, no-GHL policy, browser-only Rabbi-owned gaps,
  and external-write acceptance gates.
- Added `tests/one-time-first-party-capability-map.test.js` to keep the map
  covering the named capabilities and no-write/no-secret guardrails.
- Verification passed: `node --check` on the test file, focused One Time/audit
  tests 41/41, full `npm test` 420/420, and `git diff --check` with only the
  existing LF/CRLF warnings.
- No deployment was required because this is local documentation/test coverage
  only. No One Time app access, billing/access change, Google/Drive/Buffer/
  Vimeo/Resend/Stripe write, WhatsApp send, or external CRM write was
  performed.

2026-06-15 Contact history helper action deployed:
- Railway deployment `fcdf52fe-f623-47c5-8029-194eb68d7cb6` deployed
  `show_contact_communication_history` as a dry-run/read-only helper action for
  local contact communication history previews.
- The helper is registered in the shared action registry, routed from Telegram
  contact-history requests, and callable through `/api/bna/actions/run`.
- It reads local `bna_contact_communications` only, matching by lead/signup/
  student ID, normalized phone variants, email/source-address tokens, contact
  name, and WAPI source context.
- Verification passed: action file/registry/router syntax checks, Operations
  inline script parse, focused action/WAPI/CRM tests 44/44, full `npm test`
  418/418, `git diff --check`, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T04-08-21-656Z-live-app-smoke.md`, and focused
  live API smoke
  `ops/live-smokes/2026-06-15T04-08-37-882Z-contact-history-helper-live-smoke.md`.
- Guardrail verified: the focused live smoke used fake contact clues in
  dry-run mode, returned `executed: false`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`. No
  Whapi sync, WhatsApp send, broadcast, contact/tag update, email, Google/Drive
  action, Buffer/social action, or external CRM write was performed.

2026-06-15 Admin role/access policy matrix deployed:
- Railway deployment `8098d014-5857-44b0-bffa-c94458917802` deployed a
  read-only Admin > Roles policy matrix.
- Admin > Roles now lists Super Admin / Operator, BNA School Admin / Rabbi,
  Parent / Primary Contact, Second Parent / Spouse, Student, Service Provider /
  Rabbi Sheller, Community Member, and Codex / Agent Work.
- The matrix names current access state, workspace scope, guardrails, and
  approval gates for weekly update sends, parent password setup, Google live
  adapters, and One Time member-library publishing.
- The surface is no-write: it does not create invitations, login tokens,
  password resets, email sends, WhatsApp sends, access grants, billing changes,
  or external connector writes.
- Verification passed: `node --check server.js`, smoke runner syntax check,
  Operations inline script parse, focused Operations PWA/login test 7/7, local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-admin-role-policy-local/report.md`, full
  `npm test` 416/416, `git diff --check`, Railway doctor SUCCESS, live app
  smoke `ops/live-smokes/2026-06-15T03-41-18-298Z-live-app-smoke.md`, and
  focused live Playwright smoke
  `ops/playwright-smokes/2026-06-15-admin-role-policy-live/report.md`.
- Guardrail verified: focused live smoke recorded zero write requests after
  login and no invitation, token, reset, send, access grant, billing,
  Google/Drive, Buffer/social, One Time publishing, external connector, or
  external CRM action was triggered.

2026-06-15 Parent weekly recipient preview deployed:
- Railway deployment `f03ccc1f-a64d-43db-8907-70f6c62d46b7` deployed a
  no-send recipient preview for Operations Communications > Announcements.
- Added `GET /api/bna/parent-announcements/recipients`, which previews deduped
  active BNA student parent emails, separates signup-only candidates for
  review, separates second-parent/spouse candidates behind policy review,
  excludes external-accountability students, and reports missing parent emails.
- The endpoint returns `dry_run: true`, `no_send: true`,
  `local_write_performed: false`, `external_write_performed: false`,
  `send_enabled: false`, and future approval phrase
  `APPROVE_PARENT_WEEKLY_UPDATE_SEND`.
- Operations now has a `Preview Recipients No-Send` button and a recipient
  readback panel with eligible/missing/excluded/duplicate counts.
- Verification passed: `node --check server.js`, smoke runner syntax check,
  Operations inline script parse, focused weekly-update test 8/8, full
  `npm test` 415/415, `git diff --check`, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T03-31-36-029Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-announcement-recipient-preview-live/report.md`.
- Guardrail verified: focused live smoke used synthetic recipients only,
  intercepted one recipient-preview GET, and recorded zero write/send attempts.
  No real parent email was written into the smoke report, and no email,
  WhatsApp, portal message, communication log, Buffer/social action,
  Google/Drive action, external CRM write, parent-announcement write, or
  test-send/live-send action was triggered.

2026-06-15 Parent password setup/reset preview deployed:
- Railway deployment `990a677c-a6a5-4b2d-97d7-13f1cf83c862` deployed a
  preview-first parent password setup/reset path in Operations Students > Next
  Year Login.
- The Next Year Login rollout packet now states that student links can be
  prepared in bulk, while parent login links, parent password setup/reset
  emails, and WhatsApp login links stay explicit per family.
- Each parent row now exposes `Preview Password Setup` and `Email Password
  Setup`. Preview calls `POST /api/bna/parent-access/password-reset` with
  `dry_run: true` and returns no-write/no-send flags. Real email requires the
  single-family button plus typed backend confirmation
  `SEND_PARENT_PASSWORD_SETUP`.
- Verification passed: `node --check server.js`, Operations inline script
  parse, smoke runner syntax check, focused next-year/portal tests 26/26, full
  `npm test` 415/415, `git diff --check`, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T03-17-11-309Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-next-year-password-setup-preview-live/report.md`.
- Guardrail verified: focused live smoke intercepted the password-reset API,
  confirmed exactly one preview POST with `dry_run: true`, and recorded zero
  live email send attempts. No parent token, email, WhatsApp, onboarding
  campaign, portal message, student access change, external CRM write,
  Google/Drive action, or Buffer/social action was triggered by the preview.

2026-06-15 Parent weekly update approval workspace deployed:
- Railway deployment `a298a146-8e34-408c-9a1f-f6e26e38dd0c` deployed the
  Operations Communications > Announcements in-page approval workspace.
- Parent weekly update approval now uses candidate loading, title/body/image
  URL/video URL readback, a `Preview No-Write` button, status messaging, and
  typed `APPROVE_PARENT_ANNOUNCEMENT` local approval instead of native browser
  prompts.
- The existing `GET/POST /api/bna/parent-announcements` contract remains the
  backend source. Preview uses `dry_run: true`; approval selects a local
  parent-visible weekly update and performs no send.
- Verification passed: `node --check server.js`, Operations inline script
  parse, smoke runner syntax check, focused weekly/Operations/portal tests
  35/35, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-local/report.md`,
  full `npm test` 415/415, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T03-02-35-006Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-parent-weekly-update-approval-live/report.md`.
- Guardrail verified: focused live smoke intercepted parent-announcement API
  calls, confirmed preview POST used `dry_run: true`, and recorded zero
  non-dry-run write attempts. Official weekly copy/media selection remains a
  human/operator decision.

2026-06-15 Mobile public/login/document matrix deployed:
- Railway deployment `e7c5c182-70ff-49cd-b786-ca76de01efc2` deployed the
  registration-document stale student-code clearing patch and the reusable live
  mobile matrix smoke.
- Public registration document pages now clear stale `bnaStudentAccessCode`
  values before rendering, matching the public/signup/provider stale-session
  privacy rule.
- Verification passed: `node --check server.js`, smoke script syntax check,
  focused assistant/signup tests 15/15, full `npm test` 415/415, Railway doctor
  SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T02-24-39-914Z-live-app-smoke.md`, and focused
  live mobile Playwright matrix
  `ops/playwright-smokes/2026-06-15-mobile-public-login-document-matrix-live/report.md`.
- The matrix covered `/`, public helper open state, `/signup.html`,
  `/signup-he.html`, all four required registration document pages,
  `/parent/login`, `/parent/login?onboard=accountability`, `/student/login`,
  and `/provider/login` at 390px mobile width.
- Guardrail verified: no form submission, provider signup, parent/student
  login, assistant send, email, WhatsApp, billing, Google API call, connector
  write, or external CRM write was executed.

2026-06-15 Provider onboarding foundation live-smoked:
- The older provider onboarding/integrations foundation deployment gate is now
  closed on Railway deployment `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`.
- Live verification covered the sanitized public provider API, public provider
  index, provider join flow, provider login/setup shell, and parent login route.
- Verification passed: `node --check server.js`, focused provider directory
  tests 12/12, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T02-11-53-759Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-provider-onboarding-foundation-live/report.md`.
- Guardrail verified: no provider signup, provider intake submission,
  parent-provider message, provider reply, email, WhatsApp, billing, Google API
  call, connector write, or external CRM write was executed.

2026-06-15 Google Integrations module deployed:
- Railway deployment `1a60aabe-b1a7-4adc-a788-de4e71abd0bd` deployed
  Operations > Integrations > Google as the canonical Google readiness module.
- The module reuses the Google Workspace readiness data for Drive, Calendar,
  Classroom, and Google Business Profile, while Settings > Google Workspace is
  now a compatibility mirror.
- Platform/provider workspaces can access the Integrations route; parent/
  household workspaces are redirected away from it.
- Verification passed: `node --check server.js`, Operations inline script
  parse, focused integrations/workspace/automation/provider tests, full
  `npm test` 415/415, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-integrations-module-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T01-59-10-544Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-integrations-module-live/report.md`.
- Guardrail verified: the page performs no Google API read/write, connector
  write, send, publish, access grant, or external CRM write.

2026-06-15 Parent accountability lead capture deployed:
- Railway deployment `59ec51a1-56b2-4e0d-854a-ee3f8aab5558` deployed real
  first-party parent/accountability lead capture.
- `POST /api/parent-accountability/onboarding` now creates or updates
  `bna_parent_leads` with `lead_type = 'accountability_interest'`, warm/new
  CRM state, owner/follow-up metadata, and scoped no-send/no-external-write
  metadata.
- The same transaction links the support ticket, lead `bna_contact_communications`
  inbound note, and private in-app Operations notification to the parent lead.
- Operations Contacts > Interested Parents now defaults to all lead categories
  and exposes `Accountability app interest` filtering.
- The route has `dry_run` support for no-write local/live smokes; dry-run does
  not create leads, tickets, communications, notifications, sends, external
  writes, or child-visible goals.
- Verification passed: `node --check server.js`,
  `node --check tests/parent-accountability-onboarding.test.js`, Operations and
  parent inline script parse, focused tests 22/22, full `npm test` 414/414
  before deploy, local dry-run smoke
  `ops/local-smokes/2026-06-15-parent-accountability-onboarding-local.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T01-38-34-614Z-live-app-smoke.md`, and focused
  live dry-run smoke
  `ops/live-smokes/2026-06-15T01-39-30-000Z-parent-accountability-onboarding-live-smoke.md`.

2026-06-15 One Time publish-package preview deployed:
- Railway deployment `32573f44-f7a6-4cbd-baa2-432cf6b1e0a6` deployed the
  One Time member-library publish-package preview.
- Operations Content > One Time Library cards can expose a `Package Preview`
  button wired to `preview_one_time_member_library_publish_package`, and
  Telegram can route requests such as "Preview member-library publish package
  for One Time content job #57."
- The preview assembles the content job id, package title, hosted media URL,
  output statuses, review statuses, destination, audience, visibility,
  notification plan, rollback plan, approval phrase state, and blockers.
- The preview performs no member-library publish, member visibility change,
  Drive/video-host write, Buffer/social write, email/WhatsApp send,
  checkout/access grant, external CRM write, or local content write.
- Full member-library publishing remains blocked until destination, visibility,
  hosting, connector, smoke-item, rollback, and
  `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.
- Verification passed: `node --check` on the action registry, operations
  action runner, Telegram router, and focused test file; Operations inline
  script parse; focused action/One Time tests 34/34; full `npm test` 387/387;
  local Playwright smoke
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-local/report.md`;
  Railway doctor SUCCESS; live app smoke
  `ops/live-smokes/2026-06-14T22-41-22-482Z-live-app-smoke.md`; and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-one-time-publish-package-preview-live/report.md`.

2026-06-15 Google Business preview helpers deployed:
- Railway deployment `89294419-27aa-4527-ba8d-c7edcfddf394` deployed the
  Google Business/Profile preview helpers.
- Operations Settings > Google Workspace > Google Business Profile now
  includes `Place ID` and `Locations` dry-run buttons wired to
  `google_business_place_id_lookup` and
  `google_business_list_locations_preview`.
- Telegram routing recognizes natural-language Google Business/Profile Place
  ID and accessible locations requests.
- The previews perform no Maps lookup, Google Business Profile API call,
  external read, external write, send, or live Google API call.
- Live Google Business execution remains blocked until provider opt-in,
  `business.manage` OAuth/API approval, and explicit external-read/write
  confirmation are complete.
- Verification passed: `node --check` on the action registry, operations
  action runner, and Telegram router; Operations inline script parse; focused
  action and Google settings tests 32/32; full `npm test` 386/386; local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-business-preview-local/report.md`;
  Railway doctor SUCCESS; live app smoke
  `ops/live-smokes/2026-06-14T22-22-55-796Z-live-app-smoke.md`; and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-google-business-preview-live/report.md`.

2026-06-15 Classroom topic/material preview action deployed:
- Railway deployment `72a371b8-50b7-48c8-8cf7-f3efa7b1f8a4` deployed the
  Google Classroom topic/material preview action.
- Operations Settings > Google Workspace > Google Classroom now includes a
  `Topic/material` dry-run button wired to
  `classroom_topic_material_preview`. The button passes a real object payload
  and scopes the request/preview to the BNA workspace.
- Telegram routing recognizes natural-language Classroom material/topic
  requests such as "Put this worksheet under topic Week 1 for course
  Mishnayos."
- The action previews the course, topic, material title/link, topic
  lookup/create policy, and required external inputs only. It performs no
  Classroom read/write, internal write, send, external write, or live Google
  API call.
- Live Classroom execution remains blocked until Google Classroom OAuth/test
  user scopes, topic ID or topic-create policy, and explicit external-write
  approval are complete.
- Verification passed: `node --check` on the action registry, operations
  action runner, and Telegram router; Operations inline script parse; focused
  action and Google settings tests 31/31; full `npm test` 385/385; local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-local/report.md`;
  Railway doctor SUCCESS; live app smoke
  `ops/live-smokes/2026-06-14T22-09-44-742Z-live-app-smoke.md`; and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-classroom-topic-material-preview-live/report.md`.

2026-06-15 calendar launch preview action deployed:
- Railway deployment `f8951767-ca5f-4c58-a8c5-696015f9d3b9` deployed the
  Rabbi/One Time launch-calendar preview action.
- Operations Settings > Google Workspace > Google Calendar now includes an
  `8-week plan` dry-run button wired to
  `calendar_batch_launch_plan_preview`. The button passes a real object
  payload and scopes the request/preview to `rabbi_sheller_provider`.
- Telegram routing recognizes natural-language 8-week launch calendar requests
  and extracts a `start_date` when present. With a date, the action previews a
  One Time launch plan; without a date, it returns the expected `start_date`
  blocker.
- The action performs no internal calendar write, Google Calendar write,
  external write, send, or Google OAuth action. Google Calendar sync remains
  separate and still requires OAuth/scope approval plus explicit external-write
  confirmation.
- Verification passed: `node --check` on the action registry, operations action
  runner, and Telegram router; Operations inline script parse; focused action
  and Google settings tests 30/30; full `npm test` 384/384; local Playwright
  smoke
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-local/report.md`;
  Railway doctor SUCCESS; live app smoke
  `ops/live-smokes/2026-06-14T21-51-39-727Z-live-app-smoke.md`; and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-calendar-launch-preview-live/report.md`.

2026-06-15 approval decision preview controls deployed:
- Railway deployment `475c598d-e9c3-4a5b-990c-e00f2ef1f070` deployed local
  decision-preview buttons on the Google Live Adapter Approval Packet and One
  Time Publishing Approval Packet.
- Each `Preview Decision Draft` button calls the typed `create_decision`
  action with `dry_run: true`. The local and live browser smokes verified the
  response returns `executed: false` and `preview.decision_created: false`.
- These controls create no decision task and perform no live Google
  read/write, publishing, sends, checkout/access, member visibility,
  Drive/video-host, Buffer/social, or external CRM write. They only log a local
  dry-run action preview for audit/readback.
- Verification passed: Operations inline script parse, focused approval
  contract tests 7/7, full `npm test` 383/383, `git diff --check` with only
  existing LF/CRLF warnings, local Playwright smoke
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T21-27-02-855Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-15-approval-decision-preview-live/report.md`.

2026-06-14 approval-readiness packets deployed:
- Railway deployment `cdb127bb-0f27-4e9b-b9a1-7adb93d64f19` deployed the
  two remaining approval-gate packets into Operations.
- Settings > Google Workspace now includes a Google Live Adapter Approval
  Packet. It lists OAuth test users, Drive scope policy, external-write
  confirmation, smoke evidence, and the exact
  `APPROVE_GOOGLE_LIVE_ADAPTER_TEST` phrase. The packet itself performs no
  live Google read/write.
- Content > One Time Library now includes a One Time Publishing Approval
  Packet. It lists member-library destination, visibility/audience rules,
  hosted media provider, notification/social channels, smoke evidence, and the
  exact `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` phrase. The packet itself
  performs no Buffer/social, email, WhatsApp, Drive/video-host, checkout,
  member visibility, or external CRM write.
- Verification passed: Operations inline script parse, focused approval
  contract tests 7/7, full `npm test` 383/383, `git diff --check` with only
  existing LF/CRLF warnings, local Playwright smoke
  `ops/playwright-smokes/2026-06-14-approval-readiness-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T20-56-48-950Z-live-app-smoke.md`, and focused
  live Playwright smoke
  `ops/playwright-smokes/2026-06-14-approval-readiness-live/report.md`.

2026-06-14 support ticket processed-notification drafts deployed:
- Railway deployment `f64213ae-1cc1-4b2e-a762-a06c3e81f3b1` deployed the
  support-ticket processed notification follow-up.
- When a support ticket transitions into `resolved` or `closed`, the server now
  creates a first-party `bna_contact_communications` internal-note draft with
  `ticket_processed_notification`, `no_send`, and
  `external_write_performed: false` metadata, then adds an internal
  `bna_support_ticket_comments` audit comment.
- The API response includes `notification_draft`, and Operations shows an
  operator alert after resolving a ticket. The flow does not send email,
  WhatsApp, SMS, Telegram, portal messages, or external CRM writes
  automatically.
- Workflow N support-ticket roadmap metadata and the One Time Drive setup
  script now document the no-send processed-notification draft behavior.
- Verification passed: `node --check server.js`,
  `node --check scripts/setup-one-time-partnership-drive.mjs`, Operations
  inline script parse, focused tests 48/48, full `npm test` 383/383,
  `git diff --check` with only existing LF/CRLF warnings, local API/DB smoke
  `ops/live-smokes/2026-06-14T20-39-16-327Z-support-ticket-notification-local-smoke.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T20-40-31-601Z-live-app-smoke.md`, and focused
  live API/DB smoke
  `ops/live-smokes/2026-06-14T20-42-38-426Z-support-ticket-notification-live-smoke.md`.

2026-06-14 public helper source-boundary guard deployed:
- Railway deployment `dcb59bc8-835b-4eb7-a951-653b54a389bf` deployed the
  BNA Helper source/knowledge guard from the goal-mode brief.
- Public assistant context now states the current 10-1 program reality and a
  verified source boundary: public BNA content, role-scoped portal context, and
  server action results only.
- Hosted assistant prompts now explicitly forbid filling policy gaps from
  generic school knowledge. If a requested policy is not verified in the
  supplied BNA context, the assistant should say so and offer to ask Shloimie.
- Public allergy/medical policy questions now use a deterministic
  `public_policy_boundary` reply before hosted AI, returning that no verified
  BNA policy exists in current public content and offering to pass the question
  to Shloimie.
- Verification passed: `node --check server.js`,
  `node --check src/lib/bna/ai-context.js`, assistant contract 9/9, local
  public assistant API smoke, full `npm test` 382/382, `git diff --check`
  with only existing LF/CRLF warnings, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T20-25-36-985Z-live-app-smoke.md`, and focused
  live public assistant API smoke against `https://bneineviimacademy.org`.

2026-06-14 Rabbi Scheller white-label superprompt imported:
- The operator-provided Downloads superprompt is now represented by the
  internal handoff
  `tasks-pending/2026-06-14-rabbi-sheller-whitelabel-onboarding-google-content.md`.
  Use that handoff for continuation work instead of copying the full raw prompt
  into visible task titles.
- Preflight preservation is complete:
  `ops/worktree-snapshots/2026-06-14T18-50-41-pre-rabbi-whitelabel-onboarding.md`,
  `.runtime/pre-rabbi-whitelabel-onboarding-20260614-185041.patch`, and
  `.runtime/pre-rabbi-whitelabel-onboarding-status-20260614-185041.txt`.
- The preflight snapshot captured the broad dirty tree before this continuation
  work. Inspect current `git status` before staging, group changes into logical
  commits, and do not delete or revert existing dirty work.
- Remaining implementation lanes are one approved One Time member-library
  publish/smoke or deeper media hosting after explicit approval, plus live
  Google/Drive adapters after OAuth/scope approval.

2026-06-14 One Time content library review surface deployed:
- Railway deployment `4a77ab03-a394-4663-b4b7-55957655c6b0` deployed
  Operations Content > One Time Library.
- Live Operations task #610 was marked done with `agent_status: completed`
  after deployment and focused live smoke verification.
- The surface is an internal review workspace over scoped
  `one_time_mishnah_class` content jobs: searchable filters, report metrics,
  output lanes for library card/transcript/thumbnail/worksheet/social/newsletter
  plans, per-item internal approval queues, hosted media URL capture, and
  member-library publishing guardrails.
- `PATCH /api/bna/content-jobs/:id` now supports guarded `media_url` updates
  and rejects non-HTTP(S) hosted media URLs before any row update.
- The workspace does not send email, WhatsApp, social posts, checkout/access,
  Drive/video-host writes, external CRM writes, or member/public publishing.
  Internal approval here records review state only.
- Verification passed: `node --check server.js`; Operations inline scripts
  parsed; focused One Time/content tests 7/7; full `npm test` 382/382; local
  browser/API smoke
  `ops/playwright-smokes/2026-06-14-one-time-content-library-local/report.md`;
  Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T19-20-41-625Z-live-app-smoke.md`; and focused
  live smoke
  `ops/playwright-smokes/2026-06-14-one-time-content-library-live/report.md`.

2026-06-14 Google action audit view deployed:
- Railway deployment `f4f63168-afa4-41e3-8930-a67159c069f1` deployed the
  Operations Settings > Google Workspace read-only Google Action Audit.
- The audit view filters first-party `botActionLogs` for Google, Drive,
  Calendar, Classroom, and Google Business/Profile preview or execution action
  keys, shows the 12 most recent rows, and formats nested preview/result
  details without `[object Object]`.
- The screen is evidence-only: it reads local BNA action logs and dry-run
  preview rows. It does not perform external Google writes; live Drive,
  Calendar, Classroom, or Business Profile adapters still require OAuth/test
  users, scope approval, and explicit external-write confirmations.
- Verification passed: focused Google settings contract 3/3; Operations inline
  scripts parsed; full `npm test` 382/382; local browser/API smoke
  `ops/playwright-smokes/2026-06-14-google-action-audit-local/report.md`;
  Railway doctor with deployment SUCCESS; live app smoke
  `ops/live-smokes/2026-06-14T19-49-14-650Z-live-app-smoke.md`; and focused
  live smoke
  `ops/playwright-smokes/2026-06-14-google-action-audit-live/report.md`.

2026-06-14 public helper mobile sheet deployed:
- Railway deployment `0b9085f7-a10e-41bb-8123-f8ba1c233ac8` deployed the
  public helper mobile UX follow-up from the goal-mode brief.
- On phone-width public pages, the shared BNA Helper opens as a partial bottom
  sheet around 70% viewport height instead of covering the whole screen, leaves
  the page visible, and moves the launcher above the sheet so tapping it again
  minimizes the helper.
- The public helper intro/follow-up copy now names the current 10-1 program and
  removes the old "I'm still here" nudge. Desktop remains a right-side panel.
- Verification passed: `node --check public/js/bna-bot-widget.js`; assistant
  contract 9/9; full `npm test` 382/382; local browser smoke
  `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-local/report.md`;
  Railway doctor with deployment SUCCESS; live app smoke
  `ops/live-smokes/2026-06-14T20-12-20-143Z-live-app-smoke.md`; and focused
  live smoke
  `ops/playwright-smokes/2026-06-14-assistant-mobile-sheet-live/report.md`.

2026-06-14 login/input stability fix deployed:
- Railway deployment `68b459e7-0e98-4395-a905-d67353dd4f20` deployed the
  mobile/PWA login stability fix across Operations login, parent
  onboarding/login, provider join, and the shared assistant widget.
- Operations login now uses a keyboard-aware viewport variable, avoids fixed
  `height: 100%`, keeps phone-width inputs at 16px, hides horizontal overflow,
  and does not redirect away while a login field is actively focused.
- Operations dashboard background refresh skips while text entry or
  dictation/composition is active.
- Parent/provider onboarding and the shared assistant do not programmatically
  steal focus on narrow/coarse-pointer touch screens.
- Verification passed: focused tests 51/51; full `npm test` 382/382; local
  and live mobile Playwright smokes; Railway doctor; and live app smoke
  `ops/live-smokes/2026-06-14T19-18-03-287Z-live-app-smoke.md`.

2026-06-14 referral/moderation helper actions deployed:
- Railway deployment `e54244e1-41dd-40ae-a313-31cc0c49d6e2` deployed
  `create_referral_ledger_entry`,
  `submit_student_question_for_moderation`, and `review_moderated_question`.
- Surfaces:
  - action registry: three new approval-gated One Time referral/question
    moderation helpers
  - server action runner: `/api/bna/actions/run`
  - Telegram action router: referral ledger, private question submission, and
    moderated-question review phrasing
  - generated action-registry artifacts under `ops/action-registry/`
- The helpers are dry-run/preview first. Approved referral execution creates
  only first-party One Time records: one `bna_parent_leads` referral candidate,
  one internal `bna_contact_communications` ledger note, and one local review
  task. Approved question execution creates or updates only private local
  review tasks/comments.
- The helpers do not create Codex jobs automatically, referral links, rewards,
  coupons, email/WhatsApp/social sends, forum posts, public/member visibility,
  Drive/Sefaria/member-library writes, or external CRM records.
- Verification passed: syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`; focused action suite 26/26;
  full `npm test` 376/376; local preview smoke
  `ops/local-smokes/2026-06-14-referral-moderation-helper-actions-local-preview.json`;
  Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T18-25-56-841Z-live-app-smoke.md`; and live
  preview-only smoke
  `ops/live-smokes/2026-06-14T18-26-48-024Z-referral-moderation-helper-actions-live-preview.json`.

2026-06-14 Rabbi shiur/source-sheet helper actions deployed:
- Railway deployment `0dd6f6ec-26ca-4fa1-8520-6e8d76790246` deployed
  `create_rabbi_shiur_idea` and `create_rabbi_source_sheet_task`.
- Surfaces:
  - action registry: two new approval-gated One Time/Rabbi content helpers
  - server action runner: `/api/bna/actions/run`
  - Telegram action router: "create Rabbi shiur idea..." and
    "create Rabbi source sheet task..."
  - generated action-registry artifacts under `ops/action-registry/`
- The helpers are dry-run/preview first. Approved execution creates only
  scoped local `bna_tasks` review tasks under project
  `one_time_mishnah_class`.
- The helpers do not create Codex jobs, Drive/Sefaria/member-library writes,
  email/WhatsApp/social sends, public/member visibility, or external CRM
  records.
- Verification passed: syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`; focused action suite 25/25;
  full `npm test` 375/375; local preview smoke
  `ops/local-smokes/2026-06-14-rabbi-content-helper-actions-local-preview.json`;
  Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T18-08-35-649Z-live-app-smoke.md`; and live
  preview-only smoke
  `ops/live-smokes/2026-06-14T18-09-23-665Z-rabbi-content-helper-actions-live-preview.json`.

2026-06-14 task/decision helper action bundle deployed:
- Railway deployment `85c15479-f581-45d3-bb53-695fb99f8ac7` deployed
  `add_decision_option`, `schedule_task_on_date`, and `move_task_workspace`.
- Surfaces:
  - action registry: three new approval-gated task helpers
  - server action runner: `/api/bna/actions/run`
  - Telegram action router: "add decision option ... to task #...",
    "schedule task #... on YYYY-MM-DD", and
    "move task #... to BNA/One Time workspace"
  - generated action-registry artifacts under `ops/action-registry/`
- The helpers are dry-run/preview first. Approved execution only updates
  first-party task records: decision options/comments, due/planned dates, or
  task project/workspace scope.
- The helpers do not create Codex jobs, connector writes, WhatsApp/email/social
  sends, public/member visibility, or external CRM records.
- Rabbi Sheller-scoped actors cannot move a task outside the One Time project.
- Verification passed: syntax checks for `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`,
  `src/lib/bna/telegram-action-router.js`, and
  `tests/action-registry-telegram-ui-bot.test.js`; focused action suite 24/24;
  full `npm test` 374/374; local preview smoke
  `ops/local-smokes/2026-06-14-task-decision-helper-actions-local-preview.json`;
  Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T17-54-55-156Z-live-app-smoke.md`; and live
  preview-only smoke
  `ops/live-smokes/2026-06-14T17-55-44-901Z-task-decision-helper-actions-live-preview.json`.

2026-06-14 One Time video-library item helper deployed:
- Railway deployment `e93d2da8-4852-4d82-a260-39b1be5960b2` deployed
  `create_one_time_video_library_item`.
- Surfaces:
  - action registry: `create_one_time_video_library_item`
  - server action runner: `/api/bna/actions/run`
  - Telegram action router: One Time/Rabbi video-library card/item phrasing
  - Operations content output readback labels for the new internal draft states
- The action is approval-gated and dry-run/preview first. Preview creates no
  content job and reports `member_visible: false`, `public_visible: false`,
  `external_write_performed: false`, and `no_send: true`.
- Approved execution creates only scoped first-party One Time content records:
  one `bna_content_jobs` row for project `one_time_mishnah_class` plus internal
  `bna_content_outputs` rows for `video_library_item`, `transcript_review`,
  `thumbnail_brief`, `worksheet_draft`, `social_copy_plan`, and
  `newsletter_plan`.
- The helper does not create public/member publishing, Buffer/social drafts,
  email/WhatsApp sends, video-host writes, Drive writes, checkout/access, or
  external CRM records.
- Verification passed: syntax checks for `server.js`,
  `src/lib/actions/registry.js`, `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`; focused action/One Time tests
  58/58; full `npm test` 373/373; local preview smoke
  `ops/local-smokes/2026-06-14-one-time-video-library-action-local-preview.json`;
  Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T17-36-34-282Z-live-app-smoke.md`; and live
  preview-only smoke
  `ops/live-smokes/2026-06-14T17-40-27-one-time-video-library-live-preview.json`.

2026-06-14 retitle task helper action deployed:
- Railway deployment `67ba8b4b-2072-4367-b12c-181cfe156424` deployed
  `retitle_task_naturally`.
- Surfaces:
  - action registry: `retitle_task_naturally`
  - server action runner: `/api/bna/actions/run`
  - Telegram action router: "retitle task #... to ..."
- The action is approval-gated and dry-run/preview first. It requires a
  specific `task_id` and clean `new_title`, rejects raw ramble-looking
  replacement titles, preserves the prior title only as a truncated preview,
  and does not create agent jobs.
- Verification passed: syntax checks for `server.js`,
  `src/lib/actions/registry.js`, `src/lib/actions/actions/operations.js`, and
  `src/lib/bna/telegram-action-router.js`; focused action/task/watchdog tests
  44/44; full `npm test` 372/372; Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T17-18-12-469Z-live-app-smoke.md`; and live
  preview-only action smoke
  `ops/live-smokes/2026-06-14T17-18-55-172Z-retitle-task-action-live-preview.md`.

2026-06-14 One Time Mishnah onboarding lead capture deployed:
- Railway deployment `8e55d3c5-b958-42b2-b176-ae74df5bfdb8` deployed the
  preview-safe Rabbi Mishnayos parent/member onboarding intake.
- Surfaces:
  - public preview page: `/one-time-preview#one-time-onboarding`
  - API: `POST /api/one-time/mishnah/onboarding`
- The route accepts contact, learner/member, location, interest path, and
  question/context fields. Dry-runs write nothing and return `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`.
- Confirmed non-dry-run submissions stay first-party and One Time scoped:
  `bna_parent_leads`, Rabbi provider-workspace `bna_contacts`,
  `bna_contact_communications` transcript/internal note,
  `bna_support_tickets`, and a Shloimie/Rabbi follow-up `bna_tasks` record.
- The flow does not create checkout, grant member access, send email, send
  WhatsApp, post publicly, or write to an external CRM.
- Verification passed: `node --check server.js`, preview inline script parse,
  focused onboarding/provider/workspace tests 23/23, full `npm test` 370/370,
  local endpoint smoke
  `ops/live-smokes/2026-06-14T-one-time-onboarding-local-smoke.json`, local
  browser smoke
  `ops/playwright-smokes/2026-06-14-one-time-onboarding-local/report.md`,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T17-05-14-786Z-live-app-smoke.md`, and live
  dry-run smoke
  `ops/live-smokes/2026-06-14T17-06-57-397Z-one-time-onboarding-live-dry-run.md`.

2026-06-14 task-title cleanup dry-run implemented locally:
- `npm run task:title-cleanup` runs
  `scripts/task-title-cleanup-dry-run.mjs` against the admin task API in
  dry-run mode by default.
- The script skips closed tasks unless `--include-closed` is supplied, excludes
  full raw operator wording from reports, routes unsafe generated titles to
  manual review, and requires `--apply --confirm APPLY_TASK_TITLE_CLEANUP`
  before any live task patch.
- Verification passed: `node --check scripts/task-title-cleanup-dry-run.mjs`,
  focused task/watchdog/reconciler tests 28/28, full `npm test` 367/367, and
  live dry-run report
  `ops/system-audits/2026-06-14T16-37-35-442Z-task-title-cleanup-dry-run.md`
  with 304 tasks scanned, 224 closed tasks skipped, 0 automatic candidates,
  and 1 manual-review item. No deploy was required because this was local
  CLI/report tooling only.

2026-06-14 Rabbi white-label route privacy re-audit deployed:
- Public provider pages now clear stale `bnaStudentAccessCode` values on load:
  `public/service-providers.html`, `public/providers-join.html`, and
  `public/provider-profile.html`.
- Regression coverage lives in `tests/universal-assistant-contract.test.js`.
- Verification passed: focused route/privacy tests 36/36, local Playwright
  route audit 17/17, `npm test` 357/357, Railway deployment
  `f2595077-6c36-4a04-a5b8-a69452d3dfa5`, post-deploy Railway doctor, app
  smoke `ops/live-smokes/2026-06-14T16-02-47-718Z-live-app-smoke.md`, and live
  provider/privacy smoke
  `ops/playwright-smokes/2026-06-14-rabbi-whitelabel-provider-privacy-live/report.md`.

2026-06-14 workspace/community/provider/bot cleanup current state:
- BNA does not use GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as active
  runtime. Active code must not use GHL env vars, MCP tools, API clients,
  dashboard controls, Telegram actions, smoke checks, docs, routes, prompts, or
  schema assumptions. Legacy files are archived under
  `docs/archive/legacy-ghl/` for retired historical reference only.
- 2026-06-14 workspace task cleanup supersedes older My Tasks/Changelog lane
  guidance. The active Operations task buckets are Decisions, Pending, Tasks,
  Calendar, Done, and Activity. Pending is only for human/external blockers;
  Codex/system work uses agent lifecycle status and `bna_agent_jobs`, not a
  human-facing "pending for Codex" state.
- Rabbi Scheller / One Time launch work is workspace-scoped. Replit/current app
  access is a migration/audit source, not the canonical runtime. Resend,
  Stripe/payment processors, Buffer, Whapi/WAPI, Vimeo, and DNS/domain tools are
  connectors only and require approval/access before live sends or payments.
- Any older entries in this file that mention former GHL/social publishing work
  are historical deployment notes only and are superseded by the no-GHL policy.
- BNA Operations is the first-party source of truth for contacts, leads,
  students, tasks, communications, learning communities, provider listings,
  provider messages, parent/student/provider portals, and internal dialogue.
- Buffer is the active social scheduler connector; WAPI/Whapi is the active
  WhatsApp API path. Provider-owned delivery systems remain connectors until
  explicitly integrated.
- OpenAI remains the normal preferred hosted AI provider, but the operator
  approved temporary Kimi-primary mode while the OpenAI key/account path issue
  is unresolved. Use `BNA_AI_PRIMARY_PROVIDER=kimi` to make server content AI,
  Telegram API chat, and the historical `npm run openai:smoke` script select
  Kimi first. Codex remains the development/task owner.
- 2026-06-14 assistant/portal/communications foundation is deployed in Railway
  deployment `0cca77e2-d718-47b6-bc28-6824125597f3`. Active generated email
  paths use `Bnei Neviim Academy Office` and normalize away `Office P`;
  Resend is connector-ready but unconfigured, Gmail remains fallback, unified
  communications and checkout-attempt APIs exist, abandoned-checkout sends are
  approval gated, WhatsApp import is first-party/no-send by default, and the
  assistant drawer passed mobile keyboard smoke at 390/393/430 widths.
- Public, parent, and Operations PWA manifests are split so public/parent
  installs do not launch private Operations.
- Current live verification includes `npm test` 323/323, Railway doctor, live
  app smoke `ops/live-smokes/2026-06-14T09-32-40-859Z-live-app-smoke.md`, and
  focused live read/dry-run smoke
  `ops/live-smokes/2026-06-14T09-33-21-093Z-assistant-portal-focused-live-smoke.json`.

2026-06-14 Registration toolbar and parent-permission notice deployed:
- Signup, Hebrew signup, registration-document, and signup thank-you pages use
  the shared public-site toolbar in production.
- The parent responsibility checkbox remains replaced by a visible notice plus
  hidden backend acknowledgment; BNA records the notice shown without treating
  it as a separate enforcement agreement.
- Parent 1/Parent 2 headings, labels, and name input text are verified
  black/readable on the live English signup page.
- The public-site nav uses the existing hamburger layout through
  small-desktop widths so the long action row does not cause horizontal
  overflow at 1280px.
- Verification passed: syntax checks, focused registration/nav tests 9/9,
  `npm test` 353/353, Railway doctor on deployment
  `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225`, live app smoke
  `ops/live-smokes/2026-06-14T15-41-19-444Z-live-app-smoke.md`, and live
  browser smoke
  `ops/playwright-smokes/2026-06-14-registration-toolbar-permission-live/report.md`.

2026-06-14 Rabbi task UI/helper/audit preview deployed:
- Branch `cleanup/rabbi-workspace-task-ui-helper-20260614-155524` has
  BNA blue/gold/parchment Operations task styling, logo header marks,
  workspace/role/viewing/filter context strip, clearer task filters, typed
  decision button routing, `needs-more-info` decision endpoint, and selected-day
  task calendar actions.
- BNA now contains a preview-only One Time funnel at
  `/preview/one-time-mishnah` and `/one-time-preview`; checkout is inactive and
  prices are TBD until approved.
- One Time audit docs live under `ops/audits/`: repo inventory, backend advice,
  billing/referral/forum plan, and helper/action matrix.
- Official goal-mode Rabbi deliverables also exist at the exact requested
  paths:
  `ops/rabbi-scheller/2026-06-14-one-time-app-audit.md` and
  `ops/rabbi-scheller/green-invoice-billing-options.md`.
- Local verification passed: syntax checks, focused tests, `npm test` 341/341,
  and authenticated Playwright smoke covering Operations tasks/decisions/
  schedule/providers plus parent/student/signup/preview routes at
  390/430/768/1440 widths.
- Railway deployment `f8c16762-9a73-4a77-8a9b-c5cbe2a00ec8` reached SUCCESS;
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T13-56-08-327Z-live-app-smoke.md`, and live
  Playwright smoke
  `ops/playwright-smokes/2026-06-14-task-ui-brand-cleanup-live/report.md`
 passed. Do not replace Rabbi Scheller's live production site or activate
  payment links until Shloimie approves.
- Follow-up verification after adding the exact Rabbi docs: GitHub refs still
  matched `one-time-app` commit `a3463bc6756ac34d8f304451fa0e5190309b8ae1`
  and `one-time-one-time` commit
  `050fe2468a3f5601e74e738c219cbe5c1bdf398e`; focused doc tests passed and
  `npm test` passed 347/347.
- 2026-06-15 follow-up: the Green Invoice vs Stripe/refund blocker is now an
  approval-ready policy packet inside
  `ops/rabbi-scheller/green-invoice-billing-options.md`. One Time must choose
  exactly one provider of record per live product/plan, with approval phrases
  for Green Invoice, Stripe, manual bridge, and refund policies R1/R2/R3.
  Verification passed: `node --check tests/rabbi-scheller-audit-docs.test.js`,
  focused doc tests 4/4, and full `npm test` 444/444. No deployment was
  required; live checkout/access remains blocked until owner approval.

2026-06-14 Goal-mode public/portal privacy hardening deployed:
- Railway deployment `59b07235-039a-4d0c-9676-8ecea6736390` reached SUCCESS.
- `/parent/login?onboard=accountability` now stays in the public onboarding/
  login shell even when a parent session exists, so it does not render the
  private parent portal from session state.
- `/student/login` clears stale `bnaStudentAccessCode` values when no current
  code is present, non-student surfaces clear saved student codes, and the
  helper no longer reads saved student codes from local storage.
- Student-audience portal payloads redact parent email/phone/name fields while
  preserving full parent-audience payloads.
- Verification passed: syntax checks, focused privacy/assistant/workspace
  tests, `npm test` 341/341, local privacy smoke
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-fix/report.md`,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T14-25-57-627Z-live-app-smoke.md`, and live
  public/parent/student privacy smoke
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-live/report.md`.
- The broader 2026-06-14 goal-mode brief remains open for helper action
  coverage, CRM/contact timeline, automations/prompts/drips, provider login,
  and deeper Rabbi/One Time follow-through.

2026-06-14 Google Workspace readiness panel deployed:
- Railway deployment `e38167f2-5e6d-4447-b9d4-e195375c4315` reached SUCCESS
  for the readiness panel, followed by deployment
  `d2ee16bc-cacd-4025-a77d-f1d358d1230c` for connection-management follow-up.
- Operations > Integrations > Google is now the canonical readiness surface for
  Drive, Calendar, Classroom, and Google Business Profile; Settings > Google
  Workspace remains as a compatibility mirror.
- The panel separates no-OAuth/manual/public-link capabilities, test-user OAuth
  work, and later public production verification. It must not claim live sync
  unless a connected account and scope actually support the action.
- The BNA Operations API namespace exposes
  `/api/bna/integrations/google/status` for the Google readiness payload, and
  that payload now includes real OAuth rows from `bna_google_connections` when
  test-user accounts are connected.
- Google disconnect is confirmation-gated through
  `/api/google/connections/:connectionId/disconnect` and
  `/api/bna/integrations/google/connections/:connectionId/disconnect`; it
  removes stored refresh tokens locally and attempts Google revocation when
  OAuth credentials are configured.
- Verification passed: syntax checks, focused Google/workspace/Operations
  tests, `npm test` 349/349, Railway doctor, live app smokes
  `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md`, direct live API
  read of `/api/bna/integrations/google/status`, live Operations browser smoke
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`,
  follow-up live app smoke
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`, non-mutating
  disconnect route probe, and live Operations browser smoke
  `ops/playwright-smokes/2026-06-14-google-workspace-disconnect-live/report.md`
  at desktop and 390px mobile.

2026-06-14 Operations parent-to-student link deployed:
- Current live bundle in Railway deployment
  `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` includes the Operations Contacts
  parent-to-student link fix.
- Contacts > Parents loads the student roster, resolves linked students by
  signup id or parent email/student name, shows `Student linked`, renders
  Linked Records, and opens the matching student profile.
- Verification passed: `node --check server.js`, `node --check
  public/js/bna-bot-widget.js`, focused Operations/portal tests 35/35, full
  `npm test` 350/350, production HTML readback, `npm run railway:doctor`, live
  app smoke
  `ops/live-smokes/2026-06-14T15-08-19-575Z-live-app-smoke.md`, and PII-safe
  live Operations smoke
  `ops/playwright-smokes/2026-06-14-operations-parent-student-links-live/report.md`.

2026-06-14 Local BNA keyholder workflow created:
- The local outside-repo keyholder folder is `C:\Users\User\BNA-Keyholder`.
- The Windows desktop shortcut `BNA Keyholder` opens/initializes the folder.
- Repo commands:
  - `npm run keyholder:open`
  - `npm run keyholder:diagnose`
- Keyholder diagnostics report only file presence, length, normalized length,
  SHA-256 fingerprint prefixes, newline/quote/BOM status, last modified time,
  and `.secrets` fingerprint matches. They must never print secret values.
- Documentation: `docs/local-keyholder.md`.
- Verification passed: `node --check scripts/keyholder-diagnostics.mjs`,
  `node --test tests/keyholder-diagnostics.test.js`, `npm test` 345/345, and
  diagnostics report
  `ops/qa-runs/2026-06-14T14-41-27-809Z-keyholder-diagnostics.md`.

2026-06-12 Registration/provider/student-security pass deployed:
- Public signup now shows the four visible required documents: Handbook,
  Tuition, Waiver, and Student Handbook. The archived duplicate package
  sections remain in source as reference only.
- Signup English/Hebrew pages share the polished BNA form shell, language tabs,
  Back Home navigation, rectangular document controls, and the richer footer.
- Provider intake includes the expanded review fields and AI Max interest path,
  but no checkout, paid automation, ad launch, publishing, messages, or billing
  is enabled until terms are approved.
- Student portal credential handling rejects missing/invalid/expired codes,
  rate-limits repeated failures, clears invalid local storage, and keeps portal
  data hidden until the server validates the access code.
- Provider/student unavailable setup wording now uses user-facing Coming soon or
  approved-path language instead of raw configuration/connector labels.
- `brand-kit/09-visual-design-tokens.md` records the BNA UI/control palette:
  blue/gold for system controls, graphite/sepia/parchment/Torah-scroll for the
  visual identity.
- Rabbi/One Time video workflow is briefed as an extension of the existing
  Remotion natural-language editing scripts, scoped outside BNA private
  parent/student surfaces.
- Verification passed: syntax checks, focused portal/provider contracts 35/35,
  `npm test` 277/277, screenshot QA, local Playwright smoke, Lighthouse report
  `tmp/registration-provider-security-lighthouse.html` with scores 67/84/100/100
  and Agentic Browsing 50, Railway deployment
  `d4f0be3c-1890-4f4a-9364-41ef6d57df58` SUCCESS, Railway doctor, live app
  smoke `ops/live-smokes/2026-06-12T12-04-54-426Z-live-app-smoke.md`, and
  production Playwright smoke
  `ops/playwright-smokes/2026-06-12-registration-provider-security-production/`.
- Open decisions remain: final student auth model, persistent DB-backed
  rate-limit/audit policy, and AI Max pricing/payment/delivery rules.
- Handoff:
  `tasks-pending/2026-06-12-registration-provider-security-rabbi-video.md`.

2026-06-11 Provider onboarding/integrations foundation local pending deploy:
- Local work from
  `C:\Users\User\Downloads\bna_provider_onboarding_codex_super_prompt.md`
  extends the existing provider commercial/onboarding layer.
- Added local backend support for public provider profile fields, Google
  Business/Profile URL and Place ID storage, provider onboarding sessions,
  provider intake records, heuristic intake parsing, parent-provider messages,
  provider replies, and sanitized public provider index API.
- Added local routes/pages for `/service-providers`, `/providers`,
  `/become-service-provider`, `/parent/login`, `/student/login`,
  `/provider/login`, and `/provider-dashboard`.
- Updated public/provider/parent/join pages locally and removed real-looking
  sample credentials from tracked examples.
- Local verification passed: `node --check server.js`, Telegram bridge and
  fleet supervisor syntax checks, `npm test` 272/272, local
  `GET /api/service-providers`, and browser smoke for `/service-providers`,
  `/become-service-provider`, `/`, `/signup-he.html`, `/parent/login`,
  `/student/login`, and `/provider/login`.
- A stricter tracked-file OpenAI-key-shaped scan returned no matches; the broad
  preliminary scan's `task-*` false positives were restored to real audit paths.
- This is not complete until the changed app bundle is deployed, Railway doctor
  passes, and live public/provider/parent smoke checks pass.
- Handoff:
  `tasks-pending/2026-06-11-provider-onboarding-integrations.md`.

2026-06-10 Task/student recording intake routing deployed:
- Parser-only Telegram media, local drop-folder media, and Google Drive Raw
  Media Intake recordings now bypass Operations Content jobs.
- The bridge calls `/api/bna/recording-intake/parse-mixed-recording` for
  internal task/student/accountability recordings and files extracted operator
  tasks, Student accountability events, group goal entries, and Torah learning
  updates into their proper lanes without inserting `bna_content_jobs`.
- Actual class/content/marketing recordings still use the Content pipeline and
  can still be parsed for mixed tasks/students when appropriate.
- Deployed Railway `1f56ea91-1caa-420c-8a0d-8f39a6932ce0`.
- Verification passed: `node --check server.js`, `node --check
  scripts/telegram-kimi-bridge.mjs`, focused Telegram routing tests, `npm test`
  156/156, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-10T05-11-09-865Z-live-app-smoke.md`, and live
  recording-intake endpoint validation readback.

2026-06-10 One Time external-user planning captured:
- The One Time Drive workspace was rechecked with
  `npm run drive:setup-one-time`; the canonical folder and proposal copy are
  still present.
- Operator wants Rabbi Elie Scheller to be the first external user/account under
  Shloimie as super admin, not a parent-style record.
- Rabbi Elie should have separate One Time parents and students, distinct from
  BNA parents and BNA students.
- Rabbi's scoped workspace should reuse task manager, comments, natural-language
  parsing, watchdog-style monitoring, Telegram/API access, and add support
  tickets for broken system reports.
- Implementation handoff:
  `tasks-pending/2026-06-10-one-time-external-user-portal-and-ticketing.md`.

2026-06-10 Research parent/student audience split deployed:
- Operations Content Research now labels the action as a student source-sheet
  task and its generated task notes explicitly source every sourceable class
  topic for student learning while keeping parent follow-up separate.
- Parent portal question cards now show parent coaching context: interest
  topics, possible struggle signals, and open-ended questions for
  self-governing growth.
- Parent portal question payloads omit student Sefaria/source-sheet sources,
  assignments, and source status; the student portal continues to show Sefaria
  source suggestions and optional follow-up learning.
- Deployed Railway `82e8fbee-a30c-4c60-aab2-ebb6fd104fd0`.
- Verification passed: `node --check server.js`, inline browser script parse,
  focused Research and parent/student portal tests, `npm test` 144/144,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-10T04-06-15-059Z-live-app-smoke.md`, and live
  Operations/parent HTML readback.

2026-06-10 Parent/student portal side navigation deployed:
- The live student portal now uses a hamburger/side navigation layout instead
  of showing every card in one long page.
- The student sidebar shows class trip percentage, the student's own trip
  percentage, today's progress, this week's upcoming items, and the scheduled
  private meeting when available.
- Student Goal Board status filters are available both as a compact top
  dropdown and count tabs.
- The live parent portal now uses the same sectioned navigation pattern:
  Overview, Goals, Assignments, Questions, Attendance, Meetings, Messages, and
  History.
- Live task #294 was marked done and verified.
- Deployed Railway `e3f1d013-cb44-44b8-9e39-cb12aff93c22`.
- Verification passed: `node --check server.js`, portal inline script parse,
  `node --test tests/parent-student-portal-contract.test.js`,
  `node --test tests/goal-board.test.js tests/google-assignment-system.test.js`,
  `npm test` 142/142, headless Playwright mocked mobile portal nav smoke,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-10T03-52-26-960Z-live-app-smoke.md`, and live
  student/parent portal HTML readbacks.

2026-06-10 Content Research section shipped:
- Operations Content now has a `Research` subtab backed by
  `/api/bna/class-sessions`.
- Research cards show parsed sourceable topics, questions/discussions, sources
  already mentioned, highlights, class summary, and the source recording link.
- Each class session can create a Codex-owned `source_sheets` task through
  `Create Source Sheet Task`; the task scopes the whole recording/session, not
  only explicit student questions, and requires direct Sefaria links plus a
  broader source map when relevant.
- Live task #289 was marked done and verified.
- Deployed Railway `c72af775-5e41-47cc-ad8c-27d47bd7f047`.
- Verification passed: `node --check server.js`, Operations inline script
  parse, `node --test tests/operations-content-research-section.test.js`,
  focused routing tests, `npm test` 138/138, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-10T03-36-58-019Z-live-app-smoke.md`, and live
  Playwright screenshot
  `ops/playwright-smokes/2026-06-10-content-research-live.png`.

2026-06-09 Operations phone/PWA launch restored:
- The installed phone/PWA app now opens Operations instead of the public
  homepage: live `/manifest.json` has `start_url:
  "/operations?source=pwa"`.
- Normal browser visits to `https://bneineviimacademy.org/` still show the
  public Bnei Neviim Academy landing page.
- Standalone launches from `/`, `/he`, or `/index.html` redirect to
  `/operations?source=pwa`; browser requests to `/operations?source=pwa`
  preserve `returnTo` through Operations login.
- Deployed Railway `9033bcc2-b822-472b-bcae-087becc6140e`.
- Verification passed: `node --check server.js`,
  `node --test tests/operations-pwa-login.test.js`, `npm test` 126/126,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-09T20-27-33-188Z-live-app-smoke.md`, live manifest
  and redirect readbacks, and live mobile Playwright screenshot
  `ops/playwright-smokes/2026-06-09-live-operations-pwa-phone.png`.

2026-06-09 One Time partnership Drive workspace created:
- Canonical Drive workspace:
  `My Drive / One Time Mishnah Class - Rabbi Elie Scheller`
  (`https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`).
- The uploaded partnership proposal was copied into
  `00 Start Here - Proposal and Project Map` as a project copy; the original
  upload still exists separately in Drive.
- Starter Google Docs were created in `00 Start Here`:
  `00 One Time Partnership Project Map`,
  `01 Task Map - Codex Claude Shloimie Rabbi Elie`, and
  `02 Drive Folder Rules`.
- Repo report:
  `ops/one-time-mishnah-class/partnership-drive-map.md`.
- A prior BNA-nested draft folder exists at
  `BNA V2 / 50 One Time Mishnah Class - Partnership Project`; do not treat it
  as the canonical workspace unless Shloimie explicitly asks to merge or clean
  up Drive.

2026-06-10 Rabbi Elie / One Time bot credential pass:
- Railway production service `skillful-motivation` now has
  `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER` and
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false` configured.
- Telegram token still works and resolves to `onetimeaios_bot`; webhook is not
  configured and pending updates are 0.
- Initial `getUpdates` returned 0 updates. A later 2026-06-10 recheck showed a
  `/start` update from Shlomo/chat `8202155026`; this is an operator test
  update, not a confirmed Rabbi Elie allowed chat ID.
- Local `.env.local` still lacks Rabbi chat ID and scoped One Time
  username/password.
- Railway still lacks `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`,
  `ONE_TIME_OPS_USERNAME`, and `ONE_TIME_OPS_PASSWORD`.
- `npm run telegram:rabbi` reaches the intended scoped profile guard and fails
  only because scoped One Time Operations credentials are missing.
- The current Railway app service starts only `node server.js`; it is not
  hosting the long-running Rabbi bridge.

2026-06-09 Rabbi Elie / One Time bot re-smoked:
- Telegram token still works and resolves to `onetimeaios_bot`.
- Telegram polling path is clear: no webhook is configured and pending updates
  are 0.
- `npm run telegram:rabbi` reaches the intended scoped profile guard and fails
  only because scoped One Time Operations credentials are missing.
- Local `.env.local` still lacks Rabbi chat ID and scoped One Time
  username/password.
- At the time of this re-smoke, Railway production service
  `skillful-motivation` was reachable, but it lacked the Rabbi bot token,
  Rabbi chat ID, scoped One Time username/password, and
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED`.
- The current Railway app service starts only `node server.js`; it is not
  hosting the long-running Rabbi bridge.
- Holy Flow agent-loop source was located at
  `C:\Users\User\holyflow-platform`; BNA adaptation brief:
  `tasks-pending/2026-06-09-one-time-ghl-agent-loop.md`.

2026-06-09 Google Classroom worksheet assignment lane deployed:
- Operations > Students > Assignments can create internal assignments from a
  YouTube URL or material link, fetch YouTube metadata, choose worksheet type
  and language, add assignment and parent/teacher prompt patches, select
  students, parse natural-language schedules, and optionally queue internal
  video processing.
- Assignment cards support worksheet generation/regeneration, saved prompt
  patching, per-student prompt patches, per-student worksheet editing,
  publish/schedule status, Google payload preview, guarded live Google
  Classroom/Calendar sync, and guarded calendar-event deletion.
- Student and parent portals receive assignment payloads with material links,
  worksheet bodies, schedule buckets, and Google Classroom/Calendar sync status.
- Database bootstrap now includes assignment prompts, prompt versions,
  assignments, assignment-student rows, regeneration history, video-processing
  jobs, schedule items, and role-scoped Google connections.
- Deployed Railway `6b210aa5-b85a-4328-b2bd-2d41d5c31ed2`.
- Verification passed: `npm test` 120/120, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-09T19-43-01-268Z-live-app-smoke.md`, and live
  assignment API/UI smoke screenshot
  `ops/playwright-smokes/2026-06-09-live-google-assignment-operations-smoke.png`.
- Live Google writes remain gated until admin/teacher OAuth is reauthorized
  with Classroom/Calendar scopes and real Classroom course/student IDs are
  mapped.

2026-06-09 Organic short-form content workflow queued:
- The operator is beginning prompt/workflow testing and will load many images
  into folders for media repurposing.
- The target format is roughly 22-second vertical organic clips from older and
  new BNA media: Torah learning/classroom energy, short text overlays,
  captions/subtitles, quick transitions, rock-style background music when
  appropriate, and a final flyer/update card.
- CapCut, not Canva, is the intended manual finishing/editor lane. Use CapCut
  for AI clip picking, auto captions, templates, transitions, and polish.
- Remotion remains the repo-controlled automation lane for repeatable rendering
  from Drive/local folders, including image folders chunked into roughly
  two-second clips.
- Build brief:
  `tasks-pending/2026-06-09-organic-clip-factory.md`.

2026-06-09 WAPI parent CRM and Telegram command layer deployed:
- Inbound WAPI/WhatsApp messages are visible in Contacts > Communications and
  now also surface on parent roster cards/details through last-touch,
  last-inbound, last-outbound, and communication-count fields.
- `GET /api/bna/signups` includes communication aggregate fields from
  `bna_contact_communications` for CRM-style parent cards.
- Operations Contacts parent detail panels render the actual Communication
  timeline for that signup instead of the old placeholder WhatsApp history
  message.
- Outbound WhatsApp text sending is available through the protected endpoint
  `POST /api/bna/contact-communications/send-whatsapp`; it requires
  `confirm: SEND_WHATSAPP`, resolves `signup_id`, `lead_id`, `student_id`, or
  explicit `to`, sends through Whapi/WAPI, and logs the outbound communication.
- Unmatched communications can be linked with
  `POST /api/bna/contact-communications/:id/link`; if no existing record is
  supplied, the endpoint can create a `bna_parent_leads` record from the
  WhatsApp sender and link the communication to it.
- Telegram bridge commands now include `/wapi_status`,
  `/send_whatsapp signup:123 | message`, and
  `/link_whatsapp communication:12 signup:3`.
- OpenAI Telegram app snapshots now fetch and summarize
  `GET /api/bna/contact-communications`, so dashboard/Communications questions
  can be answered from live app data instead of transcript-only context.
- Verification passed: syntax checks, Operations inline script compile,
  `npm test` 71/71, Railway doctor, live app smoke
  `ops/live-smokes/2026-06-09T14-20-11-762Z-live-app-smoke.md`, live WAPI
  diagnostics, and a live fake inbound WAPI CRM match that created and then
  deleted communication #6 for signup #7.
- Railway deployment `ce745559-7b8a-402c-822f-a2709c1246d1` reached SUCCESS.

2026-06-09 Buffer social posting switch deployed:
- Buffer is now the active social posting provider for Facebook, LinkedIn, and
  YouTube. The provided Buffer API key is stored outside git in
  `.secrets/buffer-api-key.txt` and in Railway production as `BUFFER_API_KEY`.
  Do not commit or display the key. The dashboard shows the current key as
  `BNAv2`, created 2026-06-09, expiring 2026-07-09.
- Railway production variables now include `SOCIAL_POST_PROVIDER=buffer`,
  `BUFFER_API_BASE=https://api.buffer.com`, `BUFFER_ORGANIZATION_ID`,
  `BUFFER_FACEBOOK_CHANNEL_ID`, `BUFFER_LINKEDIN_CHANNEL_ID`, and
  `BUFFER_YOUTUBE_CHANNEL_ID`.
- Connected Buffer channels verified by API:
  - Facebook: `Bnei Neviim Academy` / `6a2817b78f1d11f9b26a3805`
  - YouTube: `Bnei Neviim Academy` / `6a2817cf8f1d11f9b26a3866`
  - LinkedIn: `Bnei Neviim Academy` / `6a2817ed8f1d11f9b26a38fa`
- Server content-output approval for `facebook_post`, `linkedin_post`, and
  `youtube_description` now creates Buffer drafts/posts instead of GHL Social
  Planner drafts. Metadata is stored under `buffer_*` keys with
  `social_post_provider: "buffer"`.
- Telegram `/accounts`, content approval copy, social scheduler intent parsing,
  and Operations Prompt Studio social buttons now use Buffer language.
- Live diagnostic endpoint `GET /api/bna/buffer/diagnostics` returns
  `configured: true`, `provider: buffer`, and 3 social channels.
- Deployment note: the first live deploy was superseded by Railway env churn and
  exposed a startup blocker in `bna_tasks_category_check`; the init migration
  now normalizes unknown task categories to `operations` before re-adding the
  check constraint.
- Verification passed: Buffer schema/channel read-only API check,
  `node --check server.js`, `node --check scripts/ghl-ops.mjs`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/smoke-live-app.mjs`, `npm test` 71/71, Railway doctor,
  direct live Buffer diagnostics readback, and live app smoke
  `ops/live-smokes/2026-06-09T14-19-27-634Z-live-app-smoke.md`.
- Railway deployment `ce745559-7b8a-402c-822f-a2709c1246d1` reached SUCCESS and
  is serving the Buffer endpoint. No live Buffer draft/post was created as a
  write test.
- Known follow-up: Telegram/direct media social posts currently create text
  Buffer drafts; attaching local photos/videos still needs a hosted-media URL
  adapter for Buffer assets.

2026-06-09 Whapi/WAPI WhatsApp integration configured:
- Whapi channel details were configured for the BNA WhatsApp number
  `+972 53 493 2631`, channel `WOLVRN-YRJVR`.
- Secrets are stored outside git in `.secrets/whapi-token.txt`,
  `.secrets/whapi-api-token.txt`, and `.secrets/wapi-api-token.txt`, and in
  Railway as WAPI/WHAPI token and API URL variables. Do not commit or display
  the token in tracked files.
- Whapi settings were updated directly through the API:
  - webhook URL: `https://bneineviimacademy.org/api/webhooks/wapi?secret=[configured]`
  - `callback_persist = true`
  - auto-download enabled for `image`, `audio`, `voice`, `video`, `document`,
    and `sticker`
  - webhook events enabled for `messages` and `statuses`
- Live app WAPI endpoints:
  - `GET /api/webhooks/wapi` readiness check
  - `POST /api/webhooks/wapi?secret=[configured]` inbound callback
  - `GET /api/bna/wapi/webhooks` protected webhook/readback log
  - `GET /api/bna/wapi/diagnostics` protected config diagnostic
  - `POST /api/bna/contact-communications/send-whatsapp` protected text-send
    endpoint requiring `confirm: SEND_WHATSAPP`
- Verification passed: Whapi `/health` accepted the token, Whapi `/settings`
  readback confirmed the real webhook and media settings, live WAPI smoke event
  `wapi-config-smoke-2026-06-09` was processed into webhook log #5 and contact
  communication #5, protected diagnostics reported inbound and outbound
  configured, and live app smoke passed
  `ops/live-smokes/2026-06-09T14-18-08-733Z-live-app-smoke.md`.
- Railway deployment `ce745559-7b8a-402c-822f-a2709c1246d1` reached SUCCESS
  with the current local bundle.

2026-06-09 Public homepage PWA regression re-fixed:
- The public root still returned the landing page, but live `/manifest.json`
  had regressed to the Operations manifest with `start_url: "/operations"`,
  and stale `/operations?source=pwa` URLs reached Operations auth instead of
  the public homepage.
- Reapplied the manifest split: public `/manifest.json` is
  `Bnei Neviim Academy` with `start_url: "/"`; `/operations-manifest.json` is
  `BNA Operations` with `id: "/operations"` and
  `start_url: "/operations?source=ops-pwa"`.
- Removed the standalone homepage redirect to `/operations` again and added a
  server guard so `/operations?source=pwa` redirects to `/`.
- Verification passed: `node --check server.js`, manifest guard readback,
  `npm test` 70/70, live manifest readback, live stale-PWA redirect readback,
  Playwright root/stale-PWA check, and `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-09T13-37-05-346Z-live-app-smoke.md`).
- Railway deployment list shows `d2ba5ca7-3b75-40de-87df-76a6ec4f5ca2`
  SUCCESS and a newer `56f5a00d-3f7b-467b-8256-f5ad007d5036` lingering in
  INITIALIZING, but the live site is serving the corrected manifest and route
  behavior.

2026-06-09 WAPI webhook intake:
- Added live WAPI webhook endpoint `POST /api/webhooks/wapi` and ready check
  `GET /api/webhooks/wapi`.
- The endpoint stores inbound webhook payloads in `bna_wapi_webhook_log` with
  event/message/from/media summary fields, full payload, request headers, and
  received timestamp.
- Added protected readback endpoint `GET /api/bna/wapi/webhooks`.
- WAPI inbound messages now also file into the existing Contacts >
  Communications system (`bna_contact_communications`) as `channel =
  whatsapp`, `direction = inbound`, `source = wapi`, with follow-up required.
- WAPI phone matching tries existing parent leads first, then signup records,
  then students. If no phone match is found, the message is still visible as a
  general communication so it can be reviewed.
- WAPI message IDs are duplicate-safe for visible Communications rows: repeated
  webhooks link to the existing communication instead of creating duplicate
  contact-history cards.
- Railway production variable `WAPI_WEBHOOK_SECRET` is set; WAPI should use the
  URL with `?secret=...`.
- Live smoke passed:
  - GET `https://bneineviimacademy.org/api/webhooks/wapi` returned ready.
  - POST with the configured secret created a raw WAPI log and a
    Communications row.
  - POST with a wrong secret returned 401.
  - Duplicate message-id smoke linked to the original Communications row.
  - Smoke rows were deleted afterward so the live Communications list stayed
    clean.
- Verification passed: `node --check server.js`, `npm test` 70/70,
  `npm run openai:smoke`
  (`ops/openai-smokes/2026-06-09T13-46-09-808Z-openai-sidekick-smoke.md`),
  Railway deployment `fdef8ffa-2907-477b-a6ac-2dd8aa5fcc68` SUCCESS, targeted
  WAPI/Communications readback, and live app smoke
  `ops/live-smokes/2026-06-09T13-58-45-944Z-live-app-smoke.md`.

2026-06-08 Task #201 Learning Moments carousel Drive-backed feed:
- The homepage Learning Moments JSON feed now contains the three newest
  approved Drive website images:
  `20260528_122314.jpg`, `20260528_123610.jpg`, and `20260528_124630.jpg`.
- Those Drive originals match the bundled public web images under
  `public/images/learning-moments/`, and the feed points to the optimized
  public paths so the carousel is no longer empty when it loads Drive-backed
  data.
- Homepage carousel rendering now normalizes image paths, removes duplicate
  feed/fallback slides, and preloads the three carousel images instead of lazy
  loading hidden slides.
- Railway deployment `dd9d5096-331a-465e-93fb-e221b94c97e8` reached SUCCESS.
  Verification passed: `npm test` 57/57, local Playwright carousel render
  check, Railway doctor, live feed readback, live Playwright carousel image
  check, and `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-08T19-55-12-046Z-live-app-smoke.md`).

2026-06-08 Task #192 public domain verification:
- Live browser check confirmed `https://bneineviimacademy.org/` loads the
  public Bnei Neviim Academy homepage, not Operations, with no Operations title
  or check-mark app screen.
- `http://bneineviimacademy.org/` redirects to HTTPS.
- Live `/manifest.json` is public-facing with `start_url: "/"`, and stale
  `/operations?source=pwa` redirects to `/`.
- DNS/TLS finding: the bare domain has an A record and valid HTTPS; the `www`
  host still returns NXDOMAIN/no DNS record. Created live Shloimie task #194 to
  add/configure `www.bneineviimacademy.org` as a Railway custom domain plus the
  required registrar DNS record/certificate setup.

2026-06-08 Public homepage no longer redirects to Operations:
- Root cause: `public/index.html` contained a standalone/PWA-mode redirect from
  `/` to `/operations`, and the public `/manifest.json` was still the BNA
  Operations manifest with `start_url` set to `/operations?source=pwa`.
- Fix: removed the homepage standalone redirect, changed `/manifest.json` to a
  public Bnei Neviim Academy manifest with `start_url: "/"`, added
  `/operations-manifest.json` with `start_url: "/operations?source=ops-pwa"`,
  and pointed `public/operations.html` at the Operations manifest.
- Stale old shortcuts using `/operations?source=pwa` now redirect back to `/`
  before auth, so old public PWA launches also land on the public homepage.
- Service worker cache name moved to `bna-public-v6` so browsers pick up the
  corrected public shell.
- Railway deployment `5b68853a-14fd-47c1-807d-965242bdd176` reached SUCCESS.
  Verification passed: manifest JSON readback, inline script parse,
  `npm test` 48/48, Railway doctor, live root/manifest readback,
  browser Playwright root check stayed on `https://bneineviimacademy.org/`, and
  `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-08T16-37-40-012Z-live-app-smoke.md`).
- DNS note: bare `bneineviimacademy.org` resolves; `www.bneineviimacademy.org`
  has no DNS record.

2026-06-08 Facebook publish correction:
- Content job #29 / output #52 for the autonomy/free-choice student questions
  post had been prepared with GHL media and `publish_after_approval=true`, but
  it was still `needs_approval` and had not actually been sent to Facebook.
- The operator's "there is no post yet" message was treated as approval to
  publish. The live `approve_publish` action returned success from GHL.
- GHL Social Planner readback confirms published Facebook reel
  `6a26eb3dc39f87e2e6cf9f34`, parent post
  `61a6248c-72f5-4783-9fd0-0dfe212ff9cb`, with one media item attached.
- `server.js` now reads back recent GHL Social Planner posts after draft/publish
  actions and stores concrete post metadata on the content output, including
  `ghl_post_id`, `ghl_parent_post_id`, `ghl_post_status`,
  `ghl_post_platform`, and `ghl_post_display_date`.
- Railway deployment `9b2bc30e-dc99-45f3-8cf6-52f98484235c` reached SUCCESS.
  Verification passed: `node --check server.js`, `npm test` 46/46,
  `npm run openai:smoke`
  (`ops/openai-smokes/2026-06-08T16-21-10-076Z-openai-sidekick-smoke.md`),
  Railway doctor, and `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-08T16-24-46-030Z-live-app-smoke.md`).

2026-06-08 Facebook enrollment reel correction:
- The operator asked to replace the just-published Facebook reel with the better
  video and a cleaner enrollment-focused caption.
- Local video inspection showed `C:\Users\User\Downloads\bna 26-27.mp4` was the
  best admissions render available: 1080x1920, 20.11 seconds, about 25.36 MB,
  about 10.58 Mbps. `0607.mp4` was 720x1280 and `0607(1).mp4` was 480x854.
- The high-res `bna 26-27.mp4` file was uploaded fresh to GHL media as
  `https://assets.cdn.filesafe.space/IIofSrquLHvNxc8zrpka/media/6454651f-0ff7-408b-ab7f-1626e4da80c5.mp4`.
- GHL Social Planner edit returned `Updated Post`. GHL readback confirms the
  corrected Facebook reel `6a26f062308e6e5605f015ed` is `published`, uses the
  fresh high-res media URL, and has blank per-media caption so the long text is
  not duplicated on the media object.
- Content output #52 now has title `Facebook post: enrollment is open`, the new
  enrollment caption, status `published`, `ghl_post_id =
  6a26f062308e6e5605f015ed`, and `ghl_previous_post_id =
  6a26eb3dc39f87e2e6cf9f34`.
- `server.js` was hardened so future Facebook video media items leave
  `media.caption` blank and use the post summary as the caption text.
- Verification passed: `node --check server.js`, `npm test` 48/48,
  `npm run openai:smoke`
  (`ops/openai-smokes/2026-06-08T16-43-16-478Z-openai-sidekick-smoke.md`),
  GHL published-post readback, Railway deployment
  `373bf53d-3fce-4790-9ecd-6b7f69249621` SUCCESS, and live app smokes
  `ops/live-smokes/2026-06-08T16-50-44-105Z-live-app-smoke.md` and
  `ops/live-smokes/2026-06-08T16-52-38-041Z-live-app-smoke.md`.
- Railway also showed a later deployment
  `78ab9e17-f3ec-4df3-912c-5ef93528066c` as `INITIALIZING`; live production
  remained healthy and the prior deployment above is confirmed successful.

2026-06-08 YouTube Short publish:
- The same high-res GHL media URL from `bna 26-27.mp4` was published to the
  connected Bnei Neviim Academy YouTube account through GHL Social Planner.
- GHL Social Planner readback confirms YouTube post
  `6a26f47bab0e205c1b938d72` is `published`, platform `youtube`, type `reel`,
  with `youtubePostDetails.type = "short"`, title `Enrollment is Open | Bnei
  Neviim Academy #Shorts`, and `privacyLevel = "public"`.
- GHL's post fetch returned YouTube video ID `TelIFlQ7mdE`; public URL
  `https://www.youtube.com/shorts/TelIFlQ7mdE` returned HTTP 200.
- Description used:
  `Enrollment is open for Bnei Neviim Academy 2026-2027. Torah learning rooted
  in curiosity, intrinsic motivation, mentorship, and helping boys grow with
  purpose. #Shorts #BneiNeviimAcademy`
- Content output #53 now tracks the YouTube Short in Operations with status
  `published`.
- Verification passed: GHL published-post readback, live app Content readback,
  and `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-08T16-58-56-733Z-live-app-smoke.md`). Railway latest
  deployment `84c9e8b3-00ac-4031-b6e6-12629a6725c9` is `SUCCESS`.

2026-06-08 Audio parse correction and Student Analysis:
- The June 7 and June 8 audio parse was corrected directly against Railway
  Postgres with `scripts/correct-audio-parse-2026-06-08.mjs`.
- Corrected Torah progress:
  - 2026-06-07: Amitai 100 percent, Eitan Chaim Golombo 100 percent, Hillel
    50 percent, Huda 50 percent, Menachem 50 percent.
  - 2026-06-08: Eitan Chaim Golombo 0 percent but present/follow-up needed,
    Menachem 0 percent absent, Amitai 100 percent, Hillel 100 percent, Huda
    100 percent.
- Corrected accountability records include June 7 learning notes #61-#65, June
  8 updated learning notes #44-#48, Huda's question #66, Eitan's question #67,
  Hillel admin-only Student Analysis #68, and Eitan admin-only Student
  Analysis #69.
- Operations Students now has an admin-only `Student Analysis` subtab. Analysis
  records are stored as private accountability events with
  `metadata.kind = "student_analysis"` and were verified not to appear in the
  student portal.
- Live tasks created for Shloimie: #172 `Call Hillel's rabbi about learning
  approach` and #173 `Set up updated payment links for new and existing
  credit-card parents`.
- Railway deployment `39e03acd-7199-4e65-ba88-a5e7fe8043c3` reached SUCCESS.
  Verification passed: `npm test` 46/46, `npm run openai:smoke`
  (`ops/openai-smokes/2026-06-08T12-54-42-312Z-openai-sidekick-smoke.md`),
  `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-08T12-55-19-206Z-live-app-smoke.md`), Railway
  doctor, local Operations Playwright, and production Operations Playwright.

2026-06-08 Rabbi Elie One Time bot token smoke:
- The Rabbi-specific local token file is configured at
  `.secrets/telegram-rabbi-elie-scheller-bot-token.txt`.
- Telegram API `getMe` accepted the token and resolved the bot as
  `onetimeaios_bot` / `onetime_bot`.
- `getWebhookInfo` showed no webhook configured, so the bot is ready for the
  bridge's polling mode.
- `getUpdates` returned 0 updates, so no allowed Rabbi chat ID could be
  discovered from Telegram yet.
- `npm run telegram:rabbi` now reaches the intended scoped profile guard and
  blocks on missing One Time Operations credentials instead of missing token.
- Live startup still needs `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`,
  `ONE_TIME_OPS_USERNAME`, and `ONE_TIME_OPS_PASSWORD`.

2026-06-08 Telegram Codex planning-mode prompt refinement:
- Prompt-building requests for Codex or ChatGPT now have a deterministic
  visible planning path in `scripts/telegram-kimi-bridge.mjs`.
- The bridge detects requests to make/refine a prompt or brief, sends a visible
  draft prompt back in Telegram, stores an active runtime planning session, and
  accepts follow-up refinements without creating "make it shorter" task junk.
- The bridge only applies the refined draft to Codex when the operator says to
  build, apply, run, test, or implement. The Codex handoff includes the original
  raw operator input and refinement history as provenance.
- Server/bridge ramble capture filters prompt-planning fragments so they do not
  become automatic implementation or Needs Decision tasks.
- Verification passed: `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check server.js`, `node --check
  src/lib/bna/telegram-planning-intent.js`, targeted planning-intent tests,
  `npm test` 46/46, `npm run openai:smoke`, Railway redeploy/doctor, and live
  app smoke. The Telegram bridge was restarted after deployment.

2026-06-07 Signup six-document signature flow:
- Signup now shows six separate required document cards on English and Hebrew
  pages: Tuition Agreement, Parent Handbook, Student Handbook / Code of
  Conduct, Safety Acknowledgment and Liability Waiver, Registration / Intake
  Form, and Parent Agreement / Signature Page.
- Each document opens in one shared large modal; on mobile the modal fills the
  full viewport. Parents must scroll to the bottom before the electronic
  signature button enables.
- The old tiny waiver box and old single Registration Documents Package modal
  are no longer visible. The old Student Contract file is not used.
- `/api/submit` now requires `agreement_signatures[]` with all six stable
  agreement types. The safety waiver signature sets `waiver_accepted=true` for
  compatibility, but daily submission validation no longer trusts the old
  checkbox/package fields alone.
- `bna_signup_agreement_signatures` stores one row per signed document with
  title, version, language viewed, text snapshot, signer name/email, client
  timestamp, server timestamp, IP/user-agent, and metadata.
- Verification passed: `node --check server.js`, `node --check
  public/js/signup-documents.js`, signup inline script parse, local dry-run
  valid/missing/mismatched signature checks, local mobile Playwright signup
  check, `npm test` 33/33, `npm run openai:smoke`, Railway deployment
  `b01730b7-3736-43eb-90ce-e3354222ed6b`, Railway doctor, `npm run app:smoke
  -- --require-drive`, and live mobile Playwright signup readback.

2026-06-07 Signup package and Tasks/Changelog cleanup:
- Operations Tasks visible lanes are now Overview, Decisions, My Tasks, and
  Changelog. Machine-owned implementation work belongs in Changelog from queued
  to in-progress to verified; old `codex`, `done`, `rabbi`, `pending`, and
  `queue` task-section URLs are normalized into the simplified structure.
- The Operations command center now opens `Changelog Queue`, and the
  Telegram/OpenAI UI inventory says queued/active/completed agent work lives in
  Changelog. There is no separate visible Codex Queue lane for new UI guidance.
- Signup now uses the current downloaded registration package
  `bnei_neviim_registration_documents_bilingual_codex.md`; the old
  `Bnei Neviim Academy Student Contract.md` file is not used.
- The served parent-facing package starts at the English/Hebrew document
  content, not the Codex implementation notes, and visible signup/payment
  wording says first tuition payment instead of registration fee.
- Superseded by the six-document signature flow above. This earlier pass
  required two deliberate signatures before submit: Tuition Agreement and
  Registration Documents Package.
- Signup payment options now support credit, cash, and bank transfer. The
  default Morning payment link in code is `https://mrng.to/rCH4DWiR5t`.
- Duplicate-safe signup matching now refreshes an existing non-archived signup
  when the same student and parent identity submit again, instead of creating a
  new duplicate row.
- Verification passed locally: `node --check server.js`, inline scripts parsed
  for Operations, English signup, Hebrew signup, and thank-you pages, `npm test`
  33/33, `npm run openai:smoke`, signup dry-run with bank transfer + package
  signature passed, and missing-package dry-run was rejected with HTTP 400.
- Railway production `PAYMENT_LINK` was updated from the old Morning link to
  `https://mrng.to/rCH4DWiR5t`.
- Railway deployment `13fbb336-0e5a-4a9d-869e-3cd890d2d57b` reached SUCCESS.
  Railway doctor passed, `npm run app:smoke -- --require-drive` passed
  (`ops/live-smokes/2026-06-07T14-10-31-637Z-live-app-smoke.md`), and live
  signup readback confirmed Registration Documents Package, bank transfer, and
  no old parent-facing wording.

2026-06-07 Signup tuition agreement signature flow:
- Added the first required parent document signature flow: `Bnei Neviim Academy
  Tuition Agreement`, version `2026-06-07-v1`.
- Public signup pages now show a Tuition Agreement section before the waiver.
  Parents must open a large readable agreement modal and click the signature
  button at the bottom. The UI states that clicking the button is the parent
  electronic signature.
- The signature is tied to Parent 1 name and Parent 1 email. If either field
  changes after signing, the signature resets and the parent must sign again.
- Backend `/api/submit` now requires `tuition_agreement_accepted=true`,
  signer name, signer email, version, and client click timestamp. It rejects
  unsigned forms and rejects signer names/emails that do not match Parent 1.
- Signup rows store summary fields:
  `tuition_agreement_accepted`, `tuition_agreement_accepted_at`,
  `tuition_agreement_version`, `tuition_agreement_signer_name`,
  `tuition_agreement_signer_email`, and
  `tuition_agreement_client_signed_at`.
- Detailed document signatures are stored in
  `bna_signup_agreement_signatures` with signup id, agreement type/title,
  version, text snapshot, signer, server timestamp, client timestamp, IP,
  user agent, and metadata. This table is intended for future required
  signup documents too.
- Verification passed: `node --check server.js`, signup inline scripts parse,
  `npm test` 33/33, Railway deployment
  `591f5ddc-fc87-4c34-a47f-a30d4e0d6932` reached SUCCESS, Railway doctor
  passed, `npm run app:smoke -- --require-drive` passed
  (`ops/live-smokes/2026-06-07T13-07-54-405Z-live-app-smoke.md`), targeted
  live browser check confirmed modal open/sign/reset behavior, targeted API
  checks confirmed unsigned and mismatched signatures are rejected, and
  `npm run openai:smoke` passed
  (`ops/openai-smokes/2026-06-07T13-09-23-353Z-openai-sidekick-smoke.md`).

2026-06-07 Accounting duplicate roster fix:
- Root cause: the Accounting roster combined active signup rows with
  already-matched payment-intake rows. After Weber/Huda and Galambo/Eitan were
  reconciled, their matched intake rows were still displayed as separate
  "open" roster cards.
- Operations now filters payment-intake rows through
  `isUnresolvedPaymentIntake()`, so only genuinely unresolved intake appears in
  the Accounting roster. Matched, completed, and ignored intake remains in the
  backend/history but does not duplicate the family card.
- Live Accounting `payments` view verification: 5 rows exactly, one each for
  Hillel Baraka, Huda Weber, Amitai Kosofsky, Eitan Chaim Golombo, and
  Menachem Mendel Dratler. `Needs signup` shows 0, `Paid` shows 4, `Open`
  shows 1, and no duplicate student names are present.
- Verification passed: Operations inline scripts parse, `npm test` 33/33,
  Railway deployment `85378409-0914-434f-bb66-d82951de65e5` reached SUCCESS,
  targeted live Playwright Accounting check passed, Railway doctor passed, and
  `npm run app:smoke -- --require-drive` passed:
  `ops/live-smokes/2026-06-07T12-38-57-821Z-live-app-smoke.md`.

2026-06-07 Forgotten-work/accounting audit and homepage Blog carousel:
- Public homepage Blog now renders as a horizontal carousel instead of six
  stacked desktop rows. Desktop shows three cards at a time; tablet narrows the
  card width; mobile remains a one-card horizontal carousel. Category filters
  reset the Blog row back to the first card.
- Added admin-only `POST /api/bna/payment-intake/reconcile-paid` so paid intake
  records with missing official signup forms can be safely turned into real
  signup/student/payment links without inventing contact details.
- Reconciled Nikki Weber / Huda Weber into signup #9 with payment log #5:
  ILS 1000 paid by Green Invoice on 2026-05-25, next due 2026-06-25, missing
  email/phone intentionally blank.
- Reconciled Shalom Galambo / Eitan Chaim Golombo into signup #10 with payment
  log #6: ILS 1000 paid cash on 2026-05-25, next due 2026-06-25, parent email
  `sholom2712@gmail.com`.
- Production readback now shows `needs_signup` payment-intake count 0. Braka /
  Hillel Baraka remains the only known partial payment: ILS 800 paid, ILS 200
  remaining.
- Hidden-work audit report:
  `ops/system-audits/2026-06-07-forgotten-work-and-accounting-audit.md`.
- Verification passed: `node --check server.js`, `npm test` 33/33, Railway
  deployment `d012de8b-aea5-43ce-a9af-1ea1ec572eba` reached SUCCESS, protected
  Accounting readback passed, and Playwright confirmed the homepage Blog has 18
  cards in one visual row with no page-level horizontal overflow on desktop or
  mobile. Full smokes also passed: `npm run openai:smoke`
  (`ops/openai-smokes/2026-06-07T12-30-22-849Z-openai-sidekick-smoke.md`) and
  `npm run app:smoke -- --require-drive`
  (`ops/live-smokes/2026-06-07T12-30-09-485Z-live-app-smoke.md`).

2026-06-07 Braka payment reconciliation and live queue audit:
- Braka/Baraka payment was reconciled from operator-provided Green Invoice
  details. Signup #7 Naomi Braka / Hillel Baraka is now `partial`, method
  `green_invoice`, amount paid ILS 800.00, Green Invoice transaction
  `DP488806585`, received 2026-06-01 09:16, with ILS 200.00 remaining.
- Payment intake #7 is linked to signup #7 and marked `matched`, so Braka no
  longer appears as `needs_signup`. Payment log #4 records the completed
  ILS 800.00 Green Invoice payment.
- Live task audit after reconciliation: 102 total app tasks, 1 active. The only
  active task is #147, `Complete Google Business Profile Task`, assigned to
  Shloimie from content job #24. Codex/agent-fleet queue is empty:
  pending 0, in_progress 0, urgent_today 0, agent fleet running.
- Remaining `needs_signup` payment intake records are Nikki Weber / Huda Weber
  and Shalom Galambo / Eitan Chaim. They are paid intake records without live
  signup rows, not unpaid records.

2026-06-07 Planned/Implementation Briefs removed from operator-facing Tasks:
- Operations Tasks no longer shows a Planned Briefs, Pending Briefs, or
  Implementation Briefs subtab, overview card, status strip, or workload count.
  `tasks-pending/*.md` remains as internal Codex handoff material only.
- Current operator-facing task lanes are Overview, Decisions, My Tasks, and
  Changelog. If a Telegram item does not require Shloimie's decision, it should
  route to Changelog Queue rather than sit as a planned brief.
- The Telegram/OpenAI Operations snapshot no longer fetches or reports
  pending-brief counts. OpenAI system-status replies should answer from live
  Tasks, Decisions, My Tasks, Changelog, Students, Content, Contacts,
  Accounting, Devices, and agent-fleet data.
- Verification passed: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`,
  `node --check scripts/smoke-openai-sidekick.mjs`,
  `node --check scripts/smoke-live-app.mjs`, Operations inline scripts parse,
  `npm test` 33/33, `npm run openai:smoke`, Railway deployment
  `8da4a8a1-7cf2-424b-9a5d-f4188a116b73` reached SUCCESS, Railway doctor
  passed, live smoke passed
  `ops/live-smokes/2026-06-07T10-33-48-070Z-live-app-smoke.md`, and targeted
  live mobile checks confirmed no brief lane for `section=overview` or stale
  `section=briefs`.

2026-06-07 Telegram OpenAI Operations context fix:
- Root cause: broad operator requests like logistics/scheduling/ordering were
  sometimes routed to the weekly transcript topic inventory path, and the
  OpenAI fallback only received a small app snapshot. That made OpenAI answer
  from class transcripts instead of live Operations sections/tasks.
- The bridge now attaches a section-aware Operations snapshot for system
  questions: UI sections/subtabs/buttons/actions, task lane counts, active task
  details/comments, agent fleet status, students, accountability, Torah,
  devices, content jobs, prompts, bundles, contacts, accounting, reminders, and
  recent Green Invoice webhook summaries.
- Transcript topic inventory now refuses operational/system prompts unless the
  operator explicitly asks for transcript/class-content topics.
- The OpenAI sidekick smoke validates Operations sections, content prompts,
  devices, protected app endpoints, Drive folders, students, payments, and
  transcripts. Verification passed: `node --check
  scripts/telegram-kimi-bridge.mjs`, `node --check
  scripts/smoke-openai-sidekick.mjs`, `npm test` 33/33, and
  `npm run openai:smoke` with report
  `ops/openai-smokes/2026-06-07T09-57-22-678Z-openai-sidekick-smoke.md`.
- Local Telegram bridge was restarted with the fix live on PID `13056`.

2026-06-07 Tasks pending cleanup for Telegram task #140:
- Tasks no longer uses generic visible "Pending" language for ordinary work.
  The later same-day cleanup removed the visible brief lane entirely. Codex
  status copy says queued instead of pending, and assigned task badges render
  as Ready instead of Pending.
- Live task audit found only three active records: #140, duplicate clarified
  decision capture #139, and previously verified Torah correction #134. All
  three are now marked done/verified in the app, leaving 0 active tasks.
- Verification passed: `node --check server.js`, inline Operations/Student
  scripts parse, `npm test` passed 33/33, `npm run openai:smoke` passed,
  Railway deployment `a8fa5789-224c-4b2a-b4f9-9dbe21e15f41` succeeded,
  Railway doctor passed, live smoke passed
  `ops/live-smokes/2026-06-07T09-37-45-977Z-live-app-smoke.md`, and a targeted
  live Operations mobile check confirmed queued Codex wording with no 390px
  horizontal overflow.

2026-06-07 Torah progress correction for Telegram task #134:
- Live Torah rows for the stored 2026-06-04 recording were corrected from the
  operator's follow-up: Eitan Chaim Golombo and Amitai Kosofsky completed the
  full assigned time, Menachem Mendel Dratler and Huda Weber completed half,
  and Hillel Baraka completed two-thirds.
- Cumulative 30-unit trip progress now counts daily completion fractions
  instead of flattening all five students to the same completed-unit snapshot:
  Amitai and Eitan show 18 percent, Huda, Hillel, and Menachem show 17 percent,
  group progress is 17 percent, and the trip remains locked.
- `POST /api/bna/torah-learning/reconcile-trip-progress` now defaults to
  recalculating from daily percentages and refuses multi-student uniform
  overrides unless `apply_uniform_to_all_students: true` is explicit.
- Verification passed: `node --check server.js`,
  `node --check scripts/fix-torah-progress-task-134.mjs`, `npm test` passed
  33/33, `npm run openai:smoke` passed, Railway deployment
  `8b0152d8-12e3-4d40-b9c7-11ba393eea53` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T09-30-31-386Z-live-app-smoke.md`, and a targeted
  live reconcile negative test returned HTTP 400 for an unsafe multi-student
  uniform reset.

2026-06-07 Operations app shell for Telegram task #130:
- Operations now renders inside a desktop left sidebar and a mobile hamburger
  left drawer instead of the previous top horizontal category nav.
- Main app sections remain Tasks, Students, Content, Contacts, and Accounting,
  with per-section subtabs and URL `section` state.
- Tasks is split into Overview, Decisions, My Tasks, and Changelog. Students is
  split into Overview, Group Goal, Student
  List, Student Profile, Goal Board, Tablet Access, Questions, and Portal
  Links. Content, Contacts, and Accounting have functional filter-style
  subtabs.
- The old always-on Daily Command Center strip no longer renders above every
  section; key command metrics live in the focused Tasks overview.
- Verification passed: `node --check server.js`, inline Operations scripts
  parse, `npm test` passed 30/30, local Playwright screenshots confirmed the
  desktop sidebar and mobile drawer with 390px no-overflow rendering,
  `npm run openai:smoke` passed, Railway deployment
  `542e288f-51f1-4ee6-a905-81010e65eb0a` succeeded, and live smoke passed:
  `ops/live-smokes/2026-06-07T08-44-52-619Z-live-app-smoke.md`.
- Follow-up same day: Codex patched checklist misses after the fleet finished.
  The student portal no longer renders or binds any Add Goal/configuration
  form; students can only check off assigned goals and write notes. The
  Operations admin Goal Board creation form is now collapsed behind an Add Goal
  details control instead of being permanently visible above the list.
  Verification passed: inline Operations/Student scripts parse, `npm test`
  passed 30/30, `npm run openai:smoke` passed, Railway deployment
  `54a5e5f4-078a-4ce6-b76d-2f60d022e9f1` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T08-55-35-102Z-live-app-smoke.md`, and a targeted
  live mobile student-portal check confirmed no Add Goal/configuration text,
  the read-only notice is present, and no 390px horizontal overflow.
- Second follow-up same day: Contacts now renders as clickable compact roster
  cards with a selected detail panel instead of the legacy dense contacts
  table. Verification passed: inline Operations/Student scripts parse,
  `npm test` passed 30/30, `npm run openai:smoke` passed, Railway deployment
  `07feaf4c-960a-4f9f-8be0-153702f31429` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T09-05-39-414Z-live-app-smoke.md`, and targeted
  live Operations validation confirmed 4 contact cards, a detail panel, no
  legacy contacts table, and no desktop horizontal overflow.
- Split-message reconciliation same day: Codex audited Telegram messages 425,
  426, 427, and 428 as one UI redesign spec instead of only task #130's final
  chunk. Content subtabs now match Library, Selected, Repurpose, Newsletter,
  Prompts, and Bundles. Contacts subtabs now match Parents, Students, Intake,
  Needs Follow-up, and Tags. Accounting subtabs now match Overview, Payments,
  Open/Pending, Paid, Needs Signup, and Exceptions, with Overview showing
  compact totals instead of the full payment roster. The Telegram bridge now
  buffers split spec chunks and attaches them to the Codex implementation task
  as an internal comment. Verification passed: `node --check
  scripts/telegram-kimi-bridge.mjs`, inline Operations/Student scripts parse,
  `npm test` passed 30/30, `npm run openai:smoke` passed, Railway deployment
  `c50bb6a5-5adb-4edb-ba3d-7c34b07b2684` succeeded, live smoke passed
  `ops/live-smokes/2026-06-07T09-22-06-026Z-live-app-smoke.md`, and targeted
  live mobile validation confirmed the new Content/Contacts/Accounting tabs
  with no 390px horizontal overflow.
- Final acceptance same day: the split prompt was checked against the live app
  after the later Railway deployment `a8fa5789-224c-4b2a-b4f9-9dbe21e15f41`.
  Student Profile shows the requested collapsed admin sections, Content keeps
  filters/details collapsed, Prompts expose View/Edit and Make Output actions,
  Contacts shows compact roster cards plus selected parent detail/actions/timeline,
  and Accounting Overview shows summary cards without the roster table. Live
  smoke passed `ops/live-smokes/2026-06-07T09-38-15-451Z-live-app-smoke.md`;
  final UI acceptance passed
  `ops/system-audits/2026-06-07-ui-redesign-final-acceptance-1780825809195.json`.

2026-06-07 page-top polish for Telegram task #126:
- Operations mobile now keeps the Daily Command Center compact by rendering the
  six attention cards as a horizontal summary strip. The measured mobile
  command-center height dropped from 1069px to 218px, so the actual lane
  workspace starts near the first screen instead of far below the fold.
- Public homepage mobile entrance animations now use vertical motion instead of
  horizontal translate, removing hidden sideways page overflow. Live mobile
  checks for Home, Blog, FAQ, Student, and Operations all measured 390px page
  width with no horizontal overflow.
- Student portal landing alignment is tighter on desktop, with the language
  toggle aligned to the top row and the access card widened slightly. Mobile
  Student remains single-column.
- Verification passed: `node --check server.js`, inline
  public-page scripts parse, `npm test` passed 30/30, `npm run openai:smoke`
  passed, Railway deployment `85cfdcab-131d-4510-8520-b25e413ee052`
  succeeded, and live smoke passed:
  `ops/live-smokes/2026-06-07T03-25-17-982Z-live-app-smoke.md`.

2026-06-07 Operations UI command-center pass:
- Operations now has a top Daily Command Center above the main views, showing
  pending decisions, Codex queue, student accountability attention, tablet
  access issues, content needing review, and payment exceptions from the
  existing live APIs.
- Task rows now show a cleaner scan view by default: title, short detail,
  project, urgency, owner/stage, decision/comment/due signals, and an explicit
  cue to open the card for raw notes, verification, and full metadata.
- Students/Accountability now starts with a clear page heading and student
  signal cards showing agreement status, device state, due time, bedtime/wake
  agreement, access duration/window, recovery path, and cumulative trip
  progress. Admin Torah/device/goal details remain in selected-student panels.
- Content cards now show a primary next-action pill while transcripts and
  prompt/output details remain collapsed until opened.
- Accounting remains a roster-style payment view only; the payment reminder
  panel and Green Invoice webhook audit are not shown in the payment section.
- Student portal now has a boy-facing command strip for My Agreement, Check
  Off, Tablet Access, and Torah/Trip status. It continues to display
  cumulative trip progress separately from daily completion.
- Public shared page CSS now keeps blog cards equal-height, improves shared
  section spacing, and normalizes small hover/motion behavior.
- Verification passed: inline `public/operations.html` and `public/student.html`
  scripts compile, `npm test` passed 30/30, `npm run openai:smoke` passed,
  Railway deployment `683dc322-538e-4ca0-bdb5-272c194d9861` succeeded, and
  live smoke passed:
  `ops/live-smokes/2026-06-07T03-00-07-526Z-live-app-smoke.md`.

2026-06-06 automatic accountability tablet-access MVP:
- Student Goal Board metadata now separates the student agreement, success
  access rule, and missed-goal recovery/consequence.
- The first bedtime/wake-up flow supports in-bed/out-of-bed times, the
  student's chosen rule/consequence, automatic approved-access duration after
  honest checkoff, and missed-goal locked/accountability-only recovery.
- Student portal checkoff now applies the configured approved-access session
  automatically when a goal first reaches 100 percent. Partial checkoffs do not
  open access, and already-completed goals do not repeatedly reopen access.
- If no tablet record exists, the checkoff saves and returns
  `no_device_configured` so the UI can explain that access could not open yet.
- Q Studio/Qustodio remains the content-filter layer. Real Android calls remain
  disabled; the BNA device provider is still mock-only until Headwind/FreeKiosk
  is verified on a factory-reset test tablet.
- Operations Students now exposes accountability filters for Needs Setup, Due
  Today, Checked Off, Missed, Access Open, Locked, and Needs Review.
- Final Railway deployment `ed79c92e-605e-4732-9bec-bf67a71e506e` passed live
  smoke `ops/live-smokes/2026-06-06T20-07-35-433Z-live-app-smoke.md`.

2026-06-06 closeout audit:
- Root cause for "verified but unchanged UI": the autonomous agent fleet used to
  mark tasks done after local verification only. It now requires deployable app
  changes to pass `npm run railway:redeploy` and `npm run railway:doctor`
  before marking a task done.
- Railway deployment `b3c6d076-8a75-4190-9c3b-26a58ef098b4` deployed the latest
  closeout fixes: Torah trip reconciliation endpoint, summary snapshot fix,
  idempotent Torah migration seeding, Telegram `/railway_deploy`, and updated
  source-of-truth task docs.
- Live task audit after cleanup: active tasks `0`, raw/natural-language-looking
  visible task titles `0`, agent fleet running and not stale, pending queue `0`.
- Torah progress drift was fixed. Public and admin summaries now show all five
  current students at 15 percent cumulative trip progress, group 15 percent,
  trip locked. Daily completion remains admin/private and is not public trip
  completion.
- `GOOGLE_DRIVE_PIPELINE_CONFIG` was pushed to Railway with Website Images
  intake, simplified folder metadata, and source-of-truth notes. Drive remains
  operator-facing upload/source-media storage; GitHub remains canonical for
  brand, memory, and transcript exports.
- Student Goal Board MVP and tablet/device-control mock UI are implemented and
  deployed. Real tablet control is still mock-only until physical Android
  hardware plus QStudio/Qustodio/Headwind/FreeKiosk credentials are confirmed.
- One Time project collaboration, comments, Decision Required, scoped task
  access, and Rabbi Elie bridge profile are implemented. Live Rabbi bot startup
  still needs Rabbi-specific Telegram token/chat id and scoped login secrets.
- Follow-up deployment `39b175a8-da2e-4bb4-9160-42c6ee6cb082` added protected
  signup dry-run validation, live app smoke coverage via `npm run app:smoke`,
  and task-source sanitization so invalid task sources no longer become
  database constraint 500s. Latest live smoke report:
  `ops/live-smokes/2026-06-06T18-32-32-620Z-live-app-smoke.md`.
- Historical 2026-06-06 smoke note: the app smoke verified health, Operations
  login/session, protected dashboard APIs, public/admin Torah cumulative
  progress, task create/comment/delete, signup submit dry-run, then-active
  retired social diagnostics, and Drive Website Images lane access. This note is
  superseded by the 2026-06-14 no-GHL policy.
- GHL/Facebook drafting now has a safer account-selection rule: Content
  approval will use the only active Facebook account, or the configured
  `GHL_DEFAULT_FACEBOOK_ACCOUNT_ID`; if multiple active Facebook accounts are
  connected and no default is set, the app refuses to pick one automatically.
  This guard is live on Railway deployment
  `38253aaf-4c05-4bb8-9e6b-5727dc856a19`; latest smoke report:
  `ops/live-smokes/2026-06-06T18-39-30-826Z-live-app-smoke.md`.

2026-06-06 sub-agent push:
- Spawned parallel agents for backlog audit, Remotion rendering, stale-family
  cleanup audit, newsletter workflow scoping, payment/signup reconciliation,
  and Telegram/GHL publish verification.
- Remotion produced
  `renders/20260606-operator-plain-english-remotion-edit.mp4` from fallback
  source `renders/remotion-source-smoke-input.mp4`; report:
  `ops/remotion-smokes/2026-06-06-operator-plain-english-edit.md`.
- Newsletter review/edit flow is live on Railway deployment
  `49be9d9b-c83e-4b1b-9361-b026b0917ed0`: Operations Content now has weekly
  newsletter review bundles with source lists, generate/regenerate, draft
  textarea editing, save edits, approve/save-example, and archive. It does not
  send email; recipient preview/test-send/live-send remains a separate guarded
  future step.
- Latest live app smoke passed:
  `ops/live-smokes/2026-06-06T18-52-29-196Z-live-app-smoke.md`.
- Payment/signup reconciliation audit confirms Amitai Kosofsky and Menachem
  Mendel Dratler are paid with active signups; Eitan Chaim and Huda Weber have
  paid/intake records needing signup/contact reconciliation; Hillel Baraka is
  signed up and payment pending. Report:
  `ops/system-audits/2026-06-06-payment-signup-reconciliation-agent-e.md`.
- Historical retired-social publish code paths were verified for `/accounts`,
  `publish draft`, `publish now`, media captions, aliases, ambiguity handling,
  and diagnostics, but no live retired-provider draft/post was created. Reports:
  `ops/system-audits/2026-06-06-telegram-ghl-publish-workflow.md` and
  `ops/system-audits/2026-06-06-agent-f-telegram-ghl-publish-workflow-verification.md`.
- Stale family cleanup audit was created at
  `ops/system-audits/2026-06-06-stale-family-cleanup-audit.md`; runtime/schema
  removals should wait for Express-vs-Next and canonical API decisions.

2026-06-05 autonomous Codex agent fleet:
- Built `scripts/agent-fleet-supervisor.mjs` as the guarded worker loop for
  live Operations Changelog Queue tasks.
- The fleet claims one Codex/system/agent-owned active task at a time by
  default, writes a local task lock under `.runtime/agent-fleet/`, patches the
  task to `in_progress`, runs Codex CLI, then runs the verifier phase.
- Default verifier commands: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`, `npm test`, and
  `npm run openai:smoke`.
- Successful runs patch the live task to done/verified, add a task comment,
  append `ops/agent-changelog.md`, append `ops/agent-task-ledger.jsonl`, write
  detailed reports to `ops/agent-fleet-runs/`, and notify Telegram.
- Failed runs are retried up to `AGENT_FLEET_MAX_RETRIES` and then moved to
  `needs_decision` so the same broken task does not loop forever.
- Commands: `npm run agent:fleet:status`, `npm run agent:fleet:once`,
  `npm run agent:fleet:start`, `npm run agent:fleet:restart`; Telegram:
  `/agent_fleet_status`, `/agent_fleet_once`, `/agent_fleet_start`.
- The Operations Tasks Changelog focus now shows queued, in-progress, verified,
  and completed agent work in one visible place.
- Live umbrella task #67 was marked done/verified after this build. Latest
  baseline smoke sees active Codex tasks `72, 65, 49, 43`.
- The local watcher was started after verification. Supervisor PID `37572`
  claimed task #43 first; Telegram bridge PID after restart was `203012`.
- Follow-up status: the fleet completed the live Codex queue through #43, #49,
  #65, #72, and #98. Tasks #100 and #101 were cleaned/implemented manually as
  OpenAI research/proactive-insight behavior. Latest `npm run openai:smoke`
  reported active Codex tasks `0`.
- The watcher remains alive for future work. Current audited supervisor PID:
  `156164`, polling every 60 seconds with active Codex queue `0`.
- The "crazy long output" root cause was task #100: the fleet copied raw Codex
  CLI failure output into visible `verification_notes`. The supervisor now
  summarizes failures and keeps raw logs in `ops/agent-fleet-runs/`.
- Telegram process caveat resolved: the stale elevated pollers were killed.
  Current audited Academy bridge lock points at PID `226264`, started
  `2026-06-08T07:02:52.561Z`, stderr is empty, and update offset is
  `948165228`.

2026-06-05 OpenAI sidekick smoke test:
- Added `npm run openai:smoke` and Telegram `/smoke_openai` as the repeatable
  answer to whether OpenAI is really connected to the system.
- Latest smoke passed with `npm run openai:smoke -- --telegram` and wrote
  `ops/openai-smokes/2026-06-05T11-35-17-138Z-openai-sidekick-smoke.md`.
- The smoke verified: 8 repo source-of-truth files readable, 18 transcript
  exports readable, 10 protected BNA app endpoints readable, 7 Drive folders
  readable, OpenAI `gpt-4.1-mini` returned structured answers from live data,
  and Telegram summary delivery worked.
- Live data recognized by OpenAI during the smoke: active Codex tasks
  `72, 67, 65, 49, 43`; students Amitai Kosofsky, Eitan Chaim Golombo, Hillel
  Baraka, Huda Weber, and Menachem Mendel Dratler; pending payment student
  Hillel Baraka; Drive raw folder `00 Upload Here - Raw Media Intake`.
- The bridge was restarted after wiring `/smoke_openai`; current lock at the
  time of verification was PID `226784`.

2026-06-05 Drive/source-of-truth cleanup:
- Google Drive is now the operator-facing upload and source-media library, not
  the canonical brand/memory/transcript store.
- Current upload folders under `BNA V2`: recordings/videos/audio go into
  `00 Upload Here - Raw Media Intake`; website/blog images go into
  `00 Upload Here - Website Images`.
- Processed source media is consolidated in
  `20 Processed Recordings - Source Media`; approved website assets live in
  `30 Approved Website Assets`; old redundant stage folders and the deprecated
  Drive brand mirror live in `_Archive - Legacy Pipeline Folders`.
- Brand kit and agent memory are GitHub-canonical under `brand-kit/` and
  `content-memory/`. Transcript exports are GitHub-canonical under
  `content-memory/transcripts/`, while the live app database remains the
  working transcript source.
- The Drive setup route/scripts keep old stage keys as compatibility aliases
  but map them to the simplified folders. Latest audit:
  `ops/drive-audits/2026-06-05T10-24-54-809Z-google-drive-audit.md`.

2026-06-09 Drive content library mirror:
- `BNA V2 / 40 Content Library - Marketing` is live as the readable marketing
  mirror for transcripts and website articles:
  `https://drive.google.com/drive/folders/1NeNa2h4ELIv3uQJAGrFkchyE4b6rM1aX`.
- `scripts/sync-drive-content-library.mjs` and
  `npm run content:sync-drive-library` sync real content transcripts from the
  live app database into Google Docs, one doc per content job, with metadata,
  subject breakdown, source links, and raw transcript preserved at the bottom.
- Current verified Drive counts: 16 transcript docs, 24 website article docs,
  2 index docs, and no duplicate content-job/article keys. Reruns skip
  unchanged docs before rendering/AI work and refresh only indexes unless
  `--force` is used.
- Telegram command `/sync_content_drive` runs the sync manually. Telegram and
  Drive media intake queue a non-blocking single-job sync after real content
  transcripts are saved.
- OpenAI remains the preferred AI provider, but the local OpenAI key was
  rejected during the 2026-06-09 sync; the script falls back to Kimi when
  configured. Job `#20` kept existing parsed notes because the fallback provider
  rejected that transcript as high risk.

2026-06-05 Telegram OpenAI transcript/topic behavior:
- OpenAI mode should answer transcript/topic/content questions directly in chat.
  It should not ask A/B/C format questions when the operator clearly asks for a
  transcript summary, topic list, weekly learning inventory, newsletter, or
  revised post.
- The bridge has a dedicated weekly transcript topic-inventory route. Requests
  like "list the actual things we learned this week from all transcripts" select
  recent transcribed Content jobs, generate the topic inventory through OpenAI,
  send it in Telegram, and log it as OpenAI content work without creating a
  Codex task.
- Decision buttons now keep source context and can continue transcript-topic
  work instead of only saying "Decision captured."

2026-06-05 Telegram AI mode selector:
- Telegram now treats OpenAI API as the default reply engine for ordinary
  conversation, content/tone refinement, brainstorming, and normal system
  running when configured.
- Clear repo/code/database/bridge/deploy/test/dashboard/programming work routes
  to Codex automatically.
- The Telegram bridge has persistent bottom reply-keyboard buttons for
  `OpenAI API` and `Codex`. Pressing `Codex` forces Codex replies until
  `OpenAI API` is selected again.
- Per-chat mode state is stored locally in `.runtime/telegram-chat-modes.json`.

2026-06-05 One Time / Rabbi Elie Scheller setup:
- The existing Mishnah/Mishna project/filter should be reused and standardized
  as `One Time Mishnah Class`; short visible label may be `One Time`.
- Operations Content now displays the existing `mishna` project filter as `One
  Time` without changing the internal key, so current content data is preserved.
- Rabbi Elie Scheller has a scoped agent scaffold in
  `agents/rabbi-elie-scheller/` for future Telegram bot/agent work.
- The current task schema does not yet have first-class projects, project
  members, task comments, or a decision-required flag. The implementation brief
  is `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md`.

2026-06-05 Telegram natural conversation rule:
- Telegram should feel like talking to Codex naturally, not like reading job
  queue logs.
- Ordinary chat should not receive `queued Codex in the background` style
  placeholder messages. The async bridge now stays quiet for conversational
  messages and sends the final Codex reply directly.
- Capture summaries are still sent when a real task, student note, payment
  item, content item, or decision was created or needs action.

2026-06-05 `build everything` Telegram rule:
- When Shloimie says `build everything`, Codex should choose the order from
  `TASKS.md` and the newest internal `tasks-pending/` handoff files, start
  executing, and report completed/verified work. Do not ask for ordering
  confirmation unless there is a real blocker or product decision.
- Task #67 was renamed to `Work through queued Codex tasks in a practical
  order` and remains assigned to Codex.
- Task #68 was renamed to `Remember build everything means work through queued
  tasks without order confirmation`, marked done, and verified after the rule
  was stored in `AGENTS.md`, `MEMORY.md`, today's memory file, and the Telegram
  bridge/server parser instructions.
- Railway deployment `a965d40a-37c0-4a38-a610-ef08c53fbdd3` deployed the
  server parser special case. Live smoke passed: `/api/health` returned OK, a
  temporary `Build everything` task produced the clean title `Work through
  queued Codex tasks in a practical order`, and the temporary task was deleted.

2026-06-04 WhatsApp content structure correction:
- Latest content job #21 WhatsApp output #39 was revised so the main video point leads with sleep/routines, breakfast, food environment, and values-to-actions, followed by a separate "Other things we did and discussed this week" section.
- Live WhatsApp Prompt Studio prompt was updated to v2 with the rule: preserve the main video message first, then separate extra class/week details.
- Repo-side WhatsApp prompt memory and the Telegram bridge auto-draft helper were updated with the same rule.
- Verification passed: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, live API confirmed output #39 contains the sleep lead and other-topics section, and Telegram task #63 is done/verified.

2026-06-04 mobile hamburger and installed app launch update:
- Superseded on 2026-06-08 by the public homepage manifest split. Current
  behavior: public `/` stays on the landing page even in standalone/PWA mode;
  Operations uses `/operations` plus `/operations-manifest.json`.
- Public website links still open the public website in normal browser mode.
- Historical behavior only: the installed BNA phone app was temporarily
  Operations-first with `public/manifest.json` using `name: "BNA Operations"`
  and `start_url: "/operations?source=pwa"`.
- Historical behavior only: installed-app/homepage launches were guarded by
  standalone display-mode and redirected from `/`, `/he`, or `/index.html` to
  `/operations`.
- Historical behavior only: old `/operations.html?source=pwa` shortcuts
  redirected to `/operations`, not the public homepage.
- `public/sw.js` is `bna-public-v4`.
- Mobile public hamburger menus are now 236px compact right-side popovers on a 390px phone viewport, showing only Home, Blog, FAQ, language, Contact Us, and Sign Up.
- Accounting mobile summary cards remain compact but show their labels under the numbers; only the longer explanatory notes are hidden on mobile.
- Railway deployment `80c520d6-fc0f-44b7-9c35-8073f48c7404` deployed the fix. Live Playwright smoke passed for `/api/health`, manifest, service worker, homepage mobile menu, standalone app launch to `/operations`, old PWA URL redirect, and Accounting labels.

2026-06-04 Telegram completion reporting rule:
- Operator clarified that after Codex runs a requested test, completes a fix, deploys, or verifies work from Telegram, Codex must report back in Telegram that it was accomplished and list the verification result.
- This rule is now recorded in `AGENTS.md` and `MEMORY.md` so future Telegram development turns do not leave completion implicit.

2026-06-04 Content lane routing cleanup:
- Content is now treated as class/teaching material only: teaching philosophy, topics covered, verses/sources, class discussions, and class questions.
- Goals, personal/operator tasks, Codex/system tasks, student accountability, private meetings, attendance, progress, and follow-ups are filtered out of Content display and belong in Tasks or Students.
- Mixed recording parser instructions now explicitly split Tasks, Students/accountability/Torah progress, and class notes. Sources should include the best heard reference, with Hebrew source text only if it was present in the transcript.
- Telegram media routing now distinguishes class-content intent from parser-only task/student intent. Class recordings stay in Content while the parser still extracts Tasks/Students records.
- Live cleanup archived Content jobs #18, #19, and #20 plus their draft outputs because they were goal/accountability-heavy; extracted task/student/group-goal records remain preserved. Active Content jobs were normalized so jobs #7, #8, and #9 have class-only summaries/topics/sources.
- Local verification passed: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, `node --check scripts/cleanup-content-routing.mjs`, `npm test`, live DB cleanup verification, and mobile Playwright smoke for `/operations?view=content` with 7 active cards and no forbidden goal/task/accountability titles.

2026-06-04 Telegram task button cleanup:
- Telegram task captures no longer send per-task owner/status buttons such as `Mine`, `Codex`, `Urgent`, and `Done`.
- Capture replies now summarize the inferred owner and Tasks section in plain text.
- The parser was tightened so direct bot/programming instructions such as removing Telegram buttons are assigned to Codex and treated as actionable work instead of hidden `raw_input`.
- Old task callback payloads are still accepted for compatibility if an older Telegram message already has buttons.

2026-06-04 public website start-route fix:
- Superseded/current note: as of 2026-06-08, public `/manifest.json` is still
  public-facing with `start_url: "/"`, Operations has its own
  `/operations-manifest.json`, and `/operations.html?source=pwa` redirects to
  `/operations`.
- Public website app/manifest launches now start at `/` instead of the Operations dashboard.
- `public/manifest.json` now has `id: "/"` and `start_url: "/"`; the description is public-website only.
- `public/sw.js` was bumped to `bna-public-v3`, no longer precaches `/operations.html`, and bypasses Operations routes so admin pages are not served from the public app shell cache.
- `public/operations.html` now unregisters service workers instead of registering the public one.
- Historical behavior only: old installed/PWA shortcuts that opened
  `/operations.html?source=pwa` were redirected to `/` before the Operations
  shell loaded.
- `server.js` serves `manifest.json` with `Cache-Control: no-store` alongside HTML and `sw.js`, so phones/browsers refresh the old operations-start manifest faster.
- Railway deployment `c66baa9e-caaa-4372-a2c2-02070be34e74` deployed the final fix. Live checks passed: `/manifest.json` reports `start_url: "/"` and `id: "/"`; `/` returns the public Bnei Neviim Academy homepage, not `Loading BNA Operations`; `/sw.js` is `bna-public-v3` and no longer precaches operations; Playwright confirmed `/operations.html?source=pwa` lands on `https://bneineviimacademy.org/`.
- Task #52 was corrected from the bad parser title to `Make public website links open the homepage, not Operations`, marked done, and verified in the live task API.

2026-06-04 public favicon and WhatsApp preview update:
- Public website pages now use the real BNA logo for browser favicons, Apple touch icon, PWA manifest icons, and WhatsApp/social link previews.
- Generated live assets include `/favicon.ico`, `/icons/favicon-16.png`, `/icons/favicon-32.png`, `/icons/apple-touch-icon.png`, `/icons/icon-192.png`, `/icons/icon-512.png`, and `/images/bna-social-preview.png`.
- Homepage, Blog, FAQ, Blog article shell, signup pages, Operations, and Operations login point to the new icon files.
- Public pages include Open Graph/Twitter image metadata using `https://bneineviimacademy.org/images/bna-social-preview.png` so shared links should show the school logo preview after client cache refresh.
- Task #42 was renamed to `Add BNA logo favicon and WhatsApp link preview`, marked done, and verified in the live task API.
- Railway deployment `47b63515-33cf-4c64-9055-774383377368` deployed the fix. Live checks passed: `/favicon.ico`, `/icons/icon-192.png`, and `/images/bna-social-preview.png` return 200; homepage HTML includes `og:image`, `twitter:image`, favicon, and Apple touch icon tags.
- HTTPS status: `https://bneineviimacademy.org/` is live, and `http://bneineviimacademy.org/` redirects to HTTPS. `www.bneineviimacademy.org` does not resolve yet; if the operator wants the www version, add/configure it as a Railway custom domain and create the required DNS record at the domain host.

2026-06-03 hamburger navigation update:
- Mobile public-site hamburger menus are compact popovers instead of full-width, screen-blocking stacks.
- Homepage and standalone Blog/FAQ page nav now use a simple mobile Blog link while keeping the category dropdown for desktop.
- Mobile menu taps close the popover and preserve normal anchor navigation.
- Task #40 was marked done and verified in the live task API.
- Railway deployment `8e29801d-e33b-4e74-be47-a1e7e866c9d3` deployed the fix. Live 390px Playwright smoke passed: homepage and Blog menus render as 288px by 264px popovers, no mobile category wall appears, no body overflow, and no browser errors.

2026-06-03 Telegram/Codex cleanup update:
- Codex is the active development agent and visible owner for machine work.
- Kimi is fallback only for provider/API failures or legacy references.
- Telegram task confirmations and dashboard task cards should show refined, normal task titles. Raw Telegram wording belongs only in provenance fields such as `ai_parsed.original_text` and daily memory captures.
- Telegram task quick-action buttons were removed on 2026-06-04; old callback payloads are still accepted only as compatibility aliases.
- Content and mixed-recording generation now prefer OpenAI when available and use Kimi only as fallback.

2026-06-03 mobile website layout update:
- The duplicate static homepage `Explore the Philosophy` card stack was removed.
- The homepage now has one filterable `Our Philosophy` section with topic filters on top.
- On mobile, homepage philosophy/blog article cards scroll horizontally instead of stacking into a long column.
- On mobile, the standalone `/blog` index also uses horizontal filters and horizontal article cards.
- On mobile, public Torah trip progress renders as compact student rows with name, percent, and progress bar instead of tall stacked cards.
- Task #38 was cleaned from raw Telegram wording to `Tighten mobile philosophy blog and Torah progress layout`, assigned to Codex, marked done, and verified.
- Railway deployment `a40d8e87-ccb5-410f-96e8-46cba23eb81b` deployed the fix. Live 390px Playwright smoke passed: homepage title `Our Philosophy`, no static philosophy preview, horizontal article scrolling, compact 74px student rows, no body overflow, and no first-party browser errors.

2026-06-01 update:
- Local server restarted on port 8080 and the Academy Telegram bridge restarted against `bneineviimacademy_bot`.
- Historical retired-social diagnostics passed for the former location/account.
  This is not active BNA runtime.
- Historical Facebook draft creation worked locally through the retired provider.
  Current social posting should use Buffer where wired, not retired GHL paths.
- Operations Tasks copy was cleaned up again: do not say "raw capture" in the visible UI, and machine work is shown as `Changelog`, not as Shloimie's personal tasks.
- Playwright mobile smoke passed for Tasks, Content, and Students with no browser errors using a real session cookie.
- Railway audit completed: the saved token works as a project-scoped `RAILWAY_TOKEN`, but the old deploy script incorrectly required `railway whoami` account-login auth. Deploy tooling now loads `.secrets/railway-token.txt`, skips `whoami` in project-token mode, and explicitly targets service `skillful-motivation` in `production`.
- Live deploy succeeded on Railway deployment `74f8c441-9531-4e04-ad40-650e35f86950`. Live smoke passed: `/api/health`, homepage, operations login, and mobile Operations Tasks/Content/Students.
- Added `npm run railway:doctor` to validate/repair Railway token/config/service targeting before deploys.
- 2026-06-01 follow-up: Student accountability events now support structured progress fields: goal target/actual/unit, progress percent, attendance status, next check-in date, engagement level, follow-up flag, and metadata.
- Telegram task captures briefly sent quick action buttons for `Mine`, `Codex`, `Urgent`, and `Done`; this was superseded on 2026-06-04 by parser-owned routing plus plain-text capture summaries.
- Student profiles now show average progress and follow-up counts using structured accountability data.
- Railway deployment `448f71a2-c025-4ce9-84d4-db44c1d6bb3f` deployed the structured accountability and Telegram task quick-action updates. Live smoke passed, including create/read/delete for a structured accountability event.
- Payment reminders now have one shared backend engine. Protected BNA endpoints can preview due reminders, dry-run them, and send live reminders only with the exact confirmation phrase `SEND_REMINDERS`.
- Accounting view now has a `Payment Reminder Control` panel showing reminders due within the configured 5-day window. Local API smoke passed: preview, dry-run, and live-send refusal without confirmation. Mobile Accounting smoke passed with no browser errors.
- Railway deployment `4c46a762-cf77-464b-ab3c-04a4786c48d0` deployed the payment reminder controls. Live smoke passed: `/api/health`, reminder preview, dry-run, live-send guard, and mobile Accounting view.
- Telegram accountability capture now sends `Which student?` inline buttons when it saves a student-related note without a confident student match. The callback updates the saved accountability event through `PATCH /api/bna/accountability/:id`.
- Railway deployment `9cfa39d4-b60b-4d46-b3a4-6e0f50f833d0` deployed the student-match PATCH endpoint. Live smoke passed by creating temporary event #12, patching it to a student, and deleting it.
- Tasks UI cleanup deployed: task cards open details by click, and the visible action buttons no longer include `Open details`, `Details`, `Done, needs test`, `Needs test`, or `Mark tested`.
- Future task extraction now stores a polished title and explanatory note instead of showing raw Telegram ramble language as the dashboard task.
- The bad test student `Fh` and linked signup #5 were removed from active views by setting the student inactive and archiving the signup.
- WhatsApp, Facebook, and weekly report prompts now prefer English, natural teacher language and explicitly avoid corny phrases like `Today at Bnei Neviim Academy` and `our learners explored`.
- Historical retired-provider Facebook action smoke passed locally for older
  content jobs. Current social posting should use Buffer where wired.
- Railway deployment `75d78726-dc90-40ed-b27b-ae649fa956f6` deployed the older
  cleanup. Live smoke passed at the time for health, Students without `Fh`,
  then-active retired-provider diagnostics, mobile Tasks, and mobile Content.
- 2026-06-02 update: Homepage 30-page goal progress is now 3/30 pages with 10 percent progress and updated English/Hebrew note copy. This was filed as clean Changelog task #33, assigned to Kimi and marked done/verified, so agents can see it without relying on the original Telegram ramble.
- 2026-06-02 update: Operations Tasks routing now keeps Active Work to decisions/personal actionable items, sends completed Codex/system work to read-only Changelog, and keeps Done for Shloimie's personal completed tasks only. Changelog cards have no action buttons.
- Railway deployment `cd63e998-98ba-49be-b2db-7f9b4af821c1` deployed the 3/30 progress update and final Tasks/Changelog routing cleanup. Live smoke passed: health, homepage 3/30, Changelog task #33 visible, no Changelog action buttons, and no stale `Review and organize` prefix on that changelog item.
- 2026-06-02 local update: Content now has a Prompt Studio. Each platform output (`WhatsApp`, `Facebook`, `Newsletter`, `LinkedIn`, `YouTube`) shows the active prompt version, updated time, example/file count, editable prompt text, generate/regenerate button, copy button, and approval button.
- 2026-06-02 local update: Content prompt versions are stored in `bna_content_prompts` and `bna_content_prompt_versions`; approved outputs are promoted into `bna_content_prompt_examples` so good drafts become examples automatically.
- 2026-06-02 local update: Weekly newsletter bundles are stored in `bna_content_bundles` and `bna_content_bundle_items`. The operator can select multiple recordings in the Content view, create a bundle, and generate one newsletter draft from the current newsletter prompt.
- 2026-06-02 local smoke passed: `node --check server.js`, `node --check scripts/telegram-kimi-bridge.mjs`, authenticated `/api/bna/content-prompts` returned 5 prompts, `/api/bna/content-bundles` returned 200, and mobile Operations Content rendered prompt cards with no browser errors. Old Content buttons `Break into tasks`, `Custom instruction`, and `Copy transcript start` are gone.
- Railway deployment `43a657de-074c-4fee-b6f5-591f7b608352` deployed the Content Prompt Studio. Live smoke passed: `/api/health`, authenticated `/api/bna/content-prompts` returned 5 prompts, `/api/bna/content-bundles` returned 200, and mobile Operations Content showed Content Library, prompt versions, and Weekly Newsletter Bundle with no browser errors.
- 2026-06-03 update: Content generation is now OpenAI-first when `OPENAI_API_KEY` is configured, with Kimi only as fallback.
- 2026-06-03 update: Railway production was missing the content AI key, so prompt generation failed with "No content AI key is configured." `KIMI_API_KEY`, `KIMI_BASE_URL`, and `KIMI_MODEL` were added to the Railway service.
- 2026-06-03 update: Kimi/Moonshot rejected the old OpenAI-style `temperature: 0.35`; the content generator now sends `temperature: 1` for Kimi and `0.35` for OpenAI.
- 2026-06-03 update: Telegram content buttons now call the same backend `/api/bna/content-jobs/:id/actions` `generate_output` flow used by the dashboard, so Telegram drafts use the active prompt version and examples instead of a separate older prompt path.
- Railway deployment `79e5731d-2534-4fb1-8673-892ca2e9aa9a` deployed the earlier Kimi content generation fix. Current local code now prefers OpenAI and keeps Kimi as fallback.
- 2026-06-03 final smoke: Academy Telegram bridge restarted locally as PID `112992`. Railway doctor passed for deployment `79e5731d-2534-4fb1-8673-892ca2e9aa9a`. Live mobile Operations Content smoke passed with 5 prompts, prompt versions visible, Weekly Newsletter Bundle visible, and no browser errors.
- 2026-06-03 task cleanup update: visible Tasks/Changelog should not show raw Telegram ramble language. Task parser now stores raw wording as `ai_parsed.original_text` and uses concise `display_title`/clean titles for the dashboard.
- 2026-06-03 shared-agent ledger added:
  - `ops/agent-task-ledger.jsonl` is the append-only shared task trail for Telegram/Kimi and Codex.
  - `ops/agent-changelog.md` is the repo-visible completed agent work changelog.
  - `AGENTS.md` now instructs agents to write task updates/completed work there.
- 2026-06-03 live cleanup: raw task #31 was archived as a duplicate of completed homepage progress task #33. Raw Changelog task #30 was rewritten to `Use newest Drive intake images for the homepage Learning Moments carousel`.
- Railway deployment `5aa6997e-104c-4843-9fbf-6ff352e8b378` deployed task-language cleanup and shared ledger support. Live Tasks smoke passed: Active and Changelog views no longer showed the raw `Okay Mr Kenny...` or `No codex...` Telegram wording.
- 2026-06-03 update: Operations Tasks now uses `Decisions`, `My Tasks`, `Changelog`, and `Done`. `Decisions` is only for items still in Shloimie's ballpark where a choice/answer is needed. `My Tasks` is for already-decided personal work.
- 2026-06-03 update: Operations Content now renders as a collapsed Content Library. Each content card can be opened to show summaries, transcript info, platform prompt panels, drafts, copy, regenerate, and approval buttons.
- 2026-06-03 update: Operators can select multiple content cards and generate WhatsApp, Facebook, Newsletter, LinkedIn, or YouTube drafts from the same saved platform prompt. Custom instructions are one-time generation instructions and do not patch the saved prompt unless the prompt editor is explicitly saved.
- Railway deployment `7bb99db0-1351-4e0b-ba21-baade568e1ea` deployed Decisions plus the collapsed/multi-select Content Library. Live smoke passed: health OK, Railway doctor OK, operations HTML has `Decisions` and no `Active Work`, mobile Tasks has `Decisions` and no `Active Work`, mobile Content loaded with no browser errors, and the new bulk generation endpoint created a Kimi draft from two temporary content items using prompt v1, then archived the smoke records.
- 2026-06-03 update: Homepage Learning Moments carousel is image-only on the public page. Titles, descriptions, and timestamps remain in `learningMoments` as internal/accessibility metadata, but no text panel is displayed over or beside the images.
- 2026-06-03 update: Homepage 30-page goal progress is now 3.5/30 pages, 12 percent. Added `npm run learning:progress -- <pages>` so future progress updates can be done repeatably.
- Railway deployment `cecac732-66b3-4273-956d-8d977a936825` deployed the image-only Learning Moments carousel and 3.5/30 progress update. Live smoke passed: health OK, page shows 3.5 and 12 percent, no `.media-copy` caption elements remain, carousel has 3 slides, and mobile browser errors were 0.

## Website

- The public homepage is `public/index.html`.
- A new homepage section called `program-pulse` was added after Daily Morning Torah Learning.
- That section contains:
  - weekly schedule: Monday and Wednesday learning in the forest
  - other learning days meeting at HaChozeh MiLublin 7
  - 30-page goal card: current progress is 3.5/30 pages, 12 percent
  - Learning Moments image/video carousel with public images only
- When the operator says "the image slider", "learning moments", "website slider", or "the slider Codex built", they mean the Learning Moments carousel in `public/index.html`.
- The carousel data lives in the JavaScript array `learningMoments` inside `public/index.html`.
- Learning Moments descriptions and timestamps are internal/accessibility metadata only. Do not add visible text panels or caption overlays back to the public carousel unless the operator explicitly asks.
- Current carousel images live in `public/images/learning-moments/`.
- Current carousel files:
  - `forest-learning-01-web.jpg`
  - `forest-learning-02-web.jpg`
  - `forest-learning-03-web.jpg`
- The original full-size Drive images were downloaded from Google Drive `01 Raw Intake`, optimized for web, then the Drive originals were moved to `10 Approved`.
- Website image intake is live-smoke-covered through the Drive website image
  lane. Approved website assets feed the homepage carousel without routing
  through GHL/social content.

## Telegram And Agent Context

- The Academy Telegram bridge is `scripts/telegram-kimi-bridge.mjs`.
- Codex should use this file plus the newest files in `tasks-pending/` to understand recent work.
- Codex should also read `ops/agent-task-ledger.jsonl` and `ops/agent-changelog.md` before assuming recent Telegram work is unknown.
- If the operator references recent work vaguely, check `SYSTEM-STATE.md`, `TASKS.md`, today's `memory/YYYY-MM-DD.md`, and the newest `tasks-pending/*.md` before asking clarifying questions.
- Do not tell the operator "I do not know what slider you mean" when the reference matches the homepage Learning Moments carousel.
- Natural language like "I dropped a video into Drive Raw Intake, make WhatsApp/Facebook captions" should be handled directly as Drive ingest. Pick the newest file in `BNA V2 / 01 Raw Intake`; do not ask for filename/time unless that configured folder is empty.
- The Telegram bridge now has a Drive auto-watcher. About every 10 seconds, it checks the configured `BNA V2 / 01 Raw Intake` folder. If a file is found, it ingests it automatically, transcribes audio/video or describes images, titles it, creates a Content job with the Drive link, moves the file down the pipeline, and pings Telegram with WhatsApp/Facebook action buttons.
- WhatsApp and Facebook drafts are separate outputs. WhatsApp should be short parent bullet points. Facebook should be a warmer, longer narrative draft saved as `facebook_post` with its own approval button.
- Historical note superseded by no-GHL policy: Facebook draft creation must use
  the currently approved Buffer connector or remain a first-party draft.
- Amitay/Amitai/Amitize should fuzzy-match to student `אמיתי קוסובסקי`. Student questions, goals, and private-meeting notes belong in Student Accountability, not Tasks.
- Amitay's conversion/fairness question was filed as Student Accountability event #8 on 2026-05-31. Accidental task captures #28 and #29 were archived.

## Content Source Of Truth

- Website/database should be the source of truth for BNA content.
- Google Drive is raw intake and storage.
- YouTube should host public videos later; the website should embed YouTube videos instead of hosting large video files directly.
- Retired GHL/GoHighLevel/LeadConnector paths must not be used as publishing
  destinations. Buffer may be used for social where wired; first-party BNA
  records remain canonical.
- Operations Content view now has media filters (`All`, `Video`, `Audio`, `Images`) and uploaded-date filters (`All dates`, `Today`, `Last 7 days`, `Last 30 days`). Content cards sort newest first and show media type, title, upload date, Drive stage, and Drive link.
- Operations Tasks view should not show a separate Smoke Test filter. It uses `Decisions`, `My Tasks`, `Changelog`, and `Done`. Changelog is read-only machine/Codex work; Done is for Shloimie's completed personal tasks.
- 2026-05-31 update: Tasks now also has urgency/date filter chips and the Kimi lane is labeled `Changelog` so machine work does not read like Shloimie's personal task list.
- 2026-05-31 update: Content has a project filter for `BNA` vs the Mishnah/One Time lane. As of 2026-06-05 the visible label is `One Time`, preserving the internal `mishna` key. The latest `Meeting rabbi sheller.m4a` was auto-ingested as Content job #7, titled `All-Day Mishnayas Learning and Micro Schools`, and classified under the Mishnah/One Time lane.
- 2026-06-02 historical update: Dashboard content actions moved into Prompt
  Studio. Current no-GHL behavior keeps outputs as first-party drafts and uses
  approved non-GHL connectors such as Buffer where wired.
- 2026-05-31 update: Students view now supports clickable student profiles. Selecting a student opens their accountability page with KPI counts, an accountability/progress chart, interests/topics, questions, goals, and private meeting/notes sections. Amitay's saved conversion/fairness question appears under his profile.
- 2026-06-01 update: Accounting has safe payment reminder controls. Real email sending requires the operator to explicitly confirm `SEND_REMINDERS`; dry run is the default path for testing.

## 2026-06-03 Mixed Parser And Torah Goal Update

- Mixed recording parse action exists for Content jobs through the Telegram button `Parse Tasks + Students`. It writes operator tasks, Student Accountability events, group-goal entries, and a parse report.
- AI parsing can time out on long mixed recordings. The backend now has a deterministic fallback so Telegram does not fail silently; fallback parses must be reviewed before trusting every extracted item.
- Content job #19 was fallback-parsed. Tasks #34-#37 and Accountability events #13-#16 were created. Kosofsky 50 percent was cleaned into group-goal entry #5 and a Torah entry for student #643.
- Student seed spelling is corrected: use the active canonical student
  `Eitan Chaim Golombo`; the duplicate `Golambo` student row should stay
  inactive. Father/accounting spelling remains `Shalom Galambo`.
- Green Invoice has one live webhook route: `POST /api/webhooks/green-invoice`. Disabled legacy/debug routes are not the production webhook.
- Railway redeploys must include `src/`; `scripts/railway-redeploy.ps1` was fixed to copy it into `.deploy-railway`.
- `BNA V2 / 00 Website Moments Intake` was created in Drive. Folder ID:
  `1aiCzZ-lKEKSWTYfOMvXoO4YE56cVaK23`. The website image lane is implemented
  and covered by live app smoke.

## 2026-06-14 Goal-Mode Privacy Hardening

- Current branch for the latest goal-mode pass:
  `cleanup/onboarding-helper-crm-workspace-rabbi`.
- The dirty local tree from the prior Rabbi task UI/helper cleanup was
  preserved in a named stash before switching branches, then reapplied.
- Local privacy fix is implemented but not deployed:
  `/parent/login?onboard=accountability` stays public/onboarding-only even when
  a parent session exists; `/student/login` no longer auto-opens from saved
  `bnaStudentAccessCode`; non-student pages clear stale student codes; student
  audience portal payloads omit parent contact fields.
- Local verification passed:
  `node --check server.js`,
  `node --check public/js/bna-bot-widget.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`,
  focused privacy tests, `npm test` 341/341, and browser smoke
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-fix/report.md`.
- Deployment gate remains open: deploy bundle, run Railway doctor, run live app
  smoke, and live-smoke public/parent/student privacy routes before marking
  the item done.

## 2026-06-14 Google Drive Preview Actions

- Railway deployment `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` deployed the
  Google Drive preview-only action buttons in Operations Settings > Google
  Workspace.
- Registered actions:
  - `google_drive_find_file_preview`
  - `google_drive_create_doc_preview`
  - `google_drive_create_folder_preview`
  - `google_drive_move_file_preview`
- These actions are dry-run previews only. They do not read Drive metadata or
  write Drive files, folders, or Docs.
- Post-deploy checks passed:
  - `npm run railway:doctor`
  - `npm run app:smoke`:
    `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`
  - live browser smoke:
    `ops/playwright-smokes/2026-06-14-google-drive-preview-live/report.md`
- Live Drive adapters remain blocked until Drive scope policy, OAuth/test-user
  connection, and explicit external-write confirmation are approved.

## 2026-06-14 Provider Google Business Link Capture Action

- Railway deployment `03c2c30c-7639-494c-8e05-20863386c054` deployed
  `capture_provider_google_business_link`.
- The action is approval-gated and manual-only: it can store provider Google
  Business/Profile URLs and Place IDs for review, but it does not call the live
  Google Business Profile API or perform external Google writes.
- Telegram and the web assistant can route natural-language provider Google
  Business/Profile/Maps/Place ID capture requests into the typed action.
- Verification passed: syntax checks for `server.js`,
  `src/lib/bna/telegram-action-router.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/actions/registry.js`; focused action/assistant/Google tests 44/44;
  `npm test` 350/350; Railway doctor; live app smoke
  `ops/live-smokes/2026-06-14T15-16-29-530Z-live-app-smoke.md`; and live
  action catalog/API dry-run smoke
  `ops/live-smokes/2026-06-14T15-19-19-000Z-provider-google-business-action-smoke.md`.
- Live GBP API/feed sync remains blocked until provider opt-in,
  `business.manage`, OAuth/test-user setup, and explicit approval are in place.

## 2026-06-14 WAPI Phonebook Grouping Report Deployed

- Railway deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` deployed the
  read-only WAPI phonebook grouping report.
- Surfaces:
  - CLI: `npm run wapi:phonebook-report`
  - API: `/api/bna/wapi/phonebook-report`
  - UI: Operations Communications > WhatsApp > Phonebook grouping
- The report groups local Whapi contacts/chats/communications with first-party
  leads, signups, students, provider profiles, service providers, and contacts.
  It returns recommended types, confidence labels, review flags, aggregate
  manual correction candidates, and no-send guardrails.
- Nati Freeze/Fries defaults to `friend_non_lead` unless actual message content
  shows school interest.
- The report is dry-run/read-only: `dry_run: true`, `no_send: true`, and
  `external_write_performed: false`. It does not write contact tags/stages or
  send WhatsApp messages.
- Verification passed: syntax checks, Operations inline parse, focused WAPI/CRM
  tests 17/17, `npm test` 353/353, local smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-local/report.md`, Railway
  doctor, live app smoke
  `ops/live-smokes/2026-06-14T15-40-45-848Z-live-app-smoke.md`, and live
  WAPI phonebook smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.
- Manual correction apply UI and parent announcement approval/readback are
  deployed separately below. Remaining WAPI/CRM work: the phonebook-first
  conversation workspace.

## 2026-06-14 Telegram Note-To-CRM Matcher Deployed

- Railway deployment `73a812e2-572e-4231-a971-20aef4f52450` deployed the
  Telegram note-to-CRM matcher.
- Surfaces:
  - shared parser/scorer: `src/lib/bna/telegram-note-to-crm.js`
  - API: `POST /api/bna/contact-communications/match-note`
  - Telegram commands: `/crm_note`, `/whatsapp_note`, `/wa_note`
  - natural language: "that WhatsApp with X was about Y"
- The matcher reads recent local WhatsApp/WAPI rows from
  `bna_contact_communications`, scores name/phone/text matches, and creates a
  local Telegram/internal CRM note only when the match is confident or the
  communication id is explicit.
- Dry-run and no-match calls return `dry_run: true`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`.
  The flow never sends WhatsApp messages.
- Verification passed: syntax checks, focused Telegram/WAPI tests 15/15,
  final `npm test` 357/357, local smoke
  `ops/live-smokes/2026-06-14T15-54-29-499Z-telegram-note-to-crm-local-smoke.md`,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T15-56-27-842Z-live-app-smoke.md`, and live
  endpoint dry-run smoke
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.

## 2026-06-14 WAPI Phonebook Correction Apply UI Deployed

- Railway deployment `4c152697-dbd0-4dd7-8834-83b483999459` deployed the
  follow-up WAPI phonebook manual correction apply UI.
- Surfaces:
  - local correction table: `bna_wapi_phonebook_corrections`
  - API: `POST /api/bna/wapi/phonebook-corrections`
  - UI: Operations Communications > WhatsApp > Phonebook grouping correction
    buttons
- The report overlays the latest local correction per `phonebook_key`, exposes
  `applied_type`, `manual_correction_applied`, and correction notes, and keeps
  already-corrected groups out of the manual correction candidate queue.
- Operations now requests a dry-run CRM write preview first, shows the planned
  local contact/lead tag writes, and only sends the final apply request after
  the operator confirms.
- Non-dry-run correction writes require `confirm: "APPLY_WAPI_CORRECTION"`.
  Confirmed applies can update first-party `bna_contacts` tags/status and
  linked `bna_parent_leads` tags/status/lead type. Student, signup, and
  provider records are skipped by design.
- Dry-runs return `dry_run: true`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`.
  The correction route does not send WhatsApp messages, create broadcasts, or
  perform external CRM writes.
- Verification passed: syntax checks, focused WAPI tests 5/5, adjacent
  WAPI/communications/action tests 33/33, full `npm test` 359/359, Railway
  doctor, live app smoke
  `ops/live-smokes/2026-06-14T16-22-20-061Z-live-app-smoke.md`, live endpoint
  dry-run/confirmation-gate smoke
  `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`,
  and live browser smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`.

## 2026-06-14 Parent Announcement Persistence Deployed

- Railway deployment `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e` deployed parent
  announcement approved-draft persistence/readback.
- Surfaces:
  - API: `GET /api/bna/parent-announcements`
  - API: `POST /api/bna/parent-announcements`
  - UI: Operations Communications > Announcements
- The implementation reuses `bna_weekly_updates` as the durable source of
  truth, selecting one parent-visible update through
  `selected_for_parent_portal`.
- Non-dry-run approval requires `confirm: "APPROVE_PARENT_ANNOUNCEMENT"`.
  Dry-runs return `dry_run: true`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`.
- The route and UI do not send email, WhatsApp, or social posts.
- Verification passed: syntax checks, Operations inline parse, focused
  community/Operations/portal tests 38/38, full `npm test` 360/360, local
  dry-run/API+UI smokes
  `ops/live-smokes/2026-06-14T16-26-08-240Z-parent-announcement-local-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-local/report.md`,
  Railway doctor, live app smoke
  `ops/live-smokes/2026-06-14T16-27-29-418Z-live-app-smoke.md`, live dry-run
  smoke
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`,
  and live UI smoke
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.

## 2026-06-14 WAPI Phonebook Workspace Deployed

- Railway deployment `6c9f06bc-6c1b-47b9-980a-4e8baca73eae` deployed the
  Operations Communications > WhatsApp phonebook-first workspace.
- The workspace uses the WAPI phonebook grouping report as its contact list and
  renders three panes: phonebook/contact list, selected conversation timeline,
  and details/notes/related records.
- Timeline readback combines matched WhatsApp/WAPI communications, Telegram/CRM
  notes, related tasks, and support tickets when the selected group can be
  linked by phone/chat id, source rows, or first-party record ids.
- The Add Internal Note action writes only a local first-party
  `bna_contact_communications` note with `wapi_phonebook_workspace`,
  `no_send`, and `external_write_performed: false` metadata. It does not send a
  WhatsApp message or create external CRM writes.
- Manual WAPI correction buttons still use the existing preview/confirm guard;
  non-dry-run correction writes require `APPLY_WAPI_CORRECTION`.
- Verification passed: syntax checks, Operations inline script parse, focused
  WAPI/communications/CRM tests 19/19, full `npm test` 376/376, local browser
  smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T18-51-33-221Z-live-app-smoke.md`, and live
  browser smoke
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-workspace-live/report.md`.

## 2026-06-14 Provider Setup Email / Short Join Deployed

- Railway deployment `f8e8a7bb-52f5-4427-bc50-2f6e70e8d40e` deployed
  provider setup email and the shorter provider join flow.
- Public provider signup and `/api/provider-onboarding` create active free
  listings and then send a provider portal setup email after commit.
- Provider password setup uses `bna_provider_password_setup_tokens` and
  `/provider?setup=...`; successful setup writes
  `bna_service_providers.password_hash`, sets `password_set_at`, issues a
  provider session, and opens the provider portal.
- Operations provider workspace cards include `Send Setup Email`, backed by
  `POST /api/bna/service-providers/:id/setup-email`.
- `/providers/join` asks 10 conversational questions and leaves profile polish
  for the provider portal.
- The provider join flow does not create checkout, payment, payout, WhatsApp,
  social, or external CRM automation. Provider edits and extra submitted
  services remain review-gated.
- Verification passed: `node --check server.js`, focused provider tests 12/12,
  nearby parent/provider/One Time tests 39/39, local browser smoke
  `ops/playwright-smokes/2026-06-14-provider-setup-email-local/report.md`,
  full `npm test` 376/376, Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T18-57-24-784Z-live-app-smoke.md`, and live
  provider readback
  `ops/live-smokes/2026-06-14T18-58-10-provider-setup-email-live-readback.md`.
- The broader One Time content library build remains queued as Operations task
  #610 with handoff
  `tasks-pending/2026-06-14-one-time-content-library-build.md`.

## 2026-06-15 One Time App Access Readiness Deployed

- Railway deployment `55102a5c-f6a6-4866-aacf-d0086ba6b909` deployed the One
  Time app/admin/member-library access readiness surface.
- Operations Settings > Drive / Social Intake in the
  `rabbi_sheller_provider` workspace now renders `One Time App Readiness` with
  live app writes, admin reset/access, and member-library publish all blocked.
- `GET /api/bna/one-time/app-access-readiness` returns read-only blockers and
  no-write flags.
- The One Time Drive/social ingestion fallback, generated JSON map, and
  Markdown map now carry the same app-access readiness blockers.
- The readiness check performs no admin password reset, member access grant,
  member-library publish, Drive/video-host write, Resend/email, WhatsApp/SMS,
  checkout/billing write, or external CRM write.
- Verification passed: syntax checks, Operations inline script parse, focused
  One Time tests 37/37, full `npm test` 388/388, local browser/API smoke
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T23-05-50-938Z-live-app-smoke.md`, live API
  readback, and live Playwright smoke
  `ops/playwright-smokes/2026-06-15-one-time-app-access-readiness-live/report.md`.
- Actual One Time app/admin/member-library writes remain blocked until the
  owner-approved URL/access path, Rabbi/member test login, DB/source,
  media-host path, Resend/domain/copy, billing/access policy,
  rollback/revoke path, and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` are
  explicit.

## 2026-06-15 Rabbi / One Time Task-Flow Audit Local Tool

- Added local CLI `npm run task:rabbi-flow-audit`.
- Generated read-only report:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`.
- Live readback scanned 305 tasks and found 102 Rabbi/One Time related records:
  51 active, 48 human blockers/decisions, 0 Codex-ready, 6 private BNA scope
  review flags, 32 external-write gate review flags, and 2 visible title
  review flags.
- The tool has no apply mode and performs no task patches, workspace moves,
  sends, publishes, access grants, or external writes. No deployment was
  required.
- Verification passed: syntax checks, focused task/Telegram tests 41/41, live
  read-only audit run, and full `npm test` 392/392.

## 2026-06-15 One Time Question Moderation Queue Deployed

- Railway deployment `afff8d91-e0aa-426b-94f8-f128b8f57822` deployed the
  private One Time question moderation queue.
- Added first-party table `bna_one_time_question_reviews`.
- `submit_student_question_for_moderation` now creates a scoped private review
  row alongside the private task; `review_moderated_question` updates the
  review row alongside the private task/comment.
- Added read-only route:
  `GET /api/bna/one-time/question-moderation`.
- Operations Content > One Time Library now renders `Private Question
  Moderation Queue` with no-send, no-public-forum, no-member-visible, and
  no-external-write guardrail copy.
- The queue performs no forum post creation, member-visible answer publishing,
  email/WhatsApp/SMS/portal send, Codex job creation, checkout/access grant,
  Drive/video-host write, or external CRM write.
- Verification passed: syntax checks, Operations inline script parse, focused
  action/One Time tests 68/68, full `npm test` 393/393 before deploy, local API
  and Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-local/report.json`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T23-42-19-692Z-live-app-smoke.md`, live API smoke
  `ops/live-smokes/2026-06-14T23-42-54-513Z-one-time-question-moderation-live-smoke.md`,
  and live Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-one-time-question-moderation-live/report.json`.

## 2026-06-15 Operations Automation Library Deployed

- Railway deployment `5d21c82c-d77e-4d5d-a8c2-c1b1129c17a8` deployed the
  read-only Operations Automation Library / Prompt Browser.
- Operations Settings > Automations now shows 8 guarded workflow cards:
  service-provider onboarding review, parent accountability lead follow-up,
  ticket processed acknowledgement, parent weekly update approval, One Time
  question review alert, One Time 8-week nurture plan, Google live-adapter test
  gate, and Rabbi content added review.
- Each card shows trigger, audience, channel, prompt/template, status,
  last/next evidence, linked records, dry-run preview, and disabled
  approval-required enable controls.
- The Prompt Browser table surfaces content prompts, assignment prompts,
  helper policies, and no-send/no-external-write guardrails for review.
- The library performs no external send, publish, billing/access change,
  member-visibility change, Google write, Drive/video-host write, checkout/
  access grant, or external CRM write.
- Verification passed: Operations inline script parse, focused adjacent tests
  45/45, full `npm test` 396/396, local Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-automation-library-local/report.json`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-14T23-58-42-116Z-live-app-smoke.md`, and live
  Browser/UI smoke
  `ops/playwright-smokes/2026-06-15-automation-library-live/report.json`.

## 2026-06-15 Social Schedule Preview Action Deployed

- Railway deployment `cc96c44c-303f-4dab-ada0-e6dd62738d3b` deployed the
  Phase 14 Buffer/social schedule preview helper.
- Added typed action `preview_social_schedule_package` with action-registry
  metadata, UI button map entries, and Telegram natural-language routing for
  requests such as scheduling a Facebook post, making multiple posts from a
  video, or previewing one post per day this week.
- The action returns Buffer/provider readiness, target channels, schedule
  slots, blockers, and the `APPROVE_BUFFER_SOCIAL_DRAFT` phrase.
- The action is preview/no-write only. It performs no Buffer draft write, no
  Buffer media upload, no publish, no send, no local content write, and no
  external write.
- Verification passed: syntax checks, Operations inline script parse, focused
  action/Telegram tests 31/31, adjacent social/content/automation tests 53/53,
  full `npm test` 409/409, local action-runner smoke
  `ops/local-smokes/2026-06-15-social-schedule-preview-local.md`, Railway
  doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T01-02-48-717Z-live-app-smoke.md`, and live API
  smoke
  `ops/live-smokes/2026-06-15T01-03-38-576Z-social-schedule-preview-live-smoke.md`.

## 2026-06-15 One Time Thumbnail Preview UI Deployed

- Railway deployment `85107895-5677-4580-b3f6-7d91c1e70025` deployed the
  Phase 13 One Time thumbnail preview UI.
- Operations Content > One Time Library cards now render `Thumbnail Preview`
  using `thumbnail_brief` output metadata, parsed metadata, or job
  thumbnail/image URL fields when an HTTP(S) thumbnail URL exists.
- The panel shows the thumbnail image, status/brief text, an `Open Thumbnail`
  link, and a clear `Thumbnail reference missing` fallback.
- The preview is display-only. It performs no thumbnail generation, media
  upload, member-library publish, email/WhatsApp/social send, checkout/access
  change, Drive/video-host write, Buffer action, or external CRM write.
- Verification passed: syntax checks, Operations inline script parse, focused
  action/One Time tests 37/37, full `npm test` 409/409 before deploy, local
  renderer-based browser smoke
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-local/report.md`,
  Railway doctor SUCCESS, live app smoke
  `ops/live-smokes/2026-06-15T01-24-36-196Z-live-app-smoke.md`, and live
  renderer-based Playwright smoke
  `ops/playwright-smokes/2026-06-15-one-time-thumbnail-preview-live/report.md`.

## 2026-06-15 Student Hebrew/RTL Audit Deployed

- Railway deployment `8a2d1967-7573-499d-955f-a21f90a990c0` reached SUCCESS
  for the student-facing Hebrew/RTL audit slice.
- Student portal question answers now use the localized `answer` label instead
  of hardcoded `Answer:`.
- The Rabbi WhatsApp meeting CTA now uses the localized `whatsappRabbi` label
  instead of hardcoded English copy.
- Added reusable fixture-backed Playwright audit:
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/run-smoke.mjs`.
- Live evidence:
  `ops/live-smokes/2026-06-15T02-41-35-249Z-live-app-smoke.md` and
  `ops/playwright-smokes/2026-06-15-student-hebrew-rtl-audit-live/report.md`.
- The audit verifies mobile/desktop Hebrew RTL, mobile agenda-first calendar,
  calendar drawer, assignments, questions, documents, bot/help sections,
  Hebrew Sefaria refs, no mojibake, no horizontal overflow, no runtime/console
  errors, and no private sentinel leakage.
- Guardrail: the audit uses synthetic student fixture data and performs no real
  checkoff, note save, parent/Rabbi message, assistant send, email, WhatsApp,
  Google API call, connector write, or external CRM write.

## 2026-06-15 Contacts WAPI History Deployed

- Railway deployment `7a866693-367d-4c1d-81d2-f6e8c60f4288` deployed the
  Contacts parent/lead WAPI history readback.
- Operations Contacts parent cards and Interested Parent cards now use local
  `contactCommunications` rows matched by direct record ID, linked student ID,
  normalized phone variants, email addresses, and WAPI source context.
- The expanded Communication tabs show recent WhatsApp/email/internal history
  in place and include read-only guardrail copy.
- The card does not sync Whapi, send WhatsApp, create broadcasts, update CRM
  tags, write external CRM records, send email, or touch Google/Drive/Buffer.
- Verification passed: `node --check server.js`, Operations inline script
  parse, smoke runner syntax check, focused WAPI/CRM tests 12/12, local
  Playwright smoke
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-local/report.md`,
  full `npm test` 417/417, `git diff --check`, Railway doctor SUCCESS, live
  app smoke `ops/live-smokes/2026-06-15T03-54-38-056Z-live-app-smoke.md`, and
  focused live Playwright smoke
  `ops/playwright-smokes/2026-06-15-contact-wapi-history-live/report.md`.

## 2026-06-15 Decision Lifecycle / Reprocess Model

- Operations decisions now keep broad task lane state in `bna_tasks.stage`
  while decision-specific state lives in `decision_status`,
  `decision_route`, `decision_outcome`, and decision activity timestamps.
- Meaningful human/operator comments on unresolved decisions set the decision
  to `needs_research` or `reprocess_requested`, update
  `decision_last_activity_at`, and create/dedupe one active
  `bna_decision_reprocess_queue` row per decision.
- System/agent comments do not trigger decision reprocessing, preventing
  agent-fleet completion/failure comments from causing loops.
- `Send to Codex` creates or reuses a linked executable child task assigned to
  Codex with `decision_required = false`; the parent decision remains a
  decision record and is not directly claimed by the agent fleet.
- Decision actions use `/api/bna/tasks/:id/decision-action` for refresh,
  add-task, send-to-Codex, my-task, done, hide, wait-external, block, and
  reopen transitions.

## 2026-06-15 WS03 Pending/access Dedupe Local State

- WS03 code is implemented locally for Pending/access dedupe, requested/received
  actions, duplicate archive linkage, Done/history proof links, and allowlisted
  task artifact access.
- Runtime schema support is additive in `server.js`; deploy-time migration file:
  `railway-migration-2026-06-15-pending-access-dedupe-done-links.sql`.
- Active UI surface remains `public/operations.html`; the archived React
  TaskApp was not edited.
- Required live cleanup is blocked because
  `node scripts/pending-access-dedupe-done-links-audit.mjs` could not resolve
  `db.amipeuneopdbzuhlnimt.supabase.co`.
- Until database/network access is restored, canonical duplicate IDs, archived
  duplicate IDs, and Done/history proof backfill counts remain unknown.
- Do not mark WS03 complete until the migration is applied, duplicate/proof
  audit dry-run and apply pass, Railway deploy succeeds, Railway doctor passes,
  and live app smoke verifies the Operations queue.

## 2026-06-15 WS05 BNA Helper Tool Actions Local State

- WS05 is implemented locally as a server-side, auditable Operations Helper
  action layer. The live Operations runtime remains Express `server.js` plus
  static `public/operations.html`.
- New helper tables are additive: `bna_helper_plans` stores server-side plans
  and `bna_helper_tool_audit_log` records redacted planned/executed/fallback
  tool attempts.
- Helper code lives under `src/lib/bna/helper/`:
  redaction/hash utilities, result link builders, scoped permissions, audit
  persistence, deterministic/AI planner, and the tool registry.
- Protected routes now exist under `/api/bna/helper/*`: `GET /tools`,
  `POST /plan`, `POST /execute`, and all-scope `GET /audit`.
- Implemented real/local tools include task, comment, done, blocker, decision,
  Codex queue/work-item, report, student, content item, social draft, email
  draft, and Gmail send when configured. Buffer scheduling and missing
  contact/parent/course/worksheet/provider/setup/automation tools return
  explicit setup-blocker/fallback behavior instead of claiming success.
- Operations now has a global `BNA Helper` drawer with plan cards,
  confirmation buttons, result links, and mobile-safe placement above the
  public helper launcher.
- Guardrails: scoped One Time users are limited to task/decision/Codex/report
  tools for `one_time_mishnah_class`; private student/email/content/social
  tools require all/admin scope. Raw tool args are stored server-side and UI
  renders labels/status/result links only.
- Local verification passed: syntax checks, full `npm test` 611/611, headless
  Playwright drawer smoke, in-app Browser drawer smoke, and live app smoke
  `ops/live-smokes/2026-06-15T14-57-17-617Z-live-app-smoke.md`.
- `npm run openai:smoke` ran in temporary Kimi-primary mode and all AI data
  assertions passed, but the script exited FAIL because live
  `/api/bna/support-tickets` returned
  `could not determine data type of parameter $43`; report:
  `ops/openai-smokes/2026-06-15T14-48-04-575Z-openai-sidekick-smoke.md`.
- Not deployed from this turn. Deployment is blocked until Shloimie approves a
  safe deploy window or the multi-workstream dirty tree is isolated, because
  deploying now would ship unrelated local changes alongside WS05.

## 2026-06-15 WS09 People Identity Dedupe Local State

- WS09 is implemented locally for BNA student/person identity dedupe. The active
  runtime remains Express `server.js` plus static `public/operations.html`.
- Student identity now has additive canonical fields, aliases, normalized name
  keys, source records, merge history, review status, archived-duplicate links,
  review tasks, alias rows, and merge event audit rows.
- Signup ingestion, Operations student create/update, Torah seed students, and
  accountability intake now route through conservative identity resolution.
  High-confidence contact-backed matches reuse an existing student; ambiguous
  name-only Hebrew/English matches create an Operations review task instead of
  auto-merging.
- The known Menachem/Menahem/Mendel Hebrew-English alias group is encoded in the
  identity helper so `Menachem Mendel Dratler`, `Menachem Mendel`, Hebrew
  Menachem/Mendel spellings, and related short forms can be scored consistently.
- Safe merge is admin-only and preserves signups, aliases, source records, Torah
  learning entries/goals, accountability records, parent/device/access links,
  assignment/member/provider links, assistant threads, Google connections, and
  Green Invoice webhook matches where those tables/columns exist. Duplicate
  source students are archived/inactivated, never deleted.
- Operations Students now includes an Identity Review panel with scan/refresh,
  masked contact evidence, confidence/evidence labels, open profile actions, and
  explicit merge/reject/block actions. Public signup responses expose only a
  boolean `identityReviewRequired`; parent/student/public portals must not expose
  identity review internals, source records, aliases, or merge history.
- The legacy serverless `public/api/submit.js` path is disabled with HTTP 410 so
  it cannot create students through the old duplicate-prone path.
- Local verification passed: `node --check server.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/smoke-people-identity-dedupe.mjs`,
  `node --test tests/people-identity-dedupe.test.js`,
  `node scripts/smoke-people-identity-dedupe.mjs`, and full `npm test` 611/611.
- Live Menachem inspection/merge was not completed because the configured
  `DATABASE_URL` host did not resolve from this environment. Deploy, live schema
  migration/readback, live identity scan, and final Menachem review/merge remain
  blocked on reachable production database/deployment access.

## 2026-06-15 WS11 Gamification, Community, and Parent Progress Local State

- WS11 is implemented locally for the One Time Mishnah community/course library,
  gamification events, badges, student questions, worksheet submissions,
  approved shoutouts, explicit parent-student links, and parent progress
  reports. The live runtime remains Express `server.js` plus static
  `public/student.html`, `public/parent.html`, and `public/operations.html`.
- Additive WS11 schema/bootstrap now creates courses, lessons, worksheets,
  worksheet questions/submissions/answers, badges, gamification events, student
  badges, student references, parent-student links, and parent progress reports.
- `src/lib/bna/gamification.js` owns event normalization, default points,
  idempotency keys, event summaries, and course-enrollment summaries.
  `src/lib/bna/parent-progress.js` owns approved parent-visible filtering,
  parent access checks, and compact parent progress summaries.
- Student portal payloads now include WS11 progress, and the student UI renders
  Mishnah community progress, courses, points, badges, shoutouts, worksheet
  activity, and a Mishnah question form.
- Parent portal payloads and
  `/api/parent-portal/students/:studentId/ws11-progress` expose only explicitly
  linked, approved, parent-visible data. Unlinked students receive a generic
  not-found response.
- Operations student detail now has WS11 controls for backfilling events,
  generating reports, adding approved shoutouts, and linking parents.
- Local verification passed: `node --check server.js`,
  `node --check src/lib/bna/gamification.js`,
  `node --check src/lib/bna/parent-progress.js`,
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/agent-fleet-supervisor.mjs`, focused WS11 tests 12/12,
  full `npm test` 611/611, and diff hygiene with line-ending warnings only.
- Local smoke `npm run smoke:local -- --skip-tests` did not start because
  `.env.local` is missing `DATABASE_URL`.
- WS11 was not deployed from this turn because the current shared worktree has
  many unrelated local workstreams. Deploy, live schema readback, Railway
  doctor, live app smoke, and live parent/student privacy smoke remain open.

## 2026-06-15 — One Time Two-Login + White-Label + Scoped Parsing (Kimi Handoff Implementation)

**Status:** Local implementation complete. Deploy blocked by dirty worktree (same as WS08/WS11).

**What changed:**
- Added 5 new database tables:
  - `bna_workspace_integrations` — per-workspace WhatsApp/telegram/email/sms/push ownership and sync status
  - `bna_project_branding` — workspace name override, primary/accent colors, logo, favicon, font, custom CSS
  - `bna_contact_identity_audit` — name resolution audit trail with confidence scoring
  - `bna_workspace_notes` — scoped meeting/call/chat/email notes with participants and summary
  - `bna_workspace_note_items` — typed items (task, decision, goal, update, class_note, question, action_item) per note
- Two-login architecture in `server.js`:
  - `ONE_TIME_OWNER_USERNAME`/`ONE_TIME_OWNER_PASSWORD` → Rabbi Elie Scheller (`role: 'project_owner'`)
  - `ONE_TIME_MANAGER_USERNAME`/`ONE_TIME_MANAGER_PASSWORD` → Shloimie (`role: 'project_manager'`)
  - Backward compatibility: old `ONE_TIME_OPS_USERNAME`/`ONE_TIME_OPS_PASSWORD` maps to `project_manager`
  - Owner gets `settings` view; manager is blocked from admin-only paths (`workspace-settings`, `connector-settings`, etc.)
- Contact identity helpers:
  - `actualContactNameFromSources()` with strict precedence: explicit signup > verified local > GHL real name > WhatsApp real > payment real > phone/email fallback
  - `looksLikePlaceholderName()` rejects "school interest", "new lead", "website visitor", etc.
  - NEVER uses tags/source/stage/pipeline as display name
- Parser scoping helpers:
  - `inferProjectKeyFromTranscript()` — defaults to `one_time_mishnah_class` when Rabbi/Sheller/One Time/Mishnah mentioned
  - `inferParticipantsFromTranscript()` — extracts `['Shloimie','Rabbi Elie Scheller']`
  - Updated `generateMixedRecordingParse()` system prompt with workspace scoping rules and correct assignee defaults
- White-label branding:
  - New API: `GET /api/bna/workspace-settings/:workspaceKey/branding`
  - `operations.html` fetches branding, applies workspace name override to sidebar title, desktop topbar, mobile header
  - Logo URL override with fallback to `/icons/icon-192.png`
  - Role label shown in topbar chip for scoped logins
  - `currentWorkspaceRoleLabel()` now returns "Workspace Owner" / "Workspace Manager" for One Time
- `.env.example` updated with all new env vars and backward-compatibility documentation

**Verification:**
- `node --check server.js` PASS
- Manual syntax review of `public/operations.html` changes PASS

**Blockers:**
- Dirty worktree has unrelated WS08/WS11 drift. Broad `npm test` blocked.
- No Railway deploy run; schema readback and live smoke pending clean deploy window.

**Next steps:**
- Shloimie to set new env vars on Railway (`ONE_TIME_OWNER_USERNAME`, `ONE_TIME_OWNER_PASSWORD`, `ONE_TIME_MANAGER_USERNAME`, `ONE_TIME_MANAGER_PASSWORD`)
- Rabbi to confirm WhatsApp phone number for `bna_workspace_integrations` seeding
- Decide exact One Time brand colors/logo to replace placeholders
- Codex to deploy when clean window available

## 2026-06-16 Downloads Prompt Audit and WS01 Local Closeout

- The Downloads Markdown prompt packet has a canonical status map at
  `ops/download-prompt-audit/2026-06-15-downloads-prompt-status.md`.
- File-level coverage for all 81 unique top-level Markdown groups is recorded
  at `ops/download-prompt-audit/2026-06-16-downloads-file-coverage-index.md`.
- Requirement-level evidence is tracked at
  `ops/download-prompt-audit/2026-06-16-requirement-evidence-ledger.md`,
  including explicit coverage for the ramble protocol/router prompts, Rabbi task
  UI superprompt, Rabbi decision brief, One Time repo inventory, and BNA
  bilingual registration/student-contract prompts.
- WS01 Operations layout/mobile/readability is now locally complete:
  `public/css/bna-app-shell.css` adds page overflow guards, contained
  Operations shell surfaces, light modal/form/detail surfaces, wrapping 40px
  action controls, and one-column mobile task rows.
- Local verification passed: `node --check server.js`, Operations inline script
  parse, focused WS01/brand/shell tests, full `npm test` 615/615, and in-app
  Browser smoke against a temporary local HTTP server at
  `http://127.0.0.1:43787/operations.html`.
- The temporary local HTTP server was stopped after the smoke.
- Production deploy/live smoke remains pending because the shared worktree has
  many unrelated local workstreams; deploying now would ship the accumulated
  dirty worktree unless a safe release window or isolated deploy path is
  approved.

## 2026-06-16 Actual WS01-WS11 Attachment Pass

- Shloimie clarified that the actual prompt list is the WS01-WS11 attachment at
  `C:\Users\User\.codex\attachments\7e3bb822-96a8-43ff-b206-aa750f56a73a\pasted-text.txt`.
- Added the exact map at
  `ops/download-prompt-audit/2026-06-16-actual-ws-prompt-list-map.md`.
- Patched the local UI/helper consistency gap found during that pass:
  - `public/js/bna-bot-widget.js` now scopes private provider workspace routes
    explicitly, so `/providers` and `/provider-signup` stay public.
  - Public signup, signup thank-you, registration document, blog, FAQ, article,
    One Time preview, and public provider pages load the public helper knowledge
    bundle with the BNA Helper widget.
  - Public provider index/join/profile pages use the shared BNA site nav and
    current BNA palette instead of the older provider mini-toolbar.
- Verification passed: focused assistant/provider/signup/communications/
  app-select tests 47/47, full `npm test` 617/617, and in-app Browser smoke
  through local static server `http://127.0.0.1:43891` across provider
  directory, provider join, provider profile, signup thank-you, registration
  document, blog, and One Time preview. The local smoke server was stopped.

## 2026-06-17 Communications Screening / Imports Closeout

- `REQ-20260616-053` through `REQ-20260616-060` are implemented and deployed in
  Railway production `3991f132-9207-4386-a9fd-b6148db5944f`.
- Operations Communications now has readable cards, Top News, Screening
  Pipeline, Contact Imports preview, email lane subject/status card support,
  WAPI live-pull diagnostics, and local Phonebook Workspace/no-send copy.
- Manual communications and WAPI webhooks share first-party screening metadata.
  Important inbound parent/accountability messages create local in-app/follow-up
  artifacts only. Parent coaching parsing is non-clinical and creates no
  diagnosis labels.
- Contact import preview is dry-run only for this batch: CSV/vCard/email export
  rows are mapped, classified, deduped, and commit-blocked until a future
  explicit approval path exists.
- Proof: `ops/system-audits/2026-06-17-communications-screening-imports-audit.md`,
  `ops/playwright-smokes/2026-06-17-communications-screening-local/report.md`,
  `ops/live-smokes/2026-06-17T10-46-34-893Z-communications-screening-live-smoke.md`,
  `ops/live-smokes/2026-06-17T10-45-20-615Z-live-app-smoke.md`, and
  `ops/live-smokes/2026-06-17T10-46-28-607Z-public-route-privacy-smoke.md`.

## 2026-06-18 Mobile Operations Workspace Audit Local Closeout

- Source packet:
  `C:\Users\User\Downloads\CODEX_SUPER_PROMPT_BNA_2026-06-18.md`.
- Raw intake: `RAW-20260618-001`, preserved at
  `raw-input/RAW-20260618-001-codex-super-prompt-mobile-workspace-audit.md`.
- Requirement register:
  `tasks-pending/2026-06-18-mobile-operations-workspace-audit.md`.
- Current state: all packet requirements have terminal register statuses.
  `REQ-20260618-001`, `REQ-20260618-002`, and `REQ-20260618-006` are done;
  `REQ-20260618-024` is already satisfied; app-visible/local slices
  `REQ-20260618-003` through `REQ-20260618-005` and
  `REQ-20260618-007` through `REQ-20260618-023` are blocked only at the
  deploy/live-proof or approved live-DB apply step.
- Local proof is complete for the implemented packet slices: public/PWA
  identity and cache guardrails; workspace taxonomy and first server-side
  isolation guards; Operations shell/card/task/intake/calendar cleanup;
  Community, Content, Live Classes, Admin/Communications/Integrations/
  Automations scoping; student detail/accountability/Goal Board identity
  scoping; Hebrew/RTL portal behavior; scoped helper/action-audit hardening;
  and dry-run safe seed/cleanup generation.
- Latest local verification: full `npm test` passed `764/764`, action watchdog
  passed with finding count `0`, security watchdog passed with finding count
  `0`, REQ-022 seed and cleanup dry-runs passed, and `npm run railway:doctor`
  passed again on 2026-06-18T12:03:40+03:00 for Railway production deployment
  `ca0075c2-5ce1-4a70-b6c8-e8d2c116adae`.
- Final source-of-truth watchdog after closeout cleanup:
  `npm run watchdog:audit` passed with severity `ok`, finding count `0`, and
  report `ops/watchdog-audits/2026-06-18T09-11-watchdog-audit.md`.
- Production deploy/live smoke was not run. `scripts/railway-redeploy.ps1`
  packages the current local tree, and this worktree contains extensive mixed
  dirty and untracked changes from multiple workstreams. A scope-safe release
  bundle, clean deploy branch, or explicit operator deploy decision is required
  before uploading.
- Live DB seed apply/readback/cleanup was not run. `npm run seed:req022`
  intentionally defaults to dry-run and requires an explicit safe target
  database plus `APPLY_REQ022_TEST_SEED` or `CLEANUP_REQ022_TEST_SEED` before
  real writes.
- Rollback note: because no deploy/upload or live DB write occurred for this
  closeout, no production rollback was needed. The next release turn should
  preserve the current register status, create a scope-safe deploy bundle or
  commit set, run Railway doctor, deploy, run live health/auth/PWA/workspace/
  mobile/API-isolation smokes, and only then upgrade blocked app-visible items
  from local-only blocked status to done.
