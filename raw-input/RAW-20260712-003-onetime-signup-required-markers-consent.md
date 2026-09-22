---
raw_id: RAW-20260712-003
source_channel: codex_chat
source_type: operator_form_ui_correction
created_at: 2026-07-12T09:48:00+03:00
parse_status: implemented_local
workspace: rabbi_sheller_provider
project: one_time_mishnah_class
parent_raw_id: RAW-20260712-002
execution_run: ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion
requirement_ids:
  - REQ-20260712-013
---

# Raw Intake: One Time Signup Required Markers And Consent Checkbox

This correction is a scoped addendum to the direct One Time signup page work in
PR #129. It clarifies the required-field display and reminder/location
acknowledgment UX.

## Raw Operator Wording

Just make sure the form it doesn't say like phone optional you know it has a red dot by like this stuff that you know they needYou know they need to and there's like a check mark that they click I can send to getting you know reminders and their location

## Parsed Requirement

- Remove customer-facing "phone optional" style wording from the signup form.
- Show a red required marker on fields that are required.
- Show the Phone / WhatsApp required marker only after a WhatsApp reminder path
  is selected.
- Add a user-clicked checkbox acknowledgment for selected city class-time use
  and selected reminder consent.
- Keep the larger signup/reminder run open until deploy, live smoke, provider
  readiness, and operator personal end-to-end proof are complete.
