# Rabbi Telegram Bot WhatsApp Instructions Send

- Raw ID: `RAW-20260709-012`
- Requirement ID: `REQ-20260709-069`
- Linked blocker: `DEC-20260708-021`
- Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
- Sent at: 2026-07-09T19:56:00+03:00
- External write performed: `true`

## Message Copy

```text
Hi Rabbi Elie, the OneTime Telegram bot is ready for your account.

Please open this bot and press Start, or send it any short message:
https://t.me/onetimeaios_bot

After that, please send me your Telegram ID/chat ID, or just reply here that you messaged the bot. Once I see the bot update, I can connect your Telegram notifications for OneTime.

Thank you.
```

## Redacted Send Evidence

- Provider record readback: exactly one approved Rabbi Elie Scheller provider
  record for `one_time_mishnah_class`.
- Recipient: saved Rabbi provider WhatsApp contact ending `3006`.
- Sender/account health: Whapi status `AUTH`, business account `true`, sender
  ending `8614`.
- Communication row: `bna_contact_communications#2909`.
- Provider result: `status_code=200`.
- Provider message id: present.
- Provider message id fingerprint: `6497d51fc20f`.
- Live raw intake readback: `RAW-20260709-012` status `implemented`.

## Post-Send Readback

- `npm run telegram:rabbi:chat-id` after the WhatsApp send later resolved
  `onetimeaios_bot`, sent no Telegram message, printed no token, and found
  `candidate_count=4`, `unique_chat_count=1`, and masked candidate
  `******4810`.
- `npm run telegram:rabbi:readiness` now reports Rabbi token, chat ID, and
  OneTime Operations credentials configured.
- Ignored local runtime config now has the verified chat ID under the Rabbi and
  OneTime chat ID aliases.
- OneTime Railway production variable keys were set for the same chat ID aliases
  with values hidden and `--skip-deploys`; no deploy was triggered.
- The local Rabbi bridge was restarted and is running after the Kimi thinking
  compatibility fix.
- Hosted production still needs a normal restart/deploy window before the
  running Railway service can rely on the newly set env values.

## Guardrails

- No token, raw phone number, login/setup/access link, raw chat ID, payment
  link, access grant, Zoom link, or private message body was committed.
- Telegram messages were sent only by the Rabbi bot runtime in response to
  Rabbi's `/start`/short message.
- No WAPI auto-reply was enabled.
- No provider credential values, payment/access records, DNS, Drive, Vimeo, or
  Zoom settings were mutated.
