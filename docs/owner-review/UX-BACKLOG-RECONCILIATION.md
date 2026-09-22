# UX Backlog Reconciliation

Source backlog:

- `ops/ux-audit-runs/2026-06-11-click-map/README.md`
- Routes: 2,205
- Issues: 3,429 total, P0 0, P1 3,234, P2 195, P3 0
- Priority reports: `top-findings.md`, `implementation-backlog.md`,
  `mobile-audit.md`, `navigation-map.md`, `role-workspace-matrix.md`

Current reconciliation evidence:

- `docs/owner-review/ROLE-FLOW-QA.md`
- `ops/playwright-smokes/2026-06-24-owner-review-role-flows-local/report.json`
- `npm run owner-review:role-flows`: PASS
- `npm run owner-review:routes`: PASS
- `npm run watchdog:links`: PASS, findings 0
- `npm run watchdog:actions`: PASS, findings 0
- `npm run watchdog:security`: PASS, findings 0

| Prior issue area | Current classification | Evidence | Notes / next action |
| --- | --- | --- | --- |
| Parent assistant missing or not obvious (`BOT-PANEL-003`, `005`, `006`, `080`, `083`, `084`) | Resolved for primary owner-review journeys | Parent one-child and parent multi-child desktop/mobile rows in `ROLE-FLOW-QA.md`; `parent_portal` assistant surface opens. | Full historical route-state rerun still deferred. |
| Student assistant missing or not obvious (`BOT-PANEL-004`, `007`, `082`, `086`) | Resolved for primary owner-review journeys | Student desktop/mobile rows in `ROLE-FLOW-QA.md`; `student_portal` assistant surface opens. | Full historical route-state rerun still deferred. |
| Provider/admin surface confused with BNA school student concepts (`PROVIDER-SCHOOL-CONFUSION-*`) | Partially resolved / still needs owner review in Operations provider workspace | Provider participant/member and One Time member rows show `one_time_member` surface and no BNA accountability copy; provider admin row shows `provider_workspace`. | The June 11 findings target many Operations provider-workspace student sections. Those require a broader Operations IA pass or full audit rerun. |
| Small mobile tap targets (`MOBILE-USABILITY-*`) | Resolved for detected primary journeys | `ROLE-FLOW-QA.md` reports no small mobile tap targets after increasing homepage learning-moment dot hit areas. | Full historical bulk route states not rerun. |
| Placeholder-heavy settings and integration pages (`SETTINGS-PLACEHOLDER-*`) | Still reproducible / intentionally deferred | June 11 backlog still lists many settings/integration placeholder states. This pass did not redesign Operations settings. | Requires a product/content pass to decide which missing integrations are disabled blockers vs real settings rows. |
| Parent private dashboard walkthrough blocked by missing safe credentials (`FLOW-005`) | Superseded for QA by synthetic local fixtures | Parent one-child and multi-child journeys run with Playwright route mocks and screenshots. | Production/demo parent credentials remain external setup if live walkthrough is desired. |
| Student private dashboard walkthrough blocked by missing safe credentials (`FLOW-006`) | Superseded for QA by synthetic local fixtures | Student journey runs with synthetic `QA-STUDENT` route mock. | Production/demo student access remains external setup if live walkthrough is desired. |
| Provider join public listing flow not executed to avoid production writes (`FLOW-007`) | Partially resolved | Provider admin and public/provider routes are navigable locally; no external write performed. | A test-only provider onboarding submit flow can be added in a future batch if owner wants form-submission screenshots. |

Bulk rerun status:

The original full-ui audit harness in `scripts/full-ui-audit.mjs` defaults to
`https://bneineviimacademy.org` and Operations credentials. This owner-review
pass intentionally did not use live credentials or production state. The
priority private walkthrough gaps were replaced by the credential-free
`owner-review:role-flows` smoke, while a full 2,205-route regeneration remains
deferred until the harness has safe local auth fixtures or approved demo
credentials/access links.
