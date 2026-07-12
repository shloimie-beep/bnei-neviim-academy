# RAW-20260712-003 - One Time form email/reminder verification

- `created_at`: 2026-07-12T16:47:19+03:00
- `source_channel`: codex_chat
- `workspace_key`: rabbi_sheller_provider
- `project_key`: one_time_mishnah_class
- `parse_status`: registered
- `privacy`: The operator provided the current Zoom join link in chat. The raw URL is intentionally omitted from tracked files and must remain in private keyholder/Railway environment configuration only.

## Raw Source Summary

The operator asked Codex to make sure the One Time signup automation works: when someone enters their information, they should receive an email with the class link, and they should receive the reminder email/channel based on the reminder option they choose. The operator also supplied the current Zoom link to use for now as the class/reminder link; the raw URL is redacted from repo records.

## Parsed Items

- `REQ-20260712-003A`: Verify the live One Time signup form accepts direct signup details and queues the immediate confirmation email with the server-side class-link alias.
- `REQ-20260712-003B`: Verify reminder preference choices are captured and mapped to the correct delivery channels.
- `REQ-20260712-003C`: Verify whether the live dispatch layer can actually send queued email/reminder work, not only create dry-run previews.
- `DEC-20260712-003`: The current Zoom link must not be stored in tracked files; it should be stored or verified only through the private class-link environment/keyholder path.

## Verification Summary

- Live page `https://join.onetimeonetime.com/one-time/signup` returned 200 and contains reminder preference fields plus the `/api/one-time/interest` submit target.
- Live direct-signup dry-runs returned success for `email`, `none`, and `both` reminder choices.
- Dry-run previews queued `email:one_time_signup_confirmation` and `telegram:one_time_rabbi_operator`; `both` also queued `whatsapp:one_time_signup_confirmation`.
- Dry-run previews reported `raw_join_url_in_payload: false`, keeping the raw class link server-side.
- Local focused tests from the current One Time signup/reminder branch passed: 20/20.
- Initial live protected dispatch endpoints returned 503 because `CRON_SECRET` was not configured; this was superseded by the follow-up verification below after private Railway configuration.

## Guardrails

No external email send, WhatsApp/WAPI send, Telegram send, CRM/database write, payment/access mutation, Zoom mutation, DNS change, or provider-account mutation was performed in this verification pass.

## Follow-up Verification - 2026-07-12T17:11:26+03:00

The operator asked to run the test and also verify the tags, timing, buttons, and correct CRM placement.

Actions performed:

- Generated a private `CRON_SECRET` and set it on Railway without printing or storing the value.
- Enabled `ONE_TIME_CLASS_REMINDERS_ENABLED=true` and `ONE_TIME_CLASS_REMINDERS_CONFIRM=APPROVE_ONE_TIME_CLASS_REMINDERS`.
- Found and fixed a live schema blocker: `bna_parent_leads.parent_whatsapp` was missing while the deployed signup/reminder code expected it. Added the column with an idempotent schema change; no lead rows were changed.
- Ran protected cron dry-runs successfully after the fix.
- Ran one synthetic direct signup through the live form endpoint with `reminder_preference=both`, verified CRM tags/metadata/outbox/timing, then cancelled the synthetic outbox rows and archived the synthetic product/CRM leads.

Proof summary:

- Live signup route is reachable and posts to `/api/one-time/interest`.
- The public landing has `Sign Up Now` links to `/one-time/signup`.
- The signup page has family/school, city/timezone, reminder preference, and submit controls.
- Synthetic CRM lead landed in `bna_parent_leads` under project `one_time_mishnah_class`, source `website_form`, source detail `One Time direct signup form`, owner `Shloimie`.
- CRM tags included `one-time`, `one-time-public-signup`, `free-class-interest`, `free-zoom-follow-up`, `one-time-direct-signup`, and `signup-as-family`.
- CRM metadata included direct-signup flags, city/timezone, reminder preference `both`, reminder channels `email` and `whatsapp`, reminder consent timestamp, no-checkout/no-access guardrails, and synthetic-test marker.
- Confirmation outbox dry-run showed email, Rabbi Telegram alert, and WhatsApp confirmation would send; raw join URL and message body were not returned.
- Class reminder dry-run for the synthetic contact showed the email reminder would queue 30 minutes before the 7:00 p.m. Israel class. For Lakewood/New York, display time was 12:00 p.m.; Israel time was 7:00 p.m.
- WhatsApp class reminder was skipped with `one_time_whapi_not_ready`; WhatsApp confirmation outbox construction works, but recurring WhatsApp reminders are not fully live until WAPI readiness is cleared.
- Cleanup verified delivery outbox due count returned to 0 after cancelling synthetic rows.

Guardrails:

- No real external email, WhatsApp/WAPI, or Telegram send was performed.
- No payment, checkout, access grant, Zoom mutation, DNS change, or provider-account mutation was performed.
- The raw Zoom link and `CRON_SECRET` value were not written to tracked files.

## Local Class Reminder Activation - 2026-07-12T17:18:21+03:00

The operator clarified that the existing local One Time class contacts from the earlier Rabbi Scheller setup must receive the reminder before class with the class link.

Additional parsed items:

