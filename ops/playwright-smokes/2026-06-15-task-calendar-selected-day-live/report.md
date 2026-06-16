# Task Calendar Selected Day Live Smoke

Date: 2026-06-15
Target: https://bneineviimacademy.org/operations?workspace=bna&view=tasks&section=schedule&calendar_mode=day&date=2026-06-22

## Result

PASS. Authenticated Operations rendered the Tasks > Calendar selected-day
panel with an explicit selected date, Hebrew date/item context, task add/move
actions, and an adjacent Google Calendar dry-run action.

## Contract Checks

- PASS selected day renderer exists
- PASS selected label copy exists
- PASS selected label formatter exists
- PASS Google dry-run button exists
- PASS Google dry-run handler exists
- PASS Google dry-run uses action registry
- PASS Google dry-run is dry-run only

## Browser Checks

- PASS desktop metrics: {"hasPanel":true,"hasSelectedLabel":true,"hasHebrewDate":true,"hasAddTask":true,"hasMoveTask":true,"hasGoogleDryRun":true,"hasNoNaN":true,"noHorizontalOverflow":true}
- PASS mobile metrics: {"viewport":{"width":390,"height":900},"hasPanel":true,"hasSelectedLabel":true,"hasGoogleDryRun":true,"hasNoNaN":true,"noHorizontalOverflow":true}
- PASS unexpected write requests after login: 0

## Screenshots

- desktop.png
- mobile.png

## Guardrails

The smoke did not click the dry-run button and recorded zero write requests
after login. The visible Google Calendar control is wired to
`sync_google_calendar` with `dry_run: true` and
`no_google_calendar_write: true`; no Google Calendar event, internal calendar
event, email, WhatsApp, Buffer/social action, external connector write, or
external CRM write was triggered by this readback smoke.
