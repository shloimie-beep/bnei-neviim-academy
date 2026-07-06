# One Time Studio Sidekick Surface Map

Date: 2026-07-06
Raw sources: RAW-20260706-002, RAW-20260706-003
Requirement register: tasks-pending/2026-07-06-onetime-studio-sidekick-openart-mcp.md
Product Quality packet: ops/prompt-packets/2026-07-06-onetime-studio-sidekick-openart-mcp/00-control-tower.product-quality.json

## Scope

- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- New role: one_time_ai_studio_operator
- Visible views: studio, tasks
- Primary job: use AI Studio to save characters, inspect image/render feedback, draft prompt patches, export OpenArt-ready prompts, and create scoped Studio repair requests.

## In Scope Surfaces

- Operations route: /operations?workspace=rabbi_sheller_provider&view=studio
- Operations route: /operations?workspace=rabbi_sheller_provider&view=tasks
- Studio API routes already present:
  - /api/bna/studio/dashboard
  - /api/bna/studio/projects
  - /api/bna/studio/projects/:id
  - /api/bna/studio/projects/:id/source
  - /api/bna/studio/projects/:id/outline
  - /api/bna/studio/projects/:id/storyboard
  - /api/bna/studio/projects/:id/prompt-compile
  - /api/bna/studio/projects/:id/corrections/preview
  - /api/bna/studio/projects/:id/corrections/apply
  - /api/bna/studio/scenes/:id
  - /api/bna/studio/scenes/:id/regenerate
  - /api/bna/studio/projects/:id/render
  - /api/bna/studio/jobs/:id/retry
  - /api/bna/studio/jobs/:id/cancel
  - /api/bna/studio/usage
  - /api/bna/studio/projects/:id/handoff

## New Surfaces To Add

- /api/bna/studio/openart/status
- /api/bna/studio/projects/:id/sidekick/patch-preview
- /api/bna/studio/projects/:id/openart/export
- /api/bna/studio/repair/plan
- Operations Studio prompts panel:
  - Sidekick image/render critique text area.
  - Image/reference note field.
  - Scene selector and patch target selector.
  - Draft Prompt Patch action.
  - OpenArt prompt export/copy action.
  - Studio-only repair request planner.
- Operations Studio usage panel:
  - OpenArt MCP readiness card showing no-live OAuth blocker until account connection exists.

## Exclusions

- No raw shell, deploy, migration, DNS, payment, email, WhatsApp, access-grant, or secret action.
- No live OpenArt call before Shloimie signs up and connects OAuth/MCP.
- No cross-workspace propagation of Studio changes.
- No contacts, CRM, accounting, payment, member access, public site, or admin settings access for the Studio operator.

## Existing Code Surfaces

- src/lib/bna/assistant-scope-policy.js blocks Codex CLI, shell, deploy, migrations, secrets, external sends, payments, access grants, DNS, and similar dangerous assistant actions.
- src/lib/bna/service-provider-studio.js already owns Studio source normalization, prompt layers, correction patch preview/apply, mock jobs, usage, and handoff.
- server.js owns Operations identity, scoped path allowlist, Studio API routes, and assistant scope plan.
- public/operations.html owns Studio UI panels and inline handlers.
- ops/action-registry.json and ops/route-registry.json must be extended for every new visible action and route.

## Verification Targets

- npm run pqc:validate ops/prompt-packets/2026-07-06-onetime-studio-sidekick-openart-mcp/00-control-tower.product-quality.json
- node --test tests/assistant-scope-policy.test.js
- node --test tests/one-time-studio-sidekick-policy.test.js
- node --test tests/one-time-studio-openart-adapter.test.js
- node --test tests/service-provider-studio-domain.test.js
- node --test tests/service-provider-studio-api-contract.test.js
- node --test tests/service-provider-studio-operations-ui.test.js
- npm run watchdog:actions
- npm run watchdog:protocol-drift

## External Blockers

- Live OpenArt OAuth/MCP connection remains blocked until Shloimie signs up and connects the account/workspace.
- Exact hosted multimodal model/provider remains an implementation decision after account/API credentials exist.
