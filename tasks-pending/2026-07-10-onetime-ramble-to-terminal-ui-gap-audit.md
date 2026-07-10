# One Time Ramble-To-Terminal UI Gap Audit

## Raw Intake

Source raw record: `raw-input/RAW-20260710-001-onetime-ramble-to-terminal-ui-gap-audit.md`

## Mission

Reconcile One Time/Rabbi UI complaints against current code/evidence, expose skipped lifecycle stages, create one canonical UI gap register, and compile unresolved gaps into small implementation-grade ChatGPT/Codex packets.

This register does not close the underlying UI product requirements.

## Parsed Requirements

| ID | Requirement | Source | Workspace/project | Owner | Priority | Status | Evidence | Next action |
|---|---|---|---|---|---|---|---|---|
| REQ-20260710-001 | Preserve the full goal-mode prompt as raw intake. | RAW-20260710-001 | agent_ops | Codex | P0 | Done | `raw-input/RAW-20260710-001-onetime-ramble-to-terminal-ui-gap-audit.md` | none |
| REQ-20260710-002 | Build source-statement and lifecycle matrices. | RAW-20260710-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | P0 | Done for audit compiler | `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/source-statement-matrix.json`; `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/lifecycle-gap-matrix.json` | Use open source statements for implementation packets. |
| REQ-20260710-003 | Create the canonical UI gap register. | RAW-20260710-001 | one_time_mishnah_class | Codex | P0 | Done for audit compiler | `ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.md`; `ops/ui-audits/2026-07-10-onetime-ui-gap-register/report.json` | Work gap IDs in priority order. |
| REQ-20260710-004 | Run manual senior-designer review against latest screenshots. | RAW-20260710-001 | one_time_mishnah_class | Codex | P0 | Done with open gaps found | `ops/ui-audits/2026-07-10-onetime-ui-gap-register/SCREENSHOT-INDEX.md` | Continue brand/copy, evidence guardrail, Operations review, and Agent Mode proof gaps. |
| REQ-20260710-005 | Produce root-cause and stale-status reconciliation reports. | RAW-20260710-001 | agent_ops | Codex | P0 | Done for audit compiler | `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/root-cause-analysis.md`; `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/stale-status-reconciliation.md` | Run process-repair packets. |
| REQ-20260710-006 | Generate non-overlapping ChatGPT code-package prompts. | RAW-20260710-001 | agent_ops / one_time_mishnah_class | Codex | P0 | Done prompts-created, not run | `ops/chatgpt-ramble-dropoff/outgoing/2026-07-10-onetime-ui-gap-implementation/` | Run windows or have Codex implement same packets. |
| REQ-20260710-007 | Fix mobile nav clipping. | SRC-20260710-009..011 | one_time_mishnah_class | ChatGPT code-prep then Codex | P1 | Done - deployed/live-smoked | Local: `ops/ui-audits/2026-07-10-onetime-ui-gap-register/mobile-nav-containment-local-readback.md`; live: `ops/ui-audits/2026-07-10-onetime-mobile-nav-containment-live/report.md`; One Time deployment `90990bd3-676f-433f-8a97-dfa6fa4723b7`; commit `0017b458`. | None for this gap; continue REQ-20260710-008..012. |
| REQ-20260710-008 | Normalize visible One Time brand/copy labels. | SRC-20260710-012 | one_time_mishnah_class | ChatGPT code-prep then Codex | P2 | Done - deployed/live-smoked | Commit `98e49080`; One Time deployment `f7043570-5ded-4c1c-8109-4475f9cd11ae`; local audit `ops/ui-audits/2026-07-10-onetime-brand-normalization-local-current/report.md`; live readback `ops/ui-audits/2026-07-10-onetime-brand-normalization-live-readback/report.md`; focused tests 163/163; live smokes under `ops/live-smokes/2026-07-10T11-*`. | None for brand/copy; full launch blockers remain separate. |
| REQ-20260710-009 | Fix provider dashboard long-text/card containment. | SRC-20260710-013 | one_time_mishnah_class | ChatGPT code-prep then Codex | P2 | Done - deployed/live-smoked | Local: `ops/ui-audits/2026-07-10-onetime-provider-text-fit-local/report.md`; live: `ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/report.md`; watchdog: `ops/watchdog-audits/2026-07-10-product-quality-drift.md`; One Time deployment `f338b59b-a545-40ab-b952-13b4111ecd2a`; commit `f3368cfe`. | None for this gap; continue REQ-20260710-008 and REQ-20260710-010..012. |
| REQ-20260710-010 | Repair source/screenshot evidence guardrails and stale audit mapping. | SRC-20260710-003..004 | agent_ops | ChatGPT code-prep then Codex | P0-process | Done - deployed/live-smoked | `scripts/smoke-one-time-shared-review-live.mjs`; `scripts/validate-product-quality-packets.mjs`; refreshed source/lifecycle matrices; `ops/system-audits/2026-07-10-onetime-owner-experience-closure/report.md`; live shared-review smoke `ops/live-smokes/2026-07-10T11-26-58-773Z-one-time-shared-review-live-smoke.md`; PQC/actions/protocol/audit governance rerun. | None for this scoped process repair; older repo-wide audit debt remains tracked outside this UI gap. |
| REQ-20260710-011 | Finish safe content-level manual review for redacted Operations screens. | SRC-20260710-015 | BNA Operations / One Time | Codex | P2 | Done - live readable redacted review | Live authenticated Operations routes loaded with One Time Railway auth and readable redaction in `ops/ui-audits/2026-07-10-onetime-operations-readable-live/report.md`; manual review note: `ops/ui-audits/2026-07-10-onetime-operations-readable-live/manual-review.md`. | None for this proof gap; continue Agent Mode proof and broader source-complete reconciliation. |
| REQ-20260710-012 | Run remaining Agent Mode proof prompts. | SRC-20260710-016 | Agent Review | operator / Agent Mode runner | P1-proof | Blocked - Agent Mode runner required | `ops/one-time-mishnah/agent-mode-acceptance.md`; public prompt URLs remain the next action, not proof. | Run the two prompt URLs and save PASS/BLOCKED/FAIL `AGR-*` proof. |
| REQ-20260710-036 | Refine mobile nav to white horizontal option chips on the black rail. | RAW-20260710-006 | one_time_mishnah_class | Codex | P1 | Local verified - not pushed/deployed | `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-local/report.md`; screenshots under `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-local/screenshots/` | Commit, push, deploy to One Time Railway, and run live 390px/430px readback before terminal Done. |

