# Ramble Intake - 2026-06-23 - Super Admin Universal Portal Login

## Raw intake

> Just make it that I can go to my website and log in from any portal with that username and password. That's what I'm trying to do on my other machine.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260623-004 |
| Source | codex_chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-23-super-admin-universal-portal-login.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260623-009 | Let the configured Operations/super-admin credential entered on parent, student, or provider portal login screens open Operations. | RAW-20260623-004 | BNA / auth portals | Codex | Auth convenience / security | High | 1 | Existing Operations credentials configured | Parent, student, provider, and parent public access-code login endpoints detect a valid Operations identity, set an Operations session cookie, return `redirect_to: /operations`, and do not create parent/student/provider sessions. Portal frontends follow the redirect. Focused tests pass. | `server.js`, `public/provider.html`, `public/student.html`, `public/parent.html`, `public/parent-login.html`, `tests/portal-operations-login-fallback.test.js` | Yes for website-visible behavior | Done |

## Guardrails

- Do not weaken provider, parent, or student auth for normal users.
- Do not let parent/student/provider credentials open Operations.
- Do not create a fake provider/parent/student session for the super-admin credential.
- Do not expose private student/parent/provider payloads before redirect.
- Do not print or record passwords.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260623-009 | Done | Added `maybeHandleOpsPortalFallback` to issue an Operations session for valid Operations identities entered on provider, student, parent password, or parent access-code login endpoints. Portal pages now honor `portal_redirect` and navigate to `redirect_to`. Deployed Railway production hotfix `a60bb082-94a7-4cbd-84a7-898b1b46ec7b`. Live smoke proved username label `shloimie` on the live Provider Portal returns `portal_redirect: true`, `redirect_to: /operations`, sets `bna_ops_session`, and does not set `bna_provider_session`. | `server.js`; `public/provider.html`; `public/student.html`; `public/parent.html`; `public/parent-login.html`; `tests/portal-operations-login-fallback.test.js`; `ops/live-smokes/2026-06-23T17-43-portal-ops-login-fallback-live-smoke.md` | Desktop focused verification: `node --check server.js` passed; focused portal/auth tests passed 44/44. Deploy-bundle verification: `node --check server.js` passed; deploy-copy fallback test passed 3/3. Railway doctor passed. Live Provider Portal smoke passed. | None for live website. GitHub/laptop local checkout still needs a future clean commit/push if Shloimie wants the laptop's local repo copy to contain this source patch too. |
