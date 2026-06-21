# Ramble Intake - YYYY-MM-DD - short-title

## Raw intake

Preserve the operator's words here. Light cleanup for readability is allowed,
but do not remove intent.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-YYYYMMDD-### |
| Source | |
| Parse status | raw |
| Requirement register | |

## Goal-mode execution

Use this section when the operator says `goal mode`, `set it as a goal`,
`finish everything`, `build everything`, `work through the whole output`, or
similar.

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | |
| Goal tool used | no |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | |

## Parsed requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|

## Decisions

| ID | Decision | Impact | Where stored | Status |
|---|---|---|---|---|

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|

Allowed statuses:

- Raw
- Parsed
- Registered
- Pending
- Done
- Already satisfied
- Blocked
- Failed
- Needs operator decision
- Archived
