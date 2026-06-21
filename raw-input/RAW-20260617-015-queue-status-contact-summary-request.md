# RAW-20260617-015 - Queue Status And Contact Summary Request

- Source: codex_chat
- Captured at: 2026-06-17T18:38:00+03:00
- Parse status: registered
- Requirement register: `tasks-pending/2026-06-17-queue-status-contact-summary-request.md`

## Raw Text

> Give me a summary for each one of these contacts, these email addresses, of everything that we know about them. Any prior history, communications, notes about them, how much they paid for how long, any additional information that's not in the spreadsheet.Give me an update of what's left there to do. What are you finding is stuck in queue? Because there's a lot of things that I said, and I'm waiting for you to debug everything, fix the queue, and deploy everything so I can see what's working and what I have to say again.It seems like you're doing stuff that's important. I just wanna know, like, what it is. There's a lot of UI changes that I wanted updated, and I wanna know if they're stuck in queue. So what is left in queue for you to do? What was the issue that got stuck? And is our ramble thing protocol gonna work right now to prevent that from happening again?

## Parsed Items

- `REQ-20260617-224`: Produce contact-by-email summaries with history, communications, notes, payments/duration, and extra data not in the spreadsheet.
- `REQ-20260617-225`: Report the current active queue and stuck items.
- `REQ-20260617-226`: Debug and fix the task queue issue that re-opened completed work.
- `REQ-20260617-227`: Confirm whether the ramble/goal-mode protocol is working and what remains.

## Blockers

- `REQ-20260617-224` is blocked until the operator provides the email addresses or spreadsheet/file/range to summarize.
