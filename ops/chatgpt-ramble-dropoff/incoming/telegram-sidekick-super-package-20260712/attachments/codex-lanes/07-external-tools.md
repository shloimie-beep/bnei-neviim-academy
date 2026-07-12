# Lane 07 — Safe External Tools

**Packet role:** implementation in connector-specific sub-batches
**Owner:** Codex
**Depends on:** Lane 06 capability/effect/approval framework

## Mission

Add useful external research and connected-app capabilities without data egress or side-effect bypass.

## Order

1. `external.web.search/open`: public web only, citations/sources, timeout, egress redaction, no durable auto-memory.
2. `external.files.search/get`: scoped app/Drive reads; truthful not-configured state.
3. Calendar list/get/freebusy; distinguish app calendar from Google calendar.
4. Email search/thread/get and draft.
5. Approved create/update/send/schedule/sync capabilities only after preview, consent/suppression, exact destination, connector readiness, and one-use approval.

## Profile boundaries

- Shloimie explicitly selects account/workspace when multiple connectors exist.
- Rabbi can access only One Time-owned connector identities.
- Public lead profiles receive no private connector tools.
- Private record content never enters public web queries.

## Tests

English/Hebrew web/file/calendar/email routing, citations, egress redaction, untrusted content, timeout/retry/partial result, connector missing, cross-account denial, ambiguous recipient, draft-versus-send, tampered preview/approval, no real send in CI.

## Handback

Return actual configured/preview-only/blocked capabilities by profile and exact owner setup blockers. Do not claim a preview wrapper is a live connector.