- `REQ-20260712-003D`: Verify the previously entered local class contacts are present in the One Time/Rabbi Scheller lead store and are tagged into the reminder automation.
- `REQ-20260712-003E`: Queue and verify the local class email reminders for the 30-minute-before-class schedule without exposing private email addresses or the raw class link in tracked files.

Actions performed:

- Located exactly three non-archived One Time contacts with the local class attendee tags from the prior approved setup; no new contacts were created.
- Activated email reminders for those three contacts with `reminder_preference=email`, `reminder_channels=["email"]`, and the operator-approved local class reminder metadata.
- Added the active reminder tag while preserving the existing local class tags.
- Queued today's class reminder email rows for those three contacts only.

Proof summary:

- Contact IDs verified: `4`, `5`, and `6`.
- Local reminder tags now include `local_class_attendee`, `local_student`, `zoom_mishnayos_class`, and `one-time-local-reminders-active`.
- Each contact has a queued `email:one_time_class_reminder` outbox row for the 30-minute-before-class reminder time.
- Today's schedule is class at 7:00 p.m. Israel time and reminder at 6:30 p.m. Israel time.
- The class-reminder dry-run returned `would_queue` for all three local contacts.
- Delivery-outbox dry-run before 6:30 p.m. Israel time returned due count `0`, which is expected because the reminder rows are scheduled for 6:30 p.m.
- Outbox payload readback did not expose the raw join URL.

Guardrails:

- No raw local email addresses were written to tracked files.
- No raw Zoom link or secret value was written to tracked files.
- No real external email was sent during this activation step; the reminders are queued for the scheduled send window.
- No WhatsApp/WAPI send, Telegram send, payment/access mutation, Zoom mutation, DNS change, or provider-account mutation was performed.

## WhatsApp Reminder Activation - 2026-07-12T17:48:00+03:00

The operator explicitly approved WhatsApp reminders for the scoped One Time class reminder list. The operator specified that WhatsApp reminders must come from Rabbi Scheller's 443 WhatsApp identity and use a Rabbi Scheller digital-assistant voice.

Additional parsed items:

- `REQ-20260712-003F`: Send One Time WhatsApp class reminders through the Rabbi Scheller 443 WAPI/Whapi sender identity only.
- `REQ-20260712-003G`: Use WhatsApp reminder copy that introduces the message as Rabbi Scheller's digital assistant and says class is about to begin.
- `REQ-20260712-003H`: Enroll Rabbi Scheller's personal reminder contact and Shloimie's personal WhatsApp reminder contact for 6:30 p.m. reminders.
- `REQ-20260712-003I`: Add WhatsApp reminders for local kids only when a WhatsApp/phone number is already stored.
- `Q-20260712-003A`: Shloimie asked to receive email reminders too, but no exact email address was provided in this message and no unambiguous Shloimie email env value was configured.

Actions performed:

- Added reminder-specific WAPI readiness flags so WhatsApp class reminders do not require enabling the broader One Time lead-bot auto-reply mode.
- Added a sender guard requiring the One Time scoped WAPI sender binding and configured required sender digits for the Rabbi Scheller 443 identity.
- Updated WhatsApp class reminder copy to use Rabbi Scheller digital-assistant wording.
- Verified the live WAPI reminder readiness is ready, the sender binding is configured, the configured sender/public alias contains the required 443 marker, and the unrelated lead-bot auto-reply mode remains disabled.
- Live DB update enrolled the three local contacts for WhatsApp only if they had a stored phone/WhatsApp value. Readback showed contact IDs `4`, `5`, and `6` have email reminders but no stored WhatsApp/phone value, so they remain email-only.
- Created two personal reminder contacts: contact ID `20` for Rabbi Scheller personal WhatsApp reminders and contact ID `21` for Shloimie personal WhatsApp reminders.
- Queued today's reminder rows:
  - Outbox IDs `16`, `17`, `18`: local contact email reminders.
  - Outbox IDs `19`, `20`: personal WhatsApp reminders.
- Updated the post-6:30 follow-up monitor to inspect all five outbox rows.

Proof summary:

- Railway deployment `97a1213e-7d38-48b1-9f05-74ffe9bbf3c4` succeeded for source commit `e9f9441a`.
- Focused tests passed: One Time signup reminder workflow, delivery outbox, and WAPI scope contract, 19/19.
- Protected class-reminder dry-run after deploy returned `wapi_readiness.ready=true` and five candidate rows.
- Non-dry-run class-reminder enqueue returned `queued_count=2`, `already_queued_count=3`, `skipped_count=0`, and `external_send_performed=false`.
- Delivery-outbox dry-run before 6:30 p.m. Israel time returned `due_count=0`, as expected because the rows are scheduled for 6:30 p.m.
- Outbox readback confirmed WhatsApp rows have digital-assistant and awesome-class copy checks true, raw join URL not in payload, and message body not returned in proof.

Guardrails:

- No raw phone numbers, raw email addresses, raw Zoom link, message body, or secret values were written to tracked files.
- No immediate WhatsApp, email, Telegram, payment/access, Zoom, DNS, or provider-account mutation was performed during enrollment/queueing.
- Actual provider send/acceptance can only be verified after the 6:30 p.m. Israel dispatcher run.
