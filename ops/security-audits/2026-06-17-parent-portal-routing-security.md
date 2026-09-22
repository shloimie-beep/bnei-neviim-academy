# Parent Portal Routing Security Audit - 2026-06-17

## Scope

- `RAW-20260616-001`
- `REQ-20260616-022` - public Parent Portal link must not expose a private dashboard
- `REQ-20260616-023` - parent login redirect/glitch
- `REQ-20260616-024` - replace Start Accountability Intake copy
- `REQ-20260616-027` - broader parent/student/provider portal security audit
- `REQ-20260616-070` - parent-managed student login reset must name the child

## Findings

| Area | Evidence | Status |
|---|---|---|
| Public website parent CTA | `public/js/bna-site-nav.js` sends the shared site-nav parent login link to `/parent/login`; `public/index.html` uses `/parent/login?onboard=accountability` for the parent onboarding CTA. | Locally safe |
| Parent login session behavior | `public/parent-login.html` no longer silently redirects an already-authenticated browser to `/parent` during session check. It shows a `continuePanel` with the active parent label and a `Use a different parent login` action that calls `/api/parent/auth/logout`. | Locally safe |
| Parent login copy | `public/parent-login.html` replaces `Start Accountability Intake` with `Request parent access / Family App setup`. | Done |
| Static private data exposure | `tests/public-route-privacy-contract.test.js` confirms public/portal route shells do not embed known private student data and adds coverage for the parent-login safe continue panel. | Covered locally |
| Parent identity API | `server.js` routes `/api/parent/me` through `requireParentIdentityContext`, which requires a valid parent session and resolved household before returning household data. | Covered locally |
| Parent portal API | `server.js` route `/api/parent-portal` requires `getValidParentSession` and returns 401 without a parent session. | Covered locally |
| Child login reset scope | `server.js` route `/api/parent-portal/students/:studentId/login-account` requires a parent session and uses `getParentPortalStudentForSession(session.parentEmail, studentId)` before resetting the student login. | Covered locally |
| Child login reset UI | `public/parent.html` renders the child name in the reset title, copy, labels, submit button, and success state. | Done |

## Verification

- `node --test tests/identity-linking.test.js tests/public-route-privacy-contract.test.js tests/parent-student-portal-contract.test.js tests/student-portal-auth-policy.test.js`
- `public/parent-login.html` inline script syntax check
- `public/parent.html` inline script syntax check
- Playwright file smoke at
  `ops/playwright-smokes/2026-06-17-parent-login-public-entry/report.md`:
  logged-out mobile form, signed-in desktop continue panel, and switch-parent
  logout/form-return state.

## Remaining Work

- Run a live unauthenticated/authenticated browser smoke after deployment for `/parent/login`, `/parent`, `/student/login`, `/provider/login`, and their private APIs.
- Complete the broader `REQ-20260616-027` audit across student and provider portals, including browser-back/caching behavior, session switching, direct-link behavior, and private API response snippets.
- Apply/deploy the current local bundle before marking app-visible parent portal security work complete in production.
