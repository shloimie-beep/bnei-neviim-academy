# Audit Governance

This folder is the control point for audit artifacts that would otherwise sit
around as disconnected reports.

Run:

```bash
npm run audit:governance
```

The command scans audit-like repo artifacts and writes:

- `ops/audit-governance/latest.md`
- `ops/audit-governance/latest.json`
- timestamped report copies in this folder

## Required Audit States

Every audit package should settle into one of these states:

| State | Meaning | Required follow-up |
|---|---|---|
| `implemented_or_proven` | The audit is backed by verification, deployment/readback proof where relevant, or explicit no-finding evidence. | Keep as evidence. |
| `active_requirement_or_task` | The audit has an open mapped `REQ-*`, `TASK-*`, `DEC-*`, or `WATCH-*`. | Work the linked item to a terminal status. |
| `blocked_or_needs_decision` | The audit has a blocker, approval gate, credential gap, or operator decision. | Keep owner, decision, consequence, and next action visible. |
| `needs_task_mapping` | The audit contains likely actionable gaps but no stable mapping. | Convert to a scoped requirement/task/decision/watchdog finding or archive with rationale. |
| `untracked_needs_registration` | The artifact is present locally but not tracked or registered. | Inspect for private data, then register, archive, or intentionally ignore. |
| `archive_candidate` | The audit appears evidence-only and old, without open gap language. | Archive or keep as provenance. |
| `unclear_needs_review` | The scanner cannot safely infer a state. | Human/Codex review required. |

## Closeout Rule

An audit is not done because a report exists. It is done only when the report's
findings are either implemented with proof, linked to an active requirement or
task, blocked with an owner and exact next action, or explicitly archived as
provenance.
