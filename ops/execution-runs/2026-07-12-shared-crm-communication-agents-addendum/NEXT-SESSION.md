# Next Session

Next unblocked batch: `1-identity-isolation`
Open requirement: `REQ-20260712-305`

Continue by inspecting and repairing:

- `bna_contact_identities` schema/migrations/constraints;
- all email/phone/WhatsApp identity upserts;
- WAPI/Resend contact lookup paths;
- contact/timeline/thread APIs for workspace-first resolution;
- tests proving the same normalized email/phone can exist separately in BNA and One Time and cannot leak through altered contact/thread/workspace/project parameters.

Do not start broad CRM UI edits until the current-state/PQC requirements for UI surfaces are recorded and validated.
