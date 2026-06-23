# Worker Requirement Packages

The linked machine-readable run is
`ops/execution-runs/2026-06-19-parallel-platform-finish/requirements.json`.

## W1 - Core Platform Backend And Data

Requirement ID: `REQ-20260619-401`

Acceptance criteria:

- tenancy/workspace/RBAC contracts are implemented in owned paths
- member, student, service provider, community, course, video, and reward domain
  models have local services or migrations
- negative isolation tests prove cross-workspace and One Time/BNA data isolation
- shared endpoint needs are recorded in W1 `INTEGRATION.md`
- no external or production mutations

## W2 - SaaS UI And Product Experience

Requirement ID: `REQ-20260619-402`

Acceptance criteria:

- polished responsive shell exists in owned UI paths
- information architecture covers community, course, student, provider, reward,
  and prompt queue surfaces
- controls respond to role/module visibility view models
- mobile/accessibility/browser tests cover primary layouts
- shared `public/operations.html` integration needs are recorded in W2
  `INTEGRATION.md`

## W3 - Ramble Queue, Parser, Agent Loop, Content Prompt

Requirement ID: `REQ-20260619-403`

Acceptance criteria:

- Drive/local ramble intake contract is documented and tested
- parent prompt queue has visible status semantics
- parser deduplication and Decisions/task routing have regression tests
- agent-run verification loop records proof/blockers
- WhatsApp prompt v3 and approved-example flow are documented/testable locally
- shared bridge/agent/scheduler needs are recorded in W3 `INTEGRATION.md`

## W4 - One Time Partner Instance And Integrations

Requirement ID: `REQ-20260619-404`

Acceptance criteria:

- One Time single-tenant configuration, seeding, and branding live in owned paths
- split-ready architecture preserves separate DB/domain/secrets assumptions
- duplicate One Time repos are audited read-only and summarized
- Vimeo, Zoom, and Resend adapters/readiness use docs, mocks, and local tests
- no DNS, Railway, live OAuth, real upload, live Zoom mutation, live Resend send,
  or credential entry
- shared integration adapter needs are recorded in W4 `INTEGRATION.md`

## Prompt 05 - Final Integration

Requirement ID: `REQ-20260619-405`

Acceptance criteria:

- worker branches are merged in the recorded order
- shared-file requests are reviewed and applied once
- full local tests, run validation, secret audit, and route/action watchdogs pass
- external gates remain blocked until operator approval
- deployment/live-smoke proof is recorded only after explicit approval
