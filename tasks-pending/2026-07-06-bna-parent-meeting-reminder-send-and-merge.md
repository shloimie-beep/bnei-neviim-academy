# Ramble Intake - 2026-07-06 - BNA Parent Meeting Reminder Send And Merge

## Raw intake

Raw source preserved at:

- `raw-input/RAW-20260706-001-bna-parent-meeting-reminder-send-and-merge.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-bna-parent-meeting-reminder-send-and-merge.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Register first, merge duplicate records, rebuild current-student parent recipients, send approved WhatsApp/email reminders, then record proof. |
| Terminal statuses required | Done / Blocked / Needs operator decision / Failed |
| Deploy/live-smoke required for app-visible work | no app deploy; production DB/provider readback required |
| Next requirement IDs to work | REQ-20260706-001 through REQ-20260706-005 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260706-001 | Accept Shloimie's clear natural-language approval for the exact parent-reminder send; remove the typed magic phrase as an extra blocker for obvious approvals. | RAW-20260706-001 | bna_platform / communications | Codex | protocol/memory | High | 1 | None | MEMORY/communications protocol records state that obvious natural-language approval is sufficient for exact prepared sends, while ambiguous/high-risk actions still require blocking. | MEMORY.md; memory-topics/communications-intake.md; AGENTS.md | No | Done |
| REQ-20260706-002 | Merge duplicate Huda/Hooda Weber records into one archived/inactive duplicate state. | RAW-20260706-001 | bna_platform / bna_school | Codex | student identity | High | 1 | Current DB readback | Duplicate Weber source record is inactive/merged or already archived under the canonical target; signup links point to the canonical student where applicable. | Live Postgres; redacted audit record | Production DB readback | Done |
| REQ-20260706-003 | Merge duplicate Menachem records into one canonical current student record. | RAW-20260706-001 | bna_platform / bna_school | Codex | student identity | High | 1 | Current DB readback | Duplicate Menachem source record is inactive/merged under the canonical target; signup links point to the canonical student where applicable. | Live Postgres; redacted audit record | Production DB readback | Done |
| REQ-20260706-004 | Send the approved BNA parent meeting reminder by WhatsApp and email only to parents tied to current BNA student records, then send the Weber wording addendum after Shloimie's correction. | RAW-20260706-001 | bna_platform / bna_school | Codex | external send | Critical | 2 | REQ-20260706-002; REQ-20260706-003; recipient rebuild | Sent WhatsApp and email counts match the redacted current-student parent recipient audit; Hebrew-tagged parents receive Hebrew copy; addendum clarifies the Webers are away/on vacation and not hosting today, not permanently gone. | Gmail connector; WAPI/Whapi send endpoint/provider logs; redacted audit record | Provider/API readback | Done |
| REQ-20260706-005 | Store the durable communication preferences and Weber correction for future parent sends. | RAW-20260706-001 | bna_platform / communications | Codex | memory | High | 2 | REQ-20260706-004 | Memory records say Hebrew-tagged BNA parent reminders need checked Hebrew, current-student parent scope is preferred for school-wide parent sends, and the July 6 Weber note means away/on vacation and not hosting today, not a permanent hosting change. | MEMORY.md; memory-topics/communications-intake.md | No | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260706-001 | bna-parent-meeting-reminder-send | Send current-student parent meeting reminder by WhatsApp and email | Codex | bna_platform / bna_school | RAW-20260706-001 | REQ-20260706-004 | Email and WhatsApp reminders sent; Weber wording correction addendum sent; preserve redacted proof. | Done / Activity | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-001 | Whether Shloimie's natural-language approval is enough for this exact send. | None after latest correction. | Shloimie | Treat the latest "I approve it... send it" wording as explicit approval. | Require a typed passphrase despite the correction. | Typed phrase would block an urgent obvious send and conflicts with the latest operator correction. | Proceed with the exact approved copy and audited current-student recipient list. | None | Resolved |
| DEC-20260706-002 | WAPI/Whapi send channel authorization is missing for WhatsApp sends. | Resolved by retry. | Shloimie / account owner | Retry the same redacted recipient set after channel authorization. | Use another approved WhatsApp sender path if explicitly selected and audited. | WhatsApp was blocked until the channel was authorized. | Completed retry for `RAW-20260706-001`. | None | Resolved |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260706-001 | Should future BNA school-wide parent sends include signup-only second-parent contacts when they are not attached to a current canonical student record? | This affects recipient breadth and privacy. | No for this send; this send is scoped to current student-linked parents only. | Deferred |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260706-001 | Clear natural-language approval from Shloimie is sufficient for an exact prepared send when recipient segment and copy are obvious; typed magic phrases must not be an extra blocker in that case. | yes | Durable operating preference and prevents repeated friction. |
| MEM-20260706-002 | Hebrew-tagged BNA parents should receive normal readable Hebrew copy for parent reminders; block mojibake/repeated question marks. | yes | Durable communication preference. |
| MEM-20260706-003 | 2026-07-06 correction: the Webers are just away/on vacation and are not hosting today's meeting. Do not describe them as permanently gone or permanently no longer hosting unless Shloimie explicitly says that later. | yes | Durable correction to prevent repeating the wrong wording. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260706-001 | MEMORY.md; memory-topics/communications-intake.md; AGENTS.md | Patched durable approval rule. | Pending closeout checks. | Pending | Pending | n/a |
| REQ-20260706-002 | Live Postgres `bna_students`/signups/merge events | Used merge endpoint/readback plus one stale-state DB repair for the already-merged Weber source. | DB readback: source `#21982` inactive/merged into `#82261`, signup `#9` points to `#82261`. | n/a | n/a | Production DB readback passed |
| REQ-20260706-003 | Live Postgres `bna_students`/signups/merge events | Used merge endpoint for Menachem. | DB readback: source `#79458` inactive/merged into `#2800`, signup `#12` points to `#2800`, merge event `#2`. | n/a | n/a | Production DB readback passed |
| REQ-20260706-004 | Gmail connector; WAPI/Whapi send path | Sent individual emails; initial WAPI attempt blocked on provider auth; Shloimie approved retry; retry sent all WhatsApp candidates; then sent Weber correction addendum by WhatsApp and email. | Gmail sent IDs recorded in audit; WAPI communication `#2396` failed before authorization; retry communications `#2397` through `#2404` sent/delivered/read; addendum WAPI communications `#2406`, `#2407`, `#2408`, `#2410`, `#2411`, `#2412`, `#2413`, and `#2414` show sent/read outcomes; addendum Gmail IDs recorded. | n/a | n/a | Gmail and WAPI provider readback passed |
| REQ-20260706-005 | MEMORY.md; memory-topics/communications-intake.md | Patched durable recipient/language preferences and corrected Weber wording. | Pending closeout checks. | Pending | Pending | n/a |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-001 | Done | Durable natural-language approval rule added. | AGENTS.md; MEMORY.md; memory-topics/communications-intake.md | Pending closeout checks. | None. |
| REQ-20260706-002 | Done | Merge endpoint reported already merged; stale active source repaired. Readback: `#21982` inactive/merged into `#82261`, signup `#9` canonical `#82261`. | Live DB plus this redacted audit. | Production DB readback. | None. |
| REQ-20260706-003 | Done | Merge endpoint merged source `#79458` into target `#2800`; merge event `#2`. Signup `#12` now canonical `#2800`. | Live DB plus this redacted audit. | Production DB readback. | None. |
| REQ-20260706-004 | Done | Gmail sent 5 individual reminder emails: 3 Hebrew and 2 English. WhatsApp retry sent all 8 reminder candidates: 4 Hebrew and 4 English. Initial WAPI attempt `#2396` failed before channel authorization; retry records `#2397` through `#2404` are sent/delivered/read with no follow-up required. Correction addendum sent by WhatsApp to 8 recipients via records `#2406`, `#2407`, `#2408`, `#2410`, `#2411`, `#2412`, `#2413`, and `#2414`, and by Gmail to 5 recipients via IDs recorded in the audit. | Gmail connector; WAPI log; ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-AUDIT.md | Gmail tool responses; WAPI DB readback. | None. |
| REQ-20260706-005 | Done | Current-student parent scope, corrected Weber wording, Hebrew readability check, and natural-language approval correction recorded. | AGENTS.md; MEMORY.md; memory-topics/communications-intake.md | Pending closeout checks. | None. |
