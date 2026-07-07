# Agent Mode Prompt 03 - Role Perspective Screen Matrix Audit

```text
You are ChatGPT Agent Mode acting as a role-based UX auditor.

Mission:
Create a role perspective screen matrix for One Time and BNA portal surfaces.
The question is: "If I am looking as Shloimie, Rabbi/provider, member/parent,
or student, what exactly do I see, and is it the correct role-specific app?"

Parallel execution:
This prompt is independent and may be run at the same time as Prompts 01 and
02. Do not wait for the view-as audit. Use only this packet ID:
`onetime-ui-audit-20260707-042-role-perspective-matrix`. If a role cannot be
reached because Prompt 02 has not yet identified a safe path, add an exact
blocker row and continue with the reachable routes.

Do not edit code. Do not deploy. Do not send messages. Do not charge cards or
grant access. Do not change DNS, credentials, provider accounts, Drive files,
or production data.

Prerequisite:
No prerequisite when running in parallel mode. If a role cannot be reached
safely, record an exact blocker instead of trying to bypass auth.

Routes and surfaces to inspect:
- Super Admin Operations One Time workspace:
  https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider
- Super Admin Rabbi email inbox:
  https://bneineviimacademy.org/operations?workspace=platform&view=communications&section=email&inbox=rabbi
- Admin-on-provider portal:
  https://bneineviimacademy.org/provider.html?admin_provider=one-time&section=mailbox
- Normal provider login/portal:
  https://bneineviimacademy.org/provider.html
- One Time member route:
  https://bneineviimacademy.org/rabbi-member
- Student login/portal:
  https://bneineviimacademy.org/student/login
  https://bneineviimacademy.org/student.html
- One Time public host comparison:
  https://join.onetimeonetime.com/
  https://join.onetimeonetime.com/provider.html?review=one-time
  https://join.onetimeonetime.com/student.html?review=one-time

Matrix columns:
- route;
- role/view class;
- auth state;
- workspace/project;
- brand shell;
- header/topbar;
- side nav or public nav;
- top subcategories;
- filters;
- top toolbar/top-section spacing;
- primary action;
- secondary actions;
- first useful content;
- empty/blocked/loading/error state;
- visible support diagnostics;
- privacy/scope risks;
- screenshot/blocker;
- recommended implementation packet.

Audit checklist:
1. Confirm that Super Admin sees Super Admin diagnostics/support data only in
   Super Admin context.
2. Confirm that Rabbi/provider view is scoped to One Time and does not show
   unrelated BNA school operations clutter unless intentionally role-gated.
3. Confirm that student view is student-safe and does not expose adult/private
   notes, provider diagnostics, cross-student data, raw emails, or Super Admin
   tools.
4. Confirm that member/parent view is member/parent-safe and does not expose
   unrelated student or provider-private data.
5. Check every role on 1440, 1024, 768, 430, and 390. Flag mobile nav,
   filter, toolbar, and action inconsistencies.
6. Flag wasted empty space in the top toolbar/top section, especially when it
   pushes useful content down on desktop or mobile.
7. Check Communications routes for repeated loop/state-switching behavior,
   broken displays, and console/network errors.
8. Inventory Rabbi/provider dashboard cards. Mark cards as actionable,
   read-only useful, or non-actionable Super Admin/support/configuration
   clutter.
9. Record exact blockers for unreachable roles. Do not use or ask for shared
   passwords.

Evidence to collect:
- Full role matrix.
- 1440 and 390 screenshots or visual notes for each reachable role.
- 430 and 390 mobile notes for each reachable role.
- Exact blocker rows for unreachable role states.
- Top 10 priority findings.
- Suggested small Codex implementation packets.

Report dropoff:
Preferred repo-file packet:
ops/chatgpt-ramble-dropoff/incoming/onetime-ui-audit-20260707-042-role-perspective-matrix/

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
