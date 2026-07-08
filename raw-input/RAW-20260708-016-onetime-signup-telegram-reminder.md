# RAW-20260708-016 - OneTime Signup Telegram Reminder

Source: codex_chat
Captured at: 2026-07-08T19:40:00+03:00
Workspace/project: Rabbi Scheller / OneTimeOneTime Mishnah
Parse status: registered

## Raw Input

> I also want a reminder on my telegram bot when someone signs up.

## Parsed Requirement

- `REQ-20260708-072`: When a parent signs up through the OneTime public signup
  form, save the first-party lead as before and send Shloimie an internal
  Telegram reminder through the configured BNA/Shloimie Telegram bot.

## Guardrails

- The public signup must remain first-party lead capture.
- The signup must not send a parent/student email, WhatsApp message, checkout,
  payment request, access grant, Zoom mutation, Vimeo/Drive action, or external
  CRM write.
- Telegram notification failure or missing Telegram configuration must not
  block signup completion.
- The Telegram message may include the lead email/name/source and internal
  action reminder, but must escape user-provided values.
