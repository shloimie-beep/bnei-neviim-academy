# Parent Accountability Onboarding Local Smoke

Date: 2026-06-15
Target: `http://127.0.0.1:8080/api/parent-accountability/onboarding`

## Result

PASS. The public parent/accountability onboarding endpoint accepted a dry-run
payload and returned a no-write preview for the new first-party
`accountability_interest` lead path.

## Payload Shape

- `dry_run: true`
- parent name/email/phone present
- child name entered as initials
- child age text present
- struggles, goals, and setup context present
- source route: `/parent/login?onboard=accountability`
- mobile viewport metadata present

## Verified Response

- `success: true`
- `dry_run: true`
- `local_write_performed: false`
- planned `bna_parent_leads accountability_interest`
- planned `bna_support_tickets student_parent_data`
- planned `bna_contact_communications lead inbound note`
- planned `bna_in_app_notifications parent_accountability_lead_submitted`
- preview lead type `accountability_interest`
- preview status `new`
- preview interest level `warm`
- `parent_email_present: true`
- `parent_phone_present: true`
- `review_before_child_visibility: true`
- `no_send: true`
- `external_write_performed: false`

## Guardrails

No lead, ticket, communication, notification, email, WhatsApp, Telegram,
student-visible goal, checkout/access change, Google/Drive write, Buffer action,
or external CRM write was created by this smoke.
