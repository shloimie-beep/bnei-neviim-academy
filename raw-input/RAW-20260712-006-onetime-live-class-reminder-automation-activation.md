# RAW-20260712-006 - One Time Live Class Reminder Automation Activation

Date: 2026-07-12
Source channel: codex_chat
Scope: rabbi_sheller_provider / one_time_mishnah_class
Privacy: raw personal phone, email, provider credentials, WAPI token, and Zoom
password URL are intentionally not included in this tracked source record.

## Redacted Source

The operator expanded the earlier one-recipient WhatsApp approval into a live
One Time class reminder activation request for the local-class contacts, the
operator's approved personal contact, and Rabbi Scheller's contact.

Redacted operator wording preserved for provenance:

> No I want you to trigger that automation I want that automation to be live for
> the email for the kids that are registered as like local and for my own
> personal number and for the rabbis personal number and the emails and the
> WhatsApp should be lives for those contacts with the reminder with the zoom
> link

## Compiled Requirement

- Resolve the scoped One Time local-class contacts from the first-party CRM.
- Send only to the exact resolved local-class email recipients when the count is
  explicitly verified.
- Send WhatsApp only to the explicitly approved operator/Rabbi contacts or
  correctly scoped provider contact, not to a broad imported audience.
- Include the current Zoom link in the reminder, redacted from durable proof.
- Use first-party Operations APIs with workspace/project metadata.
- Record redacted live-send evidence and stop on count, auth, sender readiness,
  Zoom-link, or provider-contact ambiguity.

## Guardrails

- No legacy CRM, GoHighLevel, LeadConnector, payment, access, DNS, import,
  Telegram, or broad campaign write is approved by this source.
- Do not commit raw phone, email, WAPI token, OPS password, or Zoom password URL.
- Do not mark recurring automation fully live unless the cron/env/worker path is
  separately verified after the scoped send proof.
