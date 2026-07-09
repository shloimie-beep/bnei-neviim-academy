# OneTime Lead Capture, Free Zoom, Railway Context, Agent Mode, Stale Queue

## Raw intake

Source: `RAW-20260709-008`

Shloimie asked for goal-mode execution on the immediate OneTime launch lane:
Railway target context, public UI/signup, lead capture, CRM capture, free Zoom
follow-up, landing-page helper/bot readiness, Agent Mode link/sequence, and
stale queue triage. He explicitly deprioritized full launch setup and portal
delivery for this step.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-008 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Finish the next launch-critical OneTime lane: repair Railway target context where possible, define and prepare the lead-capture/free-class launch path, expose the Agent Mode audit link/control flow, triage stale queue/do-not-redo work without going backwards, and leave UI screenshot work isolated for the next branch/lane. |
| Goal tool used | yes |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260709-032 through REQ-20260709-040 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-031 | Preserve raw intake and create this launch-priority requirement register. | RAW-20260709-008 | agent_ops | Codex | intake | P0 | 0 | none | Raw file, memory note, register, ledger/changelog closeout exist. | raw-input, memory, tasks-pending, ops ledgers | no | Done except final ledger/changelog append |
| REQ-20260709-032 | Resolve or accurately reclassify the stale Railway target-context blocker. | RAW-20260709-008 | one_time_mishnah_class | Codex | deployment-readiness | P0 | 1 | none | Current `one-time-web` target readback is recorded; old blocker no longer says target context is missing if guard passes; full setup blockers stay separate. | ops/execution-runs/... | no | Done |
| REQ-20260709-033 | Compile immediate launch scope: capture info, route to free Zoom follow-up, no portal yet. | RAW-20260709-008 | one_time_mishnah_class | Codex | product-quality | P0 | 1 | REQ-20260709-031 | Public/signup/CRM requirements are exact; portal/member access/Stripe/WAPI/campaign sends are out of scope; free Zoom URL remains a human/provider value if not configured. | this register, config/service-provider-sites/one-time.json | no | Done |
| REQ-20260709-034 | Make public `/api/one-time/interest` create/update first-party CRM lead records, not only product lead rows. | RAW-20260709-008 | one_time_mishnah_class | Codex | backend-crm | P0 | 2 | REQ-20260709-033 | Interest submit writes `bna_product_leads`, upserts `bna_parent_leads`, logs internal communication/follow-up evidence, returns no-send/no-checkout/no-access flags, and does not perform external writes. | server.js, tests | yes | Implemented / local verified |
| REQ-20260709-035 | Update OneTime public landing/signup copy and fields to capture free-class interest without promising portal access. | RAW-20260709-008 | one_time_mishnah_class | Codex | public-ui | P0 | 2 | REQ-20260709-033 | Landing form asks for practical lead info, confirmation copy says free class/Zoom follow-up, and page no longer promises parent portal/setup as part of the immediate public signup. | public/one-time/index.html, config, action registry, tests | yes | Implemented / local verified |
| REQ-20260709-036 | Verify landing-page helper/bot is present and scoped; map lead-capturing bot behavior. | RAW-20260709-008 | one_time_mishnah_class | Codex | helper-bot | P1 | 2 | REQ-20260709-033 | Public helper remains OneTime-scoped and registered; if it does not directly submit leads, that is recorded as a bounded follow-up instead of claimed done. | public/js/bna-bot-widget.js, ops/action-registry.json, tests | yes if code changes | Done for scoped helper + form handoff |
| REQ-20260709-037 | Expose Agent Mode link/control path for parallel audits. | RAW-20260709-008 | agent_ops | Codex | agent-mode | P0 | 1 | none | Register names the Agent Review page/prompt URLs, current prompt keys, and safe branch/drop-off rule so Shloimie can launch parallel Agent Mode audits. | this register, public/agent-review.html, public/agent-review-prompts | no | Done |
| REQ-20260709-038 | Triage stale jobs/do-not-redo queue without going backwards. | RAW-20260709-008 | agent_ops | Codex | queue-audit | P1 | 3 | REQ-20260709-037 | Current queue/audit commands run or blocker recorded; stale/do-not-redo work is not blindly requeued; obvious improvements get mapped to current launch goals only. | ops audits, task queue tools | no | Done / no auto-requeue |
| REQ-20260709-039 | Keep screenshot/image UI correction branch isolated from this launch-capture lane. | RAW-20260709-008 | one_time_mishnah_class | Codex + other agent | coordination | P0 | 1 | none | Register states no broad screenshot UI implementation starts in this branch; future image/screenshot ramble should create its own raw intake, PQC packet, visual audit, and merge gate. | this register | no | Done |
| REQ-20260709-040 | Verify, commit, push, deploy, and live-smoke launch-capture changes if gates pass. | RAW-20260709-008 | one_time_mishnah_class | Codex | release | P0 | 4 | REQ-20260709-034, REQ-20260709-035, REQ-20260709-036 | Focused tests pass, watchdogs pass or blockers documented, scoped commit is pushed, deploy target is verified before release, and live smoke proves OneTime public landing + interest capture route. | git, Railway, smoke reports | yes | Pending |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260709-031 | onetime-free-zoom-lead-capture | Finish immediate OneTime lead capture path for free-class follow-up. | Codex | one_time_mishnah_class | RAW-20260709-008 | REQ-20260709-034, REQ-20260709-035 | Monitor live funnel; supply approved Zoom alias before any automated invite sends. | launch-critical | Done / deployed / live-smoked |
| TASK-20260709-032 | railway-target-context-readback | Record current Railway target-context status separately from full setup. | Codex | one_time_mishnah_class | RAW-20260709-008 | REQ-20260709-032 | None. | launch-critical | Done |
| TASK-20260709-033 | agent-mode-next-audit-link | Give Shloimie a concrete Agent Mode launch link and prompt path. | Codex | agent_ops | RAW-20260709-008 | REQ-20260709-037 | Use public links listed below for parallel audits. | agent-mode | Done |
| TASK-20260709-034 | stale-job-currentness-audit | Run queue/currentness triage without reviving old prompts. | Codex | agent_ops | RAW-20260709-008 | REQ-20260709-038 | Do not auto-requeue; use current launch register for only obvious improvements. | agent-mode | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260709-007 | Immediate launch scope excludes portal/member access, Stripe/payment, WAPI/campaign sends, and full launch setup. | None; this was explicit in RAW-20260709-008. | Shloimie/Codex | Build capture + CRM + internal follow-up now; keep portal/payments/broadcasts blocked. | Try to finish full launch setup first. | Full setup would delay the capture funnel and risk external actions before approvals. | Codex should implement only first-party capture and internal review/follow-up guardrails in this lane. | REQ-20260709-033, REQ-20260709-034, REQ-20260709-035 | Done |
| DEC-20260709-008 | A live free Zoom link/alias is still required before any automated invite can send real Zoom details. | Exact approved Zoom URL or alias for the free class. | Shloimie/provider | Capture leads now and follow up manually or after the approved Zoom alias is configured. | Put a placeholder/fake Zoom link on the public page. | Fake or unapproved Zoom details would make the launch look broken and could mutate external provider state. | Provide the approved free Zoom join URL/alias when ready; until then the funnel records interest and internal follow-up. | Real automated Zoom invite send only | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260709-003 | What exact free Zoom join link/alias should be sent to families? | Needed before any real automated Zoom invite can be sent. | Blocks automated send only, not lead capture. | Open |
| Q-20260709-004 | Should the public form require phone/WhatsApp or keep it optional? | Required phone may reduce conversions; optional phone gives CRM context without blocking signups. | No; use optional phone unless corrected. | Assumption made |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260709-005 | Current OneTime launch priority is lead capture and free-class/free-Zoom follow-up, not portal/payments/full launch setup. | yes | This changes task ordering and prevents agents from chasing stale full-launch blockers first. |
| MEM-20260709-006 | Broad screenshot/image UI correction work should run in its own branch/register and merge after this launch-capture lane. | maybe | Useful coordination rule for the current parallel-agent period. |

