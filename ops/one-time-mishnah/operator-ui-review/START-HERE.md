# One Time UI Review Start Here

Status: blocked before live review deployment

## Review Base URL

Pending. The separate Railway project/database could not be created with the
available project-scoped token. Do not review the shared BNA deployment as the
separate One Time instance.

Intended URL after provisioning:

- `https://app.onetimeonetime.com`

## Login Routes

- Owner/admin: `/operations-login.html`
- Parent: `/parent.html`
- Student: `/student.html`
- Provider: `/provider.html`
- Member classroom/library: `/one-time-classroom.html`

## Secure Test-Identity Handoff

Local ignored path:

- `.runtime/onetime-review-identities/README.md`

No live test passwords were generated because the separate Railway database was
not provisioned.

## Review Order After Deployment

1. Owner/admin Operations login and One Time workspace scope.
2. Parent portal.
3. Student portal.
4. Provider portal.
5. Member classroom/library.
6. Product/trial/payment readiness.
7. Integrations readiness.

## What Is Real

- Canonical codebase and branch.
- Single-tenant runtime config endpoint.
- One Time workspace/project identity.
- Redacted Railway variable plan.
- Idempotent One Time-only seed SQL.
- Isolation scan SQL.
- Focused live-smoke script.

## What Is Test/Mock

- `TEST-` review identities.
- `@example.test` review emails.
- Manual Vimeo URL reference.
- Checkout/payment/Zoom/Vimeo sends and mutations remain preview/readiness only.

## Externally Blocked

- Account-level Railway auth or a pre-created separate One Time project token.
- Custom-domain DNS records, because Railway has not generated service-specific
  verification values yet.
- Hosted transcription credential `REQ-20260621-902`.

## Next UI-Correction Ramble

After the separate deployment is live, submit one ramble with page-by-page UI
corrections. Include route, viewport, role, what is confusing/broken, desired
copy/behavior, and screenshots if available.
