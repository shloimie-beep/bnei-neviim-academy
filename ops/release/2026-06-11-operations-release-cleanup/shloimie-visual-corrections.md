# Shloimie Visual Corrections - 2026-06-11

## Fixed

- Parent mobile help assistant and WhatsApp controls no longer cover calendar content, event details, or page actions.
- Student mobile helper control no longer covers calendar connector status or event cards.
- Bottom bot/help entry points remain visible but are now part of the page flow instead of fixed overlays.
- Parent and student mobile screenshots at 360, 390, and 430 widths show no horizontal overflow.
- Parent/student Hebrew screenshots preserve RTL layout while keeping UI chrome localized.
- Provider participant screenshots show a simple participant/program surface, separate from BNA school accountability features.

## Clean-Branch Verification

- `npm test`: pass, 110/110.
- `npm run screenshot`: pass, no horizontal scroll.
- `npm run app:smoke`: pass against clean server.
- `npm run openai:smoke`: pass.

## Evidence

- Screenshots: `ops/release/2026-06-11-operations-release-cleanup/screenshots/`
- Screenshot index: `ops/release/2026-06-11-operations-release-cleanup/screenshot-index.md`
- Automated issue file: `ops/release/2026-06-11-operations-release-cleanup/screenshot-issues.json`

## Still Not An Original-Workspace Deploy

The UI corrections are ready to carry forward through the clean branch, but the original workspace must not be deployed directly because it contains unrelated and unsafe dirty changes.
