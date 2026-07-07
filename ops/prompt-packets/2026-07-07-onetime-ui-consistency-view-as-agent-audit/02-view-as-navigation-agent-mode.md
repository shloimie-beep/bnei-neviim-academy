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
