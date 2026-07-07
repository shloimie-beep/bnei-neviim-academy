# Ramble Intake - 2026-07-07 - Agent Mode Navigation Template Correction

## Raw intake

Source raw record:
`raw-input/RAW-20260707-007-agent-mode-navigation-template-correction.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260707-007 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-07-agent-mode-navigation-template-correction.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260707-070 | Convert Agent Mode prompt style into a reusable navigation-first template. | RAW-20260707-007 | BNA Operations / One Time | Codex | prompt-template | P0 | 1 | existing Operations drop-off | Template names exact start point, click path, failure reporting, and drop-off requirement. | `ops/prompt-packets/.../AGENT-MODE-NAVIGATION-TEMPLATE.md` | no | Done |
| REQ-20260707-071 | Update One Time view-as prompts with exact Super Admin to Rabbi/student navigation steps. | RAW-20260707-007 | One Time | Codex | prompt-packet | P0 | 1 | REQ-20260707-070 | Prompt 02/03 tell agents to start in Operations, select One Time/Rabbi inbox, click `Open Rabbi Provider Portal`, then use `Student View` and `Classroom` from the provider portal. | prompt files, tests | no | Done |
| REQ-20260707-072 | Require autonomous drop-off for failures. | RAW-20260707-007 | BNA Operations | Codex | agent-dropoff | P0 | 1 | REQ-20260707-070 | Prompts say blocked/broken navigation must still be saved in Operations as `BLOCKED` or `FAIL`; chat-only output is last resort only. | prompt files, tests | no | Done |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260707-070 | Done | Added reusable `AGENT-MODE-NAVIGATION-TEMPLATE.md` with required Operations start point, Super Admin workspace switcher, One Time/Rabbi selection, provider portal path, student/classroom path, and mandatory drop-off rules. | `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/AGENT-MODE-NAVIGATION-TEMPLATE.md`, `README.md`, `agent-mode-prompt-series.json`, `memory-topics/ui-quality-goals.md` | PASS `node --test tests/agent-mode-operations-dropoff-prompts.test.js`; PASS JSON parse for `agent-mode-prompt-series.json`; PASS `git diff --check`; PASS `npm run watchdog:protocol-drift` with 0 findings. | n/a |
| REQ-20260707-071 | Done | Updated prompts 02 and 03 with explicit `/operations` -> workspace switcher -> Rabbi / One Time inbox -> `Open Rabbi Provider Portal` -> `Student View` / `Classroom` click paths. | `02-view-as-navigation-agent-mode.md`, `03-role-perspective-screen-matrix-agent-mode.md`, `tests/agent-mode-operations-dropoff-prompts.test.js` | PASS `view-as prompt files include exact Super Admin to Rabbi and student click paths`. | n/a |
| REQ-20260707-072 | Done | Added machine-checkable failure instructions requiring `BLOCKED` or `FAIL` in the Operations drop-off section, with chat-only output as last resort. | `AGENT-MODE-NAVIGATION-TEMPLATE.md`, `02-view-as-navigation-agent-mode.md`, `03-role-perspective-screen-matrix-agent-mode.md`, `tests/agent-mode-operations-dropoff-prompts.test.js` | PASS `One Time Agent Mode prompt series has a navigation-first template`; PASS `parallel One Time prompt files avoid GitHub-only failure endings`. | n/a |
