# Rabbi Scheller Drive/Social Ingestion And Login Guard

Task: 506
Captured: 2026-06-12

## Implemented Locally

- One Time Drive setup now creates/maps nested lanes under the existing One Time
  Mishnah Class Drive root:
  `https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`.
- The generated backend map is written to
  `ops/one-time-mishnah-class/drive-social-ingestion-map.json` and Markdown.
- Backend workspace defaults load that map into the `rabbi_sheller_provider`
  workspace settings and connector settings.
- The Rabbi social connector now carries platform setup rows for Facebook,
  LinkedIn, YouTube, Instagram, and WhatsApp Status.
- Operations has a `Drive / Social Intake` settings tab with the Drive lanes,
  backend content-job mapping, login release guard, WhatsApp email-request copy,
  and per-platform prepare buttons.
- Provider access checklist seeds contact/login prerequisites:
  Rabbi email, WhatsApp/contact phone, scoped login username, login release
  guard, Drive video-drop folder, and social-output map.

## Login Handoff Rule

Do not send Rabbi Elie scoped login information until:

- Drive/social ingestion mapping is confirmed.
- Shloimie confirms the social destination for each platform.
- Rabbi email is collected in WhatsApp and stored on the scoped record.
- Rabbi WhatsApp/contact phone is confirmed and stored.
- Scoped login username is present on the provider/project member record.

Prepared WhatsApp copy:

```text
Hi Rabbi Elie, before I send the scoped One Time login, can you please send the best email address to attach to your account? I am finishing the Drive and social setup first so the login only goes out after the workspace is ready.
```

## Remaining Blocker

Cleared on 2026-06-14 for the task-manager handoff: Rabbi email,
WhatsApp/contact phone, and scoped login username were stored on the live
provider/project records, then the access handoff was sent by Gmail and
delivered by WhatsApp.

Still open as a future hardening item: the scoped One Time Operations account
does not yet have a user-facing personal password setup/change flow. The
handoff used the current scoped Operations credentials plus a short-lived
access link.

## Verification

Run focused checks:

```bash
node --check server.js
node --test tests/one-time-external-user-portal.test.js tests/service-provider-directory.test.js
```

If app-visible deployment is required, deploy and run Railway doctor/live smoke
before marking the live task done.
