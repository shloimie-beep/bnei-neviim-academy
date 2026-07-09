# Production Readiness Goal

## Raw intake

Source: `RAW-20260709-010`

Shloimie made production readiness the active umbrella goal: get the entire
BNA and OneTime system ready for production.

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Get the entire BNA and OneTime system production-ready by maintaining a durable production-readiness goal, auditing every launch-critical surface, executing unblocked fixes through verification/deploy/live-smoke, and leaving exact owner/blocker/next-action records for anything external or unsafe to complete automatically. |
| Goal tool used | yes |
| Standing goal promoted | `GOAL-PROD-001` |
| Production-ready meaning | All critical public, Operations, portal, helper, privacy, deploy, performance, and provider setup gates are either passing with current evidence or blocked with exact owner and next action. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |

## Production Readiness Definition

The system is not production-ready merely because it deploys. It is
production-ready when these classes are green or precisely blocked:

- Public funnels: BNA and OneTime public pages load, explain the offer safely,
  and capture leads without privacy leaks or false portal/payment promises.
- Operations: Super Admin can log in, navigate, use helper/tools, and see no
  blank screens or major console/server errors.
- Portals: parent/student/provider/Rabbi surfaces enforce scope and do not show
  wrong workspace, fixture/test labels, private data, or unusable actions.
- Lead capture/CRM: submissions create first-party local records and follow-up
  notes; no external CRM/runtime writes are required for the launch lane.
- Communications: email/WhatsApp/WAPI/campaign paths are no-send by default
  unless exact recipient/copy/sender/approval exists.
- Payments/access: checkout, subscriptions, portal access, and member grants
  are blocked until Stripe/price/access policy are explicitly approved and
  smoked.
- Privacy/security: public routes expose anonymous-safe data only; private
  routes reject anonymous/wrong-scope access.
- Performance: launch-critical pages render fast enough to operate and have no
  broken startup errors; known slow/fanout issues are tracked as engineering
  work.
- Deploy/release: master is pushed, release guards pass, deployment targets are
  explicit, deployments reach `SUCCESS`, and live smoke/readback evidence is
  recorded.
- Proof: each requirement has source provenance, files inspected, verification,
  evidence, ledger/changelog, and deploy/live-smoke where applicable.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-047 | Promote production readiness to a durable standing goal. | RAW-20260709-010 | agent_ops | Codex | goal-memory | P0 | 0 | none | Raw input, standing goal, memory note, register, ledger/changelog records exist. | QUALITY-GOALS.md; MEMORY.md; memory/2026-07-09.md; tasks-pending; ops ledgers | no | Done |
| REQ-20260709-048 | Establish the production readiness matrix and current baseline. | RAW-20260709-010 | BNA + OneTime | Codex | readiness-audit | P0 | 1 | REQ-20260709-047 | Register names readiness classes, live URLs, current deploys, known blockers, and first audit commands. | this file; launch catch-up register; active execution run | no | Done |
| REQ-20260709-049 | Run a first production readiness audit from the current live state. | RAW-20260709-010 | BNA + OneTime | Codex | verification | P0 | 1 | REQ-20260709-048 | Representative release, security, action, route, helper, public, and OneTime setup checks pass or produce exact blockers. | smoke/watchdog outputs | maybe | Done |
| REQ-20260709-050 | Keep immediate lead-capture/free-class lane production-live while blocking unapproved full-launch automations. | RAW-20260709-010 | rabbi_sheller_provider / one_time_mishnah_class | Codex | launch-scope | P0 | 2 | REQ-20260709-049 | Public lead capture remains live and verified; full portal/payment/WAPI/campaign launch remains blocked until external values exist. | server.js; public/one-time; launch registers | yes if code changes | Already satisfied |
| REQ-20260709-051 | Convert remaining production blockers into owner/action records. | RAW-20260709-010 | BNA + OneTime + agent_ops | Codex | blockers | P0 | 2 | REQ-20260709-049 | External blockers and engineering blockers have stable IDs, owner, recommended next action, and evidence. | tasks-pending; ops ledgers; active execution run | no | Done |
| REQ-20260709-052 | Execute the next unblocked engineering readiness batch. | RAW-20260709-010 | BNA + OneTime | Codex | implementation | P0 | 3 | REQ-20260709-051 | Next batch is selected from audit evidence, implemented, verified, pushed, deployed/live-smoked when app-visible, or blocked precisely. | public/js/operations-shell.js; server.js; tests/one-time-external-user-portal.test.js | yes | Done |

## Current baseline from latest closeout

- `master`: pushed and clean through `f23a72b3` before this setup-checker
  closeout batch.
- BNA live URL: `https://bneineviimacademy.org`.
- BNA latest runtime deploy: Railway `skillful-motivation`,
  deployment `78b8b3a8-4608-4067-a82e-f57985bb3b61`, `SUCCESS`.
- OneTime live URL: `https://join.onetimeonetime.com`.
- OneTime latest runtime deploy: Railway `one-time-production` /
  `one-time-web`, deployment `0fa8fd0b-052c-4f66-b1c9-f9bed7b65e86`,
  `SUCCESS`.
- OneTime public target routes and instance-config pass against the canonical
  join domain; local Railway CLI link mismatches are now warnings, not public
  target blockers.
- OneTime full setup checker now reads `one-time-production` /
  `one-time-web` through an isolated temporary Railway link and reports 5/8
  ready without printing secret values; the hosted class link is present by
  redacted readback.
- Active execution run validates with 8 done and 2 blocked full-launch setup
  requirements.
- Immediate public lead capture/free-class follow-up lane is deployed and
  live-smoked.

## Known blockers before first audit

