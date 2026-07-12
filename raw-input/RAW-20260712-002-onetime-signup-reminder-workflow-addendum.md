---
raw_id: RAW-20260712-002
source_channel: codex_chat
source_type: operator_p0_addendum
created_at: 2026-07-12T09:10:00+03:00
parse_status: registered
workspace: rabbi_sheller_provider
project: one_time_mishnah_class
requirement_register: tasks-pending/2026-07-12-onetime-signup-reminder-workflow-addendum.md
execution_run: ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion
pr_url: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
branch: codex/onetime-p0p1-corrective-20260711
priority: P0
---

# Raw Intake: One Time Signup And Reminder Workflow Addendum

This addendum re-prioritizes the active PR #129 / July 12 continuation run.
The standalone signup, CRM capture, immediate confirmation, Rabbi Telegram
alert, and reminder workflow are now more urgent than remaining landing-page
polish.

## Raw Operator Wording

URGENT P0 -- COMPLETE THE ONE TIME SIGNUP AND REMINDER WORKFLOW

Continue the current One Time implementation and existing PR #129. Do not open a competing PR, reset unknown work, or overwrite another active Codex process.

Treat this as an addendum to the current raw intake and execution run. The functioning signup workflow is more urgent than the remaining landing-page polish.

OUTCOME

A person must be able to open a professional standalone signup form, submit their information, enter the One Time CRM, receive an immediate email containing the daily Zoom link, and--if requested--receive a reminder 30 minutes before each 7:00 p.m. Israel-time class.

Rabbi Scheller must receive one Telegram notification for each genuine signup.

No parent portal, student portal, member login, password setup, payment, checkout, account, or access-grant workflow should run from this form.

1. CREATE A PROFESSIONAL DIRECT SIGNUP PAGE

Create this stable shareable route:

https://join.onetimeonetime.com/one-time/signup

All public "Sign Up Now" buttons should open this route or use the same canonical form component.

Do not maintain two different signup implementations.

Form-page header:

- One Time white-on-black logo
- "Sign Up Now"
- Clear "Back to Home" link returning to `/one-time`
- Clean mobile header
- No member-login or portal actions on this form

Visual direction:

- Premium black foundation
- Refined chrome/holographic yellow primary button
- Restrained ice-blue highlights
- Clean white or very light input surfaces
- Strong modern typography
- Clear focus, hover, success, and error states
- Comfortable spacing and rounded--not oversized--controls
- Responsive at 1440, 1024, 768, 430, and 390 pixels
- Respect `prefers-reduced-motion`

Remove all customer-facing implementation copy, including:

- "The next step asks whether..."
- "Choose the right onboarding path"
- "No billing"
- "No checkout"
- "No external send"
- "This only records interest"
- CRM, Codex, configuration, guardrail, approval, portal, or setup instructions

This is an obvious signup form. Do not explain the technical workflow to the visitor.

2. EXACT FORM FIELDS

Use one concise form:

A. Contact name -- required

B. "Signing up as" dropdown -- required

Options:

- Family
- School

C. "City" -- required

Use a city autocomplete that displays and stores an unambiguous selection such as:

`Lakewood, New Jersey, United States`

Store:

- city name
- region/state when available
- country
- country code
- IANA timezone, such as `America/New_York`

Do not rely on city text alone because cities can share names.

D. Email -- required

E. Phone / WhatsApp -- optional

Phone becomes required only when the person selects WhatsApp reminders.

F. "Class reminders" -- required choice, with no preselected answer

Options:

- Email reminders
- WhatsApp reminders
- Email and WhatsApp reminders
- No daily reminders

Selecting Email, WhatsApp, or Both is explicit consent for recurring class reminders.

Show only one concise consent line:

"By choosing reminders, you agree to receive class updates. You can stop them at any time."

"No daily reminders" means:

- still send the immediate transactional signup confirmation email;
- do not send recurring daily reminders;
- still create the CRM record;
- still alert Rabbi Scheller in Telegram.

Do not request student name at this stage.

3. LOCATION AND TIMEZONE BEHAVIOR

The class always begins at:

- 19:00
- `Asia/Jerusalem`

The reminder is always due 30 minutes before that class:

- 18:30
- `Asia/Jerusalem`

This is one worldwide event. Do not send at 6:30 p.m. in each recipient's local timezone.

Correct algorithm:

1. Resolve the next class date/time as 19:00 in `Asia/Jerusalem`.
2. Subtract 30 minutes.
3. Convert that instant into the recipient's stored city timezone.
4. Send everyone at the same actual moment.
5. Display both the recipient's local time and Israel time.

Example confirmation/reminder wording:

"The class begins at {{recipient_local_time}} in {{city}} -- 7:00 p.m. Israel time."

Reminder wording:

"Rabbi Scheller's Mishnah class starts in 30 minutes.

Your local time: {{recipient_local_time}}
Israel time: 7:00 p.m.

Join Zoom:
{{server_side_zoom_join_url}}"

