# One Time Brand Helper Toolbar Isolation - 2026-07-07

## Source

- Raw input: `raw-input/RAW-20260707-013-onetime-brand-helper-toolbar-isolation.md`
- Product Quality packet: `ops/prompt-packets/2026-07-07-onetime-brand-helper-toolbar-isolation/00-onetime-brand-helper-toolbar-isolation.product-quality.json`

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260707-130 | Preserve the new One Time brand/helper/top-toolbar ramble as raw intake and a requirement register. | RAW-20260707-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | protocol | P0 | 0 | none | Raw file, register, and PQC packet exist with stable IDs. | raw-input, tasks-pending, ops/prompt-packets | no | Local verified |
| REQ-20260707-131 | Remove BNA brand/control leakage from the public One Time landing page. | RAW-20260707-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | public UI | P0 | 1 | REQ-20260707-130 | `/one-time` stays black/yellow, English-only, and does not mount BNA nav/language controls or BNA-blue dropdown styling. | public/one-time/index.html; public/js/app-select.js; tests | yes | Local verified; deploy/live pending |
| REQ-20260707-132 | Mount a One Time-scoped helper on the actual One Time landing page. | RAW-20260707-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | helper | P0 | 1 | REQ-20260707-130 | Landing helper title/copy says One Time Helper and does not present BNA school goals, Hebrew UI, or admin/private data. | public/one-time/index.html; public/js/bna-bot-widget.js; tests | yes | Local verified; deploy/live pending |
| REQ-20260707-133 | Keep One Time public helper threads scoped to One Time, not the default BNA project bucket. | RAW-20260707-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | backend scope | P0 | 1 | REQ-20260707-132 | Assistant surface normalization accepts One Time public/parent/student labels and One Time public helper threads use `one_time_mishnah_class`. | server.js; tests | yes | Local verified; deploy/live pending |
| REQ-20260707-134 | Compile parent/student One Time helper scope into a separate implementation packet. | RAW-20260707-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | parent/student helper | P1 | 2 | REQ-20260707-132 | Parent helper scope covers billing/attendance/child access; student helper scope covers classes/library/transcripts/Rabbi references; no private or cross-role data leaks. | future packet | yes | Open - next packet |
| REQ-20260707-135 | Compile the top toolbar/subcategory/filter pill layout pass into an audit/implementation packet. | RAW-20260707-013 | platform + one_time_mishnah_class | Codex / Agent Mode | navigation UI | P1 | 2 | REQ-20260707-130 | Desktop top filters are arranged without uncontrolled horizontal scrolling; mobile uses controlled overflow with visible affordance and stable touch targets. | future packet | yes | Open - next packet |
| REQ-20260707-136 | Keep Agent Mode drop-off autonomous for the new One Time brand/helper/toolbar audits. | RAW-20260707-013 | agent_ops | Codex / Agent Mode | agent workflow | P1 | 2 | REQ-20260707-130 | Future prompts include exact navigation, viewport checks, and required Operations drop-off/failure reporting. | future prompt packet | no | Open - next prompt packet |

## Product Quality Compiler Expansion

