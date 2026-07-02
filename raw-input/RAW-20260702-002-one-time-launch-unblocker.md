# RAW-20260702-002 - One Time Launch Unblocker

Source: Codex chat goal-mode packet
Captured at: 2026-07-02T09:47:00+03:00
Workspace: `rabbi_sheller_provider`
Project: `one_time_mishnah_class`

## Raw Operator Decisions Preserved

- Move One Time / Rabbi Sheller from setup/planning into a working launch system.
- Do not stop at `no unblocked executable batch` if safe local work, setup panels, exact operator tasks, dry-runs, smoke tests, or scaffolded implementation can still be done.
- Run generated/unblocked runnable packets automatically unless they require real campaign send, live payment, apex/root DNS mutation, provider account purchase, real WhatsApp send to contacts, production hard delete, privacy-sensitive export, or missing credential/target/alias.
- Same GitHub repo/codebase.
- Separate One Time Railway project/service preferred.
- Separate One Time database preferred.
- Shloimie can log directly into the One Time admin workspace to see signups/tasks/data.
- BNA super-admin cross-instance summary/federation is deferred and must not block launch.
- `join.onetimeonetime.com` is the temporary campaign/launch domain.
- Do not touch apex/root `onetimeonetime.com` yet.
- Later, after migration, root domain can be cut over.
- New users sign up during launch window and get 30 days free from signup.
- 30-day free access includes live class, video library/replays, private questions to Rabbi, basic parent/student/member view, and attendance/progress basics.
- Attendance v1 is automatic class-link click. No manual attendance.
- Parent/student portal v1 is simple: schedule, class link, clicked/attendance/progress, questions. No chatbot and no public student-to-student posting.
- Zoom link is not public. It is member-gated, link-click tracked, and can be rotated per class/session later.
- Existing paying users from Replit/old Stripe are audited/migrated, not mass-canceled.
- One product after free period: `$67/month`.
- Rabbi uses his own Stripe account.
- Free signup grants access automatically.
- Stripe payment success grants/extends access automatically.
- WhatsApp provider follows repo direction: Whapi/WAPI. If Shloimie says Wappy, map that to existing Whapi/WAPI unless repo evidence proves a different provider.
- Rabbi needs his own WhatsApp provider account/number/API token.
- Vimeo belongs to Rabbi/One Time. Credentials are in the BNA keyholder.
- Drive is intake/drop folder. Vimeo is hosting/player.
- OBS may save to a Google Drive synced folder; pipeline should be designed for automatic ingestion.
- Failed media upload should create an internal task and email/alert Shloimie at `sdratler@gmail.com`.
- Send test/seed email to `sdratler@gmail.com` only when the final live link is ready.
- No GHL.

## Safety Guardrails

- Do not print, commit, screenshot, or expose secrets.
- Do not bulk-send real campaign.
- Do not send WhatsApp to real contacts unless a later packet has exact safe-test recipient and approval.
- Do not run live Stripe payments.
- Do not cancel paid users.
- Do not hard-delete production records.
- Do not mutate apex/root DNS.
- Do not merge BNA contacts/content/classroom data into One Time.
- Do not expose raw private contact/student/parent data in repo evidence.
