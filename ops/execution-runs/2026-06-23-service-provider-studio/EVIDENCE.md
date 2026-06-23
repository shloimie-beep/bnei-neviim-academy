# Evidence

## Intake And Run Setup

- Raw prompt:
  `raw-input/RAW-20260623-001-universal-service-provider-studio.md`
- Daily memory:
  `memory/2026-06-23.md`
- Requirement register:
  `tasks-pending/2026-06-23-universal-service-provider-studio.md`
- Active run:
  `ops/execution-runs/2026-06-23-service-provider-studio/`
- Feature worktree:
  `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio`
- Feature base:
  `d37a53e608bb2c2760471c35618340cc4e9e8f18`

## Canonical Baseline Audit

- Baseline artifact:
  `docs/product/service-provider-studio-baseline-2026-06-23.md`
- Inspected canonical server scope helpers:
  `identifyOpsUser`, `isScopedOpsPathAllowed`, `assertWorkspaceAccess`,
  `resolveProjectForScopedWrite`, `assertProjectOwnedRowAccess`,
  `appendScopeCondition`.
- Inspected canonical UI patterns:
  `public/operations.html` API client, `workspaceNavViewIds`,
  `workspaceNavItems`, `normalizeCurrentRouteForWorkspace`, `loadData`,
  `renderContent`, `renderApiUsage`, and render switch.
- Inspected canonical content/prompt/render primitives:
  `bna_content_jobs`, `bna_content_outputs`, `bna_content_prompts`,
  prompt versioning, content bundles, One Time library handoffs, `src/remotion`,
  and `scripts/video-*.mjs`.
- Inspected canonical verification patterns:
  `tests/one-time-operations-ui-smoke.test.js`, action/security watchdogs,
  route/action registries, and local Playwright screenshot evidence.
