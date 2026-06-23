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

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Parsed tasks

Do not fan out one broad source into dozens of visible Tasks. Collapse related
source statements into canonical executable requirements and only create visible
Tasks for clear human actions.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|

## Decisions

Use one Decision per external blocker. Record the owner, recommended option,
alternatives, consequences, and exact action required.

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|

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
