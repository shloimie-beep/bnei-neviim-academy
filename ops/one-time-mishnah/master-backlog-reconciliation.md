# One Time Master Backlog Reconciliation

Generated: 2026-06-21T08:38:33.874Z

Active run: `2026-06-21-one-time-master-completion`

Workspace: `rabbi_sheller_provider`

Project: `one_time_mishnah_class`

Provider: Rabbi Ellie Scheller

## Current Batch 2 Reconciliation

This refresh replaces the stale June 19 run references with the June 21 active run. It does not create visible Tasks, Decisions, calendar rows, production records, external writes, or app runtime changes.

## No Visible Tasks Created

| Item | Count |
|---|---:|
| Visible Tasks created | 0 |
| Visible Decisions created | 0 |
| Visible calendar records created | 0 |

Policy: No source fan-out into visible Tasks or Decisions in Batch 2; rows are collapsed into canonical requirements and concise operator Decisions.

## Classification Counts

| Classification | Count |
|---|---:|
| already_satisfied | 19 |
| blocked | 0 |
| duplicate | 34 |
| missing | 2 |
| needs_operator_decision | 18 |
| partially_implemented | 24 |
| supersedes_existing | 0 |
| unrelated_bna_data | 2 |

Legacy June 19 statement rows preserved: 1164

## Canonical Executable Requirements

| Requirement | Title | Batch | Status | Priority | Owner | Deploy | Next action |
|---|---|---|---|---|---|---|---|
| REQ-20260619-300 | Batch 0 preflight and successor run | batch-0 | done | P0 | Codex | no | Proceed to REQ-20260619-301 protocol repair. |
| REQ-20260619-301 | Repair ramble-to-done protocol and execution CLI | batch-1 | done | P0 | Codex | no | Proceed to REQ-20260621-501 master backlog reconciliation. |
| REQ-20260621-501 | Refresh master backlog reconciliation | batch-2 | needs_verification | P0 | Codex | no | Run focused reconciliation verification, then mark Batch 2 verified. |
| REQ-20260619-302 | Production Task and Decision cleanup | batch-3 | not_started | P0 | Codex | yes | Create fresh census, backup/export, dry-run plan, reversible cleanup, server-side filters, and tests. |
| REQ-20260619-303 | Workspace users and roles | batch-4 | not_started | P0 | Codex | yes | Complete scoped Users model/UI, role lifecycle, audit logs, and negative authorization tests. |
| REQ-20260621-502 | Visible action registry and dead-button coverage | batch-5 | not_started | P0 | Codex | yes | Inventory visible controls, wire working actions or exact disabled blockers, and add coverage tests. |
| REQ-20260619-304 | Operations UI and design-system correction | batch-6 | not_started | P0 | Codex | yes | Use the existing audit harness and fix sidebar/filter rail separation, horizontal filters, toolbar, buttons, cards, and mobile behavior. |
| REQ-20260619-305 | First-party communications parent requirement | batch-7-8-parent | not_started | P1 | Codex | yes | Implement child WhatsApp and Email/Resend requirements. |
| REQ-20260621-503 | WhatsApp UX | batch-7 | not_started | P1 | Codex | yes | Complete three-pane desktop and sequential mobile WhatsApp conversation workspace. |
| REQ-20260621-504 | Email and Resend UX | batch-8 | not_started | P1 | Codex | yes | Complete email workspace, Resend domain readback/status UI, webhook verification/storage, and sender/domain Decision. |
| REQ-20260619-306 | Product, scheduling, booking, portals, and billing foundations | batch-9-10 | not_started | P1 | Codex | yes | Complete configurable products, schedule/availability, booking, parent/student/provider portals, and billing/access states. |
| REQ-20260619-307 | Zoom meeting and attendance foundation | batch-12 | not_started | P1 | Codex | yes | Complete API client, token caching, session models, webhook verification, attendance calculations, and mocked tests. |
| REQ-20260619-308 | Vimeo, member-library, recording, transcript, and publication pipeline | batch-11-13 | not_started | P1 | Codex | yes | Make manual Vimeo workflow fully usable and automated upload readiness disabled behind feature flag; complete recording/publication states. |
| REQ-20260619-309 | Transcript privacy | batch-14 | not_started | P1 | Codex | yes | Complete transcript versioning, visibility classes, speaker confidence, matching/review rules, and tests. |
| REQ-20260619-310 | Gamification | batch-15 | not_started | P2 | Codex | yes | Complete event-driven badge awarding, thresholds, idempotency, reversal, audit, and parent-safe explanations. |
| REQ-20260619-311 | Community | batch-16 | not_started | P2 | Codex | yes | Complete announcements, moderated cohort discussions, private questions, parent visibility, staff notes, report/flag flow, and private-to-public workflow. |
| REQ-20260619-312 | Sefaria and study-assistant readiness | batch-17 | not_started | P2 | Codex | yes | Complete approved source-version model, scoped retrieval, disabled feature flag, and guardrail tests. |
| REQ-20260619-313 | One Time deployment readiness | batch-18 | needs_operator_decision | P2 | Codex | no | Complete code and runbook readiness where missing; do not provision paid infrastructure or DNS. |
| REQ-20260619-314 | Final verification and release | batch-19 | not_started | P0 | Codex | yes | Run final checks, push PR branch, deploy safe bundle, smoke, and update PR #5; do not merge. |