| ID | Status | Owner | Blocker | Recommended next action |
|---|---|---|---|---|
| REQ-20260702-108 | Blocked | Shloimie / external setup, Codex to verify | Full provider/campaign setup lacks Stripe sandbox/price alias, WAPI/Whapi instance/phone, final campaign copy, recipient segment/list, suppression/unsubscribe proof, and seed approval. Hosted class link is present by redacted readback. | Provide or label the remaining setup values, then rerun `npm run one-time:setup:check`. |
| REQ-20260702-110 | Blocked | Shloimie / external setup, Codex to verify | Full setup bootstrap blocked until the same external values exist. | Keep immediate lead capture live; do not enable payment/access/campaign automation until setup values pass. |
| DEC-20260709-008 | Superseded for link value; approvals still blocked | Shloimie / Codex to verify | Hosted free-class/class-link value is present by redacted OneTime Railway readback; automated sends remain blocked by WAPI instance/phone metadata and explicit auto-reply approval. | Keep follow-up manual/no-send until WAPI metadata and approval flags are intentionally configured. |
| PERF-20260709-001 | Done, deployed/live-smoked | Codex | BNA Operations rendered with 0 console errors, but startup still performed 118 API reads, median 1064ms, P95 2855ms, max 3622ms. | Reduced dashboard startup fanout, removed support-ticket loading from dashboard first paint, bounded support-ticket list query, deployed BNA, and recorded live profile proof. |
| PERF-20260709-002 | Follow-up, not launch-blocking | Codex | Final dashboard profile is usable but still shows a later refresh cycle around 33s and initial slowest dashboard reads near 3s. | If more performance polish is needed, inspect dashboard refresh scheduling and tune task/device/payment reads after screenshot-led UI work. |
| DEPLOY-20260709-003 | Done | Codex | `npm run railway:doctor` loaded a stale project token even when BNA deploys used account auth, which made deploy-proof readback look blocked after successful deployments. | Updated `scripts/railway-doctor.ps1` to honor `BNA_RAILWAY_USE_ACCOUNT_AUTH` before loading `.secrets/railway-token.txt`; verified doctor passes against BNA production deployment `e1cef921-0e58-4fe7-aaf7-d9be65b06295`. |
| TARGET-20260709-004 | Done | Codex | `npm run one-time:target:guard` hard-blocked the public OneTime target when the local Railway CLI was linked to BNA, even though the canonical OneTime domain and instance config passed. | Reclassified local Railway status mismatch as a warning in `scripts/release-captain.mjs`, added regression coverage, and kept `npm run one-time:railway-target:guard` as the dedicated Railway instance proof. |
| SETUPCHECK-20260709-005 | Done | Codex | `npm run one-time:setup:check` could fall back into the BNA project-token/local-link context and report OneTime Railway target/auth as missing even when OneTime was live. | Updated `scripts/check-onetime-external-setup-readiness.mjs` to honor account-auth mode and use an isolated temp Railway link for redacted OneTime variable readback. |
| SETUPCHECK-20260709-006 | Done | Codex | Readiness reports were still treating the hosted free-class/class-link value as missing even though OneTime Railway had enough redacted proof to clear that setup item. | Updated setup and WAPI readiness checks to consume only redacted hosted presence flags. Latest setup report is 5/8 ready: Railway, DB, join domain, Zoom/class link, and Vimeo/Drive are ready. |
| HELPER-20260709-007 | Done | Codex | Rabbi helper/Telegram handoff still listed a stale OneTime deploy-pending blocker even though the prompt/artifacts are live. | Live-readback verified the Rabbi Telegram/helper prompt, 163-contract helper-scope prompt/artifact, and OneTime instance config; remaining blocker is Agent Mode saved proof plus Rabbi chat ID/external approval gates. |
| HELPER-20260709-008 | Done / proof still pending | Codex | Future agents needed a one-command live readback of the Rabbi Agent Review proof state before opening new Agent Mode windows. | Added `npm run app:smoke:rabbi-agent-review-proof-readiness`. Latest run verified both Rabbi prompts and all public artifacts are live/current, then read the Agent Review hub state as `not_started` for both proof prompts. Next Agent Mode URLs are `https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` and `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md`. |
| LEADCAP-20260709-009 | Done / deployed / live-smoked | Codex | The OneTime public interest endpoint had live read-only page proof but no safe production POST proof, because a real POST creates first-party CRM state and can trigger the internal Telegram reminder. | Added a `dry_run=true` preview path and `npm run app:smoke:one-time-interest-dry-run` so the live endpoint proves OneTime project/program/CRM/internal-note mapping without product lead, CRM lead, internal note, Telegram, email, WhatsApp/WAPI, checkout, access, Zoom, or external writes. Railway deployment `0c1eec63-aa58-4a65-8bc0-0262ba626401` reached `SUCCESS`; live dry-run smoke passed. |
| DEPLOY-20260709-010 | Done / deployed / live-smoked | Codex | OneTime Railway had prior build failures and the deploy context was larger and less deterministic than it should be for production releases. | Hardened the shared Railway Docker build by moving to `node:24-alpine`, using `npm ci`, setting runtime `NODE_ENV=production`, adding `.dockerignore` to exclude secrets/local/generated evidence/raw intake/bulky media from Docker context, and copying `.dockerignore` into manual Railway deploy bundles. Deployed from clean worktree commit `cdbaacf9` to OneTime and BNA; both reached `SUCCESS` and live smokes passed. |
| TARGET-20260709-011 | Done | Codex | Generic `npm run railway:target:doctor` still depended on command-scoped env or `.secrets` target files; a clean shell could block BNA deploy proof even though the non-secret target labels are stable. | Added repo-visible non-secret BNA and OneTime Railway target profiles, selected by `BNA_DEPLOY_APP` / `BNA_RAILWAY_TARGET_PROFILE`, and prevented `railway status` from leaking environment/domain data across projects. BNA and OneTime target doctors now pass from the committed profile config without printing secrets. |
| FLEET-20260709-012 | Done / live inference not run | Codex | Kimi fallback was visible in the fleet status line but not backed by a durable readiness artifact proving the configured command, model, version, and quota-only fallback routing. | Added Kimi fallback readiness to `npm run agent:fleet:readiness`: command lookup found `C:\Users\User\.local\bin\kimi.exe`, version readback is `kimi, version 1.44.0`, model is `kimi-k2.7-code-highspeed`, mode is `quota_only`, and helper assertions prove fallback triggers for Codex quota/capacity errors but skips ordinary coding errors. Live Kimi inference remains intentionally unrun. |
| RUNSTATE-20260709-013 | Done | Codex | The active execution-run blocker output still told the operator to provide a Zoom/class alias even though later redacted setup proof showed the hosted Zoom/class link was present. | Re-ran current setup and WAPI readiness checks, then reconciled the active run JSON and handoff docs so the remaining full-launch blockers are only Stripe sandbox/price alias, Whapi/WAPI instance/phone plus auto-reply approval flags, and campaign copy/list/suppression/seed approval. |
| LIVECHECK-20260709-014 | Done / proof pending for Agent Mode only | Codex | Production-readiness proof needed a fresh live regression snapshot after the blocker and Kimi/control-tower reconciliations. | Live-smoked BNA public/app/Operations helper/privacy, OneTime separate instance/public target/Rabbi landing/dry-run interest capture, Rabbi Agent Review proof readiness, and action/security/workspace/raw watchdogs. All runnable checks passed; Rabbi Agent Review remains open only for two saved terminal Agent Mode proofs. |
| QUEUE-20260709-015 | Done / no safe auto-action | Codex | Production-readiness queue hygiene needed a fresh no-mutation readback so stale historical jobs are not mistaken for launch-ready work. | `npm run task:reconcile` dry-run found 30 active machine tasks and 0 actions, with only task `#1839` and task `#1945` kept as true external blockers. `npm run agent:fleet:status` showed supervisor PID `36560`, 0 claimable jobs, and the active UI/fallback lanes still running. Process-scoped live-url `npm run ops:audit-queue -- --json --no-write` reported `warnings: []` and `requeue_candidates: []`. Stale/do-not-redo counts remain audit evidence, not permission to auto-run old prompts. |
| LAUNCHBLOCK-20260709-016 | Done / blocker packet current | Codex | The canonical OneTime operator setup checklist and visible operator task packet still treated solved Railway/DB/domain/Zoom/Vimeo/Drive items as current human blockers. | Reconciled the checklist, top-visible operator task packet, and prepared WhatsApp setup message to the current 5/8 setup state. Future agents should ask only for Stripe sandbox/price alias, Whapi/WAPI instance/phone plus auto-reply approval flags, and campaign copy/list/suppression/seed approval unless fresh readback contradicts the current evidence. |
| PROOFSTATE-20260709-017 | Done / tracked latest proof pointer | Codex | Rabbi Agent Review proof readiness only wrote timestamped reports under ignored `ops/live-smokes`, making it too easy for future agents to use stale proof or miss the exact next Agent Mode prompts. | Updated `npm run app:smoke:rabbi-agent-review-proof-readiness` to also write tracked latest summaries under `ops/agent-review-proof-readiness/`. Latest readback confirms both Rabbi prompts/artifacts are live and the hub still has no terminal AGR result for either prompt. |
| READINESS-20260709-022 | Done / no deploy performed | Codex | Agent fleet auto-deploy could run the configured deploy command after local verification without first consulting the production-readiness gate, creating a bypass around the production closeout blocker state. | Wired `scripts/agent-fleet-supervisor.mjs` to run `npm run production:readiness:gate -- --json` before any auto-deploy command and to block with `production_readiness_gate_blocked` when readiness is not proven. Refreshed `npm run agent:fleet:readiness` so future agents can see the enforced preflight proof. |
| READINESS-20260709-023 | Done / no deploy performed | Codex | The production-readiness snapshot did not surface the newly enforced agent-fleet auto-deploy preflight, so future agents could miss that auto-deploy is gated even if they read the control tower first. | Updated `scripts/production-readiness-snapshot.mjs` and `ops/production-readiness/README.md` so the snapshot carries `production_deploy_preflight` from fleet readiness and renders the auto-deploy preflight command, blocked reason, and no-deploy proof. |
| READINESS-20260709-024 | Done / no deploy performed | Codex | The remaining production blockers were accurate but split across the production snapshot, OneTime setup checklist, and Rabbi Agent Review proof report, making the exact next operator actions harder to hand off. | Added `npm run production:unblocker`, which generates `ops/production-readiness/latest-production-unblocker.*` with the three remaining external setup buckets, both Agent Mode proof drop-off URLs, active lanes to avoid, after-update commands, and no-deploy/no-send/no-secret guardrails. |
| READINESS-20260709-025 | Done / no deploy performed | Codex | The production-readiness gate blocked correctly but did not itself point blocked agents/operators to the generated production unblocker packet. | Added `operator_unblocker` and an unblocker next action to `npm run production:readiness:gate -- --json`, so blocked gate output points at `npm run production:unblocker` and `ops/production-readiness/latest-production-unblocker.md`. |
| READINESS-20260709-026 | Done / no deploy performed | Codex | The release/deploy closeout gate embedded a reduced production-readiness summary, so deploy-gate output still did not expose the unblocker path even after the readiness gate did. | Preserved `operator_unblocker` and `next_actions` inside `scripts/bna-production-closeout-gate.mjs` production-readiness summaries, so blocked release/deploy output carries the unblocker pointer too. |
| READINESS-20260709-027 | Done / no deploy performed | Codex | The operator unblocker could be generated from a stale committed production snapshot if agents forgot to refresh the control tower first. | Updated `npm run production:unblocker` to sample `node scripts/production-readiness-snapshot.mjs --no-write --json` by default, carry source snapshot metadata, and keep `--from-snapshot-file` for intentional file-based reads. |
| READINESS-20260709-028 | Done / no deploy performed | Codex | GitHub-connected agents needed the tracked latest unblocker artifact refreshed after the fresh-snapshot default was pushed. | Regenerated `ops/production-readiness/latest-production-unblocker.*` from clean pushed head `c020293b`; the artifact records `live_no_write_command`, head/origin `c020293b`, worktree clean `true`, 3 external setup blockers, 2 Agent Mode proof blockers, 2 active collision lanes, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-029 | Done / no deploy performed | Codex | The control-tower launch assessment exposed the UI and fallback/API lanes as collision lanes but did not promote the active Agent Review result repair job, even though proof repair overlaps the missing terminal proof blocker. | Updated `scripts/production-readiness-snapshot.mjs` so active Agent Review/AGR repair jobs are included in `avoid_colliding_with` and next actions warn not to overlap proof/result repair while that job is running. |
| READINESS-20260709-030 | Done / no deploy performed | Codex | GitHub-visible production readiness artifacts needed to reflect the new Agent Review repair collision lane after `READINESS-20260709-029` was pushed. | Regenerated `ops/production-readiness/latest-production-readiness-snapshot.*` and `latest-production-unblocker.*`; the snapshot sampled clean pushed head `0b5cdd3e` and showed 3 collision lanes including job `344`. The unblocker also showed 3 lanes, but its source sample correctly marked dirty because the snapshot artifact was already modified before it ran; a clean-source unblocker refresh follows. |
| READINESS-20260709-031 | Done / no deploy performed | Codex | The operator-facing unblocker needed one final refresh from a clean artifact head after `READINESS-20260709-030`. | Regenerated `ops/production-readiness/latest-production-unblocker.*` from clean pushed head `08a8d61e`; the packet records `live_no_write_command`, head/origin `08a8d61e`, worktree clean `true`, 3 external setup blockers, 2 Agent Mode proof blockers, 3 active collision lanes including Agent Review repair job `344`, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-032 | Done / no deploy performed | Codex | The production snapshot Markdown still mixed true running launch collision lanes with queued/failed policy rows under one `Active / Do Not Collide` heading, which made simultaneous-agent status harder to read. | Updated `scripts/production-readiness-snapshot.mjs` to render separate `Launch Collision Lanes` and `Other Agent Policy Rows` sections, with tests preventing the old mixed heading from returning. |
| READINESS-20260709-033 | Done / no deploy performed | Codex | GitHub-visible production snapshot artifacts needed to show the separated collision/policy-row sections after `READINESS-20260709-032` was pushed. | Regenerated `ops/production-readiness/latest-production-readiness-snapshot.*` from clean pushed head `f3d10f8b`; Markdown now lists jobs `382`, `427`, and `344` under `Launch Collision Lanes`, and queued/failed rows under `Other Agent Policy Rows`. |
| READINESS-20260709-034 | Done / no deploy performed | Codex | The operator-facing unblocker needed a clean-source refresh after the separated-row production snapshot artifact was pushed. | Regenerated `ops/production-readiness/latest-production-unblocker.*` from clean pushed head `e5524567`; the packet records `live_no_write_command`, head/origin `e5524567`, worktree clean `true`, 3 external setup blockers, 2 Agent Mode proof blockers, 3 active collision lanes, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-035 | Done / no deploy performed | Codex | The production-readiness gate was truthful but noisy: 14 individual blocker lines represented a smaller set of actionable blocker categories, and deploy-gate output did not preserve grouped blocker context. | Added `blocker_groups` to `scripts/production-readiness-gate.mjs` and preserved it in `scripts/bna-production-closeout-gate.mjs`, grouping snapshot status, dirty tree, no unblocked batch, external setup, Agent Mode proof, ChatGPT queue, and active collision lanes while keeping the existing blocker list intact. |
| READINESS-20260709-036 | Done / no deploy performed | Codex | The grouped production gate needed clean-head proof after `READINESS-20260709-035` was pushed. | Reran readiness, release/deploy, unblocker, and run-next checks from clean pushed head `868e5a8b`; readiness and release gates preserved 5 real blocker groups without dirty-worktree noise, deploy remained blocked, and no production mutation occurred. |
| READINESS-20260709-037 | Done / no deploy performed | Codex | The operator-facing unblocker still had detailed sections but lacked the same owner/action grouping that the production gate now exposes. | Added `blocker_groups` and an `Owner Action Summary` section to `scripts/production-unblocker.mjs`, grouping no unblocked batch, external setup, Agent Mode proof, active collision lanes, and queued ChatGPT packets when present while preserving all detailed setup/proof/lane sections. |
| READINESS-20260709-038 | Done / no deploy performed | Codex | GitHub-visible production unblocker artifacts needed to include the new owner-action summary from a clean pushed source. | Regenerated `ops/production-readiness/latest-production-unblocker.*` from clean pushed head `c5ffc1a5`; JSON readback records worktree clean `true`, status `not_production_complete`, 4 blocker groups, 3 external setup blockers, 2 Agent Mode proof blockers, 3 active collision lanes, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-039 | Done / no deploy performed | Codex | The production gate grouped external blockers by two execution-run requirements while the operator unblocker correctly exposed three concrete OneTime setup buckets. | Added OneTime setup bucket summary to the production snapshot and taught the readiness gate to group external setup blockers by `SETUP-ONETIME-STRIPE-001`, `SETUP-ONETIME-WHAPI-001`, and `SETUP-ONETIME-CAMPAIGN-001` when that granular evidence is available. |
| READINESS-20260709-040 | Done / no deploy performed | Codex | GitHub-visible production snapshot artifacts needed to include the OneTime setup bucket summary after `READINESS-20260709-039` was pushed. | Regenerated `ops/production-readiness/latest-production-readiness-snapshot.*` from clean pushed head `60f4592d`; JSON/Markdown readback shows 2 active-run blockers, 3 concrete setup buckets, 2 missing Agent Mode proofs, 3 active collision lanes, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-041 | Done / no deploy performed | Codex | GitHub-visible production unblocker artifacts needed to align with the current snapshot/gate head after setup bucket reporting landed. | Regenerated `ops/production-readiness/latest-production-unblocker.*` from clean pushed head `01eb2537`; readback shows status `not_production_complete`, 4 blocker groups, 3 external setup buckets, 2 Agent Mode proof blockers, 3 active collision lanes, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-042 | Done / no deploy performed | Codex | The production readiness snapshot parser could misclassify active policy job rows with colons in their titles as summary keys, adding noisy bogus fields such as a failed UI job title under `agent_fleet.summary`. | Exported and tightened `parseFleetStatus` so summary parsing stops after the active-policy section begins and job rows are parsed only as jobs; added a regression test using a failed UI job with a colon in the title. |
| READINESS-20260709-043 | Done / no deploy performed | Codex | GitHub-visible production snapshot artifacts needed to reflect the hardened fleet parser after `READINESS-20260709-042` was pushed. | Regenerated `ops/production-readiness/latest-production-readiness-snapshot.*` from clean pushed head `ece52fe4`; JSON readback shows no bogus `job_408...` summary key, 8 active policy jobs, 3 concrete setup buckets, 3 launch collision lanes, 0 queued ChatGPT packets, and no executable batch. |
| READINESS-20260709-044 | Superseded by `READINESS-20260709-046` | Codex | A new contact-private intake asks to WhatsApp Rabbi Elie the OneTime Telegram bot instructions so his Telegram chat ID can be captured. | Historical preflight record at `50a2cfa0`: the request was registered redacted as `REQ-20260709-069`, no-send Telegram/WAPI preflights ran, and the send was kept blocked at that moment because WAPI sender metadata/approval was not auditable and the Telegram bot had 0 candidates. A later lane performed the approved WhatsApp send and local no-send readiness now reports the Rabbi runtime ready; use `READINESS-20260709-046` for current state. |
| READINESS-20260709-045 | Done / no deploy performed | Codex | GitHub-visible production snapshot and unblocker artifacts needed to align with the latest redacted blocked-send record at `50a2cfa0`. | Regenerated `ops/production-readiness/latest-production-readiness-snapshot.*` and `latest-production-unblocker.*` from clean pushed head `50a2cfa0`; readback shows status `not_production_complete`, 3 concrete setup buckets, 2 Agent Mode proof blockers, 3 active collision lanes, 0 queued ChatGPT packets, no executable batch, and no bogus fleet summary keys. |
| READINESS-20260709-046 | Done / no deploy performed / live send gated | Codex | The production-readiness tooling and registers needed to reflect the current Rabbi Telegram state after the approved WhatsApp instruction send and post-send bot readback. | Added redacted `rabbi_telegram_runtime` output to the production snapshot/gate/unblocker, updated tests, reconciled `REQ-20260709-069`, and recorded that no-send readiness is now local-runtime-ready with masked candidate `******4810`; live Rabbi Telegram send/smoke remains gated until release gates are otherwise clear and exact live-send scope is approved. |
| READINESS-20260709-047 | Done / no deploy performed / production gate blocked | Codex | The Rabbi Telegram readiness gate needed to distinguish local chat-ID configuration from production verification. | Tightened the production snapshot/gate/unblocker so Rabbi Telegram is blocked as `local_runtime_ready_live_smoke_pending` until a hosted restart/deploy window and scoped live-smoke proof are recorded. Current gate groups now include `rabbi_telegram_runtime_configuration` alongside external setup, Agent Mode proof, active collision lanes, and no unblocked executable batch. |

## First audit command plan

Run these before selecting the next implementation batch:

- `git status -sb`
- `npm run bna:run:validate`
- `npm run secrets:audit`
- `npm run watchdog:actions`
- `npm run watchdog:security`
- `npm run watchdog:workspace-scope`
- `npm run watchdog:raw`
- `npm run app:smoke -- https://bneineviimacademy.org`
- `npm run app:smoke:operations-helper -- https://bneineviimacademy.org`
- `npm run app:smoke:operations-workspace-taxonomy -- https://bneineviimacademy.org`
- `npm run app:smoke:public-privacy -- https://bneineviimacademy.org`
- `npm run one-time:target:guard -- --json`
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
- `npm run one-time:setup:check`
- `npm run one-time:wapi:readiness`

## First audit results

