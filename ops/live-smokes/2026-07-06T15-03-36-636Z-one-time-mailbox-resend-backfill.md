# One Time Mailbox Resend Backfill

Checked: 2026-07-06T15:03:36.636Z

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Raw intake: `RAW-20260706-951`

## Result

PASS. The old received emails were not gone. They were still in Resend, but
they had not been stored in the first-party CRM mailbox because the earlier
live deployment recorded Resend receiving as blocked by missing webhook config.

I backfilled the 9 real Resend received emails for `info@onetimeonetime.com`
through the deployed signed inbound handler. No email was sent.

## Before

| Source | Count |
|---|---:|
| Provider mailbox threads | 4 |
| Inbound messages in provider mailbox | 0 |
| Outbound messages in provider mailbox | 4 |

The 4 CRM threads were all outbound rows from 2026-07-02.

## Resend Readback

| Check | Result |
|---|---:|
| Resend received emails returned | 9 |
| `info@onetimeonetime.com` received emails | 9 |
| Recent within 10 days | 9 |
| Earliest received | 2026-06-29T14:44:46.683Z |
| Latest received | 2026-06-30T11:43:35.688Z |

## Backfill

| Check | Result |
|---|---:|
| Signed replay attempts | 9 |
| Successful inserts | 9 |
| Ignored | 0 |
| Duplicates | 0 |
| Communication ids | 17-25 |

The replay used actual Resend received-email ids and the deployed
`POST /api/resend/inbound` handler, so the normal Received Email API fetch,
routing, dedupe, contact creation, and `bna_communications` insert logic ran.

## After

| Check | Result |
|---|---:|
| Provider mailbox status | 200 |
| Threads | 12 |
| Inbound messages | 9 |
| Outbound messages | 4 |
| Threads with Resend received ids | 8 |
| Threads with attachment metadata | 1 |

The date range for the restored inbound messages is 2026-06-29T14:44:46.683Z
through 2026-06-30T11:43:35.688Z.

## Guardrails

- No external email was sent.
- No fake inbound message was inserted.
- No raw email bodies, sender addresses, received-email ids, or subjects are
  recorded here.
- Evidence stores counts, hashes, timestamps, and communication ids only.
