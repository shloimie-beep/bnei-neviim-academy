# Full System Reality Audit And Unblocked Implementation Pass - 2026-06-24

Raw source: `raw-input/RAW-20260624-002-full-system-reality-audit-and-unblocked-implementation-pass.md`

Branch: `codex/integration-navigation-owner-review-20260624`

Draft PR: #14

Goal-mode requested: yes, via operator request "make this prompt a goal".

## Guardrails

- Do not use external credentials or request secret values.
- Do not read private production state without explicit read-only approval.
- Do not mutate production databases, apply backfills, deploy, send email or
  Telegram messages, publish, upload, charge, alter DNS, or perform OAuth or
  account-owner actions.
- Keep PR #14 focused on release-acceptance defects. Move bot runtime, class
  backfill, Stripe, Vimeo, and broad integration work into follow-up requirements
  unless a PR #14 claim depends on the change.

## Current Git Truth Snapshot

Captured at start of this pass:

- Worktree: `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review`
- Branch: `codex/integration-navigation-owner-review-20260624`
- Local HEAD: `7da18227804498d8868201f8f94a266da048ba50`
- Remote tracking branch: `origin/codex/integration-navigation-owner-review-20260624`
- Remote PR #14 head: `7da18227804498d8868201f8f94a266da048ba50`
- Remote `master`: `a9528b2d9467174d76d4c25bfb028f9308f24b4f`
- PR #14: open draft, clean merge state, no status checks attached.
- PR #12 head `428ee78682a201b233b2f3da71bf0205b48812ad`: ancestor of PR #14 HEAD.
- PR #13 head `6560b8f02580e5f182a95df84ad8d5383403d887`: ancestor of PR #14 HEAD.
- Production deployed SHA: not inspected in this pass yet; production metadata
  may require explicit read-only approval. Public homepage GET/browser checks
  are allowed because the public site is anonymous.
- Independent CI: blocked because GitHub rejected workflow-file push without
  `workflow` OAuth scope.

## Requirement Register

| ID | Requirement | Source statements | Scope | Status | Current classification | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-20260624-012 | Preserve and route the full-system reality audit ramble without duplication. | Section 1 | Intake/protocol | Done | Implemented locally | Raw source, register, ledger, and changelog are recorded for this batch. |
| REQ-20260624-013 | Establish authoritative Git truth for PR #14, PR #12, PR #13, master, worktrees, dirty/untracked files, and test-count claims. | Section 2 | Git/evidence | Done for credential-free batch | Implemented locally | Git truth, PR ancestry, dirty worktree classification, and stale test-count reconciliation are recorded. Post-push SHA is reported from Git/GitHub. |
| REQ-20260624-014 | Compare production, PR #14, and local state for public navigation and homepage UI. | Section 3 | Public website | Done for public anonymous scope | Implemented locally | Public production vs PR #14 local screenshots and computed DOM facts are stored in the visual audit report. Private production readback remains blocked by Decision. |
| REQ-20260624-015 | Fix and verify public homepage header-to-hero gap at 390x844, 768x1024, and 1440x900. | Section 4, Required homepage repairs | PR #14 release acceptance | Done locally | Implemented and verified | PR #14 local passes `abs(header.bottom - hero.top) <= 1` at all three viewports; production remains stale until merge/deploy. |
| REQ-20260624-016 | Fix and verify selected horizontal tab/category contrast and semantics. | Section 4, Selected horizontal tab | PR #14 release acceptance | Done locally | Implemented and verified | Homepage active filter chips now pass computed contrast and expose `aria-pressed=true` in the PR #14 local audit. |
| REQ-20260624-017 | Complete additional visual defect list for production-facing and major portal pages. | Section 4, Additional visual inspection | Partially done | Homepage visual defect list complete | Public homepage defects are fixed and documented; wider authenticated visual audit remains covered by role-flow screenshots and follow-up review, not production credentials. |
| REQ-20260624-018 | Build/repair safe local authenticated navigation harness beyond synthetic route registry proof. | Section 5 | Auth/navigation | Not started | Partially implemented in role-flow smoke | Expand harness for login entry points, returnTo safety, refresh/logout/deep-link/back/workspace/role switching, and leakage checks. |
| REQ-20260624-019 | Implement and verify clear super-admin path into Rabbi Scheller provider workspace. | Section 6 | Operations/provider workspace | Not started | Partially implemented in other worktrees; not proven in PR #14 current state | Inspect PR #14 surfaces, add/repair clear directory-to-workspace path if missing, verify scoped links and no leakage. |
| REQ-20260624-020 | Audit real website/portal bot runtime end to end, not only contracts/widgets. | Section 7 | Bot/runtime | Not started | Follow-up PR likely | Credential-free local readiness and exact missing-provider reasons can be tested; live model calls may require Decisions. |
| REQ-20260624-021 | Reconcile class Drive intake, transcription, parsing, student matching, scores, questions, profiles, accountability, and UI read models. | Section 8 | Class intake/backfill | Not started | Follow-up PR / production readback blocked | Build read-only diagnostic, dry-run backfill, tests, and per-job report; no production mutations without approval. |
| REQ-20260624-022 | Implement credential-free Stripe sandbox readiness and tests. | Section 9 | Billing | Not started | Follow-up PR | Add/verify explicit not_configured/sandbox/live states, mock tests, audit events, entitlement behavior; credentials require Decision. |
| REQ-20260624-023 | Implement credential-free Vimeo readiness and tests. | Section 10 | Video integrations | Not started | Follow-up PR | Add/verify embed/readiness/upload-request/mock-upload/transcript/class linkage states; real upload requires Decision. |
| REQ-20260624-024 | Create/update canonical Decisions only for external/operator blockers. | Section 11 | Decisions | Not started | Needs operator decisions | Create blocker list for GitHub workflow scope, safe auth/demo sessions, production readback, Drive, Railway, Stripe, Vimeo, bot credentials, merge/deploy/live verification. |
| REQ-20260624-025 | Keep PR strategy clean: PR #14 release-acceptance defects here, follow-up branches for broad runtime integrations. | Section 12 | PR strategy | In progress | Implemented as policy in this register | Record why any change belongs in PR #14 before committing it. |
| REQ-20260624-026 | Run required validation with exact SHA/timestamp/credential/write metadata for every command. | Section 13 | Verification | Done for this batch | Implemented locally | Verification log below records command, SHA, result, credential use, and external-write status. |
| REQ-20260624-027 | Produce final report with the 24 exact requested sections and status vocabulary. | Section 14 | Reporting | Not started | Pending implementation/audit | Only after current safe batch finishes; do not mark broad runtime items done without proof. |