| Check | Result | Evidence / blocker |
|---|---|---|
| `git status -sb` | Expected dirty | Only this production-readiness raw/register/memory goal batch was dirty. |
| `npm run bna:run:validate` | PASS | Active run validates; 8 done, 2 blocked. |
| `npm run secrets:audit` | PASS | 7402 tracked paths checked, 0 tracked secret-risk files. |
| `npm run watchdog:actions` | PASS | `ops/watchdog-audits/2026-07-09T12-28-watchdog-action-audit.md`, 0 findings. |
| `npm run watchdog:security` | PASS | `ops/watchdog-audits/2026-07-09T12-28-watchdog-security-routes.md`, 0 findings. |
| `npm run watchdog:workspace-scope` | PASS | Workspace scope guardrail passed. |
| `npm run watchdog:raw` | PASS | `ops/watchdog-audits/2026-07-09T12-28-raw-intake-drift.md`, 0 findings. |
| BNA live app smoke | PASS | `ops/live-smokes/2026-07-09T12-28-34-125Z-live-app-smoke.md`. |
| BNA Operations helper smoke | PASS | `ops/live-smokes/2026-07-09T12-28-33-152Z-operations-helper-live-smoke.md`. |
| BNA workspace taxonomy smoke | PASS | `ops/live-smokes/2026-07-09T12-28-33-249Z-operations-workspace-taxonomy-live-smoke.md`. |
| BNA public privacy smoke | PASS | `ops/live-smokes/2026-07-09T12-29-06-345Z-public-route-privacy-smoke.md`. |
| OneTime target guard | Target checks passed; strict release gate expected-dirty before commit | Canonical `/`, `/one-time/`, and `/api/one-time/instance-config` checks pass. `TARGET-20260709-004` fixed the false hard blocker from a BNA-linked local Railway CLI status. |
| OneTime separate-instance smoke | PASS | Health/config/root/public/OneTime/member/classroom routes returned 200. |
| Rabbi OneTime landing smoke | PASS | `ops/live-smokes/2026-07-09T12-28-55-415Z-rabbi-onetime-landing-smoke.md`. |
| `npm run one-time:setup:check` | EXPECTED BLOCKED | Ready 5/8 in `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`. Blocks: Stripe sandbox/price alias, WAPI instance/phone, campaign copy/list/suppression/seed approval. Railway target/auth, DB, join domain, Zoom/class link, and Vimeo/Drive are not blockers. |
| `npm run one-time:wapi:readiness` | EXPECTED BLOCKED | `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`; outbound token configured and class link present, but instance ID, phone metadata, auto-reply enable, and explicit approval are missing. |

## Next unblocked engineering batch

`PERF-20260709-001` was selected and completed as the first unblocked
production-readiness engineering batch. It did not require external account
access, sends, payment, DNS, or credentials.

## PERF-20260709-001 closeout

Implemented:

- Reduced BNA Operations dashboard startup fanout in
  `public/js/operations-shell.js` by using a dashboard light pass instead of
  loading broad module datasets on the dashboard.
- Removed `/api/bna/support-tickets` from dashboard first paint; support/API
  views still load support tickets when those views need them.
- Bounded `/api/bna/support-tickets` in `server.js` to a default max of 200
  tickets, max 500 when requested, and computed comment counts only for the
  returned ticket IDs.
- Added a regression assertion in
  `tests/one-time-external-user-portal.test.js` so the private support-ticket
  sort CTE does not regress to an invalid `ft.created_at` outer reference.

Commits pushed:

- `43b1ce9e` - `Reduce Operations dashboard startup fanout`
- `a2f15c31` - `Speed up Operations support data loading`
- `7e69aece` - `Fix support ticket query ordering`

BNA deployments:

- `daf5609f-5d79-41bb-9418-fa9390f30436` - first dashboard light-pass deploy,
  `SUCCESS`.
- `2bf06b69-b76f-499a-a932-07b5a39e2071` - support loading/query deploy,
  `SUCCESS`.
- `73c4d440-e0b3-495d-91ec-add72229b304` - support query ordering hotfix,
  `SUCCESS`.

Verification:

- PASS `node --check public/js/operations-shell.js`
- PASS `node --check server.js`
- PASS focused Operations/support/action tests.
- PASS `npm test` 1693/1693 after each final backend patch.
- PASS `npm run secrets:audit` with 7404 tracked paths and 0 secret-risk files.
- PASS `npm run watchdog:actions` with 0 findings.
- PASS `npm run watchdog:protocol-drift` with 0 findings.
- PASS `npm run bna:run:validate` with the expected 8 done / 2 blocked
  external setup state.
- PASS BNA live app smoke:
  `ops/live-smokes/2026-07-09T12-54-46-066Z-live-app-smoke.md`.
- PASS BNA Operations helper smoke:
  `ops/live-smokes/2026-07-09T12-54-45-114Z-operations-helper-live-smoke.md`.
- PASS BNA workspace taxonomy smoke:
  `ops/live-smokes/2026-07-09T12-54-45-134Z-operations-workspace-taxonomy-live-smoke.md`.
- PASS protected live support-ticket readback after hotfix:
  `/api/bna/support-tickets` returned HTTP 200, 23 tickets, about 2.9s.
- FIXED `npm run railway:doctor` account-auth mismatch in
  `DEPLOY-20260709-003`; rerun with explicit BNA account-auth target passed and
  confirmed deployment `e1cef921-0e58-4fe7-aaf7-d9be65b06295` reached
  `SUCCESS`.

## DEPLOY-20260709-003 closeout

Implemented:

- Added the same `BNA_RAILWAY_USE_ACCOUNT_AUTH` check to
  `scripts/railway-doctor.ps1` that already existed in
  `scripts/railway-redeploy.ps1`.
- Prevented doctor from loading `.secrets/railway-token.txt` when account auth
  is explicitly requested.
- Extended `tests/railway-target-guard.test.js` to assert auth-mode parity
  between doctor and redeploy scripts.

Verification:

- PASS `node --test tests\railway-target-guard.test.js tests\one-time-deployment-readiness.test.js`
  13/13.
- PASS `npm run railway:doctor` with explicit BNA target/account auth.
- PASS `npm run secrets:audit` with 7408 tracked paths and 0 secret-risk files.
- PASS `npm run bna:run:validate` with expected 8 done / 2 blocked state.
- PASS `git diff --check` with line-ending warnings only.

## TARGET-20260709-004 closeout

Implemented:

- Reclassified local Railway CLI status mismatch in the OneTime public target
  guard from hard blocker to warning after the canonical public routes and
  `/api/one-time/instance-config` pass.
- Added `railway_status.matches_expected` to make the local CLI mismatch
  visible without incorrectly blocking the public target guard.
- Added regression coverage proving a BNA-linked local Railway status does not
  fail the OneTime public target guard when live public checks pass.

Verification:

- PASS `node --check scripts\release-captain.mjs`.
- PASS `node --test tests\release-captain.test.js` 6/6.
- PASS OneTime public target checks inside
  `npm run one-time:target:guard -- --json`: canonical `/`, `/one-time/`, and
  `/api/one-time/instance-config` all returned the expected OneTime app and
  workspace/project values.
- EXPECTED DIRTY before closeout commit: the strict release captain command
  still blocked deployment state because this scoped fix and current WAPI
  readiness reports were uncommitted.
- EXPECTED BLOCKED `npm run one-time:wapi:readiness`: latest report remains
  blocked only by missing WAPI instance ID, sender phone metadata, and
  auto-reply enable/approval. Hosted class link is present by redacted
  OneTime Railway readback.

## SETUPCHECK-20260709-005 closeout

Implemented:

- Made the OneTime external setup checker honor
  `ONE_TIME_RAILWAY_USE_ACCOUNT_AUTH`, `BNA_RAILWAY_USE_ACCOUNT_AUTH`, or
  `RAILWAY_USE_ACCOUNT_AUTH` before loading `.secrets/railway-token.txt`.
- Added an isolated temporary Railway link readback path that uses the guarded
  OneTime provisioning report's project ID to read `one-time-web` production
  variables without changing the repo checkout and without printing values.
- Kept the current BNA-linked shell safe: after restoring local Railway status
  to BNA, `npm run one-time:railway-target:guard` still passed through the
  temp-link readback.
- The report only records redacted booleans and lengths; it does not record
  `DATABASE_URL`, API keys, Zoom links, Telegram tokens, passwords, or raw
  provider secrets.

Verification:

- PASS `node --check scripts\check-onetime-external-setup-readiness.mjs`.
- PASS `node --test tests\one-time-external-setup-readiness.test.js` 7/7.
- PASS `npm run one-time:railway-target:guard`: 1/1 ready, source
  `railway_temp_link_account_auth`, 52 OneTime Railway variables read by
  redacted summary only.
- EXPECTED BLOCKED `npm run one-time:setup:check -- --write-report`: this
  original closeout was 4/8 ready before hosted class-link presence was added
  to the readiness contract.

## SETUPCHECK-20260709-006 closeout

Implemented:

- Added redacted hosted presence flags for OneTime Zoom/class-link and WAPI
  metadata to the Railway variable summary.
- Updated the setup checker so `SETUP-ONETIME-ZOOM-001` can clear from a
  redacted hosted class-link/Zoom-session readback without writing the raw URL.
- Updated the WAPI readiness checker so the auto-reply class-link prerequisite
  can clear from redacted OneTime Railway readback while WAPI instance, phone,
  and explicit approval remain blocked.
- Added regression coverage proving token, URL, database, and phone values are
  not written to reports.

Verification:

- PASS `node --check scripts\check-onetime-external-setup-readiness.mjs`.
- PASS `node --check scripts\check-onetime-wapi-readiness.mjs`.
- PASS `node --test tests\one-time-external-setup-readiness.test.js` 8/8.
- PASS `node --test tests\one-time-wapi-scope-contract.test.js` 3/3.
- PASS `npm run one-time:railway-target:guard`: 1/1 ready, source
  `railway_temp_link_account_auth`, 52 OneTime Railway variables summarized by
  redacted presence flags only.
- EXPECTED BLOCKED `npm run one-time:setup:check -- --write-report`: 5/8
  ready. Ready: Railway target, separate database reference, join domain,
  Zoom/class link, and Vimeo/Drive. Blocked: Stripe sandbox/price alias,
  Whapi/WAPI instance and phone, campaign copy/list/suppression/seed approval.
- EXPECTED BLOCKED `npm run one-time:wapi:readiness`: outbound credential and
  class link are present; blocked only by Whapi/WAPI instance id, sender phone
  metadata, `ONE_TIME_WAPI_AUTO_REPLY_ENABLED`, and explicit approval flag.

## HELPER-20260709-007 closeout

Implemented:

- Reconciled the Rabbi Telegram/helper register after current live readbacks.
- Reclassified `REQ-20260708-101` from deploy-pending to deployed/live
  readback verified.
- Marked the old helper-scope Railway failed-deploy section as superseded so
  future agents do not chase an obsolete deploy blocker.

Verification:

- PASS live readback
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`
  returned `200` with `REQ-20260708-101`, `REQ-20260708-100`,
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, and OneTime scope markers.
- PASS live readback
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md`
  returned `200` with `REQ-20260708-093`, `RABBI-HELPER-SCOPE-163`, and
  OneTime scope markers.
- PASS live readback
  `https://join.onetimeonetime.com/agent-review-artifacts/rabbi-one-time-tool-scope-map.md`
  returned `200` with `RABBI-HELPER-SCOPE-163` and OneTime scope markers.
- PASS live instance config readback returned
  `rabbi_sheller_provider / one_time_mishnah_class / onetime`.
- PASS no-write `npm run telegram:rabbi:readiness`: Rabbi token and OneTime
  Operations credentials are configured; `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
  remains missing; no Telegram send occurred.

Remaining blockers:

- Rabbi live Telegram delivery requires the intended account/group to message
  `t.me/onetimeaios_bot` so `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` can be
  configured through secret-safe runtime config.
- Agent Mode must still save PASS/BLOCKED/FAIL drop-off proof for the deployed
  Rabbi Telegram/helper smoke prompt and all-163 helper-scope probe.
- External-write/helper autonomy remains gated by exact approvals and
  credentials.

## HELPER-20260709-008 closeout

Implemented:

- Added `scripts/smoke-rabbi-agent-review-proof-readiness-live.mjs` and npm
  alias `app:smoke:rabbi-agent-review-proof-readiness`.
- The smoke verifies the public Rabbi Agent Review prompts, the 163-contract
  helper scope artifact, the scope-map markdown, the account-bot template, and
  the protected Agent Review hub's latest proof state.
- The script is read-only and does not save Agent Review results, create
  tickets, send Telegram/email/WhatsApp/WAPI messages, charge, grant access,
  upload, mutate Drive/Vimeo/Zoom/DNS/credentials, or publish.

Verification:

- PASS `node --check scripts\smoke-rabbi-agent-review-proof-readiness-live.mjs`.
- PASS `npm run app:smoke:rabbi-agent-review-proof-readiness`.
- PASS generated report secret scan for cookie values, bearer tokens, API keys,
  OPS password markers, and Stripe secret-key patterns.
- Evidence:
  `ops/live-smokes/2026-07-09T13-51-52-167Z-rabbi-agent-review-proof-readiness-live.md`.

Current proof state from the live hub:

- `rabbi-telegram-helper-ticket-smoke`: `not_started`, no terminal AGR result.
- `rabbi-helper-tool-scope-map`: `not_started`, no terminal AGR result.
- Next Agent Mode windows should start from:
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`
  and
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md`.

Performance proof:

| Profile | Shell visible | Fetches under 10s | Support-ticket dashboard fetches | Slowest fetch | Console errors | Failed requests | Evidence |
|---|---:|---:|---:|---:|---:|---:|---|
| Before dashboard/support fix | 8574ms | 17 | 1 | 35859ms | 0 | 0 | `ops/performance-audits/2026-07-08-app-backend-helper-performance/residual-slowness-profile-live-bna-platform-after-dashboard-light-pass.md` |
| After hotfix | 3186ms | 16 | 0 | 2979ms | 0 | 0 | `ops/performance-audits/2026-07-08-app-backend-helper-performance/residual-slowness-profile-live-bna-platform-after-support-ticket-hotfix.md` |

## LEADCAP-20260709-009 closeout

Implemented:

- Added `previewOneTimeProductLeadCapture` to validate `/api/one-time/interest`
  payloads and resolve the OneTime project/program through the existing
  scoped helpers without opening a transaction or inserting rows.
- Added `dry_run=true` handling before the real product-lead write path, so a
  production smoke can prove product lead, first-party CRM lead, and internal
  communication-note mapping without mutating production data.
- Added `scripts/smoke-one-time-interest-dry-run-live.mjs` and npm alias
  `app:smoke:one-time-interest-dry-run`.
- Regenerated the OneTime action coverage artifact after the full test suite
  caught a stale content hash.

Verification:

- PASS `node --check server.js`.
- PASS `node --check scripts\smoke-one-time-interest-dry-run-live.mjs`.
- PASS `node --test tests\one-time-product-system.test.js`.
- PASS `node --test tests\one-time-focused-landing.test.js`.
- PASS `node --test tests\one-time-canonical-journey.test.js`.
- PASS `node --test tests\watchdog-action-registry.test.js`.
- PASS `npm test` 1697/1697 after regenerating
  `ops/action-registry/one-time-action-coverage.*`.
- PASS `npm run secrets:audit`.
- PASS `npm run watchdog:protocol-drift`, 0 findings.
- PASS `npm run bna:run:validate`, expected 8 done / 2 blocked state.
- PASS `npm run one-time:railway-target:guard`, redacted
  `one-time-production / one-time-web / production` readback.
- PASS `npm run one-time:target:guard -- --json` after explicit OneTime CLI
  link; canonical public OneTime routes, instance config, Railway status, and
  active run checks passed.
- PASS explicit OneTime Railway deploy guard with
  `BNA_DEPLOY_APP=one-time`, `BNA_EXPECTED_DOMAIN=join.onetimeonetime.com`,
  project `one-time-production`, service `one-time-web`, environment
  `production`.
- PASS deployment status poll: `0c1eec63-aa58-4a65-8bc0-0262ba626401`
  reached `SUCCESS`.
- PASS `npm run app:smoke:onetime-separate-instance --
  https://join.onetimeonetime.com`.
