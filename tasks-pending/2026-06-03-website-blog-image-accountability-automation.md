# Website Blog, Image, and Student Accountability Automation

## Source

Operator clarification on 2026-06-03 after the public Blog/FAQ launch.

## Goal

Build website-facing automation lanes so approved content and Drive/Telegram
uploads can update the public website and private student accountability system
without manual file editing.

## Requirements

- Add a website blog lane in the Operations Content section.
- A recording, video, transcript, or other content job should be convertible into
  a public website blog post.
- Generated blogs should appear in the public Blog index and at the correct
  article route after approval/publish.
- Keep the current public website positioning cautious:
  - no false accreditation claim
  - no formal special-ed claim
  - no clinical/therapy/ADHD-treatment claim
- Blog generation should use BNA brand memory and the website SEO/AEO content
  brief.
- Add UI controls in Content for:
  - generate website blog draft
  - preview/edit blog title/category/slug/meta/body
  - approve/publish to website
  - unpublish/archive if needed
- Add a website image lane using the existing Google Drive Raw Intake folder.
- If the operator drops a single image into Raw Intake, the system should be
  able to classify it as a website image candidate and push it into the public
  website image/learning-moments area after approval or a safe default rule.
- Do not create a duplicate folder unless a later decision requires it. Current
  preference: Raw Intake is acceptable for images.
- Extend Telegram/audio/day-recording parsing so spoken reports can update:
  - student accountability records
  - daily Torah goal completion
  - goal/task follow-ups
  - public cumulative Torah trip progress only through the existing private
    scoring/progress rules
- Example spoken report intent: "this boy followed along", "this boy did it
  100 percent", or similar daily ratings.
- Public site must still not expose private goal minutes, goal type, raw minutes,
  or detailed inside/listening data.

## Suggested Implementation Shape

1. Add a persisted website blog post model/table or JSON-backed content store.
   Suggested fields:
   - id
   - content_job_id nullable
   - title
   - slug unique
   - category
   - excerpt
   - meta_title
   - meta_description
   - keywords
   - body_sections/body_html
   - language
   - status: draft, approved, published, archived
   - published_at
   - created_at / updated_at
2. Replace or extend `public/js/bna-content.js` so dynamic/published blog posts
   can be loaded from an API or generated static JSON file.
3. Add public API endpoints for published blog index/article data, or a safe
   build/write step that updates a public JSON file.
4. Add Operations Content actions for website blog draft generation and
   publish/unpublish.
5. Add an image intake classifier in the Drive watcher:
   - image-only upload -> website image candidate
   - long video/audio -> content job
   - mixed/uncertain -> needs review
6. Add website image records and public rendering path for homepage learning
   moments or a future gallery.
7. Expand the mixed parser prompt/output schema so student accountability and
   Torah daily-completion updates are first-class parse outputs.
8. Add review UI before applying parser-created student updates when confidence
   is low.

## Verification

- Local tests for blog slug generation, published/unpublished filtering, and
  student-progress parser mapping.
- Playwright smoke for:
  - Blog index shows a newly published post.
  - Blog article route works.
  - Archived/unpublished posts do not appear publicly.
  - Raw Intake image can appear in the public website image area.
  - Spoken student progress report creates/update-review records without
    exposing private goal data publicly.

## Current Status

Partially implemented on 2026-06-03 and deployed to Railway deployment
`44717355-d9b8-41b3-a198-e91acc65c22c`.

Completed:
- Operations Content has a `blog_draft` / Website Blog output type.
- Approved Website Blog drafts publish to first-party website JSON instead of
  requiring GHL blogs.
- Homepage Blog, `/blog`, and `/blog/:slug` load published website-blog JSON.
- Telegram content quick actions include `Make Website Blog`.
- Homepage Learning Moments can load extra items from
  `public/data/learning-moments.json`.
- `npm run website:add-moment -- --source ...` can add an image to that feed.
- Mixed recording parsing includes `daily_torah_updates`.
- Parsed daily Torah completion writes admin-visible daily entries and updates
  cumulative trip progress through the existing 30-unit model.

Still next:
- Add a true Drive watcher/classifier for image-only Raw Intake uploads.
- Add an Operations approval/review UI for website image candidates.
- Add richer blog metadata edit/unpublish controls.
- Add Playwright smoke that creates a temporary published blog and verifies it
  appears publicly, then archives/removes it.
