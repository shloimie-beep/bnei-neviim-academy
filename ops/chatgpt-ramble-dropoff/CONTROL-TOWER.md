# ChatGPT / Codex Dropoff Control Tower

Generated: 2026-07-12T07:31:14.274Z

## Lane Safety

- Branch: `codex/onetime-p0p1-corrective-20260711`
- Dirty worktree: yes
- Collision warning: Worktree has local changes. New agents must claim a non-overlapping lane or wait before editing these files.

| Status | Path |
| --- | --- |
| M | config/service-provider-sites/one-time.json |
| M | content-memory/website-blog-posts.json |
| M | ops/action-registry.json |
| M | ops/agent-changelog.md |
| M | ops/agent-task-ledger.jsonl |
| M | ops/chatgpt-ramble-dropoff/incoming/onetime-launch-priority-ui-crm-automation-20260710-001/status.json |
| M | ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/DEPLOYMENT.md |
| M | ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/EVIDENCE.md |
| M | ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/requirements.json |
| M | ops/execution-runs/2026-07-11-onetime-p0p1-owner-crm-landing-corrective/run.json |
| M | ops/execution-runs/latest.json |
| M | ops/route-registry.json |
| M | package.json |
| M | public/data/website-blog-posts.json |
| M | public/js/bna-bot-widget.js |
| M | public/js/operations-deferred-renderers.js |
| M | public/js/operations-shell.js |
| M | public/one-time/index.html |
| M | public/one-time/privacy.html |
| M | public/one-time/terms.html |
| M | public/operations.html |
| M | scripts/chatgpt-dropoff-control-tower.mjs |
| M | scripts/chatgpt-dropoff-ingestor.mjs |
| M | scripts/smoke-onetime-operations-crm-workbench-local.mjs |
| M | scripts/split-operations-shell.mjs |
| M | scripts/watchdog-raw-intake-drift.mjs |
| M | server.js |
| M | src/lib/bna/crm-contact-model.js |
| M | src/lib/bna/intake-schema.js |
| M | src/lib/bna/ramble-routing.js |
| M | tasks-pending/2026-07-11-onetime-p0p1-owner-crm-landing-corrective.md |
| M | tests/chatgpt-dropoff-control-tower.test.js |
| M | tests/chatgpt-dropoff-ingestor.test.js |
| M | tests/crm-contact-model.test.js |
| M | tests/one-time-focused-landing.test.js |
| M | tests/one-time-intake-api-readback.test.js |
| M | tests/one-time-operations-ui-smoke.test.js |
| M | tests/one-time-product-system.test.js |
| M | tests/one-time-route-role-mapping.test.js |
| M | tests/service-provider-scope-routes.test.js |
| M | tests/watchdog-raw-intake-drift.test.js |
| ?? | .github/ |
| ?? | memory/2026-07-12.md |
| ?? | ops/evidence/ |
| ?? | ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion/ |
| ?? | ops/watchdog-audits/2026-07-12-product-quality-drift.json |
| ?? | ops/watchdog-audits/2026-07-12-product-quality-drift.md |
| ?? | public/one-time/signup.html |
| ?? | raw-input/RAW-20260712-001-onetime-pr129-completion-followup.md |
| ?? | raw-input/RAW-20260712-002-onetime-signup-reminder-workflow-addendum.md |
| ?? | raw-input/RAW-20260712-003-onetime-signup-required-markers-consent.md |
| ?? | scripts/simulate-one-time-class-reminder.mjs |
| ?? | scripts/smoke-onetime-crm-journey-local-db.mjs |
| ?? | src/lib/bna/one-time-signup-workflow.js |
| ?? | src/platform/ingestion/operator-ramble-service.js |
| ?? | src/platform/ingestion/packet-status.js |
| ?? | tasks-pending/2026-07-12-onetime-p0p1-corrective-completion.md |
| ?? | tasks-pending/2026-07-12-onetime-signup-reminder-workflow-addendum.md |
| ?? | tests/ingestion/operator-ramble-service.test.js |
| ?? | tests/ingestion/ramble-regression-suite.test.js |
| ?? | tests/one-time-direct-signup-page.test.js |
| ?? | tests/one-time-provider-operations-login.test.js |
| ?? | tests/one-time-signup-reminder-workflow.test.js |

## Packet Status

- Total packets: 3
- Ready: 0
- Blocked: 0
- Draft: 0
- Terminal: 3

| Packet | State | Status | Owner | Lane | Scope | Next |
| --- | --- | --- | --- | --- | --- | --- |
| chatgpt-dropoff-smoke-test-20260705-001 | terminal | done_verified | ChatGPT |  | Harmless smoke test confirming ChatGPT can hand Codex a repo-visible packet or comment and that Codex can collect it automatically. |  |
| onetime-agent-prompt-series-20260706-911 | terminal | done_verified | ChatGPT |  | Provide five Agent Mode audit prompts for the One Time UI audit covering control tower, public funnel, Rabbi operations/backend, portals/classroom, and cross-system synthesis. | Run Prompt 01 first, run Prompts 02-04 after the control-tower map exists, then run Prompt 05 after at least two surface audit reports have dropped repo-visible packets. |
| onetime-launch-priority-ui-crm-automation-20260710-001 | terminal | done_verified | ChatGPT | rabbi_sheller_provider-one_time_mishnah_class-launch-priority | Register and execute the latest One Time launch priority: beautiful landing, Robot Scheller, visible form-to-CRM lead flow, clickable contact CRM, historical inbox reconciliation, gated immediate class-link follow-up, and launch-ready Rabbi backend UI. | No unblocked Codex launch-priority implementation lane remains. Operator/runtime next actions are to configure ONE_TIME_PUBLIC_WHATSAPP_NUMBER for direct public WhatsApp activation and approve the canonical historical source package plus suppression/import policy before any production import/write. |

## Agent Fleet

_None._

### Not Claimable / Needs Cleanup

_None._

### Fallback Task Candidates

_None._

## Recent Pickup Reports

| Report | Updated |
| --- | --- |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-07T09-15-13-onetime-agent-prompt-series-audit.md | 2026-07-11T20:13:40.513Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-05-fleet-claim-completion-fix.md | 2026-07-11T20:13:40.512Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-06T14-25-46-791Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-11T20:13:40.512Z |

## Recommendations

- Do not start overlapping source edits until the dirty-file lane is claimed or isolated in another branch/worktree.
- No ready ChatGPT packets are waiting. Give ChatGPT a scoped packet prompt instead of rerambling the same work to Codex.
- GitHub-connected ChatGPT sees committed/pushed files only; local dirty work must be committed/pushed or summarized in a packet before ChatGPT can use it.
