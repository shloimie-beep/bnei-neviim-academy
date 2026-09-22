# Parent Identity Linking - Completed 2026-06-15

Source: Codex implementation request for parent/family/student accountability
identity linking only.

## Status

Completed and deployed.

Railway deployment:
`e81c0f20-5bd8-453d-9af0-03051abaf458`

## Scope Shipped

- Added first-party identity-linking helpers for normalized email, phone,
  display-name, person-name, workspace, household, and merge-safety decisions.
- Added compatibility schema for parent/person/contact/workspace/household
  linking, parent access-code accounts, merge reviews, accountability sections,
  accountability items, provider profiles, and provider questions.
- Linked signups, students, parent sessions, parent accounts, household
  memberships, and accountability events around person and household IDs.
- Added parent access-code login at `/parent-login.html`, `/parent/login`, and
  `/api/parent/auth/login`, keeping the parent session cookie separate from
  Operations.
- Added parent-scoped APIs for household, children, child overview,
  accountability, provider index, provider questions, and parent assistant
  actions.
- Added Operations controls for identity backfill, merge-review handling, and
  generating one-time parent access codes.
- Seeded the Dratler household safely: Shloimie as parent, Menachem Mendel as
  BNA student/son, and Esty as family daughter only without BNA student linking.

## Safety Rules Preserved

- Parent records merge only by exact normalized email or phone.
- Child records can reuse a person only inside the same household by normalized
  child name.
- Cross-household child matches create merge-review work instead of automatic
  linking.
- Generated parent access codes are returned once and stored only as hashes.
- No Google Classroom, Zoom, Vimeo, QStudio, MDM, external CRM, Buffer/social,
  WhatsApp/email send, checkout, billing, or member-library write was added or
  performed.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/identity-linking.test.js`
- PASS focused parent/student/provider/service-provider regression tests
- PASS `npm test` 510/510
- PASS local browser smoke:
  - `http://127.0.0.1:8081/parent-login.html` showed Parent Login, Email or
    phone, Access code, and Log In with zero console errors.
  - `http://127.0.0.1:8081/parent/login?onboard=accountability` showed Parent
    Portal and Accountability onboarding assistant with zero console errors.
  - local `/api/parent/me` returned 401 unauthenticated.
- PASS Railway doctor before deploy.
- PASS Railway deployment
  `e81c0f20-5bd8-453d-9af0-03051abaf458`.
- PASS Railway doctor after deploy.
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T09-48-42-298Z-live-app-smoke.md`
- PASS targeted live route smoke:
  - `/parent-login.html` returned 200 and contained Parent Login.
  - `/parent/login` returned 200 and contained Parent Login.
  - `/parent/login?onboard=accountability` returned 200 and contained
    Accountability onboarding assistant.
  - `/api/parent/me` returned 401 unauthenticated.

## Remaining Follow-Up

- Actual parent rollout still needs operator-approved access-code generation
  and delivery to real parents.
- Review any cross-household identity-review rows before approving merges.
- Google Classroom writes, device controls, Zoom/Vimeo/QStudio/MDM, and full
  classroom workflows remain outside this shipped scope.
