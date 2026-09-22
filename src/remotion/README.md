# BNA Remotion Video Studio

This folder contains the code-based video editor setup for Bnei Nevi'im Academy.

## Commands

- `npm run video:studio` opens Remotion Studio.
- `npm run video:compositions` lists available videos.
- `npm run video:render` renders the default portrait intro video.
- `npm run video:render:portrait` renders `renders/bna-intro-portrait.mp4`.
- `npm run video:render:wide` renders `renders/bna-intro-wide.mp4`.
- `npm run video:edit -- "plain English request"` turns natural language into video props and renders an MP4.
- `npm run video:edit:dry -- "plain English request"` writes props only without rendering.
- `npm run video:edit:source -- --source path/to/video.mp4 "plain English edit request"` edits a real source video.
- `npm run video:edit:source:dry -- --source path/to/video.mp4 "plain English edit request"` writes source-video timeline props only.
- `npm run video:open-renders` opens the local render output folder.

## Natural-Language Editing

The intended workflow is:

1. Say what you want in plain English.
2. The `scripts/video-edit.mjs` command asks Kimi first, then OpenAI if needed.
3. The command writes safe Remotion props into `src/remotion/generated/`.
4. The command renders the selected Remotion composition into `renders/`.

For One Time Mishnah Class or Rabbi Elie Scheller content, compose a prompt
patch first from `content-memory/prompt-patches/rabbi-video-content/`:

```bash
node scripts/rabbi-video-prompt-library.mjs --stack one-time-vertical-short --topic "Mishnayos review clip"
```

Use the composed prompt as the natural-language request, or paste it into a
CapCut/AI-video handoff when Remotion is not the final renderer.

Examples:

```bash
npm run video:edit -- "Make an 8 second vertical forest video about learning Torah outdoors. Headline: Torah in the forest. CTA: Come see it."
npm run video:edit -- --wide "Make a 10 second YouTube intro about boys taking ownership of Torah learning."
npm run video:edit:dry -- "Make it warm and gentle. Headline: A calmer place to learn. CTA: Book a visit."
```

Supported safe edits in the starter template:

- `eyebrow`
- `headline`
- `subheadline`
- `callToAction`
- `durationSeconds`
- `footerText`
- `showLogo`
- `tone`: `calm`, `forest`, `bold`, `warm`, or `night`

## Source-Video Editing

Use `scripts/video-edit-source.mjs` when the operator drops a real clip into intake and wants timeline edits.
The script copies the source video into `public/video-edit-assets/`, asks Kimi first and OpenAI second for a safe edit plan, writes timeline props into `src/remotion/generated/`, and renders `NaturalVideoEdit`.

Examples:

```bash
npm run video:edit:source -- --source media-inbox/clip.mp4 "From 3s to 8s speed up 2x, brighten it, add subtitle: Forest learning"
npm run video:edit:source -- --source media-inbox/clip.mp4 --asset logo=public/images/bna-logo-nobg.png "Put logo top right from 2s to 6s, zoom center at 5s"
npm run video:edit:source:dry -- --source media-inbox/clip.mp4 "Trim to the first 12 seconds and fade between cuts"
```

Supported first-pass source edits:

- Source-video cuts and timeline segments.
- Speed changes such as "from 3s to 8s speed up 2x".
- Simple fade transitions between generated segments.
- Zoom/focus instructions through segment zoom and focus percentages.
- Brightness and contrast adjustments.
- Text overlays and subtitles.
- Image and audio overlay slots when assets are supplied with `--asset key=path`.
- Telegram `/edit_video` and `/edit_drop` now pass companion photos/audio found beside the source video as overlay assets. The bot reports keys like `image1`, `audio1`, or sanitized filenames so prompts can say "put image1 top right" or "use audio1 quietly in the background."

Telegram bridge commands:

- `/edit_video from 3s to 8s speed up 2x, brighten it, add subtitle: Forest learning` uses the newest video in Google Drive `BNA V2 / 01 Raw Intake`.
- `/edit_drop zoom center, add title: BNA moment` uses the newest local video in `media-drop/inbox`.
- Uploading a small video directly to Telegram with an edit-style caption also renders it through Remotion.

## Current Compositions

- `BnaIntroPortrait`: 1080x1920 vertical video for WhatsApp status, Shorts, Reels, and social clips.
- `BnaIntroWide`: 1920x1080 horizontal video for YouTube, website, or presentations.
- `NaturalVideoEdit`: data-driven source-video editor for cuts, speed, overlays, captions, zoom/focus, and color adjustments.

## Editing

Edit `src/remotion/BnaIntroVideo.tsx` to change the design, text, motion, timing, or branding.
Edit `src/remotion/Root.tsx` to add more video compositions.

The BNA logo is loaded from `public/images/bna-logo-nobg.png`.