- PASS `npm run app:smoke:rabbi-onetime-landing --
  https://join.onetimeonetime.com`.
- PASS `npm run app:smoke:one-time-interest-dry-run`; evidence
  `ops/live-smokes/2026-07-09T14-10-19-816Z-one-time-interest-dry-run-live-smoke.md`.

Guardrails:

- The dry-run route exits before `createOneTimeProductLead` and before
  `sendOneTimeSignupTelegramReminder`.
- No product lead, CRM lead, contact communication, Telegram reminder, email,
  WhatsApp/WAPI message, checkout, access grant, Zoom meeting, external
  connector write, DNS/account/provider mutation, or credential change was
  performed during local verification.
- Real production POST remains intentionally unrun unless Shloimie explicitly
  asks to create a real test lead and accepts the internal reminder side effect.

Deployment status:

- Commit `45b332b6` pushed to `origin/master`.
- Explicit OneTime Railway deploy to `one-time-production / one-time-web /
  production` reached `SUCCESS` for deployment
  `0c1eec63-aa58-4a65-8bc0-0262ba626401`.
- Live dry-run smoke passed against `https://join.onetimeonetime.com` without
  creating a lead, CRM row, internal note, reminder, checkout, access grant,
  Zoom meeting, or external write.

## DEPLOY-20260709-010 closeout

Implemented:

- Updated `Dockerfile` from `node:18-alpine` to `node:24-alpine`.
- Switched Docker dependency install from `npm install` to deterministic
  `npm ci`.
- Set `NODE_ENV=production` for runtime.
- Added `.dockerignore` to keep secrets, env files, `node_modules`, raw intake,
  daily memory, generated audit/smoke evidence, local browser artifacts, and
  bulky generated media out of Railway build context.
- Updated `scripts/railway-redeploy.ps1` so manual deploy bundles include
  `.dockerignore`.
- Added a deployment-readiness regression test for the Docker/build-context
  contract.

Verification before deploy:

- PASS `npm ci --dry-run --ignore-scripts`.
- PASS PowerShell parser check for `scripts\railway-redeploy.ps1`.
- PASS `node --test tests\one-time-deployment-readiness.test.js
  tests\railway-target-guard.test.js tests\one-time-product-system.test.js`
  22/22.
- PASS `npm run one-time:railway-target:guard`, redacted
  `one-time-production / one-time-web / production` readback.
- PASS `npm run secrets:audit`, 7414 tracked paths checked and 0
  secret-risk files.

Deployment status:

- Commit `cdbaacf9` pushed to `origin/master`.
- Deployed from clean detached worktree
  `C:\Users\User\AppData\Local\Temp\bna-deploy-cdbaacf9` so unrelated dirty
  frontend-audit files could not enter the deploy bundle.
- OneTime deploy: Railway `one-time-production / one-time-web / production`,
  deployment `0fa8fd0b-052c-4f66-b1c9-f9bed7b65e86`, `SUCCESS`.
- BNA deploy: Railway `skillful-motivation / skillful-motivation /
  production`, deployment `78b8b3a8-4608-4067-a82e-f57985bb3b61`, `SUCCESS`.
- PASS `npm run app:smoke:onetime-separate-instance --
  https://join.onetimeonetime.com`.
- PASS `npm run app:smoke:one-time-interest-dry-run`, evidence
  `ops/live-smokes/2026-07-09T14-19-30-216Z-one-time-interest-dry-run-live-smoke.md`.
- PASS `npm run app:smoke:rabbi-onetime-landing --
  https://join.onetimeonetime.com`, evidence
  `ops/live-smokes/2026-07-09T14-19-30-217Z-rabbi-onetime-landing-smoke.md`.
- PASS `npm run app:smoke -- --skip-tests`, evidence
  `ops/live-smokes/2026-07-09T14-22-23-463Z-live-app-smoke.md`.
- PASS `npm run app:smoke:operations-helper --
  https://bneineviimacademy.org`, evidence
  `ops/live-smokes/2026-07-09T14-22-22-608Z-operations-helper-live-smoke.md`.

## TARGET-20260709-011 closeout

Implemented:

- Added `config/railway-targets.json` with non-secret target profiles for BNA
  (`skillful-motivation` / `bneineviimacademy.org`) and OneTime
  (`one-time-production` / `one-time-web` /
  `join.onetimeonetime.com`).
- Updated `scripts/railway-target-guard.mjs` to load committed target profiles
  after env and `.secrets` overrides, selected by `BNA_DEPLOY_APP` or
  `BNA_RAILWAY_TARGET_PROFILE`.
- Normalized `one_time` / `one-time` app keys so shell-friendly env values
  resolve to the canonical OneTime profile.
- Prevented the guard from borrowing environment IDs, service IDs, or domains
  from `railway status` when the current Railway link belongs to a different
  project than the selected target profile.

Verification:

- PASS `node --test tests\railway-target-guard.test.js` 9/9.
- PASS `node --test tests\one-time-deployment-readiness.test.js
  tests\railway-target-guard.test.js` 17/17.
- PASS `npm run railway:target:doctor` from the committed BNA profile:
  `skillful-motivation` / `production` /
  `bneineviimacademy.org`.
- PASS `BNA_DEPLOY_APP=one_time npm run railway:target:doctor` from the
  committed OneTime profile: `one-time-production` / `one-time-web` /
  `join.onetimeonetime.com`.
- PASS `npm run one-time:railway-target:guard`, redacted
  `one-time-production / one-time-web / production` readback.
- PASS `npm run bna:run:validate`.

Guardrails:

- No Railway deploy/upload, DNS change, credential change, env-variable write,
  provider mutation, payment/access mutation, or external send was performed
  in this target-context fix.
- The committed config contains Railway project/service/domain labels only, not
  tokens, database URLs, credentials, or private variable values.

## FLEET-20260709-012 closeout

Implemented:

- Exported the real Kimi fallback decision helpers from
  `scripts/agent-fleet-supervisor.mjs` so readiness/tests use the same logic
  as the running fleet.
- Added a `kimi_fallback_readiness` section to
  `scripts/agent-fleet-readiness.mjs` with command lookup, version readback,
  configured model/mode, redacted credential-source booleans, and fallback
  decision preview.
- Kept the fallback mode as `quota_only`, which matches the production goal:
  Kimi takes over only when Codex fails from quota, credits, rate limit,
  billing, capacity, or similar provider limits.

Verification:

- PASS `node --check scripts\agent-fleet-readiness.mjs`.
- PASS `node --check scripts\agent-fleet-supervisor.mjs`.
- PASS `node --test tests\agent-fleet-hardening.test.js` 7/7.
- PASS `npm run agent:fleet:readiness -- --json`.
- PASS `npm run bna:run:validate`, expected 8 done / 2 blocked state.

Evidence:

- `ops/agent-fleet-hardening/2026-07-09T14-47-43-350Z-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/2026-07-09T14-47-43-350Z-agent-fleet-readiness.json`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.json`

Guardrails:

- No Kimi live inference request was sent.
- No second agent fleet was started.
- No deploy, GitHub status comment, credential change, external send,
  payment/access mutation, DNS/account/provider mutation, Drive write,
  production-data mutation, or public publish was performed.

## RUNSTATE-20260709-013 closeout

Implemented:

- Re-ran `npm run one-time:setup:check -- --write-report` and confirmed the
  current report is expected-blocked at 5/8 ready. Ready items are Railway
  target, DB, join domain, hosted Zoom/class link, and Vimeo/Drive.
- Re-ran `npm run one-time:wapi:readiness` and confirmed the class link is
  configured while Whapi/WAPI instance ID, sender phone metadata, auto-reply
  enable flag, and explicit approval flag remain blocked.
- Updated the active execution run blocker records and handoff docs so
  `bna:run:blockers` no longer asks for the solved Zoom/class alias.

Verification:

- EXPECTED BLOCKED `npm run one-time:setup:check -- --write-report`: ready
  5/8; blocked only by Stripe sandbox/price alias, Whapi/WAPI instance/phone,
  and campaign copy/list/suppression/seed approval.
- EXPECTED BLOCKED `npm run one-time:wapi:readiness`: class link configured;
  blocked by Whapi/WAPI instance ID, sender phone metadata,
  `ONE_TIME_WAPI_AUTO_REPLY_ENABLED`, and
  `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM`.
- PASS `npm run bna:run:blockers`: blocker text no longer lists Zoom/class
  alias as missing.
- PASS `npm run bna:run:validate`.

Evidence:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.json`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.json`
- `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/requirements.json`
- `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/NEXT-SESSION.md`

Guardrails:

- Both readiness commands were read-only/expected-blocked.
- No WhatsApp/WAPI send, CRM mutation, provider mutation, payment/access
  mutation, DNS/account mutation, credential change, deploy, raw class-link
  exposure, phone-number exposure, or production-data mutation was performed.

## LIVECHECK-20260709-014 closeout

Implemented:

- Ran a fresh read-only/live-smoke production readiness sweep from clean
  `master`.
- Covered BNA public health, Operations login/session/protected API reads,
  public route privacy, Operations helper planning, OneTime canonical public
  funnel, OneTime single-tenant instance config, Rabbi OneTime landing, and
  OneTime interest dry-run lead capture.
- Covered Rabbi Agent Review proof readiness and current watchdog guardrails
  for actions, security routes, workspace scope, and raw intake drift.

Verification:

- PASS `npm run app:smoke -- --skip-tests`.
- PASS `npm run app:smoke:operations-helper -- https://bneineviimacademy.org`.
- PASS `npm run app:smoke:public-privacy -- https://bneineviimacademy.org`.
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`.
- PASS `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`.
- PASS `npm run app:smoke:one-time-interest-dry-run`.
- PASS `npm run one-time:target:guard -- --json`.
- PASS `npm run app:smoke:rabbi-agent-review-proof-readiness`; status is
  `proof_blocked_or_pending` because both Rabbi Agent Mode prompts are live
  but still have no saved terminal PASS/BLOCKED/FAIL result.
- PASS `npm run watchdog:actions`, 0 findings.
- PASS `npm run watchdog:security`, 0 findings.
- PASS `npm run watchdog:workspace-scope`.
- PASS `npm run watchdog:raw`, 0 findings.

Evidence:

- `ops/live-smokes/2026-07-09T14-56-10-880Z-live-app-smoke.md`
- `ops/live-smokes/2026-07-09T14-56-09-773Z-operations-helper-live-smoke.md`
- `ops/live-smokes/2026-07-09T14-56-24-134Z-public-route-privacy-smoke.md`
- `ops/live-smokes/2026-07-09T14-56-09-792Z-rabbi-onetime-landing-smoke.md`
- `ops/live-smokes/2026-07-09T14-56-09-795Z-one-time-interest-dry-run-live-smoke.md`
- `ops/live-smokes/2026-07-09T14-56-38-372Z-rabbi-agent-review-proof-readiness-live.md`
- `ops/watchdog-audits/2026-07-09T14-56-watchdog-action-audit.md`
- `ops/watchdog-audits/2026-07-09T14-56-watchdog-security-routes.md`
- `ops/watchdog-audits/2026-07-09T14-56-raw-intake-drift.md`

Guardrails:

- No email, WhatsApp/WAPI, Telegram, payment, checkout, charge/refund, access
  grant, Zoom/Drive/Vimeo write, DNS/account/provider mutation, credential
  change, Agent Review result save, production-data mutation, external CRM
  write, or public publish was performed.

## QUEUE-20260709-015 closeout

Implemented:

- Ran a read-only queue hygiene pass before starting any stale historical work.
- Restored the generated low-confidence `ops/queue-audits/latest.json` rewrite
  instead of preserving a huge audit snapshot from the wrong local source.
- Kept the focused task-reconciler report as the durable queue evidence.

Verification:

- PASS `npm run task:reconcile`: dry-run only, live tasks loaded, 30 active
  machine tasks, 0 actions.
- PASS `npm run agent:fleet:status`: supervisor PID `36560`, 0 claimable jobs,
  Kimi fallback configured as `quota_only / kimi-k2.7-code-highspeed`; active
  app-visible/UI and fallback/API lanes were not interrupted.
- PASS process-scoped live-url
  `npm run ops:audit-queue -- --json --no-write`: `warnings: []` and
  `requeue_candidates: []`.
- PASS `git restore -- ops/queue-audits/latest.json`: removed noisy
  low-confidence generated churn from the worktree.

Evidence:

- `ops/system-audits/2026-07-09T15-00-43-713Z-task-queue-reconciler.md`

Guardrails:

- No task/job status mutation, queue apply, Telegram send, external send, DB
  mutation, production-data mutation, deploy, or app code edit was performed.

Remaining:

- Do not blindly process stale old prompts. Start only work that is current,
  unblocked, and mapped to the production-readiness register or a fresh
  operator-approved UI packet.
- Current active UI/Agent Mode work remains owned outside this batch; avoid
  overlapping UI file edits until that lane is clear.

## LAUNCHBLOCK-20260709-016 closeout

Implemented:

- Updated the canonical OneTime operator external setup checklist at
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`
  and `.json` to match the current full setup state.
