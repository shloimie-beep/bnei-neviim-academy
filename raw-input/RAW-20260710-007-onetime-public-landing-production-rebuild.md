---
raw_id: RAW-20260710-007
source_channel: codex_chat
source_file: C:\Users\User\.codex\attachments\5b679f6a-8af0-4a47-a173-0f3dd8ac4a46\pasted-text.txt
parse_status: registered
workspace_key: rabbi_sheller_provider
project_key: one_time_mishnah_class
requirement_register: tasks-pending/2026-07-10-onetime-public-landing-production-rebuild.md
created_at: 2026-07-10T18:08:00+03:00
privacy_classification: public_product_prompt_with_no_private_contact_export
---

You are implementing a complete production-quality rebuild of the OneTimeOneTime Mishnayos public landing page for Rabbi Eli Scheller.

REPOSITORY
https://github.com/shloimie-beep/bnei-neviim-academy

MISSION
Implement these changes in the actual repository. This is not an audit, design recommendation, or mockup exercise. Inspect the existing application, make the changes, integrate the real assets, verify the signup behavior, test desktop/mobile, and return screenshot evidence.

The finished page should feel like a premium Torah-learning technology product: black, white, luminous yellow, and restrained ice-blue/chrome accents. It should feel elegant, energetic, modern, clear, and expensive—not like the existing page with a few color changes.

Do not stop with a plan. Do not leave visible TODOs, fake buttons, dead links, broken images, fake success states, or unconnected forms.

FIRST: INSPECT THE EXISTING PROJECT
1. Work in the existing checked-out repository.
2. Read every applicable AGENTS.md and repository instruction.
3. Find the current One Time landing route by searching for visible copy such as:
   - “Your Child Can Love Learning Mishnayos”
   - “JOIN THE FREE CLASS”
   - “Start with the free class”
   - “What Students Receive”
4. Inspect:
   - framework and route structure;
   - existing shared components;
   - installed UI, modal, motion, and carousel libraries;
   - brand tokens and fonts;
   - the real lead-capture endpoint;
   - the current signup/onboarding route;
   - Member Login destination;
   - analytics and UTM handling;
   - WhatsApp assistant integration;
   - current public/media asset folders.
5. Reuse the existing application architecture and dependencies.
6. Preserve unrelated user changes.
7. Do not create a separate replacement application.

NON-NEGOTIABLE UX RULES
- The only marketing CTA wording is: “Sign Up Now”.
- Multiple Sign Up Now buttons may appear in the specified locations, but they all open the exact same signup flow.
- Remove alternate CTA wording such as:
  - Join Free
  - Start Free
  - Save My Spot
  - See How It Works
  - Contact Us
  - WhatsApp Robot Scheller
- Member Login appears only in the header and footer, as a quiet text link.
- Remove the FAQ link and entire FAQ section.
- Remove the large flat-yellow inline form.
- Remove the repeated “Start with the free class” closing section.
- Remove the hero feature chips and competing buttons.
- Do not collect the student’s name in the first quick form.
- Phone/WhatsApp must be genuinely optional.
- Do not fabricate features, links, testimonials, statistics, locations, or media appearances.
- Do not use stock classroom photographs.
- Do not use the Windows Explorer screenshot as a website image.
- Do not invent the final hero image. That will be supplied later.

REQUIRED PAGE ORDER
1. Compact sticky header
2. Hero
3. Meet Rabbi Eli Scheller / As Seen Across the Jewish World
4. Teaching Torah Across the World carousel
5. What Your Son Will Gain
6. What You Receive
7. How It Works
8. Who It’s For
9. Clean footer
10. Floating Robot Scheller WhatsApp utility

1. STICKY HEADER
Replace the current oversized two-row toolbar with one compact sticky header.

Desktop:
- White-on-black One Time logo on the left.
- Resolve the official spelling from the approved logo and use it consistently.
- White navigation links:
  - Rabbi Eli
  - What He’ll Gain
  - What You Receive
  - How It Works
  - Who It’s For
- Quiet Member Login text link.
- One luminous Sign Up Now button.
- Remove Watch, Program, FAQ, and the yellow “One Time” selected-navigation pill.
- Approximate desktop height: 72px.

