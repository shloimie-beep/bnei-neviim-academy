# Applied / Not-Applied Matrix

Branch: `codex/integration-navigation-owner-review-20260624`

Draft PR: #14

Generated: 2026-06-24

| Feature | Source PR/commit | Present on integration branch | Merged to master | Currently live | Navigation entry | Tested role | Remaining blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Complete system reconciliation / Issue #8 safety work | PR #12 head `428ee78682a201b233b2f3da71bf0205b48812ad`, merged into PR #14 through `507f894b` | Yes | No | No | Internal Operations/tooling docs and scripts | Super-admin/system tests | External readback, production mutation, and deploy gates remain intentionally blocked. |
| Universal assistant/control-plane addendum | PR #13 head `6560b8f02580e5f182a95df84ad8d5383403d887`, merged into PR #14 through `678cbdcf` | Yes | No | No | Website assistant, Operations helper, portal assistant entries | Public, parent, student, provider, One Time member, super-admin | Live credentials/deploy remain blocked; local action/assistant parity is tested. |
| Owner-review route inventory and release gates | `fc4d8814`, `094ca7c6`, `e4378c31` | Yes | No | No | `docs/owner-review/*`, `npm run owner-review:routes` | All local route surfaces | None for credential-free route inventory; production verification is blocked until merge/deploy approval. |
| Independent credential-free CI gate | Attempted current PR #14 owner-review batch | Blocked | No | No | Not attached | Local credential-free gates passed | GitHub rejected the workflow commit because the current OAuth app lacks `workflow` scope. Requires a token/app with workflow permission or repo-admin workflow creation. |
| One Time canonical member journey | `3375c9fe` | Yes | No | No | `/one-time`, `/rabbi-member`, `/member-library`, `/one-time-classroom` | One Time member, provider participant | None for local navigation; live member data remains credential/deploy gated. |
| Public IA repair | `ca49a140` plus current owner-review role-flow batch | Yes | No | No | Public nav includes Service Provider Directory and One Time | Public visitor desktop/mobile | None locally; live public homepage awaits merge/deploy. |
| Shared assistant visibility on owner-review surfaces | `d853b9205626e6ea50bd3b639b7718b1f374040d` | Yes | No | No | Portal topbar Assistant/help entries and website widget | Public, parent, student, provider, One Time member, Operations | None locally; live use awaits merge/deploy. |
| Website assistant runtime audit | Current full-system reality audit batch | Yes | No | No | `npm run owner-review:assistant-runtime`; `docs/owner-review/ASSISTANT-RUNTIME-AUDIT.md` | Public anonymous context plus static shared widget/server contracts | Persisted chat/message E2E needs a local/test DB via `BNA_OWNER_REVIEW_ASSISTANT_DATABASE_URL`; live hosted-AI and production runtime proof require approval. |
| Credential-free role-flow browser QA | Current PR #14 owner-review batch | Yes | No | No | `npm run owner-review:role-flows`; `docs/owner-review/ROLE-FLOW-QA.md` | Public, parent one-child, parent multi-child, student, provider admin, provider participant, One Time member, super-admin, wrong-role/logged-out, API failure; includes super-admin `rabbi_sheller_provider` workspace switch | None locally; screenshots are local evidence only. |
| Public homepage visual repair | Current full-system reality audit batch | Yes | No | No | `npm run owner-review:visual`; `docs/owner-review/PUBLIC-VISUAL-AUDIT.md` | Anonymous public visitor at 390x844, 768x1024, 1440x900 | Production still stale until merge/deploy. |
| June 11 click-map backlog full rerun | Historical package `ops/ux-audit-runs/2026-06-11-click-map` | Partially reconciled | No | No | `docs/owner-review/UX-BACKLOG-RECONCILIATION.md` | Priority findings covered by role-flow QA | Full 2,205-route rerun is deferred until the production-oriented audit harness has safe local auth fixtures or approved demo credentials. |