- Marked Railway target, separate DB reference, join domain, hosted
  Zoom/class link, and Vimeo/Drive setup as ready/not-current human blockers.
- Narrowed the remaining full-launch operator asks to:
  - Rabbi Stripe sandbox/test key status plus `$67/month` product/price alias.
  - Whapi/WAPI instance ID and WhatsApp sender phone metadata.
  - Optional auto-reply enable/approval flags after copy, sender, recipient,
    and class-link behavior are approved.
  - Final campaign copy, recipient segment/list, suppression/unsubscribe proof,
    and seed approval.
- Updated the top-visible operator tasks packet so it no longer asks for
  Zoom/Vimeo/Drive as missing fields.
- Updated the prepared Rabbi WhatsApp setup message so it reflects the current
  WAPI state: OneTime-scoped token and class link configured; instance, phone,
  and approval flags still missing.
- Reconciled the active execution-run handoff files so `npm run
  bna:run:blockers` also names the WAPI auto-reply enable/approval flags
  instead of the vaguer `WAPI details` wording.

Verification:

- PASS JSON parse for the checklist and top-visible task packets.
- EXPECTED BLOCKED `npm run one-time:setup:check`: setup remains 5/8 ready,
  with blockers only for Stripe sandbox/price alias, Whapi/WAPI instance/phone,
  and campaign copy/list/suppression/seed approval.
- EXPECTED BLOCKED `npm run one-time:wapi:readiness`: outbound token and class
  link configured; instance ID, sender phone metadata, auto-reply enable flag,
  and explicit approval flag missing.
- PASS `npm run bna:run:blockers`: blocker output names Stripe sandbox/price
  alias, Whapi/WAPI instance/phone, WAPI auto-reply enable/approval flags if
  auto-reply is intended, and campaign approvals.

Evidence:

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.json`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-rabbi-whatsapp-setup-message.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`
- `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/requirements.json`
- `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/NEXT-SESSION.md`
- `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/STATUS.md`

Guardrails:

- No WhatsApp/WAPI send, campaign send, email send, payment/checkout/charge,
  access grant, CRM mutation, provider mutation, credential change, DNS change,
  deploy, production-data mutation, or app/UI file edit was performed.

Remaining:

- Full OneTime launch remains externally blocked by Stripe sandbox/price alias,
  Whapi/WAPI instance/phone and approval flags, and campaign
  copy/list/suppression/seed approval.

## PROOFSTATE-20260709-017 closeout

Implemented:

- Added tracked latest-report output to
  `scripts/smoke-rabbi-agent-review-proof-readiness-live.mjs`.
- Created `ops/agent-review-proof-readiness/README.md`.
- Generated tracked latest proof summaries:
  - `ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.md`
  - `ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.json`

Verification:

- PASS `node --check scripts\smoke-rabbi-agent-review-proof-readiness-live.mjs`.
- PASS `npm run app:smoke:rabbi-agent-review-proof-readiness`.
- Latest status remains `proof_blocked_or_pending`.
- Public prompt/artifact readbacks passed for both Rabbi Agent Mode prompts.
- Protected Agent Review hub readback passed and shows both prompts as
  `not_started` with no terminal AGR result.

Evidence:

- `ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.md`
- `ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.json`
- Timestamped ignored smoke report:
  `ops/live-smokes/2026-07-09T15-16-50-859Z-rabbi-agent-review-proof-readiness-live.md`

Guardrails:

- No Agent Review result save, Telegram send, email send, WhatsApp/WAPI send,
  payment/checkout/charge, access grant, Drive/Vimeo/Zoom write, DNS change,
  credential change, provider mutation, public publish, production-data
  mutation, app UI edit, or deploy was performed.

Remaining:

- Open `https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`
  in Agent Mode, run only that prompt scope, and save PASS/FAIL/BLOCKED through
  its Operations drop-off URL.
- Open `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md`
  in Agent Mode, run only that prompt scope, and save PASS/FAIL/BLOCKED through
  its Operations drop-off URL.

## READINESS-20260709-018 closeout

Implemented:

- Added `npm run production:readiness:snapshot` as a reusable read-only
  production-readiness control-tower command.
- Created `ops/production-readiness/README.md`.
- Generated tracked latest production-readiness summaries:
  - `ops/production-readiness/latest-production-readiness-snapshot.md`
  - `ops/production-readiness/latest-production-readiness-snapshot.json`
- The latest snapshot consolidates:
  - current git branch/head/origin status;
  - active execution-run status and exact blockers;
  - agent-fleet supervisor, Kimi fallback, and active do-not-collide jobs;
  - ChatGPT dropoff packet queue state;
  - Rabbi Agent Review proof-readiness state and next prompt URLs.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `npm run production:readiness:snapshot`.
- PASS latest tracked JSON parse/readback:
  `status not_production_complete`, `blockers 2`, `next none`,
  `queued 0`, `active_jobs 8`, `proof proof_blocked_or_pending`.
- Pushed implementation commit `993bb095`, then regenerated the snapshot from a
  clean pushed tree. The refreshed latest JSON shows `head 993bb095`,
  `origin 993bb095`, `clean true`, `status not_production_complete`,
  `blockers 2`, `next none`, and `queued 0`.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `ops/production-readiness/README.md`
- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`

Guardrails:

- Read-only/status reporting only.
- No deploy, merge, release, Railway mutation, external send,
  payment/checkout/charge, access grant, CRM write, provider write, DNS change,
  credential change, Agent Review result save, public publish, or
  production-data mutation was performed.

Remaining:

- Production is still not complete because the snapshot now clearly shows the
  remaining external Stripe/WAPI/campaign blockers, two missing Rabbi Agent
  Mode terminal proofs, no next unblocked active-run batch, and a broad UI lane
  already active in another agent job.
- Commit and push the clean-tree evidence refresh.

## READINESS-20260709-019 closeout

Implemented:

- Hardened the production-readiness snapshot semantics so the report identifies
  itself as a sampled control-tower report, not live telemetry.
- Added snapshot freshness metadata to the JSON report:
  `kind`, sampled git head/origin, sampled clean status, refresh command,
  no-write JSON command, and a note explaining why a committed report can trail
  the containing commit hash.
- Added a `Snapshot Freshness` section to the Markdown report.
- Updated `ops/production-readiness/README.md` and `MEMORY.md` to tell local
  agents to rerun the snapshot before acting on launch-critical state.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node scripts/production-readiness-snapshot.mjs --no-write --json`.
- PASS `npm run bna:run:validate`.
- PASS `npm run secrets:audit`.
- Pushed freshness-semantics commit `188684f9`.
- PASS `npm run production:readiness:snapshot` from a clean pushed tree.
- PASS latest tracked JSON readback:
  `head 188684f9`, `origin 188684f9`, `clean true`,
  `freshness sampled_control_tower_report`, `status not_production_complete`,
  `blockers 2`, `next none`, `queued 0`.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `ops/production-readiness/README.md`
- `MEMORY.md`
- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`

Guardrails:

- Reporting/documentation semantics only.
- No app UI edit, deploy, external send, payment/checkout/charge, access grant,
  CRM write, provider write, DNS change, credential change, Agent Review result
  save, public publish, or production-data mutation was performed.

Remaining:

- Commit and push the tracked freshness-enabled snapshot refresh.

## READINESS-20260709-020 closeout

Implemented:

- Added `npm run production:readiness:gate` as the read-only blocking gate for
  production-readiness claims.
- Added `scripts/production-readiness-gate.mjs`.
- Added tests in `tests/production-readiness-gate.test.js`.
- Updated `scripts/production-readiness-snapshot.mjs` so `production_ready`
  and `status` are computed from current blockers/reasons instead of being
  hard-coded false forever.
- Updated `ops/production-readiness/README.md` and `MEMORY.md` so future
  agents know the gate is expected to fail until launch-critical blockers are
  genuinely resolved.

Verification:

- PASS `node --check scripts\production-readiness-gate.mjs`.
- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json`: exit `1`
  while current blockers remain. The gate reported `not_production_complete`,
  external Stripe/WAPI/campaign blockers, two Rabbi Agent Review terminal proof
  blockers, active UI/fallback agent collision lanes, dirty mid-change
  worktree state, and no next unblocked active-run batch.
- PASS `npm run bna:run:validate`.
- PASS `npm run secrets:audit`.
- PASS `git diff --check`.
- Pushed gate implementation commit `d19fc04d`.
- PASS `npm run production:readiness:snapshot` from a clean pushed tree.
- PASS latest tracked JSON readback:
  `head d19fc04d`, `origin d19fc04d`, `clean true`,
  `status not_production_complete`, `ready false`, `blockers 2`, `queued 0`.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json` after the
  latest snapshot refresh: exit `1`, with real blockers plus dirty worktree
  only because the tracked latest snapshot evidence was awaiting commit.
- Pushed tracked latest snapshot evidence commit `60cb5fde`.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json` from a clean
  tree: exit `1`, sampled head/origin `60cb5fde`, clean `true`, no dirty
  worktree blocker, and remaining blockers only for full OneTime external
  setup, Rabbi Agent Review terminal proof, active UI/fallback collision lanes,
  and no next unblocked active-run batch.
- PASS final `npm run chatgpt:dropoff:scan`: queued `0`.
- PASS final `npm run bna:run:blockers`: same 2 external blockers.

Evidence:

- `scripts/production-readiness-gate.mjs`
- `scripts/production-readiness-snapshot.mjs`
- `tests/production-readiness-gate.test.js`
- `ops/production-readiness/README.md`
- `MEMORY.md`

Guardrails:

- Read-only gate/reporting only.
- No app UI edit, deploy, merge, release, external send, payment/access
  mutation, CRM/provider/DNS/credential mutation, Agent Review result save,
  public publish, or production-data mutation was performed.

Remaining:

- The gate should remain blocked until the external OneTime setup blockers,
  terminal Rabbi Agent Mode proofs, active collision lanes, and any queued
  dropoffs are clear.
- Next productive action remains resolving the external setup/proof/UI-lane
  blockers, then rerunning `npm run production:readiness:gate`.

## READINESS-20260709-021 closeout

Implemented:

- Wired the production-readiness gate into `scripts/bna-production-closeout-gate.mjs`.
- `npm run bna:release-gate` now requires the production-readiness gate for
  deploy, live-verify, and final-closeout modes.
- Plain dry-run release checks remain status-only and report
  `production_readiness_gate.status: not_required_for_dry_run`.
- Added `production:readiness:gate` to the release gate's required package
  scripts and next command plan.
- Added regression coverage that approved deploy/live verification remains
  blocked when `production_readiness_gate.ok` is false.
- Updated `MEMORY.md` and `ops/production-readiness/README.md` so future agents
  know release-gate approval cannot bypass production readiness.

Verification:

- PASS `node --check scripts\bna-production-closeout-gate.mjs`.
- PASS `node --check scripts\production-readiness-gate.mjs`.
- PASS `node --test tests\bna-production-closeout-gate.test.js tests\production-readiness-gate.test.js`.
- Pending final verification in this batch: full active-run validation, secret
  audit, expected-blocked live release-gate readback from a clean tree, and
  push.