| Operator phrase | Compiled requirement |
|---|---|
| "no overlap between the Branding of DNA and one time mishna" | One Time must use the One Time black/yellow visual system, route scope, helper copy, and project key without BNA nav/language/dropdown bleed. |
| "flashes that Hebrew English toggle in the BNA colors" | The public One Time page must not render the BNA site nav language toggle, and any shared component styling must be One Time-themed before enhancement appears. |
| "there is no Hebrew English it's just in English" | One Time public landing/helper defaults to English-only for this surface. |
| "helper ... should exist on the actual landing page" | The universal assistant must mount on `/one-time` with One Time title/copy and no BNA school/admin scope. |
| "scoped for the student ... scoped for the parents" | Parent and student helper scopes need separate packeted work because their private data boundaries differ. |
| "top toolbar with like these pills ... takes up too much space" | Top categories/subcategories/filter rows need a layout audit and pattern correction across desktop and mobile. |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260707-130 | Parent/student One Time helper should be split from the public landing helper patch. | Exact authenticated production parent/student data model and transcript availability. | Codex/Shloimie | Implement public landing helper scope now; packet authenticated parent/student scope next. | Try to wire transcript/billing helper in same patch. | Same-patch approach risks private-data leakage and broad unverified behavior. | Create a child packet after this public-scope batch. | REQ-20260707-134 | Open |
| DEC-20260707-131 | Top toolbar layout needs its own visual audit before broad changes. | Exact routes/screens and before screenshots across Operations, provider, parent, student. | Codex/Agent Mode | Generate audit prompt/packet and use current-state screenshots before implementation. | Change CSS globally now. | Global CSS could break already-fixed parent/student/provider surfaces. | Run toolbar/subcategory/filter audit as next UI packet. | REQ-20260707-135 | Open |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260707-131 | `/one-time`, `public/js/app-select.js` | Add explicit One Time app-select surface and verify no BNA nav/language script on landing. | Focused tests passed; local Playwright desktop/mobile smoke passed; PQC and watchdog reruns passed. | Pending | Pending | Required |
| REQ-20260707-132 | `/one-time`, `public/js/bna-bot-widget.js` | Add helper scripts to landing and One Time public helper copy/theme. | Focused tests passed; local Playwright desktop/mobile smoke passed. | Pending | Pending | Required |
| REQ-20260707-133 | `/api/bna/assistant/chat`, thread creation | Normalize One Time public surface and route assistant thread project to One Time. | Focused assistant contract tests passed. | Pending | Pending | Required |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260707-130 | Local verified | Raw input, register, and PQC packet created. | raw-input/RAW-20260707-013-onetime-brand-helper-toolbar-isolation.md; tasks-pending/2026-07-07-onetime-brand-helper-toolbar-isolation.md; ops/prompt-packets/2026-07-07-onetime-brand-helper-toolbar-isolation/00-onetime-brand-helper-toolbar-isolation.product-quality.json | `npm run pqc:validate -- ops\prompt-packets\2026-07-07-onetime-brand-helper-toolbar-isolation\00-onetime-brand-helper-toolbar-isolation.product-quality.json` passed before and after implementation. | Needs commit/push closeout. |
| REQ-20260707-131 | Local verified; deploy/live pending | Local Playwright smoke report: `ops/ui-audits/2026-07-07-onetime-brand-helper-toolbar-isolation-local/report.md`; screenshots in same folder. | public/one-time/index.html; public/js/app-select.js; tests/one-time-brand-helper-isolation.test.js; ops/action-registry.json | Focused Node tests passed; local smoke confirmed no BNA brand text, no language/nav chrome, no mobile overflow, and One Time dropdown theme; `npm run watchdog:actions` and `npm run watchdog:protocol-drift` passed. | Deploy/live smoke required. |
| REQ-20260707-132 | Local verified; deploy/live pending | Local Playwright smoke report: `ops/ui-audits/2026-07-07-onetime-brand-helper-toolbar-isolation-local/report.md`; screenshots in same folder. | public/one-time/index.html; public/js/bna-bot-widget.js; tests/one-time-brand-helper-isolation.test.js; ops/action-registry.json | Focused Node tests passed; local smoke confirmed `One Time Helper` launcher/panel on desktop and mobile. | Deploy/live smoke required. |
| REQ-20260707-133 | Local verified; deploy/live pending | Focused assistant contract coverage in `tests/one-time-brand-helper-isolation.test.js`. | server.js; tests/one-time-brand-helper-isolation.test.js | Focused Node tests passed and `node --check server.js` passed. | Deploy/live smoke required. |
| REQ-20260707-134 | Open - next packet | Public helper scope split is documented in DEC-20260707-130. | Future packet. | Not implemented in this batch. | Needs scoped parent/student helper packet. |
| REQ-20260707-135 | Open - next packet | Toolbar density requirement captured and split in DEC-20260707-131. | Future packet. | Not implemented in this batch. | Needs toolbar/filter visual audit packet. |
| REQ-20260707-136 | Open - next prompt packet | Autonomous Agent Mode drop-off requirement captured. | Future prompt packet. | Not implemented in this batch. | Needs Agent Mode prompt update. |
