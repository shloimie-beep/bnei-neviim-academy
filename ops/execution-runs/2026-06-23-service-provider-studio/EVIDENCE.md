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

## Local Implementation Evidence

- Additive Studio migration:
  `railway-migration-2026-06-23-service-provider-studio.sql`
- Shared Studio domain and prompt/job/usage helpers:
  `src/lib/bna/service-provider-studio.js`
- Scoped Operations API routes, RBAC, schema bootstrap, and Content handoff:
  `server.js`
- Operations Studio module before Content with source, storyboard, prompt,
  correction, render, usage, and handoff panels:
  `public/operations.html`
- Route and action registry coverage:
  `ops/route-registry.json`, `ops/action-registry.json`
- Documentation:
  `docs/product/service-provider-studio.md`,
  `docs/architecture/service-provider-studio-prompt-engine.md`,
  `docs/architecture/service-provider-studio-render-jobs.md`,
  `docs/architecture/ai-usage-metering.md`,
  `docs/integrations/studio-model-adapters.md`,
  `docs/security/service-provider-studio-privacy.md`
- Test coverage:
  `tests/service-provider-studio-domain.test.js`,
  `tests/service-provider-studio-api-contract.test.js`,
  `tests/service-provider-studio-operations-ui.test.js`,
  `tests/service-provider-studio-browser-smoke.test.js`,
  `tests/google-workspace-settings-contract.test.js`,
  `tests/ui-01-public-operations-shell.test.js`
- Local browser evidence:
  `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-overview.png`,
  `ops/playwright-smokes/2026-06-23-service-provider-studio-local/mobile-handoff.png`
- Watchdog evidence:
  `ops/watchdog-audits/2026-06-23T07-19-watchdog-audit.md`,
  `ops/watchdog-audits/2026-06-23T07-19-watchdog-action-audit.md`,
  `ops/watchdog-audits/2026-06-23T07-19-watchdog-security-routes.md`

No live vendor generation, public publishing, access grant, external send,
Vimeo upload, paid API call, DNS change, or Railway provisioning was performed.
