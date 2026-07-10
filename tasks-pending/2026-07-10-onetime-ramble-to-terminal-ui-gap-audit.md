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
| REQ-20260710-004 | Run manual senior-designer review against latest screenshots. | RAW-20260710-001 | one_time_mishnah_class | Codex | P0 | Done with open gaps found | `ops/ui-audits/2026-07-10-onetime-ui-gap-register/SCREENSHOT-INDEX.md` | Implement mobile nav, copy, and provider text-fit gaps. |
| REQ-20260710-005 | Produce root-cause and stale-status reconciliation reports. | RAW-20260710-001 | agent_ops | Codex | P0 | Done for audit compiler | `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/root-cause-analysis.md`; `ops/system-audits/2026-07-10-onetime-ramble-to-terminal-gap-audit/stale-status-reconciliation.md` | Run process-repair packets. |
| REQ-20260710-006 | Generate non-overlapping ChatGPT code-package prompts. | RAW-20260710-001 | agent_ops / one_time_mishnah_class | Codex | P0 | Done prompts-created, not run | `ops/chatgpt-ramble-dropoff/outgoing/2026-07-10-onetime-ui-gap-implementation/` | Run windows or have Codex implement same packets. |
| REQ-20260710-007 | Fix mobile nav clipping. | SRC-20260710-009..011 | one_time_mishnah_class | ChatGPT code-prep then Codex | P1 | Open | `UIGAP-20260710-001` | Run WINDOW-01. |
| REQ-20260710-008 | Normalize visible One Time brand/copy labels. | SRC-20260710-012 | one_time_mishnah_class | ChatGPT code-prep then Codex | P2 | Open | `UIGAP-20260710-002` | Run WINDOW-03. |
| REQ-20260710-009 | Fix provider dashboard long-text/card containment. | SRC-20260710-013 | one_time_mishnah_class | ChatGPT code-prep then Codex | P2 | Open | `UIGAP-20260710-003` | Run WINDOW-02. |
| REQ-20260710-010 | Repair source/screenshot evidence guardrails and stale audit mapping. | SRC-20260710-003..004 | agent_ops | ChatGPT code-prep then Codex | P0-process | Open | `UIGAP-20260710-004`; `UIGAP-20260710-005` | Run WINDOW-04 and WINDOW-05. |
| REQ-20260710-011 | Finish safe content-level manual review for redacted Operations screens. | SRC-20260710-015 | BNA Operations / One Time | Codex | P2 | Open / review-limited | `UIGAP-20260710-006` | Run WINDOW-06 or safe readback. |
| REQ-20260710-012 | Run remaining Agent Mode proof prompts. | SRC-20260710-016 | Agent Review | operator / Agent Mode runner | P1-proof | Blocked / not started | `ops/one-time-mishnah/agent-mode-acceptance.md` | Run the two prompt URLs and save PASS/BLOCKED/FAIL proof. |

## Current Truth Summary

- Lag/performance: Done for the measured live issue. 18/18 slow samples became 0/18 after deployed fixes.
- Latest deployed visual audit: 0 automated findings with authenticated Operations readback.
- Manual review: reopened concrete UI gaps for mobile nav clipping, brand/copy, and provider text fit.
- Process: screenshot/source coverage and stale audit mapping still need repair.
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
| REQ-20260710-007 | Open | Needs code implementation and deploy/live smoke. |
| REQ-20260710-008 | Open | Needs code implementation and deploy/live smoke. |
| REQ-20260710-009 | Open | Needs code implementation and deploy/live smoke. |
| REQ-20260710-010 | Open | Needs process repair package and watchdog validation. |
| REQ-20260710-011 | Open/review-limited | Needs safe content-level review. |
| REQ-20260710-012 | Blocked/not-started | Agent Mode prompts must actually be run. |
