Implement a focused One Time landing-page visual and copy revision.

REPOSITORY SAFETY

1. Start from a clean branch/worktree based on current origin/master.
2. Do not perform this work on the stale ramble-protocol branch containing commit 1c74c5f0.
3. Preserve that unrelated branch exactly.
4. Do not merge or deploy this visual revision until desktop and mobile screenshots are presented for approval.
5. Do not alter the CRM, reminder dispatch, Telegram, WAPI, authentication, portal-access, or signup API behavior except for the explicitly requested location-field change below.

PRIMARY FILES

- public/one-time/index.html
- public/one-time/signup.html
- public/js/bna-bot-widget.js
- public/assets/one-time/robot/robot-scheller-whatsapp.png
- public/assets/one-time/rabbi/rabbi-eli-holding-book.jpg

REFERENCE SCREENSHOT

/workspace/scratch/ffef2e71fe52/upload/8d1a83ad-4652-409b-869d-269e98173323.png

The reference screenshot demonstrates the current problem: oversized introductory copy, plain white cards, excessive empty space, weak visual hierarchy, and insufficient graphical treatment.

DESIGN DIRECTION

Keep the established One Time identity:

- Black
- White
- Chrome/holographic yellow
- Ice/light blue
- Subtle chrome-blue highlights
- Yellow light sweeps on the Sign Up Now buttons

Make the page modern, premium, energetic, and visually memorable.

Do not produce another generic row of identical white cards. Use:

- Layered panels
- Light-blue gradients
- Chrome borders and highlights
- Purposeful icons
- Subtle background photography with dark or blue gradient overlays
- Alternating section compositions
- Controlled animation
- Stronger visual rhythm
- Generous but not wasteful spacing

Use placeholder image panels where final classroom images are not yet available. Clearly label placeholder filenames and intended subjects in the markup.

Maintain accessible contrast, keyboard navigation, semantic headings, and prefers-reduced-motion support.

REQUIRED SECTION ORDER

Change the landing-page order to:

1. Hero
2. What You Receive
3. What He’ll Gain
4. How It Works
5. Who It’s For
6. Meet Rabbi Scheller / teaching-location slider
7. Rosh Hashanah countdown ticker
8. Footer

Update the sticky-header navigation to follow this same order.

HERO

Replace the current hero wording with exactly:

Eyebrow:
“Worldwide Mishnah learning — live from Eretz Yisrael”

Main heading:
“Give your son a love for learning Torah.”

Schedule:
“Live every day at 7:00 p.m. Israel time.”

Button:
“Sign Up Now”

Requirements:

- Make “Worldwide Mishnah learning — live from Eretz Yisrael” substantially larger and more visually important than the current eyebrow.
- Remove the current descriptive hero paragraph.
- Remove the three current hero proof boxes.
- Do not add replacement marketing paragraphs.
- Keep one principal Sign Up Now button.
- Use an elegant background-image placeholder with a controlled dark/ice-blue fade so the text remains perfectly readable.
- The hero should feel striking and premium without becoming crowded.

WHAT YOU RECEIVE

Move this section directly after the hero.

Section heading:
“What You Receive”

Remove:

- “A complete learning experience for home or school.”
- “Everything is shaped around a simple goal…”
- Every other introductory paragraph.

Display the following as visually polished icon tiles:

- Live daily Mishnayos class
- Online class library
- Student portal
- Parent portal
- Review sheets
- Daily email and WhatsApp reminders
- Questions with Rabbi Scheller
- Monitored online platform

Use titles only. Do not add paragraphs beneath every item.

The layout may use a staggered grid, compact feature ribbon, or layered dashboard-style panel. It must not resemble eight plain white boxes.

Add one faded classroom-image placeholder as part of the composition, but do not allow it to compete with the feature titles.

WHAT HE’LL GAIN

Section heading:
“What He’ll Gain”

Delete:

- “Not just another class. A new relationship with learning.”
- “Designed for boys who can handle more…”
- All equivalent large introductory copy.

Use three visually distinct benefit panels with this exact copy:

Clarity

“He’ll understand the main points, the questions, and the logic behind each Mishnah—with review sheets and opportunities to ask Rabbi Scheller questions.”

Accomplishment

“One perek a day gives him a clear goal, steady progress, and visible progress badges and milestones in his student portal.”

Excitement for learning Torah

“A lively class and a real connection with Rabbi Scheller make Torah learning something he looks forward to each day.”

Do not say that every Mishnah is turned into a story.

Give each benefit a meaningful icon or visual treatment. Avoid the current numbered-white-card appearance.

HOW IT WORKS

Section heading:
“How It Works”

Remove every existing headline and explanatory paragraph beneath that heading.

Show only this three-step sequence:

1. Sign up
2. Receive the class link
3. Join the live class

Make this a compact, visually connected three-step flow. Do not mention selecting Family or School in this landing-page section.

The only CTA in this section is:
“Sign Up Now”

WHO IT’S FOR

Section heading:
“Who It’s For”

Remove the large introductory headline and paragraph.

Show only these audience groups:

- Families
- English-speaking homeschoolers
- Schools
- Local boys in Ramat Beit Shemesh Alef

Under the local-class item only, use this short supporting line:

“Free live class at 7:00 p.m.”

Do not add paragraphs under the other audience items.

MEET RABBI SCHELLER

