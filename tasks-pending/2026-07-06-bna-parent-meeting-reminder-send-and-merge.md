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
| REQ-20260706-004 | Send the approved BNA parent meeting reminder by WhatsApp and email only to parents tied to current BNA student records. | RAW-20260706-001 | bna_platform / bna_school | Codex | external send | Critical | 2 | REQ-20260706-002; REQ-20260706-003; recipient rebuild | Sent WhatsApp and email counts match the redacted current-student parent recipient audit; Weber/external/stale duplicate records are excluded; Hebrew-tagged parents receive Hebrew copy. | Gmail connector; WAPI/Whapi send endpoint/provider logs; redacted audit record | Provider/API readback | Blocked - email sent, WhatsApp provider auth blocked |
| REQ-20260706-005 | Store the durable communication preferences for future parent sends. | RAW-20260706-001 | bna_platform / communications | Codex | memory | High | 2 | REQ-20260706-004 | Memory records say Hebrew-tagged BNA parent reminders need checked Hebrew, Webers are excluded unless explicitly re-included, and current-student parent scope is preferred for school-wide parent sends. | MEMORY.md; memory-topics/communications-intake.md | No | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260706-001 | bna-parent-meeting-reminder-send | Send current-student parent meeting reminder by WhatsApp and email | Codex | bna_platform / bna_school | RAW-20260706-001 | REQ-20260706-004 | Email is sent; re-authorize WAPI/Whapi channel before retrying WhatsApp sends. | Pending | Blocked on WAPI channel authorization |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-001 | Whether Shloimie's natural-language approval is enough for this exact send. | None after latest correction. | Shloimie | Treat the latest "I approve it... send it" wording as explicit approval. | Require a typed passphrase despite the correction. | Typed phrase would block an urgent obvious send and conflicts with the latest operator correction. | Proceed with the exact approved copy and audited current-student recipient list. | None | Resolved |
| DEC-20260706-002 | WAPI/Whapi send channel authorization is missing for WhatsApp sends. | Active WAPI/Whapi channel authorization / provider re-connect. | Shloimie / account owner | Re-authorize the WhatsApp channel in WAPI/Whapi, then retry the same redacted recipient set. | Use another approved WhatsApp sender path if explicitly selected and audited. | WhatsApp reminders cannot be sent by the configured API; email reminders are already sent. | Reconnect/authorize the WAPI/Whapi channel and rerun the approved WhatsApp send for `RAW-20260706-001`. | REQ-20260706-004 | Blocked |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260706-001 | Should future BNA school-wide parent sends include signup-only second-parent contacts when they are not attached to a current canonical student record? | This affects recipient breadth and privacy. | No for this send; this send is scoped to current student-linked parents only. | Deferred |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260706-001 | Clear natural-language approval from Shloimie is sufficient for an exact prepared send when recipient segment and copy are obvious; typed magic phrases must not be an extra blocker in that case. | yes | Durable operating preference and prevents repeated friction. |
| MEM-20260706-002 | Hebrew-tagged BNA parents should receive normal readable Hebrew copy for parent reminders; block mojibake/repeated question marks. | yes | Durable communication preference. |
| MEM-20260706-003 | The Webers left and should not be included in BNA parent meeting reminder sends unless Shloimie explicitly re-includes them. | yes | Durable parent-recipient exclusion for this communication category. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260706-001 | MEMORY.md; memory-topics/communications-intake.md; AGENTS.md | Patched durable approval rule. | Pending closeout checks. | Pending | Pending | n/a |
| REQ-20260706-002 | Live Postgres `bna_students`/signups/merge events | Used merge endpoint/readback plus one stale-state DB repair for the already-merged Weber source. | DB readback: source `#21982` inactive/merged into `#82261`, signup `#9` points to `#82261`. | n/a | n/a | Production DB readback passed |
| REQ-20260706-003 | Live Postgres `bna_students`/signups/merge events | Used merge endpoint for Menachem. | DB readback: source `#79458` inactive/merged into `#2800`, signup `#12` points to `#2800`, merge event `#2`. | n/a | n/a | Production DB readback passed |
| REQ-20260706-004 | Gmail connector; WAPI/Whapi send path | Sent individual emails; attempted WAPI first WhatsApp send and blocked on provider auth. | Gmail sent IDs recorded in audit; WAPI communication `#2396` failed with provider `401 need channel authorization for send message`. | n/a | n/a | Gmail readback passed; WAPI blocked |
| REQ-20260706-005 | MEMORY.md; memory-topics/communications-intake.md | Patched durable recipient/language preferences. | Pending closeout checks. | Pending | Pending | n/a |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-001 | Done | Durable natural-language approval rule added. | AGENTS.md; MEMORY.md; memory-topics/communications-intake.md | Pending closeout checks. | None. |
| REQ-20260706-002 | Done | Merge endpoint reported already merged; stale active source repaired. Readback: `#21982` inactive/merged into `#82261`, signup `#9` canonical `#82261`. | Live DB plus this redacted audit. | Production DB readback. | None. |
| REQ-20260706-003 | Done | Merge endpoint merged source `#79458` into target `#2800`; merge event `#2`. Signup `#12` now canonical `#2800`. | Live DB plus this redacted audit. | Production DB readback. | None. |
| REQ-20260706-004 | Blocked - email sent, WhatsApp provider auth blocked | Gmail sent 5 individual emails: 3 Hebrew and 2 English. WhatsApp candidate list had 8 phones: 4 Hebrew and 4 English; first WAPI attempt `#2396` failed with provider 401 `need channel authorization for send message`, so the remaining WhatsApp sends were not attempted. | Gmail connector; WAPI log; ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-AUDIT.md | Gmail tool responses; WAPI DB readback. | Re-authorize WAPI/Whapi channel, then retry WhatsApp. |
| REQ-20260706-005 | Done | Current-student parent scope, Weber exclusion, Hebrew readability check, and natural-language approval correction recorded. | AGENTS.md; MEMORY.md; memory-topics/communications-intake.md | Pending closeout checks. | None. |