- PASS `npm run bna:run:validate`.
- PASS `npm run secrets:audit`.
- Pushed release-gate integration commit `e46fe795`.
- EXPECTED BLOCKED `npm run bna:release-gate -- --deploy
  --confirm-deploy DEPLOY_BNA_PRODUCTION_CLOSEOUT --json` from a clean tree:
  exit `2`, `production_mutation_performed false`, `deploy_performed false`,
  `head_pushed true`, dirty files `0`, and blockers include
  `Production readiness gate blocked`.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json`: exit `1`
  with the same current production blockers.
- PASS final `npm run chatgpt:dropoff:scan`: queued `0`.

Evidence:

- `scripts/bna-production-closeout-gate.mjs`
- `tests/bna-production-closeout-gate.test.js`
- `ops/production-readiness/README.md`
- `MEMORY.md`

Guardrails:

- Release gate/reporting hardening only.
- No deploy, merge, release, app UI edit, external send, payment/access
  mutation, CRM/provider/DNS/credential mutation, Agent Review result save,
  public publish, or production-data mutation was performed.

Remaining:

- Commit and push this release-gate integration, then run a clean-tree
  release-gate readback to prove production readiness cannot be bypassed.
- Next productive action remains clearing the external setup/proof/UI-lane
  blockers and rerunning both `production:readiness:gate` and
  `bna:release-gate`.

## READINESS-20260709-022 closeout

Implemented:

- Added `PRODUCTION_READINESS_GATE_COMMAND` to
  `scripts/agent-fleet-supervisor.mjs`.
- Agent fleet auto-deploy now runs
  `npm run production:readiness:gate -- --json` before the configured deploy
  command when deployable files are present and `AGENT_FLEET_AUTO_DEPLOY` is
  enabled.
- If the readiness gate is blocked, the fleet marks the deployment gate failed
  with `production_readiness_gate_blocked` and does not run the deploy command.
- Fleet run JSON and Markdown summaries now surface production-readiness
  preflight status and blocker counts.
- `npm run agent:fleet:readiness` now includes a tracked Production Deploy
  Preflight section proving the supervisor enforces this guard.
- `.env.example` and `MEMORY.md` now state that auto-deploy cannot bypass the
  production-readiness gate.

Verification:

- PASS `node --check scripts\agent-fleet-supervisor.mjs`.
- PASS `node --check scripts\agent-fleet-readiness.mjs`.
- PASS `node --test tests\agent-fleet-hardening.test.js`.
- PASS `npm run agent:fleet:readiness -- --json`; latest report OK true,
  `production_deploy_preflight.enforced_before_auto_deploy true`,
  `live_gate_run_performed false`, and `deploy_performed false`.
- PASS pushed-head refresh of `npm run agent:fleet:readiness -- --json`;
  latest proof previews worktree commit `84dc3b8f5ce5`.

Evidence:

- `scripts/agent-fleet-supervisor.mjs`
- `scripts/agent-fleet-readiness.mjs`
- `tests/agent-fleet-hardening.test.js`
- `.env.example`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.json`
- `ops/agent-fleet-hardening/2026-07-09T15-49-58-531Z-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/2026-07-09T15-49-58-531Z-agent-fleet-readiness.json`
- `ops/agent-fleet-hardening/2026-07-09T15-52-00-037Z-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/2026-07-09T15-52-00-037Z-agent-fleet-readiness.json`

Guardrails:

- Agent-fleet/release guard hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked until external OneTime setup values, terminal
  Rabbi Agent Mode proofs, active collision lanes, and any queued dropoffs are
  clear.
- The fleet can still run local code/test work, but deployable app-visible work
  cannot be auto-deployed by the fleet until `production:readiness:gate`
  passes.

## READINESS-20260709-023 closeout

Implemented:

- Extended `scripts/production-readiness-snapshot.mjs` so
  `agent_fleet_readiness.production_deploy_preflight` is copied from
  `ops/agent-fleet-hardening/latest-agent-fleet-readiness.json`.
- The Markdown snapshot now renders:
  `Auto-deploy readiness preflight`, `Auto-deploy preflight command`,
  `Auto-deploy blocked reason`, and
  `Auto-deploy performed by readiness proof`.
- Added static regression coverage in `tests/production-readiness-gate.test.js`.
- Updated `ops/production-readiness/README.md` so future agents know the
  control-tower snapshot includes this fleet deploy-preflight proof.
- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.*`
  during implementation; final clean-tree refresh is still required after
  commit/push so the sampled head is the pushed evidence commit.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- PASS `npm run production:readiness:snapshot` generated the new fields.
- Readback confirmed snapshot status `not_production_complete`, external
  blockers `2`, ChatGPT queued packets `0`, active collision lanes `2`,
  `production_deploy_preflight.ok true`,
  `enforced_before_auto_deploy true`, and `deploy_performed false`.
- Pushed implementation commit `7297ebbc`, then regenerated the tracked
  snapshot from a clean pushed tree. Final readback sampled head/origin
  `7297ebbc`, clean `true`, external blockers `2`, queued packets `0`,
  collision lanes `2`, preflight enforced `true`, and deploy performed `false`.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `tests/production-readiness-gate.test.js`
- `ops/production-readiness/README.md`
- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`

Guardrails:

- Control-tower/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked until external OneTime setup values, terminal
  Rabbi Agent Mode proofs, active collision lanes, and any queued dropoffs are
  clear.

## READINESS-20260709-024 closeout

Implemented:

- Added `scripts/production-unblocker.mjs`.
- Added `npm run production:unblocker`.
- Generated:
  - `ops/production-readiness/latest-production-unblocker.md`
  - `ops/production-readiness/latest-production-unblocker.json`
- The unblocker reads the latest production snapshot, OneTime operator setup
  checklist, and Rabbi Agent Review proof-readiness report.
- It consolidates:
  - `SETUP-ONETIME-STRIPE-001`
  - `SETUP-ONETIME-WHAPI-001`
  - `SETUP-ONETIME-CAMPAIGN-001`
  - `rabbi-telegram-helper-ticket-smoke`
  - `rabbi-helper-tool-scope-map`
  - active collision lanes to avoid
  - exact after-update verification commands.

Verification:

- PASS `node --check scripts\production-unblocker.mjs`.
- PASS `node --test tests\production-unblocker.test.js`.
- PASS `npm run production:unblocker`.
- Readback confirmed snapshot status `not_production_complete`, external
  setup items `3`, Agent Mode proof items `2`, active collision lanes `2`,
  ChatGPT queued packets `0`, setup IDs
  `SETUP-ONETIME-STRIPE-001, SETUP-ONETIME-WHAPI-001,
  SETUP-ONETIME-CAMPAIGN-001`, proof IDs
  `rabbi-telegram-helper-ticket-smoke, rabbi-helper-tool-scope-map`, and next
  unblocked executable batch `none`.

Evidence:

- `scripts/production-unblocker.mjs`
- `tests/production-unblocker.test.js`
- `package.json`
- `ops/production-readiness/README.md`
- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only unblocker/reporting only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked until the generated unblocker items are satisfied
  and re-verified through the listed commands.

## READINESS-20260709-025 closeout

Implemented:

- Added `operator_unblocker` metadata to
  `scripts/production-readiness-gate.mjs`.
- Blocked production-readiness gate JSON now includes:
  - `operator_unblocker.markdown_path`
  - `operator_unblocker.json_path`
  - `operator_unblocker.refresh_command`
  - a `production_readiness_gate` next action to run/read the unblocker.
- Updated `ops/production-readiness/README.md` to make the blocked-gate ->
  unblocker flow explicit.
- Added regression coverage in `tests/production-readiness-gate.test.js`.

Verification:

- PASS `node --check scripts\production-readiness-gate.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json` while this
  batch was dirty; output included `operator_unblocker.markdown_path:
  ops/production-readiness/latest-production-unblocker.md`,
  `operator_unblocker.refresh_command: npm run production:unblocker`, and a
  next action sourced from `production_readiness_gate`.

Evidence:

- `scripts/production-readiness-gate.mjs`
- `tests/production-readiness-gate.test.js`
- `ops/production-readiness/README.md`

Guardrails:

- Gate/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, rerun the gate from a clean tree to confirm the same
  unblocker pointer appears without a dirty-worktree blocker.

## READINESS-20260709-026 closeout

Implemented:

- Updated `scripts/bna-production-closeout-gate.mjs` so the production
  readiness summary preserves:
  - `operator_unblocker`
  - `next_actions`
- Extended `tests/bna-production-closeout-gate.test.js` to prove blocked
  deploy/live closeout keeps the unblocker metadata and
  `production:unblocker` next action.

Verification:

- PASS `node --check scripts\bna-production-closeout-gate.mjs`.
- PASS `node --test tests\bna-production-closeout-gate.test.js
  tests\production-readiness-gate.test.js`.
- EXPECTED BLOCKED `npm run bna:release-gate -- --deploy --confirm-deploy
  DEPLOY_BNA_PRODUCTION_CLOSEOUT --json`; output kept
  `deploy_performed false`, `production_mutation_performed false`,
  `production_readiness_gate.operator_unblocker.markdown_path:
  ops/production-readiness/latest-production-unblocker.md`, and
  `production_readiness_gate.operator_unblocker.refresh_command:
  npm run production:unblocker`.

Evidence:

- `scripts/bna-production-closeout-gate.mjs`
- `tests/bna-production-closeout-gate.test.js`

Guardrails:

- Release-gate/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, rerun deploy-mode release gate from a clean tree and
  confirm the same unblocker pointer appears with dirty `0`.

## READINESS-20260709-027 closeout

Implemented:

- Updated `scripts/production-unblocker.mjs` so `npm run
  production:unblocker` samples a fresh read-only production snapshot by
  default via `node scripts/production-readiness-snapshot.mjs --no-write
  --json`.
- Kept an explicit `--from-snapshot-file` / `--use-latest-snapshot` fallback
  for intentional committed-file reads.
- Added source snapshot metadata to the unblocker JSON/Markdown: source
  command/path, source kind, source snapshot generated time, sampled git
  head/origin, sampled worktree cleanliness, and fallback warning text if live
  no-write sampling cannot be parsed.
- Updated `ops/production-readiness/README.md` to document the fresh default
  and file-snapshot fallback.
- Added regression coverage for argument parsing, command-output JSON parsing,
  source snapshot metadata, and the fresh no-write snapshot command wiring.

Verification:

- PASS `node --check scripts\production-unblocker.mjs`.
- PASS `node --test tests\production-unblocker.test.js`.
- PASS `npm run production:unblocker -- --no-write --json`; readback used
  `snapshot_source_kind: live_no_write_command`, source command `node
  scripts/production-readiness-snapshot.mjs --no-write --json`, sampled
  head/origin `60f1e599`, `not_production_complete`, 3 external setup items, 2
  Agent Mode proof items, 2 active collision lanes, 0 queued ChatGPT packets,
  and no unblocked executable batch. Worktree cleanliness was correctly
  `false` during the edit.

Evidence:

- `scripts/production-unblocker.mjs`
- `tests/production-unblocker.test.js`
- `ops/production-readiness/README.md`

Guardrails:

- Unblocker/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate `npm run production:unblocker` from a clean
  pushed tree and commit the refreshed tracked latest unblocker artifact.

## READINESS-20260709-028 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.
- The tracked packet now shows it came from source snapshot command `node
  scripts/production-readiness-snapshot.mjs --no-write --json`.

Verification:

- PASS `npm run production:unblocker` from clean pushed head `c020293b`.
- Readback from `ops/production-readiness/latest-production-unblocker.json`:
  - `snapshot_source_kind: live_no_write_command`
  - `snapshot_git_head: c020293b`
  - `snapshot_origin_master: c020293b`
  - `snapshot_worktree_clean: true`
  - `snapshot_status: not_production_complete`
  - 3 external setup items
  - 2 Agent Mode proof items
  - 2 active collision lanes
  - 0 queued ChatGPT packets
  - next unblocked executable batch `none`

Evidence:

- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked by the explicit external setup buckets, terminal
  Agent Mode proof saves, active UI/API collision lanes, and no unblocked
  execution batch.

## READINESS-20260709-029 closeout

Implemented:

- Updated `scripts/production-readiness-snapshot.mjs` so active Agent Review
  repair jobs matching `Agent Mode result`, `Agent Review`, or `AGR-` are
  promoted into `assessment.avoid_colliding_with`.
- Added a production-readiness reason when an Agent Review repair lane is
  active.
- Added a next action warning future agents not to overlap Agent Review
  proof/result repair until the active repair job is inspected.
- Added static regression coverage in `tests/production-readiness-gate.test.js`.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- PASS `node scripts/production-readiness-snapshot.mjs --no-write --json`
  readback while dirty; `assessment.avoid_colliding_with` now included:
  - job `382` / task `1859` running app-wide BNA brand shell/UI polish
  - job `427` / task `2185` running fallback/API lane
  - job `344` / task `1736` running Agent Review result repair
  and next actions included the new Agent Review no-overlap warning.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `tests/production-readiness-gate.test.js`

Guardrails:

- Control-tower/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate the tracked production readiness snapshot and
  production unblocker from a clean pushed tree so GitHub-visible artifacts
  show the third Agent Review collision lane.

## READINESS-20260709-030 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.md`.
- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.json`.
- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.

Verification:

- PASS `npm run production:readiness:snapshot` from clean pushed head
  `0b5cdd3e`; snapshot readback showed head/origin `0b5cdd3e`, worktree clean
  `true`, `not_production_complete`, 2 external active-run blockers, 0 queued
  ChatGPT packets, and 3 collision lanes:
  - job `382` / task `1859` running app-wide UI polish
  - job `427` / task `2185` running fallback/API lane
  - job `344` / task `1736` running Agent Review result repair
- PASS `npm run production:unblocker`; unblocker readback showed
  `snapshot_source_kind: live_no_write_command`, 3 external setup items, 2
  Agent Mode proof items, 3 active collision lanes, 0 queued ChatGPT packets,
  and no unblocked executable batch.
- Note: the unblocker source sample marked `snapshot_worktree_clean: false`
  because the snapshot artifact had just been regenerated and was dirty before
  the unblocker sampled the live no-write snapshot. A final clean-source
  unblocker refresh follows after this artifact commit.

Evidence:

- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`
- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate `npm run production:unblocker` one more time
  from the clean artifact head so the operator unblocker source sample also
  records `snapshot_worktree_clean: true`.

## READINESS-20260709-031 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.

Verification:

- PASS `npm run production:unblocker` from clean pushed head `08a8d61e`.
- Readback from `ops/production-readiness/latest-production-unblocker.json`:
  - `snapshot_source_kind: live_no_write_command`
  - `snapshot_git_head: 08a8d61e`
  - `snapshot_origin_master: 08a8d61e`
  - `snapshot_worktree_clean: true`
  - `snapshot_status: not_production_complete`
  - 3 external setup items
  - 2 Agent Mode proof items
  - 3 active collision lanes:
    - job `382` / task `1859` running app-wide UI polish
    - job `427` / task `2185` running fallback/API lane
    - job `344` / task `1736` running Agent Review result repair
  - 0 queued ChatGPT packets
  - next unblocked executable batch `none`