Handle daylight-saving transitions correctly for both Israel and the recipient's timezone. Never use a permanently fixed UTC offset.

Capture the browser-reported IANA timezone as a fallback, but validate it server-side against the selected city. Store mismatches for review rather than silently using a bad timezone.

4. CRM AND CONSENT STORAGE

The existing `/api/one-time/interest` CRM capture may be reused and extended.

After submission, atomically:

- insert or link `bna_product_leads`;
- insert or update the scoped One Time CRM contact/lead;
- store Family or School;
- store city, country, region, and IANA timezone;
- store email and optional phone;
- store reminder preference;
- store reminder-consent timestamp;
- store consent-policy version;
- store signup source, UTM, and referrer;
- store email and WhatsApp suppression states;
- create an internal CRM timeline entry;
- enqueue the immediate confirmation;
- enqueue Rabbi's Telegram signup alert.

Do not hard-code `consent: true`.

Deduplicate safely by scoped contact, normalized email, and normalized phone. A repeated form submission must not produce duplicate confirmations, reminders, CRM contacts, or Telegram alerts.

5. IMMEDIATE CONFIRMATION EMAIL

Every valid signup receives one immediate transactional email, including people who selected "No daily reminders."

From:

`One Time Mishnayos <info@onetimeonetime.com>`

Reply-to:

`info@onetimeonetime.com`

Subject:

"You're signed up for Rabbi Scheller's 7 PM Mishnah class"

Body:

"Hi {{contact_name}},

You're signed up for Rabbi Eli Scheller's live Mishnah class.

The class meets every day at:

{{recipient_local_time}} in {{city}}
7:00 p.m. Israel time

Join the class:
{{server_side_zoom_join_url}}

{{reminder_preference_summary}}

Looking forward to learning together,
One Time Mishnayos"

Read the Zoom join URL only from the approved server-side One Time class-link aliases.

Never:

- hard-code it into public JavaScript;
- return it in public API diagnostics;
- use the Zoom host/start URL;
- create a new Zoom meeting;
- include the raw link in repository evidence.

If Resend temporarily fails, preserve the signup and retry through a durable outbox.

6. DAILY REMINDER WORKER

Build a dedicated One Time class-reminder dispatcher. Do not reuse the BNA payment-reminder scheduler.

Use a protected cron/worker and durable database outbox.

Required server configuration:

`ONE_TIME_CLASS_REMINDERS_ENABLED=true`
`ONE_TIME_CLASS_REMINDERS_CONFIRM=APPROVE_ONE_TIME_CLASS_REMINDERS`
`CRON_SECRET`

Required idempotency key:

`class date + contact ID + channel + 30-minute window + schedule version`

Send exactly once per person, class date, and selected channel.

Eligible recipient:

- active One Time signup or explicitly approved local-class contact;
- valid email/phone for the selected channel;
- reminder consent or approved local-class enrollment;
- not unsubscribed, opted out, suppressed, archived, or invalid;
- class is active;
- current join link exists.

Support:

- class canceled
- class paused
- schedule changed
- join link changed
- invalid email/phone
- email unsubscribe
- WhatsApp STOP
- permanent channel suppression
- retries without duplicates

Log queued, processing, sent, failed, retried, skipped, and suppressed outcomes in the CRM timeline and provider-delivery logs.

7. EXISTING LOCAL-CLASS CONTACTS

There are expected to be exactly three existing One Time CRM contacts previously identified as local-class boys/students.

Find them only within:

- workspace: `rabbi_sheller_provider`
- project: `one_time_mishnah_class`

Use the existing approved local-class tag set:

- `local_class_attendee`
- `zoom_mishnayos_class`
- `local_student`

Before mutation, produce a redacted preview showing:

- expected count
- actual count
- masked contact references
- valid-email count
- duplicate count
- suppression/unsubscribe status

Expected eligible contact count is three.

If the scoped result is not exactly three, stop and report the discrepancy. Do not guess or message a broader list.

For the three verified contacts:

- enroll them in email class reminders;
- record `reminder_source=operator_approved_local_class_tag`;
- record this new operator approval and date;
- deduplicate by canonical CRM contact/email;
- do not create portal accounts;
- do not send password/setup emails;
- do not grant membership/access;
- do not send WhatsApp unless that contact separately opted into WhatsApp.

If their city/timezone is missing, the reminder may simply say:

"The class starts in 30 minutes -- 7:00 p.m. Israel time."

Do not invent their city.

Do not activate or send to these three until the operator's personal end-to-end test passes. After that test, activate only this exact verified three-contact segment.

8. WHATSAPP REMINDERS

Send WhatsApp confirmation and daily reminders only when the person selected:

- WhatsApp reminders; or
- Email and WhatsApp reminders

Phone remains optional for everyone else.

Use Rabbi Scheller's separate One Time Whapi channel. Never use the BNA/Shloimie WhatsApp sender.

Required hosted settings:

