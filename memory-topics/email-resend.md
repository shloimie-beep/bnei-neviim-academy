# Email / Resend Memory

- Resend work is provider setup/readback work, not a blocker for UI audit or IA
  cleanup.
- No bulk real campaign send is allowed from a protocol/UI cleanup packet.
- Safe smoke testing may use Resend official test addresses or
  Shloimie-owned/specified test recipients when a guarded script and readiness
  evidence exist.
- Reports must redact secrets and private recipients.
- Required readiness evidence is status/fingerprint only for `RESEND_API_KEY`,
  `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, and any scoped provider secret
  references.

## 2026-07-02 Operator Confirmation

- Shloimie confirmed `info@onetimeonetime.com` as the One Time / Rabbi Sheller
  sender and reply-to address.
- Current Resend evidence says One Time outbound, webhook, and event readback
  are live/test-smoke capable when using guarded scripts and approved test
  recipients.
- Remaining email blocker is not sender identity. Remaining blocker is real
  inbound `email.received` CRM proof from an actual external inbound message or
  Resend replay, plus final copy/list/suppression proof and an explicit campaign
  packet before any real campaign send.