Move the Rabbi section near the bottom, after Who It’s For.

Eyebrow:
“Meet Rabbi Scheller”

Heading:
“A world-renowned Torah teacher.”

Use this short paragraph:

“Rabbi Eli Scheller has taught Torah to students and audiences across the Jewish world. His clarity, warmth, and energy help boys understand what they are learning and look forward to coming back.”

Keep the existing book photograph:

public/assets/one-time/rabbi/rabbi-eli-holding-book.jpg

Add a second subsection titled:

“Teaching Torah Across the Jewish World”

Create an accessible image carousel with temporary image placeholders for:

- Baltimore
- Flatbush, New York
- Hollywood, Florida
- Additional location — image pending

Each slide must include:

- A large teaching/classroom image area
- A readable location label over a gradient
- Previous and next controls
- Pagination indicators
- Automatic advancement
- Pause on hover and keyboard focus
- Swipe support on mobile
- Reduced-motion support
- No layout shift when images change

Keep “As Seen Across the Jewish World” as a separate continuous transparent logo marquee using the existing press logos. Do not put white boxes behind the logos.

ROSH HASHANAH COUNTDOWN

Remove the current static Rosh Hashanah promotion section.

Create a full-width chrome-yellow moving ticker immediately above the footer.

The ticker must repeatedly display:

“ROSH HASHANAH SPECIAL • [N] DAYS UNTIL ROSH HASHANAH • JOIN FREE UNTIL ROSH HASHANAH • SIGN UP NOW”

Requirements:

- Calculate [N] dynamically in JavaScript.
- Do not hardcode the visible number.
- Rosh Hashanah 5787 begins at sundown on Friday, September 11, 2026.
- Count calendar days using Asia/Jerusalem.
- If an exact sunset time is not already available in the repository, count to the Jerusalem calendar date 2026-09-11 rather than inventing a sunset time.
- Update automatically when the date changes.
- Stop or replace the countdown once the target date arrives.
- The ticker should move horizontally and loop seamlessly.
- Pause on hover and keyboard focus.
- With reduced motion enabled, display the information statically.
- It must not be position:fixed and must not cover the WhatsApp bot or mobile content.
- “Sign Up Now” must link to /one-time/signup.

ROBOT SCHELLER WIDGET

Preserve the currently working “current class information” behavior.

Use the existing asset:

public/assets/one-time/robot/robot-scheller-whatsapp.png

Fix the closed launcher:

- The entire robot graphic must be visible.
- Center it horizontally and vertically.
- Do not crop its circle, head, feet, or outer glow.
- Use background-size: contain or a real img with object-fit: contain.
- Do not rely on background positioning that causes the image to appear off-center.
- Verify at widths 1440, 768, 430, and 390.
- Preserve the current bottom-right placement.

Fix the open assistant panel:

- Place a complete, uncropped version of the robot image in the top corner of the assistant header.
- The panel image should be approximately 72–88 pixels on desktop and 56–68 pixels on mobile.
- Use object-fit: contain.
- Keep “Robot Scheller” and the close control readable.
- Do not use the robot merely as a tiny circular background.
- The image must not cover the assistant text, choices, or close button.
- Preserve all existing assistant actions and current-class responses.

SIGNUP LOCATION FIELD

The current hardcoded eight-city datalist is not acceptable for a worldwide signup.

Do not replace it with ZIP code only because ZIP codes are United States-specific.

Implement this simpler flow:

- Keep a required free-text field labeled “City.”
- Permit any city; do not require matching a predefined list.
- Remove the hardcoded CITY_OPTIONS datalist and the “choose the matching city” requirement.
- Automatically capture the browser IANA timezone using:
  Intl.DateTimeFormat().resolvedOptions().timeZone
- Store the entered city exactly as entered.
- Store browser_timezone and timezone using the detected IANA timezone.
- If browser timezone detection fails, reveal a required searchable Time zone field.
- Keep reminder scheduling anchored to the 7:00 p.m. Israel class.
- Use the saved timezone to display the recipient’s corresponding local class time.
- Do not add a mandatory ZIP/postal-code field.
- Preserve Family/School, email, optional phone, reminder preference, consent, and no-student-field behavior.
- Phone remains required only when WhatsApp or both reminder channels are selected.

SIGNUP FOOTER

Add the same canonical footer used on the landing page to /one-time/signup:

- One Time logo
- “One Time Mishnayos with Rabbi Eli Scheller.”
- Privacy
- Terms
- Member Login

The signup footer must visually match the landing footer and work on desktop and mobile.

ACCEPTANCE TESTS

Provide screenshots at:

- 1440px
- 1024px
- 768px
- 430px
- 390px

Verify:

- No horizontal overflow.
- Robot centered when closed.
- Complete robot visible inside the open panel header.
- Current Class Information still works.
- Dynamic countdown displays the correct calculated number.
- Static countdown fallback works with reduced motion.
- Section order matches this prompt.
- Removed copy is absent.
- Exact new copy is present.
- City accepts a location outside the former eight-city list.
- Browser timezone is stored.
- Phone remains conditional.
- Signup footer is present.
- Every Sign Up Now link routes to /one-time/signup.
- Existing signup API and automation tests still pass.

After implementation, return a requirement-by-requirement matrix and the screenshots. Do not merge or deploy until I approve the visual proof.