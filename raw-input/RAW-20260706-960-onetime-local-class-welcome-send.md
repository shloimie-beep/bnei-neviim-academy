# RAW-20260706-960 - One Time Local Class Attendees Welcome Send

Captured: 2026-07-06
Source channel: codex_chat
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Parse status: implemented

## Redacted Raw Source

Operator provided:

- One private Zoom invite URL for the current Zoom Mishnayos class.
- Three Gmail recipient addresses for children/local class attendees.
- Instruction to add the addresses into the system and tag them as kids/local class attendees.
- Instruction to send a simple welcome email with the Zoom Mishnayos class link and a request for feedback.

The full Zoom URL includes a meeting password and the full recipient emails are private contact data, so the repo record intentionally keeps them redacted. The exact raw wording remains in the Codex chat provenance for this session.

## Parsed Items

- REQ-20260706-960: Add three operator-provided local class attendee contacts to the One Time CRM.
- REQ-20260706-961: Send each attendee an individual welcome email with the current Zoom Mishnayos link and feedback request.
- REQ-20260706-962: Verify the sends appear in Rabbi's provider mailbox and the CRM/contact timeline, without exposing other recipients.

## Outcome

Done. The One Time app was hotfixed/deployed so manual Resend draft sends preserve One Time mailbox scope metadata, and the recipient-conflict safety check no longer crashes on the `bna_workspace_settings` schema. Three contacts were upserted as local class attendees, three individual emails were sent, and provider mailbox readback found three matching welcome threads.

Evidence: `ops/live-smokes/2026-07-06T15-23-44-976Z-one-time-local-class-welcome-send.md`.

## Guardrails

- Full Zoom URL, raw recipient emails, credentials, cookies, physical mailing address, and email body are not committed.
- No shared-recipient email or bulk campaign endpoint was used.
- No WhatsApp send, payment/access change, DNS change, external CRM write, or member/library entitlement was performed.
