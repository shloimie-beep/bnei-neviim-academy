# OneTime Asset Audit - 2026-06-17

Source raw ID: `RAW-20260617-010`

## Local Findings

| Source | Status | Notes |
|---|---|---|
| `public/images/one-time-logo-black.png` | Available | Existing OneTime logo asset used by OneTime pages. |
| `public/images/one-time-existing-site-preview.jpg` | Available | Existing preview image used as hero/poster fallback. |
| `public/images/sitting on grass.jpg` | Available | Text-free existing BNA public learning image used as temporary `/one-time` hero fallback to avoid old embedded screenshot copy. |
| `C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files` | Available | Exported site assets/images found, including `heroeli.webp`, map/crowd images, and other image files. |
| Local video search in Downloads | Blocked/missing | No `.mp4`, `.mov`, `.webm`, or `.m4v` with OneTime/Rabbi/hero naming found during scan. |

## Hero Media Plan

- Desktop poster/video target: 1920x1080 or wider 16:9 crop.
- Mobile poster/video target: 1080x1920 portrait crop.
- If one image must serve both, use `object-fit: cover` and a defined focal
  point; do not stretch a vertical asset into a landscape hero.
- Required screenshots: 390px, 768px, 1440px.

## Import Instructions

1. Operator places approved source assets in a named local/Drive folder.
2. Record owner/permission notes before publishing.
3. Optimize/copy approved web assets to `public/images/onetime/` using clean
   filenames.
4. Use small poster images in repo; keep huge raw videos outside tracked repo or
   use approved static/CDN storage.
5. Re-run responsive screenshots and asset-manifest check.

## Blockers

- OneTime-specific hero video cannot be added until the video file is present and usage rights
  are confirmed.
- Rabbi/OneTime-specific hero image should replace the temporary BNA public
  learning image after asset permission is confirmed.
- No private subscriber screenshots, private meeting-location media, secrets, or
  raw customer data should be committed.

## Verification

- `Get-ChildItem` scan of Downloads found the OneTime exported asset folder.
- `Get-ChildItem` scan for video extensions returned no matching local hero
  video.
- Local responsive screenshot proof:
  `ops/playwright-smokes/2026-06-17-onetime-focused-landing-local/report.md`
  with 390px, 768px, and 1440px screenshots.
- Live focused landing smoke:
  `ops/live-smokes/2026-06-17T14-28-38-904Z-onetime-focused-landing-live-smoke.md`.

## Status

- Asset planning and import instructions: Done.
- Temporary `/one-time` hero fallback: Done and live-smoked.
- OneTime/Rabbi-specific hero video: Blocked until an approved file and rights
  confirmation are provided.
