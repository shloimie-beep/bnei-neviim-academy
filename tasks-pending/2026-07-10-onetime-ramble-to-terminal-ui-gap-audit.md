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
| REQ-20260710-007 | Fix mobile nav clipping. | SRC-20260710-009..011 | one_time_mishnah_class | ChatGPT code-prep then Codex | P1 | Done - deployed/live-smoked | Local: `ops/ui-audits/2026-07-10-onetime-ui-gap-register/mobile-nav-containment-local-readback.md`; live: `ops/ui-audits/2026-07-10-onetime-mobile-nav-containment-live/report.md`; OneTime deployment `90990bd3-676f-433f-8a97-dfa6fa4723b7`; commit `0017b458`. | None for this gap; continue REQ-20260710-008..012. |
| REQ-20260710-008 | Normalize visible One Time brand/copy labels. | SRC-20260710-012 | one_time_mishnah_class | ChatGPT code-prep then Codex | P2 | Local implementation done - deploy pending | `ops/system-audits/2026-07-10-onetime-owner-experience-closure/report.md`; `ops/ui-audits/2026-07-10-onetime-brand-normalization-local-current/report.md`; focused tests 163/163 | Commit, push, deploy, and live-smoke the normalized copy. |
| REQ-20260710-009 | Fix provider dashboard long-text/card containment. | SRC-20260710-013 | one_time_mishnah_class | ChatGPT code-prep then Codex | P2 | Done - deployed/live-smoked | Local: `ops/ui-audits/2026-07-10-onetime-provider-text-fit-local/report.md`; live: `ops/ui-audits/2026-07-10-onetime-provider-text-fit-live/report.md`; watchdog: `ops/watchdog-audits/2026-07-10-product-quality-drift.md`; OneTime deployment `f338b59b-a545-40ab-b952-13b4111ecd2a`; commit `f3368cfe`. | None for this gap; continue REQ-20260710-008 and REQ-20260710-010..012. |
| REQ-20260710-010 | Repair source/screenshot evidence guardrails and stale audit mapping. | SRC-20260710-003..004 | agent_ops | ChatGPT code-prep then Codex | P0-process | Local process repair done - deploy/push pending | `scripts/smoke-one-time-shared-review-live.mjs`; `scripts/validate-product-quality-packets.mjs`; updated source/lifecycle matrices; `ops/system-audits/2026-07-10-onetime-owner-experience-closure/report.md` | Rerun PQC/watchdogs/audit governance, commit/push, then live-smoke after deploy. |
| REQ-20260710-011 | Finish safe content-level manual review for redacted Operations screens. | SRC-20260710-015 | BNA Operations / One Time | Codex | P2 | Blocked / review-limited | Local authenticated Operations routes passed layout/no-overflow with env auth in `ops/ui-audits/2026-07-10-onetime-brand-normalization-local-current/report.md`, but screenshots are too blurred for content-level proof. | Run readable redacted Operations review or browser takeover preserving labels/hierarchy/actions while redacting private values. |
| REQ-20260710-012 | Run remaining Agent Mode proof prompts. | SRC-20260710-016 | Agent Review | operator / Agent Mode runner | P1-proof | Blocked - Agent Mode runner required | `ops/one-time-mishnah/agent-mode-acceptance.md`; public prompt URLs remain the next action, not proof. | Run the two prompt URLs and save PASS/BLOCKED/FAIL `AGR-*` proof. |

## Current Truth Summary

- Lag/performance: Done for the measured live issue. 18/18 slow samples became 0/18 after deployed fixes.
- Latest deployed visual audit: 0 automated findings with authenticated Operations readback.
- Manual review: reopened concrete UI gaps for mobile nav clipping, brand/copy, and provider text fit; mobile nav and provider text fit are deployed/live-proven, and brand/copy is locally implemented with deploy pending.
- Process: the stale shared-review selector and PQC false-positive guardrail are locally repaired; final process closeout still needs commit/push, rerun watchdogs/audit governance, deploy, and live smoke.
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
| REQ-20260710-008 | Local implementation done - deploy pending | Visible brand/copy labels now use `One Time`, `One Time Mishnayos`, and internal `One Time Mishnah Class`; no standalone visible `OneTime`, `OneTimeOneTime`, `OneTime Mishnah`, or `OneTime Mishnayos` matches remain in the active checked surfaces. Local visual audit captured 140 screenshots with 0 findings. |
| REQ-20260710-009 | Done - deployed/live-smoked | Provider CRM inbox metric, CRM record email chip, and mailbox readiness email chip now use deliberate one-line ellipsis with full `title`/`aria-label`; CRM copy wraps at normal word boundaries. Pushed commit `f3368cfe`, deployed to OneTime Railway deployment `f338b59b-a545-40ab-b952-13b4111ecd2a`, separate-instance live smoke passed, focused live readback passed at 390px, 430px, and 1440px with no overview/CRM/mailbox horizontal overflow, and protocol-drift watchdog found 0 findings. |
| REQ-20260710-010 | Local process repair done - deploy/push pending | Stale `.hero-media-placeholder` selector was replaced with `.hero-media`; PQC validation now ignores non-PQC prompt JSON without a supported schema version; source/lifecycle matrices were refreshed. Needs rerun of PQC/watchdogs/audit governance after this update and live proof after deploy. |
| REQ-20260710-011 | Blocked/review-limited | Local authenticated Operations layout proof passed, but redacted screenshots blur too much text for content-level proof. Exact next action: readable redacted review or browser takeover preserving labels/hierarchy/actions while redacting private values. |
| REQ-20260710-012 | Blocked - Agent Mode runner required | Agent Mode prompts must actually be run and saved as `AGR-*` PASS/FAIL/BLOCKED results. |
