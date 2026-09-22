# RAW-20260624-001 - Integration Navigation Owner Review Closeout

Source channel: `codex_chat`

Captured source:

Shloimie asked for a credential-free Integration, Navigation, and Owner-Review
Closeout pass after two separate draft PRs and a running agent left the
application unproven as one combined, navigable user system.

Scope:

- Consolidate PR #12 head `428ee78682a201b233b2f3da71bf0205b48812ad`,
  PR #13 head `6560b8f02580e5f182a95df84ad8d5383403d887`, and the active
  agent branch into one integration PR.
- Inventory every route/page/link/form/deep-link surface.
- Fix navigation, orphan, duplicate, auth recovery, return-path, and One Time
  journey issues without external credentials, production readback, production
  mutation, deploy, send, publish, upload, charge, DNS, or secret requests.
- Verify public, parent, student, provider, provider participant/member, One
  Time member, super-admin, wrong-role/logged-out, and failure states with
  synthetic local fixtures and mock integrations.
- Produce owner-review artifacts and keep remaining work limited to real
  external credentials, production approvals, deploy/live verification, or
  operator decisions.

Parse status: `registered`

Requirement register:

- `tasks-pending/2026-06-24-integration-navigation-owner-review-closeout.md`

Primary branch/PR:

- Branch: `codex/integration-navigation-owner-review-20260624`
- Draft PR: #14
