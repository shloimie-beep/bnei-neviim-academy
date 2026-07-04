# Current-State Studio Audit - 2026-07-02

Parent raw: `RAW-20260702-010`
Workspace/project: `rabbi_sheller_provider / one_time_mishnah_class`
Route: `/operations?view=studio`

## Scope

This audit covers the first usable Studio slice only: the private Operations
Studio prompt, job, and handoff readbacks. It does not approve AI-video vendor
calls, external uploads, publishing, sends, access grants, payments, Drive
writes, Vimeo writes, GHL runtime, or LeadConnector references.

## Evidence Reviewed

- `public/operations.html` Studio renderer and handlers.
- `src/lib/bna/service-provider-studio.js` domain behavior.
- `server.js` Studio API route block.
- `tests/service-provider-studio-operations-ui.test.js`.
- `tests/service-provider-studio-browser-smoke.test.js`.
- `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-overview.png`.
- `ops/playwright-smokes/2026-06-23-service-provider-studio-local/mobile-handoff.png`.
- Focused Studio tests and local Studio smoke previously passed for the mock
  no-send workflow.

## Findings

| Finding | Severity | Requirement | Evidence | Required Fix |
|---|---|---|---|---|
| Compiled prompt readback defaults to a raw `<pre class="settings-code-block">` block. | P1 | REQ-20260702-965 | `public/operations.html` `renderStudioPromptPanel` | Render a structured Prompt Review card first; keep raw text only in diagnostics. |
| Prompt layer cards default to raw layer content. | P1 | REQ-20260702-965 | `public/operations.html` `renderStudioPromptPanel` | Render layer type, status, guardrail/source flags, and a short readable excerpt. |
| Correction preview defaults to raw JSON. | P1 | REQ-20260702-965 | `public/operations.html` `renderStudioPromptPanel` | Render scope, confirmation state, patch id, and affected operations. |
| Job readbacks default to raw request/result JSON. | P1 | REQ-20260702-965 | `public/operations.html` `renderStudioJobsPanel` | Render job status, provider/model, no-external-write flags, and asset/scene counts. |
| Handoff result defaults to raw JSON. | P1 | REQ-20260702-965 | `public/operations.html` `renderStudioHandoffPanel` | Render no-publish/no-send readback, content job id, idempotency key, and output status. |

## Definition Of Ready

- Raw intake and register exist.
- Control tower packet validated.
- Current readback problem is isolated to one major surface: Operations Studio.
- External vendor work remains out of scope.
- First implementation may edit only the Studio readback UI, tests, registry,
  and closeout evidence.

## Next Packet

`02-polished-review-ux.product-quality.json`
