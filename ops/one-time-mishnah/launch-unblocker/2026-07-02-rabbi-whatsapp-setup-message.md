# Rabbi WhatsApp Setup Message - Prepared, Not Sent

Generated: 2026-07-02
Last reconciled: 2026-07-09T18:12:00+03:00
Source: `RAW-20260702-003`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Status

Blocked, no send performed.

Reason:

- `npm run one-time:wapi:readiness` reports a OneTime-scoped outbound token and
  hosted class link are configured.
- Whapi/WAPI instance ID and WhatsApp sender phone metadata are still missing.
- Auto-reply is disabled and not approved:
  `ONE_TIME_WAPI_AUTO_REPLY_ENABLED` is not enabled and
  `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM` does not equal
  `APPROVE_ONE_TIME_WAPI_AUTO_REPLY`.
- Rabbi's safe recipient phone number is not available for any later test-send
  packet.

External write performed: false
WhatsApp send performed: false
Broadcast performed: false
Secret values printed: false

## Draft Message

Use this only in a later exact packet after Rabbi phone number and configured
Whapi/WAPI sender are available:

```text
Hi Rabbi, this is Shloimie. I am setting up the One Time launch system.
Can you please confirm the WhatsApp number you want connected for One Time
member/admin communication, and whether this number can be used for a small
test message before launch? No broadcast or campaign will be sent from this
setup check.
```

## Required Inputs Before Send

- Rabbi safe recipient phone number.
- Whapi/WAPI instance ID or alias.
- Sending phone number metadata.
- Rabbi safe test recipient phone number, if a later exact test-send packet is
  desired.
- Explicit auto-reply enable and approval flags, only after copy/recipient/
  sender scope is approved.
- Confirmation that this is exactly one setup message, not a broadcast.

## Forbidden

- No WhatsApp broadcast.
- No send to imported leads or contacts.
- No GHL/LeadConnector runtime.
- No secret/token exposure.
- No cross-workspace contact merge.