## Remaining Operator Decisions

| Decision | Title | Requirement | Owner | Exact action required |
|---|---|---|---|---|
| DEC-ONE-TIME-OPTION-B-OWNERSHIP-BUDGET-DNS | Approve separate One Time Railway/database/domain/DNS ownership and budget | REQ-20260619-313 | Shloimie / Rabbi Ellie Scheller | Approve or revise the Option B ownership, budget, domain, Railway project/database, and DNS authority. |
| DEC-RESEND-SENDER-DOMAIN-IDENTITY | Choose One Time email sender domain, from identity, and reply-to | REQ-20260621-504 | Shloimie / Rabbi Ellie Scheller | Provide sender domain, from email, sender name, reply-to, and DNS authority. |
| DEC-PRODUCT-PRICING-LEGAL-BILLING | Confirm final pricing, payment provider, refund/legal/access policy | REQ-20260619-306 | Shloimie / Rabbi Ellie Scheller | Approve provider of record, final prices, currencies, payment processor, refund/cancellation/access rules, and live payment credentials/links. |
| DEC-VIMEO-USER-TOKEN-UPLOAD-AUTHORITY | Provide Vimeo user-level upload authority or approve manual-only workflow | REQ-20260619-308 | Rabbi Ellie Scheller | Provide authorized Vimeo user/token path, upload scope, account owner, plan/quota, folder, privacy default, and allowed embed domains. |
| DEC-ZOOM-LIVE-MEETING-SMOKE | Approve one operator-gated live Zoom meeting creation smoke | REQ-20260619-307 | Shloimie / Rabbi Ellie Scheller | Approve exact Zoom account, host, license/readiness, scopes, and one safe integration-smoke action. |

## Source Statement Matrix Sample

Full current and legacy matrices are in `ops/one-time-mishnah/master-backlog-reconciliation.json`.

