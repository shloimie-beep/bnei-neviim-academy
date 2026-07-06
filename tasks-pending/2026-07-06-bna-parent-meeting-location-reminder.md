# BNA Parent Meeting Location Reminder - 2026-07-06

## Raw intake

Source: `RAW-20260706-001`

Operator requested a WhatsApp and email to all BNA parents with Hebrew copy for Hebrew-tagged parents, reminding them that today, Monday, July 6, 2026, the meeting is at 8 Havakuk Hanavi, Ramat Beit Shemesh Gimel. Operator corrected that the Webers left and must not be included, and asked that Hebrew rendering/grammar be checked because a previous Hebrew message came out corrupted.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-bna-parent-meeting-location-reminder.md |
| Send packet | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260706-001 | Preserve the raw reminder request and memory correction. | RAW-20260706-001 | bna / bna | Codex | intake | high | reminder-prep | none | Raw file and daily memory entry exist. | raw-input/RAW-20260706-001-bna-parent-meeting-location-reminder.md; memory/2026-07-06.md | no | Done |
| REQ-20260706-002 | Audit the BNA parent recipient source without exposing raw contacts. | RAW-20260706-001 | bna / bna | Codex | communications | high | reminder-prep | none | Redacted recipient counts identify candidate email/WhatsApp recipients and explicitly exclude Weber records. | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md | no | Done |
| REQ-20260706-003 | Create clean English and Hebrew reminder copy and run a Hebrew readability check. | RAW-20260706-001 | bna / bna | Codex | communications | high | reminder-prep | REQ-20260706-002 | English/Hebrew copy is grammatically clean; Hebrew contains Hebrew characters and no repeated question-mark corruption. | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md | no | Done |
| REQ-20260706-004 | Send the WhatsApp and email reminder to all approved BNA parent recipients. | RAW-20260706-001 | bna / bna | Shloimie + Codex | external_send | urgent | live-send | REQ-20260706-002; REQ-20260706-003; exact final approval | Live send must use the approved recipient count, exclude Webers, route Hebrew recipients to Hebrew copy, and record provider/readback evidence. | app WAPI/Gmail/Resend send path, pending final approval | yes | Needs operator decision |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-001 | Approve the exact live-send packet for a parent reminder. | Confirmation that the candidate audience is correct: 5 distinct email recipients and 8 distinct WhatsApp numbers after excluding Weber records, with Hebrew routed to 3 email and 4 WhatsApp recipients. | Shloimie | Approve the send packet exactly as prepared if those counts match the intended "all BNA parents" audience. | Send only current-student primary parents; include/exclude second parents differently; use WhatsApp only; use email only. | Sending without this confirmation risks messaging the wrong family or using the wrong sender/list. | Reply with `APPROVE_BNA_PARENT_REMINDER_SEND` after reviewing the counts and copy. | REQ-20260706-004 | Needs operator decision |
| DEC-20260706-002 | Choose/approve the email sender for this BNA parent reminder. | The repo Resend readiness currently points to `info@onetimeonetime.com`, which is not an appropriate BNA parent-reminder sender without explicit approval. Gmail is available as a send path but still requires final approval. | Shloimie | Use the authenticated Gmail account for this one-off BNA parent reminder after approving the packet. | Explicitly approve the OneTimeOneTime Resend sender, or send WhatsApp only. | Wrong sender identity can confuse parents and mix BNA with One Time. | Confirm Gmail or provide/approve a BNA sender. | REQ-20260706-004 | Needs operator decision |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260706-001 | Weber/Huda Weber records should be excluded from BNA parent sends because the family left, unless Shloimie explicitly says otherwise. | yes | Prevents repeated wrong-recipient sends. |
| MEM-20260706-002 | Hebrew-tagged BNA parent contacts must receive Hebrew copy, and Hebrew outbound copy must be checked for corruption before sending. | yes | Operator explicitly repeated this as a durable correction and prior failure mode. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-001 | Done | raw-input/RAW-20260706-001-bna-parent-meeting-location-reminder.md | raw-input/RAW-20260706-001-bna-parent-meeting-location-reminder.md; memory/2026-07-06.md | File created by Codex. | none |
| REQ-20260706-002 | Done | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md | Read-only database audit; no raw contacts committed. | Live send still needs final approval. |
| REQ-20260706-003 | Done | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md | ops/communications/2026-07-06-bna-parent-meeting-reminder/SEND-PACKET.md | Hebrew readability check recorded in packet. | none |
| REQ-20260706-004 | Needs operator decision | DEC-20260706-001; DEC-20260706-002 | none | Not run. | Needs exact approval and sender confirmation before external send. |
