# Rabbi WhatsApp Setup Message - Prepared, Not Sent

Generated: 2026-07-02
Source: `RAW-20260702-003`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Status

Blocked, no send performed.

Reason:

- `npm run one-time:setup:check -- --write-report` reports missing Whapi/WAPI
  token alias, instance ID, and phone number.
- Rabbi's safe recipient phone number is not available in the setup checker.
- No configured sending provider is available for this packet.

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
- Whapi/WAPI token alias or configured provider status.
- Whapi/WAPI instance ID or alias.
- Sending phone number.
- Confirmation that this is exactly one setup message, not a broadcast.

## Forbidden

- No WhatsApp broadcast.
- No send to imported leads or contacts.
- No GHL/LeadConnector runtime.
- No secret/token exposure.
- No cross-workspace contact merge.
