# Studio Model Adapters

Current adapter status: mock-only.

## Mock Adapter

The mock adapter is implemented in `src/lib/bna/service-provider-studio.js` through deterministic helpers:

- `buildStoryboard()`
- `compileStudioPrompt()`
- `createMockStudioJob()`
- `completeMockStudioJob()`
- `estimateStudioUsage()`

It requires no credentials and performs no network calls.

## Catalog Rows

`bna_studio_price_catalog` seeds:

- `mock / deterministic-v1`
- `openai / gpt-4.1-mini`
- `kimi / kimi-k2.6`

OpenAI/Kimi rows are catalog placeholders for future adapters. They are not active live generation paths in this implementation.

## Activation Requirements

A future live adapter must include:

- explicit operator approval and configuration
- scoped workspace/project enforcement
- keyholder-based secret handling
- usage-event persistence before response
- no raw private prompt/source logging
- retry/cancel semantics
- watchdog and browser smoke coverage
