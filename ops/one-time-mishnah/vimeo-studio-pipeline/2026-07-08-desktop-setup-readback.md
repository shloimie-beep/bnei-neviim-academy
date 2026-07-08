# One Time Vimeo Studio Desktop Setup Readback - 2026-07-08

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Drive Grounding

- Canonical shared Drive folder read through connector:
  `One Time Mishnah Class - Rabbi Elie Scheller`
- Canonical folder ID: `16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`
- Connector readback showed direct child folder `04 Content and Media Intake`
  with ID `1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv`.
- This desktop's mounted `G:\My Drive` did not show the canonical shared One
  Time folder as a local folder/shortcut during inspection.
- Desktop test folder created for this computer:
  `G:\My Drive\OneTime Vimeo Studio Desktop Test`

## Smokes Run

### Drive Desktop Edge-Trim Smoke

Command shape:

```powershell
node scripts/one-time-vimeo-studio-pipeline.mjs --folder "G:\My Drive\OneTime Vimeo Studio Desktop Test\drop" --processed-folder "G:\My Drive\OneTime Vimeo Studio Desktop Test\processed" --render --auto-trim-edges --default-trim-start 0 --default-trim-end 0 --opener-seconds 1 --width 640 --height 360 --json --write-report
```

Evidence:

- `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-drive-edge-smoke/2026-07-08T14-57-57-516Z-report.md`
- Source smoke video: synthetic 9s clip with 2s black/silence at start and end.
- Trim plan: auto-detected 2s start trim and 2s tail trim.
- Rendered output readback: 6.02s MP4, 640x360, 30fps, audio present.
- Vimeo dry-run: candidate count 1, blockers 0, external write false,
  production mutation false, member visibility false.

### Local OneTime Promo Smoke

Command shape:

```powershell
node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/onetime-vimeo-studio-desktop-promo-smoke --processed-folder media-inbox/onetime-vimeo-studio-desktop-promo-smoke-processed --render --default-trim-start 0 --default-trim-end 0 --opener-seconds 1 --width 640 --height 360 --json --write-report
```

Evidence:

- `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-promo-smoke/2026-07-08T14-57-46-513Z-report.md`
- Source smoke video: local OneTime promo copied into ignored `media-inbox`.
- Trim plan: explicit sidecar 0s to 12s content plus 1s opener.
- Rendered output readback: 13.02s MP4, 640x360, 30fps, audio present.
- Vimeo dry-run: candidate count 1, blockers 0, external write false,
  production mutation false, member visibility false.

### Transcription Smoke

Command shape:

```powershell
node scripts/one-time-vimeo-studio-pipeline.mjs --folder media-inbox/onetime-vimeo-studio-desktop-promo-smoke --processed-folder media-inbox/onetime-vimeo-studio-desktop-promo-smoke-processed --render --transcribe-openai --json --write-report
```

Evidence:

- `ops/one-time-mishnah/vimeo-studio-pipeline/2026-07-08-desktop-promo-transcription-smoke/2026-07-08T15-01-20-367Z-report.md`
- Result: transcription attempted on non-private promo smoke media only.
- Blocker: configured local OpenAI key is rejected with 401. The saved report
  redacts credential-shaped text.
- No transcript body was committed.

## Ready On This Desktop

- Local/Drive Desktop folder scan works.
- Static black/yellow opener renders.
- Explicit sidecar trims work.
- Optional black/silence edge trimming works for leading/trailing edges.
- BOM-prefixed Windows sidecar JSON is accepted.
- Output videos and Vimeo-compatible sidecars are produced.
- Existing Vimeo library workflow dry-run accepts the processed output.

## Still Blocked

- Canonical shared One Time Drive folder is connector-visible but not mounted
  as a local `G:\My Drive` folder on this desktop.
- Real Vimeo upload needs the exact account/project target, token readiness,
  privacy defaults, duplicate/rollback policy, private smoke, and explicit
  approval.
- Transcription needs a valid OpenAI transcription key or another approved
  provider.
- Student portal/latest-class publish and bot knowledge promotion need the
  transcript/privacy approval policy from `DEC-20260708-012`.
