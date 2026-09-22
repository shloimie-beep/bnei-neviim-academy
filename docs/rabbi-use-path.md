# Rabbi Use Path

## Decision

Rabbi Elie Scheller does not need a local install package for now.

Shloimie's local setup is developer/operator-only. The Rabbi path should be a
hosted portal/PWA with scoped One Time task access and optional bot/ticket/task
intake.

## Preferred Path

- Hosted Operations portal for scoped One Time work.
- PWA install from the hosted portal.
- Plain-language task or ticket intake.
- Optional Telegram bot intake after the Rabbi chat ID and bot worker are
  configured and smoked.

Portal placeholder:

```text
<PORTAL_URL>
```

Login placeholders:

```text
Username: <ONE_TIME_USERNAME>
Password: <ONE_TIME_PASSWORD>
```

Do not put real credentials in this doc.

## PWA Install

iPhone or iPad:

1. Open Safari.
2. Go to `<PORTAL_URL>/operations`.
3. Log in if asked.
4. Tap Share.
5. Tap Add to Home Screen.
6. Name it `BNA Operations` or `One Time Tasks`.
7. Tap Add.

Android:

1. Open Chrome.
2. Go to `<PORTAL_URL>/operations`.
3. Log in if asked.
4. Tap the browser menu.
5. Tap Install app or Add to Home screen.
6. Confirm the name.

Desktop:

1. Open Chrome or Edge.
2. Go to `<PORTAL_URL>/operations`.
3. Log in if asked.
4. Use the install icon in the address bar or browser app menu.
5. Pin the app if desired.

Operations uses `/operations-manifest.json`, which starts at
`/operations?source=ops-pwa`.

## Bot Or Ticket Intake

Plain-language intake can look like:

```text
Please add a One Time task to prepare the source sheet for next week's shiur.
```

or:

```text
Please mark this as waiting on Shloimie until the payment processor decision is made.
```

Before bot intake is live, Shloimie must provide:

- Rabbi Telegram chat ID if Telegram is used.
- Correct bot token through the keyholder/Railway secret workflow.
- Hosted worker configuration.
- A smoke test showing task intake lands in the One Time scope.

## What Rabbi Can Do Now

- Use a hosted portal/PWA once Shloimie provides the URL and credentials.
- View scoped One Time task workspace surfaces that are already exposed through
  Operations.
- Use task/ticket language after the intake path is configured.
- Review demo-safe student/signup/public pages.

## What Rabbi Cannot Do Yet

- Use a native desktop app from this pass.
- Rely on unverified Zoom, Google Classroom, Calendar write, Drive write, or
  Vimeo upload automation.
- Receive live bot intake until Telegram chat ID, bot credentials, hosted
  worker, and smoke verification are complete.
- Access private BNA Academy parent/student records unless explicitly enrolled
  and approved.
- Use a duplicated One Time database or duplicated Mishnah project.

## Shloimie Must Provide Before Live Rabbi Access

- Portal URL: `<PORTAL_URL>`.
- One Time username: `<ONE_TIME_USERNAME>`.
- One Time password: stored through keyholder/Railway secret workflow, not in
  chat or tracked docs.
- Rabbi Telegram chat ID if bot intake is used.
- Confirmation of what the Rabbi should be able to see and do in the first
  meeting.
