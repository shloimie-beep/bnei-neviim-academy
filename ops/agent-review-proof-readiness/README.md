# Agent Review Proof Readiness

This folder stores tracked latest-readiness summaries for Agent Review proof
checks whose timestamped live-smoke reports are generated under ignored
`ops/live-smokes/`.

Current producer:

- `npm run app:smoke:rabbi-agent-review-proof-readiness`

The latest Rabbi proof-readiness files are:

- `latest-rabbi-agent-review-proof-readiness-live.md`
- `latest-rabbi-agent-review-proof-readiness-live.json`

The smoke is read-only. It verifies prompt/artifact/readback state and records
whether terminal Agent Review proof exists, but it does not save Agent Review
results or perform sends, payments, provider writes, credential changes, DNS
changes, or production-data mutations.
