# Ramble Intake - 2026-06-24 - parent trip reminder contact roster

## Raw intake

Preserved in `raw-input/RAW-20260624-007-parent-trip-reminder-contact-roster.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-007 |
| Source | Codex chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-24-parent-trip-reminder-contact-roster.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | none |
| Goal tool used | no |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Contact roster readback, operator-supplied contact corrections, and approved parent reminder send. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no, unless code/UI changes are made |
| Next requirement IDs to work | REQ-20260624-033 through REQ-20260624-038 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-033 | Produce a read-only current BNA parent/student contact roster for Shloimie, including student, parent names where available, phones/WhatsApp numbers, emails, status, and language tags/preferences. | RAW-20260624-007 | BNA / school operations | Codex | contact-roster | P0 | roster | none | Current first-party BNA tables or read-only phonebook/report paths are inspected; output identifies missing/unclear numbers/emails and avoids external sends. | DB read-only query; `server.js`; WAPI phonebook report | No | Done |
| REQ-20260624-034 | Record Amitai family WhatsApp reminder language preference as Hebrew where the current system supports language/tag storage. | RAW-20260624-007 | BNA / school operations | Codex | communications-preference | P0 | preference | REQ-20260624-033 | Amitai record is uniquely identified or blocker documents ambiguity; Hebrew reminder preference is recorded in first-party BNA data/memory without sending messages. | `MEMORY.md`; DB row if uniquely safe | No | Already satisfied |
| REQ-20260624-035 | Send the approved English/Hebrew reminder for the Thursday, 2026-06-25 trip to the available current BNA parent WhatsApp/email contacts after operator correction. | RAW-20260624-007 | BNA / school operations | Codex | parent-communication | P0 | send | REQ-20260624-033, REQ-20260624-036 | Corrected/known parent contact list is deduped; WhatsApp/email sends are logged; Hebrew is used for Hebrew-tagged families; failures are recorded as blockers. | Live DB `bna_contact_communications`; `bna_email_log`; WAPI; Gmail fallback | No | Done |
| REQ-20260624-036 | Apply Shloimie's corrected parent phone details for Eitan Chaim and reconfirm Amitai's Hebrew/phone configuration in first-party BNA records. | RAW-20260624-007 | BNA / school operations | Codex | contact-correction | P0 | update | REQ-20260624-033 | Eitan Chaim signup/student contact fields hold Ayala Galambo as mother with phone ending 1232 and Shalom Galambo as father with phone ending 7660; Amitai's mother phone ending 2874 and Hebrew tags/preferences are present. | Live DB `signups`, `bna_students`, `bna_people`, `bna_persons`, `bna_contact_communications` | No | Done |
| REQ-20260624-037 | Repair the corrupted Hebrew reminder by resending the Hebrew WhatsApp/email messages through a UTF-8-safe path and adding a repeated-question-mark outbound safety guard. | RAW-20260624-007 | BNA / school operations | Codex | communications-repair | P0 | resend | REQ-20260624-035 | Corrupted Hebrew sends are identified; corrected Hebrew resend logs contain real Hebrew and no question-mark corruption; future WAPI/email sends reject repeated-question-mark corruption locally. | Live DB `bna_contact_communications`; `bna_email_log`; `server.js`; `src/lib/bna/outbound-text-safety.js`; `tests/outbound-text-safety.test.js` | Yes for production safeguard; not deployed in this repair turn due unrelated dirty worktree | Done local + sent |
| REQ-20260624-038 | Identify the unclear recipient numbers Shloimie asked about from first-party BNA contact records. | RAW-20260624-007 | BNA / school operations | Codex | contact-lookup | P0 | lookup | REQ-20260624-033 | The partial numbers are matched to BNA contact records or a precise uncertainty is reported. | Live DB read-only contact lookup | No | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-007 | parent-trip-reminder-contact-roster | Review current parent contact roster, provide corrections, approve final reminder recipients/copy, and repair corrupted Hebrew resend. | Shloimie + Codex | BNA / school operations | RAW-20260624-007 | REQ-20260624-033, REQ-20260624-035, REQ-20260624-036, REQ-20260624-037, REQ-20260624-038 | Corrected Hebrew resend completed; number lookups answered; production deploy of the local guard should wait for clean release path. | Done / Activity | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-004 | Approve the final parent reminder send. | Corrected recipient list, final message copy, and explicit go-ahead to send email/WhatsApp. | Shloimie | Review contacts first, correct numbers/emails, approve a final preview, then send. | Send only WhatsApp; send only email; keep as manual copy/paste. | Approval enabled the live reminder send. | Follow-up wording approved adding corrected numbers and sending the reminder by WhatsApp/email to available parent contacts. | REQ-20260624-035 | Decided |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260624-002 | Which corrected phone/email values should replace the existing parent roster values? | Shloimie said he will update from his phone; exact replacements are not known yet. | yes for sending | Answered |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260624-002 | Amitai's family WhatsApp reminders should be Hebrew when the family/student/contact is tagged or configured for Hebrew; messages to Amitai, his mother, and father should be in Hebrew. | yes | Stable communication preference likely to recur. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-033 | First-party BNA DB read-only contact tables; WAPI phonebook report | Query current contacts; produce roster for operator review. | Read-only DB query completed; WAPI phonebook report completed dry-run/read-only. Roster is shown in chat only, not exported to tracked files. | none | none | not required |
| REQ-20260624-034 | `MEMORY.md`; first-party BNA contact/student language fields if safe | Record durable rule now; update live data only if Amitai is uniquely identified and field exists. | Amitai matched one active BNA student record; signup language is `he`; tags include Hebrew reminder/portal signals. Father phone exists on signup, father email is blank. Durable preference added to `MEMORY.md`. | none | none | not required |
| REQ-20260624-035 | Live DB communication logs; WAPI; Gmail fallback | Send approved trip reminder to deduped current BNA parent WhatsApp/email contacts, with Hebrew for Hebrew-tagged families. | Live send completed and logged: 10 WhatsApp sent, 0 failed; 6 email sent, 0 failed. Email used Gmail fallback because Resend sender identity is not configured. | none | none | not required |
| REQ-20260624-036 | Live DB `signups`, `bna_students`, `bna_people`, `bna_persons`, `bna_contact_communications` | Apply Eitan parent phone corrections and ensure Amitai's mother phone/Hebrew tags are present. | Live DB readback after update: Eitan signup id 10 has Ayala phone ending 1232 and Shalom phone ending 7660; Amitai signup id 6 has mother phone ending 2874 and Hebrew tags. | none | none | not required |
| REQ-20260624-037 | Live DB communication/email logs; local WAPI/email sender code | Resend corrected Hebrew from an ASCII-only script using Unicode escapes; add outbound guard that blocks repeated-question-mark corruption. | Corrected resend completed: 4 WhatsApp sent, 0 failed; 3 emails sent, 0 failed. Readback shows `body_has_hebrew=true` and `body_has_question_gibberish=false`. Focused safety test passed. | none | none | Production safeguard not deployed because current worktree contains unrelated active changes. |
| REQ-20260624-038 | Live DB contact tables | Match Shloimie's unclear recipient numbers. | Phone ending 2140 maps to Ahuva Dratler in Menachem/Dratler records. Phone ending 6627 maps to Shmuel, Huda's second parent. | none | none | not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-033 | Done | Read-only DB roster query against `bna_students`, `signups`, `bna_persons`, and `bna_contact_communications`; WAPI phonebook dry-run reported `no_send=true` and `external_write_performed=false`. | None containing roster PII; registration files only. | Query succeeded; output shown in Codex chat. | Contact corrections later supplied under `REQ-20260624-036`. |
| REQ-20260624-034 | Already satisfied | Amitai active student record has `form_language=he` and Hebrew tags; `MEMORY.md` now records the durable preference. | `MEMORY.md`, this register. | DB readback found Amitai's Hebrew settings. | Father email is blank; father phone exists. |
| REQ-20260624-035 | Done | Follow-up approval captured; live verification query returned `whatsapp_sent=10`, `whatsapp_failed=0`, `email_sent=6`, `email_failed=0` for `RAW-20260624-007`. | This register; `raw-input/RAW-20260624-007-parent-trip-reminder-contact-roster.md`; live DB communication/email logs. | Inline Node update/send script completed successfully. | None for this reminder. |
| REQ-20260624-036 | Done | Live DB update/readback confirmed Eitan parent contacts and Amitai Hebrew/phone settings; full phone values are kept in live DB, not tracked repo files. | This register; `raw-input/RAW-20260624-007-parent-trip-reminder-contact-roster.md`; live DB contact fields. | Inline Node update/send script completed successfully. | None. |
| REQ-20260624-037 | Done local + sent | Corrected Hebrew resend logs: WhatsApp ids 2147, 2149, 2151, 2153 and email log ids 64, 65, 66 all have Hebrew text and no question-mark corruption. Local code now blocks repeated-question-mark outbound corruption. | `server.js`; `src/lib/bna/outbound-text-safety.js`; `tests/outbound-text-safety.test.js`; this register; live DB logs. | `node --test tests/outbound-text-safety.test.js`; `node --check server.js`; live DB readback. | Production deploy of the local guard still needs a clean release path. |
| REQ-20260624-038 | Done | Read-only DB lookup matched 2140 to Ahuva Dratler and 6627 to Shmuel/Huda second parent. | This register only. | Live DB lookup query completed. | If Shloimie meant a different partial number than ending 6627, more digits are needed. |
