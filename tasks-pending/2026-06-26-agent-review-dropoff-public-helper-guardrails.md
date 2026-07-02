# Agent Review Drop-off and Public Helper Guardrails - 2026-06-26

## Raw intake

Preserved in `raw-input/RAW-20260626-003-agent-review-dropoff-public-helper-guardrails.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260626-003 |
| Source | codex_chat attachment |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-26-agent-review-dropoff-public-helper-guardrails.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Repair Agent Mode drop-off self-save behavior and public helper unsafe Tier-3 task creation, including raw/register intake, implementation, tests, deploy/live verification or precise blockers. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260626-109 through REQ-20260626-115 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260626-109 | Verify current master/deployed Agent Review and helper state | RAW-20260626-003 | bna/bna | Codex | baseline/live-readback | P0 | A | none | Master SHA, local SHA, deployed SHA/deployment, Issue #24, PR #33/#34/#35 live status, live Agent Review Hub smoke, live Agent Mode drop-off smoke, and production readback for operations-super-admin/first-agent-pilot/negative probe/task #1738 are recorded. | TBD | yes | Pending |
| REQ-20260626-110 | Force Agent Mode prompts and hub UX to self-save results | RAW-20260626-003 | bna/bna | Codex | implementation | P0 | B | REQ-20260626-109 baseline | Prompts require direct hub/API self-save; successful final answer starts `SAVED AGR-`; manual/download answers are disallowed except `DROP-OFF FAILED`; emergency paste JSON and save fallback exists. | TBD | yes | Pending |
| REQ-20260626-111 | Add strict Agent Review acceptance and idempotency tests | RAW-20260626-003 | bna/bna | Codex | tests | P0 | B | REQ-20260626-110 | Tests fail for download/manual-upload language unless explicit drop-off failure; tests prove API returns AGR ID, UI displays saved result, and idempotency key reruns safely. | TBD | no | Pending |
| REQ-20260626-112 | Block public/anonymous/wrong-role helper Tier-3 task creation | RAW-20260626-003 | bna/bna | Codex | implementation/security | P0 | C | REQ-20260626-109 baseline | Public/anonymous/wrong-role helpers refuse Tier-3 actions, create no normal task, no Codex Queue item, and no deployment request; only redacted audit is allowed. | TBD | yes | Pending |
| REQ-20260626-113 | Add helper unsafe-action boundary tests | RAW-20260626-003 | bna/bna | Codex | tests/security | P0 | C | REQ-20260626-112 | Tests cover deploy, Railway push, class backfill, student contact info, DNS, card charge, WhatsApp to all parents, Vimeo upload, and production worker retry across public/anonymous/wrong-role actors. | TBD | no | Pending |
| REQ-20260626-114 | Inspect and neutralize task #1738 if it is an unsafe public task | RAW-20260626-003 | bna/bna | Codex | production-data-repair | P0 | C | REQ-20260626-109 baseline, REQ-20260626-112 policy | Task #1738 is read back; if executable, it is superseded/reclassified as invalid public unsafe request with audit note and no deleted history. | TBD | yes | Pending |
| REQ-20260626-115 | Deploy, run live smokes, and close out owner-pilot readiness | RAW-20260626-003 | bna/bna | Codex | deploy/live-verification | P0 | D | REQ-20260626-110 through REQ-20260626-114 | npm test, watchdog actions/links/security, secrets audit, Agent Review Hub live smoke, Agent Mode drop-off smoke, public helper unsafe-action live smoke, owner pilot idempotency rerun, and final safe-to-resume verdict are recorded. | TBD | yes | Pending |

## Parsed tasks

No new default visible human Tasks should be created from this packet. This is
Codex/system work under the agent lifecycle. If deployment, production readback,
or task #1738 repair is blocked by missing access, create or update one concise
Decision/blocker instead of creating duplicate Tasks.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260626-003 | agent-review-dropoff-public-helper-guardrails | Repair Agent Review self-save and public helper Tier-3 guardrails | Codex | bna/bna | RAW-20260626-003 | REQ-20260626-109..115 | Begin live/code baseline. | Agent work / Activity | running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260626-001 | Deploy/live repair access if standard deploy path is unavailable | Whether current Railway/GitHub credentials permit merge/deploy/live smoke from this workspace | Codex/operator if access fails | Use the existing standard BNA deploy and smoke path if available. | Leave the work locally verified and blocked with exact failing command. | App-visible/server-visible work cannot be marked Done without deploy/live proof. | Attempt standard checks/deploy only after local tests pass; record exact blocker if denied. | REQ-20260626-115 | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260626-001 | Did the owner pilot create any AGR row for `operations-super-admin:first-agent-pilot`? | Determines whether the pilot can be resumed idempotently or needs manual recovery. | No, discovery is part of REQ-20260626-109. | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260626-001 | Public/anonymous helpers must refuse Tier-3 mutation requests and must not create executable tasks or Codex Queue work for them. | Maybe after implementation | Stable safety invariant if not already covered by current helper/action rules. |
| MEM-20260626-002 | Agent Review prompts must require self-save through the BNA hub/API and only say the window is safe to close after an AGR is visible in BNA. | Maybe after implementation | Durable operating rule for Agent Mode audits. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260626-109 | TBD | Inspect Git/GitHub/Railway/live APIs before edits. | Pending | Pending | Pending | Pending |
| REQ-20260626-110 | TBD | Harden prompt text, hub UI, emergency fallback. | Pending | Pending | Pending | Pending |
| REQ-20260626-111 | TBD | Add strict prompt/drop-off tests. | Pending | Pending | Pending | Pending |
| REQ-20260626-112 | TBD | Add centralized Tier-3 unsafe-action guard before task/job creation. | Pending | Pending | Pending | Pending |
| REQ-20260626-113 | TBD | Add role/scope boundary tests. | Pending | Pending | Pending | Pending |
| REQ-20260626-114 | TBD | Read task #1738 and neutralize if needed. | Pending | Pending | Pending | Pending |
| REQ-20260626-115 | TBD | Deploy and live-smoke, or record exact blocker. | Pending | Pending | Pending | Pending |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260626-109 | Pending |  |  |  |  |
| REQ-20260626-110 | Pending |  |  |  |  |
| REQ-20260626-111 | Pending |  |  |  |  |
| REQ-20260626-112 | Pending |  |  |  |  |
| REQ-20260626-113 | Pending |  |  |  |  |
| REQ-20260626-114 | Pending |  |  |  |  |
| REQ-20260626-115 | Pending |  |  |  |  |
