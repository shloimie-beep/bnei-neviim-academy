# Rabbi Meeting Demo

This demo uses the existing BNA hosted/local Operations system. It does not
launch a native app, Zoom build, Google Classroom write flow, Calendar write
flow, Drive-write workflow, Vimeo upload, or a new Rabbi bot framework.

## Pre-Meeting Checklist

- Confirm the app URL is available:
  - local: `http://localhost:8080`
  - hosted: `<PORTAL_URL>`
- Run:

```powershell
npm run doctor
npm run smoke:local -- --skip-tests
```

- Confirm Operations credentials work.
- Confirm the Rabbi/One Time scoped username/password if the Rabbi will see a
  scoped demo.
- Confirm no secret files, `.env.local`, Railway variables, or raw tokens are
  visible on screen.
- Prepare fallback screenshots or a local static walkthrough if the live DB,
  login, or Telegram is down.

## Demo-Safe URLs

Use these paths only after choosing the local or hosted base URL:

- `/operations`
- `/operations?view=tasks`
- `/student.html`
- `/signup.html`
- `/signup-he.html`

Example:

```text
https://<PORTAL_URL>/operations?view=tasks
```

## Exact Demo Flow

1. Open `/operations`.
2. Log in with the approved Operations or scoped One Time credentials.
3. Open `/operations?view=tasks`.
4. Show the workspace context and explain that One Time/Rabbi work is scoped
   instead of mixed into BNA Academy private records.
5. Show Tasks, Decisions, and Pending as separate working states.
6. Show comments or task intake only if they contain demo-safe wording.
7. Open `/student.html` to show the lightweight student access-code surface.
8. Open `/signup.html` and `/signup-he.html` to show the public registration
   entry points.
9. Explain the Rabbi use path: hosted portal/PWA plus task/bot/ticket intake,
   not a local install.
10. Close with the remaining inputs Shloimie must provide before live Rabbi
    access: portal URL, One Time username/password, and Rabbi Telegram chat ID
    if bot intake is used.

## Avoid Showing

- `.env.local`, `.env`, `.secrets`, Railway tokens, API keys, DB URLs, cookies,
  or screenshots/logs containing secrets.
- Raw Telegram bot tokens or chat IDs unless Shloimie explicitly approves.
- Unverified Google writes, Drive writes, Calendar writes, Classroom writes, or
  OAuth admin screens.
- Unfinished Zoom/Classroom/device automation.
- Vimeo API upload claims.
- A new Rabbi bot framework claim.
- Private BNA Academy parent/student records unless they are explicitly cleared
  for the meeting.

## Fallback Plan

If live DB is down:

- Show the static pages: `/student.html`, `/signup.html`, `/signup-he.html`.
- Use prepared screenshots or prior smoke reports for Operations.
- Say that Operations depends on the Railway/Postgres database and will be
  rechecked after DB access is restored.

If login is down:

- Do not reset credentials in the meeting.
- Show the public pages and the Rabbi use-path doc.
- Capture a follow-up to verify `OPS_USERNAME`, `OPS_PASSWORD`, and scoped One
  Time credentials through the keyholder workflow.

If Telegram is down:

- Do not promise live bot intake.
- Say that bot/task intake is optional and gated by the Rabbi Telegram chat ID,
  bot token, hosted worker configuration, and smoke verification.

## Final Confidence Checklist

- Operations opens and logs in.
- `/operations?view=tasks` loads without console-visible secrets.
- Student and signup pages load.
- Rabbi local-install decision is clear: no local package now.
- PWA path is clear.
- Scoped One Time access is explained without exposing raw credentials.
- Any missing credentials or external approvals are listed as blockers, not
  treated as completed work.