## Current Truth Summary

- Lag/performance: Done for the measured live issue. 18/18 slow samples became 0/18 after deployed fixes.
- Latest deployed visual audit: 0 automated findings with authenticated Operations readback.
- Manual review: reopened concrete UI gaps for mobile nav clipping, brand/copy, provider text fit, and Operations readable evidence; mobile nav clipping, provider text fit, brand/copy, and readable redacted Operations proof are now deployed/live-proven or live-reviewed for the scoped surfaces. A later operator screenshot correction reopened mobile nav visual state as `REQ-20260710-036`; it is locally verified and pending push/deploy/live readback.
- Process: the stale shared-review selector and PQC false-positive guardrail are repaired, pushed, deployed, and live-smoked for this scoped batch. Older repo-wide audit debt remains in audit-governance reports but is not the blocker for REQ-20260710-010.
- Production blockers: external setup, Agent Mode proof, and Rabbi Telegram hosted/live-smoke remain separate from local UI gap implementation.

## Final Audit Table

| Requirement | Status | Proof/blocker |
|---|---|---|
| REQ-20260710-001 | Done | Raw file created. |
| REQ-20260710-002 | Done for audit compiler | JSON matrices created. |
| REQ-20260710-003 | Done for audit compiler | Canonical UI gap register created. |
| REQ-20260710-004 | Done with open gaps found | Screenshot index records manual findings. |
| REQ-20260710-005 | Done for audit compiler | Root cause and reconciliation reports created. |
| REQ-20260710-006 | Done prompts-created, not run | Six ChatGPT windows generated. |
| REQ-20260710-007 | Done - deployed/live-smoked | Rejected first grid treatment after operator screenshot review. Final implementation uses a black mobile header with a visible white hamburger/scroll cue, horizontal chip rail, no page overflow, and no assistant overlap at 390px/430px. Pushed commit `0017b458`, deployed to OneTime Railway deployment `90990bd3-676f-433f-8a97-dfa6fa4723b7`, and live-readback passed 10/10 checks at 390px/430px. |
| REQ-20260710-008 | Done - deployed/live-smoked | Visible brand/copy labels now use `One Time`, `One Time Mishnayos`, and internal `One Time Mishnah Class`; no standalone visible `OneTime`, `OneTimeOneTime`, `OneTime Mishnah`, or `OneTime Mishnayos` matches remain in the active checked surfaces. Commit `98e49080` deployed to One Time Railway deployment `f7043570-5ded-4c1c-8109-4475f9cd11ae`; local visual audit captured 140 screenshots with 0 findings, and live visual readback captured 110 screenshots with 0 findings on reachable routes. |
| REQ-20260710-009 | Done - deployed/live-smoked | Provider CRM inbox metric, CRM record email chip, and mailbox readiness email chip now use deliberate one-line ellipsis with full `title`/`aria-label`; CRM copy wraps at normal word boundaries. Pushed commit `f3368cfe`, deployed to One Time Railway deployment `f338b59b-a545-40ab-b952-13b4111ecd2a`, separate-instance live smoke passed, focused live readback passed at 390px, 430px, and 1440px with no overview/CRM/mailbox horizontal overflow, and protocol-drift watchdog found 0 findings. |
| REQ-20260710-010 | Done - deployed/live-smoked | Stale `.hero-media-placeholder` selector was replaced with `.hero-media`; PQC validation now ignores non-PQC prompt JSON without a supported schema version; source/lifecycle matrices were refreshed. PQC/actions/protocol/audit-governance checks reran locally, commit `98e49080` was pushed/deployed, and live shared-review/readback smokes passed after deployment. |
| REQ-20260710-011 | Done - live readable redacted review | Live Operations audit used One Time Railway auth, captured 140 screenshots with 0 skipped checks and 0 automated findings, and preserved labels, hierarchy, actions, and state while masking private values. Manual inspection covered desktop/mobile overview and email inbox screenshots. Evidence: `ops/ui-audits/2026-07-10-onetime-operations-readable-live/report.md` and `ops/ui-audits/2026-07-10-onetime-operations-readable-live/manual-review.md`. |
| REQ-20260710-012 | Blocked - Agent Mode runner required | Agent Mode prompts must actually be run and saved as `AGR-*` PASS/FAIL/BLOCKED results. |
| REQ-20260710-036 | Local verified - not pushed/deployed | Mobile rails now use a black header/rail, white hamburger/sandwich cue, horizontally sliding white option chips with black text, active yellow-inset selected state, and no page overflow at 390px/430px across public, member, library, classroom, and provider review routes. Local readback passed 10/10 in `ops/ui-audits/2026-07-10-onetime-mobile-nav-white-chip-local/report.md`; deploy/live smoke remains required. |
