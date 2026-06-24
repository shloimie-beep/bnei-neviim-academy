# Owner Review Script

Review PR #14 by user journey, not by commit history.

## Before Review

1. Check out branch `codex/integration-navigation-owner-review-20260624`.
2. Run `npm ci` if dependencies are not installed.
3. Run `npm run owner-review:routes`.
4. Run `npm run owner-review:role-flows`.
5. Run `npm run owner-review:visual`.
6. Open `docs/owner-review/ROLE-FLOW-QA.md` and use the screenshot links for
   authenticated/synthetic journeys.
7. Open `docs/owner-review/PUBLIC-VISUAL-AUDIT.md` and confirm PR #14 local
   passes while production public remains a recorded stale delta until deploy.
8. Note that GitHub Actions is not attached yet: the attempted workflow push
   was rejected because the current OAuth app lacks `workflow` scope.

## Public Site

Open locally:

- `/`
- `/school`
- `/parents`
- `/providers`
- `/one-time`
- `/blog`
- `/faq`
- `/signup.html`

Check:

- Primary navigation includes School, Families, Service Provider Directory, One
  Time, Blog/FAQ, Registration, and portal logins.
- Operations is not a primary public navigation item.
- Public assistant opens as the public surface and does not expose private data.
- Mobile menu opens, closes, and has no horizontal overflow.
- Header-to-hero gap is no more than 1px in the PR #14 local visual audit.
- Homepage active filter chips have readable active text and semantic
  `aria-pressed` state in the PR #14 local visual audit.

Evidence:

- `ROLE-FLOW-QA.md`: Anonymous public visitor rows.
- `CANONICAL-SITEMAP.md`: public route rows.
- `PUBLIC-VISUAL-AUDIT.md`: 390x844, 768x1024, and 1440x900 computed visual
  assertions and screenshots.

## One Time

Open locally:

- `/one-time`
- `/rabbi-member`
- `/member-library`
- `/one-time-classroom`
- `/provider-participant`

Check:

- Journey is clear: One Time landing -> member home -> library -> classroom ->
  questions/support -> account/logout -> return to public site.
- Member pages use the `one_time_member` assistant surface.
- Provider participant/member pages do not show BNA school accountability data.

Evidence:

- `ROLE-FLOW-QA.md`: Provider participant/member and One Time member rows.
- `PAGE-FLOW-DIAGRAMS.md`: One Time member diagram.

## Parent And Student

Use the screenshots in `ROLE-FLOW-QA.md` for synthetic logged-in states.

Open locally:

- `/parent/login`
- `/student/login`
- `/parent`
- `/student?code=QA-STUDENT`

Check:

- Parent one-child and multi-child layouts show only linked children in the
  synthetic smoke.
- Student journey is own-record scoped.
- Assistant/help entry is visible and scoped on parent and student surfaces.
- Wrong-role/logged-out routes lead to login/recovery, not dead ends.

Evidence:

- `ROLE-FLOW-QA.md`: Parent one-child, parent multiple children, student,
  wrong-role/logged-out, and API failure rows.

## Provider

Open locally:

- `/providers`
- `/providers/join?onboard=provider`
- `/provider`
- `/provider-participant`

Check:

- Directory and provider routes are discoverable from public nav.
- Provider workspace assistant surface is `provider_workspace`.
- Provider participant/member surface remains simpler than BNA school student
  accountability.

Evidence:

- `ROLE-FLOW-QA.md`: Provider administrator and provider participant/member rows.
- `APPLIED-NOT-APPLIED-MATRIX.md`: provider/source rows.

## Operations

Open locally:

- `/operations-login.html`
- `/operations`

Check:

- Logged-out `/operations` redirects to login with a return URL.
- Synthetic super-admin Operations page exposes the Operations helper Ask/Search
  control.
- Desktop and mobile role-flow evidence show the workspace switcher opening the
  One Time Mishnah Class provider workspace (`rabbi_sheller_provider`).
- No public navigation exposes Operations as a consumer-primary destination.

Evidence:

- `ROLE-FLOW-QA.md`: Platform super-admin and wrong-role/logged-out rows.
- Final clean watchdog reports under `ops/watchdog-audits/2026-06-24T05-52-*`.

## Final Local Gates

Run:

```powershell
npm run owner-review:routes
npm run owner-review:role-flows
npm run owner-review:visual
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
npm test
npm run secrets:audit
```

Expected local result:

- Route inventory: 689 routes, 34 HTML pages, 0 orphan-review rows.
- Role-flow QA: PASS.
- Public visual audit: PR #14 local PASS; production public deltas remain until
  merge/deploy.
- Link/action/security watchdogs: severity `ok`, findings 0.
- Full tests: PASS, 1214/1214.
- Secret audit: PASS, 4271 tracked paths, 0 tracked secret-risk files.
- GitHub Actions: not attached yet. Adding the workflow requires GitHub
  `workflow` permission; local gates above are the current credential-free
  evidence until that external permission is granted.

Do not deploy from this script. Deployment and live production verification are
separate approvals after PR #14 is reviewed and merged or an exact release
commit is selected.
