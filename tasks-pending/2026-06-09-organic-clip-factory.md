# BNA Organic Clip Factory

Date: 2026-06-09

## Request

The operator wants a repeatable organic-content workflow for marketing. He will
test prompts/workflows and drop many images and raw videos into folders. Codex
should organize those assets into short, high-quality clips that can be posted
constantly and used to bring in more students.

Correction: the intended human editor is CapCut, not Canva.

## Goal

Build a repo-controlled Remotion workflow that can take a Drive/local folder of
images and videos and render a reusable BNA vertical social clip:

- target length around 22 seconds
- portrait-first output for Reels/Shorts/status
- 2-second image chunks when the source is a folder of stills/screenshots
- selected raw-video chunks when the source is video
- short text overlays and/or transcript captions
- simple transitions between chunks
- optional rock-style background music/audio overlay
- final flyer/update card
- output MP4 in `renders/`
- optional CapCut handoff pack for manual finishing

## Current Repo Starting Point

Already implemented:

- `src/remotion/NaturalVideoEdit.tsx`
- `src/remotion/OrganicClipFactory.tsx`
- `scripts/video-edit-source.mjs`
- `scripts/video-clip-factory.mjs`
- `npm run video:edit:source`
- `npm run video:clip-factory`
- Telegram `/edit_video` for newest Drive Raw Intake clip
- Telegram `/edit_drop` for newest local drop-folder clip
- direct small-upload caption/edit path
- image/audio companion asset support for `/edit_video` and `/edit_drop`

The existing Remotion lane supports source-video trims, speed changes, fades,
zoom/focus, brightness/contrast, text overlays, subtitles, image overlays, and
audio overlays. The missing piece is a folder/storyboard clip factory for image
sets, mixed media, reusable templates, and CapCut-ready handoff.

2026-06-09 first pass added:

- `OrganicClipFactory` Remotion composition for mixed image/video clips,
  captions, music, transitions, and final card.
- `npm run video:clip-factory` CLI that inventories a source file/folder,
  copies media into `public/organic-clip-assets/`, creates storyboard props,
  can render MP4, and can write a CapCut handoff folder.
- Deterministic fallback behavior: 22-second clip, roughly 2-second media
  chunks, opening title, optional captions from `--caption` or
  `--caption-file`, optional music, and final card.

## CapCut Research Notes

Official CapCut pages confirm these useful manual/editor features:

- Long Video to Shorts / AI Clip Maker can identify highlights, auto-cut clips,
  smart crop/reframe to vertical, generate captions, and export/share clips.
- CapCut Online/Desktop/Mobile can export edited videos, with 2K/4K availability
  depending on platform, device, account, browser, and source-media quality.
- CapCut templates are useful, but the full community/TikTok template experience
  is strongest on mobile; Web/Desktop template access is more limited.

Implementation caveat:

- Do not build the core BNA automation on unofficial CapCut APIs. As of this
  research pass, no safe official public CapCut render/edit API was found for
  sending a JSON timeline and receiving a rendered batch video.

## Proposed Interfaces

CLI:

- `npm run video:clip-factory -- --source media-drop/organic-set --prompt "..."`
- `npm run video:clip-factory -- --source <folder> --images --duration 22`
- `npm run video:clip-factory -- --source <video-or-folder> --music <file>`
- `npm run video:clip-factory -- --source <folder> --capcut-pack`
- `npm run video:clip-factory -- --dry-run`

Telegram:

- `/organic_clip <instructions>` for newest Drive Raw Intake media
- `/organic_drop <instructions>` for newest local media-drop folder/file
- Optional reply-to-upload behavior for small direct video/image uploads

## Implementation Plan

1. Add a Remotion composition for mixed-media organic clips.
2. Add a script that inventories a folder of images/videos/audio and creates a
   normalized storyboard JSON.
3. Use AI to turn the operator prompt plus asset inventory into a safe timeline:
   ordered media chunks, overlay text, caption slots, music, and final card.
4. Support deterministic fallback for common prompts:
   22 seconds, 2-second still-image chunks, fade transitions, BNA title text,
   final card.
5. Render to `renders/` and write the storyboard/props JSON beside the MP4.
6. Add a CapCut handoff folder containing selected assets, caption text,
   storyboard JSON/Markdown, final-card copy, and a single prompt the operator
   can paste into CapCut's AI/manual workflow.
7. Wire Telegram commands after the CLI is stable.
8. Add dry-run tests for image-folder storyboard generation and prop
   sanitization. Add a small render smoke if sample assets exist.

## Acceptance Checks

- A folder of 10 still images can render a 22-second vertical MP4 with
  two-second chunks, transitions, and text.
- A raw video can render a 22-second clip with selected source segments,
  captions/text overlays, music, and final card.
- The raw media is not modified.
- The script can produce a CapCut handoff pack without rendering.
- Reruns do not overwrite previous renders unless `--force` is used.
- Telegram command returns the MP4 path or sends the MP4 when small enough.

## Open Decisions

- Choose the default BNA background track or folder for reusable music.
- Choose the first final-card/flyer design source: existing website flyer,
  static image from Drive, or generated Remotion card.
- Decide whether this should publish directly to Buffer later or remain a
  render-first/manual-review workflow.
