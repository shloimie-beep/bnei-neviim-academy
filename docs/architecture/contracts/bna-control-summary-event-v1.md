# BNA Control Summary Event v1

This is the narrow handoff contract for `OT-LIVE-001`. It does not couple the
standalone One Time app to BNA availability, database access, cookies, server
code, or private rows. The producer sends a sanitized asynchronous summary;
BNA may later store only an idempotent projection.

The body must validate against
`docs/architecture/contracts/bna-control-summary-event-v1.schema.json`.
Send the exact UTF-8 body with:

- `X-BNA-Summary-Key-Id: <key_id>`
- `X-BNA-Summary-Signature: sha256=<hex HMAC-SHA256 of the raw body>`

Reject unknown key IDs, invalid signatures, a `signed_at` value outside the
300-second replay window, repeated `event_id` or `idempotency_key`, non-HTTPS
links, unknown event types, and any classification other than
`sanitized_summary`. Never include notes, messages, transcripts, contact data,
student data, credentials, cookies, or private One Time fields.

Both producer and consumer remain disabled by default behind
`BNA_CONTROL_SUMMARY_EVENTS_ENABLED=false`. `OT-LIVE-001` owns the producer;
this task makes no One Time code or runtime change.

Exact producer handoff:

1. Implement the schema in the standalone One Time repository without a BNA
   import or synchronous dependency.
2. Sign the raw body with a separately provisioned secret and stable key ID.
3. Retry delivery with the same event and idempotency IDs.
4. Add producer tests for every event type, privacy rejection, signature,
   expired replay, and retry identity.
5. Return the producer feature flag, endpoint configuration name, and replay
   proof to BNA before the BNA consumer is enabled.