## Decisions / External Blockers

| ID | Decision | Reason | Owner | Blocks | Exact next action |
| --- | --- | --- | --- | --- | --- |
| DEC-20260624-001 | GitHub workflow permission for PR #14 CI | Current OAuth app cannot push `.github/workflows/*` and PR #14 has no independent checks. | Shloimie / repo admin | REQ-20260624-013, REQ-20260624-026 independent CI proof | Use a GitHub token/app with `workflow` scope or have a repo admin add the credential-free workflow, then rerun PR checks. |
| DEC-20260624-002 | Production read-only inspection approval | Production-vs-PR claims need live metadata and private runtime readback beyond public anonymous pages. | Shloimie | REQ-20260624-014, REQ-20260624-020, REQ-20260624-021 | Approve exact read-only production target and allowed commands; no writes/backfills. |
| DEC-20260624-003 | Safe authenticated demo sessions or fixture policy | Full authenticated navigation/click-map cannot use production passwords. | Shloimie | REQ-20260624-018, REQ-20260624-019 | Approve safe local fixture harness as sufficient for PR #14, or provide non-production demo identities/access links. |
| DEC-20260624-004 | Class-intake production job range and readback target | Jobs 64-74 and uploaded class state require exact read-only source and later mutation approval. | Shloimie | REQ-20260624-021 | Approve read-only class-intake diagnostic target and exact job range; mutation plan remains separate. |
| DEC-20260624-005 | Stripe sandbox credentials and billing policy | Sandbox live API tests need test keys/webhook secret and policy choices. | Shloimie | REQ-20260624-022 | Store Stripe test credentials in approved secret store and decide price/trial/cancel/refund/tax/grace/revenue policies. |
| DEC-20260624-006 | Vimeo test account/token/folder/asset | Real upload tests need an approved test account, token, destination, and synthetic file. | Shloimie / account owner | REQ-20260624-023 | Store Vimeo test token in approved secret store and approve one non-sensitive test asset/folder. |
| DEC-20260624-007 | Merge/deploy/live verification approval | PR #14 is not merged or deployed. | Shloimie | All live-verified claims | Select exact release commit after review, approve merge/deploy/live smoke separately. |

## Batch Plan

1. PR #14 release-acceptance visual batch: `REQ-20260624-014` through
   `REQ-20260624-017`.
2. PR #14 navigation/auth proof batch: `REQ-20260624-018` and
   `REQ-20260624-019`.
3. Runtime follow-up registers/branches: bot runtime, class intake, Stripe, and
   Vimeo (`REQ-20260624-020` through `REQ-20260624-023`).

## Verification Log

| Timestamp | SHA | Command | Result | Credentials | External writes |
| --- | --- | --- | --- | --- | --- |
| 2026-06-24T08:02+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `gh pr view 14 --json ...` | PR #14 open draft, clean, no checks | GitHub metadata auth only | none |
| 2026-06-24T08:02+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `git merge-base --is-ancestor 428ee786... HEAD` and `6560b8f... HEAD` | Both source PR heads are ancestors of PR #14 HEAD | none | none |
| 2026-06-24T08:46+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run owner-review:visual` | PASS for PR #14 local; production public deltas recorded | none beyond anonymous public GET | none |
| 2026-06-24T08:47+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `node --test tests\owner-review-role-flow-contract.test.js` | PASS 6/6 | none | none |
| 2026-06-24T08:50+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run owner-review:role-flows` | PASS, refreshed local role-flow screenshots/report | none | none |
| 2026-06-24T08:51+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run owner-review:routes` | PASS, 689 routes, 34 HTML pages, 0 orphan-review rows | none | none |
| 2026-06-24T08:52+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run watchdog:links` | PASS, severity ok, findings 0; report `ops/watchdog-audits/2026-06-24T05-52-watchdog-link-audit.md` | none | none |
| 2026-06-24T08:52+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run watchdog:actions` | PASS, severity ok, findings 0; report `ops/watchdog-audits/2026-06-24T05-52-watchdog-action-audit.md` | none | none |
| 2026-06-24T08:52+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run watchdog:security` | PASS, severity ok, findings 0; report `ops/watchdog-audits/2026-06-24T05-52-watchdog-security-routes.md` | none | none |
| 2026-06-24T09:04+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm test` | PASS 1214/1214 | none | none |
| 2026-06-24T09:05+03:00 | `7da18227804498d8868201f8f94a266da048ba50` | `npm run secrets:audit` | PASS, 4254 tracked paths, 0 findings | none | none |

## Final Audit

Open. The public visual release-acceptance batch is locally verified, but this
goal is not complete: authenticated runtime, bot, class-intake, Stripe, Vimeo,
production readback, merge/deploy, and live-smoke items remain open or blocked
by the Decisions above.
