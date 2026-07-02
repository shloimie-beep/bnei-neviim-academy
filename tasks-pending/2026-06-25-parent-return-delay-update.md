# Ramble Intake - 2026-06-25 - parent return delay update

## Raw intake

Preserved in `raw-input/RAW-20260625-001-parent-return-delay-update.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260625-001 |
| Source | Codex chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-25-parent-return-delay-update.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260625-001 | Send the approved return-delay update to the same deduped parent WhatsApp/email contacts from the 2026-06-25 trip reminder, using Hebrew for Hebrew-tagged families. | RAW-20260625-001 | BNA / school operations | Codex | parent-communication | P0 | send | Existing parent roster from `RAW-20260624-007` | WhatsApp/email sends are logged; Hebrew messages contain real Hebrew and no question-mark corruption; failures are recorded as blockers. | Live DB `bna_contact_communications`; `bna_email_log`; WAPI; Gmail fallback | No | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260625-001 | parent-return-delay-update | Send parent return-delay update by WhatsApp/email using language tags. | Codex | BNA / school operations | RAW-20260625-001 | REQ-20260625-001 | Send completed and verified. | Done / Activity | Done |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260625-001 | Live DB communication logs; WAPI; Gmail fallback | Send English/Hebrew update to deduped active parent contacts from prior roster. | Completed: 10 WhatsApp sent, 0 failed; 6 emails sent, 0 failed. Hebrew readback confirmed real Hebrew and no question-mark corruption. | none | none | not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260625-001 | Done | Live verification returned `whatsapp_sent=10`, `whatsapp_failed=0`, `email_sent=6`, `email_failed=0` for `RAW-20260625-001`. Hebrew rows read back with `body_has_hebrew=true` and `body_has_question_gibberish=false`. | This register; raw intake; live DB communication/email logs. | Inline Node send script completed successfully; `node --test tests/outbound-text-safety.test.js`; `node --check server.js`. | None. |
