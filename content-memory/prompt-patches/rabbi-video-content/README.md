# Rabbi Video Content Prompt Patch Library

Use this library for One Time Mishnah Class / Rabbi Elie Scheller video content
planning, AI video prompting, Remotion prompt composition, CapCut handoff
prompts, ad-candidate clips, and source-sheet or worksheet visual support.

This is a prompt patching library, not a finished video. It gives future
generation systems reusable modules for camera angles, platform ratios, Jewish
thematic visuals, and One Time scope.

## Default Patch Order

1. `project-one-time-scope`
2. `privacy-and-claims-guardrail`
3. One aspect-ratio patch
4. One camera patch
5. One or more Jewish/theme patches
6. Optional output-goal patch
7. `negative-ai-video-guardrail`

## Named Stacks

- `one-time-vertical-short`: default 9:16 short for Reels, Shorts, WhatsApp
  status, and organic clips.
- `one-time-youtube-lesson-preview`: 16:9 YouTube lesson preview or intro.
- `one-time-square-ad-candidate`: 1:1 / 4:5 ad-candidate prompt for feed
  placements.
- `one-time-source-sheet-broll`: B-roll prompt for source sheets, worksheets,
  and mekoros support visuals.

## CLI Composer

The helper script composes a ready prompt without calling an AI model:

```bash
node scripts/rabbi-video-prompt-library.mjs --list
node scripts/rabbi-video-prompt-library.mjs --stack one-time-vertical-short --topic "Bava Metzia responsibility in business" --audience "parents and boys"
node scripts/rabbi-video-prompt-library.mjs --patches project-one-time-scope,ratio-wide-youtube,camera-lesson-preview,jewish-mishnayos-visuals --topic "Mishnah class preview"
```

Use the composed prompt as the system/user direction for a video-generation
model, a Remotion planning step, or a CapCut manual handoff.

## Operator Correction Workflow

When Shloimie dislikes a generated video prompt or output, turn the correction
into a patch only if it is likely to matter again. Examples:

- "Use more over-the-shoulder sefer shots" belongs in a camera patch.
- "Make this one clip faster" belongs in the one-off prompt, not the library.
- "Do not use generic Jewish stock imagery" belongs in the negative guardrail.

## One Time Scope Notes

- Keep this library scoped to One Time Mishnah Class and Rabbi Elie Scheller.
- Do not mix in BNA private students, BNA accounting, BNA devices, or operator
  internal Changelog details.
- Use BNA brand memory only for shared tone and technical workflow context.
- Source claims and Torah points still need source-sheet or Rabbi review when
  used publicly.
