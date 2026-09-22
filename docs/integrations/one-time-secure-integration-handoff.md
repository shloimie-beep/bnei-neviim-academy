# One Time Secure Integration Handoff

Updated: 2026-06-19

Scope: Rabbi Elie Scheller / One Time Mishnah Class only.

## Source

- Latest Drive brief: `2026-06-18-rabbi-elie-scheller.md`
- Drive file ID: `1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI`
- Local implementation: `src/lib/bna/one-time-drive-brief.js`
- Operations preview: Content -> Meeting Drops -> Preview Drive Brief

No raw transcript text, API keys, passwords, tokens, client secrets, DNS record values, or private account exports are stored in this file.

## Integration Readiness Rules

- All records must use `project_key=one_time_mishnah_class` and `workspace_key=rabbi_sheller_provider`.
- Preview, readiness checks, and draft payload generation are allowed locally.
- Account creation, role changes, meeting creation, video upload, email sending, DNS writes, and payment writes are blocked until the relevant owner decision is recorded.
- Secrets must be stored only in the local keyholder workflow or server environment variables after explicit operator approval.
- The meeting brief mentions GHL historically. Active runtime remains first-party BNA; do not add a new active GHL runtime.

## Zoom

Official docs:

- Server-to-Server OAuth: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
- Create an internal app: https://developers.zoom.us/docs/internal-apps/create/
- API authentication: https://developers.zoom.us/docs/api/authentication/

Prepared locally:

- Existing helper: `src/lib/integrations/zoom.js`
- Allowed now: readiness checks and no-write meeting intent previews.
- Blocked writes: create meeting, grant role, change user, change account settings.

Operator Decision:

- `DEC-20260618-201`: Verify Zoom owner role, license, and app-management path.
- Needed: account ID, owner/admin role, license state, Server-to-Server OAuth app permission, required scopes.

## Vimeo

Official docs:

- API quickstart: https://developer.vimeo.com/api/guides/start
- Authentication: https://developer.vimeo.com/api/authentication
- Upload videos: https://developer.vimeo.com/api/upload/videos

Prepared locally:

- Existing helper: `src/lib/integrations/vimeo.js`
- Allowed now: readiness checks and no-write upload intent previews.
- Blocked writes: upload videos, privacy/folder changes, embed-domain changes.

Operator Decision:

- `DEC-20260618-202`: Decide Vimeo seat, user, token, and manual-library strategy.
- Needed: team-seat decision, temporary shared-login exception decision, token/app ownership, approved embed domains.

## Resend

Official docs:

- Domains: https://resend.com/docs/dashboard/domains/introduction
- API keys: https://resend.com/docs/dashboard/api-keys/introduction
- Create API key: https://resend.com/docs/api-reference/api-keys/create-api-key
- DMARC: https://resend.com/docs/dashboard/domains/dmarc

Prepared locally:

- Existing helper: `src/lib/integrations/resend-client.js`
- Allowed now: readiness checks, sender-domain metadata checks, and no-send previews.
- Blocked writes: create API key, send email, verify domain by DNS write, bulk contact import.

Operator Decision:

- `DEC-20260618-203`: Decide Resend recovery, new account, or alternate email provider.
- Needed: account owner, sender domain, from identity, server-side API key storage, DNS records from the provider dashboard.

## Exact Owner-Only Decisions Still Open

- `DEC-20260618-201`: Zoom owner role, license, and Server-to-Server OAuth path.
- `DEC-20260618-202`: Vimeo team seat/user/token/manual-library strategy.
- `DEC-20260618-203`: Resend recovery/new account/alternate provider decision.
- `DEC-20260618-204`: One Time launch domain and DNS authority.
- `DEC-20260618-205`: Stripe role, live/test mode, and payment structure.
- `DEC-20260618-207`: YouTube access deferred or granted for Week 3 content workflow.
- `DEC-20260618-208`: Meta/Facebook access session before ads or page posting.
- `DEC-20260618-209`: First-party email provider path without reviving active GHL runtime.

## Local Acceptance

- `tests/one-time-drive-brief-ingestion.test.js` verifies no-write preview behavior, idempotency, owner/admin assignments, and One Time only scoping.
- Live credential setup and production mutation remain blocked until local acceptance passes and the operator explicitly approves deployment or external-account changes.
