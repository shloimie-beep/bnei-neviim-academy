# RAW-20260712-007 - One Time reminder delivery and WhatsApp activation

- `created_at`: 2026-07-12T17:48:00+03:00
- `source_channel`: codex_chat
- `workspace_key`: rabbi_sheller_provider
- `project_key`: one_time_mishnah_class
- `parse_status`: registered
- `privacy`: The operator provided private phone/contact details and the current class link in chat. Raw phone numbers, raw email addresses, raw Zoom URL, message bodies, and secret values are intentionally omitted from tracked files.

## Raw Source Summary

The operator asked Codex to verify and run the One Time signup/reminder automation, use the current class link for confirmation/reminders, ensure local class contacts receive reminders, and then explicitly approved WhatsApp class reminders from Rabbi Scheller's 443 WhatsApp identity using Rabbi Scheller digital-assistant wording. The operator also asked to add Rabbi Scheller and Shloimie to the 6:30 p.m. reminder automation, and asked for Shloimie to receive email reminders too.

## Parsed Items

- `REQ-20260712-024A`: Verify and queue the One Time class reminder automation for existing local class contacts.
- `REQ-20260712-024B`: Enable WhatsApp class reminders only through the One Time/Rabbi Scheller scoped WAPI sender identity with the required 443 sender binding.
- `REQ-20260712-024C`: Use WhatsApp reminder copy that identifies the sender as Rabbi Scheller's digital assistant and says class is about to begin.
- `REQ-20260712-024D`: Add Rabbi Scheller and Shloimie personal reminder contacts to the 6:30 p.m. automation.
- `Q-20260712-007A`: Shloimie requested email reminders too, but no exact email address was provided in this message and no unambiguous Shloimie email env value was configured.

## Verification Summary

- Private `CRON_SECRET` was generated/configured earlier in the same session without printing or tracking the value.
- Live schema blocker `bna_parent_leads.parent_whatsapp` was fixed with an idempotent additive migration.
- Source commit `e9f9441a` was pushed to `master` and deployed to Railway deployment `97a1213e-7d38-48b1-9f05-74ffe9bbf3c4`.
- Focused tests passed: One Time signup reminder workflow, delivery outbox, and WAPI scope contract, 19/19.
- Post-deploy protected class-reminder dry-run returned WAPI readiness ready and five candidate rows.
- Local contact IDs `4`, `5`, and `6` had no stored phone/WhatsApp values and remain email-only.
- Personal reminder contact IDs `20` and `21` were created for WhatsApp reminders.
- Outbox IDs `16`, `17`, and `18` are queued email reminders; outbox IDs `19` and `20` are queued WhatsApp reminders. All are scheduled for 2026-07-12T15:30:00.000Z, 6:30 p.m. Israel time.
- Outbox readback verified WhatsApp request checks include digital-assistant wording and awesome-class wording without returning raw message body or raw class link.

## Guardrails

- No raw phone numbers, raw email addresses, raw Zoom link, message body, or secret values were written to tracked files.
- No immediate WhatsApp, email, Telegram, payment/access, Zoom, DNS, or provider-account mutation was performed during enrollment/queueing.
- Actual provider acceptance must be verified after the 6:30 p.m. Israel dispatcher run.
