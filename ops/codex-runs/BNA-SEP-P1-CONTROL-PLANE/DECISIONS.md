# Decisions

- Accepted packet truth: current state failed the requested separation target and needs a clean internal control-plane boundary.
- Reused only safe patterns from open PRs #136 and #137: signed event verification, replay/idempotency posture, and asynchronous command/result/outbox ideas.
- Rejected the current detailed-ticket/status/Telegram-decision coupling from #136/#137 for this lane.
- Created an additive review scaffold under `services/bna-control-plane/` instead of wiring root `server.js`, product pages, route registries, action registries, Railway, Telegram, or provider runtimes.
- Modeled product-owned support details as product URLs plus redacted case index data only.
- Kept Telegram to an allowlisted alert renderer and fake disabled transport. No command callback or mutation path exists.
- Non-test startup fails closed unless independent control-plane config is present and provider/product credentials are absent.