Mobile:
- Logo.
- Compact Sign Up Now button.
- Accessible menu button.
- Section links and Member Login inside the menu.
- Approximate height: 64px.
- Menu must support keyboard navigation, Escape, correct focus management, and focus restoration.

Style:
- Near-black translucent surface.
- Subtle backdrop blur.
- Fine yellow and ice-blue lower edge.
- Anchor links must use scroll-margin so headings are not hidden behind the header.

2. HERO
The hero must lead with the emotional promise—not “free class.”

Use this exact content:

Eyebrow:
“WORLDWIDE MISHNAH LEARNING — LIVE FROM ERETZ YISRAEL”

Headline:
“Give your son a love for Torah you never thought possible.”

Supporting copy:
“A live, daily Mishnayos class with clear teaching, memorable AI-powered visuals, accountability, and a genuine connection to Rabbi Eli Scheller.”

Schedule:
“Live from Israel, every day at 7:00 PM Israel time.”

Promotion:
“Rosh Hashanah Special — Join free until Rosh Hashanah.”

CTA:
“Sign Up Now”

Hero requirements:
- Only one CTA.
- Remove WhatsApp Robot Scheller and See How It Works.
- Remove Live Class, Clear Review, Worksheets, and Free Zoom Follow-up chips.
- Remove the current disclaimer-heavy text.
- Remove the existing Rabbi photograph from the hero.
- Leave the future media area deliberately image-free for now.
- Use restrained black-to-blue lighting, chrome arcs, subtle grid/light effects, or depth so the space looks intentional.
- Do not show “Image Coming Soon,” a gray skeleton, a stock photo, or a broken image.
- Collapse the unused media treatment on mobile so it does not create dead space.
- The headline must remain inside its grid and never overlap another element.
- Use fluid clamp() typography instead of the current clipped oversized heading.

3. SIGNUP FLOW
Every Sign Up Now button opens the same accessible quick-capture modal on desktop and mobile sheet/dialog on small screens.

Quick form:
- Parent / contact name — required
- Email — required
- Phone / WhatsApp — optional

Do not ask for Student name in this first form.

After the real lead submission succeeds, continue to the existing full registration/onboarding page.

The next signup step—not the landing page—must ask:

“I’m signing up for:”
- My family
- A school

Branching:
- Family can collect student details.
- School can collect organization/contact details and route the inquiry for follow-up.
- Do not explain the internal school follow-up process on the landing page.

Engineering requirements:
- Use the existing real lead endpoint and CRM/integration.
- Do not display success while silently discarding data.
- Preserve UTM, referrer, and query attribution if currently supported.
- Preserve the entered values when proceeding.
- Phone must be optional in:
  - UI copy;
  - frontend validation;
  - request schema;
  - backend validation;
  - storage.
- Add real labels and autocomplete attributes.
- Include inline errors, loading state, network-failure state, duplicate-submit protection, and success handling.
- Dialog must have:
  - accessible name;
  - visible close button;
  - focus trap;
  - Escape support;
  - background-scroll lock;
  - focus returned to the original trigger.
- Mobile keyboard must not cover the fields, errors, or submit control.
- Replace technical copy such as “no portal account is opened by this form” with short user-facing privacy language.
- If Family/School is not supported yet, implement the smallest compatible extension within the current architecture.

4. MEET RABBI ELI / AS SEEN ACROSS THE JEWISH WORLD
This is the first section after the hero.

Desktop:
- Two equal visual columns.
- Stack properly on mobile.

Column one:
- Real photograph of Rabbi Eli holding his book.
- Heading: “Meet Rabbi Eli Scheller”
- Copy:

“Rabbi Eli Scheller is a gifted Torah educator and author known for making deep ideas clear, memorable, and exciting. His warmth, concise explanations, and energetic teaching help boys understand what they are learning and want to keep going.”

Do not invent awards, rankings, statistics, or affiliations.

Column two:
- Heading: “As Seen Across the Jewish World”
- Borderless, automatically moving media-logo strip.

ASSET INVENTORY
Search the repository first. Then inspect the user’s folder:

Downloads\OneTimeOneTime - Rabbi Eli Scheller_files

Visible candidate assets include:
- Naki logo
- Mishpacha
- TorahAnytime
- 24Six
- The Loop
- One Time white-on-black logo
- Rabbi Eli holding his book
- teaching/class photographs
- One Time hero files

