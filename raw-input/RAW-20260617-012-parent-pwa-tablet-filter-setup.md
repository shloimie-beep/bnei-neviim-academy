# Raw Input RAW-20260617-012 - Parent PWA tablet and filter setup verification

| Field | Value |
|---|---|
| Raw ID | RAW-20260617-012 |
| Source channel | operations_ui |
| Source task | Operations task #567 |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-17-parent-pwa-tablet-filter-setup.md |
| Created at | 2026-06-17 |
| Implemented at | 2026-06-17T17:58:00+03:00 |

## Raw text

Verify parent PWA tablet install and filter setup flow

## Source task notes

Smoke parent portal at phone/tablet widths, install prompt, setup wizard resume, and parent-submitted setup code/status handling.

## Parsed summary

Verify and harden the parent portal setup flow so parents can install/open the parent PWA on a tablet, resume the setup section after reload, and submit filter setup code/status through the scoped household setup API.

## Closeout

- Parent PWA install remains scoped to `/parent-manifest.json` and `/parent?source=parent-pwa`; public/parent/Operations manifests remain separate.
- Parent setup section now has an install button that uses `beforeinstallprompt` when available and falls back to browser install instructions when not.
- Parent setup section can resume through `?section=setup` and local storage.
- Parent-submitted setup code/status handling remains parent-session scoped, rejects empty submissions, moves setup status to `submitted`, and keeps `remote_control_enabled: false`.
- Verification passed: focused tests, `npm test` (724/724), Railway deployment `f2787527-a42b-4285-817f-7bba15903d1e`, live app smoke, and targeted parent PWA setup live smoke with mocked parent APIs at 390px, 820px, and 1024px without mutating real parent data.
- Live task #567 was closed through the app API and read back as `done` / `history` / `completed` with `proof_status: valid` and `done_link_status: done_with_report`.