## Agent Mode Launch Links

- Public Agent Review hub: `https://join.onetimeonetime.com/agent-review.html`
- Current OneTime IA prompt: `https://join.onetimeonetime.com/agent-review-prompts/one-time-role-ia-consistency.md`
- Current parent trial journey prompt: `https://join.onetimeonetime.com/agent-review-prompts/one-time-parent-trial-journey.md`
- Current student/member prompt: `https://join.onetimeonetime.com/agent-review-prompts/one-time-student-member-login.md`
- Current Rabbi helper scope prompt: `https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md`
- Drop-off rule: Agent Mode audit results should use the Operations Agent Review drop-off when available; if the protected hub is unavailable, report `OPERATIONS_DROPOFF_FAILED` in the final answer and paste the exact prompt key/report back into Codex.

## Immediate Launch Scope

Build now:

- Public OneTime landing/signup captures parent contact details.
- Backend writes first-party CRM lead state and internal follow-up evidence.
- Internal notification/review remains safe.
- No checkout, payment, access grant, external CRM, WhatsApp broadcast, campaign send, Zoom meeting creation, or portal onboarding is triggered by the public signup.

Do not build in this lane:

- Portal launch.
- Stripe/payment setup.
- WAPI/WhatsApp campaign sends.
- Full campaign send.
- Broad screenshot/image UI refactor.
- Old prompt packets that conflict with current OneTime launch scope.

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260709-032 | `ops/execution-runs/.../STATUS.md`, `NEXT-SESSION.md` | Replace stale Railway target blocker with current target guard readback and leave full setup blockers separate. | `npm run one-time:railway-target:guard`; `npm run one-time:setup:check` readback | 2931b1cc | 2931b1cc | Not required for docs |
| REQ-20260709-034 | `/api/one-time/interest`, `bna_product_leads`, `bna_parent_leads`, `bna_contact_communications` | Insert product lead, upsert CRM lead, log internal note, expose CRM linkage in safe response. | PASS `node --check server.js`; PASS focused tests; PASS Playwright intercepted form POST | 2931b1cc | 2931b1cc | Railway `02db803b-8c6b-45fd-89d8-54af8f12f6c9` SUCCESS; live smokes passed without production POST mutation |
| REQ-20260709-035 | `/one-time` public landing | Add practical lead fields and free-class/Zoom copy; remove immediate portal promise. | PASS focused tests; PASS local Playwright 1440/390 smoke with 0px overflow; PASS live Playwright readback 1440/390 with 0px overflow | 2931b1cc | 2931b1cc | Railway `02db803b-8c6b-45fd-89d8-54af8f12f6c9` SUCCESS; PASS live OneTime separate-instance and Rabbi landing smokes |
| REQ-20260709-036 | OneTime helper/bot | Scoped helper now points to the free-class form. It is a guided handoff, not direct in-chat lead submission. | PASS `tests/one-time-brand-helper-isolation.test.js`; PASS `npm run watchdog:actions`; PASS live helper launcher readback | 2931b1cc | 2931b1cc | Railway `02db803b-8c6b-45fd-89d8-54af8f12f6c9` SUCCESS |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260709-031 | Done | Raw/register/memory created; durable memory added to `MEMORY.md`; ledger/changelog closeout appended. | raw-input/RAW-20260709-008-onetime-lead-capture-free-zoom-ui-priority.md; this file; memory/2026-07-09.md; MEMORY.md; ops/agent-task-ledger.jsonl; ops/agent-changelog.md | PASS ledger/changelog closeout | None |
| REQ-20260709-032 | Done | `npm run one-time:railway-target:guard` passed on 2026-07-09T11:36:13Z; `one-time-web` / `production`, 52 variables, usable `DATABASE_URL`, matching OneTime domain/workspace/project. `npm run one-time:setup:check` still exits 1 with ready 4/8 for full setup only. | ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/* | PASS target guard; expected blocked full setup readback | Full launch still needs Zoom alias, Stripe sandbox/price alias, Whapi/WAPI, and campaign approvals. |
| REQ-20260709-033 | Done | Immediate launch scope compiled in this register and config: capture/free-class/free-Zoom follow-up now; portal/payment/broadcast later. | this file; config/service-provider-sites/one-time.json; MEMORY.md | Static review | Free Zoom URL/alias is still needed before automated invite sends. |
| REQ-20260709-034 | Done / deployed / live-smoked | `/api/one-time/interest` now writes product lead, upserts `bna_parent_leads`, logs `bna_contact_communications`, returns `internal_crm_recorded`, `crm_lead_id`, and no-send/no-checkout/no-access flags. Local Playwright intercepted POST proved the submitted fields without mutating production. | server.js; tests/one-time-product-system.test.js | PASS `node --check server.js`; PASS focused tests; PASS local intercepted POST; PASS live target/read-only smokes | No production POST was run because it would create a real CRM lead and trigger the internal Telegram reminder. |
| REQ-20260709-035 | Done / deployed / live-smoked | Landing form now captures parent name/email/student/phone; copy says free-class/Zoom follow-up and no portal account. Local and live Playwright readbacks report 0px overflow at 1440x900 and 390x844. | public/one-time/index.html; tests/one-time-focused-landing.test.js; scripts/smoke-onetime-separate-instance-live.mjs | PASS focused tests; PASS local Playwright smoke with intercepted POST; PASS live Playwright readback; PASS live OneTime separate-instance smoke; PASS Rabbi landing smoke | None |
| REQ-20260709-036 | Done for scoped helper handoff | Public helper remains OneTime-scoped and nudges to free-class form. Direct in-chat form submission is not claimed; the page form is the lead-capture mechanism. | public/js/bna-bot-widget.js; ops/action-registry.json; tests/one-time-brand-helper-isolation.test.js | PASS helper test; PASS `npm run watchdog:actions` | Direct in-chat lead capture can be a later scoped packet if desired. |
| REQ-20260709-037 | Done | Agent Mode links listed in this register: public hub plus OneTime IA, parent trial, student/member, and Rabbi helper scope prompts. | this file | Readback from current prompt files and prior live prompt deployment | Agent Mode reports still need to be run by external windows. |
| REQ-20260709-038 | Done / no auto-requeue | `npm run agent:fleet:status` shows supervisor PID 36560, claimable observable jobs 0, ready-to-claim 3, do-not-redo 878. `npm run ops:audit-queue` shows do-not-redo 1130 and writes latest queue snapshot. `npm run task:reconcile` dry-run reports Actions: 0. | ops/queue-audits/latest.json; ops/system-audits/2026-07-09T11-37-48-231Z-task-queue-reconciler.md | PASS safe read-only/dry-run queue commands | Do not blindly process stale old prompts; only map obvious current improvements into new registers. |
| REQ-20260709-039 | Done | Branch isolation recorded in this register. | this file | Protocol-only | Screenshot/image UI ramble still needs its own raw intake/PQC/audit when supplied. |
| REQ-20260709-040 | Done / deployed / live-smoked | Commit `2931b1cc` pushed to `origin/codex/rabbi-helper-tool-scope-20260708`; explicit OneTime Railway CLI deploy reached `SUCCESS` for deployment `02db803b-8c6b-45fd-89d8-54af8f12f6c9`; live smokes passed. | git/release; scripts/smoke-onetime-separate-instance-live.mjs | PASS `npm run one-time:target:guard -- --json`; PASS deployment status poll; PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`; PASS `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`; PASS live Playwright readback | Branch is 68 commits ahead of `origin/master`, so this was deployed by explicit guarded Railway CLI upload rather than surprise-merging the whole branch to master. |