Evidence:

- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked by explicit external setup, missing terminal Agent
  Mode proof, active UI/API/Agent Review collision lanes, and no unblocked
  executable batch.

## READINESS-20260709-032 closeout

Implemented:

- Updated `scripts/production-readiness-snapshot.mjs` Markdown rendering:
  - `Launch Collision Lanes` now comes from
    `assessment.avoid_colliding_with`.
  - `Other Agent Policy Rows` now contains queued, failed, and non-collision
    policy rows.
- Added helpers for stable fleet-job labels/keys so rows are not duplicated.
- Added regression coverage in `tests/production-readiness-gate.test.js`.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- PASS `node scripts/production-readiness-snapshot.mjs --no-write --json`
  readback while dirty; it still reported collision jobs `382`, `427`, and
  `344`, with 8 total policy rows.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `tests/production-readiness-gate.test.js`

Guardrails:

- Control-tower/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate the tracked production readiness snapshot from
  a clean pushed tree so GitHub-visible Markdown shows the separated collision
  and policy-row sections.

## READINESS-20260709-033 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.md`.
- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.json`.

Verification:

- PASS `npm run production:readiness:snapshot` from clean pushed head
  `f3d10f8b`.
- Markdown readback confirmed:
  - `Launch Collision Lanes` contains running jobs `382`, `427`, and `344`.
  - `Other Agent Policy Rows` contains queued job `426` and failed jobs `408`,
    `409`, `410`, and `377`.
- JSON readback confirmed head/origin `f3d10f8b`, worktree clean `true`,
  `not_production_complete`, 3 launch collision lanes, 8 total fleet policy
  rows, and 0 queued ChatGPT packets.

Evidence:

- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, refresh `npm run production:unblocker` from a clean tree
  so the operator packet samples the newest snapshot logic and head.

## READINESS-20260709-034 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.

Verification:

- PASS `npm run production:unblocker` from clean pushed head `e5524567`.
- Readback from `ops/production-readiness/latest-production-unblocker.json`:
  - `snapshot_source_kind: live_no_write_command`
  - `snapshot_git_head: e5524567`
  - `snapshot_origin_master: e5524567`
  - `snapshot_worktree_clean: true`
  - `snapshot_status: not_production_complete`
  - 3 external setup items
  - 2 Agent Mode proof items
  - 3 active collision lanes
  - 0 queued ChatGPT packets
  - next unblocked executable batch `none`

Evidence:

- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked by explicit external setup, missing terminal Agent
  Mode proof, active UI/API/Agent Review collision lanes, and no unblocked
  executable batch.

## READINESS-20260709-035 closeout

Implemented:

- Added `blocker_groups` to `scripts/production-readiness-gate.mjs`.
- Groups include category ID, title, owner, severity, count, evidence, and
  next action.
- Kept the existing `blockers` array intact for compatibility.
- Added `snapshot_summary.blocker_group_count`.
- Updated text output to print group summaries before the detailed blocker
  list.
- Updated `scripts/bna-production-closeout-gate.mjs` so deploy/live/final
  closeout summaries preserve `production_readiness_gate.blocker_groups`.
- Added regression coverage in:
  - `tests/production-readiness-gate.test.js`
  - `tests/bna-production-closeout-gate.test.js`

Verification:

- PASS `node --check scripts\production-readiness-gate.mjs`.
- PASS `node --check scripts\bna-production-closeout-gate.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js
  tests\bna-production-closeout-gate.test.js`.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json` while dirty;
  readback preserved 15 detailed blockers and 6 grouped categories:
  `snapshot_not_production_ready`, `dirty_worktree`,
  `no_unblocked_executable_batch`, `external_setup_blockers`,
  `agent_mode_terminal_proof_missing`, and `active_agent_collision_lanes`.
- EXPECTED BLOCKED `npm run bna:release-gate -- --deploy --confirm-deploy
  DEPLOY_BNA_PRODUCTION_CLOSEOUT --json` while dirty; readback preserved the
  same grouped categories under `production_readiness_gate.blocker_groups`,
  with `deploy_performed: false` and `production_mutation_performed: false`.

Evidence:

- `scripts/production-readiness-gate.mjs`
- `scripts/bna-production-closeout-gate.mjs`
- `tests/production-readiness-gate.test.js`
- `tests/bna-production-closeout-gate.test.js`

Guardrails:

- Gate/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, rerun readiness and deploy gates from a clean pushed tree
  to confirm grouped blocker output without the temporary dirty-worktree group.

## READINESS-20260709-036 closeout

Implemented:

- No code changes beyond clean-head readback and evidence recording.

Verification:

- PASS clean git readback: head/origin `868e5a8b`, worktree clean.
- EXPECTED BLOCKED `npm run production:readiness:gate -- --json` from clean
  head; readback showed:
  - 14 detailed blockers
  - 5 blocker groups:
    - `snapshot_not_production_ready` count `6`
    - `no_unblocked_executable_batch` count `1`
    - `external_setup_blockers` count `2`
    - `agent_mode_terminal_proof_missing` count `2`
    - `active_agent_collision_lanes` count `3`
  - sampled head/origin `868e5a8b`
  - sampled worktree clean `true`
- EXPECTED BLOCKED `npm run bna:release-gate -- --deploy --confirm-deploy
  DEPLOY_BNA_PRODUCTION_CLOSEOUT --json`; readback preserved the same 5
  `production_readiness_gate.blocker_groups`, with `deploy_performed: false`,
  `production_mutation_performed: false`, and `head_pushed: true`.
- PASS `npm run production:unblocker -- --no-write --json`; readback showed
  clean head `868e5a8b`, 3 external setup items, 2 Agent Mode proof items, 3
  collision lanes, 0 queued ChatGPT packets, and no unblocked executable batch.
- PASS `npm run bna:run:next`; validation passed and next unblocked
  executable batch remained `none`.

Evidence:

- clean command readbacks in this closeout
- `scripts/production-readiness-gate.mjs`
- `scripts/bna-production-closeout-gate.mjs`
- `tests/production-readiness-gate.test.js`
- `tests/bna-production-closeout-gate.test.js`

Guardrails:

- Clean readback/evidence only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked by external setup, missing terminal Agent Mode
  proof, active UI/API/Agent Review collision lanes, and no unblocked
  executable batch.

## READINESS-20260709-037 closeout

Implemented:

- Added `blocker_groups` to `scripts/production-unblocker.mjs`.
- Added `summary.blocker_group_count`.
- Added an `Owner Action Summary` section to the Markdown packet before the
  detailed setup/proof/lane sections.
- Kept all existing detailed sections intact:
  - External Setup To Provide
  - Agent Mode Proof To Save
  - Active Lanes To Avoid
  - After Operator Update
  - Guardrails
- Added regression coverage in `tests/production-unblocker.test.js`.

Verification:

- PASS `node --check scripts\production-unblocker.mjs`.
- PASS `node --test tests\production-unblocker.test.js`.
- PASS `npm run production:unblocker -- --no-write --json` while dirty;
  readback showed:
  - status `not_production_complete`
  - source head `31b4a052`
  - 3 external setup items
  - 2 Agent Mode proof items
  - 3 active collision lanes
  - 0 queued ChatGPT packets
  - no unblocked executable batch
  - 4 blocker groups: `no_unblocked_executable_batch`,
    `external_setup_blockers`, `agent_mode_terminal_proof_missing`, and
    `active_agent_collision_lanes`

Evidence:

- `scripts/production-unblocker.mjs`
- `tests/production-unblocker.test.js`

Guardrails:

- Unblocker/reporting hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate the tracked production unblocker from a clean
  pushed tree so GitHub-visible artifacts include the new owner-action summary.

## READINESS-20260709-038 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.

Verification:

- PASS `npm run production:unblocker` from clean pushed head `c5ffc1a5`.
- Readback from `ops/production-readiness/latest-production-unblocker.json`:
  - `snapshot_git_head: c5ffc1a5`
  - `snapshot_origin_master: c5ffc1a5`
  - `snapshot_worktree_clean: true`
  - `snapshot_status: not_production_complete`
  - `summary.blocker_group_count: 4`
  - `external_setup_item_count: 3`
  - `agent_mode_proof_count: 2`
  - `active_collision_lane_count: 3`
  - `chatgpt_queued_count: 0`
  - `next_unblocked_executable_batch: none`
- Markdown readback confirmed `Owner Action Summary` with:
  - `no_unblocked_executable_batch`
  - `external_setup_blockers`
  - `agent_mode_terminal_proof_missing`
  - `active_agent_collision_lanes`

Evidence:

- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked by external setup, missing terminal Agent Mode
  proof, active UI/API/Agent Review collision lanes, and no unblocked
  executable batch.

## READINESS-20260709-039 closeout

Implemented:

- Added `one_time_setup` summary output to
  `scripts/production-readiness-snapshot.mjs`.
- Added a `OneTime Setup Buckets` section to the production readiness snapshot
  Markdown.
- Updated `scripts/production-readiness-gate.mjs` so the
  `external_setup_blockers` group uses concrete OneTime setup bucket IDs when
  available, while keeping the detailed execution-run blocker messages.
- Added regression coverage in `tests/production-readiness-gate.test.js`.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node --check scripts\production-readiness-gate.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- PASS `node scripts\production-readiness-snapshot.mjs --no-write --json`
  while dirty; readback showed `one_time_setup.operator_blocker_count: 3` and
  setup IDs `SETUP-ONETIME-STRIPE-001`, `SETUP-ONETIME-WHAPI-001`, and
  `SETUP-ONETIME-CAMPAIGN-001`.
- EXPECTED BLOCKED `node scripts\production-readiness-gate.mjs --json` while
  dirty; readback showed `external_setup_blockers` count `3` with the three
  setup IDs above, plus the expected temporary `dirty_worktree` group.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `scripts/production-readiness-gate.mjs`
- `tests/production-readiness-gate.test.js`

Guardrails:

- Readiness reporting/gate hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate the tracked production readiness snapshot from
  a clean pushed tree so GitHub-visible artifacts include the OneTime setup
  bucket summary.

## READINESS-20260709-040 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.md`.
- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.json`.

Verification:

- PASS `npm run production:readiness:snapshot` from clean pushed head
  `60f4592d`.
- JSON readback showed:
  - `sampled_git_head: 60f4592d`
  - `sampled_origin_master: 60f4592d`
  - `sampled_worktree_clean: true`
  - status `not_production_complete`
  - 2 active-run blockers
  - 3 concrete OneTime setup buckets:
    `SETUP-ONETIME-STRIPE-001`, `SETUP-ONETIME-WHAPI-001`, and
    `SETUP-ONETIME-CAMPAIGN-001`
  - 3 active collision lanes
  - 0 queued ChatGPT packets
- Markdown readback confirmed `OneTime Setup Buckets`,
  `Operator blocker count: 3`, and all three setup bucket IDs.
- EXPECTED BLOCKED `node scripts\production-readiness-gate.mjs --json` while
  only snapshot artifacts were dirty; readback preserved
  `external_setup_blockers` count `3` with the three setup bucket IDs plus the
  temporary `dirty_worktree` group.

Evidence:

- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, rerun the readiness gate from a clean pushed tree to
  confirm the temporary dirty-worktree group is gone and the external setup
  blocker group remains bucket-based.

## READINESS-20260709-041 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.

Verification:

- PASS `npm run production:unblocker` from clean pushed head `01eb2537`.
- JSON readback showed:
  - `snapshot_git_head: 01eb2537`
  - `snapshot_origin_master: 01eb2537`
  - `snapshot_worktree_clean: true`
  - status `not_production_complete`
  - 4 blocker groups
  - 3 external setup buckets:
    `SETUP-ONETIME-STRIPE-001`, `SETUP-ONETIME-WHAPI-001`, and
    `SETUP-ONETIME-CAMPAIGN-001`
  - 2 Agent Mode proof blockers
  - 3 active collision lanes
  - 0 queued ChatGPT packets
  - no unblocked executable batch
- Markdown readback confirmed the `Owner Action Summary` still lists the four
  blocker groups with the three concrete setup bucket IDs.

Evidence:

- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, run final clean-head gate, unblocker, execution-run, and
  fleet readbacks.

## READINESS-20260709-042 closeout

Implemented:

- Updated `scripts/production-readiness-snapshot.mjs`:
  - `parseFleetStatus` now stops summary key parsing once the active-policy
    job section begins.
  - active policy job rows are parsed only into `active_policy_jobs`, even
    when job titles contain colons.
  - the script now uses the same direct-execution guard pattern as other
    importable ESM scripts, so tests can import parser helpers without running
    the CLI.
- Added regression coverage in `tests/production-readiness-gate.test.js`.

Verification:

- PASS `node --check scripts\production-readiness-snapshot.mjs`.
- PASS `node --test tests\production-readiness-gate.test.js`.
- PASS `node scripts\production-readiness-snapshot.mjs --no-write --json`
  while dirty; readback kept failed job `#408` with colon title under
  `agent_fleet.active_policy_jobs` and no longer wrote a
  `job_408_task_2025_failed_fix_one_time_provider_ui_consistency` summary key.
- PASS direct import readback of `parseFleetStatus` with a colon-title failed
  job; summary contained `supervisor` only and the job stayed in
  `active_policy_jobs`.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `tests/production-readiness-gate.test.js`

Guardrails:

- Readiness reporting/parser hardening only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, regenerate the tracked production readiness snapshot from
  a clean pushed tree so GitHub-visible artifacts no longer include bogus
  summary keys from colon-title active policy jobs.

