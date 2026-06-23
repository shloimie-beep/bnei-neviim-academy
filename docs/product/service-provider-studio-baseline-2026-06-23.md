# Service Provider Studio Baseline Audit - 2026-06-23

Source: `RAW-20260623-001`
Worktree: `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio`
Default branch base: `origin/master` at `d37a53e608bb2c2760471c35618340cc4e9e8f18`

## Result

The repository already has the canonical pieces the Studio should reuse:

- Operations is the live surface in `public/operations.html`, with one central API client, scoped workspace navigation, route URL sync, and a single `loadData()` bundle.
- `server.js` owns admin identity, project-scoped provider logins, `isScopedOpsPathAllowed`, `assertWorkspaceAccess`, `resolveProjectForScopedWrite`, `assertProjectOwnedRowAccess`, and DB startup SQL.
- Content already has project-scoped jobs, class sessions, outputs, prompt templates, prompt versioning, examples, bundles, bulk generation, and no-send One Time library handoffs.
- One Time is already modeled as a `service_provider` workspace through `one_time_mishnah_class` / `rabbi_sheller_provider`.
- Remotion assets/scripts already exist under `src/remotion/` and `scripts/video-*.mjs`, so Studio rendering should start with deterministic mock jobs and asset manifests before any live vendor generation.
- Local browser verification patterns already exist in `tests/*-smoke.test.js` with mocked API responses and screenshots under `ops/playwright-smokes/`.

No conflicting canonical implementation was found. The missing piece is a reusable, pre-Content service-provider Studio module that ties source paste, briefs, characters, scene/storyboard versions, layered prompts, mock jobs, usage metering, and Content handoff into those existing primitives.

## Capability Classification

| Capability | Current status | Canonical reuse | Studio gap |
|---|---|---|---|
| Provider workspace identity and tenancy | already_verified | `identifyOpsUser`, scoped One Time roles, `assertWorkspaceAccess`, `workspaceProjectKey`, `workspaceKeyForProject` | Add `studio` to allowed views/nav and scoped API allowlist. |
| Service-provider navigation | partial | `workspaceNavViewIds`, `workspaceNavItems`, `normalizeCurrentRouteForWorkspace` | Insert Studio before Content for `service_provider`; keep family/household excluded. |
| Content library/handoff | partial | `bna_content_jobs`, `bna_content_outputs`, `bna_content_bundles`, `/api/bna/content-*` | Add Studio-to-Content draft handoff with provenance, rights, manifest, and no automatic publish/access grant. |
| Prompt templates and versions | partial | `bna_content_prompts`, `bna_content_prompt_versions`, `generateDraftWithPrompt`, `patchContentPromptWithFeedback` | Add Studio layered prompt compiler, project/scene layers, injection defense, structured output validation, and correction patch scopes. |
| Source intake and immutable provenance | partial | `raw-input`, `bna_content_jobs`, transcript fields, parse JSON | Add immutable Studio source snapshots, normalized text, rich-text annotations, source hash, and WebKit paste recovery. |
| Storyboard/editor | missing | Operations card/section patterns, content detail drawer patterns | Add Studio scene rail, inspector, preview, reorder/duplicate/delete, version compare, and mobile/tablet layout. |
| Durable jobs | partial | content job states, agent run states, Remotion dry-run scripts | Add Studio generation/render/export jobs with retry/cancel/stale-state visibility and mock deterministic outputs. |
| Assets | partial | Content media fields, One Time class assets, Remotion props | Add Studio asset metadata, rights/privacy status, local/mock render references, and no large binary storage. |
| AI usage metering | missing | API Usage page currently states token/cost persistence is not built | Add usage events, price catalog, budgets, rollups, provider view, Super Admin aggregate, and hard-limit/override audit. |
| One Time pilot | partial | One Time configs, review fixtures, member-library flows | Seed via configuration/fixture only: Mishnah source, characters, scenes, correction patches, mock render, usage rollups. |
| Browser verification | partial | Existing Chromium Playwright tests | Add Chromium and WebKit Studio smoke at 390, 768, and 1440 widths. |
| Route/action registries | partial | `ops/route-registry.json`, `ops/action-registry.json`, `npm run watchdog:actions/security` | Register Studio APIs and visible Studio actions. |

## Implementation Direction

1. Add a pure domain module at `src/lib/bna/service-provider-studio.js` for normalization, prompt compilation, correction patches, mock jobs, usage math, and Content handoff payloads.
2. Add an idempotent SQL migration and wire the same SQL into `initDb()` so local/default deployments bootstrap Studio tables consistently.
3. Add `/api/bna/studio/*` routes under `requireAdmin`, using existing scope helpers and project ownership checks.
4. Extend Operations shell with `studio` state, API client methods, provider nav, render function, and action handlers.
5. Keep all generated image/render behavior credential-free and deterministic; external generation/rendering remains future adapter work.
6. Add tests in four layers: pure domain, migration/static API contract, Operations UI contract, and Chromium/WebKit local smoke.

## Guardrails

- No GHL/LeadConnector runtime, schema, actions, smoke checks, or docs.
- No live sends, publishes, payment, access grants, Zoom/Vimeo/Google/Buffer writes, DNS, Railway topology changes, or credential copying.
- No raw private source bodies in task titles, registries, screenshots, or final summaries.
- Provider-scoped users must never enumerate another provider workspace's Studio projects, usage events, assets, or jobs.
- Public/member routes must not expose Studio drafts, source paste text, prompt layers, job payloads, or usage records.