| Statement | Requirement | Classification | Source path | Statement |
|---|---|---|---|---|
| MATRIX-STMT-20260621-001-0001 | REQ-20260619-300 | already_satisfied | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Create exactly one successor active run for One Time master completion and do not leave two active runs. |
| MATRIX-STMT-20260621-001-0002 | REQ-20260619-301 | already_satisfied | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Repair the ramble-to-done protocol, validator, schema, resume, next-batch, source coverage, and blocker reporting beh... |
| MATRIX-STMT-20260621-001-0003 | REQ-20260621-501 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Refresh the master backlog reconciliation before implementation and collapse source statements into canonical executa... |
| MATRIX-STMT-20260621-001-0004 | REQ-20260619-302 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Clean up production Tasks and Decisions so default views are scoped, relevant, deduped, and reversible. |
| MATRIX-STMT-20260621-001-0005 | REQ-20260619-303 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Implement One Time workspace users, roles, role updates, audit logs, relationship enforcement, and negative authoriza... |
| MATRIX-STMT-20260621-001-0006 | REQ-20260621-502 | missing | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Audit every visible action and ensure visible controls work, are disabled with exact blockers, or are intentionally i... |
| MATRIX-STMT-20260621-001-0007 | REQ-20260619-304 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Correct Operations UI navigation, horizontal filter rails, sticky toolbar, mobile toolbar, buttons, cards, and respon... |
| MATRIX-STMT-20260621-001-0008 | REQ-20260621-503 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Complete WhatsApp UX using the existing first-party WAPI/Whapi system without sending WhatsApp messages. |
| MATRIX-STMT-20260621-001-0009 | REQ-20260621-504 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Complete Email and Resend UX without live sends, including domain/status readback, webhook code, and one sender/domai... |
| MATRIX-STMT-20260621-001-0010 | REQ-20260619-306 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Complete product, scheduling, booking, parent portal, student portal, provider portal, and billing/access foundations... |
| MATRIX-STMT-20260621-001-0011 | REQ-20260619-308 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Implement manual Vimeo library workflow now and automated Vimeo upload readiness behind disabled feature flag. |
| MATRIX-STMT-20260621-001-0012 | REQ-20260619-307 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Implement Zoom API client, session workflow, webhooks, and attendance foundation without creating a real class meeting. |
| MATRIX-STMT-20260621-001-0013 | REQ-20260619-309 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Implement transcript privacy with review states, matching confidence, visibility classes, and no cross-child exposure. |
| MATRIX-STMT-20260621-001-0014 | REQ-20260619-310 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Implement server-side event-driven gamification badges with thresholds, idempotency, reversal, audit, and no public i... |
| MATRIX-STMT-20260621-001-0015 | REQ-20260619-311 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Complete community moderation, private questions, parent-visible communication, edit/archive history, reporting, and ... |
| MATRIX-STMT-20260621-001-0016 | REQ-20260619-312 | partially_implemented | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Prepare approved Sefaria source model and disabled study-assistant readiness with scoped retrieval and citation guard... |
| MATRIX-STMT-20260621-001-0017 | REQ-20260619-313 | needs_operator_decision | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Prepare Option B separate One Time deployment readiness without provisioning paid infrastructure or DNS. |
| MATRIX-STMT-20260621-001-0018 | REQ-20260619-314 | missing | raw-input/RAW-20260621-001-one-time-master-completion-goal.md | Run final verification, push PR #5 branch, deploy safe bundle, smoke production, and leave only genuine external acti... |
| SRC-INV-20260621-001 | REQ-20260619-306 | already_satisfied | BNA-START-HERE.md | BNA-START-HERE.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-002 | REQ-20260619-306 | already_satisfied | AGENTS.md | AGENTS.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-003 | REQ-20260619-306 | already_satisfied | README.md | README.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-004 | REQ-20260619-306 | already_satisfied | MEMORY.md | MEMORY.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-005 | REQ-20260619-302 | already_satisfied | TASKS.md | TASKS.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-006 | REQ-20260619-306 | already_satisfied | SYSTEM-STATE.md | SYSTEM-STATE.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-007 | REQ-20260619-306 | already_satisfied | PROJECT-NOTES.md | PROJECT-NOTES.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-008 | REQ-20260619-306 | already_satisfied | docs/BNA-RAMBLE-TO-DONE.md | docs/BNA-RAMBLE-TO-DONE.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-009 | REQ-20260619-306 | already_satisfied | ops/execution-runs/latest.json | ops/execution-runs/latest.json was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-010 | REQ-20260621-501 | already_satisfied | ops/one-time-mishnah/next-master-backlog-input.md | ops/one-time-mishnah/next-master-backlog-input.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-011 | REQ-20260619-306 | already_satisfied | ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md | ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md was inspected and included in t... |
| SRC-INV-20260621-012 | REQ-20260619-306 | already_satisfied | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json was inspected and included in the Batch 2 recon... |
| SRC-INV-20260621-013 | REQ-20260619-306 | already_satisfied | ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md | ops/system-audits/2026-06-16-prompt-ingestion-execution-gap.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-014 | REQ-20260619-304 | already_satisfied | ops/ui-audits/2026-06-16-ui-closeout.md | ops/ui-audits/2026-06-16-ui-closeout.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-015 | REQ-20260619-303 | already_satisfied | docs/architecture/workspace-community-provider-role-map.md | docs/architecture/workspace-community-provider-role-map.md was inspected and included in the Batch 2 reconciliation. |
| SRC-INV-20260621-016 | REQ-20260619-306 | already_satisfied | ops/communications/wapi-crm-audit-and-plan.md | ops/communications/wapi-crm-audit-and-plan.md was inspected and included in the Batch 2 reconciliation. |
| DEC-20260618-201 | REQ-20260619-307 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Verify Zoom owner role, license, and app-management path |
| DEC-20260618-202 | REQ-20260619-308 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Decide Vimeo seat, user, token, and manual-library strategy |
| DEC-20260618-203 | REQ-20260621-504 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Decide Resend recovery, new account, or alternate email provider |
| DEC-20260618-204 | REQ-20260619-313 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Identify One Time launch domain and DNS authority |
| DEC-20260618-205 | REQ-20260619-306 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm Stripe role, live/test mode, and payment structure |
| DEC-20260618-206 | REQ-20260619-306 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Choose internal calendar now or external sync after smoke tests |
| DEC-20260618-207 | REQ-20260621-501 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Defer or grant YouTube channel access for Week 3 content workflow |
| DEC-20260618-208 | REQ-20260621-501 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Schedule separate Meta access session before ads or page posting |
| DEC-20260618-209 | REQ-20260621-504 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Choose first-party email path without reviving active GHL runtime |
| DEC-20260618-221 | REQ-20260621-501 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm Worldwide Mishnayos launch positioning and starting masechta |
| DEC-20260618-222 | REQ-20260619-306 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Choose first funnel offer and pricing |
| DEC-20260618-223 | REQ-20260619-306 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Approve or reject first-100 free-month/shout-out/kit offer |
| DEC-20260618-224 | REQ-20260619-307 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Choose live format: room broadcast, Zoom-only, or hybrid |
| DEC-20260618-225 | REQ-20260619-311 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Choose student question submission and moderation model |
| DEC-20260618-226 | REQ-20260619-308 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Decide same-day video library posting requirements |
| DEC-20260618-227 | REQ-20260619-306 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Set refunds, cancellation, sharing, bank, and accounting rules |
| DEC-20260618-228 | REQ-20260621-501 | needs_operator_decision | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Set public AI review and visual guardrail standard |
| TASK-20260618-241 | REQ-20260619-307 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Verify Zoom account role, plan/license, and app-management path |
| TASK-20260618-242 | REQ-20260619-308 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm Vimeo seat/user/API strategy |
| TASK-20260618-243 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm Stripe role, live/test mode, and payment structure |
| TASK-20260618-244 | REQ-20260619-313 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Identify domain registrar/DNS host and verification notices |
| TASK-20260618-245 | REQ-20260621-504 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Decide Resend recovery vs new One Time account vs alternate email provider |
| TASK-20260618-246 | REQ-20260619-302 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm One Time workspace owner/admin model and safe login handoff |
| TASK-20260618-247 | REQ-20260619-307 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Create Zoom app after owner approval or document manual Zoom workflow |
| TASK-20260618-248 | REQ-20260619-308 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Configure Vimeo API after approval or document manual video-library workflow |
| TASK-20260618-249 | REQ-20260621-504 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Configure Resend/email sending domain records after DNS access |
| TASK-20260618-250 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Draft Stripe products, prices, and webhook/access plan |
| TASK-20260618-251 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Create internal One Time calendar from due dates and milestones |
| TASK-20260618-252 | REQ-20260619-302 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Build upload, naming, review, posting, and ad-candidate content workflow |
| TASK-20260618-253 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Finalize registration funnel, first offer, pricing, refund, and cancellation |
| TASK-20260618-254 | REQ-20260619-307 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Pilot Zoom, Vimeo, and content workflow with one class recording |
| TASK-20260618-255 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Run end-to-end signup, payment, access, reminder, recording, and support test |
| TASK-20260618-256 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Run launch rehearsal for class format, camera, questions, and worksheet flow |
| TASK-20260618-257 | REQ-20260619-302 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Review unresolved Decisions and set launch go/no-go |
| CAL-20260618-261 | REQ-20260619-307 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Verify Zoom account role, plan/license, and app-management path |
| CAL-20260618-262 | REQ-20260619-308 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm Vimeo seat/user/API strategy |
| CAL-20260618-263 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm Stripe role, live/test mode, and payment structure |
| CAL-20260618-264 | REQ-20260619-313 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Identify domain registrar/DNS host and verification notices |
| CAL-20260618-265 | REQ-20260621-504 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Decide Resend recovery vs new One Time account vs alternate email provider |
| CAL-20260618-266 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Confirm One Time workspace owner/admin model and safe login handoff |
| CAL-20260618-267 | REQ-20260619-307 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Create Zoom app after owner approval or document manual Zoom workflow |
| CAL-20260618-268 | REQ-20260619-308 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Configure Vimeo API after approval or document manual video-library workflow |
| CAL-20260618-269 | REQ-20260621-504 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Configure Resend/email sending domain records after DNS access |
| CAL-20260618-270 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Draft Stripe products, prices, and webhook/access plan |
| CAL-20260618-271 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Create internal One Time calendar from due dates and milestones |
| CAL-20260618-272 | REQ-20260619-306 | duplicate | ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json | Build upload, naming, review, posting, and ad-candidate content workflow |

## Batch 3 Handoff

Next unblocked batch after verification: `REQ-20260619-302` / `batch-3`.

Exact next command: `npm run bna:run:next`.