Requirements:
- Verify every media logo before publishing it.
- Copy selected files into the repository’s proper public/media directory with meaningful filenames.
- Never reference the Windows Downloads location from production code.
- Use transparent/background-free logos where available.
- Do not place each logo inside a large white card.
- Normalize their displayed visual height without distorting them.
- Marquee moves slowly.
- Pause on hover and focus.
- Stop under prefers-reduced-motion.
- Hide cloned marquee duplicates from assistive technology.

If the Downloads folder is inaccessible:
- finish the page structure and code;
- create one centralized asset manifest with clear replacement slots;
- use elegant temporary visual treatments;
- report exactly which assets are missing;
- do not make fake logos.

5. TEACHING TORAH ACROSS THE WORLD
Create a premium large-photo carousel using genuine photographs of Rabbi Eli teaching groups.

Heading:
“Teaching Torah Across the World”

Potential verified location captions:
- Baltimore
- Flatbush / New York
- Hollywood, Florida
- Orlando, Florida only if verified
- other confirmed locations found in the supplied assets

Do not infer a location from an unclear filename. The spoken reference to “Rolando, Florida” may mean Orlando, but verify it before publishing.

Carousel requirements:
- Large editorial photography.
- Do not crop through faces or heads.
- Clean readable location caption.
- Previous/next controls.
- Dots or slide count.
- Touch/swipe support.
- Keyboard support.
- Autoplay approximately every six seconds.
- Visible pause control.
- Pause on hover/focus.
- Stop autoplay when offscreen.
- Disable autoplay for reduced-motion users.
- Do not make screen readers repeatedly announce autoplay changes.
- Only use student photographs approved for public marketing.
- If image-use permission is unclear, report the specific asset.

6. WHAT YOUR SON WILL GAIN
Heading:
“What Your Son Will Gain”

Use exactly three equal premium cards.

Clarity:
“Clear, concise explanations, live Q&A, and guidance from Rabbi Eli help him truly understand what he is learning—not merely keep up.”

Accomplishment:
“A consistent structure, daily accountability, and visible progress help him move steadily toward completing Mishnayos.”

Excitement for Torah:
“Energetic teaching, memorable AI-powered videos, and a real connection to a Rebbe turn daily learning into something he looks forward to.”

Each card should support:
- replaceable image slot;
- icon;
- title;
- concise paragraph.

Work belonging, inspiration, confidence, structure, and connection into these three cards without adding repetitive cards.

Final photographs will be supplied later. Keep image sources inside one centralized configuration object so they are easy to replace. Do not generate fake student photos.

7. WHAT YOU RECEIVE
Replace the current stack of generic bullet bars with a premium responsive icon-card panel.

Heading:
“Everything Your Family Receives”

Cards:

1. Daily Live Class
“Join the live digital Mishnayos class every day at 7:00 PM Israel time.”

2. Complete Class Library
“Rewatch and review recorded classes whenever your son needs them.”

3. Student Portal
“One clear place for class access, recordings, worksheets, and review.”

4. Parent Portal
“See attendance, progress, reminders, and the information needed to support consistency.”

5. Worksheets and Review
“Clear materials that reinforce the daily learning and help ideas stick.”

6. Daily Reminders and Access
“Receive the class reminder and the correct live-class link without hunting for it.”

7. Monitored Online Platform
“A supervised online platform with AI-assisted tools designed to support safe, steady learning.”

8. Connection to Rabbi Scheller
“Use the platform’s monitored communication tools for questions and guidance.”

Rules:
- Say “online platform,” not “online curriculum.”
- Do not claim that AI independently guarantees safety.
- Do not create fake clickable portal/library destinations.
- If a named capability is not operational, report it clearly.

Layout:
- Three or four columns on large desktop.
- Two columns on tablet.
- One column on mobile.
- Equal-height cards.
- Clear icons and concise descriptions.
- No long generic bars or excessive empty space.

8. HOW IT WORKS
Heading:
“How It Works”

Use a concise four-step visual sequence:

1. Sign Up
“Share the basic contact information.”

2. Get Your Daily Reminder
“Receive the class reminder and secure access details.”

3. Join Live at 7:00 PM
“Learn Mishnayos with Rabbi Eli in a clear, energetic live class.”

