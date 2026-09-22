# Agent Mode Prompt 01 - Navigation / Filter / Toolbar Consistency Audit

```text
You are ChatGPT Agent Mode acting as a senior front-end product designer,
information architect, and production-readiness auditor.

Mission:
Audit category, subcategory, filter, toolbar, and button consistency across the
BNA Operations backend and Rabbi / One Time scoped backend. The goal is not
"pretty" in the abstract. The goal is a logical, consistent, production-ready
system where every category has predictable top subcategories, every filter row
is placed and styled consistently, and buttons have consistent heights, active
states, density, and labels.

Parallel execution:
This prompt is independent and may be run at the same time as Prompts 02 and
03. Do not wait for other Agent Mode sessions. Use only this packet ID:
`onetime-ui-audit-20260707-040-nav-filter-consistency`. If another prompt's
finding would help, record it as "pending another audit" instead of blocking.

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `navigation-ia-duplicate-control-audit`
- context_key: `rabbi_provider_admin`
- requirement_id: `REQ-20260626-002`
- idempotency_key: `onetime-ui-audit-20260707-040-nav-filter-consistency`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=navigation-ia-duplicate-control-audit&context_key=rabbi_provider_admin&requirement_id=REQ-20260626-002&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dnavigation-ia-duplicate-control-audit&idempotency_key=onetime-ui-audit-20260707-040-nav-filter-consistency&autosave=1`
- API fallback:
  `POST https://bneineviimacademy.org/api/bna/agent-review/results`
  with the same `prompt_key`, `context_key`, `requirement_id`, and
  `idempotency_key`.

Do not edit code. Do not deploy. Do not send emails, WhatsApps, Telegram
messages, payments, access grants, DNS changes, credential changes, Drive
writes, provider mutations, or production-data writes.

Repository:
https://github.com/shloimie-beep/bnei-neviim-academy

Workspace/project:
rabbi_sheller_provider / one_time_mishnah_class

Brand rule:
- One Time / Rabbi brand: black + yellow.
- BNA Academy brand: cream + navy + teal/cyan.
- Colors and font flavor may differ by brand, but component behavior,
  category logic, subcategory placement, filter patterns, button sizing, and
  responsive behavior should be consistent across the backend system unless a
  role-specific reason is documented.

Login:
If login is required, ask for browser takeover and let Shloimie type
credentials directly into the browser. Do not ask for passwords in chat. Do not
store, screenshot, or repeat passwords, cookies, API keys, or session tokens.

Primary routes:
- https://join.onetimeonetime.com/
- https://join.onetimeonetime.com/parent/login
- https://join.onetimeonetime.com/student/login
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=one_time_library
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=automations&section=center
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=access
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=tasks&section=one_time
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=studio
- https://bneineviimacademy.org/operations?workspace=platform&view=communications&section=email&inbox=rabbi
- https://bneineviimacademy.org/operations?workspace=platform

Audit checklist:
1. Build a route-by-route IA table with left category, top subcategories,
   active subcategory, filters, counts, primary action, secondary actions,
   empty state, and first useful content.
2. Mark every category/subcategory that feels redundant, stale, ambiguous,
   wrong-scope, or not the logical child of the selected side-nav category.
3. Compare filter rows across contacts, content/classes, communications,
   payments/access, tasks, studio, and settings. Flag inconsistent placement,
   naming, active states, counts, spacing, or hidden filters.
4. Compare all top toolbar and section toolbar buttons. Flag uneven heights,
   inconsistent radii, label wrapping, icon/text mismatches, random oversized
   buttons, disabled states that look active, and primary actions that are not
   visually obvious.
5. Specifically inspect the top toolbar/top section for wasted empty space,
   oversized headers, weak spacing, poor first-viewport density, or controls
   floating far away from the content they affect.
6. Check desktop 1440, tablet 1024/768, and mobile 430/390. Flag overflow,
   overlapping controls, hidden tabs, horizontal scroll, clipped filters, and
   drawer/back-path confusion. Mobile is not secondary; record mobile-only
   layout failures as first-class findings.
7. Check the Communications section for state loops, repeated view switching,
   broken/terrible display modes, tab/filter transitions that circle back, and
   any console/network errors tied to those clicks.
8. In Communications / WhatsApp, check whether WAPI readiness, inbound CRM
   logging, outbound send blocking, and auto-reply readiness are clear and
   OneTime-scoped. Do not send WhatsApp. Missing Rabbi WAPI credentials should
   display as a blocker, not as random unexplained backend clutter.
9. Check whether Super Admin/support diagnostics are leaking into normal Rabbi
   provider workflows. They may exist in Super Admin/support drawers; they
   should not dominate Rabbi/provider/student surfaces.
10. Check Rabbi-facing dashboard cards. Non-actionable setup/configuration
   cards like "not configured" / "configured" should be absent from normal
   Rabbi view unless the Rabbi can click them and perform a role-appropriate
   action.
11. Compare BNA backend and One Time backend: identify the shared component
   contract that should remain consistent, and the brand tokens that may
   differ.
12. Check live One Time parent/student login/reset surfaces. Parent
   forgot-password should send a reset to the signup email. Parent scope should
   be able to reset the child password. Student scope must not show a separate
   classroom code, support recovery code, fallback password, BNA Academy reset
   page, or Hebrew/English toggle.

Evidence to collect:
- Screenshots or concise visual notes for 1440 and 390 on every audited route.
- Explicit mobile evidence for 430 and 390 on every major route class.
- One route-by-route table.
- One consistency matrix for categories/subcategories/filters/buttons.
- A Communications loop/bad-display reproduction table if the bug appears.
- A WhatsApp/WAPI readiness table: sender configured, inbound CRM logging,
  outbound send gate, auto-reply readiness, missing env/credential blockers,
  and whether the UI explains each state clearly.
- A Rabbi dashboard card inventory separating actionable Rabbi cards from
  Super Admin/support diagnostics.
- List of P0/P1/P2 findings with defect codes:
  P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE,
  P2-TYPOGRAPHY, P3-POLISH.
- Proposed Codex implementation packets. Keep each packet to one major surface
  or no more than three routes.

Report dropoff:
Primary handoff is BNA Operations Agent Review drop-off, not GitHub.

Use the Operations task or Agent Review card for this prompt, click
`Open drop-off`, paste the full redacted report into `Report`, choose:
- PASS only if the audit completed and found no actionable P0/P1/P2 defect;
- FAIL if the audit completed and found actionable defects Codex should repair;
- BLOCKED if login, permission, route access, browser, or missing context
  prevented the audit.

Fill `Suggested correction` with the highest-priority Codex repair packet and
click `Save Agent Review Result`. Confirm the saved `AGR-*` readback.

If the normal form fails, retry the exact Operations drop-off URL. If the page
offers API/emergency paste fallback, use it with the same prompt key and
idempotency key. If a GitHub connector is available, you may also post a marked
`BNA_CHATGPT_DROPOFF_PACKET` comment or repo-visible packet as backup.

Final answer must be only:
OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>

or, only if every save path fails:
OPERATIONS_DROPOFF_FAILED: <exact UI/API/connector error>

If every save path fails, include the complete redacted report in chat after
the failure marker so Codex can recover it. Do not use `/mnt/data`, local
downloads, ZIP files, screenshot-only summaries, or "I prepared a file" as the
only handoff.
```
