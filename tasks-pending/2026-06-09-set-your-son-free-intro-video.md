# Set Your Son Free Intro Video

Date: 2026-06-09

## Request

Create the first BNA daily-video intro from the operator's described assets and
timing.

## Target

- Roughly 15 seconds.
- Portrait-first social/video intro.
- Top title text: `Set your son free`.
- Audio source: operator already downloaded an audio file with 4K Downloader.
- Use the segment from about `00:01:10` to `00:01:27`; trim to the best 15
  seconds if needed.
- Visuals: 4-5 slow-motion clips of boys with simple transitions.
- Movement: camera-style pan/zoom across the clips, including slow face push-in
  when suitable.
- Use as the intro for the daily BNA video series.

## Source Asset Clues

- Files may be on the local computer and also in Google Drive.
- Mentioned visual examples:
  - a kid playing drums
  - a kid cooking
  - the cooking clip slowly zoomed/panned into the face
- Before rendering, inventory likely source folders:
  - `media-drop/`
  - `media-inbox/`
  - Google Drive Raw Intake / processed media folders if Drive access is needed

## Implementation Notes

- Prefer the existing Remotion pipeline instead of a one-off manual edit.
- Start with `npm run video:clip-factory` or `npm run video:edit:source`
  depending on whether the source is a folder/mixed-media set or one video.
- If the audio file is separate, wire it as the music/audio overlay and trim the
  timeline to match the intro duration.
- Keep raw media untouched; copy working assets into the existing public/render
  asset workflow.
- If the best source files cannot be located locally, create a clear blocker
  note listing the exact folders checked and the missing file names needed.

## Acceptance Checks

- Rendered MP4 exists in `renders/`.
- Audio matches the requested 1:10-1:27 segment or the best 15-second trim from
  that range.
- Title `Set your son free` is visible at the top and does not overlap faces.
- 4-5 visual moments are used with slow-motion/pan/zoom and clean transitions.
- The render is verified by opening/smoking the MP4 or extracting frames.