## READINESS-20260709-043 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.md`.
- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.json`.

Verification:

- PASS `npm run production:readiness:snapshot` from clean pushed head
  `ece52fe4`.
- JSON readback showed:
  - `sampled_git_head: ece52fe4`
  - `sampled_origin_master: ece52fe4`
  - `sampled_worktree_clean: true`
  - status `not_production_complete`
  - 3 concrete OneTime setup buckets
  - 8 active policy jobs
  - no `job_408...` key in `agent_fleet.summary`
  - 3 launch collision lanes
  - 0 queued ChatGPT packets
- Markdown readback confirmed `Other Agent Policy Rows` still includes failed
  job `#408` with its colon-title text, now as a row rather than a summary
  field.

Evidence:

- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- After commit/push, run final clean-head gate, unblocker, execution-run, and
  fleet readbacks.

## READINESS-20260709-044 closeout

Supersession note:

- This was the correct no-send state at the time of commit `50a2cfa0`.
- It is superseded for current launch decisions by
  `READINESS-20260709-046`, because a later lane performed the approved
  WhatsApp instruction send and no-send Rabbi runtime readiness now reports
  local ready.

Implemented:

- Inspected contact-private local intake `RAW-20260709-012` without committing
  the raw file.
- Registered a redacted requirement in
  `tasks-pending/2026-07-08-rabbi-telegram-ticket-agent-loop.md`:
  `REQ-20260709-069`.
- Updated `DEC-20260708-021` to name the preferred Telegram-start path and the
  blocked WhatsApp-instruction alternate path.

Verification:

- PASS `npm run telegram:rabbi:readiness`; no external write performed, Rabbi
  bot token and OneTime Operations credentials are configured, and
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` remains missing.
- PASS `npm run telegram:rabbi:chat-id`; no Telegram message sent, no token
  printed, bot resolves as `onetimeaios_bot`, and candidate count is `0`.
- EXPECTED BLOCKED `npm run one-time:wapi:readiness`; no WhatsApp sent, no CRM
  mutation, OneTime-scoped token is configured, but WAPI instance ID, sender
  phone metadata, auto-reply enable flag, and explicit approval flag remain
  missing.

Evidence:

- `tasks-pending/2026-07-08-rabbi-telegram-ticket-agent-loop.md`
- `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`

Guardrails:

- The contact-private raw file was not staged or committed.
- No WhatsApp/WAPI message, Telegram message, external send, CRM mutation,
  payment/access mutation, provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Use `READINESS-20260709-046` for current state.

## READINESS-20260709-045 closeout

Implemented:

- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.md`.
- Regenerated `ops/production-readiness/latest-production-readiness-snapshot.json`.
- Regenerated `ops/production-readiness/latest-production-unblocker.md`.
- Regenerated `ops/production-readiness/latest-production-unblocker.json`.

Verification:

- PASS `npm run production:readiness:snapshot` from clean pushed head
  `50a2cfa0`.
- PASS `npm run production:unblocker` from clean pushed head `50a2cfa0`.
- Snapshot JSON readback showed:
  - `sampled_git_head: 50a2cfa0`
  - `sampled_origin_master: 50a2cfa0`
  - `sampled_worktree_clean: true`
  - status `not_production_complete`
  - 3 concrete OneTime setup buckets
  - 0 queued ChatGPT packets
  - no bogus `job_*` summary keys
- Unblocker JSON readback showed:
  - `snapshot_git_head: 50a2cfa0`
  - `snapshot_origin_master: 50a2cfa0`
  - `snapshot_worktree_clean: true`
  - 3 external setup buckets
  - 2 Agent Mode proof blockers
  - 3 active collision lanes
  - 0 queued ChatGPT packets
  - no unblocked executable batch

Evidence:

- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-readiness-snapshot.json`
- `ops/production-readiness/latest-production-unblocker.md`
- `ops/production-readiness/latest-production-unblocker.json`

Guardrails:

- Read-only artifact refresh only.
- No app UI edit, API feature edit, deploy, merge, release, external send,
  payment/access mutation, CRM/provider/DNS/credential mutation, Agent Review
  result save, Kimi live inference, public publish, or production-data mutation
  was performed.

Remaining:

- Production remains blocked by external setup, missing terminal Agent Mode
  proof, active UI/API/Agent Review collision lanes, and no unblocked
  executable batch.

## READINESS-20260709-046 closeout

Implemented:

- Added redacted `rabbi_telegram_runtime` summary output to
  `scripts/production-readiness-snapshot.mjs`.
- Updated `scripts/production-readiness-gate.mjs` so Rabbi runtime is a
  blocker only when it is not locally ready.
- Updated `scripts/production-unblocker.mjs` so the operator packet shows the
  Rabbi runtime state and only creates an operator action when configuration is
  still needed.
- Reconciled `REQ-20260709-069` in
  `tasks-pending/2026-07-08-rabbi-telegram-ticket-agent-loop.md`.
- Updated redacted evidence in memory/raw/access records for
  `RAW-20260709-012`.

Verification:

- PASS `node --check scripts/production-readiness-snapshot.mjs`.
- PASS `node --check scripts/production-readiness-gate.mjs`.
- PASS `node --check scripts/production-unblocker.mjs`.
- PASS `node --test tests/production-readiness-gate.test.js tests/production-unblocker.test.js`.
- PASS `npm run telegram:rabbi:readiness`; no external write performed,
  Rabbi runtime status `ready`, token/chat ID/OneTime Operations credentials
  configured.
- PASS `npm run telegram:rabbi:chat-id`; no Telegram message sent, no token
  printed, bot resolves as `onetimeaios_bot`, `candidate_count=4`,
  `unique_chat_count=1`, masked candidate `******4810`.
- PASS no-write production snapshot privacy readback: `raw_chat_id_leaked:
  false`, `rabbi_runtime_status: local_runtime_ready`,
  `chat_id_configured: true`, `candidate_count: 4`.
- EXPECTED BLOCKED `node scripts/production-readiness-gate.mjs --allow-dirty
  --json`: no Rabbi runtime blocker; still blocked by external setup, two
  Agent Mode proof blockers, three active collision lanes, and no executable
  batch.
- PASS `node scripts/production-unblocker.mjs --no-write --json`: no Rabbi
  runtime operator-action blocker; summary shows
  `rabbi_telegram_runtime_status: local_runtime_ready`.

Evidence:

- `scripts/production-readiness-snapshot.mjs`
- `scripts/production-readiness-gate.mjs`
- `scripts/production-unblocker.mjs`
- `tests/production-readiness-gate.test.js`
- `tests/production-unblocker.test.js`
- `tasks-pending/2026-07-08-rabbi-telegram-ticket-agent-loop.md`
- `raw-input/RAW-20260709-012-rabbi-telegram-bot-whatsapp-instructions.md`
- `ops/access/2026-07-09-rabbi-telegram-bot-whatsapp-instructions.md`
- `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md`

Guardrails:

- No live Telegram message or live Telegram smoke was performed.
- No additional WhatsApp/WAPI message was sent by this reconciliation.
- No raw chat ID, token, full phone number, private message body, payment data,
  or access link was committed.
- No app UI edit, API feature edit, deploy, merge, release, payment/access
  mutation, CRM/provider/DNS/credential mutation, Agent Review result save,
  Kimi live inference, public publish, or production-data mutation was
  performed.

Remaining:

- Live Rabbi Telegram delivery/smoke remains gated until release gates are
  otherwise clear and exact live-send scope is approved.
- Production remains blocked by external Stripe/WAPI/campaign setup, missing
  terminal Agent Mode proof, active UI/API/Agent Review collision lanes, and no
  unblocked executable batch.

## READINESS-20260709-047 closeout

Implemented:

- Changed `scripts/production-readiness-snapshot.mjs` so configured local
  Rabbi Telegram runtime reports `local_runtime_ready_live_smoke_pending`
  instead of production-ready.
- Changed `scripts/production-readiness-gate.mjs` and
  `scripts/production-unblocker.mjs` so Rabbi Telegram is non-blocking only
  after `live_smoke_verified` / `production_verified`.
- Updated focused readiness/unblocker tests for the stricter status.
- Regenerated the production readiness snapshot and unblocker artifacts from
  the main workspace so active fleet collision lanes remain visible.

Verification:

- PASS `node --check scripts/production-readiness-snapshot.mjs`
- PASS `node --check scripts/production-readiness-gate.mjs`
- PASS `node --check scripts/production-unblocker.mjs`
- PASS `node --check scripts/kimi-chat.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --test tests/production-readiness-gate.test.js tests/production-unblocker.test.js tests/rabbi-telegram-chat-id-readback.test.js`
- PASS `npm run telegram:rabbi:readiness`; no external write, Rabbi runtime
  ready locally.
- PASS `npm run telegram:rabbi:status`; local Rabbi bridge running.
- EXPECTED BLOCKED `node scripts/production-readiness-gate.mjs --allow-dirty
  --json`; blocker groups include `rabbi_telegram_runtime_configuration`.

Evidence:

- `ops/production-readiness/latest-production-readiness-snapshot.json`
- `ops/production-readiness/latest-production-readiness-snapshot.md`
- `ops/production-readiness/latest-production-unblocker.json`
- `ops/production-readiness/latest-production-unblocker.md`
- `scripts/production-readiness-snapshot.mjs`
- `scripts/production-readiness-gate.mjs`
- `scripts/production-unblocker.mjs`

Guardrails:

- No deploy or hosted restart was performed by this gate tightening.
- No live Telegram send/smoke was performed.
- No raw chat ID, token, full phone, private message body, payment data, or
  access link was committed.

Remaining:

- Hosted OneTime/Rabbi Telegram still needs a normal restart/deploy window and
  scoped live-smoke proof before the Rabbi Telegram production blocker can be
  cleared.
- Production also remains blocked by external Stripe/WAPI/campaign setup,
  missing terminal Agent Mode proof, active UI/API/Agent Review collision
  lanes, and no unblocked executable batch.

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260709-047 | Done | Raw/register/standing goal/memory note created. | Static file readback; ledger/changelog pending closeout commit. | None |
| REQ-20260709-048 | Done | Current baseline recorded above. | Baseline reconciled against launch catch-up register and active execution run. | None |
| REQ-20260709-049 | Done | First audit results table above plus `TARGET-20260709-004`, `SETUPCHECK-20260709-005`, and `SETUPCHECK-20260709-006`. | PASS repo/security/privacy/BNA/OneTime public checks; expected blocked setup/WAPI checks recorded. | None for public target, Railway setup readback, or hosted class-link proof; full setup/WAPI remains externally blocked. |
| REQ-20260709-050 | Already satisfied / deployed / live-smoked | `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md`; launch catch-up register; `LEADCAP-20260709-009` closeout above. | Lead capture live-smoked in prior closeout; dry-run proof tests, full suite, deployment, and live smoke pass. | Automated Zoom invite/payment/access/campaign remain blocked. |
| REQ-20260709-051 | Done | Known blockers table plus first audit results. | External blockers retained; performance blocker selected as next engineering batch. | None |
| REQ-20260709-052 | Done | `PERF-20260709-001`, `DEPLOY-20260709-003`, `TARGET-20260709-004`, `SETUPCHECK-20260709-005`, `SETUPCHECK-20260709-006`, `HELPER-20260709-007`, `HELPER-20260709-008`, `LEADCAP-20260709-009`, `DEPLOY-20260709-010`, `TARGET-20260709-011`, `FLEET-20260709-012`, `RUNSTATE-20260709-013`, `LIVECHECK-20260709-014`, `QUEUE-20260709-015`, `LAUNCHBLOCK-20260709-016`, `PROOFSTATE-20260709-017`, and `READINESS-20260709-018` through `READINESS-20260709-047` closeouts above. | PASS tests/gates/live smokes/support readback/profile plus focused target/setup/WAPI/helper-readback/proof-readiness checks; dry-run proof passes local/full-suite verification, explicit OneTime deploy, and live smoke. Docker/build-context hardening deployed to OneTime and BNA from a clean worktree and live-smoked. BNA and OneTime Railway target doctors now pass from committed non-secret profiles. Kimi fallback readiness now proves local CLI version, model, mode, and quota-only routing without running live inference. Active-run blockers now match current setup evidence and no longer ask for a solved Zoom/class alias. Fresh BNA/OneTime live regression sweep and watchdogs passed at `2026-07-09T14:56Z`. Queue hygiene found no safe automatic stale-job action and no live-url requeue candidates. The current external setup packet now asks only for the remaining Stripe/WAPI/campaign blockers. Rabbi Agent Review proof readiness now has a tracked latest summary and still confirms two missing terminal AGR proofs. The production readiness snapshot now gives a single tracked latest control-tower readback for blockers, active jobs, ChatGPT queue, proof state, next actions, agent-fleet auto-deploy preflight, concrete OneTime setup buckets, and redacted Rabbi Telegram runtime state. It labels itself as sampled evidence rather than live telemetry, has a blocking gate command for release/readiness claims, is enforced by `bna:release-gate` deploy/live/final modes, and now blocks agent-fleet auto-deploy before any deploy command can run. The production gates and unblocker now expose grouped owner/action blocker categories while preserving detailed blocker evidence, tracked artifacts show the three concrete OneTime setup bucket IDs from clean pushed heads, the tracked snapshot artifact no longer lets colon-title job rows pollute `agent_fleet.summary`, and the Rabbi WhatsApp instruction lane now shows one approved WhatsApp sent, local chat-ID configuration complete, and Rabbi Telegram production still blocked until hosted restart/live-smoke proof. | Residual performance follow-up `PERF-20260709-002` is not launch-blocking; full OneTime external setup, terminal Agent Mode saved proof, currently running app-wide UI/API/Agent Review lanes, and Rabbi Telegram hosted restart/live-smoke proof remain the active non-code/autonomy blockers. |
