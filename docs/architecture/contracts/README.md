# Architecture Contracts

These contracts document platform-control boundaries without enabling provider
writes or changing production runtime.

## One Time Communications v1

- `super-admin-external-product-connector-v1.schema.json` defines the reusable
  Super Admin external-product connector envelope.
- `one-time-communications-connector-v1.json` is the accepted One Time
  communications ownership instance.
- `one-time-communications-agent-action-job-v1.schema.json` defines safe Agent
  Action jobs for One Time communications architecture/configuration work.
- `one-time-communications-agent-action-result-v1.schema.json` defines the
  mandatory saved-result/readback record.
- `examples/` contains no-send, no-mutation example instances used by focused
  contract tests.

The schemas are architecture contracts, not permission to email, send
Telegram messages, mutate GHL, change DNS, or deploy production.