`ONE_TIME_WAPI_API_TOKEN`
`ONE_TIME_WAPI_API_BASE_URL`
`ONE_TIME_WHAPI_INSTANCE_ID`
`ONE_TIME_WHAPI_PHONE`
`ONE_TIME_WAPI_WEBHOOK_SECRET`
`ONE_TIME_PUBLIC_WHATSAPP_NUMBER`
`ONE_TIME_WHATSAPP_CLASS_LINK`
`ONE_TIME_PROVIDER_LEAD_BOT_PROFILE=one-time`
`ONE_TIME_PROVIDER_LEAD_BOT_MODE=live`
`ONE_TIME_WAPI_AUTO_REPLY_ENABLED=true`
`ONE_TIME_WAPI_AUTO_REPLY_CONFIRM=APPROVE_ONE_TIME_WAPI_AUTO_REPLY`

Inspect the existing secure Rabbi token first. Do not ask the operator to paste it again unless the redacted readiness check proves it unavailable.

If Whapi authentication has expired, stop and return one precise action:

"Rabbi Scheller must scan the Whapi channel QR from his WhatsApp phone."

Preserve STOP, unsubscribe, wrong-number, duplicate-message, and suppression behavior.

9. RABBI TELEGRAM SIGNUP ALERT

Every genuine signup must create exactly one internal Telegram alert for Rabbi Scheller, regardless of the customer's reminder preference.

Use Rabbi Scheller's scoped bot/chat, not the generic BNA/Shloimie bot.

Use or extend:

- `src/lib/bna/telegram-notifications.js`
- `scripts/telegram-kimi-bridge.mjs`

Target a dedicated role such as:

`one_time_rabbi_operator`

Alert fields:

- new One Time signup
- contact name
- Family or School
- city/country
- reminder preference
- CRM lead reference
- secure One Time CRM deep link

Do not place the Zoom URL in Telegram.

Rabbi's token/chat ID were previously captured. Verify the stored values without printing them. Deploy/restart the hosted worker and run one scoped live smoke.

Run exactly one long-polling worker. Do not run local and hosted pollers simultaneously.

10. ABSOLUTELY NO PORTAL ONBOARDING

This launch form must not:

- create a parent portal
- create a student portal
- create a member login
- generate a password/setup link
- send a portal email
- create a classroom/recovery code
- grant access or entitlements
- start checkout/payment
- create Stripe records
- send trial/member invitations

The only customer-facing destinations are:

- immediate signup confirmation;
- selected daily class reminders;
- current Zoom join link.

Add negative tests proving that none of the portal/account/payment paths execute.

11. OPERATOR END-TO-END TEST

First complete:

- implementation;
- migrations;
- no-send tests;
- CI;
- deployment;
- redacted Resend/WAPI/Telegram readiness;
- scheduler health;
- direct form-page visual proof.

Then return:

"Automation is deployed and ready for your test.

Open:
https://join.onetimeonetime.com/one-time/signup

Submit your own approved email and optional phone. Choose a city, Family or School, and your desired reminder channels. Tell me when the page confirms your signup."

The operator authorizes one test only to the details they personally submit. Do not use another recipient.

After submission, verify:

1. one product lead;
2. one linked CRM contact;
3. city/country/timezone stored;
4. reminder preference and consent stored;
5. immediate email received;
6. WhatsApp received only if selected;
7. exactly one Rabbi Telegram alert;
8. no portal/member/access records;
9. no duplicate after replay.

Provide a guarded single-recipient test command that simulates the 30-minute reminder for only this new test contact. It must require an exact confirmation phrase and must not accept an unrestricted audience.

Verify:

- local time displayed correctly for the selected city;
- Israel time displayed as 7:00 p.m.;
- one email reminder if selected;
- one WhatsApp reminder if selected;
- no duplicate on replay;
- delivery logs and CRM timeline agree.

Only after this personal test passes:

- activate the exact three-contact local-class email-reminder segment;
- keep every other existing contact excluded;
- keep WhatsApp disabled for those three unless separately opted in.

12. REQUIRED TEST MATRIX

Include:

- Family/School dropdown
- direct form route and Back to Home
- professional responsive styling
- removal of all internal/no-billing/no-portal copy
- city autocomplete and ambiguous-city handling
- server-side IANA timezone validation
- Jerusalem/New York/London/Sydney DST cases
- worldwide reminder sent at one actual instant
- recipient-local display time
- phone optional for email/no-reminder choices
- phone required for WhatsApp choices
- No daily reminders still receives immediate confirmation
- consent not hard-coded
- CRM deduplication
- confirmation outbox retries
- daily reminder idempotency
- canceled/paused class suppression
- unsubscribe and STOP
- missing/changed Zoom-link handling
- scoped Rabbi Telegram delivery
- WAPI provider failures
- exact three-contact local-tag preview
- count mismatch blocks activation
- local contacts receive email only
- no portal, login, password, payment, or access records
- cross-workspace isolation
- synthetic `.invalid` tests perform no external send

Do not mark this Done until the operator confirms the personal test and the deployed CRM/provider evidence proves the complete workflow.
