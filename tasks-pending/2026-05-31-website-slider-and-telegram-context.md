# Website Slider And Telegram Context Handoff

## Completed By Codex

- Added the homepage schedule/goal/media section in `public/index.html`.
- Section class: `program-pulse`.
- Added schedule:
  - Monday and Wednesday: forest learning
  - Other learning days: HaChozeh MiLublin 7
- Added 30-page trip goal:
  - `learningProgress.pagesLearned = 2`
  - `learningProgress.pagesGoal = 30`
- Added Learning Moments carousel:
  - carousel data array: `learningMoments`
  - track element: `#mediaTrack`
  - dot element: `#mediaDots`
  - controls: `moveMediaSlide()` and `goToMediaSlide()`
- Pulled three new JPEGs from Drive `01 Raw Intake`.
- Saved originals locally in `public/images/learning-moments/`.
- Created optimized web images:
  - `public/images/learning-moments/forest-learning-01-web.jpg`
  - `public/images/learning-moments/forest-learning-02-web.jpg`
  - `public/images/learning-moments/forest-learning-03-web.jpg`
- Updated `learningMoments` to use those optimized images instead of reused existing site photos.
- Moved the Drive originals to `10 Approved` so Raw Intake stays clean.

## What Kimi Should Understand

When Shloimie says any of the following:

- "the image slider"
- "the slider you built"
- "the learning moments"
- "the website media slider"
- "the images I dropped in intake"

He is referring to the Learning Moments carousel in `public/index.html`.

## Next Likely Requests

- Add more Drive images to the carousel.
- Update captions/timestamps on the carousel.
- Connect Telegram or Drive ingest so images can be approved and then automatically added to the website slider.
- Update the 30-page progress bar after a daily report.

## Recommended Next Architecture

- Keep website content state in the repo/database, not just in Drive.
- For images: Drive Raw Intake -> local optimized web image -> website carousel -> Drive Approved.
- For videos: Drive Raw Intake -> transcript/summary -> upload public final video to YouTube -> embed YouTube URL in the website carousel/video library.
