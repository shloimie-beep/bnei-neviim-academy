# RAW-20260708-020 - Codex Telegram done updates

Source: Codex chat
Captured: 2026-07-08
Channel: codex_chat
Workspace/project: bna_platform / one_time_mishnah_class
Parse status: registered

## Raw Operator Input

> I also need a very brief bullet points in terms of the tasks that are getting done to jump up on the telegram bot it's just summarize the test every time something gets done so I know like I just saw you say that wappy we're having a problem with wappy so I want to know what the deal is with that I don't know why that's problematic

## Parsed Requirement

- `REQ-20260708-076`: Codex completion updates should send short bullet-point
  Telegram summaries for completed work: what got done, what was verified, what
  is blocked if anything, and the next step.

## WAPI Explanation To Preserve

- Current WAPI/WhatsApp problem: live OneTime WhatsApp sends are blocked because
  Rabbi-scoped WAPI/Whapi sender credentials are not configured/verified yet.
  The app is intentionally preventing WhatsApp sends until the intended
  OneTime/Rabbi sender token/account is present and the send approval gate is
  satisfied.
