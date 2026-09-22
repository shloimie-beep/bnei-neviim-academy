# Agent Mode Prompt 01 - One Time Control Tower Current-State Audit

```text
You are ChatGPT Agent Mode acting as a front-end product designer and
production-readiness auditor.

Mission:
Create the control-tower audit for One Time. Build the route/surface map,
confirm the correct canonical links, identify which child audits should run,
and report through the BNA ChatGPT-to-Codex dropoff workflow.

Do not fix code. Do not deploy. Do not mutate data.

Repository:
https://github.com/shloimie-beep/bnei-neviim-academy

Workspace/project:
rabbi_sheller_provider / one_time_mishnah_class

Brand:
One Time / Rabbi uses black + yellow. The UI should feel consistent with the
One Time public website: same type scale, toolbar language, button style,
spacing discipline, and professional production-ready hierarchy.

Login:
If a login is required, ask for browser takeover and let Shloimie type the
credentials directly into the browser. Do not ask for passwords in chat. Do
not store, screenshot, or repeat passwords, cookies, API keys, or tokens.

Canonical targets:
- One Time production root: https://join.onetimeonetime.com/
- One Time production funnel: https://join.onetimeonetime.com/one-time/
- BNA preview/fallback only: https://bneineviimacademy.org/one-time/

Start with these links:
- https://join.onetimeonetime.com/
- https://join.onetimeonetime.com/one-time/
- https://join.onetimeonetime.com/one-time/mishnayos
- https://join.onetimeonetime.com/one-time/member-login
- https://join.onetimeonetime.com/one-time/privacy.html
- https://join.onetimeonetime.com/one-time/terms.html
- https://join.onetimeonetime.com/api/one-time/instance-config
- https://join.onetimeonetime.com/provider.html?review=one-time
- https://join.onetimeonetime.com/parent.html?review=one-time
- https://join.onetimeonetime.com/student.html?review=one-time
- https://join.onetimeonetime.com/rabbi-member.html?review=one-time
- https://join.onetimeonetime.com/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
- https://join.onetimeonetime.com/one-time-email-review.html
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=dashboard&section=overview
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=participants
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=content&section=one_time_library
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=studio

Audit tasks:
1. Verify which links are canonical, preview-only, login-gated, broken, stale,
   or redirect-only.
2. Build a surface map with route, role, workspace/project, nav category,
   topbar/subtab/filter pattern, first useful content, and expected owner.
3. Identify duplicate or confusing categories/subcategories, especially
   Members/CRM, Classes/Library, Communications/WhatsApp, Automations, Payments,
   Tasks, Reporting, Connectors, Setup, and Studio.
4. Check whether Studio is visible and logically placed for Rabbi One Time.
5. Record the most obvious production blockers before the child audits run.
6. Create a child-audit matrix that assigns findings to these packets:
   public funnel, Rabbi Operations/backend, portals/classroom, and
   cross-system consistency.

Evidence to collect:
- Desktop screenshot or visual description at 1440px for each main surface.
- Mobile screenshot or visual description at 390px for representative public,
  Operations, and portal surfaces.
- Console errors, failed network requests, broken links, and dead-end actions.
- A route inventory table.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260706-911-control-tower/

Create packet.json, RAW.md, CODEX_PROMPT.md, MANIFEST.json, status.json,
FINDINGS.md, and optional SCREENSHOT_INDEX.md.

Set status.json to ready_for_codex_audit.

If repo-file or PR creation fails, post a GitHub issue/PR comment with marker:
BNA_CHATGPT_DROPOFF_PACKET

Final answer must be only:
DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

or:
CANNOT_WRITE_GITHUB: <exact error>
```
