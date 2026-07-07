# RAW-20260707-001 - One Time Mailbox Status Question

Source: `codex_chat`

Created: 2026-07-07 Asia/Jerusalem

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Privacy classification: provider operations status question. Do not commit raw
email bodies, sender addresses, received-email ids, subjects, passwords, or
message content.

## Raw intake

Shloimie asked:

> What's the story with the emails in the rabbi's account? Is he able to view them in the inbox yet? And what happens to all the emails that people are sending in the interim? Do they just disappear, or are you keeping track of them?

## Parsed result

- This is a status/readback question, not a new implementation request.
- Existing source of truth:
  - `RAW-20260706-909` built the One Time CRM mailbox MVP.
  - `RAW-20260706-951` backfilled old Resend received emails into the mailbox.
- Current live no-content readback on 2026-07-07:
  - `https://join.onetimeonetime.com` One Time instance smoke passed.
  - Public provider page still contains the Mailbox UI and provider mailbox endpoint.
  - Anonymous mailbox API access returned `Provider session is required`.
  - Authenticated provider login succeeded using the local keyholder credential.
  - Live mailbox returned inbox address `info@onetimeonetime.com`.
  - Live mailbox returned 15 threads, 16 total messages, 9 inbound messages, and 7 outbound messages.
  - Readiness showed inbound webhook configured, mailing address configured, reply send allowed, and bulk campaign send still disabled.

## Closeout

Status: answered from live readback.

No app code, external send, payment/access, DNS/provider mutation, Drive write,
or production data mutation was performed by this status check.
