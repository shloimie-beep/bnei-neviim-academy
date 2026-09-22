# Service Provider Studio Privacy

Studio is private Operations tooling. It is not a public, parent, student, or provider portal route.

## Scope Rules

- `/operations?view=studio` is visible to platform and service-provider workspaces.
- Family and household workspaces are routed to dashboard.
- API routes use `requireAdmin`.
- Project detail and write routes verify `assertProjectAccess()` and `assertWorkspaceAccess()`.
- List and usage routes use `appendStudioScope()`.

## Source Material

Raw source is stored in `bna_studio_sources.raw_text` as private provenance. The API/UI returns previews, hashes, annotations, and normalized metadata for normal display. Do not commit raw private source to tracked files, screenshots, task titles, or logs.

## External Write Policy

Studio actions do not publish, send, schedule, upload, create payments, grant member access, write to GHL/LeadConnector, or call Buffer. The Content handoff creates local first-party Content records only and sets no-send/no-publish metadata.

## Verification

- Static contract tests assert no active Studio route block uses GHL, LeadConnector, Buffer, or `fetch()`.
- Browser smoke confirms the Handoff UI states no external provider action.
- Watchdog action/security audits pass with Studio registry rows.
