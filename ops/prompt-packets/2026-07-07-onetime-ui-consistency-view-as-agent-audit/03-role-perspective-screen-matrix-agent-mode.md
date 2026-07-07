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

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `cross-role-wrong-permission`
- context_key: `wrong_role_error_states`
- requirement_id: `REQ-20260626-004`
- idempotency_key: `onetime-ui-audit-20260707-042-role-perspective-matrix`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=cross-role-wrong-permission&context_key=wrong_role_error_states&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dcross-role-wrong-permission&idempotency_key=onetime-ui-audit-20260707-042-role-perspective-matrix&autosave=1`
- API fallback:
  `POST https://bneineviimacademy.org/api/bna/agent-review/results`
  with the same `prompt_key`, `context_key`, `requirement_id`, and
  `idempotency_key`.

Do not edit code. Do not deploy. Do not send messages. Do not charge cards or
grant access. Do not change DNS, credentials, provider accounts, Drive files,
or production data.

Prerequisite:
No prerequisite when running in parallel mode. If a role cannot be reached
safely, record an exact blocker instead of trying to bypass auth.

Navigation-first rule:
You must navigate through the visible app from Super Admin before using direct
route fallbacks. The matrix must say whether each role view was reached by a
clear click path or only by URL fallback.

Exact Super Admin to Rabbi provider path:
1. Open https://bneineviimacademy.org/operations.
2. If login is required, ask for browser takeover. Let Shloimie type the login.
   Do not ask for or store credentials.
3. Confirm you are in BNA Operations / Super Admin.
4. Find the workspace switcher and choose One Time / Rabbi. Expected labels may
   include "One Time", "Rabbi / One Time", "One Time Mishnah Class",
   "rabbi_sheller_provider", or "one_time_mishnah_class".
5. Open Communications, then Email.
6. Click "Rabbi / One Time" or "View Rabbi / One Time Inbox" if visible.
7. Confirm "Now Viewing: Rabbi / One Time Inbox" or info@onetimeonetime.com.
8. Click "Open Rabbi Provider Portal".
9. Confirm you land in /provider.html?admin_provider=one-time&section=mailbox
   or an equivalent One Time provider route.
10. Confirm OneTimeOneTime/Rabbi branding, rabbi_sheller_provider,
    one_time_mishnah_class, and clear provider/Rabbi context.

Exact Rabbi provider to student/classroom/member path:
1. From the provider portal, click "Student View" in the sidebar/topbar.
2. Confirm /student.html?review=one-time or equivalent.
3. Return to the provider portal.
4. Click "Classroom".
5. Confirm /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
   or equivalent.
6. From classroom/member navigation, inspect "Member home" or /rabbi-member if
   reachable without unsafe credentials.
7. If any step fails because a link is missing, broken, loops, opens the wrong route, or is unusable
   on mobile, record the exact failure and still save BLOCKED/FAIL in
   Operations drop-off.

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
Primary handoff is BNA Operations Agent Review drop-off, not GitHub.

Use the Operations task or Agent Review card for this prompt, click
`Open drop-off`, paste the full redacted report into `Report`, choose:
- PASS only if the audit completed and found no actionable P0/P1/P2 defect;
- FAIL if the audit completed and found actionable defects Codex should repair;
- BLOCKED if login, permission, route access, browser, or missing context
  prevented the audit.

Fill `Suggested correction` with the highest-priority Codex repair packet and
click `Save Agent Review Result`. Confirm the saved `AGR-*` readback.

If a role cannot be reached, still save the matrix as BLOCKED or FAIL in
Operations drop-off. The blocked matrix must include the exact click path,
failed step, expected result, actual result, and suggested correction.

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
