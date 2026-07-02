# Ramble Intake - 2026-06-23 - Super Admin One Time View

## Raw intake

> Is there a path that I can go from my super admin to view the one-time Mishnah class? And also, I don't need that other... platform suit I don't know what that is I don't I don't think that's necessary I want to be able to see what he see it and to go into his account I'm super Avenue to go in and view it from his view not from the super adventure view only

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260623-007 |
| Source | codex_chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-23-super-admin-one-time-view.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260623-038 | Add a clear Super Admin action that opens the One Time Mishnah Class as the Rabbi/One Time workspace view. | RAW-20260623-007 | BNA / One Time | Codex | Operations UX / workspace roles | High | 1 | Existing `rabbi_sheller_provider` workspace and One Time project | Super Admin sees a direct `View One Time as Rabbi` action. Clicking it switches to `workspace=rabbi_sheller_provider`, `view=service_providers`, and `section=schedule`, preserving project filters and not creating another credential/session. The URL is shareable/bookmarkable. | `public/operations.html`, `tests/operations-one-time-view-as.test.js` | Yes | Done |
| REQ-20260623-039 | Remove visible `Platform Suite` navigation from the normal Operations shell. | RAW-20260623-007 | BNA / Operations | Codex | Operations UX simplification | High | 1 | None | `Platform Suite` is hidden from sidebar/module toolbar navigation for normal use, while the underlying route can remain for internal compatibility. Focused Operations navigation tests pass. | `public/operations.html`, `tests/operations-one-time-view-as.test.js` | Yes | Done |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260623-038 | Done | Local UI patch adds `View One Time as Rabbi`; Railway deployment `dd09456c-ba4e-4dc8-a15e-bffc5034c9db`; live browser smoke clicked the action and landed on `/operations?view=service_providers&section=schedule&workspace=rabbi_sheller_provider` with `Back to Super Admin` and `7:00 Class` visible. | `public/operations.html`, `tests/operations-one-time-view-as.test.js` | Local focused tests 37/37 passed; deploy-bundle UI/PWA tests 21/21 passed; `npm run railway:doctor` passed; live Super Admin auth smoke passed. | None. |
| REQ-20260623-039 | Done | `Platform Suite` is filtered by `HIDDEN_NAV_VIEW_IDS` from normal nav while `renderPlatformSuite` route remains. Live browser smoke found zero visible Platform Suite buttons/tabs. | `public/operations.html`, `tests/operations-one-time-view-as.test.js` | Same verification as `REQ-20260623-038`; deploy-bundle broad `operations-saas-crm-redesign` still has an unrelated pre-existing live/server drift on parent-lead archived filtering. | None for Platform Suite nav. |
