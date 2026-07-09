# Ramble Intake - 2026-07-09 - Audit Governance And Stale Audit Tasking

## Raw intake

Can you check with all these audits that we're doing, which ones we've actually implemented and which ones are just sitting there and stale? And if there's stuff that need to be implemented, like that audit, that seems like a good audit. Like, what's the deal? Did we end up doing those things? And we have to have a place for all these audits and all these like random stuff to go so they just don't sit there and get stale. And we have to make sure that the audits don't end up staying just as audits but get turned into tasks if there's just an audit sitting around with obvious gaps in the system.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-005 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-09-audit-governance-and-stale-audit-tasking.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Existing Codex goal remains usage-limited for Rabbi / One Time helper autonomy; this register extends the same autonomy work by preventing audits from becoming stale, unmapped artifacts. |
| Goal tool used | inspected existing goal with `get_goal`; no new goal created because an unfinished usage-limited goal already exists. |
| GPT output contract | n/a |
| Execution directive | Register first, then implement the audit-governance layer and generate the first report. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no, this is repo/process tooling only |
| Next requirement IDs to work | REQ-20260709-023 through REQ-20260709-026 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-023 | Preserve this audit-governance ask as raw intake and a dated requirement register before implementation. | RAW-20260709-005 | BNA operations | Codex | protocol | P0 | 1 | none | Raw input file, memory entry, and this register exist with source provenance. | `raw-input/RAW-20260709-005-audit-governance-and-stale-audit-tasking.md`, `memory/2026-07-09.md`, this file | no | Done |
| REQ-20260709-024 | Add a durable audit-governance home and rule: every audit package with findings must map to proof, a requirement/task, a decision/blocker, a watchdog finding, or an archive status. | RAW-20260709-005 | BNA operations | Codex | protocol | P0 | 1 | REQ-20260709-023 | `ops/audit-governance/README.md` and AGENTS rules define the statuses and closeout path. | `ops/audit-governance/README.md`, `AGENTS.md` | no | Done |
| REQ-20260709-025 | Implement a repeatable audit-artifact governance scanner that inventories audit artifacts and classifies implemented/proven, active/blocked, unmapped stale findings, untracked packages, archive candidates, and unclear review items. | RAW-20260709-005 | BNA operations | Codex | tooling | P0 | 1 | REQ-20260709-024 | `npm run audit:governance` writes `ops/audit-governance/latest.md` and `latest.json`; tests cover classification. | `scripts/audit-artifact-governance.mjs`, `tests/audit-artifact-governance.test.js`, `package.json` | no | Done |
| REQ-20260709-026 | Run the first audit-governance report and record which audit families are implemented/proven, active/blocked, stale/unmapped, or untracked. | RAW-20260709-005 | BNA operations | Codex | audit | P0 | 1 | REQ-20260709-025 | Report generated and linked in this register, ledger, and changelog; any obvious unmapped gaps become listed next actions rather than silent audit files. | `ops/audit-governance/latest.md`, `ops/audit-governance/latest.json` | no | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260709-007 | audit-governance-control-tower | Add audit artifact governance scanner and first stale-audit report | Codex | BNA operations | RAW-20260709-005 | REQ-20260709-024, REQ-20260709-025, REQ-20260709-026 | First scanner/report implemented; legacy bulk conversion is held behind DEC-20260709-006. | repo/process | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260709-006 | Decide whether legacy unmapped audit findings should be auto-converted into live Operations tasks in bulk after the first governance report. | Which historical audit findings are still desired versus superseded/archive-only. | Shloimie | Do not auto-create dozens of live tasks in this pass; first generate the report, then batch the highest-confidence stale gaps into scoped registers or visible tasks. | Auto-create all findings as tasks; archive all old audits without review. | Bulk auto-tasking can flood the dashboard or revive superseded work; archiving everything can hide real gaps. | Review `ops/audit-governance/latest.md` stale/unmapped section and approve the next conversion batch. | Legacy bulk conversion only; does not block adding the scanner/report. | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260709-004 | Which stale audit family should be converted into live implementation tasks first after this report: One Time visual/UI, queue/task reconciliation, historical full-system audit, or provider/workspace parity? | This determines the next implementation batch once the report surfaces the stale candidates. | no | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260709-005 | Audit outputs are not terminal work by themselves; audit findings with obvious gaps must map to proof, a requirement/task, a decision/blocker, a watchdog finding, or an explicit archive status. | yes, via AGENTS protocol rule instead of MEMORY.md | This is a durable operating rule for all future BNA audit work. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260709-024 | `ops/audit-governance/README.md`, `AGENTS.md` | Added audit governance statuses and closeout rules. | Manual readback plus scanner tests. | Pending closeout commit | Pending closeout push | n/a |
| REQ-20260709-025 | `scripts/audit-artifact-governance.mjs`, `tests/audit-artifact-governance.test.js`, `package.json` | Added scanner, report writer, package scripts, grouping for timestamped audit families, and classification tests. | `node --check scripts/audit-artifact-governance.mjs`; `node --test tests/audit-artifact-governance.test.js`; `git diff --check`; `npm run audit:governance`. | Pending closeout commit | Pending closeout push | n/a |
| REQ-20260709-026 | `ops/audit-governance/latest.md`, `ops/audit-governance/latest.json` | Generated first governance report. | Report generated from local repo state; counts recorded in Final audit. | Pending closeout commit | Pending closeout push | n/a |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260709-023 | Done | Raw file and register created. | `raw-input/RAW-20260709-005-audit-governance-and-stale-audit-tasking.md`, this file | File readback during implementation. | none |
| REQ-20260709-024 | Done | `ops/audit-governance/README.md`; AGENTS Audit Artifact Governance rule. | `ops/audit-governance/README.md`, `AGENTS.md` | `node --test tests/audit-artifact-governance.test.js`; manual readback | none |
| REQ-20260709-025 | Done | `scripts/audit-artifact-governance.mjs`; `tests/audit-artifact-governance.test.js`; `npm run audit:governance`. | `scripts/audit-artifact-governance.mjs`, `tests/audit-artifact-governance.test.js`, `package.json` | `node --check scripts/audit-artifact-governance.mjs`; `node --test tests/audit-artifact-governance.test.js`; `git diff --check` | none |
| REQ-20260709-026 | Done | First report generated at `ops/audit-governance/latest.md` and `ops/audit-governance/latest.json`. Current grouped inventory: 343 audit packages; 22 implemented/proven; 61 active-linked; 149 blocked/decision-gated; 51 stale-needing-task-mapping; 20 current-needing-task-mapping; 32 archive candidates; 8 unclear/manual-review; 0 untracked audit packages after staging. | `ops/audit-governance/latest.md`, `ops/audit-governance/latest.json` | `npm run audit:governance` | DEC-20260709-006 controls bulk conversion of the 71 unmapped audit packages into live tasks/requirements. |
