# Website Moments And Parser Routing

## Status

Implemented and live as of 2026-06-06.

Verified pieces:

- Dedicated Drive folder: `BNA V2 / 00 Upload Here - Website Images`.
- Telegram command: `/website_images` publishes the newest intake image to the public Learning Moments feed.
- Idle bridge watcher checks Website Images before Raw Media Intake and can auto-publish the newest image.
- One-off command: `npm run website:ingest-image`.
- Live smoke: `npm run app:smoke -- --require-drive` verifies the Website Images folder, Drive account, and live public/app APIs.

Remaining caution:

- Public website image publishing is intentionally scoped to the Website Images lane, not the main Raw Media Intake. Do not route these images through GHL.

## Operator Intent

- Learning Moments on the public homepage should show images only.
- Titles, descriptions, and dates are for internal tracking and accessibility, not visible overlay copy.
- Do not route Learning Moments uploads through GHL.
- Do not use the main repurposing Raw Intake as the long-term website carousel intake.
- Create a separate Google Drive lane/folder for website moments so the operator can drop images there from phone/cloud and have them move toward the public homepage.

## Recommended Drive Workflow

1. Create folder under `BNA V2`: `00 Website Moments Intake`.
2. The Telegram/Kimi bridge should watch that folder separately from `01 Raw Intake`.
3. When a new image appears:
   - download it
   - create a short internal description
   - store the date uploaded/taken if available
   - copy/optimize it into `public/images/learning-moments/`
   - update the `learningMoments` array in `public/index.html`
   - move the Drive original to an approved/archive folder
   - redeploy and smoke test the homepage carousel
4. Public carousel output should remain image-only.

## Content Parser Routing

- If the operator says the recording is an internal task, parse it into Tasks.
- If the operator says they are meeting with a specific student, parse it into Student Accountability/private meeting notes.
- If the operator uploads a class recording, parse it into class notes: topics learned, discussions, questions, sources, and newsletter snippets.
- Newsletter snippets should be source material for the Newsletter prompt, not automatic published copy.
- Accountability should usually start with an explicit phrase such as `I am meeting with [student]`.

## 30-Page Progress Flow

- Current public progress is `3.5/30`.
- Use `npm run learning:progress -- <pages>` to update the homepage progress in a repeatable way.
- Example: `npm run learning:progress -- 4`.
