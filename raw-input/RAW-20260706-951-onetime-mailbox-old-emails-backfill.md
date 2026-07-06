# RAW-20260706-951 - One Time Mailbox Old Emails Backfill

Source: `codex_chat`

Created: 2026-07-06 Asia/Jerusalem

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Privacy classification: private operator/product support question. Do not
commit raw email bodies, sender addresses, received-email ids, or message
content.

## Raw intake

Shloimie asked what happened to the old emails from the past couple of days,
whether they were disappearing into space, and what happened to the old emails.

## Parsed result

- Live provider mailbox initially showed 4 threads, all outbound CRM rows from
  2026-07-02, with zero inbound Resend-received rows.
- Resend Receiving API showed 9 received emails for `info@onetimeonetime.com`,
  dated 2026-06-29 and 2026-06-30.
- Root cause: the live Resend inbound code existed, but earlier live records
  showed `resend_webhook_configured=false`; those messages were stored by
  Resend but had not been backfilled into first-party `bna_communications`.
- Recovery: replayed the 9 Resend received-email ids through the signed live
  `/api/resend/inbound` handler. The handler fetched real received email
  content from Resend and inserted first-party CRM communication rows.

## Closeout

Status: done/live verified.

Evidence:
`ops/live-smokes/2026-07-06T15-03-36-636Z-one-time-mailbox-resend-backfill.md`.

Guardrails: no email sent, no fake inbound inserted, no raw message bodies or
sender addresses printed/committed, no physical mailing address committed, and
all evidence stores only counts, hashes, and timestamps.
