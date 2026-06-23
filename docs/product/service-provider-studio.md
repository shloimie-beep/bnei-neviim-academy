# Universal Service Provider Studio

Status: implemented locally for `REQ-20260623-003` through `REQ-20260623-013`.

The Universal Service Provider Studio is a private Operations workspace for turning provider source material into scoped pre-production media packages. It is available from `/operations?view=studio` for platform and service-provider workspaces. Family and household workspaces are routed away from this view.

## Workflow

1. Create a Studio project for a first-party BNA project/workspace.
2. Save source material. Raw source stays private in `bna_studio_sources`; the UI shows only previews, hashes, and annotations.
3. Generate storyboard scenes. Scenes are stored in `bna_studio_scenes` and every edit/generation adds a `bna_studio_scene_versions` snapshot.
4. Compile prompt layers. The compiler builds policy, workspace, brief, source, scene, correction, output, and renderer layers.
5. Preview and apply correction patches. Broad patches require explicit confirmation server-side.
6. Run mock render jobs. Mock jobs create local job/assets/usage records without vendor calls.
7. Create a Content handoff. The handoff writes local `bna_content_jobs` and `bna_content_outputs` rows only; no publishing, sending, scheduling, uploads, payment action, access grant, or external CRM write is performed.
8. Review usage in Studio and in `/operations?view=api_usage`.

## Canonical Reuse

- Operations UI: `public/operations.html`
- Server auth/scope helpers: `requireAdmin`, `assertProjectAccess`, `assertWorkspaceAccess`, `resolveProjectForScopedWrite`, `appendScopeCondition`
- Content pipeline: `bna_content_jobs`, `bna_content_outputs`, existing no-send content handoff behavior
- One Time provider scope: `one_time_mishnah_class` and `rabbi_sheller_provider`
- Video/mock render precedent: existing Remotion/video script conventions, but no live render/vendor dependency is required for this first slice

## Verification

- `node --test tests/service-provider-studio-domain.test.js tests/service-provider-studio-api-contract.test.js tests/service-provider-studio-operations-ui.test.js`
- `npm run studio:smoke`
- `npm run watchdog:actions`
- `npm run watchdog:security`

Browser smoke evidence is saved under `ops/playwright-smokes/2026-06-23-service-provider-studio-local/`.
