# Provider Setup Packet Template

You are a provider setup packet for parent raw input `RAW-YYYYMMDD-###`. Do
not mix this packet into visual/UI cleanup.

## Packet Identity

| Field | Value |
|---|---|
| Parent raw ID | RAW-YYYYMMDD-### |
| Packet ID | PKT-YYYYMMDD-### |
| Packet role | PROVIDER_SETUP_PACKET |
| Scope | One provider/setup surface only. |
| Out-of-scope | UI visual cleanup, unrelated providers, GHL runtime, unapproved external writes. |

## Required Fields

- provider name and account owner;
- setup values needed, without exposing secrets;
- sandbox/test-first policy when applicable;
- external write policy;
- approval phrase if any real write/send/payment/access grant is requested;
- readback plan;
- rollback/revoke plan;
- evidence paths;
- next packet.

## Safety Rules

Email/Resend, Stripe, DNS, Zoom, Vimeo, WhatsApp, Telegram, Drive writes,
payment/access grants, and similar external systems require exact approval and
setup evidence. This template never grants permission by itself.
