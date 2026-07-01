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

