# RAW-20260709-012 - Rabbi Telegram bot WhatsApp instructions

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-09T19:51:00+03:00
- Parse status: implemented
- Requirement IDs: `REQ-20260709-069`
- Linked blocker: `DEC-20260708-021`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Privacy classification: contact_private

## Raw Intake

> Text the Rabbi Scheller, the Telegram bot instructions. Really send it to
> his WhatsApp. I'll give you the name of the, the Telegram bot should be
> active. I gave you the key already. Everything should be plugged in, you just
> tell him what he needs to do. He might need to send you his ID, his Telegram
> ID. So send him that WhatsApp.

## Parsed Requirement

- `REQ-20260709-069`: Send one WhatsApp from the Rabbi/OneTime WAPI sender to
  Rabbi Elie Scheller's saved WhatsApp number with instructions to start the
  OneTime Telegram bot and send back the Telegram chat ID or confirmation that
  he messaged the bot.

## WhatsApp Copy Sent

```text
Hi Rabbi Elie, the OneTime Telegram bot is ready for your account.

Please open this bot and press Start, or send it any short message:
https://t.me/onetimeaios_bot

After that, please send me your Telegram ID/chat ID, or just reply here that you messaged the bot. Once I see the bot update, I can connect your Telegram notifications for OneTime.

Thank you.
```

## Preflight

- Rabbi Telegram no-send readiness still reported the Rabbi bot token and One
  Time Operations credentials configured, but
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` missing.
- `npm run telegram:rabbi:chat-id` resolved bot username `onetimeaios_bot`,
  sent no message, printed no token, and found 0 pending chat candidates.
- Live provider readback resolved exactly one approved Rabbi Elie Scheller
  provider record for `one_time_mishnah_class`, with a saved WhatsApp number
  ending `3006`.

## Resolution

- WhatsApp sent on 2026-07-09 from the OneTime/Rabbi WAPI sender.
- Recipient: saved Rabbi provider WhatsApp contact ending `3006`.
- Sender/account health: Whapi status `AUTH`, business account `true`, sender
  ending `8614`.
- Live communication row: `bna_contact_communications#2909`.
- Provider send result: `status_code=200`, message id present, message id
  fingerprint `6497d51fc20f`.
- Live raw intake readback: `RAW-20260709-012` parse status `implemented`.
- Post-send Telegram chat-ID readback later found 4 candidates from 1 unique
  masked private chat `******4810`.
- Ignored local runtime config now has the verified chat ID under the Rabbi and
  OneTime chat ID aliases.
- OneTime Railway production variable keys were set for the same chat ID aliases
  with values hidden and `--skip-deploys`; no deploy was triggered.
- No-send Rabbi Telegram readiness now reports the Rabbi token, chat ID, and
  OneTime Operations credentials configured.
- The local Rabbi bridge was restarted and is running after the Kimi thinking
  compatibility fix.
- Hosted production still needs a normal restart/deploy window before the
  running Railway service can rely on the newly set env values.

## Guardrails

- Sent only one direct WhatsApp to the saved Rabbi provider contact.
- No token, raw phone number, login/setup/access link, raw chat ID,
  payment/access link, Zoom link, or private message body was printed or
  committed.
- Telegram messages were sent only by the Rabbi bot runtime in response to
  Rabbi's `/start`/short message.
- No WAPI auto-reply, access grant, payment change, DNS change,
  Drive/Vimeo/Zoom mutation, credential value print, or deploy was performed.
