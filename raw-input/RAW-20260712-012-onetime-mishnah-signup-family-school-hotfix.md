# RAW-20260712-012 - One Time Mishnah signup Family/School hotfix

- Date: 2026-07-12
- Source channel: codex_chat
- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- Parse status: registered
- Requirement register: tasks-pending/2026-07-12-onetime-mishnah-signup-family-school-hotfix.md

## Raw Source

Shloimie:

> Can you just, while you're on this mission to like push and deploy everything, can you first deploy the form, the sign-up form, and make that actually work? There was a bug that when you click family, it still makes you like sign up as like a, it's not working. Like I'm trying to choose family or trying to choose a school, and it's not letting me finish that form. So can you fix that form first? That was the first deploy that we need to do right now, and then, you know, go back to doing the rest of your goal.

Shloimie clarification:

> No, the one time, one time.

Shloimie clarification:

> The form to sign up for the Mishnah class.

## Parsed Items

- REQ-20260712-701: Fix the One Time Mishnah direct signup Family/School chooser so choosing either branch persists and submits the intended branch.
- REQ-20260712-702: Ensure the One Time continuation/onboarding form honors the saved Family/School branch when the user continues from the direct signup, while still allowing an explicit URL branch override.
- REQ-20260712-703: Deploy the hotfix before resuming broader launch consolidation, and verify with local browser tests plus live no-write smoke where possible.

## Guardrails

- No payment, checkout, member access, password setup, or classroom access grant.
- No email, WhatsApp/WAPI, Telegram, or external send as part of this hotfix verification unless separately approved.
- No raw private contact details committed.
- Keep BNA Academy records separate from One Time records.
