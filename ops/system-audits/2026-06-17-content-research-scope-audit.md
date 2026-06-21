# Content / Research Scope Audit - 2026-06-17

## Scope

Requirement IDs: `REQ-20260616-047` through `REQ-20260616-052`.

Raw source: `raw-input/RAW-20260616-001-bna-super-prompt.md`.

Purpose: verify that BNA content, research, prompt-library, and student-question surfaces are scoped to the correct workspace/project and visible in the expected operator/student places.

## Findings

- Content jobs now accept explicit `project_key` / `project` filters at `/api/bna/content-jobs`.
- Class sessions now accept explicit `project_key` / `project` filters at `/api/bna/class-sessions`.
- Operations content loading calls `api.getContentJobs(contentDataProjectFilters())` and `api.getClassSessions(contentDataProjectFilters())` so BNA and One Time content do not share the same unscoped dashboard feed.
- Older content rows without a project are treated as BNA only when the BNA project filter is requested.
- `/api/bna/class-sessions` now returns `project_key`, `project_name`, and `project_short_name` through a project/content-job join.
- The BNA admin prompt library reads API `prompt_text`, displays prompt previews, and has a guarded lazy refresh path for slow prompt API loads.
- The Operations Content Research tab is backed by class sessions and exposes source-sheet/public-bibliography task actions for parsed sessions.
- The student portal keeps a student-visible question shell and server-side portal-safe question views with source and follow-up assignment enrichment.

## Boundaries

- No Google Classroom writes were added.
- No external publishing, email sends, social posts, payment writes, or access grants were added.
- Source-sheet/public-bibliography buttons continue to create first-party review tasks through existing guarded content-job actions.
- Public student portal route remains an anonymous-safe shell until authenticated student access is supplied.

## Verification

- Syntax: `node --check server.js`; `node --check scripts/smoke-content-research-scope-live.mjs`.
- Focused tests: `node --test tests/operations-content-research-section.test.js tests/operations-content-library-taxonomy.test.js tests/operations-content-prompt-feedback.test.js tests/parent-student-portal-contract.test.js --test-reporter=spec` passed 37/37.
- Full tests: `npm test` passed 692/692.
- Local targeted smoke: `ops/live-smokes/2026-06-17T10-04-36-603Z-content-research-scope-live-smoke.md`.
- Local browser proof: `ops/playwright-smokes/2026-06-17-content-research-scope-local/report.md`.
- Railway deployment: `b695d66b-da92-4d00-8a9b-e8a0035334d5`.
- Live app smoke: `ops/live-smokes/2026-06-17T10-08-41-988Z-live-app-smoke.md`.
- Live public-route privacy smoke: `ops/live-smokes/2026-06-17T10-08-54-466Z-public-route-privacy-smoke.md`.
- Live content/research scope smoke: `ops/live-smokes/2026-06-17T10-08-41-217Z-content-research-scope-live-smoke.md`.

## Result

`REQ-20260616-047`, `REQ-20260616-048`, `REQ-20260616-049`, `REQ-20260616-050`, `REQ-20260616-051`, and `REQ-20260616-052` are done with deployed proof.