4. Review and Keep Growing
“Use the library, portals, and worksheets to review and see progress.”

Do not insert a differently worded CTA into these steps.

9. WHO IT’S FOR
Heading:
“Built for Families and Schools”

Audience cards:

English-Speaking Families and Homeschoolers:
“For boys around the world who benefit from a consistent, engaging daily Mishnayos class.”

Schools:
“For schools that want a high-quality daily Mishnayos experience as part of their regular program.”

Ramat Beit Shemesh Alef:
“Join the free live class in person at 8 HaGaon MiVilna, Ramat Beit Shemesh Alef, every night at 7:00 PM.”

Rules:
- Do not use Eastern Hemisphere or Western Hemisphere.
- The worldwide schedule is always written as 7:00 PM Israel time.
- Clearly distinguish worldwide online participation from the local in-person class.
- Verify the final public spelling and publishing approval for the address.
- Store address, schedule, and promotional copy centrally.
- Use one Sign Up Now control for the section.
- Do not add separate Family, School, Contact, or Book a Call CTAs.

OFFER CLARITY
Keep these separate:
- Online promotion:
  “Rosh Hashanah Special — Join free until Rosh Hashanah.”
- Local Ramat Beit Shemesh Alef in-person class:
  described separately as free.

If existing pricing/product data contradicts this, centralize the copy and report the conflict before deployment.

10. FOOTER
Create a clean premium footer containing:
- white-on-black One Time logo;
- short brand line;
- verified social-media icons;
- Privacy;
- Terms;
- Member Login;
- copyright.

Requirements:
- Use only verified real social links.
- Omit platforms without a real URL.
- Do not use # placeholders.
- Give social icons accessible names.
- Member Login appears only here and in the header.
- No giant closing CTA or yellow band.
- Remove the repeated Start with the free class section.

11. ROBOT SCHELLER
Use the generated Robot Scheller image attached with this prompt.

Remove the bot from the hero buttons and use it as a floating bottom-corner utility.

Requirements:
- Approximately 52–56px in the collapsed state.
- Accessible label:
  “Open Rabbi Scheller’s WhatsApp assistant.”
- Tooltip:
  “Chat with Robot Scheller.”
- Expanded UI must clearly disclose that it is an automated assistant.
- Preserve the real existing WhatsApp/chat integration.
- If the integration is not functional, do not create a misleading clickable control.
- Keep it above mobile safe-area insets.
- Never cover signup fields, buttons, carousel controls, navigation, or footer links.

VISUAL SYSTEM
The aesthetic is:

“Torah prestige meets modern learning technology.”

It should not feel like casino chrome, a generic SaaS template, or a childish cartoon site.

Suggested colors:
- Page ink: #05070C
- Dark surface: #0B0F17
- Raised surface: #111827
- Main text: #F7F7F2
- Muted text: #AAB6C5
- Primary yellow: #FFE500
- Deep gold: #C79A00
- Ice blue: #BFEFFF
- Cyan highlight: #53C9FF

Requirements:
- Deep black is the foundation.
- White text.
- Yellow is an accent, glow, edge, and focal point—not a giant flat block.
- Use the current light blue as reflected light, borders, card depth, focus rings, and chrome shading.
- Use a display serif only for major headings.
- Use a readable modern sans-serif for body copy, navigation, forms, cards, and buttons.
- Body copy at least 16px.
- Consistent spacing system.
- Approximately 1200–1280px content width.
- Premium dark cards with fine ice-blue edges and restrained yellow details.
- Avoid abrupt cream sections, heavy gray borders, and repeated identical rows.
- Place images strategically and elegantly.

SIGN UP NOW BUTTON
Create a premium chrome/holographic yellow treatment:
- layered yellow/gold gradient;
- pale-yellow and white specular highlight;
- slight ice-blue reflection;
- crisp black text;
- subtle yellow/blue glow;
- clear hover, focus, pressed, loading, and disabled states;
- slow light sweep or hover-initiated shimmer;
- minimum approximately 48px height.

Do not use rapid flashing, blinking, or strobing. Disable shimmer under prefers-reduced-motion.

MOTION
Use restrained motion:
- subtle section reveals;
- slow logo marquee;
- relaxed carousel;
- small card edge-light/lift;
- premium button sheen.

