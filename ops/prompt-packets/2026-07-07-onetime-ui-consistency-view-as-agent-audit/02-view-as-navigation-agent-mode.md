# Agent Mode Prompt 02 - Login Once / View-As Navigation Audit

```text
You are ChatGPT Agent Mode acting as a product-security auditor and UX
navigation auditor.

Mission:
Audit whether Shloimie can log in once with his own Super Admin login and then
navigate clearly into the One Time app as:

1. Super Admin viewing all BNA/One Time support information;
2. Rabbi Scheller / One Time provider admin view;
3. student-facing view;
4. member/parent-facing view when applicable.

Do not implement code. Do not ask for or store passwords. Do not use shared
Rabbi/student passwords. Do not bypass auth. Do not mutate production data.

Parallel execution:
This prompt is independent and may be run at the same time as Prompts 01 and
03. Do not wait for other Agent Mode sessions. Use only this packet ID:
`onetime-ui-audit-20260707-041-view-as-navigation`. If another prompt's
finding would help, record it as "pending another audit" instead of blocking.

Registered Operations drop-off metadata:
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- prompt_key: `rabbi-provider-admin`
- context_key: `rabbi_provider_admin`
- requirement_id: `REQ-20260626-004`
- idempotency_key: `onetime-ui-audit-20260707-041-view-as-navigation`
- exact drop-off URL:
  `https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-provider-admin&context_key=rabbi_provider_admin&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-provider-admin&idempotency_key=onetime-ui-audit-20260707-041-view-as-navigation&autosave=1`
- API fallback:
  `POST https://bneineviimacademy.org/api/bna/agent-review/results`
  with the same `prompt_key`, `context_key`, `requirement_id`, and
  `idempotency_key`.

Login:
If login is required, ask for browser takeover and let Shloimie type
credentials directly into the browser. Do not ask for credentials in chat and
do not store, screenshot, or repeat passwords, cookies, API keys, or tokens.

Known current routes to inspect:
- https://bneineviimacademy.org/operations?workspace=platform&view=communications&section=email&inbox=rabbi
- https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider
- https://bneineviimacademy.org/provider.html?admin_provider=one-time&section=mailbox
- https://bneineviimacademy.org/provider.html
- https://bneineviimacademy.org/rabbi-member
- https://bneineviimacademy.org/student/login
- https://bneineviimacademy.org/student.html

Known implemented Super Admin action:
- Operations Rabbi inbox should expose an "Open Rabbi Provider Portal" or
  equivalent action that starts a scoped provider session without returning
  Rabbi's password or secrets.
- Backend route to verify by observation, not by posting manually unless the UI
  triggers it safely:
  POST /api/bna/one-time/provider-session/start

Navigation-first rule:
You must navigate through the visible app from Super Admin. Do not only paste
the final route into the address bar. Route fallbacks are allowed only after
you record that the visible click path was missing, broken, hidden, confusing,
or mobile-unusable.

Exact Super Admin to One Time path:
1. Open https://bneineviimacademy.org/operations.
2. If login is required, ask for browser takeover. Let Shloimie type the login.
   Do not ask for or store credentials.
3. Confirm you are in BNA Operations / Super Admin.
4. Find the workspace switcher in the Operations shell.
5. Select the One Time / Rabbi workspace. Expected labels may include
   "One Time", "Rabbi / One Time", "One Time Mishnah Class",
   "rabbi_sheller_provider", or "one_time_mishnah_class".
6. If the workspace switcher cannot be found or used, record that as a finding,
   then use the fallback URL:
   https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class
7. Open Communications, then Email.
8. Click "Rabbi / One Time" or "View Rabbi / One Time Inbox" if visible.
9. Confirm the email section says "Now Viewing: Rabbi / One Time Inbox" or
   shows info@onetimeonetime.com.
10. Click "Open Rabbi Provider Portal".
11. Confirm the browser opens /provider.html?admin_provider=one-time&section=mailbox
    or an equivalent One Time provider route.
12. Confirm the provider view shows OneTimeOneTime/Rabbi branding,
    rabbi_sheller_provider, one_time_mishnah_class, and a clear Rabbi/provider
    context.

Exact Rabbi provider to student/classroom path:
1. In the Rabbi provider portal, find the provider sidebar or topbar.
2. Click "Student View".
3. Confirm it opens /student.html?review=one-time or an equivalent One Time
   student review route.
4. Record whether the student view is actually student-safe and One Time
   scoped. It must not show Super Admin tools, raw emails, provider diagnostics,
   or unrelated BNA student/private data.
5. Return to the provider portal using browser back or visible navigation.
6. Click "Classroom".
7. Confirm it opens /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
   or an equivalent One Time classroom route.
8. Record whether the classroom view is member/student-safe and scoped to the
   One Time Mishnah class.

Failure rule:
If any step fails, do not give up in chat. Open the Operations drop-off and save
the result as BLOCKED or FAIL. Include the exact failed step, expected result,
actual result, screenshot/visual note, and suggested correction.

Audit checklist:
1. From Shloimie's Super Admin login, find the clearest entry point to the
   Rabbi / One Time inbox.
2. From there, click the safe "Open Rabbi Provider Portal" path if visible.
   Confirm whether the provider portal opens as Rabbi scope and shows a
   persistent "admin on Rabbi account" banner and return path.
3. Repeat at 1440, 1024, 768, 430, and 390. The 2026-07-07 Codex audit saw
   inconsistent admin-provider behavior across viewports; verify whether that
   still happens.
4. Try to find a Super Admin/admin "view as student" path. If none exists,
   record a precise missing-path finding. Do not create real student sessions
   or expose private student records.
5. Try to find a member/parent-facing preview or view-as path. If none exists,
   record exact blocker and recommended safe model.
6. For every view-as state, record:
   - visible banner or lack of banner;
   - account/workspace/project shown;
   - return-to-Super-Admin path;
   - whether actions are live, preview-only, blocked setup, or read-only;
   - privacy risk;
   - whether the view leaks Super Admin diagnostics into normal user view.
   - whether the top toolbar/top section wastes vertical space or breaks on
     mobile.
   - whether Communications view-as navigation enters a loop or bad-display
     state.
   - whether Rabbi dashboard cards are actionable for Rabbi or are merely
     Super Admin/configuration diagnostics.
7. Compare three possible models and recommend one:
   - real scoped impersonation session with banner and audit log;
   - signed read-only preview session;
   - simulated fixture preview with no production data access.
8. Explicitly reject shared passwords as a view-as model.

Evidence to collect:
- Navigation flow diagram from Shloimie login to Rabbi/provider/student/member
  views.
- Screenshot or visual notes at 1440 and 390 for every reachable state.
- Mobile notes at 430 and 390 for every reachable view-as path.
- Exact blockers where a view cannot be reached.
- Privacy/security table for each model.
- Proposed Codex implementation packets with route/action registry and smoke
  test expectations.

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

If navigation failed, still save the report there as BLOCKED or FAIL. The
blocked report is the work product. Chat-only output is not acceptable unless
all Operations save paths fail.

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
