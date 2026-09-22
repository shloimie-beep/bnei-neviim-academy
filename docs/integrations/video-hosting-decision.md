# Video Hosting Decision

Status: undecided. INT-05 keeps the workflow host-independent and blocks
provider uploads until Shloimie chooses the host/account model.

## Decision Table

| Option | Filter reliability | Embed/access control | API upload | Captions/transcripts | Ownership question |
|---|---|---|---|---|---|
| Vimeo | Often better for private embeds than public portals, but plan support must be confirmed. | Private links/domain/embed controls may fit family/student use if the plan supports them. | Requires a token and plan capability confirmation. | BNA can keep transcript/worksheet generation provider-neutral. | Which BNA/Rabbi-owned admin account owns the library? |
| YouTube | May be blocked by family/student filters and supervised devices. | Unlisted/private behavior depends on account and viewer restrictions. | Requires OAuth scopes and quota planning. | Strong caption ecosystem, but public-platform exposure needs review. | Which channel owns BNA vs Rabbi / One Time videos? |
| Drive/first-party | Often works where video portals are filtered, but UX and permissions need care. | Strong first-party gating is possible through approved app paths. | Google writes require explicit approval gates. | Best fit for BNA-controlled transcript and worksheet flow. | Does BNA Operations or the Rabbi-owned app host final media? |

## Provider-Neutral Pipeline

1. Recording is dropped into Drive/raw media intake.
2. Ingest job is created.
3. Transcript and title are generated.
4. Student questions are parsed.
5. Worksheet preview is generated from an actual worksheet style sample.
6. Opener/closer/template package is added.
7. Video library draft is created.
8. Approval queue reviews privacy, audience, and rollback.
9. Provider upload/publish happens only after host decision and exact approval.

## Current Guardrails

- `GET /api/bna/integrations/video-hosting/status` is readiness only.
- `POST /api/bna/video-library/drafts` creates a local preview response only.
- `POST /api/bna/video-library/:id/upload-preview` is preview only.
- `POST /api/bna/video-library/:id/upload` is blocked until provider decision,
  account owner, upload capability, and approval are documented.

## Open Inputs

- Decide Vimeo vs YouTube vs first-party/Drive based on family/student filter
  reliability and embed UX.
- Confirm whether the Vimeo plan/account supports API upload and the needed
  privacy/embed controls.
- Provide actual worksheet style samples before final worksheet generation.
