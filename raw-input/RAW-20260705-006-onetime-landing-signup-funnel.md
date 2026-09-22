# RAW-20260705-006 - OneTimeOneTime Landing Signup Funnel

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-006 |
| Source channel | codex_chat |
| Source file | C:\Users\User\.codex\attachments\82bdee58-d8f5-458f-a533-bf65310bad46\pasted-text.txt |
| Parse status | registered |
| Workspace | rabbi_sheller_provider |
| Project | one_time_mishnah_class |
| Requirement register | tasks-pending/2026-07-05-onetime-landing-signup-funnel.md |
| Created at | 2026-07-05T15:20:00+03:00 |

## Raw Intake

Update the main OneTimeOneTime Mishnayos landing page UI and copy.

Goal:
The current page should become a focused signup funnel for the upcoming
Mishnayos class, while visually matching the original OneTimeOneTime
brand/site style shown in the screenshots: black/dark navy background, white
text, bright yellow accents, strong serif hero headline, clean top toolbar/nav,
and the yellow ticker/announcement-style strip.

Important:
- First inspect the existing codebase and identify the current landing page
  route/components/styles.
- Keep the existing tech stack and styling approach. Do not introduce a new UI
  framework unless absolutely necessary.
- Use placeholders for images/videos for now. Do not spend time sourcing final
  media.
- Keep the design responsive for desktop, tablet, and mobile.
- Make the fonts and brand colors consistent across the page/site using shared
  CSS variables or the existing theme system.
- The brand direction is black / white / yellow. The OneTimeOneTime logo
  should work on the dark header; where the black logo is needed later, leave a
  clear placeholder/comment if the asset is not in the repo yet.

Design direction:
Use the original OneTimeOneTime homepage hero as the model:
- Dark sticky/top header.
- Logo on the left.
- Nav items on the right.
- Yellow CTA button.
- Large hero section with a full-width background image/video placeholder.
- Dark overlay over the hero media.
- Centered headline and subheadline.
- Yellow primary CTA button and white secondary CTA button.
- Yellow banner/ticker strip at the bottom of the hero.

Page structure:
1. Top announcement bar: "30 DAYS TO JOIN - START WITH 30 DAYS FREE" and
   "Enrollment deadline will be posted before launch".
2. Header / toolbar: logo placeholder or existing logo; Watch, Program, How It
   Works, FAQ, Start Free, Member Login; primary Start Free CTA.
3. Hero section: WORLDWIDE LIVE MISHNAYOS; "Your Child Can Love Learning
   Mishnayos"; the requested subheadline, support line, Start 30 Days Free,
   See How It Works, no-pressure trial microcopy, and the bottom yellow ticker.
4. "As seen across the Jewish world" section with TorahAnytime, 24Six, The
   Loop, Mishpacha, and Naki placeholders/assets.
5. Program intro section with Inside the Program copy and three cards: Live
   Class, Clear Review, Steady Progress.
6. "Who it's for" funnel section with four requested bullets.
7. "What students receive" feature grid with eight requested features.
8. Outcome section: "They don't just join a class. They join a mission." plus
   the two-and-a-half-year copy and Start 30 Days Free CTA.
9. FAQ with the six requested questions and answers.
10. Final CTA section: "Start with 30 days free.", requested copy, Start Free,
    Member Login, and simple footer.

Style requirements:
- Use the same visual language as the original OneTimeOneTime site.
- Dark background should be near-black / deep navy.
- Yellow accent should be bold and bright, similar to the existing site.
- Headlines should use the existing serif/display font if available.
- Body/nav should use the existing sans font if available.
- Buttons should be bold, high contrast, slightly rounded, and consistent.
- Cards should be dark with subtle borders.
- Keep spacing generous.
- Make the hero visually dominant.
- Mobile header should collapse cleanly or stack without breaking.

Implementation requirements:
- Replace the current ugly/basic landing page with this structure.
- Reuse existing components where sensible, but prioritize matching the target
  design.
- Use placeholder image blocks where final images are missing.
- Add comments like `TODO: replace with final hero video/image` and
  `TODO: replace with final logo asset` where appropriate.
- Do not remove authentication/member login routes.
- Do not change payment/signup logic unless required for linking buttons.
- All CTA buttons should point to the current signup/start-free route if it
  exists. If the route is unclear, use `#start-free` and add a TODO comment.
- Run lint/typecheck/build if available and fix any issues.

Deliverable:
A polished, responsive landing page that looks like the original
OneTimeOneTime brand, but functions as a simple funnel for the Mishnayos class
signup.