Use transforms and opacity where possible. Respect prefers-reduced-motion throughout.

RESPONSIVE TESTING
Test:
- 1440px
- 1280px
- 1024px
- 768px
- 430px
- 390px
- 375px
- 360px
- 320px

Acceptance:
- no horizontal scrolling;
- no clipped logo, text, form, menu, or carousel;
- no headline/image collision;
- compact sticky header;
- no empty oversized hero region on mobile;
- correct stacking order;
- equal, orderly cards;
- readable captions;
- bot does not obscure content;
- mobile keyboard leaves forms usable;
- clean footer;
- page works at 200% zoom.

ACCESSIBILITY
Meet WCAG 2.2 AA:
- semantic landmarks;
- skip-to-content link;
- exactly one h1;
- logical heading order;
- visible high-contrast focus states;
- full keyboard support;
- minimum 44×44 touch targets;
- adequate text and component contrast;
- real form labels;
- useful alt text;
- decorative images use empty alt text;
- accessible carousel controls;
- no color-only states;
- no forced motion;
- no rapid flashing.

PERFORMANCE
- Use the project’s existing optimized image component.
- Provide responsive image sizes and explicit dimensions.
- Lazy-load below-the-fold images.
- Do not preload the currently nonexistent hero image.
- Stop carousel activity when offscreen.
- Avoid adding a heavy visual dependency unnecessarily.
- Target CLS below 0.1 and representative mobile LCP below 2.5 seconds where practical.

EXPLICIT REMOVALS
Confirm every item is gone:
- full-width yellow JOIN THE FREE CLASS form;
- Student name in quick capture;
- required phone validation;
- Save My Spot wording;
- WhatsApp Robot Scheller hero button;
- See How It Works hero button;
- hero feature chips;
- FAQ navigation and section;
- Start with the free class bottom section;
- No charge today bullet panel;
- generic stacked feature bars;
- duplicate Member Login placements;
- alternate CTA labels;
- bulky white media-logo cards;
- current hero portrait;
- stock/improvised hero imagery;
- inconsistent brand names.

IMPLEMENTATION RULES
- Keep page copy, schedules, offers, address, logos, slides, feature cards, audience cards, and social links in one clear content/config structure.
- Preserve real backend contracts and integrations.
- Do not rewrite unrelated application areas.
- Do not reference local Downloads paths from production code.
- If final images are missing, implement replacement-ready slots and report exactly what is missing.
- Do not block the rest of the rebuild because some images are unavailable.
- Do not deploy unless deployment is explicitly authorized by the enclosing task.

VERIFICATION
Before completing:
1. Run formatting/lint.
2. Run typecheck.
3. Run relevant tests.
4. Run the production build.
5. Test every Sign Up Now trigger.
6. Confirm name/email required.
7. Confirm phone optional.
8. Confirm Student name absent from quick capture.
9. Confirm Family/School next step.
10. Confirm the real lead pipeline receives the submission.
11. Confirm Member Login destinations.
12. Test menu and carousels by mouse, keyboard, and touch.
13. Test reduced-motion behavior.
14. Perform a keyboard-only walkthrough.
15. Check all listed responsive sizes.
16. Check console and network errors.
17. Capture before-and-after desktop and mobile screenshots.
18. Review the final diff for unrelated changes.

DEFINITION OF DONE
The task is not done until:
- code has actually been changed;
- the old yellow form, FAQ, duplicate CTA section, extra hero buttons, and generic feature bars are gone;
- the new section order exists;
- signup connects to real behavior;
- Family/School follow-up exists;
- desktop and mobile layouts are verified;
- real available assets are mapped;
- Robot Scheller is integrated appropriately;
- checks/build pass, or pre-existing failures are isolated with exact evidence;
- screenshot evidence is included.

FINAL HANDOFF
Return:
- summary of implemented changes;
- files changed;
- section/component mapping;
- asset-to-section mapping;
- lint/typecheck/test/build results;
- desktop and mobile screenshot evidence;
- signup-flow results;
- missing images;
- unverified captions or social links;
- unclear public-photo permissions;
- promised product features that are not yet live;
- any offer/pricing conflict.

Do not return only a plan. Implement, verify, and report the finished result.
