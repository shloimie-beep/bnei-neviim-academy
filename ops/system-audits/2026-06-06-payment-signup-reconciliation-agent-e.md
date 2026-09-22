# Payment / Signup Reconciliation Audit - Agent E - 2026-06-06

## Scope And Method

- Read-only audit only. No app code edited, no production data modified, no emails sent.
- Checked live app at `https://bneineviimacademy.org` using existing protected APIs:
  `/api/bna/signups`, `/api/bna/payment-intake`, `/api/bna/payments`,
  `/api/bna/payment-reminders/due`, `/api/bna/email-log`, and
  `/api/bna/green-invoice/webhooks`.
- Live health was OK and database was connected.
- GHL auth was available for read-only checks: diagnostics returned configured,
  1 Facebook account, 3 other accounts, and posts read OK.
- Green Invoice sender-side API auth was not available in local env/secrets.
  App-side webhook log was readable, but returned 0 events.

## Current Reconciliation

| Person / student | Current state | Signup | Payment | Contact / sync notes |
| --- | --- | --- | --- | --- |
| Amitai Kosofsky | Paid active signup | Signup #6 | Cash paid, payment log #1, ILS 1000 | Parent email and phone are present in the app. GHL IDs are missing because sync hit a duplicate-contact error. Not a signup-link target. |
| Menachem Mendel Dratler | Paid active signup | Signup #8 | Cash paid, payment log #3, ILS 1000 | Parent email and phone are present. GHL parent/student IDs are synced. Not a signup-link target. |
| Eitan Chaim / Galambo-Golambo | Paid intake needing signup | No signup yet; intake #3 | Cash paid, ILS 1000, status `needs_signup` | Parent email is present in app intake, parent phone is not in the structured field, and GHL search found no contact by name/email. Needs final recipient/canonical-name approval before any signup link email. |
| Huda Weber / Nikki Weber | Paid intake needing signup | No signup yet; intake #6 | Green Invoice/manual intake, ILS 1000, status `needs_signup` | No structured parent email or phone, no GHL contact found by name, no Green Invoice webhook/log/ID available. Cannot email until contact and payment proof are confirmed. |
| Hillel Baraka / Naomi Braka | Signed up, payment pending | Signup #7 | Cash pending, no payment log | Parent email and phone are present in app signup. Payment reminders were already sent Jun 4, Jun 5, and Jun 6; current reminder preview found 0 due. Not a signup-link target. |
| Fh / test signup | Archived test data | Signup #5 archived | Marked paid cash | Should be ignored and not emailed. |

## Who Should Not Be Emailed Yet

- Do not send signup-link email to Eitan Chaim / Galambo-Golambo until the operator confirms the exact recipient and spelling. The app has an email address in intake #3, but no structured phone and no GHL contact match.
- Do not send signup-link email to Huda Weber / Nikki Weber until a real parent email or phone is captured and the Green Invoice/payment evidence is verified. There is currently no recipient.
- Do not send signup-link email to Hillel Baraka / Naomi Braka, Amitai Kosofsky, or Menachem Mendel Dratler because they already have signup rows.
- Do not email archived signup #5.

## Exact Blocker Before Parent Signup Links Can Be Sent

The blocker is not API auth for the live app or GHL. The blocker is unresolved
recipient approval for the unsynced paid intake records:

1. Intake #3, Eitan Chaim / Galambo-Golambo: confirm canonical family spelling,
   confirm the stored parent email is the intended recipient, optionally capture
   parent phone, then approve sending the signup link.
2. Intake #6, Huda Weber / Nikki Weber: capture a parent email or phone and
   verify the Green Invoice/payment source, because there is no webhook event,
   Green Invoice ID, app contact, or GHL contact to use.

Important: `POST /api/bna/email/signup-link` sends immediately. It was not
called. That endpoint also does not appear to write to `bna_email_log`, so use it
only after the operator explicitly approves the recipient list.

