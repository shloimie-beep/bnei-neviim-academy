# Next Year Password Setup Preview Live Smoke

Date: 2026-06-15
Target: https://bneineviimacademy.org/operations?workspace=bna&view=students&section=next_year_login

## Result

PASS. Authenticated Operations rendered the Students > Next Year Login rollout packet, exposed per-family password setup preview/send buttons, and completed the password setup preview path without sending email.

## Contract Checks

- PASS admin password setup endpoint exists
- PASS dry-run preview returns no-write flags
- PASS typed send confirmation exists
- PASS Operations API client is wired
- PASS Next Year rollout packet copy exists
- PASS preview button exists
- PASS send button exists
- PASS preview payload uses dry_run

## Browser Checks

- PASS password setup preview POST was intercepted with `dry_run: true`: 1 hit(s).
- PASS live password setup email attempts were blocked and none occurred: 0.
- PASS desktop metrics: {"hasNextYearView":true,"hasRolloutPacket":true,"hasPreviewButton":true,"hasSendButton":true,"hasParentPasswordStatus":true,"noHorizontalOverflow":true}
- PASS mobile metrics: {"viewport":{"width":390,"height":900},"hasPreviewButton":true,"hasRolloutPacket":true,"noHorizontalOverflow":true}
- PASS preview payload: {"contact_type":"student","contact_id":99001,"dry_run":true}
- INFO preview dialog messages: ["Password setup email preview ready for fixture.parent@example.com. No email was sent. Subject: Set or reset your Bnei Neviim Academy parent portal password"]

## Screenshots

- desktop.png
- mobile.png

## Guardrails

No parent password token, email, WhatsApp, onboarding campaign, portal message, student access change, external CRM write, Google/Drive action, or Buffer/social action was triggered. The only password setup POST used `dry_run: true` and returned `local_write_performed: false`.
